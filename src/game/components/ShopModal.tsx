import React, { useState } from 'react';
import {
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
import { CheckIcon, CloseIcon } from './Icons';

interface ShopModalProps {
  visible: boolean;
  onClose: () => void;
  coins: number;
  onCoinsUpdated: (newCoins: number) => void;
  activeTrailId: string;
  onSelectTrail: (trail: TrailStyle) => void;
  activeSkinId: string;
  onSelectSkin: (skin: NinjaSkin) => void;
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
}) => {
  const [tab, setTab] = useState<'trails' | 'skins'>('trails');
  const [trails, setTrails] = useState<TrailStyle[]>(() => GameStorage.getTrails());
  const [skins, setSkins] = useState<NinjaSkin[]>(() => GameStorage.getSkins());

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
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>SİBER PAZAR</Text>
              <Text style={styles.subtitle}>KOZMETİK VE ÖZELLEŞTİRME</Text>
            </View>

            <View style={styles.headerRight}>
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
          <View style={styles.tabContainer}>
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
                ÇİZGİ RENKLERİ
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, tab === 'skins' && styles.activeTab]}
              onPress={() => setTab('skins')}
            >
              <Text
                style={[styles.tabText, tab === 'skins' && styles.activeTabText]}
              >
                NİNJA KOSTÜMLERİ
              </Text>
            </TouchableOpacity>
          </View>

          {/* Items List */}
          <ScrollView
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {tab === 'trails'
              ? trails.map((item) => {
                  const isEquipped = item.id === activeTrailId;
                  const canAfford = coins >= item.price;

                  return (
                    <View key={item.id} style={styles.itemRow}>
                      {/* Color Preview Swatch */}
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
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemGlow}>Neon Glow Efekti</Text>
                      </View>

                      {/* Action Button */}
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
                            <Text style={styles.equippedText}>KULLANILIYOR</Text>
                          </View>
                        ) : item.unlocked ? (
                          <Text style={styles.equipText}>SEÇ</Text>
                        ) : (
                          <View style={styles.priceRow}>
                            <Text style={styles.priceCoin}>◆</Text>
                            <Text style={styles.priceText}>{item.price}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
                  );
                })
              : skins.map((item) => {
                  const isEquipped = item.id === activeSkinId;
                  const canAfford = coins >= item.price;

                  return (
                    <View key={item.id} style={styles.itemRow}>
                      {/* Skin Avatar Preview */}
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
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemGlow}>Özel Ninja Zırhı</Text>
                      </View>

                      {/* Action Button */}
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
                            <Text style={styles.equippedText}>KULLANILIYOR</Text>
                          </View>
                        ) : item.unlocked ? (
                          <Text style={styles.equipText}>SEÇ</Text>
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
    maxHeight: '80%',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.25)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 10,
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
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(0, 240, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.4)',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#60646C',
  },
  activeTabText: {
    color: '#00F0FF',
  },
  listContent: {
    gap: 12,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  skinAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scarfDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 14,
  },
  itemName: {
    fontSize: 14,
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
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    minWidth: 95,
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
    fontSize: 12,
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
    fontSize: 11,
    color: '#FFE600',
  },
  priceText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFE600',
  },
});
