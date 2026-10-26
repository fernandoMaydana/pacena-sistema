import { Product, Client, TruckItem, Sale, TruckLoadRecord } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CLIENTS, INITIAL_TRUCK_STOCK, INITIAL_SALES } from '../data/mockData';

const STORAGE_KEYS = {
  PRODUCTS: 'pacena_products',
  CLIENTS: 'pacena_clients',
  TRUCK_STOCK: 'pacena_truck_stock',
  SALES: 'pacena_sales',
  LOADS: 'pacena_loads',
};

export const store = {
  getProducts(): Product[] {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : INITIAL_PRODUCTS;
  },

  saveProducts(products: Product[]) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  getClients(): Client[] {
    const data = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return data ? JSON.parse(data) : INITIAL_CLIENTS;
  },

  saveClients(clients: Client[]) {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  },

  getTruckStock(): TruckItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.TRUCK_STOCK);
    return data ? JSON.parse(data) : INITIAL_TRUCK_STOCK;
  },

  saveTruckStock(stock: TruckItem[]) {
    localStorage.setItem(STORAGE_KEYS.TRUCK_STOCK, JSON.stringify(stock));
  },

  getSales(): Sale[] {
    const data = localStorage.getItem(STORAGE_KEYS.SALES);
    return data ? JSON.parse(data) : INITIAL_SALES;
  },

  saveSales(sales: Sale[]) {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  },

  getTruckLoads(): TruckLoadRecord[] {
    const data = localStorage.getItem(STORAGE_KEYS.LOADS);
    return data ? JSON.parse(data) : [];
  },

  saveTruckLoads(loads: TruckLoadRecord[]) {
    localStorage.setItem(STORAGE_KEYS.LOADS, JSON.stringify(loads));
  },

  // Operación: Cargar Camión (Pasa del almacén central al camión)
  loadTruck(itemsToLoad: { productId: string; quantity: number }[], sellerName: string): boolean {
    const products = this.getProducts();
    const truckStock = this.getTruckStock();

    // Validar disponibilidad en almacén
    for (const item of itemsToLoad) {
      const prod = products.find(p => p.id === item.productId);
      if (!prod || prod.stockAlmacen < item.quantity) {
        return false;
      }
    }

    // Descontar de almacén y sumar a camión
    itemsToLoad.forEach(item => {
      const prod = products.find(p => p.id === item.productId)!;
      prod.stockAlmacen -= item.quantity;

      const existingTruckItem = truckStock.find(t => t.productId === item.productId);
      if (existingTruckItem) {
        existingTruckItem.quantity += item.quantity;
      } else {
        truckStock.push({
          productId: prod.id,
          productName: prod.name,
          presentation: prod.presentation,
          quantity: item.quantity,
          price: prod.price,
          isReturnable: prod.isReturnable,
        });
      }
    });

    const newRecord: TruckLoadRecord = {
      id: `CRG-${Date.now()}`,
      date: new Date().toISOString(),
      sellerName,
      items: itemsToLoad.map(item => {
        const prod = products.find(p => p.id === item.productId)!;
        return {
          productId: item.productId,
          productName: prod.name,
          quantity: item.quantity,
        };
      }),
    };

    const loads = this.getTruckLoads();
    loads.unshift(newRecord);

    this.saveProducts(products);
    this.saveTruckStock(truckStock);
    this.saveTruckLoads(loads);
    return true;
  },

  // Operación: Registrar Venta (En el celular o PC)
  registerSale(newSaleData: Omit<Sale, 'id' | 'date' | 'synced'>): Sale {
    const sales = this.getSales();
    const truckStock = this.getTruckStock();
    const clients = this.getClients();

    // Descontar del stock del camión
    newSaleData.items.forEach(item => {
      const truckItem = truckStock.find(t => t.productId === item.productId);
      if (truckItem) {
        truckItem.quantity = Math.max(0, truckItem.quantity - item.quantity);
      }
    });

    // Actualizar cuenta corriente del cliente (Dinero y Envases)
    const client = clients.find(c => c.id === newSaleData.clientId);
    if (client) {
      if (newSaleData.paymentType === 'al_debe') {
        client.balanceMoney += newSaleData.totalAmount;
      }
      // Envases entregados vs recogidos
      const diffCrates = newSaleData.cratesDelivered - newSaleData.cratesReturned;
      client.balanceCrates += diffCrates;
      const diffBottles = newSaleData.bottlesDelivered - newSaleData.bottlesReturned;
      client.balanceBottles += diffBottles;
    }

    const sale: Sale = {
      ...newSaleData,
      id: `VTA-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString(),
      synced: true,
    };

    sales.unshift(sale);

    this.saveSales(sales);
    this.saveTruckStock(truckStock);
    this.saveClients(clients);

    return sale;
  },

  // Reset datos a valores iniciales
  resetToDefaults() {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.CLIENTS);
    localStorage.removeItem(STORAGE_KEYS.TRUCK_STOCK);
    localStorage.removeItem(STORAGE_KEYS.SALES);
    localStorage.removeItem(STORAGE_KEYS.LOADS);
  }
};
