import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RestartIcon, ShopIcon, TrophyIcon } from './Icons';

interface GameOverOverlayProps {
  score: number;
  highScore: number;
  coinsEarned: number;
  totalCoins: number;
  distance: number;
  onRestart: () => void;
  onOpenShop: () => void;
  onWatchAdCoins: () => void;
  onWatchAdRevive?: () => void;
  canRevive?: boolean;
}

export const GameOverOverlay: React.FC<GameOverOverlayProps> = ({
  score,
  highScore,
  coinsEarned,
  distance,
  onRestart,
  onOpenShop,
  onWatchAdCoins,
  onWatchAdRevive,
  canRevive = true,
}) => {
  const isNewRecord = score >= highScore && score > 0;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header */}
        <Text style={styles.dangerLabel}>// SİSTEM ÇÖKTÜ //</Text>
        <Text style={styles.title}>OYUN BİTTİ</Text>

        {isNewRecord && (
          <View style={styles.newRecordBadge}>
            <TrophyIcon size={14} color="#FFE600" />
            <Text style={styles.newRecordText}>YENİ REKOR!</Text>
          </View>
        )}

        {/* Stats Table */}
        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>SKOR</Text>
            <Text style={styles.statValueHighlight}>{score}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>EN İYİ SKOR</Text>
            <Text style={styles.statValue}>{highScore}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>MESAFE</Text>
            <Text style={styles.statValue}>{distance}m</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>TOPLANAN TAŞLAR</Text>
            <View style={styles.coinBadge}>
              <Text style={styles.coinIcon}>◆</Text>
              <Text style={styles.coinValue}>+{coinsEarned}</Text>
            </View>
          </View>
        </View>

        {/* Rewarded Ad Options */}
        <View style={styles.rewardsSection}>
          {canRevive && onWatchAdRevive && (
            <TouchableOpacity
              style={styles.reviveAdBtn}
              onPress={onWatchAdRevive}
              activeOpacity={0.8}
            >
              <Text style={styles.adBtnIcon}>⚡</Text>
              <View style={styles.adBtnTextContainer}>
                <Text style={styles.adBtnTitle}>CANLAN & DEVAM ET</Text>
                <Text style={styles.adBtnSubtitle}>Kaldığın yerden ful mürekkeple başla</Text>
              </View>
              <Text style={styles.adTag}>REKLAM</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.rewardAdBtn}
            onPress={onWatchAdCoins}
            activeOpacity={0.8}
          >
            <Text style={styles.adBtnIcon}>💎</Text>
            <View style={styles.adBtnTextContainer}>
              <Text style={styles.adBtnTitle}>+50 KRİSTAL KAZAN</Text>
              <Text style={styles.adBtnSubtitle}>Kısa bir sponsor videosu izle</Text>
            </View>
            <Text style={styles.adTag}>REKLAM</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.restartButton}
            onPress={onRestart}
            activeOpacity={0.8}
          >
            <RestartIcon size={20} color="#070714" />
            <Text style={styles.restartButtonText}>YENİDEN BAŞLA</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shopButton}
            onPress={onOpenShop}
            activeOpacity={0.8}
          >
            <ShopIcon size={18} color="#00F0FF" />
            <Text style={styles.shopButtonText}>MARKETE GİT</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(7, 7, 20, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 10,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: 'rgba(18, 19, 36, 0.95)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 23, 68, 0.5)',
    shadowColor: '#FF1744',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
  },
  dangerLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2.5,
    color: '#FF1744',
    marginBottom: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: '#FFFFFF',
    textShadowColor: '#FF1744',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  newRecordBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 230, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#FFE600',
    gap: 6,
  },
  newRecordText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#FFE600',
  },
  statsContainer: {
    width: '100%',
    backgroundColor: 'rgba(7, 7, 20, 0.6)',
    borderRadius: 12,
    padding: 12,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.15)',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 3,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A92A6',
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statValueHighlight: {
    fontSize: 18,
    fontWeight: '900',
    color: '#00F0FF',
    textShadowColor: '#00F0FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinIcon: {
    fontSize: 11,
    color: '#FFE600',
    marginRight: 4,
  },
  coinValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFE600',
  },
  rewardsSection: {
    width: '100%',
    gap: 8,
    marginBottom: 14,
  },
  reviveAdBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 127, 0.15)',
    borderWidth: 1.2,
    borderColor: '#FF007F',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  rewardAdBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    borderWidth: 1.2,
    borderColor: '#00F0FF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  adBtnIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  adBtnTextContainer: {
    flex: 1,
  },
  adBtnTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  adBtnSubtitle: {
    fontSize: 9,
    fontWeight: '600',
    color: '#8A92A6',
  },
  adTag: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFE600',
    backgroundColor: 'rgba(255, 230, 0, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  actions: {
    width: '100%',
    gap: 10,
  },
  restartButton: {
    backgroundColor: '#00F0FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    gap: 8,
  },
  restartButtonText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: '#070714',
  },
  shopButton: {
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 240, 255, 0.35)',
    gap: 8,
  },
  shopButtonText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#00F0FF',
  },
});
