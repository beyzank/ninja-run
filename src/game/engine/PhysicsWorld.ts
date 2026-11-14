import Matter from 'matter-js';
import { CollisionCategory, GameConfig } from '../config/GameConfig';
import { HapticManager } from '../haptics/HapticManager';
import { SoundManager } from '../audio/SoundManager';
import {
  CollectibleItem,
  DrawnLine,
  GameStats,
  Particle,
  Point,
} from '../types';
import { LevelGenerator, LevelState } from './LevelGenerator';
import { LinePhysicsManager } from './LinePhysics';

export interface NinjaState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  isOnGround: boolean;
  isDead: boolean;
  runCycle: number;
}

export class PhysicsWorld {
  public engine: Matter.Engine;
  public world: Matter.World;
  public ninjaBody!: Matter.Body;
  public lineManager: LinePhysicsManager;
  public levelGenerator: LevelGenerator;
  public levelState: LevelState = {
    lasers: [],
    spikes: [],
    boosters: [],
    antiDrawZones: [],
    collectibles: [],
    groundBodies: [],
  };

  public lines: DrawnLine[] = [];
  public particles: Particle[] = [];
  public cameraX = 0;
  public screenWidth: number;
  public screenHeight: number;

  public stats: GameStats = {
    score: 0,
    highScore: 0,
    coins: 0,
    distance: 0,
    ink: GameConfig.MAX_INK,
    maxInk: GameConfig.MAX_INK,
    speed: GameConfig.BASE_SPEED_X,
    isBoosting: false,
  };

  public isDrawing = false;
  private boostTicksRemaining = 0;
  private isTouchingLine = false;
  private groundContacts = 0;
  private ninjaRunCycle = 0;
  private stuckTicks = 0;
  private smoothedAngle = 0;
  private onGameOverCallback?: (finalScore: number, coins: number) => void;

  constructor(
    screenWidth: number,
    screenHeight: number,
    onGameOver?: (finalScore: number, coins: number) => void
  ) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.onGameOverCallback = onGameOver;

    this.engine = Matter.Engine.create({
      gravity: { x: 0, y: GameConfig.GRAVITY_Y, scale: 0.0016 },
      positionIterations: 6,
      velocityIterations: 6,
    });
    this.world = this.engine.world;

    this.lineManager = new LinePhysicsManager(this.world);
    this.levelGenerator = new LevelGenerator(this.world, screenHeight);

