import React, { useState } from 'react';
import { Product, Client, Sale, TruckItem, TruckLoadRecord } from '../types';
import { 
  Users, 
  Package, 
  FileText, 
  DollarSign, 
  AlertTriangle, 
  Calendar,
  Layers,
  Search,
  CheckCircle,
  Truck
} from 'lucide-react';

interface AdminViewProps {
  products: Product[];
  clients: Client[];
  sales: Sale[];
  truckStock: TruckItem[];
  truckLoads: TruckLoadRecord[];
  onRefresh: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  products,
  clients,
  sales,
  truckStock,
  truckLoads,
}) => {
  const [activeTab, setActiveTab] = useState<'hoja-ruta' | 'clientes' | 'inventario' | 'ventas'>('hoja-ruta');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Cálculos de la jornada (Hoja de Ruta)
  const totalVentasDinero = sales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalEfectivoCobrado = sales.filter(s => s.paymentType === 'contado').reduce((acc, s) => acc + s.totalAmount, 0);
  const totalAlDebe = sales.filter(s => s.paymentType === 'al_debe').reduce((acc, s) => acc + s.totalAmount, 0);
  const totalCanastillosPrestados = sales.reduce((acc, s) => acc + s.cratesDelivered, 0);
  const totalCanastillosRecuperados = sales.reduce((acc, s) => acc + s.cratesReturned, 0);

  // Consolidado de productos vendidos en la jornada
  const productosVendidosMap: { [productName: string]: { cantidad: number; total: number } } = {};
  sales.forEach(sale => {
    sale.items.forEach(item => {
      if (!productosVendidosMap[item.productName]) {
        productosVendidosMap[item.productName] = { cantidad: 0, total: 0 };
      }
      productosVendidosMap[item.productName].cantidad += item.quantity;
      productosVendidosMap[item.productName].total += item.subtotal;
    });
  });

  return (
    <div className="space-y-6">
      {/* Tarjetas Superiores de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Facturado</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg"><DollarSign size={20} /></span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">Bs. {totalVentasDinero.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">{sales.length} ventas registradas hoy</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-green-600">Dinero Recaudado</span>
            <span className="p-2 bg-green-50 text-green-600 rounded-lg"><CheckCircle size={20} /></span>
          </div>
          <p className="text-2xl font-bold text-green-700 mt-2">Bs. {totalEfectivoCobrado.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Efectivo / QR en caja</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">Ventas "Al Debe"</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-lg"><AlertTriangle size={20} /></span>
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-2">Bs. {totalAlDebe.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Créditos pendientes de cobro</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Envases Retornables</span>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Layers size={20} /></span>
          </div>
          <p className="text-2xl font-bold text-indigo-900 mt-2">
            {totalCanastillosRecuperados} / {totalCanastillosPrestados}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Vacíos recuperados vs Llenos entregados
          </p>
        </div>
      </div>

      {/* Barra de Navegación de Pestañas */}
      <div className="flex border-b border-gray-200 bg-white rounded-t-xl px-4 pt-2">
        <button
          onClick={() => setActiveTab('hoja-ruta')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'hoja-ruta'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Calendar size={18} />
          Hoja de Ruta del Día (Liquidación)
        </button>

        <button
          onClick={() => setActiveTab('clientes')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'clientes'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users size={18} />
          Clientes y Deudas
        </button>

        <button
          onClick={() => setActiveTab('inventario')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'inventario'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Package size={18} />
          Inventario (Almacén vs Camión)
        </button>

        <button
          onClick={() => setActiveTab('ventas')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'ventas'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText size={18} />
          Registro de Ventas (CRUD)
        </button>
      </div>

      {/* Contenido de la Pestaña Activa */}
      <div className="bg-white p-6 rounded-b-xl border border-gray-200 border-t-0 shadow-xs">
        {/* PESTAÑA: HOJA DE RUTA */}
        {activeTab === 'hoja-ruta' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Resumen de Liquidación de la Jornada</h3>
                <p className="text-sm text-gray-500">Reporte de mercadería despachada, recaudación y balance de envases</p>
              </div>
              <button 
                onClick={() => window.print()}
                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg flex items-center gap-2 shadow-xs"
              >
                🖨️ Imprimir Hoja de Ruta
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Productos Vendidos */}
              <div className="border rounded-xl p-4 bg-gray-50">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Package size={18} className="text-red-600" />
                  Cervezas y Productos Despachados
                </h4>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-2">Producto</th>
                      <th className="pb-2 text-center">Cant.</th>
                      <th className="pb-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.keys(productosVendidosMap).length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-4 text-center text-gray-400">No hay ventas registradas aún</td>
                      </tr>
                    ) : (
                      Object.entries(productosVendidosMap).map(([nombre, info]) => (
                        <tr key={nombre}>
                          <td className="py-2.5 font-medium text-gray-900">{nombre}</td>
                          <td className="py-2.5 text-center font-bold text-gray-800">{info.cantidad}</td>
                          <td className="py-2.5 text-right text-gray-900">Bs. {info.total.toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Cuadre de Caja y Envases */}
              <div className="space-y-4">
                <div className="border rounded-xl p-4 bg-gray-50">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <DollarSign size={18} className="text-green-600" />
                    Liquidación de Dinero
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Ventas al Contado (Efectivo/QR a entregar):</span>
                      <span className="font-bold text-green-700">Bs. {totalEfectivoCobrado.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Ventas Al Debe (Crédito clientes):</span>
                      <span className="font-bold text-amber-700">Bs. {totalAlDebe.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2 border-t font-semibold text-base">
                      <span>Total General del Día:</span>
                      <span className="text-gray-900">Bs. {totalVentasDinero.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="border rounded-xl p-4 bg-gray-50">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Layers size={18} className="text-indigo-600" />
                    Cuadre de Canastillos Retornables Paceña
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Canastillos Llenos Salidos:</span>
                      <span className="font-bold text-gray-900">{totalCanastillosPrestados} cajones</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Canastillos Vacíos Recogidos:</span>
                      <span className="font-bold text-indigo-700">{totalCanastillosRecuperados} cajones</span>
                    </div>
                    <div className="flex justify-between py-2 border-t font-semibold">
                      <span>Diferencia en Calle (Quedó al debe):</span>
                      <span className="text-red-600">
                        {totalCanastillosPrestados - totalCanastillosRecuperados} cajones
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA: CLIENTES Y DEUDAS */}
        {activeTab === 'clientes' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="relative w-72">
                <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar cliente o tienda..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <span className="text-sm text-gray-500">{clients.length} clientes registrados</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 border-y">
                  <tr>
                    <th className="py-3 px-4">Negocio / Cliente</th>
                    <th className="py-3 px-4">Teléfono / Dirección</th>
                    <th className="py-3 px-4 text-center">Deuda Dinero ("Al Debe")</th>
                    <th className="py-3 px-4 text-center">Deuda Canastillos</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {clients
                    .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.businessName.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(client => (
                      <tr key={client.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-bold text-gray-900">{client.businessName}</p>
                          <p className="text-xs text-gray-500">{client.name}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-gray-700">{client.phone}</p>
                          <p className="text-xs text-gray-500">{client.address}</p>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {client.balanceMoney > 0 ? (
                            <span className="px-2.5 py-1 bg-red-50 text-red-700 font-bold rounded-full text-xs">
                              Bs. {client.balanceMoney.toLocaleString()}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-green-50 text-green-700 font-medium rounded-full text-xs">
                              Al día (Bs. 0)
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {client.balanceCrates > 0 ? (
                            <span className="px-2.5 py-1 bg-amber-50 text-amber-800 font-bold rounded-full text-xs">
                              {client.balanceCrates} cajones
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">0 cajones</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedClient(client)}
                            className="text-red-600 hover:text-red-800 font-medium text-xs underline"
                          >
                            Ver Historial
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Modal de Historial de Compras del Cliente */}
            {selectedClient && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">{selectedClient.businessName}</h4>
                      <p className="text-sm text-gray-500">{selectedClient.name} - Tel: {selectedClient.phone}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedClient(null)}
                      className="text-gray-400 hover:text-gray-600 text-lg font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg space-y-1 text-sm border">
                    <p className="flex justify-between">
                      <span className="text-gray-600">Saldo actual al debe:</span>
                      <span className="font-bold text-red-600">Bs. {selectedClient.balanceMoney}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-600">Canastillos vacíos pendientes:</span>
                      <span className="font-bold text-amber-700">{selectedClient.balanceCrates} cajones</span>
                    </p>
                  </div>

                  <h5 className="font-semibold text-gray-800 text-sm">Historial de Compras Recientes</h5>
                  <div className="max-h-56 overflow-y-auto space-y-2">
                    {sales.filter(s => s.clientId === selectedClient.id).length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4">No hay compras registradas para este cliente</p>
                    ) : (
                      sales
                        .filter(s => s.clientId === selectedClient.id)
                        .map(sale => (
                          <div key={sale.id} className="p-3 border rounded-lg text-xs space-y-1">
                            <div className="flex justify-between font-semibold">
                              <span>{sale.id} - {new Date(sale.date).toLocaleDateString()}</span>
                              <span className={sale.paymentType === 'contado' ? 'text-green-600' : 'text-amber-600'}>
                                {sale.paymentType.toUpperCase()} - Bs. {sale.totalAmount}
                              </span>
                            </div>
                            <div className="text-gray-500">
                              {sale.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                            </div>
                            <div className="text-gray-400 flex gap-3 text-[11px]">
                              <span>Cajones entregados: {sale.cratesDelivered}</span>
                              <span>Cajones recuperados: {sale.cratesReturned}</span>
                            </div>
                          </div>
                        ))
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedClient(null)}
                    className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg text-sm"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA: INVENTARIO */}
        {activeTab === 'inventario' && (
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Package size={18} className="text-red-600" />
                Stock en Almacén Central vs Camión de Reparto
              </h4>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 border-y">
                  <tr>
                    <th className="py-3 px-4 text-left">Producto</th>
                    <th className="py-3 px-4 text-left">Presentación</th>
                    <th className="py-3 px-4 text-center">Tipo</th>
                    <th className="py-3 px-4 text-center">Stock Almacén</th>
                    <th className="py-3 px-4 text-center">Stock en Camión</th>
                    <th className="py-3 px-4 text-right">Precio Mayorista</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map(prod => {
                    const truckItem = truckStock.find(t => t.productId === prod.id);
                    const qtyInTruck = truckItem ? truckItem.quantity : 0;

                    return (
                      <tr key={prod.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-semibold text-gray-900">{prod.name}</td>
                        <td className="py-3 px-4 text-gray-600">{prod.presentation}</td>
                        <td className="py-3 px-4 text-center">
                          {prod.isReturnable ? (
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                              Retornable
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                              Descartable
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-gray-800">
                          {prod.stockAlmacen}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-indigo-700">
                          {qtyInTruck > 0 ? (
                            <span className="flex items-center justify-center gap-1">
                              <Truck size={14} />
                              {qtyInTruck}
                            </span>
                          ) : (
                            <span className="text-gray-400">0</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-gray-900">
                          Bs. {prod.price}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PESTAÑA: VENTAS (CRUD) */}
        {activeTab === 'ventas' && (
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900 mb-2">Historial Completo de Ventas</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 border-y">
                  <tr>
                    <th className="py-3 px-4">Código</th>
                    <th className="py-3 px-4">Fecha / Hora</th>
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4">Vendedor</th>
                    <th className="py-3 px-4 text-center">Tipo de Pago</th>
                    <th className="py-3 px-4 text-center">Envases (Lleno/Vacío)</th>
                    <th className="py-3 px-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sales.map(sale => (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono font-medium text-gray-900">{sale.id}</td>
                      <td className="py-3 px-4 text-gray-500 text-xs">
                        {new Date(sale.date).toLocaleDateString()} {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900">{sale.clientName}</td>
                      <td className="py-3 px-4 text-gray-600 text-xs">{sale.sellerName}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          sale.paymentType === 'contado' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {sale.paymentType === 'contado' ? 'Contado' : 'Al Debe'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-xs">
                        {sale.cratesDelivered > 0 || sale.cratesReturned > 0 ? (
                          <span className="text-gray-700">
                            Ent: {sale.cratesDelivered} / Rec: {sale.cratesReturned}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-gray-900">
                        Bs. {sale.totalAmount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
