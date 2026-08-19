import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/common/Button';
import { Logo } from '../../components/common/Logo';

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
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4 bg-[#1a1a1a] text-neutral-300">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-[#282828] bg-[#222222] p-8 shadow-2xl">
        <div className="text-center space-y-2 flex flex-col items-center">
          <Logo size="lg" />
          <h1 className="text-xl font-bold text-white pt-2">Sign In</h1>
        </div>

        {error && (
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-neutral-300 font-semibold mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-[#1a1a1a] border border-[#333333] rounded-lg p-2.5 text-neutral-200 focus:outline-none focus:border-[#555] text-xs"
            />
          </div>

          <div>
            <label className="block text-neutral-300 font-semibold mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#1a1a1a] border border-[#333333] rounded-lg p-2.5 text-neutral-200 focus:outline-none focus:border-[#555] text-xs"
            />
          </div>

          <Button
            variant="primary"
            size="md"
            type="submit"
            isLoading={isSubmitting}
            className="w-full mt-2 bg-[#FFA116] hover:bg-[#ffb038] text-neutral-900 font-bold border-none"
          >
            Sign In
          </Button>

          <Button
            variant="secondary"
            size="md"
            type="button"
            onClick={handleQuickDemo}
            disabled={isLoading}
            className="w-full bg-[#2a2a2a] hover:bg-[#333] text-neutral-300 border border-[#383838]"
          >
            Sign In with Test Account
          </Button>
        </form>

        <p className="text-center text-xs text-neutral-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#FFA116] hover:underline font-medium">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
