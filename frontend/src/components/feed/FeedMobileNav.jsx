import { useEffect, useState } from 'react';
import { Bookmark, CalendarDays, Compass, House, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FeedMobileNav({ activeItem = 'home' }) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    let previousScrollY = window.scrollY;
    let accumulatedDelta = 0;
    let lastDirection = 0;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - previousScrollY;
      previousScrollY = currentScrollY;

      if (window.innerWidth >= 1024 || delta === 0) return;

      const direction = Math.sign(delta);
      if (direction !== lastDirection) {
        accumulatedDelta = 0;
        lastDirection = direction;
      }
      accumulatedDelta += delta;

      if (direction > 0 && currentScrollY > 48 && accumulatedDelta >= 14) {
        setCompact(true);
      } else if (direction < 0 && accumulatedDelta <= -10) {
        setCompact(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav aria-label="Navegação móvel" data-compact={compact} className={`fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] left-1/2 z-40 rounded-full border border-slate-200/80 bg-white/90 shadow-[0_8px_30px_rgba(15,23,42,0.16)] backdrop-blur-lg transition-[width,padding,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden ${compact ? 'w-[min(84%,360px)] -translate-x-1/2 scale-[0.94] px-1 py-1' : 'w-[calc(100%-2rem)] max-w-[420px] -translate-x-1/2 px-2 py-2'}`}>
      <div className={`grid grid-cols-5 items-center transition-[height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${compact ? 'h-10' : 'h-12'}`}>
        <button type="button" disabled title="Comunidades: em breve" aria-label="Comunidades, em breve" className={`mx-auto flex items-center justify-center rounded-xl text-slate-400 disabled:cursor-not-allowed ${compact ? 'h-10 w-10' : 'h-11 w-11'}`}>
          <Users className="h-5 w-5" />
        </button>

        <Link to="/apoio-universitario" aria-label="Apoio universitário" aria-current={activeItem === 'support' ? 'page' : undefined} className={`mx-auto flex items-center justify-center rounded-full transition-[background-color,color,width,height] duration-500 ${compact ? 'h-10 w-10' : 'h-11 w-11'} ${activeItem === 'support' ? 'bg-[#FFC72C] text-[#38414D]' : 'text-slate-500 hover:bg-[#FFF3C4] hover:text-[#38414D]'}`}>
          <Compass className="h-5 w-5" />
        </Link>

        <Link to="/feed" aria-label="Início" aria-current={activeItem === 'home' ? 'page' : undefined} className={`mx-auto flex items-center justify-center rounded-full transition-[background-color,color,width,height] duration-500 ${compact ? 'h-10 w-10' : 'h-11 w-11'} ${activeItem === 'home' ? 'bg-[#FFC72C] text-[#38414D]' : 'text-slate-500 hover:bg-[#FFF3C4] hover:text-[#38414D]'}`}>
          <House className="h-6 w-6" />
        </Link>

        <button type="button" disabled title="Salvos: em breve" aria-label="Salvos, em breve" className={`mx-auto flex items-center justify-center rounded-xl text-slate-400 disabled:cursor-not-allowed ${compact ? 'h-10 w-10' : 'h-11 w-11'}`}>
          <Bookmark className="h-5 w-5" />
        </button>

        <button type="button" disabled title="Eventos: em breve" aria-label="Eventos, em breve" className={`mx-auto flex items-center justify-center rounded-xl text-slate-400 disabled:cursor-not-allowed ${compact ? 'h-10 w-10' : 'h-11 w-11'}`}>
          <CalendarDays className="h-5 w-5" />
        </button>
      </div>
    </nav>
  );
}