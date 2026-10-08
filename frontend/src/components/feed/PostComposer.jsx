import { useLayoutEffect, useRef, useState } from 'react';
import {
  FilePlus2, Globe, LockKeyhole, Megaphone, UsersRound,
} from 'lucide-react';

const audiences = [
  { id: 'PUBLIC', label: 'Público', icon: Globe },
  { id: 'PRIVATE', label: 'Somente eu', icon: LockKeyhole },
  { id: 'FOLLOWERS', label: 'Apenas seguidores', icon: UsersRound },
];

const MAX_MEDIA_FILES = 4;
const MAX_MEDIA_FILE_SIZE = 5 * 1024 * 1024;
const MAX_MEDIA_SIZE = 10 * 1024 * 1024;
const allowedMediaTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];

function readMediaFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({
      fileName: file.name,
      contentType: file.type,
      dataUrl: reader.result,
      size: file.size,
    });
    reader.onerror = () => reject(new Error(`Não foi possível ler o arquivo ${file.name}.`));
    reader.readAsDataURL(file);
  });
}

export default function PostComposer({
  user,
  onSubmit,
  error = '',
  communityMode = false,
  communities = [],
  publishing = false,
}) {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState([]);
  const [audience, setAudience] = useState('PUBLIC');
  const [community, setCommunity] = useState('');
  const [openMenu, setOpenMenu] = useState(null);
  const [notice, setNotice] = useState('');
  const textareaRef = useRef(null);
  const mediaInputRef = useRef(null);
  const selectedAudience = audiences.find((item) => item.id === audience) || audiences[0];
  const AudienceIcon = selectedAudience.icon;

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [content]);

  const submit = async (event) => {
    event.preventDefault();
    if (!content.trim()) return;
    const mediaPayload = media.map((item) => ({
      fileName: item.fileName,
      contentType: item.contentType,
      dataUrl: item.dataUrl,
    }));
    const published = await onSubmit(content.trim(), audience, community || null, mediaPayload);
    if (published) {
      setContent('');
      setMedia([]);
    }
  };

  const handleMediaSelection = async (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    event.target.value = '';
    if (!selectedFiles.length) return;

    if (media.length + selectedFiles.length > MAX_MEDIA_FILES) {
      setNotice(`Você pode anexar no máximo ${MAX_MEDIA_FILES} arquivos.`);
      return;
    }
    if (selectedFiles.some((file) => !allowedMediaTypes.includes(file.type))) {
      setNotice('Use imagens JPEG, PNG, GIF ou WebP, ou vídeos MP4 e WebM.');
      return;
    }
    if (selectedFiles.some((file) => file.size > MAX_MEDIA_FILE_SIZE)) {
      setNotice('Cada arquivo de mídia deve ter no máximo 5 MB.');
      return;
    }
    if (media.reduce((total, item) => total + item.size, 0) + selectedFiles.reduce((total, file) => total + file.size, 0) > MAX_MEDIA_SIZE) {
      setNotice('O tamanho total dos anexos não pode ultrapassar 10 MB.');
      return;
    }

    setNotice('');
    try {
      const newMedia = await Promise.all(selectedFiles.map(readMediaFile));
      setMedia((current) => [...current, ...newMedia]);
    } catch (readError) {
      setNotice(readError.message);
    }
  };

  const removeMedia = (index) => setMedia((current) => current.filter((_, itemIndex) => itemIndex !== index));
  const showAnnouncementNotice = () => setNotice('A criação de anúncios ainda não está disponível.');

  return (
    <form onSubmit={submit} className="space-y-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm lg:shrink-0">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#FFC72C] font-bold text-slate-800">
          {user?.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" /> : user?.name?.trim().charAt(0).toLocaleUpperCase('pt-BR') || 'U'}
        </div>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder={communityMode ? 'Compartilhe algo com suas comunidades...' : 'No que você está pensando?'}
          maxLength={2000}
          rows={3}
          className="min-h-24 w-full resize-none overflow-hidden rounded-2xl bg-[#F1F3F6] px-5 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#FFC72C]"
        />
      </div>
      {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {media.length > 0 && (
        <div className="ml-[52px] grid grid-cols-2 gap-2 sm:grid-cols-3">
          {media.map((item, index) => (
            <div key={`${item.fileName}-${index}`} className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              {item.contentType.startsWith('image/') ? (
                <img src={item.dataUrl} alt={item.fileName} className="h-28 w-full object-cover" />
              ) : (
                <video src={item.dataUrl} controls className="h-28 w-full object-cover" />
              )}
              <button type="button" onClick={() => removeMedia(index)} aria-label={`Remover ${item.fileName}`} className="absolute right-1 top-1 rounded-full bg-slate-900/75 px-2 py-1 text-xs font-bold text-white hover:bg-slate-900">×</button>
              <p className="truncate px-2 py-1 text-[10px] text-slate-600">{item.fileName}</p>
            </div>
          ))}
        </div>
      )}
      {notice && <p role="status" className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">{notice}</p>}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-1 pt-3 sm:px-2">
        <div className="flex flex-wrap items-center gap-1 text-xs font-medium text-slate-600">
          <input ref={mediaInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm" multiple hidden onChange={handleMediaSelection} />
          <button type="button" onClick={() => mediaInputRef.current?.click()} className="flex items-center gap-2 rounded-xl p-2 transition hover:bg-slate-50"><FilePlus2 className="h-4 w-4 text-amber-500" /><span>Mídia</span></button>
          <button type="button" onClick={showAnnouncementNotice} className="flex items-center gap-2 rounded-xl p-2 transition hover:bg-slate-50"><Megaphone className="h-4 w-4 text-emerald-500" /><span>Anunciar</span></button>
          <div className="relative">
            <button type="button" aria-haspopup="listbox" aria-expanded={openMenu === 'audience'} onClick={() => setOpenMenu((open) => open === 'audience' ? null : 'audience')} className="flex items-center gap-1.5 rounded-xl p-2 text-slate-600 transition hover:bg-slate-50">
              <AudienceIcon className="h-4 w-4" />{selectedAudience.label}
            </button>
            {openMenu === 'audience' && (
              <div role="listbox" aria-label="Privacidade da publicação" className="absolute left-0 top-full z-30 mt-2 min-w-48 rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl">
                {audiences.map(({ id, label, icon: Icon }) => (
                  <button key={id} type="button" role="option" aria-selected={audience === id} onClick={() => { setAudience(id); setOpenMenu(null); }} className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs transition ${audience === id ? 'bg-[#FFF8E6] font-bold text-[#9A7100]' : 'text-slate-700 hover:bg-slate-50'}`}>
                    <Icon className="h-4 w-4" />{label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {communityMode && (
            <div className="relative">
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={openMenu === 'community'}
                onClick={() => setOpenMenu((open) => open === 'community' ? null : 'community')}
                className="flex items-center gap-1.5 rounded-xl p-2 text-slate-600 transition hover:bg-slate-50"
              >
                <UsersRound className="h-4 w-4" />
                <span>{community || 'Escolher comunidade'}</span>
              </button>
              {openMenu === 'community' && (
                <div role="listbox" aria-label="Escolher comunidade" className="absolute left-0 top-full z-30 mt-2 min-w-56 rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl">
                  {communities.map((item) => {
                    const name = typeof item === 'string' ? item : item.name;
                    return (
                      <button
                        key={name}
                        type="button"
                        role="option"
                        aria-selected={community === name}
                        onClick={() => { setCommunity(name); setOpenMenu(null); }}
                        className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs transition ${community === name ? 'bg-[#FFF8E6] font-bold text-[#9A7100]' : 'text-slate-700 hover:bg-slate-50'}`}
                      >
                        <UsersRound className="h-4 w-4" />{name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
        <button type="submit" disabled={publishing || !content.trim() || (communityMode && !community)} className="rounded-xl bg-[#FFC72C] px-5 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50">
          {publishing ? 'Publicando...' : 'Publicar'}
        </button>
      </div>
    </form>
  );
}
