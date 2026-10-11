# NAVIX — TRANSPORT DATA SOURCE REGISTRY
## Comprehensive Source Discovery, Provenance Audit, Licensing Matrix & Data Classification
**Phase**: Phase 9 WP-9.1 (Data-Integrity & Provenance Repair Gate)  
**Status**: DEFINITIVE VERIFIED AUDIT  
**Audit Date**: October 2026  

---

## 1. Executive Overview & Data Ethics Policy

NAVIX operates as an algorithmic, budget-first multi-modal travel platform across India. In strict compliance with the **NAVIX Transport Data Provenance and Legal Ethics Policy**:
1. All ingested transport data originates either from official government open-data portals with confirmed open redistribution licenses, or is strictly segregated as parser/schema contract test fixtures.
2. Authentication bypass, private endpoint reverse-engineering, CAPTCHA circumvention, and scraper evasion are **strictly prohibited**.
3. **Truth in Data**: NAVIX never fabricates, estimates without disclosure, or mislabels data states. Historical static open datasets are labeled `STATIC` or `STALE`—never `LIVE`. Unprovided fares are recorded as `amount = null` and `fare_status = "NOT_PROVIDED"`, and rendered in the UI as **"Fare unavailable"** rather than ₹0 or fabricated prices.

---

## 2. Three Distinct Data Classes

| Data Class | Definition | Application | UI / System Handling |
| :--- | :--- | :--- | :--- |
| `REAL_SOURCE_DERIVED` | Ingested directly from official, permitted public open datasets with verified provenance and redistribution rights. | Indian Railways OGD Timetable Feed | Displayed with publisher attribution, `STATIC` freshness badge, and license tags. |
| `SYNTHETIC_CONTRACT_FIXTURE` | Synthetically modeled or contract-derived records used strictly for parser verification, schema contracts, and CI testing. | Intercity bus & domestic flight multi-modal fixtures | Explicitly tagged with indigo `SYNTHETIC CONTRACT FIXTURE` badge. License review pending. |
| `LEGACY_DEMO` | Pre-Phase-9 demo examples used for algorithmic baseline testing. | Legacy demo routes & nodes | Completely segregated from verified transport platform models. |

---

## 3. Definitive Source Registry Matrix

