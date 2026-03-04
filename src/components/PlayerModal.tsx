import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView, 
  Modal, 
  useWindowDimensions 
} from 'react-native';
import { 
  Music, 
  ChevronDown, 
  Activity, 
  Shuffle, 
  SkipBack, 
  Play, 
  Pause, 
  SkipForward, 
  Repeat,
  Heart
} from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { Track, RepeatMode } from '../types';
import { Colors } from '../theme/colors';

interface PlayerModalProps {
  visible: boolean;
  onClose: () => void;
  currentTrack: Track | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSkipNext: () => void;
  onSkipBack: () => void;
  playbackPosition: number;
  playbackDuration: number;
  onSeek: (value: number) => void;
  onSeeking: (value: boolean) => void;
  isShuffle: boolean;
  onToggleShuffle: () => void;
  repeatMode: RepeatMode;
  onCycleRepeat: () => void;
  onOpenFX: () => void;
  onToggleFavorite: () => void;
  colors: Colors;
  formatTime: (millis: number) => string;
}

import { Image } from 'react-native';

export const PlayerModal: React.FC<PlayerModalProps> = ({
  visible,
  onClose,
  currentTrack,
  isPlaying,
  onTogglePlay,
  onSkipNext,
  onSkipBack,
  playbackPosition,
  playbackDuration,
  onSeek,
  onSeeking,
  isShuffle,
  onToggleShuffle,
  repeatMode,
  onCycleRepeat,
  onOpenFX,
  onToggleFavorite,
  colors,
  formatTime,
}) => {
  const { width } = useWindowDimensions();
  const artSize = width > 500 ? 350 : width * 0.75;

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.bg }]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <ChevronDown color={colors.text} size={32} />
          </TouchableOpacity>
          <Text style={[styles.nowPlayingText, { color: colors.text }]}>NOW PLAYING</Text>
          <TouchableOpacity onPress={onOpenFX}>
            <Activity color={colors.text} size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.albumArtContainer}>
          <View style={[styles.largeAlbumArt, { backgroundColor: colors.surface, width: artSize, height: artSize }]}>
            {currentTrack?.artwork ? (
              <Image source={{ uri: currentTrack.artwork }} style={styles.fullArtwork} />
            ) : (
              <Music color={colors.border} size={artSize * 0.4} />
            )}
          </View>
        </View>

        <View style={{ paddingHorizontal: 30, marginBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.modalTrackName, { color: colors.text }]} numberOfLines={1}>{currentTrack?.name}</Text>
            <Text style={{ color: colors.primary, fontSize: 18, marginTop: 5 }} numberOfLines={1}>
              {currentTrack?.artist || 'Unknown Artist'}
            </Text>
            <Text style={{ color: colors.subtext, fontSize: 14, marginTop: 2 }}>{currentTrack?.folder}</Text>
          </View>
          <TouchableOpacity onPress={onToggleFavorite}>
            <Heart 
              color={currentTrack?.isFavorite ? '#FF4B4B' : colors.subtext} 
              fill={currentTrack?.isFavorite ? '#FF4B4B' : 'transparent'} 
              size={32} 
            />
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={0}
            maximumValue={playbackDuration}
            value={playbackPosition}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
            onSlidingComplete={onSeek}
            onValueChange={() => onSeeking(true)}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.subtext }}>{formatTime(playbackPosition)}</Text>
            <Text style={{ color: colors.subtext }}>{formatTime(playbackDuration)}</Text>
          </View>
        </View>

        <View style={styles.mainControls}>
          <TouchableOpacity onPress={onToggleShuffle}>
            <Shuffle color={isShuffle ? colors.primary : colors.subtext} size={24} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onSkipBack}>
            <SkipBack color={colors.text} size={40} fill={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.playPauseLarge, { backgroundColor: colors.text }]} 
            onPress={onTogglePlay}
          >
            {isPlaying ? (
              <Pause color={colors.bg} size={40} fill={colors.bg} />
            ) : (
              <Play color={colors.bg} size={40} fill={colors.bg} />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={onSkipNext}>
            <SkipForward color={colors.text} size={40} fill={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onCycleRepeat}>
            <Repeat color={repeatMode !== 'none' ? colors.primary : colors.subtext} size={24} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: { flex: 1 },
  modalHeader: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nowPlayingText: { fontSize: 12, fontWeight: 'bold', letterSpacing: 3 },
  albumArtContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  largeAlbumArt: { 
    borderRadius: 30, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 25,
    overflow: 'hidden'
  },
  fullArtwork: { width: '100%', height: '100%' },
  modalTrackName: { fontSize: 26, fontWeight: 'bold' },
  mainControls: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 30, 
    marginBottom: 40 
  },
  playPauseLarge: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 15 
  },
});
