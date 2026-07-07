import React from 'react';
import { StyleSheet, Animated } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { Colors } from '../../constants/Colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function PredatorSprite({ enemyRef, stalkerAnim, stalkerRot, trackingAnim, isSlowed }) {
  // Natively interpolate passive group opacity
  const passiveOpacity = trackingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  // Natively interpolate tracking group opacity
  const trackingOpacity = trackingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View
      ref={enemyRef}
      style={[
        styles.stalkerContainer,
        {
          transform: [
            { translateX: 0 },
            { translateY: 0 },
            { rotate: '0deg' }
          ],
        },
      ]}
    >
      {/* 1. Passive Concentric Rings Group Overlay */}
      <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: passiveOpacity }]} pointerEvents="none">
        <Svg height="340" width="340" viewBox="0 0 340 340">
          <Circle cx="170" cy="170" r="105" stroke={isSlowed ? 'rgba(0, 150, 255, 0.15)' : 'rgba(0, 212, 255, 0.04)'} strokeWidth="16" fill="none" />
          <Circle cx="170" cy="170" r="105" stroke={isSlowed ? 'rgba(0, 150, 255, 0.3)' : 'rgba(0, 212, 255, 0.08)'} strokeWidth="6" fill="none" />
          <Circle cx="170" cy="170" r="105" stroke={isSlowed ? 'rgba(0, 150, 255, 0.5)' : 'rgba(0, 212, 255, 0.18)'} strokeWidth="1.5" fill={isSlowed ? 'rgba(0, 150, 255, 0.02)' : 'rgba(0, 212, 255, 0.005)'} />
        </Svg>
      </Animated.View>

      {/* 2. Tracking Concentric Rings Group Overlay */}
      <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: trackingOpacity }]} pointerEvents="none">
        <Svg height="340" width="340" viewBox="0 0 340 340">
          <Circle cx="170" cy="170" r="105" stroke={isSlowed ? 'rgba(0, 150, 255, 0.3)' : 'rgba(255, 0, 0, 0.12)'} strokeWidth="16" fill="none" />
          <Circle cx="170" cy="170" r="105" stroke={isSlowed ? 'rgba(0, 150, 255, 0.5)' : 'rgba(255, 0, 0, 0.22)'} strokeWidth="6" fill="none" />
          <Circle cx="170" cy="170" r="105" stroke={isSlowed ? 'rgba(0, 150, 255, 0.8)' : 'rgba(255, 0, 0, 0.55)'} strokeWidth="1.5" fill={isSlowed ? 'rgba(0, 150, 255, 0.04)' : 'rgba(255, 0, 0, 0.02)'} />
        </Svg>
      </Animated.View>

      {/* 3. Base wireframe body & eye (scaled to 70% size around the center) */}
      <Svg height="340" width="340" viewBox="0 0 340 340" style={StyleSheet.absoluteFillObject}>
        <G transform="translate(170, 170) scale(0.7) translate(-170, -170)">
          <G stroke={Colors.PURPLE_GLOW} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* Main Body Triangles (Semi-filled for volumetric depth) */}
            <Path d="M 230,170 L 210,150 L 180,150 Z" fill="rgba(193, 98, 231, 0.15)" />
            <Path d="M 230,170 L 210,162 L 180,170 Z" fill="rgba(193, 98, 231, 0.15)" />
            <Path d="M 230,170 L 215,182 L 180,170 Z" fill="rgba(193, 98, 231, 0.15)" />
            <Path d="M 180,150 L 180,170 L 155,165 Z" fill="rgba(193, 98, 231, 0.15)" />
            <Path d="M 180,150 L 160,135 L 135,150 Z" fill="rgba(193, 98, 231, 0.15)" />
            <Path d="M 180,150 L 135,150 L 180,170 Z" fill="rgba(193, 98, 231, 0.15)" />
            <Path d="M 180,170 L 135,150 L 135,170 Z" fill="rgba(193, 98, 231, 0.15)" />
            <Path d="M 180,170 L 135,170 L 155,190 Z" fill="rgba(193, 98, 231, 0.15)" />
            <Path d="M 155,190 L 135,190 L 135,170 Z" fill="rgba(193, 98, 231, 0.15)" />
            <Path d="M 135,150 L 110,163 L 135,170 Z" fill="rgba(193, 98, 231, 0.1)" />
            <Path d="M 135,170 L 110,177 L 135,190 Z" fill="rgba(193, 98, 231, 0.1)" />

            {/* Sharp Jagged Jaws & Open Mouth Teeth */}
            {/* Upper Jaw Teeth */}
            <Path d="M 210,162 L 213,168 L 216,162 L 219,168 L 222,162 L 225,168 L 230,170" stroke="#FFFFFF" strokeWidth="1.6" />
            {/* Lower Jaw Teeth */}
            <Path d="M 215,182 L 218,176 L 221,182 L 224,176 L 227,182 L 230,170" stroke="#FFFFFF" strokeWidth="1.6" />

            {/* Fins (Highlighted with bright Magenta borders for bioluminescence) */}
            {/* Dorsal Fin */}
            <Path d="M 160,135 L 150,105 L 135,140 Z" stroke={Colors.MAGENTA} strokeWidth="2" fill="rgba(255, 46, 147, 0.1)" />
            {/* Pectoral Fin */}
            <Path d="M 170,190 L 150,220 L 155,190 Z" stroke={Colors.MAGENTA} strokeWidth="2" fill="rgba(255, 46, 147, 0.1)" />
            {/* Tail Fin */}
            <Path d="M 110,163 L 85,145 L 100,170 Z" stroke={Colors.MAGENTA} strokeWidth="2" fill="rgba(255, 46, 147, 0.1)" />
            <Path d="M 110,177 L 85,195 L 100,170 Z" stroke={Colors.MAGENTA} strokeWidth="2" fill="rgba(255, 46, 147, 0.1)" />
            <Path d="M 110,163 L 100,170 L 110,177 Z" />
          </G>

          {/* Fearsome glowing eye */}
          <Circle cx="210" cy="156" r="4.5" fill={isSlowed ? '#00b4ff' : '#FF0055'} />
          <Circle cx="210" cy="156" r="1.5" fill="#FFFFFF" />
        </G>
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
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
