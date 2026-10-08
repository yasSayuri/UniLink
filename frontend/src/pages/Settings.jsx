import { useEffect, useState } from 'react';
import { BookOpen, GraduationCap, MapPin, Pencil } from 'lucide-react';
import FeedHeader from '../components/feed/FeedHeader';
import FeedMobileNav from '../components/feed/FeedMobileNav';
import FeedSidebar from '../components/feed/FeedSidebar';
import OnboardingModal from '../components/onboarding/OnboardingModal';
import { getCurrentUser } from '../utils/authApi';

export default function Settings() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('unilink.user') || 'null');
    } catch {
      return null;
    }
  });
  const [editingAcademicInfo, setEditingAcademicInfo] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getCurrentUser()
      .then((currentUser) => {
        if (!active) return;
        setUser(currentUser);
        localStorage.setItem('unilink.user', JSON.stringify(currentUser));
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      });
    return () => {
      active = false;
    };
  }, []);

  const academicInfo = [
    { label: 'Instituição', value: user?.institutionName, icon: GraduationCap },
    { label: 'Campus', value: user?.campus, icon: MapPin },
    { label: 'Curso', value: user?.course, icon: BookOpen },
    { label: 'Período', value: user?.academicPeriod ? `${user.academicPeriod}º período` : null, icon: BookOpen },
  ].filter((item) => item.value);

  return (
    <div className="large-screen-dashboard min-h-screen bg-[#F4F5F7] pb-24 font-sans text-slate-700 lg:h-dvh lg:overflow-hidden lg:pb-0">
      <FeedHeader />
      <div className="mx-auto mt-4 grid max-w-7xl grid-cols-1 gap-4 px-3 sm:mt-6 sm:gap-6 sm:px-4 lg:h-[calc(100dvh-96px)] lg:grid-cols-12 lg:items-stretch lg:overflow-hidden">
        <FeedSidebar activeItem="settings" />
        <main className="primary-scroll min-w-0 space-y-5 lg:col-span-9 lg:overflow-y-auto">
          <section>
            <h1 className="text-xl font-extrabold text-slate-800">Configurações</h1>
            <p className="mt-1 text-sm text-slate-500">Gerencie suas informações acadêmicas.</p>
          </section>
          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Informações acadêmicas</h2>
                <p className="mt-1 text-xs text-slate-500">Essas informações ajudam a personalizar sua experiência no UniLink.</p>
              </div>
              <button type="button" onClick={() => setEditingAcademicInfo(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#FFC72C] px-4 py-2.5 text-xs font-bold text-slate-900 transition hover:bg-amber-400">
                <Pencil className="h-4 w-4" />Editar informações
              </button>
            </div>
            {academicInfo.length ? (
              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                {academicInfo.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                    <Icon className="h-5 w-5 shrink-0 text-amber-700" />
                    <div><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-0.5 text-sm font-semibold text-slate-800">{value}</dd></div>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">As informações acadêmicas ainda não foram preenchidas.</p>
            )}
          </section>
          {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        </main>
      </div>
      <FeedMobileNav />
      {editingAcademicInfo && <OnboardingModal onComplete={(updatedUser) => {
        setUser(updatedUser);
        setEditingAcademicInfo(false);
      }} />}
    </div>
  );
}
