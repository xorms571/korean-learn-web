import type { Lesson, QuizQuestion, Example } from '@/types/quiz';

const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
};

export const generateQuiz = (lessons: Lesson[]): QuizQuestion[] => {
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
