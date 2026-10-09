import { useEffect, useRef, useState } from 'react';
import { BookOpen, Camera, GraduationCap, MapPin, MoreVertical, Pencil, UserPlus, X } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import FeedHeader from '../components/feed/FeedHeader';
import FeedMobileNav from '../components/feed/FeedMobileNav';
import FeedSidebar from '../components/feed/FeedSidebar';
import PostCard from '../components/feed/PostCard';
import PostComposer from '../components/feed/PostComposer';
import {
  createPost, followUser, getCurrentUser, getFollowers, getFollowing, getUserFollowers, getUserFollowing,
  getUserPosts, getUserProfile, unfollowUser, updateProfile,
} from '../utils/authApi';

function readSavedUser() {
  try {
    return JSON.parse(localStorage.getItem('unilink.user') || 'null');
  } catch {
    return null;
  }
}

function readImage(event, field, setDraft) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    return;
  }
  const reader = new FileReader();
  reader.onload = () => setDraft((current) => ({ ...current, [field]: reader.result }));
  reader.readAsDataURL(file);
}

function imagePosition(value) {
  return {
    x: Number.isFinite(value?.x) ? value.x : 50,
    y: Number.isFinite(value?.y) ? value.y : 50,
  };
}

function userImagePosition(user, prefix) {
  return imagePosition({
    x: user?.[`${prefix}PositionX`],
    y: user?.[`${prefix}PositionY`],
  });
}

