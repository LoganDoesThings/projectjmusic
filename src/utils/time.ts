/**
 * Formats milliseconds into a "m:ss" string.
 * @param millis - The duration in milliseconds.
 * @returns A formatted time string.
 */
export const formatTime = (millis: number): string => {
  if (millis < 0 || isNaN(millis)) return "0:00";
  const totalSeconds = Math.floor(millis / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};
