import React from 'react';
import { Link } from 'react-router-dom';
import Viewer3D from '../components/Viewer3D';

function Landing() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-20 lg:pt-20 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="z-10">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-6">
              La conexión vital entre <br />
              <span className="text-medical-500">Clínicas y Laboratorios</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-xl mb-10 leading-relaxed">
              DentalLink unifica el flujo de trabajo de prótesis dentales. 
              Gestiona pedidos, compara precios y optimiza la comunicación en una 
              sola plataforma segura y moderna.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/signup" className="px-10 py-4 bg-medical-500 hover:bg-medical-600 text-white rounded-lg font-bold text-lg shadow-sm transition transform hover:-translate-y-0.5 text-center">
                Empezar ahora
              </Link>
              <Link to="/marketplace" className="px-10 py-4 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 rounded-lg font-bold text-lg shadow-sm transition text-center">
                Ver Marketplace
              </Link>
            </div>
          </div>
          
          <div className="relative">
            <div className="h-[500px] w-full">
              <Viewer3D stlUrl="/static/models/Crown.stl" />
            </div>
          </div>
        </div>
      </section>

      {/* Innovation Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <h2 className="text-medical-500 font-bold uppercase tracking-widest text-sm mb-4 italic">INNOVACIÓN</h2>
          <h3 className="text-3xl lg:text-5xl font-extrabold text-gray-900 mb-6">Todo lo que necesitas en un solo lugar</h3>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto italic font-medium">
            Olvídate de los cartones y papeles perdidos. Digitaliza tu flujo de trabajo hoy mismo.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1 */}
          <div className="bg-white p-10 rounded-2xl shadow-card border border-gray-100 flex items-start gap-6 group hover:border-medical-500 transition-all">
            <div className="w-14 h-14 rounded-xl bg-medical-50 text-medical-600 flex items-center justify-center flex-shrink-0 group-hover:bg-medical-500 group-hover:text-white transition shadow-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Base de Datos Global</h4>
              <p className="text-gray-500 leading-relaxed text-sm font-medium">
                Accede a un directorio unificado de prótesis y componentes de casas comerciales de todo el mundo.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-10 rounded-2xl shadow-card border border-gray-100 flex items-start gap-6 group hover:border-medical-500 transition-all">
            <div className="w-14 h-14 rounded-xl bg-medical-50 text-medical-600 flex items-center justify-center flex-shrink-0 group-hover:bg-medical-500 group-hover:text-white transition shadow-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path></svg>
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Comparador de Precios</h4>
              <p className="text-gray-500 leading-relaxed text-sm font-medium">
                Encuentra la mejor oferta para tus materiales sin tener que llamar a diez proveedores distintos.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Landing;
