
'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Loading from '@/components/Loading';
import CourseDetail from '@/components/CourseDetail';
import { useAuth } from '@/hooks/useAuth';
import { useCourse } from '@/hooks/useCourse';
import { useStudyTracker } from '@/hooks/useStudyTracker';
import { useCourseProgress } from '@/hooks/useCourseProgress';

export default function WordCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { user, userProfile, loading: authLoading } = useAuth();

    const { course, courseProgress, loading: courseLoading, setCourseProgress } = useCourse(id, user, 'word');
    const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
    const [exampleImageUrls, setExampleImageUrls] = useState<Record<string, string>>({});
    const [isQuizActive, setIsQuizActive] = useState(false);

    const currentLesson = course?.lessons[currentLessonIndex];

    useStudyTracker(user, userProfile, courseLoading || authLoading);
    useCourseProgress(course, currentLesson, user, courseProgress, setCourseProgress, courseLoading || authLoading);

    useEffect(() => {
        if (!courseLoading && !course) {
            router.push('/courses/word');
        }
    }, [course, courseLoading, router]);

    useEffect(() => {
        setExampleImageUrls({});

        if (currentLesson?.exampleSentences) {
            const fetchImages = async () => {
                for (const key in currentLesson.exampleSentences) {
                    const sentence = currentLesson.exampleSentences[key];
                    try {
                        const response = await fetch(`/api/pexels?query=${encodeURIComponent(sentence.english)}`);
                        if (response.ok) {
                            const data = await response.json();
                            if (data.imageUrl) {
                                setExampleImageUrls(prev => ({ ...prev, [key]: data.imageUrl }));
                            }
                        }
                    } catch (error) {
                        console.error(`Error fetching image for "${sentence.english}"`, error);
                    }
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
            };
            fetchImages();
        }
    }, [currentLesson]);

    const handleSetLesson = (index: number) => {
        setIsQuizActive(false);
        setCurrentLessonIndex(index);
    }

    if (courseLoading || authLoading) return <Loading />;
    if (!course) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-gray-700">Course Not Found</h2>
                    <p className="text-gray-500 mt-2">The content you are looking for does not exist.</p>
                </div>
            </div>
        );
    }

    const progressPercentage = courseProgress ? courseProgress.progress : 0;
    const hasEnoughExamplesForQuiz = course.lessons.flatMap(l => l.exampleSentences ? Object.values(l.exampleSentences) : []).length >= 4;

    const props = { course, courseProgress, currentLessonIndex, progressPercentage, setIsQuizActive, setCurrentLessonIndex, handleSetLesson, isQuizActive, currentLesson, exampleImageUrls, hasEnoughExamplesForQuiz }
    return (
        <CourseDetail {...props}/>
    );
}
