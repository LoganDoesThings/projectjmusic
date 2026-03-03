import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal } from 'react-native';
import { Colors } from '../theme/colors';

interface SleepModalProps {
  visible: boolean;
  onClose: () => void;
  onSetTimer: (minutes: number) => void;
  colors: Colors;
}

export const SleepModal: React.FC<SleepModalProps> = ({
  visible,
  onClose,
  onSetTimer,
  colors,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity 
        style={[styles.modalOverlay, { backgroundColor: colors.overlay }]} 
        onPress={onClose}
        activeOpacity={1}
      >
        <View style={[styles.fxContent, { backgroundColor: colors.surface }]}>
          <Text style={[styles.fxTitle, { color: colors.text, textAlign: 'center', marginBottom: 20 }]}>
            Sleep Timer
          </Text>
          {[10, 20, 30, 60].map(m => (
            <TouchableOpacity 
              key={m} 
              style={{ padding: 15, borderBottomColor: colors.border, borderBottomWidth: 1 }} 
              onPress={() => onSetTimer(m)}
            >
              <Text style={{ color: colors.text, textAlign: 'center' }}>{m} Minutes</Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fxContent: { width: '85%', borderRadius: 25, padding: 25, elevation: 20 },
  fxTitle: { fontSize: 22, fontWeight: 'bold' }
});
