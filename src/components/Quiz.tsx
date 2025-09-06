'use client';

import { useState, useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiRefreshCw, FiAward } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// --- Interfaces ---
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

interface QuizQuestion {
    questionText: string;
    options: string[];
    correctAnswer: string;
    prompt: string;
}

interface QuizProps {
    lessons: Lesson[];
    courseId: string; // Added courseId to identify the course
    onQuizFinish: () => void;
}

// --- Helper Functions ---
const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
};

const generateQuiz = (lessons: Lesson[]): QuizQuestion[] => {
    const allExamples: Example[] = lessons.flatMap(lesson =>
        lesson.exampleSentences ? Object.values(lesson.exampleSentences) : []
    );

    if (allExamples.length < 4) {
        return [];
    }

    const questions = allExamples.map(example => {
        if (Math.random() > 0.5) {
            const correctAnswer = example.english;
            const distractors = allExamples.filter(ex => ex.english !== correctAnswer).map(ex => ex.english);
            const shuffledDistractors = shuffleArray(distractors).slice(0, 3);
            const options = shuffleArray([correctAnswer, ...shuffledDistractors]);
            return {
                questionText: example.korean,
                options,
                correctAnswer,
                prompt: "Select the correct English translation.",
            };
        } else {
            const correctAnswer = example.korean;
            const distractors = allExamples.filter(ex => ex.korean !== correctAnswer).map(ex => ex.korean);
            const shuffledDistractors = shuffleArray(distractors).slice(0, 3);
            const options = shuffleArray([correctAnswer, ...shuffledDistractors]);
            return {
                questionText: example.english,
                options,
                correctAnswer,
                prompt: "Select the correct Korean sentence.",
            };
        }
    });

    return shuffleArray(questions);
};

// --- Main Component ---
export default function Quiz({ lessons, courseId, onQuizFinish }: QuizProps) {
    const { user } = useAuth();
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswerChecked, setIsAnswerChecked] = useState(false);
    const [score, setScore] = useState(0);
    const [quizFinished, setQuizFinished] = useState(false);
    const [finalMessage, setFinalMessage] = useState("");

    useEffect(() => {
        setQuizQuestions(generateQuiz(lessons));
    }, [lessons]);

    const handleAnswerSelect = (option: string) => {
        if (isAnswerChecked) return;
        setSelectedAnswer(option);
    };

    const handleCheckAnswer = () => {
        if (!selectedAnswer) return;
        setIsAnswerChecked(true);
        if (selectedAnswer === quizQuestions[currentQuizIndex].correctAnswer) {
            setScore(prev => prev + 1);
        }
    };

    const handleNextQuestion = () => {
        if (currentQuizIndex < quizQuestions.length - 1) {
            setCurrentQuizIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setIsAnswerChecked(false);
        } else {
            // End of the quiz, calculate final score and update progress
            const finalScore = score + (selectedAnswer === quizQuestions[currentQuizIndex].correctAnswer ? 1 : 0);
            const percentage = (finalScore / quizQuestions.length) * 100;

            if (percentage >= 80) {
                setFinalMessage("Congratulations! You passed the quiz and completed the course.");
                if (user) {
                    const progressRef = doc(db, 'user_progress', user.uid, 'enrolled_courses', courseId);
                    setDoc(progressRef, {
                        isCompleted: true,
                        progress: 100,
                        completedAt: serverTimestamp()
                    }, { merge: true }).catch(console.error);
                }
            } else {
                setFinalMessage("Quiz complete! Try again to pass the course.");
            }
            setQuizFinished(true);
        }
    };

    const handleRestartQuiz = () => {
        setQuizQuestions(generateQuiz(lessons));
        setQuizFinished(false);
        setCurrentQuizIndex(0);
        setScore(0);
        setSelectedAnswer(null);
        setIsAnswerChecked(false);
        setFinalMessage("");
    };

    if (quizQuestions.length === 0) {
        // ... (Not enough content view remains the same)
    }

    if (quizFinished) {
        return (
            <div className="text-center p-8 bg-white rounded-lg shadow-md">
                <FiAward className={`mx-auto mb-4 ${score / quizQuestions.length >= 0.8 ? 'text-yellow-500' : 'text-gray-400'}`} size={60} />
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Quiz Complete!</h2>
                <p className="text-xl text-gray-600 mb-4">
                    Your score: <span className="font-bold text-blue-600">{score}</span> / {quizQuestions.length}
                </p>
                <p className="text-md text-gray-700 mb-6">{finalMessage}</p>
                <div className="flex gap-4 justify-center">
                    <button onClick={handleRestartQuiz} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                        <FiRefreshCw />
                        Try Again
                    </button>
                    <button onClick={onQuizFinish} className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                        Back to Lesson
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = quizQuestions[currentQuizIndex];
    if (!currentQuestion) return <p>Loading quiz...</p>;

    return (
        // ... (The main quiz view remains the same)
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col md:flex-row gap-4 items-start justify-between mb-6">
                <div>
                    <p className="text-sm text-gray-500">Question {currentQuizIndex + 1} of {quizQuestions.length}</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-2">{currentQuestion.questionText}</h3>
                    <p className="text-md text-gray-600 mt-1">{currentQuestion.prompt}</p>
                </div>
                <button onClick={onQuizFinish} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                    Back to Lesson
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {currentQuestion.options.map((option, index) => {
                    const isCorrect = option === currentQuestion.correctAnswer;
                    const isSelected = option === selectedAnswer;
                    let buttonClass = 'p-4 rounded-lg border-2 text-left transition-all duration-200';

                    if (isAnswerChecked) {
                        if (isCorrect) {
                            buttonClass += ' bg-green-100 border-green-500 text-green-800 font-semibold';
                        } else if (isSelected) {
                            buttonClass += ' bg-red-100 border-red-500 text-red-800';
                        } else {
                            buttonClass += ' border-gray-200 bg-gray-50 opacity-70';
                        }
                    } else {
                        if (isSelected) {
                            buttonClass += ' bg-blue-100 border-blue-500';
                        } else {
                            buttonClass += ' border-gray-300 hover:bg-gray-100 hover:border-gray-400';
                        }
                    }

                    return (
                        <button key={index} onClick={() => handleAnswerSelect(option)} disabled={isAnswerChecked} className={buttonClass}>
                            {option}
                        </button>
                    );
                })}
            </div>

            <div className="flex justify-end items-center">
                {isAnswerChecked && selectedAnswer && (
                    selectedAnswer === currentQuestion.correctAnswer ? (
                        <span className="flex items-center gap-2 text-green-600 font-semibold mr-4">
                            <FiCheckCircle /> Correct!
                        </span>
                    ) : (
                        <span className="flex items-center gap-2 text-red-600 font-semibold mr-4">
                            <FiXCircle /> Incorrect.
                        </span>
                    )
                )}
                {!isAnswerChecked ? (
                    <button onClick={handleCheckAnswer} disabled={!selectedAnswer} className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors">
                        Check Answer
                    </button>
                ) : (
                    <button onClick={handleNextQuestion} className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors">
                        Next Question
                    </button>
                )}
            </div>
        </div>
    );
}