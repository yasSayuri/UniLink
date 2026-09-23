import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, User } from 'lucide-react';
import illustrationImage from '../assets/cadastro_illustration.png';
import AuthHeader from '../components/auth/AuthHeader';
import AuthInput from '../components/auth/AuthInput';
import AuthLayout from '../components/auth/AuthLayout';
import AuthSubmitButton from '../components/auth/AuthSubmitButton';
import AuthSwitchLink from '../components/auth/AuthSwitchLink';
import PasswordInput from '../components/auth/PasswordInput';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate('/feed');
  };

  return (
    <AuthLayout
      illustration={illustrationImage}
      brandingFirst={false}
      title={<>Junte-se à nossa<br /><span className="text-[#FFC72C]">comunidade universitária!</span></>}
    >
      <AuthHeader
        eyebrow="Crie sua conta no UniLink"
        title="Vamos começar?"
        description={<>Preencha os dados abaixo para criar sua conta<br />e fazer parte da nossa comunidade.</>}
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          icon={User}
          type="text"
          placeholder="Nome completo"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
        <AuthInput
          icon={Mail}
          type="email"
          placeholder="E-mail institucional"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <PasswordInput placeholder="Senha" value={password} onChange={(event) => setPassword(event.target.value)} />
        <PasswordInput placeholder="Confirmar senha" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
        <AuthSubmitButton>Cadastrar</AuthSubmitButton>
      </form>

      <div className="relative my-6 text-center flex items-center justify-center">
        <div className="w-full border-t border-slate-300/60 absolute inset-0 my-auto" />
        <span className="relative z-10 px-3 text-xs text-slate-400 font-medium">ou</span>
      </div>

      <AuthSwitchLink message="Já tem uma conta?" label="Faça login" href="/login" />
    </AuthLayout>
  );
}
