import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity,
  Image 
} from 'react-native';
import { Play, Pause, SkipForward, Music } from 'lucide-react-native';
import { Track } from '../../types';
import { Colors } from '../../theme/colors';

// ============================================================================
// Props Interface
// ============================================================================
interface MiniPlayerProps {
  currentTrack: Track;
  isPlaying: boolean;
  colors: Colors;
  onPress: () => void;
  onTogglePlay: () => void;
  onSkipNext: () => void;
}

// ============================================================================
// Mini Player Component
// ============================================================================
// A sticky bar at the bottom of the screen showing currently playing song.
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
      style={[
        styles.container, 
        { 
          backgroundColor: colors.surface, 
          borderTopColor: colors.border,
          shadowColor: colors.text
        }
      ]} 
      onPress={onPress} 
      activeOpacity={0.9}
    >
      
      {/* --- Album Art Thumbnail --- */}
      <View style={[styles.thumbnailContainer, { backgroundColor: colors.border }]}>
        {currentTrack.artwork ? (
          <Image 
            source={{ uri: currentTrack.artwork }} 
            style={styles.artwork} 
            resizeMode="cover"
          />
        ) : (
          <Music color={colors.text} size={20} />
        )}
      </View>

      {/* --- Track Info --- */}
      <View style={styles.textContainer}>
        <Text 
          style={[styles.title, { color: colors.text }]} 
          numberOfLines={1}
        >
          {currentTrack.name}
        </Text>
        <Text 
          style={{ color: colors.primary, fontSize: 12 }} 
          numberOfLines={1}
        >
          {currentTrack.artist || 'Unknown Artist'}
        </Text>
      </View>

      {/* --- Controls --- */}
      <View style={styles.controls}>
        {/* Play/Pause Button */}
        <TouchableOpacity onPress={onTogglePlay} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          {isPlaying ? (
            <Pause color={colors.text} size={28} fill={colors.text} />
          ) : (
            <Play color={colors.text} size={28} fill={colors.text} />
          )}
        </TouchableOpacity>
        
        {/* Skip Button */}
        <TouchableOpacity 
          onPress={onSkipNext} 
          style={{ marginLeft: 20 }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <SkipForward color={colors.text} size={28} fill={colors.text} />
        </TouchableOpacity>
      </View>
      
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    height: 80, 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    borderTopWidth: 1,
    paddingBottom: 10, // Extra padding for iPhone home indicator area
    elevation: 10,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  thumbnailContainer: { 
    width: 48, 
    height: 48, 
    borderRadius: 8, 
    overflow: 'hidden', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  artwork: { 
    width: '100%', 
    height: '100%' 
  },
  textContainer: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center'
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center'
  }
});
