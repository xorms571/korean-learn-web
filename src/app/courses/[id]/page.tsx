'use client';

import { use, useEffect, useState, useCallback } from 'react';
import { doc, getDoc, collection, getDocs, query, orderBy, setDoc, serverTimestamp, arrayUnion, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Loading from '@/components/Loading';
import Comment from '@/components/Comment';
import Quiz from '@/components/Quiz';
import { FiVolume2, FiChevronLeft, FiChevronRight, FiCheckCircle, FiAward } from 'react-icons/fi';

// --- Helper function to get date in YYYY-MM-DD format ---
const getYYYYMMDD = (date: Date) => {
    return date.toISOString().split('T')[0];
}

// --- Interfaces ---
interface Example { korean: string; english: string; pronunciation: string; }
interface Lesson { lessonNumber: number; title: string; content: string; exampleSentences: Record<string, Example>; tip: string; image: string; }
interface Course { id: string; title: string; description: string; level: string; category: string; duration: string; lessonsCount: number; image: string; lessons: Lesson[]; }
interface CourseProgress { progress: number; completedLessons: number[]; lastCompletedLesson: number | null; isCompleted?: boolean; }

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { user, userProfile, loading: authLoading } = useAuth();

    // --- State Management ---
    const [course, setCourse] = useState<Course | null>(null);
    const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(null);
    const [loading, setLoading] = useState(true);
    const [imageLoading, setImageLoading] = useState(true);
    const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
    const [exampleImageUrls, setExampleImageUrls] = useState<Record<string, string>>({});
    const [isQuizActive, setIsQuizActive] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const currentLesson = course?.lessons[currentLessonIndex];

    // --- Data Fetching Effect ---
    useEffect(() => {
        /* if (authLoading || !user) {
            if (!authLoading) router.replace('/login');
            return;
        } */

        const fetchCourseAndProgress = async () => {
            try {
                const courseDoc = await getDoc(doc(db, 'courses', id));
                if (!courseDoc.exists()) { router.push('/courses'); return; }
                const courseData = courseDoc.data() as Omit<Course, 'id' | 'lessons'>;

                const lessonsQuery = query(collection(db, 'courses', id, 'lessons'), orderBy('lessonNumber', 'asc'));
                const lessonsSnapshot = await getDocs(lessonsQuery);
                const lessons: Lesson[] = lessonsSnapshot.docs.map(doc => doc.data() as Lesson);
                const courseDetails = { id: courseDoc.id, ...courseData, lessonsCount: lessons.length, lessons };
                setCourse(courseDetails);

                if (!user) return;
                const progressRef = doc(db, 'user_progress', user.uid, 'enrolled_courses', id);
                const progressSnap = await getDoc(progressRef);
                if (progressSnap.exists()) {
                    const progressData = progressSnap.data() as CourseProgress;
                    setCourseProgress(progressData);
                    const lastLessonNumber = progressData.lastCompletedLesson;
                    const initialIndex = lastLessonNumber ? lessons.findIndex(l => l.lessonNumber === lastLessonNumber) : 0;
                    setCurrentLessonIndex(initialIndex >= 0 ? initialIndex : 0);
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
    }, [id, router, user, authLoading]);

    // --- Image Fetching Effect ---
    useEffect(() => {
        // When lesson changes, clear the images from the previous lesson.
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
                                setExampleImageUrls(prev => ({...prev, [key]: data.imageUrl}));
                            }
                        }
                    } catch (error) {
                        console.error(`Error fetching image for "${sentence.english}"`, error);
                    }
                    // Add a delay between requests
                    await new Promise(resolve => setTimeout(resolve, 300)); // 300ms delay
                }
            };
            fetchImages();
        }
    }, [currentLesson]);

    // --- Study Time Tracking & Streak Update Effect ---
    useEffect(() => {
        if (authLoading || loading || !user || !userProfile) return;

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
    }, [authLoading, loading, user, userProfile]);

    // --- Progress Update Effect ---
    const updateProgress = useCallback(() => {
        if (isInitialLoad || authLoading || loading || !user || !userProfile || !course || !currentLesson || courseProgress?.isCompleted) {
            return;
        }

        const lessonNumber = currentLesson.lessonNumber;
        const progressRef = doc(db, 'user_progress', user.uid, 'enrolled_courses', course.id);

        setCourseProgress(prevProgress => {
            if (!prevProgress) return null;
            const completed = prevProgress.completedLessons || [];
            const updatedCompletedLessons = [...completed];
            if (!updatedCompletedLessons.includes(lessonNumber)) {
                updatedCompletedLessons.push(lessonNumber);
            }

            const newProgressPayload: CourseProgress = {
                ...prevProgress,
                completedLessons: updatedCompletedLessons,
                lastCompletedLesson: lessonNumber,
                progress: Math.round((updatedCompletedLessons.length / course.lessonsCount) * 100),
            };

            setDoc(progressRef, {
                lastCompletedLesson: lessonNumber,
                completedLessons: arrayUnion(lessonNumber),
                progress: newProgressPayload.progress,
                lastAccessed: serverTimestamp(),
            }, { merge: true }).catch(console.error);

            return newProgressPayload;
        });

    }, [authLoading, loading, user, userProfile, course, currentLesson, isInitialLoad, courseProgress?.isCompleted]);

    useEffect(() => {
        if (!loading && !isInitialLoad) {
            updateProgress();
        }
        if (!loading && isInitialLoad) {
            setIsInitialLoad(false);
        }
    }, [currentLessonIndex, loading, isInitialLoad, updateProgress]);

    // --- Event Handlers ---
    const speakText = (text: string) => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ko-KR';
            const voices = speechSynthesis.getVoices();
            const koreanVoice = voices.find(voice => voice.lang === 'ko-KR');
            if (koreanVoice) {
                utterance.voice = koreanVoice;
            }
            speechSynthesis.cancel();
            speechSynthesis.speak(utterance);
        } else {
            alert('Your browser does not support Web Speech API.');
        }
    };

    const handleSetLesson = (index: number) => {
        setIsQuizActive(false);
        setCurrentLessonIndex(index);
    }

    // --- Render Logic ---
    if (loading || authLoading) return <Loading />;
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

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 lg:px-8 py-8 max-w-7xl">
                <header className="mb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-800 mb-2">{course.title}</h1>
                            <p className="text-lg text-gray-600 mb-4">{course.description}</p>
                        </div>
                        {courseProgress?.isCompleted && (
                            <div className="flex items-center gap-2 bg-yellow-400 text-white font-bold px-4 py-2 rounded-lg shadow-lg">
                                <FiAward />
                                <span>Course Completed!</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                        <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">{course.level}</span>
                        <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">{course.category}</span>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <main className="lg:col-span-2">
                        {isQuizActive ? (
                            <Quiz lessons={course.lessons} courseId={course.id} onQuizFinish={() => setIsQuizActive(false)} />
                        ) : (
                            <>
                                {currentLesson ? (
                                    <div className="md:bg-white rounded-lg md:shadow-md md:p-6">
                                        <div className="mb-6">
                                            <h2 className="text-3xl font-bold text-gray-800">Lesson {currentLesson.lessonNumber}: {currentLesson.title}</h2>
                                            <p className="text-gray-600 mt-1">{currentLesson.content}</p>
                                        </div>
                                        {currentLesson.exampleSentences && (
                                            <div className="space-y-6">
                                                <h3 className="text-2xl font-semibold text-gray-700 border-b pb-2">Example Sentences</h3>
                                                {Object.entries(currentLesson.exampleSentences).map(([key, ex]) => (
                                                    <div key={key} className="bg-gray-50 rounded-lg p-2 md:p-4 flex items-center md:items-start gap-4 transition-shadow hover:shadow-lg">
                                                        <div className='w-20 h-20 md:w-32 md:h-32 bg-slate-100 rounded-md overflow-hidden flex justify-center items-center'>
                                                            {exampleImageUrls[key] ? 
                                                                <img src={exampleImageUrls[key]} alt={ex.korean} className="w-full h-full object-cover fade-in-image" /> :
                                                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                                            }
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-lg font-semibold text-gray-800">{ex.korean}</p>
                                                                <button onClick={() => speakText(ex.korean)} className="p-2 rounded-full text-gray-600 hover:bg-gray-200 transition-colors" aria-label="Play pronunciation">
                                                                    <FiVolume2 size={20} />
                                                                </button>
                                                            </div>
                                                            <p className="text-md text-gray-600">{ex.english}</p>
                                                            <p className="text-sm text-gray-500 mt-1 italic">{ex.pronunciation}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {currentLesson.tip && (
                                            <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                                                <h4 className="font-bold text-blue-800">💡 Tip</h4>
                                                <p className="text-blue-700 mt-1">{currentLesson.tip}</p>
                                            </div>
                                        )}
                                        {hasEnoughExamplesForQuiz && (
                                            <div className="mt-8 border-t pt-6 text-center">
                                                <h3 className="text-xl font-bold text-gray-800">Ready to test your knowledge?</h3>
                                                <p className="text-gray-600 my-2">Take a short quiz based on the examples in this course.</p>
                                                <button onClick={() => setIsQuizActive(true)} className="mt-2 px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-transform transform hover:scale-105">
                                                    Start Quiz
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : <p>Lesson not found.</p>}
                                <div className="mt-8 flex justify-between items-center">
                                    <button disabled={currentLessonIndex === 0} onClick={() => setCurrentLessonIndex(prev => prev - 1)} className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors">
                                        <FiChevronLeft /> Previous
                                    </button>
                                    <span className="text-gray-700 font-medium">{currentLessonIndex + 1} / {course.lessonsCount}</span>
                                    <button disabled={currentLessonIndex === course.lessonsCount - 1} onClick={() => setCurrentLessonIndex(prev => prev + 1)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors">
                                        Next <FiChevronRight />
                                    </button>
                                </div>
                            </>
                        )}
                    </main>
                    <aside className="lg:col-span-1">
                        <div className="sticky top-8">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Course Lessons</h3>
                                <div className="mb-4">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-700">Progress</span>
                                        <span className="text-sm font-medium text-gray-700">{progressPercentage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                                    </div>
                                </div>
                                <ul className="space-y-2">
                                    {course.lessons.map((lesson, index) => (
                                        <li key={lesson.lessonNumber}>
                                            <button onClick={() => handleSetLesson(index)} className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 ${currentLessonIndex === index && !isQuizActive ? 'bg-blue-100 text-blue-800 font-semibold' : 'hover:bg-gray-100 text-gray-700'}`}>
                                                <div className="flex-shrink-0">
                                                    {courseProgress?.completedLessons?.includes(lesson.lessonNumber) ? (
                                                        <FiCheckCircle className="text-green-500" />
                                                    ) : (
                                                        <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs ${currentLessonIndex === index && !isQuizActive ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>{index + 1}</span>
                                                    )}
                                                </div>
                                                <span>{lesson.title}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </aside>
                </div>
                {course && currentLesson && !isQuizActive && (
                    <div className="mt-12">
                        <Comment courseId={course.id} lessonId={currentLesson.lessonNumber.toString()} />
                    </div>
                )}
            </div>
        </div>
    );
}
