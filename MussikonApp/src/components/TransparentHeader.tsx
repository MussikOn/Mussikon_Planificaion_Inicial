import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { theme } from '../theme/theme';

interface TransparentHeaderProps {
  title: string;
  onMenuPress: () => void;
  showMenu?: boolean;
}

const TransparentHeader: React.FC<TransparentHeaderProps> = ({ 
  title, 
  onMenuPress, 
  showMenu = true 
}) => {
  return (
    <View style={styles.header}>
      {showMenu && (
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={onMenuPress}
          activeOpacity={0.8}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(10, 42, 95, 0.08)',
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      web: {
        boxShadow: `0px 2px 8px rgba(0, 0, 0, 0.12)`,
      },
    }),
    elevation: 3,
    zIndex: 100,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: theme.borders.radius.full,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      web: {
        boxShadow: `0px 3px 6px rgba(0, 0, 0, 0.25)`,
      },
    }),
    elevation: 5,
  },
  menuIcon: {
    fontSize: 18,
    color: theme.colors.text.white,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.primary,
    flex: 1,
    marginTop: 8,
  },
});

export default TransparentHeader;
