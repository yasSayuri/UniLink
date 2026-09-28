import { useEffect, useRef, useState } from 'react';
import { Bell, ChevronDown, LogOut, Search, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import UniLinkLogo from '../branding/UniLinkLogo';

export default function FeedHeader() {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const profileButtonRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!profileMenuOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setProfileMenuOpen(false);
        profileButtonRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [profileMenuOpen]);

  const handleLogout = () => {
    setProfileMenuOpen(false);
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-b border-slate-200/80 bg-white px-3 py-2 shadow-sm sm:flex sm:justify-between sm:gap-3 sm:px-4 sm:py-3 md:px-8">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <UniLinkLogo size="header" className="gap-2" />
      </div>

      <div className="mx-1 min-w-0 sm:mx-4 sm:ml-6 sm:mr-auto sm:w-full sm:max-w-xl md:mx-8">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-slate-400 sm:left-4" />
          <input
            type="text"
            placeholder="Pesquisar..."
            className="w-full rounded-full border border-transparent bg-[#F1F3F6] py-2 pl-9 pr-2 text-base text-slate-700 placeholder-slate-400 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFC72C] sm:py-2 sm:pl-11 sm:pr-4 sm:text-sm"
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2 md:gap-3">
        <button aria-label="Notificações" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all hover:bg-slate-200 sm:h-10 sm:w-10">
          <Bell className="w-5 h-5" />
        </button>

        <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" />

        <div className="relative" ref={profileMenuRef}>
          <button
            ref={profileButtonRef}
            type="button"
            onClick={() => setProfileMenuOpen((open) => !open)}
            className="flex cursor-pointer items-center gap-2 rounded-full p-1 transition-all hover:bg-slate-50 sm:p-1.5"
            aria-label="Abrir menu do perfil"
            aria-expanded={profileMenuOpen}
            aria-haspopup="menu"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-300 text-slate-600">
              <User className="w-5 h-5" />
            </span>
            <span className="hidden text-sm font-semibold text-slate-700 sm:inline">Yasmin</span>
            <ChevronDown className={`hidden h-4 w-4 text-slate-500 transition-transform sm:block ${profileMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileMenuOpen && (
            <div role="menu" aria-label="Menu do perfil" className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-slate-100 bg-white p-1.5 shadow-lg shadow-slate-900/10">
              <Link to="/perfil" role="menuitem" onClick={() => setProfileMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                <User className="h-4 w-4 text-slate-500" />
                Ver perfil
              </Link>
              <div className="my-1 border-t border-slate-100" />
              <button type="button" role="menuitem" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50">
                <LogOut className="h-4 w-4 text-red-600" />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
