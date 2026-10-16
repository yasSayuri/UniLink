import { useEffect, useMemo, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import {
  CalendarDays, Camera, Check, ChevronDown, Clock3, Edit3, MapPin, MoreVertical, Plus, Search, Share2, Trash2, Users, X,
} from 'lucide-react';
import FeedHeader from '../components/feed/FeedHeader';
import FeedMobileNav from '../components/feed/FeedMobileNav';
import FeedSidebar from '../components/feed/FeedSidebar';
import { createEvent as apiCreateEvent, deleteEvent as apiDeleteEvent, editEvent as apiEditEvent, getEvents } from '../utils/authApi';

const defaultEventImage = 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=900&q=85';

const eventCategories = ['Acadêmico', 'Cultura', 'Carreira', 'Esportes', 'Bem-estar', 'Festa', 'Lazer'];
const clockNumbers = Array.from({ length: 12 }, (_, index) => index + 1);
const outerClockNumbers = [0, ...Array.from({ length: 11 }, (_, index) => index + 13)];
const minuteNumbers = Array.from({ length: 12 }, (_, index) => index * 5);

function readEventImage(event, setDraft) {
  const file = event.target.files?.[0];
  if (!file || file.size > 2 * 1024 * 1024) return;
  const reader = new FileReader();
  reader.onload = () => setDraft((current) => ({ ...current, imageUrl: reader.result }));
  reader.readAsDataURL(file);
}

function toEventCard(event) {
  const eventDate = new Date(`${event.date}T12:00:00`);
  return {
    ...event,
    rawDate: event.date,
    date: new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' }).format(eventDate) + ` · ${event.time}`,
    image: event.imageUrl || defaultEventImage,
    imagePosition: { x: event.imagePositionX ?? 50, y: event.imagePositionY ?? 50 },
  };
}

export default function Events() {
  const coverImageInputRef = useRef(null);
  const imageDragRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [eventsError, setEventsError] = useState('');
  const [notification, setNotification] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todas');
  const [view, setView] = useState('discover');
  const [interested, setInterested] = useState(() => new Set());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isTimeOpen, setIsTimeOpen] = useState(false);
  const [clockMode, setClockMode] = useState('hour');
  const [draft, setDraft] = useState({
    title: '',
    description: '',
    category: 'Acadêmico',
    imageUrl: '',
    imagePosition: { x: 50, y: 50 },
    date: '',
    time: '',
    location: '',
  });

  useEffect(() => {
    getEvents()
      .then((result) => setEvents(result.map(toEventCard)))
      .catch((error) => setEventsError(error.message));
  }, []);

  useEffect(() => {
    if (!notification) return undefined;
    const timeout = window.setTimeout(() => setNotification(''), 2200);
    return () => window.clearTimeout(timeout);
  }, [notification]);

  const visibleEvents = useMemo(() => events.filter((event) => {
    const searchableText = `${event.title} ${event.description} ${event.location}`.toLocaleLowerCase('pt-BR');
    const matchesSearch = searchableText.includes(search.toLocaleLowerCase('pt-BR'));
    return matchesSearch
      && (category === 'Todas' || event.category === category)
      && (view !== 'my' || interested.has(event.id));
  }), [events, search, category, view, interested]);

  const submitEvent = async (event) => {
    event.preventDefault();
    const title = draft.title.trim();
    const description = draft.description.trim();
    const location = draft.location.trim();
    if (!title || !description || !draft.date || !draft.time || !location) return;

    const payload = {
      title,
      description,
      category: draft.category,
      date: draft.date,
      time: draft.time,
      location,
      imageUrl: draft.imageUrl,
      imagePositionX: draft.imagePosition.x,
      imagePositionY: draft.imagePosition.y,
    };
    let savedEvent;
    try {
      savedEvent = editingEventId
        ? await apiEditEvent(editingEventId, payload)
        : await apiCreateEvent(payload);
    } catch (error) {
      setEventsError(error.message);
      return;
    }
    const eventCard = toEventCard(savedEvent);
    setEvents((current) => editingEventId
      ? current.map((item) => item.id === editingEventId ? eventCard : item)
      : [eventCard, ...current]);
    setDraft({ title: '', description: '', category: 'Acadêmico', imageUrl: '', imagePosition: { x: 50, y: 50 }, date: '', time: '', location: '' });
    setIsCreateOpen(false);
    setEditingEventId(null);
    setView('discover');
  };

  const editEvent = (event) => {
    setDraft({
      title: event.title,
      description: event.description,
      category: event.category,
      imageUrl: event.image,
      imagePosition: event.imagePosition || { x: 50, y: 50 },
      date: event.rawDate || '',
      time: event.time || event.date.split('·').pop()?.trim() || '',
      location: event.location,
    });
    setEditingEventId(event.id);
    setOpenMenuId(null);
    setIsCreateOpen(true);
  };

  const startImageDrag = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    imageDragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      initialX: draft.imagePosition.x,
      initialY: draft.imagePosition.y,
      width: event.currentTarget.clientWidth,
      height: event.currentTarget.clientHeight,
    };
  };

  const moveImageDrag = (event) => {
    const drag = imageDragRef.current;
    if (!drag) return;
    setDraft((current) => ({
      ...current,
      imagePosition: {
        x: Math.max(0, Math.min(100, drag.initialX - ((event.clientX - drag.startX) * 50) / drag.width)),
        y: Math.max(0, Math.min(100, drag.initialY - ((event.clientY - drag.startY) * 50) / drag.height)),
      },
    }));
  };

  const stopImageDrag = () => {
    imageDragRef.current = null;
  };

  const removeEvent = async (eventId) => {
    await apiDeleteEvent(eventId);
    setEvents((current) => current.filter((event) => event.id !== eventId));
    setInterested((current) => {
      const next = new Set(current);
      next.delete(eventId);
      return next;
    });
    setOpenMenuId(null);
  };

  const openCreateEvent = () => {
    setDraft({ title: '', description: '', category: 'Acadêmico', imageUrl: '', imagePosition: { x: 50, y: 50 }, date: '', time: '', location: '' });
    setEditingEventId(null);
    setIsDateOpen(false);
    setIsTimeOpen(false);
    setClockMode('hour');
    setIsCreateOpen(true);
  };

  const chooseClockHour = (hour) => {
    const currentMinutes = draft.time ? draft.time.split(':')[1] : '00';
    const normalizedHour = String(hour).padStart(2, '0');
    setDraft((current) => ({ ...current, time: `${normalizedHour}:${currentMinutes}` }));
    setClockMode('minute');
  };

  const chooseClockMinute = (minute) => {
    const currentHour = draft.time ? draft.time.split(':')[0] : '00';
    setDraft((current) => ({ ...current, time: `${currentHour}:${String(minute).padStart(2, '0')}` }));
    setIsTimeOpen(false);
  };

  const selectedDate = draft.date ? new Date(`${draft.date}T12:00:00`) : undefined;
  const formattedDraftDate = selectedDate
    ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(selectedDate)
    : '';

  const shareEvent = async (eventId) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/eventos#evento-${eventId}`);
      setNotification('Link da publicação copiado!');
    } catch {
      setNotification('Não foi possível copiar o link.');
    }
  };

  return (
    <div className="large-screen-dashboard min-h-screen bg-[#F4F5F7] pb-24 font-sans text-slate-700 lg:h-dvh lg:overflow-hidden lg:pb-0">
      <FeedHeader />
      {notification && <div role="status" className="dark-notification-toast fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold text-white shadow-lg">{notification}</div>}
      <div className="mx-auto mt-4 grid max-w-7xl grid-cols-1 gap-4 px-3 sm:mt-6 sm:gap-6 sm:px-4 lg:h-[calc(100dvh-96px)] lg:grid-cols-12 lg:items-stretch lg:overflow-hidden">
        <FeedSidebar activeItem="events" eventCategory={category} onEventCategoryChange={setCategory} eventView={view} onEventViewChange={setView} />
        <main className="primary-scroll min-w-0 space-y-5 lg:col-span-9 lg:overflow-y-auto lg:overscroll-contain lg:pr-2">
          <section className="flex items-center justify-between gap-3">
            <div><h1 className="text-xl font-extrabold text-slate-800">{view === 'my' ? 'Seus eventos' : 'Descobrir eventos'}</h1><p className="mt-1 text-xs text-slate-500">Encontre atividades e encontros da comunidade universitária.</p></div>
          </section>
          {eventsError && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">{eventsError}</p>}
          <section className="flex items-center gap-2">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Buscar eventos</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar eventos" className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100" />
            </label>
            <button type="button" onClick={openCreateEvent} className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-[#FFC72C] px-3 text-xs font-bold text-slate-800 transition hover:bg-amber-400 sm:px-4">
              <Plus className="h-4 w-4" /><span className="hidden sm:inline">Criar evento</span><span className="sm:hidden">Criar</span>
            </button>
          </section>
          {visibleEvents.length ? (
            <section aria-label="Eventos encontrados" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibleEvents.map((event) => {
                const isInterested = interested.has(event.id);
                return (
                  <article id={`evento-${event.id}`} key={event.id} className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="relative aspect-[16/9] overflow-hidden bg-slate-200"><img src={event.image} alt={event.title} className="h-full w-full object-cover" style={{ objectPosition: `${event.imagePosition?.x ?? 50}% ${event.imagePosition?.y ?? 50}%` }} loading="lazy" /><span className="absolute left-3 top-3 rounded-lg bg-white/95 px-2.5 py-1.5 text-[10px] font-bold text-slate-800">{event.category}</span></div>
                    <div className="flex flex-1 flex-col space-y-3 p-4">
                      <div><h2 className="line-clamp-2 min-h-10 text-sm font-extrabold text-slate-800">{event.title}</h2><p className="mt-1 line-clamp-2 min-h-8 text-xs text-slate-500">{event.description}</p></div>
                      <div className="min-h-[58px] space-y-1.5 text-[11px] text-slate-600"><p className="flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5 text-amber-700" />{event.date}</p><p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-amber-700" />{event.location}</p><p className="flex items-center gap-2"><Users className="h-3.5 w-3.5 text-amber-700" />Comunidade universitária</p></div>
                      <div className="mt-auto flex gap-2 border-t border-slate-100 pt-3">
                        <button type="button" onClick={() => setInterested((current) => { const next = new Set(current); if (next.has(event.id)) next.delete(event.id); else next.add(event.id); return next; })} className={`event-interest-button flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-bold transition ${isInterested ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700 hover:bg-amber-100'}`}>{isInterested ? <Check className="h-4 w-4" /> : <CalendarDays className="h-4 w-4" />}{isInterested ? 'Interessado' : 'Tenho interesse'}</button>
                        <button type="button" onClick={() => shareEvent(event.id)} title="Compartilhar evento" aria-label={`Compartilhar ${event.title}`} className="flex h-9 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"><Share2 className="h-4 w-4" /></button>
                        {event.createdByMe && <div className="relative">
                          <button type="button" onClick={() => setOpenMenuId((current) => current === event.id ? null : event.id)} title="Mais opções" aria-label={`Mais opções para ${event.title}`} aria-expanded={openMenuId === event.id} className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"><MoreVertical className="h-4 w-4" /></button>
                          {openMenuId === event.id && <div className="absolute bottom-11 right-0 z-20 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                            <button type="button" onClick={() => editEvent(event)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-100"><Edit3 className="h-3.5 w-3.5" />Editar</button>
                            <button type="button" onClick={() => removeEvent(event.id)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" />Excluir</button>
                          </div>}
                        </div>}
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          ) : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><CalendarDays className="mx-auto h-8 w-8 text-slate-300" /><h2 className="mt-3 text-sm font-bold text-slate-700">Nenhum evento encontrado</h2><p className="mt-1 text-xs text-slate-500">Ajuste os filtros ou explore outra categoria.</p></div>}
        </main>
      </div>
      {isCreateOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) { setIsCreateOpen(false); setEditingEventId(null); } }}>
          <section role="dialog" aria-modal="true" aria-labelledby="create-event-title" className="max-h-[94dvh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <form onSubmit={submitEvent}>
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-5">
                <div className="flex items-center gap-2.5">
                  <button type="button" onClick={() => { setIsCreateOpen(false); setEditingEventId(null); }} aria-label="Fechar" className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100"><X className="h-5 w-5" /></button>
                  <h2 id="create-event-title" className="text-lg font-extrabold text-slate-800">{editingEventId ? 'Editar evento' : 'Criar evento'}</h2>
                </div>
                <button type="submit" className="inline-flex items-center gap-1.5 rounded-full bg-[#FFC72C] px-4 py-2 text-xs font-bold text-slate-900 transition hover:bg-amber-400">
                  {!editingEventId && <Plus className="h-3.5 w-3.5" />}{editingEventId ? 'Salvar alterações' : 'Criar evento'}
                </button>
              </div>
              <div className="space-y-4 px-4 pb-5 pt-4 sm:px-5">
                <div className="relative h-44 overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800 via-slate-700 to-amber-500 sm:h-52">
                  {draft.imageUrl && <img src={draft.imageUrl} alt="Prévia da foto de capa do evento" draggable="false" onPointerDown={startImageDrag} onPointerMove={moveImageDrag} onPointerUp={stopImageDrag} onPointerCancel={stopImageDrag} className="h-full w-full cursor-grab select-none object-cover touch-none active:cursor-grabbing" style={{ objectPosition: `${draft.imagePosition.x}% ${draft.imagePosition.y}%` }} />}
                  <button type="button" onClick={() => coverImageInputRef.current?.click()} aria-label="Alterar foto de capa do evento" className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-slate-900/70 p-3 text-white transition hover:bg-slate-900">
                    <Camera className="h-5 w-5" />
                  </button>
                  <span className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-white/95 px-2.5 py-1 text-[11px] font-bold text-slate-800">Foto de capa</span>
                </div>
                <input ref={coverImageInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" hidden onChange={(event) => readEventImage(event, setDraft)} />
                <label className="block text-xs font-semibold text-slate-700">
                  Nome
                  <input autoFocus required value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100" />
                </label>
                <label className="block text-xs font-semibold text-slate-700">
                  Descrição
                  <textarea required value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} rows="4" className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100" />
                </label>
                <label className="block text-xs font-semibold text-slate-700">
                  Categoria
                  <span className="relative mt-1.5 block">
                    <button type="button" aria-haspopup="listbox" aria-expanded={isCategoryOpen} onClick={() => setIsCategoryOpen((current) => !current)} className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 text-left text-sm font-normal text-slate-700 outline-none transition hover:border-slate-300 focus:border-amber-400 focus:ring-4 focus:ring-amber-100">
                      <span>{draft.category}</span><ChevronDown className={`h-4 w-4 text-slate-500 transition ${isCategoryOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isCategoryOpen && <div role="listbox" aria-label="Categorias do evento" className="absolute left-0 right-0 top-12 z-30 max-h-32 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                      {eventCategories.map((item) => <button key={item} type="button" role="option" aria-selected={draft.category === item} onClick={() => { setDraft((current) => ({ ...current, category: item })); setIsCategoryOpen(false); }} className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${draft.category === item ? 'bg-amber-50 font-semibold text-amber-800' : 'text-slate-700 hover:bg-slate-50'}`}>{item}</button>)}
                    </div>}
                  </span>
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Data
                    <span className="relative mt-1.5 block">
                      <button type="button" onClick={() => { setIsDateOpen((current) => !current); setIsTimeOpen(false); }} className="flex h-11 w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 text-left text-sm font-normal text-slate-700 outline-none transition hover:border-slate-300 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100">
                        <CalendarDays className="h-4 w-4 text-amber-600" />{formattedDraftDate || <span className="text-slate-400">dd/mm/aaaa</span>}
                      </button>
                      {isDateOpen && <div className="absolute bottom-12 left-0 z-40 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                        <DayPicker mode="single" selected={selectedDate} onSelect={(date) => { if (!date) return; const year = date.getFullYear(); const month = String(date.getMonth() + 1).padStart(2, '0'); const day = String(date.getDate()).padStart(2, '0'); setDraft((current) => ({ ...current, date: `${year}-${month}-${day}` })); setIsDateOpen(false); }} />
                      </div>}
                    </span>
                  </label>
                  <label className="block text-xs font-semibold text-slate-700">
                    Hora
                    <span className="relative mt-1.5 block">
                      <button type="button" onClick={() => { setIsTimeOpen((current) => !current); setIsDateOpen(false); }} className="flex h-11 w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 text-left text-sm font-normal text-slate-700 outline-none transition hover:border-slate-300 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100">
                        <Clock3 className="h-4 w-4 text-amber-600" />{draft.time || <span className="text-slate-400">--:--</span>}
                      </button>
                      {isTimeOpen && <div className="absolute bottom-12 left-0 z-40 w-full rounded-2xl border border-slate-200 bg-white p-3 shadow-xl sm:w-72">
                        <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2">
                          <strong className="text-lg font-extrabold text-slate-800">{draft.time || '00:00'}</strong>
                          <div className="flex rounded-lg bg-slate-100 p-1">
                            <span className="rounded-md bg-amber-400 px-2 py-1 text-[10px] font-bold text-slate-900">24h</span>
                          </div>
                        </div>
                        <div className="mb-3 flex gap-1 rounded-lg bg-slate-100 p-1">
                          <button type="button" onClick={() => setClockMode('hour')} className={`flex-1 rounded-md py-1.5 text-xs font-bold ${clockMode === 'hour' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-500'}`}>Hora</button>
                          <button type="button" onClick={() => setClockMode('minute')} className={`flex-1 rounded-md py-1.5 text-xs font-bold ${clockMode === 'minute' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-500'}`}>Minuto</button>
                        </div>
                        <div className="relative mx-auto h-52 w-52 rounded-full bg-slate-50">
                          <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500" />
                          {clockMode === 'hour' ? <>
                            {clockNumbers.map((number) => {
                              const angle = (number * 30 - 90) * (Math.PI / 180);
                              return <button key={number} type="button" onClick={() => chooseClockHour(number)} className="absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs font-bold text-slate-700 transition hover:bg-amber-100 hover:text-amber-800" style={{ left: `${50 + Math.cos(angle) * 30}%`, top: `${50 + Math.sin(angle) * 30}%` }}>{String(number).padStart(2, '0')}</button>;
                            })}
                            {outerClockNumbers.map((number, index) => {
                              const angle = (index * 30 - 90) * (Math.PI / 180);
                              return <button key={number} type="button" onClick={() => chooseClockHour(number)} className="absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[10px] font-bold text-slate-500 transition hover:bg-amber-100 hover:text-amber-800" style={{ left: `${50 + Math.cos(angle) * 43}%`, top: `${50 + Math.sin(angle) * 43}%` }}>{String(number).padStart(2, '0')}</button>;
                            })}
                          </> : minuteNumbers.map((number) => {
                            const angle = (number * 6 - 90) * (Math.PI / 180);
                            return <button key={number} type="button" onClick={() => chooseClockMinute(number)} className="absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs font-bold text-slate-700 transition hover:bg-amber-100 hover:text-amber-800" style={{ left: `${50 + Math.cos(angle) * 38}%`, top: `${50 + Math.sin(angle) * 38}%` }}>{String(number).padStart(2, '0')}</button>;
                          })}
                        </div>
                        <p className="mt-2 text-center text-[10px] text-slate-400">Escolha o {clockMode === 'hour' ? 'horário' : 'minuto'}</p>
                      </div>}
                    </span>
                  </label>
                </div>
                <label className="block text-xs font-semibold text-slate-700">
                  Local
                  <input required value={draft.location} onChange={(event) => setDraft((current) => ({ ...current, location: event.target.value }))} placeholder="Campus ou endereço" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100" />
                </label>
              </div>
            </form>
          </section>
        </div>
      )}
      <FeedMobileNav activeItem="events" />
    </div>
  );
}
