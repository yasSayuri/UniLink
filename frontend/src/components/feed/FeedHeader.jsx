import { useEffect, useRef, useState } from 'react';
import { Bell, ChevronDown, LogOut, Search, User, UserPlus, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import UniLinkLogo from '../branding/UniLinkLogo';
import { followUser, searchUsers, unfollowUser } from '../../utils/authApi';

export default function FeedHeader() {
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('unilink.user') || 'null');
    } catch {
      return null;
    }
  });
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [busyUserId, setBusyUserId] = useState('');
  const profileMenuRef = useRef(null);
  const profileButtonRef = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const firstName = user?.name?.trim().split(/\s+/)[0] || 'Perfil';
  const initial = firstName.charAt(0).toLocaleUpperCase('pt-BR') || '?';

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

  useEffect(() => {
    const query = search.trim();
    if (query.length < 2) {
      const timeout = window.setTimeout(() => {
        setSearchResults([]);
        setSearchLoading(false);
        setSearchError('');
      }, 0);
      return () => window.clearTimeout(timeout);
    }
    let active = true;
    const timeout = window.setTimeout(() => {
      setSearchLoading(true);
      searchUsers(query)
        .then((results) => {
          if (active) setSearchResults(results);
        })
        .catch((error) => {
          if (active) {
            setSearchResults([]);
            setSearchError(error.message);
          }
        })
        .finally(() => {
          if (active) setSearchLoading(false);
        });
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [search]);

  useEffect(() => {
    const closeSearchOnOutsideClick = (event) => {
      if (!searchRef.current?.contains(event.target)) setSearchOpen(false);
    };
    document.addEventListener('pointerdown', closeSearchOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeSearchOnOutsideClick);
  }, []);

  const toggleFollow = async (person) => {
    setBusyUserId(person.id);
    setSearchError('');
    try {
      if (person.following) await unfollowUser(person.id);
      else await followUser(person.id);
      setSearchResults((current) => current.map((item) => (
        item.id === person.id ? { ...item, following: !person.following } : item
      )));
    } catch (error) {
      setSearchError(error.message);
    } finally {
      setBusyUserId('');
    }
  };

  const handleLogout = () => {
    setProfileMenuOpen(false);
    localStorage.removeItem('unilink.token');
    localStorage.removeItem('unilink.user');
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-b border-slate-200/80 bg-white px-3 py-2 shadow-sm sm:flex sm:justify-between sm:gap-3 sm:px-4 sm:py-3 md:px-8">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <UniLinkLogo size="header" className="gap-2" />
      </div>

      <div className="mx-1 min-w-0 sm:mx-4 sm:ml-6 sm:mr-auto sm:w-full sm:max-w-xl md:mx-8">
        <div className="relative flex items-center" ref={searchRef}>
          <Search className="absolute left-3 h-4 w-4 text-slate-400 sm:left-4" />
          <input
            type="text"
            value={search}
            onFocus={() => setSearchOpen(true)}
            onChange={(event) => {
              setSearch(event.target.value);
              setSearchOpen(true);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setSearch('');
                setSearchOpen(false);
              }
            }}
            placeholder="Pesquisar pessoas..."
            role="combobox"
            aria-expanded={searchOpen && search.trim().length >= 2}
            aria-controls="people-search-results"
            aria-autocomplete="list"
            className={`w-full rounded-full border border-transparent bg-[#F1F3F6] py-2 pl-9 pr-10 text-base text-slate-700 placeholder-slate-400 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFC72C] sm:py-2 sm:pl-11 sm:pr-11 sm:text-sm`}
          />
          {search && (
            <button type="button" onClick={() => { setSearch(''); setSearchOpen(false); }} aria-label="Limpar pesquisa" className="absolute right-3 rounded-full p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 sm:right-4">
              <X className="h-4 w-4" />
            </button>
          )}
          {searchOpen && search.trim().length >= 2 && (
            <div id="people-search-results" role="listbox" className="absolute left-0 right-0 top-full z-[60] mt-2 max-h-96 overflow-y-auto rounded-2xl border border-slate-100 bg-white p-2 shadow-xl">
              {searchLoading ? (
                <p className="p-4 text-center text-xs text-slate-500">Buscando pessoas...</p>
              ) : searchError ? (
                <p role="alert" className="p-3 text-xs text-red-600">{searchError}</p>
              ) : searchResults.length ? searchResults.map((person) => (
                <div key={person.id} role="option" aria-selected="false" className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-slate-50">
                  <Link to={`/perfil/${person.id}`} onClick={() => setSearchOpen(false)} className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFF3C4] text-sm font-bold text-slate-800">{person.name.charAt(0).toLocaleUpperCase('pt-BR')}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold text-slate-800">{person.name}</span>
                      <span className="block truncate text-[11px] text-slate-500">@{person.username}{person.course ? ` · ${person.course}` : ''}</span>
                    </span>
                  </Link>
                  <button type="button" disabled={busyUserId === person.id} onClick={() => toggleFollow(person)} className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1.5 text-[10px] font-semibold disabled:opacity-50 ${person.following ? 'border-slate-200 text-slate-600' : 'border-amber-300 bg-amber-50 text-amber-800'}`}>
                    <UserPlus className="h-3 w-3" />{person.following ? 'Seguindo' : 'Seguir'}
                  </button>
                </div>
              )) : (
                <p className="p-4 text-center text-xs text-slate-500">Nenhuma pessoa encontrada.</p>
              )}
            </div>
          )}
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
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFC72C] font-bold text-slate-800">
              {initial}
            </span>
            <span className="max-w-16 truncate text-xs font-semibold text-slate-700 sm:max-w-none sm:text-sm">{firstName}</span>
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
