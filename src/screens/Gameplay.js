import React, { useRef, useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions, Animated, Text, TouchableOpacity } from 'react-native';
import Svg, { Circle, Path, Line } from 'react-native-svg';

const AnimatedLine = Animated.createAnimatedComponent(Line);

// Constants & Utilities
import { Colors } from '../constants/Colors';
import { UpgradeTiers } from '../constants/UpgradeTiers';
import { VectorPhysics } from '../utils/VectorPhysics';
import { CollisionDetector } from '../utils/CollisionDetector';
import { DecayEngine } from '../utils/DecayEngine';
import { FeedbackManager } from '../utils/FeedbackManager';

// Game Components
import Joystick from '../components/Game/Joystick';
import HUD from '../components/Game/HUD';
import PlayerSprite from '../components/Game/PlayerSprite';
import PredatorSprite from '../components/Game/PredatorSprite';
import WireframeMap from '../components/Game/WireframeMap';

// UI Components
import GameOverOverlay from '../components/UI/GameOverOverlay';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const OBSTACLE_PATHS = [
  "M 30,0 L 50,20 L 60,50 L 30,60 L 0,40 Z M 30,0 L 30,60 M 0,40 L 30,20 L 60,50 M 50,20 L 30,20",
  "M 40,5 L 75,30 L 85,75 L 45,90 L 15,70 L 5,35 Z M 40,5 L 45,90 M 15,70 L 40,35 L 75,30 M 5,35 L 40,35",
  "M 25,0 L 50,25 L 40,55 L 10,50 L 0,20 Z M 25,0 L 40,55 M 0,20 L 25,25 L 50,25",
  "M 35,5 L 65,25 L 70,65 L 35,75 L 5,50 Z M 35,5 L 35,75 M 5,50 L 35,25 L 65,25"
];

const OBSTACLE_COLORS = [Colors.CYAN, Colors.MAGENTA, Colors.LIME];

const isOrbOverlappingObstacles = (x, y, obstaclesList) => {
  for (const obs of obstaclesList) {
    const dx = x - obs.x;
    const dy = y - obs.y;
    const dist = Math.hypot(dx, dy);
    // 35px safety margin around obstacle boundaries to ensure absolutely no overlap
    if (dist < (obs.size * 0.7 + 35)) {
      return true;
    }
  }
  return false;
};

