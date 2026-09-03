import {
  Product,
  Sale,
  Budget,
  Expense,
  CashRegister,
  StockMovement,
  StoreSettings,
  Branch,
  Seller,
  TransferRecord,
  ServiceOrder,
  CustomerVIP,
  SmartBundle,
} from '../types';

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'branch-embu',
    name: 'Embu das artes',
    isOpen: true,
    manager: 'Guilherme Gomes',
    monthlySalesGoal: 300,
    monthlyRevenueGoal: 150000,
    phone: '(11) 99999-0001',
    address: 'Av. Elias Yazbek - Embu das Artes',
  },
  {
    id: 'branch-taboao',
    name: 'Taboão da serra',
    isOpen: false,
    manager: 'Carlos Silva',
    monthlySalesGoal: 200,
    monthlyRevenueGoal: 100000,
    phone: '(11) 99999-0002',
    address: 'Rod. Régis Bittencourt - Taboão da Serra',
  },
  {
    id: 'branch-capao',
    name: 'Capão Redondo',
    isOpen: true,
    manager: 'Auriane Cunha',
    monthlySalesGoal: 250,
    monthlyRevenueGoal: 120000,
    phone: '(11) 99999-0003',
    address: 'Estr. de Itapecerica - Capão Redondo',
  },
  {
    id: 'branch-jd-saoluis',
    name: 'Jardim São Luís',
    isOpen: false,
    manager: 'Marcos Souza',
    monthlySalesGoal: 180,
    monthlyRevenueGoal: 90000,
    phone: '(11) 99999-0004',
    address: 'Av. Maria Coelho Aguiar - Jd. São Luís',
  },
];

export const INITIAL_SELLERS: Seller[] = [
  {
    id: 'seller-guilherme',
    name: 'Guilherme Gomes',
    role: 'Gerente',
    branchId: 'branch-embu',
    email: 'gg0099567@gmail.com',
    commissionRate: 2.5,
    monthlySalesGoal: 60,
    monthlyRevenueGoal: 45000,
    avatar: '👨‍💼',
  },
  {
    id: 'seller-auriane',
    name: 'Auriane Cunha',
    role: 'Vendedor',
    branchId: 'branch-capao',
    email: 'auriane@smartops.app.br',
    commissionRate: 3.0,
    monthlySalesGoal: 50,
    monthlyRevenueGoal: 35000,
    avatar: '👩‍💼',
  },
  {
    id: 'seller-marcos',
    name: 'Marcos Souza',
    role: 'Vendedor',
    branchId: 'branch-jd-saoluis',
    email: 'marcos@smartops.app.br',
    commissionRate: 3.0,
    monthlySalesGoal: 45,
    monthlyRevenueGoal: 30000,
    avatar: '👨‍💼',
  },
];

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'sinistron.ia',
  document: '',
  phone: '',
  address: '',
  receiptFooter: 'sinistron.ia - Gestão Inteligente de Vendas & Metas.',
  currencySymbol: 'R$',
  darkMode: true,
  currentBranchId: 'branch-embu',
  currentSellerId: 'seller-guilherme',
  userRole: 'Gerente',
  fontFamily: 'plus-jakarta',
  colorTheme: 'indigo',
  layoutWidth: 'ultrawide',
  defaultCardRates: {
    debit: 1.99,
    creditCash: 3.49,
    credit2xTo6x: 6.99,
    credit7xTo12x: 11.99,
  },
};

