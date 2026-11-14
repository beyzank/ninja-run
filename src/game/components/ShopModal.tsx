import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NinjaSkin, TrailStyle } from '../types';
import { GameStorage } from '../storage/GameStorage';
import { SoundManager } from '../audio/SoundManager';
import { HapticManager } from '../haptics/HapticManager';
import { IAP_PRODUCTS, IAPManager, IAPProduct } from '../iap/IAPManager';
import { CheckIcon, CloseIcon } from './Icons';
import { useLanguage } from '../i18n';

interface ShopModalProps {
  visible: boolean;
  onClose: () => void;
  coins: number;
  onCoinsUpdated: (newCoins: number) => void;
  activeTrailId: string;
  onSelectTrail: (trail: TrailStyle) => void;
  activeSkinId: string;
  onSelectSkin: (skin: NinjaSkin) => void;
  initialTab?: 'trails' | 'skins' | 'iap';
  onWatchAdForCoins?: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  visible,
  onClose,
  coins,
  onCoinsUpdated,
  activeTrailId,
  onSelectTrail,
  activeSkinId,
  onSelectSkin,
  initialTab = 'trails',
  onWatchAdForCoins,
}) => {
  const { t, isRTL } = useLanguage();
  const [tab, setTab] = useState<'trails' | 'skins' | 'iap'>(initialTab);
  const [trails, setTrails] = useState<TrailStyle[]>(() => GameStorage.getTrails());
  const [skins, setSkins] = useState<NinjaSkin[]>(() => GameStorage.getSkins());
  const [hasRemovedAds, setHasRemovedAds] = useState(() => GameStorage.hasRemovedAds());
  const [isVip, setIsVip] = useState(() => GameStorage.isVip());

  const getProductInfo = (prod: IAPProduct) => {
    if (prod.id === 'com.neoninkninja.remove_ads') {
      return {
        title: t('iap.remove_ads_title'),
        desc: t('iap.remove_ads_desc'),
        badge: t('iap.remove_ads_badge'),
      };
    }
    if (prod.id === 'com.neoninkninja.gems_500') {
      return {
        title: t('iap.gems_500_title'),
        desc: t('iap.gems_500_desc'),
        badge: prod.badge,
      };
    }
    if (prod.id === 'com.neoninkninja.gems_1500') {
      return {
        title: t('iap.gems_1500_title'),
        desc: t('iap.gems_1500_desc'),
        badge: t('iap.gems_1500_badge'),
      };
    }
    if (prod.id === 'com.neoninkninja.vip_lord') {
      return {
        title: t('iap.vip_lord_title'),
        desc: t('iap.vip_lord_desc'),
        badge: t('iap.vip_lord_badge'),
      };
    }
    return { title: prod.title, desc: prod.description, badge: prod.badge };
  };

  useEffect(() => {
    if (visible) {
      setTab(initialTab);
      setTrails(GameStorage.getTrails());
      setSkins(GameStorage.getSkins());
      setHasRemovedAds(GameStorage.hasRemovedAds());
      setIsVip(GameStorage.isVip());
    }
  }, [visible, initialTab]);

  const handleBuyTrail = (trail: TrailStyle) => {
    if (trail.unlocked) {
      GameStorage.setActiveTrailId(trail.id);
      onSelectTrail(trail);
      HapticManager.light();
      return;
    }

    if (coins >= trail.price) {
      if (GameStorage.spendCoins(trail.price)) {
        GameStorage.unlockTrail(trail.id);
        GameStorage.setActiveTrailId(trail.id);
        const updated = GameStorage.getTrails();
        setTrails(updated);
        onCoinsUpdated(GameStorage.getCoins());
        onSelectTrail(trail);
        SoundManager.playCoinCollect();
        HapticManager.success();
      }
    } else {
      SoundManager.playDeny();
      HapticManager.warning();
    }
  };

  const handleBuySkin = (skin: NinjaSkin) => {
    if (skin.unlocked) {
      GameStorage.setActiveSkinId(skin.id);
      onSelectSkin(skin);
      HapticManager.light();
      return;
    }

    if (coins >= skin.price) {
      if (GameStorage.spendCoins(skin.price)) {
        GameStorage.unlockSkin(skin.id);
        GameStorage.setActiveSkinId(skin.id);
        const updated = GameStorage.getSkins();
        setSkins(updated);
        onCoinsUpdated(GameStorage.getCoins());
        onSelectSkin(skin);
        SoundManager.playCoinCollect();
        HapticManager.success();
      }
    } else {
      SoundManager.playDeny();
      HapticManager.warning();
    }
  };

  const handleIAPPurchase = async (product: IAPProduct) => {
    const res = await IAPManager.purchaseProduct(product);
    if (res.success) {
      setHasRemovedAds(GameStorage.hasRemovedAds());
      setIsVip(GameStorage.isVip());
      setTrails(GameStorage.getTrails());
      setSkins(GameStorage.getSkins());
      onCoinsUpdated(GameStorage.getCoins());
      const info = getProductInfo(product);
      Alert.alert(t('shop.success_title'), t('shop.purchase_success', { product: info.title }));
    } else {
      Alert.alert(t('shop.error_title'), t('shop.purchase_failed'));
    }
  };

  const handleRestorePurchases = async () => {
    const res = await IAPManager.restorePurchases();
    setHasRemovedAds(GameStorage.hasRemovedAds());
    setIsVip(GameStorage.isVip());
    setTrails(GameStorage.getTrails());
    setSkins(GameStorage.getSkins());
    if (res.restoredCount > 0) {
      Alert.alert(t('shop.info_title'), t('shop.restore_success'));
    } else {
      Alert.alert(t('shop.info_title'), t('shop.restore_empty'));
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={[styles.header, isRTL && styles.rtlRow]}>
            <View>
              <Text style={styles.title}>{t('shop.title')}</Text>
              <Text style={styles.subtitle}>{t('shop.subtitle')}</Text>
            </View>

            <View style={[styles.headerRight, isRTL && styles.rtlRow]}>
              <View style={styles.coinBadge}>
                <Text style={styles.coinIcon}>◆</Text>
                <Text style={styles.coinText}>{coins}</Text>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <CloseIcon size={18} color="#D1F7FF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Tab Selector */}
          <View style={[styles.tabContainer, isRTL && styles.rtlRow]}>
            <TouchableOpacity
              style={[styles.tabButton, tab === 'trails' && styles.activeTab]}
              onPress={() => setTab('trails')}
            >
              <Text
                style={[
                  styles.tabText,
                  tab === 'trails' && styles.activeTabText,
                ]}
              >
                {t('shop.tab_trails')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, tab === 'skins' && styles.activeTab]}
              onPress={() => setTab('skins')}
            >
              <Text
                style={[styles.tabText, tab === 'skins' && styles.activeTabText]}
              >
                {t('shop.tab_skins')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, tab === 'iap' && styles.activeTab]}
              onPress={() => setTab('iap')}
            >
              <Text
                style={[styles.tabText, tab === 'iap' && styles.activeTabText]}
              >
                {t('shop.tab_iap')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Items List */}
          <ScrollView
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Free Rewarded Ad Banner (Available in all tabs) */}
            {onWatchAdForCoins && (
              <TouchableOpacity
                style={[styles.freeGemsAdBanner, isRTL && styles.rtlRow]}
                onPress={() => {
                  onClose();
                  onWatchAdForCoins();
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.freeGemsIcon}>🎬</Text>
                <View style={styles.freeGemsInfo}>
                  <Text style={styles.freeGemsTitle}>{t('shop.free_gems_title')}</Text>
                  <Text style={styles.freeGemsSubtitle}>{t('shop.free_gems_desc')}</Text>
                </View>
                <View style={styles.freeGemsTag}>
                  <Text style={styles.freeGemsTagText}>{t('gameover.ad_tag')}</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* TAB 1: TRAILS */}
            {tab === 'trails' &&
              trails.map((item) => {
                const isEquipped = item.id === activeTrailId;
                const canAfford = coins >= item.price;
                const trailName = t(`trails.${item.id}`) || item.name;

                return (
                  <View key={item.id} style={[styles.itemRow, isRTL && styles.rtlRow]}>
                    <View
                      style={[
                        styles.colorSwatch,
                        {
                          backgroundColor: item.primaryColor,
                          shadowColor: item.glowColor,
                        },
                      ]}
                    />

                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{trailName}</Text>
                      <Text style={styles.itemGlow}>{t('shop.trail_glow')}</Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        isEquipped
                          ? styles.equippedButton
                          : item.unlocked
                          ? styles.equipButton
                          : canAfford
                          ? styles.buyButton
                          : styles.lockedButton,
                      ]}
                      onPress={() => handleBuyTrail(item)}
                      activeOpacity={0.8}
                    >
                      {isEquipped ? (
                        <View style={styles.equippedRow}>
                          <CheckIcon size={14} color="#00F0FF" />
                          <Text style={styles.equippedText}>{t('shop.equipped')}</Text>
                        </View>
                      ) : item.unlocked ? (
                        <Text style={styles.equipText}>{t('shop.equip')}</Text>
                      ) : (
                        <View style={styles.priceRow}>
                          <Text style={styles.priceCoin}>◆</Text>
                          <Text style={styles.priceText}>{item.price}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}

            {/* TAB 2: SKINS */}
            {tab === 'skins' &&
              skins.map((item) => {
                const isEquipped = item.id === activeSkinId;
                const canAfford = coins >= item.price;
                const skinName = t(`skins.${item.id}`) || item.name;

                return (
                  <View key={item.id} style={[styles.itemRow, isRTL && styles.rtlRow]}>
                    <View
                      style={[
                        styles.skinAvatar,
                        {
                          backgroundColor: item.suitColor,
                          borderColor: item.accentColor,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.scarfDot,
                          { backgroundColor: item.scarfColor },
                        ]}
                      />
                    </View>

                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{skinName}</Text>
                      <Text style={styles.itemGlow}>{t('shop.skin_armor')}</Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        isEquipped
                          ? styles.equippedButton
                          : item.unlocked
                          ? styles.equipButton
                          : canAfford
                          ? styles.buyButton
                          : styles.lockedButton,
                      ]}
                      onPress={() => handleBuySkin(item)}
                      activeOpacity={0.8}
                    >
                      {isEquipped ? (
                        <View style={styles.equippedRow}>
                          <CheckIcon size={14} color="#00F0FF" />
                          <Text style={styles.equippedText}>{t('shop.equipped')}</Text>
                        </View>
                      ) : item.unlocked ? (
                        <Text style={styles.equipText}>{t('shop.equip')}</Text>
                      ) : (
                        <View style={styles.priceRow}>
                          <Text style={styles.priceCoin}>◆</Text>
                          <Text style={styles.priceText}>{item.price}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}

            {/* TAB 3: IAP STORE */}
            {tab === 'iap' && (
              <>
                {IAP_PRODUCTS.map((prod) => {
                  const isPurchased = IAPManager.isProductPurchased(prod.id);
                  const info = getProductInfo(prod);

                  return (
                    <View key={prod.id} style={[styles.iapRow, isRTL && styles.rtlRow]}>
                      <Text style={styles.iapIcon}>{prod.icon}</Text>

                      <View style={styles.iapInfo}>
                        <View style={styles.iapTitleRow}>
                          <Text style={styles.iapTitle}>{info.title}</Text>
                          {info.badge && (
                            <View style={styles.iapBadge}>
                              <Text style={styles.iapBadgeText}>{info.badge}</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.iapDesc}>{info.desc}</Text>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.iapButton,
                          isPurchased && styles.iapPurchasedButton,
                        ]}
                        onPress={() => !isPurchased && handleIAPPurchase(prod)}
                        activeOpacity={0.8}
                        disabled={isPurchased}
                      >
                        {isPurchased ? (
                          <View style={styles.equippedRow}>
                            <CheckIcon size={14} color="#00FF66" />
                            <Text style={styles.iapPurchasedText}>{t('shop.purchased')}</Text>
                          </View>
                        ) : (
                          <Text style={styles.iapButtonText}>{prod.priceText}</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  );
                })}

                <TouchableOpacity
                  style={styles.restoreBtn}
                  onPress={handleRestorePurchases}
                  activeOpacity={0.8}
                >
                  <Text style={styles.restoreBtnText}>{t('shop.restore_purchases')}</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(7, 7, 20, 0.85)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#0F1020',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '82%',
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 36,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.25)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#00F0FF',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 230, 0, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE600',
  },
  coinIcon: {
    fontSize: 11,
    color: '#FFE600',
    marginRight: 4,
  },
  coinText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFE600',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(0, 240, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.4)',
  },
  tabText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#60646C',
  },
  activeTabText: {
    color: '#00F0FF',
  },
  listContent: {
    gap: 10,
    paddingBottom: 20,
  },
  freeGemsAdBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderWidth: 1.5,
    borderColor: '#00F0FF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 6,
  },
  freeGemsIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  freeGemsInfo: {
    flex: 1,
  },
  freeGemsTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#00F0FF',
    letterSpacing: 0.5,
  },
  freeGemsSubtitle: {
    fontSize: 10,
    color: '#8A92A6',
    fontWeight: '600',
  },
  freeGemsTag: {
    backgroundColor: 'rgba(255, 230, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFE600',
  },
  freeGemsTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFE600',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  skinAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scarfDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  itemGlow: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8A92A6',
    marginTop: 2,
  },
  actionButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 85,
    alignItems: 'center',
    justifyContent: 'center',
  },
  equippedButton: {
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.4)',
  },
  equippedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  equippedText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#00F0FF',
    letterSpacing: 0.5,
  },
  equipButton: {
    backgroundColor: '#00F0FF',
  },
  equipText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#070714',
    letterSpacing: 1,
  },
  buyButton: {
    backgroundColor: 'rgba(255, 230, 0, 0.15)',
    borderWidth: 1,
    borderColor: '#FFE600',
  },
  lockedButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceCoin: {
    fontSize: 10,
    color: '#FFE600',
  },
  priceText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFE600',
  },
  // IAP Rows
  iapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.15)',
  },
  iapIcon: {
    fontSize: 26,
    marginRight: 12,
  },
  iapInfo: {
    flex: 1,
  },
  iapTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iapTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  iapBadge: {
    backgroundColor: 'rgba(255, 0, 127, 0.25)',
    borderWidth: 1,
    borderColor: '#FF007F',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  iapBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FF007F',
    letterSpacing: 0.5,
  },
  iapDesc: {
    fontSize: 10,
    color: '#8A92A6',
    fontWeight: '600',
    marginTop: 2,
  },
  iapButton: {
    backgroundColor: '#00F0FF',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  iapPurchasedButton: {
    backgroundColor: 'rgba(0, 255, 102, 0.15)',
    borderWidth: 1,
    borderColor: '#00FF66',
  },
  iapButtonText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#070714',
    letterSpacing: 0.5,
  },
  iapPurchasedText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#00FF66',
    letterSpacing: 0.5,
  },
  restoreBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 6,
  },
  restoreBtnText: {
    fontSize: 11,
    color: '#8A92A6',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
