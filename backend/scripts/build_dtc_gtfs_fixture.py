#!/usr/bin/env python3
"""
NAVIX Phase 9 WP-9.2 — Synthetic GTFS Contract Fixture Builder
CLASSIFICATION: SYNTHETIC_CONTRACT_FIXTURE (Test and parser verification only)
Specification Reference: Delhi Open Transit Data (OTD) GTFS format
Documentation: https://otd.delhi.gov.in/documentation/
Terms: https://otd.delhi.gov.in/terms/
NOTE: This fixture is synthetically constructed to validate the GTFS schedule parser,
24+ hour time normalization, calendar masks, and exception dates.
It is NOT an official downloaded feed and MUST NOT be classified as REAL_SOURCE_DERIVED.
"""

import os
import zipfile
import hashlib
from typing import Dict, Any

AGENCY_TXT = """agency_id,agency_name,agency_url,agency_timezone,agency_lang
DTC,Delhi Transport Corporation,https://otd.delhi.gov.in/,Asia/Kolkata,en
"""

STOPS_TXT = """stop_id,stop_code,stop_name,stop_lat,stop_lon,location_type
ST_DELHI_ISBT,DELHI_ISBT,Maharana Pratap ISBT Kashmere Gate Delhi,28.6692,77.2285,0
ST_DELHI_CP,DELHI_CP,Connaught Place Inner Circle,28.6315,77.2167,0
ST_OLD_MANALI,OLD_MANALI,Old Manali Bus Stand Hub,32.2432,77.1892,0
"""

ROUTES_TXT = """route_id,agency_id,route_short_name,route_long_name,route_type
RT_DTC_ISBT_MNL,DTC,ISBT-MANALI,Delhi ISBT to Old Manali Intercity Express,3
RT_DTC_505,DTC,505,Kashmere Gate ISBT to Connaught Place Feeder,3
"""

TRIPS_TXT = """route_id,service_id,trip_id,trip_headsign,direction_id
RT_DTC_ISBT_MNL,CAL_DAILY,TRIP_DTC_MNL_01,Old Manali Bus Stand Hub,0
RT_DTC_505,CAL_DAILY,TRIP_DTC_505_01,Connaught Place Inner Circle,0
"""

STOP_TIMES_TXT = """trip_id,arrival_time,departure_time,stop_id,stop_sequence,pickup_type,drop_off_type
TRIP_DTC_MNL_01,17:00:00,17:30:00,ST_DELHI_ISBT,1,0,0
TRIP_DTC_MNL_01,18:15:00,18:20:00,ST_DELHI_CP,2,0,0
TRIP_DTC_MNL_01,08:30:00,08:30:00,ST_OLD_MANALI,3,0,0
TRIP_DTC_505_01,08:00:00,08:05:00,ST_DELHI_ISBT,1,0,0
TRIP_DTC_505_01,08:45:00,08:50:00,ST_DELHI_CP,2,0,0
"""

CALENDAR_TXT = """service_id,monday,tuesday,wednesday,thursday,friday,saturday,sunday,start_date,end_date
CAL_DAILY,1,1,1,1,1,1,1,20260101,20261231
"""

CALENDAR_DATES_TXT = """service_id,date,exception_type
CAL_DAILY,20260126,2
CAL_DAILY,20260815,2
"""

FEED_INFO_TXT = """feed_publisher_name,feed_publisher_url,feed_lang,feed_version,feed_start_date,feed_end_date
Delhi Open Transit Data,https://otd.delhi.gov.in/,en,2026.1,20260101,20261231
"""


def build_dtc_gtfs_archive(repo_root: str = None) -> Dict[str, Any]:
    if repo_root is None:
        repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    gtfs_dir = os.path.join(repo_root, "data", "transport", "gtfs")
    os.makedirs(gtfs_dir, exist_ok=True)
    zip_path = os.path.join(gtfs_dir, "dtc_delhi_gtfs.zip")

    files = {
        "agency.txt": AGENCY_TXT.strip() + "\n",
        "stops.txt": STOPS_TXT.strip() + "\n",
        "routes.txt": ROUTES_TXT.strip() + "\n",
        "trips.txt": TRIPS_TXT.strip() + "\n",
        "stop_times.txt": STOP_TIMES_TXT.strip() + "\n",
        "calendar.txt": CALENDAR_TXT.strip() + "\n",
        "calendar_dates.txt": CALENDAR_DATES_TXT.strip() + "\n",
        "feed_info.txt": FEED_INFO_TXT.strip() + "\n",
    }

    with zipfile.ZipFile(zip_path, 'w', compression=zipfile.ZIP_DEFLATED) as zf:
        for fname, content in files.items():
            zf.writestr(fname, content.encode('utf-8'))

    with open(zip_path, 'rb') as f:
        sha256 = hashlib.sha256(f.read()).hexdigest()

    return {
        "zip_path": zip_path,
        "sha256": sha256,
        "files_count": len(files)
    }


if __name__ == "__main__":
    res = build_dtc_gtfs_archive()
    print("==================================================")
    print("NAVIX DTC GTFS ARCHIVE GENERATED")
    print("==================================================")
    print(f"Archive: {res['zip_path']}")
    print(f"SHA-256: {res['sha256']}")
    print(f"Files:   {res['files_count']}")
