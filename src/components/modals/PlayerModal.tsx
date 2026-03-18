import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Modal, 
  useWindowDimensions,
  Image 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { DEFAULT_FOLDER } from '../../constants';
import { Track, RepeatMode } from '../../types';
import { Colors } from '../../theme/colors';

// ============================================================================
// Props Interface
// ============================================================================
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

// ============================================================================
// Player Modal Component
// ============================================================================
// The full-screen player view showing album art, controls, and progress.
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
  // We use the window width to calculate the album art size dynamically
  const { width, height } = useWindowDimensions();
  
  // Calculate optimal art size based on screen width, maxing out at 350px
  // or 75% of the screen width for smaller devices.
  const artSize = width > 500 ? 350 : width * 0.75;
  
  // Dynamic top padding to ensure the header doesn't hit the status bar too hard
  const topPadding = height > 800 ? 20 : 0;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.bg }]}>
        
        {/* --- Header: Collapse Button & FX Toggle --- */}
        <View style={[styles.modalHeader, { marginTop: topPadding }]}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
            <ChevronDown color={colors.text} size={32} />
          </TouchableOpacity>
          
          <Text style={[styles.nowPlayingText, { color: colors.text }]}>NOW PLAYING</Text>
          
          <TouchableOpacity onPress={onOpenFX} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
            <Activity color={colors.text} size={24} />
          </TouchableOpacity>
        </View>

        {/* --- Album Art Section --- */}
        <View style={styles.albumArtContainer}>
          <View style={[
            styles.largeAlbumArt, 
            { 
              backgroundColor: colors.surface, 
              width: artSize, 
              height: artSize,
              shadowColor: colors.text,
            }
          ]}>
            {currentTrack?.artwork ? (
              <Image 
                source={{ uri: currentTrack.artwork }} 
                style={styles.fullArtwork} 
                resizeMode="cover"
              />
            ) : (
              // Fallback icon if no artwork is available
              <Music color={colors.border} size={artSize * 0.4} />
            )}
          </View>
        </View>

        {/* --- Track Info & Favorite Button --- */}
        <View style={styles.trackInfoContainer}>
          <View style={{ flex: 1, paddingRight: 20 }}>
            <Text 
              style={[styles.modalTrackName, { color: colors.text }]} 
              numberOfLines={1}
            >
              {currentTrack?.name || 'No Track Selected'}
            </Text>
            <Text 
              style={{ color: colors.primary, fontSize: 18, marginTop: 5, fontWeight: '500' }} 
              numberOfLines={1}
            >
              {currentTrack?.artist || 'Unknown Artist'}
            </Text>
            <Text style={{ color: colors.subtext, fontSize: 14, marginTop: 4 }}>
              {currentTrack?.folder || DEFAULT_FOLDER}
            </Text>
          </View>
          
          <TouchableOpacity onPress={onToggleFavorite}>
            <Heart 
              color={currentTrack?.isFavorite ? '#FF4B4B' : colors.subtext} 
              fill={currentTrack?.isFavorite ? '#FF4B4B' : 'transparent'} 
              size={32} 
            />
          </TouchableOpacity>
        </View>

        {/* --- Progress Slider --- */}
        <View style={styles.sliderContainer}>
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
          <View style={styles.timeLabels}>
            <Text style={{ color: colors.subtext, fontSize: 12 }}>
              {formatTime(playbackPosition)}
            </Text>
            <Text style={{ color: colors.subtext, fontSize: 12 }}>
              {formatTime(playbackDuration)}
            </Text>
          </View>
        </View>

        {/* --- Main Playback Controls --- */}
        <View style={styles.mainControls}>
          {/* Shuffle Toggle */}
          <TouchableOpacity onPress={onToggleShuffle}>
            <Shuffle 
              color={isShuffle ? colors.primary : colors.subtext} 
              size={24} 
            />
          </TouchableOpacity>
          
          {/* Previous Track */}
          <TouchableOpacity onPress={onSkipBack}>
            <SkipBack color={colors.text} size={36} fill={colors.text} />
          </TouchableOpacity>
          
          {/* Play / Pause - Large Button */}
          <TouchableOpacity 
            style={[styles.playPauseLarge, { backgroundColor: colors.text }]} 
            onPress={onTogglePlay}
            activeOpacity={0.8}
          >
            {isPlaying ? (
              <Pause color={colors.bg} size={36} fill={colors.bg} />
            ) : (
              <Play color={colors.bg} size={36} fill={colors.bg} style={{ marginLeft: 4 }} />
            )}
          </TouchableOpacity>
          
          {/* Next Track */}
          <TouchableOpacity onPress={onSkipNext}>
            <SkipForward color={colors.text} size={36} fill={colors.text} />
          </TouchableOpacity>
          
          {/* Repeat Toggle */}
          <TouchableOpacity onPress={onCycleRepeat}>
            <Repeat 
              color={repeatMode !== 'none' ? colors.primary : colors.subtext} 
              size={24} 
            />
            {repeatMode === 'one' && (
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Text style={styles.badgeText}>1</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: { 
    flex: 1 
  },
  modalHeader: { 
    padding: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  nowPlayingText: { 
    fontSize: 12, 
    fontWeight: 'bold', 
    letterSpacing: 2,
    opacity: 0.8
  },
  albumArtContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginVertical: 20
  },
  largeAlbumArt: { 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center', 
    // Android Shadow
    elevation: 20,
    // iOS Shadow
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    overflow: 'hidden'
  },
  fullArtwork: { 
    width: '100%', 
    height: '100%' 
  },
  trackInfoContainer: {
    paddingHorizontal: 30, 
    marginBottom: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },
  modalTrackName: { 
    fontSize: 24, 
    fontWeight: 'bold' 
  },
  sliderContainer: {
    paddingHorizontal: 20, 
    marginBottom: 30 
  },
  timeLabels: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    paddingHorizontal: 5
  },
  mainControls: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 30, 
    marginBottom: 50 
  },
  playPauseLarge: { 
    width: 75, 
    height: 75, 
    borderRadius: 40, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center'
  },
  badgeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold'
  }
});
