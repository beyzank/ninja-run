import Matter from 'matter-js';
import { CollisionCategory, GameConfig } from '../config/GameConfig';
import {
  AntiDrawZone,
  BoosterRing,
  CollectibleItem,
  LaserObstacle,
  SpikeObstacle,
} from '../types';

export interface LevelState {
  lasers: LaserObstacle[];
  spikes: SpikeObstacle[];
  boosters: BoosterRing[];
  antiDrawZones: AntiDrawZone[];
  collectibles: CollectibleItem[];
  groundBodies: Matter.Body[];
}

export class LevelGenerator {
  private lastGeneratedX = 0;
  private screenHeight: number;
  private world: Matter.World;

  constructor(world: Matter.World, screenHeight: number) {
    this.world = world;
    this.screenHeight = screenHeight;
  }

  reset(): LevelState {
    this.lastGeneratedX = 0;

    const runwayWidth = GameConfig.START_PLATFORM_WIDTH;
    const groundY = this.screenHeight * 0.75;

    // Create starting safety runway
    const startPlatform = Matter.Bodies.rectangle(
      runwayWidth / 2,
      groundY,
      runwayWidth,
      20,
      {
        isStatic: true,
        friction: 0.001,
        restitution: 0.08,
        collisionFilter: {
          category: CollisionCategory.GROUND,
          mask: CollisionCategory.NINJA,
        },
        label: 'starting_ground',
      }
    );
    (startPlatform as any).customWidth = runwayWidth;
    Matter.Composite.add(this.world, startPlatform);

    const state: LevelState = {
      lasers: [],
      spikes: [],
      boosters: [],
      antiDrawZones: [],
      collectibles: [],
      groundBodies: [startPlatform],
    };

    // Practice ink orbs & coins on the runway to clearly teach how ink is collected
    this.spawnInkOrb(350, groundY - 60, state);
    this.spawnCoin(480, groundY - 70, state);
    this.spawnInkOrb(700, groundY - 80, state);
    this.spawnCoin(880, groundY - 90, state);
    this.spawnInkOrb(1050, groundY - 80, state);
    this.spawnCoin(1200, groundY - 70, state);
    this.spawnInkOrb(1320, groundY - 60, state);

    this.lastGeneratedX = runwayWidth;

    return state;
  }

  generateChunk(
    cameraX: number,
    state: LevelState,
    score: number
  ): void {
    const targetX = cameraX + 1600;

    while (this.lastGeneratedX < targetX) {
      const chunkX = this.lastGeneratedX + 220;
      const isEarlyGame = chunkX < GameConfig.MIN_HAZARD_DISTANCE;
      const difficulty = Math.min(1.0, Math.max(0, (chunkX - GameConfig.MIN_HAZARD_DISTANCE) / 6000));

      if (isEarlyGame) {
        // Early game: only peaceful learning chunks (ink drops, ramps, gentle booster rings)
        if (Math.random() > 0.5) {
          this.spawnHighInkArc(chunkX, state);
          this.lastGeneratedX = chunkX + 320;
        } else {
          this.spawnBoosterChasm(chunkX, state);
          this.lastGeneratedX = chunkX + 420;
        }
        continue;
      }

      // Mid/Late game: procedural obstacles
      const roll = Math.random();

      if (roll < 0.25) {
        // Pattern: Spikes pit on the ground + floating ink orb to bridge over
        this.spawnSpikesWithBridgeIncentive(chunkX, state);
        this.lastGeneratedX = chunkX + 380;
      } else if (roll < 0.50) {
        // Pattern: Laser Gate (high or low) with bypass
        this.spawnLaserGate(chunkX, state, difficulty);
        this.lastGeneratedX = chunkX + 320;
      } else if (roll < 0.70) {
        // Pattern: Speed Booster Ring launch across gap
        this.spawnBoosterChasm(chunkX, state);
        this.lastGeneratedX = chunkX + 420;
      } else if (roll < 0.85) {
        // Pattern: Anti-Draw Zone blocking a direct line
        this.spawnAntiDrawChallenge(chunkX, state);
        this.lastGeneratedX = chunkX + 360;
      } else {
        // Pattern: High Altitude Ink Orbs & Coin trail
        this.spawnHighInkArc(chunkX, state);
        this.lastGeneratedX = chunkX + 300;
      }
    }
  }

  private spawnSpikesWithBridgeIncentive(chunkX: number, state: LevelState): void {
    const spikeY = this.screenHeight * 0.85;
    const spikeWidth = 140;
    const spikeHeight = 35;

    const body = Matter.Bodies.rectangle(
      chunkX + spikeWidth / 2,
      spikeY + spikeHeight / 2,
      spikeWidth,
      spikeHeight,
      {
        isStatic: true,
        isSensor: true,
        collisionFilter: {
          category: CollisionCategory.OBSTACLE,
          mask: CollisionCategory.NINJA,
        },
        label: 'spike',
      }
    );
    Matter.Composite.add(this.world, body);

    state.spikes.push({
      id: `spike_${Date.now()}_${Math.random()}`,
      type: 'spike',
      x: chunkX,
      y: spikeY,
      width: spikeWidth,
      height: spikeHeight,
      count: 4,
      body,
    });

    // Place an Ink Orb above the spikes to reward drawing high over them
    this.spawnInkOrb(chunkX + spikeWidth / 2, spikeY - 140, state);
  }

