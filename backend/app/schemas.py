
from datetime import date, time
from pydantic import BaseModel, Field, model_validator

class TripPreferencesCreate(BaseModel):
    destination: str = Field(min_length=1)
    trip_date: date
    starting_location: str = Field(min_length=1)
    start_time: time
    end_time: time
    budget: float = Field(ge=0)
    transportation_mode: str = Field(min_length=1)
    interests: list[str] = Field(min_length=1)
    pace: str = Field(min_length=1)

    @model_validator(mode="after")
    def check_times(self):
        if self.end_time <= self.start_time:
            raise ValueError("End time must be after start time")
        return self

class PlaceCreate(BaseModel):
    name: str = Field(min_length=1)
    address: str = Field(min_length=1)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    category: str = Field(min_length=1)
    rating: float = Field(ge=0, le=5)
    estimated_cost: float = Field(ge=0)

class ItineraryStopCreate(BaseModel):
    trip_id: int
    place_id: int
    stop_order: int = Field(ge=1)
    arrival_time: time
    departure_time: time

    @model_validator(mode="after")
    def check_stop_times(self):
        if self.departure_time <= self.arrival_time:
            raise ValueError("Departure time must be after arrival time")
        return self

class TripPreferences(TripPreferencesCreate):
    id: int
    
class Place(PlaceCreate):
    id: int

class ItineraryStop(ItineraryStopCreate):
    id: int

class ItineraryResponse(BaseModel):
    stops : list[ItineraryStopCreate]
    total_travel_minutes: int = Field(ge=0)
