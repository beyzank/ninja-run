import { SkPath } from '@shopify/react-native-skia';
import Matter from 'matter-js';

export interface Point {
  x: number;
  y: number;
}

export interface DrawnSegment {
  p1: Point;
  p2: Point;
  body: Matter.Body;
  length: number;
}

export interface DrawnLine {
  id: string;
  points: Point[];
  skPath: SkPath;
  segments: DrawnSegment[];
  createdAt: number;
}

export type ObstacleType = 'laser' | 'spike' | 'booster' | 'anti_draw';

export interface BaseEntity {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LaserObstacle extends BaseEntity {
  type: 'laser';
  body: Matter.Body;
  isVertical?: boolean;
  length: number;
}

export interface SpikeObstacle extends BaseEntity {
  type: 'spike';
  body: Matter.Body;
  count: number;
}

export interface BoosterRing extends BaseEntity {
  type: 'booster';
  body: Matter.Body;
  radius: number;
  collected?: boolean;
}

export interface AntiDrawZone extends BaseEntity {
  type: 'anti_draw';
  active: boolean;
}

export type CollectibleType = 'ink_orb' | 'coin';

export interface CollectibleItem extends BaseEntity {
  type: CollectibleType;
  body: Matter.Body;
  value: number;
  collected: boolean;
  baseY: number;
  phase: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export interface TrailStyle {
  id: string;
  name: string;
  primaryColor: string;
  glowColor: string;
  sparkColor: string;
  price: number;
  unlocked: boolean;
}

export interface NinjaSkin {
  id: string;
  name: string;
  accentColor: string;
  suitColor: string;
  scarfColor: string;
  price: number;
  unlocked: boolean;
}

export type GameStatus = 'idle' | 'playing' | 'paused' | 'game_over';

export interface GameStats {
  score: number;
  highScore: number;
  coins: number;
  distance: number;
  ink: number;
  maxInk: number;
  speed: number;
  isBoosting: boolean;
}
