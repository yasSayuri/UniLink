import { useMemo, useState } from 'react';
import {
  Bookmark, CalendarDays, Check, ChevronDown, MapPin, Plus, Search,
  Share2, Tag, Users, X,
} from 'lucide-react';
import FeedHeader from '../components/feed/FeedHeader';
import FeedMobileNav from '../components/feed/FeedMobileNav';
import FeedSidebar from '../components/feed/FeedSidebar';

const initialEvents = [
  { id: 1, title: 'Acolhida de boas-vindas UTFPR', category: 'Acadêmico', date: '1 de out. · 18:00', location: 'Campus Centro', description: 'Uma noite para conhecer gente nova e começar o semestre junto.', image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=900&q=85' },
  { id: 2, title: 'Festival de música no campus', category: 'Música', date: '3 de out. · 16:00', location: 'Campus Ecoville', description: 'Bandas universitárias, praça de alimentação e entrada gratuita.', image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=85' },
  { id: 3, title: 'Feira de estágios e carreiras', category: 'Carreira', date: '7 de out. · 10:00', location: 'Campus Centro', description: 'Converse com empresas e conheça oportunidades profissionais.', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=85' },
  { id: 4, title: 'Corrida solidária dos estudantes', category: 'Esportes', date: '10 de out. · 08:00', location: 'Curitiba', description: 'Percurso de 5 km aberto a todos os cursos.', image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=900&q=85' },
  { id: 5, title: 'Mostra de cinema universitário', category: 'Cultura', date: '14 de out. · 19:30', location: 'Campus Centro', description: 'Curtas produzidos por estudantes e conversa com realizadores.', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=85' },
  { id: 6, title: 'Encontro de tecnologia e inovação', category: 'Acadêmico', date: '17 de out. · 09:00', location: 'Campus Ecoville', description: 'Palestras e demonstrações de projetos universitários.', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85' },
];

const categories = ['Todas', 'Acadêmico', 'Música', 'Cultura', 'Carreira', 'Esportes', 'Bem-estar', 'Festas'];

export default function Events() {
  const [events, setEvents] = useState(initialEvents);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todas');
  const [view, setView] = useState('discover');
  const [interested, setInterested] = useState(() => new Set());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [draft, setDraft] = useState({ title: '', date: '', location: '' });

  const visibleEvents = useMemo(() => events.filter((event) => {
    const matchesSearch = `${event.title} ${event.description} ${event.location}`.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR'));
    return matchesSearch && (category === 'Todas' || event.category === category) && (view !== 'my' || interested.has(event.id));
  }), [events, search, category, view, interested]);

  const createEvent = (event) => {
    event.preventDefault();
    if (!draft.title.trim() || !draft.date) return;
    const date = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' }).format(new Date(`${draft.date}T12:00:00`));
    setEvents((current) => [{ id: Date.now(), title: draft.title.trim(), category: 'Acadêmico', date: `${date} · 18:00`, location: draft.location.trim() || 'Campus universitário', description: 'Novo evento da comunidade universitária.', image: initialEvents[0].image }, ...current]);
    setDraft({ title: '', date: '', location: '' });
    setIsCreateOpen(false);
    setView('discover');
  };

  const shareEvent = async (eventId) => {
    await navigator.clipboard.writeText(`${window.location.origin}/eventos#evento-${eventId}`);
  };

  return (
    <div className="large-screen-dashboard min-h-screen bg-[#F4F5F7] pb-24 font-sans text-slate-700 lg:h-dvh lg:overflow-hidden lg:pb-0">
      <FeedHeader />
      <div className="mx-auto mt-4 grid max-w-7xl grid-cols-1 gap-4 px-3 sm:mt-6 sm:gap-6 sm:px-4 lg:h-[calc(100dvh-96px)] lg:grid-cols-12 lg:items-stretch lg:overflow-hidden">
        <FeedSidebar activeItem="events" eventCategory={category} onEventCategoryChange={setCategory} eventView={view} onEventViewChange={setView} onCreateEvent={() => setIsCreateOpen(true)} />
        <main className="primary-scroll min-w-0 space-y-5 lg:col-span-9 lg:overflow-y-auto lg:overscroll-contain lg:pr-2">
          <section className="flex items-center justify-between gap-3">
            <div><h1 className="text-xl font-extrabold text-slate-800">{view === 'my' ? 'Seus eventos' : 'Descobrir eventos'}</h1><p className="mt-1 text-xs text-slate-500">Encontre atividades e encontros da comunidade universitária.</p></div>
            <button type="button" onClick={() => setIsCreateOpen(true)} className="hidden items-center gap-2 rounded-xl bg-[#FFC72C] px-4 py-2.5 text-xs font-bold text-slate-800 transition hover:bg-amber-400 sm:flex"><Plus className="h-4 w-4" />Criar evento</button>
          </section>
          <section className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_auto_auto]">
            <label className="relative col-span-2 sm:col-span-1"><span className="sr-only">Buscar eventos</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar eventos" className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100" /></label>
            <label className="relative"><span className="sr-only">Filtrar categoria</span><Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><select value={category} onChange={(event) => setCategory(event.target.value)} className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-xs font-semibold outline-none focus:border-amber-400">{categories.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2" /></label>
            <button type="button" onClick={() => setView((current) => current === 'my' ? 'discover' : 'my')} aria-pressed={view === 'my'} className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold ${view === 'my' ? 'border-amber-300 bg-amber-100' : 'border-slate-200 bg-white'}`}><Bookmark className="h-4 w-4" />Seus eventos</button>
          </section>
          {visibleEvents.length ? (
            <section aria-label="Eventos encontrados" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibleEvents.map((event) => {
                const isInterested = interested.has(event.id);
                return (
                  <article id={`evento-${event.id}`} key={event.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="relative aspect-[16/9] overflow-hidden bg-slate-200"><img src={event.image} alt={event.title} className="h-full w-full object-cover" loading="lazy" /><span className="absolute left-3 top-3 rounded-lg bg-white/95 px-2.5 py-1.5 text-[10px] font-bold text-slate-800">{event.category}</span></div>
                    <div className="space-y-3 p-4">
                      <div><h2 className="line-clamp-2 min-h-10 text-sm font-extrabold text-slate-800">{event.title}</h2><p className="mt-1 text-xs text-slate-500">{event.description}</p></div>
                      <div className="space-y-1.5 text-[11px] text-slate-600"><p className="flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5 text-amber-700" />{event.date}</p><p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-amber-700" />{event.location}</p><p className="flex items-center gap-2"><Users className="h-3.5 w-3.5 text-amber-700" />Comunidade universitária</p></div>
                      <div className="flex gap-2 border-t border-slate-100 pt-3">
                        <button type="button" onClick={() => setInterested((current) => { const next = new Set(current); if (next.has(event.id)) next.delete(event.id); else next.add(event.id); return next; })} className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-bold ${isInterested ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700 hover:bg-amber-100'}`}>{isInterested ? <Check className="h-4 w-4" /> : <CalendarDays className="h-4 w-4" />}{isInterested ? 'Interessado' : 'Tenho interesse'}</button>
                        <button type="button" onClick={() => shareEvent(event.id)} title="Compartilhar evento" aria-label={`Compartilhar ${event.title}`} className="flex h-9 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"><Share2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          ) : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><CalendarDays className="mx-auto h-8 w-8 text-slate-300" /><h2 className="mt-3 text-sm font-bold text-slate-700">Nenhum evento encontrado</h2><p className="mt-1 text-xs text-slate-500">Ajuste os filtros ou explore outra categoria.</p></div>}
        </main>
      </div>
      {isCreateOpen && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsCreateOpen(false); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="create-event-title" className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
          <div className="mb-5 flex items-center justify-between"><h2 id="create-event-title" className="text-lg font-extrabold text-slate-800">Criar evento</h2><button type="button" onClick={() => setIsCreateOpen(false)} aria-label="Fechar" className="rounded-full p-2 text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button></div>
          <form onSubmit={createEvent} className="space-y-4">
            <label className="block text-xs font-semibold text-slate-700">Nome do evento<input autoFocus required value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-400" /></label>
            <label className="block text-xs font-semibold text-slate-700">Data<input required type="date" value={draft.date} onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-400" /></label>
            <label className="block text-xs font-semibold text-slate-700">Local<input value={draft.location} onChange={(event) => setDraft((current) => ({ ...current, location: event.target.value }))} placeholder="Campus ou endereço" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-400" /></label>
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFC72C] px-4 py-3 text-sm font-bold text-slate-900 hover:bg-amber-400"><Plus className="h-4 w-4" />Publicar evento</button>
          </form>
        </section>
      </div>}
      <FeedMobileNav activeItem="events" />
    </div>
  );
}
