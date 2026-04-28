import React, { useState, useEffect, useContext, useMemo } from 'react';
import apiClient from '../api';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// --- COMPONENTE MARKETPLACE: CATÁLOGO DE SERVICIOS DENTALES ---
function Marketplace() {
  // 1. Estados Globales y Locales
  const { user } = useContext(AuthContext); // Usuario para saber si es Clínica (comprador)
  const { showToast } = useToast();
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
  const filteredProducts = useMemo(() => products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.material?.toLowerCase().includes(searchTerm.toLowerCase())
  ), [products, searchTerm]);

  const uniqueLabs = useMemo(
    () => new Set(products.map((product) => product.lab?.company_name).filter(Boolean)).size,
    [products]
  );
  const averageDelivery = useMemo(() => {
    if (!products.length) return 0;
    return Math.round(products.reduce((acc, product) => acc + Number(product.delivery_days || 0), 0) / products.length);
  }, [products]);
  const averagePrice = useMemo(() => {
    if (!products.length) return 0;
    return products.reduce((acc, product) => acc + Number(product.price || 0), 0) / products.length;
  }, [products]);

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
      
      showToast('Pedido y fotos enviados con éxito.', 'success');
      setSelectedProduct(null); // Cerramos el modal
      setSelectedImage(null);   // Limpiamos la imagen
      setOrderDetails({
        patient_id: '',
        teeth_numbers: '',
        shade: '',
        notes: '',
        scan_url: '',
      });
    } catch (err) {
      console.error("Error al enviar el pedido", err);
      showToast('Error al enviar el pedido. Verifica los datos requeridos.', 'error');
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
      showToast('Paciente creado correctamente.', 'success');
    } catch (err) {
      console.error("Error al crear paciente", err);
      showToast('No se pudo crear el paciente.', 'error');
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
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.5fr,1fr]">
        <div className="rounded-[32px] bg-slate-950 px-8 py-8 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Marketplace</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">Encuentra el laboratorio ideal para cada caso</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-300">
            Busca tratamientos, compara tiempos de entrega y lanza nuevos pedidos sin salir del flujo privado.
          </p>
          <div className="mt-6">
            <div className="relative w-full max-w-xl">
              <input
                type="text"
                placeholder="Buscar material o tratamiento..."
                className="w-full rounded-3xl border border-white/10 bg-white/10 px-6 py-4 pr-12 text-sm font-medium text-white placeholder:text-slate-400 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="absolute right-5 top-4 h-6 w-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"/></svg>
            </div>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          <div className="rounded-[28px] bg-white p-6 shadow-card">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Tratamientos</p>
            <p className="mt-3 text-3xl font-black text-slate-950">{products.length}</p>
          </div>
          <div className="rounded-[28px] bg-white p-6 shadow-card">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Laboratorios</p>
            <p className="mt-3 text-3xl font-black text-slate-950">{uniqueLabs}</p>
          </div>
          <div className="rounded-[28px] bg-white p-6 shadow-card">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Entrega media</p>
            <p className="mt-3 text-3xl font-black text-slate-950">{averageDelivery} d</p>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] bg-white p-6 shadow-card">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Catalog</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Servicios disponibles</h2>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500">
            Precio medio: <span className="font-bold text-slate-900">€{averagePrice.toFixed(2)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map(product => (
            <div key={product.id} className="group flex h-full flex-col overflow-hidden rounded-[32px] border border-slate-100 bg-slate-50 transition hover:-translate-y-1 hover:shadow-xl">
              <div className="relative flex h-52 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-white to-sky-50">
                <div className="absolute right-4 top-4 rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-700 shadow-sm">
                  {product.material || 'Premium'}
                </div>
                <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 bg-gradient-to-br from-sky-500/10 to-violet-500/10" />
                <svg className="h-20 w-20 text-slate-200 transition-colors duration-500 group-hover:text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/></svg>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <div>
                  <h3 className="text-xl font-black tracking-tight text-slate-950 transition group-hover:text-sky-700">
                    {product.name}
                  </h3>
                  <p className="mt-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                    {product.lab?.company_name || 'Laboratorio asociado'}
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 rounded-[28px] bg-white p-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Precio</p>
                    <p className="mt-2 text-2xl font-black text-slate-950">€{parseFloat(product.price).toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Entrega</p>
                    <p className="mt-2 text-sm font-black text-sky-700">{product.delivery_days} d. laborables</p>
                  </div>
                </div>

                <div className="mt-6">
                  {user?.role === 'clinic' ? (
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:bg-sky-600"
                    >
                      Nuevo pedido
                    </button>
                  ) : (
                    <div className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                      Modo escaparate
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="mt-6 rounded-[28px] bg-slate-50 p-8 text-center text-sm text-slate-500">
            No hay servicios que coincidan con la búsqueda actual.
          </div>
        ) : null}
      </section>

      {/* SECCIÓN 3: MODAL DE CONFIGURACIÓN DE CASO (LA PASARELA DE DATOS) */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl overflow-hidden rounded-[2.5rem] bg-white shadow-2xl">
            <div className="max-h-[90vh] overflow-y-auto p-8 md:p-10">
                <div className="mb-8 flex items-start justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">New order</p>
                        <h2 className="mt-2 text-3xl font-black tracking-tighter text-slate-950">Detalles del caso</h2>
                        <p className="mt-1 text-sm text-slate-500">Configurando: {selectedProduct.name}</p>
                    </div>
                    <button onClick={() => setSelectedProduct(null)} className="rounded-2xl bg-slate-100 p-3 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"/></svg>
                    </button>
                </div>

                <form onSubmit={handlePlaceOrder} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-3xl bg-slate-50 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Laboratorio</p>
                        <p className="mt-2 text-sm font-bold text-slate-900">{selectedProduct.lab?.company_name || 'Laboratorio asociado'}</p>
                      </div>
                      <div className="rounded-3xl bg-slate-50 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Precio</p>
                        <p className="mt-2 text-sm font-bold text-slate-900">€{parseFloat(selectedProduct.price).toFixed(2)}</p>
                      </div>
                      <div className="rounded-3xl bg-slate-50 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Entrega</p>
                        <p className="mt-2 text-sm font-bold text-sky-700">{selectedProduct.delivery_days} d. laborables</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 1. Selector de Paciente: Resuelve la vinculación clínica-médica */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ficha del paciente</label>
                            <select 
                                required
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold focus:outline-none"
                                value={orderDetails.patient_id}
                                onChange={(e) => setOrderDetails({...orderDetails, patient_id: e.target.value})}
                            >
                                <option value="">Seleccionar paciente...</option>
                                {patients.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
                            </select>
                        </div>

                        {/* 1.1 Alta rápida de paciente: conecta con /patients/ sin cambiar de vista */}
                        <div className="md:col-span-2 rounded-3xl border border-slate-100 bg-slate-50 p-5 space-y-3">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            Alta rápida de paciente (si no existe)
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="Nombre"
                              value={newPatient.first_name}
                              onChange={(e) => setNewPatient({ ...newPatient, first_name: e.target.value })}
                              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                            />
                            <input
                              type="text"
                              placeholder="Apellidos"
                              value={newPatient.last_name}
                              onChange={(e) => setNewPatient({ ...newPatient, last_name: e.target.value })}
                              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                            />
                            <input
                              type="date"
                              value={newPatient.birth_date}
                              onChange={(e) => setNewPatient({ ...newPatient, birth_date: e.target.value })}
                              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                            />
                            <select
                              value={newPatient.gender}
                              onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
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
                              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm md:col-span-2"
                            />
                          </div>
                          <button
                            type="button"
                            disabled={creatingPatient || !newPatient.first_name.trim() || !newPatient.last_name.trim()}
                            onClick={handleCreatePatient}
                            className="w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition disabled:bg-slate-200 disabled:text-slate-400 md:w-auto"
                          >
                            {creatingPatient ? 'Creando paciente...' : 'Crear paciente'}
                          </button>
                        </div>

                        {/* 2. Notación FDI: Precisión en qué dientes vamos a trabajar */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Piezas (ej: 11, 21)</label>
                            <input 
                                type="text" 
                                required
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold focus:outline-none"
                                value={orderDetails.teeth_numbers}
                                onChange={(e) => setOrderDetails({...orderDetails, teeth_numbers: e.target.value})}
                            />
                        </div>

                        {/* 3. Color: La guía VITA para el ceramista */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Color (Sombra VITA)</label>
                            <input 
                                type="text" 
                                placeholder="ej: A1, B2"
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold focus:outline-none"
                                value={orderDetails.shade}
                                onChange={(e) => setOrderDetails({...orderDetails, shade: e.target.value})}
                            />
                        </div>

                        {/* 4. Link 3D/STL: Para enviar el escaneado intraoral */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Link escaneado STL</label>
                            <input 
                                type="url" 
                                placeholder="Drive / WeTransfer"
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold focus:outline-none"
                                value={orderDetails.scan_url}
                                onChange={(e) => setOrderDetails({...orderDetails, scan_url: e.target.value})}
                            />
                        </div>

                        {/* 5. Subida de Foto Clínica (Nuevo) */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-bold text-sky-700 uppercase tracking-widest">
                                {selectedImage ? 'Foto seleccionada' : 'Añadir foto clínica (opcional)'}
                            </label>
                            <input 
                                type="file" 
                                accept="image/*"
                                className="w-full cursor-pointer rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50 px-5 py-4 text-sm font-medium text-slate-500 transition hover:bg-sky-100"
                                onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                            />
                        </div>
                    </div>

                    {/* 6. Notas Clínicas: Detalles finos para evitar errores */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Instrucciones técnicas</label>
                        <textarea 
                            rows="3"
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold focus:outline-none"
                            placeholder="Aclara cualquier detalle para el laboratorio..."
                            value={orderDetails.notes}
                            onChange={(e) => setOrderDetails({...orderDetails, notes: e.target.value})}
                        ></textarea>
                    </div>

                    <button type="submit" className="w-full rounded-2xl bg-slate-950 py-5 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-sky-600 active:scale-[0.98]">
                        Enviar pedido a fabricación
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
