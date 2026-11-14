import React, { useMemo } from 'react';
import {
  Canvas,
  Circle,
  Group,
  LinearGradient,
  Path,
  Rect,
  vec,
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
  shakeX?: number;
  shakeY?: number;
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

// Precalculated building definitions for 60 FPS Skia Parallax
const FAR_WIDTH = 760;
const FAR_BUILDINGS = [
  { x: 15, w: 85, h: 210, spireH: 40 },
  { x: 120, w: 105, h: 260, spireH: 50 },
  { x: 245, w: 75, h: 185, spireH: 30 },
  { x: 340, w: 120, h: 290, spireH: 55 },
  { x: 480, w: 90, h: 215, spireH: 35 },
  { x: 590, w: 140, h: 250, spireH: 45 },
];

const MID_WIDTH = 960;
const MID_BUILDINGS = [
  {
    x: 10,
    w: 85,
    h: 175,
    billboard: { x: 20, y: 25, w: 50, h: 22, color: '#00F0FF' },
    windows: [
      { x: 18, y: 65 }, { x: 38, y: 65 }, { x: 58, y: 65 },
      { x: 18, y: 90 }, { x: 38, y: 90 }, { x: 58, y: 90 },
      { x: 18, y: 115 }, { x: 38, y: 115 }, { x: 58, y: 115 },
      { x: 18, y: 140 }, { x: 38, y: 140 }, { x: 58, y: 140 },
    ],
  },
  {
    x: 115,
    w: 105,
    h: 235,
    windows: [
      { x: 18, y: 25 }, { x: 45, y: 25 }, { x: 72, y: 25 },
      { x: 18, y: 50 }, { x: 45, y: 50 }, { x: 72, y: 50 },
      { x: 18, y: 75 }, { x: 45, y: 75 }, { x: 72, y: 75 },
      { x: 18, y: 100 }, { x: 45, y: 100 }, { x: 72, y: 100 },
      { x: 18, y: 125 }, { x: 45, y: 125 }, { x: 72, y: 125 },
      { x: 18, y: 150 }, { x: 45, y: 150 }, { x: 72, y: 150 },
      { x: 18, y: 175 }, { x: 45, y: 175 }, { x: 72, y: 175 },
      { x: 18, y: 200 }, { x: 45, y: 200 }, { x: 72, y: 200 },
    ],
  },
  {
    x: 240,
    w: 75,
    h: 155,
    billboard: { x: 14, y: 20, w: 45, h: 18, color: '#FF007F' },
    windows: [
      { x: 18, y: 55 }, { x: 45, y: 55 },
      { x: 18, y: 80 }, { x: 45, y: 80 },
      { x: 18, y: 105 }, { x: 45, y: 105 },
      { x: 18, y: 130 }, { x: 45, y: 130 },
    ],
  },
  {
    x: 335,
    w: 125,
    h: 265,
    billboard: { x: 22, y: 18, w: 80, h: 28, color: '#FFE600' },
    windows: [
      { x: 18, y: 60 }, { x: 45, y: 60 }, { x: 72, y: 60 }, { x: 98, y: 60 },
      { x: 18, y: 85 }, { x: 45, y: 85 }, { x: 72, y: 85 }, { x: 98, y: 85 },
      { x: 18, y: 110 }, { x: 45, y: 110 }, { x: 72, y: 110 }, { x: 98, y: 110 },
      { x: 18, y: 135 }, { x: 45, y: 135 }, { x: 72, y: 135 }, { x: 98, y: 135 },
      { x: 18, y: 160 }, { x: 45, y: 160 }, { x: 72, y: 160 }, { x: 98, y: 160 },
      { x: 18, y: 185 }, { x: 45, y: 185 }, { x: 72, y: 185 }, { x: 98, y: 185 },
      { x: 18, y: 210 }, { x: 45, y: 210 }, { x: 72, y: 210 }, { x: 98, y: 210 },
      { x: 18, y: 235 }, { x: 45, y: 235 }, { x: 72, y: 235 }, { x: 98, y: 235 },
    ],
  },
  {
    x: 480,
    w: 85,
    h: 190,
    windows: [
      { x: 18, y: 30 }, { x: 42, y: 30 }, { x: 65, y: 30 },
      { x: 18, y: 55 }, { x: 42, y: 55 }, { x: 65, y: 55 },
      { x: 18, y: 80 }, { x: 42, y: 80 }, { x: 65, y: 80 },
      { x: 18, y: 105 }, { x: 42, y: 105 }, { x: 65, y: 105 },
      { x: 18, y: 130 }, { x: 42, y: 130 }, { x: 65, y: 130 },
      { x: 18, y: 155 }, { x: 42, y: 155 }, { x: 65, y: 155 },
    ],
  },
  {
    x: 585,
    w: 135,
    h: 245,
    billboard: { x: 25, y: 20, w: 85, h: 26, color: '#00F0FF' },
    windows: [
      { x: 18, y: 60 }, { x: 48, y: 60 }, { x: 78, y: 60 }, { x: 105, y: 60 },
      { x: 18, y: 85 }, { x: 48, y: 85 }, { x: 78, y: 85 }, { x: 105, y: 85 },
      { x: 18, y: 110 }, { x: 48, y: 110 }, { x: 78, y: 110 }, { x: 105, y: 110 },
      { x: 18, y: 135 }, { x: 48, y: 135 }, { x: 78, y: 135 }, { x: 105, y: 135 },
      { x: 18, y: 160 }, { x: 48, y: 160 }, { x: 78, y: 160 }, { x: 105, y: 160 },
      { x: 18, y: 185 }, { x: 48, y: 185 }, { x: 78, y: 185 }, { x: 105, y: 185 },
      { x: 18, y: 210 }, { x: 48, y: 210 }, { x: 78, y: 210 }, { x: 105, y: 210 },
    ],
  },
  {
    x: 740,
    w: 95,
    h: 205,
    windows: [
      { x: 18, y: 35 }, { x: 45, y: 35 }, { x: 70, y: 35 },
      { x: 18, y: 60 }, { x: 45, y: 60 }, { x: 70, y: 60 },
      { x: 18, y: 85 }, { x: 45, y: 85 }, { x: 70, y: 85 },
      { x: 18, y: 110 }, { x: 45, y: 110 }, { x: 70, y: 110 },
      { x: 18, y: 135 }, { x: 45, y: 135 }, { x: 70, y: 135 },
      { x: 18, y: 160 }, { x: 45, y: 160 }, { x: 70, y: 160 },
    ],
  },
  {
    x: 855,
    w: 85,
    h: 170,
    billboard: { x: 15, y: 18, w: 55, h: 20, color: '#FF007F' },
    windows: [
      { x: 18, y: 50 }, { x: 50, y: 50 },
      { x: 18, y: 75 }, { x: 50, y: 75 },
      { x: 18, y: 100 }, { x: 50, y: 100 },
      { x: 18, y: 125 }, { x: 50, y: 125 },
    ],
  },
];

const NEAR_WIDTH = 800;
const NEAR_BUILDINGS = [
  { x: 0, w: 110, h: 105 },
  { x: 130, w: 90, h: 75 },
  { x: 240, w: 140, h: 125 },
  { x: 400, w: 95, h: 85 },
  { x: 515, w: 125, h: 115 },
  { x: 660, w: 115, h: 80 },
];

export const GameCanvas: React.FC<GameCanvasProps> = ({
  width,
  height,
  cameraX,
  shakeX = 0,
  shakeY = 0,
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
  // Parallax offsets & horizon reference
  const horizonY = height * 0.75;
  const farOffsetX = -(cameraX * 0.05 + shakeX * 0.2) % FAR_WIDTH;
  const midOffsetX = -(cameraX * 0.14 + shakeX * 0.3) % MID_WIDTH;
  const nearOffsetX = -(cameraX * 0.28 + shakeX * 0.4) % NEAR_WIDTH;

  const sunX = width * 0.78 - ((cameraX * 0.015) % 50) + shakeX * 0.1;
  const sunY = height * 0.24 + shakeY * 0.1;

  // Floor grid lines
  const gridSpacing = 70;
  const gridOffsetX = -(cameraX * 0.45 + shakeX * 0.5) % gridSpacing;
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
      {/* 1. Deep Cyberpunk Sky Gradient */}
      <Rect x={0} y={0} width={width} height={height}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(0, height)}
          colors={['#050512', '#0D0822', '#1B0C38', '#080516']}
        />
      </Rect>

      {/* 2. Retro Synthwave Sun */}
      <Group transform={[{ translateX: sunX }, { translateY: sunY }]}>
        <Circle cx={0} cy={0} r={58} color="rgba(255, 0, 127, 0.12)" />
        <Circle cx={0} cy={0} r={48} color="rgba(255, 0, 127, 0.28)" />
        <Circle cx={0} cy={0} r={40} color="#FF007F" />
        <Circle cx={0} cy={0} r={32} color="#FF55B0" />
        <Circle cx={0} cy={0} r={22} color="#FFA8DC" />

        {/* 80s Outrun Sun Horizontal Scanline Cuts */}
        <Rect x={-45} y={6} width={90} height={3} color="#070714" />
        <Rect x={-45} y={14} width={90} height={4.5} color="#070714" />
        <Rect x={-45} y={24} width={90} height={6} color="#070714" />
        <Rect x={-45} y={35} width={90} height={8} color="#070714" />
      </Group>

      {/* 3. Parallax Layer 1: Far Distance Megacity Silhouettes */}
      {[0, FAR_WIDTH].map((layerShift, k) => (
        <Group key={`far_layer_${k}`} transform={[{ translateX: farOffsetX + layerShift }]}>
          {FAR_BUILDINGS.map((b, i) => (
            <Group key={`far_b_${i}`}>
              <Rect
                x={b.x}
                y={horizonY - b.h}
                width={b.w}
                height={b.h}
                color="rgba(19, 12, 42, 0.88)"
              />
              {/* Antenna Spire */}
              <Rect
                x={b.x + b.w / 2 - 1}
                y={horizonY - b.h - b.spireH}
                width={2}
                height={b.spireH}
                color="rgba(19, 12, 42, 0.95)"
              />
              {/* Aircraft Beacon Light */}
              <Circle
                cx={b.x + b.w / 2}
                cy={horizonY - b.h - b.spireH}
                r={2}
                color={i % 2 === 0 ? '#FF1744' : '#00F0FF'}
              />
            </Group>
          ))}
        </Group>
      ))}

      {/* 4. Parallax Layer 2: Mid-ground Skyscraper Skyline with Windows & Billboards */}
      {[0, MID_WIDTH].map((layerShift, k) => (
        <Group key={`mid_layer_${k}`} transform={[{ translateX: midOffsetX + layerShift }]}>
          {MID_BUILDINGS.map((b, i) => (
            <Group key={`mid_b_${i}`}>
              {/* Building Body */}
              <Rect
                x={b.x}
                y={horizonY - b.h}
                width={b.w}
                height={b.h}
                color="#0E0F28"
              />
              {/* Roof Trim */}
              <Rect
                x={b.x}
                y={horizonY - b.h}
                width={b.w}
                height={3}
                color="#1E224D"
              />

              {/* Holographic Billboard */}
              {b.billboard && (
                <Group>
                  <Rect
                    x={b.x + b.billboard.x}
                    y={horizonY - b.h + b.billboard.y}
                    width={b.billboard.w}
                    height={b.billboard.h}
                    color={`${b.billboard.color}22`}
                  />
                  <Rect
                    x={b.x + b.billboard.x}
                    y={horizonY - b.h + b.billboard.y}
                    width={b.billboard.w}
                    height={2}
                    color={b.billboard.color}
                  />
                  <Rect
                    x={b.x + b.billboard.x}
                    y={horizonY - b.h + b.billboard.y + b.billboard.h - 2}
                    width={b.billboard.w}
                    height={2}
                    color={b.billboard.color}
                  />
                </Group>
              )}

              {/* Glowing Cyber Windows */}
              {b.windows.map((w, wi) => (
                <Rect
                  key={`win_${i}_${wi}`}
                  x={b.x + w.x}
                  y={horizonY - b.h + w.y}
                  width={4}
                  height={5}
                  color={wi % 3 === 0 ? 'rgba(255, 0, 127, 0.45)' : 'rgba(0, 240, 255, 0.5)'}
                />
              ))}
            </Group>
          ))}
        </Group>
      ))}

      {/* 5. Parallax Layer 3: Near Industrial Overpasses & Structures */}
      {[0, NEAR_WIDTH].map((layerShift, k) => (
        <Group key={`near_layer_${k}`} transform={[{ translateX: nearOffsetX + layerShift }]}>
          {NEAR_BUILDINGS.map((b, i) => (
            <Group key={`near_b_${i}`}>
              <Rect
                x={b.x}
                y={horizonY - b.h}
                width={b.w}
                height={b.h}
                color="#070817"
              />
              {/* Neon Rim Light on Top Edge */}
              <Rect
                x={b.x}
                y={horizonY - b.h}
                width={b.w}
                height={2}
                color="rgba(0, 240, 255, 0.4)"
              />
            </Group>
          ))}
        </Group>
      ))}

      {/* 6. Horizon Cyberpunk Smog & Ambient Glow */}
      <Rect
        x={0}
        y={horizonY - 50}
        width={width}
        height={80}
        color="rgba(255, 0, 127, 0.06)"
      />
      <Rect
        x={0}
        y={horizonY - 20}
        width={width}
        height={35}
        color="rgba(0, 240, 255, 0.08)"
      />

      {/* 7. Foreground Receding Cyber Grid */}
      <Group>
        {Array.from({ length: numGridLines }).map((_, i) => {
          const gx = gridOffsetX + i * gridSpacing;
          return (
            <Rect
              key={`grid_v_${i}`}
              x={gx}
              y={horizonY - 30}
              width={1}
              height={height - (horizonY - 30)}
              color="rgba(0, 240, 255, 0.08)"
            />
          );
        })}
        {Array.from({ length: 5 }).map((_, i) => {
          const gy = horizonY + i * 28;
          return (
            <Rect
              key={`grid_h_${i}`}
              x={0}
              y={gy}
              width={width}
              height={1}
              color="rgba(0, 240, 255, 0.08)"
            />
          );
        })}
      </Group>

      {/* 8. World Space Elements (Shifted by cameraX and Screen Shake) */}
      <Group
        transform={[
          { translateX: -cameraX + shakeX },
          { translateY: shakeY },
        ]}
      >
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
        {lines.map((line) => {
          // Fast AABB culling: skip drawing if line is completely behind the screen
          if (line.points.length > 0) {
            const lastP = line.points[line.points.length - 1];
            if (lastP.x < cameraX - 50) return null;
          }
          return (
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
          );
        })}

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
