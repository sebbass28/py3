import React, { useCallback, useEffect, useMemo, useState } from 'react';
import apiClient from '../api';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Corregimos rutas de iconos de Leaflet para evitar marcadores invisibles en build.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function ClinicFinder() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [sort, setSort] = useState('rating_desc');

  const fetchClinics = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (maxPrice) params.append('max_price', maxPrice);
      if (minRating) params.append('min_rating', minRating);
      if (sort) params.append('sort', sort);
      const queryString = params.toString();
      const endpoint = queryString ? `users/clinics/?${queryString}` : 'users/clinics/';
      const response = await apiClient.get(endpoint);
      setClinics(response.data);
    } catch (error) {
      console.error('Error al cargar clínicas', error);
    } finally {
      setLoading(false);
    }
  }, [maxPrice, minRating, search, sort]);

  useEffect(() => {
    fetchClinics();
  }, [fetchClinics]);

  const clinicsWithCoords = useMemo(
    () => clinics.filter((clinic) => clinic.latitude !== null && clinic.longitude !== null),
    [clinics]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Buscar Clínica Cercana</h1>
        <p className="mt-2 text-sm text-gray-500 italic">
          Compara opciones por zona, precio orientativo y valoración media para elegir la mejor clínica.
        </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-card grid grid-cols-1 md:grid-cols-5 gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ciudad, barrio o nombre de clínica..."
          dir="ltr"
          autoComplete="off"
          className="md:col-span-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium"
        />
        <input
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="Precio máx. (€)"
          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium"
        />
        <input
          type="number"
          min="0"
          max="5"
          step="0.1"
          value={minRating}
          onChange={(e) => setMinRating(e.target.value)}
          placeholder="Valoración mín."
          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium"
        >
          <option value="rating_desc">Mejor valoradas</option>
          <option value="price_asc">Precio menor</option>
          <option value="price_desc">Precio mayor</option>
        </select>
        <button
          onClick={fetchClinics}
          className="md:col-span-5 bg-medical-500 hover:bg-medical-600 text-white rounded-xl py-2.5 text-sm font-bold uppercase tracking-wider"
        >
          Actualizar resultados
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-card">
          <h2 className="text-lg font-extrabold text-gray-900 mb-4">Mapa de clínicas</h2>
          <div className="h-[440px] rounded-xl overflow-hidden border border-gray-200">
            <MapContainer center={[40.4168, -3.7038]} zoom={6} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                subdomains="abcd"
              />
              {clinicsWithCoords.map((clinic) => (
                <Marker key={clinic.id} position={[Number(clinic.latitude), Number(clinic.longitude)]}>
                  <Popup>
                    <div className="space-y-1">
                      <p className="font-bold">{clinic.company_name || 'Clínica sin nombre'}</p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        {clinic.source_type === 'registered' ? 'Clínica registrada' : 'Catálogo abierto'}
                      </p>
                      <p>{clinic.address || 'Dirección no informada'}</p>
                      <p>Precio: {clinic.consultation_price ? `${clinic.consultation_price} €` : 'N/D'}</p>
                      <p>Valoración: {clinic.rating || 'N/D'}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-card">
          <h2 className="text-lg font-extrabold text-gray-900 mb-4">Comparador de opciones</h2>
          {loading ? (
            <div className="text-sm text-gray-400 italic">Cargando clínicas...</div>
          ) : clinics.length > 0 ? (
            <ul className="space-y-3 max-h-[440px] overflow-y-auto">
              {clinics.map((clinic) => (
                <li key={clinic.id} className="border border-gray-100 bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-bold text-gray-900">{clinic.company_name || 'Clínica sin nombre'}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mt-1">
                    {clinic.source_type === 'registered' ? 'Verificada en plataforma' : 'Ficha pública'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{clinic.address || 'Dirección no disponible'}</p>
                  <div className="mt-2 flex items-center gap-4 text-xs font-bold">
                    <span className="text-medical-600">
                      Precio: {clinic.consultation_price ? `${clinic.consultation_price} €` : 'N/D'}
                    </span>
                    <span className="text-amber-600">Valoración: {clinic.rating || 'N/D'}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-500 space-y-2">
              <p className="italic">
                No se encontraron clínicas para los filtros actuales{search.trim() ? ` (búsqueda: "${search.trim()}")` : ''}.
              </p>
              <p className="text-xs text-gray-400">
                Si estás en entorno local de demo, carga datos con:
                <span className="block mt-1 font-mono text-gray-500">python manage.py seed_demo_clinics</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClinicFinder;
