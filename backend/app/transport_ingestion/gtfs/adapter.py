from typing import List, Dict, Any, Optional
from collections import defaultdict

from app.transport_ingestion.contracts import (
    BaseProviderAdapter, NormalizedService, NormalizedCallingPoint, NormalizedFare
)
from app.transport_ingestion.gtfs.parser import GtfsScheduleParser, GtfsFeedData
from app.transport_ingestion.resolver import LocationResolver


class GtfsProviderAdapter(BaseProviderAdapter):
    """
    Adapter converting GTFS Schedule feeds into NAVIX NormalizedService records.
    """
    ROUTE_TYPE_MODE_MAP = {
        0: "LOCAL_TRANSIT",  # Tram, Streetcar, Light rail
        1: "METRO",          # Subway, Metro
        2: "RAIL",           # Rail
        3: "BUS",            # Bus
        4: "FERRY",          # Ferry
        5: "CABLE_TRAM",     # Cable tram
        6: "AERIAL_LIFT",    # Aerial lift
        7: "FUNICULAR",      # Funicular
        11: "TROLLEYBUS",    # Trolleybus
        12: "MONORAIL",      # Monorail
    }

    def __init__(
        self,
        feed_path: str,
        provider_id: str = "DTC_DELHI",
        provider_name: str = "Delhi Transport Corporation",
        default_mode: str = "BUS",
        data_class: str = "SYNTHETIC_CONTRACT_FIXTURE",
        resolver: Optional[LocationResolver] = None
    ):
        self.feed_path = feed_path
        self.provider_id = provider_id
        self.provider_name = provider_name
        self.default_mode = default_mode
        self.data_class = data_class
        self.resolver = resolver

    def fetch(self) -> GtfsFeedData:
        parser = GtfsScheduleParser(self.feed_path)
        return parser.parse()

    def parse(self, raw_data: Optional[GtfsFeedData] = None) -> List[NormalizedService]:
        if raw_data is None:
            raw_data = self.fetch()
        feed = raw_data
        routes_by_id = {r["route_id"]: r for r in feed.routes}
        stops_by_id = {s["stop_id"]: s for s in feed.stops}

        calendars_by_id = {}
        for cal in feed.calendars:
            s_id = cal.get("service_id")
            if s_id:
                calendars_by_id[s_id] = {
                    "monday": cal.get("monday") == "1",
                    "tuesday": cal.get("tuesday") == "1",
                    "wednesday": cal.get("wednesday") == "1",
                    "thursday": cal.get("thursday") == "1",
                    "friday": cal.get("friday") == "1",
                    "saturday": cal.get("saturday") == "1",
                    "sunday": cal.get("sunday") == "1",
                }

        # Group stop times by trip_id
        stop_times_by_trip = defaultdict(list)
        for st in feed.stop_times:
            stop_times_by_trip[st["trip_id"]].append(st)

        services = []
        for trip in feed.trips:
            trip_id = trip["trip_id"]
            route_id = trip["route_id"]
            service_id = trip.get("service_id", "")
            route = routes_by_id.get(route_id, {})

            route_type = int(route.get("route_type", 3))
            mode = self.ROUTE_TYPE_MODE_MAP.get(route_type, self.default_mode)

            service_code = f"{self.provider_id}_{trip_id}"
            short_name = route.get("route_short_name") or route_id
            long_name = route.get("route_long_name") or trip.get("trip_headsign") or "Transit Service"
            service_name = f"{short_name} - {long_name}".strip(" -")

            cal_mask = calendars_by_id.get(service_id, {
                "monday": True, "tuesday": True, "wednesday": True, "thursday": True,
                "friday": True, "saturday": True, "sunday": True
            })

            # Sort stop times by sequence
            trip_st_list = sorted(stop_times_by_trip[trip_id], key=lambda x: x["stop_sequence"])
            calling_points = []
            for st in trip_st_list:
                s_info = stops_by_id.get(st["stop_id"], {})
                stop_name = s_info.get("stop_name") or st["stop_id"]
                stop_code = s_info.get("stop_code") or st["stop_id"]

                fac_id = None
                if self.resolver:
                    res = self.resolver.resolve_stop(
                        self.provider_id,
                        stop_code,
                        stop_name,
                        mode=mode
                    )
                    fac_id = res.facility_id

                calling_points.append(NormalizedCallingPoint(
                    provider_stop_code=stop_code,
                    stop_name=stop_name,
                    facility_id=fac_id,
                    stop_sequence=st["stop_sequence"],
                    arrival_time=st["arrival_time"],
                    departure_time=st["departure_time"],
                    day_offset=st["day_offset"],
                    pickup_type=st["pickup_type"],
                    dropoff_type=st["drop_off_type"]
                ))

            # Fares for GTFS: if not explicitly provided in feed, set amount=None, fare_status="NOT_PROVIDED"
            fares = [NormalizedFare(
                fare_class="STANDARD",
                fare_status="NOT_PROVIDED",
                amount=None,
                currency="INR",
                is_estimated=False,
                data_source=f"{self.provider_id}_GTFS"
            )]

            # Calendar dates exceptions for this service
            trip_cal_dates = [
                {
                    "exception_date": cd["date"],
                    "exception_type": int(cd.get("exception_type", 1))
                }
                for cd in feed.calendar_dates
                if cd.get("service_id") == service_id
            ]

            services.append(NormalizedService(
                service_code=service_code,
                service_name=service_name,
                provider_id=self.provider_id,
                provider_name=self.provider_name,
                operator_name=self.provider_name,
                code_system="GTFS",
                transport_mode=mode,
                data_state="ESTIMATED",
                data_class=self.data_class,
                calendar=cal_mask,
                calendar_dates=trip_cal_dates,
                calling_points=calling_points,
                fares=fares,
                availabilities=[]
            ))

        return services

    def validate(self, services: List[NormalizedService]) -> List[NormalizedService]:
        validated = []
        for s in services:
            if not s.calling_points or len(s.calling_points) < 2:
                continue
            # Ensure calling points are sequential
            seqs = [cp.stop_sequence for cp in s.calling_points]
            if seqs != sorted(seqs):
                continue
            validated.append(s)
        return validated
