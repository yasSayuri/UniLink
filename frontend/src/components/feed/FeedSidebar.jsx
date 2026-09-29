import {
  Bookmark, BookOpen, BriefcaseBusiness, Calendar, ChevronDown,
  Clock, Compass, Dumbbell, HeartPulse, Home, MapPin, Music, Palette,
  PartyPopper, Plus, Search, School, SlidersHorizontal, Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const joinedCommunities = [
  { name: 'Engenharia de Computação', members: '1,2 mil membros', color: 'bg-blue-100 text-blue-700' },
  { name: 'Vida Universitária UTFPR', members: '3,8 mil membros', color: 'bg-amber-100 text-amber-700' },
  { name: 'Moradia e Repúblicas', members: '860 membros', color: 'bg-rose-100 text-rose-700' },
  { name: 'Compra, venda e troca', members: '2,1 mil membros', color: 'bg-emerald-100 text-emerald-700' },
  { name: 'Grupo de Estudos', members: '540 membros', color: 'bg-violet-100 text-violet-700' },
];

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

export default function FeedSidebar({ activeItem = 'home', selectedCommunity = 'all', onCommunitySelect, communitySearch = '', onCommunitySearchChange, eventCategory = 'Todas', onEventCategoryChange, eventView = 'discover', onEventViewChange, onCreateEvent }) {
  const isCommunities = activeItem === 'communities';
  const isEvents = activeItem === 'events';
  const visibleCommunities = joinedCommunities.filter((community) => community.name.toLocaleLowerCase('pt-BR').includes(communitySearch.toLocaleLowerCase('pt-BR')));

  return (
    <aside className="hidden space-y-6 lg:col-span-3 lg:block">
      <div className="bg-white rounded-3xl p-3 shadow-sm border border-slate-100 space-y-1">
        <Link to="/feed" className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-medium text-sm transition-all ${activeItem === 'home' ? 'bg-[#FFF8E6] text-[#D9A000] font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>
          <Home className="w-5 h-5" />
          <span>Início</span>
        </Link>
        <Link to="/apoio-universitario" className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-medium text-sm transition-all ${activeItem === 'support' ? 'bg-[#FFF8E6] text-[#D9A000] font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>
          <Compass className="w-5 h-5" />
          <span>Apoio universitário</span>
        </Link>
        <Link to="/comunidades" className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-medium text-sm transition-all ${isCommunities ? 'bg-[#FFF8E6] text-[#D9A000] font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>
          <Users className="w-5 h-5" />
          <span>Comunidades</span>
        </Link>
        <Link to="/salvos" className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-medium text-sm transition-all ${activeItem === 'saved' ? 'bg-[#FFF8E6] text-[#D9A000] font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>
          <Bookmark className="w-5 h-5" />
          <span>Salvos</span>
        </Link>
        <Link to="/eventos" className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-medium text-sm transition-all ${isEvents ? 'bg-[#FFF8E6] text-[#D9A000] font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>
          <Calendar className="w-5 h-5" />
          <span>Eventos</span>
        </Link>
      </div>

      {isCommunities ? (
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-4">
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
            <button type="button" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600"><Compass className="h-4 w-4" /></span>Descobrir
            </button>
          </nav>
          <button type="button" className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-50 px-3 py-2.5 text-xs font-bold text-blue-700 transition hover:bg-blue-100">
            <Plus className="h-4 w-4" />Criar novo grupo
          </button>
          <div className="space-y-1">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-slate-800">Grupos dos quais você participa</h3>
              <button type="button" onClick={() => onCommunitySelect?.('all')} className="text-[10px] font-semibold text-blue-600 hover:underline">Ver tudo</button>
            </div>
            {visibleCommunities.map((community) => (
              <button key={community.name} type="button" onClick={() => onCommunitySelect?.(community.name)} className={`flex w-full items-center gap-2.5 rounded-xl p-2 text-left transition ${selectedCommunity === community.name ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold ${community.color}`}>{community.name.split(' ').map((word) => word[0]).slice(0, 2).join('')}</span>
                <span className="min-w-0"><span className="block truncate text-[11px] font-bold text-slate-700">{community.name}</span><span className="block text-[10px] text-slate-400">{community.members}</span></span>
              </button>
            ))}
            {visibleCommunities.length === 0 && <p className="px-2 py-3 text-center text-xs text-slate-400">Nenhum grupo encontrado.</p>}
          </div>
        </div>
      ) : isEvents ? (
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-4">
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
        </div>
      ) : <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4 px-1">
          <span className="font-bold text-slate-800 text-sm">Filtros</span>
          <SlidersHorizontal className="w-4 h-4 text-slate-500 cursor-pointer" />
        </div>

        <div className="space-y-1">
          {filters.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-2xl cursor-pointer transition-all">
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="text-xs font-semibold text-slate-700">{label}</p>
                  <p className="text-[11px] text-slate-400">{value}</p>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 -rotate-90" />
            </div>
          ))}
        </div>
      </div>}

      <div className="bg-[#FFF8E6] border border-[#FFE8A3] rounded-3xl p-5 text-center space-y-2 relative overflow-hidden">
        <div className="flex justify-center mb-1">
          <School className="w-8 h-8 text-slate-700" />
        </div>
        <p className="text-sm font-extrabold text-slate-800 leading-snug">
          Mais que uma rede,<br />uma comunidade.
        </p>
      </div>
    </aside>
  );
}
