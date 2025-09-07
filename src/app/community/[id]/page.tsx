'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getPost, toggleLike, deletePost } from '@/lib/firebase';
import { Post } from '@/types/post';
import Loading from '@/components/Loading';
import Comment from '@/components/Comment';
import { FiHeart } from 'react-icons/fi';

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    /*if (!user) {
      router.replace('/login');
      return;
    }*/

    const fetchPost = async () => {
      setIsLoadingPost(true);
      const fetchedPost = await getPost(id);
      setPost(fetchedPost);
      setIsLoadingPost(false);
    };

    fetchPost();
  }, [id, user, loading, router]);

  const handleLikeToggle = async () => {
    if (!user || !post) return;
    await toggleLike(post.id, user.uid);
    // Optimistically update UI or re-fetch post to show updated likes
    setPost(prevPost => {
      if (!prevPost) return null;
      const newLikes = prevPost.likes.includes(user.uid)
        ? prevPost.likes.filter(uid => uid !== user.uid)
        : [...prevPost.likes, user.uid];
      return { ...prevPost, likes: newLikes };
    });
  };

  const handleDelete = async () => {
    if (!user || !post || user.uid !== post.authorId) return;
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(post.id);
        router.push('/community');
      } catch (error) {
        console.error("Error deleting post: ", error);
        alert("Failed to delete post.");
      }
    }
  };

  if (loading || isLoadingPost /*|| !user*/) {
    return <Loading />;
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-xl text-gray-600">Post not found.</p>
      </div>
    );
  }

  const isLiked = user && post.likes.includes(user.uid);

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
          <div className="flex items-center text-sm text-gray-600 mb-4">
            <img src={post.authorAvatar} alt={post.authorName} className="w-8 h-8 rounded-full mr-2" />
            <span>By {post.authorName}</span>
            <span className="mx-2">•</span>
            <span>{new Date(post.createdAt?.toDate()).toLocaleString()}</span>
            <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium ml-4">
              #{post.category}
            </span>
          </div>
          <div className="prose max-w-none mb-6">
            <p className='whitespace-pre-wrap my-10 text-slate-600'>{post.content}</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLikeToggle}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold transition-colors ${isLiked ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              <FiHeart className={isLiked ? 'fill-current' : ''} />
              {post.likes.length} Likes
            </button>
            {user && user.uid === post.authorId && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push(`/community/edit/${post.id}`)}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="text-sm font-semibold text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <Comment postId={id} />
      </div>
    </div>
  );
}
