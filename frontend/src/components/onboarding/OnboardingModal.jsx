import { useEffect, useState } from 'react';
import { BookOpen, ChevronDown, GraduationCap, MapPin, Search } from 'lucide-react';
import {
  getCampuses,
  getCourses,
  getInstitutions,
  getPeriods,
  saveOnboarding,
} from '../../utils/academicCatalogApi';

const fieldClassName = 'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-700 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100';

function SearchableSelect({ value, options, placeholder, onChange, required = false, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selectedOption = options.find((option) => option.value === value);
  const filteredOptions = options.filter((option) => option.label.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')));

  return (
    <div className="relative mt-1.5">
      <input tabIndex={-1} aria-hidden="true" required={required} value={value} readOnly className="pointer-events-none absolute h-px w-px opacity-0" />
      <button type="button" disabled={disabled} aria-haspopup="listbox" aria-expanded={open} onClick={() => { setOpen((current) => !current); setQuery(''); }} className={`${fieldClassName} mt-0 flex items-center justify-between text-left disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400`}>
        <span className={selectedOption ? 'text-slate-700' : 'text-slate-400'}>{selectedOption?.label || placeholder}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && !disabled && <div role="listbox" className="absolute bottom-12 left-0 right-0 z-30 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
        <label className="relative block p-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar..." className="h-9 w-full rounded-lg bg-slate-50 pl-9 pr-2 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-amber-100" />
        </label>
        <div className="max-h-32 overflow-y-auto">
          {filteredOptions.length ? filteredOptions.map((option) => (
            <button key={option.value} type="button" role="option" aria-selected={value === option.value} onClick={() => { onChange(option.value); setOpen(false); setQuery(''); }} className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${value === option.value ? 'bg-amber-50 font-semibold text-amber-800' : 'text-slate-700 hover:bg-slate-50'}`}>
              {option.label}
            </button>
          )) : <p className="px-3 py-3 text-xs text-slate-500">Nenhuma opção encontrada.</p>}
        </div>
      </div>}
    </div>
  );
}

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
                <SearchableSelect
                  required
                  value={institution}
                  onChange={handleInstitutionChange}
                  placeholder="Selecione sua instituição"
                  options={[
                    ...institutions.map((item) => ({ value: item.name, label: item.name })),
                    { value: '__other', label: 'Minha instituição não aparece' },
                  ]}
                />
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
                    <SearchableSelect disabled value="" options={[]} placeholder="Carregando campi..." />
                  ) : !campusNeedsText ? (
                    <SearchableSelect
                      required
                      value={campus}
                      onChange={handleCampusChange}
                      placeholder="Selecione seu campus"
                      options={[
                        ...campuses.map((item) => ({ value: item, label: item })),
                        { value: '__other', label: 'Outro / não aparece' },
                      ]}
                    />
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
                    <SearchableSelect
                      required
                      value={academicPeriod}
                      onChange={setAcademicPeriod}
                      placeholder="Selecione o período"
                      options={periods.map((period) => ({ value: String(period), label: `${period}º período` }))}
                    />
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
