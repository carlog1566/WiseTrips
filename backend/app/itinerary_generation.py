from schemas import Place, TripPreferencesCreate, PlaceCreate, ItineraryResponse, ItineraryStop, ItineraryStopCreate
from place_discovery import discover_places, _normalise
from place_recommendation import recommend_places
from datetime import date, time

def generate_itinerary(places: list[Place], preferences: TripPreferencesCreate) -> ItineraryResponse:
    starting_time = preferences.start_time.hour * 60 + preferences.start_time.minute
    ending_time = preferences.end_time.hour * 60 + preferences.end_time.minute
    time_available = (ending_time - starting_time)
    estimated_travel_time = 0
    itinerary_stops = []


    results = ItineraryResponse(stops=itinerary_stops, estimated_travel_time=estimated_travel_time)
    return results

def test():
    preferences = TripPreferencesCreate(
            destination = "Los Angeles",
            trip_date = date(2026, 11, 1),
            starting_location = "Downtown Los Angeles",
            start_time = time(9, 0),
            end_time = time(17,0),
            budget = 75.00,
            transportation_mode = "driving",
            interests = ["Attraction", "Food"], # can change interests, which should change printed results
            pace = "slow",
        )
    places = discover_places(preferences)
    recommended = recommend_places(places, preferences)
    results = generate_itinerary(recommend_places, preferences)
    print("")
    print("")

if __name__ == "__main__":
    test()