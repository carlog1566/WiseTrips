from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


VALID_TRIP = {
    "destination": "Los Angeles",
    "trip_date": "2026-11-03",
    "starting_location": "Downtown Los Angeles",
    "start_time": "09:00:00",
    "end_time": "17:00:00",
    "budget": 100,
    "transportation_mode": "driving",
    "interests": ["Attraction"],
    "pace": "slow",
}


def test_generate_trip_returns_itinerary():
    response = client.post(
        "/api/trips/generate",
        json=VALID_TRIP,
    )

    assert response.status_code == 200

    response_data = response.json()

    assert isinstance(response_data["trip_id"], int)
    assert "stops" in response_data
    assert "total_travel_minutes" in response_data
    assert response_data["total_travel_minutes"] == 30


def test_generate_trip_rejects_invalid_time():
    invalid_trip = VALID_TRIP.copy()

    invalid_trip["start_time"] = "18:00:00"
    invalid_trip["end_time"] = "09:00:00"

    response = client.post(
        "/api/trips/generate",
        json=invalid_trip,
    )

    assert response.status_code == 422