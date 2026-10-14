import { useEffect, useRef, useState } from 'react';
import {
  Bookmark, Flag, Hash, MessageCircle, MoreVertical, Pencil, Repeat2, Share2, ThumbsUp, Trash2, UserPlus,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Avatar from './Avatar';
import { isPostSaved, removeSavedPost, SAVED_POSTS_CHANGED_EVENT, toggleSavedPost } from '../../utils/savedPosts';
import {
  commentOnPost, deleteCommentOnPost, deletePost, editCommentOnPost, editPost, likePost, reportPost, repostPost, undoRepost, unlikePost,
} from '../../utils/authApi';

const REPORT_REASONS = [
  ['INAPPROPRIATE_CONTENT', 'Conteúdo inadequado'],
  ['VIOLENCE_OR_THREATS', 'Violência ou ameaça'],
  ['HATE_SPEECH', 'Discurso de ódio'],
  ['SPAM_OR_SCAM', 'Spam ou golpe'],
  ['PERSONAL_DATA', 'Divulgação de dados pessoais'],
  ['OTHER', 'Outro'],
];
const REPORTED_POSTS_STORAGE_KEY = 'unilink.reported-posts';
const REPORT_SUCCESS_MESSAGE = 'Sua denúncia foi enviada e será revisada. Obrigado por nos ajudar a manter a comunidade saudável e um ambiente seguro para todos.';

function reportedPostsStorageKey(userId) {
  return `${REPORTED_POSTS_STORAGE_KEY}.${userId || 'anonymous'}`;
}

function hasReportedPost(postId, userId) {
  try {
    return JSON.parse(localStorage.getItem(reportedPostsStorageKey(userId)) || '[]').includes(postId);
  } catch {
    return false;
  }
}

function rememberReportedPost(postId, userId) {
  try {
    const storageKey = reportedPostsStorageKey(userId);
    const reportedPosts = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (!reportedPosts.includes(postId)) {
      localStorage.setItem(storageKey, JSON.stringify([...reportedPosts, postId]));
    }
  } catch {
    localStorage.setItem(reportedPostsStorageKey(userId), JSON.stringify([postId]));
  }
}

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

function PostActionsMenu({
  onEdit,
  onDelete,
  disabled = false,
  editTitle,
  deleteTitle,
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const firstItemRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handleOutsideClick = (event) => {
      if (!menuRef.current?.contains(event.target) && !triggerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    firstItemRef.current?.focus();

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const selectAction = (action) => {
    setOpen(false);
    action();
  };

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        aria-label="Mais opções"
        aria-haspopup="menu"
        aria-expanded={open}
        title="Mais opções"
        className="rounded-md p-1 text-slate-600 transition hover:bg-slate-200 hover:text-slate-900 disabled:opacity-50"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Ações"
          className="absolute right-0 top-full z-30 mt-1 min-w-[9rem] rounded-xl border border-slate-200 bg-white p-1 shadow-lg"
        >
          <button
            ref={firstItemRef}
            type="button"
            role="menuitem"
            onClick={() => selectAction(onEdit)}
            aria-label={editTitle}
            title={editTitle}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 focus:bg-slate-100 focus:outline-none"
          >
            <Pencil className="h-3.5 w-3.5" />Editar
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => selectAction(onDelete)}
            aria-label={deleteTitle}
            title={deleteTitle}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 focus:bg-slate-100 focus:outline-none"
          >
            <Trash2 className="h-3.5 w-3.5" />Excluir
          </button>
        </div>
      )}
    </div>
  );
}

