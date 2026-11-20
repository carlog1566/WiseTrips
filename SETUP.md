# WiseTrips — Local Development Setup

This guide covers setting up **WiseTrips** locally, including PostgreSQL, the FastAPI backend, and the React Native/Expo mobile app. WiseTrips targets **iOS and Android**; you can develop on macOS or Windows.

## 1. Install the Required Tools

| Tool | Purpose | Link |
| --- | --- | --- |
| **Git** | Clone the repository | [Install Git](https://git-scm.com/downloads) |
| **Node.js (LTS)** | Run the Expo frontend and npm | [Install Node.js](https://nodejs.org/en/download) |
| **uv** | Manage Python 3.14+ and backend dependencies | [Install uv](https://docs.astral.sh/uv/getting-started/installation/) |
| **PostgreSQL** | Store trips, places, and itinerary stops | [Install PostgreSQL](https://www.postgresql.org/download/) |
| **pgAdmin 4** | Manage the local database | [Install pgAdmin](https://www.pgadmin.org/download/) |
| **VS Code** | Edit the project | [Install VS Code](https://code.visualstudio.com/) |

For mobile testing, choose one option:

- **macOS / iOS Simulator:** Install [Xcode](https://developer.apple.com/xcode/), configure Command Line Tools in **Settings → Locations**, and install an iOS Simulator runtime.
- **Android Emulator:** Install [Android Studio](https://developer.android.com/studio) and create a virtual device.
- **Physical Android or compatible iPhone:** Install [Expo Go](https://expo.dev/go). Connect your phone and computer to the same Wi-Fi network.

You also need a **Google Cloud project with billing enabled**, a Google Maps Platform API key, and the **Places API (New)**, **Geocoding API**, and **Routes API** enabled.

Verify the installations:

```bash
git --version
node --version
npm --version
uv --version
psql --version
```

## 2. Clone the Repository

```bash
git clone https://github.com/carlog1566/WiseTrips.git
cd WiseTrips
```

## 3. Create Your Local PostgreSQL Database

Each contributor should use their own local database.

1. Start PostgreSQL and open **pgAdmin 4**.
2. Connect to your local PostgreSQL server (default port: `5432`).
3. Right-click **Databases → Create → Database**.
4. Name the database `wisetrips` and click **Save**.

Alternatively, use `psql` with an account authorized to create databases:

```sql
CREATE DATABASE wisetrips;
```

Remember your PostgreSQL username, password, host, and port for the backend configuration.

## 4. Backend Setup

From the repository root:

```bash
cd backend
uv sync
```

This installs the Python environment and backend dependencies. Python **3.14+** is required.

### Configure Environment Variables

Copy the existing environment template.

**macOS / Linux:**

```bash
cp .env.example .env
```

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

Edit `backend/.env`:

```env
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/wisetrips
GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
```

Replace the placeholders with your database credentials and Google Maps API key. If your PostgreSQL username differs from `postgres`, update it in the connection string.

Never commit `.env` files or private credentials.

### Run Database Migrations

Inside `backend/`, execute:

```bash
uv run alembic upgrade head
```

This creates the database tables:

- `trips`
- `places`
- `itinerary_stops`
- `alembic_version`

To verify in pgAdmin, navigate to **Databases → wisetrips → Schemas → public → Tables**.

### Start the Backend

```bash
uv run fastapi dev app/main.py
```

The backend runs at `http://127.0.0.1:8000`.

Useful endpoints:

- [API Health Check](http://127.0.0.1:8000/health)
- [API Documentation](http://127.0.0.1:8000/docs)
- [Saved Trips](http://127.0.0.1:8000/api/trips)

For physical-device testing, run the backend with an accessible network address:

```bash
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Only expose your development server on a trusted local network.

## 5. Frontend Setup

Open a second terminal from the repository root:

```bash
cd frontend
npm ci
```

### Configure Environment Variables

Copy the frontend environment template.

**macOS / Linux:**

```bash
cp .env.example .env
```

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

Set the API URL in `frontend/.env` based on your device:

| Device | API URL |
| --- | --- |
| iOS Simulator | `http://127.0.0.1:8000` |
| Android Emulator | `http://10.0.2.2:8000` |
| Physical Device | `http://YOUR_COMPUTER_LAN_IP:8000` |

Example for the iOS Simulator:

```env
EXPO_PUBLIC_API_URL=http://127.0.0.1:8000
```

For a physical device, replace `YOUR_COMPUTER_LAN_IP` with your computer's local IP address. The device and computer must be connected to the same network.

For Android development builds using Google Maps, you can also configure a separate, Android-app-restricted `GOOGLE_MAPS_ANDROID_API_KEY`.

### Start Expo

```bash
npx expo start
```

Choose your testing platform:

- **iOS Simulator:** Press `i`, or run `npx expo start --ios`.
- **Android Emulator:** Start your emulator and press `a`, or run `npx expo start --android`.
- **Physical Device:** Open the project through a compatible version of Expo Go.

WiseTrips currently targets **iOS and Android**, not web.

## 6. Verify the Application

1. Make sure PostgreSQL, FastAPI, and Expo are running.
2. Visit `http://127.0.0.1:8000/api/trips` to confirm the backend is accessible.
3. Open WiseTrips and submit trip preferences.
4. Generate an itinerary and verify its scheduled destinations.
5. Open the **Map** view to see the itinerary stops.
6. Navigate to **Trips** to reopen a saved itinerary.

### Run Tests

Backend (from `backend/`):

```bash
uv run python -m pytest
```

Frontend (from `frontend/`):

```bash
npx tsc --noEmit
```

Some backend integration tests require a configured database and Google Maps API credentials.

## Troubleshooting

**Database connection failed**

Verify PostgreSQL is running and the `DATABASE_URL` in `backend/.env` contains the correct credentials, database name, and port.

**Database tables do not exist**

Run the migrations again from `backend/`:

```bash
uv run alembic upgrade head
```

**Saved itineraries fail to load**

Verify that FastAPI is running and that `EXPO_PUBLIC_API_URL` points to an address accessible from your device. Restart Expo after updating `.env`.

**Google Maps API requests fail**

Check your API key, billing configuration, enabled APIs, and key restrictions.

**iOS Simulator fails to launch**

Verify Xcode Command Line Tools and the iOS Simulator runtime are installed.

To stop either server, press **Ctrl+C** in its terminal.

**Important:** Keep all API keys, database passwords, and `.env` files out of Git.