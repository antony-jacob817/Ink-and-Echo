import React, { useState, useCallback, useEffect } from 'react';
import { View, StatusBar, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, RubikGlitch_400Regular } from '@expo-google-fonts/rubik-glitch';

// Import our modular screens
import MainMenu from './src/screens/MainMenu';
import Gameplay from './src/screens/Gameplay';
import LevelSummary from './src/screens/LevelSummary';
import Biomastery from './src/screens/Biomastery';
import { FeedbackManager } from './src/utils/FeedbackManager';

SplashScreen.preventAutoHideAsync();

export default function App() {
  // Screen state: 'MENU', 'GAMEPLAY', 'LEVEL_SUMMARY', 'BIOMASTERY'
  const [gameState, setGameState] = useState('MENU');
  
  // Game progression & upgrade state
  const [highScore, setHighScore] = useState(0);
  const [embers, setEmbers] = useState(400); // 400 starting embers so shop is immediately testable
  const [upgrades, setUpgrades] = useState({
    afterglow: 1,
    dampened_fins: 1,
    pulse_capacity: 1,
  });

  // Settings State (sound & haptic toggles)
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [volume, setVolume] = useState(0.5);

  // Pre-load audio assets once at launch to avoid runtime I/O frame drops
  useEffect(() => {
    FeedbackManager.loadSounds();
  }, []);

  // Master sound and background music synchronization hook
  useEffect(() => {
    FeedbackManager.setSoundEnabled(soundEnabled);
    if (soundEnabled) {
      if (gameState === 'MENU' || gameState === 'BIOMASTERY' || gameState === 'LEVEL_SUMMARY') {
        FeedbackManager.startMenuMusic();
        FeedbackManager.stopAmbience();
      } else if (gameState === 'GAMEPLAY') {
        FeedbackManager.stopMenuMusic();
        FeedbackManager.startAmbience();
      }
    } else {
      FeedbackManager.stopMenuMusic();
      FeedbackManager.stopAmbience();
    }
  }, [gameState, soundEnabled]);

  useEffect(() => {
    FeedbackManager.setHapticsEnabled(hapticsEnabled);
  }, [hapticsEnabled]);

  useEffect(() => {
    FeedbackManager.setVolume(volume);
  }, [volume]);

  // Stats from the completed run to display on the summary screen
  const [summaryStats, setSummaryStats] = useState({
    distance: 0,
    orbsCollected: 0,
  });

  const [fontsLoaded, fontError] = useFonts({
    'JaggedFont': RubikGlitch_400Regular,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const handleLevelComplete = (stats) => {
    setSummaryStats(stats);
    if (stats.distance > highScore) {
      setHighScore(stats.distance);
    }
    setGameState('LEVEL_SUMMARY');
  };

  const handleBuyUpgrade = (upgradeKey, cost) => {
    setEmbers((prev) => prev - cost);
    setUpgrades((prev) => ({
      ...prev,
      [upgradeKey]: prev[upgradeKey] + 1,
    }));
  };

  const handleRunAgain = () => {
    setGameState('GAMEPLAY');
  };

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" hidden={true} />
      
      {gameState === 'MENU' && (
        <MainMenu
          onStartGame={() => setGameState('GAMEPLAY')}
          onOpenShop={() => setGameState('BIOMASTERY')}
          soundEnabled={soundEnabled}
          hapticsEnabled={hapticsEnabled}
          volume={volume}
          onToggleSound={setSoundEnabled}
          onToggleHaptics={setHapticsEnabled}
          onVolumeChange={setVolume}
        />
      )}
      
      {gameState === 'GAMEPLAY' && (
        <Gameplay
          highScore={highScore}
          upgrades={upgrades}
          soundEnabled={soundEnabled}
          hapticsEnabled={hapticsEnabled}
          volume={volume}
          onToggleSound={setSoundEnabled}
          onToggleHaptics={setHapticsEnabled}
          onVolumeChange={setVolume}
          onBack={() => setGameState('MENU')}
          onLevelComplete={handleLevelComplete}
        />
      )}

      {gameState === 'LEVEL_SUMMARY' && (
        <LevelSummary
          distance={summaryStats.distance}
          orbsCollected={summaryStats.orbsCollected}
          onNextLevel={handleRunAgain}
          onMenu={() => setGameState('MENU')}
          onBiomastery={() => setGameState('BIOMASTERY')}
          onAddEmbers={(earned) => setEmbers((prev) => prev + earned)}
        />
      )}

      {gameState === 'BIOMASTERY' && (
        <Biomastery
          embers={embers}
          upgrades={upgrades}
          onBuyUpgrade={handleBuyUpgrade}
          onBack={() => setGameState('MENU')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});