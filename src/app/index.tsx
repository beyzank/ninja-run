import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { GameCanvas } from '../game/components/GameCanvas';
import { GameOverOverlay } from '../game/components/GameOverOverlay';
import { HUD } from '../game/components/HUD';
import { ShopModal } from '../game/components/ShopModal';
import { StartOverlay } from '../game/components/StartOverlay';
import { INITIAL_SKINS, INITIAL_TRAILS } from '../game/config/Cosmetics';
import { NinjaState, PhysicsWorld } from '../game/engine/PhysicsWorld';
import { HapticManager } from '../game/haptics/HapticManager';
import { SoundManager } from '../game/audio/SoundManager';
import { GameStorage } from '../game/storage/GameStorage';
import { GameStats, GameStatus, NinjaSkin, TrailStyle } from '../game/types';

export default function GameScreen() {
  const { width, height } = useWindowDimensions();

  // Storage states
  const [highScore, setHighScore] = useState<number>(() => GameStorage.getHighScore());
  const [coins, setCoins] = useState<number>(() => GameStorage.getCoins());
  const [activeTrail, setActiveTrail] = useState<TrailStyle>(() => {
    const id = GameStorage.getActiveTrailId();
    return GameStorage.getTrails().find((t) => t.id === id) || INITIAL_TRAILS[0];
  });
  const [activeSkin, setActiveSkin] = useState<NinjaSkin>(() => {
    const id = GameStorage.getActiveSkinId();
    return GameStorage.getSkins().find((s) => s.id === id) || INITIAL_SKINS[0];
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => GameStorage.isSoundEnabled());

  // Game UI States
  const [status, setStatus] = useState<GameStatus>('idle');
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [lastRunCoins, setLastRunCoins] = useState(0);

  // Active Drawing State for Canvas
  const [activePath, setActivePath] = useState<any>(null);
  const [hudStats, setHudStats] = useState<GameStats>({
    score: 0,
    highScore: GameStorage.getHighScore(),
    coins: GameStorage.getCoins(),
    distance: 0,
    ink: 100,
    maxInk: 100,
    speed: 5.8,
    isBoosting: false,
  });

  // Physics World Instance Ref
  const physicsRef = useRef<PhysicsWorld | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const statusRef = useRef<GameStatus>('idle');
  statusRef.current = status;
  const frameCountRef = useRef(0);
  const isDrawingRef = useRef(false);

  // Render state tick tracker (for driving Skia canvas)
  const [, setRenderTick] = useState(0);

  // Initialize or re-create physics world when dimensions are ready
  const getPhysics = useCallback(() => {
    if (!physicsRef.current && width > 0 && height > 0) {
      physicsRef.current = new PhysicsWorld(width, height, (finalScore, earnedCoins) => {
        // Game Over callback
        const currentHigh = GameStorage.getHighScore();
        if (finalScore > currentHigh) {
          GameStorage.saveHighScore(finalScore);
          setHighScore(finalScore);
        }
        GameStorage.addCoins(earnedCoins);
        setCoins(GameStorage.getCoins());
        setLastRunCoins(earnedCoins);
        setStatus('game_over');
      });
      physicsRef.current.init(GameStorage.getHighScore(), GameStorage.getCoins());
    }
    return physicsRef.current;
  }, [width, height]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    const physics = getPhysics();
    if (!physics) return;

    let isRunning = true;

    const loop = () => {
      if (!isRunning) return;

      if (statusRef.current === 'playing') {
        physics.update();
        frameCountRef.current++;

        // Throttle React HUD state updates to ~12 FPS to eliminate JS thread choking
        if (frameCountRef.current % 5 === 0) {
          setHudStats({ ...physics.stats });
        }

        // Only update active path during touch interaction
        if (isDrawingRef.current) {
          setActivePath(physics.lineManager.getCurrentPath());
        }

        // Advance canvas animation frame
        setRenderTick((t) => (t + 1) % 1000000);
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      isRunning = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [getPhysics]);

  // Game Control Handlers
  const handleStart = () => {
    const physics = getPhysics();
    if (!physics) return;

    physics.init(highScore, coins);
    setLastRunCoins(0);
    setStatus('playing');
    HapticManager.medium();
  };

  const handleRestart = () => {
    handleStart();
  };

  const handleQuitToMenu = () => {
    SoundManager.stopDrawingSound();
    setStatus('idle');
  };

  const handleTogglePause = () => {
    if (status === 'playing') {
      setStatus('paused');
      SoundManager.stopDrawingSound();
    } else if (status === 'paused') {
      setStatus('playing');
    }
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    GameStorage.setSoundEnabled(next);
    setSoundEnabled(next);
  };

  // Gesture Pan Drawing Handler
  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .onBegin((e) => {
      if (statusRef.current !== 'playing') return;
      const physics = physicsRef.current;
      if (!physics) return;

      const worldPoint = {
        x: e.x + physics.cameraX,
        y: e.y,
      };

      const success = physics.lineManager.startLine(
        worldPoint,
        physics.levelState.antiDrawZones
      );

      if (success) {
        isDrawingRef.current = true;
        physics.isDrawing = true;
        SoundManager.startDrawingSound();
        physics.emitDrawSparks(worldPoint.x, worldPoint.y, activeTrail.sparkColor);
      } else {
        physics.isDrawing = false;
        SoundManager.playDeny();
        HapticManager.warning();
      }
    })
    .onUpdate((e) => {
      if (statusRef.current !== 'playing') return;
      const physics = physicsRef.current;
      if (!physics) return;

      const worldPoint = {
        x: e.x + physics.cameraX,
        y: e.y,
      };

      const result = physics.lineManager.addPoint(
        worldPoint,
        physics.stats.ink,
        physics.levelState.antiDrawZones
      );

      if (result.inkUsed > 0) {
        physics.stats.ink = Math.max(0, physics.stats.ink - result.inkUsed);
        physics.emitDrawSparks(worldPoint.x, worldPoint.y, activeTrail.sparkColor);
      }

      if (result.blocked) {
        physics.isDrawing = false;
        SoundManager.stopDrawingSound();
        SoundManager.playDeny();
        HapticManager.warning();
        const line = physics.lineManager.finishLine();
        if (line) {
          physics.lines.push(line);
        }
      }
    })
    .onEnd(() => {
      isDrawingRef.current = false;
      setActivePath(null);
      SoundManager.stopDrawingSound();
      const physics = physicsRef.current;
      if (!physics) return;

      physics.isDrawing = false;
      const line = physics.lineManager.finishLine();
      if (line) {
        physics.lines.push(line);
      }
    })
    .onFinalize(() => {
      isDrawingRef.current = false;
      setActivePath(null);
      SoundManager.stopDrawingSound();
      const physics = physicsRef.current;
      if (!physics) return;

      physics.isDrawing = false;
      const line = physics.lineManager.finishLine();
      if (line) {
        physics.lines.push(line);
      }
    });

  const physics = physicsRef.current;
  const ninjaState: NinjaState = physics
    ? physics.getNinjaState()
    : {
        x: 150,
        y: height * 0.75 - 50,
        vx: 5.8,
        vy: 0,
        angle: 0,
        isOnGround: true,
        isDead: false,
        runCycle: 0,
      };

  return (
    <View style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <View style={styles.canvasContainer}>
          <GameCanvas
            width={width}
            height={height}
            cameraX={physics?.cameraX || 0}
            ninja={ninjaState}
            lines={physics?.lines || []}
            activeLinePath={activePath}
            activePoints={physics?.lineManager.getCurrentPoints() || []}
            lasers={physics?.levelState.lasers || []}
            spikes={physics?.levelState.spikes || []}
            boosters={physics?.levelState.boosters || []}
            antiDrawZones={physics?.levelState.antiDrawZones || []}
            collectibles={physics?.levelState.collectibles || []}
            groundBodies={physics?.levelState.groundBodies || []}
            particles={physics?.particles || []}
            trailStyle={activeTrail}
            ninjaSkin={activeSkin}
            isBoosting={hudStats.isBoosting}
          />
        </View>
      </GestureDetector>

      {/* In-Game HUD (Ink, Score, Coins, Boost, Pause, Instant Restart) */}
      {(status === 'playing' || status === 'paused') && (
        <HUD
          stats={hudStats}
          trailStyle={activeTrail}
          isPaused={status === 'paused'}
          onTogglePause={handleTogglePause}
          onRestart={handleRestart}
          onQuitToMenu={handleQuitToMenu}
        />
      )}

      {/* Start / Menu Screen */}
      {status === 'idle' && (
        <StartOverlay
          highScore={highScore}
          coins={coins}
          soundEnabled={soundEnabled}
          onStart={handleStart}
          onOpenShop={() => setIsShopOpen(true)}
          onToggleSound={handleToggleSound}
        />
      )}

      {/* Game Over Screen */}
      {status === 'game_over' && (
        <GameOverOverlay
          score={hudStats.score}
          highScore={highScore}
          coinsEarned={lastRunCoins}
          totalCoins={coins}
          distance={hudStats.distance}
          onRestart={handleRestart}
          onOpenShop={() => setIsShopOpen(true)}
        />
      )}

      {/* Shop Modal */}
      <ShopModal
        visible={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        coins={coins}
        onCoinsUpdated={(newCoins) => setCoins(newCoins)}
        activeTrailId={activeTrail.id}
        onSelectTrail={(t) => setActiveTrail(t)}
        activeSkinId={activeSkin.id}
        onSelectSkin={(s) => setActiveSkin(s)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070714',
  },
  canvasContainer: {
    flex: 1,
  },
});
