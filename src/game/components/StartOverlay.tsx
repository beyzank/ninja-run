import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MuteIcon, PlayIcon, ShopIcon, VolumeIcon } from './Icons';
import { SUPPORTED_LANGUAGES, SupportedLanguage, useLanguage } from '../i18n';

interface StartOverlayProps {
  highScore: number;
  coins: number;
  soundEnabled: boolean;
  onStart: () => void;
  onOpenShop: () => void;
  onOpenMissions: () => void;
  onOpenLanguage?: () => void;
  hasUnclaimedMissions?: boolean;
  onToggleSound: () => void;
  currentLang?: SupportedLanguage;
}

export const StartOverlay: React.FC<StartOverlayProps> = ({
  highScore,
  coins,
  soundEnabled,
  onStart,
  onOpenShop,
  onOpenMissions,
  onOpenLanguage,
  hasUnclaimedMissions = false,
  onToggleSound,
  currentLang,
}) => {
  const { t, currentLanguageInfo: hookLangInfo, isRTL, lang: hookLang } = useLanguage();
  const activeLang = currentLang || hookLang;
  const currentLanguageInfo =
    SUPPORTED_LANGUAGES.find((l) => l.code === activeLang) || hookLangInfo;

  return (
    <View style={styles.container}>
      {/* Top action buttons */}
      <View style={[styles.header, isRTL && styles.rtlRow]}>
        <View style={styles.coinBadge}>
          <Text style={styles.coinIcon}>◆</Text>
          <Text style={styles.coinText}>{coins} {t('start.gems')}</Text>
        </View>

        <View style={styles.headerControls}>
          {onOpenLanguage && (
            <TouchableOpacity
              style={styles.langButton}
              onPress={onOpenLanguage}
              activeOpacity={0.7}
            >
              <Text style={styles.langFlag}>{currentLanguageInfo.flag}</Text>
              <Text style={styles.langCode}>{currentLanguageInfo.code.toUpperCase()}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.iconButton}
            onPress={onToggleSound}
            activeOpacity={0.7}
          >
            {soundEnabled ? (
              <VolumeIcon size={20} color="#00F0FF" />
            ) : (
              <MuteIcon size={20} color="#60646C" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Hero Title */}
      <View style={styles.hero}>
        <Text style={styles.titleGlitch}>{t('start.title_top')}</Text>
        <Text style={styles.titleMain}>{t('start.title_bottom')}</Text>
        <Text style={styles.subtitle}>{t('start.subtitle')}</Text>

        <View style={styles.highScoreCard}>
          <Text style={styles.highScoreLabel}>{t('start.best_run')}</Text>
          <Text style={styles.highScoreValue}>{highScore}</Text>
        </View>
      </View>

      {/* Tutorial Hints */}
      <View style={styles.tutorialContainer}>
        <View style={[styles.tutorialItem, isRTL && styles.rtlRow]}>
          <Text style={styles.tutorialBullet}>✏️</Text>
          <Text style={[styles.tutorialText, isRTL && styles.rtlText]}>{t('start.tutorial_draw')}</Text>
        </View>
        <View style={[styles.tutorialItem, isRTL && styles.rtlRow]}>
          <Text style={styles.tutorialBullet}>💧</Text>
          <Text style={[styles.tutorialText, isRTL && styles.rtlText]}>{t('start.tutorial_ink')}</Text>
        </View>
        <View style={[styles.tutorialItem, isRTL && styles.rtlRow]}>
          <Text style={styles.tutorialBullet}>⚡</Text>
          <Text style={[styles.tutorialText, isRTL && styles.rtlText]}>{t('start.tutorial_hazards')}</Text>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={onStart}
          activeOpacity={0.8}
        >
          <PlayIcon size={20} color="#070714" />
          <Text style={styles.startButtonText}>{t('start.btn_start')}</Text>
        </TouchableOpacity>

        <View style={styles.subActionRow}>
          <TouchableOpacity
            style={styles.subButton}
            onPress={onOpenShop}
            activeOpacity={0.8}
          >
            <ShopIcon size={16} color="#00F0FF" />
            <Text style={styles.subButtonText}>{t('start.btn_shop')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.subButton}
            onPress={onOpenMissions}
            activeOpacity={0.8}
          >
            <Text style={styles.subButtonEmoji}>🎯</Text>
            <Text style={styles.subButtonText}>{t('start.btn_missions')}</Text>
            {hasUnclaimedMissions && <View style={styles.notificationDot} />}
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
    backgroundColor: 'rgba(7, 7, 20, 0.92)',
    paddingTop: 50,
    paddingBottom: 40,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.35)',
    gap: 6,
  },
  langFlag: {
    fontSize: 14,
  },
  langCode: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00F0FF',
    letterSpacing: 0.8,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  rtlText: {
    textAlign: 'right',
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 230, 0, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 230, 0, 0.4)',
  },
  coinIcon: {
    fontSize: 12,
    color: '#FFE600',
    marginRight: 6,
  },
  coinText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFE600',
    letterSpacing: 1,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 240, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
  },
  titleGlitch: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 8,
    color: '#FF007F',
    textShadowColor: '#FF007F',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  titleMain: {
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: 4,
    color: '#FFFFFF',
    textShadowColor: '#00F0FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 25,
    marginVertical: -6,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
    color: '#00F0FF',
    opacity: 0.8,
    marginTop: 8,
  },
  highScoreCard: {
    marginTop: 24,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.25)',
  },
  highScoreLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#60646C',
  },
  highScoreValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#00F0FF',
    marginTop: 2,
  },
  tutorialContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tutorialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  tutorialBullet: {
    fontSize: 15,
    marginRight: 10,
  },
  tutorialText: {
    fontSize: 12,
    color: '#D1F7FF',
    fontWeight: '600',
    flex: 1,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  startButton: {
    backgroundColor: '#00F0FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 15,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#070714',
    marginLeft: 8,
  },
  subActionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  subButton: {
    flex: 1,
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 240, 255, 0.35)',
    position: 'relative',
  },
  subButtonEmoji: {
    fontSize: 15,
  },
  subButtonText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#00F0FF',
    marginLeft: 6,
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF1744',
  },
});
