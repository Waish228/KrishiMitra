import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { MarketPrice } from './types';

export async function getMarketPrices(filters?: { crop_name?: string; state?: string }): Promise<MarketPrice[]> {
  let q = query(collection(db, 'market_prices'), orderBy('price_date', 'desc'));
  
  // Note: Firestore requires composite indexes for multiple where clauses + orderBy.
  // We'll fetch all ordered by date and filter client side if needed for simple prototyping.
  // In production, you'd create indexes.
  const querySnapshot = await getDocs(q);
  let results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MarketPrice));
  
  if (filters?.crop_name) {
    results = results.filter(r => r.crop_name === filters.crop_name);
  }
  if (filters?.state) {
    results = results.filter(r => r.state === filters.state);
  }
  
  return results;
}
