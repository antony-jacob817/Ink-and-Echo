import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Colors } from '../constants/Colors';

const AnimatedView = Animated.createAnimatedComponent(View);

export default function LevelSummary({
  distance = 0,
  orbsCollected = 0,
  onNextLevel, // Run Again
  onMenu,
  onBiomastery,
  onAddEmbers,
}) {
  // Embers calculation: distance + orbs = embers
  const embersReward = Math.floor(distance) + orbsCollected;

  // Animation values
  const cardScale1 = useRef(new Animated.Value(0)).current;
  const cardScale2 = useRef(new Animated.Value(0)).current;
  const cardScale3 = useRef(new Animated.Value(0)).current;
  const rewardOpacity = useRef(new Animated.Value(0)).current;
  const rewardScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    onAddEmbers(embersReward);

    // Staggered entrance animations
    Animated.sequence([
      Animated.stagger(150, [
        Animated.spring(cardScale1, { toValue: 1, friction: 6, useNativeDriver: true }),
        Animated.spring(cardScale2, { toValue: 1, friction: 6, useNativeDriver: true }),
        Animated.spring(cardScale3, { toValue: 1, friction: 6, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(rewardOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(rewardScale, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        })
      ])
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.summaryTitle}>DEPTH RECORD</Text>

      {/* 3-Card Row (Distance, Orbs, and Total Embers Yield) */}
      <View style={styles.cardsRow}>
        {/* Card 1: Distance */}
        <AnimatedView style={[styles.card, { borderColor: Colors.CYAN, transform: [{ scale: cardScale1 }] }]}>
          <Text style={[styles.cardHeader, { color: Colors.CYAN }]}>DISTANCE</Text>
          
          <Svg height="60" width="60" viewBox="0 0 40 40" style={styles.iconSvg}>
            <Circle cx="20" cy="20" r="16" fill="none" stroke={Colors.CYAN} strokeWidth="1.5" strokeDasharray="3,3" />
            <Path d="M 20 8 L 20 32 M 8 20 L 32 20" stroke={Colors.CYAN} strokeWidth="1.5" opacity="0.4" />
            <Circle cx="20" cy="20" r="4.5" fill="rgba(0, 240, 255, 0.3)" stroke={Colors.CYAN} strokeWidth="1.5" />
          </Svg>

          {/* Inner box label that looks like a button */}
          <View style={[styles.cardButton, { borderColor: Colors.CYAN }]}>
            <Text style={[styles.cardButtonText, { color: Colors.CYAN }]}>DISTANCE</Text>
          </View>
          <Text style={styles.cardSubText}>{Math.floor(distance)}m TRAVELED</Text>
        </AnimatedView>

        {/* Card 2: Orbs */}
        <AnimatedView style={[styles.card, { borderColor: Colors.YELLOW, transform: [{ scale: cardScale2 }] }]}>
          <Text style={[styles.cardHeader, { color: Colors.YELLOW }]}>HARVEST</Text>
          
          <Svg height="60" width="60" viewBox="0 0 40 40" style={styles.iconSvg}>
            <Circle cx="20" cy="20" r="16" fill="rgba(255, 230, 0, 0.15)" stroke={Colors.YELLOW} strokeWidth="2" />
            <Circle cx="20" cy="20" r="8" fill="rgba(255, 255, 255, 0.1)" stroke={Colors.YELLOW} strokeWidth="1.5" />
            <Circle cx="20" cy="20" r="3.5" fill="#FFFFFF" />
          </Svg>

          {/* Inner box label that looks like a button */}
          <View style={[styles.cardButton, { borderColor: Colors.YELLOW }]}>
            <Text style={[styles.cardButtonText, { color: Colors.YELLOW }]}>ORBS</Text>
          </View>
          <Text style={styles.cardSubText}>{orbsCollected} COLLECTED</Text>
        </AnimatedView>

        {/* Card 3: Total Embers */}
        <AnimatedView style={[styles.card, { borderColor: Colors.MAGENTA, transform: [{ scale: cardScale3 }] }]}>
          <Text style={[styles.cardHeader, { color: Colors.MAGENTA }]}>TOTAL</Text>
          
          <Svg height="60" width="60" viewBox="0 0 40 40" style={styles.iconSvg}>
            {/* Glowing Diamond Star Svg */}
            <Path
              d="M 20 4 L 36 20 L 20 36 L 4 20 Z"
              fill="rgba(255, 46, 147, 0.2)"
              stroke={Colors.MAGENTA}
              strokeWidth="2"
            />
            <Path d="M 20 10 L 20 30 M 10 20 L 30 20" stroke={Colors.MAGENTA} strokeWidth="1" opacity="0.6" />
            <Circle cx="20" cy="20" r="3.5" fill="#FFFFFF" />
          </Svg>

          {/* Inner box label that looks like a button */}
          <View style={[styles.cardButton, { borderColor: Colors.MAGENTA }]}>
            <Text style={[styles.cardButtonText, { color: Colors.MAGENTA }]}>EMBERS</Text>
          </View>
          <Text style={styles.cardSubText}>
            {Math.floor(distance)} + {orbsCollected} = {embersReward}
          </Text>
        </AnimatedView>
      </View>

      {/* Rewards Section with Diamond Star Icon */}
      <AnimatedView
        style={[
          styles.rewardContainer,
          {
            opacity: rewardOpacity,
            transform: [{ scale: rewardScale }],
          },
        ]}
      >
        <Svg height="26" width="26" viewBox="0 0 40 40" style={styles.diamondStarSvg}>
          <Path
            d="M 20 2 L 38 20 L 20 38 L 2 20 Z"
            fill="rgba(255, 230, 0, 0.25)"
            stroke={Colors.YELLOW}
            strokeWidth="2.5"
          />
          <Path d="M 20 8 L 20 32 M 8 20 L 32 20" stroke={Colors.YELLOW} strokeWidth="1.5" opacity="0.6" />
          <Circle cx="20" cy="20" r="4.5" fill="#FFFFFF" />
        </Svg>
        <Text style={styles.rewardText}>
          Embers: <Text style={styles.rewardEmbers}>+{embersReward}</Text>
        </Text>
      </AnimatedView>

      {/* Nav Buttons */}
      <View style={styles.navRow}>
        <TouchableOpacity style={styles.navButton} onPress={onMenu} activeOpacity={0.7}>
          <Text style={styles.navButtonText}>[ &lt; MENU ]</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, { borderColor: Colors.YELLOW }]}
          onPress={onBiomastery}
          activeOpacity={0.7}
        >
          <Text style={[styles.navButtonText, { color: Colors.YELLOW }]}>[ BIOMASTERY ]</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, { borderColor: Colors.CYAN }]}
          onPress={onNextLevel}
          activeOpacity={0.7}
        >
          <Text style={[styles.navButtonText, { color: Colors.CYAN }]}>[ RUN AGAIN &gt; ]</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BG_BLACK,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  summaryTitle: {
    fontFamily: 'JaggedFont',
    fontSize: 26,
    color: Colors.CYAN,
    letterSpacing: 2,
    marginBottom: 15,
    textShadowColor: Colors.CYAN,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    width: '100%',
    maxWidth: 800,
    marginBottom: 15,
  },
  card: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1.5,
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    minHeight: 170,
  },
  cardHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  iconSvg: {
    marginVertical: 4,
  },
  cardButton: {
    borderWidth: 1.2,
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
  },
  cardButtonText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  cardSubText: {
    color: '#888888',
    fontSize: 9,
    fontWeight: '500',
    marginTop: 6,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    marginBottom: 15,
    gap: 10,
  },
  diamondStarSvg: {
    marginRight: 2,
  },
  rewardText: {
    color: Colors.HUD_WHITE,
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  rewardEmbers: {
    color: Colors.YELLOW,
    fontSize: 18,
    fontWeight: '900',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    width: '100%',
    maxWidth: 550,
  },
  navButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#333333',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
  },
  navButtonText: {
    color: Colors.HUD_WHITE,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
});
