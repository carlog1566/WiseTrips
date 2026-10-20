from fastapi import FastAPI

app = FastAPI(
    title="WiseTrips API",
    description="Backend API for WiseTrips",
    version="0.1.0"
)

@app.get("/")
def root():
    return {"message": "Welcome to WiseTrips API"}

@app.get("/health")
def health():
    return {"status": "healthy"}