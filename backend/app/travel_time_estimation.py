import requests
import os
from dotenv import load_dotenv # For testing
from .schemas import PlaceCreate

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
        "destination" : {
            "location" : {
                "latLng" : {
                    "latidude": destination.latitude,
                    "longitude": destination.longitude
                }
            }
        },
        "travelMode": travel_mode
    }

    response = requests.post(routes_url, json=payload, headers=headers)
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
    else:
        raise ValueError("Cannot provide route between locations")