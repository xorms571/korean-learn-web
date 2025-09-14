
'use client';

import { useState, useMemo } from 'react';
import Loading from '@/components/Loading';
import CoursesList from '@/components/CoursesList';
import { useCourses } from '@/hooks/useCourses';
import { useCourseImages } from '@/hooks/useCourseImages';

export default function SentenceCoursesPage() {
  const { authLoading, courses, userProgress, courseLoading, handleStartOrContinue } = useCourses('sentence');
  const { courseImageUrls } = useCourseImages(courses);
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const coursesWithProgress = useMemo(() => {
    return courses.map(course => ({
      ...course,
      progress: userProgress[course.id]?.progress ?? 0,
      isCompleted: userProgress[course.id]?.isCompleted ?? false,
    }));
  }, [courses, userProgress]);

  const levels = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'conversation', label: 'Conversation' },
    { value: 'grammar', label: 'Grammar' },
    { value: 'travel', label: 'Travel' },
    { value: 'business', label: 'Business' },
    { value: 'food', label: 'Food' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'alphabet', label: 'Alphabet' },
    { value: 'numbers', label: 'Numbers' }
  ];

  const getLevelLabel = (level: string) => levels.find(l => l.value === level.toLowerCase())?.label || level;
  const getCategoryLabel = (category: string) => categories.find(c => c.value === category.toLowerCase())?.label || category;

  if (authLoading || courseLoading) return <Loading />;

  const props = {
    categories,
    courseImageUrls,
    courses: coursesWithProgress,
    getCategoryLabel,
    getLevelLabel,
    levels,
    selectedCategory,
    selectedLevel,
    setSelectedLevel,
    handleStartOrContinue,
    setSelectedCategory,
    title: "Sentence Courses",
    description: "Improve your Korean sentences with our interactive courses."
  }
  return (
    <CoursesList {...props} />
  );
}
