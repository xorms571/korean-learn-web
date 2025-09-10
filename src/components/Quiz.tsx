'use client';

import { useState, useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiRefreshCw, FiAward, FiDelete, FiVolume2 } from 'react-icons/fi';
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

type QuestionType = 'multiple-choice' | 'sentence-scramble';

interface QuizQuestion {
    type: QuestionType;
    questionText: string;
    options: string[];
    correctAnswer: string;
    prompt: string;
}

interface QuizProps {
    lessons: Lesson[];
    courseId: string;
    onQuizFinish: () => void;
}

// --- Helper Functions ---
const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
};

const generateQuiz = (lessons: Lesson[]): QuizQuestion[] => {
    const allExamples: Example[] = lessons.flatMap(lesson =>
        lesson.exampleSentences ? Object.values(lesson.exampleSentences) : []
    ).filter(ex => ex.korean && ex.english);

    if (allExamples.length < 1) {
        return [];
    }

    const questions: QuizQuestion[] = allExamples.map(example => {
        const questionTypeRand = Math.random();

        if (questionTypeRand > 0.5 && allExamples.length >= 4) {
            if (Math.random() > 0.5) {
                const correctAnswer = example.english;
                const distractors = allExamples.filter(ex => ex.english !== correctAnswer).map(ex => ex.english);
                const shuffledDistractors = shuffleArray(distractors).slice(0, 3);
                const options = shuffleArray([correctAnswer, ...shuffledDistractors]);
                return {
                    type: 'multiple-choice',
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
                    type: 'multiple-choice',
                    questionText: example.english,
                    options,
                    correctAnswer,
                    prompt: "Select the correct Korean sentence/word.",
                };
            }
        } else {
            const correctAnswerWithSpaces = example.korean;
            const correctAnswerNoSpaces = correctAnswerWithSpaces.replace(/\s/g, '');
            const correctChars = correctAnswerNoSpaces.split('');

            const distractorPool = allExamples
                .filter(ex => ex.korean !== correctAnswerWithSpaces)
                .map(ex => ex.korean.replace(/\s/g, ''))
                .join('')
                .split('');

            const shuffledDistractorPool = shuffleArray(distractorPool);
            const distractors = shuffledDistractorPool.slice(0, 3);

            const options = shuffleArray([...correctChars, ...distractors]);

            return {
                type: 'sentence-scramble',
                questionText: `"${example.english}"`,
                options: options,
                correctAnswer: correctAnswerWithSpaces,
                prompt: "Arrange the characters to form the sentence. Some characters are not used.",
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

    type CharObject = { char: string; id: number; status?: 'correct' | 'incorrect' };
    const [builtSentence, setBuiltSentence] = useState<CharObject[]>([]);
    const [availableChars, setAvailableChars] = useState<CharObject[]>([]);

    useEffect(() => {
        const newQuiz = generateQuiz(lessons);
        setQuizQuestions(newQuiz);
        setCurrentQuizIndex(0);
        setScore(0);
        setQuizFinished(false);
        setFinalMessage("");
    }, [lessons]);

    useEffect(() => {
        if (quizQuestions.length > 0 && currentQuizIndex < quizQuestions.length) {
            const currentQ = quizQuestions[currentQuizIndex];
            if (currentQ.type === 'sentence-scramble') {
                setAvailableChars(currentQ.options.map((char, index) => ({ char, id: index })));
                setBuiltSentence([]);
            }
            setSelectedAnswer(null);
            setIsAnswerChecked(false);
        }
    }, [currentQuizIndex, quizQuestions]);

    const handlePlayAudio = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ko-KR';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleAnswerSelect = (option: string) => {
        if (isAnswerChecked) return;
        setSelectedAnswer(option);
    };

    const handleCharSelect = (charObj: CharObject) => {
        if (isAnswerChecked) return;
        setBuiltSentence(prev => [...prev, charObj]);
        setAvailableChars(prev => prev.filter(c => c.id !== charObj.id));
    };

    const handleCharDeselect = (charObj: CharObject) => {
        if (isAnswerChecked) return;
        setBuiltSentence(prev => prev.filter(c => c.id !== charObj.id));
        setAvailableChars(prev => [...prev, charObj].sort((a, b) => a.id - b.id));
    };

    const handleBackspace = () => {
        if (isAnswerChecked || builtSentence.length === 0) return;
        const lastChar = builtSentence[builtSentence.length - 1];
        setBuiltSentence(prev => prev.slice(0, -1));
        setAvailableChars(prev => [...prev, lastChar].sort((a, b) => a.id - b.id));
    };

    const handleCheckAnswer = () => {
        if (isAnswerChecked) return;

        const currentQuestion = quizQuestions[currentQuizIndex];
        let isCorrect = false;
        let userAnswer: string;

        if (currentQuestion.type === 'multiple-choice') {
            if (!selectedAnswer) return;
            userAnswer = selectedAnswer;
            isCorrect = userAnswer === currentQuestion.correctAnswer;
        } else { // sentence-scramble
            userAnswer = builtSentence.map(c => c.char).join('');
            const correctAnswerNoSpaces = currentQuestion.correctAnswer.replace(/\s/g, '');
            isCorrect = userAnswer === correctAnswerNoSpaces;

            if (!isCorrect) {
                const correctAnswerChars = correctAnswerNoSpaces.split('');
                const feedbackSentence = builtSentence.map((charObj, index) => ({
                    ...charObj,
                    status: (index < correctAnswerChars.length && charObj.char === correctAnswerChars[index] ? 'correct' : 'incorrect') as 'correct' | 'incorrect'
                }));
                setBuiltSentence(feedbackSentence);
            }
        }

        setSelectedAnswer(userAnswer);
        setIsAnswerChecked(true);
        if (isCorrect) {
            setScore(prev => prev + 1);
        }
    };

    const handleNextQuestion = () => {
        if (currentQuizIndex < quizQuestions.length - 1) {
            setCurrentQuizIndex(prev => prev + 1);
        } else {
            const finalScore = score;
            const percentage = quizQuestions.length > 0 ? (finalScore / quizQuestions.length) * 100 : 0;

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
        const newQuiz = generateQuiz(lessons);
        setQuizQuestions(newQuiz);
        setQuizFinished(false);
        setCurrentQuizIndex(0);
        setScore(0);
        setFinalMessage("");
    };

    if (quizQuestions.length === 0) {
        return (
            <div className="text-center p-8 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-700">Not enough content for a quiz.</h2>
                <p className="text-gray-500 mt-2">Please add more example sentences.</p>
            </div>
        );
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

    const isCorrectAnswer = () => {
        if (!isAnswerChecked) return false;
        if (currentQuestion.type === 'sentence-scramble') {
            return selectedAnswer === currentQuestion.correctAnswer.replace(/\s/g, '');
        }
        return selectedAnswer === currentQuestion.correctAnswer;
    };

    return (
        <div className="md:bg-white rounded-lg shadow-md p-3 md:p-6">
            <div className="flex md:flex-row flex-col-reverse gap-4 items-start justify-between mb-6">
                <div>
                    <p className="text-sm text-gray-500">Question {currentQuizIndex + 1} of {quizQuestions.length}</p>
                    <div className="flex items-center gap-2 mt-2">
                        <h3 className="text-2xl font-bold text-gray-800">{currentQuestion.questionText}</h3>
                        {(currentQuestion.type === 'sentence-scramble' || /[\u3131-\uD79D]/.test(currentQuestion.questionText)) && (
                            <button
                                onClick={() => {
                                    const textToPlay = currentQuestion.type === 'sentence-scramble'
                                        ? currentQuestion.correctAnswer
                                        : currentQuestion.questionText;
                                    handlePlayAudio(textToPlay);
                                }}
                                className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                                aria-label="Listen to the sentence"
                            >
                                <FiVolume2 className="text-gray-600" />
                            </button>
                        )}
                    </div>
                    <p className="text-md text-gray-600 mt-1">{currentQuestion.prompt}</p>
                </div>
                <button onClick={onQuizFinish} className="px-4 py-2 text-sm md:text-base bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                    Back to Lesson
                </button>
            </div>

            {currentQuestion.type === 'multiple-choice' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {currentQuestion.options.map((option, index) => {
                        const isCorrect = option === currentQuestion.correctAnswer;
                        const isSelected = option === selectedAnswer;
                        let buttonClass = 'p-4 rounded-lg border-2 text-left transition-all duration-200';

                        if (isAnswerChecked) {
                            if (isCorrect) buttonClass += ' bg-green-100 border-green-500 text-green-800 font-semibold';
                            else if (isSelected) buttonClass += ' bg-red-100 border-red-500 text-red-800';
                            else buttonClass += ' border-gray-200 bg-gray-50 opacity-70';
                        } else {
                            if (isSelected) buttonClass += ' font-bold text-gray-700 bg-blue-100 border-blue-500';
                            else buttonClass += ' text-gray-500 border-gray-300 hover:bg-gray-100 hover:border-gray-400';
                        }

                        const isOptionKorean = /[\u3131-\uD79D]/.test(option);

                        return (
                            <div
                                key={index}
                                onClick={() => !isAnswerChecked && handleAnswerSelect(option)}
                                className={`${buttonClass} flex items-center justify-between w-full ${!isAnswerChecked ? 'cursor-pointer' : 'cursor-default'}`}
                                aria-disabled={isAnswerChecked}
                            >
                                <span>{option}</span>
                                {isOptionKorean && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handlePlayAudio(option);
                                        }}
                                        disabled={isAnswerChecked}
                                        className="p-1 rounded-full hover:bg-white/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        aria-label={`Listen to "${option}"`}
                                    >
                                        <FiVolume2 className="text-gray-700" />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="mb-6">
                    <div className={`p-4 mb-4 border-2 rounded-lg min-h-[6rem] flex flex-wrap gap-2 items-center justify-center text-lg font-semibold ${isAnswerChecked ? (isCorrectAnswer() ? 'border-green-500' : 'border-red-500') : 'border-gray-300'}`}>
                        {builtSentence.map((charObj) => {
                            let buttonClass = "p-3 bg-blue-100 border border-blue-300 rounded-md text-blue-800";
                            if (isAnswerChecked && !isCorrectAnswer() && charObj.status) {
                                buttonClass = charObj.status === 'correct'
                                    ? "p-3 bg-green-100 border border-green-300 rounded-md text-green-800"
                                    : "p-3 bg-red-100 border border-red-300 rounded-md text-red-800";
                            }

                            return (
                                <button key={charObj.id} onClick={() => handleCharDeselect(charObj)} disabled={isAnswerChecked} className={buttonClass}>
                                    {charObj.char}
                                </button>
                            );
                        })}
                        {builtSentence.length === 0 && !isAnswerChecked && <span className="text-gray-400">Click characters below</span>}
                    </div>
                    {isAnswerChecked && !isCorrectAnswer() && currentQuestion.type === 'sentence-scramble' && (
                        <div className="text-center p-2 my-2 rounded-lg bg-gray-100">
                            <p className="text-sm text-gray-600">Correct Answer:</p>
                            <p className="text-lg font-bold text-green-700">{currentQuestion.correctAnswer}</p>
                        </div>
                    )}
                    <div className="flex flex-wrap gap-2 justify-center mb-4">
                        {availableChars.map((charObj) => (
                            <button key={charObj.id} onClick={() => handleCharSelect(charObj)} disabled={isAnswerChecked} className="p-3 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50">
                                {charObj.char}
                            </button>
                        ))}
                    </div>
                    {builtSentence.length > 0 && <div className="flex justify-center">
                        <button onClick={handleBackspace} disabled={isAnswerChecked} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-800 disabled:opacity-50">
                            <FiDelete /> Backspace
                        </button>
                    </div>}
                </div>
            )}

            <div className="flex justify-end items-center">
                {isAnswerChecked && (
                    <span className={`flex items-center gap-2 font-semibold mr-4 ${isCorrectAnswer() ? 'text-green-600' : 'text-red-600'}`}>
                        {isCorrectAnswer() ? <FiCheckCircle /> : <FiXCircle />}
                        {isCorrectAnswer() ? 'Correct!' : 'Incorrect.'}
                    </span>
                )}
                {!isAnswerChecked ? (
                    <button onClick={handleCheckAnswer} disabled={(currentQuestion.type === 'multiple-choice' && !selectedAnswer) || (currentQuestion.type === 'sentence-scramble' && builtSentence.length === 0)} className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors">
                        Check Answer
                    </button>
                ) : (
                    <button onClick={handleNextQuestion} className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors">
                        {currentQuizIndex < quizQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                    </button>
                )}
            </div>
        </div>
    );
}
