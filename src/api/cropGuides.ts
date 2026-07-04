import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { CropGuide } from './types';

export async function getCropGuides(): Promise<CropGuide[]> {
  const querySnapshot = await getDocs(collection(db, 'crop_guides'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CropGuide));
}

export async function searchCropGuides(searchTerm: string): Promise<CropGuide[]> {
  // Simple search implemented client side since Firestore doesn't support full-text search directly easily
  const allGuides = await getCropGuides();
  const term = searchTerm.toLowerCase();
  return allGuides.filter(g => 
    g.name.toLowerCase().includes(term) || 
    g.scientific_name?.toLowerCase().includes(term) ||
    g.description?.toLowerCase().includes(term)
  );
}
