import React, { useMemo } from 'react';
import {
  Canvas,
  Circle,
  Group,
  Path,
  Rect,
} from '@shopify/react-native-skia';
import { GameConfig } from '../config/GameConfig';
import { NinjaState } from '../engine/PhysicsWorld';
import {
  AntiDrawZone,
  BoosterRing,
  CollectibleItem,
  DrawnLine,
  LaserObstacle,
  NinjaSkin,
  Particle,
  Point,
  SpikeObstacle,
  TrailStyle,
} from '../types';

interface GameCanvasProps {
  width: number;
  height: number;
  cameraX: number;
  ninja: NinjaState;
  lines: DrawnLine[];
  activeLinePath: any;
  activePoints: Point[];
  lasers: LaserObstacle[];
  spikes: SpikeObstacle[];
  boosters: BoosterRing[];
  antiDrawZones: AntiDrawZone[];
  collectibles: CollectibleItem[];
  groundBodies: any[];
  particles: Particle[];
  trailStyle: TrailStyle;
  ninjaSkin: NinjaSkin;
  isBoosting: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  width,
  height,
  cameraX,
  ninja,
  lines,
  activeLinePath,
  lasers,
  spikes,
  boosters,
  antiDrawZones,
  collectibles,
  groundBodies,
  particles,
  trailStyle,
  ninjaSkin,
  isBoosting,
}) => {
  // Parallax grid lines - optimized to single loop
  const gridSpacing = 80;
  const gridOffsetX = -(cameraX * 0.35) % gridSpacing;
  const numGridLines = Math.ceil(width / gridSpacing) + 2;

  // Build spike path SVG helper
  const createSpikeSvg = (spike: SpikeObstacle) => {
    let d = '';
    const spikeW = spike.width / spike.count;
    for (let i = 0; i < spike.count; i++) {
      const startX = spike.x + i * spikeW;
      const midX = startX + spikeW / 2;
      const endX = startX + spikeW;
      d += `M ${startX} ${spike.y + spike.height} L ${midX} ${spike.y} L ${endX} ${spike.y + spike.height} Z `;
    }
    return d;
  };

  // Ninja leg cycle calculations (smoothed sine/cosine)
  const legCycle = ninja.runCycle;
  const leg1Offset = Math.sin(legCycle) * 11;
  const leg2Offset = -Math.sin(legCycle) * 11;
  const scarfWave1 = Math.sin(legCycle * 0.85) * 8;
  const scarfWave2 = Math.cos(legCycle * 0.85) * 10;

  return (
    <Canvas style={{ width, height, backgroundColor: '#070714' }}>
      {/* 1. Cyberpunk Parallax Grid (High-Performance 60FPS) */}
      <Group>
        {Array.from({ length: numGridLines }).map((_, i) => {
          const gx = gridOffsetX + i * gridSpacing;
          return (
            <Rect
              key={`grid_v_${i}`}
              x={gx}
              y={0}
              width={1}
              height={height}
              color="rgba(0, 240, 255, 0.05)"
            />
          );
        })}
        {Array.from({ length: 6 }).map((_, i) => {
          const gy = (height / 5) * i;
          return (
            <Rect
              key={`grid_h_${i}`}
              x={0}
              y={gy}
              width={width}
              height={1}
              color="rgba(0, 240, 255, 0.05)"
            />
          );
        })}
      </Group>

      {/* 2. World Space Elements (Shifted by cameraX) */}
      <Group transform={[{ translateX: -cameraX }]}>
        {/* Initial Safety Ground */}
        {groundBodies.map((gb, i) => {
          const w = gb.customWidth || 1400;
          const halfW = w / 2;
          return (
            <Group key={`ground_${i}`}>
              {/* Outer soft glow */}
              <Rect
                x={gb.position.x - halfW}
                y={gb.position.y - 12}
                width={w}
                height={24}
                color="rgba(0, 240, 255, 0.25)"
              />
              {/* Solid runway platform */}
              <Rect
                x={gb.position.x - halfW}
                y={gb.position.y - 10}
                width={w}
                height={20}
                color="#00C8FF"
              />
              {/* Runway Top Neon Strip */}
              <Rect
                x={gb.position.x - halfW}
                y={gb.position.y - 10}
                width={w}
                height={3}
                color="#FFFFFF"
              />
            </Group>
          );
        })}

        {/* Anti-Draw Zones (Red hazard zones) */}
        {antiDrawZones.map((zone) => (
          <Group key={zone.id}>
            {/* Background tint */}
            <Rect
              x={zone.x}
              y={zone.y}
              width={zone.width}
              height={zone.height}
              color="rgba(255, 23, 68, 0.18)"
            />
            {/* Outer border glow */}
            <Rect
              x={zone.x - 2}
              y={zone.y - 2}
              width={zone.width + 4}
              height={zone.height + 4}
              style="stroke"
              strokeWidth={4}
              color="rgba(255, 23, 68, 0.3)"
            />
            {/* Solid sharp border */}
            <Rect
              x={zone.x}
              y={zone.y}
              width={zone.width}
              height={zone.height}
              style="stroke"
              strokeWidth={2}
              color="#FF1744"
            />
            {/* Diagonal Caution Pattern */}
            <Path
              path={`M ${zone.x} ${zone.y} L ${zone.x + zone.width} ${zone.y + zone.height} M ${zone.x + zone.width} ${zone.y} L ${zone.x} ${zone.y + zone.height}`}
              style="stroke"
              strokeWidth={1.5}
              color="rgba(255, 23, 68, 0.45)"
            />
          </Group>
        ))}

        {/* Drawn Lines - Multi-Stroke Neon (Super fast & ultra crisp) */}
        {lines.map((line) => (
          <Group key={line.id}>
            {/* 1. Outer Neon Aura */}
            <Path
              path={line.skPath}
              style="stroke"
              strokeWidth={GameConfig.LINE_GLOW_THICKNESS}
              color={trailStyle.glowColor}
              opacity={0.3}
              strokeCap="round"
              strokeJoin="round"
            />
            {/* 2. Vibrant Mid Stroke */}
            <Path
              path={line.skPath}
              style="stroke"
              strokeWidth={GameConfig.LINE_RENDER_THICKNESS + 2}
              color={trailStyle.primaryColor}
              opacity={0.8}
              strokeCap="round"
              strokeJoin="round"
            />
            {/* 3. Razor Sharp Core */}
            <Path
              path={line.skPath}
              style="stroke"
              strokeWidth={2.5}
              color="#FFFFFF"
              strokeCap="round"
              strokeJoin="round"
            />
          </Group>
        ))}

        {/* Active Line (currently being drawn) */}
        {activeLinePath && (
          <Group>
            <Path
              path={activeLinePath}
              style="stroke"
              strokeWidth={GameConfig.LINE_GLOW_THICKNESS + 2}
              color={trailStyle.glowColor}
              opacity={0.45}
              strokeCap="round"
            />
            <Path
              path={activeLinePath}
              style="stroke"
              strokeWidth={GameConfig.LINE_RENDER_THICKNESS + 2}
              color={trailStyle.primaryColor}
              strokeCap="round"
            />
            <Path
              path={activeLinePath}
              style="stroke"
              strokeWidth={2.5}
              color="#FFFFFF"
              strokeCap="round"
            />
          </Group>
        )}

        {/* Obstacles: Lasers */}
        {lasers.map((laser) => (
          <Group key={laser.id}>
            {/* Laser Beam Outer Glow */}
            <Rect
              x={laser.x - (laser.isVertical ? 4 : 0)}
              y={laser.y - (laser.isVertical ? 0 : 4)}
              width={laser.width + (laser.isVertical ? 8 : 0)}
              height={laser.height + (laser.isVertical ? 0 : 8)}
              color="rgba(255, 42, 109, 0.35)"
            />
            {/* Laser Main Body */}
            <Rect
              x={laser.x}
              y={laser.y}
              width={laser.width}
              height={laser.height}
              color="#FF2A6D"
            />
            {/* Laser White Core */}
            <Rect
              x={laser.isVertical ? laser.x + 3 : laser.x}
              y={laser.isVertical ? laser.y : laser.y + 3}
              width={laser.isVertical ? 6 : laser.width}
              height={laser.isVertical ? laser.height : 6}
              color="#FFFFFF"
            />
            {/* Emitter Caps */}
            <Circle
              cx={laser.x + (laser.isVertical ? laser.width / 2 : 0)}
              cy={laser.y + (laser.isVertical ? 0 : laser.height / 2)}
              r={7}
              color="#FF007F"
            />
            <Circle
              cx={laser.x + (laser.isVertical ? laser.width / 2 : laser.width)}
              cy={laser.y + (laser.isVertical ? laser.height : laser.height / 2)}
              r={7}
              color="#FF007F"
            />
          </Group>
        ))}

        {/* Obstacles: Spikes */}
        {spikes.map((spike) => (
          <Group key={spike.id}>
            <Path path={createSpikeSvg(spike)} color="#FF1744" opacity={0.4} />
            <Path path={createSpikeSvg(spike)} color="#FF3D00" />
          </Group>
        ))}

        {/* Speed Booster Rings */}
        {boosters.map((booster) => (
          <Group key={booster.id} opacity={booster.collected ? 0.2 : 1}>
            {/* Outer Aura */}
            <Circle
              cx={booster.x + booster.radius}
              cy={booster.y + booster.radius}
              r={booster.radius + 4}
              style="stroke"
              strokeWidth={4}
              color="rgba(255, 0, 127, 0.3)"
            />
            {/* Main Ring */}
            <Circle
              cx={booster.x + booster.radius}
              cy={booster.y + booster.radius}
              r={booster.radius}
              style="stroke"
              strokeWidth={4}
              color="#FF007F"
            />
            {/* Inner Ring */}
            <Circle
              cx={booster.x + booster.radius}
              cy={booster.y + booster.radius}
              r={booster.radius - 3}
              style="stroke"
              strokeWidth={2}
              color="#00F0FF"
            />
            {/* Center Speed Chevron */}
            <Path
              path={`M ${booster.x + booster.radius - 7} ${booster.y + booster.radius - 6} L ${booster.x + booster.radius + 5} ${booster.y + booster.radius} L ${booster.x + booster.radius - 7} ${booster.y + booster.radius + 6}`}
              style="stroke"
              strokeWidth={3}
              color="#FFFFFF"
            />
          </Group>
        ))}

        {/* Collectibles: Ink Orbs & Coins */}
        {collectibles.map((item) => {
          if (item.collected) return null;

          if (item.type === 'ink_orb') {
            return (
              <Group key={item.id}>
                {/* Outer Glow */}
                <Circle cx={item.x} cy={item.y} r={20} color="rgba(0, 240, 255, 0.25)" />
                {/* Capsule Shell */}
                <Circle cx={item.x} cy={item.y} r={14} color="#05D9E8" />
                {/* Ink Core */}
                <Circle cx={item.x} cy={item.y} r={9} color="#005691" />
                {/* Glass Reflection Highlight */}
                <Circle cx={item.x - 3} cy={item.y - 4} r={3.5} color="#FFFFFF" opacity={0.9} />
              </Group>
            );
          }

          // Coin / Gem
          return (
            <Group key={item.id}>
              {/* Outer Aura */}
              <Circle cx={item.x} cy={item.y} r={16} color="rgba(255, 230, 0, 0.25)" />
              {/* Diamond shape */}
              <Path
                path={`M ${item.x} ${item.y - 11} L ${item.x + 10} ${item.y} L ${item.x} ${item.y + 11} L ${item.x - 10} ${item.y} Z`}
                color="#FFE600"
              />
              <Path
                path={`M ${item.x} ${item.y - 6} L ${item.x + 5} ${item.y} L ${item.x} ${item.y + 6} L ${item.x - 5} ${item.y} Z`}
                color="#FFFFFF"
                opacity={0.85}
              />
            </Group>
          );
        })}

        {/* Particles */}
        {particles.map((p, i) => (
          <Circle
            key={`particle_${i}`}
            cx={p.x}
            cy={p.y}
            r={p.size}
            color={p.color}
            opacity={1 - p.life / p.maxLife}
          />
        ))}

        {/* 3. PRO CYBER NINJA (Sharp, High-Contrast & Beautiful) */}
        <Group
          transform={[
            { translateX: ninja.x },
            { translateY: ninja.y },
            { rotate: ninja.angle },
          ]}
        >
          {/* Booster Speed Echo Ghost */}
          {isBoosting && (
            <Group transform={[{ translateX: -24 }]} opacity={0.4}>
              <Circle cx={0} cy={-12} r={12} color={trailStyle.glowColor} />
              <Path path="M -10 -4 L 10 -4 L 6 18 L -6 18 Z" color={trailStyle.glowColor} />
            </Group>
          )}

          {/* Twin Flowing Cyber Scarf */}
          {/* Upper Ribbon */}
          <Path
            path={`M -8 -10 Q -24 ${-16 + scarfWave1} -44 ${-10 + scarfWave2} L -44 ${-6 + scarfWave2} Q -24 ${-12 + scarfWave1} -8 -6 Z`}
            color={ninjaSkin.scarfColor}
          />
          {/* Lower Ribbon */}
          <Path
            path={`M -8 -6 Q -22 ${-8 + Math.sin(legCycle * 0.85 + 1) * 7} -38 ${-2 + Math.cos(legCycle * 0.85 + 1) * 9} L -38 2 Q -22 -4 -8 -3 Z`}
            color={ninjaSkin.scarfColor}
            opacity={0.75}
          />

          {/* Katana on Back */}
          <Path
            path="M -14 -18 L 8 14"
            style="stroke"
            strokeWidth={4}
            strokeCap="round"
            color="#1F2430"
          />
          {/* Glowing Plasma Edge */}
          <Path
            path="M -16 -22 L 6 10"
            style="stroke"
            strokeWidth={2}
            color={ninjaSkin.accentColor}
          />
          {/* Katana Hilt */}
          <Circle cx={-15} cy={-20} r={3} color="#FFFFFF" />

          {/* Back Leg (Darker tone for perspective depth) */}
          <Group opacity={0.8}>
            {/* Thigh */}
            <Path
              path={`M -2 10 L ${-6 + leg2Offset * 0.8} 20`}
              style="stroke"
              strokeWidth={6}
              strokeCap="round"
              color="#181B2E"
            />
            {/* Calf & Foot */}
            <Path
              path={`M ${-6 + leg2Offset * 0.8} 20 L ${-2 + leg2Offset} 30 L ${4 + leg2Offset} 30`}
              style="stroke"
              strokeWidth={5}
              strokeCap="round"
              color="#181B2E"
            />
            {/* Cyber Boot Neon Sole */}
            <Path
              path={`M ${-2 + leg2Offset} 30 L ${4 + leg2Offset} 30`}
              style="stroke"
              strokeWidth={3}
              color={ninjaSkin.accentColor}
            />
          </Group>

          {/* Torso: Dark High-Tech Suit with strong outline */}
          <Path
            path="M -10 -6 L 10 -6 L 7 14 L -7 14 Z"
            color={ninjaSkin.suitColor}
          />
          {/* Neon Armor Chestplate & Collar */}
          <Path
            path="M -8 -5 L 8 -5 L 5 4 L -5 4 Z"
            color={ninjaSkin.accentColor}
            opacity={0.9}
          />
          {/* Core Reactor Dot */}
          <Circle cx={0} cy={-1} r={2.5} color="#FFFFFF" />
          {/* Utility Belt */}
          <Path
            path="M -8 11 L 8 11"
            style="stroke"
            strokeWidth={3}
            color={ninjaSkin.accentColor}
          />

          {/* Front Leg (Foreground) */}
          <Group>
            {/* Thigh */}
            <Path
              path={`M 2 10 L ${4 + leg1Offset * 0.8} 20`}
              style="stroke"
              strokeWidth={6.5}
              strokeCap="round"
              color="#252C48"
            />
            {/* Calf */}
            <Path
              path={`M ${4 + leg1Offset * 0.8} 20 L ${6 + leg1Offset} 30 L ${13 + leg1Offset} 30`}
              style="stroke"
              strokeWidth={5.5}
              strokeCap="round"
              color="#252C48"
            />
            {/* Cyber Boot Sole & Neon Line */}
            <Path
              path={`M ${6 + leg1Offset} 30 L ${13 + leg1Offset} 30`}
              style="stroke"
              strokeWidth={3.5}
              strokeCap="round"
              color={ninjaSkin.accentColor}
            />
          </Group>

          {/* Head & Shinobi Helmet */}
          <Circle cx={2} cy={-14} r={10.5} color={ninjaSkin.suitColor} />
          {/* Outer Helmet Brow */}
          <Path
            path="M -6 -20 L 8 -20 L 11 -12 L 5 -6 L -5 -6 Z"
            color="#252C48"
          />
          {/* Glowing Cyber Visor (Wide futuristic slit) */}
          <Path
            path="M 1 -15 L 12 -15"
            style="stroke"
            strokeWidth={3.5}
            strokeCap="round"
            color={ninjaSkin.accentColor}
          />
          {/* Visor White Laser Highlight */}
          <Path
            path="M 3 -15 L 11 -15"
            style="stroke"
            strokeWidth={1.5}
            color="#FFFFFF"
          />

          {/* Running Arms */}
          {/* Back arm */}
          <Path
            path={`M -6 -2 L ${-14 - leg1Offset * 0.5} 6 L ${-18 - leg1Offset * 0.5} 2`}
            style="stroke"
            strokeWidth={4}
            strokeCap="round"
            color="#181B2E"
          />
          {/* Front arm */}
          <Path
            path={`M 6 -2 L ${14 + leg1Offset * 0.5} 4 L ${18 + leg1Offset * 0.5} -1`}
            style="stroke"
            strokeWidth={4.5}
            strokeCap="round"
            color="#252C48"
          />
          {/* Cyber Gauntlet Accent */}
          <Circle cx={17 + leg1Offset * 0.5} cy={-0.5} r={3} color={ninjaSkin.accentColor} />
        </Group>
      </Group>
    </Canvas>
  );
};
