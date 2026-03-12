import React from 'react';
import { Link } from 'react-router-dom';

const topSkills = [
  { name: 'Python', category: 'Tecnología', mentors: 8, learners: 12 },
  { name: 'Liderazgo', category: 'Habilidades Blandas', mentors: 10, learners: 15 },
  { name: 'Data Science', category: 'Tecnología', mentors: 6, learners: 10 },
  { name: 'Inglés', category: 'Idiomas', mentors: 12, learners: 20 },
  { name: 'Project Management', category: 'Gestión', mentors: 7, learners: 14 },
  { name: 'React', category: 'Tecnología', mentors: 9, learners: 18 },
];

function Landing() {
  return (
    <div>
      <div className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-32 flex flex-col items-center text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-pulse">
            Conecta tu Talento
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mb-10 leading-relaxed">
            Elimina los silos. Descubre mentores dentro de tu organización y comparte lo que sabes. La red de inteligencia colectiva de tu empresa.
          </p>
          <div className="flex flex-col md:flex-row gap-4">
            <Link to="/signup" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-full font-bold text-lg shadow-lg hover:shadow-blue-500/50 transition transform hover:-translate-y-1">
              Unirse Ahora
            </Link>
            <Link to="/login" className="px-8 py-4 bg-slate-700 hover:bg-slate-600 rounded-full font-bold text-lg shadow-lg transition">
              Ya tengo cuenta
            </Link>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-500 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <section className="py-16 bg-slate-800/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Habilidades Más Demandadas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topSkills.map((skill, index) => (
              <div key={index} className="glass p-6 rounded-xl hover:bg-slate-700/50 transition duration-300 transform hover:scale-105 border border-slate-700 hover:border-blue-500/30 group">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition">
                    {skill.name}
                  </h3>
                  <span className="text-xs font-mono px-2 py-1 rounded bg-slate-700 text-slate-300">
                    {skill.category}
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Mentores disponibles</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${skill.mentors}%` }}></div>
                      </div>
                      <span className="font-bold text-green-400">{skill.mentors}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Interesados</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${skill.learners}%` }}></div>
                      </div>
                      <span className="font-bold text-blue-400">{skill.learners}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <style>
        {`
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          .animate-blob { animation: blob 7s infinite; }
          .animation-delay-2000 { animation-delay: 2s; }
          .animation-delay-4000 { animation-delay: 4s; }
        `}
      </style>
    </div>
  );
}

export default Landing;
