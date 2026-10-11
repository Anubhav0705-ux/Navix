import uuid
from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models.transport_platform import (
    TransportProvider, TransportService, TransportServiceCalendar,
    TransportTrip, TransportCallingPoint, TransportFare,
    TransportAvailability, TransportProvenance, TransportIngestionRun
)
from app.transport_ingestion.contracts import NormalizedService
from app.transport_ingestion.resolver import LocationResolver
from app.transport_ingestion.manifest import TransportSourceRecord


class TransportLoader:
    def __init__(self, db: Session):
        self.db = db
        self.resolver = LocationResolver(db)

    def load_services(self, source_record: TransportSourceRecord, services: List[NormalizedService]) -> TransportIngestionRun:
        run_id = f"run_{uuid.uuid4().hex[:12]}"
        run = TransportIngestionRun(
            id=run_id,
            source_id=source_record.source_id,
            started_at=datetime.now(timezone.utc),
            status="RUNNING",
            records_read=len(services),
            records_inserted=0,
            records_updated=0,
            records_skipped=0,
            records_rejected=0,
            error_count=0,
            error_log=""
        )
        self.db.add(run)
        self.db.commit()

        try:
            for service_data in services:
                # 1. Upsert TransportProvider
                provider = self.db.query(TransportProvider).filter(TransportProvider.id == service_data.provider_id).first()
                if not provider:
                    provider = TransportProvider(
                        id=service_data.provider_id,
                        name=service_data.provider_name,
                        operator_name=service_data.operator_name,
                        code_system=service_data.code_system,
                        transport_mode=service_data.transport_mode,
                        website_url=source_record.source_url
                    )
                    self.db.add(provider)
                    self.db.flush()

                # Resolve origin and destination facility IDs if calling points exist
                origin_fac_id = None
                dest_fac_id = None
                if service_data.calling_points:
                    first_cp = service_data.calling_points[0]
                    last_cp = service_data.calling_points[-1]
                    r_first = self.resolver.resolve_stop(service_data.code_system, first_cp.provider_stop_code, first_cp.stop_name, mode=service_data.transport_mode)
                    r_last = self.resolver.resolve_stop(service_data.code_system, last_cp.provider_stop_code, last_cp.stop_name, mode=service_data.transport_mode)
                    origin_fac_id = r_first.facility_id
                    if not origin_fac_id and first_cp.facility_id and self.resolver.is_facility_mode_compatible(first_cp.facility_id, service_data.transport_mode):
                        origin_fac_id = first_cp.facility_id
                    dest_fac_id = r_last.facility_id
                    if not dest_fac_id and last_cp.facility_id and self.resolver.is_facility_mode_compatible(last_cp.facility_id, service_data.transport_mode):
                        dest_fac_id = last_cp.facility_id

                # 2. Upsert TransportService
                service = self.db.query(TransportService).filter(
                    TransportService.provider_id == service_data.provider_id,
                    TransportService.service_code == service_data.service_code
                ).first()

                is_new = False
                if not service:
                    is_new = True
                    service_id = f"srv_{service_data.provider_id}_{service_data.service_code}".lower().replace("-", "_")
                    service = TransportService(
                        id=service_id,
                        provider_id=service_data.provider_id,
                        service_code=service_data.service_code,
                        service_name=service_data.service_name,
                        transport_mode=service_data.transport_mode,
                        origin_facility_id=origin_fac_id,
                        destination_facility_id=dest_fac_id,
                        data_state=service_data.data_state,
                        data_class=service_data.data_class,
                        is_active=True
                    )
                    self.db.add(service)
                    self.db.flush()
                    run.records_inserted += 1
                else:
                    service.service_name = service_data.service_name
                    service.origin_facility_id = origin_fac_id
                    service.destination_facility_id = dest_fac_id
                    service.data_state = service_data.data_state
                    service.data_class = service_data.data_class
                    run.records_updated += 1

                # 3. Upsert Calendar
                cal = self.db.query(TransportServiceCalendar).filter(TransportServiceCalendar.service_id == service.id).first()
                if not cal:
                    cal = TransportServiceCalendar(
                        id=f"cal_{service.id}",
                        service_id=service.id,
                        monday=service_data.calendar.get("monday", True),
                        tuesday=service_data.calendar.get("tuesday", True),
                        wednesday=service_data.calendar.get("wednesday", True),
                        thursday=service_data.calendar.get("thursday", True),
                        friday=service_data.calendar.get("friday", True),
                        saturday=service_data.calendar.get("saturday", True),
                        sunday=service_data.calendar.get("sunday", True)
                    )
                    self.db.add(cal)
                else:
                    cal.monday = service_data.calendar.get("monday", True)
                    cal.tuesday = service_data.calendar.get("tuesday", True)
                    cal.wednesday = service_data.calendar.get("wednesday", True)
                    cal.thursday = service_data.calendar.get("thursday", True)
                    cal.friday = service_data.calendar.get("friday", True)
                    cal.saturday = service_data.calendar.get("saturday", True)
                    cal.sunday = service_data.calendar.get("sunday", True)

                # 4. Replace/Upsert Calling Points
                self.db.query(TransportCallingPoint).filter(TransportCallingPoint.service_id == service.id).delete()
                for cp in service_data.calling_points:
                    res = self.resolver.resolve_stop(service_data.code_system, cp.provider_stop_code, cp.stop_name, mode=service_data.transport_mode)
                    fac_id = res.facility_id
                    if not fac_id and cp.facility_id and self.resolver.is_facility_mode_compatible(cp.facility_id, service_data.transport_mode):
                        fac_id = cp.facility_id
                    cp_id = f"cp_{service.id}_{cp.stop_sequence}"
                    new_cp = TransportCallingPoint(
                        id=cp_id,
                        service_id=service.id,
                        facility_id=fac_id,
                        provider_stop_code=cp.provider_stop_code,
                        stop_name=cp.stop_name,
                        stop_sequence=cp.stop_sequence,
                        arrival_time=cp.arrival_time,
                        departure_time=cp.departure_time,
                        day_offset=cp.day_offset,
                        pickup_type=cp.pickup_type,
                        dropoff_type=cp.dropoff_type
                    )
                    self.db.add(new_cp)

                # 5. Replace/Upsert Fares
                self.db.query(TransportFare).filter(TransportFare.service_id == service.id).delete()
                for idx, fare in enumerate(service_data.fares, start=1):
                    fare_id = f"fare_{service.id}_{idx}_{fare.fare_class}".lower().replace("-", "_")
                    new_fare = TransportFare(
                        id=fare_id,
                        service_id=service.id,
                        origin_facility_id=fare.origin_facility_id or origin_fac_id,
                        destination_facility_id=fare.destination_facility_id or dest_fac_id,
                        fare_class=fare.fare_class,
                        fare_status=fare.fare_status,
                        amount=fare.amount,
                        currency=fare.currency,
                        is_estimated=fare.is_estimated,
                        data_source=fare.data_source or source_record.attribution
                    )
                    self.db.add(new_fare)

                # 6. Upsert Transport Provenance
                prov = self.db.query(TransportProvenance).filter(
                    TransportProvenance.entity_type == "TransportService",
                    TransportProvenance.entity_id == service.id
                ).first()
                if not prov:
                    prov = TransportProvenance(
                        id=f"prov_{service.id}",
                        source_id=source_record.source_id,
                        entity_type="TransportService",
                        entity_id=service.id,
                        dataset_name=source_record.source_name,
                        dataset_url=source_record.source_url,
                        license=source_record.license,
                        attribution=source_record.attribution
                    )
                    self.db.add(prov)

            run.status = "SUCCESS"
            run.completed_at = datetime.now(timezone.utc)
            self.db.commit()

        except Exception as e:
            self.db.rollback()
            run.status = "FAILED"
            run.error_count += 1
            run.error_log = str(e)
            run.completed_at = datetime.now(timezone.utc)
            self.db.commit()
            raise e

        return run
