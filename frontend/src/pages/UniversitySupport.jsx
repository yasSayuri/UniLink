import { useState } from 'react';
import {
  ArrowRight, BookOpen, CalendarDays, CarFront, ChevronDown,
  ChevronRight, CircleHelp, GraduationCap, Home, House, Search, Send,
  ShieldCheck, ShoppingBag, User, Utensils, Wrench,
} from 'lucide-react';
import FeedHeader from '../components/feed/FeedHeader';
import FeedMobileNav from '../components/feed/FeedMobileNav';
import FeedSidebar from '../components/feed/FeedSidebar';

const resources = [
  {
    title: 'Moradia',
    description: 'Encontre apartamentos, repúblicas e opções próximas ao campus.',
    action: 'Ver 24 anúncios',
    icon: House,
    keywords: 'aluguel república apartamento',
  },
  {
    title: 'Caronas',
    description: 'Encontre caronas entre campus ou com destino a outras cidades.',
    action: 'Ver caronas disponíveis',
    icon: CarFront,
    keywords: 'transporte viagem carona',
  },
  {
    title: 'Venda ou doação de móveis',
    description: 'Compre, venda ou doe móveis usados entre estudantes.',
    action: 'Ver 12 anúncios',
    icon: ShoppingBag,
    keywords: 'móveis usados doação bazar',
  },
  {
    title: 'Materiais acadêmicos',
    description: 'Acesse resumos, apostilas, exercícios e materiais compartilhados.',
    action: 'Ver materiais recentes',
    icon: BookOpen,
    keywords: 'livros apostilas estudos',
  },
  {
    title: 'Restaurante universitário',
    description: 'Cardápios, horários de funcionamento e informações sobre o RU.',
    action: 'Ver cardápio da semana',
    icon: Utensils,
    keywords: 'refeição comida almoço jantar',
  },
  {
    title: 'Feriados',
    description: 'Consulte feriados, pontos facultativos e recessos acadêmicos.',
    action: 'Ver calendário acadêmico',
    icon: CalendarDays,
    keywords: 'datas calendário recesso',
  },
  {
    title: 'Disciplinas',
    description: 'Encontre ementas, pré-requisitos e dicas de quem já cursou.',
    action: 'Ver disciplinas',
    icon: GraduationCap,
    keywords: 'matérias aulas ementa',
  },
  {
    title: 'Professores',
    description: 'Consulte horários de atendimento e informações dos professores.',
    action: 'Ver professores',
    icon: User,
    keywords: 'docentes atendimento',
  },
];

const notices = [
  { title: 'Manutenção no RU', description: 'O RU central estará fechado neste sábado para manutenção.', time: 'Há 2h', icon: Utensils },
  { title: 'Recesso acadêmico', description: 'De 22 a 26 de setembro, não haverá aulas no campus.', time: 'Há 1 dia', icon: CalendarDays },
  { title: 'Prova de segunda chamada', description: 'Solicitações de 2ª chamada estão abertas no sistema acadêmico.', time: 'Há 2 dias', icon: BookOpen },
];

const quickLinks = [
  { label: 'Site da universidade', icon: Home },
  { label: 'Sistema acadêmico', icon: GraduationCap },
  { label: 'Biblioteca online', icon: BookOpen },
  { label: 'Normas acadêmicas', icon: ShieldCheck },
  { label: 'Suporte técnico', icon: Wrench },
];

function SectionHeading({ title, action = 'Ver todos' }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2 className="text-sm font-bold text-slate-800">{title}</h2>
      {action && <button type="button" className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700">
        {action}<ArrowRight className="h-3 w-3" />
      </button>}
    </div>
  );
}

