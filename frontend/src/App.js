import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import AuthContext, { AuthProvider } from './context/AuthContext';
import Landing from './pages/Landing';
import Marketplace from './pages/Marketplace';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

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
            <Link to="/" className={`${isActive('/') ? 'text-medical-600 border-b-2 border-medical-600' : 'text-gray-500 hover:text-medical-600'} px-1 py-2 text-sm font-medium transition`}>
              Inicio
            </Link>
            <Link to="/marketplace" className={`${isActive('/marketplace') ? 'text-medical-600 border-b-2 border-medical-600' : 'text-gray-500 hover:text-medical-600'} px-1 py-2 text-sm font-medium transition`}>
              Marketplace
            </Link>
            
            {user ? (
              <>
                <Link to="/dashboard" className={`${isActive('/dashboard') ? 'text-medical-600 border-b-2 border-medical-600' : 'text-gray-500 hover:text-medical-600'} px-1 py-2 text-sm font-medium transition`}>
                  Dashboard
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
                <Link to="/login" className="text-gray-500 hover:text-medical-600 px-3 py-2 rounded-md text-sm font-medium transition font-bold tracking-tight">
                  Iniciar Sesión
                </Link>
                <Link to="/signup" className="bg-medical-500 hover:bg-medical-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition shadow-sm">
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>
          <footer className="bg-white border-t border-gray-100 mt-auto py-8">
            <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
              &copy; 2026 DentalLink. Conectando sonrisas.
            </div>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
