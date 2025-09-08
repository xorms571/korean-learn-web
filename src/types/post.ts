export interface Post {
  id: string;
  authorId: string;
  authorName?: string;
  authorAvatar?: string;
  title: string;
  content: string;
  category: string;
  createdAt: any; // Firestore timestamp
  likes: string[];
  commentCount: number;
}
