import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Image,
  Alert
} from 'react-native';
import { Music, Trash2, Heart } from 'lucide-react-native';
import { DEFAULT_FOLDER } from '../../constants';
import { Track } from '../../types';
import { Colors } from '../../theme/colors';

// ============================================================================
// Props Interface
// ============================================================================
interface TrackItemProps {
  item: Track;
  isCurrent: boolean;
  colors: Colors;
  onPress: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}

// ============================================================================
// Track Item Component
// ============================================================================
// A single row in the song list representing a track.
export const TrackItem: React.FC<TrackItemProps> = ({ 
  item, 
  isCurrent, 
  colors, 
  onPress, 
  onDelete,
  onToggleFavorite
}) => {
  
  const handleDelete = () => {
      Alert.alert(
          "Delete Track",
          `Are you sure you want to remove "${item.name}" from your library?`,
          [
              { text: "Cancel", style: "cancel" },
              { text: "Delete", style: "destructive", onPress: onDelete }
          ]
      );
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        isCurrent && { backgroundColor: colors.surface } 
      ]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* --- Album Art Icon --- */}
      <View style={[styles.iconContainer, { backgroundColor: colors.border }]}>
        {item.artwork ? (
          <Image 
            source={{ uri: item.artwork }} 
            style={styles.artwork} 
            resizeMode="cover"
          />
        ) : (
          <Music 
            color={isCurrent ? colors.primary : colors.text} 
            size={22} 
          />
        )}
      </View>

      {/* --- Text Info --- */}
      <View style={styles.textContainer}>
        <Text 
          style={[
            styles.title, 
            { color: isCurrent ? colors.primary : colors.text }
          ]} 
          numberOfLines={1}
        >
          {item.name}
        </Text>
        
        <Text 
          style={[styles.subtitle, { color: colors.subtext }]} 
          numberOfLines={1}
        >
          {item.artist || 'Unknown Artist'} • {item.folder || DEFAULT_FOLDER}
        </Text>
      </View>

      {/* --- Action Buttons --- */}
      <View style={styles.actions}>
        <TouchableOpacity 
          onPress={onToggleFavorite} 
          style={styles.actionButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Heart 
            color={item.isFavorite ? '#FF4B4B' : colors.subtext} 
            fill={item.isFavorite ? '#FF4B4B' : 'transparent'} 
            size={20} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={handleDelete}
          style={styles.actionButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Trash2 color={colors.subtext} size={18} />
        </TouchableOpacity>
      </View>

    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 12, 
    marginHorizontal: 10, 
    borderRadius: 12, 
    marginBottom: 5 
  },
  iconContainer: { 
    width: 48, 
    height: 48, 
    borderRadius: 8, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 15,
    overflow: 'hidden' // Ensures artwork doesn't bleed out
  },
  artwork: { 
    width: '100%', 
    height: '100%' 
  },
  textContainer: { 
    flex: 1,
    justifyContent: 'center'
  },
  title: { 
    fontSize: 16, 
    fontWeight: '600',
    marginBottom: 2
  },
  subtitle: { 
    fontSize: 12 
  },
  actions: {
      flexDirection: 'row',
      alignItems: 'center'
  },
  actionButton: {
      padding: 5,
      marginLeft: 10
  }
});
