import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  StatusBar,
  Alert,
  TouchableOpacity,
  Text,
} from 'react-native';
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

export default function App() {
  const store = useMusicStore();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFXModalVisible, setIsFXModalVisible] = useState(false);
  const [isSleepModalVisible, setIsSleepModalVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const colors = getColors(isDarkMode);

  useEffect(() => {
    store.loadData();
    loadTheme();
    return () => {
      if (store.sound) store.sound.unloadAsync();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (store.sleepTimerSeconds !== null && store.sleepTimerSeconds > 0) {
      timerRef.current = setInterval(() => {
        store.setSleepTimerSeconds(store.sleepTimerSeconds! - 1);
      }, 1000);
    } else if (store.sleepTimerSeconds === 0) {
      if (store.sound) store.sound.pauseAsync();
      store.setSleepTimerSeconds(null);
      if (timerRef.current) clearInterval(timerRef.current);
      Alert.alert("Sleep Timer", "Music stopped.");
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [store.sleepTimerSeconds]);

  const loadTheme = async () => {
    const storedTheme = await AsyncStorage.getItem('theme');
    if (storedTheme) setIsDarkMode(storedTheme === 'dark');
  };

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const formatTime = (millis: number) => {
    const mins = Math.floor(millis / 60000);
    const secs = Math.floor((millis % 60000) / 1000);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const currentTrack = store.currentTrackIndex !== null ? store.tracks[store.currentTrackIndex] : null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>JMusic</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={toggleTheme} style={styles.iconButton}>
            {isDarkMode ? <Sun color="#FFD700" size={22} /> : <Moon color="#555" size={22} />}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsFXModalVisible(true)} style={styles.iconButton}>
            <Activity color={colors.text} size={22} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsSleepModalVisible(true)} style={styles.iconButton}>
            <Clock color={store.sleepTimerSeconds ? colors.primary : colors.text} size={22} />
          </TouchableOpacity>
        </View>
      </View>

      <NavigationContainer>
        <AppNavigator isDarkMode={isDarkMode} />
      </NavigationContainer>

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

      <FXModal
        visible={isFXModalVisible}
        onClose={() => setIsFXModalVisible(false)}
        playbackSpeed={store.playbackSpeed}
        onSpeedChange={store.setPlaybackSpeed}
        playbackPitch={store.playbackPitch}
        onPitchChange={store.setPlaybackPitch}
        colors={colors}
      />

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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 10 },
  title: { fontSize: 24, fontWeight: 'bold' },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { padding: 8, marginRight: 5 },
});
