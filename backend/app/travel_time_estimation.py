import requests
from .schemas import PlaceCreate
import math

class RouteUnavailableError(Exception):
    """Raised when the Routes API cannot find a route between locations."""
    pass

class RoutingAPIError(Exception):
    """Raised when a routing API request fails."""
    pass

def travel_time_estimation(origin: PlaceCreate, destination: PlaceCreate, travel_type: str, api_key: str):
    # Routes API url
    routes_url = "https://routes.googleapis.com/directions/v2:computeRoutes"

    travel_modes = {
        "walking": "WALK",
        "publicTransit": "TRANSIT",
        "car": "DRIVE",
        "rideshare": "DRIVE",
        "driving": "DRIVE"
        }
    
    travel_mode = travel_modes.get(travel_type)
    if travel_mode is None:
        raise RouteUnavailableError(
            f"Unsupported transportation method: {travel_type}"
        )

    # Request headers
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline"
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

    try:
        response = requests.post(routes_url, json=payload, headers=headers, timeout=10)
        # For testing without API key (debug stuff requiring this function but not the API key)
        """if response.status_code == 400:
        return {"distance" : 1, "duration": 1}"""
        response.raise_for_status()
        data = response.json()
        
    except requests.exceptions.Timeout as e:
        raise RoutingAPIError("Routing request timed out") from e

    except requests.exceptions.JSONDecodeError as e:
        raise RoutingAPIError("Invalid routing response") from e

    
    except requests.exceptions.RequestException as e:
        if e.response is not None:
            raise RoutingAPIError(
                f"Routing request failed ({e.response.status_code}): "
                f"{e.response.text}"
            ) from e

        raise RoutingAPIError(f"Routing request failed: {e}") from e

    
    if "routes" in data and len(data["routes"]) > 0:
        route = data["routes"][0]

        meters = route.get("distanceMeters", 0)
        miles = round(meters / 1609.344, 1)

        duration = route.get("duration", "0s")
        seconds = int(duration.rstrip("s"))
        minutes = math.ceil(seconds / 60)

        return {
            "distance": miles,
            "duration": minutes,
            "distance_meters": meters,
            "encoded_polyline": route.get(
                "polyline", {}
            ).get("encodedPolyline"),
        } 
    raise RouteUnavailableError("Cannot provide route between locations")