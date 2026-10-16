import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, ChevronDown, ChevronUp, GraduationCap, Lock, MapPin, Pencil, Shield, Trash2, UserRound, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FeedHeader from '../components/feed/FeedHeader';
import FeedMobileNav from '../components/feed/FeedMobileNav';
import FeedSidebar from '../components/feed/FeedSidebar';
import {
  addBlockedWord, changeEmail, changePassword, deleteAccount, getCurrentUser, getSettings,
  removeBlockedWord, unblockBlockedPerson, updatePreferences,
} from '../utils/authApi';
import { saveOnboarding } from '../utils/academicCatalogApi';
import { applyDarkMode, isDarkModeEnabled } from '../utils/theme';

function savedUser() {
  try { return JSON.parse(localStorage.getItem('unilink.user') || 'null'); } catch { return null; }
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <section role="dialog" aria-modal="true" className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-3">
          <h2 className="text-lg font-extrabold text-slate-800">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button>
        </div>
        {children}
      </section>
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-amber-400' : 'bg-slate-300'}`}>
      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${checked ? 'left-6' : 'left-1'}`} />
    </button>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(savedUser);
  const [settings, setSettings] = useState({ privateAccount: false, blockedPeople: [], blockedWords: [] });
  const [editingAcademicInfo, setEditingAcademicInfo] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(() => isDarkModeEnabled(savedUser()?.id));

  const load = () => Promise.all([getCurrentUser(), getSettings()])
    .then(([currentUser, currentSettings]) => {
      setUser(currentUser);
      setSettings(currentSettings);
      setDarkMode(currentSettings.darkMode);
      applyDarkMode(currentSettings.darkMode, currentUser.id);
      localStorage.setItem('unilink.user', JSON.stringify(currentUser));
    });

  useEffect(() => {
    load().catch((requestError) => setError(requestError.message));
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (modal === 'email') {
        await changeEmail(form.currentEmail, form.newEmail, form.confirmation);
        setUser((current) => ({ ...current, email: form.newEmail }));
        setModal(null);
      } else if (modal === 'password') {
        await changePassword(form.newPassword, form.confirmation);
        setModal(null);
      } else if (modal === 'word') {
        const result = await addBlockedWord(form.word);
        setSettings(result);
        setModal(null);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const togglePrivate = async (privateAccount) => {
    setSaving(true);
    setError('');
    try {
      const result = await updatePreferences(privateAccount);
      setSettings(result);
      setUser((current) => ({ ...current, privateAccount }));
      localStorage.setItem('unilink.user', JSON.stringify({ ...user, privateAccount }));
    } catch (requestError) { setError(requestError.message); } finally { setSaving(false); }
  };

  const toggleDarkMode = async (enabled) => {
    setSaving(true);
    setError('');
    try {
      const result = await updatePreferences(settings.privateAccount, enabled);
      setSettings(result);
      setDarkMode(result.darkMode);
      applyDarkMode(result.darkMode, user?.id);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const unblock = async (person) => {
    try {
      await unblockBlockedPerson(person.id);
      setSettings((current) => ({ ...current, blockedPeople: current.blockedPeople.filter((item) => item.id !== person.id) }));
    } catch (requestError) { setError(requestError.message); }
  };

  const removeWord = async (word) => {
    try {
      await removeBlockedWord(word);
      setSettings((current) => ({ ...current, blockedWords: current.blockedWords.filter((item) => item !== word) }));
    } catch (requestError) { setError(requestError.message); }
  };

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
          <section><h1 className="text-xl font-extrabold text-slate-800">Configurações</h1><p className="mt-1 text-sm text-slate-500">Gerencie sua conta e suas preferências.</p></section>
          {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div><h2 className="text-sm font-bold text-slate-800">Informações acadêmicas</h2><p className="mt-1 text-xs text-slate-500">Essas informações ajudam a personalizar sua experiência no UniLink.</p></div>
              <button type="button" onClick={() => setEditingAcademicInfo(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#FFC72C] px-4 py-2.5 text-xs font-bold text-slate-900 hover:bg-amber-400"><Pencil className="h-4 w-4" />Editar informações</button>
            </div>
            {academicInfo.length ? <dl className="mt-6 grid gap-4 sm:grid-cols-2">{academicInfo.map(({ label, value, icon: Icon }) => <div key={label} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4"><Icon className="h-5 w-5 shrink-0 text-amber-700" /><div><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-0.5 text-sm font-semibold text-slate-800">{value}</dd></div></div>)}</dl> : <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">As informações acadêmicas ainda não foram preenchidas.</p>}
          </section>

          <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
            <button type="button" onClick={() => setModal('email')} className="flex w-full items-center justify-between border-b border-slate-100 px-5 py-4 text-left hover:bg-slate-50 sm:px-6"><span className="flex items-center gap-3"><UserRound className="h-5 w-5 text-amber-700" /><span><strong className="block text-sm text-slate-800">Alterar e-mail</strong><span className="text-xs text-slate-500">{user?.email}</span></span></span><ArrowRight className="h-4 w-4 text-slate-400" /></button>
            <button type="button" onClick={() => setModal('password')} className="flex w-full items-center justify-between border-b border-slate-100 px-5 py-4 text-left hover:bg-slate-50 sm:px-6"><span className="flex items-center gap-3"><Lock className="h-5 w-5 text-amber-700" /><span><strong className="block text-sm text-slate-800">Alterar senha</strong><span className="text-xs text-slate-500">Atualize sua senha de acesso</span></span></span><ArrowRight className="h-4 w-4 text-slate-400" /></button>
            <div className="border-b border-slate-100">
              <button type="button" onClick={() => setExpanded((current) => !current)} className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-slate-50 sm:px-6"><span className="flex items-center gap-3"><Shield className="h-5 w-5 text-amber-700" /><span><strong className="block text-sm text-slate-800">Preferências e privacidade</strong><span className="text-xs text-slate-500">Controle a visibilidade e o conteúdo que aparece para você</span></span></span>{expanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}</button>
              {expanded && <div className="space-y-5 bg-slate-50 px-5 py-5 sm:px-6">
                <div className="flex items-center justify-between gap-4"><div><strong className="block text-sm text-slate-800">Conta privada</strong><span className="text-xs text-slate-500">Apenas seus seguidores poderão ver suas publicações e comentários.</span></div><Toggle checked={settings.privateAccount} onChange={togglePrivate} label="Conta privada" /></div>
                <div className="flex items-center justify-between gap-4"><div><strong className="block text-sm text-slate-800">Modo escuro</strong><span className="text-xs text-slate-500">Ative a aparência escura quando quiser.</span></div><Toggle checked={darkMode} onChange={toggleDarkMode} label="Modo escuro" /></div>
                <div><div className="flex items-center justify-between"><strong className="text-sm text-slate-800">Pessoas bloqueadas</strong><span className="text-xs text-slate-500">{settings.blockedPeople.length}</span></div>{settings.blockedPeople.length ? <div className="mt-3 space-y-2">{settings.blockedPeople.map((person) => <div key={person.id} className="flex items-center justify-between rounded-xl bg-white px-3 py-2"><span className="text-xs font-semibold text-slate-700">{person.name} <span className="font-normal text-slate-400">@{person.username}</span></span><button type="button" onClick={() => unblock(person)} className="text-xs font-bold text-amber-700 hover:underline">Desbloquear</button></div>)}</div> : <p className="mt-2 text-xs text-slate-500">Você não bloqueou ninguém.</p>}</div>
                <div><div className="flex items-center justify-between"><strong className="text-sm text-slate-800">Palavras bloqueadas</strong><button type="button" onClick={() => { setForm({ word: '' }); setModal('word'); }} className="text-xs font-bold text-amber-700 hover:underline">Adicionar</button></div>{settings.blockedWords.length ? <div className="mt-3 flex flex-wrap gap-2">{settings.blockedWords.map((word) => <span key={word} className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs text-slate-700">#{word}<button type="button" onClick={() => removeWord(word)} aria-label={`Remover ${word}`} className="text-slate-400 hover:text-red-600">×</button></span>)}</div> : <p className="mt-2 text-xs text-slate-500">Nenhuma palavra bloqueada.</p>}</div>
              </div>}
            </div>
            <button type="button" onClick={() => setModal('delete')} className="flex w-full items-center justify-between px-5 py-4 text-left text-red-600 hover:bg-red-50 sm:px-6"><span className="flex items-center gap-3"><Trash2 className="h-5 w-5" /><span><strong className="block text-sm">Excluir conta</strong><span className="text-xs text-red-400">Essa ação não pode ser desfeita.</span></span></span><ArrowRight className="h-4 w-4 text-red-300" /></button>
          </section>
        </main>
      </div>
      <FeedMobileNav />
      {editingAcademicInfo && <AcademicEditModal user={user} onClose={() => setEditingAcademicInfo(false)} onComplete={(updatedUser) => { setUser(updatedUser); setEditingAcademicInfo(false); }} />}

      {modal === 'email' && <Modal title="Alterar e-mail" onClose={() => setModal(null)}><form onSubmit={submit} className="space-y-4"><label className="block text-sm font-semibold">E-mail atual<input required type="email" value={form.currentEmail || ''} onChange={(e) => setForm({ ...form, currentEmail: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal" /></label><label className="block text-sm font-semibold">Novo e-mail<input required type="email" value={form.newEmail || ''} onChange={(e) => setForm({ ...form, newEmail: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal" /></label><label className="block text-sm font-semibold">Confirmar novo e-mail<input required type="email" value={form.confirmation || ''} onChange={(e) => setForm({ ...form, confirmation: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal" /></label><Actions onClose={() => setModal(null)} saving={saving} /></form></Modal>}
      {modal === 'password' && <Modal title="Alterar senha" onClose={() => setModal(null)}><form onSubmit={submit} className="space-y-4"><label className="block text-sm font-semibold">Nova senha<input required minLength="6" type="password" value={form.newPassword || ''} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal" /></label><label className="block text-sm font-semibold">Confirmar nova senha<input required minLength="6" type="password" value={form.confirmation || ''} onChange={(e) => setForm({ ...form, confirmation: e.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal" /></label><Actions onClose={() => setModal(null)} saving={saving} /></form></Modal>}
      {modal === 'word' && <Modal title="Adicionar palavra bloqueada" onClose={() => setModal(null)}><form onSubmit={submit} className="space-y-4"><p className="text-xs text-slate-500">Publicações com essa palavra não aparecerão nos seus feeds.</p><input required maxLength="80" autoFocus value={form.word || ''} onChange={(e) => setForm({ word: e.target.value })} placeholder="Ex.: spoiler" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" /><Actions onClose={() => setModal(null)} saving={saving} /></form></Modal>}
      {modal === 'delete' && <Modal title="Excluir conta?" onClose={() => setModal(null)}><p className="text-sm leading-relaxed text-slate-600">Sua conta, publicações e dados associados serão removidos permanentemente. Tem certeza?</p><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setModal(null)} className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-600">Cancelar</button><button type="button" disabled={saving} onClick={async () => { setSaving(true); try { await deleteAccount(); localStorage.removeItem('unilink.token'); localStorage.removeItem('unilink.user'); navigate('/login', { replace: true }); } catch (requestError) { setError(requestError.message); setModal(null); } finally { setSaving(false); } }} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{saving ? 'Excluindo...' : 'Excluir conta'}</button></div></Modal>}
    </div>
  );
}

function Actions({ onClose, saving }) {
  return <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={onClose} className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-600">Cancelar</button><button type="submit" disabled={saving} className="rounded-xl bg-[#FFC72C] px-4 py-2.5 text-sm font-extrabold text-slate-900 disabled:opacity-50">{saving ? 'Salvando...' : 'Atualizar'}</button></div>;
}

function AcademicEditModal({ user, onClose, onComplete }) {
  const [form, setForm] = useState({
    institutionName: user?.institutionName || '',
    institutionDomain: user?.institutionDomain || '',
    campus: user?.campus || '',
    course: user?.course || '',
    academicPeriod: user?.academicPeriod ? String(user.academicPeriod) : '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const updatedUser = await saveOnboarding({
        ...form,
        academicPeriod: Number(form.academicPeriod),
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
    <Modal title="Editar informações acadêmicas" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-semibold text-slate-700">
          Instituição
          <input required value={form.institutionName} onChange={(event) => setForm({ ...form, institutionName: event.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal" />
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          Campus
          <input required value={form.campus} onChange={(event) => setForm({ ...form, campus: event.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal" />
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          Curso
          <input required value={form.course} onChange={(event) => setForm({ ...form, course: event.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal" />
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          Período
          <select required value={form.academicPeriod} onChange={(event) => setForm({ ...form, academicPeriod: event.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal">
            <option value="">Selecione o período</option>
            {Array.from({ length: 12 }, (_, index) => index + 1).map((period) => <option key={period} value={period}>{period}º período</option>)}
          </select>
        </label>
        {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p>}
        <Actions onClose={onClose} saving={saving} />
      </form>
    </Modal>
  );
}
