import { useEffect, useMemo, useState } from 'react';
import {
  Bookmark, CalendarDays, Check, ChevronDown, Clock3, MapPin, Plus, Search,
  Share2, Tag, Users, X,
} from 'lucide-react';
import FeedHeader from '../components/feed/FeedHeader';
import FeedMobileNav from '../components/feed/FeedMobileNav';
import FeedSidebar from '../components/feed/FeedSidebar';

const initialEvents = [
  {
    id: 1,
    title: 'Acolhida de boas-vindas UTFPR',
    category: 'Acadêmico',
    date: 'Qui, 1 de out. · 18:00',
    dateGroup: 'week',
    location: 'Campus Centro',
    description: 'Uma noite para conhecer gente nova e começar o semestre junto.',
    going: 86,
    friendsGoing: 5,
    following: true,
    image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 2,
    title: 'Festival de música no campus',
    category: 'Música',
    date: 'Sáb, 3 de out. · 16:00',
    dateGroup: 'week',
    location: 'Campus Ecoville',
    description: 'Bandas universitárias, praça de alimentação e entrada gratuita.',
    going: 214,
    friendsGoing: 12,
    following: true,
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 3,
    title: 'Feira de estágios e carreiras',
    category: 'Carreira',
    date: 'Qua, 7 de out. · 10:00',
    dateGroup: 'month',
    location: 'Campus Centro',
    description: 'Converse com empresas, conheça oportunidades e revise seu currículo.',
    going: 143,
    friendsGoing: 8,
    following: false,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 4,
    title: 'Corrida solidária dos estudantes',
    category: 'Esportes',
    date: 'Sáb, 10 de out. · 08:00',
    dateGroup: 'month',
    location: 'Curitiba',
    description: 'Percurso de 5 km aberto a todos os cursos. Traga 1 kg de alimento.',
    going: 97,
    friendsGoing: 3,
    following: false,
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 5,
    title: 'Mostra de cinema universitário',
    category: 'Cultura',
    date: 'Qua, 14 de out. · 19:30',
    dateGroup: 'month',
    location: 'Campus Centro',
    description: 'Curtas produzidos por estudantes seguidos de conversa com realizadores.',
    going: 58,
    friendsGoing: 2,
    following: true,
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 6,
    title: 'Encontro de tecnologia e inovação',
    category: 'Acadêmico',
    date: 'Sáb, 17 de out. · 09:00',
    dateGroup: 'month',
    location: 'Campus Ecoville',
    description: 'Palestras curtas e demonstrações de projetos criados na universidade.',
    going: 121,
    friendsGoing: 6,
    following: true,
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85',
  },
];

const tabs = ['Principais', 'Amigos', 'Seguindo'];

