from schemas import Place, TripPreferencesCreate, PlaceCreate, ItineraryResponse, ItineraryStop, ItineraryStopCreate
from place_discovery import discover_places, _normalise
from place_recommendation import recommend_places
from datetime import date, time

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


def generate_itinerary(places: list[Place], preferences: TripPreferencesCreate) -> ItineraryResponse:
    starting_time = preferences.start_time.hour * 60 + preferences.start_time.minute
    ending_time = preferences.end_time.hour * 60 + preferences.end_time.minute
    time_available = (ending_time - starting_time)
    estimated_travel_time = 0
    current_budget = 0
    itinerary_stops = []
    category_count_map = {}

    # Select up to 3 stops when there are at most 5 candidates, otherwise up to 5.
    list_length = len(places)
    if list_length <= 0:
        raise ValueError("Invalid or no place count")
    elif list_length <= 5:
        max_stops = 3
    else:
        max_stops = 5

    for i, place in enumerate(places):
        category = place.category

        if len(itinerary_stops) >= max_stops:
            break

        time_at_place = estimate_place_time(place)

        # Calculate potential time variance due to pacing
        if preferences.pace == "slow":
            time_at_place = int(time_at_place * 1.25)
        elif preferences.pace == "fast":
            time_at_place = int(time_at_place * 0.75)

        # Check next place can fit within time and budget constraints
        if (estimated_travel_time + time_at_place > time_available) or (place.estimated_cost + current_budget > preferences.budget):
            continue

        # If there are more than 2 places of the same category, skip the remaining places of same category
        if category_count_map.get(category, 0) >= 2:
            continue

        category_count_map[category] = category_count_map.get(category, 0) + 1

        current_budget += place.estimated_cost

        # Convert time in minutes for arrival and departure into datetime time format
        arrival_hours, arrival_minutes = divmod(starting_time + estimated_travel_time, 60)
        arrival_hours %= 24
        estimated_travel_time += time_at_place
        departure_hours, departure_minutes = divmod(starting_time + estimated_travel_time, 60)
        departure_hours %= 24
        estimated_arrival = time(hour=arrival_hours, minute=arrival_minutes)
        estimated_departure = time(hour=departure_hours, minute=departure_minutes)

        itinerary_stops.append(ItineraryStopCreate(
            trip_id=1, 
            place_id=place.id,
            stop_order=len(itinerary_stops) + 1, 
            arrival_time=estimated_arrival, 
            departure_time=estimated_departure))
        

    return ItineraryResponse(stops=itinerary_stops, total_travel_minutes=estimated_travel_time)

def test():
    preferences = TripPreferencesCreate(
            destination = "Los Angeles",
            trip_date = date(2026, 11, 1),
            starting_location = "Downtown Los Angeles",
            start_time = time(9, 0),
            end_time = time(17,0),
            budget = 70.00,
            transportation_mode = "driving",
            interests = ["Attraction", "Food"], # can change interests, which should change printed results
            pace = "slow",
        )
    print("Discovered Places:")
    places = discover_places(preferences)
    for place in places:
         print(f"- {place.name}, ID: {place.id}")
    print("")

    print("Recommended Places:")
    recommended_places = recommend_places(places, preferences)
    for place in recommended_places:
        print(f"{place.name} , ID: {place.id}, Category: {place.category}")
    print("")

    results = generate_itinerary(recommended_places, preferences)
    print("Itinerary Generation:")
    for place in results.stops:
        print(f"ID: {place.place_id}, {place.arrival_time} - {place.departure_time}")
    print(f"Estimated Travel Time (Minutes): {results.total_travel_minutes}")

if __name__ == "__main__":
    test()