
import { useEffect, useState } from 'react';
import { collection, getDocs, doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

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

export function useCourses(courseType: 'sentence' | 'word') {
    const { user, loading: authLoading } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [userProgress, setUserProgress] = useState<Record<string, UserProgress>>({});
    const [courseLoading, setCourseLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchCoursesAndProgress = async () => {
            try {
                const collectionName = courseType === 'sentence' ? 'courses' : 'word_courses';
                const coursesSnapshot = await getDocs(collection(db, collectionName));
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
    }, [user, authLoading, courseType]);

    const handleStartOrContinue = async (courseId: string) => {
        router.push(`/courses/${courseType}/${courseId}`);
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

    return { user, authLoading, courses, userProgress, courseLoading, handleStartOrContinue, setUserProgress };
}
