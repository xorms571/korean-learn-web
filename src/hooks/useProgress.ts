import { useState, useEffect } from "react";
import { collection, doc, getDoc, getDocs, orderBy, query, limit, updateDoc } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { FiAward } from "react-icons/fi";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export interface EnrolledCourse {
    id: string;
    title: string;
    description: string;
    progress: number;
    isCompleted: boolean;
    category: string;
    level: string;
}

export interface ProgressOverview {
    totalCompletedLessons: number;
    totalEnrolledLessons: number;
}

export interface AchievementType {
    id: string;
    title: string;
    description: string;
    icon: typeof FiAward;
    unlocked: boolean;
}

export const useProgress = () => {
    const { user, userProfile, loading: authLoading } = useAuth();
    const router = useRouter();

    const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
    const [progressOverview, setProgressOverview] = useState<ProgressOverview>({
        totalCompletedLessons: 0,
        totalEnrolledLessons: 0,
    });
    const [achievements, setAchievements] = useState<AchievementType[]>([]);
    const [dataLoading, setDataLoading] = useState(true);

    const formatStudyTime = (totalSeconds: number): string => {
        if (!totalSeconds || totalSeconds <= 0) return '0m';
    
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
    
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
    
        if (minutes > 0) {
            return `${minutes}m`;
        }
    
        return '< 1m';
    };

    // 1. 대시보드 데이터 불러오기
    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push("/login");
            return;
        }

        const fetchDashboardData = async () => {
            try {
                const progressQuery = query(
                    collection(db, "user_progress", user.uid, "enrolled_courses"),
                    orderBy("lastAccessed", "desc")
                );
                const progressSnapshot = await getDocs(progressQuery);

                let totalCompleted = 0;
                let totalEnrolled = 0;

                const coursesData = await Promise.all(
                    progressSnapshot.docs.map(async (progressDoc) => {
                        const courseId = progressDoc.id;
                        const progressData = progressDoc.data();

                        let courseDoc = await getDoc(doc(db, "courses", courseId));
                        if (!courseDoc.exists()) {
                            courseDoc = await getDoc(doc(db, "word_courses", courseId));
                        }

                        if (courseDoc.exists()) {
                            const courseData = courseDoc.data();
                            totalCompleted += progressData.completedLessons?.length || 0;
                            totalEnrolled += courseData.lessonsCount || 0;

                            return {
                                id: courseId,
                                title: courseData.title,
                                description: courseData.description,
                                progress: progressData.progress || 0,
                                isCompleted: progressData.isCompleted || false,
                                category: courseData.category,
                                level: courseData.level,
                            };
                        }
                        return null;
                    })
                );

                                setEnrolledCourses(coursesData.filter((c) => c !== null) as EnrolledCourse[]);
                setProgressOverview({
                    totalCompletedLessons: totalCompleted,
                    totalEnrolledLessons: totalEnrolled,
                });

                // Update totalIndividualLessonsCompleted in user's main document
                if (user) {
                    const userRef = doc(db, 'users', user.uid);
                    await updateDoc(userRef, {
                        totalIndividualLessonsCompleted: totalCompleted
                    }).catch(console.error);
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setDataLoading(false);
            }
        };

        fetchDashboardData();
    }, [user, authLoading, router]);

    // 2. 업적 계산
    useEffect(() => {
        if (!dataLoading && userProfile && progressOverview) {
            const baseAchievements: Omit<AchievementType, "unlocked">[] = [
                { id: "first-lesson", title: "First Step", description: "Complete your first lesson.", icon: FiAward },
                { id: "lessons-10", title: "Lesson Novice", description: "Complete 10 lessons.", icon: FiAward },
                { id: "lessons-50", title: "Lesson Apprentice", description: "Complete 50 lessons.", icon: FiAward },
                { id: "lessons-100", title: "Lesson Master", description: "Complete 100 lessons.", icon: FiAward },
                { id: "first-course", title: "Course Graduate", description: "Complete your first course.", icon: FiAward },
                { id: "courses-5", title: "Course Veteran", description: "Complete 5 courses.", icon: FiAward },
                { id: "streak-7", title: "Consistent Learner", description: "Maintain a 7-day study streak.", icon: FiAward },
                { id: "streak-30", title: "Habit Builder", description: "Maintain a 30-day study streak.", icon: FiAward },
                { id: "time-10h", title: "Dedicated Student", description: "Study for over 10 hours.", icon: FiAward },
                { id: "time-50h", title: "Time Keeper", description: "Study for over 50 hours.", icon: FiAward },
                { id: "time-100h", title: "Time Lord", description: "Study for over 100 hours.", icon: FiAward },
            ];

            const processedAchievements: AchievementType[] = baseAchievements.map((ach) => {
                let unlocked = false;
                switch (ach.id) {
                    case "first-lesson":
                        unlocked = progressOverview.totalCompletedLessons > 0;
                        break;
                    case "lessons-10":
                        unlocked = progressOverview.totalCompletedLessons >= 10;
                        break;
                    case "lessons-50":
                        unlocked = progressOverview.totalCompletedLessons >= 50;
                        break;
                    case "lessons-100":
                        unlocked = progressOverview.totalCompletedLessons >= 100;
                        break;
                    case "first-course":
                        unlocked = enrolledCourses.some((c) => c.isCompleted);
                        break;
                    case "courses-5":
                        unlocked = enrolledCourses.filter((c) => c.isCompleted).length >= 5;
                        break;
                    case "streak-7":
                        unlocked = userProfile.streak >= 7;
                        break;
                    case "streak-30":
                        unlocked = userProfile.streak >= 30;
                        break;
                    case "time-10h":
                        unlocked = userProfile.totalStudySeconds >= 36000;
                        break;
                    case "time-50h":
                        unlocked = userProfile.totalStudySeconds >= 180000;
                        break;
                    case "time-100h":
                        unlocked = userProfile.totalStudySeconds >= 360000;
                        break;
                }
                return { ...ach, unlocked };
            });

            setAchievements(processedAchievements);
        }
    }, [dataLoading, userProfile, progressOverview, enrolledCourses]);

    return {
        enrolledCourses,
        progressOverview,
        achievements,
        dataLoading,
        user,
        authLoading,
        userProfile,
        db,
        formatStudyTime,
        FiAward,
        collection,
        query,
        orderBy,
        limit,
        getDocs
    };
};