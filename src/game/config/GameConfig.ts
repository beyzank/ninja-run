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

  // Speed and acceleration
  BASE_SPEED_X: 4.4, // Responsive and fluid runner speed
  MAX_SPEED_X: 11.5,
  ACCELERATION_RATE: 0.00012, // speed increases gradually
  BOOST_SPEED_MULTIPLIER: 1.5,
  BOOST_DURATION_TICKS: 80, // ~1.3 seconds
  START_PLATFORM_WIDTH: 1400, // Long runway to get the hang of drawing
  MIN_HAZARD_DISTANCE: 1800, // No lethal traps until player passes the tutorial runway

  // Ink & Drawing
  MAX_INK: 120, // Generous stamina capacity
  INK_CONSUMPTION_PER_PIXEL: 0.028, // Low consumption: allows 2.5x longer drawing
  PASSIVE_INK_REGEN: 0.22, // Automatic recharge (~13% per second when not drawing)
  MIN_POINT_DISTANCE: 16, // distance before adding a new vertex
  LINE_PHYSICS_THICKNESS: 8,
  LINE_RENDER_THICKNESS: 5,
  LINE_GLOW_THICKNESS: 14,
  MAX_DRAW_POINTS_PER_LINE: 250,

  // Collectibles replenishment
  INK_ORB_RESTORE: 60, // Each orb restores 50% of the entire tank
  COIN_VALUE: 1,

  // Camera & view
  CAMERA_LOOKAHEAD_RATIO: 0.28, // Character positioned ~28% from the left
  DESPAWN_OFFSET_X: 450, // bodies further behind the camera are deleted
  SPAWN_AHEAD_DISTANCE: 1600, // spawn chunks ahead of camera

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
