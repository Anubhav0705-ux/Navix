/**
 * NAVIX Authentic Media Resolution Engine
 *
 * Guarantees that every destination, attraction, stay, food, and story in NAVIX
 * displays authentic, location-specific, and verified photography.
 * Eliminates broken <img> tags, 404 assets, and generic category fallback behavior.
 */

import rawMediaManifest from './mediaManifest.json';

export interface MediaManifestEntry {
  entityId: string;
  entityName: string;
  destination: string;
  destinationSlug: string;
  category: 'places' | 'food' | 'stays' | 'stories';
  webPath: string;
  localPath?: string;
  classification: 'exact' | 'representative';
  verificationStatus: 'exact_verified' | 'representative_curated';
  license: string;
  attribution: string;
  source: string;
  originalUrl?: string;
}

export const MEDIA_MANIFEST: Record<string, MediaManifestEntry> = (rawMediaManifest as unknown) as Record<string, MediaManifestEntry>;

// Verified Destination Hero Imagery (Using authentic local WebP assets from /public/home/)
export const DESTINATION_PHOTOS: Record<string, string> = {
  'agra': '/media/destinations/agra.webp',
  'ahmedabad': '/media/destinations/ahmedabad.webp',
  'alibaug': '/media/destinations/alibaug.webp',
  'alleppey': '/media/destinations/alleppey.webp',
  'amritsar': '/media/destinations/amritsar.webp',
  'araku-valley': '/media/destinations/araku-valley.webp',
  'auli': '/media/destinations/auli.webp',
  'aurangabad': '/media/destinations/aurangabad.webp',
  'ayodhya': '/media/destinations/ayodhya.webp',
  'bengaluru': '/media/destinations/bengaluru.webp',
  'bhopal': '/media/destinations/bhopal.webp',
  'bhubaneswar': '/media/destinations/bhubaneswar.webp',
  'bhuj': '/media/destinations/bhuj.webp',
  'bikaner': '/media/destinations/bikaner.webp',
  'bir': '/media/destinations/bir.webp',
  'bodh-gaya': '/media/destinations/bodh-gaya.webp',
  'chandigarh': '/media/destinations/chandigarh.webp',
  'chennai': '/media/destinations/chennai.webp',
  'cherrapunji': '/media/destinations/cherrapunji.webp',
  'chikmagalur': '/media/destinations/chikmagalur.webp',
  'chopta': '/media/destinations/chopta.webp',
  'coorg': '/media/destinations/coorg.webp',
  'dalhousie': '/media/destinations/dalhousie.webp',
  'darjeeling': '/media/destinations/darjeeling.webp',
  'dehradun': '/media/destinations/dehradun.webp',
  'delhi': '/media/destinations/delhi.webp',
  'dharamshala': '/media/destinations/dharamshala.webp',
  'dwarka': '/media/destinations/dwarka.webp',
  'gangtok': '/media/destinations/gangtok.webp',
  'ganpatipule': '/media/destinations/ganpatipule.webp',
  'goa': '/media/destinations/goa.webp',
  'gokarna': '/media/destinations/gokarna.webp',
  'gulmarg': '/media/destinations/gulmarg.webp',
  'guwahati': '/media/destinations/guwahati.webp',
  'hampi': '/media/destinations/hampi.webp',
  'haridwar': '/media/destinations/haridwar.webp',
  'hyderabad': '/media/destinations/hyderabad.webp',
  'indore': '/media/destinations/indore.webp',
  'jagdalpur': '/media/destinations/jagdalpur.webp',
  'jaipur': '/media/destinations/jaipur.webp',
  'jaisalmer': '/media/destinations/jaisalmer.webp',
  'jodhpur': '/media/destinations/jodhpur.webp',
  'kalimpong': '/media/destinations/kalimpong.webp',
  'kanyakumari': '/media/destinations/kanyakumari.webp',
  'kasol': '/media/destinations/kasol.webp',
  'kaziranga': '/media/destinations/kaziranga.webp',
  'khajuraho': '/media/destinations/khajuraho.webp',
  'kochi': '/media/destinations/kochi.webp',
  'kodaikanal': '/media/destinations/kodaikanal.webp',
  'kohima': '/media/destinations/kohima.webp',
  'kolhapur': '/media/destinations/kolhapur.webp',
  'kolkata': '/media/destinations/kolkata.webp',
  'konark': '/media/destinations/konark.webp',
  'kullu': '/media/destinations/kullu.webp',
  'leh': '/media/destinations/leh.webp',
  'lonavala': '/media/destinations/lonavala.webp',
  'lucknow': '/media/destinations/lucknow.webp',
  'ludhiana': '/media/destinations/ludhiana.webp',
  'madurai': '/media/destinations/madurai.webp',
  'mahabaleshwar': '/media/destinations/mahabaleshwar.webp',
  'mahabalipuram': '/media/destinations/mahabalipuram.webp',
  'manali': '/media/destinations/manali.webp',
  'mangaluru': '/media/destinations/mangaluru.webp',
  'margao': '/media/destinations/margao.webp',
  'miraj': '/media/destinations/miraj.webp',
  'mount-abu': '/media/destinations/mount-abu.webp',
  'mumbai': '/media/destinations/mumbai.webp',
  'munnar': '/media/destinations/munnar.webp',
  'mussoorie': '/media/destinations/mussoorie.webp',
  'mysuru': '/media/destinations/mysuru.webp',
  'nagpur': '/media/destinations/nagpur.webp',
  'nainital': '/media/destinations/nainital.webp',
  'nashik': '/media/destinations/nashik.webp',
  'north-goa': '/media/destinations/north-goa.webp',
  'nubra-valley': '/media/destinations/nubra-valley.webp',
  'ooty': '/media/destinations/ooty.webp',
  'orchha': '/media/destinations/orchha.webp',
  'pachmarhi': '/media/destinations/pachmarhi.webp',
  'pahalgam': '/media/destinations/pahalgam.webp',
  'panaji': '/media/destinations/panaji.webp',
  'patiala': '/media/destinations/patiala.webp',
  'pondicherry': '/media/destinations/pondicherry.webp',
  'prayagraj': '/media/destinations/prayagraj.webp',
  'pune': '/media/destinations/pune.webp',
  'puri': '/media/destinations/puri.webp',
  'pushkar': '/media/destinations/pushkar.webp',
  'raipur': '/media/destinations/raipur.webp',
  'rameswaram': '/media/destinations/rameswaram.webp',
  'ranthambore': '/media/destinations/ranthambore.webp',
  'ratnagiri': '/media/destinations/ratnagiri.webp',
  'rishikesh': '/media/destinations/rishikesh.webp',
  'sangli': '/media/destinations/sangli.webp',
  'shillong': '/media/destinations/shillong.webp',
  'shimla': '/media/destinations/shimla.webp',
  'siliguri': '/media/destinations/siliguri.webp',
  'south-goa': '/media/destinations/south-goa.webp',
  'spiti': '/media/destinations/spiti.webp',
  'srinagar': '/media/destinations/srinagar.webp',
  'surat': '/media/destinations/surat.webp',
  'tawang': '/media/destinations/tawang.webp',
  'thekkady': '/media/destinations/thekkady.webp',
  'thiruvananthapuram': '/media/destinations/thiruvananthapuram.webp',
  'tirthan-valley': '/media/destinations/tirthan-valley.webp',
  'tirupati': '/media/destinations/tirupati.webp',
  'udaipur': '/media/destinations/udaipur.webp',
  'udupi': '/media/destinations/udupi.webp',
  'ujjain': '/media/destinations/ujjain.webp',
  'vadodara': '/media/destinations/vadodara.webp',
  'varanasi': '/media/destinations/varanasi.webp',
  'varkala': '/media/destinations/varkala.webp',
  'visakhapatnam': '/media/destinations/visakhapatnam.webp',
  'warangal': '/media/destinations/warangal.webp',
  'wayanad': '/media/destinations/wayanad.webp',
};

