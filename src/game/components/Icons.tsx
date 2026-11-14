import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface IconProps {
  size?: number;
  color?: string;
}

export const PlayIcon: React.FC<IconProps> = ({ size = 20, color = '#00F0FF' }) => (
  <View style={[styles.center, { width: size, height: size }]}>
    <Text style={{ fontSize: size * 0.85, color, lineHeight: size, fontWeight: '900' }}>▶</Text>
  </View>
);

export const PauseIcon: React.FC<IconProps> = ({ size = 20, color = '#00F0FF' }) => (
  <View style={[styles.center, { width: size, height: size }]}>
    <Text style={{ fontSize: size * 0.8, color, lineHeight: size, fontWeight: '900' }}>❚❚</Text>
  </View>
);

export const RestartIcon: React.FC<IconProps> = ({ size = 20, color = '#00F0FF' }) => (
  <View style={[styles.center, { width: size, height: size }]}>
    <Text style={{ fontSize: size * 0.9, color, lineHeight: size, fontWeight: '900' }}>↺</Text>
  </View>
);

export const TrophyIcon: React.FC<IconProps> = ({ size = 20, color = '#FFE600' }) => (
  <View style={[styles.center, { width: size, height: size }]}>
    <Text style={{ fontSize: size * 0.85, color, lineHeight: size }}>★</Text>
  </View>
);

export const ShopIcon: React.FC<IconProps> = ({ size = 20, color = '#00F0FF' }) => (
  <View style={[styles.center, { width: size, height: size }]}>
    <Text style={{ fontSize: size * 0.85, color, lineHeight: size }}>☖</Text>
  </View>
);

export const VolumeIcon: React.FC<IconProps> = ({ size = 20, color = '#00F0FF' }) => (
  <View style={[styles.center, { width: size, height: size }]}>
    <Text style={{ fontSize: size * 0.85, color, lineHeight: size }}>🔊</Text>
  </View>
);

export const MuteIcon: React.FC<IconProps> = ({ size = 20, color = '#60646C' }) => (
  <View style={[styles.center, { width: size, height: size }]}>
    <Text style={{ fontSize: size * 0.85, color, lineHeight: size }}>🔇</Text>
  </View>
);

export const CloseIcon: React.FC<IconProps> = ({ size = 20, color = '#FFFFFF' }) => (
  <View style={[styles.center, { width: size, height: size }]}>
    <Text style={{ fontSize: size * 0.85, color, lineHeight: size, fontWeight: '800' }}>✕</Text>
  </View>
);

export const CheckIcon: React.FC<IconProps> = ({ size = 20, color = '#00F0FF' }) => (
  <View style={[styles.center, { width: size, height: size }]}>
    <Text style={{ fontSize: size * 0.85, color, lineHeight: size, fontWeight: '900' }}>✓</Text>
  </View>
);

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
