// Removed orderBy from queries to avoid requiring Firestore composite indexes.
// Sorting is done client-side instead, which works perfectly for this app.
import { collection, query, where, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Conversation, Message } from './types';

export async function getConversations(userId: string): Promise<Conversation[]> {
  // Simple filter by user_id only (no orderBy = no composite index needed)
  const q = query(
    collection(db, 'conversations'),
    where('user_id', '==', userId)
  );
  
  const querySnapshot = await getDocs(q);
  const conversations = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));
  
  // Sort client-side: most recently updated first
  return conversations.sort((a, b) =>
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
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
  // Simple filter by conversation_id only (no orderBy = no composite index needed)
  const q = query(
    collection(db, 'messages'),
    where('conversation_id', '==', conversationId)
  );
  
  const querySnapshot = await getDocs(q);
  const messages = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
  
  // Sort client-side: oldest first (chronological chat order)
  return messages.sort((a, b) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
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
