import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { DiseaseDetectionResult } from './ai/client';

export interface DiseaseReport extends DiseaseDetectionResult {
  id?: string;
  user_id: string;
  image_url?: string; // Optional if we implement Firebase Storage later
  created_at: string;
}

/**
 * Saves a new disease detection report to Firestore.
 */
export async function saveDiseaseReport(
  userId: string,
  report: DiseaseDetectionResult,
  imageUrl?: string
): Promise<DiseaseReport> {
  const now = new Date().toISOString();
  const reportData: Omit<DiseaseReport, 'id'> = {
    ...report,
    user_id: userId,
    image_url: imageUrl || '',
    created_at: now
  };

  const docRef = await addDoc(collection(db, 'disease_reports'), reportData);
  
  return {
    id: docRef.id,
    ...reportData
  };
}

/**
 * Fetches recent disease reports for a specific user.
 * Sorting is done client-side to avoid the need for composite indexes in Firestore.
 */
export async function getRecentDiseaseReports(userId: string): Promise<DiseaseReport[]> {
  const q = query(
    collection(db, 'disease_reports'),
    where('user_id', '==', userId)
  );
  
  const querySnapshot = await getDocs(q);
  const reports = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DiseaseReport));
  
  // Sort client-side: newest first
  return reports.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}
