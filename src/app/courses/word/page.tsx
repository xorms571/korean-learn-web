'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import Loading from '@/components/Loading';
import { FiAward } from 'react-icons/fi';
import CoursesList from '@/components/CoursesList';

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  category: string;
  duration: string;
  lessons: number;
  image: string;
  progress: number;
  isCompleted?: boolean;
}

interface UserProgress {
  progress: number;
  isCompleted?: boolean;
  completedLessons?: number[];
  lastCompletedLesson?: number | null;
}

export default function WordCoursesPage() {
  const { user, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, UserProgress>>({});
  const [courseLoading, setCourseLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [courseImageUrls, setCourseImageUrls] = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    /* if (authLoading) return;

    if (!user) {
      router.replace('/login');
      return;
    } */

    const fetchCoursesAndProgress = async () => {
      try {
        const coursesSnapshot = await getDocs(collection(db, 'word_courses'));
        const courseData: Course[] = coursesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Course[];
        setCourses(courseData);

        if (user) {
          const progressSnapshot = await getDocs(collection(db, 'user_progress', user.uid, 'enrolled_courses'));
          const progressData: Record<string, UserProgress> = {};
          progressSnapshot.forEach(doc => {
            progressData[doc.id] = doc.data() as UserProgress;
          });
          setUserProgress(progressData);
        }

      } catch (error) {
        console.error("Error fetching courses or progress:", error);
      } finally {
        setCourseLoading(false);
      }
    };

    fetchCoursesAndProgress();
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchImages = async () => {
      for (const course of courses) {
        // Avoid refetching if image already exists
        if (courseImageUrls[course.id]) continue;

        try {
          const response = await fetch(
            `/api/pexels?query=${encodeURIComponent(course.title)}`
          );
          if (response.ok) {
            const data = await response.json();
            if (data.imageUrl) {
              setCourseImageUrls(prev => ({ ...prev, [course.id]: data.imageUrl }));
            }
          }
        } catch (error) {
          console.error(`Error fetching image for "${course.title}":`, error);
        }
        // Add a delay between requests to avoid hitting rate limits
        await new Promise(resolve => setTimeout(resolve, 300)); // 300ms delay
      }
    };

    if (courses.length > 0) {
      fetchImages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses]);

  const coursesWithProgress = useMemo(() => {
    return courses.map(course => ({
      ...course,
      progress: userProgress[course.id]?.progress ?? 0,
      isCompleted: userProgress[course.id]?.isCompleted ?? false,
    }));
  }, [courses, userProgress]);

  useEffect(() => {
    const updateUserLevel = async () => {
      if (!user || coursesWithProgress.length === 0) {
        return;
      }

      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          console.log("User document does not exist, cannot update level.");
          return;
        }

        const userData = userSnap.data();
        const currentLevel = userData?.currentLevel || 'Beginner 0';

        const LEVEL_ORDER = ['beginner', 'intermediate', 'advanced'];
        const levelParts = currentLevel.toLowerCase().split(' ');
        const currentMainLevel = levelParts[0];

        const coursesForCurrentLevel = coursesWithProgress.filter(
          (course) => course.level.toLowerCase() === currentMainLevel
        );

        if (coursesForCurrentLevel.length === 0) {
          return;
        }

        const completedCourses = coursesForCurrentLevel.filter(
          (course) => course.isCompleted
        ).length;

        const completionPercentage = (completedCourses / coursesForCurrentLevel.length) * 100;

        let newLevel;

        if (completionPercentage >= 100) {
          const currentLevelIndex = LEVEL_ORDER.indexOf(currentMainLevel);
          const nextLevelIndex = currentLevelIndex + 1;

          if (nextLevelIndex < LEVEL_ORDER.length) {
            const nextMainLevel = LEVEL_ORDER[nextLevelIndex];
            newLevel = `${nextMainLevel.charAt(0).toUpperCase() + nextMainLevel.slice(1)} 0`;
          } else {
            newLevel = `${currentMainLevel.charAt(0).toUpperCase() + currentMainLevel.slice(1)} 10`;
          }
        } else {
          const newSubLevel = Math.floor(completionPercentage / 10);
          newLevel = `${currentMainLevel.charAt(0).toUpperCase() + currentMainLevel.slice(1)} ${newSubLevel}`;
        }

        if (newLevel !== currentLevel) {
          await setDoc(userRef, { currentLevel: newLevel }, { merge: true });
        }
      } catch (error) {
        console.error("Error updating user level:", error);
      }
    };

    updateUserLevel();
  }, [user, coursesWithProgress]);

  const handleStartOrContinue = async (courseId: string) => {
    /* if (!user) {
        router.push('/login');
        return;
    } */
    router.push(`/courses/word/${courseId}`);
    if (!user) return;
    const progressRef = doc(db, 'user_progress', user.uid, 'enrolled_courses', courseId);

    try {
      const docSnap = await getDoc(progressRef);
      if (!docSnap.exists()) {
        const initialProgress = {
          progress: 0,
          completedLessons: [],
          lastCompletedLesson: null,
          isCompleted: false,
          startedAt: serverTimestamp(),
          lastAccessed: serverTimestamp(),
        };
        await setDoc(progressRef, initialProgress);
        setUserProgress(prev => ({ ...prev, [courseId]: initialProgress }));
      }
    } catch (error) {
      console.error("Error enrolling in course: ", error);
    }
  };

  const levels = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'conversation', label: 'Conversation' },
    { value: 'grammar', label: 'Grammar' },
    { value: 'travel', label: 'Travel' },
    { value: 'business', label: 'Business' },
    { value: 'food', label: 'Food' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'alphabet', label: 'Alphabet' },
    { value: 'numbers', label: 'Numbers' }
  ];

  const filteredCourses = coursesWithProgress.filter(course => {
    if (selectedLevel !== 'all' && course.level.toLowerCase() !== selectedLevel) return false;
    if (selectedCategory !== 'all' && course.category.toLowerCase() !== selectedCategory) return false;
    return true;
  });

  const getLevelLabel = (level: string) => levels.find(l => l.value === level.toLowerCase())?.label || level;
  const getCategoryLabel = (category: string) => categories.find(c => c.value === category.toLowerCase())?.label || category;

  if (/* authLoading || */ courseLoading) return <Loading />;
  //if (!user) return <Loading />;
  const props = {
    FiAward,
    categories,
    courseImageUrls,
    filteredCourses,
    getCategoryLabel,
    getLevelLabel,
    levels,
    selectedCategory,
    selectedLevel,
    setSelectedLevel,
    handleStartOrContinue,
    setSelectedCategory
  }
  return (
    <CoursesList {...props} />
  );
}