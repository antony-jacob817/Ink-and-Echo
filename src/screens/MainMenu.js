import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, useWindowDimensions, BackHandler, Animated } from 'react-native';
import Svg, { Polygon, Path, Line, Circle, G } from 'react-native-svg';
import { Colors } from '../constants/Colors';
import { FeedbackManager } from '../utils/FeedbackManager';

const MenuButton = ({ title, subtitle, locked, onPress }) => (
  <TouchableOpacity style={styles.buttonWrapper} onPress={onPress} activeOpacity={0.7}>
    <Svg height="44" width="260">
      {/* Cyan wireframe polygon */}
      <Polygon
        points="12,2 248,2 258,12 258,32 248,42 12,42 2,32 2,12"
        fill="rgba(0, 240, 255, 0.04)"
        stroke={Colors.CYAN}
        strokeWidth="1.5"
      />
      {/* Decorative corner ticks in magenta for that premium cyberpunk vibe! */}
      <Path d="M 9,2 L 2,9 M 251,2 L 258,9 M 2,35 L 9,42 M 258,35 L 251,42" stroke={Colors.MAGENTA} strokeWidth="1.5" />
    </Svg>
    <View style={styles.buttonContent}>
      <Text style={styles.buttonTitle}>{title}</Text>
      {subtitle && <Text style={styles.buttonSubtitle}>{subtitle} {locked ? '[LOCKED]' : ''}</Text>}
    </View>
  </TouchableOpacity>
);

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

