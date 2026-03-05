import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  Alert,
  TouchableOpacity,
  Text,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { 
  Clock,
  Activity,
  Sun,
  Moon
} from 'lucide-react-native';

import { getColors } from './src/theme/colors';
import { MiniPlayer } from './src/components/MiniPlayer';
import { PlayerModal } from './src/components/PlayerModal';
import { FXModal } from './src/components/FXModal';
import { SleepModal } from './src/components/SleepModal';
import { useMusicStore } from './src/store/useMusicStore';
import { AppNavigator } from './src/navigation/AppNavigator';

// ============================================================================
// Main Application Component
// ============================================================================
// The root component that sets up providers, navigation, and global modals.
export default function App() {
  const store = useMusicStore();
  
  // --- Local State ---
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Modal visibility states
  const [isModalVisible, setIsModalVisible] = useState(false); // Full screen player
  const [isFXModalVisible, setIsFXModalVisible] = useState(false); // Speed/Pitch controls
  const [isSleepModalVisible, setIsSleepModalVisible] = useState(false); // Sleep timer
  
  // Timer reference for the sleep countdown
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const colors = getColors(isDarkMode);

  // --- Initialization ---
  
  useEffect(() => {
    // Load persisted tracks and settings
    store.loadData();
    loadTheme();
    
    // Cleanup on unmount (stop music, clear timers)
    return () => {
      if (store.sound) {
          store.sound.pause();
      }
      if (timerRef.current) {
          clearInterval(timerRef.current);
      }
    };
  }, []);

  // --- Sleep Timer Logic ---
  
  useEffect(() => {
    // If timer is set and running
    if (store.sleepTimerSeconds !== null && store.sleepTimerSeconds > 0) {
      // Decrement every second
      timerRef.current = setInterval(() => {
        store.setSleepTimerSeconds(store.sleepTimerSeconds! - 1);
      }, 1000);
      
    } else if (store.sleepTimerSeconds === 0) {
      // Timer finished: Pause music and reset
      if (store.sound) {
          store.sound.pause();
      }
      store.setSleepTimerSeconds(null);
      
      if (timerRef.current) {
          clearInterval(timerRef.current);
      }
      
      Alert.alert("Sleep Timer", "Music stopped.");
    }
    
    // Clear interval on every re-render of this effect
    return () => { 
        if (timerRef.current) clearInterval(timerRef.current); 
    };
  }, [store.sleepTimerSeconds]);

  // --- Theme Logic ---

  const loadTheme = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem('theme');
      if (storedTheme) {
          setIsDarkMode(storedTheme === 'dark');
      }
    } catch (e) {
      console.warn("Failed to load theme", e);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (e) {
      console.warn("Failed to save theme", e);
    }
  };

  // --- Helper Functions ---

  const formatTime = (millis: number) => {
    if (millis < 0) return "0:00";
    const totalSeconds = Math.floor(millis / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const currentTrack = store.currentTrackIndex !== null ? store.tracks[store.currentTrackIndex] : null;

  // --- Render ---

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} />
        
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
            <TouchableOpacity onPress={() => setIsFXModalVisible(true)} style={styles.iconButton}>
              <Activity color={colors.text} size={22} />
            </TouchableOpacity>
            
            {/* Sleep Timer Toggle */}
            <TouchableOpacity onPress={() => setIsSleepModalVisible(true)} style={styles.iconButton}>
              <Clock 
                color={store.sleepTimerSeconds ? colors.primary : colors.text} 
                size={22} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content (Tabs) */}
        <NavigationContainer>
          <AppNavigator isDarkMode={isDarkMode} />
        </NavigationContainer>

        {/* Mini Player (Bottom Bar) */}
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

        {/* Full Screen Player */}
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

        {/* Speed & Pitch Controls */}
        <FXModal
          visible={isFXModalVisible}
          onClose={() => setIsFXModalVisible(false)}
          playbackSpeed={store.playbackSpeed}
          onSpeedChange={store.setPlaybackSpeed}
          playbackPitch={store.playbackPitch}
          onPitchChange={store.setPlaybackPitch}
          colors={colors}
        />

        {/* Sleep Timer Settings */}
        <SleepModal
          visible={isSleepModalVisible}
          onClose={() => setIsSleepModalVisible(false)}
          onSetTimer={(m) => {
            store.setSleepTimerSeconds(m * 60);
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
