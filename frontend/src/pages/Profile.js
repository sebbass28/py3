import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import apiClient from '../../api';

function Profile() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [allSkills, setAllSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get('profiles/me/'),
      apiClient.get('skills/')
    ]).then(([profileResponse, skillsResponse]) => {
      setProfile(profileResponse.data);
      setAllSkills(skillsResponse.data);
      setLoading(false);
    }).catch(error => {
      console.error('Error fetching profile data:', error);
      setLoading(false);
    });
  }, []);

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data.skills_offered = formData.getAll('skills_offered');
    data.skills_wanted = formData.getAll('skills_wanted');

    apiClient.put('profiles/me/', data)
      .then(response => {
        setProfile(response.data);
        alert('Perfil actualizado correctamente!');
      })
      .catch(error => {
        console.error('Error updating profile:', error);
        alert('Error al actualizar el perfil.');
      });
  };

  if (loading || !profile) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="glass p-8 rounded-xl border border-slate-700">
        <h2 className="text-3xl font-bold mb-6">Editar Tu Perfil</h2>
        <form onSubmit={handleProfileUpdate} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold border-b border-slate-700 pb-2">
                Información Profesional
              </h3>
              <div>
                <label className="block text-slate-400 mb-1">
                  Departamento
                </label>
                <input
                  type="text"
                  name="department"
                  defaultValue={profile.department}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">
                  Cargo / Rol
                </label>
                <input
                  type="text"
                  name="position"
                  defaultValue={profile.position}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">
                  Biografía Corta
                </label>
                <textarea
                  name="bio"
                  rows="4"
                  defaultValue={profile.bio}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>
            </div>
            {/* Skills */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold border-b border-slate-700 pb-2">
                Tus Habilidades
              </h3>
              <div>
                <label className="block text-slate-400 mb-1">
                  ¿Qué puedes enseñar? (Skills Offered)
                </label>
                <select
                  name="skills_offered"
                  multiple
                  defaultValue={profile.skills_offered.map(s => s.id)}
                  className="w-full h-40 bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  {allSkills.map(skill => (
                    <option key={skill.id} value={skill.id}>
                      {skill.name} ({skill.category})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Mantén presionado Ctrl (Windows) o Cmd (Mac) para seleccionar varias.
                </p>
              </div>
              <div className="mt-4">
                <label className="block text-slate-400 mb-1">
                  ¿Qué quieres aprender? (Skills Wanted)
                </label>
                <select
                  name="skills_wanted"
                  multiple
                  defaultValue={profile.skills_wanted.map(s => s.id)}
                  className="w-full h-40 bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  {allSkills.map(skill => (
                    <option key={skill.id} value={skill.id}>
                      {skill.name} ({skill.category})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Selecciona las habilidades que te interesa desarrollar.
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-6 border-t border-slate-700">
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-full font-bold shadow-lg transition transform hover:-translate-y-0.5"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;
