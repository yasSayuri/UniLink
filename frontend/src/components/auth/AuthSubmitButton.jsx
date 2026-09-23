import { ArrowRight } from 'lucide-react';

export default function AuthSubmitButton({ children }) {
  return (
    <button
      type="submit"
      className="w-full bg-[#FFC72C] hover:bg-[#f0ba28] text-slate-900 font-bold py-4 px-4 rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-4"
    >
      <span>{children}</span>
      <ArrowRight className="w-5 h-5" />
    </button>
  );
}
