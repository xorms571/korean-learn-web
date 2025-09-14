
import { useEffect, useState } from 'react';

interface Course {
  id: string;
  title: string;
}

export function useCourseImages(courses: Course[]) {
    const [courseImageUrls, setCourseImageUrls] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchImages = async () => {
            for (const course of courses) {
                if (courseImageUrls[course.id]) continue;

                try {
                    const response = await fetch(
                        `/api/pexels?query=${encodeURIComponent(course.title)}`
                    );
                    if (response.ok) {
                        const data = await response.json();
                        if (data.imageUrl) {
                            setCourseImageUrls(prev => ({ ...prev, [course.id]: data.imageUrl }));
                        }
                    }
                } catch (error) {
                    console.error(`Error fetching image for "${course.title}":`, error);
                }
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        };

        if (courses.length > 0) {
            fetchImages();
        }
    }, [courses, courseImageUrls]);

    return { courseImageUrls };
}
