import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import apiClient from '../api';

function PrivateShell({ children }) {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    if (!user) return undefined;

    const fetchUnreadNotifications = async () => {
      try {
        const response = await apiClient.get('notifications/');
        setUnreadNotifications(response.data.filter((notification) => !notification.is_read).length);
      } catch (error) {
        setUnreadNotifications(0);
      }
    };

    fetchUnreadNotifications();
    const intervalId = setInterval(fetchUnreadNotifications, 10000);
    return () => clearInterval(intervalId);
  }, [user]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navItems = useMemo(() => {
    const baseItems = [
      { to: '/dashboard', label: user?.role === 'lab' ? 'Lab Dashboard' : 'Dashboard', icon: 'dashboard' },
      { to: '/orders', label: 'Orders', icon: 'inventory_2', badge: unreadNotifications > 0 ? unreadNotifications : null },
      { to: '/messages', label: 'Messages', icon: 'chat_bubble' },
      { to: '/patients', label: 'Patients', icon: 'group' },
      { to: '/integrations', label: 'Integrations', icon: 'integration_instructions' },
      { to: '/profile', label: 'Profile', icon: 'account_circle' },
    ];

    if (user?.role === 'clinic') {
      baseItems.splice(2, 0, { to: '/marketplace', label: 'Marketplace', icon: 'storefront' });
    }

    return baseItems;
  }, [unreadNotifications, user?.role]);

  const shellLabel = user?.role === 'lab' ? 'Lab workspace' : 'Clinic workspace';
  const pageTitle = navItems.find((item) => item.to === location.pathname)?.label || shellLabel;

  const NavLinks = ({ mobile = false }) => (
    <div className={mobile ? 'space-y-1' : 'space-y-1'}>
      {navItems.map((item) => {
        const isActive = location.pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={[
              'flex items-center justify-between px-6 py-3 text-sm font-semibold transition',
              mobile
                ? isActive
                  ? 'bg-slate-800 text-cyan-300'
                  : 'text-slate-300'
                : isActive
                  ? 'border-r-4 border-cyan-500 bg-slate-800/50 text-cyan-300'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-white',
            ].join(' ')}
          >
            <span className="flex items-center gap-3">
              <span className={`material-symbols-outlined ${isActive ? 'fill' : ''}`}>{item.icon}</span>
              {item.label}
            </span>
            {item.badge ? (
              <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );

  if (!user) {
    return children;
  }

  return (
    <div className="min-h-screen bg-[#f6f9ff] text-[#151c22]">
      <div className="flex min-h-screen">
        <aside className="fixed left-0 top-0 z-50 hidden h-full w-[240px] border-r border-slate-800 bg-slate-900 lg:flex lg:flex-col">
          <div className="border-b border-slate-800 px-6 py-6">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-cyan-500 text-sm font-black text-slate-900">
                D
              </div>
              <div>
                <p className="text-xl font-bold text-white">DentaLink</p>
                <p className="text-xs text-slate-400">Dental Management</p>
              </div>
            </Link>
          </div>
          <div className="py-4">
            <NavLinks />
          </div>

          <div className="mt-auto border-t border-slate-800 p-4">
            <p className="px-6 text-[11px] uppercase tracking-[0.2em] text-slate-500">{user.role}</p>
            <button
              onClick={logout}
              className="mt-2 w-full px-6 py-3 text-left text-sm font-semibold text-slate-300 hover:bg-slate-800/80 hover:text-white"
            >
              Cerrar sesión
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col lg:ml-[240px]">
          <header className="sticky top-0 z-40 border-b border-slate-200 bg-white px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="relative hidden w-full max-w-md sm:block">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input
                  type="text"
                  placeholder="Buscar pacientes, órdenes..."
                  className="w-full rounded-full border border-[#bcc9ce] bg-[#eef4fd] pl-11 pr-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-cyan-600 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <button className="relative hidden h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 sm:flex">
                  <span className="material-symbols-outlined">notifications</span>
                  {unreadNotifications > 0 ? <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" /> : null}
                </button>
                <button className="hidden h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 sm:flex">
                  <span className="material-symbols-outlined">chat_bubble</span>
                </button>
                <button
                  onClick={() => setMobileOpen((prev) => !prev)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 lg:hidden"
                  aria-label="Abrir menú"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {mobileOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
                <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700 sm:flex">
                  {(user.company_name || user.username || 'DL').slice(0, 2).toUpperCase()}
                </div>
              </div>
            </div>

            {mobileOpen ? (
              <div className="mt-4 rounded-[20px] bg-slate-900 p-3 lg:hidden">
                <NavLinks mobile />
                <button
                  onClick={logout}
                  className="mt-3 w-full rounded-2xl bg-slate-800 px-4 py-3 text-sm font-semibold text-white"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : null}
          </header>

          <main className="flex-1 bg-[#f6f9ff] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#3d494d]">{shellLabel}</p>
              <h1 className="font-manrope text-2xl font-bold text-[#151c22]">{pageTitle}</h1>
            </div>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default PrivateShell;
