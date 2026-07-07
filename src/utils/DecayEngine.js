import { Animated } from 'react-native';

export const DecayEngine = {
  getDecayDuration: (baseDuration = 1200, afterglowMultiplier = 1.0) => {
    return baseDuration * afterglowMultiplier;
  },

  createRevealSequence: (animValue, flashDuration = 150, decayDuration = 1200) => {
    return Animated.sequence([
      Animated.timing(animValue, {
        toValue: 1,
        duration: flashDuration,
        useNativeDriver: true,
      }),
      Animated.timing(animValue, {
        toValue: 0,
        duration: decayDuration,
        useNativeDriver: true,
      }),
    ]);
  }
};