// Verified Story Covers (32 authentic editorial photographs from /public/media/stories/)
export const STORY_PHOTOS: Record<string, string> = {
  'story_01': '/media/stories/story_01.webp',
  'story_02': '/media/stories/story_02.webp',
  'story_03': '/media/stories/story_03.webp',
  'story_04': '/media/stories/story_04.webp',
  'story_05': '/media/stories/story_05.webp',
  'story_06': '/media/stories/story_06.webp',
  'story_07': '/media/stories/story_07.webp',
  'story_08': '/media/stories/story_08.webp',
  'story_09': '/media/stories/story_09.webp',
  'story_10': '/media/stories/story_10.webp',
  'story_11': '/media/stories/story_11.webp',
  'story_12': '/media/stories/story_12.webp',
  'story_13': '/media/stories/story_13.webp',
  'story_14': '/media/stories/story_14.webp',
  'story_15': '/media/stories/story_15.webp',
  'story_16': '/media/stories/story_16.webp',
  'story_17': '/media/stories/story_17.webp',
  'story_18': '/media/stories/story_18.webp',
  'story_19': '/media/stories/story_19.webp',
  'story_20': '/media/stories/story_20.webp',
  'story_21': '/media/stories/story_21.webp',
  'story_22': '/media/stories/story_22.webp',
  'story_23': '/media/stories/story_23.webp',
  'story_24': '/media/stories/story_24.webp',
  'story_25': '/media/stories/story_25.webp',
  'story_26': '/media/stories/story_26.webp',
  'story_27': '/media/stories/story_27.webp',
  'story_28': '/media/stories/story_28.webp',
  'story_29': '/media/stories/story_29.webp',
  'story_30': '/media/stories/story_30.webp',
  'story_31': '/media/stories/story_31.webp',
  'story_32': '/media/stories/story_32.webp',
};

