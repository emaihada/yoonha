import React, { useState } from 'react';
import Layout from '../components/Layout';
import ContentList from '../components/ContentList';
import BlogPostDetail from '../components/BlogPostDetail';
import { User } from 'firebase/auth';
import { ContentItem } from '../types';

interface PageProps {
  user: User | null;
}

const Log: React.FC<PageProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'blog' | 'memo'>('blog');
  const [selectedPost, setSelectedPost] = useState<ContentItem | null>(null);

  // Custom title with breadcrumb for Detail View
  const getTitle = () => {
    if (selectedPost) {
      return (
        <div className="flex items-center gap-2">
          <span 
            onClick={() => setSelectedPost(null)} 
            className="cursor-pointer hover:underline hover:text-cy-blue transition-colors"
          >
            기록장
          </span>
          <span className="text-gray-300 text-sm font-hand">&gt;</span>
          <span>읽기</span>
        </div>
      );
    }
    return "기록장";
  };

  // If a post is selected, show the detail view
  if (selectedPost) {
    return (
      <Layout title={getTitle()}>
        <BlogPostDetail 
          post={selectedPost} 
          isAdmin={!!user} 
          onBack={() => setSelectedPost(null)} 
        />
      </Layout>
    );
  }

  return (
    <Layout title="기록장">
      {/* Internal Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('blog')}
          className={`pb-2 px-2 font-pixel text-lg clickable ${activeTab === 'blog' ? 'text-cy-orange border-b-2 border-cy-orange' : 'text-gray-400'}`}
        >
          긴 글
        </button>
        <button 
          onClick={() => setActiveTab('memo')}
          className={`pb-2 px-2 font-pixel text-lg clickable ${activeTab === 'memo' ? 'text-cy-orange border-b-2 border-cy-orange' : 'text-gray-400'}`}
        >
          짧은 글
        </button>
      </div>

      {activeTab === 'blog' ? (
        <ContentList 
          category="blog" 
          isAdmin={!!user}
          showTitleInput
          displayMode="blog"
          placeholder="긴 글을 작성해보세요..."
          onItemClick={(item) => setSelectedPost(item)}
        />
      ) : (
        <div className="bg-yellow-50 p-6 rounded shadow-inner min-h-[300px]">
           <ContentList 
            category="memo" 
            isAdmin={!!user}
            placeholder="짧은 생각..."
          />
        </div>
      )}
    </Layout>
  );
};

export default Log;