export default function PostCard({
  post,
  onSavedChange,
  showFollowButton = false,
  isFollowing = false,
  onFollowToggle,
  showCommunityAuthor = false,
  onDeleted,
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
  const [postContent, setPostContent] = useState(post.content);
  const [postHashtags, setPostHashtags] = useState(post.hashtags || []);
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
  const [editingPost, setEditingPost] = useState(false);
  const [editingPostDraft, setEditingPostDraft] = useState(post.content);
  const [deleted, setDeleted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reported, setReported] = useState(() => hasReportedPost(post.id, currentUser?.id));
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const deleteCancelButtonRef = useRef(null);
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

  useEffect(() => {
    if (!deleteDialog) return undefined;
    deleteCancelButtonRef.current?.focus();
    const handleEscape = (event) => {
      if (event.key === 'Escape' && !busy) {
        setDeleteDialog(null);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [deleteDialog, busy]);

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

  const requestDeletePost = () => {
    if (!busy) setDeleteDialog({ type: 'post' });
  };

  const requestDeleteComment = (commentId) => {
    if (!busy) setDeleteDialog({ type: 'comment', commentId });
  };

  const saveEditedPost = async () => {
    const text = editingPostDraft.trim();
    if (!text || busy) return;
    setBusy(true);
    try {
      const updated = await editPost(post.id, text);
      setPostContent(updated.content);
      setPostHashtags(updated.hashtags || []);
      setEditingPost(false);
      setNotification('Publicação editada!');
    } catch (error) {
      setNotification(error.message);
    } finally {
      setBusy(false);
    }
  };

  const removePost = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await deletePost(post.id);
      removeSavedPost(post.id);
      setDeleted(true);
      onDeleted?.(post.id);
    } catch (error) {
      setNotification(error.message);
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteDialog || busy) return;
    const pendingDelete = deleteDialog;
    setDeleteDialog(null);
    if (pendingDelete.type === 'post') {
      await removePost();
    } else {
      await removeComment(pendingDelete.commentId);
    }
  };

  const openReportModal = () => {
    if (reported) {
      setNotification('Você já denunciou esta publicação.');
      return;
    }
    setReportReason('');
    setReportSubmitted(false);
    setReportModalOpen(true);
  };

  const submitReport = async (event) => {
    event.preventDefault();
    if (!reportReason || reportSubmitting) return;
    setReportSubmitting(true);
    try {
      await reportPost(post.id, reportReason);
      rememberReportedPost(post.id, currentUser?.id);
      setReported(true);
      setReportSubmitted(true);
    } catch (error) {
      if (error.message?.includes('já denunciou')) {
        rememberReportedPost(post.id, currentUser?.id);
        setReported(true);
        setReportSubmitted(true);
      } else {
        setNotification(error.message);
      }
    } finally {
      setReportSubmitting(false);
    }
  };

  if (deleted) return null;

  return (
    <article id={`post-${post.id}`} className="relative space-y-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      {post.reposted && <p className="flex items-center gap-2 text-xs font-semibold text-emerald-700"><Repeat2 className="h-4 w-4" />Repostado</p>}
      <header className="flex items-start gap-3">
        {authorAvatarUrl ? <img src={authorAvatarUrl} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" /> : <Avatar className="bg-[#FFC72C] text-white" />}
        <div className="min-w-0 flex-1">
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
        {post.authorId === currentUser?.id && (
          <div className="ml-auto flex shrink-0 items-start gap-2">
            <PostActionsMenu
              disabled={busy}
              onEdit={() => { setEditingPost(true); setEditingPostDraft(postContent); }}
              onDelete={requestDeletePost}
              editTitle="Editar publicação"
              deleteTitle="Excluir publicação"
            />
          </div>
        )}
      </header>

      {editingPost ? (
        <div className="space-y-2">
          <textarea
            value={editingPostDraft}
            onChange={(event) => setEditingPostDraft(event.target.value)}
            maxLength={2000}
            rows={4}
            className="w-full resize-none rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-amber-300"
          />
          <div className="flex items-center gap-2">
            <button type="button" disabled={busy || !editingPostDraft.trim()} onClick={saveEditedPost} className="rounded-lg bg-[#FFC72C] px-3 py-1.5 text-xs font-bold text-slate-900 disabled:opacity-50">Salvar</button>
            <button type="button" disabled={busy} onClick={() => setEditingPost(false)} className="rounded-lg bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 disabled:opacity-50">Cancelar</button>
          </div>
        </div>
      ) : (
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700">{postContent}</p>
      )}

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

      {postHashtags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {postHashtags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 rounded-lg border border-[#FFE8A3] bg-[#FFF8E6] px-3 py-1 text-xs font-bold text-[#D9A000]">
              <Hash className="h-3 w-3" />{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-medium text-slate-500">
        <div className="flex items-center gap-4">
          <button type="button" disabled={busy} onClick={handleLike} aria-label={liked ? 'Descurtir publicação' : 'Curtir publicação'} title={liked ? 'Descurtir publicação' : 'Curtir publicação'} aria-pressed={liked} className={`flex items-center gap-1.5 transition-colors disabled:opacity-50 ${liked ? 'font-bold text-blue-600' : 'hover:text-slate-800'}`}><ThumbsUp className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} /><span>{likesCount} Curtir</span></button>
          <button type="button" aria-label="Comentar publicação" title="Comentar publicação" className="flex items-center gap-1.5 transition-colors hover:text-slate-800"><MessageCircle className="h-4 w-4" /><span>{comments.length} Comentar</span></button>
          <button type="button" disabled={busy} onClick={handleRepost} aria-label={reposted ? 'Remover repostagem' : 'Repostar publicação'} title={reposted ? 'Remover repostagem' : 'Repostar publicação'} aria-pressed={reposted} className={`flex items-center gap-1.5 transition-colors disabled:opacity-50 ${reposted ? 'font-bold text-emerald-600' : 'hover:text-slate-800'}`}><Repeat2 className="h-4 w-4" /><span>{reposted ? 'Repostado' : 'Repostar'}{repostsCount ? ` · ${repostsCount}` : ''}</span></button>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={handleSave} aria-label={isSaved ? 'Remover publicação dos salvos' : 'Salvar publicação'} aria-pressed={isSaved} title={isSaved ? 'Remover dos salvos' : 'Salvar publicação'} className={`transition-colors ${isSaved ? 'text-[#D9A000]' : 'hover:text-slate-800'}`}><Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} /></button>
          <button type="button" onClick={sharePost} className="transition-colors hover:text-slate-800" aria-label="Compartilhar publicação" title="Compartilhar publicação"><Share2 className="h-4 w-4" /></button>
          {currentUser?.id && post.authorId !== currentUser.id && (
            <button type="button" disabled={busy || reported} onClick={openReportModal} className={`transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${reported ? 'text-amber-600' : 'hover:text-slate-800'}`} aria-label={reported ? 'Denúncia já enviada' : 'Denunciar publicação'} title={reported ? 'Denúncia já enviada' : 'Denunciar publicação'}><Flag className={`h-4 w-4 ${reported ? 'fill-current' : ''}`} /></button>
          )}
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
                  <PostActionsMenu
                    disabled={busy}
                    onEdit={() => startEditingComment(comment)}
                    onDelete={() => requestDeleteComment(comment.id)}
                    editTitle="Editar comentário"
                    deleteTitle="Excluir comentário"
                  />
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

      {deleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`delete-dialog-title-${post.id}`}
            aria-describedby={`delete-dialog-description-${post.id}`}
            className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-xl"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF8E6] text-[#D9A000]">
                <Trash2 className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 id={`delete-dialog-title-${post.id}`} className="text-lg font-bold text-slate-900">
                  {deleteDialog.type === 'post' ? 'Excluir publicação?' : 'Excluir comentário?'}
                </h2>
                <p id={`delete-dialog-description-${post.id}`} className="mt-1 text-sm leading-relaxed text-slate-600">
                  Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                ref={deleteCancelButtonRef}
                type="button"
                onClick={() => setDeleteDialog(null)}
                disabled={busy}
                className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-xl bg-[#FFC72C] px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-[#E5AD00] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                {busy ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-dialog-title"
            aria-describedby="report-dialog-description"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            {reportSubmitted ? (
              <div className="space-y-4">
                <h2 id="report-dialog-title" className="text-lg font-bold text-slate-900">Denúncia enviada</h2>
                <p id="report-dialog-description" className="text-sm leading-relaxed text-slate-600">{REPORT_SUCCESS_MESSAGE}</p>
                <button type="button" onClick={() => setReportModalOpen(false)} className="w-full rounded-xl bg-[#FFC72C] px-4 py-2.5 text-sm font-bold text-slate-900">Fechar</button>
              </div>
            ) : (
              <form onSubmit={submitReport} className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 id="report-dialog-title" className="text-lg font-bold text-slate-900">Denunciar publicação</h2>
                    <p id="report-dialog-description" className="mt-1 text-sm text-slate-500">Selecione o motivo da denúncia.</p>
                  </div>
                  <button type="button" onClick={() => setReportModalOpen(false)} disabled={reportSubmitting} aria-label="Fechar denúncia" title="Fechar" className="rounded-lg px-2 py-1 text-xl leading-none text-slate-500 hover:bg-slate-100 disabled:opacity-50">×</button>
                </div>
                <label htmlFor={`report-reason-${post.id}`} className="block text-sm font-semibold text-slate-700">Motivo</label>
                <select
                  id={`report-reason-${post.id}`}
                  value={reportReason}
                  onChange={(event) => setReportReason(event.target.value)}
                  required
                  disabled={reportSubmitting}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-amber-300"
                >
                  <option value="">Selecione um motivo</option>
                  {REPORT_REASONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setReportModalOpen(false)} disabled={reportSubmitting} className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-50">Cancelar</button>
                  <button type="submit" disabled={!reportReason || reportSubmitting} className="rounded-xl bg-[#FFC72C] px-4 py-2.5 text-sm font-bold text-slate-900 disabled:opacity-50">{reportSubmitting ? 'Enviando...' : 'Enviar denúncia'}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {notification && <div role="status" className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold text-white shadow-lg">{notification}</div>}
    </article>
  );
}
