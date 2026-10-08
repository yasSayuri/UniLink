import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import illustrationImage from '../assets/login-illustration.png';
import AuthHeader from '../components/auth/AuthHeader';
import AuthInput from '../components/auth/AuthInput';
import AuthLayout from '../components/auth/AuthLayout';
import AuthSubmitButton from '../components/auth/AuthSubmitButton';
import AuthSwitchLink from '../components/auth/AuthSwitchLink';
import PasswordInput from '../components/auth/PasswordInput';
import { login } from '../utils/authApi';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login({ email, password });
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
      title={<>Conectando estudantes,<br /><span className="text-[#FFC72C]">ideias e oportunidades.</span></>}
    >
      <AuthHeader
        eyebrow="Bem-vindo(a) de volta!"
        title={<>Faça login na<br />sua conta</>}
        description={<>Continue sua jornada na UniLink<br />e conecte-se com a comunidade.</>}
      />

      <form onSubmit={handleSubmit} className="auth-mobile-form space-y-4">
        <AuthInput
          icon={Mail}
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <PasswordInput placeholder="Senha" value={password} onChange={(event) => setPassword(event.target.value)} />
        {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}
        <div className="text-right pt-1">
          <a href="#" className="text-sm font-semibold text-[#D9A000] lg:text-[#FFC72C] hover:underline">
            Esqueceu sua senha?
          </a>
        </div>
        <AuthSubmitButton disabled={submitting}>{submitting ? 'Entrando...' : 'Entrar'}</AuthSubmitButton>
      </form>

      <div className="auth-mobile-divider relative my-8 text-center flex items-center justify-center">
        <div className="w-full border-t border-slate-300/60 absolute inset-0 my-auto" />
        <span className="relative z-10 px-3 text-xs text-slate-400 font-medium">ou</span>
      </div>

      <AuthSwitchLink message="Não tem uma conta?" label="Cadastre-se" href="/register" />
    </AuthLayout>
  );
}
