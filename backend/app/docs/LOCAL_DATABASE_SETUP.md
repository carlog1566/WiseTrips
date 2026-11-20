# WiseTrips Local PostgreSQL Database Setup

This guide is for WiseTrips team members who already have the repository on their computer.

Each team member should create their own local PostgreSQL database.

## Requirements

Install the following tools:

- PostgreSQL
- pgAdmin 4
- Python
- uv
- VS Code

## 1. Open the WiseTrips Project

Open the WiseTrips repository in VS Code.

Open a terminal in the project folder and enter:

```powershell
cd backend
```

All backend commands should be run from this folder.

## 2. Install Backend Dependencies

```powershell
uv sync
```

This installs the project dependencies and creates the Python environment.

## 3. Create the PostgreSQL Database

Open **pgAdmin 4**.

1. Connect to your local PostgreSQL server.
2. Right-click **Databases**.
3. Select **Create → Database**.
4. Set the database name to:

```text
wisetrips
```

5. Click **Save**.

The default PostgreSQL port is:

```text
5432
```

## 4. Create the `.env` File

Inside the `backend` folder, create a file named:

```text
.env
```

Add:

```env
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/wisetrips
```

Replace `YOUR_PASSWORD` with your local PostgreSQL password.

Example:

```env
DATABASE_URL=postgresql+psycopg://postgres:password123@localhost:5432/wisetrips
```

Do not commit the `.env` file to GitHub.

## 5. Create the Database Tables

From the `backend` folder, run:

```powershell
uv run alembic upgrade head
```

This applies the migrations and creates the WiseTrips tables.

The main tables include:

- `trips`
- `places`
- `itinerary_stops`

## 6. Check the Tables in pgAdmin

In pgAdmin, expand:

```text
Servers
→ PostgreSQL
→ Databases
→ wisetrips
→ Schemas
→ public
→ Tables
```

You should see:

```text
trips
places
itinerary_stops
alembic_version
```

To view table data:

1. Right-click a table.
2. Select **View/Edit Data**.
3. Select **All Rows**.

## 7. Run the Backend

From the `backend` folder, run:

```powershell
uv run fastapi dev app/main.py
```

The backend should run at:

```text
http://127.0.0.1:8000
```

Open the API documentation at:

```text
http://127.0.0.1:8000/docs
```

## 8. Run the Automated Tests

Open another terminal and enter the backend folder:

```powershell
cd WiseTrips\backend
```

Run:

```powershell
uv run python -m pytest
```

All tests should pass before creating a pull request.

## 9. Test the Itinerary Endpoint

Open:

```text
http://127.0.0.1:8000/docs
```

Find:

```text
POST /api/trips/generate
```

Use this example request:

```json
{
  "destination": "Los Angeles",
  "trip_date": "2026-11-03",
  "starting_location": "Downtown Los Angeles",
  "start_time": "09:00:00",
  "end_time": "17:00:00",
  "budget": 100,
  "transportation_mode": "driving",
  "interests": ["Museums"],
  "pace": "slow"
}
```

The response should include:

- `trip_id`
- Generated itinerary stops
- Place information
- Arrival times
- Departure times
- Total travel minutes

## 10. Test the Retrieval Endpoints

Available retrieval endpoints:

```text
GET /api/trips
GET /api/trips/{trip_id}
GET /api/trips/{trip_id}/itinerary
```

Use the `trip_id` returned by:

```text
POST /api/trips/generate
```

## Troubleshooting

### `No pyproject.toml found`

Make sure you are inside the backend folder:

```powershell
cd WiseTrips\backend
```

Then run:

```powershell
uv sync
```

### Database Connection Error

Check that:

- PostgreSQL is running.
- The database is named `wisetrips`.
- The password in `.env` is correct.
- The port is `5432`.
- The `DATABASE_URL` is spelled correctly.

### `relation does not exist`

Run the migrations again:

```powershell
uv run alembic upgrade head
```

### Tests Cannot Import `app`

Make sure you are running tests from the backend folder:

```powershell
cd WiseTrips\backend
uv run python -m pytest
```

### Stop the Backend

Press:

```text
Ctrl + C
```

## Important Notes

- Each team member should use their own local PostgreSQL database.
- Do not commit `.env` files or database passwords.
- Run migrations after pulling database-related changes.
- Run the tests before submitting a pull request.