from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    ItineraryStop as ItineraryStopModel,
    Place as PlaceModel,
    Trip,
)
from app.place_discovery import discover_places
from app.place_recommendation import recommend_places
from app.schemas import (
    ItineraryResponse,
    ItineraryStopResponse,
    ItineraryStopCreate,
    Place,
    TripPreferences,
    TripPreferencesCreate,
)


router = APIRouter(
    prefix="/api/trips",
    tags=["trips"],
)


def convert_place(place: PlaceModel) -> Place:
    return Place(
        id=place.id,
        name=place.name,
        address=place.address,
        latitude=place.latitude,
        longitude=place.longitude,
        category=place.category,
        rating=place.rating,
        estimated_cost=place.estimated_cost,
    )


@router.post(
    "/generate",
    response_model=ItineraryResponse,
)
def generate_itinerary(
    trip_preferences: TripPreferencesCreate,
    db: Session = Depends(get_db),
):
    places = discover_places(trip_preferences)

    if not places:
        raise HTTPException(
            status_code=404,
            detail="No suitable destinations found",
        )

    ranked_places = recommend_places(
        places,
        trip_preferences,
    )

    if not ranked_places:
        raise HTTPException(
            status_code=404,
            detail="No suitable destinations found",
        )

    trip = Trip(
        destination=trip_preferences.destination,
        trip_date=trip_preferences.trip_date,
        starting_location=trip_preferences.starting_location,
        start_time=trip_preferences.start_time,
        end_time=trip_preferences.end_time,
        budget=trip_preferences.budget,
        transportation_mode=trip_preferences.transportation_mode,
        interests=trip_preferences.interests,
        pace=trip_preferences.pace,
    )

    try:
        db.add(trip)
        db.flush()

        current_time = datetime.combine(
            trip_preferences.trip_date,
            trip_preferences.start_time,
        )

        end_time = datetime.combine(
            trip_preferences.trip_date,
            trip_preferences.end_time,
        )

        visit_duration = timedelta(minutes=60)
        travel_time = timedelta(minutes=15)

        response_stops = []

        for place in ranked_places:
            arrival_time = current_time
            departure_time = arrival_time + visit_duration

            if departure_time > end_time:
                break

            saved_place = (
                db.query(PlaceModel)
                .filter(
                    PlaceModel.name == place.name,
                    PlaceModel.address == place.address,
                )
                .first()
            )

            if saved_place is None:
                saved_place = PlaceModel(
                    name=place.name,
                    address=place.address,
                    latitude=place.latitude,
                    longitude=place.longitude,
                    category=place.category,
                    rating=place.rating,
                    estimated_cost=place.estimated_cost,
                )

                db.add(saved_place)
                db.flush()

            stop = ItineraryStopModel(
                trip_id=trip.id,
                place_id=saved_place.id,
                stop_order=len(response_stops) + 1,
                arrival_time=arrival_time.time(),
                departure_time=departure_time.time(),
            )

            db.add(stop)
            db.flush()

            response_stops.append(
                ItineraryStopResponse(
                    id=stop.id,
                    trip_id=trip.id,
                    place_id=saved_place.id,
                    stop_order=stop.stop_order,
                    arrival_time=stop.arrival_time,
                    departure_time=stop.departure_time,
                    place=convert_place(saved_place),
                )
            )

            current_time = departure_time + travel_time

        if not response_stops:
            db.rollback()
            raise HTTPException(
                status_code=404,
                detail="No destinations fit within the trip time",
            )

        db.commit()
        db.refresh(trip)

    except HTTPException:
        raise

    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to save itinerary",
        ) from error

    total_travel_minutes = (
        (len(response_stops) - 1) * 15
    )

    return ItineraryResponse(
        trip_id=trip.id,
        stops=response_stops,
        total_travel_minutes=total_travel_minutes,
    )


@router.get(
    "",
    response_model=list[TripPreferences],
)
def get_all_trips(
    db: Session = Depends(get_db),
):
    trips = (
        db.query(Trip)
        .order_by(Trip.id)
        .all()
    )

    return [
        TripPreferences(
            id=trip.id,
            destination=trip.destination,
            trip_date=trip.trip_date,
            starting_location=trip.starting_location,
            start_time=trip.start_time,
            end_time=trip.end_time,
            budget=trip.budget,
            transportation_mode=trip.transportation_mode,
            interests=trip.interests,
            pace=trip.pace,
        )
        for trip in trips
    ]


@router.get(
    "/{trip_id}/itinerary",
    response_model=ItineraryResponse,
)
def get_itinerary(
    trip_id: int,
    db: Session = Depends(get_db),
):
    trip = db.get(Trip, trip_id)

    if trip is None:
        raise HTTPException(
            status_code=404,
            detail="Trip not found",
        )

    saved_stops = (
        db.query(ItineraryStopModel)
        .filter(
            ItineraryStopModel.trip_id == trip_id
        )
        .order_by(
            ItineraryStopModel.stop_order
        )
        .all()
    )

    if not saved_stops:
        raise HTTPException(
            status_code=404,
            detail="Itinerary not found",
        )

    stops = []

    for stop in saved_stops:
        place = db.get(
            PlaceModel,
            stop.place_id,
        )

        if place is None:
            raise HTTPException(
                status_code=500,
                detail="Saved itinerary contains a missing place",
            )

        stops.append(
            ItineraryStopResponse(
                id=stop.id,
                trip_id=stop.trip_id,
                place_id=stop.place_id,
                stop_order=stop.stop_order,
                arrival_time=stop.arrival_time,
                departure_time=stop.departure_time,
                place=convert_place(place),
            )
        )

    total_travel_minutes = (
        max(len(stops) - 1, 0) * 15
    )

    return ItineraryResponse(
        trip_id=trip.id,
        stops=stops,
        total_travel_minutes=total_travel_minutes,
    )


@router.get(
    "/{trip_id}",
    response_model=TripPreferences,
)
def get_trip(
    trip_id: int,
    db: Session = Depends(get_db),
):
    trip = db.get(Trip, trip_id)

    if trip is None:
        raise HTTPException(
            status_code=404,
            detail="Trip not found",
        )

    return TripPreferences(
        id=trip.id,
        destination=trip.destination,
        trip_date=trip.trip_date,
        starting_location=trip.starting_location,
        start_time=trip.start_time,
        end_time=trip.end_time,
        budget=trip.budget,
        transportation_mode=trip.transportation_mode,
        interests=trip.interests,
        pace=trip.pace,
    )