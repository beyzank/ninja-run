import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

class HapticManagerService {
  private isAvailable = Platform.OS !== 'web';

  light(): void {
    if (!this.isAvailable) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignore
    }
  }

  medium(): void {
    if (!this.isAvailable) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Ignore
    }
  }

  heavy(): void {
    if (!this.isAvailable) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {
      // Ignore
    }
  }

  success(): void {
    if (!this.isAvailable) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Ignore
    }
  }

  warning(): void {
    if (!this.isAvailable) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      // Ignore
    }
  }

  error(): void {
    if (!this.isAvailable) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch {
      // Ignore
    }
  }
}

export const HapticManager = new HapticManagerService();
