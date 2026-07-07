import React, { useEffect, useRef, useMemo } from 'react';
import { StyleSheet, Animated } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Colors } from '../../constants/Colors';

// Standard Obstacles Renderer function
function ObstaclesRenderer({ obstacles }) {
  return (
    <>
      {obstacles.map((obs) => (
        <Animated.View
          key={obs.id}
          style={[
            styles.obstacleContainer,
            {
              left: obs.x - obs.size / 2,
              top: obs.y - obs.size / 2,
              opacity: obs.opacity,
            },
          ]}
        >
          <Svg height={obs.size} width={obs.size} viewBox="0 0 100 100">
            {/* Layer 1: Thick semi-transparent neon glow backdrop */}
            <Path
              d={obs.path}
              fill="none"
              stroke={obs.color}
              strokeWidth="8"
              opacity="0.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Layer 2: Medium semi-transparent neon glow core */}
            <Path
              d={obs.path}
              fill="none"
              stroke={obs.color}
              strokeWidth="4"
              opacity="0.55"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Layer 3: Ultra-bright sharp white inner neon core */}
            <Path
              d={obs.path}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Animated.View>
      ))}
    </>
  );
}

// Standard Orbs Renderer function
function OrbsRenderer({ orbs }) {
  // Global native-driven pulsing scale animation for all orbs
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.18,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.92,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <>
      {orbs.map((orb) => (
        <Animated.View
          key={orb.id}
          style={[
            styles.orbContainer,
            {
              left: orb.x - orb.size / 2,
              top: orb.y - orb.size / 2,
              opacity: orb.opacity,
              transform: [
                { scale: pulseAnim } // 100% Natively animated pulsing glow!
              ]
            },
          ]}
        >
          {orb.type === 'big' ? (
            /* Big Glow Orb (worth 10 points) */
            <Svg height={orb.size} width={orb.size} viewBox="0 0 30 30">
              <Circle cx="15" cy="15" r="13" fill="rgba(255, 230, 0, 0.18)" stroke={Colors.YELLOW} strokeWidth="1.2" strokeDasharray="3,2" />
              <Circle cx="15" cy="15" r="9" fill="rgba(255, 255, 255, 0.15)" stroke={Colors.YELLOW} strokeWidth="1" />
              <Circle cx="15" cy="15" r="4.2" fill="#FFFFFF" />
            </Svg>
          ) : orb.type === 'fin' ? (
            /* Fin Orb (Magenta/pink round circle) */
            <Svg height={orb.size} width={orb.size} viewBox="0 0 20 20">
              <Circle cx="10" cy="10" r="7" fill="rgba(255, 0, 153, 0.2)" stroke={Colors.MAGENTA} strokeWidth="1.5" />
              <Circle cx="10" cy="10" r="2.5" fill="#FFFFFF" />
            </Svg>
          ) : (
            /* Regular Orb (worth 5 points) */
            <Svg height={orb.size} width={orb.size} viewBox="0 0 20 20">
              <Circle cx="10" cy="10" r="7" fill="rgba(255, 230, 0, 0.15)" stroke={Colors.YELLOW} strokeWidth="1" />
              <Circle cx="10" cy="10" r="2.5" fill="#FFFFFF" />
            </Svg>
          )}
        </Animated.View>
      ))}
    </>
  );
}

// Standard Portal Renderer function
function PortalRenderer({ portal, portalOpacity }) {
  return (
    <Animated.View
      style={[
        styles.portalContainer,
        {
          left: portal.x - portal.size / 2,
          top: portal.y - portal.size / 2,
          opacity: portalOpacity,
        },
      ]}
    >
      <Svg height={portal.size} width={portal.size} viewBox="0 0 40 40">
        <Path
          d="M 20 2 L 38 20 L 20 38 L 2 20 Z"
          fill="none"
          stroke={Colors.YELLOW}
          strokeWidth="2.5"
        />
        <Path
          d="M 20 10 L 30 20 L 20 30 L 10 20 Z"
          fill="rgba(255, 240, 0, 0.15)"
          stroke={Colors.YELLOW}
          strokeWidth="1.5"
        />
        <Circle cx="20" cy="20" r="4" fill={Colors.YELLOW} />
      </Svg>
    </Animated.View>
  );
}

export default function WireframeMap({
  obstacles,
  orbs = [],
  portal,
  portalOpacity,
}) {
  // Use standard useMemo hook to render component elements without using React.memo wrapper objects
  const obstaclesElement = useMemo(() => (
    <ObstaclesRenderer obstacles={obstacles} />
  ), [obstacles]);

  const orbsElement = useMemo(() => (
    <OrbsRenderer orbs={orbs} />
  ), [orbs]);

  const portalElement = useMemo(() => (
    portal ? <PortalRenderer portal={portal} portalOpacity={portalOpacity} /> : null
  ), [portal, portalOpacity]);

  return (
    <>
      {obstaclesElement}
      {orbsElement}
      {portalElement}
    </>
  );
}

const styles = StyleSheet.create({
  obstacleContainer: {
    position: 'absolute',
    zIndex: 2,
  },
  orbContainer: {
    position: 'absolute',
    zIndex: 3,
  },
  portalContainer: {
    position: 'absolute',
    zIndex: 3,
  },
});
