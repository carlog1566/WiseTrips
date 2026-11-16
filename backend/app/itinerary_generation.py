from .schemas import Place, TripPreferencesCreate, ItineraryResponse, ItineraryStopCreate, PlaceCreate
from .place_discovery import discover_places
from .place_recommendation import recommend_places
from datetime import date, time
from .travel_time_estimation import travel_time_estimation
from dotenv import load_dotenv # For testing
import os # For testing

# Hardcoded time estimate for place
def estimate_place_time(place: Place) -> int:
    if place.category == "Attraction":
        return 120
    elif place.category == "Food":
        return 60
    elif place.category == "Shopping":
        return 90
    else:
        return 60

def generate_itinerary(trip_id: int, places: list[Place], preferences: TripPreferencesCreate, origin: PlaceCreate, api_key: str) -> ItineraryResponse:
    starting_time = preferences.start_time.hour * 60 + preferences.start_time.minute
    ending_time = preferences.end_time.hour * 60 + preferences.end_time.minute
    time_available = (ending_time - starting_time)
    estimated_total_time = 0
    current_budget = 0
    itinerary_stops = []
    category_count_map = {} # Track place type count
    previous_place = origin # Estimate travel time between place in current iteration and last tracked location

    # Select up to 3 stops when there are at most 5 candidates, otherwise up to 5.
    list_length = len(places)
    if list_length <= 0:
        raise ValueError("Invalid or no place count")
    elif list_length <= 5:
        max_stops = 3
    else:
        max_stops = 5

    for i, place in enumerate(places):
        if len(itinerary_stops) >= max_stops:
            break
        
        # If there are more than 2 places of the same category, skip the remaining places of same category
        category = place.category
        if category_count_map.get(category, 0) >= 2:
            continue
        
        # Check next place budget constraints
        if place.estimated_cost + current_budget > preferences.budget:
            continue

        time_at_place = estimate_place_time(place)

        # Calculate potential time variance due to pacing
        if preferences.pace == "slow":
            time_at_place = int(time_at_place * 1.25)
        elif preferences.pace == "fast":
            time_at_place = int(time_at_place * 0.75)

        # Calculate estimated time to travel to location
        travel_time_details = travel_time_estimation(
            previous_place, place, preferences.transportation_mode, api_key
        )
        print(travel_time_details)
        time_travelling = travel_time_details["duration"]

        # Check time availability with time travelled, spent at location, and already spent in trip
        if time_travelling + time_at_place + estimated_total_time > time_available:
            continue
        
        # Add place to map of current place types and add budget to total budget after all checks
        category_count_map[category] = category_count_map.get(category, 0) + 1
        # Implement as plus feature?: check each type, like for food, check if restaurants and pick 1 or save type or for later
        current_budget += place.estimated_cost

        # Convert time in minutes for arrival and departure into datetime time format
        estimated_total_time += time_travelling
        arrival_hours, arrival_minutes = divmod(starting_time + estimated_total_time, 60)
        arrival_hours %= 24
        estimated_total_time += time_at_place
        departure_hours, departure_minutes = divmod(starting_time + estimated_total_time, 60)
        departure_hours %= 24
        estimated_arrival = time(hour=arrival_hours, minute=arrival_minutes)
        estimated_departure = time(hour=departure_hours, minute=departure_minutes)

        itinerary_stops.append(ItineraryStopCreate(
            trip_id=trip_id, 
            place_id=place.id,
            stop_order=len(itinerary_stops) + 1, 
            arrival_time=estimated_arrival, 
            departure_time=estimated_departure))
        previous_place = place
        

    return ItineraryResponse(trip_id=trip_id, stops=itinerary_stops, total_travel_minutes=estimated_total_time)

def test():
    load_dotenv()
    api_key = os.getenv("GOOGLE_MAPS_API_KEY")
    if not api_key:
        raise ValueError("No API Key Found.")

    preferences = TripPreferencesCreate(
            destination = "Los Angeles",
            trip_date = date(2026, 11, 1),
            starting_location = "Downtown Los Angeles",
            start_time = time(9, 0),
            end_time = time(17,0),
            budget = 70.00,
            transportation_mode = "DRIVE ",
            interests = ["Attraction", "Food"], # can change interests, which should change printed results
            pace = "slow",
        )
    # Hardcoded user origin example
    user_origin = PlaceCreate(
        name = "Cal Poly Pomona",
        address ="3801 W Temple Ave, Pomona, CA 91768",
        latitude = 34.058369,
        longitude = -117.820009,
        category = "Education",
        rating = 4.6,
        estimated_cost = 20000)

    try:
        discovered_places = discover_places(preferences)
        recommended_places = recommend_places(discovered_places, preferences)
        results = generate_itinerary(1, recommended_places, preferences, user_origin, api_key)
        print("Itinerary Generation:")
        for place in results.stops:
            print(f"ID: {place.place_id}, {place.arrival_time} - {place.departure_time}")
        print(f"Estimated Travel Time (Minutes): {results.total_travel_minutes}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test()