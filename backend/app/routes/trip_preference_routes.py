from datetime import time

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Trip
from app.schemas import (
    ItineraryResponse,
    TripPreferencesCreate,
    ItineraryStopCreate
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

    sample_stop = ItineraryStopCreate(
        trip_id=trip.id,
        place_id=1,
        stop_order=1,
        arrival_time=time(10, 0),
        departure_time=time(11, 30),
    )

    return ItineraryResponse(
        stops=[sample_stop],
        total_travel_minutes=30,
    )