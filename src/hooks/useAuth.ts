import { useState, useEffect } from 'react';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot, collection, query, where, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  joinDate: string;
  currentLevel: string;
  totalStudySeconds: number; // Changed from string to number
  streak: number;
  lastActivityDate: string; // Added to track streak
  completedLessons: number;
  totalLessons: number;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        setLoading(false);
      }
    });

    return () => authUnsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const profileUnsubscribe = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          const userData = doc.data() as UserProfile;
          setUserProfile(userData);
          console.log("User Profile updated:", userData);
        } else {
          setUserProfile(null); 
        }
        setLoading(false);
      }, (error) => {
        console.error("Firestore onSnapshot error:", error);
        setLoading(false);
      });

      // Listener for completed courses count
      const enrolledCoursesRef = collection(db, 'user_progress', user.uid, 'enrolled_courses');
      const completedCoursesUnsubscribe = onSnapshot(query(enrolledCoursesRef, where("isCompleted", "==", true)), (snapshot) => {
        const completedCoursesCount = snapshot.size;
        console.log("Completed courses count from subcollection:", completedCoursesCount);
        // Update the user's main document with the count of completed courses
        updateDoc(userDocRef, {
          completedLessons: completedCoursesCount 
        }).catch(console.error);
      }, (error) => {
        console.error("Firestore completed courses onSnapshot error:", error);
      });

      return () => {
        profileUnsubscribe();
        completedCoursesUnsubscribe(); 
      };
    } else {
      setUserProfile(null);
    }
  }, [user]);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const userDoc = await getDoc(doc(db, 'users', result.user.uid));

      if (!userDoc.exists()) {
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
          totalStudySeconds: 0,
          streak: 0,
          lastActivityDate: '',
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

      // Update the user's profile with the display name
      await updateProfile(currentUser, { displayName });

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
        totalStudySeconds: 0,
        streak: 0,
        lastActivityDate: '',
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