import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../../api';

function Network() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  useEffect(() => {
    setLoading(true);
    apiClient.get('profiles/', { params: { search: query } })
      .then(response => {
        setProfiles(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching profiles:', error);
        setLoading(false);
      });
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setSearchParams({ q: formData.get('q') });
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header / Search */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-slate-800/50 p-6 rounded-xl border border-slate-700">
        <div>
          <h1 className="text-3xl font-bold mb-2">Red de Talento</h1>
          <p className="text-slate-400">Descubre compañeros con habilidades únicas.</p>
        </div>
        <form onSubmit={handleSearch} className="w-full md:w-auto mt-4 md:mt-0 flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Buscar por nombre, habilidad..."
            className="bg-slate-900 border border-slate-600 rounded-full px-4 py-2 text-white focus:outline-none focus:border-blue-500 w-full md:w-64"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-6 py-2 transition font-medium"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map(profile => (
          <div key={profile.id} className="glass p-6 rounded-xl border border-slate-700 hover:border-slate-500 transition group">
            <div className="flex items-center gap-4 mb-4">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  className="w-16 h-16 rounded-full object-cover"
                  alt="Avatar"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center font-bold text-xl">
                  {profile.user.username.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="font-bold text-lg group-hover:text-blue-400 transition">
                  {profile.user.username}
                </h3>
                <p className="text-xs text-slate-400 uppercase tracking-wide">
                  {profile.position}
                </p>
              </div>
            </div>
            <p className="text-slate-300 text-sm mb-4 line-clamp-2 h-10">
              {profile.bio || 'Sin biografía'}
            </p>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-slate-500 block mb-1">Ofrece:</span>
                <div className="flex flex-wrap gap-1">
                  {profile.skills_offered.slice(0, 3).map(skill => (
                    <span key={skill.id} className="px-2 py-0.5 bg-blue-900/30 text-blue-300 rounded text-xs border border-blue-800/30">
                      {skill.name}
                    </span>
                  ))}
                  {profile.skills_offered.length === 0 && (
                    <span className="text-slate-600 text-xs italic">Nada definido</span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-500 block mb-1">Busca:</span>
                <div className="flex flex-wrap gap-1">
                  {profile.skills_wanted.slice(0, 3).map(skill => (
                    <span key={skill.id} className="px-2 py-0.5 bg-purple-900/30 text-purple-300 rounded text-xs border border-purple-800/30">
                      {skill.name}
                    </span>
                  ))}
                  {profile.skills_wanted.length === 0 && (
                    <span className="text-slate-600 text-xs italic">Nada definido</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Network;
