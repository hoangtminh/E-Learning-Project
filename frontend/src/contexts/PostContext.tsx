'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import {
  ClassroomPost,
  ClassroomPostComment,
  getPosts as apiGetPosts,
  createPost as apiCreatePost,
  updatePost as apiUpdatePost,
  deletePost as apiDeletePost,
  getComments as apiGetComments,
  createComment as apiCreateComment,
  updateComment as apiUpdateComment,
  deleteComment as apiDeleteComment,
} from '@/api/classroom';

interface PostContextType {
  posts: ClassroomPost[];
  loadingPosts: boolean;
  commentsMap: Record<string, ClassroomPostComment[]>;
  loadingComments: Record<string, boolean>;

  fetchPosts: (classroomId: string) => Promise<void>;
  createPost: (classroomId: string, content: string) => Promise<void>;
  updatePost: (
    classroomId: string,
    postId: string,
    content: string,
  ) => Promise<void>;
  deletePost: (classroomId: string, postId: string) => Promise<void>;

  fetchComments: (classroomId: string, postId: string) => Promise<void>;
  createComment: (
    classroomId: string,
    postId: string,
    content: string,
  ) => Promise<void>;
  updateComment: (
    classroomId: string,
    postId: string,
    commentId: string,
    content: string,
  ) => Promise<void>;
  deleteComment: (
    classroomId: string,
    postId: string,
    commentId: string,
  ) => Promise<void>;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export function PostProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<ClassroomPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [commentsMap, setCommentsMap] = useState<
    Record<string, ClassroomPostComment[]>
  >({});
  const [loadingComments, setLoadingComments] = useState<
    Record<string, boolean>
  >({});

  const fetchPosts = useCallback(async (classroomId: string) => {
    setLoadingPosts(true);
    try {
      const res = await apiGetPosts(classroomId);
      if (res.success && res.data) {
        setPosts(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  const createPost = useCallback(
    async (classroomId: string, content: string) => {
      const res = await apiCreatePost(classroomId, content);
      if (!res.success) throw new Error(res.error || 'Đăng bài thất bại');
      if (res.data) {
        setPosts((prev) => [res.data!, ...prev]);
      }
    },
    [],
  );

  const updatePost = useCallback(
    async (classroomId: string, postId: string, content: string) => {
      const res = await apiUpdatePost(classroomId, postId, content);
      if (!res.success)
        throw new Error(res.error || 'Cập nhật bài viết thất bại');
      if (res.data) {
        setPosts((prev) => prev.map((p) => (p.id === postId ? res.data! : p)));
      }
    },
    [],
  );

  const deletePost = useCallback(
    async (classroomId: string, postId: string) => {
      const res = await apiDeletePost(classroomId, postId);
      if (!res.success) throw new Error(res.error || 'Xóa bài viết thất bại');
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    },
    [],
  );

  const fetchComments = useCallback(
    async (classroomId: string, postId: string) => {
      setLoadingComments((prev) => ({ ...prev, [postId]: true }));
      try {
        const res = await apiGetComments(classroomId, postId);
        if (res.success && res.data) {
          setCommentsMap((prev) => ({ ...prev, [postId]: res.data! }));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingComments((prev) => ({ ...prev, [postId]: false }));
      }
    },
    [],
  );

  const createComment = useCallback(
    async (classroomId: string, postId: string, content: string) => {
      const res = await apiCreateComment(classroomId, postId, content);
      if (!res.success) throw new Error(res.error || 'Gửi bình luận thất bại');
      if (res.data) {
        setCommentsMap((prev) => ({
          ...prev,
          [postId]: [...(prev[postId] || []), res.data!],
        }));
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  _count: {
                    ...p._count,
                    comments: (p._count?.comments || 0) + 1,
                  },
                }
              : p,
          ),
        );
      }
    },
    [],
  );

  const updateComment = useCallback(
    async (
      classroomId: string,
      postId: string,
      commentId: string,
      content: string,
    ) => {
      const res = await apiUpdateComment(classroomId, commentId, content);
      if (!res.success)
        throw new Error(res.error || 'Cập nhật bình luận thất bại');
      if (res.data) {
        setCommentsMap((prev) => ({
          ...prev,
          [postId]: (prev[postId] || []).map((c) =>
            c.id === commentId ? res.data! : c,
          ),
        }));
      }
    },
    [],
  );

  const deleteComment = useCallback(
    async (classroomId: string, postId: string, commentId: string) => {
      const res = await apiDeleteComment(classroomId, commentId);
      if (!res.success) throw new Error(res.error || 'Xóa bình luận thất bại');
      setCommentsMap((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).filter((c) => c.id !== commentId),
      }));
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                _count: {
                  ...p._count,
                  comments: Math.max(0, (p._count?.comments || 0) - 1),
                },
              }
            : p,
        ),
      );
    },
    [],
  );

  const contextValue = useMemo(
    () => ({
      posts,
      loadingPosts,
      commentsMap,
      loadingComments,
      fetchPosts,
      createPost,
      updatePost,
      deletePost,
      fetchComments,
      createComment,
      updateComment,
      deleteComment,
    }),
    [
      posts,
      loadingPosts,
      commentsMap,
      loadingComments,
      fetchPosts,
      createPost,
      updatePost,
      deletePost,
      fetchComments,
      createComment,
      updateComment,
      deleteComment,
    ],
  );

  return (
    <PostContext.Provider value={contextValue}>{children}</PostContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error('usePosts must be used within a PostProvider');
  }
  return context;
}
