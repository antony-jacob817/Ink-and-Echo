import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, ScrollView } from 'react-native';
import Svg, { Path, Circle, Line, Ellipse, Rect, G, Text as SvgText } from 'react-native-svg';
import { Colors } from '../constants/Colors';
import { UpgradeTiers } from '../constants/UpgradeTiers';
import UpgradeCard from '../components/UI/UpgradeCard';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function Biomastery({
  embers = 1250,
  upgrades = { afterglow: 1, dampened_fins: 1, pulse_capacity: 1 },
  onBuyUpgrade,
  onBack,
}) {
  const [selectedUpgradeKey, setSelectedUpgradeKey] = useState('afterglow');

  // Continuous breathing loop value (0 to 1)
  const breathAnim = useRef(new Animated.Value(0)).current;

  // Independent select weights (0 = off, 1 = selected) for smooth fading transitions
  const finsSelectAnim = useRef(new Animated.Value(selectedUpgradeKey === 'dampened_fins' ? 1 : 0)).current;
  const tailSelectAnim = useRef(new Animated.Value(selectedUpgradeKey === 'afterglow' ? 1 : 0)).current;
  const coreSelectAnim = useRef(new Animated.Value(selectedUpgradeKey === 'pulse_capacity' ? 1 : 0)).current;

  // Run the continuous breathing loop
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(breathAnim, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // Smoothly transition select weight values when selection changes
  useEffect(() => {
    Animated.parallel([
      Animated.timing(finsSelectAnim, {
        toValue: selectedUpgradeKey === 'dampened_fins' ? 1 : 0,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(tailSelectAnim, {
        toValue: selectedUpgradeKey === 'afterglow' ? 1 : 0,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(coreSelectAnim, {
        toValue: selectedUpgradeKey === 'pulse_capacity' ? 1 : 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, [selectedUpgradeKey]);

  // Interpolate the breathing loop to desired opacity bounds
  const breathIntensity = breathAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 0.85],
  });

  // Calculate final opacities by multiplying select weight * breathing intensity
  const finsGlowOpacity = Animated.multiply(finsSelectAnim, breathIntensity);
  const tailGlowOpacity = Animated.multiply(tailSelectAnim, breathIntensity);
  const coreGlowOpacity = Animated.multiply(coreSelectAnim, breathIntensity);

  const selectedUpgrade = UpgradeTiers[selectedUpgradeKey.toUpperCase()];
  const currentLevel = upgrades[selectedUpgradeKey];
  const maxLevel = selectedUpgrade.maxLevel;
  const isMaxLevel = currentLevel >= maxLevel;
  const nextLevelCost = isMaxLevel ? null : selectedUpgrade.costs[currentLevel];
  const canAfford = nextLevelCost !== null && embers >= nextLevelCost;

  const getThemeColor = (key) => {
    switch (key) {
      case 'afterglow': return Colors.CYAN;
      case 'dampened_fins': return Colors.MAGENTA;
      case 'pulse_capacity': return Colors.YELLOW;
      default: return Colors.CYAN;
    }
  };

  const activeColor = getThemeColor(selectedUpgradeKey);

  // Constant base color for general body outline (blueprint cyan)
  const bodyColor = 'rgba(0, 240, 255, 0.35)';
  const bodyBackLineColor = 'rgba(0, 240, 255, 0.12)';

  const handlePurchase = () => {
    if (canAfford) {
      onBuyUpgrade(selectedUpgradeKey, nextLevelCost);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={styles.headerBackButton}>
            <Text style={styles.headerBackButtonText}>&lt;</Text>
          </TouchableOpacity>
          <Text style={styles.title}>BIOMASTERY SHOP</Text>
        </View>
        
        {/* Embers Wrapper with Diamond Star Svg Icon */}
        <View style={styles.embersWrapper}>
          <Svg height="22" width="22" viewBox="0 0 40 40" style={styles.diamondStarSvg}>
            <Path
              d="M 20 2 L 38 20 L 20 38 L 2 20 Z"
              fill="rgba(255, 230, 0, 0.25)"
              stroke={Colors.YELLOW}
              strokeWidth="2.5"
            />
            <Path d="M 20 8 L 20 32 M 8 20 L 32 20" stroke={Colors.YELLOW} strokeWidth="1.5" opacity="0.6" />
            <Circle cx="20" cy="20" r="4.5" fill="#FFFFFF" />
          </Svg>
          <Text style={styles.embersLabel}>EMBERS: </Text>
          <Text style={styles.embersCount}>{embers}</Text>
        </View>
      </View>

      {/* Main Body: Landscape Split */}
      <View style={styles.bodySplit}>
        {/* Left Side: Scrollable Upgrades list */}
        <ScrollView style={styles.upgradesList} contentContainerStyle={styles.upgradesContainer}>
          {Object.keys(UpgradeTiers).map((key) => {
            const data = UpgradeTiers[key];
            const keyLower = data.id;
            const currentLvl = upgrades[keyLower];
            const maxLvl = data.maxLevel;
            const cost = currentLvl >= maxLvl ? null : data.costs[currentLvl];

            return (
              <UpgradeCard
                key={keyLower}
                upgradeKey={keyLower}
                title={data.title}
                description={data.description}
                level={currentLvl}
                maxLevel={maxLvl}
                cost={cost}
                isSelected={selectedUpgradeKey === keyLower}
                onPress={() => setSelectedUpgradeKey(keyLower)}
              />
            );
          })}
        </ScrollView>

        {/* Right Side: Visual Preview and Buy Button */}
        <View style={styles.previewContainer}>
          {/* Holographic grid and creature wireframe */}
          <View style={styles.hologramPanel}>
            {/* Technical Blueprint Graph Background */}
            <View style={styles.gridOverlay} pointerEvents="none">
              <Svg height="100%" width="100%" viewBox="0 0 400 300">
                {/* --- Fine grid lines (light grey) --- */}
                {[...Array(41)].map((_, i) => (
                  <Line key={`vf${i}`} x1={i * 10} y1="0" x2={i * 10} y2="300" stroke="rgba(120,120,120,0.08)" strokeWidth="0.5" />
                ))}
                {[...Array(31)].map((_, i) => (
                  <Line key={`hf${i}`} x1="0" y1={i * 10} x2="400" y2={i * 10} stroke="rgba(120,120,120,0.08)" strokeWidth="0.5" />
                ))}

                {/* --- Major grid lines (darker grey, every 50px) --- */}
                {[0, 50, 100, 150, 200, 250, 300, 350, 400].map((x) => (
                  <Line key={`vm${x}`} x1={x} y1="0" x2={x} y2="300" stroke="rgba(120,120,120,0.18)" strokeWidth="0.8" />
                ))}
                {[0, 50, 100, 150, 200, 250, 300].map((y) => (
                  <Line key={`hm${y}`} x1="0" y1={y} x2="400" y2={y} stroke="rgba(120,120,120,0.18)" strokeWidth="0.8" />
                ))}

                {/* --- Crosshair center lines --- */}
                <Line x1="200" y1="0" x2="200" y2="300" stroke="rgba(120,120,120,0.22)" strokeWidth="1" strokeDasharray="6,3" />
                <Line x1="0" y1="150" x2="400" y2="150" stroke="rgba(120,120,120,0.22)" strokeWidth="1" strokeDasharray="6,3" />

                {/* --- Dimension arrows & measurement lines --- */}
                {/* Top dimension line */}
                <G opacity="0.2">
                  <Line x1="60" y1="25" x2="340" y2="25" stroke="#888" strokeWidth="0.8" />
                  <Path d="M 60,22 L 60,28 M 340,22 L 340,28" stroke="#888" strokeWidth="0.8" />
                  <Path d="M 65,25 L 60,22 M 65,25 L 60,28" stroke="#888" strokeWidth="0.6" />
                  <Path d="M 335,25 L 340,22 M 335,25 L 340,28" stroke="#888" strokeWidth="0.6" />
                  <SvgText x="185" y="22" fill="#777" fontSize="7" fontFamily="monospace">280.0 mm</SvgText>
                </G>

                {/* Left dimension line */}
                <G opacity="0.2">
                  <Line x1="25" y1="50" x2="25" y2="260" stroke="#888" strokeWidth="0.8" />
                  <Path d="M 22,50 L 28,50 M 22,260 L 28,260" stroke="#888" strokeWidth="0.8" />
                  <SvgText x="12" y="158" fill="#777" fontSize="6" fontFamily="monospace" transform="rotate(-90 12 158)">210.0 mm</SvgText>
                </G>

                {/* --- Schematic annotation boxes --- */}
                {/* Top-left schematic rectangle */}
                <G opacity="0.12">
                  <Rect x="45" y="40" width="90" height="60" fill="none" stroke="#999" strokeWidth="0.8" strokeDasharray="4,2" />
                  <Line x1="45" y1="40" x2="135" y2="100" stroke="#888" strokeWidth="0.4" />
                  <Line x1="135" y1="40" x2="45" y2="100" stroke="#888" strokeWidth="0.4" />
                  <SvgText x="55" y="108" fill="#777" fontSize="5.5" fontFamily="monospace">SEC-A DORSAL</SvgText>
                </G>

                {/* Bottom-right schematic rectangle */}
                <G opacity="0.12">
                  <Rect x="260" y="195" width="100" height="65" fill="none" stroke="#999" strokeWidth="0.8" strokeDasharray="4,2" />
                  <Circle cx="310" cy="227" r="18" fill="none" stroke="#888" strokeWidth="0.5" />
                  <Line x1="292" y1="227" x2="328" y2="227" stroke="#888" strokeWidth="0.4" />
                  <Line x1="310" y1="209" x2="310" y2="245" stroke="#888" strokeWidth="0.4" />
                  <SvgText x="270" y="270" fill="#777" fontSize="5.5" fontFamily="monospace">SEC-B VENTRAL</SvgText>
                </G>

                {/* Mid-right annotation */}
                <G opacity="0.12">
                  <Line x1="330" y1="100" x2="380" y2="100" stroke="#888" strokeWidth="0.6" />
                  <Line x1="380" y1="90" x2="380" y2="110" stroke="#888" strokeWidth="0.6" />
                  <SvgText x="335" y="95" fill="#777" fontSize="5" fontFamily="monospace">REF-03</SvgText>
                  <SvgText x="335" y="115" fill="#777" fontSize="5" fontFamily="monospace">Ø12.5</SvgText>
                </G>

                {/* Bottom-left annotation */}
                <G opacity="0.12">
                  <Line x1="40" y1="220" x2="120" y2="220" stroke="#888" strokeWidth="0.6" />
                  <Circle cx="80" cy="240" r="12" fill="none" stroke="#888" strokeWidth="0.5" strokeDasharray="3,2" />
                  <SvgText x="45" y="265" fill="#777" fontSize="5" fontFamily="monospace">DATUM-A</SvgText>
                </G>

                {/* --- Scattered technical annotations --- */}
                <G opacity="0.1">
                  <SvgText x="15" y="15" fill="#888" fontSize="5" fontFamily="monospace">DWG: INK-ECHO-001</SvgText>
                  <SvgText x="280" y="15" fill="#888" fontSize="5" fontFamily="monospace">SCALE: 1:4.0</SvgText>
                  <SvgText x="15" y="290" fill="#888" fontSize="5" fontFamily="monospace">MATERIAL: BIO-LUMA</SvgText>
                  <SvgText x="280" y="290" fill="#888" fontSize="5" fontFamily="monospace">REV: 05-A</SvgText>
                </G>

                {/* --- Small scattered detail marks --- */}
                <G opacity="0.1">
                  {/* Small cross markers at intersections */}
                  <Path d="M 97,47 L 103,53 M 103,47 L 97,53" stroke="#888" strokeWidth="0.6" />
                  <Path d="M 197,97 L 203,103 M 203,97 L 197,103" stroke="#888" strokeWidth="0.6" />
                  <Path d="M 297,197 L 303,203 M 303,197 L 297,203" stroke="#888" strokeWidth="0.6" />
                  <Path d="M 147,197 L 153,203 M 153,197 L 147,203" stroke="#888" strokeWidth="0.6" />
                  {/* Small circles */}
                  <Circle cx="150" cy="50" r="4" fill="none" stroke="#888" strokeWidth="0.5" />
                  <Circle cx="250" cy="100" r="3" fill="none" stroke="#888" strokeWidth="0.5" />
                  <Circle cx="100" cy="200" r="5" fill="none" stroke="#888" strokeWidth="0.5" />
                  <Circle cx="320" cy="150" r="3.5" fill="none" stroke="#888" strokeWidth="0.5" />
                  {/* Angular construction lines */}
                  <Line x1="155" y1="120" x2="230" y2="80" stroke="#888" strokeWidth="0.4" strokeDasharray="5,3" />
                  <Line x1="170" y1="200" x2="250" y2="170" stroke="#888" strokeWidth="0.4" strokeDasharray="5,3" />
                </G>
              </Svg>
            </View>

            {/* Technical HUD Overlay Labels */}
            <View style={styles.labelsOverlay} pointerEvents="none">
              {/* Top-Left Box: Stabilizer Fins (Pink) */}
              <View style={[styles.techBox, { left: 8, top: 8, borderColor: Colors.MAGENTA }]}>
                <Text style={[styles.techBoxTitle, { color: Colors.MAGENTA }]}>STABILIZER_FINS</Text>
                <Text style={styles.techBoxSub}>Lvl {upgrades.dampened_fins} / Max 5</Text>
              </View>

              {/* Bottom-Left Box: Biolum Emitter (Blue/Cyan) */}
              <View style={[styles.techBox, { left: 8, bottom: 8, borderColor: Colors.CYAN }]}>
                <Text style={[styles.techBoxTitle, { color: Colors.CYAN }]}>BIOLUM_EMITTER</Text>
                <Text style={styles.techBoxSub}>Lvl {upgrades.afterglow} / Max 5</Text>
              </View>

              {/* Top-Right Box: Pulse Core (Yellow) */}
              <View style={[styles.techBox, { right: 8, top: 8, borderColor: Colors.YELLOW }]}>
                <Text style={[styles.techBoxTitle, { color: Colors.YELLOW }]}>SYS_PULSE_CORE</Text>
                <Text style={styles.techBoxSub}>Lvl {upgrades.pulse_capacity} / Max 5</Text>
              </View>
            </View>

            {/* Static 3D creature (Volumetric wireframe with perspective depth) */}
            <View
              style={[
                styles.spinner,
                {
                  transform: [
                    { perspective: 800 },
                    { rotateX: '15deg' },
                    { rotateZ: '45deg' }, // Head top-right, tail bottom-left
                    { rotateY: '25deg' }, // Static slight angle for 3D depth
                  ],
                },
              ]}
            >
              <Svg height="240" width="240" viewBox="-5 -5 110 110">
                {/* 3D Wireframe side fins (Base color always MAGENTA) - swept back */}
                <Path d="M 41 40 C 9 45, 9 70, 29 80" fill="none" stroke={Colors.MAGENTA} strokeWidth="1.2" opacity="0.65" />
                <Path d="M 59 40 C 91 45, 91 70, 71 80" fill="none" stroke={Colors.MAGENTA} strokeWidth="1.2" opacity="0.65" />

                {/* 3D Wireframe side fins GLOW OVERLAY (always rendered, opacity smoothly transitions) */}
                <AnimatedPath d="M 41 40 C 9 45, 9 70, 29 80" fill="none" stroke={Colors.MAGENTA} strokeWidth="4.5" opacity={finsGlowOpacity} strokeLinecap="round" />
                <AnimatedPath d="M 59 40 C 91 45, 91 70, 71 80" fill="none" stroke={Colors.MAGENTA} strokeWidth="4.5" opacity={finsGlowOpacity} strokeLinecap="round" />

                {/* 3D Wireframe segmented tail using rotated ellipses (Base color always CYAN) - larger segment radii */}
                <Ellipse cx="50" cy="55" rx="5.0" ry="1.8" fill="none" stroke={Colors.CYAN} strokeWidth="0.8" opacity="0.5" />
                <Ellipse cx="50" cy="61" rx="5.0" ry="1.9" fill="none" stroke={Colors.CYAN} strokeWidth="0.8" opacity="0.5" />
                <Ellipse cx="50" cy="67" rx="5.2" ry="2.1" fill="none" stroke={Colors.CYAN} strokeWidth="0.8" opacity="0.5" />
                <Ellipse cx="50" cy="73" rx="5.5" ry="2.3" fill="none" stroke={Colors.CYAN} strokeWidth="0.8" opacity="0.5" />
                <Ellipse cx="50" cy="79" rx="5.8" ry="2.5" fill="none" stroke={Colors.CYAN} strokeWidth="0.8" opacity="0.6" />
                <Ellipse cx="50" cy="85" rx="6.2" ry="2.7" fill="none" stroke={Colors.CYAN} strokeWidth="1.0" opacity="0.75" />
                <Ellipse cx="50" cy="91" rx="6.5" ry="2.8" fill="none" stroke={Colors.CYAN} strokeWidth="1.0" opacity="0.75" />
                <Ellipse cx="50" cy="96" rx="6.8" ry="3.0" fill="none" stroke={Colors.CYAN} strokeWidth="1.0" opacity="0.75" />

                {/* 3D Wireframe segmented tail GLOW OVERLAY (always rendered, opacity smoothly transitions) */}
                <AnimatedEllipse cx="50" cy="55" rx="5.0" ry="1.8" fill="none" stroke={Colors.CYAN} strokeWidth="3.2" opacity={tailGlowOpacity} />
                <AnimatedEllipse cx="50" cy="61" rx="5.0" ry="1.9" fill="none" stroke={Colors.CYAN} strokeWidth="3.2" opacity={tailGlowOpacity} />
                <AnimatedEllipse cx="50" cy="67" rx="5.2" ry="2.1" fill="none" stroke={Colors.CYAN} strokeWidth="3.2" opacity={tailGlowOpacity} />
                <AnimatedEllipse cx="50" cy="73" rx="5.5" ry="2.3" fill="none" stroke={Colors.CYAN} strokeWidth="3.2" opacity={tailGlowOpacity} />
                <AnimatedEllipse cx="50" cy="79" rx="5.8" ry="2.5" fill="none" stroke={Colors.CYAN} strokeWidth="3.2" opacity={tailGlowOpacity} />
                <AnimatedEllipse cx="50" cy="85" rx="6.2" ry="2.7" fill="none" stroke={Colors.CYAN} strokeWidth="3.5" opacity={tailGlowOpacity} />
                <AnimatedEllipse cx="50" cy="91" rx="6.5" ry="2.8" fill="none" stroke={Colors.CYAN} strokeWidth="3.5" opacity={tailGlowOpacity} />
                <AnimatedEllipse cx="50" cy="96" rx="6.8" ry="3.0" fill="none" stroke={Colors.CYAN} strokeWidth="3.5" opacity={tailGlowOpacity} />

                {/* Bioluminescent creature teardrop body outline (Constant neutral base) - larger head shape */}
                <Path
                  d="M 50 52 C 32 41, 32 15, 50 15 C 68 15, 68 41, 50 52 Z"
                  fill="none"
                  stroke={bodyColor}
                  strokeWidth="1.5"
                  opacity="0.8"
                />

                {/* 3D Wireframe Body Lines: FRONT Longitudinal Curves (Constant neutral base) */}
                <Path d="M 50 15 C 34 27, 34 38, 50 52" fill="none" stroke={bodyColor} strokeWidth="0.8" opacity="0.7" />
                <Path d="M 50 15 C 42 27, 42 38, 50 52" fill="none" stroke={bodyColor} strokeWidth="0.8" opacity="0.7" />
                <Path d="M 50 15 C 58 27, 58 38, 50 52" fill="none" stroke={bodyColor} strokeWidth="0.8" opacity="0.7" />
                <Path d="M 50 15 C 66 27, 66 38, 50 52" fill="none" stroke={bodyColor} strokeWidth="0.8" opacity="0.7" />

                {/* 3D Wireframe Body Lines: BACK Longitudinal Curves (Constant neutral base) */}
                <Path d="M 50 15 C 30 22, 30 44, 50 52" fill="none" stroke={bodyBackLineColor} strokeWidth="0.6" opacity="0.3" strokeDasharray="1,1" />
                <Path d="M 50 15 C 70 22, 70 44, 50 52" fill="none" stroke={bodyBackLineColor} strokeWidth="0.6" opacity="0.3" strokeDasharray="1,1" />

                {/* 3D Wireframe Body Lines: FRONT Latitudinal Bands (Constant neutral base) */}
                <Path d="M 36 22 C 40 24, 60 24, 64 22" fill="none" stroke={bodyColor} strokeWidth="0.8" opacity="0.6" />
                <Path d="M 33 30 C 38 33, 62 33, 67 30" fill="none" stroke={bodyColor} strokeWidth="0.8" opacity="0.6" />
                <Path d="M 35 40 C 40 43, 60 43, 65 40" fill="none" stroke={bodyColor} strokeWidth="0.8" opacity="0.6" />
                <Path d="M 43 47 C 45 49, 55 49, 57 47" fill="none" stroke={bodyColor} strokeWidth="0.8" opacity="0.6" />

                {/* 3D Wireframe Body Lines: BACK Latitudinal Bands (Constant neutral base) */}
                <Path d="M 36 22 C 40 20, 60 20, 64 22" fill="none" stroke={bodyBackLineColor} strokeWidth="0.6" opacity="0.35" strokeDasharray="2,2" />
                <Path d="M 33 30 C 38 27, 62 27, 67 30" fill="none" stroke={bodyBackLineColor} strokeWidth="0.6" opacity="0.35" strokeDasharray="2,2" />
                <Path d="M 35 40 C 40 37, 60 37, 65 40" fill="none" stroke={bodyBackLineColor} strokeWidth="0.6" opacity="0.35" strokeDasharray="2,2" />
                <Path d="M 43 47 C 45 45, 55 45, 57 47" fill="none" stroke={bodyBackLineColor} strokeWidth="0.6" opacity="0.35" strokeDasharray="2,2" />

                {/* Internal Cross details inside body (Glowing energy nucleus - Pulse Core base: YELLOW) */}
                <Path
                  d="M 50 18 L 50 49 M 40 45 L 60 23"
                  stroke={Colors.YELLOW}
                  strokeWidth="1.2"
                  opacity="0.8"
                />

                {/* Internal Cross details GLOW OVERLAY (always rendered, opacity smoothly transitions) */}
                <AnimatedPath
                  d="M 50 18 L 50 49 M 40 45 L 60 23"
                  stroke={Colors.YELLOW}
                  strokeWidth="3.5"
                  opacity={coreGlowOpacity}
                  strokeLinecap="round"
                />

                {/* Sonar Emitter Core base (Yellow dot) */}
                <Circle
                  cx="50"
                  cy="33.5"
                  r="5"
                  fill="rgba(255, 255, 0, 0.3)"
                  stroke={Colors.YELLOW}
                  strokeWidth="0.8"
                  opacity="0.8"
                />
                <Circle
                  cx="50"
                  cy="33.5"
                  r="2"
                  fill="#FFFFFF"
                  opacity="1"
                />

                {/* Sonar Emitter Core GLOW OVERLAY */}
                <AnimatedCircle
                  cx="50"
                  cy="33.5"
                  r="8"
                  fill="none"
                  stroke={Colors.YELLOW}
                  strokeWidth="2"
                  opacity={coreGlowOpacity}
                />
              </Svg>
            </View>
          </View>

          {/* Action Buy Button */}
          {isMaxLevel ? (
            <View style={[styles.buyButton, styles.buyButtonDisabled]}>
              <Text style={styles.buyButtonTextDisabled}>UPGRADE FULLY EVOLVED</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.buyButton,
                { borderColor: activeColor },
                !canAfford && styles.buyButtonDisabled,
              ]}
              onPress={handlePurchase}
              disabled={!canAfford}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.buyButtonText,
                  { color: activeColor },
                  !canAfford && styles.buyButtonTextDisabled,
                ]}
              >
                BUY UPGRADE
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BG_BLACK,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontFamily: 'JaggedFont',
    fontSize: 26,
    color: Colors.CYAN,
    letterSpacing: 2,
    textShadowColor: Colors.CYAN,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  embersWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  diamondStarSvg: {
    marginRight: 8,
  },
  embersLabel: {
    color: Colors.YELLOW,
    fontSize: 16,
    fontWeight: '300',
    letterSpacing: 1,
  },
  embersCount: {
    color: Colors.YELLOW,
    fontSize: 22,
    fontWeight: 'bold',
  },
  bodySplit: {
    flex: 1,
    flexDirection: 'row',
    gap: 20,
  },
  upgradesList: {
    flex: 0.45,
  },
  upgradesContainer: {
    paddingBottom: 20,
  },
  previewContainer: {
    flex: 0.55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hologramPanel: {
    flex: 1,
    width: '100%',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 10,
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  labelsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  techBox: {
    position: 'absolute',
    paddingVertical: 2,
    paddingHorizontal: 6,
    backgroundColor: 'rgba(15, 15, 15, 0.85)',
    borderWidth: 1,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
    elevation: 3,
  },
  techBoxTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  techBoxSub: {
    color: '#888888',
    fontSize: 7,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  spinner: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 20, // Move slightly towards screen right
  },
  buyButton: {
    width: '90%',
    paddingVertical: 10,
    borderWidth: 2,
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    marginBottom: 20, // increased to align horizontally with the bottom scrollview card
  },
  buyButtonDisabled: {
    borderColor: '#333333',
    backgroundColor: 'transparent',
  },
  buyButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  buyButtonTextDisabled: {
    color: '#555555',
  },
  headerBackButton: {
    marginRight: 15,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#444444',
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  headerBackButtonText: {
    color: '#888888',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
});
