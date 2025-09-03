'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CoursesPage() {
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Temporary course data (will be fetched from API in real implementation)
  const courses = [
    {
      id: 1,
      title: 'Basic Greetings',
      description: 'Learn basic greetings like 안녕하세요, 감사합니다, etc.',
      level: 'beginner',
      category: 'conversation',
      duration: '2 hours',
      lessons: 8,
      image: '/api/placeholder/300/200',
      progress: 0
    },
    {
      id: 2,
      title: 'Self Introduction',
      description: 'Learn how to introduce yourself including name, age, and job.',
      level: 'beginner',
      category: 'conversation',
      duration: '3 hours',
      lessons: 12,
      image: '/api/placeholder/300/200',
      progress: 0
    },
    {
      id: 3,
      title: 'Daily Conversation',
      description: 'Learn how to have conversations about family, hobbies, food, etc.',
      level: 'beginner',
      category: 'conversation',
      duration: '4 hours',
      lessons: 15,
      image: '/api/placeholder/300/200',
      progress: 0
    },
    {
      id: 4,
      title: 'Basic Grammar',
      description: 'Learn basic Korean grammar structure and sentence building.',
      level: 'beginner',
      category: 'grammar',
      duration: '5 hours',
      lessons: 20,
      image: '/api/placeholder/300/200',
      progress: 0
    },
    {
      id: 5,
      title: 'Ordering Food',
      description: 'Learn how to order food and have conversations at restaurants.',
      level: 'intermediate',
      category: 'conversation',
      duration: '3 hours',
      lessons: 10,
      image: '/api/placeholder/300/200',
      progress: 0
    },
    {
      id: 6,
      title: 'Travel Korean',
      description: 'Learn Korean expressions and conversations needed for travel.',
      level: 'intermediate',
      category: 'travel',
      duration: '4 hours',
      lessons: 18,
      image: '/api/placeholder/300/200',
      progress: 0
    }
  ];

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
    { value: 'business', label: 'Business' }
  ];

  const filteredCourses = courses.filter(course => {
    if (selectedLevel !== 'all' && course.level !== selectedLevel) return false;
    if (selectedCategory !== 'all' && course.category !== selectedCategory) return false;
    return true;
  });

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'beginner': return 'Beginner';
      case 'intermediate': return 'Intermediate';
      case 'advanced': return 'Advanced';
      default: return level;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'conversation': return 'Conversation';
      case 'grammar': return 'Grammar';
      case 'travel': return 'Travel';
      case 'business': return 'Business';
      default: return category;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Korean Courses</h1>
          <p className="text-xl text-gray-600">
            Improve your Korean skills with systematically structured learning courses
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Level
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {levels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
              {/* Course Image */}
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <div className="text-gray-500 text-center">
                  <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <p className="text-sm">Course Image</p>
                </div>
              </div>

              {/* Course Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {getLevelLabel(course.level)}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {getCategoryLabel(course.category)}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{course.description}</p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>⏱ {course.duration}</span>
                  <span>📚 {course.lessons} lessons</span>
                </div>

                {course.progress > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-green-600">
                    Free
                  </span>
                  <Link
                    href={`/courses/${course.id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    {course.progress > 0 ? 'Continue' : 'Start Learning'}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-500">Try different filter conditions.</p>
          </div>
        )}
      </div>
    </div>
  );
}
