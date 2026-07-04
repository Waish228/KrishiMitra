import { collection, query, where, getDocs, setDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { WeatherData } from './types';

export async function getCachedWeather(userId: string, locationName: string): Promise<WeatherData | null> {
  const q = query(
    collection(db, 'weather'),
    where('user_id', '==', userId),
    where('location_name', '==', locationName)
  );
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as WeatherData;
  }
  return null;
}

export async function cacheWeather(data: Omit<WeatherData, 'id'>) {
  // Use a predictable ID based on user + location for easy upsert
  const docId = `${data.user_id}_${data.location_name.replace(/\s+/g, '_')}`;
  const docRef = doc(db, 'weather', docId);
  await setDoc(docRef, data, { merge: true });
  return { id: docId, ...data } as WeatherData;
}
