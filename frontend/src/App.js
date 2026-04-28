import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import AuthContext, { AuthProvider } from './context/AuthContext';
import Landing from './pages/Landing';
import Marketplace from './pages/Marketplace';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';
import Patients from './pages/Patients';
import ClinicFinder from './pages/ClinicFinder';
import Integrations from './pages/Integrations';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Contact from './pages/Contact';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Orders from './pages/Orders';
import { ToastProvider } from './context/ToastContext';
import PrivateShell from './components/PrivateShell';

function PrivateRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function PublicNavbar() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const isActive = (path) => location.pathname === path;

  if (user) return null;

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-2xl font-bold text-medical-600">
          DentalLink
        </Link>
        <div className="hidden items-center gap-6 sm:flex">
          <Link to="/" className={`${isActive('/') ? 'text-medical-600' : 'text-gray-500 hover:text-medical-600'} text-sm font-medium`}>
            Inicio
          </Link>
          {isLanding ? (
            <>
              <a href="#features" className="text-sm font-medium text-gray-500 hover:text-medical-600">
                Características
              </a>
              <a href="#how-it-works" className="text-sm font-medium text-gray-500 hover:text-medical-600">
                Cómo funciona
              </a>
            </>
          ) : null}
          <Link to="/find-clinics" className={`${isActive('/find-clinics') ? 'text-medical-600' : 'text-gray-500 hover:text-medical-600'} text-sm font-medium`}>
            Buscar clínica
          </Link>
          <Link to="/login" className="text-sm font-bold text-gray-600 hover:text-medical-600">
            Iniciar sesión
          </Link>
          <Link to="/signup" className="rounded-lg bg-medical-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-medical-600">
            Registrarse
          </Link>
        </div>
      </div>
    </nav>
  );
}

function PrivatePage({ children }) {
  return (
    <PrivateRoute>
      <PrivateShell>{children}</PrivateShell>
    </PrivateRoute>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <div className="flex flex-col min-h-screen">
            <PublicNavbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<PublicOnlyRoute><Landing /></PublicOnlyRoute>} />
                <Route path="/marketplace" element={<PrivatePage><Marketplace /></PrivatePage>} />
                <Route path="/dashboard" element={<PrivatePage><Dashboard /></PrivatePage>} />
                <Route path="/orders" element={<PrivatePage><Orders /></PrivatePage>} />
                <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
                <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
                <Route path="/reset-password" element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>} />
                <Route path="/signup" element={<PublicOnlyRoute><SignUp /></PublicOnlyRoute>} />
                <Route path="/profile" element={<PrivatePage><Profile /></PrivatePage>} />
                <Route path="/patients" element={<PrivatePage><Patients /></PrivatePage>} />
                <Route path="/integrations" element={<PrivatePage><Integrations /></PrivatePage>} />
                <Route path="/find-clinics" element={<PublicOnlyRoute><ClinicFinder /></PublicOnlyRoute>} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/contact" element={<Contact />} />
              </Routes>
            </main>
            <footer className="bg-white border-t border-gray-100 mt-auto py-8">
              <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
                &copy; 2026 DentalLink. Conectando sonrisas.
              </div>
            </footer>
          </div>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
