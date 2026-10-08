import { User } from 'lucide-react';

export default function Avatar({ size = 'medium', className = '' }) {
  const sizes = {
    small: 'h-7 w-7',
    medium: 'h-10 w-10',
    large: 'h-12 w-12',
  };

  return (
    <div className={`${sizes[size]} flex shrink-0 items-center justify-center rounded-full bg-slate-300 text-slate-600 ${className}`}>
      <User className={size === 'small' ? 'h-4 w-4' : 'h-6 w-6'} />
    </div>
  );
}
