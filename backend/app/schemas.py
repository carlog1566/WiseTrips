
from datetime import date, time
from pydantic import BaseModel, Field

class TripPreferences(BaseModel):
    id: int
    destination: str = Field(min_length=1)
    trip_date: date
    starting_location: str = Field(min_length=1)
    start_time: time
    end_time: time
    budget: float = Field(ge=0)
    transportation_mode: str = Field(min_length=1)
    interests: list[str] = Field(min_length=1)
    pace: str = Field(min_length=1)

class Place(BaseModel):
    id: int
    name: str = Field(min_length=1)
    address: str = Field(min_length=1)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    category: str = Field(min_length=1)
    rating: float = Field(ge=0, le=5)
    estimated_cost: float = Field(ge=0)

class ItineraryStop(BaseModel):
    id: int
    trip_id: int
    place_id: int
    stop_order: int = Field(ge=1)
    arrival_time: time
    departure_time: time

class ItineraryResponse(BaseModel):
    stops : list[ItineraryStop]
    total_travel_minutes: int = Field(ge=0)
