import { create } from 'zustand';
import { createAudioPlayer, AudioPlayer } from 'expo-audio';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { DEFAULT_FOLDER } from '../constants';
import { Track, RepeatMode } from '../types';

// ============================================================================
// Music Store Interface
// ============================================================================
interface MusicState {
  tracks: Track[];
  folders: string[];
  currentTrackIndex: number | null;
  isPlaying: boolean;
  sound: AudioPlayer | null;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  playbackPosition: number;
  playbackDuration: number;
  isSeeking: boolean;
  playbackSpeed: number;
  playbackPitch: number;
  sleepTimerSeconds: number | null;
  
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

// ============================================================================
// Store Implementation
// ============================================================================
export const useMusicStore = create<MusicState>((set, get) => ({
  tracks: [],
  folders: [DEFAULT_FOLDER],
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
      
      if (storedTracks) {
        set({ tracks: JSON.parse(storedTracks) });
      }
      if (storedFolders) {
        set({ folders: JSON.parse(storedFolders) });
      }
    } catch (e) {
      console.error('Failed to load data from storage', e);
    }
  },

  saveData: async (updatedTracks: Track[], updatedFolders?: string[]) => {
    try {
      await AsyncStorage.setItem('tracks', JSON.stringify(updatedTracks));
      if (updatedFolders) {
        await AsyncStorage.setItem('folders', JSON.stringify(updatedFolders));
      }
    } catch (e) {
      console.error('Failed to save data to storage', e);
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
    const { sound: currentSound, playbackSpeed } = get();
    
    if (index < 0 || index >= trackList.length) return;

    try {
      // 1. Clean up existing sound instance before creating a new one
      if (currentSound) {
        currentSound.pause();
        // Note: expo-audio doesn't have an explicit 'unload' for the player instance itself,
        // but we ensure it's paused. Re-assigning 'sound' will help with GC.
      }
      
      const track = trackList[index];
      const newPlayer = createAudioPlayer(track.uri);
      
      // 2. Configure initial settings
      newPlayer.playbackRate = playbackSpeed;
      newPlayer.shouldCorrectPitch = true;
      
      // 3. Setup listeners
      newPlayer.addListener('playingChange', (isPlaying) => {
        set({ isPlaying });
      });

      newPlayer.addListener('statusChange', (status) => {
        // Only update progress if we're not actively seeking to avoid UI jitter
        if (!get().isSeeking) {
          set({ 
            playbackPosition: status.currentTime, 
            playbackDuration: status.duration
          });
        }
        
        if (status.isFinished) {
          get().handleTrackFinish();
        }
      });

      // Find the index in the master list to keep the store state consistent
      const mainIndex = get().tracks.findIndex(t => t.id === track.id);
      
      set({ 
        sound: newPlayer, 
        currentTrackIndex: mainIndex !== -1 ? mainIndex : index,
        isPlaying: true
      });

      newPlayer.play();
      
    } catch (e) {
      console.error('Error in playTrack:', e);
      Alert.alert('Playback Error', `Could not play track "${trackList[index]?.name || 'Unknown'}".`);
    }
  },

  togglePlayPause: async () => {
    const { sound, isPlaying, tracks, playTrack } = get();
    
    if (!sound) {
      if (tracks.length > 0) {
        // Play first track if nothing is loaded
        await playTrack(0);
      }
      return;
    }
    
    if (isPlaying) {
      sound.pause();
    } else {
      sound.play();
    }
  },

  skipNext: async () => {
    const { tracks, currentTrackIndex, isShuffle, playTrack } = get();
    if (tracks.length === 0) return;
    
    if (currentTrackIndex === null) {
      await playTrack(0);
      return;
    }

    let nextIndex;
    if (isShuffle && tracks.length > 1) {
      // Pick a random track that isn't the current one
      do {
        nextIndex = Math.floor(Math.random() * tracks.length);
      } while (nextIndex === currentTrackIndex);
    } else {
      nextIndex = (currentTrackIndex + 1) % tracks.length;
    }
    
    await playTrack(nextIndex);
  },

  skipBack: async () => {
    const { tracks, currentTrackIndex, playTrack, playbackPosition } = get();
    if (tracks.length === 0 || currentTrackIndex === null) return;
    
    if (playbackPosition > 3000) {
        const { sound } = get();
        if (sound) {
            sound.seekTo(0);
            set({ playbackPosition: 0 });
            return;
        }
    }

    let prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    await playTrack(prevIndex);
  },

  handleTrackFinish: async () => {
    const { repeatMode, currentTrackIndex, skipNext, sound } = get();
    if (repeatMode === 'one' && currentTrackIndex !== null && sound) {
      sound.seekTo(0);
      sound.play();
    } else {
      await skipNext();
    }
  },

  cycleRepeatMode: () => {
    const modes: RepeatMode[] = ['none', 'one', 'all'];
    const { repeatMode } = get();
    const nextMode = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
    set({ repeatMode: nextMode });
  },

  toggleShuffle: () => {
      set((state) => ({ isShuffle: !state.isShuffle }));
  },

  setPlaybackSpeed: async (speed) => {
    const { sound } = get();
    set({ playbackSpeed: speed });
    if (sound) {
        sound.playbackRate = speed;
    }
  },

  setPlaybackPitch: (pitch) => {
      set({ playbackPitch: pitch });
  },

  onSeek: async (position) => {
    const { sound } = get();
    if (sound) {
        sound.seekTo(position);
    }
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
