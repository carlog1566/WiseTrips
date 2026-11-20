# WiseTrips - Smart Itinerary Planner

WiseTrips is a mobile application that creates personalized, single-day travel itineraries based on a user's destination, interests, budget, schedule, and transportation preferences.

## Features

- **Personalized Trip Planning:** Generate itineraries based on user preferences, including travel pace and available time.
- **Place Discovery & Recommendations:** Discover and rank attractions, restaurants, and other destinations using Google Places.
- **Travel-Aware Scheduling:** Arrange stops using estimated travel times, visit durations, and budget constraints.
- **Saved Trips:** Store trip preferences, destinations, and itinerary stops in PostgreSQL and reopen them later.
- **Interactive Map:** View itinerary stops as numbered markers on a mobile map.

## Tech Stack

**Frontend:** React Native, Expo, TypeScript, Expo Router, TanStack Query, react-native-maps

**Backend:** Python, FastAPI, SQLAlchemy, PostgreSQL, Alembic

**APIs:** Google Places API (New), Geocoding API, Routes API

# Setup

## Prerequisites

Install or configure the following:

- Git and Node.js (LTS)
- PostgreSQL
- [uv](https://docs.astral.sh/uv/getting-started/installation/) — Python environment and dependencies (Python 3.14+ required)
- A Google Cloud project with billing enabled and the Places API (New), Geocoding API, and Routes API enabled
- Expo Go on a compatible device, or Xcode (iOS Simulator) / Android Studio (Android Emulator)

## 1. Clone the Repository

```bash
git clone https://github.com/carlog1566/WiseTrips.git
cd WiseTrips
```

## 2. PostgreSQL Setup

Create a local database named `wisetrips` using pgAdmin or PostgreSQL:

```sql
CREATE DATABASE wisetrips;
```

## 3. Backend Setup

Navigate to the backend and install dependencies:

```bash
cd backend
uv sync
```

Inside `backend/`, create a `.env` file:

```env
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/wisetrips
GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
```

Replace the placeholders with your PostgreSQL password and Google Maps API key.

Apply migrations:

```bash
uv run alembic upgrade head
```

Start the FastAPI server:

```bash
uv run fastapi dev app/main.py
```

Backend: `http://127.0.0.1:8000`

API Documentation: `http://127.0.0.1:8000/docs`

## 4. Frontend Setup

Open a second terminal from the repository root:

```bash
cd frontend
npm ci
```

Inside `frontend/`, create a `.env` file:

```env
EXPO_PUBLIC_API_URL=http://127.0.0.1:8000
```

This address works for the iOS Simulator when the backend runs on the same Mac.

- **Android Emulator:** Use `http://10.0.2.2:8000`.
- **Physical Device:** Use your computer's local IP address and start FastAPI with `--host 0.0.0.0`.

Start Expo for iOS:

```bash
npx expo start --ios
```

For Android:

```bash
npx expo start --android
```

Alternatively, run `npx expo start` to launch the app through Expo Go on a compatible device.

For Android native builds using Google Maps, configure a restricted `GOOGLE_MAPS_ANDROID_API_KEY` and enable the Google Maps SDK for Android. The iOS map uses the default native map provider.

**Note:** Never commit `.env` files or API keys. Variables prefixed with `EXPO_PUBLIC_` are included in the frontend bundle and must not contain secrets.

## Testing

Backend tests (from `backend/`; integration tests require configured services):

```bash
uv run python -m pytest
```

Frontend TypeScript check (from `frontend/`):

```bash
npx tsc --noEmit
```

# Usage

1. Enter your destination, starting location, trip date, time range, budget, interests, transportation mode, and travel pace.
2. Select **Generate Itinerary** to create and save your trip.
3. View scheduled destinations and open the **Map** tab to see their locations.
4. Navigate to **Trips** to revisit previously generated itineraries.

# Project Status

- [x] Trip preferences and itinerary generation
- [x] Google Places discovery and recommendations
- [x] Travel-time and budget-aware scheduling
- [x] PostgreSQL persistence and saved trips
- [x] Interactive itinerary map on iOS/Android
- [ ] Group trip planning with shared preferences and availability
- [ ] Editable itineraries (add, remove, or reorder destinations)
- [ ] Multi-day itinerary generation
- [ ] Detailed route visualization between destinations
- [ ] Crowd-aware recommendations (stretch goal)
- [ ] Dynamic itinerary replanning (stretch goal)
- [ ] Advanced itinerary optimization (stretch goal)

For more detailed contributor instructions, see [SETUP.md](SETUP.md).