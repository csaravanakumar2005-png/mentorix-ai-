import React, { useState } from 'react';
import { Sparkles, Loader2, Compass } from 'lucide-react';

interface AuthPageProps {
  onAuthSuccess: (user: any) => void;
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin 
        ? { email, password } 
        : { email, password, fullName };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      onAuthSuccess(data);
    } catch (err: any) {
      setError(err.message || 'Connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAccess = async () => {
    setError('');
    setGuestLoading(true);
    try {
      const res = await fetch('/api/auth/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Guest login failed');
      }
      onAuthSuccess(data);
    } catch (err: any) {
      setError(err.message || 'Connection failed.');
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center gap-3">
          <div className="bg-zinc-900 text-blue-400 p-2.5 rounded-none border border-zinc-800 flex items-center justify-center">
            <Compass size={24} className="animate-spin-slow" />
          </div>
          <span className="text-xl font-black uppercase tracking-widest text-white">
            Mentorix<span className="text-blue-500">AI</span>
          </span>
        </div>
        <h2 className="mt-6 text-center text-xs font-black uppercase tracking-widest text-white">
          {isLogin ? 'Sign in to student dashboard' : 'Create your student account'}
        </h2>
        <p className="mt-2 text-center text-[11px] text-zinc-400 uppercase tracking-wider">
          Your personal AI mentor for academic and career excellence
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-zinc-950 py-8 px-4 border border-zinc-800/85 rounded-none sm:px-10 shadow-2xl">
          {error && (
            <div className="mb-4 bg-red-950/20 border border-red-900/60 text-red-400 text-xs p-3.5 rounded-none font-bold uppercase tracking-wide">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit} id="auth_form">
            {!isLogin && (
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  Full Name
                </label>
                <div className="mt-1.5">
                  <input
                    id="full_name"
                    name="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full bg-zinc-900 border border-zinc-800 px-4 py-3 text-white placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none rounded-none text-xs"
                    placeholder="Jane Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Email Address
              </label>
              <div className="mt-1.5">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full bg-zinc-900 border border-zinc-800 px-4 py-3 text-white placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none rounded-none text-xs"
                  placeholder="student@university.edu"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Password
              </label>
              <div className="mt-1.5">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full bg-zinc-900 border border-zinc-800 px-4 py-3 text-white placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none rounded-none text-xs"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                id="submit_btn"
                type="submit"
                disabled={loading || guestLoading}
                className="flex w-full justify-center items-center gap-2 rounded-none bg-blue-600 border border-blue-500 px-4 py-3 text-xs font-black uppercase tracking-widest text-white shadow-md hover:bg-blue-700 transition cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    <span>Processing...</span>
                  </span>
                ) : (
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
                <span className="bg-zinc-950 px-3">Or quick sandbox test</span>
              </div>
            </div>

            <div className="mt-4">
              <button
                id="guest_btn"
                type="button"
                onClick={handleGuestAccess}
                disabled={loading || guestLoading}
                className="flex w-full justify-center items-center gap-2 rounded-none bg-zinc-900 border border-zinc-800 px-4 py-3 text-xs font-black uppercase tracking-widest text-white shadow-sm hover:bg-zinc-850 transition cursor-pointer disabled:opacity-50"
              >
                {guestLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Sparkles size={14} className="text-amber-400" />
                )}
                <span>Explore as Guest Student (1-Click)</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              id="toggle_auth_btn"
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-[11px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 cursor-pointer transition"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
