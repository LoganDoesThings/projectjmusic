// ============================================================================
// Global Types
// ============================================================================

/**
 * Represents a single audio file in the library.
 */
export interface Track {
  id: string;          // Unique identifier generated when the track is added
  name: string;        // Display name of the song
  uri: string;         // Local file path or remote URL
  isFavorite?: boolean;// Has the user 'hearted' this track?
  folder: string;      // The folder/playlist name this track belongs to
  artist?: string;     // ID3 Artist tag
  album?: string;      // ID3 Album tag
  artwork?: string;    // Base64 encoded image string
  duration?: number;   // Duration in milliseconds
}

/**
 * Playback repeat modes.
 * - 'none': Stop after the last song.
 * - 'one': Repeat the current song indefinitely.
 * - 'all': Loop the entire list/queue.
 */
export type RepeatMode = 'none' | 'one' | 'all';
