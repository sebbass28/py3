import React, { useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
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
import apiClient from './api';
import { ToastProvider } from './context/ToastContext';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  // Badge global de notificaciones no leídas para visibilidad en toda la app.
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const isActive = (path) => location.pathname === path;
  const isLanding = location.pathname === '/';

  useEffect(() => {
    if (!user) {
      setUnreadNotifications(0);
      return undefined;
    }

    const fetchUnreadNotifications = async () => {
      try {
        const response = await apiClient.get('notifications/');
        const unread = response.data.filter((notification) => !notification.is_read).length;
        setUnreadNotifications(unread);
      } catch (error) {
        setUnreadNotifications(0);
      }
    };

    fetchUnreadNotifications();
    const intervalId = setInterval(fetchUnreadNotifications, 10000);
    return () => clearInterval(intervalId);
  }, [user]);

  return (
    <nav className="bg-white sticky top-0 z-50 shadow-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold text-medical-600">
              DentalLink
            </Link>
          </div>

          {/* Nav Links (Desktop) */}
          <div className="hidden sm:flex sm:items-center sm:ml-6 space-x-8">
            {!user && (
              <>
                <Link to="/" className={`${isActive('/') ? 'text-medical-600 border-b-2 border-medical-600' : 'text-gray-500 hover:text-medical-600'} px-1 py-2 text-sm font-medium transition`}>
                  Inicio
                </Link>
                {isLanding && (
                  <>
                    <a href="#features" className="text-gray-500 hover:text-medical-600 px-1 py-2 text-sm font-medium transition">
                      Características
                    </a>
                    <a href="#how-it-works" className="text-gray-500 hover:text-medical-600 px-1 py-2 text-sm font-medium transition">
                      Cómo funciona
                    </a>
                  </>
                )}
                <Link to="/find-clinics" className={`${isActive('/find-clinics') ? 'text-medical-600 border-b-2 border-medical-600' : 'text-gray-500 hover:text-medical-600'} px-1 py-2 text-sm font-medium transition`}>
                  Buscar clínica
                </Link>
              </>
            )}
            {user && (
              <>
                <Link to="/patients" className={`${isActive('/patients') ? 'text-medical-600 border-b-2 border-medical-600' : 'text-gray-500 hover:text-medical-600'} px-1 py-2 text-sm font-medium transition`}>
                  Pacientes
                </Link>
                <Link to="/integrations" className={`${isActive('/integrations') ? 'text-medical-600 border-b-2 border-medical-600' : 'text-gray-500 hover:text-medical-600'} px-1 py-2 text-sm font-medium transition`}>
                  Integraciones
                </Link>
              </>
            )}
            
            {user ? (
              <>
                <Link to="/dashboard" className={`${isActive('/dashboard') ? 'text-medical-600 border-b-2 border-medical-600' : 'text-gray-500 hover:text-medical-600'} px-1 py-2 text-sm font-medium transition relative`}>
                  Dashboard
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-4 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                      {unreadNotifications > 99 ? '99+' : unreadNotifications}
                    </span>
                  )}
                </Link>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">{user.username}</span>
                  <button onClick={logout} className="flex items-center gap-1 text-gray-500 hover:text-red-600 transition text-sm font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/></svg>
                    Salir
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-500 hover:text-medical-600 px-3 py-2 rounded-md text-sm font-bold transition tracking-tight">
                  Iniciar Sesión
                </Link>
                <Link to="/signup" className="bg-medical-500 hover:bg-medical-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition shadow-sm">
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Menú móvil */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              className="p-2 rounded-md text-gray-500 hover:text-medical-600 hover:bg-gray-50 transition"
              aria-label="Abrir menú"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="sm:hidden pb-4 border-t border-gray-100">
            <div className="pt-3 space-y-1">
              {!user && (
                <>
                  <Link to="/" onClick={() => setIsOpen(false)} className="block px-2 py-2 text-sm font-medium text-gray-700 hover:text-medical-600">
                    Inicio
                  </Link>
                  {isLanding && (
                    <>
                      <a href="#features" onClick={() => setIsOpen(false)} className="block px-2 py-2 text-sm font-medium text-gray-700 hover:text-medical-600">
                        Características
                      </a>
                      <a href="#how-it-works" onClick={() => setIsOpen(false)} className="block px-2 py-2 text-sm font-medium text-gray-700 hover:text-medical-600">
                        Cómo funciona
                      </a>
                    </>
                  )}
                </>
              )}
              {user ? (
                <>
                  <Link to="/marketplace" onClick={() => setIsOpen(false)} className="block px-2 py-2 text-sm font-medium text-gray-700 hover:text-medical-600">
                    Marketplace
                  </Link>
                  <Link to="/patients" onClick={() => setIsOpen(false)} className="block px-2 py-2 text-sm font-medium text-gray-700 hover:text-medical-600">
                    Pacientes
                  </Link>
                  <Link to="/integrations" onClick={() => setIsOpen(false)} className="block px-2 py-2 text-sm font-medium text-gray-700 hover:text-medical-600">
                    Integraciones
                  </Link>
                  <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block px-2 py-2 text-sm font-medium text-gray-700 hover:text-medical-600">
                    Dashboard
                  </Link>
                  <button onClick={() => { logout(); setIsOpen(false); }} className="block w-full text-left px-2 py-2 text-sm font-medium text-gray-700 hover:text-red-600">
                    Salir
                  </button>
                </>
              ) : (
                <>
                  <Link to="/find-clinics" onClick={() => setIsOpen(false)} className="block px-2 py-2 text-sm font-medium text-gray-700 hover:text-medical-600">
                    Buscar clínica
                  </Link>
                  <Link to="/login" onClick={() => setIsOpen(false)} className="block px-2 py-2 text-sm font-medium text-gray-700 hover:text-medical-600">
                    Iniciar sesión
                  </Link>
                  <Link to="/signup" onClick={() => setIsOpen(false)} className="block px-2 py-2 text-sm font-medium text-gray-700 hover:text-medical-600">
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

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

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<PublicOnlyRoute><Landing /></PublicOnlyRoute>} />
                <Route path="/marketplace" element={<PrivateRoute><Marketplace /></PrivateRoute>} />
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
                <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
                <Route path="/reset-password" element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>} />
                <Route path="/signup" element={<PublicOnlyRoute><SignUp /></PublicOnlyRoute>} />
                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                <Route path="/patients" element={<PrivateRoute><Patients /></PrivateRoute>} />
                <Route path="/integrations" element={<PrivateRoute><Integrations /></PrivateRoute>} />
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
