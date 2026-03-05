import React, { useState } from 'react';
import { 
  View, 
  FlatList, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Music, ArrowLeft, Plus } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useMusicStore } from '../store/useMusicStore';
import { TrackItem } from '../components/TrackItem';
import { getColors } from '../theme/colors';
import { Track } from '../types';

import { getMetadata } from '../utils/metadata';

// ============================================================================
// Folder Detail Screen
// ============================================================================
// Shows tracks belonging to a specific folder. 
// Allows adding new tracks directly to this folder.
export const FolderDetailScreen = ({ route, navigation, isDarkMode }: any) => {
  // Get the folder name from navigation parameters
  const { folderName } = route.params;
  
  const store = useMusicStore();
  const colors = getColors(isDarkMode);
  
  // Filter tracks to show only those in this folder
  const filteredTracks = store.tracks.filter(t => t.folder === folderName);
  
  // Get current track to highlight it
  const currentTrack = store.currentTrackIndex !== null ? store.tracks[store.currentTrackIndex] : null;
  
  const [isLoading, setIsLoading] = useState(false);

  // --- Logic ---

  const pickTrack = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ 
        type: 'audio/*', 
        copyToCacheDirectory: true, 
        multiple: true 
      });

      if (!result.canceled && result.assets) {
        setIsLoading(true);
        const newTracks: Track[] = await Promise.all(result.assets.map(async asset => {
          const metadata = await getMetadata(asset.uri);
          return {
            id: Math.random().toString(36).substr(2, 9),
            name: asset.name,
            uri: asset.uri,
            folder: folderName, // Assign directly to this folder
            ...metadata
          };
        }));
        
        store.setTracks([...store.tracks, ...newTracks]);
        setIsLoading(false);
      }
    } catch (err) { 
      console.error(err); 
      setIsLoading(false);
      Alert.alert('Error', 'Failed to pick audio file.');
    }
  };

  // --- Render ---

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <ArrowLeft color={colors.text} size={28} />
        </TouchableOpacity>
        
        <View style={{ flex: 1, marginLeft: 15 }}>
          <Text style={[styles.title, { color: colors.text }]}>{folderName}</Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>
            {filteredTracks.length} songs
          </Text>
        </View>
        
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

      {/* Track List */}
      <FlatList
        data={filteredTracks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <TrackItem
            item={item}
            isCurrent={currentTrack?.id === item.id}
            colors={colors}
            // IMPORTANT: We pass the filtered list so the player knows the correct context
            onPress={() => store.playTrack(index, filteredTracks)} 
            onDelete={() => {
              store.setTracks(store.tracks.filter(t => t.id !== item.id));
            }}
            onToggleFavorite={() => store.toggleFavorite(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Music color={colors.border} size={80} />
            <Text style={{ color: colors.subtext, marginTop: 10 }}>Empty Folder</Text>
            <Text style={{ color: colors.subtext, fontSize: 12 }}>Tap + to add songs here</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 20 
  },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 14 },
  addButton: { 
    padding: 8, 
    borderRadius: 20,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listContent: { paddingBottom: 100 },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 120 
  },
});
