import React, { useState } from 'react';
import { 
  View, 
  ScrollView, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  Modal,
  TextInput
} from 'react-native';
import { Folder, Plus } from 'lucide-react-native';
import { useMusicStore } from '../store/useMusicStore';
import { getColors } from '../theme/colors';

// ============================================================================
// Folders Screen
// ============================================================================
// Lists all custom folders/playlists created by the user.
export const FoldersScreen = ({ navigation, isDarkMode }: any) => {
  const store = useMusicStore();
  const colors = getColors(isDarkMode);

  // State for the "Create Folder" modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [folderName, setFolderName] = useState('');

  // --- Logic ---

  const handleCreateFolder = () => {
      const name = folderName.trim();
      
      if (!name) {
          Alert.alert("Error", "Please enter a folder name.");
          return;
      }
      
      if (store.folders.includes(name)) {
          Alert.alert("Error", "A folder with this name already exists.");
          return;
      }
      
      store.setFolders([...store.folders, name]);
      setFolderName('');
      setIsModalVisible(false);
  };

  // --- Render ---

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Folders</Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>
            {store.folders.length} categories
          </Text>
        </View>
        
        {/* Create Folder Button */}
        <TouchableOpacity 
          onPress={() => setIsModalVisible(true)} 
          style={[styles.addButton, { backgroundColor: colors.border }]}
        >
          <Plus color={colors.text} size={24} />
        </TouchableOpacity>
      </View>

      {/* Folder List */}
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
              <Text style={{ color: colors.subtext }}>
                {store.tracks.filter(t => t.folder === f).length} songs
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* "New Folder" Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>New Folder</Text>
            
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Folder Name"
              placeholderTextColor={colors.subtext}
              value={folderName}
              onChangeText={setFolderName}
              autoFocus
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                onPress={() => setIsModalVisible(false)} 
                style={styles.modalButton}
              >
                <Text style={{ color: colors.subtext }}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleCreateFolder} 
                style={[styles.modalButton, { backgroundColor: colors.primary, borderRadius: 8 }]}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Create</Text>
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
  title: { fontSize: 28, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 2 },
  addButton: { padding: 8, borderRadius: 20 },
  listContent: { paddingBottom: 100 },
  folderItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 18, 
    borderBottomWidth: 1 
  },
  folderName: { fontSize: 18, fontWeight: 'bold' },
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
    maxWidth: 400
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  modalButton: { paddingHorizontal: 20, paddingVertical: 10, marginLeft: 10 },
});
