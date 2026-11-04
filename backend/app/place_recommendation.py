from schemas import Place, TripPreferencesCreate, PlaceCreate
from place_discovery import discover_places, _normalise
from datetime import date, time #only neccessary for testing, can remove after

def recommend_places(places: list[Place], preferences: TripPreferencesCreate) -> list[Place]:
    # Have way to receive weights for preferences?
    preferred_rating = 4.4 # temporary for testing
    budget_weight = 0.3
    interest_weight = 0.5
    rating_weight = 0.2
    interests = [_normalise(interest) for interest in preferences.interests]
    final_list = []
    
    for place in places:
        score = 0.0

        # Could change so that instead of basing on a set min/max, could be like within variation
        if place.estimated_cost <= preferences.budget:
            if place.estimated_cost <= (0.25 * preferences.budget):
                score += (1 * budget_weight)
            elif place.estimated_cost <= (0.50 * preferences.budget):
                score += (0.75 * budget_weight)
            elif place.estimated_cost <= (0.75 * preferences.budget):
                score += (0.5 * budget_weight)
        if _normalise(place.category) in interests:
            score += (1 * interest_weight)
        if place.rating >= preferred_rating and place.rating != None:
            score += (1 * rating_weight)
        # pacing
        final_list.append((score, place))

    final_list.sort(key=lambda item: item[0], reverse=True)
    return [place for score, place in final_list]
       
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
    result = recommend_places(places, preferences)

    for place in result:
        print(f"- {place.name}")

if __name__ == "__main__":
    test()