import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Modal 
} from 'react-native';
import { Plus } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { Colors } from '../theme/colors';

// ============================================================================
// Props Interface
// ============================================================================
interface FXModalProps {
  visible: boolean;
  onClose: () => void;
  playbackSpeed: number;
  onSpeedChange: (value: number) => void;
  playbackPitch: number;
  onPitchChange: (value: number) => void;
  colors: Colors;
}

// ============================================================================
// FX Modal Component
// ============================================================================
// Controls for Playback Speed and Pitch.
// Also includes a visual placeholder for an Equalizer.
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
    <Modal 
      visible={visible} 
      transparent 
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Background Overlay */}
      <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
        
        {/* Modal Content Card */}
        <View style={[styles.fxContent, { backgroundColor: colors.surface }]}>
          
          {/* Header */}
          <View style={styles.fxHeader}>
            <Text style={[styles.fxTitle, { color: colors.text }]}>Audio FX</Text>
            {/* Close Button (X icon created by rotating Plus) */}
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Plus color={colors.text} size={28} style={{ transform: [{ rotate: '45deg' }] }} />
            </TouchableOpacity>
          </View>
          
          {/* Speed Control */}
          <View style={styles.controlGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Speed: <Text style={{ color: colors.primary }}>{playbackSpeed.toFixed(2)}x</Text>
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={0.5}
              maximumValue={2.0}
              value={playbackSpeed}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
              onValueChange={onSpeedChange}
            />
          </View>
          
          {/* Pitch Control */}
          <View style={styles.controlGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Pitch: <Text style={{ color: colors.primary }}>{playbackPitch.toFixed(2)}x</Text>
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={0.5}
              maximumValue={2.0}
              value={playbackPitch}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
              onValueChange={onPitchChange}
            />
          </View>
          
          {/* Visual Equalizer (Static Mockup) */}
          <View style={styles.eqContainer}>
            {[0.6, 0.8, 0.5, 0.9, 0.7].map((level, i) => (
              <View 
                key={i} 
                style={[styles.eqBarContainer, { backgroundColor: colors.border }]}
              >
                <View 
                  style={[
                    styles.eqBarFill, 
                    { 
                      height: `${level * 100}%`, 
                      backgroundColor: colors.primary 
                    }
                  ]} 
                />
              </View>
            ))}
          </View>
          
          <Text style={[styles.footnote, { color: colors.subtext }]}>
            5-Band Equalizer (Visual Only)
          </Text>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  fxContent: { 
    width: '85%', 
    maxWidth: 400,
    borderRadius: 25, 
    padding: 25, 
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  fxHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 25,
    alignItems: 'center'
  },
  fxTitle: { 
    fontSize: 22, 
    fontWeight: 'bold' 
  },
  controlGroup: {
    marginBottom: 20
  },
  label: {
    marginBottom: 10,
    fontSize: 16,
    fontWeight: '500'
  },
  slider: {
    width: '100%',
    height: 40
  },
  eqContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    height: 80, 
    marginTop: 20,
    alignItems: 'flex-end'
  },
  eqBarContainer: {
    width: 30, 
    height: '100%', 
    borderRadius: 5, 
    justifyContent: 'flex-end',
    overflow: 'hidden'
  },
  eqBarFill: {
    width: '100%',
    borderRadius: 5
  },
  footnote: { 
    textAlign: 'center', 
    marginTop: 15, 
    fontSize: 12,
    opacity: 0.6
  }
});
