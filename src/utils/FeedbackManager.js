import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

let soundEnabled = true;
let hapticsEnabled = true;
let currentVolume = 0.5;

// Preloaded sound objects to avoid main thread disk load lag during gameplay
let pingSound = null;
let shatterSound = null;
let ambientSoundInstance = null;

export const FeedbackManager = {
  loadSounds: async () => {
    try {
      if (!pingSound) {
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/sonar_ping.mp3')
        );
        pingSound = sound;
      }
      if (!shatterSound) {
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/hazard_shatter.mp3')
        );
        shatterSound = sound;
      }
      if (!ambientSoundInstance) {
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/bass_rumble.mp3'),
          { isLooping: true, volume: currentVolume }
        );
        ambientSoundInstance = sound;
      }
    } catch (e) {
      console.warn("FeedbackManager: Failed to pre-load audio assets.", e.message);
    }
  },

  setSoundEnabled: (enabled) => {
    soundEnabled = enabled;
    if (!enabled) {
      FeedbackManager.stopAmbience();
    }
  },

  setHapticsEnabled: (enabled) => {
    hapticsEnabled = enabled;
  },

  setVolume: async (val) => {
    currentVolume = val;
    if (ambientSoundInstance) {
      try {
        await ambientSoundInstance.setVolumeAsync(val);
      } catch (error) {
        console.warn("FeedbackManager: Failed to set volume on ambience.", error.message);
      }
    }
  },

  playPulseSound: async () => {
    if (!soundEnabled) return;
    try {
      if (pingSound) {
        await pingSound.setPositionAsync(0);
        await pingSound.setVolumeAsync(currentVolume);
        await pingSound.playAsync();
      } else {
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/sonar_ping.mp3')
        );
        await sound.setVolumeAsync(currentVolume);
        await sound.playAsync();
      }
    } catch (error) {
      console.warn("FeedbackManager: Failed to play pulse sound.", error.message);
    }
  },

  playDamageSound: async () => {
    if (!soundEnabled) return;
    try {
      if (shatterSound) {
        await shatterSound.setPositionAsync(0);
        await shatterSound.setVolumeAsync(currentVolume);
        await shatterSound.playAsync();
      } else {
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/hazard_shatter.mp3')
        );
        await sound.setVolumeAsync(currentVolume);
        await sound.playAsync();
      }
    } catch (error) {
      console.warn("FeedbackManager: Failed to play damage sound.", error.message);
    }
  },

  startAmbience: async () => {
    if (!soundEnabled) return;
    try {
      if (ambientSoundInstance) {
        await ambientSoundInstance.setPositionAsync(0);
        await ambientSoundInstance.setVolumeAsync(currentVolume);
        await ambientSoundInstance.playAsync();
      } else {
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/bass_rumble.mp3'),
          { isLooping: true, volume: currentVolume }
        );
        ambientSoundInstance = sound;
        await ambientSoundInstance.playAsync();
      }
    } catch (error) {
      console.warn("FeedbackManager: Failed to start ambient audio.", error.message);
    }
  },

  stopAmbience: async () => {
    try {
      if (ambientSoundInstance) {
        await ambientSoundInstance.pauseAsync(); // Keep loaded, just pause to avoid disk reload lag
      }
    } catch (error) {
      console.warn("FeedbackManager: Failed to stop ambient audio.", error.message);
    }
  },

  triggerHaptic: async (type = 'light') => {
    if (!hapticsEnabled) return;
    try {
      switch (type) {
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'light':
        default:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
      }
    } catch (error) {
      console.log("FeedbackManager: Haptic feedback bypassed.");
    }
  }
};
