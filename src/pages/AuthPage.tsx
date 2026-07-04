import React, { useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '../api/auth';
import { cn } from '../lib/utils';

type Mode = 'login' | 'register';

const features = [
  { icon: '🤖', title: 'AI Farming Assistant', desc: 'Ask anything, get expert answers' },
  { icon: '🔬', title: 'Disease Detection', desc: 'Scan crops with your camera' },
  { icon: '📈', title: 'Live Market Prices', desc: 'Mandi rates updated daily' },
  { icon: '🌦️', title: 'Smart Weather', desc: 'Hyperlocal farming forecasts' },
];

const AuthPage: React.FC = () => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard';

  const [mode, setMode] = useState<Mode>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Already logged in — redirect
  if (!loading && session) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    if (mode === 'register' && !fullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
        toast.success('Welcome back! 🌾');
        navigate(from, { replace: true });
      } else {
        await signUpWithEmail(email, password, fullName);
        toast.success('Welcome to KrishiMitra! 🌾');
        navigate(from, { replace: true });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    if (googleLoading) return;
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      // The page will redirect via OAuth flow — no navigation needed here
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed';
      toast.error(msg);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel — branding & features ─────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-hero-gradient flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full animate-blob" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-400/10 rounded-full animate-blob animation-delay-4000" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
            <Sprout className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white font-display">KrishiMitra AI</h1>
            <p className="text-emerald-300 text-sm">Smart Farming Companion</p>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white font-display leading-tight mb-4">
            Empowering Indian
            <br />
            <span className="text-emerald-300">Farmers with AI</span>
          </h2>
          <p className="text-white/70 text-lg mb-10">
            Join 50,000+ farmers using AI to grow smarter, earn more, and farm sustainably.
          </p>

          {/* Features list */}
          <div className="grid grid-cols-2 gap-4">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <span className="text-2xl flex-shrink-0">{f.icon}</span>
                <div>
                  <p className="text-white font-semibold text-sm">{f.title}</p>
                  <p className="text-white/60 text-xs mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10 text-white/50 text-sm">
          "Technology meeting tradition — for India's farming future"
        </div>
      </div>

      {/* ── Right panel — auth form ───────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-slate-900">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-card-gradient-green rounded-xl flex items-center justify-center shadow-md">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white text-lg font-display">KrishiMitra AI</h1>
              <p className="text-xs text-primary-600 dark:text-primary-400">Smart Farming Companion</p>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-gray-100 dark:bg-slate-800 rounded-xl p-1 mb-8">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  'flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                  mode === m
                    ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                )}
                id={`auth-tab-${m}`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-display mb-1">
                {mode === 'login' ? 'Welcome back 👋' : 'Join KrishiMitra 🌾'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                {mode === 'login'
                  ? 'Sign in to access your farm dashboard'
                  : 'Create a free account to get started'}
              </p>

              {/* Google OAuth */}
              <button
                type="button"
                onClick={handleGoogle}
                disabled={googleLoading}
                id="google-signin-btn"
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 font-medium text-sm hover:border-primary-300 dark:hover:border-primary-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-200 mb-6 disabled:opacity-60"
              >
                {googleLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                )}
                Continue with Google
              </button>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-slate-700" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white dark:bg-slate-900 px-4 text-xs text-gray-400">or continue with email</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4" id="auth-form">
                {mode === 'register' && (
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="input-field pl-10"
                      autoComplete="name"
                      id="auth-fullname"
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10"
                    autoComplete="email"
                    id="auth-email"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-10 pr-10"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    id="auth-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  id="auth-submit-btn"
                  className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-base disabled:opacity-60"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {mode === 'login' ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-xs text-gray-400 mt-6">
                By continuing, you agree to our{' '}
                <a href="#" className="text-primary-600 hover:underline">Terms</a>
                {' '}and{' '}
                <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
