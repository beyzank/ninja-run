import { GameStorage } from '../storage/GameStorage';

export type AdType = 'interstitial' | 'rewarded';
export type RewardType = 'coins_50' | 'revive';

export interface AdRequest {
  type: AdType;
  rewardType?: RewardType;
  title: string;
  sponsorName: string;
  durationSeconds: number;
  canSkipAfter: number;
  onCompleted?: () => void;
  onDismissed?: () => void;
}

type AdListener = (request: AdRequest | null) => void;

class AdManagerService {
  private activeRequest: AdRequest | null = null;
  private listeners: Set<AdListener> = new Set();

  subscribe(listener: AdListener): () => void {
    this.listeners.add(listener);
    listener(this.activeRequest);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.activeRequest);
    }
  }

  // Called on every game over. Returns true if an interstitial ad should be displayed!
  checkInterstitialOnDeath(): boolean {
    if (GameStorage.hasRemovedAds()) {
      return false;
    }

    const deaths = GameStorage.incrementDeathCount();
    // Every 5 game overs trigger an interstitial ad
    if (deaths % 5 === 0) {
      this.showInterstitialAd();
      return true;
    }
    return false;
  }

  showInterstitialAd(onClose?: () => void): void {
    if (GameStorage.hasRemovedAds()) {
      onClose?.();
      return;
    }

    const sponsors = [
      { title: 'SİBER ENERJİ İÇECEĞİ', name: 'NEON MATRIX X' },
      { title: 'GELECEĞİN ZIRHI', name: 'CYBER-TITAN TECH' },
      { title: 'KUANTUM SÜRÜCÜSÜ', name: 'HYPER-DRIVE CORP' },
    ];
    const picked = sponsors[Math.floor(Math.random() * sponsors.length)];

    this.activeRequest = {
      type: 'interstitial',
      title: picked.title,
      sponsorName: picked.name,
      durationSeconds: 5,
      canSkipAfter: 5,
      onCompleted: () => {
        this.closeAd();
        onClose?.();
      },
      onDismissed: () => {
        this.closeAd();
        onClose?.();
      },
    };
    this.notify();
  }

  showRewardedAd(
    rewardType: RewardType,
    onRewardEarned: () => void,
    onCancelled?: () => void
  ): void {
    const title =
      rewardType === 'revive'
        ? 'CANLANMA KAPSÜLÜ'
        : '+50 SİBER KRİSTAL';

    this.activeRequest = {
      type: 'rewarded',
      rewardType,
      title,
      sponsorName: 'ÖDÜLLÜ SPONSOR PROTOKOLÜ',
      durationSeconds: 10,
      canSkipAfter: 10,
      onCompleted: () => {
        this.closeAd();
        onRewardEarned();
      },
      onDismissed: () => {
        this.closeAd();
        onCancelled?.();
      },
    };
    this.notify();
  }

  closeAd(): void {
    this.activeRequest = null;
    this.notify();
  }

  getActiveAd(): AdRequest | null {
    return this.activeRequest;
  }
}

export const AdManager = new AdManagerService();
