export type PaymentMethod =
  | 'dinheiro'
  | 'pix'
  | 'cartao_credito'
  | 'cartao_debito'
  | 'paymobi'
  | 'boleto'
  | 'a_prazo';

export type ProductCategory =
  | 'Aparelho Novo'
  | 'Aparelho Usado'
  | 'Capas'
  | 'Películas'
  | 'Outros Acessórios'
  | 'Eletrônicos'
  | 'Serviços'
  | 'Geral';

export interface Branch {
  id: string;
  name: string;
  isOpen: boolean;
  manager: string;
  monthlySalesGoal: number;
  monthlyRevenueGoal: number;
  phone?: string;
  address?: string;
}

export interface Seller {
  id: string;
  name: string;
  role: 'Administrador' | 'Gerente' | 'Vendedor' | 'Consultor';
  branchId: string;
  email?: string;
  avatar?: string;
  commissionRate: number; // e.g. 2.5%
  monthlySalesGoal: number;
  monthlyRevenueGoal: number;
}

export interface TradeInItem {
  model: string;
  imei?: string;
  evaluationValue: number;
  condition: 'Excelente' | 'Bom' | 'Marcas de Uso' | 'Avariado';
  notes?: string;
}

export interface FinancingDetails {
  provider: 'PayMobi' | 'CDC' | 'Outro';
  installments: number;
  entryAmount: number; // Valor que entrou na loja (Dinheiro, Pix, etc)
  entryPaymentMethod: PaymentMethod;
  financedAmount: number;
  contractNumber?: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  unit: string;
  branchId?: string;
  imei?: string;
  isTradeIn?: boolean;
  description?: string;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  code: string;
  category?: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  discount: number;
  total: number;
  imei?: string;
}

export interface CustomerInfo {
  name: string;
  phone?: string;
  document?: string; // CPF/CNPJ
  email?: string;
  address?: string;
}

export interface PaymentDetails {
  method: PaymentMethod;
  installments?: number;
  receivedAmount?: number;
  changeAmount?: number;
  cardFeePercent?: number;
  netReceived?: number;
  financing?: FinancingDetails;
}

export interface Sale {
  id: string;
  code: string;
  date: string;
  branchId: string;
  sellerId: string;
  sellerName?: string;
  branchName?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  addition: number;
  total: number;
  costTotal: number;
  grossProfit: number;
  paymentMethod: PaymentMethod;
  paymentDetails: PaymentDetails;
  tradeIn?: TradeInItem;
  customer?: CustomerInfo;
  status: 'completed' | 'cancelled';
  notes?: string;
}

export interface Budget {
  id: string;
  code: string;
  date: string;
  validUntil: string;
  branchId?: string;
  sellerId?: string;
  customer: CustomerInfo;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: 'open' | 'approved' | 'rejected' | 'converted';
  notes?: string;
  convertedSaleId?: string;
}

export interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  branchId?: string;
  status: 'paid' | 'pending';
  paymentMethod?: string;
}

export interface CashEntry {
  id: string;
  timestamp: string;
  type: 'sale' | 'supply' | 'bleed' | 'expense';
  amount: number;
  description: string;
  branchId?: string;
  referenceId?: string;
}

export interface CashRegister {
  isOpen: boolean;
  branchId?: string;
  openedAt?: string;
  closedAt?: string;
  initialAmount: number;
  currentAmount: number;
  entries: CashEntry[];
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out' | 'adjustment' | 'sale' | 'cancellation' | 'transfer';
  quantity: number;
  previousStock: number;
  newStock: number;
  branchId?: string;
  reason: string;
  date: string;
}

export interface TransferRecord {
  id: string;
  code: string;
  date: string;
  productId: string;
  productName: string;
  quantity: number;
  sourceBranchId: string;
  sourceBranchName: string;
  targetBranchId: string;
  targetBranchName: string;
  responsibleName: string;
  reason?: string;
  status: 'completed' | 'cancelled';
}

export interface PricingCalculation {
  costPrice: number;
  fixedCostsPercent: number;
  variableCostsPercent: number; // Impostos, comissões
  cardFeePercent: number;
  desiredProfitMarginPercent: number;
  suggestedSellingPrice: number;
  markupMultiplier: number;
  grossMarginAmount: number;
  netProfitAmount: number;
  netProfitPercent: number;
  breakEvenMonthlyFixedCost?: number;
  breakEvenUnits?: number;
  breakEvenRevenue?: number;
}

export type SystemFont = 'plus-jakarta' | 'outfit' | 'inter' | 'space-grotesk' | 'jetbrains';
export type SystemColorTheme = 'indigo' | 'emerald' | 'amber' | 'cyan' | 'rose';
export type LayoutWidth = 'normal' | 'ultrawide';

export interface StoreSettings {
  storeName: string;
  document: string;
  phone: string;
  address: string;
  receiptFooter: string;
  currencySymbol: string;
  darkMode: boolean;
  currentBranchId: string;
  currentSellerId: string;
  userRole: 'Administrador' | 'Gerente' | 'Vendedor';
  fontFamily?: SystemFont;
  colorTheme?: SystemColorTheme;
  layoutWidth?: LayoutWidth;
  defaultCardRates: {
    debit: number;
    creditCash: number;
    credit2xTo6x: number;
    credit7xTo12x: number;
  };
}

export interface CustomerVIP {
  id: string;
  name: string;
  phone: string;
  document?: string;
  email?: string;
  totalSpent: number;
  salesCount: number;
  pointsBalance: number;
  cashbackBalance: number;
  loyaltyTier: 'Bronze' | 'Prata' | 'Ouro' | 'Diamante';
  lastPurchaseDate?: string;
  churnRisk: 'Baixo' | 'Médio' | 'Alto';
  preferredCategory?: string;
  notes?: string;
}

export type ServiceOrderStatus =
  | 'Aguardando Avaliação'
  | 'Em Diagnóstico'
  | 'Aguardando Peça'
  | 'Em Execução'
  | 'Pronto para Retirada'
  | 'Entregue / Concluído'
  | 'Cancelado';

export interface ServiceOrder {
  id: string;
  code: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerDocument?: string;
  deviceModel: string;
  deviceImei?: string;
  deviceColor?: string;
  devicePassword?: string;
  accessoriesLeft?: string;
  reportedDefect: string;
  technicalDiagnosis?: string;
  technicianName: string;
  status: ServiceOrderStatus;
  priority: 'Normal' | 'Alta' | 'Urgente';
  laborCost: number;
  partsCost: number;
  totalAmount: number;
  warrantyDays: number;
  notes?: string;
  completedAt?: string;
  branchId?: string;
}

export interface SmartBundle {
  id: string;
  name: string;
  description: string;
  productIds: string[];
  originalPrice: number;
  bundlePrice: number;
  discountPercent: number;
  combinedMarginPercent: number;
  tag?: string;
}

export interface AIAnalysisResult {
  summary: string;
  kpiHealth: 'excelente' | 'atencao' | 'critico';
  insights: {
    title: string;
    description: string;
    type: 'positive' | 'warning' | 'tip';
    actionRecommendation?: string;
  }[];
  salesForecast: {
    projectedRevenue: number;
    projectedVolume: number;
    confidence: number;
    trend: 'crescimento' | 'estavel' | 'queda';
    recommendation: string;
  };
  inventoryAlerts: {
    item: string;
    status: 'ruptura' | 'excesso' | 'ideal';
    recommendation: string;
  }[];
  strategicActions: string[];
}

