import { useEffect, useRef, useState } from 'react';
import { Bell, ChevronDown, LogOut, Search, User, UserPlus, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import UniLinkLogo from '../branding/UniLinkLogo';
import {
  followUser, getNotifications, markNotificationAsRead, searchUsers, unfollowUser,
} from '../../utils/authApi';

function formatNotificationTime(createdAt) {
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Agora';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} d`;
  return created.toLocaleDateString('pt-BR');
}

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
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsError, setNotificationsError] = useState('');
  const profileMenuRef = useRef(null);
  const profileButtonRef = useRef(null);
  const notificationRef = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const firstName = user?.name?.trim().split(/\s+/)[0] || 'Perfil';
  const initial = firstName.charAt(0).toLocaleUpperCase('pt-BR') || '?';
  const unreadCount = notifications.filter((item) => !item.read).length;

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

  useEffect(() => {
    let active = true;
    const loadNotifications = async () => {
      try {
        const items = await getNotifications();
        if (active) {
          setNotifications(items);
          setNotificationsError('');
        }
      } catch (error) {
        if (active) setNotificationsError(error.message);
      }
    };
    loadNotifications();
    const interval = window.setInterval(loadNotifications, 10000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!notificationOpen) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!notificationRef.current?.contains(event.target)) {
        setNotificationOpen(false);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setNotificationOpen(false);
      }
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [notificationOpen]);

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

  const openNotificationTarget = async (notification) => {
    if (!notification.read) {
      try {
        await markNotificationAsRead(notification.id);
        setNotifications((current) => current.map((item) => (
          item.id === notification.id ? { ...item, read: true } : item
        )));
      } catch (error) {
        setNotificationsError(error.message);
      }
    }
    setNotificationOpen(false);
    if (notification.targetPath) {
      navigate(notification.targetPath);
    }
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
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#FFF3C4] text-sm font-bold text-slate-800">
                      {person.avatarUrl ? <img src={person.avatarUrl} alt="" className="h-full w-full object-cover" /> : person.name.charAt(0).toLocaleUpperCase('pt-BR')}
                    </span>
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
        <div className="relative" ref={notificationRef}>
          <button
            type="button"
            onClick={() => setNotificationOpen((open) => !open)}
            aria-label="Notificações"
            aria-expanded={notificationOpen}
            aria-haspopup="dialog"
            className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-all sm:h-10 sm:w-10 ${unreadCount ? 'bg-[#FFF3C4] text-[#D9A000] hover:bg-[#FFE99A]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          {notificationOpen && (
            <section role="dialog" aria-label="Notificações" className="absolute right-0 top-full z-[80] mt-2 w-[360px] max-w-[92vw] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl">
              <header className="border-b border-slate-100 px-4 py-3">
                <h2 className="text-base font-extrabold text-slate-800">Notificações</h2>
              </header>
              <div className="max-h-96 overflow-y-auto p-2">
                {notificationsError ? (
                  <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">{notificationsError}</p>
                ) : notifications.length ? notifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => openNotificationTarget(notification)}
                    className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-50 ${notification.read ? 'opacity-80' : 'bg-amber-50/40'}`}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#FFF3C4] text-sm font-bold text-slate-800">
                      {notification.actorAvatarUrl ? <img src={notification.actorAvatarUrl} alt="" className="h-full w-full object-cover" /> : notification.actorName?.charAt(0).toLocaleUpperCase('pt-BR') || 'N'}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold text-slate-800">{notification.message}</span>
                      <span className="mt-1 block text-[11px] text-slate-500">{formatNotificationTime(notification.createdAt)}</span>
                    </span>
                    {!notification.read && <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#D9A000]" />}
                  </button>
                )) : (
                  <p className="px-3 py-4 text-center text-xs text-slate-500">Você não tem notificações no momento.</p>
                )}
              </div>
            </section>
          )}
        </div>

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
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#FFC72C] font-bold text-slate-800">
              {user?.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" /> : initial}
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
