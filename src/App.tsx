import React, { useState, useEffect } from 'react';
import { store } from './services/store';
import { Product, Client, TruckItem, Sale, TruckLoadRecord } from './types';
import { AdminView } from './components/AdminView';
import { SellerView } from './components/SellerView';
import { Monitor, Smartphone, RotateCcw, Beer } from 'lucide-react';

export function App() {
  const [viewMode, setViewMode] = useState<'admin' | 'seller'>('admin');

  // Estados cargados desde el almacenamiento local
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [truckStock, setTruckStock] = useState<TruckItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [truckLoads, setTruckLoads] = useState<TruckLoadRecord[]>([]);

  const reloadData = () => {
    setProducts(store.getProducts());
    setClients(store.getClients());
    setTruckStock(store.getTruckStock());
    setSales(store.getSales());
    setTruckLoads(store.getTruckLoads());
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleSaleCreated = (saleData: Omit<Sale, 'id' | 'date' | 'synced'>) => {
    store.registerSale(saleData);
    reloadData();
  };

  const handleTruckLoaded = (items: { productId: string; quantity: number }[], sellerName: string) => {
    store.loadTruck(items, sellerName);
    reloadData();
  };

  const handleResetData = () => {
    if (confirm('¿Restablecer datos de prueba a valores iniciales de Paceña?')) {
      store.resetToDefaults();
      reloadData();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      {/* Barra Superior Global */}
      <header className="bg-red-800 text-white shadow-md px-4 py-3 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl text-red-800 shadow-xs">
              <Beer size={24} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wide flex items-center gap-2">
                DISTRIBUIDORA PACEÑA
                <span className="text-[11px] font-normal bg-red-950/60 px-2 py-0.5 rounded text-red-200">
                  v1.0 Offline-First
                </span>
              </h1>
              <p className="text-xs text-red-200">
                Sistema Híbrido: Escritorio Windows (.exe) & Móvil Chofer (.apk)
              </p>
            </div>
          </div>

          {/* Selector de Modo: Administrador vs Vendedor */}
          <div className="flex items-center gap-2">
            <div className="bg-red-900/80 p-1 rounded-xl flex items-center border border-red-700/60 shadow-inner">
              <button
                onClick={() => setViewMode('admin')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'admin'
                    ? 'bg-white text-red-800 shadow-sm'
                    : 'text-red-200 hover:text-white'
                }`}
              >
                <Monitor size={15} />
                <span>PC Administrador</span>
              </button>

              <button
                onClick={() => setViewMode('seller')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'seller'
                    ? 'bg-white text-red-800 shadow-sm'
                    : 'text-red-200 hover:text-white'
                }`}
              >
                <Smartphone size={15} />
                <span>Móvil Chofer (APK)</span>
              </button>
            </div>

            <button
              onClick={handleResetData}
              title="Restablecer datos de prueba"
              className="p-2 bg-red-900/60 hover:bg-red-900 text-red-200 hover:text-white rounded-lg text-xs border border-red-700/40"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {viewMode === 'admin' ? (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-gray-900">Panel Central de Oficina y Almacén</h2>
                <p className="text-xs text-gray-500">
                  Vista optimizada para las 2 computadoras de escritorio en almacén
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                🖥️ Ventana Windows (.exe)
              </span>
            </div>

            <AdminView
              products={products}
              clients={clients}
              sales={sales}
              truckStock={truckStock}
              truckLoads={truckLoads}
              onRefresh={reloadData}
            />
          </div>
        ) : (
          <div>
            <div className="max-w-md mx-auto mb-3 text-center">
              <span className="text-xs font-semibold px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full">
                📱 Simulador de Celular Android (.apk)
              </span>
              <p className="text-xs text-gray-500 mt-1">
                Así verá la aplicación el chofer en su teléfono en la calle
              </p>
            </div>

            <SellerView
              products={products}
              clients={clients}
              truckStock={truckStock}
              sales={sales}
              onSaleCreated={handleSaleCreated}
              onTruckLoaded={handleTruckLoaded}
            />
          </div>
        )}
      </main>

      {/* Footer informativo */}
      <footer className="bg-white border-t border-gray-200 py-3 px-4 text-center text-xs text-gray-500">
        <p>Paceña Distribuidora v1.0 • Almacenamiento Local Offline Activo • Listo para compilar en <strong>Windows (.exe)</strong> y <strong>Android (.apk)</strong></p>
      </footer>
    </div>
  );
}

export default App;
