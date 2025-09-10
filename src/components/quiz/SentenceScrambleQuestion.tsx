import { FiDelete } from 'react-icons/fi';
import type { QuizQuestion, CharObject } from '@/types/quiz';

interface SentenceScrambleQuestionProps {
    question: QuizQuestion;
    isAnswerChecked: boolean;
    isCorrect: boolean;
    builtSentence: CharObject[];
    availableChars: CharObject[];
    onCharSelect: (charObj: CharObject) => void;
    onCharDeselect: (charObj: CharObject) => void;
    onBackspace: () => void;
}

export default function SentenceScrambleQuestion({
    question,
    isAnswerChecked,
    isCorrect,
    builtSentence,
    availableChars,
    onCharSelect,
    onCharDeselect,
    onBackspace
}: SentenceScrambleQuestionProps) {
    return (
        <div className="mb-6">
            <div className={`p-4 mb-4 border-2 rounded-lg min-h-[6rem] flex flex-wrap gap-2 items-center justify-center text-lg font-semibold ${isAnswerChecked ? (isCorrect ? 'border-green-500' : 'border-red-500') : 'border-gray-300'}`}>
                {builtSentence.map((charObj) => {
                    let buttonClass = "p-3 bg-blue-100 border border-blue-300 rounded-md text-blue-800";
                    if (isAnswerChecked && !isCorrect && charObj.status) {
                        buttonClass = charObj.status === 'correct'
                            ? "p-3 bg-green-100 border border-green-300 rounded-md text-green-800"
                            : "p-3 bg-red-100 border border-red-300 rounded-md text-red-800";
                    }

                    return (
                        <button key={charObj.id} onClick={() => onCharDeselect(charObj)} disabled={isAnswerChecked} className={buttonClass}>
                            {charObj.char}
                        </button>
                    );
                })}
                {builtSentence.length === 0 && !isAnswerChecked && <span className="text-gray-400">Click characters below</span>}
            </div>
            {isAnswerChecked && !isCorrect && (
                <div className="text-center p-2 my-2 rounded-lg bg-gray-100">
                    <p className="text-sm text-gray-600">Correct Answer:</p>
                    <p className="text-lg font-bold text-green-700">{question.correctAnswer}</p>
                </div>
            )}
            <div className="flex flex-wrap gap-2 justify-center mb-4">
                {availableChars.map((charObj) => (
                    <button key={charObj.id} onClick={() => onCharSelect(charObj)} disabled={isAnswerChecked} className="p-3 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50">
                        {charObj.char}
                    </button>
                ))}
            </div>
            {builtSentence.length > 0 && <div className="flex justify-center">
                <button onClick={onBackspace} disabled={isAnswerChecked} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-800 disabled:opacity-50">
                    <FiDelete /> Backspace
                </button>
            </div>}
        </div>
    );
}
