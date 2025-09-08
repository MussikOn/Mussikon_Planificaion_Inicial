// @ts-nocheck
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { ElegantIcon } from './index';

interface RoleSwitcherProps {
  onRoleChange?: (newRole: 'leader' | 'musician') => void;
}

const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ onRoleChange }) => {
  const { user, changeRole } = useAuth();
  const [loading, setLoading] = useState(false);

  // Only show for musicians
  if (!user || user.role !== 'musician') {
    return null;
  }

  const currentRole = user.active_role || 'musician';
  const isLeader = currentRole === 'leader';

  const handleRoleChange = async () => {
    const newRole = isLeader ? 'musician' : 'leader';
    
    Alert.alert(
      'Cambiar Rol',
      `¿Estás seguro de que quieres cambiar a ${newRole === 'leader' ? 'Líder' : 'Músico'}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cambiar',
          onPress: async () => {
            try {
              setLoading(true);
              const success = await changeRole(newRole);
              
              if (success) {
                onRoleChange?.(newRole);
                Alert.alert(
                  'Rol Cambiado',
                  `Ahora eres ${newRole === 'leader' ? 'Líder' : 'Músico'}`,
                  [{ text: 'OK' }]
                );
              } else {
                Alert.alert('Error', 'No se pudo cambiar el rol');
              }
            } catch (error) {
              console.error('Error changing role:', error);
              Alert.alert('Error', 'No se pudo cambiar el rol');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.roleInfo}>
        <ElegantIcon 
          name={isLeader ? 'user-tie' : 'music'} 
          size={24} 
          color={colors.primary} 
        />
        <View style={styles.roleText}>
          <Text style={styles.roleLabel}>Rol Actual</Text>
          <Text style={styles.roleValue}>
            {isLeader ? 'Líder' : 'Músico'}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={[styles.switchButton, loading && styles.switchButtonDisabled]}
        onPress={handleRoleChange}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <>
            <ElegantIcon 
              name="refresh" 
              size={16} 
              color={colors.white} 
            />
            <Text style={styles.switchButtonText}>
              Cambiar a {isLeader ? 'Músico' : 'Líder'}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      },
      default: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }
    }),
  },
  roleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  roleText: {
    marginLeft: 12,
    flex: 1,
  },
  roleLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  roleValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  switchButtonDisabled: {
    opacity: 0.6,
  },
  switchButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RoleSwitcher;
