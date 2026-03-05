import { create } from 'zustand';
import { Audio, AVPlaybackStatus } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { Track, RepeatMode } from '../types';

// ============================================================================
// Music Store Interface
// ============================================================================
// This interface defines the shape of our global state. 
// It includes the data (tracks, playing status) and the actions (play, pause, etc.).
interface MusicState {
  // --- Data Properties ---
  tracks: Track[];                // The complete list of songs in the library
  folders: string[];              // List of folder names created by the user
  currentTrackIndex: number | null; // Index of the currently playing song in the tracks array
  isPlaying: boolean;             // Is the music currently playing?
  sound: Audio.Sound | null;      // The actual Expo Audio object controlling playback
  repeatMode: RepeatMode;         // 'none' | 'one' | 'all'
  isShuffle: boolean;             // Is shuffle mode enabled?
  playbackPosition: number;       // Current playback time in milliseconds
  playbackDuration: number;       // Total duration of the song in milliseconds
  isSeeking: boolean;             // Is the user currently dragging the slider?
  playbackSpeed: number;          // Playback speed multiplier (default 1.0)
  playbackPitch: number;          // Pitch correction multiplier (default 1.0)
  sleepTimerSeconds: number | null; // Countdown timer for sleep mode
  
  // --- Actions ---
  // Loads saved tracks and settings from the device's local storage
  loadData: () => Promise<void>;
  
  // Persists the current library to local storage so it's there when the app restarts
  saveData: (updatedTracks: Track[], updatedFolders?: string[]) => Promise<void>;
  
  // Updates the track list and saves it
  setTracks: (tracks: Track[]) => void;
  
  // Updates the folder list and saves it
  setFolders: (folders: string[]) => void;
  
  // Plays a specific track from the list. 
  // Optionally accepts a specific playlist (trackList) for context.
  playTrack: (index: number, trackList?: Track[]) => Promise<void>;
  
  // Toggles between Play and Pause states
  togglePlayPause: () => Promise<void>;
  
  // Skips to the next song, handling shuffle and repeat logic
  skipNext: () => Promise<void>;
  
  // Returns to the previous song or restarts the current one
  skipBack: () => Promise<void>;
  
  // Cycles through Repeat Modes: None -> One -> All
  cycleRepeatMode: () => void;
  
  // Toggles Shuffle mode on/off
  toggleShuffle: () => void;
  
  // Sets the playback speed (e.g., 1.5x)
  setPlaybackSpeed: (speed: number) => Promise<void>;
  
  // Sets the pitch (useful for fun effects)
  setPlaybackPitch: (pitch: number) => void;
  
  // Handles the user scrubbing through the song
  onSeek: (position: number) => Promise<void>;
  
  // Sets the seeking flag (pauses UI updates while dragging)
  setIsSeeking: (isSeeking: boolean) => void;
  
  // Sets the sleep timer value
  setSleepTimerSeconds: (seconds: number | null) => void;
  
  // Toggles the 'favorite' status of a song
  toggleFavorite: (id: string) => void;
  
  // Logic to execute when a song finishes playing naturally
  handleTrackFinish: () => Promise<void>;
}

