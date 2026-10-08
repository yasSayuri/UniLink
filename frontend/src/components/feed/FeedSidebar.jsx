import {
  Bookmark, BookOpen, BriefcaseBusiness, Calendar, ChevronDown, Clock,
  Compass, Dumbbell, HeartPulse, Home, MapPin, Music, Palette, PartyPopper,
  Plus, Search, School, Settings, SlidersHorizontal, Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const filters = [
  { label: 'Faculdade', value: 'Todas', icon: School },
  { label: 'Campus', value: 'Todos', icon: MapPin },
  { label: 'Curso', value: 'Todos', icon: BookOpen },
  { label: 'Período', value: 'Todos', icon: Clock },
  { label: 'Disciplinas', value: 'Todas', icon: Users },
];

const eventCategories = [
  { name: 'Todas', icon: Calendar },
  { name: 'Acadêmico', icon: BookOpen },
  { name: 'Música', icon: Music },
  { name: 'Cultura', icon: Palette },
  { name: 'Carreira', icon: BriefcaseBusiness },
  { name: 'Esportes', icon: Dumbbell },
  { name: 'Bem-estar', icon: HeartPulse },
  { name: 'Festas', icon: PartyPopper },
];

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
  onCreateEvent,
}) {
  const isCommunities = activeItem === 'communities';
  const isEvents = activeItem === 'events';
  const navigation = [
    { id: 'home', label: 'Início', path: '/feed', icon: Home },
    { id: 'support', label: 'Apoio universitário', path: '/apoio-universitario', icon: Compass },
    { id: 'communities', label: 'Comunidades', path: '/comunidades', icon: Users },
    { id: 'saved', label: 'Salvos', path: '/salvos', icon: Bookmark },
    { id: 'events', label: 'Eventos', path: '/eventos', icon: Calendar },
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
            <h2 className="text-sm font-bold text-slate-800">Grupos</h2>
            <button type="button" title="Configurações de grupos" aria-label="Configurações de grupos" className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"><SlidersHorizontal className="h-4 w-4" /></button>
          </div>
          <label className="relative block">
            <span className="sr-only">Buscar grupos</span>
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input type="search" value={communitySearch} onChange={(event) => onCommunitySearchChange?.(event.target.value)} placeholder="Buscar grupos" className="w-full rounded-full bg-slate-100 py-2 pl-9 pr-3 text-xs text-slate-700 outline-none transition focus:ring-2 focus:ring-amber-200" />
          </label>
          <nav aria-label="Navegação de grupos" className="space-y-1 border-b border-slate-100 pb-3">
            <button type="button" onClick={() => onCommunitySelect?.('all')} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition ${selectedCommunity === 'all' ? 'bg-slate-100 text-slate-800' : 'text-slate-600 hover:bg-slate-50'}`}>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white"><Home className="h-4 w-4" /></span>Seu feed
            </button>
            {communities.filter((community) => community.name.toLocaleLowerCase('pt-BR').includes(communitySearch.toLocaleLowerCase('pt-BR'))).map((community) => (
              <button key={community.id} type="button" onClick={() => onCommunitySelect?.(community.name)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition ${selectedCommunity === community.name ? 'bg-slate-100 text-slate-800' : 'text-slate-600 hover:bg-slate-50'}`}>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600"><Users className="h-4 w-4" /></span><span className="truncate">{community.name}</span>
              </button>
            ))}
          </nav>
          <button type="button" className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-50 px-3 py-2.5 text-xs font-bold text-blue-700 transition hover:bg-blue-100">
            <Plus className="h-4 w-4" />Criar novo grupo
          </button>
          <div className="space-y-1">
            <div className="flex items-center justify-between px-1"><h3 className="text-xs font-bold text-slate-800">Comunidades para explorar</h3></div>
            {!communities.length && <p className="px-2 py-3 text-center text-xs text-slate-400">Nenhuma comunidade disponível.</p>}
          </div>
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
          <button type="button" onClick={onCreateEvent} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFC72C] px-3 py-2.5 text-xs font-bold text-slate-800 transition hover:bg-amber-400">
            <Plus className="h-4 w-4" />Criar evento
          </button>
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
            {filters.map(({ label, value, icon: Icon }) => (
              <button key={label} type="button" className="flex w-full items-center justify-between rounded-2xl p-2.5 text-left transition-all hover:bg-slate-50">
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-slate-500" />
                  <span><span className="block text-xs font-semibold text-slate-700">{label}</span><span className="block text-[11px] text-slate-400">{value}</span></span>
                </span>
                <ChevronDown className="h-4 w-4 -rotate-90 text-slate-400" />
              </button>
            ))}
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
