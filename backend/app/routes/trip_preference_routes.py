from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Trip
from app.place_discovery import discover_places
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
        db.commit()
        db.refresh(trip)

    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to save trip",
        ) from error

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
    stops = []

    for place in ranked_places:
        arrival_time = current_time
        departure_time = arrival_time + visit_duration

        if departure_time > end_time:
            break

        stops.append(
            ItineraryStopCreate(
                trip_id=trip.id,
                place_id=place.id,
                stop_order=len(stops) + 1,
                arrival_time=arrival_time.time(),
                departure_time=departure_time.time(),
            )
        )

        current_time = departure_time + travel_time

    if not stops:
        raise HTTPException(
            status_code=404,
            detail="No destinations fit within the trip time",
        )

    total_travel_minutes = (
        (len(stops) - 1) * 15
    )

    return ItineraryResponse(
        trip_id = trip.id,
        stops=stops,
        total_travel_minutes=total_travel_minutes,
    )