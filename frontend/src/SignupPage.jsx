import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Layers, Loader2 } from 'lucide-react';
import { supabase } from './supabase';

export default function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan') || 'free';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState(null);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('signup'); // signup | login

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthMethod('email');
    setError('');

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        // create user record + generate API key
        if (data.user) {
          const apiKey = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
          await supabase.from('users').insert({
            id: data.user.id,
            email,
            tier: plan,
            api_key: apiKey,
          });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    setIsLoading(true);
    setAuthMethod('google');
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'https://rpc-forge.vercel.app/dashboard' }
    });
    if (error) { setError(error.message); setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background-dark flex flex-col justify-center items-center p-6 text-slate-100 font-display selection:bg-primary/30">
      <Link to="/" className="flex items-center gap-3 mb-8 hover:opacity-80 transition-opacity">
        <div className="size-8 bg-primary rounded flex items-center justify-center text-white shadow-[0_0_15px_rgba(100,103,242,0.4)]">
          <Layers className="size-5" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">RPCForge</span>
      </Link>

      <div className="w-full max-w-md bg-obsidian border border-border-subtle rounded-2xl p-8 shadow-2xl">
        {/* Toggle signup/login */}
        <div className="flex bg-white/5 rounded-lg p-1 mb-6">
          <button onClick={() => setMode('signup')}
            className={`flex-1 py-2 text-xs font-bold rounded transition-colors ${mode === 'signup' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'}`}>
            Sign Up
          </button>
          <button onClick={() => setMode('login')}
            className={`flex-1 py-2 text-xs font-bold rounded transition-colors ${mode === 'login' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'}`}>
            Log In
          </button>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2 text-center">
          {mode === 'signup' ? (plan === 'pro' ? 'Start your Pro Trial' : 'Create an account') : 'Welcome back'}
        </h1>
        <p className="text-sm text-slate-400 text-center mb-6">
          {mode === 'signup' ? 'Get your free API key instantly.' : 'Log in to your RPCForge dashboard.'}
        </p>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              disabled={isLoading} required placeholder="alice@example.com"
              className="bg-background-dark border border-border-subtle rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-600 disabled:opacity-50"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              disabled={isLoading} required placeholder="••••••••"
              className="bg-background-dark border border-border-subtle rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-600 disabled:opacity-50"
            />
          </div>

          <button type="submit" disabled={isLoading}
            className="w-full py-2.5 mt-2 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg shadow-[0_0_15px_rgba(100,103,242,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
            {isLoading && authMethod === 'email'
              ? <><Loader2 className="size-4 animate-spin" /> {mode === 'signup' ? 'Creating account...' : 'Logging in...'}</>
              : mode === 'signup' ? 'Create Account' : 'Log In'}
          </button>
        </form>

        <div className="flex items-center gap-4 my-5">
          <div className="flex-1 h-px bg-border-subtle"></div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">OR</span>
          <div className="flex-1 h-px bg-border-subtle"></div>
        </div>

        <button onClick={handleGoogle} type="button" disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-lg transition-colors disabled:opacity-50">
          {isLoading && authMethod === 'google'
            ? <><Loader2 className="size-4 animate-spin text-slate-400" /> Connecting to Google...</>
            : <>
              <svg className="size-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </>}
        </button>
      </div>
    </div>
  );
}
