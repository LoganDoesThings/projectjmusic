import React from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Folder, Plus } from 'lucide-react-native';
import { useMusicStore } from '../store/useMusicStore';
import { getColors } from '../theme/colors';

export const FoldersScreen = ({ navigation, isDarkMode }: any) => {
  const store = useMusicStore();
  const colors = getColors(isDarkMode);

  const createFolder = () => {
    Alert.prompt("New Folder", "Enter folder name", [
      { text: "Cancel", style: "cancel" },
      { text: "Create", onPress: (name) => {
          if (name && !store.folders.includes(name)) {
            store.setFolders([...store.folders, name]);
          }
      }}
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Folders</Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>{store.folders.length} categories</Text>
        </View>
        <TouchableOpacity onPress={createFolder} style={[styles.addButton, { backgroundColor: colors.border }]}>
          <Plus color={colors.text} size={24} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.listContent}>
        {store.folders.map(f => (
          <TouchableOpacity 
            key={f} 
            style={[styles.folderItem, { borderBottomColor: colors.border }]} 
            onPress={() => navigation.navigate('FolderDetail', { folderName: f })}
          >
            <Folder color={colors.primary} size={28} />
            <View style={{ marginLeft: 15 }}>
              <Text style={[styles.folderName, { color: colors.text }]}>{f}</Text>
              <Text style={{ color: colors.subtext }}>{store.tracks.filter(t => t.folder === f).length} songs</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 2 },
  addButton: { padding: 8, borderRadius: 20 },
  listContent: { paddingBottom: 100 },
  folderItem: { flexDirection: 'row', alignItems: 'center', padding: 18, borderBottomWidth: 1 },
  folderName: { fontSize: 18, fontWeight: 'bold' },
});
