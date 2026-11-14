import React, { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SoundManager } from '../audio/SoundManager';
import { HapticManager } from '../haptics/HapticManager';
import { GameStorage } from '../storage/GameStorage';
import { Mission } from '../types';
import { CheckIcon, CloseIcon } from './Icons';

interface MissionsModalProps {
  visible: boolean;
  onClose: () => void;
  onCoinsUpdated: (newCoins: number) => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({
  visible,
  onClose,
  onCoinsUpdated,
}) => {
  const [missions, setMissions] = useState<Mission[]>(() => GameStorage.getMissions());
  const [coins, setCoins] = useState(() => GameStorage.getCoins());
  const [claimedRewardMessage, setClaimedRewardMessage] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setMissions(GameStorage.getMissions());
      setCoins(GameStorage.getCoins());
      setClaimedRewardMessage(null);
    }
  }, [visible]);

  const handleClaimReward = (mission: Mission) => {
    if (!mission.completed || mission.claimed) return;

    const reward = GameStorage.claimMissionReward(mission.id);
    if (reward > 0) {
      const nextCoins = GameStorage.getCoins();
      setCoins(nextCoins);
      onCoinsUpdated(nextCoins);
      setMissions(GameStorage.getMissions());

      SoundManager.playCoinCollect();
      HapticManager.success();

      setClaimedRewardMessage(`+${reward} Kristal Hesabına Eklendi!`);
      setTimeout(() => setClaimedRewardMessage(null), 2500);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalBackdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.dangerLabel}>// SİSTEM PROTOKOLÜ //</Text>
              <Text style={styles.title}>GÜNLÜK GÖREVLER</Text>
            </View>

            <View style={styles.headerRight}>
              <View style={styles.coinBadge}>
                <Text style={styles.coinIcon}>◆</Text>
                <Text style={styles.coinText}>{coins}</Text>
              </View>

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <CloseIcon size={16} color="#A0A5B5" />
              </TouchableOpacity>
            </View>
          </View>

          {claimedRewardMessage && (
            <View style={styles.rewardToast}>
              <Text style={styles.rewardToastText}>✨ {claimedRewardMessage}</Text>
            </View>
          )}

          {/* Mission Subtitle */}
          <View style={styles.resetTimerBanner}>
            <Text style={styles.resetTimerIcon}>⏳</Text>
            <Text style={styles.resetTimerText}>
              Görevler her gece 00:00'da sıfırlanır ve yenilenir.
            </Text>
          </View>

          {/* Missions List */}
          <ScrollView
            style={styles.scrollList}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {(missions && missions.length > 0 ? missions : GameStorage.getMissions()).map(
              (mission) => {
                const percent = Math.min(
                  100,
                  Math.round((mission.progress / mission.target) * 100)
                );

              return (
                <View
                  key={mission.id}
                  style={[
                    styles.missionCard,
                    mission.completed && !mission.claimed && styles.missionCardCompleted,
                    mission.claimed && styles.missionCardClaimed,
                  ]}
                >
                  <View style={styles.missionTopRow}>
                    <View style={styles.iconContainer}>
                      <Text style={styles.missionIcon}>{mission.icon}</Text>
                    </View>

                    <View style={styles.missionInfo}>
                      <Text style={styles.missionTitle}>{mission.title}</Text>
                      <Text style={styles.missionDesc}>{mission.description}</Text>
                    </View>

                    <View style={styles.rewardBadge}>
                      <Text style={styles.rewardIcon}>◆</Text>
                      <Text style={styles.rewardValue}>+{mission.rewardCoins}</Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressLabel}>
                        {mission.claimed
                          ? 'TAMAMLANDI'
                          : mission.completed
                          ? 'ÖDÜLE HAZIR'
                          : 'İLERLEME'}
                      </Text>
                      <Text style={styles.progressCount}>
                        {mission.progress} / {mission.target} (%{percent})
                      </Text>
                    </View>
                    <View style={styles.progressBarTrack}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${percent}%`,
                            backgroundColor: mission.completed ? '#FFE600' : '#00F0FF',
                          },
                        ]}
                      />
                    </View>
                  </View>

                  {/* Action Button */}
                  <View style={styles.missionActionRow}>
                    {mission.claimed ? (
                      <View style={styles.claimedBadge}>
                        <CheckIcon size={14} color="#00F0FF" />
                        <Text style={styles.claimedText}>ÖDÜL ALINDI</Text>
                      </View>
                    ) : mission.completed ? (
                      <TouchableOpacity
                        style={styles.claimButton}
                        onPress={() => handleClaimReward(mission)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.claimButtonText}>
                          ÖDÜLÜ AL (+{mission.rewardCoins} ◆)
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.inProgressBadge}>
                        <Text style={styles.inProgressText}>DEVAM EDİYOR</Text>
                      </View>
                    )}
                  </View>
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(7, 7, 20, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    height: '75%',
    maxHeight: 640,
    backgroundColor: '#0F1026',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 240, 255, 0.35)',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  dangerLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#00F0FF',
    letterSpacing: 2,
    marginBottom: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 230, 0, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 230, 0, 0.35)',
    gap: 5,
  },
  coinIcon: {
    fontSize: 13,
    color: '#FFE600',
    fontWeight: '900',
  },
  coinText: {
    fontSize: 13,
    color: '#FFE600',
    fontWeight: '800',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardToast: {
    backgroundColor: 'rgba(255, 230, 0, 0.15)',
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 230, 0, 0.3)',
  },
  rewardToastText: {
    color: '#FFE600',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  resetTimerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 240, 255, 0.04)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    gap: 8,
  },
  resetTimerIcon: {
    fontSize: 13,
  },
  resetTimerText: {
    fontSize: 11,
    color: '#8A90A6',
    fontWeight: '600',
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  missionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 14,
  },
  missionCardCompleted: {
    borderColor: 'rgba(255, 230, 0, 0.45)',
    backgroundColor: 'rgba(255, 230, 0, 0.04)',
  },
  missionCardClaimed: {
    opacity: 0.65,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  missionTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  missionIcon: {
    fontSize: 18,
  },
  missionInfo: {
    flex: 1,
  },
  missionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  missionDesc: {
    fontSize: 11,
    color: '#8A90A6',
    lineHeight: 15,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 230, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 230, 0, 0.3)',
    gap: 4,
  },
  rewardIcon: {
    fontSize: 11,
    color: '#FFE600',
    fontWeight: '900',
  },
  rewardValue: {
    fontSize: 11,
    color: '#FFE600',
    fontWeight: '800',
  },
  progressSection: {
    marginTop: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  progressLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#60646C',
    letterSpacing: 1,
  },
  progressCount: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A0A5B5',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  missionActionRow: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  claimButton: {
    backgroundColor: '#FFE600',
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#FFE600',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  claimButtonText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#070714',
    letterSpacing: 0.5,
  },
  claimedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    gap: 5,
  },
  claimedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00F0FF',
    letterSpacing: 0.5,
  },
  inProgressBadge: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  inProgressText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#60646C',
    letterSpacing: 0.5,
  },
});
