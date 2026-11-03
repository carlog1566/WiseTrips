from fastapi import FastAPI

from app.routes.trip_preference_routes import (
    router as trip_preference_router,
)


app = FastAPI(
    title="WiseTrips API",
    description="Backend API for WiseTrips",
    version="0.1.0",
)


app.include_router(trip_preference_router)


@app.get("/")
def root():
    return {"message": "Welcome to WiseTrips API"}


@app.get("/health")
def health():
    return {"status": "healthy"}