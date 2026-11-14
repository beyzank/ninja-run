import { GameStorage } from '../storage/GameStorage';
import { SoundManager } from '../audio/SoundManager';
import { HapticManager } from '../haptics/HapticManager';

export interface IAPProduct {
  id: string;
  title: string;
  description: string;
  priceText: string;
  priceNumeric: number;
  type: 'non_consumable' | 'consumable' | 'subscription';
  icon: string;
  badge?: string;
}

export const IAP_PRODUCTS: IAPProduct[] = [
  {
    id: 'com.neoninkninja.remove_ads',
    title: 'REKLAMLARI KALDIR',
    description: 'Tüm tam ekran reklamları sonsuza dek kaldırın!',
    priceText: '₺39.99',
    priceNumeric: 39.99,
    type: 'non_consumable',
    icon: '🚫',
    badge: 'POPÜLER',
  },
  {
    id: 'com.neoninkninja.gems_500',
    title: '500 KRİSTAL PAKETİ',
    description: 'İstediğin kostüm ve çizgi renklerini anında aç!',
    priceText: '₺29.99',
    priceNumeric: 29.99,
    type: 'consumable',
    icon: '💎',
  },
  {
    id: 'com.neoninkninja.gems_1500',
    title: '1500 MEGA KRİSTAL',
    description: 'Büyük tasarruf ile devasa siber kasa!',
    priceText: '₺69.99',
    priceNumeric: 69.99,
    type: 'consumable',
    icon: '👑',
    badge: '%50 İNDİRİM',
  },
  {
    id: 'com.neoninkninja.vip_lord',
    title: 'VIP SİBER LORD',
    description: 'Tüm kostümler, tüm çizgiler açık + Reklamsız!',
    priceText: '₺119.99',
    priceNumeric: 119.99,
    type: 'non_consumable',
    icon: '⚡',
    badge: 'HEPSİ DAHİL',
  },
];

class IAPManagerService {
  getProducts(): IAPProduct[] {
    return IAP_PRODUCTS;
  }

  isProductPurchased(productId: string): boolean {
    if (productId === 'com.neoninkninja.remove_ads') {
      return GameStorage.hasRemovedAds();
    }
    if (productId === 'com.neoninkninja.vip_lord') {
      return GameStorage.isVip();
    }
    return false;
  }

  async purchaseProduct(
    product: IAPProduct
  ): Promise<{ success: boolean; message: string }> {
    try {
      HapticManager.medium();

      // Process product delivery
      if (product.id === 'com.neoninkninja.remove_ads') {
        GameStorage.setRemovedAds(true);
      } else if (product.id === 'com.neoninkninja.gems_500') {
        GameStorage.addCoins(500);
      } else if (product.id === 'com.neoninkninja.gems_1500') {
        GameStorage.addCoins(1500);
      } else if (product.id === 'com.neoninkninja.vip_lord') {
        GameStorage.setVip(true);
        GameStorage.addCoins(1000);
      }

      SoundManager.playCoinCollect();
      HapticManager.success();

      return {
        success: true,
        message: `${product.title} başarıyla satın alındı!`,
      };
    } catch {
      HapticManager.error();
      return {
        success: false,
        message: 'Satın alma işlemi tamamlanamadı.',
      };
    }
  }

  async restorePurchases(): Promise<{ success: boolean; message: string }> {
    HapticManager.light();
    const hasAdsRemoved = GameStorage.hasRemovedAds();
    const isVip = GameStorage.isVip();

    if (hasAdsRemoved || isVip) {
      SoundManager.playCoinCollect();
      HapticManager.success();
      return {
        success: true,
        message: 'Satın alımlarınız başarıyla geri yüklendi!',
      };
    }

    return {
      success: true,
      message: 'Geri yüklenecek aktif bir satın alım bulunamadı.',
    };
  }
}

export const IAPManager = new IAPManagerService();
