from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, ConfigDict


class BudgetAllocationRead(BaseModel):
    allocation_id: str
    trip_id: str
    transit_cost: Optional[Decimal] = Decimal("0.00")
    lodging_cost: Optional[Decimal] = Decimal("0.00")
    food_cost: Optional[Decimal] = Decimal("0.00")
    activities_cost: Optional[Decimal] = Decimal("0.00")
    total_cost: Decimal

    model_config = ConfigDict(from_attributes=True)