    this.setupCollisionHandlers();
  }

  init(highScore: number, currentCoins: number): void {
    Matter.World.clear(this.world, false);

    // Reset lines
    this.lines = [];
    this.particles = [];
    this.cameraX = 0;
    this.boostTicksRemaining = 0;
    this.isTouchingLine = false;
    this.groundContacts = 0;
    this.ninjaRunCycle = 0;
    this.stuckTicks = 0;
    this.smoothedAngle = 0;
    this.isDrawing = false;

    // Reset stats
    this.stats = {
      score: 0,
      highScore,
      coins: currentCoins,
      distance: 0,
      ink: GameConfig.MAX_INK,
      maxInk: GameConfig.MAX_INK,
      speed: GameConfig.BASE_SPEED_X,
      isBoosting: false,
    };

    // Create starting ground & level
    this.levelState = this.levelGenerator.reset();

    // Spawn Ninja
    this.spawnNinja(150, this.screenHeight * 0.75 - 50);
  }

  private spawnNinja(x: number, y: number): void {
    // Compound Capsule Collider with rounded foot circle
    // Pure circular bottom prevents any ghost edge catching on line seams!
    const r = 13;
    const footCircle = Matter.Bodies.circle(x, y + 10, r, {
      friction: 0.001,
      restitution: 0.04,
      label: 'ninja',
    });
    const headCircle = Matter.Bodies.circle(x, y - 10, r, {
      friction: 0.001,
      restitution: 0.04,
      label: 'ninja',
    });
    const bodyBox = Matter.Bodies.rectangle(x, y, r * 2, 20, {
      friction: 0.001,
      restitution: 0.04,
      label: 'ninja',
    });

    this.ninjaBody = Matter.Body.create({
      parts: [bodyBox, footCircle, headCircle],
      friction: 0.001,
      frictionAir: 0.001,
      restitution: 0.04,
      collisionFilter: {
        category: CollisionCategory.NINJA,
        mask:
          CollisionCategory.DRAWN_LINE |
          CollisionCategory.GROUND |
          CollisionCategory.OBSTACLE |
          CollisionCategory.COLLECTIBLE |
          CollisionCategory.BOOSTER,
      },
      label: 'ninja',
    });

    // Lock upright orientation
    Matter.Body.setInertia(this.ninjaBody, Infinity);
    Matter.Composite.add(this.world, this.ninjaBody);
  }

  private setupCollisionHandlers(): void {
    const isNinja = (b: Matter.Body) =>
      b.label === 'ninja' || b.parent?.label === 'ninja';

    Matter.Events.on(this.engine, 'collisionStart', (event) => {
      for (const pair of event.pairs) {
        const { bodyA, bodyB } = pair;
        const other = isNinja(bodyA) ? bodyB : isNinja(bodyB) ? bodyA : null;

        if (!other) continue;

        if (other.label === 'drawn_segment' || other.label === 'starting_ground') {
          this.groundContacts++;
          this.isTouchingLine = true;
          this.emitLandingSparks(this.ninjaBody.position.x, this.ninjaBody.position.y + 22);
        } else if (other.label === 'laser' || other.label === 'spike') {
          this.triggerGameOver();
        } else if (other.label === 'ink_orb') {
          this.handleCollectInk(other);
        } else if (other.label === 'coin') {
          this.handleCollectCoin(other);
        } else if (other.label === 'booster') {
          this.handleBooster(other);
        }
      }
    });

    Matter.Events.on(this.engine, 'collisionEnd', (event) => {
      for (const pair of event.pairs) {
        const { bodyA, bodyB } = pair;
        const other = isNinja(bodyA) ? bodyB : isNinja(bodyB) ? bodyA : null;

        if (!other) continue;

        if (other.label === 'drawn_segment' || other.label === 'starting_ground') {
          this.groundContacts = Math.max(0, this.groundContacts - 1);
          this.isTouchingLine = this.groundContacts > 0;
        }
      }
    });
  }

  private handleCollectInk(body: Matter.Body): void {
    const item = this.levelState.collectibles.find((c) => c.body === body && !c.collected);
    if (!item) return;

    item.collected = true;
    this.stats.ink = Math.min(this.stats.maxInk, this.stats.ink + GameConfig.INK_ORB_RESTORE);
    this.stats.score += 75;

    SoundManager.playInkCollect();
    HapticManager.medium();
    this.emitInkSplash(item.x, item.y);
  }

  private handleCollectCoin(body: Matter.Body): void {
    const item = this.levelState.collectibles.find((c) => c.body === body && !c.collected);
    if (!item) return;

    item.collected = true;
    this.stats.coins += 1;
    this.stats.score += 50;

    SoundManager.playCoinCollect();
    HapticManager.light();
    this.emitCoinGlow(item.x, item.y);
  }

  private handleBooster(body: Matter.Body): void {
    const booster = this.levelState.boosters.find((b) => b.body === body && !b.collected);
    if (!booster) return;

    booster.collected = true;
    this.boostTicksRemaining = GameConfig.BOOST_DURATION_TICKS;
    this.stats.score += 150;

    // Direct impulse forward
    Matter.Body.setVelocity(this.ninjaBody, {
      x: this.stats.speed * GameConfig.BOOST_SPEED_MULTIPLIER,
      y: Math.min(-4, this.ninjaBody.velocity.y - 4),
    });

    SoundManager.playBooster();
    HapticManager.success();
    this.emitSonicBoom(booster.x + booster.radius, booster.y + booster.radius);
  }

  private triggerGameOver(): void {
    if (this.stats.isBoosting) {
      this.boostTicksRemaining = 0;
      this.stats.isBoosting = false;
      HapticManager.heavy();
      SoundManager.playCrash();
      this.emitCrashDebris(this.ninjaBody.position.x, this.ninjaBody.position.y);
      return;
    }

    HapticManager.error();
    SoundManager.playCrash();
    this.emitCrashDebris(this.ninjaBody.position.x, this.ninjaBody.position.y);

    if (this.onGameOverCallback) {
      this.onGameOverCallback(this.stats.score, this.stats.coins);
    }
  }

  update(): void {
    // 1. Advance Matter Engine by 1/60s
    Matter.Engine.update(this.engine, 1000 / 60);

    // 1b. Passive Ink Regeneration: refills stamina when not drawing
    if (!this.isDrawing && this.stats.ink < this.stats.maxInk) {
      this.stats.ink = Math.min(
        this.stats.maxInk,
        this.stats.ink + GameConfig.PASSIVE_INK_REGEN
      );
    }

    // 2. Fall detection
    if (this.ninjaBody.position.y > this.screenHeight + 150) {
      this.triggerGameOver();
      return;
    }

    // 3. Speed & forward momentum management
    const isBoosting = this.boostTicksRemaining > 0;
    this.stats.isBoosting = isBoosting;

    if (isBoosting) {
      this.boostTicksRemaining--;
    }

    const currentBase = Math.min(
      GameConfig.MAX_SPEED_X,
      GameConfig.BASE_SPEED_X + this.stats.score * GameConfig.ACCELERATION_RATE
    );

    const targetSpeed = isBoosting
      ? currentBase * GameConfig.BOOST_SPEED_MULTIPLIER
      : currentBase;

    this.stats.speed = targetSpeed;

    // Decisive Forward Motor Drive:
    // Ensures ninja never stalls on slope transitions or segment joints!
    if (this.ninjaBody.velocity.x < targetSpeed) {
      Matter.Body.setVelocity(this.ninjaBody, {
        x: targetSpeed,
        y: this.ninjaBody.velocity.y,
      });
    }

    // Instant Stuck Auto-Hop:
    // If progress is blocked by a steep wall for > 0.5s (30 frames), hop over it!
    if (Math.abs(this.ninjaBody.velocity.x) < 0.8) {
      this.stuckTicks++;
      if (this.stuckTicks === 30) {
        Matter.Body.setVelocity(this.ninjaBody, {
          x: targetSpeed * 1.1,
          y: -6.0,
        });
      }
      if (this.stuckTicks > 120) {
        this.triggerGameOver();
        return;
      }
    } else {
      this.stuckTicks = 0;
    }

    // 4. Update distance & score
    this.stats.distance = Math.floor(this.ninjaBody.position.x);
    this.stats.score = Math.max(this.stats.score, Math.floor(this.stats.distance / 10));

    // 5. Camera follow system (smooth lookahead)
    const targetCameraX = this.ninjaBody.position.x - this.screenWidth * GameConfig.CAMERA_LOOKAHEAD_RATIO;
    this.cameraX += (targetCameraX - this.cameraX) * 0.12;

    // 6. Procedural generation & garbage collection
    this.levelGenerator.generateChunk(this.cameraX, this.levelState, this.stats.score);
    this.levelGenerator.cleanupOffscreen(this.cameraX, this.levelState);
    this.cleanupOffscreenLines();

    // 7. Update particles
    this.updateParticles();

    // 8. Update run cycle for animation & smooth aerodynamic tilt angle
    if (this.isTouchingLine) {
      this.ninjaRunCycle += this.ninjaBody.velocity.x * 0.12;
    }
    const vx = Math.max(1, this.ninjaBody.velocity.x);
    const targetAngle = Math.max(
      -0.6,
      Math.min(0.6, Math.atan2(this.ninjaBody.velocity.y, vx) * 0.45)
    );
    this.smoothedAngle += (targetAngle - this.smoothedAngle) * 0.18;

    // 9. Floating bobbing effect for collectibles
    for (const c of this.levelState.collectibles) {
      if (!c.collected) {
        c.phase += 0.05;
        c.y = c.baseY + Math.sin(c.phase) * 6;
      }
    }
  }

  private cleanupOffscreenLines(): void {
    const despawnX = this.cameraX - GameConfig.DESPAWN_OFFSET_X;

    // 1. Immediately remove offscreen segments from Matter world
    for (const line of this.lines) {
      line.segments = line.segments.filter((seg) => {
        if (Math.max(seg.p1.x, seg.p2.x) < despawnX) {
          Matter.Composite.remove(this.world, seg.body);
          return false;
        }
        return true;
      });
    }

    // 2. Retain only lines that still have visible points
    this.lines = this.lines.filter((line) => {
      const hasVisible = line.points.some((p) => p.x >= despawnX);
      if (!hasVisible) {
        for (const seg of line.segments) {
          Matter.Composite.remove(this.world, seg.body);
        }
        return false;
      }
      return true;
    });

    // 3. Strictly bound total line history to prevent memory leaks
    while (this.lines.length > GameConfig.MAX_ACTIVE_LINES) {
      const oldest = this.lines.shift();
      if (oldest) {
        for (const seg of oldest.segments) {
          Matter.Composite.remove(this.world, seg.body);
        }
      }
    }
  }

  getNinjaState(): NinjaState {
    return {
      x: this.ninjaBody.position.x,
      y: this.ninjaBody.position.y,
      vx: this.ninjaBody.velocity.x,
      vy: this.ninjaBody.velocity.y,
      angle: this.smoothedAngle,
      isOnGround: this.isTouchingLine,
      isDead: false,
      runCycle: this.ninjaRunCycle,
    };
  }

  // Lightweight Particle Emitters (Zero GC Churn)
  emitDrawSparks(worldX: number, worldY: number, color: string): void {
    if (this.particles.length >= GameConfig.MAX_PARTICLES) return;
    this.particles.push({
      x: worldX,
      y: worldY,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3,
      life: 1,
      maxLife: 14,
      size: Math.random() * 2 + 1.5,
      color,
    });
  }

  private emitLandingSparks(x: number, y: number): void {
    if (this.particles.length >= GameConfig.MAX_PARTICLES) return;
    for (let i = 0; i < 2; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.8) * 3,
        vy: -Math.random() * 2,
        life: 1,
        maxLife: 12,
        size: 2,
        color: '#00F0FF',
      });
    }
  }

  private emitInkSplash(x: number, y: number): void {
    const count = Math.min(8, GameConfig.MAX_PARTICLES - this.particles.length);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = Math.random() * 4 + 2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 1,
        maxLife: 20,
        size: Math.random() * 3 + 2,
        color: '#00F0FF',
      });
    }
  }

  private emitCoinGlow(x: number, y: number): void {
    const count = Math.min(6, GameConfig.MAX_PARTICLES - this.particles.length);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = Math.random() * 3 + 1;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 1,
        maxLife: 18,
        size: Math.random() * 2.5 + 1.5,
        color: '#FFE600',
      });
    }
  }

  private emitSonicBoom(x: number, y: number): void {
    const count = Math.min(10, GameConfig.MAX_PARTICLES - this.particles.length);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = Math.random() * 6 + 2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 1,
        maxLife: 22,
        size: Math.random() * 3.5 + 2,
        color: '#FF007F',
      });
    }
  }

  private emitCrashDebris(x: number, y: number): void {
    const count = Math.min(14, GameConfig.MAX_PARTICLES - this.particles.length);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = Math.random() * 6 + 2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 1,
        maxLife: 30,
        size: Math.random() * 4 + 2,
        color: i % 2 === 0 ? '#FF1744' : '#00F0FF',
      });
    }
  }

  private updateParticles(): void {
    this.particles = this.particles.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life++;
      p.size = Math.max(0, p.size * 0.94);
      return p.life < p.maxLife;
    });
  }
}
