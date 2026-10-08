import { useEffect, useState } from 'react';
import { Calendar, MessageSquareText, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import FeedHeader from '../components/feed/FeedHeader';
import FeedMobileNav from '../components/feed/FeedMobileNav';
import FeedSidebar from '../components/feed/FeedSidebar';
import OnboardingModal from '../components/onboarding/OnboardingModal';
import PostCard from '../components/feed/PostCard';
import PostComposer from '../components/feed/PostComposer';
import {
  CONNECTIONS_CHANGED_EVENT, createPost, followUser, getCurrentUser, getPosts, getUserSuggestions,
} from '../utils/authApi';

function readSavedUser() {
  try {
    return JSON.parse(localStorage.getItem('unilink.user') || 'null');
  } catch {
    return null;
  }
}

export default function Feed() {
  const [user, setUser] = useState(readSavedUser);
  const [posts, setPosts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsError, setSuggestionsError] = useState('');
  const [loading, setLoading] = useState(true);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [publishError, setPublishError] = useState('');

  useEffect(() => {
    let active = true;
    const loadFeed = () => {
      Promise.all([getPosts(), getCurrentUser()])
        .then(([result, currentUser]) => {
          if (!active) return;
          setPosts(result);
          setUser(currentUser);
          localStorage.setItem('unilink.user', JSON.stringify(currentUser));
        })
        .catch((requestError) => {
          if (active) setLoadError(requestError.message);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
      getUserSuggestions()
        .then((people) => {
          if (active) {
            setSuggestions(people);
            setSuggestionsError('');
          }
        })
        .catch((requestError) => {
          if (active) setSuggestionsError(requestError.message);
        })
        .finally(() => {
          if (active) setSuggestionsLoading(false);
        });
    };
    loadFeed();
    window.addEventListener(CONNECTIONS_CHANGED_EVENT, loadFeed);
    return () => {
      active = false;
      window.removeEventListener(CONNECTIONS_CHANGED_EVENT, loadFeed);
    };
  }, []);

  const followSuggestedUser = async (person) => {
    try {
      await followUser(person.id);
    } catch (requestError) {
      setLoadError(requestError.message);
    }
  };

  const publishPost = async (content, privacy, communityName, media) => {
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

  return (
    <div className="large-screen-dashboard min-h-screen bg-[#F4F5F7] pb-24 font-sans text-slate-700 lg:h-dvh lg:overflow-hidden lg:pb-0">
      <FeedHeader />
      <div className="mx-auto mt-4 grid max-w-7xl grid-cols-1 gap-4 px-3 sm:mt-6 sm:gap-6 sm:px-4 lg:h-[calc(100dvh-96px)] lg:grid-cols-12 lg:items-stretch">
        <FeedSidebar />

        <main className="primary-scroll col-span-1 min-w-0 space-y-5 lg:col-span-6 lg:overflow-y-auto lg:overscroll-contain lg:pr-2">
          <PostComposer user={user} onSubmit={publishPost} error={publishError} publishing={publishing} />

          <section className="feed-posts-scroll space-y-5" aria-label="Publicações">
            {loading ? (
              <p className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Carregando publicações...</p>
            ) : loadError ? (
              <p role="alert" className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700">{loadError}</p>
            ) : posts.length ? (
              posts.map((post) => <PostCard key={post.id} post={post} />)
            ) : user?.followingCount === 0 && user?.followersCount === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF3C4] text-amber-800"><UsersRound className="h-6 w-6" /></span>
                <h2 className="mt-4 text-sm font-bold text-slate-800">Ops... você ainda não segue ninguém!</h2>
                <p className="mt-1 text-xs text-slate-500">Comece explorando as comunidades para encontrar publicações e pessoas.</p>
                <Link to="/comunidades" className="mt-4 inline-flex rounded-xl bg-[#FFC72C] px-4 py-2.5 text-xs font-bold text-slate-900 transition hover:bg-amber-400">Explorar comunidades</Link>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF3C4] text-amber-800"><MessageSquareText className="h-6 w-6" /></span>
                <h2 className="mt-4 text-sm font-bold text-slate-800">Ainda não há publicações</h2>
                <p className="mt-1 text-xs text-slate-500">Seja a primeira pessoa a compartilhar algo com a comunidade.</p>
              </div>
            )}
          </section>
        </main>

        <aside className="hidden space-y-5 lg:col-span-3 lg:block lg:min-h-0 lg:overflow-hidden">
          <section className="space-y-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">Atividades</h2>
            </div>
            <p className="py-2 text-left text-xs leading-relaxed text-slate-500">Você já está sabendo de tudo! Quando houver novas atividades, elas aparecerão aqui.</p>
          </section>

          <section className="space-y-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">Sugestões para você</h2>
            </div>
            {suggestionsLoading ? (
              <p className="py-2 text-xs text-slate-500">Buscando pessoas...</p>
            ) : suggestionsError ? (
              <p role="alert" className="py-2 text-xs text-red-600">{suggestionsError}</p>
            ) : suggestions.length ? (
              <div className="space-y-3">
                {suggestions.map((person) => (
                  <div key={person.id} className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFF3C4] text-xs font-bold text-slate-800">{person.name.charAt(0).toLocaleUpperCase('pt-BR')}</span>
                    <div className="min-w-0 flex-1">
                      <Link to={`/perfil/${person.id}`} className="block truncate text-xs font-bold text-slate-800 hover:underline">{person.name}</Link>
                      <Link to={`/perfil/${person.id}`} className="block truncate text-[10px] text-slate-500 hover:underline">@{person.username}</Link>
                    </div>
                    <button type="button" onClick={() => followSuggestedUser(person)} className="shrink-0 rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-[10px] font-semibold text-amber-800 transition hover:bg-amber-100">Seguir</button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-2 text-xs text-slate-500">Você já segue todas as pessoas sugeridas.</p>
            )}
          </section>

          <section className="space-y-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">Eventos</h2>
              <button type="button" className="text-xs text-slate-400">Ver tudo &gt;</button>
            </div>
            <div className="space-y-3">
              {[
                { title: 'Feira de estágios UTFPR', date: '15 de Set · 09:00', location: 'Bloco E - Campus Centro' },
                { title: 'Semana Acadêmica de Computação', date: '22 de Set · 19:00', location: 'Auditório da UTFPR' },
              ].map((event) => (
                <div key={event.title} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#FFF8E6] text-[#D9A000]"><Calendar className="h-4 w-4" /></span>
                  <div><h3 className="text-xs font-bold leading-tight text-slate-800">{event.title}</h3><p className="mt-0.5 text-[10px] text-slate-400">{event.date}</p><p className="text-[10px] text-slate-400">{event.location}</p></div>
                </div>
              ))}
            </div>
          </section>

        </aside>
      </div>
      <FeedMobileNav activeItem="home" />
      {user && !user.onboardingCompleted && <OnboardingModal onComplete={setUser} />}
    </div>
  );
}
