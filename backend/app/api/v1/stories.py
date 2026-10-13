"""
Stories & Curated Travel Guides API for NAVIX Presentation Release.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import select, func, or_
from pydantic import BaseModel, ConfigDict

from app.database.session import get_db
from app.models.demo_catalog import DemoStory

stories_router = APIRouter(prefix="/stories", tags=["Travel Stories"])


class StoryItem(BaseModel):
    id: str
    slug: str
    title: str
    destination_slug: str
    destination_name: str
    category: str
    summary: str
    body: str
    author: str
    read_time: str
    hero_image: str
    data_state: str = "DEMO_SEED"

    model_config = ConfigDict(from_attributes=True)


class StoryListResponse(BaseModel):
    total: int
    page: int
    limit: int
    items: List[StoryItem]


@stories_router.get("", response_model=StoryListResponse)
def list_stories(
    category: Optional[str] = Query(None, description="Category filter (Guides, Budget Travel, Food, Adventure, Culture, Weekend Trips)"),
    search: Optional[str] = Query(None, description="Search by title, destination, or topic"),
    page: int = Query(1, ge=1),
    limit: int = Query(32, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """List travel stories and curated guides."""
    query = select(DemoStory)

    if category and category.lower() != "all":
        query = query.where(func.lower(DemoStory.category) == category.strip().lower())

    if search:
        s = f"%{search.strip().lower()}%"
        query = query.where(
            or_(
                func.lower(DemoStory.title).like(s),
                func.lower(DemoStory.destination_name).like(s),
                func.lower(DemoStory.summary).like(s)
            )
        )

    all_items = db.scalars(query.order_by(DemoStory.id.asc())).all()
    total = len(all_items)
    start = (page - 1) * limit
    paginated = all_items[start:start + limit]

    return StoryListResponse(
        total=total,
        page=page,
        limit=limit,
        items=[StoryItem.model_validate(item) for item in paginated]
    )


@stories_router.get("/{slug}", response_model=StoryItem)
def get_story_detail(slug: str, db: Session = Depends(get_db)):
    """Get full article of a travel story by slug."""
    story = db.scalar(select(DemoStory).where(DemoStory.slug == slug.lower()))
    if not story:
        story = db.scalar(select(DemoStory).where(DemoStory.id == slug))
    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Travel story '{slug}' not found"
        )
    return StoryItem.model_validate(story)
