from schemas import Place, TripPreferencesCreate, PlaceCreate
from place_discovery import discover_places, _normalise
from place_recommendation import recommend_places
from datetime import date, time #only neccessary for testing, can remove after

def generate_itinerary(places: list[Place], preferences: TripPreferencesCreate) -> list:
    estimated_travel_time = 0.0
    itinerary_stops = []


    return [itinerary_stops, estimated_travel_time]

def test():
    preferences = TripPreferencesCreate(
            destination = "Los Angeles",
            trip_date = date(2026, 11, 1),
            starting_location = "Downtown Los Angeles",
            start_time = time(9, 0),
            end_time = time(17,0),
            budget = 10.00,
            transportation_mode = "driving",
            interests = ["Attraction"], # can change interests, which should change printed results
            pace = "slow",
        )
    places = discover_places(preferences)
    recommended = recommend_places(places, preferences)


if __name__ == "__main__":
    test()