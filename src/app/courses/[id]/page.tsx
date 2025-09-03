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
}

interface Lesson {
    lessonNumber: number;
    title: string;
    content: string;
    exampleSentences: Record<string, Example>;
    pronunciation: string;
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

    if (loading) return <Loading/>;
    if (!course) return <p className="p-8">Course not found</p>;

    const currentLesson = course.lessons[currentLessonIndex];

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl h-full mx-auto p-8 text-gray-700">
                <div className='flex flex-row-reverse justify-end items-center gap-5 mb-4'>
                    <div>
                        {/* Course Header */}
                        <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
                        {/* Course Description */}
                        <p className="text-gray-400 mb-4">{course.description}</p>
                        <div className="mb-4 flex gap-2">
                            <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">{course.level}</span>
                            <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">{course.category}</span>
                        </div>
                    </div>
    
                    {/* Course Image */}
                    <Image width={384} height={192} src={course.image} alt={course.title} className="h-32 object-cover rounded-lg" />
    
                </div>
                {currentLesson.image && (
                    <Image width={1200} height={900} src={currentLesson.image} alt={currentLesson.title} className="w-full object-cover rounded-lg mb-4" />
                )}
                
                {currentLesson.exampleSentences && (
                    <div className="mb-4">
                        <h3 className="font-semibold mb-2">Examples:</h3>
                        <ul className="list-disc list-inside">
                            {Object.values(currentLesson.exampleSentences).map((ex, idx) => (
                                <li key={idx}>
                                    <span className="font-medium">{ex.korean}</span> — <span>{ex.english}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <div className="mb-4">
                    <h3 className="font-semibold inline-block mr-2">Pronunciation:</h3>
                    <span>{currentLesson.pronunciation}</span>
                </div>
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
