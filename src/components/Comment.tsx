'use client';

import { useEffect, useState } from 'react';
import { db, getUsersByIds } from '@/lib/firebase';
import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    doc,
    updateDoc,
    deleteDoc,
} from 'firebase/firestore';
import { useAuth, UserProfile } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { FiSend, FiX, FiCornerDownRight } from 'react-icons/fi';

interface CommentData {
    id: string;
    userId: string;
    text: string;
    createdAt: any;
    parentId: string | null;
    // displayName and photoURL are no longer stored in the document
}

const CommentItem = ({
    comment,
    author,
    onReply,
    onEdit,
    onDelete,
    onSave,
    onCancelEdit,
    isEditingThisComment,
    editText,
    setEditText,
    currentUser,
    replies,
    editingId,
}: {
    comment: CommentData;
    author?: UserProfile;
    onReply: (id: string) => void;
    onEdit: (id: string, text: string) => void;
    onDelete: (id: string) => void;
    onSave: (id: string) => void;
    onCancelEdit: () => void;
    isEditingThisComment: boolean;
    editText: string;
    setEditText: (text: string) => void;
    currentUser: any;
    replies: { comment: CommentData, author?: UserProfile }[];
    editingId: string | null;
}) => {
    const authorName = author?.displayName || 'User';
    const authorAvatar = author?.photoURL || '/default-profile.png';

    return (
        <div className="flex items-start gap-3">
            <img
                src={authorAvatar}
                alt={authorName}
                className="rounded-full w-8 h-8 mt-1"
            />
            <div className="flex-1">
                <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-800">{authorName}</span>
                        <span className="text-xs text-gray-500">
                            {comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleString() : 'Loading...'}
                        </span>
                    </div>
                    {isEditingThisComment ? (
                        <div className="mt-2">
                            <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full border rounded-md px-3 py-2 text-sm"
                                rows={2}
                            />
                            <div className="flex gap-2 mt-2">
                                <button onClick={() => onSave(comment.id)} className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700">Save</button>
                                <button onClick={onCancelEdit} className="px-3 py-1 bg-gray-200 rounded-md text-xs font-semibold hover:bg-gray-300">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-700 mt-1">{comment.text}</p>
                    )}
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <button onClick={() => onReply(comment.id)} className="border px-3 rounded-lg font-semibold hover:text-blue-600">Reply</button>
                    {currentUser?.uid === comment.userId && (
                        <>
                            <button onClick={() => onEdit(comment.id, comment.text)} className="border px-3 rounded-lg font-semibold hover:text-green-600">Edit</button>
                            <button onClick={() => onDelete(comment.id)} className="border px-3 rounded-lg font-semibold hover:text-red-600">Delete</button>
                        </>
                    )}
                </div>

                {/* Replies */}
                <div className="mt-3 space-y-3">
                    {replies.map(reply => (
                        <div key={reply.comment.id} className="flex items-start gap-3">
                            <FiCornerDownRight className="text-gray-400 mt-2" />
                            <img
                                src={reply.author?.photoURL || '/default-profile.png'}
                                alt={reply.author?.displayName || 'User'}
                                className="rounded-full w-8 h-8 mt-1"
                            />
                            <div className="flex-1">
                                <div className="bg-gray-50 rounded-lg p-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-gray-800 text-sm">{reply.author?.displayName || 'User'}</span>
                                        <span className="text-xs text-gray-500">
                                            {reply.comment.createdAt?.toDate ? reply.comment.createdAt.toDate().toLocaleString() : 'Loading...'}
                                        </span>
                                    </div>
                                    {editingId === reply.comment.id ? (
                                        <div className="mt-2">
                                            <textarea
                                                value={editText}
                                                onChange={(e) => setEditText(e.target.value)}
                                                className="w-full border rounded-md px-3 py-2 text-sm"
                                                rows={2}
                                            />
                                            <div className="flex gap-2 mt-2">
                                                <button onClick={() => onSave(reply.comment.id)} className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700">Save</button>
                                                <button onClick={onCancelEdit} className="px-3 py-1 bg-gray-200 rounded-md text-xs font-semibold hover:bg-gray-300">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-700 mt-1 text-sm">{reply.comment.text}</p>
                                    )}
                                </div>
                                {currentUser?.uid === reply.comment.userId && editingId !== reply.comment.id && (
                                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                        <button onClick={() => onEdit(reply.comment.id, reply.comment.text)} className="border px-3 rounded-lg font-semibold hover:text-green-600">Edit</button>
                                        <button onClick={() => onDelete(reply.comment.id)} className="border px-3 rounded-lg font-semibold hover:text-red-600">Delete</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

interface CommentProps {
    courseId?: string;
    lessonId?: string;
    postId?: string;
}

export default function Comment({ courseId, lessonId, postId }: CommentProps) {
    const { user } = useAuth();
    const [comments, setComments] = useState<CommentData[]>([]);
    const [authors, setAuthors] = useState<Record<string, UserProfile>>({});
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');
    const router = useRouter();

    const getCommentsCollectionRef = () => {
        if (postId) {
            return collection(db, 'posts', postId, 'comments');
        } else if (courseId && lessonId) {
            return collection(db, 'courses', courseId, 'lessons', lessonId, 'comments');
        } else {
            throw new Error("Invalid props: Either postId or (courseId and lessonId) must be provided.");
        }
    };

    useEffect(() => {
        let commentsRef;
        try {
            commentsRef = getCommentsCollectionRef();
        } catch (error) {
            console.error(error);
            return;
        }

        const q = query(commentsRef, orderBy('createdAt', 'asc'));
        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommentData));
            setComments(data);

            if (data.length > 0) {
                const authorIds = [...new Set(data.map(c => c.userId))].filter(id => !authors[id]);
                if (authorIds.length > 0) {
                    const newAuthors = await getUsersByIds(authorIds);
                    setAuthors(prev => ({ ...prev, ...newAuthors }));
                }
            }
        });
        return () => unsubscribe();
    }, [courseId, lessonId, postId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        if (!user) {
            router.push('/login');
            return;
        }

        let commentsRef;
        try {
            commentsRef = getCommentsCollectionRef();
        } catch (error) {
            console.error(error);
            return;
        }

        await addDoc(commentsRef, {
            userId: user.uid,
            text: newComment,
            createdAt: serverTimestamp(),
            parentId: replyTo,
        });

        setNewComment('');
        setReplyTo(null);
    };

    const handleEdit = async (commentId: string) => {
        if (!editText.trim()) return;
        let commentRef;
        try {
            commentRef = doc(getCommentsCollectionRef(), commentId);
        } catch (error) {
            console.error(error);
            return;
        }
        await updateDoc(commentRef, { text: editText });
        setEditingId(null);
        setEditText('');
    };

    const handleDelete = async (commentId: string) => {
        let commentRef;
        try {
            commentRef = doc(getCommentsCollectionRef(), commentId);
        } catch (error) {
            console.error(error);
            return;
        }
        await deleteDoc(commentRef);
    };

    const rootComments = comments.filter(c => !c.parentId);
    const getReplies = (parentId: string) => comments
        .filter(c => c.parentId === parentId)
        .map(comment => ({ comment, author: authors[comment.userId] }));

    return (
        <div className="bg-white rounded-lg md:shadow-md md:p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Comments ({comments.length})</h3>

            {/* Comment Input Form */}
            <form onSubmit={handleSubmit} className="flex items-start gap-3 mb-6">
                {user && (
                    <img
                        src={user.photoURL || '/default-profile.png'}
                        alt={user.displayName || 'User'}
                        className="rounded-full w-8 h-8 mt-1"
                    />
                )}
                <div className="flex-1">
                    <textarea
                        placeholder={replyTo ? 'Write a reply...' : 'Add a comment...'}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        rows={replyTo ? 2 : 3}
                    />
                    <div className="flex items-center justify-end gap-2 mt-2">
                        {replyTo && (
                            <button type="button" onClick={() => setReplyTo(null)} className="flex items-center gap-1 px-3 py-2 bg-gray-200 rounded-md text-sm font-semibold hover:bg-gray-300">
                                <FiX /> Cancel
                            </button>
                        )}
                        <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50" disabled={!newComment.trim()}>
                            {replyTo ? 'Reply' : 'Post Comment'} <FiSend />
                        </button>
                    </div>
                </div>
            </form>

            {/* Comments List */}
            <div className="space-y-6">
                {rootComments.map(c => (
                    <CommentItem
                        key={c.id}
                        comment={c}
                        author={authors[c.userId]}
                        replies={getReplies(c.id)}
                        onReply={setReplyTo}
                        onEdit={(id, text) => {
                            setEditingId(id);
                            setEditText(text);
                        }}
                        onDelete={handleDelete}
                        onSave={handleEdit}
                        onCancelEdit={() => setEditingId(null)}
                        isEditingThisComment={editingId === c.id}
                        editText={editText}
                        setEditText={setEditText}
                        currentUser={user}
                        editingId={editingId}
                    />
                ))}
            </div>
        </div>
    );
}