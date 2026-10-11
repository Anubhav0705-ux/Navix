from typing import List
from sqlalchemy.orm import Session

from app.transport_ingestion.manifest import TransportSourceManifest
from app.transport_ingestion.adapters.rail_adapter import RailProviderAdapter
from app.transport_ingestion.adapters.bus_adapter import BusProviderAdapter
from app.transport_ingestion.adapters.flight_adapter import FlightProviderAdapter
from app.transport_ingestion.loader import TransportLoader
from app.models.transport_platform import TransportIngestionRun


class TransportIngestionRunner:
    def __init__(self, db: Session, manifest_path: str = None):
        self.db = db
        self.manifest = TransportSourceManifest(manifest_path)
        self.loader = TransportLoader(db)

    def run_source(self, source_id: str, allow_contract_fixtures: bool = False) -> TransportIngestionRun:
        src = self.manifest.get_source(source_id)
        if not src:
            raise ValueError(f"Unknown transport source: {source_id}")

        if src.ingestion_status != "APPROVED":
            if not (allow_contract_fixtures and src.ingestion_status == "REQUIRES_LICENSE_REVIEW"):
                raise ValueError(f"Source {source_id} is not APPROVED for ingestion (Status: {src.ingestion_status})")

        # Pick adapter
        if src.access_method == "GTFS_ZIP_INGESTION" or src.format == "GTFS":
            import os
            from app.transport_ingestion.gtfs.adapter import GtfsProviderAdapter
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            gtfs_path = os.path.join(base_dir, "data", "transport", "gtfs", "dtc_delhi_gtfs.zip")
            adapter = GtfsProviderAdapter(
                feed_path=gtfs_path,
                provider_id="DTC_DELHI",
                provider_name="Delhi Transport Corporation",
                default_mode="BUS",
                data_class=src.data_class,
                resolver=self.loader.resolver
            )
        elif src.transport_mode == "RAIL":
            adapter = RailProviderAdapter()
        elif src.transport_mode == "BUS":
            adapter = BusProviderAdapter()
        elif src.transport_mode == "FLIGHT":
            adapter = FlightProviderAdapter()
        else:
            raise ValueError(f"No adapter available for transport mode: {src.transport_mode}")

        # Execute Pipeline
        raw_data = adapter.fetch()
        services = adapter.parse(raw_data)
        valid_services = adapter.validate(services)
        run = self.loader.load_services(src, valid_services)
        return run

    def run_all_approved(self) -> List[TransportIngestionRun]:
        runs = []
        approved_sources = self.manifest.list_approved_sources()
        for src in approved_sources:
            try:
                run = self.run_source(src.source_id)
                runs.append(run)
            except Exception as e:
                print(f"Ingestion failed for source {src.source_id}: {e}")
        return runs

    def run_contract_fixtures(self) -> List[TransportIngestionRun]:
        runs = []
        for src in self.manifest.sources.values():
            if src.ingestion_status == "REQUIRES_LICENSE_REVIEW":
                try:
                    run = self.run_source(src.source_id, allow_contract_fixtures=True)
                    runs.append(run)
                except Exception as e:
                    print(f"Contract fixture loading failed for source {src.source_id}: {e}")
        return runs
