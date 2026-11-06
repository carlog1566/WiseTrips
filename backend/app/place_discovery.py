import json
from datetime import date, time #only neccessary for testing, can remove after 
from schemas import Place, TripPreferencesCreate

def load_sample_places() -> list[Place]:
    with open("sample_places.json", "r") as file:
        data = json.load(file)

    raw_places = data["places"]
    return [Place.model_validate(place) for place in raw_places]

def _normalise(string) -> str:
    return string.strip().lower()

def discover_places(preferences: TripPreferencesCreate) -> list[Place]:
    places = load_sample_places()
    destination = preferences.destination.strip().lower()
    interests = [_normalise(interest) for interest in preferences.interests]

    destination_matches = []
    for place in places:
        if destination in f"{place.name} {place.address}".lower():
            destination_matches.append(place)

    if not interests:
        return destination_matches

    interest_matches = []
    for place in destination_matches:
        if _normalise(place.category) in interests:
            interest_matches.append(place)
    return interest_matches

# testing with predefined trip preferences, can remove after
def test():
    preferences = TripPreferencesCreate(
        destination = "Los Angeles",
        trip_date = date(2026, 11, 1),
        starting_location = "Downtown Los Angeles",
        start_time = time(9, 0),
        end_time = time(17,0),
        budget = 45.00,
        transportation_mode = "driving",
        interests = ["Attraction", "Food"], # can change interests, which should change printed results
        pace = "slow",
    )

    results = discover_places(preferences)
    for place in results:
        print(f"- {place.name}")

if __name__ == "__main__":
    test()