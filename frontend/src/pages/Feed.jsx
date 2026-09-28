import {
  User, ChevronDown, Image, Video, Megaphone, Globe, Calendar, Users,
  School, Sparkles, Heart,
} from 'lucide-react';
import PostCard from '../components/feed/PostCard';
import FeedHeader from '../components/feed/FeedHeader';
import FeedSidebar from '../components/feed/FeedSidebar';

const posts = [
  {
    id: 1,
    author: 'Usuário 1',
    time: 'Há 2h',
    course: 'Engenharia de Computação',
    content: 'Alguém mais também está tendo dificuldade com a matrícula das disciplinas do próximo semestre? Tô tentando desde ontem e não aparece a opção... 🙁',
    tag: '#matrícula',
    likes: 12,
    commentsCount: 8,
    comment: {
      author: 'Usuário 2',
      time: 'Há 1h',
      content: 'Tenta pelo sistema acadêmico, lá resolveu pra mim!',
    },
  },
  {
    id: 2,
    author: 'Usuário 3',
    time: 'Há 4h',
    course: 'Direito',
    content: 'Pessoal, alguém sabe se o RU do campus centro vai funcionar no feriado? Li em algum lugar que ia ter horário reduzido, mas não tenho certeza...',
    tag: '#ru',
    likes: 7,
    commentsCount: 5,
    comment: {
      author: 'Usuário 4',
      time: 'Há 3h',
      content: 'No último ano funcionou normalmente, mas é bom conferir no site da UTFPR!',
    },
  },
];

export default function Feed() {
  return (
    <div className="min-h-screen bg-[#F4F5F7] text-slate-700 font-sans pb-10 select-none">
      
      <FeedHeader />
      <div className="max-w-7xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <FeedSidebar />

        <main className="col-span-1 lg:col-span-6 space-y-5">
          {/* Criar Publicação */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center shrink-0">
                <User className="w-6 h-6" />
              </div>
              <input
                type="text"
                placeholder="No que você está pensando?"
                className="w-full bg-[#F1F3F6] border border-transparent rounded-full py-2.5 px-5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFC72C] focus:bg-white transition-all"
              />
            </div>

            <div className="border-t border-slate-100 pt-3 flex items-center justify-between px-2 text-xs font-medium text-slate-600">
              <button className="flex items-center gap-2 hover:bg-slate-50 p-2 rounded-xl transition-all">
                <Image className="w-4 h-4 text-amber-500" />
                <span>Imagem</span>
              </button>
              <button className="flex items-center gap-2 hover:bg-slate-50 p-2 rounded-xl transition-all">
                <Video className="w-4 h-4 text-blue-500" />
                <span>Vídeo</span>
              </button>
              <button className="flex items-center gap-2 hover:bg-slate-50 p-2 rounded-xl transition-all">
                <Megaphone className="w-4 h-4 text-emerald-500" />
                <span>Anunciar</span>
              </button>
              <button className="flex items-center gap-1.5 hover:bg-slate-50 p-2 rounded-xl transition-all text-slate-500">
                <Globe className="w-4 h-4" />
                <span>Público</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </main>

        <aside className="hidden lg:block lg:col-span-3 space-y-6">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-sm">Atividades</h4>
              <button className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">Ver tudo <ChevronDown className="w-3 h-3" /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FFC72C] flex items-center justify-center text-white shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-slate-700"><span className="font-bold">Yasmin</span> começou a seguir você</p>
                  <span className="text-[10px] text-slate-400">Há 1h</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FFC72C] flex items-center justify-center text-white shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-slate-700"><span className="font-bold">Ana</span> curtiu seu comentário</p>
                  <span className="text-[10px] text-slate-400">Há 2h</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FFC72C] flex items-center justify-center text-white shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-slate-700"><span className="font-bold">Lucas</span> comentou em uma publicação sua</p>
                  <span className="text-[10px] text-slate-400">Há 3h</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-sm">Sugestões para você</h4>
              <button className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">Ver tudo <ChevronDown className="w-3 h-3" /></button>
            </div>

            <div className="space-y-3">
              {[
                { title: 'Moradia estudantil', members: '1,2k membros', icon: School },
                { title: 'Troca e venda', members: '2,4k membros', icon: Users },
                { title: 'Programação', members: '3,1k membros', icon: Sparkles },
                { title: 'Academia e bem-estar', members: '1,8k membros', icon: Heart },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#FFF8E6] text-[#D9A000] flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">{item.title}</h5>
                      <p className="text-[10px] text-slate-400">{item.members}</p>
                    </div>
                  </div>
                  <button className="bg-[#FFC72C] hover:bg-[#f0ba28] text-slate-900 font-bold text-xs px-3.5 py-1 rounded-full transition-all shadow-xs">
                    Seguir
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-sm">Eventos</h4>
              <button className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">Ver tudo &gt;</button>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#FFF8E6] text-[#D9A000] flex items-center justify-center shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800 leading-tight">Feira de estágios UTFPR</h5>
                  <p className="text-[10px] text-slate-400 mt-0.5">15 de Set • 09:00</p>
                  <p className="text-[10px] text-slate-400">Bloco E - Campus Centro</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#FFF8E6] text-[#D9A000] flex items-center justify-center shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800 leading-tight">Semana Acadêmica de Computação</h5>
                  <p className="text-[10px] text-slate-400 mt-0.5">22 de Set • 19:00</p>
                  <p className="text-[10px] text-slate-400">Auditório da UTFPR</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}