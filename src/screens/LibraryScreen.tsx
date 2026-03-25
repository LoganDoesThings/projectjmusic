import React, { useState } from 'react';
import { 
  View, 
  FlatList, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  Modal, 
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Music, Plus, Globe } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { DEFAULT_FOLDER, LIST_BOTTOM_PADDING, EMPTY_STATE_TOP_MARGIN, MODAL_MAX_WIDTH } from '../constants';
import { useMusicStore } from '../store/useMusicStore';
import { TrackItem } from '../components/player/TrackItem';
import { getColors } from '../theme/colors';
import { Track } from '../types';
import { createTrackId } from '../utils/createTrackId';
import { getMetadata } from '../utils/metadata';
import { handleFileError, handleNetworkError } from '../utils/errorHandler';
import { logError } from '../utils/logger';
import { validateAudioUrl } from '../utils/urlValidator';

// ============================================================================
import { MainTabScreenProps } from '../types/navigation';

// ============================================================================
// Library Screen
// ============================================================================
// Displays the main list of songs. Allows users to add files from their device
// or from a remote URL.
interface LibraryScreenProps extends MainTabScreenProps<'Library'> {
  isDarkMode: boolean;
}

export const LibraryScreen = ({ isDarkMode }: LibraryScreenProps) => {
  const store = useMusicStore();
  const colors = getColors(isDarkMode);
  
  // We grab the currently playing track to highlight it in the list
  const currentTrack = store.currentTrackIndex !== null ? store.tracks[store.currentTrackIndex] : null;
  
  // Local state for the URL input modal
  const [isUrlModalVisible, setIsUrlModalVisible] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  
  // Loading state for when we are parsing large files
  const [isLoading, setIsLoading] = useState(false);

  // --- File Picking Logic ---
  
  const pickTrack = async () => {
    try {
      // Pick audio files. We use 'copyToCacheDirectory' to ensure we have access 
      // to the file even if the original is moved (though this duplicates storage).
      const result = await DocumentPicker.getDocumentAsync({ 
        type: 'audio/*', 
        copyToCacheDirectory: true, 
        multiple: true 
      });

      if (!result.canceled && result.assets) {
        setIsLoading(true);
        
        // Process all selected files in parallel
        const newTracks: Track[] = await Promise.all(result.assets.map(async asset => {
          // Extract ID3 tags
          const metadata = await getMetadata(asset.uri);
          
          return {
            id: createTrackId(),
            name: asset.name,
            uri: asset.uri,
            folder: DEFAULT_FOLDER,
            ...metadata
          };
        }));
        
        // Update the global store
        store.setTracks([...store.tracks, ...newTracks]);
        setIsLoading(false);
      }
    } catch (err) { 
      setIsLoading(false);
      const errorMsg = handleFileError(err, 'audio file');
      Alert.alert('File Error', errorMsg);
    }
  };

  // --- URL Adding Logic ---

  const addFromUrl = async () => {
    // Validate URL format and content
    const validatedUrl = validateAudioUrl(urlInput);
    if (!validatedUrl) {
      Alert.alert('Invalid URL', 'Please enter a valid URL (e.g., https://example.com/song.mp3)');
      return;
    }
    
    setIsLoading(true);
    try {
      // Try to fetch metadata first to verify the link works
      const metadata = await getMetadata(validatedUrl);
      
      // Fallback name if none found in metadata or URL
      const name = validatedUrl.split('/').pop()?.split('?')[0] || 'Remote Track';
      
      const newTrack: Track = {
        id: createTrackId(),
        name: name,
        uri: validatedUrl,
        folder: DEFAULT_FOLDER,
        ...metadata
      };
      
      store.setTracks([...store.tracks, newTrack]);
      
      // Reset and close
      setUrlInput('');
      setIsUrlModalVisible(false);
    } catch (err) {
      const errorMsg = handleNetworkError(err, validatedUrl);
      Alert.alert('Network Error', errorMsg);
    } finally {
        setIsLoading(false);
    }
  };

  // --- Render ---

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      
      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Library</Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>
            {store.tracks.length} {store.tracks.length === 1 ? 'song' : 'songs'}
          </Text>
        </View>
        
        <View style={styles.headerButtons}>
          {/* Add URL Button */}
          <TouchableOpacity 
            onPress={() => setIsUrlModalVisible(true)} 
            style={[styles.addButton, { backgroundColor: colors.border, marginRight: 10 }]}
          >
            <Globe color={colors.text} size={24} />
          </TouchableOpacity>
          
          {/* Pick File Button */}
          <TouchableOpacity 
            onPress={pickTrack} 
            disabled={isLoading}
            style={[styles.addButton, { backgroundColor: colors.border }]}
          >
             {isLoading ? (
                 <ActivityIndicator color={colors.text} size="small" />
             ) : (
                 <Plus color={colors.text} size={24} />
             )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Song List */}
      <FlatList
        data={store.tracks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <TrackItem
            item={item}
            isCurrent={currentTrack?.id === item.id}
            colors={colors}
            onPress={() => store.playTrack(index)}
            onDelete={() => {
              // Confirm deletion could be added here, but for now we just remove
              store.setTracks(store.tracks.filter(t => t.id !== item.id));
            }}
            onToggleFavorite={() => store.toggleFavorite(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Music color={colors.border} size={80} />
            <Text style={{ color: colors.subtext, marginTop: 10 }}>Empty Library</Text>
            <Text style={{ color: colors.subtext, fontSize: 12 }}>Tap + to add songs</Text>
          </View>
        }
      />

      {/* Add URL Modal */}
      <Modal
        visible={isUrlModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsUrlModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Remote URL</Text>
            <Text style={{color: colors.subtext, marginBottom: 10, fontSize: 12}}>
                Paste a direct link to an MP3 file (e.g. from a CDN or file host).
            </Text>
            
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="https://example.com/music.mp3"
              placeholderTextColor={colors.subtext}
              value={urlInput}
              onChangeText={setUrlInput}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                onPress={() => setIsUrlModalVisible(false)} 
                style={styles.modalButton}
              >
                <Text style={{ color: colors.subtext }}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={addFromUrl} 
                disabled={isLoading}
                style={[styles.modalButton, { backgroundColor: colors.primary, borderRadius: 8 }]}
              >
                {isLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                ) : (
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Add</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20 
  },
  headerButtons: { flexDirection: 'row' },
  title: { fontSize: 28, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 2 },
  addButton: { 
    padding: 8, 
    borderRadius: 20,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listContent: { paddingBottom: LIST_BOTTOM_PADDING },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: EMPTY_STATE_TOP_MARGIN 
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContent: { 
    width: '85%', 
    padding: 20, 
    borderRadius: 15,
    maxWidth: MODAL_MAX_WIDTH,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  modalButton: { paddingHorizontal: 20, paddingVertical: 10, marginLeft: 10 },
});
