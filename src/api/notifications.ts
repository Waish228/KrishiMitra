import { collection, query, where, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Notification } from './types';

export async function getNotifications(userId: string): Promise<Notification[]> {
  const q = query(
    collection(db, 'notifications'),
    where('user_id', '==', userId),
    orderBy('created_at', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const docRef = doc(db, 'notifications', notificationId);
  await updateDoc(docRef, { is_read: true });
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const q = query(
    collection(db, 'notifications'),
    where('user_id', '==', userId),
    where('is_read', '==', false)
  );
  
  const querySnapshot = await getDocs(q);
  const updatePromises = querySnapshot.docs.map(document => {
    const docRef = doc(db, 'notifications', document.id);
    return updateDoc(docRef, { is_read: true });
  });
  
  await Promise.all(updatePromises);
}
