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
import { register } from '../utils/authApi';

export default function Register() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setSubmitting(true);
    try {
      await register({ name, username, email, password });
      navigate('/feed');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
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

      <form onSubmit={handleSubmit} className="auth-mobile-form space-y-4">
        <AuthInput
          icon={User}
          type="text"
          placeholder="Nome completo"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
        <AuthInput
          icon={User}
          type="text"
          placeholder="Username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          minLength={3}
          maxLength={30}
          pattern="[A-Za-z0-9._]+"
          title="Use de 3 a 30 letras, números, ponto ou sublinhado."
          required
        />
        <AuthInput
          icon={Mail}
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <PasswordInput placeholder="Senha (mínimo de 8 caracteres)" value={password} onChange={(event) => setPassword(event.target.value)} />
        <PasswordInput placeholder="Confirmar senha" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
        {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}
        <AuthSubmitButton disabled={submitting}>{submitting ? 'Cadastrando...' : 'Cadastrar'}</AuthSubmitButton>
      </form>

      <div className="auth-mobile-divider relative my-6 text-center flex items-center justify-center">
        <div className="w-full border-t border-slate-300/60 absolute inset-0 my-auto" />
        <span className="relative z-10 px-3 text-xs text-slate-400 font-medium">ou</span>
      </div>

      <AuthSwitchLink message="Já tem uma conta?" label="Faça login" href="/login" />
    </AuthLayout>
  );
}
