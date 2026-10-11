from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.transport_platform import (
    TransportProvider, TransportService, TransportCallingPoint,
    TransportFare, TransportProvenance, TransportIngestionRun
)
from app.schemas.transport import (
    TransportProviderResponse, TransportServiceDetailResponse,
    CallingPointResponse, TransportFareResponse, FacilityDepartureResponse,
    SourceStatusResponse
)
from app.transport_ingestion.manifest import TransportSourceManifest


class TransportQueryService:
    def __init__(self, db: Session):
        self.db = db

    def list_providers(self, mode: Optional[str] = None) -> List[TransportProviderResponse]:
        query = self.db.query(TransportProvider)
        if mode:
            query = query.filter(TransportProvider.transport_mode == mode.upper())
        providers = query.all()
        return [TransportProviderResponse.model_validate(p) for p in providers]

    def list_services(self, mode: Optional[str] = None, origin_facility_id: Optional[str] = None, destination_facility_id: Optional[str] = None, limit: int = 20) -> List[TransportServiceDetailResponse]:
        query = self.db.query(TransportService).filter(TransportService.is_active == True)
        if mode:
            query = query.filter(TransportService.transport_mode == mode.upper())
        if origin_facility_id:
            query = query.filter(TransportService.origin_facility_id == origin_facility_id)
        if destination_facility_id:
            query = query.filter(TransportService.destination_facility_id == destination_facility_id)

        query = query.limit(max(1, min(limit, 100)))
        services = query.all()

        results = []
        for s in services:
            prov = self.db.query(TransportProvenance).filter(
                TransportProvenance.entity_type == "TransportService",
                TransportProvenance.entity_id == s.id
            ).first()

            cp_responses = [CallingPointResponse.model_validate(cp) for cp in s.calling_points]
            fare_responses = [TransportFareResponse.model_validate(f) for f in s.fares]

            results.append(TransportServiceDetailResponse(
                id=s.id,
                provider_id=s.provider_id,
                provider_name=s.provider.name if s.provider else "Unknown Provider",
                service_code=s.service_code,
                service_name=s.service_name,
                transport_mode=s.transport_mode,
                origin_facility_id=s.origin_facility_id,
                destination_facility_id=s.destination_facility_id,
                data_state=s.data_state,
                data_class=s.data_class,
                is_active=s.is_active,
                calling_points=cp_responses,
                fares=fare_responses,
                license=prov.license if prov else "GODL-India",
                attribution=prov.attribution if prov else "Official Public Transport Feed"
            ))
        return results

    def get_service_detail(self, service_id: str) -> Optional[TransportServiceDetailResponse]:
        s = self.db.query(TransportService).filter(TransportService.id == service_id).first()
        if not s:
            return None

        prov = self.db.query(TransportProvenance).filter(
            TransportProvenance.entity_type == "TransportService",
            TransportProvenance.entity_id == s.id
        ).first()

        cp_responses = [CallingPointResponse.model_validate(cp) for cp in s.calling_points]
        fare_responses = [TransportFareResponse.model_validate(f) for f in s.fares]

        return TransportServiceDetailResponse(
            id=s.id,
            provider_id=s.provider_id,
            provider_name=s.provider.name if s.provider else "Unknown Provider",
            service_code=s.service_code,
            service_name=s.service_name,
            transport_mode=s.transport_mode,
            origin_facility_id=s.origin_facility_id,
            destination_facility_id=s.destination_facility_id,
            data_state=s.data_state,
            data_class=s.data_class,
            is_active=s.is_active,
            calling_points=cp_responses,
            fares=fare_responses,
            license=prov.license if prov else "GODL-India",
            attribution=prov.attribution if prov else "Official Public Transport Feed"
        )

    def get_facility_departures(self, facility_id: str, limit: int = 20) -> List[FacilityDepartureResponse]:
        # Query calling points matching facility_id
        cps = self.db.query(TransportCallingPoint).filter(
            TransportCallingPoint.facility_id == facility_id
        ).limit(max(1, min(limit, 100))).all()

        departures = []
        for cp in cps:
            s = cp.service
            if not s:
                continue

            # Find last calling point to determine destination
            last_cp = self.db.query(TransportCallingPoint).filter(
                TransportCallingPoint.service_id == s.id
            ).order_by(TransportCallingPoint.stop_sequence.desc()).first()

            dest_name = last_cp.stop_name if last_cp else "Unknown Destination"
            dest_fac_id = last_cp.facility_id if last_cp else None

            sample_fare = s.fares[0].amount if s.fares else None

            departures.append(FacilityDepartureResponse(
                service_id=s.id,
                service_code=s.service_code,
                service_name=s.service_name,
                provider_name=s.provider.name if s.provider else "Unknown Provider",
                transport_mode=s.transport_mode,
                departure_time=cp.departure_time,
                destination_facility_id=dest_fac_id,
                destination_stop_name=dest_name,
                data_state=s.data_state,
                fare_sample=float(sample_fare) if sample_fare is not None else None
            ))
        return departures

    def get_source_statuses(self) -> List[SourceStatusResponse]:
        manifest = TransportSourceManifest()
        statuses = []
        for src in manifest.sources.values():
            last_run = self.db.query(TransportIngestionRun).filter(
                TransportIngestionRun.source_id == src.source_id
            ).order_by(TransportIngestionRun.started_at.desc()).first()

            statuses.append(SourceStatusResponse(
                source_id=src.source_id,
                transport_mode=src.transport_mode,
                operator_name=src.operator_name,
                source_name=src.source_name,
                license=src.license,
                ingestion_status=src.ingestion_status,
                last_run_status=last_run.status if last_run else "NEVER_RUN",
                records_read=last_run.records_read if last_run else 0,
                records_inserted=last_run.records_inserted if last_run else 0,
                attribution=src.attribution
            ))
        return statuses