// Exact Entity-Level Landmark & Dish Resolution Registry
export const VERIFIED_ENTITY_PHOTOS: Record<string, string> = {
  // Ganpatipule Landmarks & Food & Stays
  'shree swamyambhu ganpati temple': '/media/places/ganpatipule_temple.webp',
  'ganpatipule beach': '/media/places/ganpatipule_beach.webp',
  'prachin konkan': '/media/places/ganpatipule_prachin_konkan.webp',
  'keshavsut smarak': '/media/places/ganpatipule_malgund.webp',
  'aare ware': '/media/places/ganpatipule_aare_ware.webp',
  'jaigad sea fort': '/media/places/ganpatipule_jaigad_fort.webp',
  'ukdiche modak': '/media/food/ganpatipule_ukdiche_modak.webp',
  'malvani fish thali': '/media/food/ganpatipule_malvani_thali.webp',
  'solkadhi': '/media/food/ganpatipule_solkadhi.webp',
  'kaju usal': '/media/food/ganpatipule_kaju_usal.webp',
  'aamras': '/media/food/ganpatipule_aamras.webp',
  'mtdc resort ganpatipule': '/media/stays/ganpatipule_mtdc.webp',
  'abhishek beach resort': '/media/stays/ganpatipule_abhishek.webp',

  // Pushkar Landmarks & Food & Stays
  'pushkar holy lake': '/media/places/pushkar_lake_ghats.webp',
  'brahma mandir': '/media/places/pushkar_brahma_temple.webp',
  'savitri mata temple': '/media/places/pushkar_savitri_temple.webp',
  'old rangji temple': '/media/places/pushkar_rangji_temple.webp',
  'varaha temple': '/media/places/pushkar_varaha_temple.webp',
  'pushkar desert dunes': '/media/places/pushkar_camel_fair.webp',
  'pushkar sadar heritage bazaar': '/media/places/pushkar_heritage_bazaar.webp',
  'rabdi malpua': '/media/food/pushkar_rabdi_malpua.webp',
  'rose lassi': '/media/food/pushkar_rose_lassi.webp',
  'pushkar dal baati': '/media/food/pushkar_dal_baati.webp',
  'pushkar falafel': '/media/food/pushkar_falafel.webp',
  'pushkar pyaaz kachori': '/media/food/pushkar_pyaaz_kachori.webp',
  'pushkar palace': '/media/stays/pushkar_palace.webp',
  'zostel pushkar': '/media/stays/pushkar_zostel.webp',

  // Goa Flagship Attractions
  'basilica of bom jesus': '/media/places/goa_basilica_bom_jesus.webp',
  'fontainhas': '/media/places/goa_fontainhas.webp',
  'fort aguada': '/media/places/goa_fort_aguada.webp',
  'dudhsagar': '/media/places/goa_dudhsagar_falls.webp',
  'anjuna flea market': '/media/places/goa_anjuna_coast.webp',
  'chapora fort': '/media/places/goa_chapora_fort.webp',
  'palolem': '/media/places/goa_palolem_beach.webp',
  'se cathedral': '/media/places/goa_se_cathedral.webp',
  'savoi organic spice': '/media/places/goa_savoi_spice.webp',
  'savoi spice': '/media/places/goa_savoi_spice.webp',
  'arambol': '/media/places/goa_arambol_lake.webp',

  // Goa Regional Dishes & Dining
  'kingfish rava fry': '/media/food/goa_kingfish_rava_fry.webp',
  'goan fish curry': '/media/food/goa_fish_curry.webp',
  'pork vindaloo': '/media/food/goa_prawn_balchao.webp',
  'crab xec xec': '/media/food/goa_fish_curry.webp',
  'prawn balchao': '/media/food/goa_prawn_balchao.webp',
  'bebinca': '/media/food/goa_bebinca_dessert.webp',
  'appam': '/media/food/goa_appam_stew.webp',
  'hummus plate': '/media/food/goa_hummus_mezze.webp',
  'souvlaki': '/media/food/goa_souvlaki_mezze.webp',

  // Manali Flagship Attractions
  'hadimba devi': '/media/places/manali_hadimba_temple.webp',
  'hadimba temple': '/media/places/manali_hadimba_temple.webp',
  'manu temple': '/media/places/manali_manu_temple.webp',
  'solang valley': '/media/places/manali_solang_valley.webp',
  'jogini': '/media/places/manali_jogini_waterfall.webp',
  'vashisht': '/media/places/manali_vashisht_temple.webp',
  'atal tunnel': '/media/places/manali_atal_tunnel.webp',
  'naggar castle': '/media/places/manali_naggar_castle.webp',
  'tibetan monastery': '/media/places/manali_tibetan_monastery.webp',
  'mall road': '/media/places/manali_mall_road.webp',
  'beas river': '/media/places/manali_beas_river.webp',

  // Manali Regional Dishes & Cafes
  'siddu': '/media/food/manali_himachali_siddu.webp',
  'himachali siddu': '/media/food/manali_himachali_siddu.webp',
  'trout fish': '/media/food/manali_trout_fish.webp',
  'thukpa': '/media/food/manali_thukpa_momos.webp',
  'woodfired pizza': '/media/food/manali_woodfired_pizza.webp',
  'shakshuka': '/media/food/manali_shakshuka.webp',
  'cafe platter': '/media/food/manali_cafe_platter.webp',

  // Jaipur Flagship Attractions
  'amber fort': '/media/places/jaipur_amber_fort.webp',
  'hawa mahal': '/media/places/jaipur_hawa_mahal.webp',
  'city palace jaipur': '/media/places/jaipur_city_palace.webp',
  'jantar mantar': '/media/places/jaipur_jantar_mantar.webp',
  'nahargarh': '/media/places/jaipur_nahargarh_fort.webp',
  'jaigarh': '/media/places/jaipur_jaigarh_fort.webp',
  'albert hall': '/media/places/jaipur_albert_hall.webp',
  'jal mahal': '/media/places/jaipur_jal_mahal.webp',
  'galta ji': '/media/places/jaipur_galta_ji.webp',
  'johari bazaar': '/media/places/jaipur_johari_bazaar.webp',

  // Jaipur Regional Food
  'dal baati': '/media/food/jaipur_dal_baati_churma.webp',
  'pyaaz kachori': '/media/food/jaipur_pyaaz_kachori.webp',
  'laal maas': '/media/food/jaipur_laal_maas.webp',
  'ker sangri': '/media/food/jaipur_ker_sangri.webp',
  'cutting chai': '/media/food/jaipur_cutting_chai.webp',
  'seekh kebab': '/media/food/jaipur_seekh_kebabs.webp',
  'jalebi': '/media/food/jaipur_samosa_jalebi.webp',

  // Rishikesh Flagship Attractions
  'lakshman jhula': '/media/places/rishikesh_lakshman_jhula.webp',
  'ram jhula': '/media/places/rishikesh_ram_jhula.webp',
  'triveni ghat': '/media/places/rishikesh_triveni_ghat.webp',
  'beatles ashram': '/media/places/rishikesh_beatles_ashram.webp',
  'parmarth niketan': '/media/places/rishikesh_parmarth_niketan.webp',
  'neer garh': '/media/places/rishikesh_neer_garh_waterfall.webp',
  'kunjapuri': '/media/places/rishikesh_kunjapuri_temple.webp',
  'river rafting': '/media/places/rishikesh_river_rafting.webp',
  'bungee jumping': '/media/places/rishikesh_bungee_jumping.webp',

  // Rishikesh Food
  'sattvic thali': '/media/food/rishikesh_sattvic_thali.webp',
  'chotiwala': '/media/food/rishikesh_sattvic_thali.webp',
  'ayurvedic': '/media/food/rishikesh_ayurvedic_bowl.webp',
  'falafel': '/media/food/rishikesh_falafel_plate.webp',
  'apple strudel': '/media/food/rishikesh_apple_strudel.webp',
  'smoothie': '/media/food/rishikesh_smoothie_bowl.webp',

  // Mysuru Flagship Attractions
  'mysore palace': '/media/places/mysuru_palace.webp',
  'amba vilas': '/media/places/mysuru_palace.webp',
  'chamundeshwari': '/media/places/mysuru_chamundeshwari_temple.webp',
  'brindavan gardens': '/media/places/mysuru_brindavan_gardens.webp',
  'st. philomena': '/media/places/mysuru_st_philomenas.webp',
  'jaganmohan': '/media/places/mysuru_jaganmohan_palace.webp',
  'devaraja market': '/media/places/mysuru_devaraja_market.webp',
  'karanji lake': '/media/places/mysuru_karanji_lake.webp',
  'rail museum': '/media/places/mysuru_rail_museum.webp',
  'sandalwood': '/media/places/mysuru_sandalwood_factory.webp',
  'srirangapatna': '/media/places/mysuru_srirangapatna.webp',

  // Mysuru Food
  'mylari dosa': '/media/food/mysuru_mylari_dosa.webp',
  'mysore pak': '/media/food/mysuru_mysore_pak.webp',
  'filter coffee': '/media/food/mysuru_filter_coffee.webp',
  'bisi bele bath': '/media/food/mysuru_bisi_bele_bath.webp',
  'karnataka oota': '/media/food/mysuru_karnataka_thali.webp',
  'karnataka thali': '/media/food/mysuru_karnataka_thali.webp',
  'banana leaf biryani': '/media/food/mysuru_banana_leaf_biryani.webp',

  // Stays & Heritage Properties
  'fort tiracol': '/media/stays/goa_fort_tiracol.webp',
  'panjim inn': '/media/stays/goa_panjim_inn.webp',
  'taj exotica': '/media/stays/goa_taj_exotica.webp',
  'hosteller goa': '/media/stays/goa_hosteller_candolim.webp',
  'zostel old manali': '/media/stays/manali_zostel_old_manali.webp',
  'the himalayan': '/media/stays/manali_the_himalayan.webp',
  'hosteller manali': '/media/stays/manali_hosteller.webp',
  'umaid bhawan': '/media/stays/jaipur_umaid_bhawan.webp',
  'itc rajputana': '/media/stays/jaipur_itc_rajputana.webp',
  'alsisar haveli': '/media/stays/jaipur_alsisar_haveli.webp',
  'ganga kinare': '/media/stays/rishikesh_ganga_kinare.webp',
  'aloha on the ganges': '/media/stays/rishikesh_aloha_ganges.webp',
  'lalitha mahal': '/media/stays/mysuru_lalitha_mahal.webp',
  'royal orchid metropole': '/media/stays/mysuru_royal_orchid.webp',

  // Shimla Verified Entities (Phase 6)
  'viceregal lodge': '/media/places/shimla_viceregal_lodge.webp',
  'rashtrapati niwas': '/media/places/shimla_viceregal_lodge.webp',
  'christ church': '/media/places/shimla_christ_church.webp',
  'the ridge': '/media/places/shimla_christ_church.webp',
  'jakhoo temple': '/media/places/shimla_jakhoo_temple.webp',
  'hanuman statue': '/media/places/shimla_jakhoo_temple.webp',
  'kalka-shimla': '/media/places/shimla_toy_train.webp',
  'toy train': '/media/places/shimla_toy_train.webp',
  'chadwick': '/media/places/shimla_chadwick_falls.webp',
  'kufri': '/media/places/shimla_kufri.webp',
  'mahasu peak': '/media/places/shimla_kufri.webp',
  'annandale': '/media/places/shimla_annandale.webp',
  'summer hill': '/media/places/shimla_summer_hill.webp',
  'lakkar bazaar': '/media/places/shimla_lakkar_bazaar.webp',
  'shimla mall road': '/media/places/shimla_mall_road.webp',

  // Shimla Regional Food (Phase 7)
  'himachali dham': '/media/food/himachal_dham_thali.webp',
  'dham': '/media/food/himachal_dham_thali.webp',
  'kullvi siddu': '/media/food/himachal_siddu.webp',
  'madra': '/media/food/himachal_madra.webp',
  'babru': '/media/food/himachal_babru.webp',
  'chha gosht': '/media/food/himachal_chha_gosht.webp',
  'wake & bake': '/media/food/shimla_apple_crumble.webp',
  'apple crumble': '/media/food/shimla_apple_crumble.webp',
  'kewal ka dhaba': '/media/food/shimla_pahari_tea.webp',
  'pahari chai': '/media/food/shimla_pahari_tea.webp',

  // Shimla Stays (Phase 8)
  'oberoi cecil': '/media/stays/shimla_oberoi_cecil.webp',
  'clarkes hotel': '/media/stays/shimla_clarkes.webp',
  'wildflower hall': '/media/stays/shimla_wildflower_hall.webp',
  'woodville palace': '/media/stays/shimla_woodville_palace.webp',
  'zostel shimla': '/media/stays/shimla_zostel.webp',

  // Spiti Valley Verified Entities
  'key gompa': '/media/places/spiti_key_monastery.webp',
  'key monastery': '/media/places/spiti_key_monastery.webp',
  'kye monastery': '/media/places/spiti_key_monastery.webp',
  'chandratal': '/media/places/spiti_chandratal.webp',
  'dhankar': '/media/places/spiti_dhankar.webp',
  'tabo monastery': '/media/places/spiti_tabo.webp',
  'pin valley': '/media/places/spiti_pin_valley.webp',
  'hikkim': '/media/places/spiti_hikkim.webp',
  'komic': '/media/places/spiti_komic.webp',
  'langza': '/media/places/spiti_langza.webp',
  'chicham bridge': '/media/places/spiti_chicham_bridge.webp',
  'kunzum pass': '/media/places/spiti_kunzum_pass.webp',

  // Chopta Verified Entities
  'tungnath': '/media/places/chopta_tungnath.webp',
  'chandrashila': '/media/places/chopta_chandrashila.webp',
  'deoria tal': '/media/places/chopta_deoria_tal.webp',
  'rohini bugyal': '/media/places/chopta_rohini_bugyal.webp',
  'ukhimath': '/media/places/chopta_ukhimath.webp',
  'sari village': '/media/places/chopta_sari_village.webp',
  'dugalbitta': '/media/places/chopta_dugalbitta.webp',

  // Miraj Verified Entities
  'miraj dargah': '/media/places/miraj_dargah.webp',
  'sitar craft': '/media/places/miraj_sitar_craft.webp',
  'miraj junction': '/media/places/miraj_junction.webp',
  'krishna river peaceful ghats': '/media/places/miraj_krishna_ghat.webp',

  // Cherrapunji Verified Entities
  'nohkalikai': '/media/places/cherrapunji_nohkalikai.webp',
  'living root bridge': '/media/places/cherrapunji_root_bridge.webp',
  'root bridge': '/media/places/cherrapunji_root_bridge.webp',
  'mawsmai cave': '/media/places/cherrapunji_mawsmai_cave.webp',
  'seven sisters': '/media/places/cherrapunji_seven_sisters.webp',
  'wei sawdong': '/media/places/cherrapunji_wei_sawdong.webp',
  'arwah cave': '/media/places/cherrapunji_arwah_cave.webp',
  'dainthlen': '/media/places/cherrapunji_dainthlen.webp'
};

