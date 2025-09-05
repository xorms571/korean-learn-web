'use client';

import { use, useEffect, useState } from 'react';
import { doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Loading from '@/components/Loading';
import Image from 'next/image';
import Comment from '@/components/Comment';

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

    // Derived state for currentLesson
    const currentLesson = course?.lessons[currentLessonIndex];

    // Effect to fetch course and lessons
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

    const [courseImageUnsplashUrl, setCourseImageUnsplashUrl] = useState<string | null>(null);
    const [lessonImageUnsplashUrl, setLessonImageUnsplashUrl] = useState<string | null>(null);

    // Effect to fetch images for example sentences
    useEffect(() => {
        if (currentLesson?.exampleSentences) {
            const fetchImages = async () => {
                const newImageUrls: Record<string, string> = {};
                for (const key in currentLesson.exampleSentences) {
                    const sentence = currentLesson.exampleSentences[key];
                    try {
                        const response = await fetch(`/api/unsplash?query=${encodeURIComponent(sentence.korean)}`);
                        if (response.ok) {
                            const data = await response.json();
                            if (data.imageUrl) {
                                newImageUrls[key] = data.imageUrl;
                            }
                        } else {
                            console.error(`Failed to fetch image for "${sentence.korean}":`, response.statusText);
                        }
                    } catch (error) {
                        console.error(`Error fetching image for "${sentence.korean}":`, error);
                    }
                }
                setExampleImageUrls(newImageUrls);
            };
            fetchImages();
        }
    }, [currentLesson]); // Re-fetch images when currentLesson changes

    // Effect to fetch course image
    useEffect(() => {
        if (course?.title) {
            const fetchCourseImage = async () => {
                try {
                    const response = await fetch(`/api/unsplash?query=${encodeURIComponent(course.title)}`);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.imageUrl) {
                            setCourseImageUnsplashUrl(data.imageUrl);
                        } else {
                            // No image found, set to null to indicate no Unsplash image
                            setCourseImageUnsplashUrl(null);
                        }
                    } else {
                        console.error(`Failed to fetch course image for "${course.title}":`, response.statusText);
                        setCourseImageUnsplashUrl(null); // Set to null on error
                    }
                } catch (error) {
                    console.error(`Error fetching course image for "${course.title}":`, error);
                    setCourseImageUnsplashUrl(null); // Set to null on error
                }
            };
            fetchCourseImage();
        }
    }, [course?.title]); // Re-fetch when course title changes

    // Effect to fetch current lesson image
    useEffect(() => {
        if (currentLesson?.title) {
            const fetchLessonImage = async () => {
                try {
                    const response = await fetch(`/api/unsplash?query=${encodeURIComponent(currentLesson.title)}`);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.imageUrl) {
                            setLessonImageUnsplashUrl(data.imageUrl);
                        } else {
                            // No image found, set to null to indicate no Unsplash image
                            setLessonImageUnsplashUrl(null);
                        }
                    } else {
                        console.error(`Failed to fetch lesson image for "${currentLesson.title}":`, response.statusText);
                        setLessonImageUnsplashUrl(null); // Set to null on error
                    }
                } catch (error) {
                    console.error(`Error fetching lesson image for "${currentLesson.title}":`, error);
                    setLessonImageUnsplashUrl(null); // Set to null on error
                }
            };
            fetchLessonImage();
        }
    }, [currentLesson?.title]); // Re-fetch when current lesson title changes

    // Function to speak text using Web Speech API
    const speakText = (text: string) => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ko-KR'; // Set language to Korean
            speechSynthesis.speak(utterance);
        } else {
            alert('Your browser does not support Web Speech API.');
        }
    };

    if (loading) return <Loading />;
    if (!course) return <p className="p-8">Course not found</p>;
    // If currentLesson is undefined here, it means course was fetched but lessons might be empty or index is out of bounds
    if (!currentLesson) return <p className="p-8">Lesson not found</p>;


    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl h-full mx-auto p-8 text-gray-700">
                <div className='flex flex-row-reverse justify-end items-center gap-5 mb-8'>
                    <div>
                        {/* Course Header */}
                        <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
                        {/* Course Description */}
                        <p className="text-gray-400 mb-4">{course.description}</p>
                        <div className="mb-8 flex gap-2">
                            <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">{course.level}</span>
                            <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">{course.category}</span>
                        </div>
                    </div>

                    {/* Course Image */}
                    {courseImageUnsplashUrl && <img src={courseImageUnsplashUrl} alt={course.title} className="h-36 object-cover rounded-lg" />}

                </div>
                {lessonImageUnsplashUrl && (
                    <div className='relative w-full h-[400px] rounded-lg mb-12 overflow-hidden bg-slate-400'>
                        <img src={lessonImageUnsplashUrl} alt={currentLesson.title} className="absolute w-full h-full object-cover opacity-60" />
                        <b className='absolute top-4 left-4 text-white text-4xl' style={{ textShadow: '2px 2px 2px rgba(0,0,0,.5)' }}>Lesson {currentLesson.lessonNumber}:</b>
                        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-center' >
                            <h2 className='font-black text-7xl underline' style={{ textShadow: '3px 3px 2px rgba(0,0,0,.5)' }}>{currentLesson.title}</h2>
                            <span className='text-lg font-semibold' style={{ textShadow: '2px 2px 2px rgba(0,0,0,.5)' }}>{currentLesson.content}</span>
                        </div>
                    </div>
                )}

                {currentLesson.exampleSentences && (
                    <div className="mb-8">
                        <ul className="list-disc list-inside">
                            {Object.entries(currentLesson.exampleSentences).map(([key, ex], idx) => (
                                <li className='flex mb-8 hover:shadow-lg rounded-lg overflow-hidden bg-slate-100' key={key}> {/* Use key from Object.entries */}
                                    {exampleImageUrls[key] && ( // Display image if available
                                        <div className='relative inline-block w-2/6 h-52 text-2xl text-white overflow-hidden'>
                                            <img
                                                src={exampleImageUrls[key]}
                                                alt={ex.korean}
                                                className="absolute w-full h-full object-cover"
                                            />
                                            <span className='absolute top-2 left-2 rounded-lg p-2' style={{ background: 'rgba(0,0,0,.3)' }}>{ex.korean}</span>
                                            <span className='absolute bottom-2 right-2 rounded-lg p-2' style={{ background: 'rgba(0,0,0,.3)' }}>{ex.english}</span>
                                        </div>
                                    )}
                                    <div className='w-4/6 p-4'>
                                        <span className="font-medium">{ex.korean}</span> — <span>{ex.english}</span>
                                        <p className='my-2'>{ex.pronunciation}</p>
                                        {typeof window !== 'undefined' && 'speechSynthesis' in window && (
                                            <button
                                                onClick={() => speakText(ex.korean)}
                                                className="w-10 h-10 p-1 rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                aria-label="Play pronunciation"
                                            >
                                                {/* Simple speaker icon, you might want to use an actual SVG icon */}
                                                🔊
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <div className="mb-4">
                    <h3 className="font-semibold inline-block mr-2">tip:</h3>
                    <span>{currentLesson.tip}</span>
                </div>

                {/* Current Lesson Content */}
                <div className="p-6 mb-4 border rounded-lg bg-gray-50">
                    <h2 className="text-xl font-semibold mb-2">
                        Lesson {currentLesson.lessonNumber}: {currentLesson.title}
                    </h2>
                    <p>{currentLesson.content}</p>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 h-2 rounded mb-6">
                    <div
                        className="bg-blue-600 h-2 rounded"
                        style={{ width: `${((currentLessonIndex + 1) / course.lessonsCount) * 100}%` }}
                    ></div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                    <button
                        disabled={currentLessonIndex === 0}
                        onClick={() => setCurrentLessonIndex(prev => prev - 1)}
                        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                    >
                        Previous
                    </button>

                    <span className="text-gray-700 font-medium">
                        {currentLessonIndex + 1} / {course.lessonsCount}
                    </span>

                    <button
                        disabled={currentLessonIndex === course.lessonsCount - 1}
                        onClick={() => setCurrentLessonIndex(prev => prev + 1)}
                        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
            <Comment courseId={course.id} lessonId={currentLesson.lessonNumber.toString()} />
        </div>
    );
}