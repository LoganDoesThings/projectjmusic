import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  TouchableOpacity,
  Text,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { 
  Clock,
  Activity,
  Sun,
  Moon
} from 'lucide-react-native';

// State & Logic
import { useMusicStore } from './src/store/useMusicStore';
import { useTheme } from './src/hooks/useTheme';
import { useSleepTimer } from './src/hooks/useSleepTimer';
import { AppNavigator } from './src/navigation/AppNavigator';

// Components
import { MiniPlayer } from './src/components/player/MiniPlayer';
import { PlayerModal } from './src/components/modals/PlayerModal';
import { FXModal } from './src/components/modals/FXModal';
import { SleepModal } from './src/components/modals/SleepModal';

// Utilities
import { formatTime } from './src/utils/time';

/**
 * Main Application Component
 * The root component that sets up providers, navigation, and global modals.
 */
export default function App() {
  const store = useMusicStore();
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const { sleepTimerSeconds, setTimer } = useSleepTimer();
  
  // --- Local UI State ---
  const [isModalVisible, setIsModalVisible] = useState(false);     // Full screen player
  const [isFXModalVisible, setIsFXModalVisible] = useState(false);   // Speed/Pitch controls
  const [isSleepModalVisible, setIsSleepModalVisible] = useState(false); // Sleep timer settings
  
  // --- Initialization ---
  useEffect(() => {
    // Load persisted tracks and settings
    store.loadData();
    
    // Cleanup on unmount (stop music)
    return () => {
      if (store.sound) {
        store.sound.pause();
      }
    };
  }, []);

  // --- Helpers ---
  const currentTrack = store.currentTrackIndex !== null ? store.tracks[store.currentTrackIndex] : null;

  // --- Render ---
  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
        <StatusBar 
          barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
          backgroundColor={colors.bg} 
        />
        
        {/* Top Header Bar */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>JMusic</Text>
          </View>
          
          <View style={styles.headerIcons}>
            {/* Theme Toggle */}
            <TouchableOpacity onPress={toggleTheme} style={styles.iconButton}>
              {isDarkMode ? <Sun color="#FFD700" size={22} /> : <Moon color="#555" size={22} />}
            </TouchableOpacity>
            
            {/* FX Modal Toggle */}
            <TouchableOpacity 
              onPress={() => setIsFXModalVisible(true)} 
              style={styles.iconButton}
            >
              <Activity color={colors.text} size={22} />
            </TouchableOpacity>
            
            {/* Sleep Timer Toggle */}
            <TouchableOpacity 
              onPress={() => setIsSleepModalVisible(true)} 
              style={styles.iconButton}
            >
              <Clock 
                color={sleepTimerSeconds ? colors.primary : colors.text} 
                size={22} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Navigation (Tabs) */}
        <NavigationContainer>
          <AppNavigator isDarkMode={isDarkMode} />
        </NavigationContainer>

        {/* Mini Player (Persistent Bottom Bar) */}
        {currentTrack && (
          <MiniPlayer
            currentTrack={currentTrack}
            isPlaying={store.isPlaying}
            colors={colors}
            onPress={() => setIsModalVisible(true)}
            onTogglePlay={store.togglePlayPause}
            onSkipNext={store.skipNext}
          />
        )}

        {/* Full Screen Player Modal */}
        <PlayerModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          currentTrack={currentTrack}
          isPlaying={store.isPlaying}
          onTogglePlay={store.togglePlayPause}
          onSkipNext={store.skipNext}
          onSkipBack={store.skipBack}
          playbackPosition={store.playbackPosition}
          playbackDuration={store.playbackDuration}
          onSeek={store.onSeek}
          onSeeking={store.setIsSeeking}
          isShuffle={store.isShuffle}
          onToggleShuffle={store.toggleShuffle}
          repeatMode={store.repeatMode}
          onCycleRepeat={store.cycleRepeatMode}
          onOpenFX={() => setIsFXModalVisible(true)}
          onToggleFavorite={() => currentTrack && store.toggleFavorite(currentTrack.id)}
          colors={colors}
          formatTime={formatTime}
        />

        {/* Speed & Pitch Controls Modal */}
        <FXModal
          visible={isFXModalVisible}
          onClose={() => setIsFXModalVisible(false)}
          playbackSpeed={store.playbackSpeed}
          onSpeedChange={store.setPlaybackSpeed}
          playbackPitch={store.playbackPitch}
          onPitchChange={store.setPlaybackPitch}
          colors={colors}
        />

        {/* Sleep Timer Settings Modal */}
        <SleepModal
          visible={isSleepModalVisible}
          onClose={() => setIsSleepModalVisible(false)}
          onSetTimer={(m) => {
            setTimer(m);
            setIsSleepModalVisible(false);
          }}
          colors={colors}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    paddingTop: 10 
  },
  title: { fontSize: 24, fontWeight: 'bold' },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { padding: 8, marginRight: 5 },
});