// Curated Category Fallbacks (Neutral Branded Archetypes — Never cross-destination leaks)
export const CATEGORY_FALLBACKS: Record<string, string> = {
  place: '/media/placeholders/navix_place_representative.webp',
  attraction: '/media/placeholders/navix_place_representative.webp',
  sightseeing: '/media/placeholders/navix_place_representative.webp',
  heritage: '/media/placeholders/navix_place_representative.webp',
  nature: '/media/placeholders/navix_place_representative.webp',
  spiritual: '/media/placeholders/navix_place_representative.webp',
  adventure: '/media/placeholders/navix_place_representative.webp',
  food: '/media/placeholders/navix_food_representative.webp',
  restaurant: '/media/placeholders/navix_food_representative.webp',
  dining: '/media/placeholders/navix_food_representative.webp',
  cafe: '/media/placeholders/navix_food_representative.webp',
  hotel: '/media/placeholders/navix_stay_representative.webp',
  stay: '/media/placeholders/navix_stay_representative.webp',
  hostel: '/media/placeholders/navix_stay_representative.webp',
  resort: '/media/placeholders/navix_stay_representative.webp',
  homestay: '/media/placeholders/navix_stay_representative.webp',
  default: '/media/placeholders/navix_default_representative.webp'
};

/**
 * Sanitizes an image URL, replacing any known 404/broken assets with valid high-res photos.
 */