// ============================================================================
// Store Implementation
// ============================================================================
export const useMusicStore = create<MusicState>((set, get) => ({
  // --- Initial State ---
  tracks: [],
  folders: ['General'], // Default folder
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

  // --- Load / Save Logic ---
  
  loadData: async () => {
    try {
      // We attempt to retrieve the tracks and folders from AsyncStorage.
      // This happens once when the app starts.
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
      // We typically don't alert here to avoid annoying the user on startup,
      // but logging is essential for debugging.
    }
  },

  saveData: async (updatedTracks: Track[], updatedFolders?: string[]) => {
    try {
      // We assume 'tracks' can be quite large (including base64 images),
      // so this operation might take a moment.
      await AsyncStorage.setItem('tracks', JSON.stringify(updatedTracks));
      
      if (updatedFolders) {
        await AsyncStorage.setItem('folders', JSON.stringify(updatedFolders));
      }
    } catch (e) {
      console.error('Failed to save data to storage', e);
      Alert.alert('Storage Error', 'Could not save your library. You might be out of space.');
    }
  },

  setTracks: (tracks) => {
    set({ tracks });
    // Always save immediately after updating the list
    get().saveData(tracks);
  },

  setFolders: (folders) => {
    set({ folders });
    get().saveData(get().tracks, folders);
  },

  // --- Playback Logic ---

  playTrack: async (index: number, trackList = get().tracks) => {
    const { sound: currentSound, playbackSpeed, playbackPitch } = get();
    
    // Safety check: if the index is invalid, don't crash
    if (index < 0 || index >= trackList.length) return;

    try {
      // If there's already a sound playing, we must unload it first to free resources.
      if (currentSound) {
        await currentSound.unloadAsync();
      }
      
      // Load the new sound file
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: trackList[index].uri },
        { 
          shouldPlay: true, // Auto-play once loaded
          rate: playbackSpeed, 
          shouldCorrectPitch: true, // Keep pitch natural when changing speed
          pitch: playbackPitch 
        },
        (status) => {
          // This callback runs repeatedly during playback (update listener)
          if (status.isLoaded) {
            // Only update the progress bar if the user isn't currently dragging it
            if (!get().isSeeking) {
              set({ 
                playbackPosition: status.positionMillis, 
                playbackDuration: status.durationMillis || 0 
              });
            }
            
            // If the song finished naturally, trigger the next song logic
            if (status.didJustFinish) {
              get().handleTrackFinish();
            }
          } else if (status.error) {
            console.error('Playback error:', status.error);
          }
        }
      );
      
      // Find the global index of the track (in case we're playing from a filtered list)
      const mainIndex = get().tracks.findIndex(t => t.id === trackList[index].id);
      
      set({ 
        sound: newSound, 
        currentTrackIndex: mainIndex !== -1 ? mainIndex : index, 
        isPlaying: true 
      });
      
    } catch (e) {
      console.error('Error in playTrack:', e);
      Alert.alert('Playback Error', 'Could not play this track. The file might be missing or corrupted.');
    }
  },

  togglePlayPause: async () => {
    const { sound, isPlaying, tracks, playTrack } = get();
    
    // If no sound is loaded, try to play the first track
    if (!sound) {
      if (tracks.length > 0) {
        playTrack(0);
      }
      return;
    }
    
    // Toggle the actual audio state
    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
    
    // Update the UI state
    set({ isPlaying: !isPlaying });
  },

  skipNext: async () => {
    const { tracks, currentTrackIndex, isShuffle, playTrack } = get();
    
    if (tracks.length === 0) return;
    if (currentTrackIndex === null) {
        playTrack(0);
        return;
    }

    let nextIndex;
    
    if (isShuffle) {
      // Pick a random song that isn't the current one (unless it's the only one)
      nextIndex = Math.floor(Math.random() * tracks.length);
      if (tracks.length > 1 && nextIndex === currentTrackIndex) {
          nextIndex = (nextIndex + 1) % tracks.length;
      }
    } else {
      // Normal sequential playback
      nextIndex = (currentTrackIndex + 1) % tracks.length;
    }
    
    await playTrack(nextIndex);
  },

  skipBack: async () => {
    const { tracks, currentTrackIndex, playTrack, playbackPosition } = get();
    
    if (tracks.length === 0 || currentTrackIndex === null) return;
    
    // If we are more than 3 seconds into the song, restart it instead of going back
    if (playbackPosition > 3000) {
        const { sound } = get();
        if (sound) {
            await sound.setPositionAsync(0);
            set({ playbackPosition: 0 });
            return;
        }
    }

    // Otherwise, go to the previous track
    let prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    await playTrack(prevIndex);
  },

  handleTrackFinish: async () => {
    const { repeatMode, currentTrackIndex, playTrack, skipNext } = get();
    
    // If 'Repeat One' is on, just replay the current track
    if (repeatMode === 'one' && currentTrackIndex !== null) {
      const { sound } = get();
      if(sound) {
          await sound.replayAsync();
      }
    } else {
      // Otherwise, assume 'Repeat All' (default behavior for now) or just Next
      // You could add logic here to stop if repeatMode is 'none' and it's the last song.
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
        // We preserve pitch when changing speed for a better listening experience
        await sound.setRateAsync(speed, true);
    }
  },

  setPlaybackPitch: (pitch) => {
      set({ playbackPitch: pitch });
      // Note: Pitch changes usually require a reload or specific configuration in Expo AV
      // We set it in state so the next playTrack call picks it up.
  },

  onSeek: async (position) => {
    const { sound } = get();
    if (sound) {
        await sound.setPositionAsync(position);
    }
    // Resume the progress bar updates
    set({ playbackPosition: position, isSeeking: false });
  },

  setIsSeeking: (isSeeking) => set({ isSeeking }),

  setSleepTimerSeconds: (seconds) => set({ sleepTimerSeconds: seconds }),

  toggleFavorite: (id: string) => {
    const { tracks, saveData } = get();
    // Create a new array with the toggled favorite status
    const updated = tracks.map(t => 
      t.id === id ? { ...t, isFavorite: !t.isFavorite } : t
    );
    
    set({ tracks: updated });
    saveData(updated);
  }
}));
