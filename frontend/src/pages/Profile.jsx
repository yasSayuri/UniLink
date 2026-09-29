import { useState } from 'react';
import {
  ArrowLeft, BookOpen, CalendarDays, GraduationCap, MapPin, Repeat2,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import FeedHeader from '../components/feed/FeedHeader';
import FeedMobileNav from '../components/feed/FeedMobileNav';
import FeedSidebar from '../components/feed/FeedSidebar';
import PostCard from '../components/feed/PostCard';

const profilePosts = [
  {
    id: 201,
    author: 'Yasmin',
    time: 'Há 2h',
    course: '@yasmin · UTFPR',
    content: 'Fechando mais uma etapa do projeto de interface. Foi muito bom trocar ideias com o pessoal da turma hoje!',
    tag: '#projetos',
    likes: 24,
    commentsCount: 6,
  },
  {
    id: 202,
    author: 'Yasmin',
    time: 'Ontem',
    course: '@yasmin · UTFPR',
    content: 'Alguém recomenda um grupo de estudos de banco de dados para esta semana? Posso ajudar com SQL.',
    tag: '#estudos',
    likes: 11,
    commentsCount: 9,
  },
  {
    id: 203,
    author: 'Yasmin',
    time: 'Há 3 dias',
    course: '@yasmin · UTFPR',
    content: 'A biblioteca do campus é o melhor lugar para terminar os trabalhos em semana de entrega.',
    tag: '#campus',
    likes: 37,
    commentsCount: 4,
  },
];

const profileReplies = [
  {
    id: 211,
    author: 'Yasmin',
    time: 'Há 1h',
    course: '@yasmin · respondeu a @marina',
    content: 'Também estou nessa disciplina! Posso compartilhar minhas anotações da última aula.',
    tag: '#estudos',
    likes: 4,
    commentsCount: 2,
  },
  {
    id: 212,
    author: 'Yasmin',
    time: 'Há 1 dia',
    course: '@yasmin · respondeu a @pedro',
    content: 'A feira vai acontecer no bloco A, das 10h às 17h. Vi a programação no site da universidade.',
    tag: '#eventos',
    likes: 8,
    commentsCount: 1,
  },
];

const profileReposts = [
  {
    id: 221,
    author: 'Centro Acadêmico de Computação',
    time: 'Há 5h',
    course: '@cacomp · UTFPR',
    content: 'Inscrições abertas para a maratona de programação. Forme sua equipe e participe no sábado!',
    tag: '#programação',
    likes: 52,
    commentsCount: 12,
  },
  {
    id: 222,
    author: 'Biblioteca UTFPR',
    time: 'Há 2 dias',
    course: '@bibliotecautfpr · UTFPR',
    content: 'Novos horários de atendimento durante o período de provas: de segunda a sexta, até as 22h.',
    tag: '#biblioteca',
    likes: 31,
    commentsCount: 5,
  },
];

const profileMedia = [
  { src: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=700&q=85', alt: 'Estudantes reunidos no campus', caption: 'Encontro com a turma' },
  { src: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=700&q=85', alt: 'Computador em uma mesa de estudos', caption: 'Projeto de interface' },
  { src: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=700&q=85', alt: 'Auditório preparado para uma palestra', caption: 'Semana acadêmica' },
  { src: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=700&q=85', alt: 'Grupo de estudantes conversando', caption: 'Fim de semestre' },
];

const profileDetails = [
  { label: 'Universidade', value: 'UTFPR', icon: GraduationCap },
  { label: 'Curso', value: 'Ciência da Computação', icon: BookOpen },
  { label: 'Campus', value: 'Campus Centro', icon: MapPin },
  { label: 'Entrou em', value: 'Março de 2024', icon: CalendarDays },
];

const profileTabs = [
  { id: 'posts', label: 'Publicações' },
  { id: 'replies', label: 'Respostas' },
  { id: 'reposts', label: 'Reposts' },
  { id: 'media', label: 'Mídia' },
];

const suggestions = [
  { name: 'Marina Costa', handle: '@marina.costa', initial: 'M', color: 'bg-rose-100 text-rose-700' },
  { name: 'Rafael Mendes', handle: '@rafael.mendes', initial: 'R', color: 'bg-blue-100 text-blue-700' },
  { name: 'Centro Acadêmico de Computação', handle: '@cacomp', initial: 'C', color: 'bg-amber-100 text-amber-800' },
];

export default function Profile() {
  const [activeTab, setActiveTab] = useState('posts');
  const [name, setName] = useState('Yasmin');
  const [bio, setBio] = useState('Estudante de Ciência da Computação. Compartilhando projetos, descobertas e a vida no campus.');
  const [editOpen, setEditOpen] = useState(false);
  const [draftName, setDraftName] = useState(name);
  const [draftBio, setDraftBio] = useState(bio);

  const saveProfile = (event) => {
    event.preventDefault();
    setName(draftName.trim() || name);
    setBio(draftBio.trim());
    setEditOpen(false);
  };

  const postsByTab = {
    posts: profilePosts,
    replies: profileReplies,
    reposts: profileReposts,
  };

  return (
    <div className="large-screen-dashboard min-h-screen bg-[#F4F5F7] pb-24 font-sans text-slate-700 lg:h-dvh lg:overflow-hidden lg:pb-0">
      <FeedHeader />
      <div className="mx-auto mt-4 grid max-w-7xl grid-cols-1 gap-4 px-3 sm:mt-6 sm:gap-6 sm:px-4 lg:h-[calc(100dvh-96px)] lg:grid-cols-12 lg:items-stretch lg:overflow-hidden">
        <FeedSidebar />

        <main className="profile-scrollable min-w-0 space-y-4 lg:col-span-6 lg:h-full lg:overflow-y-auto lg:overscroll-contain lg:pr-2">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex h-12 items-center gap-4 px-4">
              <Link to="/feed" aria-label="Voltar ao início" className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100"><ArrowLeft className="h-4 w-4" /></Link>
              <div><h1 className="text-sm font-extrabold text-slate-800">{name}</h1><p className="text-[10px] text-slate-500">12 publicações</p></div>
            </div>

            <div className="relative h-36 overflow-hidden bg-[#EADCA3] sm:h-48">
              <img src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1400&q=85" alt="Campus universitário" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-slate-900/10" />
            </div>

            <div className="px-4 pb-4 sm:px-6">
              <div className="flex min-h-20 items-start justify-between">
                <div className="relative z-10 -mt-10 flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-[#FFC72C] text-2xl font-extrabold text-slate-800 sm:-mt-12 sm:h-24 sm:w-24 sm:text-3xl">Y</div>
                <button type="button" onClick={() => { setDraftName(name); setDraftBio(bio); setEditOpen(true); }} className="mt-3 rounded-full border border-slate-300 px-4 py-2 text-xs font-bold text-slate-800 transition hover:bg-slate-50">Editar perfil</button>
              </div>

              <div className="mt-1">
                <h2 className="text-lg font-extrabold leading-tight text-slate-900">{name}</h2>
                <p className="mt-0.5 text-xs text-slate-500">@yasmin</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">{bio}</p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5" />Ciência da Computação · UTFPR</span>
                  <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />Curitiba, PR</span>
                  <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />Entrou em março de 2024</span>
                </div>
                <div className="mt-3 flex gap-4 text-xs">
                  <p><strong className="text-slate-900">118</strong> <span className="text-slate-500">Seguindo</span></p>
                  <p><strong className="text-slate-900">301</strong> <span className="text-slate-500">Seguidores</span></p>
                </div>
              </div>
            </div>

            <nav aria-label="Publicações do perfil" className="mt-2 grid grid-cols-4 border-t border-slate-200">
              {profileTabs.map((tab) => (
                <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} aria-current={activeTab === tab.id ? 'page' : undefined} className={`relative min-h-12 px-1 text-[11px] font-semibold transition-colors sm:text-xs ${activeTab === tab.id ? 'text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
                  {tab.label}
                  {activeTab === tab.id && <span className="absolute inset-x-3 bottom-0 h-1 rounded-full bg-[#FFC72C]" />}
                </button>
              ))}
            </nav>
          </section>

          {activeTab === 'media' ? (
            <section aria-label="Mídia do perfil" className="grid grid-cols-2 gap-2 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 sm:grid-cols-3">
              {profileMedia.map((media) => (
                <article key={media.caption} className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100">
                  <img src={media.src} alt={media.alt} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/70 to-transparent px-3 pb-3 pt-8 text-xs font-semibold text-white">{media.caption}</div>
                </article>
              ))}
            </section>
          ) : (
            <section aria-label={profileTabs.find((tab) => tab.id === activeTab)?.label} className="space-y-3">
              {postsByTab[activeTab].map((post) => (
                <article key={post.id}>
                  {activeTab === 'reposts' && <p className="mb-1.5 flex items-center gap-2 pl-12 text-[11px] font-semibold text-slate-500"><Repeat2 className="h-3.5 w-3.5" />{name} repostou</p>}
                  <PostCard post={post} />
                </article>
              ))}
            </section>
          )}
        </main>

        <aside className="profile-scrollable hidden space-y-4 lg:col-span-3 lg:block lg:overflow-y-auto">
          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-extrabold text-slate-800">Informações acadêmicas</h2>
            <dl className="mt-3 space-y-3">
              {profileDetails.map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0 text-amber-700" />
                  <div><dt className="text-[10px] text-slate-500">{label}</dt><dd className="text-xs font-semibold text-slate-800">{value}</dd></div>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-extrabold text-slate-800">Talvez você conheça</h2>
            <div className="mt-3 space-y-4">
              {suggestions.map((person) => (
                <div key={person.handle} className="flex items-center gap-2.5">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${person.color}`}>{person.initial}</span>
                  <div className="min-w-0"><p className="truncate text-xs font-bold text-slate-800">{person.name}</p><p className="text-[10px] text-slate-500">{person.handle}</p></div>
                  <button type="button" className="ml-auto rounded-full bg-slate-900 px-3 py-1.5 text-[10px] font-bold text-white transition hover:bg-slate-700">Seguir</button>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      {editOpen && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditOpen(false); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="edit-profile-title" className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
          <div className="mb-5 flex items-center justify-between"><h2 id="edit-profile-title" className="text-lg font-extrabold text-slate-800">Editar perfil</h2><button type="button" onClick={() => setEditOpen(false)} aria-label="Fechar" className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"><X className="h-4 w-4" /></button></div>
          <form onSubmit={saveProfile} className="space-y-4">
            <label className="block text-xs font-semibold text-slate-700">Nome<input required maxLength={40} value={draftName} onChange={(event) => setDraftName(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100" /></label>
            <label className="block text-xs font-semibold text-slate-700">Bio<textarea maxLength={160} rows={3} value={draftBio} onChange={(event) => setDraftBio(event.target.value)} className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100" /></label>
            <button type="submit" className="w-full rounded-xl bg-[#FFC72C] px-4 py-3 text-sm font-bold text-slate-900 transition hover:bg-amber-400">Salvar alterações</button>
          </form>
        </section>
      </div>}

      <FeedMobileNav />
    </div>
  );
}