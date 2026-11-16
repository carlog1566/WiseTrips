import requests
from .schemas import PlaceCreate

class RouteUnavailableError(Exception):
    pass
    """Raised when the Routes API cannot find a route between locations."""

def travel_time_estimation(origin: PlaceCreate, destination: PlaceCreate, travel_type: str, api_key: str):
    # Routes API url
    routes_url = "https://routes.googleapis.com/directions/v2:computeRoutes"

    travel_modes = ["BICYCLE", "DRIVE", "TRANSIT", "TWO_WHEELER", "TRUCK", "WALK"]
    if travel_type in travel_modes:
        travel_mode = travel_type
    else:
        travel_mode = "DRIVE"

    # Request headers
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": "routes.duration,routes.distanceMeters"
    }

    payload = {
        "origin": {
            "location": {
                "latLng": {
                    "latitude": origin.latitude,
                    "longitude": origin.longitude
                }
            }
        },
        "destination": {
            "location": {
                "latLng": {
                    "latitude": destination.latitude,
                    "longitude": destination.longitude
                }
            }
        },
        "travelMode": travel_mode
    }

    response = requests.post(routes_url, json=payload, headers=headers, timeout=10)
    # For testing without API key (debug stuff not requiring this function but not the API key)
    """if response.status_code == 400:
        return {"distance" : 1, "duration": 1}"""
    response.raise_for_status()

    data = response.json()
    if "routes" in data and len(data["routes"]) > 0:
        route = data["routes"][0]

        meters = route.get("distanceMeters", 0)
        miles = round(meters / 1609.344, 1)

        duration = route.get("duration", "0s")
        seconds = int(duration.rstrip("s"))
        minutes = round(seconds / 60)

        return {
            "distance": miles,
            "duration": minutes
        } 
    raise RouteUnavailableError("Cannot provide route between locations")