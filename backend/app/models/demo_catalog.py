"""
Demo Catalog Models for NAVIX 48-Hour Presentation Release.
Stores curated, deterministic destinations, attractions, food places, hotels, and stories.
All seeded records carry data_state='DEMO_SEED' and price_state='DEMO_ESTIMATE'.
"""
from datetime import datetime
from typing import List, Optional, Any
from sqlalchemy import String, Float, Integer, Boolean, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base


class DemoDestination(Base):
    __tablename__ = "demo_destinations"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    country: Mapped[str] = mapped_column(String(100), default="India")
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    categories: Mapped[Any] = mapped_column(JSON, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    ideal_duration: Mapped[str] = mapped_column(String(50), nullable=False)
    best_season: Mapped[str] = mapped_column(String(100), nullable=False)
    daily_budget: Mapped[float] = mapped_column(Float, nullable=False)
    hero_image: Mapped[str] = mapped_column(String(500), nullable=False)
    rating: Mapped[float] = mapped_column(Float, default=4.7)
    popularity_score: Mapped[float] = mapped_column(Float, default=85.0)
    data_state: Mapped[str] = mapped_column(String(50), default="DEMO_SEED")
    price_state: Mapped[str] = mapped_column(String(50), default="DEMO_ESTIMATE")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    attractions: Mapped[List["DemoAttraction"]] = relationship("DemoAttraction", back_populates="destination", cascade="all, delete-orphan")
    food_places: Mapped[List["DemoFoodPlace"]] = relationship("DemoFoodPlace", back_populates="destination", cascade="all, delete-orphan")
    hotels: Mapped[List["DemoHotel"]] = relationship("DemoHotel", back_populates="destination", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<DemoDestination(id={self.id!r}, name={self.name!r}, city={self.city!r})>"


class DemoAttraction(Base):
    __tablename__ = "demo_attractions"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    destination_id: Mapped[str] = mapped_column(String(50), ForeignKey("demo_destinations.id", ondelete="CASCADE"), nullable=False)
    destination_slug: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    rating: Mapped[float] = mapped_column(Float, nullable=False)
    visit_duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    entry_fee: Mapped[float] = mapped_column(Float, default=0.0)
    opening_time: Mapped[str] = mapped_column(String(20), default="09:00")
    closing_time: Mapped[str] = mapped_column(String(20), default="18:00")
    description: Mapped[str] = mapped_column(Text, nullable=False)
    image: Mapped[str] = mapped_column(String(500), nullable=False)
    recommended_score: Mapped[float] = mapped_column(Float, default=80.0)
    data_state: Mapped[str] = mapped_column(String(50), default="DEMO_SEED")
    price_state: Mapped[str] = mapped_column(String(50), default="DEMO_ESTIMATE")

    destination: Mapped["DemoDestination"] = relationship("DemoDestination", back_populates="attractions")

    def __repr__(self) -> str:
        return f"<DemoAttraction(id={self.id!r}, name={self.name!r})>"


class DemoFoodPlace(Base):
    __tablename__ = "demo_food_places"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    destination_id: Mapped[str] = mapped_column(String(50), ForeignKey("demo_destinations.id", ondelete="CASCADE"), nullable=False)
    destination_slug: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    cuisine: Mapped[str] = mapped_column(String(100), nullable=False)
    dietary: Mapped[str] = mapped_column(String(50), default="both")
    rating: Mapped[float] = mapped_column(Float, nullable=False)
    cost_for_two: Mapped[float] = mapped_column(Float, nullable=False)
    opening_hours: Mapped[str] = mapped_column(String(50), default="11:00 - 23:00")
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    speciality: Mapped[str] = mapped_column(String(200), nullable=False)
    image: Mapped[str] = mapped_column(String(500), nullable=False)
    data_state: Mapped[str] = mapped_column(String(50), default="DEMO_SEED")
    price_state: Mapped[str] = mapped_column(String(50), default="DEMO_ESTIMATE")

    destination: Mapped["DemoDestination"] = relationship("DemoDestination", back_populates="food_places")

    def __repr__(self) -> str:
        return f"<DemoFoodPlace(id={self.id!r}, name={self.name!r}, cuisine={self.cuisine!r})>"


class DemoHotel(Base):
    __tablename__ = "demo_hotels"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    destination_id: Mapped[str] = mapped_column(String(50), ForeignKey("demo_destinations.id", ondelete="CASCADE"), nullable=False)
    destination_slug: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)  # Budget, Standard, Premium
    price_per_night: Mapped[float] = mapped_column(Float, nullable=False)
    rating: Mapped[float] = mapped_column(Float, nullable=False)
    room_type: Mapped[str] = mapped_column(String(100), nullable=False)
    amenities: Mapped[Any] = mapped_column(JSON, nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    image: Mapped[str] = mapped_column(String(500), nullable=False)
    availability: Mapped[bool] = mapped_column(Boolean, default=True)
    data_state: Mapped[str] = mapped_column(String(50), default="DEMO_SEED")
    price_state: Mapped[str] = mapped_column(String(50), default="DEMO_ESTIMATE")

    destination: Mapped["DemoDestination"] = relationship("DemoDestination", back_populates="hotels")

    def __repr__(self) -> str:
        return f"<DemoHotel(id={self.id!r}, name={self.name!r}, price={self.price_per_night})>"


class DemoStory(Base):
    __tablename__ = "demo_stories"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    slug: Mapped[str] = mapped_column(String(150), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(250), nullable=False)
    destination_slug: Mapped[str] = mapped_column(String(100), nullable=False)
    destination_name: Mapped[str] = mapped_column(String(150), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    author: Mapped[str] = mapped_column(String(100), nullable=False)
    read_time: Mapped[str] = mapped_column(String(30), nullable=False)
    hero_image: Mapped[str] = mapped_column(String(500), nullable=False)
    data_state: Mapped[str] = mapped_column(String(50), default="DEMO_SEED")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<DemoStory(id={self.id!r}, title={self.title!r})>"
