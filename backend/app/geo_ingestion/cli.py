import argparse
import sys
import json
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.geo_ingestion.runner import run_national_ingestion
from app.geo_ingestion.manifest import load_source_manifest


def main():
    parser = argparse.ArgumentParser(description="NAVIX Phase 8 Geographic Ingestion CLI")
    subparsers = parser.add_subparsers(dest="command", help="Sub-commands")

    # Ingest command
    ingest_parser = subparsers.add_parser("ingest", help="Run national geographic ingestion pipeline")
    ingest_parser.add_argument("--db-url", type=str, required=False, help="Database connection URL")
    ingest_parser.add_argument("--dry-run", action="store_true", help="Perform validation and reporting without modifying database")
    ingest_parser.add_argument("--limit", type=int, default=None, help="Limit number of records for testing")
    ingest_parser.add_argument("--data-file", type=str, default=None, help="Custom json data file path")

    # Validate command
    subparsers.add_parser("validate", help="Validate source manifest and raw dataset files")

    # Report command
    subparsers.add_parser("report", help="Print geographic source manifest report")

    args = parser.parse_args()

    if args.command == "report":
        manifest = load_source_manifest()
        print(json.dumps(manifest.model_dump(), indent=2))
        sys.exit(0)

    elif args.command == "validate":
        manifest = load_source_manifest()
        print(f"Source manifest version {manifest.version} validated successfully.")
        print(f"Approved datasets: {len(manifest.datasets)}")
        print(f"Blocked sources: {len(manifest.blocked_sources)}")
        sys.exit(0)

    elif args.command == "ingest":
        db_url = args.db_url or os.getenv("DATABASE_URL")
        if not db_url:
            print("Error: --db-url parameter or DATABASE_URL environment variable is required.", file=sys.stderr)
            sys.exit(1)

        engine = create_engine(db_url)
        SessionLocal = sessionmaker(bind=engine)

        with SessionLocal() as session:
            res = run_national_ingestion(
                session=session,
                data_file_path=args.data_file,
                dry_run=args.dry_run,
                limit=args.limit
            )
            if not args.dry_run:
                session.commit()

        print(json.dumps(res, indent=2))
        sys.exit(0)

    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
