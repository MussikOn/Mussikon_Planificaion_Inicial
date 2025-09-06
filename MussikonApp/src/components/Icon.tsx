import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { theme } from '../theme/theme';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: TextStyle;
}

const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 20, 
  color = theme.colors.text.primary,
  style 
}) => {
  const iconMap: { [key: string]: string } = {
    // Navigation icons
    'home': '🏠',
    'requests': '📋',
    'offers': '💼',
    'profile': '👤',
    'admin': '⚙️',
    'menu': '☰',
    'close': '✕',
    'back': '←',
    'forward': '→',
    
    // Music icons
    'music': '🎵',
    'guitar': '🎸',
    'piano': '🎹',
    'drum': '🥁',
    'microphone': '🎤',
    'headphones': '🎧',
    'violin': '🎻',
    'saxophone': '🎷',
    'trumpet': '🎺',
    'flute': '🎼',
    
    // Event icons
    'calendar': '📅',
    'clock': '🕐',
    'location': '📍',
    'church': '⛪',
    'wedding': '💒',
    'funeral': '🕊️',
    'conference': '🏛️',
    'concert': '🎪',
    'retreat': '🏔️',
    'youth': '👥',
    
    // Action icons
    'add': '➕',
    'edit': '✏️',
    'delete': '🗑️',
    'save': '💾',
    'search': '🔍',
    'filter': '🔽',
    'sort': '🔄',
    'refresh': '🔄',
    'download': '⬇️',
    'upload': '⬆️',
    'send': '📤',
    'receive': '📥',
    
    // Status icons
    'check': '✅',
    'cross': '❌',
    'warning': '⚠️',
    'info': 'ℹ️',
    'question': '❓',
    'star': '⭐',
    'heart': '❤️',
    'thumbs-up': '👍',
    'thumbs-down': '👎',
    
    // User icons
    'user': '👤',
    'users': '👥',
    'user-plus': '👤➕',
    'user-check': '👤✅',
    'user-x': '👤❌',
    'crown': '👑',
    'shield': '🛡️',
    
    // Money icons
    'money': '💰',
    'dollar': '$',
    'credit-card': '💳',
    'bank': '🏦',
    'coins': '🪙',
    
    // Communication icons
    'message': '💬',
    'phone': '📞',
    'email': '📧',
    'notification': '🔔',
    'bell': '🔔',
    
    // General icons
    'settings': '⚙️',
    'gear': '⚙️',
    'cog': '⚙️',
    'lock': '🔒',
    'unlock': '🔓',
    'eye': '👁️',
    'eye-off': '👁️‍🗨️',
    'key': '🔑',
    'link': '🔗',
    'external-link': '🔗',
    'copy': '📋',
    'share': '📤',
    'bookmark': '🔖',
    'flag': '🚩',
    'tag': '🏷️',
    'folder': '📁',
    'file': '📄',
    'image': '🖼️',
    'video': '🎥',
    'play': '▶️',
    'pause': '⏸️',
    'stop': '⏹️',
    'next': '⏭️',
    'previous': '⏮️',
  };

  const icon = iconMap[name] || '❓';

  return (
    <Text style={[
      styles.icon,
      {
        fontSize: size,
        color,
      },
      style
    ]}>
      {icon}
    </Text>
  );
};

const styles = StyleSheet.create({
  icon: {
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

export default Icon;
