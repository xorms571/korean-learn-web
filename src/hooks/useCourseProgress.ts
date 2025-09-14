
import { useCallback, useEffect, useState, Dispatch, SetStateAction } from 'react';
import { doc, setDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from 'firebase/auth';
import { Course, CourseProgress } from '@/types/course';
import { Lesson } from '@/types/quiz';

export function useCourseProgress(course: Course | null, currentLesson: Lesson | undefined, user: User | null, courseProgress: CourseProgress | null, setCourseProgress: Dispatch<SetStateAction<CourseProgress | null>>, loading: boolean) {
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const updateProgress = useCallback(() => {
        if (isInitialLoad || loading || !user || !course || !currentLesson || courseProgress?.isCompleted) {
            return;
        }

        const lessonNumber = currentLesson.lessonNumber;
        const progressRef = doc(db, 'user_progress', user.uid, 'enrolled_courses', course.id);

        setCourseProgress(
            (prevProgress) => {
                if (!prevProgress) return prevProgress;
                const completed = prevProgress.completedLessons || [];
                const updatedCompletedLessons = [...completed];
                if (!updatedCompletedLessons.includes(lessonNumber)) {
                    updatedCompletedLessons.push(lessonNumber);
                }

                const newProgressPayload: CourseProgress = {
                    ...prevProgress,
                    completedLessons: updatedCompletedLessons,
                    lastCompletedLesson: lessonNumber,
                    progress: Math.round(((updatedCompletedLessons.length / course.lessonsCount) * 100) * 10) / 10,
                };

                setDoc(progressRef, {
                    lastCompletedLesson: lessonNumber,
                    completedLessons: arrayUnion(lessonNumber),
                    progress: newProgressPayload.progress,
                    lastAccessed: serverTimestamp(),
                }, { merge: true }).catch(console.error);

                return newProgressPayload;
            }
        );

    }, [loading, user, course, currentLesson, isInitialLoad, courseProgress?.isCompleted, setCourseProgress]);

    useEffect(() => {
        if (!loading && !isInitialLoad) {
            updateProgress();
        }
        if (!loading && isInitialLoad) {
            setIsInitialLoad(false);
        }
    }, [currentLesson, loading, isInitialLoad, updateProgress]);

    return { isInitialLoad, setIsInitialLoad };
}
