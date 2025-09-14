
interface Example { korean: string; english: string; pronunciation: string; }
export interface Lesson { lessonNumber: number; title: string; content: string; exampleSentences: Record<string, Example>; tip: string; image: string; }
export interface Course { id: string; title: string; description: string; level: string; category: string; duration: string; lessonsCount: number; image: string; lessons: Lesson[]; }
export interface CourseProgress { progress: number; completedLessons: number[]; lastCompletedLesson: number | null; isCompleted?: boolean; }