export default function Profile() {
  const { userId: requestedProfileId } = useParams();
  const savedUser = readSavedUser();
  const [user, setUser] = useState(readSavedUser);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [loadedProfileKey, setLoadedProfileKey] = useState(null);
  const [followingBusy, setFollowingBusy] = useState(false);
  const [followMenuOpen, setFollowMenuOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [connectionsTab, setConnectionsTab] = useState(null);
  const [draft, setDraft] = useState({ name: user?.name || '', username: user?.username || '' });
  const avatarInputRef = useRef(null);
  const headerInputRef = useRef(null);
  const imageDragRef = useRef(null);
  const menuRef = useRef(null);
  const isOwnProfile = !requestedProfileId || requestedProfileId === savedUser?.id;
  const profileKey = requestedProfileId || 'me';
  const loading = loadedProfileKey !== profileKey;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setFollowMenuOpen(false);
      }
    };
    if (followMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [followMenuOpen]);

  useEffect(() => {
    let active = true;
    const profileRequest = requestedProfileId && requestedProfileId !== savedUser?.id
      ? getUserProfile(requestedProfileId)
      : getCurrentUser();
    const postsRequest = requestedProfileId
      ? getUserPosts(requestedProfileId)
      : getUserPosts(savedUser?.id);
    Promise.all([profileRequest, postsRequest])
      .then(([profile, profilePosts]) => {
        if (!active) return;
        setUser(profile);
        setPosts(profilePosts);
        setError('');
        setLoadedProfileKey(profileKey);
        if (profile.id === savedUser?.id) localStorage.setItem('unilink.user', JSON.stringify(profile));
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message);
          setLoadedProfileKey(profileKey);
        }
      });
    return () => {
      active = false;
    };
  }, [profileKey, requestedProfileId, savedUser?.id]);

  const name = user?.name || 'Seu perfil';
  const username = user?.username ? `@${user.username}` : '';
  const academicDetails = [
    { label: 'Instituição', value: user?.institutionName, icon: GraduationCap },
    { label: 'Curso', value: user?.course, icon: BookOpen },
    { label: 'Campus', value: user?.campus, icon: MapPin },
    { label: 'Período', value: user?.academicPeriod ? `${user.academicPeriod}º período` : null, icon: BookOpen },
  ].filter((detail) => detail.value);
  const institutionAbbreviation = user?.institutionName
    ?.match(/\(([^)]+)\)/)?.[1]
    || user?.institutionName?.split(/\s+/).map((word) => word[0]).join('').slice(0, 6).toLocaleUpperCase('pt-BR');

  const saveProfile = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      const updatedUser = await updateProfile(draft);
      setUser(updatedUser);
      localStorage.setItem('unilink.user', JSON.stringify(updatedUser));
      setIsEditing(false);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const publishProfilePost = async (content, privacy, communityName, media) => {
    setPublishError('');
    setPublishing(true);
    try {
      const created = await createPost(content, privacy, communityName, media);
      setPosts((current) => [created, ...current]);
      return true;
    } catch (requestError) {
      setPublishError(requestError.message);
      return false;
    } finally {
      setPublishing(false);
    }
  };

  const startImageDrag = (event, field) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const position = imagePosition(draft[field]);
    imageDragRef.current = {
      field,
      startX: event.clientX,
      startY: event.clientY,
      initialX: position.x,
      initialY: position.y,
      width: event.currentTarget.clientWidth,
      height: event.currentTarget.clientHeight,
    };
  };

  const moveImageDrag = (event) => {
    const drag = imageDragRef.current;
    if (!drag) return;
    const nextPosition = {
      x: Math.max(0, Math.min(100, drag.initialX - ((event.clientX - drag.startX) * 50) / drag.width)),
      y: Math.max(0, Math.min(100, drag.initialY - ((event.clientY - drag.startY) * 50) / drag.height)),
    };
    setDraft((current) => ({ ...current, [drag.field]: nextPosition }));
  };

  const toggleProfileFollow = async () => {
    if (!user || followingBusy) return;
    setFollowingBusy(true);
    setError('');
    try {
      if (user.following) {
        await unfollowUser(user.id);
        setUser((current) => ({ ...current, following: false, followersCount: Math.max(0, current.followersCount - 1) }));
      } else {
        await followUser(user.id);
        setUser((current) => ({ ...current, following: true, followersCount: current.followersCount + 1 }));
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setFollowingBusy(false);
    }
  };

  return (
    <div className="large-screen-dashboard min-h-screen bg-[#F4F5F7] pb-24 font-sans text-slate-700 lg:h-dvh lg:overflow-hidden lg:pb-0">
      <FeedHeader />
      <div className="mx-auto mt-4 grid max-w-7xl grid-cols-1 gap-4 px-3 sm:mt-6 sm:gap-6 sm:px-4 lg:h-[calc(100dvh-96px)] lg:grid-cols-12 lg:items-stretch lg:overflow-hidden">
        <FeedSidebar />

        <main className="primary-scroll profile-scrollable min-w-0 space-y-4 lg:col-span-6 lg:h-full lg:overflow-y-auto lg:overscroll-contain lg:pr-2">
          <section className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div
              aria-hidden="true"
              className="h-48 bg-gradient-to-r from-slate-800 via-slate-700 to-amber-500 bg-cover bg-center sm:h-64"
              style={user?.headerUrl ? { backgroundImage: `url(${user.headerUrl})`, backgroundPosition: `${userImagePosition(user, 'header').x}% ${userImagePosition(user, 'header').y}%` } : undefined}
            />

            <div className="px-4 pb-5 sm:px-6">
              <div className="flex min-h-24 items-start justify-between sm:min-h-28">
                <div className="relative z-10 -mt-16 ml-1 -mb-8 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#FFC72C] text-3xl font-extrabold text-slate-800 sm:ml-2 sm:-mt-[4.5rem] sm:-mb-10 sm:h-36 sm:w-36 sm:text-4xl">
                  {user?.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" style={{ objectPosition: `${userImagePosition(user, 'avatar').x}% ${userImagePosition(user, 'avatar').y}%` }} /> : name.charAt(0).toLocaleUpperCase('pt-BR')}
                </div>
                <div className="mt-3 flex gap-2">
                  {isOwnProfile && (
                    <button
                      type="button"
                      onClick={() => {
                        setDraft({ name: user?.name || '', username: user?.username || '', avatarUrl: user?.avatarUrl || '', headerUrl: user?.headerUrl || '', avatarPosition: userImagePosition(user, 'avatar'), headerPosition: userImagePosition(user, 'header') });
                        setIsEditing(true);
                      }}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-amber-400 hover:bg-amber-50"
                    >
                      <Pencil className="h-3.5 w-3.5" />Editar perfil
                    </button>
                  )}
                </div>
              </div>

              <div className="-mt-6 flex flex-col">
                <div>
                  <h2 className="text-lg font-extrabold leading-tight text-slate-900">{name}</h2>
                  {username && <p className="mt-0.5 text-xs text-slate-500">{username}</p>}
                </div>
                <div className="mt-auto flex items-end justify-between">
                  <div>
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500" aria-label="Estatísticas do perfil">
                      <span><strong className="font-extrabold text-slate-800">{posts.length}</strong> posts</span>
                      <button type="button" onClick={() => setConnectionsTab('following')} className="hover:underline">
                        <strong className="font-extrabold text-slate-800">{user?.followingCount ?? 0}</strong> seguindo
                      </button>
                      <button type="button" onClick={() => setConnectionsTab('followers')} className="hover:underline">
                        <strong className="font-extrabold text-slate-800">{user?.followersCount ?? 0}</strong> seguidores
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                      {institutionAbbreviation && <span className="inline-flex items-center gap-1.5 font-bold text-slate-700"><GraduationCap className="h-3.5 w-3.5" />{institutionAbbreviation}</span>}
                      {academicDetails.filter(({ label }) => label !== 'Instituição').map(({ label, value, icon: Icon }) => (
                        <span key={label} className="inline-flex items-center gap-1.5"><Icon className="h-3.5 w-3.5" />{value}</span>
                      ))}
                    </div>
                  </div>
                  {!isOwnProfile && user && (
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        disabled={followingBusy}
                        onClick={() => {
                          if (user.following) {
                            toggleProfileFollow();
                          } else {
                            toggleProfileFollow();
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold transition disabled:opacity-50 ${user.following ? 'border-slate-300 bg-slate-100 text-slate-600 hover:bg-slate-200' : 'border-amber-300 bg-[#FFF3C4] text-amber-900 hover:bg-[#FFE99A]'}`}
                      >
                        {user.following ? 'Seguindo' : <><UserPlus className="h-3.5 w-3.5" />Seguir +</>}
                      </button>
                      <div className="relative flex items-center" ref={menuRef}>
                        <button
                          type="button"
                          disabled={followingBusy}
                          onClick={() => setFollowMenuOpen((current) => !current)}
                          className="inline-flex items-center justify-center text-slate-600 transition hover:text-slate-800 hover:scale-110 disabled:opacity-50"
                          aria-label="Mais opções"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>
                        {followMenuOpen && (
                          <div role="menu" className="absolute right-0 top-full z-[9999] mt-2 min-w-40 overflow-visible rounded-xl border border-slate-200 bg-white py-1 shadow-2xl">
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => {
                                setFollowMenuOpen(false);
                              }}
                              className="block w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                              Bloquear
                            </button>
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => {
                                setFollowMenuOpen(false);
                              }}
                              className="block w-full px-4 py-2.5 text-left text-xs font-semibold text-red-600 transition hover:bg-red-50"
                            >
                              Denunciar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {isOwnProfile && (
            <PostComposer user={user} onSubmit={publishProfilePost} error={publishError} publishing={publishing} />
          )}

          <section aria-label="Publicações do perfil" className="space-y-4">
            {loading ? <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Carregando perfil...</p> : posts.length ? posts.map((post) => <PostCard key={`${post.id}-${post.reposted}`} post={post} />) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <h2 className="text-sm font-bold text-slate-700">Nenhuma publicação ainda</h2>
                <p className="mt-1 text-xs text-slate-500">As publicações aparecerão aqui quando forem compartilhadas.</p>
              </div>
            )}
          </section>
          {error && !loading && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        </main>

        <aside className="hidden space-y-4 lg:col-span-3 lg:block lg:overflow-y-auto">
          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-extrabold text-slate-800">Informações acadêmicas</h2>
            {academicDetails.length ? (
              <dl className="mt-3 space-y-3">
                {academicDetails.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0 text-amber-700" />
                    <div><dt className="text-[10px] text-slate-500">{label}</dt><dd className="text-xs font-semibold text-slate-800">{value}</dd></div>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-3 text-xs text-slate-500">As informações acadêmicas ainda não foram preenchidas.</p>
            )}
          </section>
        </aside>
      </div>
      <FeedMobileNav />
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5">
          <section role="dialog" aria-modal="true" aria-labelledby="edit-profile-title" className="max-h-[94dvh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <form onSubmit={saveProfile}>
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-5">
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setIsEditing(false)} aria-label="Fechar" className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100"><X className="h-5 w-5" /></button>
                <h2 id="edit-profile-title" className="text-lg font-extrabold text-slate-800">Editar perfil</h2>
              </div>
              <button type="submit" disabled={saving} className="rounded-full bg-slate-900 px-5 py-2 text-sm font-bold text-white transition hover:bg-slate-700 disabled:opacity-60">{saving ? 'Salvando...' : 'Salvar'}</button>
            </div>

            <div
              className="relative h-48 overflow-hidden bg-gradient-to-r from-slate-800 via-slate-700 to-amber-500 sm:h-64"
              onPointerMove={moveImageDrag}
              onPointerUp={() => { imageDragRef.current = null; }}
              onPointerCancel={() => { imageDragRef.current = null; }}
            >
              {draft.headerUrl && <img src={draft.headerUrl} alt="Prévia da capa" draggable="false" onPointerDown={(event) => startImageDrag(event, 'headerPosition')} className="h-full w-full cursor-grab select-none object-cover active:cursor-grabbing" style={{ objectPosition: `${imagePosition(draft.headerPosition).x}% ${imagePosition(draft.headerPosition).y}%` }} />}
              <button type="button" onClick={() => headerInputRef.current?.click()} aria-label="Alterar imagem de capa" className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-slate-900/70 p-3 text-white transition hover:bg-slate-900">
                <Camera className="h-5 w-5" />
              </button>
            </div>

            <div className="px-4 pb-6 sm:px-5">
              <div className="relative -mt-14 flex items-end justify-between sm:-mt-16">
                <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#FFC72C] text-3xl font-extrabold text-slate-800 sm:h-32 sm:w-32 sm:text-4xl">
                  {draft.avatarUrl ? <img src={draft.avatarUrl} alt="Prévia da foto de perfil" draggable="false" onPointerDown={(event) => startImageDrag(event, 'avatarPosition')} onPointerMove={moveImageDrag} onPointerUp={() => { imageDragRef.current = null; }} onPointerCancel={() => { imageDragRef.current = null; }} className="h-full w-full cursor-grab select-none object-cover active:cursor-grabbing" style={{ objectPosition: `${imagePosition(draft.avatarPosition).x}% ${imagePosition(draft.avatarPosition).y}%` }} /> : draft.name?.charAt(0).toLocaleUpperCase('pt-BR')}
                  <button type="button" onClick={() => avatarInputRef.current?.click()} aria-label="Alterar foto de perfil" className="absolute inset-0 m-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-900/75 text-white transition hover:bg-slate-900"><Camera className="h-5 w-5" /></button>
                </div>
              </div>
              <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" hidden onChange={(event) => readImage(event, 'avatarUrl', setDraft)} />
              <input ref={headerInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" hidden onChange={(event) => readImage(event, 'headerUrl', setDraft)} />
              <div className="mt-5 space-y-4">
                <p className="text-xs text-slate-500">Arraste a capa ou a foto de perfil para escolher o enquadramento.</p>
                <label className="block text-sm font-semibold text-slate-700">
              Nome
              <input required maxLength={100} value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100" />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
              Username
              <div className="mt-1.5 flex items-center rounded-xl border border-slate-200 px-3.5 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100">
                  <span className="text-sm text-slate-400">@</span>
                  <input required minLength={3} maxLength={30} pattern="[a-zA-Z0-9._]+" value={draft.username} onChange={(event) => setDraft((current) => ({ ...current, username: event.target.value }))} className="w-full border-0 px-2 py-3 text-sm outline-none" />
                </div>
                <span className="mt-1 block text-xs font-normal text-slate-400">Use letras, números, ponto ou sublinhado.</span>
                  </label>
                  {error && <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-3 text-sm text-red-700">{error}</p>}
                </div>
              </div>
            </form>
          </section>
        </div>
      )}
      {connectionsTab && (
        <ConnectionsDialog
          key={`${user?.id}-${connectionsTab}`}
          profileId={user?.id}
          isOwnProfile={isOwnProfile}
          tab={connectionsTab}
          onTabChange={setConnectionsTab}
          onClose={() => setConnectionsTab(null)}
          onConnectionsChanged={async () => {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
            localStorage.setItem('unilink.user', JSON.stringify(currentUser));
          }}
        />
      )}
    </div>
  );
}

function ConnectionsDialog({ tab, profileId, isOwnProfile, onTabChange, onClose, onConnectionsChanged }) {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyUserId, setBusyUserId] = useState('');

  useEffect(() => {
    let active = true;
    (tab === 'following'
      ? (isOwnProfile ? getFollowing() : getUserFollowing(profileId))
      : (isOwnProfile ? getFollowers() : getUserFollowers(profileId)))
      .then((result) => {
        if (active) setPeople(result);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isOwnProfile, profileId, tab]);

  const toggleFollowing = async (person) => {
    setBusyUserId(person.id);
    setError('');
    try {
      if (person.following) {
        await unfollowUser(person.id);
        if (tab === 'following') {
          setPeople((current) => current.filter((item) => item.id !== person.id));
        } else {
          setPeople((current) => current.map((item) => (
            item.id === person.id ? { ...item, following: false } : item
          )));
        }
      } else {
        await followUser(person.id);
        setPeople((current) => current.map((item) => (
          item.id === person.id ? { ...item, following: true } : item
        )));
      }
      await onConnectionsChanged();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyUserId('');
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <section role="dialog" aria-modal="true" aria-labelledby="connections-title" className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 id="connections-title" className="text-base font-extrabold text-slate-800">
            {tab === 'following' ? 'Seguindo' : 'Seguidores'}
          </h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="rounded-full p-2 text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button>
        </div>
        <div className="grid grid-cols-2 border-b border-slate-100">
          {[
            { id: 'followers', label: 'Seguidores' },
            { id: 'following', label: 'Seguindo' },
          ].map(({ id, label }) => (
            <button key={id} type="button" onClick={() => onTabChange(id)} className={`border-b-2 py-3 text-sm font-semibold ${tab === id ? 'border-amber-400 text-slate-900' : 'border-transparent text-slate-500'}`}>{label}</button>
          ))}
        </div>
        <div className="max-h-[60vh] space-y-2 overflow-y-auto p-4">
          {loading ? (
            <p className="py-8 text-center text-sm text-slate-500">Carregando...</p>
          ) : error ? (
            <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>
          ) : people.length ? people.map((person) => (
            <div key={person.id} className="flex items-center gap-3 rounded-2xl px-2 py-2">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF3C4] font-bold text-slate-800">{person.name.charAt(0).toLocaleUpperCase('pt-BR')}</span>
              <div className="min-w-0 flex-1">
                <Link to={`/perfil/${person.id}`} onClick={onClose} className="block truncate text-sm font-bold text-slate-800 hover:underline">{person.name}</Link>
                <Link to={`/perfil/${person.id}`} onClick={onClose} className="block truncate text-xs text-slate-500 hover:underline">@{person.username}</Link>
              </div>
              {isOwnProfile && <button
                type="button"
                disabled={busyUserId === person.id}
                onClick={() => toggleFollowing(person)}
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-2 text-xs font-semibold disabled:opacity-50 ${person.following ? 'border-slate-200 text-slate-600 hover:border-red-200 hover:text-red-600' : 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'}`}
              >
                <UserPlus className="h-3.5 w-3.5" />{person.following ? 'Seguindo' : 'Seguir'}
              </button>}
            </div>
          )) : (
            <p className="py-8 text-center text-sm text-slate-500">
              {tab === 'following' ? 'Você ainda não segue ninguém.' : 'Você ainda não tem seguidores.'}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
