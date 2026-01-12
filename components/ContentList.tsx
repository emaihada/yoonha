import React, { useEffect, useState } from 'react';
import { addContentItem, deleteContentItem, subscribeToContent } from '../services/firebase';
import { ContentItem } from '../types';
import { Trash2, PlusCircle, ArrowRight } from 'lucide-react';
import MemoItem from './MemoItem';

interface ContentListProps {
  category: string; // e.g., 'manual_do', 'blog', 'memo'
  title?: string;
  isAdmin: boolean;
  showTitleInput?: boolean;
  showLinkInput?: boolean;
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
  placeholder = "내용을 입력하세요...",
  displayMode = 'list',
  onItemClick
}) => {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemLink, setNewItemLink] = useState('');

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
      createdAt: Date.now()
    };

    if (showTitleInput) {
      payload.title = newItemTitle;
    }

    if (showLinkInput) {
      payload.link = newItemLink;
    }

    await addContentItem(payload);
    
    setNewItemText('');
    setNewItemTitle('');
    setNewItemLink('');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      await deleteContentItem(id);
    }
  };

  // Wrapper for list item delete button (for non-Memo items)
  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    handleDelete(id);
  };

  return (
    <div className="mb-8">
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
            <input 
              className="flex-1 p-1 focus:outline-none" 
              placeholder={placeholder}
              value={newItemText} onChange={e => setNewItemText(e.target.value)} 
            />
            <button type="submit" className="text-cy-orange clickable"><PlusCircle size={20}/></button>
          </div>
          {showLinkInput && (
             <input 
             className="w-full border-t mt-2 p-1 focus:outline-none text-xs text-blue-500" 
             placeholder="URL 링크 (선택사항)" 
             value={newItemLink} onChange={e => setNewItemLink(e.target.value)} 
           />
          )}
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
              onDelete={handleDelete} 
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
                ? 'border-b border-gray-200 pb-4 mb-4 hover:bg-gray-50 cursor-pointer' 
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
              
              {item.title && (
                <div className="font-bold text-base mb-1 flex items-center gap-2 group-hover:text-cy-orange transition-colors">
                  {item.title}
                  {displayMode === 'blog' && <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400"/>}
                </div>
              )}
              
              {displayMode === 'blog' ? (
                <p className="whitespace-pre-wrap text-gray-700 leading-relaxed pr-6 line-clamp-3 text-sm">
                  {item.content}
                </p>
              ) : (
                <p className="text-gray-600 pr-6">{item.content}</p>
              )}

              {item.link && (
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
              
              {displayMode === 'blog' && (
                <div className="text-xs text-gray-400 mt-2">{new Date(item.createdAt).toLocaleDateString()}</div>
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