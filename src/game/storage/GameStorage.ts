import { INITIAL_SKINS, INITIAL_TRAILS } from '../config/Cosmetics';
import { Mission, MissionType, NinjaSkin, TrailStyle } from '../types';

const STORAGE_KEYS = {
  HIGH_SCORE: 'neon_ninja_high_score',
  COINS: 'neon_ninja_coins',
  ACTIVE_TRAIL: 'neon_ninja_active_trail',
  ACTIVE_SKIN: 'neon_ninja_active_skin',
  UNLOCKED_TRAILS: 'neon_ninja_unlocked_trails',
  UNLOCKED_SKINS: 'neon_ninja_unlocked_skins',
  SOUND_ENABLED: 'neon_ninja_sound_enabled',
  MUSIC_ENABLED: 'neon_ninja_music_enabled',
  DEATH_COUNT: 'neon_ninja_death_count',
  HAS_REMOVED_ADS: 'neon_ninja_has_removed_ads',
  VIP_STATUS: 'neon_ninja_vip_status',
  MISSIONS: 'neon_ninja_missions',
  MISSIONS_DATE: 'neon_ninja_missions_date',
};

const DEFAULT_MISSIONS: Mission[] = [
  {
    id: 'm_ink',
    title: 'Mürekkep Koleksiyoneri',
    description: 'Bölümlerden 15 adet mürekkep damlası topla.',
    type: 'collect_ink',
    target: 15,
    progress: 0,
    rewardCoins: 40,
    completed: false,
    claimed: false,
    icon: '💧',
  },
  {
    id: 'm_draw',
    title: 'Neon Mimarı',
    description: 'Koşarken toplam 350m çizgi çiz.',
    type: 'draw_distance',
    target: 350,
    progress: 0,
    rewardCoins: 50,
    completed: false,
    claimed: false,
    icon: '⚡',
  },
  {
    id: 'm_reach',
    title: 'Siber Rekortmen',
    description: 'Tek bir koşuda 500m mesafeye ulaş.',
    type: 'reach_distance',
    target: 500,
    progress: 0,
    rewardCoins: 60,
    completed: false,
    claimed: false,
    icon: '🏆',
  },
  {
    id: 'm_combo',
    title: 'Kombo Çılgınlığı',
    description: 'Aralıksız 5x Kombo serisine ulaş.',
    type: 'combo_streak',
    target: 5,
    progress: 0,
    rewardCoins: 75,
    completed: false,
    claimed: false,
    icon: '🔥',
  },
];

class GameStorageService {
  private memStore: Record<string, string> = {};

