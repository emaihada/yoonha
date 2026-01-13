import React, { useEffect, useState } from 'react';
import { addContentItem, deleteContentItem, subscribeToContent } from '../services/firebase';
import { ContentItem } from '../types';
import { Trash2, PlusCircle, ArrowRight, Image as ImageIcon } from 'lucide-react';
import MemoItem from './MemoItem';
import ConfirmModal from './ConfirmModal';

interface ContentListProps {
  category: string; // e.g., 'manual_do', 'blog', 'memo'
  title?: string;
  isAdmin: boolean;
  showTitleInput?: boolean;
  showLinkInput?: boolean;
  showImageInput?: boolean; // New prop for image URL
  placeholder?: string;
  displayMode?: 'list' | 'card' | 'blog';
  onItemClick?: (item: ContentItem) => void;
}

const ContentList: React.FC<ContentListProps> = ({ 
  category, 
  isAdmin, 
  title, 
  showTitleInput, 
  showLinkInput,
  showImageInput,
  placeholder = "내용을 입력하세요...",
  displayMode = 'list',
  onItemClick
}) => {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemLink, setNewItemLink] = useState('');
  const [newItemImageUrl, setNewItemImageUrl] = useState('');
  
  // Modal State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToContent(category, setItems);
    return () => unsubscribe();
  }, [category]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    // Firestore throws error if field value is undefined. 
    // We construct the object conditionally to avoid undefined values.
    const payload: any = {
      category,
      content: newItemText,
      createdAt: Date.now(),
      commentCount: 0 // Initialize comment count
    };

    if (showTitleInput) {
      payload.title = newItemTitle;
    }

    if (showLinkInput) {
      payload.link = newItemLink;
    }

    if (showImageInput) {
      payload.imageUrl = newItemImageUrl;
    }

    await addContentItem(payload);
    
    setNewItemText('');
    setNewItemTitle('');
    setNewItemLink('');
    setNewItemImageUrl('');
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await deleteContentItem(deleteId);
      setDeleteId(null);
    }
  };

  // Wrapper for list item delete button (for non-Memo items)
  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  return (
    <div className="mb-8">
      <ConfirmModal 
        isOpen={!!deleteId}
        title="삭제 확인"
        message="정말 이 게시물을 삭제하시겠습니까?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        confirmText="삭제"
      />

      {title && <h4 className="font-bold text-lg text-cy-dark mb-2 font-pixel bg-gray-100 px-2 rounded inline-block">{title}</h4>}
      
      {isAdmin && (
        <form onSubmit={handleAdd} className="mb-4 bg-white p-2 border border-dashed border-gray-300 rounded text-sm">
          {showTitleInput && (
            <input 
              className="w-full border-b mb-2 p-1 focus:outline-none" 
              placeholder="제목 (선택사항)" 
              value={newItemTitle} onChange={e => setNewItemTitle(e.target.value)} 
            />
          )}
          
          <div className="flex gap-2">
            <textarea 
              className="flex-1 p-1 focus:outline-none resize-none h-20 border border-gray-100 rounded mb-1" 
              placeholder={placeholder}
              value={newItemText} onChange={e => setNewItemText(e.target.value)} 
            />
          </div>
          
          <div className="flex justify-end mb-2">
             <button type="submit" className="bg-cy-dark text-white text-xs px-3 py-1 rounded clickable flex items-center gap-1">
               <PlusCircle size={14}/> 등록
             </button>
          </div>

          <div className="space-y-1 mt-1 border-t border-gray-100 pt-1">
             {showLinkInput && (
                <input 
                className="w-full p-1 focus:outline-none text-xs text-blue-500 bg-gray-50 rounded" 
                placeholder="🔗 URL 링크 (선택사항)" 
                value={newItemLink} onChange={e => setNewItemLink(e.target.value)} 
              />
             )}
             {showImageInput && (
                <div className="flex items-center gap-2 bg-gray-50 rounded px-1">
                  <ImageIcon size={14} className="text-gray-400" />
                  <input 
                    className="w-full p-1 focus:outline-none text-xs text-gray-600 bg-transparent" 
                    placeholder="이미지 주소 URL (선택사항 - https://...)" 
                    value={newItemImageUrl} onChange={e => setNewItemImageUrl(e.target.value)} 
                  />
                </div>
             )}
          </div>
        </form>
      )}

      {/* Special Rendering for Memo Category */}
      {category === 'memo' ? (
        <div className="space-y-2">
          {items.map(item => (
            <MemoItem 
              key={item.id} 
              item={item} 
              isAdmin={isAdmin} 
              onDelete={(id) => setDeleteId(id)} 
            />
          ))}
          {items.length === 0 && <p className="text-gray-400 italic text-sm text-center py-4">아직 작성된 짧은 글이 없습니다.</p>}
        </div>
      ) : (
        /* Standard Rendering for other categories (Blog, Manual, etc.) */
        <div className={`space-y-2 ${displayMode === 'card' ? 'grid grid-cols-1 md:grid-cols-2 gap-4 space-y-0' : ''}`}>
          {items.map(item => (
            <div 
              key={item.id} 
              onClick={() => onItemClick && onItemClick(item)}
              className={`
              group relative p-3 rounded transition-all duration-200
              ${displayMode === 'blog' 
                ? 'border-b border-gray-200 pb-2 mb-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between' 
                : 'bg-white border border-gray-100 shadow-sm'}
            `}>
              {isAdmin && (
                <button 
                  type="button" 
                  onClick={(e) => handleDeleteClick(e, item.id)}
                  className="absolute top-2 right-2 text-gray-300 hover:text-red-500 clickable p-1 z-10"
                  title="삭제"
                >
                  <Trash2 size={16} />
                </button>
              )}
              
              {displayMode === 'blog' ? (
                // Blog List View (Title Only)
                <>
                  <div className="flex items-center gap-1 overflow-hidden flex-1 min-w-0 pr-2">
                     <span className="font-bold text-base group-hover:text-cy-orange transition-colors truncate pl-1">
                       {item.title || "무제"}
                     </span>
                     {item.commentCount !== undefined && item.commentCount > 0 && (
                        <span className="text-cy-orange text-xs font-pixel shrink-0">
                          [{item.commentCount}]
                        </span>
                     )}
                     {item.imageUrl && <ImageIcon size={14} className="text-gray-400 shrink-0" />}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-400 font-pixel">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                    <ArrowRight size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"/>
                  </div>
                </>
              ) : (
                // Standard/Card View
                <>
                  {item.title && (
                    <div className="font-bold text-base mb-1 flex items-center gap-2 group-hover:text-cy-orange transition-colors">
                      {item.title}
                    </div>
                  )}
                  <p className="text-gray-600 pr-6">{item.content}</p>
                </>
              )}

              {item.link && displayMode !== 'blog' && (
                 <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-xs text-blue-400 hover:underline mt-1 block w-fit"
                  onClick={(e) => e.stopPropagation()}
                 >
                   보러가기 / 듣기 &rarr;
                 </a>
              )}
            </div>
          ))}
          {items.length === 0 && <p className="text-gray-300 italic text-sm">아직 내용이 없습니다...</p>}
        </div>
      )}
    </div>
  );
};

export default ContentList;