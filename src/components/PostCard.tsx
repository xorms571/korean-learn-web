'use client';

import Link from 'next/link';
import { Post } from '@/types/post';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/community/${post.id}`} className="block hover:bg-gray-50 p-4 border-b border-gray-200">
        <div className="flex items-center mb-2">
          <img src={post.authorAvatar} alt={post.authorName} className="w-8 h-8 rounded-full mr-3" />
          <div>
            <p className="font-semibold text-sm text-gray-800">{post.authorName}</p>
            <p className="text-xs text-gray-500">{new Date(post.createdAt?.toDate()).toLocaleString()}</p>
          </div>
        </div>
        <h3 className="font-bold text-lg text-gray-900 mb-1">{post.title}</h3>
        <p className="text-gray-700 text-sm mb-3 truncate">{post.content}</p>
        <div className="flex items-center text-xs text-gray-500">
          <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium mr-2">
            #{post.category}
          </span>
          <span className="mr-4">{post.likes.length} Likes</span>
          <span>{post.commentCount} Comments</span>
        </div>
    </Link>
  );
}
