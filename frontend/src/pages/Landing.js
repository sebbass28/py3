import React from 'react';
import { Link } from 'react-router-dom';
import Viewer3D from '../components/Viewer3D';

function Landing() {
  return (
    <div className="bg-white min-h-screen font-sans selection:bg-medical-100 selection:text-medical-600">
      {/* --- HERO SECTION --- */}
      <section className="relative pt-20 pb-20 lg:pt-28 lg:pb-32 overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-medical-50/50 to-transparent -z-10 blur-3xl rounded-full"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-50/50 -z-10 blur-3xl rounded-full"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-medical-50 text-medical-600 rounded-full text-[10px] font-extrabold uppercase tracking-[0.2em] shadow-sm border border-medical-100">
               <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-medical-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-medical-500"></span>
              </span>
              Digitalizando la Odontología 4.0
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-8xl font-extrabold text-gray-900 leading-[0.95] tracking-tighter">
              El nexo de <br/>
              <span className="bg-gradient-to-r from-medical-500 to-cyan-500 bg-clip-text text-transparent">Alta Precisión</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-500 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed italic border-l-4 border-medical-100 pl-6">
              Simplifica la colaboración B2B entre Clínicas Dentales y Laboratorios de Prótesis con tecnología de visor 3D en tiempo real.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/signup" className="px-12 py-5 bg-medical-500 text-white rounded-2xl font-extrabold text-sm uppercase tracking-[0.2em] shadow-2xl shadow-medical-500/30 hover:bg-medical-600 transition transform hover:-translate-y-1">
                Iniciar Proyecto Gratis
              </Link>
              <Link to="/marketplace" className="px-12 py-5 bg-white text-gray-900 border border-gray-100 rounded-2xl font-extrabold text-sm uppercase tracking-[0.2em] shadow-card hover:bg-gray-50 transition">
                Explorar Marketplace
              </Link>
              <Link to="/find-clinics" className="px-12 py-5 bg-white text-medical-700 border border-medical-100 rounded-2xl font-extrabold text-sm uppercase tracking-[0.2em] shadow-card hover:bg-medical-50 transition">
                Buscar Clínica
              </Link>
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-medical-400 to-cyan-400 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative h-[450px] lg:h-[550px] w-full bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-2xl border-2 border-white/10 ring-8 ring-gray-50 flex items-center justify-center">
               <Viewer3D stlUrl="/static/models/Crown.stl" />
               <div className="absolute bottom-8 left-8 right-8 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-between pointer-events-none">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-white text-[10px] font-bold uppercase tracking-widest">Visor STL Activo</span>
                  </div>
                  <span className="text-white/50 text-[10px] uppercase font-bold">12k Polígonos</span>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS SECTION --- */}
      <section id="how-it-works" className="py-24 lg:py-32 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 text-center mb-16 space-y-4">
          <h2 className="text-medical-500 font-extrabold uppercase tracking-[0.3em] text-xs italic">Cómo funciona</h2>
          <h3 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tighter">Flujo simple en 3 pasos</h3>
        </div>
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '01', title: 'La clínica crea el caso', text: 'Selecciona producto, paciente y sube STL con indicaciones clínicas.' },
            { step: '02', title: 'El laboratorio diseña', text: 'Sube propuesta digital, conversa por chat y actualiza estados de fabricación.' },
            { step: '03', title: 'Validación y entrega', text: 'La clínica aprueba, se emite factura y todo queda trazado en timeline.' },
          ].map((item) => (
            <div key={item.step} className="bg-white rounded-3xl border border-gray-100 p-8 shadow-card text-left">
              <p className="text-xs font-extrabold text-medical-500 uppercase tracking-widest">{item.step}</p>
              <h4 className="mt-3 text-xl font-extrabold text-gray-900 tracking-tight">{item.title}</h4>
              <p className="mt-3 text-sm text-gray-500 font-medium italic">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className="py-12 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Clínicas', val: '500+' },
            { label: 'Laboratorios', val: '120+' },
            { label: 'Casos 3D', val: '15k+' },
            { label: 'Ahorro Tiempo', val: '40%' }
          ].map((stat, i) => (
            <div key={i} className="text-center group">
              <div className="text-3xl font-extrabold text-gray-900 tracking-tighter group-hover:text-medical-500 transition-colors uppercase">{stat.val}</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section id="features" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 text-center mb-20 space-y-4">
            <h2 className="text-medical-500 font-extrabold uppercase tracking-[0.3em] text-xs italic">Valor Añadido</h2>
            <h3 className="text-4xl lg:text-6xl font-extrabold text-gray-900 tracking-tighter">Eficiencia en cada pieza dental</h3>
        </div>

        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              title: 'Visor 3D Universal', 
              desc: 'Visualización de archivos STL nativa en el navegador. Sin software externo.', 
              icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9',
              color: 'medical'
            },
            { 
              title: 'Facturación Inmutable', 
              desc: 'Snapshot legal automático con cada pedido. Documentos PDF listos para Hacienda.', 
              icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
              color: 'cyan'
            },
            { 
              title: 'Trazabilidad Física', 
              desc: 'Etiquetas QR automáticas para el seguimiento físico de la caja en el transporte.', 
              icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z',
              color: 'purple'
            }
          ].map((f, i) => (
            <div key={i} className="bg-white p-10 rounded-3xl border border-gray-100 shadow-card hover:shadow-2xl hover:border-medical-500/20 transition-all duration-500 group">
              <div className={`w-16 h-16 rounded-2xl bg-${f.color}-50 text-${f.color}-600 flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition duration-500`}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={f.icon}></path></svg>
              </div>
              <h4 className="text-xl font-extrabold text-gray-900 mb-4 tracking-tight uppercase">{f.title}</h4>
              <p className="text-gray-500 leading-relaxed font-bold italic text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- CALL TO ACTION --- */}
      <section className="py-20 lg:py-32 px-4">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-medical-600 to-cyan-600 rounded-[3rem] p-12 lg:p-24 text-center text-white relative overflow-hidden shadow-3xl">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
           <div className="relative z-10 space-y-8">
             <h2 className="text-4xl lg:text-7xl font-extrabold tracking-tighter leading-none">¿Listo para conectar <br className="hidden md:block"/> tu flujo de trabajo?</h2>
             <p className="text-medical-50 text-xl font-medium max-w-2xl mx-auto italic">Únete a la plataforma que está redefiniendo la prótesis dental digital en España.</p>
             <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup" className="px-12 py-5 bg-white text-medical-600 rounded-2xl font-extrabold text-sm uppercase tracking-widest shadow-xl hover:bg-gray-50 transition">Crear Cuenta Gratis</Link>
                <Link to="/login" className="px-12 py-5 bg-medical-700 text-white rounded-2xl font-extrabold text-sm uppercase tracking-widest shadow-xl hover:bg-medical-800 transition">Iniciar Sesión</Link>
             </div>
           </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 border-t border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-medical-500 rounded-md text-white font-bold flex items-center justify-center text-[10px]">D</div>
            <span className="text-lg font-extrabold text-gray-900 tracking-tighter italic">DentalLinkLab</span>
          </div>
          <div className="flex gap-12">
            <Link to="/privacy" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600">Privacidad</Link>
            <Link to="/terms" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600">Términos</Link>
            <Link to="/contact" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600">Contacto</Link>
          </div>
          <div className="text-[10px] font-extrabold text-gray-900 uppercase tracking-widest italic">
            © 2026 DentalLinkLab
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
