export interface Track {
  id: string;
  name: string;
  uri: string;
  isFavorite?: boolean;
  folder: string;
}

export type ViewMode = 'all' | 'folders' | 'folder-detail' | 'favorites';

export type RepeatMode = 'none' | 'one' | 'all';
