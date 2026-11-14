import { INITIAL_SKINS, INITIAL_TRAILS } from '../config/Cosmetics';
import { NinjaSkin, TrailStyle } from '../types';

const STORAGE_KEYS = {
  HIGH_SCORE: 'neon_ninja_high_score',
  COINS: 'neon_ninja_coins',
  ACTIVE_TRAIL: 'neon_ninja_active_trail',
  ACTIVE_SKIN: 'neon_ninja_active_skin',
  UNLOCKED_TRAILS: 'neon_ninja_unlocked_trails',
  UNLOCKED_SKINS: 'neon_ninja_unlocked_skins',
  SOUND_ENABLED: 'neon_ninja_sound_enabled',
  DEATH_COUNT: 'neon_ninja_death_count',
  HAS_REMOVED_ADS: 'neon_ninja_has_removed_ads',
  VIP_STATUS: 'neon_ninja_vip_status',
};

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
}

export const GameStorage = new GameStorageService();
