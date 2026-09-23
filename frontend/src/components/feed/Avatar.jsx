import { User } from 'lucide-react';

export default function Avatar({ size = 'medium', className = '' }) {
  const sizes = {
    small: 'w-7 h-7',
    medium: 'w-10 h-10',
    large: 'w-12 h-12',
  };

  return (
    <div className={`${sizes[size]} rounded-full bg-slate-300 text-slate-600 flex items-center justify-center shrink-0 ${className}`}>
      <User className={size === 'small' ? 'w-4 h-4' : 'w-6 h-6'} />
    </div>
  );
}
