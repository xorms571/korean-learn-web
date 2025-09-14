
import { SetStateAction } from "react";
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

interface type {
    selectedLevel: string;
    setSelectedLevel: (value: SetStateAction<string>) => void;
    levels: {
        value: string;
        label: string;
    }[];
    selectedCategory: string;
    categories: {
        value: string;
        label: string;
    }[];
    courses: Course[];
    courseImageUrls: Record<string, string>;
    getLevelLabel: (level: string) => string;
    getCategoryLabel: (category: string) => string;
    handleStartOrContinue: (courseId: string) => Promise<void>;
    setSelectedCategory: (value: SetStateAction<string>) => void;
    title: string;
    description: string;
}
export default function CoursesList({
    title, 
    description,
    categories,
    courseImageUrls,
    courses,
    getCategoryLabel,
    getLevelLabel,
    levels,
    selectedCategory,
    selectedLevel,
    setSelectedLevel,
    handleStartOrContinue,
    setSelectedCategory }: type) {

    const filteredCourses = courses.filter(course => {
        if (selectedLevel !== 'all' && course.level.toLowerCase() !== selectedLevel) return false;
        if (selectedCategory !== 'all' && course.category.toLowerCase() !== selectedCategory) return false;
        return true;
    });

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="md:text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
                    <p className="text-xl text-gray-600">{description}</p>
                </div>

                <div className="md:bg-white rounded-lg md:shadow md:p-6 mb-8">
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
                                {courseImageUrls[course.id] ? <img src={courseImageUrls[course.id]} alt={course.title} className='w-full h-full object-cover fade-in-image' /> : <div className="text-gray-500">Loading Image...</div>}
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
    )
}
