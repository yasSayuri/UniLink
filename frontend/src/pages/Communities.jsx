import { useState } from 'react';
import {
  ChevronDown, Globe, Image, Megaphone, Users, Video,
} from 'lucide-react';
import FeedHeader from '../components/feed/FeedHeader';
import FeedMobileNav from '../components/feed/FeedMobileNav';
import FeedSidebar from '../components/feed/FeedSidebar';
import PostCard from '../components/feed/PostCard';

const communityPosts = [
  {
    id: 101,
    community: 'Engenharia de Computação',
    author: 'Marina Oliveira',
    time: 'Há 18 min',
    course: 'Engenharia de Computação',
    content: 'Alguém tem uma boa referência para estudar arquitetura de computadores? A prova de sexta vai cobrar pipeline e cache.',
    tag: '#estudos',
    likes: 18,
    commentsCount: 7,
    comment: { author: 'Bruno', time: 'Há 10 min', content: 'O livro do Patterson é ótimo, e tem um resumo bem completo no drive da turma.' },
  },
  {
    id: 102,
    community: 'Vida Universitária UTFPR',
    author: 'Caio Martins',
    time: 'Há 42 min',
    course: 'Vida Universitária UTFPR',
    content: 'A feira de estágios começa amanhã no campus Centro. Deixei nos comentários o link com as empresas confirmadas.',
    tag: '#estágio',
    likes: 32,
    commentsCount: 11,
  },
  {
    id: 103,
    community: 'Moradia e Repúblicas',
    author: 'Luiza Ferreira',
    time: 'Há 1h',
    course: 'Moradia e Repúblicas',
    content: 'Estamos procurando mais uma pessoa para dividir apartamento perto do campus. Quarto individual e contas incluídas no valor.',
    tag: '#moradia',
    likes: 9,
    commentsCount: 4,
    comment: { author: 'Rafaela', time: 'Há 35 min', content: 'Pode me passar mais informações por mensagem?' },
  },
  {
    id: 104,
    community: 'Compra, venda e troca',
    author: 'Pedro Henrique',
    time: 'Há 2h',
    course: 'Compra, venda e troca',
    content: 'Estou vendendo uma calculadora científica em ótimo estado. Posso entregar no bloco A durante a semana.',
    tag: '#classificados',
    likes: 6,
    commentsCount: 3,
  },
  {
    id: 105,
    community: 'Grupo de Estudos',
    author: 'Ana Clara',
    time: 'Há 3h',
    course: 'Grupo de Estudos',
    content: 'Sessão de estudo de cálculo hoje às 16h na biblioteca. Vamos revisar integrais e resolver a lista juntos.',
    tag: '#grupoDeEstudos',
    likes: 21,
    commentsCount: 8,
  },
];

const communityHighlights = [
  { title: 'Vida Universitária UTFPR', detail: '12 novas publicações hoje', initials: 'VU', color: 'bg-amber-100 text-amber-800' },
  { title: 'Grupo de Estudos', detail: 'Encontro hoje às 16h', initials: 'GE', color: 'bg-violet-100 text-violet-800' },
  { title: 'Moradia e Repúblicas', detail: '3 novas oportunidades', initials: 'MR', color: 'bg-rose-100 text-rose-800' },
];

const suggestedCommunities = [
  { title: 'Tecnologia e Programação', members: '2,4 mil membros', reason: 'Popular entre estudantes da sua área', initials: 'TP', color: 'bg-blue-100 text-blue-800' },
  { title: 'Eventos Universitários', members: '1,6 mil membros', reason: 'Eventos e atividades em Curitiba', initials: 'EU', color: 'bg-emerald-100 text-emerald-800' },
  { title: 'Intercâmbio e Mobilidade', members: '890 membros', reason: 'Dicas de outros estudantes', initials: 'IM', color: 'bg-rose-100 text-rose-800' },
];

const joinedCommunities = [
  { title: 'Engenharia de Computação', members: '1,2 mil membros', initials: 'EC', color: 'bg-blue-100 text-blue-800' },
  { title: 'Vida Universitária UTFPR', members: '3,8 mil membros', initials: 'VU', color: 'bg-amber-100 text-amber-800' },
  { title: 'Moradia e Repúblicas', members: '860 membros', initials: 'MR', color: 'bg-rose-100 text-rose-800' },
  { title: 'Compra, venda e troca', members: '2,1 mil membros', initials: 'CT', color: 'bg-emerald-100 text-emerald-800' },
  { title: 'Grupo de Estudos', members: '540 membros', initials: 'GE', color: 'bg-violet-100 text-violet-800' },
];

