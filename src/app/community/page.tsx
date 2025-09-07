'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Loading from '@/components/Loading';
import CreatePost from '@/components/CreatePost';
import PostCard from '@/components/PostCard';
import { getPosts } from '@/lib/firebase';
import { Post } from '@/types/post';

export default function CommunityPage() {
  const { user, loading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    /*if (!user) {
      router.replace('/login');
    }*/
  }, [user, loading, router]);

  const fetchPosts = async () => {
    setIsLoadingPosts(true);
    const fetchedPosts = await getPosts();
    setPosts(fetchedPosts);
    setIsLoadingPosts(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    return posts
      .filter(post => 
        activeTab === 'all' || post.category === activeTab
      )
      .filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [posts, activeTab, searchQuery]);

  const categories = ['all', 'general', 'grammar', 'vocabulary', 'pronunciation', 'culture'];

  if (loading /*|| !user*/) return <Loading />;

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Community</h1>
          <p className="text-gray-600">Connect with other Korean learners, ask questions, and share your progress.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{posts.length}</div>
            <div className="text-sm text-gray-600">Total Posts</div>
          </div>
          {/* Other stats can be implemented here */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <CreatePost onPostCreated={fetchPosts} />

            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                {isLoadingPosts ? (
                  <div className="text-center py-12">Loading posts...</div>
                ) : filteredPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
                    <p className="text-gray-500">Try adjusting your search or filter.</p>
                  </div>
                ) : (
                  <div>
                    {filteredPosts.map(post => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveTab(category)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeTab === category
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Guidelines</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Be respectful and supportive</li>
                <li>• Ask clear, specific questions</li>
                <li>• Share your learning experiences</li>
                <li>• Help other learners when you can</li>
                <li>• Keep discussions on-topic</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
