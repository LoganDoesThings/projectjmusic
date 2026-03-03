import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Repeat, 
  Shuffle, 
  Plus, 
  Music,
  ChevronDown,
  Trash2,
  Clock,
  Folder,
  ArrowLeft,
  Activity,
  Sun,
  Moon
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface Track {
  id: string;
  name: string;
  uri: string;
  isFavorite?: boolean;
  folder: string;
}

type ViewMode = 'all' | 'folders' | 'folder-detail';

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
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [playbackPitch, setPlaybackPitch] = useState(1.0);
  const [isFXModalVisible, setIsFXModalVisible] = useState(false);
  const [sleepTimerSeconds, setSleepTimerSeconds] = useState<number | null>(null);
  const [isSleepModalVisible, setIsSleepModalVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const colors = {
    bg: isDarkMode ? '#121212' : '#F5F5F7',
    surface: isDarkMode ? '#1E1E1E' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#000000',
    subtext: isDarkMode ? '#AAAAAA' : '#666666',
    primary: '#1DB954',
    border: isDarkMode ? '#333333' : '#E0E0E0',
    card: isDarkMode ? '#282828' : '#FFFFFF',
    overlay: isDarkMode ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)',
  };

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

  const currentTrack = currentTrackIndex !== null ? tracks[currentTrackIndex] : null;
  const filteredTracks = selectedFolder ? tracks.filter(t => t.folder === selectedFolder) : tracks;

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
            <Text style={[styles.subtitle, { color: colors.subtext }]}>{tracks.length} songs</Text>
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
        {['all', 'folders'].map((view) => (
          <TouchableOpacity key={view} style={[styles.tab, currentView === view && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]} onPress={() => { setCurrentView(view as any); setSelectedFolder(null); }}>
            <Text style={[styles.tabText, { color: currentView === view ? colors.text : colors.subtext }]}>{view === 'all' ? 'All Songs' : 'Folders'}</Text>
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
              <TouchableOpacity style={[styles.trackItem, currentTrack?.id === item.id && { backgroundColor: colors.surface }]} onPress={() => playTrack(index, filteredTracks)}>
                <View style={[styles.trackIconContainer, { backgroundColor: colors.border }]}>
                  <Music color={currentTrack?.id === item.id ? colors.primary : colors.text} size={22} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.trackName, { color: currentTrack?.id === item.id ? colors.primary : colors.text }]} numberOfLines={1}>{item.name}</Text>
                  <Text style={[styles.trackFolder, { color: colors.subtext }]}>{item.folder}</Text>
                </View>
                <TouchableOpacity onPress={() => { const updated = tracks.filter(t => t.id !== item.id); setTracks(updated); saveData(updated); }}><Trash2 color={colors.subtext} size={18} /></TouchableOpacity>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<View style={styles.emptyContainer}><Music color={colors.border} size={80} /><Text style={{ color: colors.subtext, marginTop: 10 }}>Empty Library</Text></View>}
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
        <TouchableOpacity style={[styles.miniPlayer, { backgroundColor: colors.surface, borderTopColor: colors.border, borderTopWidth: 1 }]} onPress={() => setIsModalVisible(true)} activeOpacity={0.9}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontWeight: 'bold' }} numberOfLines={1}>{currentTrack.name}</Text>
            <Text style={{ color: colors.primary, fontSize: 11 }}>{currentTrack.folder}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={togglePlayPause}>{isPlaying ? <Pause color={colors.text} size={28} /> : <Play color={colors.text} size={28} />}</TouchableOpacity>
            <TouchableOpacity onPress={skipNext} style={{ marginLeft: 15 }}><SkipForward color={colors.text} size={28} /></TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      <Modal visible={isModalVisible} animationType="slide">
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.bg }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}><ChevronDown color={colors.text} size={32} /></TouchableOpacity>
            <Text style={[styles.nowPlayingText, { color: colors.text }]}>NOW PLAYING</Text>
            <TouchableOpacity onPress={() => setIsFXModalVisible(true)}><Activity color={colors.text} size={24} /></TouchableOpacity>
          </View>
          <View style={styles.albumArtContainer}>
            <View style={[styles.largeAlbumArt, { backgroundColor: colors.surface }]}><Music color={colors.border} size={120} /></View>
          </View>
          <View style={{ paddingHorizontal: 30, marginBottom: 20 }}>
            <Text style={[styles.modalTrackName, { color: colors.text }]}>{currentTrack?.name}</Text>
            <Text style={{ color: colors.primary, fontSize: 18, marginTop: 5 }}>{currentTrack?.folder}</Text>
          </View>
          <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
            <Slider style={{ width: '100%', height: 40 }} minimumValue={0} maximumValue={playbackDuration} value={playbackPosition} minimumTrackTintColor={colors.primary} maximumTrackTintColor={colors.border} thumbTintColor={colors.primary} onSlidingComplete={async (v) => { if (sound) await sound.setPositionAsync(v); setPlaybackPosition(v); setIsSeeking(false); }} onValueChange={() => setIsSeeking(true)} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ color: colors.subtext }}>{formatTime(playbackPosition)}</Text><Text style={{ color: colors.subtext }}>{formatTime(playbackDuration)}</Text></View>
          </View>
          <View style={styles.mainControls}>
            <TouchableOpacity onPress={() => setIsShuffle(!isShuffle)}><Shuffle color={isShuffle ? colors.primary : colors.subtext} size={24} /></TouchableOpacity>
            <TouchableOpacity onPress={skipBack}><SkipBack color={colors.text} size={40} fill={colors.text} /></TouchableOpacity>
            <TouchableOpacity style={[styles.playPauseLarge, { backgroundColor: colors.text }]} onPress={togglePlayPause}>{isPlaying ? <Pause color={colors.bg} size={40} fill={colors.bg} /> : <Play color={colors.bg} size={40} fill={colors.bg} />}</TouchableOpacity>
            <TouchableOpacity onPress={skipNext}><SkipForward color={colors.text} size={40} fill={colors.text} /></TouchableOpacity>
            <TouchableOpacity onPress={() => { const modes: any[] = ['none', 'one', 'all']; setRepeatMode(modes[(modes.indexOf(repeatMode) + 1) % modes.length]); }}><Repeat color={repeatMode !== 'none' ? colors.primary : colors.subtext} size={24} /></TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal visible={isFXModalVisible} transparent animationType="fade">
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.fxContent, { backgroundColor: colors.surface }]}>
            <View style={styles.fxHeader}><Text style={[styles.fxTitle, { color: colors.text }]}>Audio FX</Text><TouchableOpacity onPress={() => setIsFXModalVisible(false)}><Plus color={colors.text} size={24} style={{ transform: [{ rotate: '45deg' }] }} /></TouchableOpacity></View>
            <Text style={{ color: colors.text, marginTop: 10 }}>Speed: {playbackSpeed.toFixed(1)}x</Text>
            <Slider style={{ width: '100%', height: 40 }} minimumValue={0.5} maximumValue={2.0} value={playbackSpeed} minimumTrackTintColor={colors.primary} onValueChange={async (v) => { setPlaybackSpeed(v); if (sound) await sound.setRateAsync(v, true); }} />
            <Text style={{ color: colors.text, marginTop: 10 }}>Pitch: {playbackPitch.toFixed(1)}x</Text>
            <Slider style={{ width: '100%', height: 40 }} minimumValue={0.5} maximumValue={2.0} value={playbackPitch} minimumTrackTintColor={colors.primary} onValueChange={(v) => setPlaybackPitch(v)} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', height: 100, marginTop: 20 }}>
              {[1, 2, 3, 4, 5].map(i => <View key={i} style={{ width: 40, height: '100%', backgroundColor: colors.border, borderRadius: 5, justifyContent: 'flex-end' }}><View style={{ height: '50%', backgroundColor: colors.primary, borderRadius: 5 }} /></View>)}
            </View>
            <Text style={{ color: colors.subtext, textAlign: 'center', marginTop: 15, fontSize: 10 }}>5-Band Equalizer (Simulation)</Text>
          </View>
        </View>
      </Modal>

      <Modal visible={isSleepModalVisible} transparent animationType="fade">
        <TouchableOpacity style={[styles.modalOverlay, { backgroundColor: colors.overlay }]} onPress={() => setIsSleepModalVisible(false)}>
          <View style={[styles.fxContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.fxTitle, { color: colors.text, textAlign: 'center', marginBottom: 20 }]}>Sleep Timer</Text>
            {[10, 20, 30, 60].map(m => (
              <TouchableOpacity key={m} style={{ padding: 15, borderBottomColor: colors.border, borderBottomWidth: 1 }} onPress={() => { setSleepTimerSeconds(m * 60); setIsSleepModalVisible(false); }}>
                <Text style={{ color: colors.text, textAlign: 'center' }}>{m} Minutes</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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
  trackItem: { flexDirection: 'row', alignItems: 'center', padding: 12, marginHorizontal: 10, borderRadius: 12, marginBottom: 5 },
  trackIconContainer: { width: 45, height: 45, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  trackName: { fontSize: 16, fontWeight: '600' },
  trackFolder: { fontSize: 12, marginTop: 2 },
  folderItem: { flexDirection: 'row', alignItems: 'center', padding: 18, borderBottomWidth: 1 },
  folderName: { fontSize: 18, fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 120 },
  miniPlayer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, elevation: 20 },
  modalContainer: { flex: 1 },
  modalHeader: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nowPlayingText: { fontSize: 12, fontWeight: 'bold', letterSpacing: 3 },
  albumArtContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  largeAlbumArt: { width: width * 0.75, height: width * 0.75, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 25 },
  modalTrackName: { fontSize: 26, fontWeight: 'bold' },
  mainControls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 30, marginBottom: 40 },
  playPauseLarge: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', elevation: 15 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fxContent: { width: '85%', borderRadius: 25, padding: 25, elevation: 20 },
  fxHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  fxTitle: { fontSize: 22, fontWeight: 'bold' }
});