export const SAMPLE_STARTER_PRODUCTS: Product[] = [
  {
    id: 'prod-iphone-15-pro',
    code: 'IPH15P-128',
    name: 'iPhone 15 Pro 128GB Titânio Natural',
    category: 'Aparelho Novo',
    costPrice: 5800,
    sellingPrice: 7299,
    stock: 6,
    minStock: 2,
    unit: 'un',
    createdAt: new Date().toISOString(),
    description: 'Smartphone Apple com Chip A17 Pro, Câmera 48MP e Conexão USB-C.',
  },
  {
    id: 'prod-iphone-14-128',
    code: 'IPH14-128-US',
    name: 'iPhone 14 128GB Meia-Noite (Seminovo Grade A)',
    category: 'Aparelho Usado',
    costPrice: 2700,
    sellingPrice: 3590,
    stock: 4,
    minStock: 1,
    unit: 'un',
    createdAt: new Date().toISOString(),
    description: 'Aparelho revisado com 92% de bateria, garantia de 90 dias.',
  },
  {
    id: 'prod-carregador-20w',
    code: 'CAR-20W-USB-C',
    name: 'Adaptador de Energia Apple 20W USB-C',
    category: 'Eletrônicos',
    costPrice: 85,
    sellingPrice: 199,
    stock: 25,
    minStock: 5,
    unit: 'un',
    createdAt: new Date().toISOString(),
    description: 'Carregador rápido original compatível com linhas iPhone e iPad.',
  },
  {
    id: 'prod-capa-magsafe',
    code: 'CAPA-MAG-IP15',
    name: 'Capa Magnética MagSafe Anti-Impacto Transparente',
    category: 'Capas',
    costPrice: 18,
    sellingPrice: 89,
    stock: 30,
    minStock: 8,
    unit: 'un',
    createdAt: new Date().toISOString(),
    description: 'Capa com anel magnético reforçado e bordas elevadas para proteção de lentes.',
  },
  {
    id: 'prod-pelicula-3d',
    code: 'PEL-PRIV-9D',
    name: 'Película de Vidro 9D Privacidade Cerâmica',
    category: 'Películas',
    costPrice: 7,
    sellingPrice: 49,
    stock: 45,
    minStock: 10,
    unit: 'un',
    createdAt: new Date().toISOString(),
    description: 'Película fumê anti-espião com toque suave e alta resistência.',
  },
  {
    id: 'prod-servico-troca-tela',
    code: 'SRV-TELA-IP13',
    name: 'Serviço de Troca de Tela iPhone 13 OLED Premium',
    category: 'Serviços',
    costPrice: 380,
    sellingPrice: 750,
    stock: 10,
    minStock: 2,
    unit: 'serviço',
    createdAt: new Date().toISOString(),
    description: 'Mão de obra e peça com reprogramação de TrueTone inclusa.',
  }
];

export const SAMPLE_STARTER_SERVICE_ORDERS: ServiceOrder[] = [
  {
    id: 'os-1001',
    code: 'OS-1001',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    customerName: 'Lucas Medeiros',
    customerPhone: '(11) 98765-4321',
    customerDocument: '345.678.901-22',
    deviceModel: 'iPhone 13 Pro 256GB Grafite',
    deviceImei: '356984110294821',
    deviceColor: 'Grafite',
    accessoriesLeft: 'Sem carregador, capa transparente',
    reportedDefect: 'Aparelho caiu no chão, vidro traseiro trincado e bateria estufando descarregando rápido.',
    technicalDiagnosis: 'Necessária troca de módulo de bateria premium com calibração BMS e substituição da tampa traseira a laser.',
    technicianName: 'Rafael Silva (Tech Master)',
    status: 'Pronto para Retirada',
    priority: 'Alta',
    laborCost: 180,
    partsCost: 320,
    totalAmount: 680,
    warrantyDays: 90,
    notes: 'Aparelho testado 100%, vedação IP68 refeita e ciclo de bateria 100%.',
    branchId: 'branch-matriz',
  },
  {
    id: 'os-1002',
    code: 'OS-1002',
    date: new Date(Date.now() - 86400000 * 1).toISOString(),
    customerName: 'Camila Fernandes',
    customerPhone: '(11) 99123-8877',
    customerDocument: '412.876.123-55',
    deviceModel: 'Samsung Galaxy S23 Ultra',
    deviceImei: '359871029384712',
    deviceColor: 'Verde Botânico',
    accessoriesLeft: 'Aparelho com película trincada',
    reportedDefect: 'Não carrega no conector Type-C, só indução.',
    technicalDiagnosis: 'Flex sub-placa conector tipo-C oxidado por umidade.',
    technicianName: 'Rafael Silva (Tech Master)',
    status: 'Em Execução',
    priority: 'Normal',
    laborCost: 120,
    partsCost: 140,
    totalAmount: 350,
    warrantyDays: 90,
    notes: 'Aguardando secagem da cola de vedação.',
    branchId: 'branch-matriz',
  },
];

export const SAMPLE_STARTER_VIP_CUSTOMERS: CustomerVIP[] = [
  {
    id: 'vip-1',
    name: 'Lucas Medeiros',
    phone: '(11) 98765-4321',
    document: '345.678.901-22',
    email: 'lucas.medeiros@gmail.com',
    totalSpent: 8450,
    salesCount: 4,
    pointsBalance: 845,
    cashbackBalance: 120.50,
    loyaltyTier: 'Diamante',
    lastPurchaseDate: new Date(Date.now() - 86400000 * 15).toISOString(),
    churnRisk: 'Baixo',
    preferredCategory: 'Aparelho Novo',
    notes: 'Cliente fiel, prefere linha Apple e sempre compra combo de capas.',
  },
  {
    id: 'vip-2',
    name: 'Camila Fernandes',
    phone: '(11) 99123-8877',
    document: '412.876.123-55',
    email: 'camila.f@outlook.com',
    totalSpent: 4190,
    salesCount: 3,
    pointsBalance: 419,
    cashbackBalance: 65.00,
    loyaltyTier: 'Ouro',
    lastPurchaseDate: new Date(Date.now() - 86400000 * 45).toISOString(),
    churnRisk: 'Médio',
    preferredCategory: 'Serviços',
    notes: 'Gosta de atendimento rápido pelo WhatsApp.',
  },
  {
    id: 'vip-3',
    name: 'Bruno Castro',
    phone: '(11) 97766-5544',
    document: '298.112.443-88',
    email: 'bruno.castro@empresa.com.br',
    totalSpent: 1290,
    salesCount: 2,
    pointsBalance: 129,
    cashbackBalance: 25.00,
    loyaltyTier: 'Prata',
    lastPurchaseDate: new Date(Date.now() - 86400000 * 95).toISOString(),
    churnRisk: 'Alto',
    preferredCategory: 'Outros Acessórios',
    notes: 'Não compra há mais de 3 meses. Enviar cupom de incentivo.',
  }
];

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_SALES: Sale[] = [];

