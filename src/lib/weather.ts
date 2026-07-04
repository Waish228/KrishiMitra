import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export interface WeatherHistoryEntry {
  userId: string;
  location: { lat: number; lng: number };
  temperature: number;
  humidity: number;
  windSpeed: number;
  rain: number;
}

export async function saveWeatherHistory(entry: WeatherHistoryEntry) {
  try {
    const historyRef = collection(db, 'weather_history');
    await addDoc(historyRef, {
      ...entry,
      timestamp: serverTimestamp(),
    });
    console.log('Weather history saved successfully');
  } catch (error) {
    console.error('Error saving weather history:', error);
  }
}
