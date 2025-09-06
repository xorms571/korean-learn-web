'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Loading from '@/components/Loading';
import { collection, getDocs, doc, getDoc, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FiAward } from 'react-icons/fi';

// --- Helper Functions ---
const formatStudyTime = (totalSeconds: number): string => {
    if (!totalSeconds) return '0m';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
};

// --- Interfaces ---
interface EnrolledCourse {
    id: string;
    title: string;
    description: string;
    progress: number;
    isCompleted?: boolean;
}

interface ProgressOverview {
    totalCompletedLessons: number;
    totalEnrolledLessons: number;
}

export default function DashboardPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [progressOverview, setProgressOverview] = useState<ProgressOverview>({ totalCompletedLessons: 0, totalEnrolledLessons: 0 });
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchDashboardData = async () => {
        try {
            const progressQuery = query(
                collection(db, 'user_progress', user.uid, 'enrolled_courses'),
                orderBy('lastAccessed', 'desc')
            );
            const progressSnapshot = await getDocs(progressQuery);

            let totalCompleted = 0;
            let totalEnrolled = 0;

            const coursesData = await Promise.all(progressSnapshot.docs.map(async (progressDoc) => {
                const courseId = progressDoc.id;
                const progressData = progressDoc.data();

                const courseDoc = await getDoc(doc(db, 'courses', courseId));
                if (courseDoc.exists()) {
                    const courseData = courseDoc.data();
                    totalCompleted += progressData.completedLessons?.length || 0;
                    totalEnrolled += courseData.lessonsCount || 0;

                    return {
                        id: courseId,
                        title: courseData.title,
                        description: courseData.description,
                        progress: progressData.progress || 0,
                        isCompleted: progressData.isCompleted || false,
                    };
                }
                return null;
            }));

            setEnrolledCourses(coursesData.filter(c => c !== null) as EnrolledCourse[]);
            setProgressOverview({ totalCompletedLessons: totalCompleted, totalEnrolledLessons: totalEnrolled });

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setDataLoading(false);
        }
    };

    fetchDashboardData();
  }, [user, authLoading, router]);

  const loading = authLoading || dataLoading;

  if (loading) {
    return <Loading/>;
  }

  if (!user || !userProfile) {
    return null; // Should be redirected by the effect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Hello, {userProfile.displayName}!</h1>
          <p className="text-gray-600 mt-2">Welcome to your Korean learning journey.</p>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current Level</p>
                <p className="text-2xl font-semibold text-gray-900">{userProfile.currentLevel}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Lessons</p>
                <p className="text-2xl font-semibold text-gray-900">{progressOverview.totalCompletedLessons}/{progressOverview.totalEnrolledLessons}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Study Streak</p>
                <p className="text-2xl font-semibold text-gray-900">{userProfile.streak || 0} days</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Study Time</p>
                <p className="text-2xl font-semibold text-gray-900">{formatStudyTime(userProfile.totalStudySeconds)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Courses */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Courses</h2>
            </div>
            <div className="p-6">
              {enrolledCourses.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No courses started yet</h3>
                  <p className="text-gray-500 mb-4">Start your first Korean lesson to see your progress here.</p>
                  <Link 
                    href="/courses" 
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Browse Courses
                  </Link>
                </div>
              ) : (
                <ul className="space-y-4">
                    {enrolledCourses.map(course => (
                        <li key={course.id} className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold text-gray-800">{course.title}</h3>
                                {course.isCompleted && (
                                    <span className="flex items-center gap-1 text-xs bg-yellow-400 text-white font-bold px-2 py-1 rounded-md">
                                        <FiAward/> Completed
                                    </span>
                                )}
                            </div>
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                                <span>Progress</span>
                                <span>{course.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                                <div className={`${course.isCompleted ? 'bg-yellow-400' : 'bg-blue-600'} h-2 rounded-full`} style={{ width: `${course.progress}%` }}></div>
                            </div>
                            <Link href={`/courses/${course.id}`} className="text-blue-600 hover:underline text-sm font-medium">
                                {course.isCompleted ? 'Review Course' : 'Continue Learning'}
                            </Link>
                        </li>
                    ))}
                </ul>
              )}
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Achievements</h2>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements yet</h3>
                <p className="text-gray-500">Complete lessons and reach milestones to earn achievements!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Start</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              href="/courses" 
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="p-2 bg-blue-100 rounded-lg mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Start Learning</h3>
                <p className="text-sm text-gray-500">Begin your Korean journey</p>
              </div>
            </Link>

            <Link 
              href="/community" 
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
            >
              <div className="p-2 bg-green-100 rounded-lg mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Community</h3>
                <p className="text-sm text-gray-500">Connect with other learners</p>
              </div>
            </Link>

            <Link 
              href="/profile" 
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
            >
              <div className="p-2 bg-purple-100 rounded-lg mr-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Profile</h3>
                <p className="text-sm text-gray-500">Manage your settings</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}