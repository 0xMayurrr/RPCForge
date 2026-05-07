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

        // if email confirmation is required, session won't exist yet
        if (!data.session) {
          setError('Check your email to confirm your account, then log in.');
          setIsLoading(false);
          setMode('login');
          return;
        }

        const apiKey = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
        await Promise.all([
          supabase.from('users').insert({ id: data.user.id, email, tier: plan, api_key: apiKey }),
          supabase.from('api_keys').insert({ user_id: data.user.id, key: apiKey, tier: plan }),
        ]);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate('/dashboard');
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('invalid login')) setError('Wrong email or password.');
      else if (msg.toLowerCase().includes('email not confirmed')) setError('Please confirm your email first, then log in.');
      else setError(msg);
    } finally {
      setIsLoading(false);
    }
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


      </div>
    </div>
  );
}
