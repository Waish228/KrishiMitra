import { collection, query, where, getDocs, addDoc, orderBy, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Conversation, Message } from './types';

export async function getConversations(userId: string): Promise<Conversation[]> {
  const q = query(
    collection(db, 'conversations'),
    where('user_id', '==', userId),
    orderBy('updated_at', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));
}

export async function createConversation(userId: string, title?: string): Promise<Conversation> {
  const now = new Date().toISOString();
  const docRef = await addDoc(collection(db, 'conversations'), {
    user_id: userId,
    title: title || 'New Chat',
    created_at: now,
    updated_at: now
  });
  
  return {
    id: docRef.id,
    user_id: userId,
    title: title || 'New Chat',
    created_at: now,
    updated_at: now
  };
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const q = query(
    collection(db, 'messages'),
    where('conversation_id', '==', conversationId),
    orderBy('created_at', 'asc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
}

export async function addMessage(message: Omit<Message, 'id' | 'created_at'>): Promise<Message> {
  const now = new Date().toISOString();
  
  // Add message
  const docRef = await addDoc(collection(db, 'messages'), {
    ...message,
    created_at: now
  });
  
  // Update conversation timestamp
  const convRef = doc(db, 'conversations', message.conversation_id);
  await updateDoc(convRef, { updated_at: now });
  
  return {
    id: docRef.id,
    ...message,
    created_at: now
  };
}
