import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { useAuthStore } from './store/authStore';

// Lazy-loaded route pages for code-splitting
const LandingPage = lazy(() => import('./pages/Landing/LandingPage').then(m => ({ default: m.LandingPage })));
const DashboardPage = lazy(() => import('./pages/Dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const ProblemsPage = lazy(() => import('./pages/Problems/ProblemsPage').then(m => ({ default: m.ProblemsPage })));
const WorkspacePage = lazy(() => import('./pages/Workspace/WorkspacePage').then(m => ({ default: m.WorkspacePage })));
const SheetsPage = lazy(() => import('./pages/Sheets/SheetsPage').then(m => ({ default: m.SheetsPage })));
const SheetDetailPage = lazy(() => import('./pages/Sheets/SheetDetailPage').then(m => ({ default: m.SheetDetailPage })));
const DailyChallengePage = lazy(() => import('./pages/DailyChallenge/DailyChallengePage').then(m => ({ default: m.DailyChallengePage })));
const SubmissionsPage = lazy(() => import('./pages/Submissions/SubmissionsPage').then(m => ({ default: m.SubmissionsPage })));
const FavoritesPage = lazy(() => import('./pages/Favorites/FavoritesPage').then(m => ({ default: m.FavoritesPage })));
const LeaderboardPage = lazy(() => import('./pages/Leaderboard/LeaderboardPage').then(m => ({ default: m.LeaderboardPage })));
const ProfilePage = lazy(() => import('./pages/Profile/ProfilePage').then(m => ({ default: m.ProfilePage })));
const AdminPage = lazy(() => import('./pages/Admin/AdminPage').then(m => ({ default: m.AdminPage })));
const ProblemWizard = lazy(() => import('./pages/Admin/ProblemWizard').then(m => ({ default: m.ProblemWizard })));
const AdminAnalyticsPage = lazy(() => import('./pages/Admin/AdminAnalyticsPage').then(m => ({ default: m.AdminAnalyticsPage })));
const LoginPage = lazy(() => import('./pages/Login/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/Register/RegisterPage').then(m => ({ default: m.RegisterPage })));

const PageLoader = () => (
  <div className="flex justify-center items-center min-h-[50vh] bg-[#080c14]">
    <svg className="animate-spin h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore();
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-[#080c14] text-[#e2e8f0] font-sans">
        <Navbar />
        <main className="flex-1">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/problems" element={<ProblemsPage />} />
              <Route path="/problems/:slug" element={<WorkspacePage />} />
              <Route path="/sheets" element={<SheetsPage />} />
              <Route path="/sheets/:slug" element={<SheetDetailPage />} />
              <Route path="/daily-challenge" element={<DailyChallengePage />} />
              <Route
                path="/submissions"
                element={
                  <ProtectedRoute>
                    <SubmissionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/favorites"
                element={
                  <ProtectedRoute>
                    <FavoritesPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/profile/:username" element={<ProfilePage />} />

              {/* Admin CMS Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/problems/new"
                element={
                  <AdminRoute>
                    <ProblemWizard />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/problems/:id/edit"
                element={
                  <AdminRoute>
                    <ProblemWizard />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <AdminRoute>
                    <AdminAnalyticsPage />
                  </AdminRoute>
                }
              />

              {/* Auth */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};
export default App;
