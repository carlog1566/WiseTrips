from schemas import Place, TripPreferencesCreate, PlaceCreate
from place_discovery import discover_places
from datetime import date, time #only neccessary for testing, can remove after

def recommend_places(places: Place, preferences: TripPreferencesCreate) -> list[Place]:
    # Assign weights to factors (Ex: interest: 0.5, budget: 0.3, Rating: 0.2) to
    # then multiply on points?
    # Everytime a place matches a preference, tally 1 point * factor weight to total points
    final_list = []
    for place in places:
        total_points = 0.0
        # Check through interest, budget, rating, pace, transportation mode?
        if (place.estimated <= preferences.budget):
            total_points += 0.3
        #if (place.rating >= preferences.?)
        #if place type can be found in preferences list, add points
        final_list.append(place)

    final_list.sort()

    # Tally points for whether place fits in preference budget, interests, rating
    # Add to list
    # Sort list of places off of points and return
       
def test():
    preferences = TripPreferencesCreate(
            destination = "Los Angeles",
            trip_date = date(2026, 11, 1),
            starting_location = "Downtown Los Angeles",
            start_time = time(9, 0),
            end_time = time(17,0),
            budget = 100.00,
            transportation_mode = "driving",
            interests = ["Attraction"], # can change interests, which should change printed results
            pace = "slow",
        )
    places = discover_places(preferences)
    result = recommend_places(places, preferences)

    for place in results:
        print(f"- {place.name}")

if __name__ == "__main__":
    test()