  private getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // Ignore
    }
    return this.memStore[key] ?? null;
  }

  private setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch {
      // Ignore
    }
    this.memStore[key] = value;
  }

  getHighScore(): number {
    const val = this.getItem(STORAGE_KEYS.HIGH_SCORE);
    return val ? parseInt(val, 10) || 0 : 0;
  }

  saveHighScore(score: number): void {
    const current = this.getHighScore();
    if (score > current) {
      this.setItem(STORAGE_KEYS.HIGH_SCORE, score.toString());
    }
  }

  getCoins(): number {
    const val = this.getItem(STORAGE_KEYS.COINS);
    return val ? parseInt(val, 10) || 0 : 0;
  }

  addCoins(amount: number): number {
    const total = this.getCoins() + amount;
    this.setItem(STORAGE_KEYS.COINS, total.toString());
    return total;
  }

  spendCoins(amount: number): boolean {
    const current = this.getCoins();
    if (current >= amount) {
      this.setItem(STORAGE_KEYS.COINS, (current - amount).toString());
      return true;
    }
    return false;
  }

  getTrails(): TrailStyle[] {
    const raw = this.getItem(STORAGE_KEYS.UNLOCKED_TRAILS);
    const unlockedIds: string[] = raw ? JSON.parse(raw) : ['cyber_cyan'];
    const isVip = this.isVip();
    return INITIAL_TRAILS.map((t) => ({
      ...t,
      unlocked: isVip || unlockedIds.includes(t.id),
    }));
  }

  unlockTrail(trailId: string): void {
    const trails = this.getTrails();
    const unlocked = trails.filter((t) => t.unlocked || t.id === trailId).map((t) => t.id);
    this.setItem(STORAGE_KEYS.UNLOCKED_TRAILS, JSON.stringify(unlocked));
  }

  getActiveTrailId(): string {
    return this.getItem(STORAGE_KEYS.ACTIVE_TRAIL) || 'cyber_cyan';
  }

  setActiveTrailId(id: string): void {
    this.setItem(STORAGE_KEYS.ACTIVE_TRAIL, id);
  }

  getSkins(): NinjaSkin[] {
    const raw = this.getItem(STORAGE_KEYS.UNLOCKED_SKINS);
    const unlockedIds: string[] = raw ? JSON.parse(raw) : ['neon_shinobi'];
    const isVip = this.isVip();
    return INITIAL_SKINS.map((s) => ({
      ...s,
      unlocked: isVip || unlockedIds.includes(s.id),
    }));
  }

  unlockSkin(skinId: string): void {
    const skins = this.getSkins();
    const unlocked = skins.filter((s) => s.unlocked || s.id === skinId).map((s) => s.id);
    this.setItem(STORAGE_KEYS.UNLOCKED_SKINS, JSON.stringify(unlocked));
  }

  getActiveSkinId(): string {
    return this.getItem(STORAGE_KEYS.ACTIVE_SKIN) || 'neon_shinobi';
  }

  setActiveSkinId(id: string): void {
    this.setItem(STORAGE_KEYS.ACTIVE_SKIN, id);
  }

  isSoundEnabled(): boolean {
    const val = this.getItem(STORAGE_KEYS.SOUND_ENABLED);
    return val !== 'false';
  }

  setSoundEnabled(enabled: boolean): void {
    this.setItem(STORAGE_KEYS.SOUND_ENABLED, enabled ? 'true' : 'false');
  }

  isMusicEnabled(): boolean {
    const val = this.getItem(STORAGE_KEYS.MUSIC_ENABLED);
    return val !== 'false';
  }

  setMusicEnabled(enabled: boolean): void {
    this.setItem(STORAGE_KEYS.MUSIC_ENABLED, enabled ? 'true' : 'false');
  }

  // Ad Tracking: Interstitial every 5 deaths
  getDeathCount(): number {
    const val = this.getItem(STORAGE_KEYS.DEATH_COUNT);
    return val ? parseInt(val, 10) || 0 : 0;
  }

  incrementDeathCount(): number {
    const next = this.getDeathCount() + 1;
    this.setItem(STORAGE_KEYS.DEATH_COUNT, next.toString());
    return next;
  }

  resetDeathCount(): void {
    this.setItem(STORAGE_KEYS.DEATH_COUNT, '0');
  }

  // In-App Purchase: Remove Ads
  hasRemovedAds(): boolean {
    return this.getItem(STORAGE_KEYS.HAS_REMOVED_ADS) === 'true' || this.isVip();
  }

  setRemovedAds(removed: boolean): void {
    this.setItem(STORAGE_KEYS.HAS_REMOVED_ADS, removed ? 'true' : 'false');
  }

  // In-App Purchase: VIP status (all skins + no ads)
  isVip(): boolean {
    return this.getItem(STORAGE_KEYS.VIP_STATUS) === 'true';
  }

  setVip(vip: boolean): void {
    this.setItem(STORAGE_KEYS.VIP_STATUS, vip ? 'true' : 'false');
    if (vip) {
      this.setRemovedAds(true);
    }
  }

  // Daily Missions
  private getTodayString(): string {
    return new Date().toISOString().slice(0, 10);
  }

  getMissions(): Mission[] {
    const today = this.getTodayString();
    const storedDate = this.getItem(STORAGE_KEYS.MISSIONS_DATE);
    const raw = this.getItem(STORAGE_KEYS.MISSIONS);

    // If day changed or no missions stored, reset with fresh missions
    if (storedDate !== today || !raw) {
      this.setItem(STORAGE_KEYS.MISSIONS_DATE, today);
      this.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(DEFAULT_MISSIONS));
      return DEFAULT_MISSIONS;
    }

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      this.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(DEFAULT_MISSIONS));
      return DEFAULT_MISSIONS;
    } catch {
      this.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(DEFAULT_MISSIONS));
      return DEFAULT_MISSIONS;
    }
  }

  updateMissionProgress(type: MissionType, amount: number, isAbsolute = false): boolean {
    const missions = this.getMissions();
    let hasNewlyCompleted = false;

    const updated = missions.map((m) => {
      if (m.type === type && !m.completed) {
        const nextProgress = isAbsolute
          ? Math.max(m.progress, Math.floor(amount))
          : m.progress + Math.floor(amount);
        const isDone = nextProgress >= m.target;
        if (isDone && !m.completed) {
          hasNewlyCompleted = true;
        }
        return {
          ...m,
          progress: Math.min(m.target, nextProgress),
          completed: isDone,
        };
      }
      return m;
    });

    this.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(updated));
    return hasNewlyCompleted;
  }

  claimMissionReward(id: string): number {
    const missions = this.getMissions();
    let coinsEarned = 0;

    const updated = missions.map((m) => {
      if (m.id === id && m.completed && !m.claimed) {
        coinsEarned = m.rewardCoins;
        return { ...m, claimed: true };
      }
      return m;
    });

    if (coinsEarned > 0) {
      this.addCoins(coinsEarned);
      this.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(updated));
    }
    return coinsEarned;
  }

  hasUnclaimedMissions(): boolean {
    const missions = this.getMissions();
    return missions.some((m) => m.completed && !m.claimed);
  }
}

export const GameStorage = new GameStorageService();
