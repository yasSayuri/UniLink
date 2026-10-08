import { useEffect, useState } from 'react';
import { BookOpen, GraduationCap, MapPin } from 'lucide-react';
import {
  getCampuses,
  getCourses,
  getInstitutions,
  getPeriods,
  saveOnboarding,
} from '../../utils/academicCatalogApi';

const fieldClassName = 'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-700 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100';

export default function OnboardingModal({ onComplete }) {
  const [institutions, setInstitutions] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [campusesLoading, setCampusesLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [institution, setInstitution] = useState('');
  const [institutionDomain, setInstitutionDomain] = useState('');
  const [customInstitution, setCustomInstitution] = useState('');
  const [campus, setCampus] = useState('');
  const [customCampus, setCustomCampus] = useState('');
  const [course, setCourse] = useState('');
  const [customCourse, setCustomCourse] = useState('');
  const [academicPeriod, setAcademicPeriod] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const selectedInstitution = institutions.find((item) => item.name === institution);

  useEffect(() => {
    let active = true;
    Promise.all([getInstitutions(), getPeriods()])
      .then(([institutionOptions, periodOptions]) => {
        if (!active) return;
        setInstitutions(institutionOptions);
        setPeriods(periodOptions);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const campusNeedsText = campuses.length === 0 || campus === '__other';
  const courseNeedsText = courses.length === 0 || course === '__other';
  const effectiveInstitution = institution === '__other' ? customInstitution.trim() : institution;
  const effectiveCampus = campusNeedsText ? customCampus.trim() : campus;
  const effectiveCourse = courseNeedsText ? customCourse.trim() : course;

  const handleInstitutionChange = async (value) => {
    setInstitution(value);
    const selected = institutions.find((item) => item.name === value);
    const domain = selected?.domains?.[0] || '';
    setInstitutionDomain(domain);
    setCampuses([]);
    setCampus('');
    setCustomCampus('');
    setCourses([]);
    setCourse('');
    setCustomCourse('');
    setError('');

    if (!value || value === '__other') return;
    setCampusesLoading(true);
    try {
      setCampuses(await getCampuses(value, domain));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setCampusesLoading(false);
    }
  };

  const handleCampusChange = async (value) => {
    setCampus(value);
    setCourses([]);
    setCourse('');
    setCustomCourse('');
    setError('');

    if (!value || value === '__other' || institution === '__other') return;
    setCoursesLoading(true);
    try {
      setCourses(await getCourses(institution, institutionDomain, value));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      const updatedUser = await saveOnboarding({
        institutionName: effectiveInstitution,
        institutionDomain: institution === '__other' ? '' : institutionDomain,
        campus: effectiveCampus,
        course: effectiveCourse,
        academicPeriod: Number(academicPeriod),
      });
      localStorage.setItem('unilink.user', JSON.stringify(updatedUser));
      onComplete(updatedUser);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        className="max-h-[94dvh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl shadow-slate-950/20"
      >
        <div className="relative overflow-hidden bg-slate-900 px-6 py-7 text-white sm:px-8">
          <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-[#FFC72C]/20 blur-2xl" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-[#FFD866]">
                <GraduationCap className="h-4 w-4" /> Sua comunidade acadêmica
              </span>
              <h1 id="onboarding-title" className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Vamos deixar sua experiência melhor!
              </h1>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-300">
                Conte um pouco sobre sua vida acadêmica para encontrar conteúdos mais relevantes para você.
              </p>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FFC72C] text-slate-900">
              <BookOpen className="h-5 w-5" />
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5 sm:px-8 sm:py-7">
          {loading ? (
            <p className="py-8 text-center text-sm text-slate-500">Carregando opções acadêmicas...</p>
          ) : (
            <>
              <label className="block text-sm font-semibold text-slate-700">
                Faculdade ou universidade
                <select required value={institution} onChange={(event) => handleInstitutionChange(event.target.value)} className={fieldClassName}>
                  <option value="">Selecione sua instituição</option>
                  {institutions.map((item) => <option key={`${item.name}-${item.domains?.join(',') || ''}`} value={item.name}>{item.name}</option>)}
                  <option value="__other">Minha instituição não aparece</option>
                </select>
                {selectedInstitution?.domains?.length > 0 && (
                  <span className="mt-1.5 block text-xs font-normal text-slate-400">
                    Domínio informado no diretório: {selectedInstitution.domains.join(', ')}
                  </span>
                )}
              </label>
              {institution === '__other' && (
                <label className="block text-sm font-semibold text-slate-700">
                  Nome da instituição
                  <input required value={customInstitution} onChange={(event) => setCustomInstitution(event.target.value)} className={fieldClassName} placeholder="Digite o nome da instituição" />
                </label>
              )}

              {institution && (
                <label className="block text-sm font-semibold text-slate-700">
                  Campus
                  {campusesLoading ? (
                    <select disabled className={fieldClassName}><option>Carregando campi...</option></select>
                  ) : !campusNeedsText ? (
                    <select required value={campus} onChange={(event) => handleCampusChange(event.target.value)} className={fieldClassName}>
                      <option value="">Selecione seu campus</option>
                      {campuses.map((item) => <option key={item} value={item}>{item}</option>)}
                      <option value="__other">Outro / não aparece</option>
                    </select>
                  ) : (
                    <input required value={customCampus} onChange={(event) => setCustomCampus(event.target.value)} onBlur={() => {
                      if (customCampus.trim() && institution !== '__other') {
                        setCoursesLoading(true);
                        getCourses(institution, institutionDomain, customCampus.trim())
                          .then(setCourses)
                          .catch((requestError) => setError(requestError.message))
                          .finally(() => setCoursesLoading(false));
                      }
                    }} className={fieldClassName} placeholder="Digite seu campus" />
                  )}
                  {!campusNeedsText && <span className="mt-1 flex items-center gap-1 text-xs font-normal text-slate-400"><MapPin className="h-3 w-3" /> Escolha uma opção ou informe outro campus.</span>}
                </label>
              )}

              {institution && (campus || customCampus) && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Curso
                    {coursesLoading ? (
                      <select disabled className={fieldClassName}><option>Carregando cursos...</option></select>
                    ) : !courseNeedsText ? (
                      <select required value={course} onChange={(event) => setCourse(event.target.value)} className={fieldClassName}>
                        <option value="">Selecione seu curso</option>
                        {courses.map((item) => <option key={item} value={item}>{item}</option>)}
                        <option value="__other">Outro / não aparece</option>
                      </select>
                    ) : (
                      <input required value={customCourse} onChange={(event) => setCustomCourse(event.target.value)} className={fieldClassName} placeholder="Digite seu curso" />
                    )}
                  </label>
                  <label className="block text-sm font-semibold text-slate-700">
                    Período
                    <select required value={academicPeriod} onChange={(event) => setAcademicPeriod(event.target.value)} className={fieldClassName}>
                      <option value="">Selecione o período</option>
                      {periods.map((period) => <option key={period} value={period}>{period}º período</option>)}
                    </select>
                  </label>
                </div>
              )}
            </>
          )}

          {error && <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-3 text-sm text-red-700">{error}</p>}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-400">Essas informações ajudam a personalizar seu mural.</p>
            <button
              type="submit"
              disabled={loading || saving}
              className="rounded-xl bg-[#FFC72C] px-5 py-3 text-sm font-extrabold text-slate-900 shadow-sm transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Salvando...' : 'Concluir'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
