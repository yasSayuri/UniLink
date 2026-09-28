import {
  Bell, ChevronDown, Home, MessageSquare, Search, User,
} from 'lucide-react';
import UniLinkLogo from '../branding/UniLinkLogo';

export default function FeedHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200/80 px-4 md:px-8 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <UniLinkLogo size="header" />
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
  );
}
