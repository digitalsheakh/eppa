'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, firebaseReady } from '@/lib/firebase';

export interface UserProfile {
  displayName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postcode: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  saveProfile: (data: UserProfile) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (u: User) => {
    if (!db) return;
    const snap = await getDoc(doc(db, 'users', u.uid));
    if (snap.exists()) setProfile(snap.data() as UserProfile);
  };

  useEffect(() => {
    if (!auth) { setLoading(false); return; } // Firebase not configured

    const timer = setTimeout(() => setLoading(false), 1500);

    const unsub = onAuthStateChanged(auth, u => {
      clearTimeout(timer);
      setUser(u);
      setLoading(false);
      if (u) loadProfile(u).catch(() => {});
      else setProfile(null);
    });

    return () => { unsub(); clearTimeout(timer); };
  }, []);

  const login = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase not configured');
    await signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    if (!auth) throw new Error('Firebase not configured');
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    if (db) {
      const snap = await getDoc(doc(db, 'users', cred.user.uid));
      if (snap.exists()) setProfile(snap.data() as UserProfile);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    if (!auth) throw new Error('Firebase not configured');
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    // onAuthStateChanged handles setUser automatically; force-refresh so displayName propagates
    await cred.user.reload();
  };

  const logout = async () => {
    if (auth) await signOut(auth);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    if (!auth) throw new Error('Firebase not configured');
    await sendPasswordResetEmail(auth, email);
  };

  const saveProfile = async (data: UserProfile) => {
    if (!db || !user) throw new Error('Not logged in or Firestore not configured');
    await setDoc(doc(db, 'users', user.uid), data, { merge: true });
    setProfile(data);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, ready: firebaseReady, login, loginWithGoogle, register, logout, resetPassword, saveProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
