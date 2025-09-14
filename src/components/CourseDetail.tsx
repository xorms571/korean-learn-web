
import Quiz from "./Quiz";
import { SetStateAction } from "react";
import { useSpeech } from "@/hooks/useSpeech";
import Comment from "./Comment";
import { Course, CourseProgress } from "@/types/course";
import { Lesson } from "@/types/quiz";
import { FiVolume2, FiChevronLeft, FiChevronRight, FiCheckCircle, FiAward } from 'react-icons/fi';

interface props {
    course: Course;
    courseProgress: CourseProgress | null;
    isQuizActive: boolean;
    currentLesson: Lesson | undefined;
    exampleImageUrls: Record<string, string>;
    setIsQuizActive: (value: SetStateAction<boolean>) => void;
    hasEnoughExamplesForQuiz: boolean;
    setCurrentLessonIndex: (value: SetStateAction<number>) => void;
    currentLessonIndex: number;
    progressPercentage: number;
    handleSetLesson: (index: number) => void
}
export default function CourseDetail({ course, courseProgress, currentLessonIndex, progressPercentage, setIsQuizActive, setCurrentLessonIndex, handleSetLesson, isQuizActive, currentLesson, exampleImageUrls, hasEnoughExamplesForQuiz }: props) {
    const { speak } = useSpeech()
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
                                                                <button onClick={() => speak(ex.korean)} className="p-2 rounded-full text-gray-600 hover:bg-gray-200 transition-colors" aria-label="Play pronunciation">
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
                            <div className="md:bg-white rounded-lg md:shadow-md md:p-6">
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
    )
}
