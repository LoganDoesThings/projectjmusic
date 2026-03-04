import React, { useState } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, Alert, Platform, Modal, TextInput } from 'react-native';
import { Music, Plus, Globe } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useMusicStore } from '../store/useMusicStore';
import { TrackItem } from '../components/TrackItem';
import { getColors } from '../theme/colors';
import { Track } from '../types';

import { getMetadata } from '../utils/metadata';

export const LibraryScreen = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const store = useMusicStore();
  const colors = getColors(isDarkMode);
  const currentTrack = store.currentTrackIndex !== null ? store.tracks[store.currentTrackIndex] : null;
  const [isUrlModalVisible, setIsUrlModalVisible] = useState(false);
  const [urlInput, setUrlInput] = useState('');

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
            folder: 'General',
            ...metadata
          };
        }));
        store.setTracks([...store.tracks, ...newTracks]);
      }
    } catch (err) { console.error(err); }
  };

  const addFromUrl = async () => {
    if (!urlInput.trim()) return;
    try {
      const metadata = await getMetadata(urlInput);
      const name = urlInput.split('/').pop()?.split('?')[0] || 'Remote Track';
      const newTrack: Track = {
        id: Math.random().toString(36).substr(2, 9),
        name: name,
        uri: urlInput,
        folder: 'General',
        ...metadata
      };
      store.setTracks([...store.tracks, newTrack]);
      setUrlInput('');
      setIsUrlModalVisible(false);
    } catch (err) {
      Alert.alert('Error', 'Could not add track from URL.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Library</Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>{store.tracks.length} songs</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={() => setIsUrlModalVisible(true)} style={[styles.addButton, { backgroundColor: colors.border, marginRight: 10 }]}>
            <Globe color={colors.text} size={24} />
          </TouchableOpacity>
          <TouchableOpacity onPress={pickTrack} style={[styles.addButton, { backgroundColor: colors.border }]}>
            <Plus color={colors.text} size={24} />
          </TouchableOpacity>
        </View>
      </View>
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
              store.setTracks(store.tracks.filter(t => t.id !== item.id));
            }}
            onToggleFavorite={() => store.toggleFavorite(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Music color={colors.border} size={80} />
            <Text style={{ color: colors.subtext, marginTop: 10 }}>Empty Library</Text>
          </View>
        }
      />

      <Modal
        visible={isUrlModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsUrlModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Remote URL</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="https://example.com/music.mp3"
              placeholderTextColor={colors.subtext}
              value={urlInput}
              onChangeText={setUrlInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setIsUrlModalVisible(false)} style={styles.modalButton}>
                <Text style={{ color: colors.subtext }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addFromUrl} style={[styles.modalButton, { backgroundColor: colors.primary, borderRadius: 8 }]}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Add</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  headerButtons: { flexDirection: 'row' },
  title: { fontSize: 28, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 2 },
  addButton: { padding: 8, borderRadius: 20 },
  listContent: { paddingBottom: 100 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 120 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', padding: 20, borderRadius: 15 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  modalButton: { paddingHorizontal: 20, paddingVertical: 10, marginLeft: 10 },
});
