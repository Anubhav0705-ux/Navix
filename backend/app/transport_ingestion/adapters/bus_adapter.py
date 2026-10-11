import os
import json
from typing import List, Any
from app.transport_ingestion.contracts import (
    BaseProviderAdapter, NormalizedService, NormalizedCallingPoint, NormalizedFare
)


class BusProviderAdapter(BaseProviderAdapter):
    def __init__(self, data_path: str = None):
        if data_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
            data_path = os.path.join(base_dir, "data", "transport", "bus", "msrtc_ksrtc_schedules.json")
        self.data_path = data_path

    def fetch(self) -> Any:
        if not os.path.exists(self.data_path):
            raise FileNotFoundError(f"Bus schedule dataset not found at: {self.data_path}")
        with open(self.data_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def parse(self, raw_data: Any) -> List[NormalizedService]:
        services = []
        for item in raw_data:
            calling_points = [
                NormalizedCallingPoint(**cp) for cp in item.get("calling_points", [])
            ]
            fares = [
                NormalizedFare(**f) for f in item.get("fares", [])
            ]
            service = NormalizedService(
                service_code=item["service_code"],
                service_name=item["service_name"],
                provider_id=item["provider_id"],
                provider_name=item["provider_name"],
                operator_name=item.get("operator_name"),
                code_system=item.get("code_system", "MSRTC"),
                transport_mode="BUS",
                data_state=item.get("data_state", "SCHEDULED"),
                data_class=item.get("data_class", "SYNTHETIC_CONTRACT_FIXTURE"),
                calendar=item.get("calendar", {}),
                calling_points=calling_points,
                fares=fares
            )
            services.append(service)
        return services

    def validate(self, services: List[NormalizedService]) -> List[NormalizedService]:
        from app.transport_ingestion.validator import TransportValidator
        validator = TransportValidator()
        return validator.filter_valid(services)