const VolumeSlider = ({ volume, onVolumeChange }) => {
  const barWidth = 140;
  const startXRef = useRef(0);
  const startVolRef = useRef(0);

  const handleTouchStart = (event) => {
    const touch = event.nativeEvent.touches[0] || event.nativeEvent;
    const initialVal = Math.max(0, Math.min(1, event.nativeEvent.locationX / barWidth));
    onVolumeChange(initialVal);
    startXRef.current = touch.pageX;
    startVolRef.current = initialVal;
  };

  const handleTouchMove = (event) => {
    const touch = event.nativeEvent.touches[0] || event.nativeEvent;
    const dx = touch.pageX - startXRef.current;
    const dVol = dx / barWidth;
    const val = Math.max(0, Math.min(1, startVolRef.current + dVol));
    onVolumeChange(val);
  };

  return (
    <View
      style={{
        width: barWidth,
        height: 30,
        justifyContent: 'center',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      <View 
        pointerEvents="none"
        style={{
          height: 6,
          backgroundColor: '#222222',
          borderRadius: 3,
          width: '100%',
          position: 'relative'
        }}
      >
        <View style={{
          height: '100%',
          backgroundColor: Colors.CYAN,
          borderRadius: 3,
          width: `${volume * 100}%`,
          position: 'absolute'
        }} />
        <View style={{
          position: 'absolute',
          left: `${volume * 100}%`,
          marginLeft: -6,
          top: -3,
          width: 12,
          height: 12,
          borderRadius: 6,
          backgroundColor: '#FFFFFF',
          borderWidth: 2,
          borderColor: Colors.CYAN,
        }} />
      </View>
    </View>
  );
};

export default function Gameplay({
  highScore = 0,
  upgrades = { afterglow: 1, dampened_fins: 1, pulse_capacity: 1 },
  soundEnabled = true,
  hapticsEnabled = true,
  volume = 0.5,
  onToggleSound,
  onToggleHaptics,
  onVolumeChange,
  onBack,
  onLevelComplete, // acts as run end handler
}) {
  const { width, height } = useWindowDimensions();

  // Upgrade calculations
  const cooldownDuration = UpgradeTiers.PULSE_CAPACITY.values[upgrades.pulse_capacity - 1];
  const afterglowMultiplier = UpgradeTiers.AFTERGLOW.multipliers[upgrades.afterglow - 1];
  const dampenedFinsMultiplier = UpgradeTiers.DAMPENED_FINS.multipliers[upgrades.dampened_fins - 1];

  // --- GAME STATE ---
  const [finOrbs, setFinOrbs] = useState(0);
  const finOrbsCollectedRef = useRef(0);
  const [isEnemySlowed, setIsEnemySlowed] = useState(false);
  const isEnemySlowedRef = useRef(false);

  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  const [showPauseOptions, setShowPauseOptions] = useState(false);

  // Local settings states for Save/Close modal behavior
  const [localSound, setLocalSound] = useState(soundEnabled);
  const [localHaptics, setLocalHaptics] = useState(hapticsEnabled);
  const [localVolume, setLocalVolume] = useState(volume);

  useEffect(() => {
    if (showPauseOptions) {
      setLocalSound(soundEnabled);
      setLocalHaptics(hapticsEnabled);
      setLocalVolume(volume);
    }
  }, [showPauseOptions, soundEnabled, hapticsEnabled, volume]);

  const handleSavePauseSettings = () => {
    onToggleSound(localSound);
    onToggleHaptics(localHaptics);
    onVolumeChange(localVolume);
    setShowPauseOptions(false);
  };

  const handleClosePauseSettings = () => {
    setShowPauseOptions(false);
  };

  const [orbsCollected, setOrbsCollected] = useState(0);
  const orbsCollectedRef = useRef(0);

  const [activePulses, setActivePulses] = useState([]);
  const [activeRays, setActiveRays] = useState([]);
  const [isPulseReady, setIsPulseReady] = useState(true);
  const pulseCooldownAnim = useRef(new Animated.Value(0)).current;
  const pulseCooldownTimeLeft = useRef(0);
  const knockbackTimer = useRef(0);
  const playerRef = useRef(null);
  const spriteRefs = useRef({});
  const creatureRotVal = useRef(0);
  
  const [lives, setLives] = useState(3);
  const [isGameOver, setIsGameOver] = useState(false);

  const [obstacles, setObstacles] = useState([]);
  const [orbs, setOrbs] = useState([]);
  const [enemies, setEnemies] = useState([]);

  // Tail dynamic extension driven natively by speed
  const tailGrowth = useRef(new Animated.Value(0)).current;
  const tailGrowthRef = useRef(0);

  // Refs for logic loop access to prevent stale state closures
  const obstaclesRef = useRef([]);
  const orbsRef = useRef([]);
  const enemiesRef = useRef([]);
  const activePulsesRef = useRef([]);
  const distanceRef = useRef(0);

  // --- CAMERA SCROLL ---
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollXRef = useRef(0);
  const baseScrollSpeed = 1.2;

  // --- PHYSICS ENGINE SETTINGS ---
  const ACCELERATION = 0.5;
  const FRICTION = 0.92;
  const JOYSTICK_RADIUS = 50;

  // --- PLAYER REFS ---
  const velocity = useRef({ x: 0, y: 0 });
  const inputVector = useRef({ x: 0, y: 0 });
  const truePos = useRef({ x: width * 0.3, y: height / 2 }); // start slightly ahead of left edge
  
  const creaturePos = useRef(new Animated.ValueXY({ x: width * 0.3, y: height / 2 })).current;
  const creatureRot = useRef(new Animated.Value(0)).current;
  const thumbPos = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  
  const breathingAnim = useRef(new Animated.Value(1)).current;

  // I-Frame System
  const isInvincible = useRef(false);
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  // Trackers for spawning triggers
  const lastSpawnX = useRef(0);
  const lastEnemySpawnX = useRef(0);
  const spawnTurn = useRef(0);
  const isMovingRef = useRef(false);
  const lastDisplayedDist = useRef(-1);

  // Particle swarm for player creature
  const emitAnim1 = useRef(new Animated.Value(0)).current;
  const emitAnim2 = useRef(new Animated.Value(0)).current;
  const emitAnim3 = useRef(new Animated.Value(0)).current;
  const emitAnim4 = useRef(new Animated.Value(0)).current;

  const generateParticles = () => {
    return Array.from({ length: 12 }).map(() => {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 35;
      return {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        size: Math.random() * 0.8 + 0.4,
      };
    });
  };

  const particles1 = useRef(generateParticles()).current;
  const particles2 = useRef(generateParticles()).current;
  const particles3 = useRef(generateParticles()).current;
  const particles4 = useRef(generateParticles()).current;

  // Ref to the native distance text input in the HUD
  const distanceTextRef = useRef(null);

  // Helper to completely initialize or restart the gameplay session
  const initGameWorld = () => {
    // Reset player position and velocity
    velocity.current = { x: 0, y: 0 };
    inputVector.current = { x: 0, y: 0 };
    truePos.current = { x: width * 0.3, y: height / 2 };
    creaturePos.setValue({ x: width * 0.3, y: height / 2 });
    creatureRot.setValue(0);
    thumbPos.setValue({ x: 0, y: 0 });

    // Reset scores & lives
    setLives(3);
    setOrbsCollected(0);
    orbsCollectedRef.current = 0;
    setFinOrbs(0);
    finOrbsCollectedRef.current = 0;
    distanceRef.current = 0;
    scrollXRef.current = 0;
    scrollX.setValue(0);
    lastDisplayedDist.current = -1;
    lastSpawnX.current = 0;
    lastEnemySpawnX.current = 0;
    spawnTurn.current = 0;

    // Reset cooldowns, rays, and pulses
    pulseCooldownTimeLeft.current = 0;
    pulseCooldownAnim.setValue(0);
    setIsPulseReady(true);
    setActiveRays([]);
    activePulsesRef.current = [];
    setActivePulses([]);

    // Generate initial set of obstacles and orbs ahead of start position
    const initialObs = [];
    const initialOrbs = [];
    
    // Spawn 5 initial obstacles and orbs staggered
    for (let i = 0; i < 5; i++) {
      const obsSize = Math.random() * 30 + 50;
      const obsY = Math.random() * (height - 120) + 60;
      const pathIndex = Math.floor(Math.random() * OBSTACLE_PATHS.length);
      const obsX = width * 0.6 + i * 300 + Math.random() * 100;
      initialObs.push({
        id: `init-obs-${i}-${Date.now()}`,
        x: obsX,
        y: obsY,
        size: obsSize,
        opacity: new Animated.Value(0),
        color: OBSTACLE_COLORS[Math.floor(Math.random() * OBSTACLE_COLORS.length)],
        pathIndex: pathIndex,
        path: OBSTACLE_PATHS[pathIndex],
      });

      // Spawn Orb staggered vertically (placed in the opposite vertical half of the obstacle)
      const isBig = Math.random() > 0.8;
      const orbX = width * 0.8 + i * 250 + Math.random() * 150;
      let orbY = obsY > height / 2
        ? Math.random() * (height / 2 - 100) + 50            // Top half
        : Math.random() * (height / 2 - 100) + (height / 2); // Bottom half

      // Ensure no overlap with the initial obstacles
      let attempts = 0;
      while (attempts < 8 && isOrbOverlappingObstacles(orbX, orbY, initialObs)) {
        orbY = Math.random() * (height - 120) + 60;
        attempts++;
      }

      initialOrbs.push({
        id: `init-orb-${i}-${Date.now()}`,
        x: orbX,
        y: orbY,
        size: isBig ? 35 : 20,
        opacity: new Animated.Value(0),
        hitRadius: isBig ? 17 : 9,
        type: isBig ? 'big' : 'regular',
      });
    }

    obstaclesRef.current = initialObs;
    orbsRef.current = initialOrbs;
    enemiesRef.current = [];
    setObstacles(initialObs);
    setOrbs(initialOrbs);
    setEnemies([]);

    lastSpawnX.current = width * 0.6 + 4 * 300;
  };

  // Initial Spawn segments
  useEffect(() => {
    initGameWorld();
  }, [width, height]);

  // --- INITIALIZATION & CORE GAME LOOP ---
  useEffect(() => {
    if (isGameOver || isPaused) return;

    FeedbackManager.startAmbience();

    // Idle breathing
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathingAnim, { toValue: 1.4, duration: 1200, useNativeDriver: true }),
        Animated.timing(breathingAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();

    // Glowing particles loops
    const startEmission = (anim, delay) => {
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, { toValue: 1, duration: 1200, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
          ])
        ).start();
      }, delay);
    };

    startEmission(emitAnim1, 0);
    startEmission(emitAnim2, 300);
    startEmission(emitAnim3, 600);
    startEmission(emitAnim4, 900);

    let animationFrameId;
    
    const gameLoop = () => {
      // Cooldown timer update (automatically pauses when loop is frozen during pause)
      if (pulseCooldownTimeLeft.current > 0) {
        pulseCooldownTimeLeft.current -= 16.67;
        if (pulseCooldownTimeLeft.current <= 0) {
          pulseCooldownTimeLeft.current = 0;
          pulseCooldownAnim.setValue(0);
          setIsPulseReady(true);
        } else {
          pulseCooldownAnim.setValue(pulseCooldownTimeLeft.current / cooldownDuration);
        }
      }

      // Update active sonar pulses manually for perfect pause/resume support
      const maxRadius = Math.max(width, height) * 1.2;
      const pulseSpeed = maxRadius / 120; // expands fully over 2 seconds (120 frames)
      
      activePulsesRef.current.forEach((pulse) => {
        pulse.radiusVal += pulseSpeed;
        const scaleVal = pulse.radiusVal / 100;
        pulse.radius.setValue(scaleVal);
        
        const opacityVal = Math.max(0, 1 - (pulse.radiusVal / maxRadius));
        pulse.opacity.setValue(opacityVal);

        // Check radial sweep hit reveals
        obstaclesRef.current.forEach((obs) => {
          if (pulse.revealedElements.has(obs.id)) return;
          const geom = CollisionDetector.getVisualGeometry(obs);
          const dx = geom.x - pulse.x;
          const dy = geom.y - pulse.y;
          const dist = Math.hypot(dx, dy);
          if (pulse.radiusVal >= dist) {
            pulse.revealedElements.add(obs.id);
            DecayEngine.createRevealSequence(
              obs.opacity,
              150,
              DecayEngine.getDecayDuration(500, afterglowMultiplier)
            ).start();
          }
        });

        orbsRef.current.forEach((orb) => {
          if (pulse.revealedElements.has(orb.id)) return;
          const dx = orb.x - pulse.x;
          const dy = orb.y - pulse.y;
          const dist = Math.hypot(dx, dy);
          if (pulse.radiusVal >= dist) {
            pulse.revealedElements.add(orb.id);
            DecayEngine.createRevealSequence(
              orb.opacity,
              150,
              DecayEngine.getDecayDuration(700, afterglowMultiplier)
            ).start();
          }
        });

        enemiesRef.current.forEach((enemy) => {
          if (pulse.revealedElements.has(enemy.id)) return;
          const dx = enemy.x - pulse.x;
          const dy = enemy.y - pulse.y;
          const dist = Math.hypot(dx, dy);
          if (pulse.radiusVal >= dist) {
            pulse.revealedElements.add(enemy.id);
            enemy.isAttracted = true;
            enemy.attractedAt = Date.now();
          }
        });
      });

      // Prune finished pulses
      const unfinishedPulses = activePulsesRef.current.filter(p => p.radiusVal < maxRadius);
      if (unfinishedPulses.length !== activePulsesRef.current.length) {
        activePulsesRef.current = unfinishedPulses;
        setActivePulses([...unfinishedPulses]);
      }

      // Distance score tracking (10px = 1m)
      const currentDist = scrollXRef.current / 10;
      distanceRef.current = currentDist;

      // Dynamic speed scaling: very slightly increases every 1000m starting at/after 8000m
      let speedMultiplier = 1.0;
      if (currentDist >= 8000) {
        const extraThousandMeters = Math.floor((currentDist - 8000) / 1000) + 1;
        speedMultiplier += extraThousandMeters * 0.03; // 3% increase per 1000m above 8000m
      }

      // Dynamic scroll speed increases with distance
      const scrollSpeed = (baseScrollSpeed + (scrollXRef.current / 15000)) * speedMultiplier;
      scrollXRef.current += scrollSpeed;
      scrollX.setValue(scrollXRef.current);

      const currentDistInt = Math.floor(currentDist);
      if (currentDistInt !== lastDisplayedDist.current) {
        lastDisplayedDist.current = currentDistInt;
        if (distanceTextRef.current) {
          distanceTextRef.current.setNativeProps({
            text: `DISTANCE: ${currentDistInt}m`
          });
        }
      }

      // 1. Player Kinematics
      const prevPos = { x: truePos.current.x, y: truePos.current.y };
      if (Date.now() < knockbackTimer.current) {
        // Ignore input and apply slide friction during hit knockback
        VectorPhysics.applyFriction(velocity.current, 0.94);
      } else {
        VectorPhysics.applyInput(velocity.current, inputVector.current, ACCELERATION);
        VectorPhysics.applyFriction(velocity.current, FRICTION);
      }
      VectorPhysics.integrate(truePos.current, velocity.current);

      // Keep player inside top/bottom bounds, and scroll boundary
      if (truePos.current.y < 20) { truePos.current.y = 20; velocity.current.y *= -0.5; }
      if (truePos.current.y > height - 20) { truePos.current.y = height - 20; velocity.current.y *= -0.5; }
      if (truePos.current.x > scrollXRef.current + width - 20) {
        truePos.current.x = scrollXRef.current + width - 20;
        velocity.current.x *= -0.5;
      }

      // CRITICAL MECHANIC: Left Screen closes (Ink Death Wall boundary)
      const deathWallX = scrollXRef.current + 15; // 15px from left edge
      if (truePos.current.x < deathWallX) {
        truePos.current.x = deathWallX;
        velocity.current.x = Math.max(velocity.current.x, scrollSpeed + 2); // push forward
        if (!isInvincible.current) {
          handleDamage();
        }
      }

      // Rotate player based on active joystick input direction, preventing turning backward on bounce
      const hasInput = Math.hypot(inputVector.current.x, inputVector.current.y) > 0.15;
      if (hasInput) {
        creatureRotVal.current = Math.atan2(inputVector.current.y, inputVector.current.x);
      } else {
        const speed = Math.hypot(velocity.current.x, velocity.current.y);
        // Only update from velocity if moving forward at significant speed to prevent bounce turning
        if (speed > 0.8 && velocity.current.x > -0.1) {
          creatureRotVal.current = Math.atan2(velocity.current.y, velocity.current.x);
        }
      }

      // Calculate speed and update tail extension smoothly via lerp (runs natively!)
      const speed = Math.hypot(velocity.current.x, velocity.current.y);
      const targetTail = Math.min(speed / 4.0, 1.0);
      tailGrowthRef.current += (targetTail - tailGrowthRef.current) * 0.15;
      tailGrowth.setValue(tailGrowthRef.current);

      // Direct Manipulation positioning for buttery smooth 120 FPS movement!
      if (playerRef.current) {
        const rotDeg = (creatureRotVal.current * 180 / Math.PI) - 90;
        playerRef.current.setNativeProps({
          style: {
            transform: [
              { translateX: truePos.current.x },
              { translateY: truePos.current.y },
              { rotate: `${rotDeg}deg` }
            ]
          }
        });
      }

      // 2. Procedural Spawning (Alternating obstacles and orbs to ensure they never spawn together)
      if (scrollXRef.current + width * 2.0 > lastSpawnX.current) {
        // Difficulty scaling: spawn frequency increases as the player travels further (interval shrinks)
        const spawnInterval = Math.max(90, 165 - Math.floor(distanceRef.current / 45) * 8);
        const nextX = lastSpawnX.current + Math.random() * 80 + 80;

        spawnTurn.current += 1;

        if (spawnTurn.current % 2 === 0) {
          // Spawn Obstacle
          const size = Math.random() * 30 + 50;
          const obsY = Math.random() * (height - 160) + 80;
          const pathIndex = Math.floor(Math.random() * OBSTACLE_PATHS.length);
          const newObs = {
            id: `obs-${Date.now()}`,
            x: nextX,
            y: obsY,
            size: size,
            opacity: new Animated.Value(0),
            color: OBSTACLE_COLORS[Math.floor(Math.random() * OBSTACLE_COLORS.length)],
            pathIndex: pathIndex,
            path: OBSTACLE_PATHS[pathIndex],
          };
          obstaclesRef.current.push(newObs);
        } else {
          // Spawn Orb (Higher chance for pink fin orbs!)
          let orbY = Math.random() * (height - 120) + 60;
          
          // Ensure no overlap with any active obstacles in the list
          let attempts = 0;
          while (attempts < 8 && isOrbOverlappingObstacles(nextX, orbY, obstaclesRef.current)) {
            orbY = Math.random() * (height - 120) + 60;
            attempts++;
          }

          const randVal = Math.random();
          let orbType = 'regular';
          if (randVal < 0.10) {
            orbType = 'big';
          } else if (randVal < 0.70) { // 60% chance for pink fin orb!
            orbType = 'fin';
          }

          const newOrb = {
            id: `orb-${Date.now()}-${Math.random()}`,
            x: nextX,
            y: orbY,
            size: orbType === 'big' ? 35 : 20,
            opacity: new Animated.Value(0),
            hitRadius: orbType === 'big' ? 17 : 9,
            type: orbType,
          };
          orbsRef.current.push(newOrb);
        }

        lastSpawnX.current = nextX + spawnInterval;

        // Prune old out of screen elements (left of scrollX - 200)
        obstaclesRef.current = obstaclesRef.current.filter(o => o.x > scrollXRef.current - 200);
        orbsRef.current = orbsRef.current.filter(o => o.x > scrollXRef.current - 200);

        setObstacles([...obstaclesRef.current]);
        setOrbs([...orbsRef.current]);
      }

      // Procedural Enemies: Spawn stalker predator ahead of screen right side every 4000px
      if (scrollXRef.current - lastEnemySpawnX.current > 4000) {
        const spawnY = Math.random() * (height - 150) + 75;
        const newEnemy = {
          id: `predator-${Date.now()}`,
          x: scrollXRef.current + width + 200,
          y: spawnY,
          vx: 0, // velocity X
          vy: 0, // velocity Y
          patrolX: scrollXRef.current + width + 200, // Anchor for pacing
          patrolY: spawnY,
          patrolTimeOffset: Math.random() * 10000, // Desynchronize multiple predators
          rotVal: 0,
          trackingAnim: new Animated.Value(0), // 0 = passive, 1 = tracking player (Animated natively in SVG)
          speed: (1.2 + Math.random() * 0.5) * dampenedFinsMultiplier,
          isAttracted: false,
          wasTracking: false,
        };
        enemiesRef.current.push(newEnemy);
        lastEnemySpawnX.current = scrollXRef.current;
        setEnemies([...enemiesRef.current]);
      }

      // Move Enemies & check predator collisions
      enemiesRef.current.forEach((enemy) => {
        // Clear attraction after 6 seconds of chasing
        if (enemy.isAttracted && enemy.attractedAt && (Date.now() - enemy.attractedAt > 6000)) {
          enemy.isAttracted = false;
        }

        const dx = truePos.current.x - enemy.x;
        const dy = truePos.current.y - enemy.y;
        const dist = Math.hypot(dx, dy);

        // Tracking is enabled if hit by player's sonar waves OR player is within warn ring radius (105px)
        const isTracking = enemy.isAttracted || (dist < 105);
        enemy.trackingAnim.setValue(isTracking ? 1 : 0);

        // Detect transition from tracking to passive: reset patrol center to prevent snapping back!
        if (!isTracking && enemy.wasTracking) {
          enemy.patrolX = enemy.x;
          enemy.patrolY = enemy.y;
        }
        enemy.wasTracking = isTracking;

        let targetVx = 0;
        let targetVy = 0;

        const slowedMultiplier = isEnemySlowedRef.current ? 0.35 : 1.0;

        if (isTracking) {
          if (dist > 0) {
            // Seek player direction - HIGH chase speed so it can catch the player!
            const chaseSpeed = enemy.speed * 2.2 * slowedMultiplier;
            targetVx = (dx / dist) * chaseSpeed * speedMultiplier;
            targetVy = (dy / dist) * chaseSpeed * speedMultiplier;
          }
        } else {
          // Smooth random wandering behavior (no circles/figure-8s)
          if (!enemy.wanderTimer || Date.now() > enemy.wanderTimer) {
            // Select a random diagonal/horizontal/vertical angle
            const angle = Math.random() * Math.PI * 2;
            const patrolSpeed = enemy.speed * 0.55 * slowedMultiplier;
            enemy.wanderVx = Math.cos(angle) * patrolSpeed;
            enemy.wanderVy = Math.sin(angle) * patrolSpeed;
            
            // Sustain this direction for 1.5 to 4 seconds
            enemy.wanderTimer = Date.now() + 1500 + Math.random() * 2500;
          }

          targetVx = enemy.wanderVx * speedMultiplier;
          targetVy = enemy.wanderVy * speedMultiplier;

          // Steer back / bounce inside viewport margins to avoid wandering off entirely
          const minX = scrollXRef.current + 40;
          const maxX = scrollXRef.current + width + 120;
          const minY = 40;
          const maxY = height - 40;

          if (enemy.x < minX) { enemy.wanderVx = Math.abs(enemy.wanderVx); }
          if (enemy.x > maxX) { enemy.wanderVx = -Math.abs(enemy.wanderVx); }
          if (enemy.y < minY) { enemy.wanderVy = Math.abs(enemy.wanderVy); }
          if (enemy.y > maxY) { enemy.wanderVy = -Math.abs(enemy.wanderVy); }
        }

        // Apply smooth velocity blend (steering forces / momentum)
        enemy.vx += (targetVx - enemy.vx) * 0.06 * speedMultiplier;
        enemy.vy += (targetVy - enemy.vy) * 0.06 * speedMultiplier;

        enemy.x += enemy.vx;
        enemy.y += enemy.vy;

        // Direct Manipulation positioning for buttery smooth 120 FPS predator movement!
        enemy.rotVal = Math.atan2(enemy.vy, enemy.vx);
        const ref = spriteRefs.current[enemy.id];
        if (ref) {
          const rotDeg = enemy.rotVal * 180 / Math.PI;
          ref.setNativeProps({
            style: {
              transform: [
                { translateX: enemy.x },
                { translateY: enemy.y },
                { rotate: `${rotDeg}deg` }
              ]
            }
          });
        }

        // Check Collision with Predator boundary lines (Always solid!)
        const predatorCol = CollisionDetector.checkPredatorCollision(truePos.current, enemy);
        if (predatorCol) {
          // Resolve solid collision: push player out
          truePos.current.x += predatorCol.pushX;
          truePos.current.y += predatorCol.pushY;

          // Calculate normal vector pointing away from collision
          const pushDist = Math.hypot(predatorCol.pushX, predatorCol.pushY);
          const nx = pushDist > 0.01 ? predatorCol.pushX / pushDist : 1;
          const ny = pushDist > 0.01 ? predatorCol.pushY / pushDist : 0;

          // Launch player away with knockback impulse force
          velocity.current.x = nx * 8.5;
          velocity.current.y = ny * 8.5;

          // Set 250ms knockback timer to briefly freeze input control
          knockbackTimer.current = Date.now() + 250;

          // Reset attraction so it returns to patrolling calm mode
          enemy.isAttracted = false;

          if (!isInvincible.current) {
            handleDamage();
          }
        }
      });

      // Prune old enemies off-screen left
      const prevEnemyCount = enemiesRef.current.length;
      enemiesRef.current = enemiesRef.current.filter(e => e.x > scrollXRef.current - 200);
      if (enemiesRef.current.length !== prevEnemyCount) {
        setEnemies([...enemiesRef.current]);
      }

      // 3. Collision Checks: Obstacles
      const hitObs = CollisionDetector.checkObstacleCollisions(truePos.current, obstaclesRef.current);
      if (hitObs) {
        // Resolve solid collision: push player out
        truePos.current.x += hitObs.pushX;
        truePos.current.y += hitObs.pushY;
        velocity.current.x *= -0.4;
        velocity.current.y *= -0.4;

        if (!isInvincible.current) {
          handleDamage();
        }
      }

      // 4. Collision Checks: Collect Orbs
      orbsRef.current.forEach((orb) => {
        if (CollisionDetector.checkCircleCollision(truePos.current, orb, orb.hitRadius + 22)) {
          // Collect orb!
          FeedbackManager.triggerHaptic('light');
          FeedbackManager.playPulseSound(); // play collect sound
          
          if (orb.type === 'fin') {
            finOrbsCollectedRef.current += 1;
            setFinOrbs(finOrbsCollectedRef.current);
          } else {
            const pointsEarned = orb.type === 'big' ? 10 : 5;
            orbsCollectedRef.current += pointsEarned;
            setOrbsCollected(orbsCollectedRef.current);
          }
          
          // Remove orb from arrays
          orbsRef.current = orbsRef.current.filter(o => o.id !== orb.id);
          setOrbs([...orbsRef.current]);
        }
      });

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      FeedbackManager.stopAmbience();
    };
  }, [width, height, isGameOver, isPaused, upgrades]);

  // --- DAMAGE LOGIC ---
  const handleDamage = () => {
    isInvincible.current = true;
    FeedbackManager.triggerHaptic('heavy');
    FeedbackManager.playDamageSound();

    // Trigger rapid screen vibration (shake) effect
    shakeAnim.setValue({ x: 0, y: 0 });
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: { x: 12, y: -9 }, duration: 30, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: { x: -11, y: 8 }, duration: 35, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: { x: 9, y: -7 }, duration: 35, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: { x: -7, y: 5 }, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: { x: 4, y: -3 }, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: { x: -2, y: 1 }, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: { x: 0, y: 0 }, duration: 45, useNativeDriver: true }),
    ]).start();

    setLives((prev) => {
      const nextLives = prev - 1;
      if (nextLives <= 0) {
        FeedbackManager.stopAmbience();
        // Trigger LevelComplete callback representing the end of infinite run
        setTimeout(() => {
          onLevelComplete({
            distance: distanceRef.current,
            orbsCollected: orbsCollectedRef.current,
          });
        }, 800);
      }
      return nextLives;
    });

    const blinkSequence = [];
    for (let i = 0; i < 7; i++) {
      blinkSequence.push(
        Animated.timing(blinkAnim, { toValue: 0.2, duration: 80, useNativeDriver: true })
      );
      blinkSequence.push(
        Animated.timing(blinkAnim, { toValue: 1, duration: 80, useNativeDriver: true })
      );
    }

    Animated.sequence(blinkSequence).start(() => {
      isInvincible.current = false;
      blinkAnim.setValue(1);
    });
  };

  const handlePauseToggle = () => {
    isPausedRef.current = !isPausedRef.current;
    setIsPaused(isPausedRef.current);
    if (isPausedRef.current) {
      FeedbackManager.stopAmbience();
    } else {
      FeedbackManager.startAmbience();
    }
  };

  const handleRestart = () => {
    initGameWorld();
    isPausedRef.current = false;
    setIsPaused(false);
  };

  const handleTouch = (evt) => {
    const touches = evt.nativeEvent.touches;
    let joystickTouch = null;

    for (let i = 0; i < touches.length; i++) {
      if (touches[i].pageX < width / 2) {
        joystickTouch = touches[i];
        break;
      }
    }

    if (joystickTouch) {
      if (!joystickStartRef.current) {
        joystickStartRef.current = { x: joystickTouch.pageX, y: joystickTouch.pageY };
      }
      const dx = joystickTouch.pageX - joystickStartRef.current.x;
      const dy = joystickTouch.pageY - joystickStartRef.current.y;

      const distance = Math.sqrt(dx ** 2 + dy ** 2);
      const cappedDistance = Math.min(distance, JOYSTICK_RADIUS);
      const angle = Math.atan2(dy, dx);

      const thumbX = Math.cos(angle) * cappedDistance;
      const thumbY = Math.sin(angle) * cappedDistance;

      thumbPos.setValue({ x: thumbX, y: thumbY });
      inputVector.current = { x: thumbX / JOYSTICK_RADIUS, y: thumbY / JOYSTICK_RADIUS };
    } else {
      if (joystickStartRef.current) {
        joystickStartRef.current = null;
        Animated.spring(thumbPos, { toValue: { x: 0, y: 0 }, friction: 5, useNativeDriver: true }).start();
        inputVector.current = { x: 0, y: 0 };
      }
    }
  };

  const joystickStartRef = useRef(null);

  // --- SONAR PULSE FIRE ---
  const firePulse = () => {
    if (!isPulseReady) return;
    setIsPulseReady(false);

    FeedbackManager.triggerHaptic('medium');
    FeedbackManager.playPulseSound();

    // Pulse cooldown visual ring timing driven by JS gameLoop
    pulseCooldownTimeLeft.current = cooldownDuration;
    pulseCooldownAnim.setValue(1);

    const maxRadius = Math.max(width, height) * 1.2;

    // Spawn expanding sonar circle in ref
    const newPulse = {
      id: Date.now(),
      x: truePos.current.x,
      y: truePos.current.y,
      radiusVal: 0,
      radius: new Animated.Value(0),
      opacity: new Animated.Value(1),
      revealedElements: new Set(),
    };

    activePulsesRef.current.push(newPulse);
    setActivePulses([...activePulsesRef.current]);
  };

  const activateDampenedFin = () => {
    if (finOrbsCollectedRef.current < 5 || isEnemySlowedRef.current) return;

    FeedbackManager.triggerHaptic('heavy');
    FeedbackManager.playPulseSound();

    // Deduct 5 fin orbs
    finOrbsCollectedRef.current -= 5;
    setFinOrbs(finOrbsCollectedRef.current);

    // Spawn freeze ray to each active enemy
    const spawnedRays = enemiesRef.current.map((enemy) => {
      const rayId = `ray-${enemy.id}-${Date.now()}`;
      const newRay = {
        id: rayId,
        startX: truePos.current.x,
        startY: truePos.current.y,
        endX: enemy.x,
        endY: enemy.y,
        opacity: new Animated.Value(1),
      };

      Animated.timing(newRay.opacity, {
        toValue: 0,
        duration: 900,
        useNativeDriver: true,
      }).start(() => {
        setActiveRays((prev) => prev.filter((r) => r.id !== rayId));
      });

      return newRay;
    });

    if (spawnedRays.length > 0) {
      setActiveRays((prev) => [...prev, ...spawnedRays]);
    }

    // Trigger 5-second enemy slow status
    isEnemySlowedRef.current = true;
    setIsEnemySlowed(true);

    setTimeout(() => {
      isEnemySlowedRef.current = false;
      setIsEnemySlowed(false);
    }, 5000);
  };

  // Inline element memoization to bypass React 19 / Babel preset React.memo object transform crash
  const playerSpriteElement = useMemo(() => (
    <Animated.View
      ref={playerRef}
      style={[
        styles.playerContainer,
        {
          opacity: blinkAnim,
        }
      ]}
    >
      <PlayerSprite
        tailGrowth={tailGrowth}
        upgrades={upgrades}
        blinkAnim={blinkAnim}
        breathingAnim={breathingAnim}
        emitAnim1={emitAnim1}
        emitAnim2={emitAnim2}
        emitAnim3={emitAnim3}
        emitAnim4={emitAnim4}
        particles1={particles1}
        particles2={particles2}
        particles3={particles3}
        particles4={particles4}
      />
    </Animated.View>
  ), [upgrades, blinkAnim, breathingAnim, emitAnim1, emitAnim2, emitAnim3, emitAnim4, particles1, particles2, particles3, particles4, tailGrowth]);

  const enemiesElement = useMemo(() => (
    enemies.map((enemy) => (
      <View
        key={enemy.id}
        ref={ref => { spriteRefs.current[enemy.id] = ref; }}
        style={[
          styles.stalkerContainer,
          {
            // Initial render position before gameLoop setNativeProps styles update
            transform: [
              { translateX: enemy.x },
              { translateY: enemy.y },
              { rotate: `${(enemy.rotVal || 0) * (180 / Math.PI)}deg` }
            ]
          }
        ]}
      >
        <PredatorSprite trackingAnim={enemy.trackingAnim} isSlowed={isEnemySlowed} />
      </View>
    ))
  ), [enemies, isEnemySlowed]);

  const joystickElement = useMemo(() => (
    <Joystick thumbPos={thumbPos} />
  ), [thumbPos]);

  return (
    <View
      style={styles.container}
      onTouchStart={handleTouch}
      onTouchMove={handleTouch}
      onTouchEnd={handleTouch}
      onTouchCancel={handleTouch}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            transform: [
              { translateX: shakeAnim.x },
              { translateY: shakeAnim.y }
            ]
          }
        ]}
      >
        {/* HUD Layer */}
        <HUD
          distanceTextRef={distanceTextRef}
          highScore={highScore}
          orbsCollected={orbsCollected}
          lives={lives}
          maxLives={3}
          onPause={handlePauseToggle}
        />

      {/* Scrolling Game World container */}
      <Animated.View
        style={[
          styles.gameWorld,
          {
            transform: [
              {
                translateX: scrollX.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -1],
                }),
              },
            ],
          },
        ]}
      >
        {/* Wireframe Map: Render Obstacles, Orbs */}
        <WireframeMap
          obstacles={obstacles}
          orbs={orbs}
          width={width * 5}
          height={height}
        />

        {/* Player Sprite absolute positioned in the gameWorld */}
        {playerSpriteElement}

        {/* Predators absolute positioned in the gameWorld */}
        {enemiesElement}

        {/* --- ACTIVE SONAR PULSES (Rendered inside gameWorld to inherit translation natively!) --- */}
        {activePulses.map((pulse) => (
          <Animated.View
            key={pulse.id}
            style={[
              styles.pulseContainer,
              {
                left: pulse.x,
                top: pulse.y,
                opacity: pulse.opacity,
                transform: [
                  {
                    scale: pulse.radius
                  }
                ]
              }
            ]}
          >
            <Svg height="200" width="200" viewBox="-100 -100 200 200">
              {/* Primary Ring */}
              <Circle cx="0" cy="0" r="98" stroke={Colors.CYAN} strokeWidth="1.5" fill="none" />
              {/* Secondary Ripple */}
              <Circle cx="0" cy="0" r="84" stroke={Colors.CYAN} strokeWidth="1.0" fill="none" opacity="0.5" />
              {/* Tertiary Ripple */}
              <Circle cx="0" cy="0" r="70" stroke={Colors.CYAN} strokeWidth="0.8" fill="none" opacity="0.2" />
            </Svg>
          </Animated.View>
        ))}

        {/* --- ACTIVE FREEZE RAYS (Rendered inside gameWorld to inherit translation natively!) --- */}
        {activeRays.map((ray) => (
          <Animated.View
            key={ray.id}
            style={[StyleSheet.absoluteFillObject, { opacity: ray.opacity }]}
            pointerEvents="none"
          >
            <Svg style={StyleSheet.absoluteFillObject} pointerEvents="none">
              <Line
                x1={ray.startX}
                y1={ray.startY}
                x2={ray.endX}
                y2={ray.endY}
                stroke={Colors.MAGENTA} // Glowing pink/magenta ray!
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray="6,4"
              />
            </Svg>
          </Animated.View>
        ))}
      </Animated.View>

      {/* Red Closing Death Wall indicator on left edge */}
      <View style={styles.deathWall} pointerEvents="none" />

      {/* Joystick HUD Overlay */}
      {joystickElement}

      {/* Dampened Fin Slowdown Power Button (left of Sonar) */}
      <TouchableOpacity
        style={[
          styles.finButton,
          { opacity: finOrbs >= 5 ? 1.0 : 0.4 }
        ]}
        onPress={activateDampenedFin}
        disabled={finOrbs < 5 || isEnemySlowed}
      >
        <Svg height="70" width="70" viewBox="0 0 70 70" style={styles.absoluteLayer}>
          {/* Faint background track */}
          <Circle cx="35" cy="35" r="30" stroke="rgba(255, 0, 153, 0.15)" strokeWidth="4" fill="none" />
          
          {/* Progress circle based on collected fin orbs (up to 5) */}
          <Circle
            cx="35"
            cy="35"
            r="30"
            stroke={Colors.MAGENTA}
            strokeWidth="4"
            fill="none"
            strokeDasharray="188.5"
            strokeDashoffset={188.5 - (188.5 * Math.min(finOrbs, 5)) / 5}
            strokeLinecap="round"
            transform="rotate(-90 35 35)"
          />
        </Svg>
        
        {/* Glowing Pink Orb in center */}
        <Svg height="32" width="32" viewBox="0 0 20 20">
          <Circle
            cx="10"
            cy="10"
            r="7"
            fill={isEnemySlowed ? 'rgba(0, 180, 255, 0.4)' : (finOrbs >= 5 ? 'rgba(255, 0, 153, 0.35)' : 'rgba(255, 0, 153, 0.08)')}
            stroke={isEnemySlowed ? '#00b4ff' : (finOrbs >= 5 ? Colors.MAGENTA : 'rgba(255, 0, 153, 0.35)')}
            strokeWidth="1.5"
          />
          <Circle
            cx="10"
            cy="10"
            r="2.5"
            fill={isEnemySlowed || finOrbs >= 5 ? '#FFFFFF' : 'rgba(255, 255, 255, 0.3)'}
          />
        </Svg>

        <Text style={[
          styles.finCounterText,
          { color: isEnemySlowed ? '#00b4ff' : (finOrbs >= 5 ? Colors.MAGENTA : '#FFFFFF') }
        ]}>
          {isEnemySlowed ? 'SLOWED' : `${finOrbs}/5`}
        </Text>
      </TouchableOpacity>

      {/* Sonar Pulse Fire Button */}
      <View
        style={styles.sonarButton}
        onTouchStart={firePulse}
        pointerEvents={isPulseReady ? 'auto' : 'none'}
      >
        <Svg height="70" width="70" viewBox="0 0 70 70" style={styles.absoluteLayer}>
          <Circle
            cx="35"
            cy="35"
            r="30"
            stroke={isPulseReady ? "rgba(0, 240, 255, 0.2)" : "rgba(255, 230, 0, 0.2)"}
            strokeWidth="4"
            fill="none"
          />
          <AnimatedCircle
            cx="35"
            cy="35"
            r="30"
            stroke={isPulseReady ? Colors.CYAN : Colors.YELLOW}
            strokeWidth="4"
            fill="none"
            strokeDasharray="188.5"
            strokeDashoffset={pulseCooldownAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 188.5],
            })}
            strokeLinecap="round"
            transform="rotate(-90 35 35)"
          />
        </Svg>
        <Text style={[
          styles.sonarCounterText,
          { color: isPulseReady ? Colors.CYAN : Colors.YELLOW }
        ]}>
          SONAR
        </Text>
      </View>
      </Animated.View>

      {/* Pause Menu Overlay */}
      {isPaused && (
        <View style={styles.pauseOverlay}>
          {!showPauseOptions ? (
            <View style={styles.pauseContent}>
              <Text style={styles.pauseTitle}>SYSTEM PAUSED</Text>
              
              <TouchableOpacity style={styles.pauseMenuButton} onPress={handlePauseToggle}>
                <Text style={styles.pauseMenuButtonText}>RESUME RUN</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.pauseMenuButton} onPress={handleRestart}>
                <Text style={styles.pauseMenuButtonText}>RESTART RUN</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.pauseMenuButton} onPress={() => setShowPauseOptions(true)}>
                <Text style={styles.pauseMenuButtonText}>OPTIONS</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.pauseMenuButton, { borderColor: Colors.MAGENTA }]} onPress={onBack}>
                <Text style={[styles.pauseMenuButtonText, { color: Colors.MAGENTA }]}>MAIN MENU</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.pauseContent}>
              <Text style={styles.pauseTitle}>SETTINGS</Text>

              <View style={styles.pauseOptionRow}>
                <Text style={styles.pauseOptionLabel}>SYSTEM AUDIO</Text>
                <TouchableOpacity onPress={() => setLocalSound(!localSound)} activeOpacity={0.7}>
                  <Text style={[styles.pauseOptionValue, { color: localSound ? Colors.CYAN : Colors.HUD_DIM }]}>
                    {localSound ? '[ ENABLED ]' : '[ DISABLED ]'}
                  </Text>
                </TouchableOpacity>
              </View>

              {localSound && (
                <View style={styles.pauseOptionRow}>
                  <Text style={styles.pauseOptionLabel}>VOLUME LEVEL</Text>
                  <VolumeSlider volume={localVolume} onVolumeChange={setLocalVolume} />
                </View>
              )}

              <View style={styles.pauseOptionRow}>
                <Text style={styles.pauseOptionLabel}>TACTILE HAPTICS</Text>
                <TouchableOpacity onPress={() => setLocalHaptics(!localHaptics)} activeOpacity={0.7}>
                  <Text style={[styles.pauseOptionValue, { color: localHaptics ? Colors.CYAN : Colors.HUD_DIM }]}>
                    {localHaptics ? '[ ENABLED ]' : '[ DISABLED ]'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.pauseCloseButtonRow}>
                <TouchableOpacity style={styles.pauseSaveButton} onPress={handleSavePauseSettings} activeOpacity={0.7}>
                  <Text style={styles.pauseSaveButtonText}>SAVE</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.pauseCloseButton} onPress={handleClosePauseSettings} activeOpacity={0.7}>
                  <Text style={styles.pauseCloseButtonText}>CLOSE</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BG_BLACK,
  },
  gameWorld: {
    flex: 1,
  },
  absoluteLayer: {
    position: 'absolute',
  },
  sonarButton: {
    position: 'absolute',
    bottom: 80,
    right: 30,
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  finButton: {
    position: 'absolute',
    bottom: 80,
    right: 120, // placed to the left of sonar button
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  finCounterText: {
    position: 'absolute',
    bottom: -18,
    fontSize: 9,
    fontFamily: 'sans-serif-medium',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  sonarCounterText: {
    position: 'absolute',
    bottom: -18,
    fontSize: 9,
    fontFamily: 'sans-serif-medium',
    fontWeight: 'bold',
    color: Colors.CYAN,
    letterSpacing: 0.5,
  },
  deathWall: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 15,
    backgroundColor: 'rgba(255, 46, 147, 0.15)',
    borderRightWidth: 3,
    borderColor: Colors.MAGENTA,
    shadowColor: Colors.MAGENTA,
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 90,
  },
  pulseContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
    marginLeft: -100,
    marginTop: -100,
    zIndex: 60,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },

  // PAUSE OVERLAY UI
  pauseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseContent: {
    width: 320,
    padding: 25,
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderWidth: 2,
    borderColor: Colors.CYAN,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: Colors.CYAN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 20,
  },
  pauseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.CYAN,
    letterSpacing: 2,
    marginBottom: 20,
  },
  pauseMenuButton: {
    width: '90%',
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: Colors.CYAN,
    borderRadius: 6,
    alignItems: 'center',
    marginVertical: 6,
    backgroundColor: 'rgba(0, 240, 255, 0.02)',
  },
  pauseMenuButtonText: {
    color: Colors.CYAN,
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  pauseOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginVertical: 6,
  },
  pauseOptionLabel: {
    color: '#CCCCCC',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  pauseOptionValue: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  pauseCloseButtonRow: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 15,
  },
  pauseSaveButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderWidth: 1.5,
    borderColor: Colors.CYAN,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 240, 255, 0.05)',
  },
  pauseSaveButtonText: {
    color: Colors.CYAN,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  pauseCloseButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderWidth: 1.5,
    borderColor: Colors.MAGENTA,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 46, 147, 0.05)',
  },
  pauseCloseButtonText: {
    color: Colors.MAGENTA,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  playerContainer: {
    position: 'absolute',
    width: 46,
    height: 46,
    marginLeft: -23,
    marginTop: -23,
    zIndex: 50,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  stalkerContainer: {
    position: 'absolute',
    width: 340,
    height: 340,
    marginLeft: -170,
    marginTop: -170,
    zIndex: 40,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
});