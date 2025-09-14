import { useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth, UserProfile } from '@/hooks/useAuth';
import { EnrolledCourse } from '@/hooks/useProgress';

export function useUserLevel(enrolledCourses: EnrolledCourse[], userProfile: UserProfile | null) {
    const { user } = useAuth();

    useEffect(() => {
        const updateUserLevel = async () => {
            if (!user || !userProfile || enrolledCourses.length === 0) {
                return;
            }

            try {
                const userRef = doc(db, 'users', user.uid);
                const currentLevel = userProfile.currentLevel;

                const LEVEL_ORDER = ['beginner', 'intermediate', 'advanced'];
                const levelParts = currentLevel.toLowerCase().split(' ');
                const currentMainLevel = levelParts[0];

                const coursesForCurrentLevel = enrolledCourses.filter(
                    (course) => course.level.toLowerCase() === currentMainLevel
                );

                if (coursesForCurrentLevel.length === 0) {
                    return;
                }

                const totalProgress = coursesForCurrentLevel.reduce((sum, course) => sum + course.progress, 0);
                const completionPercentage = totalProgress / coursesForCurrentLevel.length;

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
    }, [user, userProfile, enrolledCourses]);
}