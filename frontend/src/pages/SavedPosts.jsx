import { useEffect, useState } from 'react';
import FeedHeader from '../components/feed/FeedHeader';
import FeedMobileNav from '../components/feed/FeedMobileNav';
import FeedSidebar from '../components/feed/FeedSidebar';
import PostCard from '../components/feed/PostCard';
import { getSavedPosts, SAVED_POSTS_CHANGED_EVENT } from '../utils/savedPosts';

export default function SavedPosts() {
  const [savedPosts, setSavedPosts] = useState(getSavedPosts);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    const updateSavedPosts = () => setSavedPosts(getSavedPosts());
    window.addEventListener(SAVED_POSTS_CHANGED_EVENT, updateSavedPosts);
    return () => window.removeEventListener(SAVED_POSTS_CHANGED_EVENT, updateSavedPosts);
  }, []);

  useEffect(() => {
    if (!notification) return undefined;
    const timeout = window.setTimeout(() => setNotification(''), 2200);
    return () => window.clearTimeout(timeout);
  }, [notification]);

  return (
    <div className="large-screen-dashboard min-h-screen bg-[#F4F5F7] pb-24 font-sans text-slate-700 lg:h-dvh lg:overflow-hidden lg:pb-0">
      <FeedHeader />
      <div className="mx-auto mt-4 grid max-w-7xl grid-cols-1 gap-4 px-3 sm:mt-6 sm:gap-6 sm:px-4 lg:h-[calc(100dvh-96px)] lg:grid-cols-12 lg:items-stretch lg:overflow-hidden">
        <FeedSidebar activeItem="saved" />
        <main className="col-span-1 min-w-0 space-y-5 lg:col-span-6 lg:flex lg:h-full lg:min-h-0 lg:flex-col">
          <section className="lg:shrink-0">
            <h1 className="text-xl font-extrabold leading-tight text-slate-800">Publicações salvas</h1>
            <p className="mt-1 text-xs text-slate-500">Posts que você guardou para ver depois</p>
          </section>
          <div className="feed-posts-scroll space-y-5 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-contain lg:pr-2">
            {savedPosts.length ? savedPosts.map((post) => <PostCard key={post.id} post={post} onSavedChange={(saved) => setNotification(saved ? 'Publicação salva!' : 'Publicação removida dos salvos.')} />) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">Você ainda não salvou nenhuma publicação.</div>
            )}
          </div>
        </main>
      </div>
      {notification && <div role="status" className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold text-white shadow-lg">{notification}</div>}
      <FeedMobileNav activeItem="saved" />
    </div>
  );
}