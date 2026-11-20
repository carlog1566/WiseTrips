import os
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    ItineraryStop as ItineraryStopModel,
    Place as PlaceModel,
    Trip,
)
from app.itinerary_generation import generate_itinerary as generate_plan
from app.place_discovery import discover_places, geocode_location
from app.place_recommendation import recommend_places
from app.schemas import (
    ItineraryResponse,
    ItineraryStopCreate,
    TripPreferencesCreate,
)


router = APIRouter(
    prefix="/api/trips",
    tags=["trips"],
)


@router.post(
    "/generate",
    response_model=ItineraryResponse,
)
def generate_itinerary(
    trip_preferences: TripPreferencesCreate,
    db: Session = Depends(get_db),
):
    api_key = os.getenv("GOOGLE_MAPS_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="Google Maps API key is not configured",
        )

    destination = geocode_location(
        trip_preferences.destination,
        api_key,
    )

    origin = geocode_location(
        trip_preferences.starting_location,
        api_key,
    )

    places = discover_places(
        trip_preferences,
        destination,
        api_key,
    )

    ranked_places = recommend_places(
        places,
        trip_preferences,
    )

    planned_stops, total_travel_minutes = generate_plan(
        ranked_places,
        trip_preferences,
        origin,
        api_key,
    )

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

        for item in planned_stops:
            place = item["place"]
            arrival_time = item["arrival_time"]
            departure_time = item["departure_time"]

            if departure_time > end_time.time():
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
                arrival_time=arrival_time,
                departure_time=departure_time,
            )

            db.add(stop)

            response_stops.append(
                ItineraryStopCreate(
                    trip_id=trip.id,
                    place_id=saved_place.id,
                    stop_order=stop.stop_order,
                    arrival_time=stop.arrival_time,
                    departure_time=stop.departure_time,
                )
            )

        if not response_stops:
            db.rollback()
            raise HTTPException(
                status_code=404,
                detail="No destinations fit within the trip time",
            )

        db.commit()

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail="Unable to save itinerary"
        ) from e

    total_travel_minutes = (
        (len(response_stops) - 1) * 15
    )

    return ItineraryResponse(
        trip_id=trip.id,
        stops=response_stops,
        total_travel_minutes=total_travel_minutes,
    )


@router.get(
    "/{trip_id}",
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

    stops = [
        ItineraryStopCreate(
            trip_id=stop.trip_id,
            place_id=stop.place_id,
            stop_order=stop.stop_order,
            arrival_time=stop.arrival_time,
            departure_time=stop.departure_time,
        )
        for stop in saved_stops
    ]

    total_travel_minutes = (
        max(len(stops) - 1, 0) * 15
    )

    return ItineraryResponse(
        trip_id=trip.id,
        stops=stops,
        total_travel_minutes=total_travel_minutes,
    )