import { useEffect, useState } from 'react';
import { doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Course, CourseProgress } from '@/types/course';
import { Lesson } from '@/types/quiz';
import { User } from 'firebase/auth';

export function useCourse(id: string, user: User | null, courseType: 'sentence' | 'word') {
    const [course, setCourse] = useState<Course | null>(null);
    const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourseAndProgress = async () => {
            try {
                const collectionName = courseType === 'sentence' ? 'courses' : 'word_courses';
                const courseDoc = await getDoc(doc(db, collectionName, id));
                if (!courseDoc.exists()) {
                    setCourse(null);
                    return;
                }
                const courseData = courseDoc.data() as Omit<Course, 'id' | 'lessons'>;

                const lessonsQuery = query(collection(db, collectionName, id, 'lessons'), orderBy('lessonNumber', 'asc'));
                const lessonsSnapshot = await getDocs(lessonsQuery);
                const lessons: Lesson[] = lessonsSnapshot.docs.map(doc => doc.data() as Lesson);
                const courseDetails = { id: courseDoc.id, ...courseData, lessonsCount: lessons.length, lessons };
                setCourse(courseDetails);

                if (!user) return;
                const progressRef = doc(db, 'user_progress', user.uid, 'enrolled_courses', id);
                const progressSnap = await getDoc(progressRef);
                if (progressSnap.exists()) {
                    setCourseProgress(progressSnap.data() as CourseProgress);
                } else {
                    setCourseProgress({ progress: 0, completedLessons: [], lastCompletedLesson: null, isCompleted: false });
                }
            } catch (err) {
                console.error('Error fetching course and progress:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCourseAndProgress();
    }, [id, user, courseType]);

    return { course, courseProgress, loading, setCourseProgress };
}