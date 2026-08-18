import { create } from 'zustand';
import { User } from '../types';
import { apiClient } from '../api/client';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  demoLogin: (role: 'student' | 'admin') => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: JSON.parse(localStorage.getItem('arena_user') || 'null'),
  token: localStorage.getItem('arena_token') || null,
  isLoading: false,

  login: (token: string, user: User) => {
    localStorage.setItem('arena_token', token);
    localStorage.setItem('arena_user', JSON.stringify(user));
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem('arena_token');
    localStorage.removeItem('arena_user');
    set({ token: null, user: null });
  },

  demoLogin: async (role: 'student' | 'admin') => {
    set({ isLoading: true });
    try {
      const response = await apiClient.post('/auth/demo-login', { role });
      const { access_token, user } = response.data;
      get().login(access_token, user);
    } finally {
      set({ isLoading: false });
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('arena_token');
    if (!token) {
      set({ user: null, token: null });
      return;
    }
    try {
      const res = await apiClient.get('/auth/me');
      set({ user: res.data });
      localStorage.setItem('arena_user', JSON.stringify(res.data));
    } catch (err) {
      get().logout();
    }
  }
}));
