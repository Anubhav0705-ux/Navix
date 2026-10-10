from app.geo_ingestion.normalizer import slugify_id, normalize_code


def generate_country_id(iso_code: str = "IN") -> str:
    """Generates stable country ID (e.g. ctry_in)."""
    res = f"ctry_{slugify_id(iso_code)}"
    return res[:10]


def generate_admin_div_id(state_code: str) -> str:
    """Generates stable admin division ID for state/UT (e.g. div_in_mh, div_in_hp)."""
    code = slugify_id(state_code)
    if not code.startswith("in_"):
        code = f"in_{code}"
    res = f"div_{code}"
    return res[:50]


def generate_district_id(state_code: str, district_name: str) -> str:
    """Generates stable admin division ID for district (e.g. div_in_mh_sangli)."""
    st = slugify_id(state_code)
    if not st.startswith("in_"):
        st = f"in_{st}"
    dist = slugify_id(district_name)
    res = f"div_{st}_{dist}"
    return res[:50]


def generate_settlement_id(name: str) -> str:
    """Generates stable settlement ID (e.g. stl_sangli, stl_manali)."""
    res = f"stl_{slugify_id(name)}"
    return res[:50]


def generate_locality_id(settlement_name: str, locality_name: str) -> str:
    """Generates stable locality ID (e.g. loc_old_manali)."""
    s_slug = slugify_id(settlement_name)
    l_slug = slugify_id(locality_name)
    res = f"loc_{l_slug}" if l_slug.startswith(f"{s_slug}_") else f"loc_{s_slug}_{l_slug}"
    return res[:50]


def generate_facility_id(facility_type: str, name_or_code: str) -> str:
    """Generates stable transit facility ID (e.g. fac_sli_rail, fac_del_airport)."""
    slug = slugify_id(name_or_code)
    res = f"fac_{slug}"
    return res[:50]


def generate_stop_id(facility_id: str, stop_identifier: str) -> str:
    """Generates stable transit stop ID (e.g. stop_sli_pf1)."""
    fac_clean = facility_id.replace("fac_", "")
    s_clean = slugify_id(stop_identifier)
    res = f"stop_{fac_clean}_{s_clean}"
    return res[:50]


def generate_poi_id(settlement_name: str, poi_name: str) -> str:
    """Generates stable POI ID (e.g. poi_hadimba_temple)."""
    res = f"poi_{slugify_id(poi_name)}"
    return res[:50]


def generate_accommodation_id(settlement_name: str, property_name: str) -> str:
    """Generates stable accommodation ID (e.g. acc_manali_budget_01)."""
    res = f"acc_{slugify_id(settlement_name)}_{slugify_id(property_name)}"
    return res[:50]


def generate_alias_id(entity_id: str, alias_text: str, language_code: str = "en") -> str:
    """Generates stable alias ID (e.g. alias_stl_sangli_marathi)."""
    e_clean = entity_id.replace("stl_", "").replace("fac_", "").replace("div_", "")
    a_slug = slugify_id(alias_text)
    res = f"alias_{e_clean}_{a_slug}_{slugify_id(language_code)}"
    return res[:50]


def generate_provider_mapping_id(provider_name: str, provider_entity_id: str) -> str:
    """Generates stable provider mapping ID (e.g. map_irctc_sli)."""
    p_clean = slugify_id(provider_name)
    e_clean = slugify_id(provider_entity_id)
    res = f"map_{p_clean}_{e_clean}"
    return res[:50]


def generate_provenance_id(entity_id: str, dataset_id: str) -> str:
    """Generates stable provenance ID (e.g. prov_stl_sangli_lgd)."""
    e_clean = slugify_id(entity_id)
    d_clean = slugify_id(dataset_id)
    res = f"prov_{e_clean}_{d_clean}"
    return res[:50]
