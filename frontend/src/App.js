import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

// Placeholder components for pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Network from './pages/Network';

import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

import Landing from './pages/Landing';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Network from './pages/Network';
import AuthContext from './context/AuthContext';

function Layout({ children }) {
  const { user, logout } = useContext(AuthContext);
  const [dropdown, setDropdown] = useState(false);

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen flex flex-col antialiased">
      <nav className="bg-slate-800/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-700">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 hover:opacity-80 transition">
            Talento360
          </Link>
          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <Link to="/dashboard" className="text-slate-300 hover:text-white transition font-medium">Dashboard</Link>
                <Link to="/network" className="text-slate-300 hover:text-white transition font-medium">Red de Talento</Link>
                <div className="relative">
                  <button onClick={() => setDropdown(!dropdown)} className="flex items-center gap-2 hover:text-white transition focus:outline-none">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center font-bold text-sm">
                      {user.username.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">{user.username}</span>
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                  {dropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-2 z-50">
                      <Link to="/profile" onClick={() => setDropdown(false)} className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white">Mi Perfil</Link>
                      <div className="border-t border-slate-700 my-1"></div>
                      <button onClick={() => { logout(); setDropdown(false); }} className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 hover:text-red-300">
                        Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-300 hover:text-white transition font-medium">Iniciar Sesión</Link>
                <Link to="/signup" className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium rounded-full shadow-lg hover:shadow-blue-500/25 transition transform hover:-translate-y-0.5">
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-slate-800 border-t border-slate-700 py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm mb-4">
            &copy; {new Date().getFullYear()} Talento360. Conectando el conocimiento interno.
          </p>
        </div>
      </footer>
    </div>
  );
}


function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/network" element={<Network />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
