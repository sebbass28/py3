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
      { to: '/dashboard', label: user?.role === 'lab' ? 'Lab Dashboard' : 'Dashboard' },
      { to: '/orders', label: 'Orders', badge: unreadNotifications > 0 ? unreadNotifications : null },
      { to: '/patients', label: 'Patients' },
      { to: '/integrations', label: 'Integrations' },
      { to: '/profile', label: 'Profile' },
    ];

    if (user?.role === 'clinic') {
      baseItems.splice(2, 0, { to: '/marketplace', label: 'Marketplace' });
    }

    return baseItems;
  }, [unreadNotifications, user?.role]);

  const shellLabel = user?.role === 'lab' ? 'Lab workspace' : 'Clinic workspace';

  const NavLinks = ({ mobile = false }) => (
    <div className={mobile ? 'space-y-2' : 'space-y-1'}>
      {navItems.map((item) => {
        const isActive = location.pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={[
              'flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition',
              mobile
                ? isActive
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600'
                : isActive
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-500 hover:bg-white/70 hover:text-slate-900',
            ].join(' ')}
          >
            <span>{item.label}</span>
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
    <div className="min-h-screen bg-[#f4f7fb] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-[#eef2f7] px-6 py-8 lg:flex lg:flex-col">
          <Link to="/dashboard" className="text-2xl font-black tracking-tight text-slate-950">
            DentalLink
          </Link>
          <p className="mt-2 text-sm text-slate-500">{shellLabel}</p>

          <div className="mt-8">
            <NavLinks />
          </div>

          <div className="mt-auto rounded-[28px] bg-slate-950 p-5 text-white">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{user.role}</p>
            <p className="mt-2 text-lg font-bold">{user.company_name || user.username}</p>
            <p className="mt-1 text-sm text-slate-300">{user.email || 'Cuenta activa'}</p>
            <button
              onClick={logout}
              className="mt-5 w-full rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Cerrar sesión
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white/80 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Private area</p>
                <p className="text-lg font-bold text-slate-950">{shellLabel}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-2 text-right sm:block">
                  <p className="text-sm font-semibold text-slate-900">{user.company_name || user.username}</p>
                  <p className="text-xs text-slate-500">{unreadNotifications} alerts</p>
                </div>
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
              </div>
            </div>

            {mobileOpen ? (
              <div className="mt-4 rounded-[28px] bg-[#eef2f7] p-4 lg:hidden">
                <NavLinks mobile />
                <button
                  onClick={logout}
                  className="mt-3 w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : null}
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

export default PrivateShell;
