export type SupportedLanguage =
  | 'tr' // Türkçe
  | 'en' // English
  | 'es' // Español
  | 'fr' // Français
  | 'de' // Deutsch
  | 'zh' // 简体中文
  | 'ru' // Русский
  | 'pt-BR' // Português (Brasil)
  | 'pl' // Polski
  | 'ar'; // العربية

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  isRTL?: boolean;
}

export interface TranslationSchema {
  start: {
    title_top: string;
    title_bottom: string;
    subtitle: string;
    best_run: string;
    gems: string;
    tutorial_draw: string;
    tutorial_ink: string;
    tutorial_hazards: string;
    btn_start: string;
    btn_shop: string;
    btn_missions: string;
    language: string;
  };
  hud: {
    ink: string;
    ink_low: string;
    speed: string;
    boost: string;
    combo: string;
    cyber_rush: string;
    paused_header: string;
    paused_title: string;
    current_score: string;
    distance_val: string;
    btn_resume: string;
    btn_restart: string;
    btn_menu: string;
  };
  floating: {
    cyber_rush: string;
    combo: string;
    supersonic: string;
  };
  gameover: {
    title: string;
    new_record: string;
    score: string;
    best_score: string;
    distance: string;
    gems_collected: string;
    revive_title: string;
    revive_desc: string;
    gems_ad_title: string;
    gems_ad_desc: string;
    ad_tag: string;
    btn_restart: string;
    btn_shop: string;
    btn_missions: string;
  };
  shop: {
    title: string;
    subtitle: string;
    tab_trails: string;
    tab_skins: string;
    tab_iap: string;
    free_gems_title: string;
    free_gems_desc: string;
    equipped: string;
    equip: string;
    purchased: string;
    restore_purchases: string;
    trail_glow: string;
    skin_armor: string;
    success_title: string;
    error_title: string;
    info_title: string;
    purchase_success: string;
    purchase_failed: string;
    restore_success: string;
    restore_empty: string;
  };
  trails: {
    cyber_cyan: string;
    synth_pink: string;
    solar_flare: string;
    toxic_matrix: string;
    hyper_violet: string;
  };
  skins: {
    neon_shinobi: string;
    cyber_ronin: string;
    golden_sensei: string;
    ghost_phantom: string;
  };
  iap: {
    remove_ads_title: string;
    remove_ads_desc: string;
    remove_ads_badge: string;
    gems_500_title: string;
    gems_500_desc: string;
    gems_1500_title: string;
    gems_1500_desc: string;
    gems_1500_badge: string;
    vip_lord_title: string;
    vip_lord_desc: string;
    vip_lord_badge: string;
  };
  missions: {
    header_protocol: string;
    title: string;
    reset_timer: string;
    claimed_toast: string;
    status_completed: string;
    status_ready: string;
    status_progress: string;
    status_in_progress: string;
    claimed_badge: string;
    btn_claim: string;
    ink_title: string;
    ink_desc: string;
    draw_title: string;
    draw_desc: string;
    reach_title: string;
    reach_desc: string;
    combo_title: string;
    combo_desc: string;
  };
  ads: {
    rewarded_badge: string;
    interstitial_badge: string;
    btn_claim_close: string;
    seconds_remaining: string;
    rewarded_desc: string;
    interstitial_desc: string;
    btn_discover: string;
    remove_ads_prompt: string;
  };
  language: {
    title: string;
    subtitle: string;
    select_prompt: string;
    btn_close: string;
  };
}
