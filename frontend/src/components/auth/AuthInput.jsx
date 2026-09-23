export default function AuthInput({ icon: Icon, ...props }) {
  return (
    <div className="relative flex items-center">
      <Icon className="absolute left-4 w-5 h-5 text-slate-400" />
      <input
        {...props}
        className="w-full bg-white lg:bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFC72C] focus:border-transparent transition-all shadow-sm lg:shadow-none"
      />
    </div>
  );
}
