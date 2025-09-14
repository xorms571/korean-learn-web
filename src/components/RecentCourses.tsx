
import { EnrolledCourse } from "@/hooks/useProgress";
import Link from "next/link";
import { IconType } from "react-icons";

export default function RecentCourses({ enrolledCourses, FiAward }: { enrolledCourses: EnrolledCourse[], FiAward: IconType }) {
    return (
        <>
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
                    {enrolledCourses.map(course => {
                        const courseUrl = course.category === 'Words' ? `/courses/word/${course.id}` : `/courses/sentence/${course.id}`;
                        return (
                            <li key={course.id} className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-semibold text-gray-800">{course.title}</h3>
                                    {course.isCompleted && (
                                        <span className="flex items-center gap-1 text-xs bg-yellow-400 text-white font-bold px-2 py-1 rounded-md">
                                            <FiAward /> Completed
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
                                <Link href={courseUrl} className="text-blue-600 hover:underline text-sm font-medium">
                                    {course.isCompleted ? 'Review Course' : 'Continue Learning'}
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            )}
        </>
    )
}