export default function UniversitySupport() {
  const [search, setSearch] = useState('');
  const [university, setUniversity] = useState('UTFPR');
  const [campus, setCampus] = useState('Campus Centro');
  const [suggestionSent, setSuggestionSent] = useState(false);

  const filteredResources = resources.filter((resource) =>
    `${resource.title} ${resource.description} ${resource.keywords}`
      .toLocaleLowerCase('pt-BR')
      .includes(search.toLocaleLowerCase('pt-BR')),
  );

  return (
    <div className="large-screen-dashboard min-h-screen bg-[#F4F5F7] pb-24 font-sans text-slate-700 lg:pb-10">
      <FeedHeader />
      <div className="mx-auto mt-6 grid max-w-7xl grid-cols-1 gap-6 px-4 lg:grid-cols-12">
        <FeedSidebar activeItem="support" />

        <main className="min-w-0 space-y-5 lg:col-span-6">
          <section>
            <h1 className="text-2xl font-extrabold leading-tight text-slate-800">Apoio universitário</h1>
            <p className="mt-1 text-sm text-slate-500">Centralize informações úteis para facilitar sua vida acadêmica e no campus.</p>
          </section>

          <section className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_1.15fr]">
            <label className="relative">
              <span className="sr-only">Universidade</span>
              <select value={university} onChange={(event) => setUniversity(event.target.value)} className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-9 text-sm text-slate-700 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100">
                <option>UTFPR</option><option>UFPR</option><option>PUC-PR</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
            </label>
            <label className="relative">
              <span className="sr-only">Campus</span>
              <select value={campus} onChange={(event) => setCampus(event.target.value)} className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-9 text-sm text-slate-700 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100">
                <option>Campus Centro</option><option>Campus Ecoville</option><option>Campus Rebouças</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
            </label>
            <label className="relative">
              <span className="sr-only">Buscar informações</span>
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar informações..." className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-100" />
            </label>
          </section>

          <section aria-label="Categorias de apoio" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {filteredResources.map(({ title, description, action, icon: Icon }) => (
              <article key={title} className="flex min-h-36 flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-amber-300 hover:shadow-md">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF3C4] text-amber-800"><Icon className="h-5 w-5" /></div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-bold leading-tight text-slate-800">{title}</h2>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{description}</p>
                  </div>
                </div>
                <button type="button" className="mt-auto flex items-center justify-between gap-2 pt-4 text-left text-xs font-semibold text-amber-700 hover:text-amber-900">
                  <span>{action}</span><ArrowRight className="h-4 w-4 shrink-0" />
                </button>
              </article>
            ))}
            {filteredResources.length === 0 && (
              <p className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">Nenhuma informação encontrada para “{search}”.</p>
            )}
          </section>

          <section className="flex flex-col items-start gap-4 rounded-xl border border-amber-100 bg-[#FFF8E6] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFC72C] text-white"><CircleHelp className="h-5 w-5" /></span>
              <div><h2 className="text-sm font-bold text-slate-800">Não encontrou o que precisa?</h2><p className="text-xs text-slate-500">Sugira uma informação ou categoria para ajudar outros alunos.</p></div>
            </div>
            <button type="button" onClick={() => setSuggestionSent(true)} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#FFC72C] px-4 py-2.5 text-xs font-bold text-slate-800 transition hover:bg-amber-400">
              {suggestionSent ? 'Sugestão registrada' : 'Enviar sugestão'}<Send className="h-4 w-4" />
            </button>
          </section>
        </main>

        <aside className="hidden space-y-6 lg:col-span-3 lg:block">
          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <SectionHeading title="Avisos úteis" />
            <div className="space-y-4">
              {notices.map(({ title, description, time, icon: Icon }) => (
                <article key={title} className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFF3C4] text-amber-800"><Icon className="h-4 w-4" /></span>
                  <div className="min-w-0"><h3 className="text-xs font-bold text-slate-800">{title}</h3><p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p><span className="text-[11px] text-slate-400">{time}</span></div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <SectionHeading title="Links rápidos" action={null} />
            <ul className="divide-y divide-slate-100">
              {quickLinks.map(({ label, icon: Icon }) => (
                <li key={label}><button type="button" className="flex w-full items-center gap-3 py-2.5 text-left text-xs text-slate-600 transition hover:text-amber-700"><Icon className="h-4 w-4 text-amber-700" />{label}<ChevronRight className="ml-auto h-4 w-4 text-slate-400" /></button></li>
              ))}
            </ul>
          </section>

        </aside>
      </div>
      <FeedMobileNav activeItem="support" />
    </div>
  );
}