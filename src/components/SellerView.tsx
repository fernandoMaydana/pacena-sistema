import React, { useState } from 'react';
import { Product, Client, TruckItem, Sale } from '../types';
import { 
  ShoppingCart, 
  Truck, 
  Package, 
  DollarSign, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Minus,
  Trash2,
  Layers,
  ArrowRight
} from 'lucide-react';

interface SellerViewProps {
  products: Product[];
  clients: Client[];
  truckStock: TruckItem[];
  sales: Sale[];
  onSaleCreated: (saleData: Omit<Sale, 'id' | 'date' | 'synced'>) => void;
  onTruckLoaded: (items: { productId: string; quantity: number }[], sellerName: string) => void;
}

export const SellerView: React.FC<SellerViewProps> = ({
  products,
  clients,
  truckStock,
  sales,
  onSaleCreated,
  onTruckLoaded,
}) => {
  const [activeTab, setActiveTab] = useState<'venta' | 'carga' | 'camion' | 'resumen'>('venta');

  // Estado para la Venta
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [cart, setCart] = useState<{ [productId: string]: number }>({});
  const [paymentType, setPaymentType] = useState<'contado' | 'al_debe'>('contado');
  const [cratesReturned, setCratesReturned] = useState<number>(0);
  const [saleSuccessMessage, setSaleSuccessMessage] = useState<string | null>(null);

  // Estado para Cargar Camión
  const [loadQuantities, setLoadQuantities] = useState<{ [productId: string]: number }>({});
  const [loadSuccessMessage, setLoadSuccessMessage] = useState<string | null>(null);

  const selectedClient = clients.find(c => c.id === selectedClientId);

  // Manejo de Carrito
  const updateCartQty = (productId: string, delta: number) => {
    const current = cart[productId] || 0;
    const truckItem = truckStock.find(t => t.productId === productId);
    const max = truckItem ? truckItem.quantity : 0;
    const updated = Math.max(0, Math.min(max, current + delta));

    if (updated === 0) {
      const nextCart = { ...cart };
      delete nextCart[productId];
      setCart(nextCart);
    } else {
      setCart({ ...cart, [productId]: updated });
    }
  };

  // Cálculos del Carrito
  const cartItems = Object.entries(cart).map(([productId, quantity]) => {
    const truckItem = truckStock.find(t => t.productId === productId)!;
    return {
      productId,
      productName: truckItem.productName,
      quantity,
      unitPrice: truckItem.price,
      subtotal: quantity * truckItem.price,
      isReturnable: truckItem.isReturnable,
    };
  });

  const cartTotalAmount = cartItems.reduce((acc, item) => acc + item.subtotal, 0);
  const cratesDeliveredTotal = cartItems
    .filter(i => i.isReturnable)
    .reduce((acc, item) => acc + item.quantity, 0);

  // Finalizar Venta
  const handleFinalizeSale = () => {
    if (!selectedClient || cartItems.length === 0) return;

    onSaleCreated({
      sellerName: 'Juan Pérez (Camión 1)',
      clientId: selectedClient.id,
      clientName: `${selectedClient.businessName} (${selectedClient.name})`,
      items: cartItems,
      totalAmount: cartTotalAmount,
      paymentType,
      cratesDelivered: cratesDeliveredTotal,
      cratesReturned,
      bottlesDelivered: 0,
      bottlesReturned: 0,
    });

    setSaleSuccessMessage(`¡Venta guardada con éxito por Bs. ${cartTotalAmount}!`);
    setCart({});
    setCratesReturned(0);

    setTimeout(() => {
      setSaleSuccessMessage(null);
    }, 3000);
  };

  // Finalizar Carga de Camión
  const handleFinalizeLoad = () => {
    const itemsToLoad = Object.entries(loadQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([productId, quantity]) => ({ productId, quantity }));

    if (itemsToLoad.length === 0) return;

    onTruckLoaded(itemsToLoad, 'Juan Pérez (Camión 1)');
    setLoadSuccessMessage('¡Mercadería cargada al camión con éxito!');
    setLoadQuantities({});

    setTimeout(() => {
      setLoadSuccessMessage(null);
    }, 3000);
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-[640px] rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col">
      {/* Header Móvil */}
      <div className="bg-red-700 text-white p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-bold text-base flex items-center gap-1.5">
              <span>🚚</span> Paceña Móvil Vendedor
            </h2>
            <p className="text-xs text-red-100">Juan Pérez - Camión 1</p>
          </div>
          <span className="px-2 py-0.5 bg-green-500 text-white font-semibold text-[11px] rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
            Offline-Ready
          </span>
        </div>
      </div>

      {/* Navegación Táctil Móvil */}
      <div className="grid grid-cols-4 bg-gray-50 border-b border-gray-200 text-xs">
        <button
          onClick={() => setActiveTab('venta')}
          className={`py-2.5 flex flex-col items-center justify-center gap-1 font-medium transition-colors ${
            activeTab === 'venta' ? 'text-red-600 bg-white border-b-2 border-red-600 font-bold' : 'text-gray-500'
          }`}
        >
          <ShoppingCart size={16} />
          <span>Vender</span>
        </button>

        <button
          onClick={() => setActiveTab('camion')}
          className={`py-2.5 flex flex-col items-center justify-center gap-1 font-medium transition-colors ${
            activeTab === 'camion' ? 'text-red-600 bg-white border-b-2 border-red-600 font-bold' : 'text-gray-500'
          }`}
        >
          <Truck size={16} />
          <span>Mi Camión</span>
        </button>

        <button
          onClick={() => setActiveTab('carga')}
          className={`py-2.5 flex flex-col items-center justify-center gap-1 font-medium transition-colors ${
            activeTab === 'carga' ? 'text-red-600 bg-white border-b-2 border-red-600 font-bold' : 'text-gray-500'
          }`}
        >
          <Package size={16} />
          <span>Cargar</span>
        </button>

        <button
          onClick={() => setActiveTab('resumen')}
          className={`py-2.5 flex flex-col items-center justify-center gap-1 font-medium transition-colors ${
            activeTab === 'resumen' ? 'text-red-600 bg-white border-b-2 border-red-600 font-bold' : 'text-gray-500'
          }`}
        >
          <DollarSign size={16} />
          <span>Mi Ruta</span>
        </button>
      </div>

      {/* Contenido según pestaña */}
      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        {/* TAB VENDER */}
        {activeTab === 'venta' && (
          <div className="space-y-4">
            {saleSuccessMessage && (
              <div className="p-3 bg-green-100 border border-green-300 text-green-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                <span className="font-semibold">{saleSuccessMessage}</span>
              </div>
            )}

            {/* 1. Seleccionar Cliente */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">1. SELECCIONAR CLIENTE</label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full p-2.5 border rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500 font-medium"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.businessName} - {c.name}
                  </option>
                ))}
              </select>

              {/* Alerta de Deuda del Cliente */}
              {selectedClient && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-0.5">
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-600">Saldo Dinero al Debe:</span>
                    <span className={selectedClient.balanceMoney > 0 ? 'text-red-600 font-bold' : 'text-green-700'}>
                      Bs. {selectedClient.balanceMoney}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-600">Canastillos Vacíos Pendientes:</span>
                    <span className={selectedClient.balanceCrates > 0 ? 'text-amber-700 font-bold' : 'text-gray-600'}>
                      {selectedClient.balanceCrates} cajones
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Seleccionar Productos de Camión */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">2. PRODUCTOS EN CAMIÓN</label>
              <div className="space-y-2">
                {truckStock.map(item => {
                  const currentInCart = cart[item.productId] || 0;

                  return (
                    <div key={item.productId} className="p-2.5 border rounded-xl flex items-center justify-between bg-white shadow-2xs">
                      <div className="flex-1 pr-2">
                        <p className="font-semibold text-xs text-gray-900 leading-tight">{item.productName}</p>
                        <p className="text-[11px] text-gray-500">{item.presentation}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-bold text-red-600">Bs. {item.price}</span>
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                            Disponibles: {item.quantity}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateCartQty(item.productId, -1)}
                          disabled={currentInCart === 0}
                          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 flex items-center justify-center font-bold text-gray-700 text-sm"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center font-bold text-sm text-gray-900">
                          {currentInCart}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQty(item.productId, 1)}
                          disabled={item.quantity === 0 || currentInCart >= item.quantity}
                          className="w-8 h-8 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-40 flex items-center justify-center font-bold text-white text-sm"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Forma de Pago y Envases Retornables */}
            {cartItems.length > 0 && (
              <div className="p-3 bg-gray-50 border rounded-xl space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">3. FORMA DE PAGO</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentType('contado')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors ${
                        paymentType === 'contado'
                          ? 'bg-green-600 text-white border-green-600'
                          : 'bg-white text-gray-700 border-gray-300'
                      }`}
                    >
                      💵 AL CONTADO (Efectivo/QR)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentType('al_debe')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors ${
                        paymentType === 'al_debe'
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-white text-gray-700 border-gray-300'
                      }`}
                    >
                      📝 AL DEBE (Crédito)
                    </button>
                  </div>
                </div>

                {/* Envases retornables involucrados */}
                {cratesDeliveredTotal > 0 && (
                  <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-lg text-xs space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                      <Layers size={15} />
                      <span>Control de Canastillos Retornables</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-700">
                      <span>Cajones llenos entregados:</span>
                      <span className="font-bold text-indigo-800">{cratesDeliveredTotal}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Cajones vacíos recibidos:</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setCratesReturned(Math.max(0, cratesReturned - 1))}
                          className="w-6 h-6 rounded bg-indigo-200 flex items-center justify-center font-bold text-indigo-900"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-bold">{cratesReturned}</span>
                        <button
                          type="button"
                          onClick={() => setCratesReturned(cratesReturned + 1)}
                          className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center font-bold text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="text-[11px] text-indigo-700 pt-1 border-t border-indigo-200 flex justify-between">
                      <span>Balance a cuenta de cliente:</span>
                      <span className="font-bold">
                        {cratesDeliveredTotal - cratesReturned > 0 
                          ? `Queda debiendo ${cratesDeliveredTotal - cratesReturned} cajones`
                          : cratesDeliveredTotal - cratesReturned === 0
                          ? 'Cuadrado (0)'
                          : `Devuelve ${cratesReturned - cratesDeliveredTotal} extras`}
                      </span>
                    </div>
                  </div>
                )}

                {/* Resumen Total y Botón */}
                <div className="pt-2 border-t flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500">Total a Cobrar:</p>
                    <p className="text-xl font-black text-gray-900">Bs. {cartTotalAmount.toLocaleString()}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleFinalizeSale}
                    className="py-3 px-5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm shadow-md flex items-center gap-1"
                  >
                    <span>REGISTRAR VENTA</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB MI CAMIÓN */}
        {activeTab === 'camion' && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-gray-800 flex items-center gap-1.5">
              <Truck size={16} className="text-red-600" />
              Mercadería Actualmente Cargada en el Camión
            </h3>

            <div className="space-y-2">
              {truckStock.map(item => (
                <div key={item.productId} className="p-3 border rounded-xl bg-gray-50 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-xs text-gray-900">{item.productName}</p>
                    <p className="text-[11px] text-gray-500">{item.presentation}</p>
                    <p className="text-xs font-semibold text-red-600 mt-0.5">Bs. {item.price} c/u</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-gray-900">{item.quantity}</p>
                    <p className="text-[10px] text-gray-400">unidades/cajas</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB CARGAR CAMIÓN */}
        {activeTab === 'carga' && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-gray-800 flex items-center gap-1.5">
              <Package size={16} className="text-red-600" />
              Recargar Camión desde Almacén Central
            </h3>

            {loadSuccessMessage && (
              <div className="p-3 bg-green-100 text-green-800 rounded-xl text-xs font-semibold">
                {loadSuccessMessage}
              </div>
            )}

            <div className="space-y-2">
              {products.map(prod => {
                const qty = loadQuantities[prod.id] || 0;

                return (
                  <div key={prod.id} className="p-2.5 border rounded-xl flex items-center justify-between">
                    <div className="flex-1 pr-2">
                      <p className="font-bold text-xs text-gray-900">{prod.name}</p>
                      <p className="text-[11px] text-gray-500">En almacén: {prod.stockAlmacen}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setLoadQuantities({ ...loadQuantities, [prod.id]: Math.max(0, qty - 5) })}
                        className="w-7 h-7 bg-gray-100 rounded text-xs font-bold"
                      >
                        -5
                      </button>
                      <input
                        type="number"
                        min="0"
                        max={prod.stockAlmacen}
                        value={qty}
                        onChange={(e) => setLoadQuantities({ ...loadQuantities, [prod.id]: parseInt(e.target.value) || 0 })}
                        className="w-12 text-center text-xs font-bold border rounded py-1"
                      />
                      <button
                        type="button"
                        onClick={() => setLoadQuantities({ ...loadQuantities, [prod.id]: Math.min(prod.stockAlmacen, qty + 5) })}
                        className="w-7 h-7 bg-red-100 text-red-700 rounded text-xs font-bold"
                      >
                        +5
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleFinalizeLoad}
              className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl text-xs uppercase tracking-wider"
            >
              Confirmar Carga de Camión
            </button>
          </div>
        )}

        {/* TAB MI RUTA (RESUMEN) */}
        {activeTab === 'resumen' && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-gray-800">Mi Hoja de Ruta - Ventas de Hoy</h3>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-[11px] text-green-700 font-medium">Recaudado Contado</p>
                <p className="text-base font-black text-green-800 mt-1">
                  Bs. {sales.filter(s => s.paymentType === 'contado').reduce((acc, s) => acc + s.totalAmount, 0).toLocaleString()}
                </p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-[11px] text-amber-700 font-medium">Al Debe (Crédito)</p>
                <p className="text-base font-black text-amber-800 mt-1">
                  Bs. {sales.filter(s => s.paymentType === 'al_debe').reduce((acc, s) => acc + s.totalAmount, 0).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-600">Últimas Ventas Registradas:</p>
              {sales.map(s => (
                <div key={s.id} className="p-2.5 border rounded-lg text-xs space-y-1 bg-gray-50">
                  <div className="flex justify-between font-bold">
                    <span>{s.clientName}</span>
                    <span className="text-red-600">Bs. {s.totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-500">
                    <span>{s.paymentType === 'contado' ? '💵 Contado' : '📝 Al Debe'}</span>
                    <span>Cajones: {s.cratesDelivered} ent / {s.cratesReturned} rec</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
