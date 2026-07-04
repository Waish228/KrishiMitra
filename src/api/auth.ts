import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile as firebaseUpdateProfile,
} from 'firebase/auth';
import { auth } from '../lib/firebase';

export async function signUpWithEmail(email: string, pass: string, displayName?: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);

  // Save the display name to Firebase Auth profile immediately
  if (displayName) {
    await firebaseUpdateProfile(userCredential.user, { displayName });
  }

  return { user: userCredential.user, error: null };
}

export async function signInWithEmail(email: string, pass: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  return { user: userCredential.user, error: null };
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  return { user: userCredential.user, error: null };
}

export async function signOut() {
  await firebaseSignOut(auth);
}
