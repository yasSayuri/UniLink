import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import illustrationImage from '../assets/login-illustration.png';
import AuthHeader from '../components/auth/AuthHeader';
import AuthInput from '../components/auth/AuthInput';
import AuthLayout from '../components/auth/AuthLayout';
import AuthSubmitButton from '../components/auth/AuthSubmitButton';
import AuthSwitchLink from '../components/auth/AuthSwitchLink';
import PasswordInput from '../components/auth/PasswordInput';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate('/feed');
  };

  return (
    <AuthLayout
      illustration={illustrationImage}
      title={<>Conectando estudantes,<br /><span className="text-[#FFC72C]">ideias e oportunidades.</span></>}
    >
      <AuthHeader
        eyebrow="Bem-vindo(a) de volta!"
        title={<>Faça login na<br />sua conta</>}
        description={<>Continue sua jornada na UniLink<br />e conecte-se com a comunidade.</>}
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          icon={User}
          type="text"
          placeholder="Usuário"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
        />
        <PasswordInput placeholder="Senha" value={password} onChange={(event) => setPassword(event.target.value)} />
        <div className="text-right pt-1">
          <a href="#" className="text-sm font-semibold text-[#D9A000] lg:text-[#FFC72C] hover:underline">
            Esqueceu sua senha?
          </a>
        </div>
        <AuthSubmitButton>Entrar</AuthSubmitButton>
      </form>

      <div className="relative my-8 text-center flex items-center justify-center">
        <div className="w-full border-t border-slate-300/60 absolute inset-0 my-auto" />
        <span className="relative z-10 px-3 text-xs text-slate-400 font-medium">ou</span>
      </div>

      <AuthSwitchLink message="Não tem uma conta?" label="Cadastre-se" href="/register" />
    </AuthLayout>
  );
}
