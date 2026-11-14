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
}

export const GameOverOverlay: React.FC<GameOverOverlayProps> = ({
  score,
  highScore,
  coinsEarned,
  totalCoins,
  distance,
  onRestart,
  onOpenShop,
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
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 23, 68, 0.5)',
    shadowColor: '#FF1744',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
  },
  dangerLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 3,
    color: '#FF1744',
    marginBottom: 4,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#FFFFFF',
    textShadowColor: '#FF1744',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  newRecordBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 230, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FFE600',
    gap: 6,
  },
  newRecordText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#FFE600',
  },
  statsContainer: {
    width: '100%',
    backgroundColor: 'rgba(7, 7, 20, 0.6)',
    borderRadius: 14,
    padding: 16,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.15)',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A92A6',
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statValueHighlight: {
    fontSize: 22,
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
    fontSize: 12,
    color: '#FFE600',
    marginRight: 4,
  },
  coinValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFE600',
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  restartButton: {
    backgroundColor: '#00F0FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    gap: 8,
  },
  restartButtonText: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: '#070714',
  },
  shopButton: {
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 240, 255, 0.35)',
    gap: 8,
  },
  shopButtonText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#00F0FF',
  },
});
