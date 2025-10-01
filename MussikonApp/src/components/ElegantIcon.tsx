import React from 'react';
import { Text, StyleSheet, TextStyle, Platform } from 'react-native';
import { theme } from '../theme/theme';

interface ElegantIconProps {
  name: string;
  size?: number;
  color?: string;
  style?: TextStyle;
}

const ElegantIcon: React.FC<ElegantIconProps> = ({ 
  name, 
  size = 20, 
  color = theme.colors.text.primary,
  style 
}) => {
  const iconMap: { [key: string]: string } = {
    // Navigation icons
    'home': '⌂',
    'requests': '📋',
    'offers': '💼',
    'profile': '👤',
    'admin': '⚙',
    'menu': '☰',
    'close': '✕',
    'back': '◀',
    'forward': '▶',
    
    // Music icons
    'music': '♫',
    'guitar': '🎸',
    'piano': '🎹',
    'drum': '🥁',
    'microphone': '🎤',
    'headphones': '🎧',
    'violin': '🎻',
    'saxophone': '🎷',
    'trumpet': '🎺',
    'flute': '🎼',
    'bass': '🎸',
    'keyboard': '🎹',
    'singer': '🎤',
    
    // Event icons
    'calendar': '📅',
    'clock': '🕐',
    'location': '📍',
    'church': '⛪',
    'wedding': '💒',
    'funeral': '🕊',
    'conference': '🏛',
    'concert': '🎪',
    'retreat': '🏔',
    'youth': '👥',
    'service': '⛪',
    
    // Action icons
    'add': '⊕',
    'edit': '✎',
    'delete': '🗑',
    'save': '💾',
    'search': '🔍',
    'filter': '▼',
    'sort': '↕',
    'refresh': '↻',
    'download': '⬇',
    'calculator': '🧮',
    'alert-circle': '⚠',
    'upload': '⬆',
    'send': '➤',
    'receive': '◀',
    'create': '⊕',
    'view': '👁',
    'select': '✓',
    'reject': '✗',
    
    // Status icons
    'check': '✓',
    'cross': '✗',
    'warning': '⚠',
    'info': 'ℹ',
    'question': '?',
    'star': '★',
    'heart': '♥',
    'thumbs-up': '👍',
    'thumbs-down': '👎',
    'success': '✓',
    'error': '✗',
    'pending': '⏳',
    'approved': '✓',
    'rejected': '✗',
    
    // User icons
    'user': '👤',
    'users': '👥',
    'user-plus': '👤+',
    'user-check': '👤✓',
    'user-x': '👤✗',
    'crown': '♔',
    'shield': '🛡',
    'leader': '👑',
    'musician': '🎵',
    
    // Money icons
    'money': '💰',
    'dollar': '$',
    'credit-card': '💳',
    'bank': '🏦',
    'coins': '🪙',
    'budget': '💰',
    'price': '$',
    'wallet': '💰',
    'trending-up': '📈',
    
    // Communication icons
    'message': '💬',
    'phone': '📞',
    'email': '📧',
    'notification': '🔔',
    'bell': '🔔',
    'chat': '💬',
    
    // General icons
    'settings': '⚙',
    'gear': '⚙',
    'cog': '⚙',
    'lock': '🔒',
    'unlock': '🔓',
    'eye': '👁',
    'eye-off': '👁',
    'key': '🔑',
    'link': '🔗',
    'external-link': '🔗',
    'copy': '📋',
    'share': '📤',
    'bookmark': '🔖',
    'flag': '🚩',
    'tag': '🏷',
    'folder': '📁',
    'file': '📄',
    'image': '🖼',
    'video': '🎥',
    'play': '▶',
    'pause': '⏸',
    'stop': '⏹',
    'next': '⏭',
    'previous': '⏮',
    
    // Special icons
    'sparkle': '✨',
    'fire': '🔥',
    'lightning': '⚡',
    'sun': '☀',
    'moon': '🌙',
    'star-filled': '★',
    'star-empty': '☆',
    'diamond': '♦',
    'circle': '●',
    'square': '■',
    'triangle': '▲',
  };

  const icon = iconMap[name] || '?';

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
    fontFamily: Platform.OS === 'ios' ? 'System' : 'monospace',
  },
});

export default ElegantIcon;
