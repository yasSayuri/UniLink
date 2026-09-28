import { BookOpen, GraduationCap, MapPin, User } from 'lucide-react';
import FeedHeader from '../components/feed/FeedHeader';
import FeedMobileNav from '../components/feed/FeedMobileNav';
import FeedSidebar from '../components/feed/FeedSidebar';

const profileDetails = [
  { label: 'Universidade', value: 'UTFPR', icon: GraduationCap },
  { label: 'Curso', value: 'Ciência da Computação', icon: BookOpen },
  { label: 'Campus', value: 'Campus Centro', icon: MapPin },
];

export default function Profile() {
  return (
    <div className="large-screen-dashboard min-h-screen bg-[#F4F5F7] pb-24 font-sans text-slate-700 lg:pb-10">
      <FeedHeader />
      <div className="mx-auto mt-4 grid max-w-7xl grid-cols-1 gap-4 px-3 sm:mt-6 sm:gap-6 sm:px-4 lg:grid-cols-12">
        <FeedSidebar />
        <main className="min-w-0 space-y-5 lg:col-span-9">
          <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
            <div className="h-28 bg-[#FFF3C4] sm:h-36" />
            <div className="px-5 pb-6 sm:px-8">
              <div className="-mt-11 flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-slate-200 text-slate-600 sm:-mt-14 sm:h-24 sm:w-24">
                <User className="h-10 w-10 sm:h-12 sm:w-12" />
              </div>
              <h1 className="mt-3 text-2xl font-extrabold text-slate-800">Yasmin</h1>
              <p className="mt-1 text-sm text-slate-500">Estudante · @Yasmin</p>
              <div className="mt-5 flex flex-wrap gap-6 text-sm">
                <p><strong className="text-slate-800">12</strong> <span className="text-slate-500">publicações</span></p>
                <p><strong className="text-slate-800">118</strong> <span className="text-slate-500">seguindo</span></p>
                <p><strong className="text-slate-800">301</strong> <span className="text-slate-500">seguidores</span></p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-base font-bold text-slate-800">Informações acadêmicas</h2>
            <dl className="mt-4 divide-y divide-slate-100">
              {profileDetails.map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <Icon className="h-5 w-5 shrink-0 text-amber-700" />
                  <div>
                    <dt className="text-xs text-slate-500">{label}</dt>
                    <dd className="mt-0.5 text-sm font-medium text-slate-800">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </section>
        </main>
      </div>
      <FeedMobileNav />
    </div>
  );
}