export const INITIAL_BUDGETS: Budget[] = [];

export const INITIAL_EXPENSES: Expense[] = [];

export const INITIAL_SERVICE_ORDERS: ServiceOrder[] = [];

export const INITIAL_VIP_CUSTOMERS: CustomerVIP[] = [];

export const INITIAL_SMART_BUNDLES: SmartBundle[] = [
  {
    id: 'bundle-protecao-total',
    name: 'Combo Proteção Total Ultra 360°',
    description: 'Capa Anti-Impacto MagSafe + Película 9D Cerâmica Privacidade + Garantia de Aplicação',
    productIds: ['prod-capa-magsafe', 'prod-pelicula-3d'],
    originalPrice: 138,
    bundlePrice: 109.90,
    discountPercent: 20.36,
    combinedMarginPercent: 68.5,
    tag: 'Mais Vendido',
  },
  {
    id: 'bundle-power-fast',
    name: 'Kit Carga Rápida Turbo + Cabo Blindado',
    description: 'Adaptador 20W USB-C + Capa Silicone Premium',
    productIds: ['prod-carregador-20w', 'prod-capa-magsafe'],
    originalPrice: 288,
    bundlePrice: 239.90,
    discountPercent: 16.7,
    combinedMarginPercent: 57.1,
    tag: 'Essencial',
  },
];

export const INITIAL_TRANSFERS: TransferRecord[] = [];

export const INITIAL_CASH_REGISTER: CashRegister = {
  isOpen: false,
  openedAt: undefined,
  closedAt: undefined,
  initialAmount: 0,
  currentAmount: 0,
  entries: [],
};

const STORAGE_KEYS = {
  PRODUCTS: 'sinistron_products',
  SALES: 'sinistron_sales',
  BUDGETS: 'sinistron_budgets',
  EXPENSES: 'sinistron_expenses',
  CASH_REGISTER: 'sinistron_cash',
  STOCK_MOVEMENTS: 'sinistron_movements',
  BRANCHES: 'sinistron_branches',
  SELLERS: 'sinistron_sellers',
  TRANSFERS: 'sinistron_transfers',
  SERVICE_ORDERS: 'sinistron_service_orders',
  VIP_CUSTOMERS: 'sinistron_vip_customers',
  SMART_BUNDLES: 'sinistron_smart_bundles',
  SETTINGS: 'sinistron_settings',
};

export function loadStoredData<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error loading key ${key}:`, error);
    return fallback;
  }
}

export function saveStoredData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving key ${key}:`, error);
  }
}

