'use client';

import { useState, useEffect, useMemo } from 'react';
import { FiCheckCircle, FiXCircle, FiVolume2 } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { generateQuiz } from '@/lib/quizUtils';
import type { Lesson, QuizQuestion, CharObject } from '@/types/quiz';
import QuizCompletion from './quiz/QuizCompletion';
import MultipleChoiceQuestion from './quiz/MultipleChoiceQuestion';
import SentenceScrambleQuestion from './quiz/SentenceScrambleQuestion';

interface QuizProps {
    lessons: Lesson[];
    courseId: string;
    onQuizFinish: () => void;
}

export default function Quiz({ lessons, courseId, onQuizFinish }: QuizProps) {
    const { user } = useAuth();
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswerChecked, setIsAnswerChecked] = useState(false);
    const [score, setScore] = useState(0);
    const [quizFinished, setQuizFinished] = useState(false);
    const [finalMessage, setFinalMessage] = useState("");
    const [builtSentence, setBuiltSentence] = useState<CharObject[]>([]);
    const [availableChars, setAvailableChars] = useState<CharObject[]>([]);

    const resetQuiz = () => {
        const newQuiz = generateQuiz(lessons);
        setQuizQuestions(newQuiz);
        setCurrentQuizIndex(0);
        setScore(0);
        setQuizFinished(false);
        setFinalMessage("");
    };

    useEffect(() => {
        resetQuiz();
    }, [lessons]);

    const currentQuestion = useMemo(() => quizQuestions[currentQuizIndex], [quizQuestions, currentQuizIndex]);

    useEffect(() => {
        if (currentQuestion) {
            if (currentQuestion.type === 'sentence-scramble') {
                setAvailableChars(currentQuestion.options.map((char, index) => ({ char, id: index })));
                setBuiltSentence([]);
            }
            setSelectedAnswer(null);
            setIsAnswerChecked(false);
        }
    }, [currentQuestion]);

    const handlePlayAudio = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ko-KR';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
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

    const isCorrectAnswer = useMemo(() => {
        if (!isAnswerChecked || !currentQuestion) return false;
        if (currentQuestion.type === 'sentence-scramble') {
            return selectedAnswer === currentQuestion.correctAnswer.replace(/\s/g, '');
        }
        return selectedAnswer === currentQuestion.correctAnswer;
    }, [isAnswerChecked, selectedAnswer, currentQuestion]);

    const handleCheckAnswer = () => {
        if (isAnswerChecked || !currentQuestion) return;

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
            const percentage = quizQuestions.length > 0 ? (score / quizQuestions.length) * 100 : 0;
            if (percentage >= 80) {
                setFinalMessage("Congratulations! You passed the quiz and completed the course.");
                if (user) {
                    const progressRef = doc(db, 'user_progress', user.uid, 'enrolled_courses', courseId);
                    setDoc(progressRef, { isCompleted: true, progress: 100, completedAt: serverTimestamp() }, { merge: true }).catch(console.error);
                }
            } else {
                setFinalMessage("Quiz complete! Try again to pass the course.");
            }
            setQuizFinished(true);
        }
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
        return <QuizCompletion score={score} totalQuestions={quizQuestions.length} finalMessage={finalMessage} onRestart={resetQuiz} onFinish={onQuizFinish} />;
    }

    if (!currentQuestion) return <p>Loading quiz...</p>;

    return (
        <div className="md:bg-white rounded-lg shadow-md p-3 md:p-6">
            <div className="flex md:flex-row flex-col-reverse gap-4 items-start justify-between mb-6">
                <div>
                    <p className="text-sm text-gray-500">Question {currentQuizIndex + 1} of {quizQuestions.length}</p>
                    <div className="flex items-center gap-2 mt-2">
                        <h3 className="text-2xl font-bold text-gray-800">{currentQuestion.questionText}</h3>
                        {(currentQuestion.type === 'sentence-scramble' || /[\u3131-\uD79D]/.test(currentQuestion.questionText)) && (
                            <button
                                onClick={() => handlePlayAudio(currentQuestion.type === 'sentence-scramble' ? currentQuestion.correctAnswer : currentQuestion.questionText)}
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
                <MultipleChoiceQuestion
                    question={currentQuestion}
                    selectedAnswer={selectedAnswer}
                    isAnswerChecked={isAnswerChecked}
                    onAnswerSelect={setSelectedAnswer}
                    handlePlayAudio={handlePlayAudio}
                />
            ) : (
                <SentenceScrambleQuestion
                    question={currentQuestion}
                    isAnswerChecked={isAnswerChecked}
                    isCorrect={isCorrectAnswer}
                    builtSentence={builtSentence}
                    availableChars={availableChars}
                    onCharSelect={handleCharSelect}
                    onCharDeselect={handleCharDeselect}
                    onBackspace={handleBackspace}
                />
            )}

            <div className="flex justify-end items-center">
                {isAnswerChecked && (
                    <span className={`flex items-center gap-2 font-semibold mr-4 ${isCorrectAnswer ? 'text-green-600' : 'text-red-600'}`}>
                        {isCorrectAnswer ? <FiCheckCircle /> : <FiXCircle />}
                        {isCorrectAnswer ? 'Correct!' : 'Incorrect.'}
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