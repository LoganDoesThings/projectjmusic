import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import { 
  Plus, 
  Music,
  Clock,
  Folder,
  ArrowLeft,
  Activity,
  Sun,
  Moon
} from 'lucide-react-native';

// New Imports
import { Track, ViewMode, RepeatMode } from './src/types';
import { getColors } from './src/theme/colors';
import { TrackItem } from './src/components/TrackItem';
import { MiniPlayer } from './src/components/MiniPlayer';
import { PlayerModal } from './src/components/PlayerModal';
import { FXModal } from './src/components/FXModal';
import { SleepModal } from './src/components/SleepModal';

export default function App() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [folders, setFolders] = useState<string[]>(['General']);
  const [currentView, setCurrentView] = useState<ViewMode>('all');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('none');
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [playbackPitch, setPlaybackPitch] = useState(1.0);
  const [isFXModalVisible, setIsFXModalVisible] = useState(false);
  const [sleepTimerSeconds, setSleepTimerSeconds] = useState<number | null>(null);
  const [isSleepModalVisible, setIsSleepModalVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const colors = getColors(isDarkMode);

  useEffect(() => {
    loadData();
    return () => {
      if (sound) sound.unloadAsync();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (sleepTimerSeconds !== null && sleepTimerSeconds > 0) {
      timerRef.current = setInterval(() => {
        setSleepTimerSeconds(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (sleepTimerSeconds === 0) {
      if (sound) sound.pauseAsync();
      setIsPlaying(false);
      setSleepTimerSeconds(null);
      if (timerRef.current) clearInterval(timerRef.current);
      Alert.alert("Sleep Timer", "Music stopped.");
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [sleepTimerSeconds]);

  const loadData = async () => {
    try {
      const storedTracks = await AsyncStorage.getItem('tracks');
      const storedFolders = await AsyncStorage.getItem('folders');
      const storedTheme = await AsyncStorage.getItem('theme');
      if (storedTracks) setTracks(JSON.parse(storedTracks));
      if (storedFolders) setFolders(JSON.parse(storedFolders));
      if (storedTheme) setIsDarkMode(storedTheme === 'dark');
    } catch (e) {
      console.error('Failed to load data', e);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const saveData = async (updatedTracks: Track[], updatedFolders?: string[]) => {
    try {
      await AsyncStorage.setItem('tracks', JSON.stringify(updatedTracks));
      if (updatedFolders) await AsyncStorage.setItem('folders', JSON.stringify(updatedFolders));
    } catch (e) {
      console.error('Failed to save data', e);
    }
  };

  const pickTrack = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*', copyToCacheDirectory: true, multiple: true });
      if (!result.canceled && result.assets) {
        const newTracks: Track[] = result.assets.map(asset => ({
          id: Math.random().toString(36).substr(2, 9),
          name: asset.name,
          uri: asset.uri,
          folder: selectedFolder || 'General'
        }));
        const updatedTracks = [...tracks, ...newTracks];
        setTracks(updatedTracks);
        saveData(updatedTracks);
      }
    } catch (err) { console.error(err); }
  };

  const createFolder = () => {
    Alert.prompt("New Folder", "Enter folder name", [
      { text: "Cancel", style: "cancel" },
      { text: "Create", onPress: (name) => {
          if (name && !folders.includes(name)) {
            const updatedFolders = [...folders, name];
            setFolders(updatedFolders);
            saveData(tracks, updatedFolders);
          }
      }}
    ]);
  };

  const playTrack = async (index: number, trackList = tracks) => {
    try {
      if (sound) await sound.unloadAsync();
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: trackList[index].uri },
        { shouldPlay: true, rate: playbackSpeed, shouldCorrectPitch: true, pitch: playbackPitch },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
      const mainIndex = tracks.findIndex(t => t.id === trackList[index].id);
      setCurrentTrackIndex(mainIndex);
      setIsPlaying(true);
    } catch (e) { Alert.alert('Error', 'Could not play track.'); }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      if (!isSeeking) {
        setPlaybackPosition(status.positionMillis);
        setPlaybackDuration(status.durationMillis || 0);
      }
      if (status.didJustFinish) handleTrackFinish();
    }
  };

  const handleTrackFinish = () => {
    if (repeatMode === 'one') playTrack(currentTrackIndex!);
    else skipNext();
  };

  const togglePlayPause = async () => {
    if (!sound) { if (tracks.length > 0) playTrack(0); return; }
    if (isPlaying) await sound.pauseAsync(); else await sound.playAsync();
    setIsPlaying(!isPlaying);
  };

  const skipNext = () => {
    if (tracks.length === 0) return;
    let nextIndex = isShuffle ? Math.floor(Math.random() * tracks.length) : (currentTrackIndex! + 1) % tracks.length;
    playTrack(nextIndex);
  };

  const skipBack = () => {
    if (tracks.length === 0) return;
    let prevIndex = (currentTrackIndex! - 1 + tracks.length) % tracks.length;
    playTrack(prevIndex);
  };

  const formatTime = (millis: number) => {
    const mins = Math.floor(millis / 60000);
    const secs = Math.floor((millis % 60000) / 1000);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const cycleRepeatMode = () => {
    const modes: RepeatMode[] = ['none', 'one', 'all'];
    setRepeatMode(modes[(modes.indexOf(repeatMode) + 1) % modes.length]);
  };

  const toggleFavorite = (id: string) => {
    const updated = tracks.map(t => 
      t.id === id ? { ...t, isFavorite: !t.isFavorite } : t
    );
    setTracks(updated);
    saveData(updated);
  };

  const currentTrack = currentTrackIndex !== null ? tracks[currentTrackIndex] : null;
  
  let filteredTracks = tracks;
  if (currentView === 'folder-detail' && selectedFolder) {
    filteredTracks = tracks.filter(t => t.folder === selectedFolder);
  } else if (currentView === 'favorites') {
    filteredTracks = tracks.filter(t => t.isFavorite);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      <View style={styles.header}>
        {currentView === 'folder-detail' ? (
          <TouchableOpacity onPress={() => { setCurrentView('folders'); setSelectedFolder(null); }}>
            <ArrowLeft color={colors.text} size={28} />
          </TouchableOpacity>
        ) : (
          <View>
            <Text style={[styles.title, { color: colors.text }]}>JMusic</Text>
            <Text style={[styles.subtitle, { color: colors.subtext }]}>
              {currentView === 'favorites' ? filteredTracks.length : tracks.length} songs
            </Text>
          </View>
        )}
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={toggleTheme} style={styles.iconButton}>
            {isDarkMode ? <Sun color="#FFD700" size={22} /> : <Moon color="#555" size={22} />}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsFXModalVisible(true)} style={styles.iconButton}>
            <Activity color={colors.text} size={22} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsSleepModalVisible(true)} style={styles.iconButton}>
            <Clock color={sleepTimerSeconds ? colors.primary : colors.text} size={22} />
          </TouchableOpacity>
          <TouchableOpacity onPress={currentView === 'folders' ? createFolder : pickTrack} style={[styles.addButton, { backgroundColor: colors.border }]}>
            <Plus color={colors.text} size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabs}>
        {(['all', 'folders', 'favorites'] as const).map((view) => (
          <TouchableOpacity 
            key={view} 
            style={[styles.tab, currentView === view && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]} 
            onPress={() => { setCurrentView(view); setSelectedFolder(null); }}
          >
            <Text style={[styles.tabText, { color: currentView === view ? colors.text : colors.subtext }]}>
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ flex: 1 }}>
        {currentView !== 'folders' ? (
          <FlatList
            data={filteredTracks}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item, index }) => (
              <TrackItem
                item={item}
                isCurrent={currentTrack?.id === item.id}
                colors={colors}
                onPress={() => playTrack(index, filteredTracks)}
                onDelete={() => {
                  const updated = tracks.filter(t => t.id !== item.id);
                  setTracks(updated);
                  saveData(updated);
                }}
                onToggleFavorite={() => toggleFavorite(item.id)}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Music color={colors.border} size={80} />
                <Text style={{ color: colors.subtext, marginTop: 10 }}>
                  {currentView === 'favorites' ? 'No favorites yet' : 'Empty Library'}
                </Text>
              </View>
            }
          />
        ) : (
          <ScrollView contentContainerStyle={styles.listContent}>
            {folders.map(f => (
              <TouchableOpacity key={f} style={[styles.folderItem, { borderBottomColor: colors.border }]} onPress={() => { setSelectedFolder(f); setCurrentView('folder-detail'); }}>
                <Folder color={colors.primary} size={28} />
                <View style={{ marginLeft: 15 }}>
                  <Text style={[styles.folderName, { color: colors.text }]}>{f}</Text>
                  <Text style={{ color: colors.subtext }}>{tracks.filter(t => t.folder === f).length} songs</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {currentTrack && (
        <MiniPlayer
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          colors={colors}
          onPress={() => setIsModalVisible(true)}
          onTogglePlay={togglePlayPause}
          onSkipNext={skipNext}
        />
      )}

      <PlayerModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={togglePlayPause}
        onSkipNext={skipNext}
        onSkipBack={skipBack}
        playbackPosition={playbackPosition}
        playbackDuration={playbackDuration}
        onSeek={async (v) => { if (sound) await sound.setPositionAsync(v); setPlaybackPosition(v); setIsSeeking(false); }}
        onSeeking={setIsSeeking}
        isShuffle={isShuffle}
        onToggleShuffle={() => setIsShuffle(!isShuffle)}
        repeatMode={repeatMode}
        onCycleRepeat={cycleRepeatMode}
        onOpenFX={() => setIsFXModalVisible(true)}
        onToggleFavorite={() => currentTrack && toggleFavorite(currentTrack.id)}
        colors={colors}
        formatTime={formatTime}
      />

      <FXModal
        visible={isFXModalVisible}
        onClose={() => setIsFXModalVisible(false)}
        playbackSpeed={playbackSpeed}
        onSpeedChange={async (v) => {
          setPlaybackSpeed(v);
          if (sound) await sound.setRateAsync(v, true);
        }}
        playbackPitch={playbackPitch}
        onPitchChange={(v) => setPlaybackPitch(v)}
        colors={colors}
      />

      <SleepModal
        visible={isSleepModalVisible}
        onClose={() => setIsSleepModalVisible(false)}
        onSetTimer={(m) => {
          setSleepTimerSeconds(m * 60);
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
  title: { fontSize: 28, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 2 },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { padding: 8, marginRight: 5 },
  addButton: { padding: 8, borderRadius: 20 },
  tabs: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 15 },
  tab: { marginRight: 25, paddingBottom: 8 },
  tabText: { fontSize: 16, fontWeight: 'bold' },
  listContent: { paddingBottom: 100 },
  folderItem: { flexDirection: 'row', alignItems: 'center', padding: 18, borderBottomWidth: 1 },
  folderName: { fontSize: 18, fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 120 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
