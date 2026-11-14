import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { AdManager, AdRequest } from '../game/ads/AdManager';
import { AdModal } from '../game/components/AdModal';
import { GameCanvas } from '../game/components/GameCanvas';
import { GameOverOverlay } from '../game/components/GameOverOverlay';
import { HUD } from '../game/components/HUD';
import { MissionsModal } from '../game/components/MissionsModal';
import { ShopModal } from '../game/components/ShopModal';
import { StartOverlay } from '../game/components/StartOverlay';
import { INITIAL_SKINS, INITIAL_TRAILS } from '../game/config/Cosmetics';
import { GameConfig } from '../game/config/GameConfig';
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
  const [isMissionsOpen, setIsMissionsOpen] = useState(false);
  const [shopInitialTab, setShopInitialTab] = useState<'trails' | 'skins' | 'iap'>('trails');
  const [lastRunCoins, setLastRunCoins] = useState(0);
  const [canReviveThisRun, setCanReviveThisRun] = useState(true);

  // Ad State (Interstitial & Rewarded Ads)
  const [activeAd, setActiveAd] = useState<AdRequest | null>(null);

  // Subscribe to AdManager changes
  useEffect(() => {
    const unsubscribe = AdManager.subscribe((req) => {
      setActiveAd(req);
    });
    return unsubscribe;
  }, []);

  // Active Drawing State for Canvas
  const [activePath, setActivePath] = useState<any>(null);
  const [hudStats, setHudStats] = useState<GameStats>({
    score: 0,
    highScore: GameStorage.getHighScore(),
    coins: GameStorage.getCoins(),
    distance: 0,
    ink: 100,
    maxInk: 100,
    speed: GameConfig.BASE_SPEED_X,
    isBoosting: false,
    combo: 0,
    comboMultiplier: 1,
    comboTimerRatio: 0,
  });

  // BGM Lifecycle management
  useEffect(() => {
    if (GameStorage.isMusicEnabled() && GameStorage.isSoundEnabled()) {
      SoundManager.playBgm();
      SoundManager.setBgmVolume(0.35);
    }
    return () => {
      SoundManager.stopBgm();
    };
  }, []);

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

        // Duck music on Game Over
        SoundManager.setBgmVolume(0.18);

        // Check if an interstitial ad should be presented (Every 5 deaths)
        AdManager.checkInterstitialOnDeath();
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
    setCanReviveThisRun(true);
    setStatus('playing');
    HapticManager.medium();

    // Start / Boost BGM
    SoundManager.playBgm();
    SoundManager.setBgmVolume(0.52);
  };

  const handleRestart = () => {
    handleStart();
  };

  const handleQuitToMenu = () => {
    SoundManager.stopDrawingSound();
    SoundManager.setBgmVolume(0.32);
    setStatus('idle');
  };

  const handleTogglePause = () => {
    if (status === 'playing') {
      setStatus('paused');
      SoundManager.stopDrawingSound();
      SoundManager.pauseBgm();
    } else if (status === 'paused') {
      setStatus('playing');
      SoundManager.resumeBgm();
    }
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    GameStorage.setSoundEnabled(next);
    GameStorage.setMusicEnabled(next);
    setSoundEnabled(next);
    if (!next) {
      SoundManager.stopBgm();
      SoundManager.stopDrawingSound();
    } else {
      SoundManager.playBgm();
      SoundManager.setBgmVolume(status === 'playing' ? 0.52 : 0.32);
    }
  };

  const handleOpenShop = (tab: 'trails' | 'skins' | 'iap' = 'trails') => {
    setShopInitialTab(tab);
    setIsShopOpen(true);
  };

  const handleWatchAdCoins = () => {
    AdManager.showRewardedAd('coins_50', () => {
      GameStorage.addCoins(50);
      setCoins(GameStorage.getCoins());
    });
  };

  const handleWatchAdRevive = () => {
    if (!canReviveThisRun) return;
    AdManager.showRewardedAd('revive', () => {
      setCanReviveThisRun(false);
      physicsRef.current?.revive();
      setStatus('playing');
      SoundManager.setBgmVolume(0.52);
      SoundManager.resumeBgm();
    });
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
        GameStorage.updateMissionProgress('draw_distance', result.inkUsed * 3);
      }

      if (result.blocked) {
        if (physics.isDrawing) {
          physics.isDrawing = false;
          SoundManager.stopDrawingSound();
          SoundManager.playDeny();
          HapticManager.warning();
          const line = physics.lineManager.finishLine();
          if (line) {
            physics.lines.push(line);
          }
        }
      } else if (!physics.isDrawing) {
        physics.isDrawing = true;
        isDrawingRef.current = true;
        SoundManager.startDrawingSound();
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
            shakeX={physics?.shakeX || 0}
            shakeY={physics?.shakeY || 0}
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

          {/* Floating Juicy Text Popups (Combos, Gems, Sonic Boom) */}
          {physics &&
            physics.floatingTexts.map((ft) => {
              const screenX = ft.x - physics.cameraX + physics.shakeX;
              const screenY = ft.y + physics.shakeY;
              if (screenX < -120 || screenX > width + 120) return null;
              const progress = ft.life / ft.maxLife;

              return (
                <View
                  key={ft.id}
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    left: screenX - 90,
                    top: screenY - 20,
                    width: 180,
                    alignItems: 'center',
                    opacity: Math.max(0, 1 - progress * 1.15),
                    transform: [{ scale: 1 + progress * 0.2 }],
                  }}
                >
                  <Text
                    style={{
                      color: ft.color,
                      fontSize:
                        ft.text.includes('x5') || ft.text.includes('SÜPERSONİK')
                          ? 15
                          : 13,
                      fontWeight: '900',
                      letterSpacing: 0.8,
                      textShadowColor: ft.color,
                      textShadowOffset: { width: 0, height: 0 },
                      textShadowRadius: 8,
                    }}
                  >
                    {ft.text}
                  </Text>
                </View>
              );
            })}
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
          onOpenShop={() => handleOpenShop('trails')}
          onOpenMissions={() => setIsMissionsOpen(true)}
          hasUnclaimedMissions={GameStorage.hasUnclaimedMissions()}
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
          onOpenShop={() => handleOpenShop('trails')}
          onOpenMissions={() => setIsMissionsOpen(true)}
          hasUnclaimedMissions={GameStorage.hasUnclaimedMissions()}
          onWatchAdCoins={handleWatchAdCoins}
          onWatchAdRevive={handleWatchAdRevive}
          canRevive={canReviveThisRun}
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
        initialTab={shopInitialTab}
        onWatchAdForCoins={handleWatchAdCoins}
      />

      {/* Daily Missions Modal */}
      <MissionsModal
        visible={isMissionsOpen}
        onClose={() => setIsMissionsOpen(false)}
        onCoinsUpdated={(newCoins) => setCoins(newCoins)}
      />

      {/* Ad Modal (Full-Screen Interstitial or Rewarded Ad) */}
      <AdModal
        ad={activeAd}
        onClose={() => AdManager.closeAd()}
        onOpenShopRemoveAds={() => {
          AdManager.closeAd();
          handleOpenShop('iap');
        }}
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
