import sys
import argparse
from app.database.session import SessionLocal
from app.transport_ingestion.runner import TransportIngestionRunner


def main():
    parser = argparse.ArgumentParser(description="NAVIX Transport Platform Data Ingestion CLI")
    subparsers = parser.add_subparsers(dest="command", help="Command to execute")

    # Seed command
    seed_parser = subparsers.add_parser("seed", help="Ingest all approved real transport datasets into database")
    seed_parser.add_argument("--include-fixtures", action="store_true", help="Also ingest schema testing contract fixtures (bus, flight)")

    # Source command
    src_parser = subparsers.add_parser("source", help="Ingest a specific transport source by source_id")
    src_parser.add_argument("--id", required=True, help="Transport source ID (e.g. ind_railways_open_timetable)")
    src_parser.add_argument("--allow-contract-fixtures", action="store_true", help="Allow ingestion of contract test fixture sources")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    db = SessionLocal()
    try:
        runner = TransportIngestionRunner(db)
        if args.command == "seed":
            print("Starting transport platform ingestion seed for all APPROVED sources...")
            runs = runner.run_all_approved()
            for r in runs:
                print(f"[{r.source_id}] Status: {r.status} | Read: {r.records_read} | Inserted: {r.records_inserted} | Updated: {r.records_updated}")
            
            if args.include_fixtures:
                print("Ingesting schema testing contract fixtures (bus, flight)...")
                fixture_runs = runner.run_contract_fixtures()
                for r in fixture_runs:
                    print(f"[{r.source_id}] Status: {r.status} | Read: {r.records_read} | Inserted: {r.records_inserted} | Updated: {r.records_updated}")
            print("Transport platform seed complete.")

        elif args.command == "source":
            print(f"Starting transport ingestion for source: {args.id}...")
            r = runner.run_source(args.id, allow_contract_fixtures=args.allow_contract_fixtures)
            print(f"[{r.source_id}] Status: {r.status} | Read: {r.records_read} | Inserted: {r.records_inserted} | Updated: {r.records_updated}")
            print("Source ingestion complete.")

    finally:
        db.close()


if __name__ == "__main__":
    main()
