import { useState } from 'react';
import { Users, MessageSquare, GraduationCap, User, Lock, Eye, EyeOff, ArrowRight, Mail } from 'lucide-react';

import bgImage from '../assets/background.jpg';
import logoImage from '../assets/unilink-logo.png';
import illustrationCadastro from '../assets/cadastro_illustration.png';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div 
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex items-center justify-center p-4 lg:p-12 font-sans relative select-none"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-[55px] items-start min-h-screen lg:min-h-0">
        
        <div className="lg:col-span-5 xl:col-span-5 flex justify-center lg:justify-end relative w-full h-full lg:h-auto lg:pt-[104px] lg:-mt-10">
          
          <div className="absolute top-[59px] left-[18px] text-[#FFC72C] hidden sm:block z-20">
            <svg width="68" height="68" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="2" x2="12" y2="6"></line>
              <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
              <line x1="19.07" y1="4.93" x2="16.24" y2="7.76"></line>
            </svg>
          </div>

          <div className="w-full max-w-md p-6 sm:p-10 lg:p-10 lg:bg-white/95 lg:backdrop-blur-md lg:rounded-3xl lg:shadow-xl lg:border lg:border-white/40 flex flex-col justify-center min-h-screen lg:min-h-[580px]">
            
            <div className="flex lg:hidden items-center justify-center gap-4 mb-8 pt-6">
              <img 
                src={logoImage} 
                alt="UniLink Logo" 
                className="h-16 sm:h-20 w-auto object-contain"
              />
              <span 
                translate="no" 
                className="notranslate text-5xl sm:text-6xl font-black tracking-tight inline-flex items-center"
              >
                <span className="bg-gradient-to-b from-[#525B67] via-[#38414D] to-[#2B323B] bg-clip-text text-transparent">
                  Uni
                </span>
                <span className="text-[#FFC72C]">
                  Link
                </span>
              </span>
            </div>

            <div className="mb-6 text-left">
              <span className="text-sm text-slate-500 font-medium block mb-2">Crie sua conta no UniLink</span>
              
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                <span className="bg-gradient-to-b from-[#525B67] via-[#38414D] to-[#2B323B] bg-clip-text text-transparent">
                  Vamos começar?
                </span>
              </h2>

              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Preencha os dados abaixo para criar sua conta<br />
                e fazer parte da nossa comunidade.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative flex items-center">
                <User className="absolute left-4 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white lg:bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFC72C] focus:border-transparent transition-all shadow-sm lg:shadow-none"
                  required
                />
              </div>

              <div className="relative flex items-center">
                <Mail className="absolute left-4 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  placeholder="E-mail institucional"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white lg:bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFC72C] focus:border-transparent transition-all shadow-sm lg:shadow-none"
                  required
                />
              </div>

              <div className="relative flex items-center">
                <Lock className="absolute left-4 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white lg:bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-12 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFC72C] focus:border-transparent transition-all shadow-sm lg:shadow-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="relative flex items-center">
                <Lock className="absolute left-4 w-5 h-5 text-slate-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirmar senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white lg:bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-12 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFC72C] focus:border-transparent transition-all shadow-sm lg:shadow-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-[#FFC72C] hover:bg-[#f0ba28] text-slate-900 font-bold py-3.5 px-4 rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-4 text-sm"
              >
                <span>Cadastrar</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            <div className="relative my-6 text-center flex items-center justify-center">
              <div className="w-full border-t border-slate-300/60 absolute inset-0 my-auto" />
              <span className="relative z-10 px-3 text-xs text-slate-400 font-medium">ou</span>
            </div>

            <div className="text-center text-s text-slate-600 pb-4 lg:pb-0">
              Já tem uma conta?{' '}
              <a href="/login" className="font-semibold text-[#D9A000] lg:text-[#FFC72C] hover:underline">
                Faça login
              </a>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex lg:col-span-7 xl:col-span-7 flex-col justify-between -mt-11 space-y-8 pl-0 lg:pl-2 pt-[6px]">
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <img 
                src={logoImage} 
                alt="UniLink Logo" 
                className="h-20 w-auto object-contain rounded-2xl"
              />
              <span 
                translate="no" 
                className="notranslate text-6xl md:text-7xl font-black tracking-tight inline-flex items-center"
              >
                <span className="bg-gradient-to-b from-[#525B67] via-[#38414D] to-[#2B323B] bg-clip-text text-transparent">
                  Uni
                </span>
                <span className="text-[#FFC72C]">
                  Link
                </span>
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-slate-700 leading-normal">
              Junte-se à nossa<br />
              <span className="text-[#FFC72C]">comunidade universitária!</span>
            </h1>

            <div className="w-full max-w-[600px] flex items-center justify-between text-slate-600 text-sm font-medium pt-2">
              <div className="flex items-center gap-3">
                <Users className="w-7 h-7 text-slate-600 shrink-0" />
                <span className="leading-tight">
                  Faça<br />novas amizades
                </span>
              </div>
              <div className="h-10 w-px bg-slate-300" />
              <div className="flex items-center gap-3">
                <MessageSquare className="w-7 h-7 text-slate-600 shrink-0" />
                <span className="leading-tight">
                  Compartilhe<br />conteúdos
                </span>
              </div>
              <div className="h-10 w-px bg-slate-300" />
              <div className="flex items-center gap-3">
                <GraduationCap className="w-8 h-8 text-slate-600 shrink-0" />
                <span className="leading-tight">
                  Participe<br />da sua universidade
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 w-full max-w-[600px] flex justify-center items-center">
            <img 
              src={illustrationCadastro} 
              alt="Ilustração Cadastro UniLink" 
              className="w-full h-auto object-contain max-h-[420px] scale-105"
            />
          </div>

          <div className="flex items-center gap-2 text-sm md:text-base text-slate-600 font-semibold pt-0">
            <GraduationCap className="w-5 h-5 text-slate-600 shrink-0" />
            <span>Mais que uma rede, uma comunidade. De Universitário para Universitários!</span>
          </div>
        </div>

      </div>
    </div>
  );
}