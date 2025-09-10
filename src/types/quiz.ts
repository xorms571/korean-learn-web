export interface Example {
    korean: string;
    english: string;
    pronunciation: string;
}

export interface Lesson {
    lessonNumber: number;
    title: string;
    content: string;
    exampleSentences: Record<string, Example>;
    tip: string;
    image: string;
}

export type QuestionType = 'multiple-choice' | 'sentence-scramble';

export interface QuizQuestion {
    type: QuestionType;
    questionText: string;
    options: string[];
    correctAnswer: string;
    prompt: string;
}

export type CharObject = { char: string; id: number; status?: 'correct' | 'incorrect' };
