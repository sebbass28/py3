import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import apiClient from '../../api';

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('dashboard-data/')
      .then(response => {
        setDashboardData(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      });
  }, []);

  if (loading || !user) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar / Stats */}
      <div className="lg:col-span-1 space-y-6">
        {/* User Card */}
        <div className="glass p-6 rounded-xl border border-slate-700">
          <div className="flex flex-col items-center">
            {user.profile?.avatar ? (
              <img
                src={user.profile.avatar.url}
                className="w-24 h-24 rounded-full border-4 border-blue-500 mb-4 shadow-lg object-cover"
                alt="Avatar"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold mb-4 shadow-lg border-4 border-slate-700">
                {user.username.slice(0, 2).toUpperCase()}
              </div>
            )}
            <h2 className="text-xl font-bold">{user.username}</h2>
            <p className="text-slate-400 text-sm">
              {user.profile?.position || 'Sin cargo definido'}
            </p>
            <p className="text-slate-500 text-xs uppercase tracking-widest mt-1">
              {user.profile?.department || 'Departamento'}
            </p>
            <Link to="/profile" className="mt-4 px-4 py-2 text-sm border border-slate-600 rounded-full hover:bg-slate-700 transition">
              Editar Perfil
            </Link>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-700 grid grid-cols-2 gap-4 text-center">
            <div>
              <span className="block text-2xl font-bold text-blue-400">
                {dashboardData?.my_skills_count}
              </span>
              <span className="text-xs text-slate-500">Habilidades</span>
            </div>
            <div>
              <span className="block text-2xl font-bold text-purple-400">
                {dashboardData?.received_requests.length}
              </span>
              <span className="text-xs text-slate-500">Solicitudes</span>
            </div>
          </div>
        </div>

        {/* Matching Stats */}
        <div className="glass p-6 rounded-xl border border-slate-700">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
            Oportunidades
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
              <span className="text-sm text-slate-300">Quieren aprender de ti</span>
              <span className="font-bold text-green-400">{dashboardData?.learners_count}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
              <span className="text-sm text-slate-300">Pueden enseñarte</span>
              <span className="font-bold text-blue-400">{dashboardData?.mentors_count}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-3 space-y-8">
        {/* Smart Matches */}
        <div>
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-2xl font-bold">Tus Mentores Recomendados</h2>
              <p className="text-slate-400">
                Basado en las habilidades que quieres aprender
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dashboardData?.suggested_mentors.length === 0 ? (
              <div className="col-span-2 text-center py-12 border border-dashed border-slate-700 rounded-xl">
                <p className="text-slate-500 text-lg mb-4">
                  Aún no encontramos coincidencias perfectas.
                </p>
                <Link to="/profile" className="text-blue-400 hover:underline">
                  Actualiza tus intereses
                </Link> para mejorar las recomendaciones.
              </div>
            ) : (
              dashboardData?.suggested_mentors.map(match => (
                <div key={match.profile.id} className="glass p-6 rounded-xl border border-slate-700 hover:border-blue-500/50 transition duration-300 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-50">
                    <span className="text-6xl font-bold text-slate-800 group-hover:text-blue-900/20 transition">
                      %{match.score}0
                    </span>
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      {match.profile.avatar ? (
                        <img
                          src={match.profile.avatar}
                          className="w-14 h-14 rounded-full object-cover border-2 border-slate-600"
                          alt="Avatar"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center font-bold text-lg">
                          {match.profile.user.username.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-lg">
                          {match.profile.user.username}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {match.profile.position}
                        </p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-slate-400 mb-2">Puede enseñarte:</p>
                      <div className="flex flex-wrap gap-2">
                        {match.skills.map(skill => (
                          <span key={skill.id} className="px-2 py-1 bg-green-900/30 text-green-400 border border-green-700/30 rounded text-xs font-mono">
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button className="w-full py-2 bg-slate-700 hover:bg-blue-600 rounded-lg transition font-medium text-sm flex items-center justify-center gap-2 group-hover:bg-blue-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                      </svg>
                      Solicitar Mentoría
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