| Source ID | Transport Mode | Publisher / Authority | Operator | Exact Source URL | License | Redistribution Allowed | Data State | Approval Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `ind_railways_open_timetable` | `RAIL` | Ministry of Railways, Government of India | Indian Railways | [data.gov.in/catalog/indian-railways-train-time-table](https://www.data.gov.in/catalog/indian-railways-train-time-table) | `GODL-India` | **Yes** | `STATIC` | **APPROVED** |
| `msrtc_intercity_schedules` | `BUS` | Maharashtra State Road Transport Corporation | MSRTC | [msrtc.maharashtra.gov.in](https://msrtc.maharashtra.gov.in/) | `PROPRIETARY_UNVERIFIED` | **No** | `STATIC` | **REQUIRES_LICENSE_REVIEW** |
| `dgca_domestic_flight_schedules` | `FLIGHT` | Directorate General of Civil Aviation, India | Air India / IndiGo / DGCA | [www.dgca.gov.in](https://www.dgca.gov.in/) | `PROPRIETARY_UNVERIFIED` | **No** | `STATIC` | **REQUIRES_LICENSE_REVIEW** |
| `irctc_private_booking_api` | `RAIL` | IRCTC | IRCTC | [www.irctc.co.in](https://www.irctc.co.in/) | `PROPRIETARY_RESTRICTED` | **No** | `UNAVAILABLE` | **REJECTED** |
| `redbus_private_api` | `BUS` | redBus / MakeMyTrip Group | redBus | [www.redbus.in](https://www.redbus.in/) | `PROPRIETARY_RESTRICTED` | **No** | `UNAVAILABLE` | **REJECTED** |

---

## 4. Comprehensive Source Audit & Provenance Profiles

### 4.1 Indian Railways Open Timetable (`ind_railways_open_timetable`)
* **source_id**: `ind_railways_open_timetable`
* **mode**: `RAIL`
* **publisher**: Ministry of Railways, Government of India
* **operator**: Indian Railways
* **catalog_URL**: `https://www.data.gov.in/catalog/indian-railways-train-time-table`
* **exact URL**: `https://www.data.gov.in/catalog/indian-railways-train-time-table`
* **license**: `GODL-India` (Government Open Data License - India)
* **license_evidence_url**: `https://data.gov.in/government-open-data-license-india`
* **redistribution_allowed**: `true`
* **authentication_required**: `false`
* **data_state**: `STATIC` (Historical timetable open data release)
* **data_class**: `REAL_SOURCE_DERIVED`
* **last_verified_at**: `2026-10-10T12:00:00Z`
* **catalog_published_at**: `2015-08-07`
* **catalog_updated_at**: `2018-01-24`
* **resource_url**: `null` (Catalog package distribution)
* **resource_id**: `null` (Catalog package distribution)
* **resource_updated_at**: `null`
* **source_last_updated_at**: `2018-01-24`
* **fields_available**: `[train_number, train_name, station_code, station_name, arrival_time, departure_time, distance, day_offset]`
* **fare_available**: `false` (Official OGD timetable feed publishes schedule and station sequences; does **not** publish current class fare matrices)
* **availability_available**: `false` (Seat quotas and live inventory require authenticated private booking systems)
* **approval_status**: **`APPROVED`**
* **rejection/restriction reason**: Official public open data feed available under GODL-India. Ingested timetable data is static/historical; fares and availability are omitted and truthfully represented as unavailable.

#### 4.1.1 Reproducible Rail Source Lineage & Cryptographic Integrity
* **Catalog URL**: `https://www.data.gov.in/catalog/indian-railways-train-time-table`
* **Catalog Published**: `2015-08-07`
* **Catalog Updated**: `2018-01-24`
* **Resource-level identifier / timestamp**: `null` (OGD publishes catalog-level distribution without individual resource permalinks)
* **Extraction Utility**: `backend/scripts/build_verified_rail_fixture.py`
* **Local Ingestion Asset**: `backend/data/transport/indian_railways_timetable_verified.json`
* **Provenance Metadata**: `backend/data/transport/indian_railways_timetable_metadata.json`
* **Cryptographic SHA-256**: `6f5a672f90e36540548295301f49484db4dcf6ec205064409424dbfd2d479628`
* **Corridor Filter**: Sangli / Miraj gateway corridor trains (`11029 Koyna Express`, `17412 Mahalaxmi Express`, `12779 Goa Express`)
* **Station Code to Canonical Facility Mapping Matrix**:
  - `PUNE` (Rail) $\rightarrow$ `fac_pune_pune` (Pune Junction Railway Station, `RAIL_STATION`)
  - `PNQ` (Aviation) $\rightarrow$ `fac_pune_pnq` (Pune Airport, `AIRPORT`) — Strict separation enforced: `PUNE != PNQ`
  - `SLI` (Rail) $\rightarrow$ `fac_sangli_sli` (Sangli Railway Station, `RAIL_STATION`)
  - `MRJ` (Rail) $\rightarrow$ `fac_miraj_mrj` (Miraj Junction Railway Station, `RAIL_STATION`)
  - `CSMT` / `CSTM` (Rail) $\rightarrow$ `fac_mumbai_cstm` (Chhatrapati Shivaji Maharaj Terminus, `RAIL_STATION`)
  - `BOM` (Aviation) $\rightarrow$ `fac_mumbai_bom` (CSM International Airport Mumbai, `AIRPORT`) — Strict separation: `CSMT != BOM`
  - `NDLS` (Rail) $\rightarrow$ `fac_new_delhi_ndls` (New Delhi Railway Station, `RAIL_STATION`)
  - `DEL` (Aviation) $\rightarrow$ `fac_new_delhi_del` (Indira Gandhi International Airport, `AIRPORT`) — Strict separation: `NDLS != DEL`
  - `CDG` (Rail) $\rightarrow$ `fac_chandigarh_cdg` (Chandigarh Junction Railway Station, `RAIL_STATION`)
  - `KOP` (Rail) $\rightarrow$ `fac_kolhapur_kop` (Chhatrapati Shahu Maharaj Terminus Kolhapur, `RAIL_STATION`)
* **Truthful Data Guarantee**:
  - Fare: `amount = null`, `fare_status = "NOT_PROVIDED"`, `is_estimated = false`
  - Availability: `available_seats = null`, `availability_status = "NOT_PROVIDED"`
  - Rendering: UI renders **"Fare unavailable"** and **"Availability not provided"** with zero fabricated numbers.

### 4.2 MSRTC Intercity Bus Schedules (`msrtc_intercity_schedules`)
* **source_id**: `msrtc_intercity_schedules`
* **mode**: `BUS`
* **publisher**: Maharashtra State Road Transport Corporation
* **operator**: MSRTC
* **exact URL**: `https://msrtc.maharashtra.gov.in/`
* **license**: `PROPRIETARY_UNVERIFIED`
* **license_evidence_url**: `https://msrtc.maharashtra.gov.in/`
* **redistribution_allowed**: `false`
* **authentication_required**: `false`
* **data_state**: `STATIC`
* **data_class**: `SYNTHETIC_CONTRACT_FIXTURE`
* **last_verified_at**: `2026-10-10T12:00:00Z`
* **source_last_updated_at**: `2024-01-01T00:00:00Z`
* **fields_available**: `[service_code, origin_bus_station, destination_bus_station, departure_time]`
* **fare_available**: `false`
* **availability_available**: `false`
* **approval_status**: **`REQUIRES_LICENSE_REVIEW`**
* **rejection/restriction reason**: State road transport portal schedules lack explicit GODL-India or open data licensing metadata permitting committed fixture redistribution. Downgraded to REQUIRES_LICENSE_REVIEW; fixtures restricted to schema testing only.

### 4.3 DGCA Domestic Flight Schedules (`dgca_domestic_flight_schedules`)
* **source_id**: `dgca_domestic_flight_schedules`
* **mode**: `FLIGHT`
* **publisher**: Directorate General of Civil Aviation, India
* **operator**: Air India / IndiGo / DGCA
* **exact URL**: `https://www.dgca.gov.in/`
* **license**: `PROPRIETARY_UNVERIFIED`
* **license_evidence_url**: `https://www.dgca.gov.in/`
* **redistribution_allowed**: `false`
* **authentication_required**: `false`
* **data_state**: `STATIC`
* **data_class**: `SYNTHETIC_CONTRACT_FIXTURE`
* **last_verified_at**: `2026-10-10T12:00:00Z`
* **source_last_updated_at**: `2024-01-01T00:00:00Z`
* **fields_available**: `[flight_number, origin_airport, destination_airport, departure_time, arrival_time]`
* **fare_available**: `false`
* **availability_available**: `false`
* **approval_status**: **`REQUIRES_LICENSE_REVIEW`**
* **rejection/restriction reason**: Public regulatory flight directory does not provide explicit CC-BY or open redistribution rights. Must not be claimed as CC-BY-4.0 without formal publisher license grant. Downgraded to REQUIRES_LICENSE_REVIEW; fixtures restricted to schema contract validation.

### 4.4 IRCTC Private Booking API (`irctc_private_booking_api`)
* **source_id**: `irctc_private_booking_api`
* **mode**: `RAIL`
* **publisher**: IRCTC
* **operator**: IRCTC
* **exact URL**: `https://www.irctc.co.in/`
* **license**: `PROPRIETARY_RESTRICTED`
* **license_evidence_url**: `https://www.irctc.co.in/eticketing/termsAndConditions.jsf`
* **redistribution_allowed**: `false`
* **authentication_required**: `true`
* **data_state**: `UNAVAILABLE`
* **data_class**: `LEGACY_DEMO`
* **last_verified_at**: `2026-10-10T12:00:00Z`
* **source_last_updated_at**: `null`
* **fields_available**: `[]`
* **fare_available**: `false`
* **availability_available**: `false`
* **approval_status**: **`REJECTED`**
* **rejection/restriction reason**: Private authenticated endpoint; automated access and scraping strictly prohibited by Terms of Service and NAVIX legal policy.

### 4.5 redBus Private API (`redbus_private_api`)
* **source_id**: `redbus_private_api`
* **mode**: `BUS`
* **publisher**: redBus / MakeMyTrip Group
* **operator**: redBus
* **exact URL**: `https://www.redbus.in/`
* **license**: `PROPRIETARY_RESTRICTED`
* **license_evidence_url**: `https://www.redbus.in/info/termscondition`
* **redistribution_allowed**: `false`
* **authentication_required**: `true`
* **data_state**: `UNAVAILABLE`
* **data_class**: `LEGACY_DEMO`
* **last_verified_at**: `2026-10-10T12:00:00Z`
* **source_last_updated_at**: `null`
* **fields_available**: `[]`
* **fare_available**: `false`
* **availability_available**: `false`
* **approval_status**: **`REJECTED`**
* **rejection/restriction reason**: Private commercial app API; access rejected per legal and licensing policy without commercial partner contract.

---

## 5. Verification & Audit Trail

1. **Manifest File**: `backend/data/transport/source_manifest.yaml`
2. **Schema Engine**: `backend/app/transport_ingestion/manifest.py` (`TransportSourceManifest`)
3. **Execution Guard**: `backend/app/transport_ingestion/runner.py` enforces that only `APPROVED` sources run in production ingestion pipelines. Sources with `REQUIRES_LICENSE_REVIEW` are gated behind `allow_contract_fixtures=True` and marked `SYNTHETIC_CONTRACT_FIXTURE`.
