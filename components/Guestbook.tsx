import React, { useEffect, useState } from 'react';
import { addGuestbookEntry, deleteGuestbookEntry, subscribeToGuestbook } from '../services/firebase';
import { GuestbookEntry } from '../types';
import { Send, Trash2 } from 'lucide-react';

interface GuestbookProps {
  isAdmin: boolean;
}

const Guestbook: React.FC<GuestbookProps> = ({ isAdmin }) => {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeToGuestbook((data) => {
      setEntries(data);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;
    
    await addGuestbookEntry(name, content);
    setName('');
    setContent('');
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('정말 삭제하시겠습니까?')) {
      await deleteGuestbookEntry(id);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold font-pixel text-cy-dark mb-4 border-b border-dashed border-gray-300 pb-2 flex flex-wrap items-end gap-2">
        방명록
        <span className="text-[10px] md:text-xs font-normal text-gray-400">
          ※삭제는 최윤하에게 요청하지 않으면 불가능. 신중히 쓸 것!※
        </span>
      </h3>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-6">
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="닉네임 (10자 이내)"
            className="p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-cy-orange"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={10}
            required
          />
          <div className="flex gap-2">
            <textarea
              placeholder="내용을 적어주세요..."
              className="flex-1 p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-cy-orange resize-none h-10 md:h-12"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
            <button 
              type="submit"
              className="bg-cy-dark text-white rounded px-4 hover:bg-gray-700 transition-colors clickable"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </form>

      {/* Entries List */}
      <div className="space-y-3 h-64 overflow-y-auto pr-2">
        {entries.length === 0 ? (
          <p className="text-center text-gray-400 py-4">아직 작성된 방명록이 없어요. 첫 방문자가 되어주세요!</p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="bg-white border border-gray-100 p-3 rounded shadow-sm flex flex-col relative group">
              {isAdmin && (
                <button 
                  type="button"
                  onClick={(e) => handleDelete(e, entry.id)}
                  className="absolute top-2 right-2 text-gray-300 hover:text-red-500 clickable p-1 z-10"
                  title="삭제"
                >
                  <Trash2 size={14} />
                </button>
              )}
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-cy-orange text-sm">{entry.name}</span>
                <span className="text-xs text-gray-400 pr-4">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{entry.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Guestbook;