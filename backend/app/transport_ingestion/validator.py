import re
from typing import List, Tuple
from app.transport_ingestion.contracts import NormalizedService


TIME_REGEX = re.compile(r"^([01]?\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$")


class TransportValidator:
    def __init__(self):
        self.rejected_records: List[Tuple[str, str]] = []

    def validate_service(self, service: NormalizedService) -> bool:
        if not service.service_code or not service.service_name:
            self.rejected_records.append((service.service_code or "UNKNOWN", "Missing service code or name"))
            return False

        if service.transport_mode not in ("RAIL", "BUS", "FLIGHT", "METRO", "FERRY", "LOCAL_TRANSIT"):
            self.rejected_records.append((service.service_code, f"Invalid transport mode: {service.transport_mode}"))
            return False

        if service.data_state not in ("STATIC", "SCHEDULED", "LIVE", "ESTIMATED", "STALE", "UNKNOWN"):
            self.rejected_records.append((service.service_code, f"Invalid data state: {service.data_state}"))
            return False

        # Validate calling points
        if not service.calling_points:
            self.rejected_records.append((service.service_code, "Service has no calling points"))
            return False

        last_seq = 0
        for cp in service.calling_points:
            if cp.stop_sequence <= last_seq:
                self.rejected_records.append((service.service_code, f"Non-increasing stop sequence at {cp.stop_name}: {cp.stop_sequence} <= {last_seq}"))
                return False
            last_seq = cp.stop_sequence

            if not TIME_REGEX.match(cp.arrival_time) or not TIME_REGEX.match(cp.departure_time):
                self.rejected_records.append((service.service_code, f"Invalid time format in calling point {cp.stop_name}: arrival={cp.arrival_time}, departure={cp.departure_time}"))
                return False

            if cp.day_offset < 0:
                self.rejected_records.append((service.service_code, f"Negative day offset in calling point {cp.stop_name}: {cp.day_offset}"))
                return False

            FORBIDDEN_SYNTHETIC = {"fac_sli_rail", "fac_mrj_rail"}
            if cp.facility_id and cp.facility_id.lower() in FORBIDDEN_SYNTHETIC:
                self.rejected_records.append((service.service_code, f"Forbidden synthetic facility ID in calling point {cp.stop_name}: {cp.facility_id}"))
                return False

        # Validate fares
        for fare in service.fares:
            if fare.amount is not None and fare.amount < 0:
                self.rejected_records.append((service.service_code, f"Negative fare amount: {fare.amount}"))
                return False

        return True

    def filter_valid(self, services: List[NormalizedService]) -> List[NormalizedService]:
        valid_services = []
        for s in services:
            if self.validate_service(s):
                valid_services.append(s)
        return valid_services
