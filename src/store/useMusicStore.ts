import { create } from 'zustand';
import { createAudioPlayer, AudioPlayer } from 'expo-audio';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { DEFAULT_FOLDER, SKIP_BACK_THRESHOLD, DEFAULT_PLAYBACK_SPEED, DEFAULT_PLAYBACK_PITCH } from '../constants';
import { Track, RepeatMode } from '../types';
import { handlePlaybackError, handleStorageError } from '../utils/errorHandler';
import { logError } from '../utils/logger';

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
  playbackSpeed: DEFAULT_PLAYBACK_SPEED,
  playbackPitch: DEFAULT_PLAYBACK_PITCH,
  sleepTimerSeconds: null,

  /**
   * Load persisted tracks and folders from AsyncStorage
   * Called on app initialization to restore user's library
   */
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
      const errorMsg = handleStorageError(e, 'Loading tracks and folders');
      Alert.alert('Load Error', errorMsg);
    }
  },

  /**
   * Save tracks and folders to AsyncStorage
   * @param updatedTracks - The tracks to persist
   * @param updatedFolders - Optional folders to persist
   */
  saveData: async (updatedTracks: Track[], updatedFolders?: string[]) => {
    try {
      await AsyncStorage.setItem('tracks', JSON.stringify(updatedTracks));
      if (updatedFolders) {
        await AsyncStorage.setItem('folders', JSON.stringify(updatedFolders));
      }
    } catch (e) {
      const errorMsg = handleStorageError(e, 'Saving tracks and folders');
      logError('useMusicStore.saveData', errorMsg);
    }
  },

  /**
   * Set tracks array and persist to storage
   * @param tracks - New tracks array
   */
  setTracks: (tracks) => {
    set({ tracks });
    get().saveData(tracks);
  },

  /**
   * Set folders array and persist to storage
   * @param folders - New folders array
   */
  setFolders: (folders) => {
    set({ folders });
    get().saveData(get().tracks, folders);
  },

  /**
   * Play a track by index with proper cleanup and setup
   * Creates audio player, attaches listeners, and updates UI state
   * @param index - Index in the trackList to play
   * @param trackList - Optional specific track list (defaults to store tracks for context-aware playing)
   */
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
      const trackName = trackList[index]?.name || 'Unknown';
      const errorMsg = handlePlaybackError(e, trackName);
      Alert.alert('Playback Error', errorMsg);
    }
  },

  /**
   * Toggle between play and pause
   * If no track is loaded, plays the first track in the library
   */
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

  /**
   * Skip to the next track
   * Respects shuffle mode if enabled
   */
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

  /**
   * Skip to previous track or restart current if playback position > 3 seconds
   * Seeks to start if threshold is exceeded instead of skipping
   */
  skipBack: async () => {
    const { tracks, currentTrackIndex, playTrack, playbackPosition } = get();
    if (tracks.length === 0 || currentTrackIndex === null) return;
    
    if (playbackPosition > SKIP_BACK_THRESHOLD) {
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

  /**
   * Handle track finish based on repeat mode
   * Restarts current track if repeat mode is 'one', otherwise skips to next
   */
  handleTrackFinish: async () => {
    const { repeatMode, currentTrackIndex, skipNext, sound } = get();
    if (repeatMode === 'one' && currentTrackIndex !== null && sound) {
      sound.seekTo(0);
      sound.play();
    } else {
      await skipNext();
    }
  },

  /**
   * Cycle through repeat modes: none → one → all → none
   */
  cycleRepeatMode: () => {
    const modes: RepeatMode[] = ['none', 'one', 'all'];
    const { repeatMode } = get();
    const nextMode = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
    set({ repeatMode: nextMode });
  },

  /**
   * Toggle shuffle mode on/off
   */
  toggleShuffle: () => {
      set((state) => ({ isShuffle: !state.isShuffle }));
  },

  /**
   * Set playback speed and apply to current audio player
   * @param speed - Playback speed multiplier (e.g., 0.5, 1.0, 2.0)
   */
  setPlaybackSpeed: async (speed) => {
    const { sound } = get();
    set({ playbackSpeed: speed });
    if (sound) {
        sound.playbackRate = speed;
    }
  },

  /**
   * Set playback pitch (note: currently stored but not applied to audio player)
   * @param pitch - Pitch adjustment value
   */
  setPlaybackPitch: (pitch) => {
      set({ playbackPitch: pitch });
  },

  /**
   * Seek to specific position in the current track
   * @param position - Position in milliseconds
   */
  onSeek: async (position) => {
    const { sound } = get();
    if (sound) {
        sound.seekTo(position);
    }
    set({ playbackPosition: position, isSeeking: false });
  },

  setIsSeeking: (isSeeking) => set({ isSeeking }),

  /**
   * Set sleep timer duration in seconds
   * @param seconds - Seconds remaining before playback stops (null to disable)
   */
  setSleepTimerSeconds: (seconds) => set({ sleepTimerSeconds: seconds }),

  /**
   * Toggle favorite status for a track
   * @param id - Track ID to toggle
   */
  toggleFavorite: (id: string) => {
    const { tracks, saveData } = get();
    const updated = tracks.map(t => 
      t.id === id ? { ...t, isFavorite: !t.isFavorite } : t
    );
    set({ tracks: updated });
    saveData(updated);
  }
}));
