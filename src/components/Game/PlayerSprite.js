import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, View } from 'react-native';
import Svg, { Path, Circle, Ellipse } from 'react-native-svg';
import { Colors } from '../../constants/Colors';

export default function PlayerSprite({
  playerRef,
  creaturePos,
  creatureRot,
  tailGrowth, // Animated.Value driven natively by creature speed in Gameplay loop
  upgrades = { afterglow: 1, dampened_fins: 1, pulse_capacity: 1 },
  blinkAnim,
  breathingAnim,
  emitAnim1,
  emitAnim2,
  emitAnim3,
  emitAnim4,
  particles1,
  particles2,
  particles3,
  particles4,
}) {
  // Extract upgrade levels for visual evolution
  const afterglowLvl = upgrades?.afterglow || 1;
  const dampenedFinsLvl = upgrades?.dampened_fins || 1;
  const pulseCapacityLvl = upgrades?.pulse_capacity || 1;

  // Visual Evolution: Fin color is always MAGENTA to match shop, thickness grows with level
  const finColor = Colors.MAGENTA;
  const finStrokeWidth = 1.2 + (dampenedFinsLvl - 1) * 0.3;

  // Particle glow scale increases with afterglow levels
  const glowScaleBase = 0.8 * (1 + (afterglowLvl - 1) * 0.12);
  const glowScaleEnd = 1.5 * (1 + (afterglowLvl - 1) * 0.18);

  // Tail starts tucked in and slides out downwards in 100x100 viewBox space
  const tailTranslateY = tailGrowth.interpolate({
    inputRange: [0, 1],
    outputRange: [-8, 6],
  });

  const tailOpacity = tailGrowth.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0.35, 0.65, 1],
  });

  const renderEmitGroup = (anim, particlesGroup, direction) => {
    const rotateBase = direction > 0 ? '0deg' : '360deg';
    const rotateEnd = direction > 0 ? '45deg' : '315deg';
    
    return (
      <Animated.View
        key={direction}
        style={[
          styles.creatureGlow,
          {
            transform: [
              { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [glowScaleBase, glowScaleEnd] }) },
              { rotate: anim.interpolate({ inputRange: [0, 1], outputRange: [rotateBase, rotateEnd] }) }
            ],
            opacity: anim.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 0.6, 0.6, 0] })
          }
        ]}
      >
        <Svg height="250" width="250" viewBox="-125 -125 250 250">
          {particlesGroup.map((p, i) => (
            <Circle key={i} cx={p.x} cy={p.y} r={p.size} fill={Colors.PURPLE_GLOW} />
          ))}
        </Svg>
      </Animated.View>
    );
  };

  return (
    /* 
      Outer Container: 40x40 centered directly at truePos.
      This ensures the rotation pivot matches the center of the body perfectly.
    */
    <Animated.View
      ref={playerRef}
      style={[
        styles.playerContainer,
        {
          transform: [
            { translateX: 0 },
            { translateY: 0 },
            { rotate: '0deg' }
          ],
        },
      ]}
    >
      {/* Inner Container: Handles native opacity and blinking blinkAnim */}
      <Animated.View
        style={{
          opacity: blinkAnim,
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Rapid emission particle swarm */}
        {renderEmitGroup(emitAnim1, particles1, 1)}
        {renderEmitGroup(emitAnim2, particles2, -1)}
        {renderEmitGroup(emitAnim3, particles3, 2)}
        {renderEmitGroup(emitAnim4, particles4, -2)}

        {/* Layer 1: Segmented Tail Svg - Slides out / retracts under the body */}
        <Animated.View
          style={[
            styles.absoluteLayer,
            {
              opacity: tailOpacity,
              transform: [{ translateY: tailTranslateY }],
              zIndex: 1,
            },
          ]}
        >
          <Svg height="46" width="46" viewBox="0 0 100 100">
            {/* Tilted tail segment ellipses matching shop shape exactly */}
            <Ellipse cx="50" cy="55" rx="5.0" ry="1.8" fill={Colors.CYAN} opacity="0.35" />
            <Ellipse cx="50" cy="61" rx="5.0" ry="1.9" fill={Colors.CYAN} opacity="0.35" />
            <Ellipse cx="50" cy="67" rx="5.2" ry="2.1" fill={Colors.CYAN} opacity="0.45" />
            <Ellipse cx="50" cy="73" rx="5.5" ry="2.3" fill={Colors.CYAN} opacity="0.55" />
            <Ellipse cx="50" cy="79" rx="5.8" ry="2.5" fill={Colors.CYAN} opacity="0.65" />
            <Ellipse cx="50" cy="85" rx={6.2 + (afterglowLvl - 1) * 0.5} ry={2.7 + (afterglowLvl - 1) * 0.25} fill={Colors.CYAN} stroke="#FFFFFF" strokeWidth="0.5" />
            <Ellipse cx="50" cy="91" rx={6.5 + (afterglowLvl - 1) * 0.5} ry={2.8 + (afterglowLvl - 1) * 0.25} fill={Colors.CYAN} stroke="#FFFFFF" strokeWidth="0.5" />
            <Ellipse cx="50" cy="96" rx={6.8 + (afterglowLvl - 1) * 0.5} ry={3.0 + (afterglowLvl - 1) * 0.25} fill={Colors.CYAN} stroke="#FFFFFF" strokeWidth="0.5" />
          </Svg>
        </Animated.View>

        {/* Layer 2: Main Teardrop Body and Side Fins - Visual center at exactly (50, 50) */}
        <Svg height="46" width="46" viewBox="0 0 100 100" style={[styles.absoluteLayer, { zIndex: 2 }]}>
          {/* Side Fins (exactly aligned with shop coordinates) */}
          <Path d="M 41 40 C 9 45, 9 70, 29 80" fill="none" stroke={finColor} strokeWidth={finStrokeWidth} strokeLinecap="round" />
          <Path d="M 59 40 C 91 45, 91 70, 71 80" fill="none" stroke={finColor} strokeWidth={finStrokeWidth} strokeLinecap="round" />

          {/* Bioluminescent Teardrop Body (Slightly larger head tip) */}
          <Path d="M 50 53 C 29 40, 29 11, 50 11 C 71 11, 71 40, 50 53 Z" fill="rgba(0, 212, 255, 0.75)" stroke={Colors.CYAN} strokeWidth="1.5" />

          {/* Internal Cross Details (Yellow core shifted forward) */}
          <Path d="M 50 14 L 50 49 M 38 44 L 62 20" stroke={Colors.YELLOW} strokeWidth="1.2" opacity="0.9" />

          {/* Sonar Emitter Core (Yellow shifted forward) */}
          <Circle
            cx="50"
            cy="31.5"
            r={6 + (pulseCapacityLvl - 1) * 1.5}
            fill="rgba(255, 255, 0, 0.3)"
            stroke={Colors.YELLOW}
            strokeWidth="0.8"
            opacity="0.9"
          />
          <Circle
            cx="50"
            cy="31.5"
            r={2.5 + (pulseCapacityLvl - 1) * 0.8}
            fill="#FFFFFF"
            opacity="1"
          />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
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
  creatureGlow: {
    position: 'absolute',
    width: 250,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },
  absoluteLayer: {
    position: 'absolute',
  },
});
