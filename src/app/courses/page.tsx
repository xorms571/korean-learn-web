'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import Loading from '@/components/Loading';
import { FiAward } from 'react-icons/fi';

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  category: string;
  duration: string;
  lessons: number;
  image: string;
  progress: number;
  isCompleted?: boolean;
}

interface UserProgress {
    progress: number;
    isCompleted?: boolean;
    completedLessons?: number[];
    lastCompletedLesson?: number | null;
}

export default function CoursesPage() {
  const { user, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, UserProgress>>({});
  const [courseLoading, setCourseLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [courseImageUrls, setCourseImageUrls] = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    const fetchCoursesAndProgress = async () => {
      try {
        const coursesSnapshot = await getDocs(collection(db, 'courses'));
        const courseData: Course[] = coursesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Course[];
        setCourses(courseData);

        if (user) {
            const progressSnapshot = await getDocs(collection(db, 'user_progress', user.uid, 'enrolled_courses'));
            const progressData: Record<string, UserProgress> = {};
            progressSnapshot.forEach(doc => {
                progressData[doc.id] = doc.data() as UserProgress;
            });
            setUserProgress(progressData);
        }

      } catch (error) {
        console.error("Error fetching courses or progress:", error);
      } finally {
        setCourseLoading(false);
      }
    };

    fetchCoursesAndProgress();
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchImages = async () => {
      const imageUrls: Record<string, string> = {};
      await Promise.all(
        courses.map(async (course) => {
          try {
            const response = await fetch(
              `/api/pexels?query=${encodeURIComponent(course.title)}`
            );
            if (response.ok) {
              const data = await response.json();
              if (data.imageUrl) {
                imageUrls[course.id] = data.imageUrl;
              }
            }
          } catch (error) {
            console.error(`Error fetching image for "${course.title}":`, error);
          }
        })
      );
      setCourseImageUrls(imageUrls);
    };

    if (courses.length > 0) {
      fetchImages();
    }
  }, [courses]);

  const coursesWithProgress = useMemo(() => {
      return courses.map(course => ({
          ...course,
          progress: userProgress[course.id]?.progress ?? 0,
          isCompleted: userProgress[course.id]?.isCompleted ?? false,
      }));
  }, [courses, userProgress]);

  const handleStartOrContinue = async (courseId: string) => {
    if (!user) {
        router.push('/login');
        return;
    }

    const progressRef = doc(db, 'user_progress', user.uid, 'enrolled_courses', courseId);
    
    try {
        const docSnap = await getDoc(progressRef);
        if (!docSnap.exists()) {
            const initialProgress = {
                progress: 0,
                completedLessons: [],
                lastCompletedLesson: null,
                isCompleted: false,
                startedAt: serverTimestamp(),
                lastAccessed: serverTimestamp(),
            };
            await setDoc(progressRef, initialProgress);
            setUserProgress(prev => ({ ...prev, [courseId]: initialProgress }));
        }
        router.push(`/courses/${courseId}`);
    } catch (error) {
        console.error("Error enrolling in course: ", error);
    }
  };

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
    { value: 'Food', label: 'Food' },
    { value: 'shopping', label: 'Shopping' }
  ];

  const filteredCourses = coursesWithProgress.filter(course => {
    if (selectedLevel !== 'all' && course.level !== selectedLevel) return false;
    if (selectedCategory !== 'all' && course.category !== selectedCategory) return false;
    return true;
  });

  const getLevelLabel = (level: string) => levels.find(l => l.value === level)?.label || level;
  const getCategoryLabel = (category: string) => categories.find(c => c.value === category)?.label || category;

  if (authLoading || courseLoading) return <Loading />;
  if (!user) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Korean Courses</h1>
          <p className="text-xl text-gray-600">Improve your Korean skills with systematically structured learning courses</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Level</label>
              <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                {levels.map((level) => <option key={level.value} value={level.value}>{level.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Category</label>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                {categories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <div key={course.id} className={`bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow ${course.isCompleted ? 'border-2 border-yellow-400' : ''}`}>
              <div className="relative h-48 bg-gray-200 flex items-center justify-center">
                {courseImageUrls[course.id] ? <img src={courseImageUrls[course.id]} alt={course.title} className='w-full h-full object-cover' /> : <div className="text-gray-500">Loading Image...</div>}
                {course.isCompleted && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-yellow-400 text-white font-bold px-2 py-1 rounded-md text-xs shadow-lg">
                        <FiAward />
                        <span>Completed</span>
                    </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{getLevelLabel(course.level)}</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">{getCategoryLabel(course.category)}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
                <p className="text-gray-600 text-sm mb-4 h-10 overflow-hidden">{course.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>⏱ {course.duration}</span>
                  <span>📚 {course.lessons} lessons</span>
                </div>
                
                <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1"><span>Progress</span><span>{course.progress}%</span></div>
                    <div className="w-full bg-gray-200 rounded-full h-2"><div className={`${course.isCompleted ? 'bg-yellow-400' : 'bg-blue-600'} h-2 rounded-full`} style={{ width: `${course.progress}%` }}></div></div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <span className="text-lg font-semibold text-green-600">Free</span>
                  <button onClick={() => handleStartOrContinue(course.id)} className={`${course.isCompleted ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-auto text-center`}>
                    {course.isCompleted ? 'Review Course' : (course.progress > 0 ? 'Continue Learning' : 'Start Learning')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-500">Try different filter conditions.</p>
          </div>
        )}
      </div>
    </div>
  );
}