import { useEffect, useState } from 'react';
import { ArrowRight, Compass, Users } from 'lucide-react';
import FeedHeader from '../components/feed/FeedHeader';
import FeedMobileNav from '../components/feed/FeedMobileNav';
import FeedSidebar from '../components/feed/FeedSidebar';
import PostCard from '../components/feed/PostCard';
import PostComposer from '../components/feed/PostComposer';
import {
  createPost, getCommunities, getCommunityPosts, getCurrentUser, joinCommunity,
} from '../utils/authApi';

export default function Communities() {
  const [selectedCommunity, setSelectedCommunity] = useState('all');
  const [communitySearch, setCommunitySearch] = useState('');
  const [mobileTab, setMobileTab] = useState('feed');
  const [posts, setPosts] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [publishError, setPublishError] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [requestNotice, setRequestNotice] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('unilink.user') || 'null');
    } catch {
      return null;
    }
  });

  useEffect(() => {
    let active = true;
    Promise.all([getCommunityPosts(), getCommunities(), getCurrentUser()])
      .then(([result, availableCommunities, currentUser]) => {
        if (!active) return;
        setPosts(result);
        setCommunities(availableCommunities);
        setUser(currentUser);
        localStorage.setItem('unilink.user', JSON.stringify(currentUser));
      })
      .catch((requestError) => {
        if (active) setLoadError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const publishCommunityPost = async (content, privacy, communityName, media) => {
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

  const enterCommunity = async (community) => {
    try {
      const updatedCommunity = community.member
        ? community
        : await joinCommunity(community.id);
      setCommunities((current) => current.map((item) => (
        item.id === updatedCommunity.id ? updatedCommunity : item
      )));
      if (updatedCommunity.visibility === 'PRIVATE' && updatedCommunity.requestPending) {
        setRequestNotice(true);
        return;
      }
      setLoadError('');
    } catch (requestError) {
      setLoadError(requestError.message);
    }
  };

  const visiblePosts = posts.filter((post) =>
    (selectedCommunity === 'all' || post.communityName === selectedCommunity)
    && post.communityName,
  );
  const mobileTabs = [
    { id: 'feed', label: 'Publicações' },
    { id: 'discover', label: 'Descobrir' },
  ];

  return (
    <div className="large-screen-dashboard min-h-screen bg-[#F4F5F7] pb-24 font-sans text-slate-700 lg:h-dvh lg:overflow-hidden lg:pb-0">
      <FeedHeader />
      <div className="mx-auto mt-4 grid max-w-7xl grid-cols-1 gap-4 px-3 sm:mt-6 sm:gap-6 sm:px-4 lg:grid-cols-12 lg:items-start">
        <FeedSidebar
          activeItem="communities"
          selectedCommunity={selectedCommunity}
          communities={communities}
          onCommunitySelect={(name) => {
            setSelectedCommunity(name);
            setMobileTab('feed');
          }}
          communitySearch={communitySearch}
          onCommunitySearchChange={setCommunitySearch}
        />
        <main className="primary-scroll col-span-1 min-w-0 space-y-5 lg:col-span-6 lg:h-[calc(100dvh-96px)] lg:overflow-y-auto lg:overscroll-contain lg:pr-2">
          <section>
            <h1 className="text-xl font-extrabold text-slate-800">Comunidades</h1>
            <p className="mt-1 text-xs text-slate-500">Encontre grupos ligados à sua vida universitária.</p>
          </section>
          <nav aria-label="Navegação de comunidades" className="grid grid-cols-2 border-b border-slate-200">
            {mobileTabs.map(({ id, label }) => (
              <button key={id} type="button" onClick={() => setMobileTab(id)} aria-current={mobileTab === id ? 'page' : undefined} className={`min-h-11 border-b-2 px-1 text-[11px] font-semibold ${mobileTab === id ? 'border-amber-400 text-slate-900' : 'border-transparent text-slate-500'}`}>{label}</button>
            ))}
          </nav>

          {mobileTab === 'feed' && (
            <>
              <PostComposer
                user={user}
                onSubmit={publishCommunityPost}
                error={publishError}
                publishing={publishing}
                communityMode
                communities={communities.filter((community) => community.member)}
              />
              <section className="space-y-4" aria-label="Publicações da comunidade">
                {loadError ? (
                  <p role="alert" className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700">{loadError}</p>
                ) : loading ? (
                  <p className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Carregando comunidades...</p>
                ) : visiblePosts.length ? visiblePosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    showCommunityAuthor
                  />
                )) : (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                    <Users className="mx-auto h-8 w-8 text-slate-300" />
                    <h2 className="mt-3 font-bold text-slate-700">{selectedCommunity === 'all' ? 'Ainda não há publicações nas comunidades' : 'Nenhuma publicação nesta comunidade'}</h2>
                    <p className="mt-1 text-xs">Explore os grupos ou publique para iniciar a conversa.</p>
                  </div>
                )}
              </section>
            </>
          )}

          {mobileTab === 'discover' && (
            <section className="space-y-3" aria-label="Comunidades disponíveis">
              {loadError ? (
                <p role="alert" className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700">{loadError}</p>
              ) : loading ? (
                <p className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Carregando comunidades...</p>
              ) : communities.length ? communities.map((community) => (
                <article key={community.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="relative aspect-[16/7] overflow-hidden bg-slate-200">
                    <img src={community.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                    <span className="absolute left-3 top-3 rounded-lg bg-white/95 px-2.5 py-1.5 text-[10px] font-bold text-slate-800">{community.category}</span>
                    <span className="absolute right-3 top-3 rounded-lg bg-white/95 px-2.5 py-1.5 text-[10px] font-bold text-slate-800">{community.visibility === 'PRIVATE' ? 'Privada' : 'Pública'}</span>
                  </div>
                  <div className="space-y-3 p-4">
                    <div>
                      <h2 className="text-sm font-extrabold text-slate-800">{community.name}</h2>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">{community.description}</p>
                      <p className="mt-2 text-[10px] text-slate-400">{community.campus} · {community.memberCount} participantes</p>
                    </div>
                    <button type="button" disabled={community.requestPending} onClick={() => enterCommunity(community)} className={`w-full rounded-lg px-3 py-2.5 text-xs font-bold transition disabled:cursor-default disabled:opacity-70 ${community.requestPending ? 'bg-slate-100 text-slate-500' : 'bg-[#FFF8E6] text-amber-900 hover:bg-amber-100'}`}>
                      {community.requestPending ? 'Solicitação enviada' : community.member ? 'Participando' : community.visibility === 'PRIVATE' ? 'Pedir para participar' : 'Participar da comunidade'}
                    </button>
                  </div>
                </article>
              )) : (
                <p className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">Nenhuma comunidade disponível.</p>
              )}
            </section>
          )}
        </main>

        <aside className="hidden space-y-5 lg:col-span-3 lg:block lg:overflow-y-auto">
          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-slate-800">Atividade dos seus grupos</h2>
            <p className="py-3 text-center text-xs text-slate-400">Explore as comunidades para encontrar publicações.</p>
          </section>
          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-bold text-slate-800">Sugestões para você</h2><Compass className="h-4 w-4 text-slate-400" /></div>
            <div className="space-y-3">
              {communities.slice(0, 3).map((community) => (
                <button key={community.id} type="button" onClick={() => enterCommunity(community)} className="flex w-full items-center gap-3 rounded-xl text-left hover:bg-slate-50">
                  <img src={community.imageUrl} alt="" className="h-11 w-11 rounded-xl object-cover" loading="lazy" />
                  <span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold text-slate-800">{community.name}</span><span className="block text-[10px] text-slate-500">{community.visibility === 'PRIVATE' ? 'Privada' : 'Pública'} · {community.category}</span></span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-amber-700" />
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setMobileTab('discover')} className="mt-4 flex w-full items-center justify-center gap-1 border-t border-slate-100 pt-3 text-xs font-semibold text-amber-800">Explore mais comunidades <ArrowRight className="h-3 w-3" /></button>
          </section>
          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-slate-800">Convites</h2>
            <p className="py-3 text-center text-xs text-slate-400">Você não tem convites pendentes.</p>
          </section>
        </aside>
      </div>
      <FeedMobileNav activeItem="communities" />
      {requestNotice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setRequestNotice(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="community-request-title" className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-800"><Users className="h-6 w-6" /></span>
            <h2 id="community-request-title" className="mt-4 text-base font-extrabold text-slate-800">Solicitação enviada!</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">Um administrador da comunidade analisará seu pedido. Você poderá participar quando ele for aprovado.</p>
            <button type="button" onClick={() => setRequestNotice(false)} className="mt-5 w-full rounded-xl bg-[#FFC72C] px-4 py-2.5 text-sm font-bold text-slate-900 hover:bg-amber-400">Entendi</button>
          </section>
        </div>
      )}
    </div>
  );
}
