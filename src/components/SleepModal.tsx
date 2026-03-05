import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Modal 
} from 'react-native';
import { Colors } from '../theme/colors';

// ============================================================================
// Props Interface
// ============================================================================
interface SleepModalProps {
  visible: boolean;
  onClose: () => void;
  onSetTimer: (minutes: number) => void;
  colors: Colors;
}

// ============================================================================
// Sleep Timer Modal
// ============================================================================
// Allows the user to select a duration after which playback will stop.
export const SleepModal: React.FC<SleepModalProps> = ({
  visible,
  onClose,
  onSetTimer,
  colors,
}) => {
  const options = [10, 20, 30, 60, 90];

  return (
    <Modal 
      visible={visible} 
      transparent 
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={[styles.modalOverlay, { backgroundColor: colors.overlay }]} 
        onPress={onClose}
        activeOpacity={1}
      >
        {/* Stop propagation so clicking the modal content doesn't close it */}
        <TouchableOpacity 
          activeOpacity={1} 
          style={[styles.modalContent, { backgroundColor: colors.surface }]}
        >
          <Text style={[styles.title, { color: colors.text }]}>
            Sleep Timer
          </Text>
          
          <Text style={{ color: colors.subtext, textAlign: 'center', marginBottom: 20 }}>
            Stop audio after...
          </Text>

          {options.map((minutes, index) => (
            <TouchableOpacity 
              key={minutes} 
              style={[
                styles.optionItem, 
                { borderBottomColor: colors.border },
                // Hide border for the last item
                index === options.length - 1 && { borderBottomWidth: 0 }
              ]} 
              onPress={() => onSetTimer(minutes)}
            >
              <Text style={[styles.optionText, { color: colors.text }]}>
                {minutes} Minutes
              </Text>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity 
             style={[styles.cancelButton, { backgroundColor: colors.border }]}
             onPress={onClose}
          >
              <Text style={{ color: colors.text, fontWeight: '600' }}>Cancel</Text>
          </TouchableOpacity>

        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContent: { 
    width: '80%', 
    maxWidth: 350,
    borderRadius: 25, 
    padding: 25, 
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5
  },
  optionItem: { 
    paddingVertical: 15, 
    borderBottomWidth: 1,
    alignItems: 'center'
  },
  optionText: {
    fontSize: 16
  },
  cancelButton: {
      marginTop: 20,
      padding: 12,
      borderRadius: 12,
      alignItems: 'center'
  }
});