  private spawnLaserGate(chunkX: number, state: LevelState, difficulty: number): void {
    const isVertical = Math.random() > 0.4;
    const length = isVertical ? 160 : 180;
    const y = isVertical ? this.screenHeight * 0.35 : this.screenHeight * 0.58;

    const width = isVertical ? 12 : length;
    const height = isVertical ? length : 12;

    const body = Matter.Bodies.rectangle(
      chunkX + width / 2,
      y + height / 2,
      width,
      height,
      {
        isStatic: true,
        isSensor: true,
        collisionFilter: {
          category: CollisionCategory.OBSTACLE,
          mask: CollisionCategory.NINJA,
        },
        label: 'laser',
      }
    );
    Matter.Composite.add(this.world, body);

    state.lasers.push({
      id: `laser_${Date.now()}_${Math.random()}`,
      type: 'laser',
      x: chunkX,
      y,
      width,
      height,
      length,
      isVertical,
      body,
    });

    // Add Ink Orb and coin rewards around the laser
    this.spawnInkOrb(chunkX + (isVertical ? 40 : width / 2), y - 70, state);
    this.spawnCoin(chunkX + (isVertical ? 80 : width + 30), y - 30, state);
  }

  private spawnBoosterChasm(chunkX: number, state: LevelState): void {
    const ringRadius = 26;
    const ringY = this.screenHeight * 0.52;

    const body = Matter.Bodies.circle(chunkX, ringY, ringRadius, {
      isStatic: true,
      isSensor: true,
      collisionFilter: {
        category: CollisionCategory.BOOSTER,
        mask: CollisionCategory.NINJA,
      },
      label: 'booster',
    });
    Matter.Composite.add(this.world, body);

    state.boosters.push({
      id: `booster_${Date.now()}_${Math.random()}`,
      type: 'booster',
      x: chunkX - ringRadius,
      y: ringY - ringRadius,
      width: ringRadius * 2,
      height: ringRadius * 2,
      radius: ringRadius,
      collected: false,
      body,
    });

    // Ink Orb and coins following the forward boost trajectory
    this.spawnInkOrb(chunkX + 120, ringY - 35, state);
    for (let i = 1; i <= 3; i++) {
      this.spawnCoin(chunkX + i * 70, ringY - 15 - i * 10, state);
    }
  }

  private spawnAntiDrawChallenge(chunkX: number, state: LevelState): void {
    const zoneW = 120;
    const zoneH = 180;
    const zoneY = this.screenHeight * 0.38;

    state.antiDrawZones.push({
      id: `antidraw_${Date.now()}_${Math.random()}`,
      type: 'anti_draw',
      x: chunkX,
      y: zoneY,
      width: zoneW,
      height: zoneH,
      active: true,
    });

    // Ink orb right on top of the anti draw zone to force a high curve over it
    this.spawnInkOrb(chunkX + zoneW / 2, zoneY - 50, state);
  }

  private spawnHighInkArc(chunkX: number, state: LevelState): void {
    this.spawnInkOrb(chunkX, this.screenHeight * 0.42, state);
    this.spawnCoin(chunkX + 80, this.screenHeight * 0.46, state);
    this.spawnCoin(chunkX + 160, this.screenHeight * 0.52, state);
  }

  private spawnInkOrb(x: number, y: number, state: LevelState): void {
    const radius = 16;
    const body = Matter.Bodies.circle(x, y, radius, {
      isStatic: true,
      isSensor: true,
      collisionFilter: {
        category: CollisionCategory.COLLECTIBLE,
        mask: CollisionCategory.NINJA,
      },
      label: 'ink_orb',
    });
    Matter.Composite.add(this.world, body);

    state.collectibles.push({
      id: `ink_${Date.now()}_${Math.random()}`,
      type: 'ink_orb',
      x,
      y,
      width: radius * 2,
      height: radius * 2,
      value: 40,
      collected: false,
      baseY: y,
      phase: Math.random() * Math.PI * 2,
      body,
    });
  }

  private spawnCoin(x: number, y: number, state: LevelState): void {
    const radius = 12;
    const body = Matter.Bodies.circle(x, y, radius, {
      isStatic: true,
      isSensor: true,
      collisionFilter: {
        category: CollisionCategory.COLLECTIBLE,
        mask: CollisionCategory.NINJA,
      },
      label: 'coin',
    });
    Matter.Composite.add(this.world, body);

    state.collectibles.push({
      id: `coin_${Date.now()}_${Math.random()}`,
      type: 'coin',
      x,
      y,
      width: radius * 2,
      height: radius * 2,
      value: 1,
      collected: false,
      baseY: y,
      phase: Math.random() * Math.PI * 2,
      body,
    });
  }

  cleanupOffscreen(cameraX: number, state: LevelState): void {
    const despawnX = cameraX - 400;

    // Remove spikes
    state.spikes = state.spikes.filter((s) => {
      if (s.x + s.width < despawnX) {
        Matter.Composite.remove(this.world, s.body);
        return false;
      }
      return true;
    });

    // Remove lasers
    state.lasers = state.lasers.filter((l) => {
      if (l.x + l.width < despawnX) {
        Matter.Composite.remove(this.world, l.body);
        return false;
      }
      return true;
    });

    // Remove boosters
    state.boosters = state.boosters.filter((b) => {
      if (b.x + b.width < despawnX) {
        Matter.Composite.remove(this.world, b.body);
        return false;
      }
      return true;
    });

    // Remove anti draw zones
    state.antiDrawZones = state.antiDrawZones.filter(
      (z) => z.x + z.width >= despawnX
    );

    // Remove collectibles
    state.collectibles = state.collectibles.filter((c) => {
      if (c.x + c.width < despawnX || c.collected) {
        Matter.Composite.remove(this.world, c.body);
        return false;
      }
      return true;
    });

    // Remove ground platforms
    state.groundBodies = state.groundBodies.filter((gb) => {
      if (gb.position.x < despawnX) {
        Matter.Composite.remove(this.world, gb);
        return false;
      }
      return true;
    });
  }
}
