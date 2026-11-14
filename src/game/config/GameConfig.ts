export const CollisionCategory = {
  DEFAULT: 0x0001,
  NINJA: 0x0002,
  DRAWN_LINE: 0x0004,
  OBSTACLE: 0x0008,
  COLLECTIBLE: 0x0010,
  BOOSTER: 0x0020,
  GROUND: 0x0040,
} as const;

export const GameConfig = {
  // Physics parameters
  GRAVITY_Y: 1.15,
  NINJA_WIDTH: 32,
  NINJA_HEIGHT: 48,
  NINJA_MASS: 2.5,
  NINJA_FRICTION: 0.005,
  NINJA_RESTITUTION: 0.12,

  // Speed and time-based acceleration
  BASE_SPEED_X: 3.8, // Calm, comfortable starting jog (~45 km/h) for easy line drawing
  MAX_SPEED_X: 13.2, // High-octane arcade top speed (~158 km/h)
  SPEED_INCREASE_PER_SECOND: 0.20, // Smooth, progressive acceleration (+2.0 speed every 10 seconds)
  BOOST_SPEED_MULTIPLIER: 1.45,
  BOOST_DURATION_TICKS: 85, // ~1.4 seconds
  START_PLATFORM_WIDTH: 1400, // Long runway to get the hang of drawing
  MIN_HAZARD_DISTANCE: 1800, // No lethal traps until player passes the tutorial runway

  // Ink & Drawing
  MAX_INK: 120, // Generous stamina capacity
  INK_CONSUMPTION_PER_PIXEL: 0.026, // Low consumption: allows long, flowing lines
  PASSIVE_INK_REGEN: 0.24, // Automatic recharge (~14% per second when not drawing)
  MIN_POINT_DISTANCE: 20, // Optimized vertex spacing (cuts body count & CPU load by 30%)
  LINE_PHYSICS_THICKNESS: 7,
  LINE_RENDER_THICKNESS: 5,
  LINE_GLOW_THICKNESS: 12,
  MAX_DRAW_POINTS_PER_LINE: 200,
  MAX_ACTIVE_LINES: 12, // Strict bound on line history to protect memory
  MAX_PARTICLES: 25, // Strict limit on active particles for zero GC stutter

  // Collectibles replenishment
  INK_ORB_RESTORE: 60, // Each orb restores 50% of the entire tank
  COIN_VALUE: 1,

  // Camera & view
  CAMERA_LOOKAHEAD_RATIO: 0.28, // Character positioned ~28% from the left
  DESPAWN_OFFSET_X: 320, // Swift cleanup of off-screen bodies
  SPAWN_AHEAD_DISTANCE: 1400, // spawn chunks ahead of camera

  // Cyberpunk Palette
  COLORS: {
    BACKGROUND_DARK: '#080812',
    BACKGROUND_GRID: '#131427',
    CYBER_CYAN: '#00F0FF',
    CYBER_MAGENTA: '#FF007F',
    NEON_YELLOW: '#FFE600',
    NEON_GREEN: '#00FF66',
    DANGER_RED: '#FF1744',
    DANGER_LASER: '#FF2A6D',
    INK_BLUE: '#05D9E8',
    UI_BORDER: '#010a15',
    TEXT_GLOW: '#D1F7FF',
  },
} as const;
