import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Animated } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Colors } from '../../constants/Colors';

// Self-contained Heart Component that handles its own breaking animations natively
function HUDHeart({ index, lives }) {
  const active = index < lives;
  const wasLost = index === lives; // triggers when lives changes and matches index
  
  const breakAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (wasLost) {
      breakAnim.setValue(0);
      Animated.timing(breakAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    } else {
      breakAnim.setValue(0);
    }
  }, [lives]);

  const leftTranslateX = breakAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });
  const leftRotate = breakAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-25deg'],
  });

  const rightTranslateX = breakAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 8],
  });
  const rightRotate = breakAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '25deg'],
  });

  const breakOpacity = breakAnim.interpolate({
    inputRange: [0, 0.8, 1],
    outputRange: [1, 0.5, 0],
  });

  return (
    <View style={styles.heartWrapper}>
      {/* Background Empty Slot (Always rendered behind) */}
      <Svg height="22" width="22" viewBox="0 0 24 24" style={styles.heartSvgAbsolute}>
        <Path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          fill="none"
          stroke="#444444"
          strokeWidth="2.5"
        />
      </Svg>

      {/* Active Static glowing Heart */}
      {active && (
        <Svg height="22" width="22" viewBox="0 0 24 24" style={styles.heartSvgAbsolute}>
          <Path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill={Colors.MAGENTA}
            stroke={Colors.MAGENTA}
            strokeWidth="1.5"
          />
        </Svg>
      )}

      {/* Breaking/Shattering Heart Halves (Splits left/right and fades out) */}
      {wasLost && (
        <>
          {/* Left Half View */}
          <Animated.View
            style={[
              styles.heartSvgAbsolute,
              {
                opacity: breakOpacity,
                transform: [
                  { translateX: leftTranslateX },
                  { rotate: leftRotate }
                ]
              }
            ]}
          >
            <Svg height="22" width="22" viewBox="0 0 24 24">
              <Path
                d="M12 21.35 C5.4 15.36, 2 12.28, 2 8.5 C2 5.42, 4.42 3, 7.5 3 C9.24 3, 10.91 3.81, 12 5.09 L12 21.35 Z"
                fill={Colors.MAGENTA}
                stroke={Colors.MAGENTA}
                strokeWidth="1.5"
              />
            </Svg>
          </Animated.View>

          {/* Right Half View */}
          <Animated.View
            style={[
              styles.heartSvgAbsolute,
              {
                opacity: breakOpacity,
                transform: [
                  { translateX: rightTranslateX },
                  { rotate: rightRotate }
                ]
              }
            ]}
          >
            <Svg height="22" width="22" viewBox="0 0 24 24">
              <Path
                d="M12 5.09 C13.09 3.81, 14.76 3, 16.5 3 C19.58 3, 22 5.42, 22 8.5 C22 12.28, 18.6 15.36, 12 21.35 Z"
                fill={Colors.MAGENTA}
                stroke={Colors.MAGENTA}
                strokeWidth="1.5"
              />
            </Svg>
          </Animated.View>
        </>
      )}
    </View>
  );
}

export default function HUD({
  distanceTextRef,
  highScore = 0,
  orbsCollected = 0, // represents total points
  lives,
  maxLives,
  onPause,
}) {
  return (
    <>
      {/* Top Left: Score Tracker */}
      <View style={styles.hudTopLeft}>
        <TextInput
          ref={distanceTextRef}
          editable={false}
          style={styles.hudScoreText}
          defaultValue="DISTANCE: 0m"
          pointerEvents="none"
          underlineColorAndroid="transparent"
        />
        <Text style={styles.hudBestText}>BEST: {Math.floor(highScore)}m</Text>
      </View>

      {/* Top Center: Pause (Hamburger) Button */}
      <View style={styles.hudTopCenter}>
        <TouchableOpacity style={styles.pauseButton} onPress={onPause} activeOpacity={0.7}>
          <Svg height="20" width="20" viewBox="0 0 24 24">
            <Path d="M3,6 h18 M3,12 h18 M3,18 h18" stroke={Colors.CYAN} strokeWidth="3.5" strokeLinecap="round" />
          </Svg>
        </TouchableOpacity>
      </View>

      {/* Top Right: Orb Tracker */}
      <View style={styles.hudTopRight}>
        <Text style={styles.hudOrbText}>ORBS: {orbsCollected}</Text>
      </View>

      {/* Bottom Right: Lives Tracker (Custom SVG Hearts with breaking animations, no text label) */}
      <View style={styles.hudBottomRight}>
        <View style={styles.heartsContainer}>
          {[...Array(maxLives)].map((_, i) => (
            <HUDHeart key={i} index={i} lives={lives} />
          ))}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  hudTopLeft: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 110,
    pointerEvents: 'none',
  },
  hudScoreText: {
    color: Colors.CYAN,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    padding: 0,
    margin: 0,
  },
  hudBestText: {
    color: Colors.HUD_DIM,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1,
    marginTop: 2,
  },
  hudTopCenter: {
    position: 'absolute',
    top: 20,
    left: '50%',
    transform: [{ translateX: -20 }], // centered horizontally for a 40px width button
    zIndex: 110,
    alignItems: 'center',
  },
  pauseButton: {
    padding: 10,
    borderWidth: 1.5,
    borderColor: Colors.CYAN,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 240, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hudTopRight: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 110,
    pointerEvents: 'none',
  },
  hudOrbText: {
    color: Colors.YELLOW,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  hudBottomRight: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    zIndex: 110,
    pointerEvents: 'none',
  },
  heartsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heartWrapper: {
    width: 22,
    height: 22,
    position: 'relative',
    marginHorizontal: 4,
  },
  heartSvgAbsolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 22,
    height: 22,
  },
});
