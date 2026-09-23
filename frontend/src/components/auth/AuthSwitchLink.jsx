export default function AuthSwitchLink({ message, label, href }) {
  return (
    <div className="text-center text-sm text-slate-600 pb-6 lg:pb-0">
      {message}{' '}
      <a href={href} className="font-semibold text-[#D9A000] lg:text-[#FFC72C] hover:underline">
        {label}
      </a>
    </div>
  );
}
