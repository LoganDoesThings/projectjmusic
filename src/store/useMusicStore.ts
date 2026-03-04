import { create } from 'zustand';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { Track, RepeatMode } from '../types';

interface MusicState {
  tracks: Track[];
  folders: string[];
  currentTrackIndex: number | null;
  isPlaying: boolean;
  sound: Audio.Sound | null;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  playbackPosition: number;
  playbackDuration: number;
  isSeeking: boolean;
  playbackSpeed: number;
  playbackPitch: number;
  sleepTimerSeconds: number | null;
  
  // Actions
  loadData: () => Promise<void>;
  saveData: (updatedTracks: Track[], updatedFolders?: string[]) => Promise<void>;
  setTracks: (tracks: Track[]) => void;
  setFolders: (folders: string[]) => void;
  playTrack: (index: number, trackList?: Track[]) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  skipNext: () => Promise<void>;
  skipBack: () => Promise<void>;
  cycleRepeatMode: () => void;
  toggleShuffle: () => void;
  setPlaybackSpeed: (speed: number) => Promise<void>;
  setPlaybackPitch: (pitch: number) => void;
  onSeek: (position: number) => Promise<void>;
  setIsSeeking: (isSeeking: boolean) => void;
  setSleepTimerSeconds: (seconds: number | null) => void;
  toggleFavorite: (id: string) => void;
  handleTrackFinish: () => Promise<void>;
}

export const useMusicStore = create<MusicState>((set, get) => ({
  tracks: [],
  folders: ['General'],
  currentTrackIndex: null,
  isPlaying: false,
  sound: null,
  repeatMode: 'none',
  isShuffle: false,
  playbackPosition: 0,
  playbackDuration: 0,
  isSeeking: false,
  playbackSpeed: 1.0,
  playbackPitch: 1.0,
  sleepTimerSeconds: null,

  loadData: async () => {
    try {
      const storedTracks = await AsyncStorage.getItem('tracks');
      const storedFolders = await AsyncStorage.getItem('folders');
      if (storedTracks) set({ tracks: JSON.parse(storedTracks) });
      if (storedFolders) set({ folders: JSON.parse(storedFolders) });
    } catch (e) {
      console.error('Failed to load data', e);
    }
  },

  saveData: async (updatedTracks: Track[], updatedFolders?: string[]) => {
    try {
      await AsyncStorage.setItem('tracks', JSON.stringify(updatedTracks));
      if (updatedFolders) await AsyncStorage.setItem('folders', JSON.stringify(updatedFolders));
    } catch (e) {
      console.error('Failed to save data', e);
    }
  },

  setTracks: (tracks) => {
    set({ tracks });
    get().saveData(tracks);
  },

  setFolders: (folders) => {
    set({ folders });
    get().saveData(get().tracks, folders);
  },

  playTrack: async (index: number, trackList = get().tracks) => {
    const { sound: currentSound, playbackSpeed, playbackPitch } = get();
    try {
      if (currentSound) await currentSound.unloadAsync();
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: trackList[index].uri },
        { shouldPlay: true, rate: playbackSpeed, shouldCorrectPitch: true, pitch: playbackPitch },
        (status) => {
          if (status.isLoaded) {
            if (!get().isSeeking) {
              set({ 
                playbackPosition: status.positionMillis, 
                playbackDuration: status.durationMillis || 0 
              });
            }
            if (status.didJustFinish) get().handleTrackFinish();
          }
        }
      );
      
      const mainIndex = get().tracks.findIndex(t => t.id === trackList[index].id);
      set({ sound: newSound, currentTrackIndex: mainIndex, isPlaying: true });
    } catch (e) {
      Alert.alert('Error', 'Could not play track.');
    }
  },

  togglePlayPause: async () => {
    const { sound, isPlaying, tracks, playTrack } = get();
    if (!sound) {
      if (tracks.length > 0) playTrack(0);
      return;
    }
    if (isPlaying) await sound.pauseAsync();
    else await sound.playAsync();
    set({ isPlaying: !isPlaying });
  },

  skipNext: async () => {
    const { tracks, currentTrackIndex, isShuffle, playTrack } = get();
    if (tracks.length === 0) return;
    let nextIndex = isShuffle 
      ? Math.floor(Math.random() * tracks.length) 
      : (currentTrackIndex! + 1) % tracks.length;
    await playTrack(nextIndex);
  },

  skipBack: async () => {
    const { tracks, currentTrackIndex, playTrack } = get();
    if (tracks.length === 0) return;
    let prevIndex = (currentTrackIndex! - 1 + tracks.length) % tracks.length;
    await playTrack(prevIndex);
  },

  handleTrackFinish: async () => {
    const { repeatMode, currentTrackIndex, playTrack, skipNext } = get();
    if (repeatMode === 'one') await playTrack(currentTrackIndex!);
    else await skipNext();
  },

  cycleRepeatMode: () => {
    const modes: RepeatMode[] = ['none', 'one', 'all'];
    const { repeatMode } = get();
    set({ repeatMode: modes[(modes.indexOf(repeatMode) + 1) % modes.length] });
  },

  toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),

  setPlaybackSpeed: async (speed) => {
    const { sound } = get();
    set({ playbackSpeed: speed });
    if (sound) await sound.setRateAsync(speed, true);
  },

  setPlaybackPitch: (pitch) => set({ playbackPitch: pitch }),

  onSeek: async (position) => {
    const { sound } = get();
    if (sound) await sound.setPositionAsync(position);
    set({ playbackPosition: position, isSeeking: false });
  },

  setIsSeeking: (isSeeking) => set({ isSeeking }),

  setSleepTimerSeconds: (seconds) => set({ sleepTimerSeconds: seconds }),

  toggleFavorite: (id: string) => {
    const { tracks, saveData } = get();
    const updated = tracks.map(t => 
      t.id === id ? { ...t, isFavorite: !t.isFavorite } : t
    );
    set({ tracks: updated });
    saveData(updated);
  }
}));