export default function Events() {
  const [events, setEvents] = useState(initialEvents);
  const [eventSearch, setEventSearch] = useState('');
  const [eventCategory, setEventCategory] = useState('Todas');
  const [eventView, setEventView] = useState('discover');
  const [activeTab, setActiveTab] = useState('Principais');
  const [location, setLocation] = useState('Todos os locais');
  const [dateRange, setDateRange] = useState('Qualquer data');
  const [interestedIds, setInterestedIds] = useState(() => new Set());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [draftEvent, setDraftEvent] = useState({ title: '', date: '', location: 'Campus Centro' });

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(''), 2400);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const visibleEvents = useMemo(() => events.filter((event) => {
    const matchesSearch = `${event.title} ${event.description} ${event.location}`.toLocaleLowerCase('pt-BR').includes(eventSearch.toLocaleLowerCase('pt-BR'));
    const matchesCategory = eventCategory === 'Todas' || event.category === eventCategory;
    const matchesLocation = location === 'Todos os locais' || event.location === location;
    const matchesDate = dateRange !== 'Esta semana' || event.dateGroup === 'week';
    const matchesTab = activeTab === 'Principais' || (activeTab === 'Amigos' ? event.friendsGoing > 0 : event.following);
    const matchesView = eventView !== 'my' || interestedIds.has(event.id);
    return matchesSearch && matchesCategory && matchesLocation && matchesDate && matchesTab && matchesView;
  }), [events, eventSearch, eventCategory, location, dateRange, activeTab, eventView, interestedIds]);

  const toggleInterest = (eventId) => {
    setInterestedIds((current) => {
      const updated = new Set(current);
      if (updated.has(eventId)) updated.delete(eventId);
      else updated.add(eventId);
      return updated;
    });
  };

  const shareEvent = async (eventId) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/eventos#evento-${eventId}`);
      setToast('Link do evento copiado!');
    } catch {
      setToast('Não foi possível copiar o link.');
    }
  };

  const createEvent = (event) => {
    event.preventDefault();
    if (!draftEvent.title.trim() || !draftEvent.date) return;
    const formattedDate = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(`${draftEvent.date}T12:00:00`));
    const newEvent = {
      id: Date.now(),
      title: draftEvent.title.trim(),
      category: 'Acadêmico',
      date: `${formattedDate} · 18:00`,
      dateGroup: 'month',
      location: draftEvent.location.trim() || 'Campus Centro',
      description: 'Novo evento da comunidade universitária.',
      going: 1,
      friendsGoing: 0,
      following: false,
      image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=900&q=85',
    };
    setEvents((current) => [newEvent, ...current]);
    setEventView('discover');
    setActiveTab('Principais');
    setEventCategory('Todas');
    setLocation('Todos os locais');
    setDateRange('Qualquer data');
    setIsCreateOpen(false);
    setDraftEvent({ title: '', date: '', location: 'Campus Centro' });
    setToast('Evento criado!');
  };

  return (
    <div className="large-screen-dashboard min-h-screen bg-[#F4F5F7] pb-24 font-sans text-slate-700 lg:h-dvh lg:overflow-hidden lg:pb-0">
      <FeedHeader />
      <div className="mx-auto mt-4 grid max-w-7xl grid-cols-1 gap-4 px-3 sm:mt-6 sm:gap-6 sm:px-4 lg:h-[calc(100dvh-96px)] lg:grid-cols-12 lg:items-stretch lg:overflow-hidden">
        <FeedSidebar
          activeItem="events"
          eventCategory={eventCategory}
          onEventCategoryChange={setEventCategory}
          eventView={eventView}
          onEventViewChange={setEventView}
          onCreateEvent={() => setIsCreateOpen(true)}
        />

        <main className="min-w-0 space-y-5 lg:col-span-9 lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:overflow-y-auto lg:overscroll-contain lg:pr-2">
          <section className="flex items-center justify-between gap-3 lg:shrink-0">
            <div>
              <h1 className="text-xl font-extrabold leading-tight text-slate-800">{eventView === 'my' ? 'Seus eventos' : 'Descobrir eventos'}</h1>
              <p className="mt-1 text-xs text-slate-500">Encontre atividades e encontros da comunidade universitária.</p>
            </div>
          </section>

            <section className="grid grid-cols-2 items-center gap-2 lg:flex lg:flex-wrap lg:shrink-0">
              <div className="col-span-2 flex min-w-0 gap-2 lg:contents">
              <label className="relative min-w-0 flex-1 lg:w-64 lg:flex-1">
                <span className="sr-only">Buscar eventos</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input type="search" value={eventSearch} onChange={(event) => setEventSearch(event.target.value)} placeholder="Buscar eventos" className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-100" />
              </label>
              <button type="button" onClick={() => setIsCreateOpen(true)} className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-[#FFC72C] px-3 text-xs font-bold text-slate-800 transition hover:bg-amber-400 lg:hidden"><Plus className="h-4 w-4" />Criar</button>
              </div>
              <label className="relative min-w-0 lg:w-auto">
                <span className="sr-only">Filtrar por localização</span>
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <select value={location} onChange={(event) => setLocation(event.target.value)} className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-xs font-semibold text-slate-700 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100 lg:w-auto">
                  <option>Todos os locais</option><option>Campus Centro</option><option>Campus Ecoville</option><option>Curitiba</option>
                </select><ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
              </label>
              <label className="relative min-w-0 lg:w-auto">
                <span className="sr-only">Filtrar por data</span>
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <select value={dateRange} onChange={(event) => setDateRange(event.target.value)} className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-xs font-semibold text-slate-700 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100 lg:w-auto">
                  <option>Qualquer data</option><option>Esta semana</option><option>Este mês</option>
                </select><ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
              </label>
              <label className="relative min-w-0 lg:hidden">
                <span className="sr-only">Filtrar por categoria</span>
                <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <select value={eventCategory} onChange={(event) => setEventCategory(event.target.value)} className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-xs font-semibold text-slate-700 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100">
                  {['Todas', 'Acadêmico', 'Música', 'Cultura', 'Carreira', 'Esportes', 'Bem-estar', 'Festas'].map((category) => <option key={category} value={category}>{category === 'Todas' ? 'Categorias' : category}</option>)}
                </select><ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
              </label>
              <button type="button" onClick={() => setEventView((current) => current === 'my' ? 'discover' : 'my')} aria-pressed={eventView === 'my'} className={`inline-flex h-11 min-w-0 items-center justify-start gap-1.5 rounded-xl border px-3 text-left text-xs font-semibold transition lg:hidden ${eventView === 'my' ? 'border-amber-300 bg-amber-100 text-amber-900' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>
                <Bookmark className="h-4 w-4 shrink-0" />Seus eventos
              </button>
              {(eventCategory !== 'Todas' || eventSearch || location !== 'Todos os locais' || dateRange !== 'Qualquer data') && <button type="button" onClick={() => { setEventCategory('Todas'); setEventSearch(''); setLocation('Todos os locais'); setDateRange('Qualquer data'); }} className="col-span-2 justify-self-start px-2 py-2 text-xs font-semibold text-amber-700 hover:underline lg:col-auto">Limpar filtros</button>}
            </section>

            <nav aria-label="Filtro de eventos" className="flex gap-2 overflow-x-auto pb-1 lg:shrink-0">
              {tabs.map((tab) => <button key={tab} type="button" onClick={() => setActiveTab(tab)} aria-pressed={activeTab === tab} className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${activeTab === tab ? 'bg-[#FFC72C] text-slate-900' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>{tab}</button>)}
            </nav>

            {visibleEvents.length ? (
              <section aria-label="Eventos encontrados" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {visibleEvents.map((event) => {
                  const isInterested = interestedIds.has(event.id);
                  return (
                    <article id={`evento-${event.id}`} key={event.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                      <div className="relative aspect-[16/9] overflow-hidden bg-slate-200">
                        <img src={event.image} alt={event.title} className="h-full w-full object-cover" loading="lazy" />
                        <span className="absolute left-3 top-3 rounded-lg bg-white/95 px-2.5 py-1.5 text-[10px] font-bold text-slate-800 shadow-sm">{event.category}</span>
                      </div>
                      <div className="space-y-3 p-4">
                        <div><h2 className="line-clamp-2 min-h-10 text-sm font-extrabold leading-snug text-slate-800">{event.title}</h2><p className="mt-1 text-xs leading-relaxed text-slate-500">{event.description}</p></div>
                        <div className="space-y-1.5 text-[11px] text-slate-600">
                          <p className="flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5 text-amber-700" />{event.date}</p>
                          <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-amber-700" />{event.location}</p>
                          <p className="flex items-center gap-2"><Users className="h-3.5 w-3.5 text-amber-700" />{event.going + (isInterested ? 1 : 0)} pessoas interessadas</p>
                        </div>
                        <div className="flex gap-2 border-t border-slate-100 pt-3">
                          <button type="button" onClick={() => toggleInterest(event.id)} className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-bold transition ${isInterested ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700 hover:bg-amber-100'}`}>{isInterested ? <Check className="h-4 w-4" /> : <CalendarDays className="h-4 w-4" />}{isInterested ? 'Interessado' : 'Tenho interesse'}</button>
                          <button type="button" onClick={() => shareEvent(event.id)} title="Compartilhar evento" aria-label={`Compartilhar ${event.title}`} className="flex h-9 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition hover:bg-slate-200"><Share2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </section>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <CalendarDays className="mx-auto h-8 w-8 text-slate-300" />
                <h2 className="mt-3 text-sm font-bold text-slate-700">Nenhum evento encontrado</h2>
                <p className="mt-1 text-xs text-slate-500">Ajuste os filtros ou explore outra categoria.</p>
              </div>
            )}
        </main>
      </div>

      {isCreateOpen && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsCreateOpen(false); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="create-event-title" className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
          <div className="mb-5 flex items-center justify-between"><h2 id="create-event-title" className="text-lg font-extrabold text-slate-800">Criar evento</h2><button type="button" onClick={() => setIsCreateOpen(false)} aria-label="Fechar" className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"><X className="h-4 w-4" /></button></div>
          <form onSubmit={createEvent} className="space-y-4">
            <label className="block text-xs font-semibold text-slate-700">Nome do evento<input autoFocus required value={draftEvent.title} onChange={(event) => setDraftEvent((draft) => ({ ...draft, title: event.target.value }))} placeholder="Ex.: Encontro de boas-vindas" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100" /></label>
            <label className="block text-xs font-semibold text-slate-700">Data<input required type="date" value={draftEvent.date} onChange={(event) => setDraftEvent((draft) => ({ ...draft, date: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100" /></label>
            <label className="block text-xs font-semibold text-slate-700">Local<input value={draftEvent.location} onChange={(event) => setDraftEvent((draft) => ({ ...draft, location: event.target.value }))} placeholder="Campus ou endereço" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100" /></label>
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFC72C] px-4 py-3 text-sm font-bold text-slate-900 transition hover:bg-amber-400"><Plus className="h-4 w-4" />Publicar evento</button>
          </form>
        </section>
      </div>}

      {toast && <div role="status" className="fixed bottom-24 left-1/2 z-[70] -translate-x-1/2 rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold text-white shadow-lg"><span className="flex items-center gap-2"><Clock3 className="h-4 w-4" />{toast}</span></div>}
      <FeedMobileNav activeItem="events" />
    </div>
  );
}