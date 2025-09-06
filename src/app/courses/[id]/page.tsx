'use client';

import { use, useEffect, useState } from 'react';
import { doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Loading from '@/components/Loading';
import Comment from '@/components/Comment';
import { FiVolume2, FiChevronLeft, FiChevronRight, FiCheckCircle } from 'react-icons/fi';


interface Example {
    korean: string;
    english: string;
    pronunciation: string;
}

interface Lesson {
    lessonNumber: number;
    title: string;
    content: string;
    exampleSentences: Record<string, Example>;
    tip: string;
    image: string;
}

interface Course {
    id: string;
    title: string;
    description: string;
    level: string;
    category: string;
    duration: string;
    lessonsCount: number;
    image: string;
    progress: number;
    lessons: Lesson[];
}

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
    const [exampleImageUrls, setExampleImageUrls] = useState<Record<string, string>>({});

    const currentLesson = course?.lessons[currentLessonIndex];

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const courseDoc = await getDoc(doc(db, 'courses', id));
                if (!courseDoc.exists()) {
                    router.push('/courses');
                    return;
                }

                const courseData = courseDoc.data() as Omit<Course, 'id' | 'lessons'>;

                const lessonsQuery = query(
                    collection(db, 'courses', id, 'lessons'),
                    orderBy('lessonNumber', 'asc')
                );
                const lessonsSnapshot = await getDocs(lessonsQuery);
                const lessons: Lesson[] = lessonsSnapshot.docs.map(doc => doc.data() as Lesson);

                setCourse({
                    id: courseDoc.id,
                    ...courseData,
                    lessonsCount: lessons.length,
                    lessons
                });
            } catch (err) {
                console.error('Error fetching course:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [id, router]);

    // Effect to fetch images for example sentences
    useEffect(() => {
        if (currentLesson?.exampleSentences) {
            const fetchImages = async () => {
                const newImageUrls: Record<string, string> = {};
                for (const key in currentLesson.exampleSentences) {
                    const sentence = currentLesson.exampleSentences[key];
                    try {
                        const response = await fetch(`/api/pexels?query=${encodeURIComponent(sentence.english)}`);
                        if (response.ok) {
                            const data = await response.json();
                            if (data.imageUrl) {
                                newImageUrls[key] = data.imageUrl;
                            }
                        } else {
                            console.error(`Failed to fetch image for "${sentence.english}":`, response.statusText);
                        }
                    } catch (error) {
                        console.error(`Error fetching image for "${sentence.english}":`, error);
                    }
                }
                setExampleImageUrls(newImageUrls);
            };
            fetchImages();
        }
    }, [currentLesson]);

    const speakText = (text: string) => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ko-KR';
            speechSynthesis.speak(utterance);
        } else {
            alert('Your browser does not support Web Speech API.');
        }
    };

    if (loading) return <Loading />;
    if (!course || !currentLesson) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-gray-700">Course or Lesson Not Found</h2>
                    <p className="text-gray-500 mt-2">The content you are looking for does not exist.</p>
                </div>
            </div>
        );
    }

    const progressPercentage = ((currentLessonIndex + 1) / course.lessonsCount) * 100;

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 lg:px-8 py-8 max-w-7xl">
                {/* Header */}
                <header className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">{course.title}</h1>
                    <p className="text-lg text-gray-600 mb-4">{course.description}</p>
                    <div className="flex items-center gap-4">
                        <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">{course.level}</span>
                        <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">{course.category}</span>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <main className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            {/* Lesson Header */}
                            <div className="mb-6">
                                <h2 className="text-3xl font-bold text-gray-800">
                                    Lesson {currentLesson.lessonNumber}: {currentLesson.title}
                                </h2>
                                <p className="text-gray-600 mt-1">{currentLesson.content}</p>
                            </div>

                            {/* Example Sentences */}
                            {currentLesson.exampleSentences && (
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-semibold text-gray-700 border-b pb-2">Example Sentences</h3>
                                    {Object.entries(currentLesson.exampleSentences).map(([key, ex]) => (
                                        <div key={key} className="bg-gray-50 rounded-lg p-4 flex items-start gap-4 transition-shadow hover:shadow-lg">
                                            {exampleImageUrls[key] && (
                                                <img src={exampleImageUrls[key]} alt={ex.korean} className="w-32 h-32 object-cover rounded-md" />
                                            )}
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-lg font-semibold text-gray-800">{ex.korean}</p>
                                                    <button
                                                        onClick={() => speakText(ex.korean)}
                                                        className="p-2 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
                                                        aria-label="Play pronunciation"
                                                    >
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

                            {/* Tip Section */}
                            {currentLesson.tip && (
                                <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                                <h4 className="font-bold text-blue-800">💡 Tip</h4>
                                <p className="text-blue-700 mt-1">{currentLesson.tip}</p>
                                </div>
                            )}
                        </div>

                        {/* Navigation */}
                        <div className="mt-8 flex justify-between items-center">
                            <button
                                disabled={currentLessonIndex === 0}
                                onClick={() => setCurrentLessonIndex(prev => prev - 1)}
                                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                            >
                                <FiChevronLeft />
                                Previous
                            </button>
                            <span className="text-gray-700 font-medium">
                                {currentLessonIndex + 1} / {course.lessonsCount}
                            </span>
                            <button
                                disabled={currentLessonIndex === course.lessonsCount - 1}
                                onClick={() => setCurrentLessonIndex(prev => prev + 1)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                            >
                                Next
                                <FiChevronRight />
                            </button>
                        </div>
                    </main>

                    {/* Sidebar with Lesson List */}
                    <aside className="lg:col-span-1">
                        <div className="sticky top-8">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Course Lessons</h3>
                                {/* Progress Bar */}
                                <div className="mb-4">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-700">Progress</span>
                                        <span className="text-sm font-medium text-gray-700">{Math.round(progressPercentage)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                                    </div>
                                </div>

                                <ul className="space-y-2">
                                    {course.lessons.map((lesson, index) => (
                                        <li key={lesson.lessonNumber}>
                                            <button
                                                onClick={() => setCurrentLessonIndex(index)}
                                                className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 ${currentLessonIndex === index
                                                        ? 'bg-blue-100 text-blue-800 font-semibold'
                                                        : 'hover:bg-gray-100 text-gray-700'
                                                    }`}
                                            >
                                                <div className="flex-shrink-0">
                                                    {currentLessonIndex > index ? (
                                                        <FiCheckCircle className="text-green-500" />
                                                    ) : (
                                                        <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs ${currentLessonIndex === index ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
                                                            {index + 1}
                                                        </span>
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

                {/* Comments Section */}
                <div className="mt-12">
                    <Comment courseId={course.id} lessonId={currentLesson.lessonNumber.toString()} />
                </div>
            </div>
        </div>
    );
}
