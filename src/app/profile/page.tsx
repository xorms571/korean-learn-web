'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Loading from '@/components/Loading';
import { auth, db, storage } from '@/lib/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Achievement from '@/components/Achievement';
import { useProgress } from '@/hooks/useProgress';
import RecentCourses from '@/components/RecentCourses';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  // State for editing
  const [displayName, setDisplayName] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { achievements, enrolledCourses, progressOverview, formatStudyTime, FiAward } = useProgress()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (userProfile) {
      setDisplayName(userProfile.displayName);
      setPhotoPreview(userProfile.photoURL || null);
    }
  }, [user, loading, router, userProfile]);

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveChanges = async () => {
    if (!user || !userProfile) return;

    const profileChanged = displayName !== userProfile.displayName || photoFile;
    if (!profileChanged) {
      return; // No changes to save
    }

    setIsSaving(true);
    let newPhotoURL = userProfile.photoURL || '';

    try {
      // 1. Upload new photo if it exists
      if (photoFile) {
        const storageRef = ref(storage, `profile_pictures/${user.uid}`);
        const uploadResult = await uploadBytes(storageRef, photoFile);
        newPhotoURL = await getDownloadURL(uploadResult.ref);
      }

      // 2. Update Firestore user document
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        displayName: displayName,
        photoURL: newPhotoURL,
      });

      // 3. Update Firebase Auth profile
      await updateProfile(auth.currentUser!, {
        displayName: displayName,
        photoURL: newPhotoURL,
      });

      alert('Profile updated successfully!');

    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!user || !userProfile) {
    return null; // or a loading/error state
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-8 text-center">
            <div className="mb-6">
              <input
                type="file"
                id="photoInput"
                hidden
                accept="image/*"
                onChange={handlePhotoChange}
              />
              <label htmlFor="photoInput" className="cursor-pointer group relative block">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Profile"
                    className="w-24 h-24 rounded-full mx-auto border-4 border-blue-100 group-hover:opacity-75 transition-opacity"
                  />
                ) : (
                  <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto border-4 border-blue-200 flex items-center justify-center group-hover:opacity-75 transition-opacity">
                    <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <div className='absolute inset-0 flex items-center justify-center'>
                  <div className="w-24 h-24 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center rounded-full transition-opacity">
                    <p className="text-white opacity-0 group-hover:opacity-100">Change</p>
                  </div>
                </div>
              </label>
            </div>
            <h1 className="text-lg md:text-3xl font-bold text-gray-900 mb-2">{displayName}</h1>
            <p className="text-gray-600 mb-4">{userProfile.email}</p>
            <div className="flex flex-col md:flex-row justify-center gap-3 md:gap-6 text-sm text-gray-500">
              <span>Member since {userProfile.joinDate}</span>
              <span>Level {userProfile.currentLevel}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6 overflow-x-auto">
              {[
                { id: 'profile', label: 'Profile', icon: '👤' },
                { id: 'progress', label: 'Learning Progress', icon: '📊' },
                { id: 'achievements', label: 'Achievements', icon: '🏆' },
                { id: 'settings', label: 'Settings', icon: '⚙️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex text-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your display name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={userProfile.email}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400">
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {/* Progress Tab */}
            {activeTab === 'progress' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-orange-50 rounded-lg p-6 text-center">
                    <div className="text-2xl font-bold text-orange-600 mb-2">{userProfile.currentLevel}</div>
                    <div className="text-sm text-orange-600">Current Level</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-6 text-center">
                    <div className="text-2xl font-bold text-red-600 mb-2">{userProfile.completedLessons}</div>
                    <div className="text-sm text-red-600">Courses Completed</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-6 text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-2">{progressOverview.totalCompletedLessons}/{progressOverview.totalEnrolledLessons}</div>
                    <div className="text-sm text-blue-600">Lessens Completed</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-6 text-center">
                    <div className="text-2xl font-bold text-green-600 mb-2">{userProfile.streak || 0}</div>
                    <div className="text-sm text-green-600">Day Streak</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-6 text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-2">{formatStudyTime(userProfile.totalStudySeconds)}</div>
                    <div className="text-sm text-purple-600">Total Study Time</div>
                  </div>
                </div>

                {userProfile.completedLessons === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No progress data yet</h3>
                    <p className="text-gray-500 mb-4">Start learning to see your progress here!</p>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                      Start Learning
                    </button>
                  </div>
                ) : (
                  <RecentCourses FiAward={FiAward} enrolledCourses={enrolledCourses} />
                )}
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
              <Achievement achievements={achievements} />
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Email Notifications</h4>
                        <p className="text-sm text-gray-500">Receive updates about your learning progress</p>
                      </div>
                      <button className="bg-gray-200 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                        <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Study Reminders</h4>
                        <p className="text-sm text-gray-500">Daily reminders to continue learning</p>
                      </div>
                      <button className="bg-blue-600 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                        <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-red-900 mb-4">Danger Zone</h3>
                  <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
