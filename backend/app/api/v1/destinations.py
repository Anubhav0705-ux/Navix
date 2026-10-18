"""
Destination Discovery & Detail Endpoints for NAVIX Presentation Release.
Provides full catalog of Indian destinations, attractions, regional dining, and accommodations.
"""
from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import select, func, or_
from pydantic import BaseModel, ConfigDict

from app.database.session import get_db
from app.models.demo_catalog import (
    DemoDestination,
    DemoAttraction,
    DemoFoodPlace,
    DemoHotel
)

destinations_router = APIRouter(prefix="/destinations", tags=["Destinations"])


# Pydantic Schemas
class DestinationSummary(BaseModel):
    id: str
    slug: str
    name: str
    city: str
    state: str
    country: str
    latitude: float
    longitude: float
    categories: List[str]
    description: str
    ideal_duration: str
    best_season: str
    daily_budget: float
    hero_image: str
    rating: float
    popularity_score: float
    data_state: str = "DEMO_SEED"

    model_config = ConfigDict(from_attributes=True)


class DestinationListResponse(BaseModel):
    total: int
    page: int
    limit: int
    items: List[DestinationSummary]


class AttractionItem(BaseModel):
    id: str
    destination_id: str
    destination_slug: str
    name: str
    category: str
    latitude: float
    longitude: float
    rating: float
    visit_duration_minutes: int
    entry_fee: float
    opening_time: str
    closing_time: str
    description: str
    image: str
    recommended_score: float
    data_state: str = "DEMO_SEED"
    price_state: str = "DEMO_ESTIMATE"

    model_config = ConfigDict(from_attributes=True)


class FoodPlaceItem(BaseModel):
    id: str
    destination_id: str
    destination_slug: str
    name: str
    cuisine: str
    dietary: str
    rating: float
    cost_for_two: float
    opening_hours: str
    latitude: float
    longitude: float
    speciality: str
    image: str
    data_state: str = "DEMO_SEED"
    price_state: str = "DEMO_ESTIMATE"

    model_config = ConfigDict(from_attributes=True)


class HotelItem(BaseModel):
    id: str
    destination_id: str
    destination_slug: str
    name: str
    category: str
    price_per_night: float
    rating: float
    room_type: str
    amenities: List[str]
    latitude: float
    longitude: float
    image: str
    availability: bool
    data_state: str = "DEMO_SEED"
    price_state: str = "DEMO_ESTIMATE"

    model_config = ConfigDict(from_attributes=True)


class DestinationDetailResponse(DestinationSummary):
    attractions: List[AttractionItem] = []
    food_places: List[FoodPlaceItem] = []
    hotels: List[HotelItem] = []


@destinations_router.get("", response_model=DestinationListResponse)
def list_destinations(
    category: Optional[str] = Query(None, description="Category filter (e.g. Mountains, Beach, Heritage)"),
    search: Optional[str] = Query(None, description="Search term for city, name, or state"),
    page: int = Query(1, ge=1),
    limit: int = Query(60, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """List destinations with optional category and search filters."""
    query = select(DemoDestination)

    if search:
        s = f"%{search.strip().lower()}%"
        query = query.where(
            or_(
                func.lower(DemoDestination.name).like(s),
                func.lower(DemoDestination.city).like(s),
                func.lower(DemoDestination.state).like(s)
            )
        )

    all_items = db.scalars(query.order_by(DemoDestination.popularity_score.desc())).all()

    # Category filter in python for JSON array match
    if category and category.lower() != "all":
        cat_lower = category.strip().lower()
        filtered = [
            item for item in all_items
            if any(cat_lower in str(c).lower() for c in (item.categories or []))
        ]
    else:
        filtered = all_items

    total = len(filtered)
    start = (page - 1) * limit
    paginated = filtered[start:start + limit]

    return DestinationListResponse(
        total=total,
        page=page,
        limit=limit,
        items=[DestinationSummary.model_validate(item) for item in paginated]
    )


@destinations_router.get("/{slug}", response_model=DestinationDetailResponse)
def get_destination_detail(slug: str, db: Session = Depends(get_db)):
    """Retrieve full destination details including attractions, food, and stays."""
    dest = _find_destination(db, slug)
    if not dest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Destination '{slug}' not found"
        )


    attractions = db.scalars(
        select(DemoAttraction).where(DemoAttraction.destination_id == dest.id).order_by(DemoAttraction.recommended_score.desc())
    ).all()

    food_places = db.scalars(
        select(DemoFoodPlace).where(DemoFoodPlace.destination_id == dest.id).order_by(DemoFoodPlace.rating.desc())
    ).all()

    hotels = db.scalars(
        select(DemoHotel).where(DemoHotel.destination_id == dest.id).order_by(DemoHotel.price_per_night.asc())
    ).all()

    summary = DestinationSummary.model_validate(dest)
    return DestinationDetailResponse(
        **summary.model_dump(),
        attractions=[AttractionItem.model_validate(a) for a in attractions],
        food_places=[FoodPlaceItem.model_validate(f) for f in food_places],
        hotels=[HotelItem.model_validate(h) for h in hotels]
    )


from app.core.destinations import resolve_canonical_destination


def _find_destination(db: Session, slug: str) -> Optional[DemoDestination]:
    canon = resolve_canonical_destination(db, slug)
    if canon:
        return canon
    slug_clean = slug.strip().lower().replace(" ", "-")
    dest = db.scalar(select(DemoDestination).where(DemoDestination.slug == slug_clean))
    if not dest:
        dest = db.scalar(select(DemoDestination).where(DemoDestination.slug == slug.strip().lower()))
    if not dest:
        dest = db.scalar(
            select(DemoDestination).where(
                or_(
                    DemoDestination.id == slug,
                    func.lower(DemoDestination.city) == slug.strip().lower(),
                    func.lower(DemoDestination.name) == slug.strip().lower()
                )
            )
        )
    return dest



@destinations_router.get("/{slug}/attractions", response_model=List[AttractionItem])
def get_destination_attractions(slug: str, db: Session = Depends(get_db)):
    """Get attractions for a specific destination slug or city."""
    dest = _find_destination(db, slug)
    if not dest:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Destination '{slug}' not found")
    items = db.scalars(select(DemoAttraction).where(DemoAttraction.destination_id == dest.id).order_by(DemoAttraction.recommended_score.desc())).all()
    return [AttractionItem.model_validate(a) for a in items]


@destinations_router.get("/{slug}/food", response_model=List[FoodPlaceItem])
def get_destination_food(slug: str, db: Session = Depends(get_db)):
    """Get food places for a specific destination slug or city."""
    dest = _find_destination(db, slug)
    if not dest:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Destination '{slug}' not found")
    items = db.scalars(select(DemoFoodPlace).where(DemoFoodPlace.destination_id == dest.id).order_by(DemoFoodPlace.rating.desc())).all()
    return [FoodPlaceItem.model_validate(f) for f in items]


@destinations_router.get("/{slug}/hotels", response_model=List[HotelItem])
def get_destination_hotels(slug: str, db: Session = Depends(get_db)):
    """Get hotels for a specific destination slug or city."""
    dest = _find_destination(db, slug)
    if not dest:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Destination '{slug}' not found")
    items = db.scalars(select(DemoHotel).where(DemoHotel.destination_id == dest.id).order_by(DemoHotel.price_per_night.asc())).all()
    return [HotelItem.model_validate(h) for h in items]

