import { useEffect, useState } from 'react';
import {
  ArrowLeft, ArrowRight, BookOpen, CalendarDays, CarFront,
  CircleHelp, GraduationCap, House, Search, Send, ShoppingBag, User, Utensils,
} from 'lucide-react';
import FeedHeader from '../components/feed/FeedHeader';
import FeedMobileNav from '../components/feed/FeedMobileNav';
import FeedSidebar from '../components/feed/FeedSidebar';
import PostCard from '../components/feed/PostCard';
import { getPostsByHashtag } from '../utils/authApi';
import useAcademicFilters from '../hooks/useAcademicFilters';

const resources = [
  { title: 'Moradia', hashtag: 'moradia', description: 'Encontre apartamentos, repúblicas e opções próximas ao campus.', action: 'Ver anúncios', icon: House, keywords: 'aluguel república apartamento' },
  { title: 'Caronas', hashtag: 'carona', description: 'Encontre caronas entre campus ou com destino a outras cidades.', action: 'Ver caronas disponíveis', icon: CarFront, keywords: 'transporte viagem carona' },
  { title: 'Venda ou doação de móveis', hashtag: 'moveis', description: 'Compre, venda ou doe móveis usados entre estudantes.', action: 'Ver anúncios', icon: ShoppingBag, keywords: 'móveis usados doação bazar' },
  { title: 'Materiais acadêmicos', hashtag: 'materiais', description: 'Acesse resumos, apostilas, exercícios e materiais compartilhados.', action: 'Ver materiais recentes', icon: BookOpen, keywords: 'livros apostilas estudos' },
  { title: 'Restaurante universitário', hashtag: 'ru', description: 'Cardápios, horários de funcionamento e informações sobre o RU.', action: 'Ver cardápio da semana', icon: Utensils, keywords: 'refeição comida almoço jantar' },
  { title: 'Feriados', hashtag: 'feriados', description: 'Consulte feriados, pontos facultativos e recessos acadêmicos.', action: 'Ver calendário acadêmico', icon: CalendarDays, keywords: 'datas calendário recesso' },
  { title: 'Disciplinas', hashtag: 'disciplinas', description: 'Encontre ementas, pré-requisitos e dicas de quem já cursou.', action: 'Ver disciplinas', icon: GraduationCap, keywords: 'matérias aulas ementa' },
  { title: 'Professores', hashtag: 'professores', description: 'Consulte horários de atendimento e informações dos professores.', action: 'Ver professores', icon: User, keywords: 'docentes atendimento' },
];

