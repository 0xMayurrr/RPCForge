import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Layers, Loader2, Mail, Lock, AlertCircle, ChevronLeft, ArrowRight } from 'lucide-react';
import { supabase } from './supabase';

export default function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan') || 'free';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('signup'); // signup | login

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;

        if (!data.session) {
          setError('Verification email sent! Please check your inbox.');
          setIsLoading(false);
          setMode('login');
          return;
        }

        // Initialize user in our custom tables
        const apiKey = 'rf_' + Math.random().toString(36).slice(2, 15) + Math.random().toString(36).slice(2, 15);
        await Promise.all([
          supabase.from('users').insert({ id: data.user.id, email, tier: plan, api_key: apiKey }),
          supabase.from('api_keys').insert({ user_id: data.user.id, key: apiKey, tier: plan }),
        ]);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 selection:bg-primary/30 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Back to Home */}
      <Link to="/" className="absolute top-12 left-12 flex items-center gap-2 text-zinc-500 hover:text-zinc-100 transition-colors text-sm font-medium group">
        <ChevronLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
        Back to home
      </Link>

      <div className="w-full max-w-[440px] relative">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-3 mb-2">
            <img src="/logo.svg" alt="RPCForge" className="h-12 w-12" />
            <span className="text-2xl font-extrabold tracking-tight text-zinc-100">RPC<span className="text-primary">Forge</span></span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 md:p-10 shadow-2xl relative">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-zinc-100 mb-2">
              {mode === 'signup' ? 'Create an account' : 'Welcome back'}
            </h2>
            <p className="text-sm text-zinc-500 font-medium">
              {mode === 'signup' 
                ? 'Join 5,000+ developers scaling with RPCForge.' 
                : 'Enter your credentials to access your dashboard.'}
            </p>
          </div>

          {/* Toggle */}
          <div className="flex bg-zinc-950 rounded-xl p-1 mb-8 border border-zinc-800">
            <button 
              onClick={() => setMode('signup')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
                mode === 'signup' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Sign Up
            </button>
            <button 
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
                mode === 'login' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Log In
            </button>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-medium text-red-400 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.1em] ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  disabled={isLoading}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-11 pr-4 py-3.5 text-sm text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.1em]">Password</label>
                {mode === 'login' && (
                  <button type="button" className="text-[11px] font-bold text-primary hover:text-primary-dark transition-colors">
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-600" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-11 pr-4 py-3.5 text-sm text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(100,103,242,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <>
                  {mode === 'signup' ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-zinc-600 font-medium">
            By continuing, you agree to our{' '}
            <a href="#" className="text-zinc-400 hover:text-white underline underline-offset-4">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-zinc-400 hover:text-white underline underline-offset-4">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
