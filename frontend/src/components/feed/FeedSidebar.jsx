import {
  Bookmark, Building, Calendar, ChevronDown, Clock, Compass, Home, MapPin,
  BookOpen, School, SlidersHorizontal, Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const filters = [
  { label: 'Faculdade', value: 'Todas', icon: School },
  { label: 'Campus', value: 'Todos', icon: MapPin },
  { label: 'Curso', value: 'Todos', icon: BookOpen },
  { label: 'Período', value: 'Todos', icon: Clock },
  { label: 'Disciplinas', value: 'Todas', icon: Users },
];

export default function FeedSidebar({ activeItem = 'home' }) {
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
        <button className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-slate-600 hover:bg-slate-50 font-medium text-sm transition-all">
          <Users className="w-5 h-5" />
          <span>Comunidades</span>
        </button>
        <button className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-slate-600 hover:bg-slate-50 font-medium text-sm transition-all">
          <Bookmark className="w-5 h-5" />
          <span>Salvos</span>
        </button>
        <button className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-slate-600 hover:bg-slate-50 font-medium text-sm transition-all">
          <Calendar className="w-5 h-5" />
          <span>Eventos</span>
        </button>
        <button className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-slate-600 hover:bg-slate-50 font-medium text-sm transition-all">
          <Building className="w-5 h-5" />
          <span>Minha Universidade</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
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
      </div>

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
