import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { colors } from '../config/theme';

export default function CustomHeader({ title, onBack, rightIcon, onRightPress }) {
  return (
    <View style={styles.header}>
      {onBack && (
        <IconButton 
          icon="arrow-left" 
          size={24} 
          iconColor={colors.dark.text} 
          onPress={onBack}
        />
      )}
      <Text style={styles.title}>{title}</Text>
      {rightIcon ? (
        <IconButton 
          icon={rightIcon} 
          size={24} 
          iconColor={colors.dark.text} 
          onPress={onRightPress}
        />
      ) : (
        <View style={{ width: 48 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: colors.dark.surface,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.dark.text,
  },
});
