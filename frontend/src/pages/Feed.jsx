import {
  Search, Home, MessageSquare, Bell, User, ChevronDown, Image, Video,
  Megaphone, Globe, Compass, Users, Bookmark, Calendar, Building,
  SlidersHorizontal, School, MapPin, BookOpen, Clock, ThumbsUp, MessageCircle,
  Share2, Sparkles, Heart
} from 'lucide-react';
import logoImage from '../assets/unilink-logo.png'; 

export default function Feed() {
  return (
    <div className="min-h-screen bg-[#F4F5F7] text-slate-700 font-sans pb-10 select-none">
      
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200/80 px-4 md:px-8 py-3 flex items-center justify-between shadow-sm">
        
        <div className="flex items-center gap-3">
          <img 
            src={logoImage} 
            alt="UniLink Logo" 
            className="h-10 w-auto object-contain rounded-xl" 
          />
          <span 
            translate="no" 
            className="notranslate text-2xl font-black tracking-tight inline-flex items-center"
          >
            <span className="bg-gradient-to-b from-[#525B67] via-[#38414D] to-[#2B323B] bg-clip-text text-transparent">
              Uni
            </span>
            <span className="text-[#FFC72C]">
              Link
            </span>
          </span>
        </div>

        <div className="flex-1 max-w-xl mx-4 md:mx-8">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar..."
              className="w-full bg-[#F1F3F6] border border-transparent rounded-full py-2 pl-11 pr-4 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFC72C] focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button className="w-10 h-10 rounded-full bg-[#FFC72C] text-slate-900 flex items-center justify-center shadow-sm hover:bg-[#f0ba28] transition-all">
            <Home className="w-5 h-5 fill-current" />
          </button>
          <button className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-all">
            <MessageSquare className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-all">
            <Bell className="w-5 h-5" />
          </button>

          <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

          <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded-full transition-all">
            <div className="w-9 h-9 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold text-slate-700 hidden sm:inline">Yasmin</span>
            <ChevronDown className="w-4 h-4 text-slate-500 hidden sm:block" />
          </div>
        </div>
      </header>


      <div className="max-w-7xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

        <aside className="hidden lg:block lg:col-span-3 space-y-6">
          <div className="bg-white rounded-3xl p-3 shadow-sm border border-slate-100 space-y-1">
            <button className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl bg-[#FFF8E6] text-[#D9A000] font-bold text-sm transition-all">
              <Home className="w-5 h-5" />
              <span>Início</span>
            </button>
            <button className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-slate-600 hover:bg-slate-50 font-medium text-sm transition-all">
              <Compass className="w-5 h-5" />
              <span>Explorar</span>
            </button>
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
              {[
                { label: 'Faculdade', val: 'Todas', icon: School },
                { label: 'Campus', val: 'Todos', icon: MapPin },
                { label: 'Curso', val: 'Todos', icon: BookOpen },
                { label: 'Período', val: 'Todos', icon: Clock },
                { label: 'Disciplinas', val: 'Todas', icon: Users },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-2xl cursor-pointer transition-all">
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 text-slate-500" />
                    <div>
                      <p className="text-xs font-semibold text-slate-700">{item.label}</p>
                      <p className="text-[11px] text-slate-400">{item.val}</p>
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

          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FFC72C] text-slate-800 flex items-center justify-center font-bold">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Usuário 1</h4>
                  <p className="text-xs text-slate-400">Há 2h • Engenharia de Computação</p>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600 font-bold px-2">•••</button>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              Alguém mais também está tendo dificuldade com a matrícula das disciplinas do próximo semestre? Tô tentando desde ontem e não aparece a opção... 🙁
            </p>

            <span className="inline-block bg-[#FFF8E6] text-[#D9A000] text-xs font-bold px-3 py-1 rounded-lg border border-[#FFE8A3]">
              #matrícula
            </span>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1.5 hover:text-slate-800 transition-colors">
                  <ThumbsUp className="w-4 h-4" />
                  <span>12</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-slate-800 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span>8</span>
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button className="hover:text-slate-800 transition-colors"><Bookmark className="w-4 h-4" /></button>
                <button className="hover:text-slate-800 transition-colors"><Share2 className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="bg-[#F8F9FA] rounded-2xl p-3 flex items-start gap-3 mt-2">
              <div className="w-7 h-7 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">Usuário 2</span>
                  <span className="text-slate-400 text-[10px]">Há 1h</span>
                </div>
                <p className="text-slate-600 mt-0.5">Tenta pelo sistema acadêmico, lá resolveu pra mim!</p>
              </div>
            </div>
            <button className="text-xs font-bold text-[#D9A000] hover:underline pt-1">Ver mais comentários...</button>
          </div>

          {/* POST 2 */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FFC72C] text-slate-800 flex items-center justify-center font-bold">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Usuário 3</h4>
                  <p className="text-xs text-slate-400">Há 4h • Direito</p>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600 font-bold px-2">•••</button>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              Pessoal, alguém sabe se o RU do campus centro vai funcionar no feriado? Li em algum lugar que ia ter horário reduzido, mas não tenho certeza...
            </p>

            <span className="inline-block bg-[#FFF8E6] text-[#D9A000] text-xs font-bold px-3 py-1 rounded-lg border border-[#FFE8A3]">
              #ru
            </span>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1.5 hover:text-slate-800 transition-colors">
                  <ThumbsUp className="w-4 h-4" />
                  <span>7</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-slate-800 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span>5</span>
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button className="hover:text-slate-800 transition-colors"><Bookmark className="w-4 h-4" /></button>
                <button className="hover:text-slate-800 transition-colors"><Share2 className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="bg-[#F8F9FA] rounded-2xl p-3 flex items-start gap-3 mt-2">
              <div className="w-7 h-7 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">Usuário 4</span>
                  <span className="text-slate-400 text-[10px]">Há 3h</span>
                </div>
                <p className="text-slate-600 mt-0.5">No último ano funcionou normalmente, mas é bom conferir no site da UTFPR!</p>
              </div>
            </div>
            <button className="text-xs font-bold text-[#D9A000] hover:underline pt-1">Ver mais comentários...</button>
          </div>
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