import { FiVolume2 } from 'react-icons/fi';
import type { QuizQuestion } from '@/types/quiz';

interface MultipleChoiceQuestionProps {
    question: QuizQuestion;
    selectedAnswer: string | null;
    isAnswerChecked: boolean;
    onAnswerSelect: (option: string) => void;
    handlePlayAudio: (text: string) => void;
}

export default function MultipleChoiceQuestion({ question, selectedAnswer, isAnswerChecked, onAnswerSelect, handlePlayAudio }: MultipleChoiceQuestionProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {question.options.map((option, index) => {
                const isCorrect = option === question.correctAnswer;
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
                        onClick={() => !isAnswerChecked && onAnswerSelect(option)}
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
    );
}
