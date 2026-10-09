import { useEffect, useState } from 'react';
import {
  Bookmark, Hash, MessageCircle, Pencil, Repeat2, Share2, ThumbsUp, Trash2, UserPlus,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Avatar from './Avatar';
import { isPostSaved, SAVED_POSTS_CHANGED_EVENT, toggleSavedPost } from '../../utils/savedPosts';
import {
  commentOnPost, deleteCommentOnPost, editCommentOnPost, likePost, repostPost, undoRepost, unlikePost,
} from '../../utils/authApi';

function formatPostTime(createdAt) {
  const created = new Date(createdAt);
  const today = new Date();
  const createdDay = new Date(created.getFullYear(), created.getMonth(), created.getDate());
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dayDifference = Math.round((todayDay - createdDay) / 86400000);

  if (dayDifference === 0) {
    return created.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
  if (dayDifference === 1) {
    return 'Ontem';
  }
  return created.toLocaleDateString('pt-BR');
}

export default function PostCard({
  post,
  onSavedChange,
  showFollowButton = false,
  isFollowing = false,
  onFollowToggle,
  showCommunityAuthor = false,
}) {
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('unilink.user') || 'null');
    } catch {
      return null;
    }
  })();
  const authorAvatarUrl = post.authorId === currentUser?.id ? currentUser.avatarUrl : post.authorAvatarUrl;
  const [isSaved, setIsSaved] = useState(() => isPostSaved(post.id));
  const [notification, setNotification] = useState('');
  const [liked, setLiked] = useState(Boolean(post.likedByCurrentUser));
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [reposted, setReposted] = useState(Boolean(post.repostedByCurrentUser));
  const [repostsCount, setRepostsCount] = useState(post.reposts || 0);
  const [commentDraft, setCommentDraft] = useState('');
  const [comments, setComments] = useState(post.comments || []);
  const [visibleCommentsCount, setVisibleCommentsCount] = useState(2);
  const [editingCommentId, setEditingCommentId] = useState('');
  const [editingCommentDraft, setEditingCommentDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const timeLabel = formatPostTime(post.createdAt);
  const authorName = post.authorName;
  const visibleComments = comments.slice(0, visibleCommentsCount);

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
    try {
      const saved = toggleSavedPost(post);
      setIsSaved(saved);
      setNotification(saved ? 'Publicação salva!' : 'Publicação removida dos salvos.');
      onSavedChange?.(saved);
    } catch {
      setNotification('Não foi possível salvar a publicação.');
    }
  };

  const sharePost = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/feed#post-${post.id}`);
      setNotification('Link da publicação copiado!');
    } catch {
      setNotification('Não foi possível copiar o link.');
    }
  };

  const handleLike = async () => {
    setBusy(true);
    try {
      const updated = liked ? await unlikePost(post.id) : await likePost(post.id);
      setLiked(updated.likedByCurrentUser);
      setLikesCount(updated.likes);
    } catch (error) {
      setNotification(error.message);
    } finally {
      setBusy(false);
    }
  };

  const handleRepost = async () => {
    setBusy(true);
    try {
      const updated = reposted ? await undoRepost(post.id) : await repostPost(post.id);
      setReposted(updated.repostedByCurrentUser);
      setRepostsCount(updated.reposts);
      setNotification(updated.repostedByCurrentUser ? 'Publicação repostada!' : 'Repost removido.');
    } catch (error) {
      setNotification(error.message);
    } finally {
      setBusy(false);
    }
  };

  const addComment = async (event) => {
    event.preventDefault();
    const text = commentDraft.trim();
    if (!text || busy) return;
    setBusy(true);
    try {
      const updated = await commentOnPost(post.id, text);
      const updatedComments = updated.comments || [];
      setComments(updatedComments);
      setVisibleCommentsCount((current) => Math.min(updatedComments.length, Math.max(current, 2) + 1));
      setCommentDraft('');
    } catch (error) {
      setNotification(error.message);
    } finally {
      setBusy(false);
    }
  };

  const startEditingComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentDraft(comment.content);
  };

  const cancelEditingComment = () => {
    setEditingCommentId('');
    setEditingCommentDraft('');
  };

  const saveEditedComment = async (commentId) => {
    const text = editingCommentDraft.trim();
    if (!text || busy) return;
    setBusy(true);
    try {
      const updated = await editCommentOnPost(post.id, commentId, text);
      setComments(updated.comments || []);
      cancelEditingComment();
    } catch (error) {
      setNotification(error.message);
    } finally {
      setBusy(false);
    }
  };

  const removeComment = async (commentId) => {
    if (busy) return;
    setBusy(true);
    try {
      const updated = await deleteCommentOnPost(post.id, commentId);
      setComments(updated.comments || []);
      setVisibleCommentsCount((current) => Math.max(2, Math.min(current, (updated.comments || []).length)));
    } catch (error) {
      setNotification(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <article id={`post-${post.id}`} className="relative space-y-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      {post.reposted && <p className="flex items-center gap-2 text-xs font-semibold text-emerald-700"><Repeat2 className="h-4 w-4" />Repostado</p>}
      <header className="flex items-center gap-3">
        {authorAvatarUrl ? <img src={authorAvatarUrl} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" /> : <Avatar className="bg-[#FFC72C] text-white" />}
        <div className="min-w-0">
          {showCommunityAuthor ? (
            <Link to={`/perfil/${post.authorId}`} className="truncate text-sm font-bold text-slate-800 hover:underline">{authorName}</Link>
          ) : (
            <Link to={`/perfil/${post.authorId}`} className="truncate text-sm font-bold text-slate-800 hover:underline">{authorName}</Link>
          )}
          <p className="text-xs text-slate-400">
            {showCommunityAuthor ? `${post.communityName || 'Grupo'} · ` : <><Link to={`/perfil/${post.authorId}`} className="hover:underline">@{post.authorUsername}</Link> · </>} {timeLabel}
          </p>
        </div>
        {showFollowButton && (
          <button
            type="button"
            onClick={() => onFollowToggle?.(post.authorId, isFollowing)}
            className={`ml-auto inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              isFollowing
                ? 'border-slate-200 text-slate-600 hover:border-red-200 hover:text-red-600'
                : 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <UserPlus className="h-3.5 w-3.5" />{isFollowing ? 'Seguindo' : 'Seguir'}
          </button>
        )}
      </header>

      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700">{post.content}</p>

      {post.media?.length > 0 && (
        <div className={`grid gap-2 ${post.media.length > 1 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
          {post.media.map((item) => (
            <div key={`${item.fileName}-${item.contentType}`} className="overflow-hidden rounded-2xl bg-slate-100">
              {item.contentType.startsWith('image/') ? (
                <img src={item.dataUrl} alt={item.fileName} className="max-h-[520px] w-full object-contain" loading="lazy" />
              ) : (
                <video src={item.dataUrl} controls preload="metadata" className="max-h-[520px] w-full" />
              )}
            </div>
          ))}
        </div>
      )}

      {post.hashtags?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.hashtags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 rounded-lg border border-[#FFE8A3] bg-[#FFF8E6] px-3 py-1 text-xs font-bold text-[#D9A000]">
              <Hash className="h-3 w-3" />{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-medium text-slate-500">
        <div className="flex items-center gap-4">
          <button type="button" disabled={busy} onClick={handleLike} aria-pressed={liked} className={`flex items-center gap-1.5 transition-colors disabled:opacity-50 ${liked ? 'font-bold text-blue-600' : 'hover:text-slate-800'}`}><ThumbsUp className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} /><span>{likesCount} Curtir</span></button>
          <button type="button" className="flex items-center gap-1.5 transition-colors hover:text-slate-800"><MessageCircle className="h-4 w-4" /><span>{comments.length} Comentar</span></button>
          <button type="button" disabled={busy} onClick={handleRepost} aria-pressed={reposted} className={`flex items-center gap-1.5 transition-colors disabled:opacity-50 ${reposted ? 'font-bold text-emerald-600' : 'hover:text-slate-800'}`}><Repeat2 className="h-4 w-4" /><span>{reposted ? 'Repostado' : 'Repostar'}{repostsCount ? ` · ${repostsCount}` : ''}</span></button>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={handleSave} aria-label={isSaved ? 'Remover publicação dos salvos' : 'Salvar publicação'} aria-pressed={isSaved} title={isSaved ? 'Remover dos salvos' : 'Salvar publicação'} className={`transition-colors ${isSaved ? 'text-[#D9A000]' : 'hover:text-slate-800'}`}><Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} /></button>
          <button type="button" onClick={sharePost} className="transition-colors hover:text-slate-800" aria-label="Compartilhar publicação"><Share2 className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="space-y-3 border-t border-slate-100 pt-4">
        {visibleComments.map((comment) => (
          <div key={comment.id} className="rounded-xl bg-slate-50 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {comment.authorAvatarUrl ? <img src={comment.authorAvatarUrl} alt="" className="h-6 w-6 rounded-full object-cover" /> : <Avatar size="small" />}
                <Link to={`/perfil/${comment.authorId}`} className="text-xs font-bold text-slate-800 hover:underline">{comment.authorName} <span className="font-normal text-slate-500">@{comment.authorUsername}</span></Link>
              </div>
              {comment.authorId === currentUser?.id && (
                <div className="flex items-center gap-2">
                  <button type="button" disabled={busy} onClick={() => startEditingComment(comment)} aria-label="Editar comentário" title="Editar comentário" className="rounded-md p-1 text-slate-600 transition hover:bg-slate-200 hover:text-slate-900 disabled:opacity-50">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" disabled={busy} onClick={() => removeComment(comment.id)} aria-label="Excluir comentário" title="Excluir comentário" className="rounded-md p-1 text-red-600 transition hover:bg-red-100 hover:text-red-700 disabled:opacity-50">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
            {editingCommentId === comment.id ? (
              <div className="mt-2 space-y-2">
                <textarea
                  value={editingCommentDraft}
                  onChange={(event) => setEditingCommentDraft(event.target.value)}
                  maxLength={500}
                  rows={3}
                  className="w-full resize-none rounded-xl bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-amber-300"
                />
                <div className="flex items-center gap-2">
                  <button type="button" disabled={busy || !editingCommentDraft.trim()} onClick={() => saveEditedComment(comment.id)} className="rounded-lg bg-[#FFC72C] px-3 py-1.5 text-xs font-bold text-slate-900 disabled:opacity-50">Salvar</button>
                  <button type="button" disabled={busy} onClick={cancelEditingComment} className="rounded-lg bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 disabled:opacity-50">Cancelar</button>
                </div>
              </div>
            ) : (
              <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-700">{comment.content}</p>
            )}
          </div>
        ))}
        {comments.length > visibleCommentsCount && (
          <button
            type="button"
            onClick={() => setVisibleCommentsCount((current) => current + 5)}
            className="text-xs font-semibold text-slate-600 transition hover:text-slate-900"
          >
            Ver mais comentários
          </button>
        )}
        <form onSubmit={addComment} className="flex gap-2">
          <input value={commentDraft} onChange={(event) => setCommentDraft(event.target.value)} maxLength={500} placeholder="Escreva um comentário..." className="min-w-0 flex-1 rounded-xl bg-slate-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-300" />
          <button type="submit" disabled={!commentDraft.trim() || busy} className="rounded-xl bg-[#FFC72C] px-4 py-2 text-xs font-bold text-slate-900 disabled:opacity-50">Enviar</button>
        </form>
      </div>

      {notification && <div role="status" className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold text-white shadow-lg">{notification}</div>}
    </article>
  );
}
