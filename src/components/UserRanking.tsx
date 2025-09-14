import { UserProfile } from '@/hooks/useAuth';
import { useProgress } from '@/hooks/useProgress';
import React, { useEffect, useState } from 'react';

export default function UserRanking() {
  const { collection, query, orderBy, limit, getDocs, db } = useProgress()
  const [topUsers, setTopUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        setLoading(true);
        const usersRef = collection(db, 'users');
        // Fetch users ordered by completedLessons (completed courses)
        // We fetch more than 10 to ensure we have enough data for client-side re-ranking
        const q = query(usersRef, orderBy('completedLessons', 'desc'), limit(20)); // Fetch more users
        const querySnapshot = await getDocs(q);

        let usersData: UserProfile[] = [];
        querySnapshot.forEach((doc) => {
          usersData.push(doc.data() as UserProfile);
        });

        // Calculate weighted score and sort on client-side
        const rankedUsers = usersData.map(user => {
          const completedCoursesWeight = user.completedLessons || 0;
          const individualLessonsWeight = user.totalIndividualLessonsCompleted || 0;
          // Assign more weight to completedCourses
          const rankingScore = (completedCoursesWeight * 100) + individualLessonsWeight;
          return { ...user, rankingScore };
        }).sort((a, b) => b.rankingScore - a.rankingScore)
          .slice(0, 10); // Take top 10 after re-ranking

        setTopUsers(rankedUsers);
      } catch (error) {
        console.error("Error fetching top users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopUsers();
  }, [collection, query, orderBy, limit, getDocs, db]); // Add dependencies

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Ranking</h3>
        <div className="text-center py-4 text-gray-500">Loading ranking...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">User Ranking</h3>
      {topUsers.length === 0 ? (
        <div className="text-center py-4 text-gray-500">No users to display ranking.</div>
      ) : (
        <ul className="space-y-3">
          {topUsers.map((user, index) => (
            <li key={user.uid} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
              <div>
                <div className="flex items-center">
              <span className="font-bold text-gray-700 mr-3 w-7 text-center">#{index + 1}</span>
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full mr-3" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3 text-gray-500 text-sm">
                      {user.displayName ? user.displayName.charAt(0) : 'U'}
                    </div>
                  )}
                  <span className="font-medium text-gray-800 text-nowrap truncate w-14">{user.displayName}</span>
                </div>
              </div>
              <div className="text-right flex flex-col w-[63.7px]">
                <span className='text-blue-500 text-sm font-semibold text-nowrap'>{user.currentLevel}</span>
                <span className="block text-sm text-blue-400 text-nowrap">{user.completedLessons} courses</span>
                <span className="block text-xs text-gray-500 text-nowrap">{user.totalIndividualLessonsCompleted || 0} lessons</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
