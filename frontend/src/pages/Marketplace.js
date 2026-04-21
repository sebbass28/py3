import React, { useState, useEffect, useContext } from 'react';
import apiClient from '../api';
import AuthContext from '../context/AuthContext';

// --- COMPONENTE MARKETPLACE: CATÁLOGO DE SERVICIOS DENTALES ---
function Marketplace() {
  // 1. Estados Globales y Locales
  const { user } = useContext(AuthContext); // Usuario para saber si es Clínica (comprador)
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // 2. Estado para el Modal de "Nuevo Pedido" (El formulario dinámico)
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [patients, setPatients] = useState([]);
  const [orderDetails, setOrderDetails] = useState({
    patient_id: '',
    teeth_numbers: '',
    shade: '',
    notes: '',
    scan_url: '',
  });
  const [selectedImage, setSelectedImage] = useState(null); // Estado para la foto clínica
  // Estado para crear pacientes desde el front sin salir del flujo de pedido.
  const [newPatient, setNewPatient] = useState({
    first_name: '',
    last_name: '',
    birth_date: '',
    gender: '',
    external_id: '',
  });
  const [creatingPatient, setCreatingPatient] = useState(false);

  // 3. EFECTO INICIAL: Cargamos catálogos y pacientes al entrar
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ejecutamos varias peticiones en paralelo para mayor velocidad
        const [prodRes] = await Promise.all([
          apiClient.get('products/'),
        ]);
        setProducts(prodRes.data);

        // Si el usuario es una CLÍNICA, cargamos su lista de pacientes para el selector
        if (user?.role === 'clinic') {
          const patRes = await apiClient.get('patients/');
          setPatients(patRes.data);
        }
      } catch (err) {
        console.error("Error al cargar datos del marketplace", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // 4. BÚSQUEDA REACTIVA: Filtramos por nombre o material en tiempo real
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.material?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 5. ENVÍO DE PEDIDO: Conectamos el Frontend con el Backend (POST)
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        lab: selectedProduct.lab.id,
        product: selectedProduct.id,
        patient: orderDetails.patient_id,
        teeth_numbers: orderDetails.teeth_numbers,
        shade: orderDetails.shade,
        notes: orderDetails.notes,
        scan_url: orderDetails.scan_url,
      };
      
      // Paso A: Creamos el pedido base
      const orderResponse = await apiClient.post('orders/', payload);
      const newOrderId = orderResponse.data.id;

      // Paso B: Si hay una imagen seleccionada, la subimos vinculada al pedido
      if (selectedImage) {
        const formData = new FormData();
        formData.append('order', newOrderId);
        formData.append('image', selectedImage);
        formData.append('description', 'Foto clínica inicial');

        await apiClient.post('order-images/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      alert("¡Pedido y fotos enviados con éxito!");
      setSelectedProduct(null); // Cerramos el modal
      setSelectedImage(null);   // Limpiamos la imagen
    } catch (err) {
      console.error("Error al enviar el pedido", err);
      alert("Error al enviar el pedido. Verifica los datos requeridos.");
    }
  };

  // 6. CREACIÓN RÁPIDA DE PACIENTE: Cubre la lógica backend de pacientes desde el frontend.
  const handleCreatePatient = async (e) => {
    e.preventDefault();
    try {
      setCreatingPatient(true);
      const payload = {
        first_name: newPatient.first_name.trim(),
        last_name: newPatient.last_name.trim(),
        birth_date: newPatient.birth_date || null,
        gender: newPatient.gender || '',
        external_id: newPatient.external_id.trim(),
      };

      const response = await apiClient.post('patients/', payload);
      const createdPatient = response.data;

      // Actualizamos selector de pacientes y dejamos el nuevo ya seleccionado.
      setPatients((prev) => [...prev, createdPatient]);
      setOrderDetails((prev) => ({ ...prev, patient_id: createdPatient.id }));

      // Reseteamos formulario secundario de paciente.
      setNewPatient({
        first_name: '',
        last_name: '',
        birth_date: '',
        gender: '',
        external_id: '',
      });
      alert("Paciente creado correctamente.");
    } catch (err) {
      console.error("Error al crear paciente", err);
      alert("No se pudo crear el paciente.");
    } finally {
      setCreatingPatient(false);
    }
  };

  // 7. SPINNER: UX profesional mientras cargan los datos
  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-500"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* SECCIÓN 1: BUSCADOR Y CABECERA */}
      <header className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
        <div className="text-left w-full">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">Marketplace</h1>
            <p className="text-gray-500 font-medium italic">Encuentra el laboratorio perfecto para tus casos clínicos.</p>
        </div>
        <div className="relative w-full max-w-md">
          <input 
            type="text" 
            placeholder="Buscar material o tratamiento..." 
            className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-medical-500/20 shadow-sm font-medium pr-12 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="absolute right-5 top-4.5 w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"/></svg>
        </div>
      </header>

      {/* SECCIÓN 2: CUADRÍCULA DE PRODUCTOS (CATÁLOGOS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredProducts.map(product => (
          <div key={product.id} className="group relative bg-white rounded-3xl border border-gray-100 shadow-card hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col h-full">
            {/* Imagen Mockup del Servicio */}
            <div className="relative h-56 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition duration-500 bg-medical-500"></div>
                <svg className="h-20 w-20 text-gray-200 group-hover:text-medical-200 transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/></svg>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-gray-900 uppercase tracking-widest shadow-sm">
                    {product.material || 'Premium'}
                </div>
            </div>
            
            <div className="p-8 flex flex-col flex-grow">
              <div className="mb-6">
                <h3 className="text-xl font-extrabold text-gray-900 mb-2 leading-tight group-hover:text-medical-600 transition tracking-tighter">
                  {product.name}
                </h3>
                <p className="inline-flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
                   <span className="w-1.5 h-1.5 rounded-full bg-medical-500"></span>
                   {product.lab?.company_name || 'Laboratorio Asociado'}
                </p>
              </div>

              <div className="mt-auto space-y-6">
                <div className="flex justify-between items-end border-t border-gray-50 pt-6">
                   <div>
                      <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Precio</span>
                      <span className="text-2xl font-black text-gray-900">€{parseFloat(product.price).toFixed(2)}</span>
                   </div>
                   <div className="text-right">
                      <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Entrega</span>
                      <span className="text-xs font-extrabold text-medical-600">{product.delivery_days} d. laborables</span>
                   </div>
                </div>

                {/* ACCIÓN: Solo las clínicas pueden comprar. Los labs solo previsualizan. */}
                {user?.role === 'clinic' ? (
                  <button 
                    onClick={() => setSelectedProduct(product)}
                    className="w-full py-4 bg-gray-900 hover:bg-medical-500 text-white rounded-2xl transition-all duration-300 font-bold text-sm uppercase tracking-widest shadow-lg hover:shadow-medical-500/30"
                  >
                    Nuevo Pedido
                  </button>
                ) : (
                   <div className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl text-center font-bold text-xs uppercase tracking-widest border border-gray-100 italic">
                      Modo Escaparate
                   </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SECCIÓN 3: MODAL DE CONFIGURACIÓN DE CASO (LA PASARELA DE DATOS) */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
            <div className="p-10">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Detalles del Caso</h2>
                        <p className="text-gray-400 font-medium italic mt-1">Configurando: {selectedProduct.name}</p>
                    </div>
                    <button onClick={() => setSelectedProduct(null)} className="p-3 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-2xl transition-all">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"/></svg>
                    </button>
                </div>

                <form onSubmit={handlePlaceOrder} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 1. Selector de Paciente: Resuelve la vinculación clínica-médica */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ficha del Paciente</label>
                            <select 
                                required
                                className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-medical-500/20"
                                value={orderDetails.patient_id}
                                onChange={(e) => setOrderDetails({...orderDetails, patient_id: e.target.value})}
                            >
                                <option value="">Seleccionar paciente...</option>
                                {patients.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
                            </select>
                        </div>

                        {/* 1.1 Alta rápida de paciente: conecta con /patients/ sin cambiar de vista */}
                        <div className="md:col-span-2 bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-3">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            Alta rápida de paciente (si no existe)
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="Nombre"
                              value={newPatient.first_name}
                              onChange={(e) => setNewPatient({ ...newPatient, first_name: e.target.value })}
                              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold"
                            />
                            <input
                              type="text"
                              placeholder="Apellidos"
                              value={newPatient.last_name}
                              onChange={(e) => setNewPatient({ ...newPatient, last_name: e.target.value })}
                              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold"
                            />
                            <input
                              type="date"
                              value={newPatient.birth_date}
                              onChange={(e) => setNewPatient({ ...newPatient, birth_date: e.target.value })}
                              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold"
                            />
                            <select
                              value={newPatient.gender}
                              onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold"
                            >
                              <option value="">Género (opcional)</option>
                              <option value="M">Masculino</option>
                              <option value="F">Femenino</option>
                              <option value="O">Otro</option>
                            </select>
                            <input
                              type="text"
                              placeholder="ID Externo de clínica"
                              value={newPatient.external_id}
                              onChange={(e) => setNewPatient({ ...newPatient, external_id: e.target.value })}
                              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold md:col-span-2"
                            />
                          </div>
                          <button
                            type="button"
                            disabled={creatingPatient || !newPatient.first_name.trim() || !newPatient.last_name.trim()}
                            onClick={handleCreatePatient}
                            className="w-full md:w-auto px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-gray-900 text-white disabled:bg-gray-200 disabled:text-gray-400 transition"
                          >
                            {creatingPatient ? 'Creando paciente...' : 'Crear paciente'}
                          </button>
                        </div>

                        {/* 2. Notación FDI: Precisión en qué dientes vamos a trabajar */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Piezas (ej: 11, 21)</label>
                            <input 
                                type="text" 
                                required
                                className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-medical-500/20"
                                value={orderDetails.teeth_numbers}
                                onChange={(e) => setOrderDetails({...orderDetails, teeth_numbers: e.target.value})}
                            />
                        </div>

                        {/* 3. Color: La guía VITA para el ceramista */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Color (Sombra VITA)</label>
                            <input 
                                type="text" 
                                placeholder="ej: A1, B2"
                                className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-medical-500/20"
                                value={orderDetails.shade}
                                onChange={(e) => setOrderDetails({...orderDetails, shade: e.target.value})}
                            />
                        </div>

                        {/* 4. Link 3D/STL: Para enviar el escaneado intraoral */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Link Escaneado STL</label>
                            <input 
                                type="url" 
                                placeholder="Drive / WeTransfer"
                                className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-medical-500/20"
                                value={orderDetails.scan_url}
                                onChange={(e) => setOrderDetails({...orderDetails, scan_url: e.target.value})}
                            />
                        </div>

                        {/* 5. Subida de Foto Clínica (Nuevo) */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-bold text-medical-600 uppercase tracking-widest">
                                {selectedImage ? '✅ Foto seleccionada' : '📸 Añadir Foto Clínica (Opcional)'}
                            </label>
                            <input 
                                type="file" 
                                accept="image/*"
                                className="w-full bg-medical-50 border-2 border-dashed border-medical-200 rounded-2xl px-5 py-4 text-xs font-bold text-gray-500 cursor-pointer hover:bg-medical-100 transition"
                                onChange={(e) => setSelectedImage(e.target.files[0])}
                            />
                        </div>
                    </div>

                    {/* 6. Notas Clínicas: Detalles finos para evitar errores */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Instrucciones Técnicas</label>
                        <textarea 
                            rows="3"
                            className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-medical-500/20"
                            placeholder="Aclara cualquier detalle para el laboratorio..."
                            value={orderDetails.notes}
                            onChange={(e) => setOrderDetails({...orderDetails, notes: e.target.value})}
                        ></textarea>
                    </div>

                    <button type="submit" className="w-full py-5 bg-medical-500 hover:bg-medical-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-medical-500/30 transition-all active:scale-[0.98]">
                        Enviar Pedido a Fabricación
                    </button>
                </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Marketplace;
