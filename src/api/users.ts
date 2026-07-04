import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { UserProfile } from './types';

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as UserProfile;
  }
  return null;
}

export async function upsertProfile(profile: Partial<UserProfile> & { auth_id: string }) {
  const docRef = doc(db, 'users', profile.auth_id);
  const now = new Date().toISOString();
  const data: Record<string, unknown> = {
    ...profile,
    preferred_language: profile.preferred_language ?? 'en',
    updated_at: now,
  };

  // Only set created_at on first creation
  const existing = await getDoc(docRef);
  if (!existing.exists()) {
    data.created_at = now;
  }

  await setDoc(docRef, data, { merge: true });
  const updatedDoc = await getDoc(docRef);
  return { id: updatedDoc.id, ...updatedDoc.data() } as UserProfile;
}

export async function updateProfile(userId: string, updates: Partial<UserProfile>) {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, {
    ...updates,
    updated_at: new Date().toISOString(),
  });
  const updatedDoc = await getDoc(docRef);
  return { id: updatedDoc.id, ...updatedDoc.data() } as UserProfile;
}
