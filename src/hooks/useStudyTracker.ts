
import { useEffect } from 'react';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from 'firebase/auth';
import { UserProfile } from './useAuth';

const getYYYYMMDD = (date: Date) => {
    return date.toISOString().split('T')[0];
}

export function useStudyTracker(user: User | null, userProfile: UserProfile | null, loading: boolean) {
    useEffect(() => {
        if (loading || !user || !userProfile) return;

        const startTime = Date.now();

        return () => {
            const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);
            if (elapsedSeconds > 5) { // Min duration to count as a session
                const userRef = doc(db, 'users', user.uid);
                const today = getYYYYMMDD(new Date());

                const updates: any = {
                    totalStudySeconds: increment(elapsedSeconds)
                };

                if (today !== userProfile.lastActivityDate) {
                    const yesterday = getYYYYMMDD(new Date(Date.now() - 86400000));
                    updates.streak = userProfile.lastActivityDate === yesterday ? increment(1) : 1;
                    updates.lastActivityDate = today;
                }

                updateDoc(userRef, updates).catch(console.error);
            }
        };
    }, [loading, user, userProfile]);
}
