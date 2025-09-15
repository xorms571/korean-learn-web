
'use client';

import Link from 'next/link';
import { FaPen, FaBook, FaComment } from 'react-icons/fa';

const courses = [
  {
    name: 'Hangeul',
    description: 'Learn the Korean alphabet, Hangeul, and master the basics of reading and writing.',
    link: '/courses/hangeul',
    icon: <FaPen className="text-4xl text-white" />,
    color: 'bg-blue-500',
  },
  {
    name: 'Word',
    description: 'Expand your vocabulary with essential Korean words for everyday conversation.',
    link: '/courses/word',
    icon: <FaBook className="text-4xl text-white" />,
    color: 'bg-green-500',
  },
  {
    name: 'Sentence',
    description: 'Learn to form natural Korean sentences and understand grammatical structures.',
    link: '/courses/sentence',
    icon: <FaComment className="text-4xl text-white" />,
    color: 'bg-purple-500',
  },
];

const CoursesPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">Our Courses</h1>
          <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
            Choose a path and start your journey to mastering Korean.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <Link href={course.link} key={course.name}>
              <div className="block p-8 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer h-full flex flex-col justify-between bg-white">
                <div>
                  <div className={`w-16 h-16 rounded-full ${course.color} flex items-center justify-center mb-6`}>
                    {course.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-3">{course.name}</h2>
                  <p className="text-gray-600">{course.description}</p>
                </div>
                <div className="mt-6">
                  <span className="font-semibold text-lg text-gray-800 hover:text-blue-600">
                    Start Learning &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CoursesPage;
