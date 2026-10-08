export type CategorySlug =
  | 'diamantes'
  | 'airdrop'
  | 'passe_nivel'
  | 'promocoes'
  | 'robux'
  | 'outros';

export type OrderStatus =
  | 'Pendente'
  | 'Em análise'
  | 'Pago'
  | 'Em processamento'
  | 'Concluído'
  | 'Cancelado';

export type PaymentMethod = 'EXPRESS' | 'PAYPAY' | 'UNITEL MONEY';

export interface Category {
  id: string;
  slug: CategorySlug;
  name: string;
  description: string;
  game: 'Free Fire' | 'Roblox' | 'Geral';
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: CategorySlug;
  priceKz: number;
  diamondsOrRobux?: string;
  levelLabel?: string;
  image: string;
  description: string;
  active: boolean;
  stockStatus: 'Disponível' | 'Estoque Limitado' | 'Esgotado';
  featured?: boolean;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g., #VCY-000001
  customerName: string;
  freeFireId: string;
  nickname: string;
  phone: string;
  productId: string;
  productName: string;
  productCategory: CategorySlug;
  quantity: number;
  unitPriceKz: number;
  totalPriceKz: number;
  paymentMethod: PaymentMethod;
  proofId?: string;
  proofFileName?: string;
  proofMimeType?: string;
  proofDataUrl?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  createdAt: string;
  status: OrderStatus;
}

export interface CustomerUser {
  id: string;
  name: string;
  phone: string;
  freeFireId: string;
  nickname: string;
  ordersCount: number;
  totalSpentKz: number;
  lastOrderNumber: string;
  lastOrderDate: string;
  createdAt: string;
}

export interface OrderLog {
  id: string;
  orderId: string;
  orderNumber: string;
  adminName: string;
  date: string;
  time: string;
  previousStatus: OrderStatus;
  newStatus: OrderStatus;
  note?: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  orderNumber: string;
  createdAt: string;
  read: boolean;
}

export interface StoreSettings {
  storeName: string;
  slogan: string;
  whatsappNumber: string;
  paymentPhone: string;
  paymentRecipient: string;
  paypayRef: string;
  unitelMoneyRef: string;
}

export interface AdminDashboardData {
  stats: {
    totalOrders: number;
    totalSalesKz: number;
    pendingOrders: number;
    inAnalysisOrders: number;
    paidOrders: number;
    processingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    salesTodayKz: number;
    salesWeekKz: number;
    salesMonthKz: number;
  };
  chartData: Array<{
    label: string;
    date: string;
    totalKz: number;
    ordersCount: number;
  }>;
  orders: Order[];
  products: Product[];
  categories: Category[];
  customers: CustomerUser[];
  notifications: AdminNotification[];
  orderLogs: OrderLog[];
  settings: StoreSettings;
  adminProfile: {
    username: string;
    mustChangeCode: boolean;
    lastLoginAt: string;
  };
}
