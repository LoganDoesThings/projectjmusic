import React from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Music, ArrowLeft, Plus } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useMusicStore } from '../store/useMusicStore';
import { TrackItem } from '../components/TrackItem';
import { getColors } from '../theme/colors';
import { Track } from '../types';

import { getMetadata } from '../utils/metadata';

export const FolderDetailScreen = ({ route, navigation, isDarkMode }: any) => {
  const { folderName } = route.params;
  const store = useMusicStore();
  const colors = getColors(isDarkMode);
  
  const filteredTracks = store.tracks.filter(t => t.folder === folderName);
  const currentTrack = store.currentTrackIndex !== null ? store.tracks[store.currentTrackIndex] : null;

  const pickTrack = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*', copyToCacheDirectory: true, multiple: true });
      if (!result.canceled && result.assets) {
        const newTracks: Track[] = await Promise.all(result.assets.map(async asset => {
          const metadata = await getMetadata(asset.uri);
          return {
            id: Math.random().toString(36).substr(2, 9),
            name: asset.name,
            uri: asset.uri,
            folder: folderName,
            ...metadata
          };
        }));
        store.setTracks([...store.tracks, ...newTracks]);
      }
    } catch (err) { console.error(err); }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft color={colors.text} size={28} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 15 }}>
          <Text style={[styles.title, { color: colors.text }]}>{folderName}</Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>{filteredTracks.length} songs</Text>
        </View>
        <TouchableOpacity onPress={pickTrack} style={[styles.addButton, { backgroundColor: colors.border }]}>
          <Plus color={colors.text} size={24} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredTracks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <TrackItem
            item={item}
            isCurrent={currentTrack?.id === item.id}
            colors={colors}
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
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 14 },
  addButton: { padding: 8, borderRadius: 20 },
  listContent: { paddingBottom: 100 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 120 },
});
