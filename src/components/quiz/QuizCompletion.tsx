import { FiAward, FiRefreshCw } from 'react-icons/fi';

interface QuizCompletionProps {
    score: number;
    totalQuestions: number;
    finalMessage: string;
    onRestart: () => void;
    onFinish: () => void;
}

export default function QuizCompletion({ score, totalQuestions, finalMessage, onRestart, onFinish }: QuizCompletionProps) {
    return (
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <FiAward className={`mx-auto mb-4 ${score / totalQuestions >= 0.8 ? 'text-yellow-500' : 'text-gray-400'}`} size={60} />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Quiz Complete!</h2>
            <p className="text-xl text-gray-600 mb-4">
                Your score: <span className="font-bold text-blue-600">{score}</span> / {totalQuestions}
            </p>
            <p className="text-md text-gray-700 mb-6">{finalMessage}</p>
            <div className="flex gap-4 justify-center">
                <button onClick={onRestart} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                    <FiRefreshCw />
                    Try Again
                </button>
                <button onClick={onFinish} className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                    Back to Lesson
                </button>
            </div>
        </div>
    );
}
