import React, { useEffect, useState } from 'react';
import { ContentItem, Comment } from '../types';
import { addComment, deleteComment, subscribeToComments } from '../services/firebase';
import { ArrowLeft, Send, Trash2, MessageCircle, Smile } from 'lucide-react';

interface BlogPostDetailProps {
  post: ContentItem;
  isAdmin: boolean;
  onBack: () => void;
}

const BlogPostDetail: React.FC<BlogPostDetailProps> = ({ post, isAdmin, onBack }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeToComments(post.id, setComments);
    return () => unsubscribe();
  }, [post.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;
    
    await addComment(post.id, name, content);
    setName('');
    setContent('');
  };

  const handleDeleteComment = async (id: string) => {
    if (window.confirm('댓글을 삭제하시겠습니까?')) {
      await deleteComment(id);
    }
  };

  return (
    <div className="flex flex-col animate-fade-in h-full">
      {/* Title & Back Button Section */}
      <div className="mb-6 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <button 
            onClick={onBack}
            className="hover:bg-gray-100 p-2 rounded-full transition-colors clickable -ml-2"
            title="뒤로가기"
          >
            <ArrowLeft size={24} className="text-cy-dark" />
          </button>
          <h2 className="text-xl md:text-2xl font-bold font-pixel text-cy-dark break-keep leading-snug">
            {post.title || "무제"}
          </h2>
        </div>
        <div className="text-xs text-gray-400 font-pixel pl-2">
          {new Date(post.createdAt).toLocaleString()}
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-10 pl-2 min-h-[150px]">
        {/* Render Image if exists */}
        {post.imageUrl && (
          <div className="mb-6 rounded-lg overflow-hidden border border-gray-100 shadow-sm">
            <img 
              src={post.imageUrl} 
              alt="Post Image" 
              className="w-full h-auto"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}

        <div className="whitespace-pre-wrap leading-relaxed text-gray-800 text-base font-hand">
          {post.content}
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-auto border-t border-gray-100 pt-6">
        <h3 className="font-bold text-cy-dark mb-4 font-pixel flex items-center gap-2 text-sm pl-2">
          <MessageCircle size={16} />
          댓글 <span className="text-cy-orange">{comments.length}</span>
        </h3>

        {/* Comment List */}
        <div className="space-y-3 mb-2 px-1">
          {comments.length === 0 ? (
            <p className="text-gray-400 text-xs py-2 pl-2">첫 번째 댓글을 남겨보세요!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50/50 border border-gray-100 rounded p-3 text-sm relative group hover:bg-gray-50 transition-colors">
                {isAdmin && (
                  <button 
                    onClick={() => handleDeleteComment(comment.id)}
                    className="absolute top-2 right-2 text-gray-300 hover:text-red-500 clickable"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-cy-blue text-xs">{comment.name}</span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap text-xs">{comment.content}</p>
              </div>
            ))
          )}
        </div>

        {/* Comment Form - Sticky Bottom */}
        <div className="sticky bottom-0 bg-white pt-2 pb-0 z-10">
          <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="이름"
                  className="w-24 text-xs p-2 border border-gray-200 rounded focus:outline-none focus:border-cy-orange bg-white"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <div 
                  className="bg-orange-100 p-1.5 rounded-full text-cy-orange clickable cursor-pointer hover:bg-orange-200 transition-colors"
                  onClick={() => alert('실명으로 해주면 감사하겠어')}
                >
                  <Smile size={16} />
                </div>
              </div>

              <div className="flex gap-2 w-full">
                <textarea
                  placeholder="댓글을 입력하세요..."
                  className="flex-1 min-w-0 text-xs p-2 focus:outline-none resize-none h-10 border border-gray-200 rounded focus:border-cy-orange bg-white"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
                <button 
                  type="submit"
                  className="bg-cy-dark text-white rounded px-4 py-1 hover:bg-gray-700 transition-colors clickable flex items-center justify-center shrink-0"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BlogPostDetail;