const communityInvites = [
  { title: 'Calouros UTFPR 2026', members: '420 membros', inviter: 'Convite de Júlia Martins', initials: 'C26', color: 'bg-amber-100 text-amber-800' },
  { title: 'Design e Criatividade', members: '760 membros', inviter: 'Convite de Rafael Costa', initials: 'DC', color: 'bg-pink-100 text-pink-800' },
];

export default function Communities() {
  const [selectedCommunity, setSelectedCommunity] = useState('all');
  const [communitySearch, setCommunitySearch] = useState('');
  const [mobileTab, setMobileTab] = useState('feed');
  const visiblePosts = communityPosts.filter((post) =>
    selectedCommunity === 'all' || post.community === selectedCommunity,
  );
  const mobileTabs = [
    { id: 'feed', label: 'Feed' },
    { id: 'groups', label: 'Seus grupos' },
    { id: 'discover', label: 'Descobrir' },
    { id: 'invites', label: 'Convites' },
  ];

  return (
    <div className="large-screen-dashboard min-h-screen bg-[#F4F5F7] pb-24 font-sans text-slate-700 select-none lg:h-dvh lg:overflow-hidden lg:pb-0">
      <FeedHeader />
      <div className="mx-auto mt-4 grid max-w-7xl grid-cols-1 gap-4 px-3 sm:mt-6 sm:gap-6 sm:px-4 lg:h-[calc(100dvh-96px)] lg:grid-cols-12 lg:items-stretch lg:overflow-hidden">
        <FeedSidebar
          activeItem="communities"
          selectedCommunity={selectedCommunity}
          onCommunitySelect={setSelectedCommunity}
          communitySearch={communitySearch}
          onCommunitySearchChange={setCommunitySearch}
        />

        <main className="col-span-1 min-w-0 space-y-5 lg:col-span-6 lg:flex lg:h-full lg:min-h-0 lg:flex-col">
          <section className="flex items-center justify-between gap-3 lg:shrink-0">
            <div>
              <h1 className="text-xl font-extrabold leading-tight text-slate-800">Seu feed de comunidades</h1>
              <p className="mt-1 text-xs text-slate-500">Publicações dos grupos dos quais você participa</p>
            </div>
            {mobileTab === 'feed' && <button type="button" className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50">
              Recentes<ChevronDown className="h-3.5 w-3.5" />
            </button>}
          </section>

          <nav aria-label="Navegação de comunidades" className="grid grid-cols-4 border-b border-slate-200 lg:hidden">
            {mobileTabs.map((tab) => (
              <button key={tab.id} type="button" onClick={() => setMobileTab(tab.id)} aria-current={mobileTab === tab.id ? 'page' : undefined} className={`min-h-11 border-b-2 px-1 text-[11px] font-semibold transition-colors ${mobileTab === tab.id ? 'border-amber-400 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                {tab.label}
              </button>
            ))}
          </nav>

          {mobileTab === 'feed' && <>
          <section className="space-y-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm lg:shrink-0">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF3C4] text-amber-800"><Users className="h-5 w-5" /></span>
              <input type="text" placeholder="Compartilhe algo com suas comunidades..." className="w-full rounded-full bg-[#F1F3F6] px-5 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#FFC72C]" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-1 border-t border-slate-100 pt-3 px-1 text-xs font-medium text-slate-600">
              <button type="button" className="flex items-center gap-2 rounded-xl p-2 transition hover:bg-slate-50"><Image className="h-4 w-4 text-amber-500" /><span>Imagem</span></button>
              <button type="button" className="flex items-center gap-2 rounded-xl p-2 transition hover:bg-slate-50"><Video className="h-4 w-4 text-blue-500" /><span>Vídeo</span></button>
              <button type="button" className="flex items-center gap-2 rounded-xl p-2 transition hover:bg-slate-50"><Megaphone className="h-4 w-4 text-emerald-500" /><span>Anunciar</span></button>
              <button type="button" className="flex items-center gap-1.5 rounded-xl p-2 text-slate-500 transition hover:bg-slate-50"><Globe className="h-4 w-4" /><span>{selectedCommunity === 'all' ? 'Escolher comunidade' : selectedCommunity}</span><ChevronDown className="h-3.5 w-3.5" /></button>
            </div>
          </section>

          <div className="feed-posts-scroll space-y-5 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-contain lg:pr-2">
            {visiblePosts.length ? visiblePosts.map((post) => <PostCard key={post.id} post={post} />) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">Nenhuma publicação encontrada nesta comunidade.</div>
            )}
          </div>
          </>}

          {mobileTab === 'groups' && <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-800">Grupos dos quais você participa</h2>
            {joinedCommunities.map((community) => (
              <button key={community.title} type="button" onClick={() => { setSelectedCommunity(community.title); setMobileTab('feed'); }} className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm transition hover:border-amber-200">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold ${community.color}`}>{community.initials}</span>
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-slate-800">{community.title}</span><span className="mt-1 block text-xs text-slate-500">{community.members}</span></span>
                <span className="text-xs font-semibold text-amber-700">Ver feed</span>
              </button>
            ))}
          </section>}

          {mobileTab === 'discover' && <section className="space-y-3">
            <div><h2 className="text-sm font-bold text-slate-800">Descobrir comunidades</h2><p className="mt-1 text-xs text-slate-500">Grupos que podem combinar com você</p></div>
            {suggestedCommunities.map((community) => (
              <article key={community.title} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold ${community.color}`}>{community.initials}</span>
                <div className="min-w-0"><h3 className="text-sm font-bold text-slate-800">{community.title}</h3><p className="mt-1 text-xs text-slate-500">{community.members}</p><p className="mt-2 text-xs leading-relaxed text-slate-500">{community.reason}</p></div>
              </article>
            ))}
          </section>}

          {mobileTab === 'invites' && <section className="space-y-3">
            <div><h2 className="text-sm font-bold text-slate-800">Convites para grupos</h2><p className="mt-1 text-xs text-slate-500">Comunidades que convidaram você</p></div>
            {communityInvites.map((invite) => (
              <article key={invite.title} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold ${invite.color}`}>{invite.initials}</span>
                  <div className="min-w-0"><h3 className="text-sm font-bold text-slate-800">{invite.title}</h3><p className="mt-1 text-xs text-slate-500">{invite.members}</p><p className="mt-1 text-[11px] text-slate-400">{invite.inviter}</p></div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button type="button" className="rounded-xl bg-[#FFC72C] px-3 py-2 text-xs font-bold text-slate-800 transition hover:bg-amber-400">Aceitar convite</button>
                  <button type="button" className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-200">Recusar</button>
                </div>
              </article>
            ))}
          </section>}
        </main>

        <aside className="hidden space-y-5 lg:col-span-3 lg:block lg:min-h-0">
          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">Atividade dos seus grupos</h2>
              <button type="button" className="text-xs font-medium text-slate-400 hover:text-slate-600">Ver tudo</button>
            </div>
            <div className="space-y-4">
              {communityHighlights.map((item) => (
                <div key={item.title} className="flex items-center gap-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold ${item.color}`}>{item.initials}</span>
                  <div className="min-w-0"><h3 className="truncate text-xs font-bold text-slate-800">{item.title}</h3><p className="mt-0.5 text-[11px] text-slate-400">{item.detail}</p></div>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-bold text-slate-800">Sugestões para você</h2><span className="text-[10px] font-medium text-slate-400">Novas comunidades</span></div>
            <div className="space-y-4">
              {suggestedCommunities.map((community) => (
                <article key={community.title} className="flex items-start gap-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold ${community.color}`}>{community.initials}</span>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-800">{community.title}</h3>
                    <p className="mt-0.5 text-[10px] text-slate-400">{community.members}</p>
                    <p className="mt-1 text-[11px] leading-snug text-slate-500">{community.reason}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">Convites</h2>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">{communityInvites.length}</span>
            </div>
            <div className="space-y-4">
              {communityInvites.map((invite) => (
                <article key={invite.title} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[10px] font-extrabold ${invite.color}`}>{invite.initials}</span>
                    <div className="min-w-0"><h3 className="truncate text-xs font-bold text-slate-800">{invite.title}</h3><p className="mt-0.5 text-[10px] text-slate-400">{invite.inviter}</p></div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button type="button" className="rounded-lg bg-[#FFC72C] px-2 py-2 text-[10px] font-bold text-slate-800 transition hover:bg-amber-400">Aceitar</button>
                    <button type="button" className="rounded-lg bg-slate-100 px-2 py-2 text-[10px] font-semibold text-slate-600 transition hover:bg-slate-200">Recusar</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </div>
      <FeedMobileNav activeItem="communities" />
    </div>
  );
}