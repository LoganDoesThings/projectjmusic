import * as mm from 'music-metadata-browser';
import { Buffer } from 'buffer';

// ============================================================================
// Metadata Interface
// ============================================================================
// Defines the structure of the song information we extract.
export interface Metadata {
  artist?: string;
  album?: string;
  artwork?: string; // Base64 encoded image string (data:image/jpeg;base64,...)
  duration?: number; // Duration in milliseconds
}

// ============================================================================
// Metadata Extraction Utility
// ============================================================================
/**
 * Fetches and parses ID3 tags (artist, album, artwork) from an audio file URI.
 * 
 * NOTE: This function reads the entire file into memory as an ArrayBuffer.
 * This works well for typical songs (3-10MB), but may cause memory issues 
 * on low-end devices with very large files (e.g., 100MB+ mixes).
 * 
 * @param uri - The local or remote URI of the audio file.
 * @returns A promise resolving to the metadata object. Returns empty object on failure.
 */
export const getMetadata = async (uri: string): Promise<Metadata> => {
  try {
    // 1. Fetch the file data
    // We use fetch() because it works for both remote URLs and local 'file://' URIs 
    // in the Expo environment (though specific file system permissions may apply).
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // 2. Convert Blob to ArrayBuffer
    // We need an ArrayBuffer for the music-metadata-browser library to parse.
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
          if (reader.result instanceof ArrayBuffer) {
              resolve(reader.result);
          } else {
              reject(new Error("Failed to convert blob to ArrayBuffer"));
          }
      };
      reader.onerror = () => reject(new Error("FileReader error"));
      reader.readAsArrayBuffer(blob);
    });

    // 3. Parse the buffer using music-metadata-browser
    // We specify 'audio/mpeg' as a hint, but the library is smart enough to detect most formats.
    const metadata = await mm.parseBuffer(Buffer.from(arrayBuffer), { mimeType: 'audio/mpeg' });
    
    // 4. Extract and Format Artwork
    let artwork = undefined;
    if (metadata.common.picture && metadata.common.picture.length > 0) {
      const pic = metadata.common.picture[0];
      // Convert the raw buffer to a base64 string so we can display it in an <Image /> component
      const base64 = Buffer.from(pic.data).toString('base64');
      artwork = `data:${pic.format};base64,${base64}`;
    }

    // 5. Return the clean object
    return {
      artist: metadata.common.artist || 'Unknown Artist',
      album: metadata.common.album || 'Unknown Album',
      artwork: artwork,
      // Convert seconds to milliseconds for consistency with Expo AV
      duration: metadata.format.duration ? metadata.format.duration * 1000 : undefined,
    };
    
  } catch (error) {
    // If anything goes wrong (network error, corrupt file, out of memory), 
    // we log it and return an empty object so the app doesn't crash.
    console.warn(`Error parsing metadata for ${uri}:`, error);
    return {};
  }
};
