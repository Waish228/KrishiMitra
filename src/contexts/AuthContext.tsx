import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getProfile, upsertProfile } from '../api/users';
import { signOut as apiSignOut } from '../api/auth';
import type { UserProfile } from '../api/types';

interface AuthContextType {
  session: User | null; // Using Firebase User object as session indicator
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (authUser: User) => {
    try {
      let p = await getProfile(authUser.uid);

      if (!p) {
        p = await upsertProfile({
          auth_id: authUser.uid,
          full_name: authUser.displayName || (authUser.email?.split('@')[0] ?? 'Farmer'),
          email: authUser.email ?? '',
          avatar_url: authUser.photoURL ?? null,
        });
      }

      setProfile(p);
    } catch (err) {
      console.error('[AuthContext] Failed to load profile:', err);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user);
  }, [user, loadProfile]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        await loadProfile(currentUser);
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    await apiSignOut();
    setUser(null);
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ session: user, user, profile, loading, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};
