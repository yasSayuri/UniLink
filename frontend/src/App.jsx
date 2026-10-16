import { useEffect, useLayoutEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import UniversitySupport from './pages/UniversitySupport';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Communities from './pages/Communities';
import SavedPosts from './pages/SavedPosts';
import Events from './pages/Events';
import { isDarkModeEnabled } from './utils/theme';

function RouteTheme() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    const isAuthenticationScreen = pathname === '/' || pathname === '/login' || pathname === '/register';
    let userId = null;
    try {
      userId = JSON.parse(localStorage.getItem('unilink.user') || 'null')?.id || null;
    } catch {
      // A missing or invalid cached user means no account-specific theme is available.
    }
    document.documentElement.classList.toggle('dark', !isAuthenticationScreen && isDarkModeEnabled(userId));
  }, [pathname]);

  return null;
}

function App() {
  useEffect(() => {
    const forwardWheel = (event) => {
      if (window.innerWidth < 1024 || event.target.closest('[role="dialog"]')) return;
      const mainScroll = document.querySelector('.primary-scroll');
      if (!mainScroll || mainScroll.contains(event.target)) return;
      mainScroll.scrollTop += event.deltaY;
      event.preventDefault();
    };
    document.addEventListener('wheel', forwardWheel, { passive: false });
    return () => document.removeEventListener('wheel', forwardWheel);
  }, []);

  return (
    <BrowserRouter>
      <RouteTheme />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route path="/login" element={<Login />} />
        
        <Route path="/register" element={<Register />} />

        <Route path="/feed" element={<Feed />} />

        <Route path="/apoio-universitario" element={<UniversitySupport />} />

        <Route path="/comunidades" element={<Communities />} />

        <Route path="/salvos" element={<SavedPosts />} />

        <Route path="/eventos" element={<Events />} />

        <Route path="/perfil" element={<Profile />} />
        <Route path="/perfil/:userId" element={<Profile />} />
        <Route path="/configuracoes" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;