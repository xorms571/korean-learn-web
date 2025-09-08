import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  serverTimestamp,
  query,
  orderBy,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc,
  where
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Post } from '@/types/post';
import { UserProfile } from '@/hooks/useAuth';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Validate Firebase config
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  throw new Error('Invalid Firebase configuration');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Firestore collections
const postsCollection = collection(db, 'posts');

// Post functions
export const createPost = async (post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'commentCount'>) => {
  try {
    const docRef = await addDoc(postsCollection, {
      ...post,
      createdAt: serverTimestamp(),
      likes: [],
      commentCount: 0
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating post: ", error);
    throw error;
  }
};

export const getPosts = async (): Promise<Post[]> => {
  try {
    const q = query(postsCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
  } catch (error) {
    console.error("Error getting posts: ", error);
    return [];
  }
};

export const getPost = async (id: string): Promise<Post | null> => {
  try {
    const docRef = doc(db, 'posts', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Post;
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error getting post: ", error);
    return null;
  }
};

export const toggleLike = async (postId: string, userId: string) => {
  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);

  if (postSnap.exists()) {
    const postData = postSnap.data() as Post;
    const currentLikes = postData.likes || [];

    if (currentLikes.includes(userId)) {
      // User already liked, so unlike
      await updateDoc(postRef, {
        likes: arrayRemove(userId)
      });
    } else {
      // User hasn't liked, so like
      await updateDoc(postRef, {
        likes: arrayUnion(userId)
      });
    }
  }
};

export const deletePost = async (postId: string) => {
  const postRef = doc(db, 'posts', postId);
  await deleteDoc(postRef);
};

export const updatePost = async (postId: string, data: Partial<Post>) => {
  const postRef = doc(db, 'posts', postId);
  await updateDoc(postRef, data);
};

export const getUsersByIds = async (uids: string[]): Promise<Record<string, UserProfile>> => {
  if (uids.length === 0) {
    return {};
  }
  
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('uid', 'in', uids));
  
  const querySnapshot = await getDocs(q);
  const users: Record<string, UserProfile> = {};
  querySnapshot.forEach(doc => {
    users[doc.id] = doc.data() as UserProfile;
  });
  
  return users;
};

export default app;
