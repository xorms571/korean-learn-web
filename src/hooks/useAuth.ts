import { useState, useEffect } from 'react';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  joinDate: string;
  currentLevel: string;
  totalStudyTime: string;
  streak: number;
  completedLessons: number;
  totalLessons: number;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile);
          }
        } catch (err) {
          console.error("Firestore read error:", err);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));

      if (!userDoc.exists()) {
        // Create new user profile
        const newUserProfile: UserProfile = {
          uid: result.user.uid,
          email: result.user.email || '',
          displayName: result.user.displayName || 'User',
          photoURL: result.user.photoURL || '',
          joinDate: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          currentLevel: 'Beginner 1',
          totalStudyTime: '0h 0m',
          streak: 0,
          completedLessons: 0,
          totalLessons: 0
        };

        await setDoc(doc(db, 'users', result.user.uid), newUserProfile);
        setUserProfile(newUserProfile);
      } else {
        setUserProfile(userDoc.data() as UserProfile);
      }

      return { success: true };
    } catch (error) {
      console.error('Google sign in error:', error);
      return { success: false, error };
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("User not authenticated yet");

      // Create user profile
      const newUserProfile: UserProfile = {
        uid: result.user.uid,
        email: result.user.email || '',
        displayName: displayName,
        photoURL: '',
        joinDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        currentLevel: 'Beginner 1',
        totalStudyTime: '0h 0m',
        streak: 0,
        completedLessons: 0,
        totalLessons: 0
      };

      await setDoc(doc(db, 'users', currentUser.uid), newUserProfile);
      setUserProfile(newUserProfile);

      return { success: true };
    } catch (error) {
      console.error('Email sign up error:', error);
      return { success: false, error };
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);

      // Get user profile
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data() as UserProfile);
      }

      return { success: true };
    } catch (error) {
      console.error('Email sign in error:', error);
      return { success: false, error };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error };
    }
  };

  return {
    user,
    userProfile,
    loading,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    logout
  };
}

