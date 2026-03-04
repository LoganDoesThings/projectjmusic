import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Play, Pause, SkipForward } from 'lucide-react-native';
import { Track } from '../types';
import { Colors } from '../theme/colors';

interface MiniPlayerProps {
  currentTrack: Track;
  isPlaying: boolean;
  colors: Colors;
  onPress: () => void;
  onTogglePlay: () => void;
  onSkipNext: () => void;
}

import { Image } from 'react-native';
import { Music } from 'lucide-react-native';

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  currentTrack,
  isPlaying,
  colors,
  onPress,
  onTogglePlay,
  onSkipNext,
}) => {
  return (
    <TouchableOpacity 
      style={[styles.miniPlayer, { backgroundColor: colors.surface, borderTopColor: colors.border }]} 
      onPress={onPress} 
      activeOpacity={0.9}
    >
      <View style={[styles.miniArtContainer, { backgroundColor: colors.border }]}>
        {currentTrack.artwork ? (
          <Image source={{ uri: currentTrack.artwork }} style={styles.miniArt} />
        ) : (
          <Music color={colors.text} size={20} />
        )}
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ color: colors.text, fontWeight: 'bold' }} numberOfLines={1}>
          {currentTrack.name}
        </Text>
        <Text style={{ color: colors.primary, fontSize: 11 }} numberOfLines={1}>
          {currentTrack.artist || 'Unknown Artist'}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={onTogglePlay}>
          {isPlaying ? <Pause color={colors.text} size={28} /> : <Play color={colors.text} size={28} />}
        </TouchableOpacity>
        <TouchableOpacity onPress={onSkipNext} style={{ marginLeft: 15 }}>
          <SkipForward color={colors.text} size={28} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  miniPlayer: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    height: 80, 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    elevation: 20,
    borderTopWidth: 1,
    paddingBottom: 0
  },
  miniArtContainer: { width: 50, height: 50, borderRadius: 8, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  miniArt: { width: '100%', height: '100%' },
});
