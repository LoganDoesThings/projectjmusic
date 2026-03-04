import * as mm from 'music-metadata-browser';
import { Buffer } from 'buffer';

export interface Metadata {
  artist?: string;
  album?: string;
  artwork?: string;
  duration?: number;
}

export const getMetadata = async (uri: string): Promise<Metadata> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });

    const metadata = await mm.parseBuffer(Buffer.from(arrayBuffer), { mimeType: 'audio/mpeg' });
    
    let artwork = undefined;
    if (metadata.common.picture && metadata.common.picture.length > 0) {
      const pic = metadata.common.picture[0];
      const base64 = Buffer.from(pic.data).toString('base64');
      artwork = `data:${pic.format};base64,${base64}`;
    }

    return {
      artist: metadata.common.artist,
      album: metadata.common.album,
      artwork: artwork,
      duration: metadata.format.duration ? metadata.format.duration * 1000 : undefined,
    };
  } catch (error) {
    console.error('Error parsing metadata:', error);
    return {};
  }
};
