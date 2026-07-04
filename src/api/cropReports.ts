import { collection, query, where, getDocs, addDoc, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { CropReport } from './types';

export async function getCropReports(userId: string): Promise<CropReport[]> {
  const q = query(
    collection(db, 'crop_reports'), 
    where('user_id', '==', userId),
    orderBy('created_at', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CropReport));
}

export async function createCropReport(report: Omit<CropReport, 'id' | 'created_at'>): Promise<CropReport> {
  const docRef = await addDoc(collection(db, 'crop_reports'), {
    ...report,
    created_at: new Date().toISOString()
  });
  
  return {
    id: docRef.id,
    ...report,
    created_at: new Date().toISOString()
  };
}
