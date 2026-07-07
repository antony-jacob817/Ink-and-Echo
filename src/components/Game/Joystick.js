import React from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import Svg, { Circle, Polygon } from 'react-native-svg';

export default function Joystick({ thumbPos }) {
  return (
    <View style={styles.joystickBase}>
      <Svg height="120" width="120" viewBox="0 0 120 120" style={styles.absoluteLayer}>
        {/* Joystick boundary ring and center dot */}
        <Circle cx="60" cy="60" r="55" stroke="rgba(0, 240, 255, 0.2)" strokeWidth="2" fill="none" />
        <Circle cx="60" cy="60" r="8" fill="rgba(0, 240, 255, 0.3)" />
        
        {/* Directional arrows */}
        <Polygon points="60,5 65,15 55,15" fill="rgba(255,255,255,0.2)" />
        <Polygon points="60,115 65,105 55,105" fill="rgba(255,255,255,0.2)" />
        <Polygon points="5,60 15,55 15,65" fill="rgba(255,255,255,0.2)" />
        <Polygon points="115,60 105,55 105,65" fill="rgba(255,255,255,0.2)" />
      </Svg>
      <Animated.View style={[styles.joystickThumb, { transform: thumbPos.getTranslateTransform() }]}>
        <Svg height="40" width="40" viewBox="0 0 40 40">
          <Circle cx="20" cy="20" r="16" fill="#00F0FF" />
          <Circle cx="20" cy="20" r="20" stroke="rgba(0, 240, 255, 0.6)" strokeWidth="2" fill="none" />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  joystickBase: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
    pointerEvents: 'none',
  },
  joystickThumb: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  absoluteLayer: {
    position: 'absolute',
  },
});
