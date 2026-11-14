import React, { useEffect, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AdRequest } from '../ads/AdManager';
import { CloseIcon, CheckIcon } from './Icons';
import { HapticManager } from '../haptics/HapticManager';
import { SoundManager } from '../audio/SoundManager';
import { useLanguage } from '../i18n';

interface AdModalProps {
  ad: AdRequest | null;
  onClose: () => void;
  onOpenShopRemoveAds: () => void;
}

export const AdModal: React.FC<AdModalProps> = ({
  ad,
  onClose,
  onOpenShopRemoveAds,
}) => {
  const { t, isRTL } = useLanguage();
  const [secondsRemaining, setSecondsRemaining] = useState(5);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (!ad) return;

    setSecondsRemaining(ad.durationSeconds);
    setCanClose(false);

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanClose(true);
          SoundManager.playCoinCollect();
          HapticManager.success();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [ad]);

  if (!ad) return null;

  const isRewarded = ad.type === 'rewarded';

  const handleClose = () => {
    if (canClose) {
      ad.onCompleted?.();
    } else {
      ad.onDismissed?.();
    }
    onClose();
  };

  return (
    <Modal visible={!!ad} transparent animationType="fade">
      <View style={styles.container}>
        {/* Top Bar with Timer / Close */}
        <View style={[styles.topBar, isRTL && styles.rtlRow]}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {isRewarded ? t('ads.rewarded_badge') : t('ads.interstitial_badge')}
            </Text>
          </View>

          {canClose ? (
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <Text style={styles.closeBtnText}>{t('ads.btn_claim_close')}</Text>
              <CloseIcon size={14} color="#070714" />
            </TouchableOpacity>
          ) : (
            <View style={styles.timerBadge}>
              <Text style={styles.timerText}>
                {t('ads.seconds_remaining', { seconds: secondsRemaining })}
              </Text>
            </View>
          )}
        </View>

        {/* Holographic Sponsor Banner / Video Simulation */}
        <View style={styles.adHero}>
          <View style={styles.hologramGlow}>
            <Text style={styles.hologramIcon}>
              {isRewarded ? '💎' : '⚡'}
            </Text>
          </View>

          <Text style={styles.sponsorLabel}>// {ad.sponsorName} //</Text>
          <Text style={styles.adTitle}>{ad.title}</Text>
          <Text style={styles.adDesc}>
            {isRewarded
              ? t('ads.rewarded_desc')
              : t('ads.interstitial_desc')}
          </Text>

          <TouchableOpacity style={styles.ctaBtn} activeOpacity={0.8}>
            <Text style={styles.ctaBtnText}>{t('ads.btn_discover')}</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Bar: Remove Ads Promotion */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.removeAdsPrompt}
            onPress={() => {
              handleClose();
              onOpenShopRemoveAds();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.removeAdsText}>
              {t('ads.remove_ads_prompt')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070714',
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  badge: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.4)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00F0FF',
    letterSpacing: 1,
  },
  timerBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  timerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A92A6',
  },
  closeBtn: {
    backgroundColor: '#00F0FF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  closeBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#070714',
    letterSpacing: 0.5,
  },
  adHero: {
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(18, 19, 36, 0.7)',
    borderRadius: 24,
    padding: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 240, 255, 0.25)',
  },
  hologramGlow: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#00F0FF',
    marginBottom: 20,
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
  },
  hologramIcon: {
    fontSize: 38,
  },
  sponsorLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#FF007F',
    marginBottom: 6,
  },
  adTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  adDesc: {
    fontSize: 13,
    color: '#8A92A6',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  ctaBtn: {
    backgroundColor: '#00F0FF',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  ctaBtnText: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: '#070714',
  },
  bottomBar: {
    width: '100%',
    alignItems: 'center',
  },
  removeAdsPrompt: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  removeAdsText: {
    fontSize: 11,
    color: '#D1F7FF',
    fontWeight: '600',
  },
});
