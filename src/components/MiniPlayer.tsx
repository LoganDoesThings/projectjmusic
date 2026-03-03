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
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text, fontWeight: 'bold' }} numberOfLines={1}>
          {currentTrack.name}
        </Text>
        <Text style={{ color: colors.primary, fontSize: 11 }}>{currentTrack.folder}</Text>
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
    borderTopWidth: 1 
  },
});
