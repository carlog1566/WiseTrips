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
    "interests": ["Museums"],
    "pace": "slow",
}


def test_generate_trip_returns_itinerary():
    response = client.post(
        "/api/trips/generate",
        json=VALID_TRIP,
    )

    assert response.status_code == 200, response.json()

    response_data = response.json()

    assert response_data["trip_id"] > 0
    assert "stops" in response_data
    assert "total_travel_minutes" in response_data
    assert len(response_data["stops"]) > 0


def test_generate_trip_rejects_invalid_time():
    invalid_trip = VALID_TRIP.copy()

    invalid_trip["start_time"] = "18:00:00"
    invalid_trip["end_time"] = "09:00:00"

    response = client.post(
        "/api/trips/generate",
        json=invalid_trip,
    )

    assert response.status_code == 422


def test_generate_trip_returns_404_when_no_places():
    invalid_trip = VALID_TRIP.copy()

    invalid_trip["destination"] = "New York"

    response = client.post(
        "/api/trips/generate",
        json=invalid_trip,
    )

    assert response.status_code == 404


def test_generate_trip_saves_itinerary():
    response = client.post(
        "/api/trips/generate",
        json=VALID_TRIP,
    )

    assert response.status_code == 200

    response_data = response.json()

    assert response_data["trip_id"] > 0
    assert len(response_data["stops"]) > 0

    for stop in response_data["stops"]:
        assert stop["trip_id"] == response_data["trip_id"]
        assert stop["place_id"] > 0
        assert stop["stop_order"] > 0
        assert "place" in stop


def test_get_all_trips():
    create_response = client.post(
        "/api/trips/generate",
        json=VALID_TRIP,
    )

    assert create_response.status_code == 200

    trip_id = create_response.json()["trip_id"]

    response = client.get("/api/trips")

    assert response.status_code == 200

    trips = response.json()

    assert isinstance(trips, list)
    assert any(trip["id"] == trip_id for trip in trips)


def test_get_saved_trip():
    create_response = client.post(
        "/api/trips/generate",
        json=VALID_TRIP,
    )

    assert create_response.status_code == 200

    trip_id = create_response.json()["trip_id"]

    response = client.get(
        f"/api/trips/{trip_id}"
    )

    assert response.status_code == 200

    trip = response.json()

    assert trip["id"] == trip_id
    assert trip["destination"] == "Los Angeles"


def test_get_saved_itinerary():
    create_response = client.post(
        "/api/trips/generate",
        json=VALID_TRIP,
    )

    assert create_response.status_code == 200

    trip_id = create_response.json()["trip_id"]

    response = client.get(
        f"/api/trips/{trip_id}/itinerary"
    )

    assert response.status_code == 200

    itinerary = response.json()

    assert itinerary["trip_id"] == trip_id
    assert len(itinerary["stops"]) > 0
    assert "total_travel_minutes" in itinerary

    for stop in itinerary["stops"]:
        assert "place" in stop
        assert stop["place"]["id"] == stop["place_id"]


def test_get_missing_trip_returns_404():
    response = client.get("/api/trips/999999")

    assert response.status_code == 404


def test_get_missing_itinerary_returns_404():
    response = client.get(
        "/api/trips/999999/itinerary"
    )

    assert response.status_code == 404