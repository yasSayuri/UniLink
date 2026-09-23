import { GraduationCap } from 'lucide-react';
import bgImage from '../../assets/background.jpg';
import UniLinkLogo from '../branding/UniLinkLogo';
import AuthBenefits from './AuthBenefits';

export default function AuthLayout({ children, illustration, title, brandingFirst = true }) {
  const branding = (
    <div className="hidden lg:flex lg:col-span-7 flex-col justify-between -mt-11 space-y-8">
      <div className="space-y-5">
        <UniLinkLogo size="large" />
        <h1 className="text-3xl md:text-4xl font-bold text-slate-700 leading-normal">{title}</h1>
        <AuthBenefits />
      </div>
      <div className="pt-2 w-full max-w-[600px] flex justify-center items-center">
        <img src={illustration} alt="Ilustração UniLink" className="w-full h-auto object-contain max-h-[420px] scale-105" />
      </div>
      <div className="flex items-center gap-2 text-sm md:text-base text-slate-600 font-semibold">
        <GraduationCap className="w-5 h-5 text-slate-600 shrink-0" />
        <span>Mais que uma rede, uma comunidade. De Universitário para Universitários!</span>
      </div>
    </div>
  );

  const formPanel = (
    <div className={`lg:col-span-5 flex justify-center relative w-full h-full lg:h-auto ${brandingFirst ? 'lg:pt-8' : 'lg:pt-17'}`}>
      <div className="w-full max-w-md p-6 sm:p-10 lg:p-12 lg:bg-white/95 lg:backdrop-blur-md lg:rounded-3xl lg:shadow-xl lg:border lg:border-white/40 flex flex-col justify-center min-h-screen lg:min-h-[580px]">
        <div className="flex lg:hidden items-center justify-center mb-8 pt-6">
          <UniLinkLogo size="medium" />
        </div>
        {children}
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex items-center justify-center p-4 lg:p-12 font-sans relative select-none"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className={`max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 ${brandingFirst ? 'gap-6' : 'gap-[75px]'} items-center min-h-screen lg:min-h-0`}>
        {brandingFirst ? <>{branding}{formPanel}</> : <>{formPanel}{branding}</>}
      </div>
    </div>
  );
}
