import React from 'react';
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
import {
  LocalizationManager,
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
  useLanguage,
} from '../i18n';
import { CheckIcon, CloseIcon } from './Icons';

interface LanguageModalProps {
  visible: boolean;
  onClose: () => void;
  currentLang?: SupportedLanguage;
  onSelectLanguage?: (code: SupportedLanguage) => void;
}

export const LanguageModal: React.FC<LanguageModalProps> = ({
  visible,
  onClose,
  currentLang,
  onSelectLanguage,
}) => {
  const { lang, t, setLanguage, isRTL } = useLanguage();
  const activeLang = currentLang || lang;

  const handleSelectLanguage = (code: SupportedLanguage) => {
    LocalizationManager.setLanguage(code);
    setLanguage(code);
    onSelectLanguage?.(code);
    HapticManager.selection();
    SoundManager.playCoinCollect();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={[styles.header, isRTL && styles.rtlRow]}>
            <View>
              <Text style={styles.systemTag}>// SYSTEM CONFIG //</Text>
              <Text style={styles.title}>{t('language.title')}</Text>
              <Text style={styles.subtitle}>{t('language.subtitle')}</Text>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <CloseIcon size={16} color="#A0A5B5" />
            </TouchableOpacity>
          </View>

          {/* Languages List */}
          <ScrollView
            style={styles.scrollList}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          >
            {SUPPORTED_LANGUAGES.map((item) => {
              const isSelected = item.code === activeLang;

              return (
                <TouchableOpacity
                  key={item.code}
                  style={[
                    styles.langItem,
                    isSelected && styles.langItemSelected,
                    isRTL && styles.rtlRow,
                  ]}
                  onPress={() => handleSelectLanguage(item.code)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.langLeft, isRTL && styles.rtlRow]}>
                    <Text style={styles.flagEmoji}>{item.flag}</Text>
                    <View style={styles.nameBlock}>
                      <Text
                        style={[
                          styles.nativeName,
                          isSelected && styles.nativeNameSelected,
                        ]}
                      >
                        {item.nativeName}
                      </Text>
                      <Text style={styles.englishName}>{item.name}</Text>
                    </View>
                  </View>

                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <CheckIcon size={14} color="#00F0FF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Footer Note */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>⚡ {t('language.select_prompt')}</Text>
          </View>
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
    paddingHorizontal: 18,
    paddingVertical: 36,
  },
  card: {
    backgroundColor: '#0F1020',
    borderRadius: 24,
    width: '100%',
    maxWidth: 420,
    height: '75%',
    maxHeight: 620,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  systemTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#00F0FF',
    letterSpacing: 2,
    marginBottom: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
  subtitle: {
    fontSize: 12,
    color: '#8A92A6',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollList: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingVertical: 4,
    gap: 8,
  },
  langItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(18, 20, 42, 0.7)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  langItemSelected: {
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    borderColor: '#00F0FF',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  langLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  flagEmoji: {
    fontSize: 24,
  },
  nameBlock: {
    justifyContent: 'center',
  },
  nativeName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#E0E6ED',
  },
  nativeNameSelected: {
    color: '#00F0FF',
    fontWeight: '900',
  },
  englishName: {
    fontSize: 11,
    color: '#70778B',
    marginTop: 1,
  },
  checkBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0, 240, 255, 0.2)',
    borderWidth: 1,
    borderColor: '#00F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#70778B',
    letterSpacing: 0.5,
  },
});
