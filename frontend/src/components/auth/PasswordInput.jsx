import { Eye, EyeOff, Lock } from 'lucide-react';
import { useState } from 'react';

export default function PasswordInput({ placeholder, value, onChange }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative flex items-center">
      <Lock className="absolute left-4 w-5 h-5 text-slate-400" />
      <input
        type={visible ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        className="w-full bg-white lg:bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-12 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFC72C] focus:border-transparent transition-all shadow-sm lg:shadow-none"
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="absolute right-4 text-slate-400 hover:text-slate-600 focus:outline-none"
        aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
      >
        {visible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
}
