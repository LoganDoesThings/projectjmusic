import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Music, Trash2, Heart } from 'lucide-react-native';
import { Track } from '../types';
import { Colors } from '../theme/colors';

interface TrackItemProps {
  item: Track;
  isCurrent: boolean;
  colors: Colors;
  onPress: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}

import { Image } from 'react-native';

export const TrackItem: React.FC<TrackItemProps> = ({ 
  item, 
  isCurrent, 
  colors, 
  onPress, 
  onDelete,
  onToggleFavorite
}) => {
  return (
    <TouchableOpacity 
      style={[styles.trackItem, isCurrent && { backgroundColor: colors.surface }]} 
      onPress={onPress}
    >
      <View style={[styles.trackIconContainer, { backgroundColor: colors.border }]}>
        {item.artwork ? (
          <Image source={{ uri: item.artwork }} style={styles.artwork} />
        ) : (
          <Music color={isCurrent ? colors.primary : colors.text} size={22} />
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text 
          style={[styles.trackName, { color: isCurrent ? colors.primary : colors.text }]} 
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text style={[styles.trackArtist, { color: colors.subtext }]} numberOfLines={1}>
          {item.artist || 'Unknown Artist'} • {item.folder}
        </Text>
      </View>
      <TouchableOpacity onPress={onToggleFavorite} style={{ marginRight: 15 }}>
        <Heart 
          color={item.isFavorite ? '#FF4B4B' : colors.subtext} 
          fill={item.isFavorite ? '#FF4B4B' : 'transparent'} 
          size={20} 
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete}>
        <Trash2 color={colors.subtext} size={18} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  trackItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 12, 
    marginHorizontal: 10, 
    borderRadius: 12, 
    marginBottom: 5 
  },
  trackIconContainer: { 
    width: 45, 
    height: 45, 
    borderRadius: 10, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 15,
    overflow: 'hidden'
  },
  artwork: { width: '100%', height: '100%' },
  trackName: { fontSize: 16, fontWeight: '600' },
  trackArtist: { fontSize: 12, marginTop: 2 },
});
