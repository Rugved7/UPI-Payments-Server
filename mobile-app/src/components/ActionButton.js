import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { colors } from '../config/theme';

export default function ActionButton({ icon, label, onPress, badge }) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        <IconButton 
          icon={icon} 
          size={28} 
          iconColor={colors.dark.primary}
          style={styles.icon}
        />
        {badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 12,
  },
  iconContainer: {
    position: 'relative',
    backgroundColor: colors.dark.cardElevated,
    borderRadius: 16,
    marginBottom: 8,
  },
  icon: {
    margin: 0,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.dark.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.dark.text,
    fontSize: 11,
    fontWeight: '700',
  },
  label: {
    fontSize: 13,
    color: colors.dark.textSecondary,
    textAlign: 'center',
  },
});
