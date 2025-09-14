
import { useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';

interface Course {
  id: string;
  level: string;
  isCompleted?: boolean;
}

export function useUserLevel(coursesWithProgress: Course[]) {
    const { user } = useAuth();

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
}
