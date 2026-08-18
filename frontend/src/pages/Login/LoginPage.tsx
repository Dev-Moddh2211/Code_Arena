import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/common/Button';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, demoLogin, isLoading } = useAuthStore();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      login(res.data.access_token, res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = async () => {
    await demoLogin('student');
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4 bg-[#080c14] text-slate-300">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-800 bg-[#0d131f] p-8 shadow-2xl">
        <div className="text-center space-y-1.5">
          <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-xl bg-emerald-600 text-white font-mono text-sm font-bold shadow-xs">
            CA
          </div>
          <h1 className="text-xl font-bold text-white">Sign In to Code Arena</h1>
          <p className="text-xs text-slate-400">Practice algorithms in an isolated execution sandbox.</p>
        </div>

        {error && (
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-[#090e18] border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#090e18] border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-500 text-xs"
            />
          </div>

          <Button
            variant="primary"
            size="md"
            type="submit"
            isLoading={isSubmitting}
            className="w-full mt-2"
          >
            Sign In
          </Button>

          <Button
            variant="secondary"
            size="md"
            type="button"
            onClick={handleQuickDemo}
            disabled={isLoading}
            className="w-full"
          >
            Sign In with Test Account
          </Button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-400 hover:underline font-medium">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
