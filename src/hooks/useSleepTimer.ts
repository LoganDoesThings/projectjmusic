import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { useMusicStore } from '../store/useMusicStore';

/**
 * Custom hook to manage the sleep timer logic.
 * Pauses playback when the countdown reaches zero.
 */
export const useSleepTimer = () => {
  const store = useMusicStore();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // If timer is set and running
    if (store.sleepTimerSeconds !== null && store.sleepTimerSeconds > 0) {
      // Decrement every second
      timerRef.current = setInterval(() => {
        store.setSleepTimerSeconds(store.sleepTimerSeconds! - 1);
      }, 1000);
      
    } else if (store.sleepTimerSeconds === 0) {
      // Timer finished: Pause music and reset
      if (store.sound) {
        store.sound.pause();
      }
      store.setSleepTimerSeconds(null);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      Alert.alert("Sleep Timer", "Music stopped.");
    }
    
    // Clear interval on every re-render of this effect or on unmount
    return () => { 
      if (timerRef.current) clearInterval(timerRef.current); 
    };
  }, [store.sleepTimerSeconds, store.sound]);

  const setTimer = (minutes: number) => {
    store.setSleepTimerSeconds(minutes * 60);
  };

  return { sleepTimerSeconds: store.sleepTimerSeconds, setTimer };
};
