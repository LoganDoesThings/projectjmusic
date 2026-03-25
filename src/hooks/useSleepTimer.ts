import { useEffect, useRef, useCallback } from 'react';
import { Alert } from 'react-native';
import { useMusicStore } from '../store/useMusicStore';
import { SLEEP_TIMER_INTERVAL } from '../constants';
import { logInfo } from '../utils/logger';

/**
 * Custom hook to manage the sleep timer logic
 * Decrements timer every second and pauses playback when countdown reaches zero
 * @returns Object containing sleepTimerSeconds and setTimer function
 */
export const useSleepTimer = () => {
  const store = useMusicStore();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Memoize the tick function to prevent unnecessary interval recreations
  const handleTimerTick = useCallback(() => {
    const currentSeconds = store.sleepTimerSeconds;
    if (currentSeconds !== null && currentSeconds > 0) {
      store.setSleepTimerSeconds(currentSeconds - 1);
    }
  }, [store.sleepTimerSeconds, store.setSleepTimerSeconds]);

  useEffect(() => {
    // If timer is set and running
    if (store.sleepTimerSeconds !== null && store.sleepTimerSeconds > 0) {
      // Decrement every second
      timerRef.current = setInterval(handleTimerTick, SLEEP_TIMER_INTERVAL);
      
    } else if (store.sleepTimerSeconds === 0) {
      // Timer finished: Pause music and reset
      if (store.sound) {
        store.sound.pause();
      }
      store.setSleepTimerSeconds(null);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      logInfo('useSleepTimer', 'Sleep timer expired, playback paused');
      Alert.alert("Sleep Timer", "Music stopped.");
    }
    
    // Clear interval on every re-render of this effect or on unmount
    return () => { 
      if (timerRef.current) clearInterval(timerRef.current); 
    };
  }, [store.sleepTimerSeconds, store.sound, handleTimerTick]);

  /**
   * Set sleep timer in minutes
   * @param minutes - Number of minutes before playback stops
   */
  const setTimer = useCallback((minutes: number) => {
    store.setSleepTimerSeconds(minutes * 60);
    logInfo('useSleepTimer', `Sleep timer set to ${minutes} minutes`);
  }, [store.setSleepTimerSeconds]);

  return { sleepTimerSeconds: store.sleepTimerSeconds, setTimer };
};
