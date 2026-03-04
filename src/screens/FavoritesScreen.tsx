import React from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { Music, Heart } from 'lucide-react-native';
import { useMusicStore } from '../store/useMusicStore';
import { TrackItem } from '../components/TrackItem';
import { getColors } from '../theme/colors';

export const FavoritesScreen = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const store = useMusicStore();
  const colors = getColors(isDarkMode);
  
  const filteredTracks = store.tracks.filter(t => t.isFavorite);
  const currentTrack = store.currentTrackIndex !== null ? store.tracks[store.currentTrackIndex] : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Favorites</Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>{filteredTracks.length} songs</Text>
        </View>
        <Heart color={colors.primary} fill={colors.primary} size={28} />
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
            <Text style={{ color: colors.subtext, marginTop: 10 }}>No favorites yet</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 2 },
  listContent: { paddingBottom: 100 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 120 },
});
