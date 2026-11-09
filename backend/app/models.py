from datetime import date, time
from decimal import Decimal

from sqlalchemy import (
    ARRAY,
    CheckConstraint,
    Date,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Time,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Trip(Base):
    __tablename__ = "trips"

    __table_args__ = (
        CheckConstraint(
            "end_time > start_time",
            name="check_trip_time_order",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    destination: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    trip_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    starting_location: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    start_time: Mapped[time] = mapped_column(
        Time,
        nullable=False,
    )

    end_time: Mapped[time] = mapped_column(
        Time,
        nullable=False,
    )

    budget: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    transportation_mode: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    interests: Mapped[list[str]] = mapped_column(
        ARRAY(String),
        nullable=False,
    )

    pace: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    itinerary_stops: Mapped[list["ItineraryStop"]] = relationship(
        back_populates="trip",
        cascade="all, delete-orphan",
    )


class Place(Base):
    __tablename__ = "places"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    name: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    address: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    latitude: Mapped[Decimal] = mapped_column(
        Numeric(9, 6),
        nullable=False,
    )

    longitude: Mapped[Decimal] = mapped_column(
        Numeric(9, 6),
        nullable=False,
    )

    category: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    rating: Mapped[Decimal | None] = mapped_column(
        Numeric(2, 1),
        nullable=True,
    )

    estimated_cost: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    itinerary_stops: Mapped[list["ItineraryStop"]] = relationship(
        back_populates="place",
    )


class ItineraryStop(Base):
    __tablename__ = "itinerary_stops"

    __table_args__ = (
        CheckConstraint(
            "departure_time > arrival_time",
            name="check_stop_time_order",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    trip_id: Mapped[int] = mapped_column(
        ForeignKey("trips.id"),
        nullable=False,
    )

    place_id: Mapped[int] = mapped_column(
        ForeignKey("places.id"),
        nullable=False,
    )

    stop_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    arrival_time: Mapped[time] = mapped_column(
        Time,
        nullable=False,
    )

    departure_time: Mapped[time] = mapped_column(
        Time,
        nullable=False,
    )

    trip: Mapped["Trip"] = relationship(
        back_populates="itinerary_stops",
    )

    place: Mapped["Place"] = relationship(
        back_populates="itinerary_stops",
    )