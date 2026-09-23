import { GraduationCap, MessageSquare, Users } from 'lucide-react';

const benefits = [
  { icon: Users, text: <>Faça<br />novas amizades</> },
  { icon: MessageSquare, text: <>Compartilhe<br />conteúdos</> },
  { icon: GraduationCap, text: <>Participe<br />da sua universidade</> },
];

export default function AuthBenefits() {
  return (
    <div className="w-full max-w-[600px] flex items-center justify-between text-slate-600 text-sm font-medium pt-2">
      {benefits.map(({ icon: Icon, text }, index) => (
        <div key={index} className="contents">
          {index > 0 && <div className="h-10 w-px bg-slate-300" />}
          <div className="flex items-center gap-3">
            <Icon className="w-7 h-7 text-slate-600 shrink-0" />
            <span className="leading-tight">{text}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
