import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GameStats, TrailStyle } from '../types';
import { PauseIcon, PlayIcon, RestartIcon } from './Icons';
import { useLanguage } from '../i18n';

interface HUDProps {
  stats: GameStats;
  trailStyle: TrailStyle;
  isPaused: boolean;
  onTogglePause: () => void;
  onRestart: () => void;
  onQuitToMenu: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  trailStyle,
  isPaused,
  onTogglePause,
  onRestart,
  onQuitToMenu,
}) => {
  const { t, isRTL } = useLanguage();
  const inkPercent = Math.max(0, Math.min(100, (stats.ink / stats.maxInk) * 100));
  const isLowInk = inkPercent < 25;
  const speedKmh = Math.floor(stats.speed * 12);

  return (
    <>
      <View style={styles.container} pointerEvents="box-none">
        {/* Top Bar: Ink Gauge, Score & Action Buttons */}
        <View style={[styles.topRow, isRTL && styles.rtlRow]} pointerEvents="box-none">
          {/* Ink Gauge */}
          <View style={styles.inkContainer}>
            <View style={[styles.inkHeader, isRTL && styles.rtlRow]}>
              <Text style={[styles.inkLabel, isLowInk && styles.inkLowLabel]}>
                {isLowInk ? `⚠ ${t('hud.ink_low')}` : `💧 ${t('hud.ink')}`}
              </Text>
              <Text style={[styles.inkValue, isLowInk && styles.inkLowLabel]}>
                {Math.round(inkPercent)}%
              </Text>
            </View>
            <View style={styles.inkBarBackground}>
              <View
                style={[
                  styles.inkBarFill,
                  {
                    width: `${inkPercent}%`,
                    backgroundColor: isLowInk ? '#FF1744' : trailStyle.primaryColor,
                    shadowColor: isLowInk ? '#FF1744' : trailStyle.glowColor,
                  },
                ]}
              />
            </View>
          </View>

          {/* Center: Score & Coins */}
          <View style={styles.centerStats}>
            <Text style={styles.scoreText}>{stats.score}</Text>
            <View style={styles.coinBadge}>
              <Text style={styles.coinIcon}>◆</Text>
              <Text style={styles.coinText}>{stats.coins}</Text>
            </View>

            {/* Dynamic Combo & Multiplier Badge */}
            {stats.combo >= 2 && (
              <View style={styles.comboWrapper}>
                <View
                  style={[
                    styles.comboBadge,
                    stats.comboMultiplier >= 5 && styles.cyberRushBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.comboText,
                      stats.comboMultiplier >= 5 && styles.cyberRushText,
                    ]}
                  >
                    {stats.comboMultiplier >= 5
                      ? t('hud.cyber_rush')
                      : `${t('hud.combo')} x${stats.comboMultiplier}`}
                  </Text>
                  <Text style={styles.comboStreakText}>{stats.combo}x</Text>
                </View>
                {/* Countdown line */}
                <View style={styles.comboTimerTrack}>
                  <View
                    style={[
                      styles.comboTimerFill,
                      {
                        width: `${Math.max(
                          0,
                          Math.min(100, (stats.comboTimerRatio || 0) * 100)
                        )}%`,
                        backgroundColor:
                          stats.comboMultiplier >= 5 ? '#FFE600' : '#00F0FF',
                      },
                    ]}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Top Right Buttons: Instant Restart & Pause */}
          <View style={styles.topActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onRestart}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <RestartIcon size={16} color="#00F0FF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={onTogglePause}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {isPaused ? (
                <PlayIcon size={16} color="#00F0FF" />
              ) : (
                <PauseIcon size={16} color="#00F0FF" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Floating Info: Speedometer & Booster Status */}
        <View style={styles.bottomRow} pointerEvents="box-none">
          <View style={[styles.speedBadge, stats.isBoosting && styles.boostBadge]}>
            <Text style={styles.speedLabel}>
              {stats.isBoosting ? `⚡ ${t('hud.boost')}` : t('hud.speed')}
            </Text>
            <Text style={styles.speedValue}>{speedKmh} km/h</Text>
          </View>
        </View>
      </View>

      {/* Pause Menu Modal */}
      <Modal visible={isPaused} transparent animationType="fade">
        <View style={styles.pauseBackdrop}>
          <View style={styles.pauseCard}>
            <Text style={styles.pauseHeader}>{t('hud.paused_header')}</Text>
            <Text style={styles.pauseTitle}>{t('hud.paused_title')}</Text>

            <View style={styles.pauseStats}>
              <Text style={styles.pauseStatText}>
                {t('hud.current_score', { score: stats.score })}
              </Text>
              <Text style={styles.pauseStatText}>
                {t('hud.distance_val', { distance: stats.distance })}
              </Text>
            </View>

            <View style={styles.pauseActions}>
              <TouchableOpacity
                style={styles.resumeBtn}
                onPress={onTogglePause}
                activeOpacity={0.8}
              >
                <Text style={styles.resumeBtnText}>{t('hud.btn_resume')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.restartPauseBtn}
                onPress={() => {
                  onTogglePause();
                  onRestart();
                }}
                activeOpacity={0.8}
              >
                <RestartIcon size={16} color="#00F0FF" />
                <Text style={styles.restartPauseBtnText}>{t('hud.btn_restart')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuPauseBtn}
                onPress={onQuitToMenu}
                activeOpacity={0.8}
              >
                <Text style={styles.menuPauseBtnText}>{t('hud.btn_menu')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 48,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  inkContainer: {
    width: 140,
  },
  inkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  inkLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#00F0FF',
  },
  inkLowLabel: {
    color: '#FF1744',
  },
  inkValue: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D1F7FF',
  },
  inkBarBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
  },
  inkBarFill: {
    height: '100%',
    borderRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  centerStats: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: '#FFFFFF',
    textShadowColor: '#00F0FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 230, 0, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 230, 0, 0.4)',
  },
  coinIcon: {
    fontSize: 10,
    color: '#FFE600',
    marginRight: 4,
  },
  coinText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFE600',
  },
  comboWrapper: {
    marginTop: 4,
    alignItems: 'center',
    width: 130,
  },
  comboBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.45)',
    gap: 5,
  },
  cyberRushBadge: {
    backgroundColor: 'rgba(255, 230, 0, 0.2)',
    borderColor: '#FFE600',
    shadowColor: '#FFE600',
    shadowOpacity: 0.8,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  comboText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#00F0FF',
    letterSpacing: 0.5,
  },
  cyberRushText: {
    color: '#FFE600',
  },
  comboStreakText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  comboTimerTrack: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 1.5,
    marginTop: 3,
    overflow: 'hidden',
  },
  comboTimerFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(7, 7, 20, 0.8)',
    borderWidth: 1.5,
    borderColor: '#00F0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingBottom: 24,
  },
  speedBadge: {
    backgroundColor: 'rgba(7, 7, 20, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
  },
  boostBadge: {
    borderColor: '#FF007F',
    backgroundColor: 'rgba(255, 0, 127, 0.25)',
  },
  speedLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#00F0FF',
    letterSpacing: 1,
  },
  speedValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  // Pause Modal Styles
  pauseBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(7, 7, 20, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  pauseCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#0F1020',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 240, 255, 0.4)',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  pauseHeader: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2.5,
    color: '#00F0FF',
    marginBottom: 4,
  },
  pauseTitle: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  pauseStats: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    gap: 4,
    alignItems: 'center',
  },
  pauseStatText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8A92A6',
  },
  pauseActions: {
    width: '100%',
    gap: 10,
  },
  resumeBtn: {
    backgroundColor: '#00F0FF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeBtnText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: '#070714',
  },
  restartPauseBtn: {
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    paddingVertical: 13,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.35)',
    gap: 8,
  },
  restartPauseBtnText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#00F0FF',
  },
  menuPauseBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuPauseBtnText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#60646C',
  },
});
