import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, seedInitialDataIfEmpty, testConnection } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Test connection on boot
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // Check or create user profile in Firestore
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userDocRef);
          
          let profile: UserProfile;
          if (userSnap.exists()) {
            profile = userSnap.data() as UserProfile;
            // Update lastLogin
            await setDoc(userDocRef, {
              lastLogin: new Date().toISOString(),
              displayName: currentUser.displayName || profile.displayName,
              photoURL: currentUser.photoURL || profile.photoURL || '',
            }, { merge: true });
          } else {
            profile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'เจ้าหน้าที่คลังสินค้า',
              photoURL: currentUser.photoURL || '',
              role: 'manager',
              lastLogin: new Date().toISOString(),
            };
            await setDoc(userDocRef, profile);
          }
          setUserProfile(profile);

          // Seed sample construction materials if empty
          await seedInitialDataIfEmpty();
        } catch (err: unknown) {
          console.error('Error fetching user profile:', err);
          // Fallback profile if Firestore read fails
          setUserProfile({
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || 'เจ้าหน้าที่คลัง',
            photoURL: currentUser.photoURL || '',
            role: 'manager',
            lastLogin: new Date().toISOString()
          });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      console.error('Sign-in error:', err);
      const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google';
      setError(message);
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
    } catch (err: unknown) {
      console.error('Sign-out error:', err);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signInWithGoogle,
        signOutUser,
        error,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
