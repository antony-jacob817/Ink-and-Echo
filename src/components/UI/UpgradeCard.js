import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Colors } from '../../constants/Colors';

export default function UpgradeCard({
  upgradeKey,
  title,
  description,
  level,
  maxLevel,
  cost,
  isSelected,
  onPress,
}) {
  // Determine color theme based on upgrade type
  const getThemeColor = () => {
    switch (upgradeKey) {
      case 'afterglow':
        return Colors.CYAN;
      case 'dampened_fins':
        return Colors.MAGENTA;
      case 'pulse_capacity':
        return Colors.YELLOW;
      default:
        return Colors.CYAN;
    }
  };

  const themeColor = getThemeColor();

  // Render SVG icons for each upgrade type
  const renderIcon = () => {
    switch (upgradeKey) {
      case 'afterglow':
        return (
          <Svg height="40" width="40" viewBox="0 0 40 40">
            <Circle cx="20" cy="20" r="10" stroke={themeColor} strokeWidth="1.5" fill="none" opacity="0.4" />
            <Circle cx="20" cy="20" r="14" stroke={themeColor} strokeWidth="1.5" fill="none" opacity="0.7" />
            <Path d="M 12 20 A 8 8 0 0 1 28 20" stroke={themeColor} strokeWidth="2" fill="none" strokeLinecap="round" />
          </Svg>
        );
      case 'dampened_fins':
        return (
          <Svg height="40" width="40" viewBox="0 0 40 40">
            <Path d="M 5 35 C 10 20, 20 15, 30 15 C 25 25, 15 30, 5 35 Z" fill="rgba(255, 46, 147, 0.15)" stroke={themeColor} strokeWidth="2" />
            <Path d="M 30 15 L 35 10" stroke={themeColor} strokeWidth="1.5" />
            <Path d="M 28 22 C 32 24, 34 26, 36 28" stroke={themeColor} strokeWidth="1" strokeDasharray="2,2" />
          </Svg>
        );
      case 'pulse_capacity':
        return (
          <Svg height="40" width="40" viewBox="0 0 40 40">
            <Circle cx="20" cy="12" r="6" stroke={themeColor} strokeWidth="1.5" fill="none" />
            <Circle cx="20" cy="22" r="9" stroke={themeColor} strokeWidth="2" fill="none" />
            <Circle cx="20" cy="30" r="12" stroke={themeColor} strokeWidth="1" fill="none" opacity="0.6" />
          </Svg>
        );
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.cardContainer,
        { borderColor: isSelected ? themeColor : 'rgba(255, 255, 255, 0.15)' },
        isSelected && styles.cardSelected,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Icon Area */}
      <View style={[styles.iconWrapper, { borderColor: themeColor }]}>
        {renderIcon()}
      </View>

      {/* Info Area */}
      <View style={styles.infoWrapper}>
        <View style={styles.headerRow}>
          <Text style={[styles.cardTitle, { color: themeColor }]}>{title}</Text>
          <Text style={styles.levelText}>
            Level {level} / {maxLevel}
          </Text>
        </View>
        
        <Text style={styles.description}>{description}</Text>
        
        <View style={styles.footerRow}>
          {level >= maxLevel ? (
            <Text style={[styles.costText, { color: Colors.LIME }]}>MAX LEVEL</Text>
          ) : (
            <Text style={styles.costText}>
              Cost:{' '}
              <Text style={[styles.costValue, { color: themeColor }]}>
                {cost} EMBERS
              </Text>
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1.5,
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
    width: '100%',
    alignItems: 'center',
  },
  cardSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderWidth: 1,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    marginRight: 12,
  },
  infoWrapper: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  levelText: {
    color: '#888888',
    fontSize: 11,
    fontWeight: '300',
  },
  description: {
    color: '#CCCCCC',
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '300',
    lineHeight: 16,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  costText: {
    color: '#888888',
    fontSize: 11,
  },
  costValue: {
    fontWeight: 'bold',
  },
});
