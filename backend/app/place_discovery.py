import json
from datetime import date, time #only neccessary for testing, can remove after 
from .schemas import Place, PlaceCreate, TripPreferencesCreate
import requests
import os # only necessary for testing
from dotenv import load_dotenv

"""Not Functional Yet"""

class PlacesAPIError(Exception):
    """Raised when Places API cannot return search results"""

PLACES_FIELD_MASK = (
    "places.displayName,"
    "places.formattedAddress,"
    "places.primaryTypeDisplayName,"
    "places.location,"
    "places.rating," # Triggers Nearby Search Enterprise SKU
    "places.priceLevel," # (Or priceLevel) Also triggers Nearby Search Enterprise SKU
    "places.regularOpeningHours" # Also triggers ^
)

places_url = "https://places.googleapis.com/v1/places:searchNearby"

def _normalise(string) -> str:
    return string.strip().lower()

# convert google price levels to exact prices
def _estimated_cost(price_level: str | None) -> float:
    price_levels = {
        # can change prices
        "PRICE_LEVEL_FREE": 0.0,
        "PRICE_LEVEL_INEXPENSIVE": 15.0,
        "PRICE_LEVEL_MODERATE": 35.0,
        "PRICE_LEVEL_EXPENSIVE": 75.0,
        "PRICE_LEVEL_VERY_EXPENSIVE": 150.0,
    }

    return price_levels.get(price_level or "", 0.0)

def discover_places(preferences: TripPreferencesCreate, origin: Place, api_key: str) -> list[Place]:
    if not api_key:
        raise PlacesAPIError("API key not configured.")
    
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": PLACES_FIELD_MASK
    }

    place_types = {
        # Change depending on support from frontend
        #"food" : if needed
        "food and drink" : [
            "restaurant", "fast_food_restaurant", "cafe", "bar", "bakery", "ice_cream_shop", "juice_shop"
        ],
        #"Museum" : if needed
        "culture" : [
            "art_gallery", "museum", "auditorium", "historical_place", "cultural_landmark", "monument", "sculpture"
        ],
        #"Nature" :  if needed
        "natural_features" : [
            "beach", "lake", "scenic_spot", "woods", "nature_preserve", "mountain_peak", "hiking_area", "off_roading_area",
            "national_park"
        ],
        "shopping" : [
            "shopping_mall", "convenience_store", "store", "gift_shop", "supermarket", "book_store", "market"
        ],
        "entertainment" : [
            "amusement_park", "aquarium", "bowling_alley", "concert_hall", "convention_center", "go_karting_venue",
            "internet_cafe", "karaoke", "miniature_golf_course", "movie_theater", "opera_house", "tourist_attraction", "zoo"
        ],
    }

    # Search preferences.interests for types of places, then pick from place_types to insert into includedTypes
    place_types_payload = []
    for interest in preferences.interests:
        interest_key = _normalise(interest)

        if interest_key not in place_types:
            raise PlacesAPIError(f"Unsupported Interest: {interest}")

        for place_type in place_types[interest_key]:
            if place_type not in place_types_payload:
                place_types_payload.append(place_type)
        

    payload = {
        "includedTypes" : place_types_payload,
        "maxResultCount" : 20, #increase/decrease?
        "locationRestriction" : {
            "circle" :{
                "center" : {
                    "latitude" : origin.latitude,
                    "longitude" : origin.longitude
                },
                "radius" : 1000.0
            }
        }
    }

    try:
        response = requests.post(places_url, json=payload, headers=headers, timeout=20)
        response.raise_for_status()
        data = response.json()

    except requests.exceptions.Timeout as e:
        raise PlacesAPIError("Places request timed out") from e

    except requests.exceptions.HTTPError as e:
        status_code = e.response.status_code
        error_message = e.response.text
        raise PlacesAPIError(f"PLaces request failed with status {status_code}: {error_message}") from e
    
    except requests.exceptions.JSONDecodeError as e:
        raise PlacesAPIError("Invalid places response") from e

    except requests.exceptions.RequestException as e:
        raise PlacesAPIError("Places request failed") from e

    
    places = []
    if "places" in data and len(data["places"]) > 0:
        for i, place in enumerate(data.get("places")):

            # check if place can fit within user allotted time frame

            # create place to store for final list
            place_to_store = Place(
                id = len(places) + 1,
                name=place.get("displayName").get("text"),
                address=place.get("formattedAddress"),
                latitude=place.get("location").get("latitude"),
                longitude=place.get("location").get("longitude"),
                category=place.get("primaryTypeDisplayName").get("text"),# If applying this, will need to use map in recommendation to find specific type and assign key to place category if this makes sense
                rating=place.get("rating"),
                estimated_cost=(_estimated_cost(place.get("priceLevel")))
            )
            places.append(place_to_store)

    return places



# testing with predefined trip preferences, can remove after
def test():
    load_dotenv("app/.env")
    api_key = os.getenv("GOOGLE_MAPS_API_KEY")

    preferences = TripPreferencesCreate(
        destination = "Los Angeles",
        trip_date = date(2026, 11, 1),
        starting_location = "Downtown Los Angeles",
        start_time = time(9, 0),
        end_time = time(17,0),
        budget = 45.00,
        transportation_mode = "driving",
        interests = ["Shopping", "Entertainment"], # can change interests, which should change printed results
        pace = "slow",
    )

    origin = Place(
        id = 1,
        name = "Downtown Los Angeles",
        address = "Los Angeles, CA",
        latitude = 34.0407,
        longitude = -118.247,
        category = "Starting Location",
        rating = None,
        estimated_cost = 0.0
    )

    results = discover_places(preferences, origin, api_key)
    for place in results:
        print(f"- {place.name}")

if __name__ == "__main__":
    test()