from typing import List, Optional, Dict, Any
from datetime import datetime, date, timezone
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func

from app.models.transport_platform import (
    TransportProvider, TransportService, TransportCallingPoint,
    TransportFare, TransportProvenance, TransportIngestionRun,
    TransportServiceCalendar, TransportCalendarDate,
    TransportServiceAlert, TransportRealtimeObservation
)
from app.models.geo_transit import TransitFacility
from app.models.geo_settlement import Settlement
from app.schemas.transport import (
    TransportProviderResponse, TransportServiceDetailResponse,
    CallingPointResponse, TransportFareResponse, FacilityDepartureResponse,
    FacilityArrivalResponse, SourceStatusResponse, TransportSearchServiceCard,
    TransportStopDetail, TransportSearchResult, SourceCoverageResponse,
    AdminRefreshResponse
)
from app.transport_ingestion.manifest import TransportSourceManifest
from app.transport_ingestion.refresh import TransportRefreshManager


def _parse_time_to_minutes(time_str: str) -> int:
    parts = time_str.split(":")
    return int(parts[0]) * 60 + int(parts[1])


class TransportQueryService:
    def __init__(self, db: Session):
        self.db = db

    def list_providers(self, mode: Optional[str] = None) -> List[TransportProviderResponse]:
        query = self.db.query(TransportProvider)
        if mode:
            query = query.filter(TransportProvider.transport_mode == mode.upper())
        providers = query.all()
        return [TransportProviderResponse.model_validate(p) for p in providers]

    def list_services(
        self,
        mode: Optional[str] = None,
        origin_facility_id: Optional[str] = None,
        destination_facility_id: Optional[str] = None,
        exclude_synthetic: bool = False,
        limit: int = 20
    ) -> List[TransportServiceDetailResponse]:
        query = self.db.query(TransportService).filter(TransportService.is_active == True)
        if mode:
            query = query.filter(TransportService.transport_mode == mode.upper())
        if origin_facility_id:
            query = query.filter(TransportService.origin_facility_id == origin_facility_id)
        if destination_facility_id:
            query = query.filter(TransportService.destination_facility_id == destination_facility_id)
        if exclude_synthetic:
            query = query.filter(TransportService.data_class == "REAL_SOURCE_DERIVED")

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

    def search_schedules(
        self,
        origin_facility_id: str,
        destination_facility_id: str,
        travel_date_str: Optional[str] = None,
        mode: Optional[str] = None,
        provider_id: Optional[str] = None,
        exclude_synthetic: bool = True,
        limit: int = 20,
        offset: int = 0
    ) -> TransportSearchResult:
        """
        Unified Multi-Modal Schedule Search between two canonical facilities.
        Rules:
        1. Both origin and destination must exist as calling points on the same service.
        2. Sequence order: origin.stop_sequence < destination.stop_sequence (rejects reverse direction).
        3. Excludes synthetic fixtures by default (unless exclude_synthetic=False).
        4. Date-aware calendar evaluation with calendar_dates exceptions.
        5. Calculates accurate duration across midnight crossings.
        """
        # Resolve facility or settlement IDs to sets of matching facility IDs
        orig_fac_ids = [origin_facility_id]
        origin_name = origin_facility_id
        if origin_facility_id.startswith("set_"):
            settlement = self.db.query(Settlement).filter(Settlement.settlement_id == origin_facility_id).first()
            if settlement:
                origin_name = settlement.name
            facs = self.db.query(TransitFacility.facility_id).filter(TransitFacility.settlement_id == origin_facility_id).all()
            if facs:
                orig_fac_ids = [f[0] for f in facs]
        else:
            origin_fac = self.db.query(TransitFacility).filter(TransitFacility.facility_id == origin_facility_id).first()
            if origin_fac:
                origin_name = origin_fac.name

        dest_fac_ids = [destination_facility_id]
        dest_name = destination_facility_id
        if destination_facility_id.startswith("set_"):
            settlement = self.db.query(Settlement).filter(Settlement.settlement_id == destination_facility_id).first()
            if settlement:
                dest_name = settlement.name
            facs = self.db.query(TransitFacility.facility_id).filter(TransitFacility.settlement_id == destination_facility_id).all()
            if facs:
                dest_fac_ids = [f[0] for f in facs]
        else:
            dest_fac = self.db.query(TransitFacility).filter(TransitFacility.facility_id == destination_facility_id).first()
            if dest_fac:
                dest_name = dest_fac.name

        # Query services that call at origin
        origin_cps = self.db.query(TransportCallingPoint).filter(
            TransportCallingPoint.facility_id.in_(orig_fac_ids)
        ).all()

        service_ids = {cp.service_id for cp in origin_cps}
        if not service_ids:
            return TransportSearchResult(
                origin_facility_id=origin_facility_id,
                destination_facility_id=destination_facility_id,
                travel_date=travel_date_str,
                total_services_found=0,
                services=[]
            )

        # Query matching destination calling points on those services
        dest_cps = self.db.query(TransportCallingPoint).filter(
            TransportCallingPoint.service_id.in_(service_ids),
            TransportCallingPoint.facility_id.in_(dest_fac_ids)
        ).all()

        dest_cp_map = {cp.service_id: cp for cp in dest_cps}
        origin_cp_map = {cp.service_id: cp for cp in origin_cps}

        # Parse travel date if supplied
        parsed_date: Optional[date] = None
        target_weekday: Optional[str] = None
        if travel_date_str:
            try:
                parsed_date = date.fromisoformat(travel_date_str)
                weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
                target_weekday = weekdays[parsed_date.weekday()]
            except ValueError:
                parsed_date = None

        service_cards: List[TransportSearchServiceCard] = []

        for s_id, dest_cp in dest_cp_map.items():
            orig_cp = origin_cp_map.get(s_id)
            if not orig_cp:
                continue

            # CRITICAL ENFORCEMENT: Origin MUST precede destination in stop sequence!
            if orig_cp.stop_sequence >= dest_cp.stop_sequence:
                continue  # Reject impossible reverse-direction journeys

            srv = self.db.query(TransportService).filter(TransportService.id == s_id).first()
            if not srv or not srv.is_active:
                continue

            # Filter by mode
            if mode and srv.transport_mode != mode.upper():
                continue

            # Filter by provider
            if provider_id and srv.provider_id != provider_id:
                continue

            # Data class isolation: exclude synthetic from default consumer queries
            if exclude_synthetic and srv.data_class != "REAL_SOURCE_DERIVED":
                continue

            # Evaluate service calendar
            operates_on_date = True
            is_expired = False
            cal = srv.calendar
            if cal and parsed_date and target_weekday:
                # Check feed expiry
                if cal.end_date and parsed_date > cal.end_date:
                    is_expired = True

                # Check weekday mask
                weekday_runs = getattr(cal, target_weekday, True)

                # Check calendar_dates exceptions
                exception = self.db.query(TransportCalendarDate).filter(
                    TransportCalendarDate.service_id == s_id,
                    TransportCalendarDate.exception_date == parsed_date
                ).first()

                if exception:
                    if exception.exception_type == 2:  # Removed
                        operates_on_date = False
                    elif exception.exception_type == 1:  # Added
                        operates_on_date = True
                else:
                    operates_on_date = weekday_runs

            # Intermediate calling points between origin and destination
            all_cps = sorted(srv.calling_points, key=lambda c: c.stop_sequence)
            intermediate = [
                TransportStopDetail(
                    stop_sequence=cp.stop_sequence,
                    facility_id=cp.facility_id,
                    stop_name=cp.stop_name,
                    arrival_time=cp.arrival_time,
                    departure_time=cp.departure_time,
                    day_offset=cp.day_offset
                )
                for cp in all_cps
                if orig_cp.stop_sequence <= cp.stop_sequence <= dest_cp.stop_sequence
            ]

            # Calculate duration in minutes accounting for day_offset
            dep_mins = _parse_time_to_minutes(orig_cp.departure_time)
            arr_mins = _parse_time_to_minutes(dest_cp.arrival_time)
            net_day_offset = max(0, dest_cp.day_offset - orig_cp.day_offset)
            total_duration = (arr_mins + net_day_offset * 1440) - dep_mins
            if total_duration < 0:
                total_duration += 1440

            # Provenance
            prov = self.db.query(TransportProvenance).filter(
                TransportProvenance.entity_type == "TransportService",
                TransportProvenance.entity_id == srv.id
            ).first()

            # Active alerts & Realtime delay
            obs = self.db.query(TransportRealtimeObservation).filter(
                TransportRealtimeObservation.service_id == srv.id
            ).order_by(TransportRealtimeObservation.observed_at.desc()).first()

            delay_secs = obs.delay_seconds if (obs and not obs.is_stale) else 0

            alerts_count = self.db.query(TransportServiceAlert).filter(
                TransportServiceAlert.service_id == srv.id
            ).count()

            # Fares
            fare_responses = [TransportFareResponse.model_validate(f) for f in srv.fares]
            primary_fare_status = srv.fares[0].fare_status if srv.fares else "NOT_PROVIDED"

            service_cards.append(TransportSearchServiceCard(
                service_id=srv.id,
                service_code=srv.service_code,
                service_name=srv.service_name,
                provider_id=srv.provider_id,
                provider_name=srv.provider.name if srv.provider else "Unknown Provider",
                operator_name=srv.provider.operator_name if srv.provider else None,
                transport_mode=srv.transport_mode,
                origin_facility_id=origin_facility_id,
                origin_facility_name=origin_name,
                destination_facility_id=destination_facility_id,
                destination_facility_name=dest_name,
                departure_time=orig_cp.departure_time,
                arrival_time=dest_cp.arrival_time,
                duration_minutes=total_duration,
                day_offset=net_day_offset,
                intermediate_stops_count=max(0, len(intermediate) - 2),
                intermediate_stops=intermediate,
                fares=fare_responses,
                fare_status=primary_fare_status,
                availability_status="NOT_PROVIDED",
                data_state=srv.data_state,
                data_class=srv.data_class,
                is_expired=is_expired,
                operates_on_selected_date=operates_on_date,
                delay_seconds=delay_secs,
                active_alerts_count=alerts_count,
                license=prov.license if prov else "GODL-India",
                attribution=prov.attribution if prov else "Official Open Transport Feed"
            ))

        # Sort by departure time
        service_cards.sort(key=lambda sc: sc.departure_time)
        total_found = len(service_cards)

        paged_cards = service_cards[offset: offset + limit]

        return TransportSearchResult(
            origin_facility_id=origin_facility_id,
            destination_facility_id=destination_facility_id,
            travel_date=travel_date_str,
            total_services_found=total_found,
            services=paged_cards
        )

    def get_facility_departures(self, facility_id: str, limit: int = 20) -> List[FacilityDepartureResponse]:
        cps = self.db.query(TransportCallingPoint).filter(
            TransportCallingPoint.facility_id == facility_id
        ).limit(max(1, min(limit, 100))).all()

        departures = []
        for cp in cps:
            s = cp.service
            if not s:
                continue

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

    def get_facility_arrivals(self, facility_id: str, limit: int = 20) -> List[FacilityArrivalResponse]:
        cps = self.db.query(TransportCallingPoint).filter(
            TransportCallingPoint.facility_id == facility_id
        ).limit(max(1, min(limit, 100))).all()

        arrivals = []
        for cp in cps:
            s = cp.service
            if not s:
                continue

            first_cp = self.db.query(TransportCallingPoint).filter(
                TransportCallingPoint.service_id == s.id
            ).order_by(TransportCallingPoint.stop_sequence.asc()).first()

            orig_name = first_cp.stop_name if first_cp else "Unknown Origin"
            orig_fac_id = first_cp.facility_id if first_cp else None

            arrivals.append(FacilityArrivalResponse(
                service_id=s.id,
                service_code=s.service_code,
                service_name=s.service_name,
                provider_name=s.provider.name if s.provider else "Unknown Provider",
                transport_mode=s.transport_mode,
                arrival_time=cp.arrival_time,
                origin_facility_id=orig_fac_id,
                origin_stop_name=orig_name,
                data_state=s.data_state,
                day_offset=cp.day_offset
            ))
        return arrivals

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

    def get_source_coverage(self) -> SourceCoverageResponse:
        total_services = self.db.query(TransportService).count()
        verified_services = self.db.query(TransportService).filter(
            TransportService.data_class == "REAL_SOURCE_DERIVED"
        ).count()
        synthetic_fixtures = self.db.query(TransportService).filter(
            TransportService.data_class == "SYNTHETIC_CONTRACT_FIXTURE"
        ).count()

        modes_breakdown = {}
        for m in ["RAIL", "BUS", "FLIGHT", "METRO"]:
            modes_breakdown[m] = self.db.query(TransportService).filter(
                TransportService.transport_mode == m
            ).count()

        total_cps = self.db.query(TransportCallingPoint).count()
        resolved_facs = self.db.query(
            func.count(func.distinct(TransportCallingPoint.facility_id))
        ).filter(TransportCallingPoint.facility_id.isnot(None)).scalar() or 0

        quarantined_stops = self.db.query(TransportCallingPoint).filter(
            TransportCallingPoint.quarantined_reason.isnot(None)
        ).count()

        manifest = TransportSourceManifest()
        total_sources = len(manifest.sources)
        approved_sources = len(manifest.list_approved_sources())
        active_providers = self.db.query(TransportProvider).count()

        return SourceCoverageResponse(
            total_services=total_services,
            verified_services_count=verified_services,
            synthetic_fixtures_count=synthetic_fixtures,
            modes_breakdown=modes_breakdown,
            total_calling_points=total_cps,
            resolved_facilities_count=resolved_facs,
            quarantined_stops_count=quarantined_stops,
            total_sources=total_sources,
            approved_sources_count=approved_sources,
            active_providers_count=active_providers
        )

    def admin_refresh_source(self, source_id: str) -> AdminRefreshResponse:
        refresh_mgr = TransportRefreshManager(self.db)
        res = refresh_mgr.run_refresh(source_id)
        return AdminRefreshResponse(
            source_id=source_id,
            status=res.get("status", "FAILED"),
            records_updated=res.get("records_updated", 0),
            records_inserted=res.get("records_inserted", 0),
            message=res.get("message") or res.get("error")
        )
