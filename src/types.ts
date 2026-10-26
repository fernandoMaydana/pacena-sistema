export interface Product {
  id: string;
  code: string;
  name: string;
  category: 'cerveza' | 'licor' | 'refresco' | 'envase';
  presentation: string;
  price: number;
  stockAlmacen: number;
  isReturnable: boolean;
  returnableType?: 'canastillo_24' | 'canastillo_12' | 'botella_suelta';
}

export interface Client {
  id: string;
  name: string;
  businessName: string;
  phone: string;
  address: string;
  balanceMoney: number; // Saldo de dinero al debe
  balanceCrates: number; // Saldo de canastillos al debe
  balanceBottles: number; // Saldo de botellas sueltas al debe
}

export interface TruckItem {
  productId: string;
  productName: string;
  presentation: string;
  quantity: number;
  price: number;
  isReturnable: boolean;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  isReturnable: boolean;
}

export interface Sale {
  id: string;
  date: string;
  sellerName: string;
  clientId: string;
  clientName: string;
  items: SaleItem[];
  totalAmount: number;
  paymentType: 'contado' | 'al_debe';
  cratesDelivered: number; // Canastillos llenos entregados
  cratesReturned: number; // Canastillos vacíos recibidos
  bottlesDelivered: number;
  bottlesReturned: number;
  synced: boolean;
}

export interface TruckLoadRecord {
  id: string;
  date: string;
  sellerName: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
  }[];
}
