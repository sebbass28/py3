import React, { useState, useEffect } from 'react';
import apiClient from '../api';

function Marketplace() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          apiClient.get('products/'),
          apiClient.get('categories/')
        ]);
        setProducts(prodRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error("Error fetching marketplace data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.material.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-500"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">Marketplace</h1>
        <div className="relative w-full max-w-md">
          <input 
            type="text" 
            placeholder="Buscar productos..." 
            className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3 text-gray-900 focus:outline-none focus:border-medical-500 shadow-sm font-medium pr-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="absolute right-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/></svg>
        </div>
      </header>

      {/* Product List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredProducts.length > 0 ? filteredProducts.map(product => (
          <div key={product.id} className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-xl hover:border-medical-200 transition duration-300 transform hover:-translate-y-1 overflow-hidden">
            <div className="h-48 w-full bg-gray-50 flex items-center justify-center p-8">
              <svg className="h-16 w-16 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/></svg>
            </div>
            
            <div className="p-6 flex-grow flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-medical-600 transition tracking-tight">
                  {product.name}
                </h3>
                <p className="text-gray-400 text-sm font-medium opacity-80 mb-4 italic">
                  Laboratorio Dental Pro 2
                </p>
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-tight mb-4">
                  <span className="text-gray-400">Entrega aprox.</span>
                  <span className="text-medical-700">{product.delivery_days} días hábiles</span>
                </div>
                
                {product.is_external ? (
                  <a 
                    href={product.external_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full block text-center py-3.5 bg-white hover:bg-gray-50 text-gray-900 rounded-xl transition-all duration-300 font-extrabold text-xs uppercase tracking-widest border border-gray-100 shadow-sm"
                  >
                    Ver en {product.external_source || 'Tienda Original'}
                  </a>
                ) : (
                  <button className="w-full py-3.5 bg-gray-50 hover:bg-medical-500 hover:text-white rounded-xl transition-all duration-300 font-extrabold text-xs text-medical-600 uppercase tracking-widest border border-medical-100 hover:border-medical-500 shadow-sm">
                    Enviar Caso .STL
                  </button>
                )}
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-50 mt-auto">
                <span className="text-xl font-extrabold text-gray-900">${product.price.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
                <button className="p-2.5 bg-medical-500 hover:bg-medical-600 text-white rounded-lg transition-all shadow-md active:scale-95 group-hover:scale-105">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/></svg>
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-24 text-center">
            <p className="text-gray-400 font-bold tracking-tight italic">No se han encontrado trabajos que coincidan.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Marketplace;
