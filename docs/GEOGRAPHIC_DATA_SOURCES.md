# NAVIX — Geographic Data Sources & Licensing Policy

> **Document Type**: Data Source Audit & Licensing Compliance Specification  
> **Work Package**: WP-8.2 (Real Indian Geographic Data Acquisition, Normalization & Ingestion Pipeline)  
> **Status**: **ACTIVE / APPROVED**  

---

## 1. Overview & Source Selection Strategy

NAVIX requires real, traceable, legally compliant geographic data covering India's national extent. To fulfill national multi-modal route planning subject to hard trip budget constraints, geographic data must be sourced strictly from authoritative, open, and legally usable datasets.

> **Dataset Scope Note**: The initial dataset file (`backend/data/geo/national/india_national_geo_data.json`, 18 KB) acts as an **INITIAL REAL-DATA CATALOG / COVERAGE SEED**. It contains verified national administrative boundaries (States/UTs/Districts), key metropolitan/tier-2/tier-3 hubs, civil airports, major IRCTC railway stations, ISBT bus terminals, and initial POIs. It is designed to be expanded incrementally via nationwide bulk ingestion pipelines.

---

## 2. Approved Indian Data Sources

| Source Name | Owner / Origin | Reference URL | Exact License | Attribution Requirement | Data Acquisition Mode & Scope |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Local Government Directory (LGD)** | Ministry of Panchayati Raj, Govt of India | `https://lgdirectory.gov.in/` | **GODL-India** | "Data sourced from LGD, Ministry of Panchayati Raj, Govt of India" | Curated seed from official LGD directory records (Country, States, UTs, Districts) |
| **GeoNames India Settlement Catalog** | GeoNames Org | `http://www.geonames.org/` | **CC-BY 4.0** | "Derived from GeoNames India database under CC-BY 4.0" | Curated coverage seed from GeoNames open dataset (Metro/City/Town/Village settlements & population metadata) |
| **Data.gov.in Open Railway Station Catalog** | Ministry of Railways / Data.gov.in | `https://data.gov.in/` | **GODL-India** | "Railway station data sourced from Data.gov.in open catalogs" | Curated seed from open government catalogs (Railway Stations, platform details & official IRCTC codes) |
| **OurAirports Civil Aviation Catalog** | OurAirports / AAI Public Catalogs | `https://ourairports.com/countries/IN/` | **Public Domain (CC0)** | "Airport location data sourced from OurAirports public domain catalog" | Curated seed from public domain registry (Civil airports with IATA & ICAO identifiers) |
| **OpenStreetMap India Transport Infrastructure** | OpenStreetMap Contributors | `https://www.openstreetmap.org/` | **ODbL 1.0** | "Bus terminal location data derived from OpenStreetMap contributors under ODbL" | Curated coverage seed from OSM open features (ISBT bus terminals & inter-modal transfer hubs) |

---

## 3. Explicitly Blocked / Rejected Sources

| Source Name | Reason for Exclusion | Enforcement |
| :--- | :--- | :--- |
| **IRCTC Web Scraping / Private APIs** | Unauthorized web scraping or private API calls are strictly prohibited by terms of service and legal boundary rules. Station codes are obtained exclusively from open government catalogs. | **BLOCKED** |
| **redBus Booking Portal Scraping** | Web scraping travel portals violates site terms of service. Terminal locations are sourced from open GIS catalogs. | **BLOCKED** |
| **Google Maps Places API Bulk Geocoding** | Bulk database caching or permanent storage of Google Places data violates Google Maps Platform Terms of Service §3.2.3. | **BLOCKED** |
| **Proprietary Airline / Hotel APIs** | Private booking engine APIs without explicit contractual data sharing agreements are prohibited. | **BLOCKED** |

---

## 4. Provenance & Auditability Rules

- Every record ingested into NAVIX must store a corresponding entry in `geo_provenance`.
- Attributes recorded: `entity_type`, `entity_id`, `data_source`, `license_type`, `confidence_score`, `imported_at`.
- NAVIX must be able to answer at any time: *"Where did this location come from and under what license is it distributed?"*

