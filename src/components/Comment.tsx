"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
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
} from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

interface Comment {
    id: string;
    userId: string;
    displayName: string;
    photoURL?: string;
    text: string;
    createdAt: any;
    parentId: string | null;
}

export default function Comment({
    courseId,
    lessonId,
}: {
    courseId: string;
    lessonId: string;
}) {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [replyTo, setReplyTo] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState("");
    const router = useRouter();

    useEffect(() => {
        const commentsRef = collection(
            db,
            "courses",
            courseId,
            "lessons",
            lessonId,
            "comments"
        );

        const q = query(commentsRef, orderBy("createdAt", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(
                (doc) =>
                ({
                    id: doc.id,
                    ...doc.data(),
                } as Comment)
            );
            setComments(data);
        });

        return () => unsubscribe();
    }, [courseId, lessonId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        if (!user) {
            router.push("/login");
            return;
        }

        const commentsRef = collection(
            db,
            "courses",
            courseId,
            "lessons",
            lessonId,
            "comments"
        );

        await addDoc(commentsRef, {
            userId: user.uid,
            displayName: user.displayName || "Anonymous",
            photoURL: user.photoURL || "/default-profile.png",
            text: newComment,
            createdAt: serverTimestamp(),
            parentId: replyTo,
        });

        setNewComment("");
        setReplyTo(null);
    };

    const handleEdit = async (commentId: string) => {
        if (!editText.trim()) return;
        const commentRef = doc(
            db,
            "courses",
            courseId,
            "lessons",
            lessonId,
            "comments",
            commentId
        );
        await updateDoc(commentRef, { text: editText });
        setEditingId(null);
        setEditText("");
    };

    const handleDelete = async (commentId: string) => {
        const commentRef = doc(
            db,
            "courses",
            courseId,
            "lessons",
            lessonId,
            "comments",
            commentId
        );
        await deleteDoc(commentRef);
    };

    const rootComments = comments.filter((c) => !c.parentId);
    const getReplies = (parentId: string) =>
        comments.filter((c) => c.parentId === parentId);

    return (
        <div className="max-w-7xl mx-auto p-8 text-gray-700">
            <h3 className="font-semibold mb-2">Comments</h3>

            <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
                <input
                    type="text"
                    placeholder={
                        replyTo ? "Write a reply..." : "Add a comment..."
                    }
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 border rounded px-3 py-2"
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                    {replyTo ? "Reply" : "Post"}
                </button>
                {replyTo && (
                    <button
                        type="button"
                        onClick={() => setReplyTo(null)}
                        className="px-3 py-2 bg-gray-300 rounded"
                    >
                        Cancel
                    </button>
                )}
            </form>

            <ul className="space-y-4">
                {rootComments.map((c) => (
                    <li key={c.id} className="border rounded p-3 bg-gray-50">
                        <div className="flex items-center gap-2 mb-1">
                            <img
                                src={c.photoURL || "/default-profile.png"}
                                alt={c.displayName}
                                className="rounded-full w-8 h-8"
                            />
                            <span className="font-medium">{c.displayName}</span>
                            <span className="text-xs text-gray-400 ml-auto">
                                {c.createdAt?.toDate
                                    ? c.createdAt.toDate().toLocaleString()
                                    : "Loading..."}
                            </span>
                        </div>

                        {editingId === c.id ? (
                            <div className="flex gap-2 mt-2">
                                <input
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    className="flex-1 border rounded px-2 py-1"
                                />
                                <button
                                    onClick={() => handleEdit(c.id)}
                                    className="px-3 py-1 bg-blue-600 text-white rounded"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setEditingId(null)}
                                    className="px-3 py-1 bg-gray-300 rounded"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <p className="ml-10">{c.text}</p>
                        )}

                        <div className="flex gap-2 mt-2 text-sm ml-10">
                            <button
                                onClick={() => setReplyTo(c.id)}
                                className="text-blue-600"
                            >
                                Reply
                            </button>
                            {user?.uid === c.userId && (
                                <>
                                    <button
                                        onClick={() => {
                                            setEditingId(c.id);
                                            setEditText(c.text);
                                        }}
                                        className="text-green-600"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(c.id)}
                                        className="text-red-600"
                                    >
                                        Delete
                                    </button>
                                </>
                            )}
                        </div>

                        <ul className="ml-12 mt-2 space-y-2">
                            {getReplies(c.id).map((reply) => (
                                <li
                                    key={reply.id}
                                    className="border rounded p-2 bg-gray-100"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <img
                                            src={reply.photoURL || "/default-profile.png"}
                                            alt={reply.displayName}
                                            className="rounded-full w-8 h-8"
                                        />
                                        <span className="font-medium">{reply.displayName}</span>
                                        <span className="text-xs text-gray-400 ml-auto">
                                            {reply.createdAt?.toDate
                                                ? reply.createdAt.toDate().toLocaleString()
                                                : "Loading..."}
                                        </span>
                                    </div>
                                    <p className="ml-8">{reply.text}</p>
                                    {user?.uid === reply.userId && (
                                        <div className="flex gap-2 mt-1 ml-8 text-xs">
                                            <button
                                                onClick={() => {
                                                    setEditingId(reply.id);
                                                    setEditText(reply.text);
                                                }}
                                                className="text-green-600"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(reply.id)}
                                                className="text-red-600"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </div>
    );
}
