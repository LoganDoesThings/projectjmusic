import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal } from 'react-native';
import { Plus } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { Colors } from '../theme/colors';

interface FXModalProps {
  visible: boolean;
  onClose: () => void;
  playbackSpeed: number;
  onSpeedChange: (value: number) => void;
  playbackPitch: number;
  onPitchChange: (value: number) => void;
  colors: Colors;
}

export const FXModal: React.FC<FXModalProps> = ({
  visible,
  onClose,
  playbackSpeed,
  onSpeedChange,
  playbackPitch,
  onPitchChange,
  colors,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.fxContent, { backgroundColor: colors.surface }]}>
          <View style={styles.fxHeader}>
            <Text style={[styles.fxTitle, { color: colors.text }]}>Audio FX</Text>
            <TouchableOpacity onPress={onClose}>
              <Plus color={colors.text} size={24} style={{ transform: [{ rotate: '45deg' }] }} />
            </TouchableOpacity>
          </View>
          
          <Text style={{ color: colors.text, marginTop: 10 }}>Speed: {playbackSpeed.toFixed(1)}x</Text>
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={0.5}
            maximumValue={2.0}
            value={playbackSpeed}
            minimumTrackTintColor={colors.primary}
            onValueChange={onSpeedChange}
          />
          
          <Text style={{ color: colors.text, marginTop: 10 }}>Pitch: {playbackPitch.toFixed(1)}x</Text>
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={0.5}
            maximumValue={2.0}
            value={playbackPitch}
            minimumTrackTintColor={colors.primary}
            onValueChange={onPitchChange}
          />
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', height: 100, marginTop: 20 }}>
            {[1, 2, 3, 4, 5].map(i => (
              <View 
                key={i} 
                style={{ 
                  width: 40, 
                  height: '100%', 
                  backgroundColor: colors.border, 
                  borderRadius: 5, 
                  justifyContent: 'flex-end' 
                }}
              >
                <View style={{ height: '50%', backgroundColor: colors.primary, borderRadius: 5 }} />
              </View>
            ))}
          </View>
          <Text style={{ color: colors.subtext, textAlign: 'center', marginTop: 15, fontSize: 10 }}>
            5-Band Equalizer (Simulation)
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fxContent: { width: '85%', borderRadius: 25, padding: 25, elevation: 20 },
  fxHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  fxTitle: { fontSize: 22, fontWeight: 'bold' }
});
