
from datetime import date, time
from unittest.mock import patch

from app.itinerary_generation import generate_itinerary
from app.schemas import Place, PlaceCreate, TripPreferencesCreate


preferences = TripPreferencesCreate(
    destination="Los Angeles",
    trip_date=date(2026, 11, 23),  # Monday
    starting_location="Downtown Los Angeles",
    start_time=time(9, 0),
    end_time=time(17, 0),
    budget=20,
    transportation_mode="car",
    interests=["food"],
    pace="moderate",
)

origin = PlaceCreate(
    name="Starting Location",
    address="Downtown Los Angeles",
    latitude=34.05,
    longitude=-118.25,
    category="starting_location",
    estimated_cost=0,
)


def make_place(id, name, cost, hours=None):
    return Place(
        id=id,
        name=name,
        address=f"{name}, Los Angeles",
        latitude=34.05,
        longitude=-118.25,
        category="food",
        rating=4.5,
        estimated_cost=cost,
        regular_opening_hours=hours,
    )


def test_budget_and_travel_time():
    places = [
        make_place(1, "Expensive Restaurant", 35),
        make_place(2, "Affordable Restaurant", 15),
    ]

    with patch(
        "app.itinerary_generation.travel_time_estimation",
        return_value={"duration": 5},
    ):
        stops, total_travel = generate_itinerary(
            places, preferences, origin, "test-key"
        )

    assert len(stops) == 1
    assert stops[0]["place"].name == "Affordable Restaurant"
    assert stops[0]["arrival_time"] == time(9, 5)
    assert stops[0]["departure_time"] == time(10, 5)
    assert total_travel == 5


def test_closed_restaurant_is_skipped():
    # Google uses Sunday=0, Monday=1
    closed_monday = {
        "periods": [
            {
                "open": {"day": 0, "hour": 11},
                "close": {"day": 0, "hour": 19},
            }
        ]
    }

    open_monday = {
        "periods": [
            {
                "open": {"day": 1, "hour": 8},
                "close": {"day": 1, "hour": 18},
            }
        ]
    }

    places = [
        make_place(1, "Closed Restaurant", 10, closed_monday),
        make_place(2, "Open Restaurant", 10, open_monday),
    ]

    with patch(
        "app.itinerary_generation.travel_time_estimation",
        return_value={"duration": 5},
    ):
        stops, total_travel = generate_itinerary(
            places, preferences, origin, "test-key"
        )

    assert len(stops) == 1
    assert stops[0]["place"].name == "Open Restaurant"
    assert total_travel == 5
