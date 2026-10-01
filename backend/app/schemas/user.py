from typing import Optional
from pydantic import BaseModel, ConfigDict


class UserRead(BaseModel):
    user_id: str
    name: str
    email: str
    role: str

    model_config = ConfigDict(from_attributes=True)


class TravelerRead(BaseModel):
    traveler_id: str
    preferences: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class AdminRead(BaseModel):
    admin_id: str
    department: str

    model_config = ConfigDict(from_attributes=True)