export default function MainMenu({
  onStartGame,
  onOpenShop,
  soundEnabled = true,
  hapticsEnabled = true,
  volume = 0.5,
  onToggleSound,
  onToggleHaptics,
  onVolumeChange,
}) {
  const { width, height } = useWindowDimensions();

  // Settings State
  const [showOptions, setShowOptions] = useState(false);

  // Settings Local state for Save/Close behavior
  const [localSound, setLocalSound] = useState(soundEnabled);
  const [localHaptics, setLocalHaptics] = useState(hapticsEnabled);
  const [localVolume, setLocalVolume] = useState(volume);

  useEffect(() => {
    if (showOptions) {
      setLocalSound(soundEnabled);
      setLocalHaptics(hapticsEnabled);
      setLocalVolume(volume);
    }
  }, [showOptions, soundEnabled, hapticsEnabled, volume]);

  const handleVolumeChange = (newVal) => {
    setLocalVolume(newVal);
    FeedbackManager.setVolume(newVal); // live audio feedback!
  };

  const handleSave = () => {
    onToggleSound(localSound);
    onToggleHaptics(localHaptics);
    onVolumeChange(localVolume);
    setShowOptions(false);
  };

  const handleClose = () => {
    FeedbackManager.setVolume(volume); // Revert live feedback back to saved value
    setShowOptions(false);
  };

  // Background floating animation loop
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3800,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3800,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const handleQuit = () => {
    BackHandler.exitApp();
  };

  return (
    <View style={styles.container}>
      {/* Holographic grid overlay */}
      <View style={styles.gridOverlay} pointerEvents="none">
        <Svg height="100%" width="100%">
          <Line x1="15%" y1="0" x2="15%" y2="100%" stroke="rgba(0, 240, 255, 0.02)" strokeWidth="0.8" />
          <Line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgba(0, 240, 255, 0.02)" strokeWidth="0.8" />
          <Line x1="85%" y1="0" x2="85%" y2="100%" stroke="rgba(0, 240, 255, 0.02)" strokeWidth="0.8" />
          <Line x1="0" y1="25%" x2="100%" y2="25%" stroke="rgba(0, 240, 255, 0.02)" strokeWidth="0.8" />
          <Line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(0, 240, 255, 0.02)" strokeWidth="0.8" />
          <Line x1="0" y1="75%" x2="100%" y2="75%" stroke="rgba(0, 240, 255, 0.02)" strokeWidth="0.8" />
        </Svg>
      </View>

      {/* Background Sonar Rings in theme colors */}
      <View style={[styles.sonarContainer, { width, height }]}>
        <View style={[styles.sonarRing, { width: height * 0.8, height: height * 0.8, opacity: 0.25 }]} />
        <View style={[styles.sonarRing, { width: width * 0.7, height: width * 0.7, opacity: 0.15 }]} />
        <View style={[styles.sonarRing, { width: width * 1.2, height: width * 1.2, opacity: 0.08 }]} />
      </View>

      {/* Decorative Crystals themed with Cyan and Magenta wireframes */}
      <Animated.View
        style={[
          styles.crystal,
          {
            left: width * 0.04,
            top: height * 0.25,
            transform: [{ translateY: floatAnim.interpolate({ inputRange: [0, 1], outputRange: [-15, 10] }) }],
          }
        ]}
        pointerEvents="none"
      >
        <Svg height="200" width="160" viewBox="0 0 100 100">
          <Path d="M50,10 L80,40 L90,80 L50,95 L20,85 L10,50 Z M50,10 L50,95 M20,85 L50,40 L80,40 M10,50 L50,40" fill="none" stroke={Colors.CYAN} strokeWidth="1.2" opacity="0.45" />
        </Svg>
      </Animated.View>

      <Animated.View
        style={[
          styles.crystal,
          {
            right: width * 0.04,
            top: height * 0.2,
            transform: [{ translateY: floatAnim.interpolate({ inputRange: [0, 1], outputRange: [20, -15] }) }],
          }
        ]}
        pointerEvents="none"
      >
        <Svg height="250" width="180" viewBox="0 0 100 100">
          <Path d="M40,5 L75,30 L85,75 L45,90 L15,70 L5,35 Z M40,5 L45,90 M15,70 L40,35 L75,30 M5,35 L40,35" fill="none" stroke={Colors.MAGENTA} strokeWidth="1.2" opacity="0.4" />
        </Svg>
      </Animated.View>

      {/* Floating Yellow Diamond Crystal in background */}
      <Animated.View
        style={[
          styles.crystal,
          {
            left: width * 0.7,
            top: height * 0.65,
            transform: [
              { translateY: floatAnim.interpolate({ inputRange: [0, 1], outputRange: [-12, 18] }) },
              { rotate: floatAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '15deg'] }) }
            ],
          }
        ]}
        pointerEvents="none"
      >
        <Svg height="120" width="100" viewBox="0 0 100 100">
          <Path d="M50,5 L90,50 L50,95 L10,50 Z M50,5 L50,95 M10,50 L50,50 L90,50" fill="none" stroke={Colors.YELLOW} strokeWidth="1.2" opacity="0.3" />
        </Svg>
      </Animated.View>

      {/* Floating slow-swimming background predator silhouette */}
      <Animated.View
        style={[
          styles.floatingEnemy,
          {
            left: width * 0.12,
            top: height * 0.52,
            transform: [
              { translateX: floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 80] }) },
              { translateY: floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -35] }) },
              { rotate: floatAnim.interpolate({ inputRange: [0, 1], outputRange: ['-10deg', '5deg'] }) },
            ],
            opacity: 0.16, // very faint, non-distracting background element
          }
        ]}
        pointerEvents="none"
      >
        <Svg height="130" width="130" viewBox="0 0 340 340">
          {/* Scaled-down detailed wireframe body & eye (70% scale) */}
          <G transform="translate(170, 170) scale(0.7) translate(-170, -170)">
            <G stroke={Colors.PURPLE_GLOW} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              {/* Main Body Triangles (Semi-filled for volumetric depth) */}
              <Path d="M 230,170 L 210,150 L 180,150 Z" fill="rgba(193, 98, 231, 0.08)" />
              <Path d="M 230,170 L 210,162 L 180,170 Z" fill="rgba(193, 98, 231, 0.08)" />
              <Path d="M 230,170 L 215,182 L 180,170 Z" fill="rgba(193, 98, 231, 0.08)" />
              <Path d="M 180,150 L 180,170 L 155,165 Z" fill="rgba(193, 98, 231, 0.08)" />
              <Path d="M 180,150 L 160,135 L 135,150 Z" fill="rgba(193, 98, 231, 0.08)" />
              <Path d="M 180,150 L 135,150 L 180,170 Z" fill="rgba(193, 98, 231, 0.08)" />
              <Path d="M 180,170 L 135,150 L 135,170 Z" fill="rgba(193, 98, 231, 0.08)" />
              <Path d="M 180,170 L 135,170 L 155,190 Z" fill="rgba(193, 98, 231, 0.08)" />
              <Path d="M 155,190 L 135,190 L 135,170 Z" fill="rgba(193, 98, 231, 0.08)" />
              <Path d="M 135,150 L 110,163 L 135,170 Z" fill="rgba(193, 98, 231, 0.05)" />
              <Path d="M 135,170 L 110,177 L 135,190 Z" fill="rgba(193, 98, 231, 0.05)" />

              {/* Jaws Open Mouth Teeth */}
              <Path d="M 210,162 L 213,168 L 216,162 L 219,168 L 222,162 L 225,168 L 230,170" stroke="#FFFFFF" strokeWidth="1.6" />
              <Path d="M 215,182 L 218,176 L 221,182 L 224,176 L 227,182 L 230,170" stroke="#FFFFFF" strokeWidth="1.6" />

              {/* Fins */}
              <Path d="M 160,135 L 150,105 L 135,140 Z" stroke={Colors.MAGENTA} strokeWidth="2" fill="rgba(255, 46, 147, 0.05)" />
              <Path d="M 170,190 L 150,220 L 155,190 Z" stroke={Colors.MAGENTA} strokeWidth="2" fill="rgba(255, 46, 147, 0.05)" />
              <Path d="M 110,163 L 85,145 L 100,170 Z" stroke={Colors.MAGENTA} strokeWidth="2" fill="rgba(255, 46, 147, 0.05)" />
              <Path d="M 110,177 L 85,195 L 100,170 Z" stroke={Colors.MAGENTA} strokeWidth="2" fill="rgba(255, 46, 147, 0.05)" />
              <Path d="M 110,163 L 100,170 L 110,177 Z" />
            </G>

            {/* Glowing eye */}
            <Circle cx="210" cy="156" r="4.5" fill="#FF0055" />
            <Circle cx="210" cy="156" r="1.5" fill="#FFFFFF" />
          </G>

          {/* Outer circular threat warning rings */}
          <Circle cx="170" cy="170" r="105" stroke="rgba(255, 0, 0, 0.2)" strokeWidth="4" fill="none" />
          <Circle cx="170" cy="170" r="105" stroke="rgba(255, 0, 0, 0.4)" strokeWidth="1.5" fill="none" strokeDasharray="6,4" />
        </Svg>
      </Animated.View>

      {/* Main Content Area */}
      <View style={[styles.contentContainer, { height }]}>
        <View style={styles.titleContainer}>
          <Text style={styles.titleInk}>INK </Text>
          <Text style={styles.titleAmpersand}>& </Text>
          <Text style={styles.titleEcho}>ECHO</Text>
        </View>

        <View style={styles.menuOptions}>
          <MenuButton title="START GAME" onPress={onStartGame} />
          <MenuButton title="BIOMASTERY SHOP" onPress={onOpenShop} />
          <MenuButton title="OPTIONS" onPress={() => setShowOptions(true)} />
          <MenuButton title="QUIT" onPress={handleQuit} />
        </View>
      </View>

      {/* Options Panel Overlay */}
      {showOptions && (
        <View style={styles.optionsModal}>
          <Text style={styles.optionsTitle}>SYSTEM SETTINGS</Text>

          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>SYSTEM AUDIO</Text>
            <TouchableOpacity onPress={() => setLocalSound(!localSound)} activeOpacity={0.7}>
              <Text style={[styles.optionValue, { color: localSound ? Colors.CYAN : Colors.HUD_DIM }]}>
                {localSound ? '[ ENABLED ]' : '[ DISABLED ]'}
              </Text>
            </TouchableOpacity>
          </View>

          {localSound && (
            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>VOLUME LEVEL</Text>
              <VolumeSlider volume={localVolume} onVolumeChange={handleVolumeChange} />
            </View>
          )}

          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>TACTILE HAPTICS</Text>
            <TouchableOpacity onPress={() => setLocalHaptics(!localHaptics)} activeOpacity={0.7}>
              <Text style={[styles.optionValue, { color: localHaptics ? Colors.CYAN : Colors.HUD_DIM }]}>
                {localHaptics ? '[ ENABLED ]' : '[ DISABLED ]'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.closeButtonRow}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.7}>
              <Text style={styles.saveButtonText}>SAVE</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose} activeOpacity={0.7}>
              <Text style={styles.closeButtonText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Text style={styles.footerLeft}>© 2024 DEEP VOID STUDIOS</Text>
      <Text style={styles.footerRight}>v1.01 (Neon-Alpha)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BG_BLACK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sonarContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  sonarRing: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 3.5,
    borderColor: Colors.CYAN,
    shadowColor: Colors.CYAN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 4,
  },
  crystal: {
    position: 'absolute',
    zIndex: 1,
  },
  floatingEnemy: {
    position: 'absolute',
    zIndex: 1,
  },
  contentContainer: {
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  titleContainer: {
    flexDirection: 'row',
    marginBottom: 15, // reduced to fit smaller landscape devices
    alignItems: 'center',
  },
  titleInk: {
    fontFamily: 'JaggedFont',
    fontSize: 48, // reduced to fit smaller landscape devices
    color: Colors.CYAN,
    textShadowColor: Colors.MAGENTA,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  titleAmpersand: {
    fontFamily: 'JaggedFont',
    fontSize: 38,
    color: Colors.YELLOW,
    textShadowColor: 'rgba(255, 230, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    opacity: 0.9,
  },
  titleEcho: {
    fontFamily: 'JaggedFont',
    fontSize: 48,
    color: Colors.MAGENTA,
    textShadowColor: Colors.CYAN,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  menuOptions: {
    gap: 8, // reduced from 10
    alignItems: 'center',
  },
  buttonWrapper: {
    width: 260,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonTitle: {
    color: Colors.CYAN,
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 2,
    textShadowColor: Colors.CYAN,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  buttonSubtitle: {
    color: Colors.CYAN,
    fontSize: 8,
    marginTop: 0,
    opacity: 0.8,
    letterSpacing: 1,
  },
  footerLeft: {
    position: 'absolute',
    bottom: 8,
    left: 20,
    color: '#555555',
    fontSize: 9,
    zIndex: 2,
  },
  footerRight: {
    position: 'absolute',
    bottom: 8,
    right: 20,
    color: '#555555',
    fontSize: 9,
    zIndex: 2,
  },

  // OPTIONS MODAL UI
  optionsModal: {
    position: 'absolute',
    width: 340,
    height: 240,
    top: '50%',
    left: '50%',
    transform: [{ translateX: -170 }, { translateY: -120 }],
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderWidth: 2,
    borderColor: Colors.CYAN,
    borderRadius: 10,
    padding: 25,
    zIndex: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.CYAN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 20,
  },
  optionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.CYAN,
    letterSpacing: 2,
    marginBottom: 20,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginVertical: 8,
  },
  optionLabel: {
    color: Colors.HUD_WHITE,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
  },
  optionValue: {
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  closeButtonRow: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 15,
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderWidth: 1.5,
    borderColor: Colors.CYAN,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 240, 255, 0.05)',
  },
  saveButtonText: {
    color: Colors.CYAN,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderWidth: 1.5,
    borderColor: Colors.MAGENTA,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 46, 147, 0.05)',
  },
  closeButtonText: {
    color: Colors.MAGENTA,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
});