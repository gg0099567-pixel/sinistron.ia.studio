import React, { useState, useMemo } from 'react';
import {
  Product,
  Sale,
  SaleItem,
  PaymentMethod,
  CustomerInfo,
  StoreSettings,
  Branch,
  Seller,
  TradeInItem,
  FinancingDetails,
} from '../types';
import { formatCurrency, formatPercent, generateCode } from '../utils/formatters';
import { simulateCardRates } from '../utils/calculators';
import confetti from 'canvas-confetti';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  User,
  CreditCard,
  Banknote,
  QrCode,
  FileText,
  Clock,
  Sparkles,
  Printer,
  CheckCircle2,
  AlertCircle,
  PackageCheck,
  ChevronRight,
  Receipt,
  Layers,
  Smartphone,
  RefreshCw,
  Zap,
} from 'lucide-react';

interface POSViewProps {
  products: Product[];
  settings: StoreSettings;
  branches: Branch[];
  sellers: Seller[];
  currentBranchId: string;
  currentSellerId: string;
  onCompleteSale: (sale: Sale) => void;
  onOpenReceipt: (sale: Sale) => void;
}

export const POSView: React.FC<POSViewProps> = ({
  products,
  settings,
  branches,
  sellers,
  currentBranchId,
  currentSellerId,
  onCompleteSale,
  onOpenReceipt,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [customer, setCustomer] = useState<CustomerInfo>({ name: '', phone: '', document: '' });
  const [showCustomerInput, setShowCustomerInput] = useState(false);

  // Selected Branch and Seller for the sale
  const [saleBranchId, setSaleBranchId] = useState<string>(currentBranchId || branches[0]?.id || '');
  const [saleSellerId, setSaleSellerId] = useState<string>(currentSellerId || sellers[0]?.id || '');

  React.useEffect(() => {
    if (sellers.length > 0 && (!saleSellerId || !sellers.some((s) => s.id === saleSellerId))) {
      setSaleSellerId(sellers[0].id);
    }
  }, [sellers, saleSellerId]);

  React.useEffect(() => {
    if (branches.length > 0 && (!saleBranchId || !branches.some((b) => b.id === saleBranchId))) {
      setSaleBranchId(branches[0].id);
    }
  }, [branches, saleBranchId]);

  // Discount and Addition
  const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [additionValue, setAdditionValue] = useState<number>(0);
  const [saleNotes, setSaleNotes] = useState('');

  // Trade-in (Aparelho Usado / Seminovo na troca)
  const [hasTradeIn, setHasTradeIn] = useState(false);
  const [tradeInItem, setTradeInItem] = useState<TradeInItem>({
    model: '',
    imei: '',
    evaluationValue: 0,
    condition: 'Bom',
    notes: '',
  });

  // Financing (PayMobi / CDC)
  const [financingDetails, setFinancingDetails] = useState<FinancingDetails>({
    provider: 'PayMobi',
    installments: 12,
    entryAmount: 0,
    entryPaymentMethod: 'pix',
    financedAmount: 0,
    contractNumber: '',
  });

  // Payment State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [installments, setInstallments] = useState<number>(1);
  const [passCardFeeToCustomer, setPassCardFeeToCustomer] = useState(false);

  // Categories list
  const categories = useMemo(() => {
    const defaultCats = [
      'Todos',
      'Aparelho Novo',
      'Aparelho Usado',
      'Capas',
      'Películas',
      'Outros Acessórios',
      'Eletrônicos',
      'Serviços',
    ];
    const itemCats = Array.from(new Set(products.map((p) => p.category || 'Geral')));
    return Array.from(new Set([...defaultCats, ...itemCats]));
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.imei && p.imei.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchCat = selectedCategory === 'Todos' || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [products, searchTerm, selectedCategory]);

  // Cart Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.total, 0);
  }, [cart]);

  const costTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.costPrice * item.quantity, 0);
  }, [cart]);

  const calculatedDiscount = useMemo(() => {
    let disc = 0;
    if (discountType === 'percent') {
      disc = (subtotal * (discountValue || 0)) / 100;
    } else {
      disc = Math.min(discountValue || 0, subtotal);
    }
    // Add Trade-in evaluation value if active
    if (hasTradeIn && tradeInItem.evaluationValue > 0) {
      disc += Math.min(tradeInItem.evaluationValue, subtotal - disc);
    }
    return disc;
  }, [subtotal, discountType, discountValue, hasTradeIn, tradeInItem]);

  const baseTotal = Math.max(0, subtotal - calculatedDiscount + (additionValue || 0));

  // Card fee simulations
  const cardSimulations = useMemo(() => {
    return simulateCardRates(
      baseTotal,
      settings.defaultCardRates.debit,
      settings.defaultCardRates.creditCash,
      {
        2: settings.defaultCardRates.credit2xTo6x,
        3: settings.defaultCardRates.credit2xTo6x,
        4: settings.defaultCardRates.credit2xTo6x,
        5: settings.defaultCardRates.credit2xTo6x,
        6: settings.defaultCardRates.credit2xTo6x,
        7: settings.defaultCardRates.credit7xTo12x,
        8: settings.defaultCardRates.credit7xTo12x,
        9: settings.defaultCardRates.credit7xTo12x,
        10: settings.defaultCardRates.credit7xTo12x,
        11: settings.defaultCardRates.credit7xTo12x,
        12: settings.defaultCardRates.credit7xTo12x,
      }
    );
  }, [baseTotal, settings]);

  const currentSimulation = cardSimulations.find((s) => s.installments === installments);

  // Final Total depending on fee pass-through
  const finalTotal = useMemo(() => {
    if (paymentMethod === 'cartao_credito' && passCardFeeToCustomer && currentSimulation) {
      return currentSimulation.passedPriceTotal;
    }
    return baseTotal;
  }, [paymentMethod, passCardFeeToCustomer, currentSimulation, baseTotal]);

  // Cart actions
  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert(`Produto "${product.name}" sem estoque disponível.`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`Limite de estoque atingido (${product.stock} unidades).`);
          return prev;
        }
        return prev.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.unitPrice,
              }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          code: product.code,
          category: product.category,
          quantity: 1,
          unitPrice: product.sellingPrice,
          costPrice: product.costPrice,
          discount: 0,
          total: product.sellingPrice,
          imei: product.imei,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, qty: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    if (qty > prod.stock) {
      alert(`Estoque insuficiente. Disponível: ${prod.stock}`);
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: qty,
              total: qty * item.unitPrice,
            }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    if (cart.length > 0 && window.confirm('Deseja limpar todos os itens do carrinho?')) {
      setCart([]);
      setDiscountValue(0);
      setAdditionValue(0);
      setHasTradeIn(false);
      setCustomer({ name: '', phone: '', document: '' });
    }
  };

  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    setCashReceived(Math.ceil(finalTotal));
    // Calculate default financed balance
    setFinancingDetails((prev) => ({
      ...prev,
      financedAmount: Math.max(0, finalTotal - prev.entryAmount),
    }));
    setIsCheckoutOpen(true);
  };

  const handleFinalizeSale = () => {
    if (cart.length === 0) return;

    // Check payment validation
    if (paymentMethod === 'dinheiro' && cashReceived < finalTotal) {
      alert('O valor recebido em dinheiro é inferior ao total da venda.');
      return;
    }

    const cardFee =
      paymentMethod === 'cartao_credito'
        ? currentSimulation?.ratePercent || 0
        : paymentMethod === 'cartao_debito'
        ? settings.defaultCardRates.debit
        : 0;

    const netReceived =
      paymentMethod === 'cartao_credito'
        ? passCardFeeToCustomer
          ? baseTotal
          : finalTotal * (1 - cardFee / 100)
        : paymentMethod === 'cartao_debito'
        ? finalTotal * (1 - cardFee / 100)
        : paymentMethod === 'paymobi'
        ? financingDetails.entryAmount // Store receives the entry at store checkout
        : finalTotal;

    const activeBranchObj = branches.find((b) => b.id === saleBranchId);
    const activeSellerObj = sellers.find((s) => s.id === saleSellerId);

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      code: generateCode('VD'),
      date: new Date().toISOString(),
      branchId: saleBranchId || branches[0]?.id || 'branch-embu',
      branchName: activeBranchObj?.name || 'Embu das artes',
      sellerId: saleSellerId || sellers[0]?.id || 'seller-guilherme',
      sellerName: activeSellerObj?.name || 'Guilherme Gomes',
      items: [...cart],
      subtotal,
      discount: calculatedDiscount,
      addition: additionValue || 0,
      total: finalTotal,
      costTotal,
      grossProfit: finalTotal - costTotal,
      paymentMethod,
      paymentDetails: {
        method: paymentMethod,
        installments: paymentMethod === 'cartao_credito' ? installments : 1,
        receivedAmount: paymentMethod === 'dinheiro' ? cashReceived : finalTotal,
        changeAmount:
          paymentMethod === 'dinheiro' ? Math.max(0, cashReceived - finalTotal) : 0,
        cardFeePercent: cardFee,
        netReceived,
        financing:
          paymentMethod === 'paymobi'
            ? {
                ...financingDetails,
                financedAmount: Math.max(0, finalTotal - financingDetails.entryAmount),
              }
            : undefined,
      },
      tradeIn: hasTradeIn && tradeInItem.model ? tradeInItem : undefined,
      customer: customer.name.trim() ? customer : undefined,
      status: 'completed',
      notes: saleNotes.trim() || undefined,
    };

    onCompleteSale(newSale);

    // Confetti effect!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    setIsCheckoutOpen(false);
    setCart([]);
    setDiscountValue(0);
    setAdditionValue(0);
    setHasTradeIn(false);
    setCustomer({ name: '', phone: '', document: '' });
    setSaleNotes('');

    // Open receipt modal
    onOpenReceipt(newSale);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Product Catalog / Quick Add (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search and Category Filters */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="input-search-pos-products"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar produto por nome, código SKU, IMEI ou categoria..."
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-2">
                <PackageCheck className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                  Nenhum item localizado
                </h4>
                <p className="text-xs text-slate-400">
                  Cadastre novos produtos na aba "Produtos & Ativos" ou ajuste sua busca.
                </p>
              </div>
            ) : (
              filteredProducts.map((p) => {
                const inCart = cart.find((i) => i.productId === p.id);
                const isOutOfStock = p.stock <= 0;

                return (
                  <div
                    key={p.id}
                    onClick={() => !isOutOfStock && addToCart(p)}
                    className={`relative p-3.5 rounded-2xl border transition text-left flex flex-col justify-between cursor-pointer ${
                      isOutOfStock
                        ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900 truncate max-w-[120px]">
                          {p.category || 'Geral'}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                            p.stock <= p.minStock
                              ? 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {p.stock} {p.unit}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 dark:text-white text-xs leading-snug line-clamp-2">
                        {p.name}
                      </h4>
                      {p.imei && (
                        <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                          IMEI: {p.imei}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Preço de Venda</span>
                        <span className="text-sm font-black text-indigo-950 dark:text-white">
                          {formatCurrency(p.sellingPrice)}
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={isOutOfStock}
                        className="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white flex items-center justify-center shadow-xs transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {inCart && (
                      <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                        {inCart.quantity}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Checkout Cart Panel (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
          {/* Cart Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Carrinho de Vendas ({cart.length})
              </h3>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Limpar
              </button>
            )}
          </div>

          {/* Branch & Seller Attribution in Cart */}
          <div className="p-3 bg-indigo-50/40 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900/40 grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-0.5">
                Filial da Venda:
              </label>
              <select
                value={saleBranchId}
                onChange={(e) => setSaleBranchId(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-0.5">
                Vendedor:
              </label>
              <select
                value={saleSellerId}
                onChange={(e) => setSaleSellerId(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {sellers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Customer Input Accordion */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30">
            <button
              onClick={() => setShowCustomerInput(!showCustomerInput)}
              className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 flex items-center justify-between w-full cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-500" />
                {customer.name ? `Cliente: ${customer.name}` : 'Identificar Cliente (Opcional)'}
              </span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400">
                {showCustomerInput ? 'Ocultar' : 'Informar'}
              </span>
            </button>

            {showCustomerInput && (
              <div className="mt-2.5 space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                <input
                  type="text"
                  placeholder="Nome do Cliente"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Telefone / WhatsApp"
                    value={customer.phone || ''}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="CPF / CNPJ"
                    value={customer.document || ''}
                    onChange={(e) => setCustomer({ ...customer, document: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="p-3 space-y-2 flex-1 max-h-[300px] overflow-y-auto">
            {cart.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs space-y-1">
                <ShoppingCart className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 opacity-50" />
                <p>Nenhum item adicionado ao carrinho.</p>
                <p className="text-[10px]">Clique em um produto ao lado para vender.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.productId}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/70 dark:border-slate-700 flex items-center justify-between gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {item.productName}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {formatCurrency(item.unitPrice)} un.
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300 cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold px-1.5 text-slate-800 dark:text-slate-200">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-right min-w-[70px]">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {formatCurrency(item.total)}
                    </p>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Trade-in Section (Troca de Aparelho Usado) */}
          {cart.length > 0 && (
            <div className="p-3 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasTradeIn}
                    onChange={(e) => setHasTradeIn(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                  Trade-in (Entrada de Usado na Troca)
                </label>
                {hasTradeIn && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Abatimento: -{formatCurrency(tradeInItem.evaluationValue || 0)}
                  </span>
                )}
              </div>

              {hasTradeIn && (
                <div className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 block mb-0.5">
                        Modelo Usado:
                      </span>
                      <input
                        type="text"
                        placeholder="Ex: iPhone 11 64GB"
                        value={tradeInItem.model}
                        onChange={(e) =>
                          setTradeInItem({ ...tradeInItem, model: e.target.value })
                        }
                        className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-500 block mb-0.5">
                        Valor Avaliação (R$):
                      </span>
                      <input
                        type="number"
                        min="0"
                        placeholder="0.00"
                        value={tradeInItem.evaluationValue || ''}
                        onChange={(e) =>
                          setTradeInItem({
                            ...tradeInItem,
                            evaluationValue: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-bold text-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 block mb-0.5">
                        IMEI Usado:
                      </span>
                      <input
                        type="text"
                        placeholder="IMEI (Opcional)"
                        value={tradeInItem.imei || ''}
                        onChange={(e) =>
                          setTradeInItem({ ...tradeInItem, imei: e.target.value })
                        }
                        className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono text-[11px]"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-500 block mb-0.5">
                        Estado:
                      </span>
                      <select
                        value={tradeInItem.condition}
                        onChange={(e) =>
                          setTradeInItem({
                            ...tradeInItem,
                            condition: e.target.value as any,
                          })
                        }
                        className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                      >
                        <option value="Excelente">Excelente</option>
                        <option value="Bom">Bom</option>
                        <option value="Marcas de Uso">Marcas de Uso</option>
                        <option value="Avariado">Avariado</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Discount & Addition inputs */}
          {cart.length > 0 && (
            <div className="p-3 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Desconto */}
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Desconto:</span>
                    <div className="flex gap-1 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setDiscountType('fixed')}
                        className={`px-1.5 py-0.2 rounded ${
                          discountType === 'fixed'
                            ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 font-bold'
                            : 'text-slate-500'
                        }`}
                      >
                        R$
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiscountType('percent')}
                        className={`px-1.5 py-0.2 rounded ${
                          discountType === 'percent'
                            ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 font-bold'
                            : 'text-slate-500'
                        }`}
                      >
                        %
                      </button>
                    </div>
                  </div>
                  <input
                    id="input-sale-discount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={discountValue || ''}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Acréscimo */}
                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-medium block mb-0.5">
                    Acréscimo (R$):
                  </span>
                  <input
                    id="input-sale-addition"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={additionValue || ''}
                    onChange={(e) => setAdditionValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Cart Summary & Checkout Trigger */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Subtotal ({cart.reduce((a, b) => a + b.quantity, 0)} itens):</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {calculatedDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Desconto Total (com Trade-in):</span>
                  <span>-{formatCurrency(calculatedDiscount)}</span>
                </div>
              )}
              {additionValue > 0 && (
                <div className="flex justify-between text-amber-600 font-medium">
                  <span>Acréscimo:</span>
                  <span>+{formatCurrency(additionValue)}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-sm font-bold text-slate-900 dark:text-white">Total a Pagar:</span>
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                  {formatCurrency(baseTotal)}
                </span>
              </div>
            </div>

            <button
              id="btn-open-checkout"
              disabled={cart.length === 0}
              onClick={handleOpenCheckout}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition cursor-pointer ${
                cart.length === 0
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Finalizar Venda / Pagamento
            </button>
          </div>
        </div>
      </div>

      {/* Checkout / Payment Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Recebimento & Pagamento
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Selecione a forma de pagamento e confira os valores
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Total da Venda</span>
                <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                  {formatCurrency(finalTotal)}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-5 max-h-[500px] overflow-y-auto">
              {/* Payment Methods Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Forma de Pagamento:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'pix' as PaymentMethod, label: 'PIX', icon: QrCode },
                    { id: 'dinheiro' as PaymentMethod, label: 'Dinheiro', icon: Banknote },
                    {
                      id: 'cartao_credito' as PaymentMethod,
                      label: 'Crédito',
                      icon: CreditCard,
                    },
                    {
                      id: 'cartao_debito' as PaymentMethod,
                      label: 'Débito',
                      icon: CreditCard,
                    },
                    {
                      id: 'paymobi' as PaymentMethod,
                      label: 'PayMobi / CDC',
                      icon: Zap,
                    },
                    { id: 'boleto' as PaymentMethod, label: 'Boleto', icon: FileText },
                  ].map((method) => {
                    const Icon = method.icon;
                    const isSelected = paymentMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-300 ring-2 ring-indigo-500/20 font-bold'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 font-medium'
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}
                        />
                        <span className="text-xs">{method.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PayMobi / Financiamento */}
              {paymentMethod === 'paymobi' && (
                <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-950 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                      <Zap className="w-4 h-4 text-amber-500" />
                      Puxada Financiadora PayMobi
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Saldo Financiado:{' '}
                      {formatCurrency(Math.max(0, finalTotal - financingDetails.entryAmount))}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Valor da Entrada Paga na Loja (R$)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={finalTotal}
                        value={financingDetails.entryAmount || ''}
                        onChange={(e) =>
                          setFinancingDetails({
                            ...financingDetails,
                            entryAmount: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="0.00"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Forma de Pagamento da Entrada
                      </label>
                      <select
                        value={financingDetails.entryPaymentMethod}
                        onChange={(e) =>
                          setFinancingDetails({
                            ...financingDetails,
                            entryPaymentMethod: e.target.value as any,
                          })
                        }
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      >
                        <option value="pix">⚡ PIX</option>
                        <option value="dinheiro">💵 Dinheiro</option>
                        <option value="cartao_debito">💳 Débito</option>
                        <option value="cartao_credito">💳 Crédito</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Número de Parcelas CDC
                      </label>
                      <select
                        value={financingDetails.installments}
                        onChange={(e) =>
                          setFinancingDetails({
                            ...financingDetails,
                            installments: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-semibold"
                      >
                        <option value={6}>6x Parcelas</option>
                        <option value={12}>12x Parcelas</option>
                        <option value={18}>18x Parcelas</option>
                        <option value={24}>24x Parcelas</option>
                        <option value={36}>36x Parcelas</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Nº Contrato / Proposta
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: PM-89421"
                        value={financingDetails.contractNumber || ''}
                        onChange={(e) =>
                          setFinancingDetails({
                            ...financingDetails,
                            contractNumber: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    ℹ️ O valor da entrada computa diretamente no caixa da filial, e o saldo financiado será liquidado via PayMobi.
                  </p>
                </div>
              )}

              {/* Dinheiro (Troco) */}
              {paymentMethod === 'dinheiro' && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Valor Recebido (R$)
                      </label>
                      <input
                        id="input-cash-received"
                        type="number"
                        step="0.01"
                        min={finalTotal}
                        value={cashReceived || ''}
                        onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 text-base font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Troco a Devolver
                      </label>
                      <div className="w-full px-3 py-2 text-base font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                        {formatCurrency(Math.max(0, cashReceived - finalTotal))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PIX Quick Code */}
              {paymentMethod === 'pix' && (
                <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-4">
                  <div className="w-24 h-24 bg-white p-2 border border-emerald-200 rounded-lg flex items-center justify-center shadow-xs">
                    <QrCode className="w-20 h-20 text-slate-800" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider block">
                      PIX Instantâneo
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Chave CNPJ: <span className="font-mono font-semibold">{settings.document || '00.000.000/0001-00'}</span>
                    </p>
                    <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400">
                      Valor exato: {formatCurrency(finalTotal)}
                    </p>
                    <span className="inline-block px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold rounded">
                      Sem taxa de intermediação
                    </span>
                  </div>
                </div>
              )}

              {/* Cartão de Crédito - Parcelas e Simulador */}
              {paymentMethod === 'cartao_credito' && (
                <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Número de Parcelas:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="check-pass-fee"
                        checked={passCardFeeToCustomer}
                        onChange={(e) => setPassCardFeeToCustomer(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="check-pass-fee" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                        Repassar taxa para o cliente
                      </label>
                    </div>
                  </div>

                  <select
                    id="select-card-installments"
                    value={installments}
                    onChange={(e) => setInstallments(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                  >
                    {cardSimulations.map((s) => (
                      <option key={s.installments} value={s.installments}>
                        {s.installments}x de{' '}
                        {formatCurrency(
                          passCardFeeToCustomer
                            ? s.passedInstallmentValue
                            : s.installmentValueCustomerPays
                        )}{' '}
                        (Taxa: {formatPercent(s.ratePercent)} - Total:{' '}
                        {formatCurrency(
                          passCardFeeToCustomer ? s.passedPriceTotal : s.totalCustomerPays
                        )}
                        )
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Observações do Pedido / Cupom
                </label>
                <input
                  type="text"
                  value={saleNotes}
                  onChange={(e) => setSaleNotes(e.target.value)}
                  placeholder="Ex: Entregar com capa e película instalada..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer"
              >
                Voltar ao Carrinho
              </button>
              <button
                id="btn-confirm-finalize-sale"
                type="button"
                onClick={handleFinalizeSale}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirmar Venda e Emitir Cupom
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
