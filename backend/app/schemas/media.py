"""
Pydantic Schemas for NAVIX Authentic Media Resolution System.
"""
from typing import Optional
from pydantic import BaseModel, Field


class MediaResolveRequest(BaseModel):
    entity_type: str = Field(..., description="attraction | food | hotel | destination | story")
    name: str = Field(..., description="Name of the place, dish, hotel, or destination")
    destination: Optional[str] = Field(None, description="City or region (e.g. Goa, Manali)")
    state: Optional[str] = Field(None, description="State (e.g. Goa, Himachal Pradesh)")
    category: Optional[str] = Field(None, description="Category (e.g. Heritage, Nature, Seafood)")
    orientation: Optional[str] = Field("landscape", description="landscape | portrait | squarish")


class MediaResolveResponse(BaseModel):
    source: str = Field(..., description="unsplash | wikimedia | venue | curated")
    photo_id: Optional[str] = Field(None, description="Unique identifier from source provider")
    url: str = Field(..., description="Full high-resolution image URL")
    thumb_url: Optional[str] = Field(None, description="Optimized thumbnail image URL")
    alt: str = Field(..., description="Descriptive, location-accurate alt text")
    photographer: Optional[str] = Field(None, description="Name of creator or photographer")
    photographer_url: Optional[str] = Field(None, description="Photographer profile link with UTM parameters")
    source_url: Optional[str] = Field(None, description="Canonical page on source platform")
    download_location: Optional[str] = Field(None, description="Unsplash API download tracking endpoint if applicable")
    query: str = Field(..., description="Search query executed to discover image")
    verified_level: str = Field(..., description="exact_landmark | entity | dish | representative | curated")
    attribution_required: bool = Field(True, description="Whether legal attribution is required")