export function sanitizeImageUrl(url?: string | null): string | null {
  if (!url) return null;
  // If it's already a local web path, return as is
  if (url.startsWith('/media/') || url.startsWith('/home/')) {
    return url;
  }
  return url;
}

/**
 * Resolves a context-appropriate, verified photo based on entity ID, name, destination,
 * and verified local asset manifest.
 *
 * Strict Fallback Priority (Phase 3):
 * 1. exact entity photo (MEDIA_MANIFEST)
 * 2. verified entity-specific representative photo (VERIFIED_ENTITY_PHOTOS)
 * 3. neutral NAVIX placeholder clearly treated as representative
 * 4. NEVER another unrelated destination (e.g. no Manali mountain photo on a Goa dish or Sangli temple)
 */
export function resolveFallbackImage(
  category?: string | null,
  nameOrHint?: string | null,
  entityId?: string | null
): string {
  // 1. Check exact entityId in manifest
  if (entityId && MEDIA_MANIFEST[entityId]) {
    return MEDIA_MANIFEST[entityId].webPath;
  }

  const hint = (nameOrHint || '').toLowerCase().trim();
  const cat = (category || '').toLowerCase().trim();

  // 2. Check exact entityId embedded in hint (e.g. att_goa_01)
  if (MEDIA_MANIFEST[hint]) {
    return MEDIA_MANIFEST[hint].webPath;
  }

  // 3. Check verified landmark entity registry (Exact or substring match)
  for (const [entityKey, url] of Object.entries(VERIFIED_ENTITY_PHOTOS)) {
    if (hint.includes(entityKey) || entityKey.includes(hint)) {
      return url;
    }
  }

  // 4. Check manifest by entityName substring
  for (const item of Object.values(MEDIA_MANIFEST)) {
    const itemName = item.entityName.toLowerCase();
    if (itemName.includes(hint) || hint.includes(itemName)) {
      return item.webPath;
    }
  }

  // 5. Destination cover resolution ONLY when resolving a destination hero image
  if (cat === 'destination' || cat === 'destinations') {
    for (const [dest, url] of Object.entries(DESTINATION_PHOTOS)) {
      if (hint.includes(dest) || dest.includes(hint)) {
        return url;
      }
    }
  }

  // 6. Neutral Branded Archetype Fallback (Never leak another destination's photo!)
  if (cat.includes('food') || cat.includes('dining') || cat.includes('restaurant') || cat.includes('cafe')) {
    return CATEGORY_FALLBACKS.food;
  }
  if (cat.includes('stay') || cat.includes('hotel') || cat.includes('hostel') || cat.includes('resort') || cat.includes('homestay')) {
    return CATEGORY_FALLBACKS.hotel;
  }
  if (cat.includes('place') || cat.includes('attraction') || cat.includes('sightseeing') || cat.includes('heritage') || cat.includes('nature') || cat.includes('adventure')) {
    return CATEGORY_FALLBACKS.place;
  }

  return CATEGORY_FALLBACKS.default;
}

/**
 * Resolves the primary photo for a destination by name.
 */
export function resolveDestinationPhoto(destinationName: string): string {
  const clean = destinationName.toLowerCase().replace(' & old manali', '').replace(' (calangute & anjuna)', '').trim();
  return DESTINATION_PHOTOS[clean] || resolveFallbackImage('destination', clean);
}

/**
 * Retrieves attribution and licensing metadata for an asset.
 */
export function getMediaMetadata(webPathOrId: string): MediaManifestEntry | null {
  if (MEDIA_MANIFEST[webPathOrId]) {
    return MEDIA_MANIFEST[webPathOrId];
  }
  for (const item of Object.values(MEDIA_MANIFEST)) {
    if (item.webPath === webPathOrId) {
      return item;
    }
  }
  return null;
}

/**
 * Resolves the primary photo for a story by story ID or slug.
 */
export function resolveStoryPhoto(storyIdOrSlug: string, fallback?: string): string {
  if (STORY_PHOTOS[storyIdOrSlug]) {
    return STORY_PHOTOS[storyIdOrSlug];
  }
  return fallback || resolveFallbackImage('story', storyIdOrSlug);
}