export default function UniversitySupport() {
  const [showSupportIntro, setShowSupportIntro] = useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem('unilink.user') || 'null');
      const userKey = user?.id || 'anonymous';
      return localStorage.getItem(`unilink:university-support-intro:${userKey}`) !== 'seen';
    } catch {
      return true;
    }
  });
  const [suggestionSent, setSuggestionSent] = useState(false);
  const [suggestionModalOpen, setSuggestionModalOpen] = useState(false);
  const [suggestionName, setSuggestionName] = useState('');
  const [suggestionJustification, setSuggestionJustification] = useState('');
  const [selectedResource, setSelectedResource] = useState(null);
  const [serviceSearch, setServiceSearch] = useState('');
  const [supportPosts, setSupportPosts] = useState([]);
  const [supportNews, setSupportNews] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState('');
  const {
    institutions, campuses, courses, filterInstitution, filterCampus, filterCourse,
    campusesLoading, coursesLoading, handleInstitutionChange, handleCampusChange,
    setFilterCourse, matchesFilters,
  } = useAcademicFilters(setPostsError);

  useEffect(() => {
    let active = true;
    Promise.all(resources.map(async (resource) => ({
      ...resource,
      postCount: (await getPostsByHashtag(resource.hashtag)).length,
    })))
      .then((items) => {
        if (active) {
          setSupportNews(items
            .filter((item) => item.postCount > 0)
            .sort((first, second) => second.postCount - first.postCount)
            .slice(0, 3));
        }
      })
      .catch((error) => {
        if (active) setPostsError(error.message);
      });
    return () => {
      active = false;
    };
  }, []);

  const dismissSupportIntro = () => {
    try {
      const user = JSON.parse(localStorage.getItem('unilink.user') || 'null');
      const userKey = user?.id || 'anonymous';
      localStorage.setItem(`unilink:university-support-intro:${userKey}`, 'seen');
    } catch {
      // Fecha o aviso mesmo quando o navegador não permite persistir a preferência.
    }
    setShowSupportIntro(false);
  };

  const openSuggestionModal = () => {
    setSuggestionName('');
    setSuggestionJustification('');
    setSuggestionSent(false);
    setSuggestionModalOpen(true);
  };

  const submitSuggestion = (event) => {
    event.preventDefault();
    setSuggestionSent(true);
  };

  const openResource = async (resource) => {
    setSelectedResource(resource);
    setServiceSearch('');
    setPostsLoading(true);
    setPostsError('');
    try {
      setSupportPosts(await getPostsByHashtag(resource.hashtag));
    } catch (error) {
      setPostsError(error.message);
    } finally {
      setPostsLoading(false);
    }
  };

  const resourcePosts = selectedResource
    ? supportPosts.filter((post) => post.hashtags?.some(
      (hashtag) => hashtag.toLocaleLowerCase('pt-BR') === selectedResource.hashtag,
    ) && `${post.content} ${post.authorName} ${post.authorUsername} ${post.hashtags?.join(' ')}`
      .toLocaleLowerCase('pt-BR')
      .includes(serviceSearch.toLocaleLowerCase('pt-BR')))
    .filter(matchesFilters)
    : [];

  return (
    <div className="large-screen-dashboard min-h-screen bg-[#F4F5F7] pb-24 font-sans text-slate-700 lg:pb-10">
      <FeedHeader />
      <div className="mx-auto mt-6 grid max-w-7xl grid-cols-1 gap-6 px-4 lg:grid-cols-12">
        <FeedSidebar
          activeItem="support"
          filterInstitution={filterInstitution}
          filterCampus={filterCampus}
          filterCourse={filterCourse}
          institutions={institutions}
          campuses={campuses}
          courses={courses}
          campusesLoading={campusesLoading}
          coursesLoading={coursesLoading}
          onInstitutionFilterChange={handleInstitutionChange}
          onCampusFilterChange={handleCampusChange}
          onCourseFilterChange={setFilterCourse}
        />
        <main className="min-w-0 space-y-5 lg:col-span-6">
          <section>
            {selectedResource ? (
              <div>
                <button type="button" onClick={() => setSelectedResource(null)} className="mb-3 inline-flex items-center gap-1 text-sm font-bold text-slate-600 transition hover:text-slate-900">
                  <ArrowLeft className="h-4 w-4" /> Voltar
                </button>
                <h1 className="text-2xl font-extrabold text-slate-800">{selectedResource.title}</h1>
                <p className="mt-1 text-sm text-slate-500">Publicações marcadas com #{selectedResource.hashtag}</p>
                <label className="relative mt-3 block max-w-md">
                  <span className="sr-only">Pesquisar neste serviço</span>
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    value={serviceSearch}
                    onChange={(event) => setServiceSearch(event.target.value)}
                    placeholder={`Pesquisar em ${selectedResource.title.toLocaleLowerCase('pt-BR')}...`}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  />
                </label>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-extrabold text-slate-800">Apoio universitário</h1>
                <p className="mt-1 text-sm text-slate-500">Centralize informações úteis para facilitar sua vida acadêmica e no campus.</p>
              </>
            )}
          </section>
          {!selectedResource && <section aria-label="Categorias de apoio" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {resources.map(({ title, hashtag, description, action, icon: Icon }) => (
              <article key={title} className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-amber-300 hover:shadow-md">
                <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF3C4] text-amber-800"><Icon className="h-5 w-5" /></span><div><h2 className="text-sm font-bold text-slate-800">{title}</h2><p className="mt-1.5 text-xs leading-relaxed text-slate-500">{description}</p></div></div>
                <button type="button" onClick={() => openResource({ title, hashtag })} className="mt-3 flex items-center justify-between gap-2 text-left text-xs font-semibold text-[#B77900] transition hover:text-[#8F5F00]"><span>{action}</span><ArrowRight className="h-4 w-4" /></button>
              </article>
            ))}
          </section>}
          {selectedResource && (
            <section aria-label={`Publicações de ${selectedResource.title}`} className="space-y-4">
              {postsLoading ? (
                <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Carregando publicações...</p>
              ) : postsError ? (
                <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700">{postsError}</p>
              ) : resourcePosts.length ? (
                <div className="space-y-4">{resourcePosts.map((post) => <PostCard key={post.id} post={post} />)}</div>
              ) : (
                <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">Ops... parece que não há nada deste serviço disponível.</p>
              )}
            </section>
          )}
          {!selectedResource && <section className="support-suggestion-banner flex flex-col items-start gap-4 rounded-xl border border-amber-100 bg-[#FFF8E6] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFC72C] text-white"><CircleHelp className="h-5 w-5" /></span><div><h2 className="text-sm font-bold text-slate-800">Não encontrou o que precisa?</h2><p className="text-xs text-slate-500">Sugira uma informação ou categoria para ajudar outros alunos.</p></div></div>
            <button type="button" onClick={openSuggestionModal} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#FFC72C] px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-amber-400">Enviar sugestão<Send className="h-4 w-4" /></button>
          </section>}
        </main>
        <aside className="hidden space-y-6 lg:col-span-3 lg:block">
          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">Novidades</h2>
            </div>
            {supportNews.length ? (
              <div className="space-y-3">
                {supportNews.map(({ title, hashtag, postCount, icon: Icon }) => (
                  <button key={hashtag} type="button" onClick={() => openResource({ title, hashtag })} className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-slate-50">
                    <span className="support-news-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFF3C4] text-amber-800"><Icon className="h-4 w-4" /></span>
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-bold text-slate-800">{title}</span>
                      <span className="mt-1 block text-xs text-slate-500">{title} teve {postCount} {postCount === 1 ? 'nova postagem' : 'novas postagens'}</span>
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="py-2 text-xs leading-relaxed text-slate-500">Ainda não há novidades nos serviços de apoio.</p>
            )}
          </section>
        </aside>
      </div>
      <FeedMobileNav activeItem="support" />
      {showSupportIntro && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <section role="dialog" aria-modal="true" aria-labelledby="support-intro-title" className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-950/20">
            <div className="bg-slate-900 px-6 py-6 text-white">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#FFC72C] px-3 py-1.5 text-xs font-extrabold text-slate-900">
                <CircleHelp className="h-4 w-4" /> Apoio universitário
              </span>
              <h2 id="support-intro-title" className="mt-4 text-xl font-extrabold">Uma rede de ajuda feita por estudantes</h2>
            </div>
            <div className="space-y-4 px-6 py-6">
              <p className="text-sm leading-relaxed text-slate-600">
                Aqui você encontra informações, oportunidades e pessoas dispostas a ajudar durante a sua jornada acadêmica.
              </p>
              <p className="text-sm leading-relaxed text-slate-600">
                Nosso sistema funciona por meio de <strong className="text-slate-800">hashtags</strong>: ao publicar algo, use a hashtag do serviço que você está oferecendo ou procurando, como <strong className="text-amber-700">#moradia</strong>, <strong className="text-amber-700">#carona</strong>, <strong className="text-amber-700">#materiais</strong> ou <strong className="text-amber-700">#doação</strong>. Assim, sua publicação fica mais fácil de encontrar por quem precisa dela.
              </p>
              <p className="text-xs leading-relaxed text-slate-400">
                Compartilhe com responsabilidade e ajude a fortalecer a comunidade universitária.
              </p>
              <button type="button" onClick={dismissSupportIntro} className="w-full rounded-xl bg-[#FFC72C] px-4 py-3 text-sm font-extrabold text-slate-900 transition hover:bg-amber-400">
                Entendi
              </button>
            </div>
          </section>
        </div>
      )}
      {suggestionModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <section role="dialog" aria-modal="true" aria-labelledby="suggestion-title" className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl shadow-slate-950/20">
            {suggestionSent ? (
              <div className="text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><Send className="h-5 w-5" /></span>
                <h2 id="suggestion-title" className="mt-4 text-lg font-extrabold text-slate-800">Sugestão enviada!</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">Obrigado por ajudar a comunidade a melhorar. Sua sugestão será avaliada com carinho pela nossa equipe.</p>
                <button type="button" onClick={() => setSuggestionModalOpen(false)} className="mt-5 w-full rounded-xl bg-[#FFC72C] px-4 py-3 text-sm font-extrabold text-slate-900 hover:bg-amber-400">Fechar</button>
              </div>
            ) : (
              <form onSubmit={submitSuggestion} className="space-y-4">
                <div>
                  <h2 id="suggestion-title" className="text-lg font-extrabold text-slate-800">Enviar sugestão</h2>
                  <p className="mt-1 text-xs text-slate-500">Conte como podemos tornar o apoio universitário ainda melhor.</p>
                </div>
                <label className="block text-sm font-semibold text-slate-700">
                  Nome da sugestão
                  <input required value={suggestionName} onChange={(event) => setSuggestionName(event.target.value)} maxLength={100} placeholder="Ex.: Grupo de estudos" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm font-normal outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100" />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Justificativa
                  <textarea required value={suggestionJustification} onChange={(event) => setSuggestionJustification(event.target.value)} maxLength={500} rows={4} placeholder="Explique por que essa sugestão seria útil para a comunidade." className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 px-3.5 py-3 text-sm font-normal outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100" />
                </label>
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button type="button" onClick={() => setSuggestionModalOpen(false)} className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200">Cancelar</button>
                  <button type="submit" className="rounded-xl bg-[#FFC72C] px-4 py-2.5 text-sm font-extrabold text-slate-900 hover:bg-amber-400">Enviar</button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