export const StorageService = {
  getProducts: () => loadStoredData<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS),
  saveProducts: (data: Product[]) => saveStoredData(STORAGE_KEYS.PRODUCTS, data),

  getSales: () => loadStoredData<Sale[]>(STORAGE_KEYS.SALES, INITIAL_SALES),
  saveSales: (data: Sale[]) => saveStoredData(STORAGE_KEYS.SALES, data),

  getBudgets: () => loadStoredData<Budget[]>(STORAGE_KEYS.BUDGETS, INITIAL_BUDGETS),
  saveBudgets: (data: Budget[]) => saveStoredData(STORAGE_KEYS.BUDGETS, data),

  getExpenses: () => loadStoredData<Expense[]>(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES),
  saveExpenses: (data: Expense[]) => saveStoredData(STORAGE_KEYS.EXPENSES, data),

  getCashRegister: () => loadStoredData<CashRegister>(STORAGE_KEYS.CASH_REGISTER, INITIAL_CASH_REGISTER),
  saveCashRegister: (data: CashRegister) => saveStoredData(STORAGE_KEYS.CASH_REGISTER, data),

  getStockMovements: () => loadStoredData<StockMovement[]>(STORAGE_KEYS.STOCK_MOVEMENTS, []),
  saveStockMovements: (data: StockMovement[]) => saveStoredData(STORAGE_KEYS.STOCK_MOVEMENTS, data),

  getBranches: () => loadStoredData<Branch[]>(STORAGE_KEYS.BRANCHES, INITIAL_BRANCHES),
  saveBranches: (data: Branch[]) => saveStoredData(STORAGE_KEYS.BRANCHES, data),

  getSellers: () => loadStoredData<Seller[]>(STORAGE_KEYS.SELLERS, INITIAL_SELLERS),
  saveSellers: (data: Seller[]) => saveStoredData(STORAGE_KEYS.SELLERS, data),

  getTransfers: () => loadStoredData<TransferRecord[]>(STORAGE_KEYS.TRANSFERS, INITIAL_TRANSFERS),
  saveTransfers: (data: TransferRecord[]) => saveStoredData(STORAGE_KEYS.TRANSFERS, data),

  getServiceOrders: () => loadStoredData<ServiceOrder[]>(STORAGE_KEYS.SERVICE_ORDERS, INITIAL_SERVICE_ORDERS),
  saveServiceOrders: (data: ServiceOrder[]) => saveStoredData(STORAGE_KEYS.SERVICE_ORDERS, data),

  getVIPCustomers: () => loadStoredData<CustomerVIP[]>(STORAGE_KEYS.VIP_CUSTOMERS, INITIAL_VIP_CUSTOMERS),
  saveVIPCustomers: (data: CustomerVIP[]) => saveStoredData(STORAGE_KEYS.VIP_CUSTOMERS, data),

  getSmartBundles: () => loadStoredData<SmartBundle[]>(STORAGE_KEYS.SMART_BUNDLES, INITIAL_SMART_BUNDLES),
  saveSmartBundles: (data: SmartBundle[]) => saveStoredData(STORAGE_KEYS.SMART_BUNDLES, data),

  getSettings: () => loadStoredData<StoreSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_STORE_SETTINGS),
  saveSettings: (data: StoreSettings) => saveStoredData(STORAGE_KEYS.SETTINGS, data),

  exportAllData: () => {
    return JSON.stringify({
      products: StorageService.getProducts(),
      sales: StorageService.getSales(),
      budgets: StorageService.getBudgets(),
      expenses: StorageService.getExpenses(),
      cashRegister: StorageService.getCashRegister(),
      stockMovements: StorageService.getStockMovements(),
      branches: StorageService.getBranches(),
      sellers: StorageService.getSellers(),
      transfers: StorageService.getTransfers(),
      serviceOrders: StorageService.getServiceOrders(),
      vipCustomers: StorageService.getVIPCustomers(),
      smartBundles: StorageService.getSmartBundles(),
      settings: StorageService.getSettings(),
      exportedAt: new Date().toISOString(),
    }, null, 2);
  },

  importAllData: (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (data.products) StorageService.saveProducts(data.products);
      if (data.sales) StorageService.saveSales(data.sales);
      if (data.budgets) StorageService.saveBudgets(data.budgets);
      if (data.expenses) StorageService.saveExpenses(data.expenses);
      if (data.cashRegister) StorageService.saveCashRegister(data.cashRegister);
      if (data.stockMovements) StorageService.saveStockMovements(data.stockMovements);
      if (data.branches) StorageService.saveBranches(data.branches);
      if (data.sellers) StorageService.saveSellers(data.sellers);
      if (data.transfers) StorageService.saveTransfers(data.transfers);
      if (data.serviceOrders) StorageService.saveServiceOrders(data.serviceOrders);
      if (data.vipCustomers) StorageService.saveVIPCustomers(data.vipCustomers);
      if (data.smartBundles) StorageService.saveSmartBundles(data.smartBundles);
      if (data.settings) StorageService.saveSettings(data.settings);
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  },

  resetToZero: () => {
    StorageService.saveProducts([]);
    StorageService.saveSales([]);
    StorageService.saveBudgets([]);
    StorageService.saveExpenses([]);
    StorageService.saveCashRegister({
      isOpen: false,
      initialAmount: 0,
      currentAmount: 0,
      entries: [],
    });
    StorageService.saveStockMovements([]);
    StorageService.saveTransfers([]);
    StorageService.saveServiceOrders([]);
    StorageService.saveVIPCustomers([]);
    StorageService.saveSmartBundles(INITIAL_SMART_BUNDLES);
    StorageService.saveBranches(INITIAL_BRANCHES);
    StorageService.saveSellers(INITIAL_SELLERS);
    StorageService.saveSettings(DEFAULT_STORE_SETTINGS);
  },

  clearAllData: () => {
    Object.values(STORAGE_KEYS).forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignore
      }
    });
    StorageService.resetToZero();
  }
};
