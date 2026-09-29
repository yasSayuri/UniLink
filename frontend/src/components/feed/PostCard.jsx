import { useEffect, useState } from 'react';
import { Bookmark, MessageCircle, Share2, ThumbsUp } from 'lucide-react';
import Avatar from './Avatar';
import { isPostSaved, SAVED_POSTS_CHANGED_EVENT, toggleSavedPost } from '../../utils/savedPosts';

export default function PostCard({ post, onSavedChange }) {
  const [isSaved, setIsSaved] = useState(() => isPostSaved(post.id));
  const [notification, setNotification] = useState('');

  useEffect(() => {
    const updateSavedState = () => setIsSaved(isPostSaved(post.id));
    window.addEventListener(SAVED_POSTS_CHANGED_EVENT, updateSavedState);
    return () => window.removeEventListener(SAVED_POSTS_CHANGED_EVENT, updateSavedState);
  }, [post.id]);

  useEffect(() => {
    if (!notification) return undefined;
    const timeout = window.setTimeout(() => setNotification(''), 2200);
    return () => window.clearTimeout(timeout);
  }, [notification]);

  const handleSave = () => {
    const saved = toggleSavedPost(post);
    setIsSaved(saved);
    setNotification(saved ? 'Publicação salva!' : onSavedChange ? '' : 'Publicação removida dos salvos.');
    onSavedChange?.(saved);
  };

  return (
    <article className="relative bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="bg-[#FFC72C] text-white" />
          <div>
            <h4 className="text-sm font-bold text-slate-800">{post.community || post.author}</h4>
            <p className="text-xs text-slate-400">{post.community ? `Publicado por ${post.author} • ${post.time}` : `${post.time} • ${post.course}`}</p>
          </div>
        </div>
        <button className="text-slate-400 hover:text-slate-600 font-bold px-2" aria-label="Mais opções">•••</button>
      </div>

      <p className="text-sm text-slate-700 leading-relaxed">{post.content}</p>

      <span className="inline-block bg-[#FFF8E6] text-[#D9A000] text-xs font-bold px-3 py-1 rounded-lg border border-[#FFE8A3]">
        {post.tag}
      </span>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1.5 hover:text-slate-800 transition-colors">
            <ThumbsUp className="w-4 h-4" /><span>{post.likes}</span>
          </button>
          <button className="flex items-center gap-1.5 hover:text-slate-800 transition-colors">
            <MessageCircle className="w-4 h-4" /><span>{post.commentsCount}</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={handleSave} aria-label={isSaved ? 'Remover publicação dos salvos' : 'Salvar publicação'} aria-pressed={isSaved} title={isSaved ? 'Remover dos salvos' : 'Salvar publicação'} className={`transition-colors ${isSaved ? 'text-[#D9A000]' : 'hover:text-slate-800'}`}><Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} /></button>
          <button className="hover:text-slate-800 transition-colors" aria-label="Compartilhar publicação"><Share2 className="w-4 h-4" /></button>
        </div>
      </div>

      {notification && <div role="status" className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold text-white shadow-lg">{notification}</div>}

      {post.comment && (
        <>
          <div className="bg-[#F8F9FA] rounded-2xl p-3 flex items-start gap-3 mt-2">
            <Avatar size="small" />
            <div className="text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">{post.comment.author}</span>
                <span className="text-slate-400 text-[10px]">{post.comment.time}</span>
              </div>
              <p className="text-slate-600 mt-0.5">{post.comment.content}</p>
            </div>
          </div>
          <button className="text-xs font-bold text-[#D9A000] hover:underline pt-1">Ver mais comentários...</button>
        </>
      )}
    </article>
  );
}
