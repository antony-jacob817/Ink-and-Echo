import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';

export default function GameOverOverlay({ onRetry, onAbandon }) {
  return (
    <View style={styles.gameOverContainer}>
      <Text style={styles.gameOverTitle}>LOST IN THE DEEP</Text>
      
      <View style={styles.gameOverButtons}>
        <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.7}>
          <Text style={styles.retryText}>↻ RETRY CURRENT LEVEL</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.abandonLargeButton} onPress={onAbandon} activeOpacity={0.7}>
          <Text style={styles.abandonLargeText}>🚪 ABANDON & RETURN</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gameOverContainer: {
    flex: 1,
    backgroundColor: Colors.BG_BLACK,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 200,
  },
  gameOverTitle: {
    fontFamily: 'JaggedFont',
    fontSize: 56,
    color: Colors.MAGENTA,
    textShadowColor: Colors.MAGENTA,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    marginBottom: 40,
    letterSpacing: 2,
    textAlign: 'center',
  },
  gameOverButtons: {
    flexDirection: 'row',
    gap: 20,
  },
  retryButton: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderWidth: 2,
    borderColor: Colors.CYAN,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
  },
  retryText: {
    color: Colors.CYAN,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  abandonLargeButton: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderWidth: 2,
    borderColor: Colors.MAGENTA,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 46, 147, 0.1)',
  },
  abandonLargeText: {
    color: Colors.MAGENTA,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
