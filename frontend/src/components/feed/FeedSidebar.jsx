import {
  Bookmark, BookOpen, BriefcaseBusiness, Calendar, ChevronDown,
  Compass, Dumbbell, HeartPulse, Home, MapPin, Palette, PartyPopper,
  Plus, Search, School, Settings, SlidersHorizontal, Sparkles, User, Users,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const eventCategories = [
  { name: 'Todas', icon: Calendar },
  { name: 'Acadêmico', icon: BookOpen },
  { name: 'Cultura', icon: Palette },
  { name: 'Carreira', icon: BriefcaseBusiness },
  { name: 'Esportes', icon: Dumbbell },
  { name: 'Bem-estar', icon: HeartPulse },
  { name: 'Festa', icon: PartyPopper },
  { name: 'Lazer', icon: Sparkles },
];

function AcademicFilterSelect({ label, value, options, placeholder, icon: Icon, disabled = false, loading = false, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selectRef = useRef(null);
  const allOptions = [{ value: '', label: placeholder }, ...options];
  const selectedOption = allOptions.find((option) => option.value === value);
  const visibleOptions = allOptions
    .filter((option) => option.label.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')));

  useEffect(() => {
    if (!open) return undefined;
    const handleOutsidePointerDown = (event) => {
      if (!selectRef.current?.contains(event.target)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('pointerdown', handleOutsidePointerDown);
    return () => document.removeEventListener('pointerdown', handleOutsidePointerDown);
  }, [open]);

  return (
    <div ref={selectRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => { setOpen((current) => !current); setQuery(''); }}
        className="flex w-full items-center justify-between rounded-2xl p-2.5 text-left transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="flex min-w-0 items-center gap-3">
          <Icon className="h-4 w-4 shrink-0 text-slate-500" />
          <span className="min-w-0">
            <span className="block text-xs font-semibold text-slate-700">{label}</span>
            <span className="block truncate text-[11px] text-slate-400">{loading ? 'Carregando...' : selectedOption?.label || placeholder}</span>
          </span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 -rotate-90 text-slate-400 transition ${open ? 'rotate-0' : ''}`} />
      </button>
      {open && !disabled && (
        <div role="listbox" className="absolute left-0 top-full z-40 mt-1 w-full min-w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
          <label className="relative block p-1">
            <span className="sr-only">Pesquisar {label.toLocaleLowerCase('pt-BR')}</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Pesquisar..."
              className="h-9 w-full rounded-lg bg-slate-50 pl-9 pr-2 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-amber-100"
            />
          </label>
          <div className="max-h-28 overflow-y-auto">
            {visibleOptions.length ? visibleOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={value === option.value}
                onClick={() => { onChange(option.value); setOpen(false); setQuery(''); }}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${value === option.value ? 'bg-amber-50 font-semibold text-amber-800' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                {option.label}
              </button>
            )) : <p className="px-3 py-3 text-xs text-slate-500">Nenhuma opção encontrada.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FeedSidebar({
  activeItem = 'home',
  selectedCommunity = 'all',
  onCommunitySelect,
  communitySearch = '',
  onCommunitySearchChange,
  communities = [],
  eventCategory = 'Todas',
  onEventCategoryChange,
  eventView = 'discover',
  onEventViewChange,
  onCreateCommunity,
  filterInstitution = '',
  filterCampus = '',
  filterCourse = '',
  institutions = [],
  campuses = [],
  courses = [],
  campusesLoading = false,
  coursesLoading = false,
  onInstitutionFilterChange,
  onCampusFilterChange,
  onCourseFilterChange,
}) {
  const isCommunities = activeItem === 'communities';
  const isEvents = activeItem === 'events';
  const navigation = [
    { id: 'home', label: 'Início', path: '/feed', icon: Home },
    { id: 'support', label: 'Apoio universitário', path: '/apoio-universitario', icon: Compass },
    { id: 'communities', label: 'Grupos', path: '/comunidades', icon: Users },
    { id: 'saved', label: 'Salvos', path: '/salvos', icon: Bookmark },
    { id: 'events', label: 'Eventos', path: '/eventos', icon: Calendar },
    { id: 'profile', label: 'Perfil', path: '/perfil', icon: User },
    { id: 'settings', label: 'Configurações', path: '/configuracoes', icon: Settings },
  ];

  return (
    <aside className="hidden space-y-5 lg:col-span-3 lg:block lg:min-h-0 lg:overflow-y-auto">
      <nav aria-label="Navegação principal" className="space-y-1 rounded-3xl border border-slate-100 bg-white p-3 shadow-sm">
        {navigation.map(({ id, label, path, icon: Icon }) => (
          <Link key={id} to={path} aria-current={activeItem === id ? 'page' : undefined} className={`flex w-full items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${activeItem === id ? 'bg-[#FFF8E6] font-bold text-[#D9A000]' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Icon className="h-5 w-5" /><span>{label}</span>
          </Link>
        ))}
      </nav>

      {isCommunities ? (
        <section className="space-y-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">Seus grupos</h2>
          </div>
          <label className="relative block">
            <span className="sr-only">Buscar grupos</span>
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input type="search" value={communitySearch} onChange={(event) => onCommunitySearchChange?.(event.target.value)} placeholder="Buscar grupos" className="w-full rounded-full bg-slate-100 py-2 pl-9 pr-3 text-xs text-slate-700 outline-none transition focus:ring-2 focus:ring-amber-200" />
          </label>
          <div className="space-y-2 border-b border-slate-100 pb-3">
            <nav aria-label="Grupos em que você participa" className="space-y-1">
              {communities
                .filter((community) => community.member)
                .filter((community) => community.name.toLocaleLowerCase('pt-BR').includes(communitySearch.toLocaleLowerCase('pt-BR')))
                .map((community) => (
              <button key={community.id} type="button" onClick={() => onCommunitySelect?.(community.name)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition ${selectedCommunity === community.name ? 'bg-slate-100 text-slate-800' : 'text-slate-600 hover:bg-slate-50'}`}>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600"><Users className="h-4 w-4" /></span><span className="truncate">{community.name}</span>
              </button>
              ))}
              {!communities
                .filter((community) => community.member)
                .filter((community) => community.name.toLocaleLowerCase('pt-BR').includes(communitySearch.toLocaleLowerCase('pt-BR')))
                .length && (
                <p className="px-3 py-2.5 text-xs text-slate-500">Você ainda não está em nenhum grupo.</p>
              )}
            </nav>
          </div>
          <button type="button" onClick={onCreateCommunity} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFC72C] px-3 py-2.5 text-xs font-bold text-slate-900 transition hover:bg-amber-400">
            <Plus className="h-4 w-4" />Criar novo grupo
          </button>
        </section>
      ) : isEvents ? (
        <section className="space-y-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
          <h2 className="px-1 text-sm font-bold text-slate-800">Eventos</h2>
          <nav aria-label="Navegação de eventos" className="space-y-1 border-b border-slate-100 pb-3">
            {[
              { id: 'discover', label: 'Descobrir eventos', icon: Calendar },
              { id: 'my', label: 'Seus eventos', icon: Bookmark },
            ].map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" onClick={() => onEventViewChange?.(id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition ${eventView === id ? 'bg-slate-100 text-slate-800' : 'text-slate-600 hover:bg-slate-50'}`}>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600"><Icon className="h-4 w-4" /></span>{label}
              </button>
            ))}
          </nav>
          <div className="space-y-1">
            <h3 className="px-2 pb-1 text-xs font-bold text-slate-800">Categorias</h3>
            {eventCategories.map(({ name, icon: Icon }) => (
              <button key={name} type="button" onClick={() => onEventCategoryChange?.(name)} className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-xs transition ${eventCategory === name ? 'bg-[#FFF8E6] font-bold text-[#D9A000]' : 'text-slate-600 hover:bg-[#FFF8E6] hover:text-[#D9A000]'}`}>
                <span className={`flex h-7 w-7 items-center justify-center rounded-full ${eventCategory === name ? 'bg-[#FFF3C4] text-[#D9A000]' : 'bg-slate-100 text-slate-600'}`}><Icon className="h-4 w-4" /></span>{name === 'Todas' ? 'Todas as categorias' : name}
              </button>
            ))}
          </div>
        </section>
      ) : (
        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between px-1">
            <span className="text-sm font-bold text-slate-800">Filtros</span>
            <SlidersHorizontal className="h-4 w-4 text-slate-500" />
          </div>
          <div className="space-y-1">
            <AcademicFilterSelect
              label="Faculdade"
              value={filterInstitution}
              options={institutions.map((item) => ({ value: item.name, label: item.name }))}
              placeholder="Todas"
              icon={School}
              onChange={onInstitutionFilterChange}
            />
            <AcademicFilterSelect
              label="Campus"
              value={filterCampus}
              options={campuses.map((item) => ({ value: item, label: item }))}
              placeholder="Todos"
              icon={MapPin}
              loading={campusesLoading}
              onChange={onCampusFilterChange}
            />
            <AcademicFilterSelect
              label="Curso"
              value={filterCourse}
              options={courses.map((item) => ({ value: item, label: item }))}
              placeholder="Todos"
              icon={BookOpen}
              loading={coursesLoading}
              onChange={onCourseFilterChange}
            />
          </div>
        </section>
      )}

      <section className="relative space-y-2 overflow-hidden rounded-3xl border border-[#FFE8A3] bg-[#FFF8E6] p-5 text-center">
        <School className="mx-auto h-8 w-8 text-slate-700" />
        <p className="text-sm font-extrabold leading-snug text-slate-800">Mais que uma rede,<br />uma comunidade.</p>
      </section>
    </aside>
  );
}
