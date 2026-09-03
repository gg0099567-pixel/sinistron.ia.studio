import React, { useState, useEffect } from 'react';
import {
  Product,
  Sale,
  Budget,
  Expense,
  CashRegister,
  StockMovement,
  StoreSettings,
  CashEntry,
  Branch,
  Seller,
  TransferRecord,
  ServiceOrder,
  CustomerVIP,
  SmartBundle,
} from './types';
import {
  StorageService,
  SAMPLE_STARTER_PRODUCTS,
  SAMPLE_STARTER_SERVICE_ORDERS,
  SAMPLE_STARTER_VIP_CUSTOMERS,
  INITIAL_SMART_BUNDLES,
} from './utils/storage';
import { generateCode } from './utils/formatters';
import { Navbar, ActiveTab } from './components/Navbar';
import { ExecutiveDashboardView } from './components/ExecutiveDashboardView';
import { InnovationsHubView } from './components/InnovationsHubView';
import { TeamRankingView } from './components/TeamRankingView';
import { TransfersView } from './components/TransfersView';
import { POSView } from './components/POSView';
import { CalculatorsView } from './components/CalculatorsView';
import { InventoryView } from './components/InventoryView';
import { SalesHistoryView } from './components/SalesHistoryView';
import { BudgetsView } from './components/BudgetsView';
import { CashRegisterView } from './components/CashRegisterView';
import { AnalyticsView } from './components/AnalyticsView';
import { ReceiptModal } from './components/ReceiptModal';
import { ProductModal } from './components/ProductModal';
import { SettingsModal } from './components/SettingsModal';
import { AIAssistantModal } from './components/AIAssistantModal';
import { UserAccessModal } from './components/UserAccessModal';
import { LoginScreen } from './components/LoginScreen';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Core Data States with localStorage initializers
  const [products, setProducts] = useState<Product[]>(() => StorageService.getProducts());
  const [sales, setSales] = useState<Sale[]>(() => StorageService.getSales());
  const [budgets, setBudgets] = useState<Budget[]>(() => StorageService.getBudgets());
  const [expenses, setExpenses] = useState<Expense[]>(() => StorageService.getExpenses());
  const [cashRegister, setCashRegister] = useState<CashRegister>(() =>
    StorageService.getCashRegister()
  );
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() =>
    StorageService.getStockMovements()
  );
  const [settings, setSettings] = useState<StoreSettings>(() => StorageService.getSettings());

  // Multi-Branch & Team States
  const [branches, setBranches] = useState<Branch[]>(() => StorageService.getBranches());
  const [sellers, setSellers] = useState<Seller[]>(() => StorageService.getSellers());
  const [transfers, setTransfers] = useState<TransferRecord[]>(() => StorageService.getTransfers());

  // Innovation States (O.S. / VIP / Combos)
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>(() =>
    StorageService.getServiceOrders()
  );
  const [vipCustomers, setVipCustomers] = useState<CustomerVIP[]>(() =>
    StorageService.getVIPCustomers()
  );
  const [smartBundles, setSmartBundles] = useState<SmartBundle[]>(() =>
    StorageService.getSmartBundles()
  );

  // Active Context
  const [currentBranchId, setCurrentBranchId] = useState<string>(() => {
    return branches[0]?.id || 'branch-matriz';
  });
  const [currentSellerId, setCurrentSellerId] = useState<string>(() => {
    return sellers[0]?.id || 'seller-admin';
  });
  const [userRole, setUserRole] = useState<'Administrador' | 'Gerente' | 'Vendedor'>('Administrador');

  // Tema Único e Exclusivo: Preto e Roxo Escuro
  const darkMode = true;

  // Apply dark mode class to root permanently
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dark', 'theme-dark');
    localStorage.setItem('sinistron_theme', 'dark');
  }, []);

  // Modal States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [receiptSale, setReceiptSale] = useState<Sale | null>(null);
  const [receiptBudget, setReceiptBudget] = useState<Budget | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Starter catalog loader
  const handleLoadStarterCatalog = () => {
    setProducts(SAMPLE_STARTER_PRODUCTS);
    StorageService.saveProducts(SAMPLE_STARTER_PRODUCTS);
    setServiceOrders(SAMPLE_STARTER_SERVICE_ORDERS);
    StorageService.saveServiceOrders(SAMPLE_STARTER_SERVICE_ORDERS);
    setVipCustomers(SAMPLE_STARTER_VIP_CUSTOMERS);
    StorageService.saveVIPCustomers(SAMPLE_STARTER_VIP_CUSTOMERS);
    setSmartBundles(INITIAL_SMART_BUNDLES);
    StorageService.saveSmartBundles(INITIAL_SMART_BUNDLES);
  };

  // Dynamic Font Class
  const getFontFamilyStyle = () => {
    switch (settings.fontFamily) {
      case 'plus-jakarta':
        return { fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' };
      case 'space-grotesk':
        return { fontFamily: '"Space Grotesk", system-ui, sans-serif' };
      case 'inter':
        return { fontFamily: '"Inter", system-ui, sans-serif' };
      case 'jetbrains':
        return { fontFamily: '"JetBrains Mono", monospace' };
      case 'outfit':
      default:
        return { fontFamily: '"Outfit", system-ui, sans-serif' };
    }
  };

  // Sync to Storage on changes
  useEffect(() => {
    StorageService.saveProducts(products);
  }, [products]);

  useEffect(() => {
    StorageService.saveSales(sales);
  }, [sales]);

  useEffect(() => {
    StorageService.saveBudgets(budgets);
  }, [budgets]);

  useEffect(() => {
    StorageService.saveExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    StorageService.saveCashRegister(cashRegister);
  }, [cashRegister]);

  useEffect(() => {
    StorageService.saveStockMovements(stockMovements);
  }, [stockMovements]);

  useEffect(() => {
    StorageService.saveServiceOrders(serviceOrders);
  }, [serviceOrders]);

  useEffect(() => {
    StorageService.saveVIPCustomers(vipCustomers);
  }, [vipCustomers]);

  useEffect(() => {
    StorageService.saveSmartBundles(smartBundles);
  }, [smartBundles]);

  useEffect(() => {
    StorageService.saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    StorageService.saveBranches(branches);
  }, [branches]);

  useEffect(() => {
    StorageService.saveSellers(sellers);
  }, [sellers]);

  useEffect(() => {
    StorageService.saveTransfers(transfers);
  }, [transfers]);

  // Today Sales Sum for quick indicator
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todaySalesTotal = sales
    .filter((s) => s.status === 'completed' && s.date.startsWith(todayDateStr))
    .reduce((acc, s) => acc + s.total, 0);

  // 1. Complete Sale handler (Decrease stock & register cash if applicable)
  const handleCompleteSale = (newSale: Sale) => {
    // 1. Add sale
    setSales((prev) => [newSale, ...prev]);

    // 2. Decrease product stock & log movements
    const movementsToAdd: StockMovement[] = [];
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const soldItem = newSale.items.find((item) => item.productId === p.id);
        if (soldItem) {
          const nextStock = Math.max(0, p.stock - soldItem.quantity);
          movementsToAdd.push({
            id: `mov-sale-${Date.now()}-${p.id}`,
            productId: p.id,
            productName: p.name,
            type: 'sale',
            quantity: soldItem.quantity,
            previousStock: p.stock,
            newStock: nextStock,
            reason: `Venda ${newSale.code} (${newSale.branchName || 'Filial'})`,
            date: new Date().toISOString(),
          });
          return { ...p, stock: nextStock };
        }
        return p;
      })
    );

    if (movementsToAdd.length > 0) {
      setStockMovements((prev) => [...movementsToAdd, ...prev]);
    }

    // 3. Register cash entry if register is open and payment is in cash or paymobi entry
    if (cashRegister.isOpen) {
      const isCash = newSale.paymentMethod === 'dinheiro';
      const isPayMobiEntryInCash =
        newSale.paymentMethod === 'paymobi' &&
        newSale.paymentDetails?.financing?.entryPaymentMethod === 'dinheiro';

      const entryAmount = isCash
        ? newSale.total
        : isPayMobiEntryInCash
        ? newSale.paymentDetails?.financing?.entryAmount || 0
        : 0;

      if (entryAmount > 0) {
        const cashEntry: CashEntry = {
          id: `cash-entry-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'sale',
          amount: entryAmount,
          description: `Venda ${newSale.paymentMethod.toUpperCase()} ${newSale.code}`,
          referenceId: newSale.id,
        };

        setCashRegister((prev) => ({
          ...prev,
          currentAmount: prev.currentAmount + entryAmount,
          entries: [cashEntry, ...prev.entries],
        }));
      }
    }
  };

  // 2. Cancel Sale Handler (Restore product stock)
  const handleCancelSale = (saleId: string) => {
    const targetSale = sales.find((s) => s.id === saleId);
    if (!targetSale) return;

    // Mark as cancelled
    setSales((prev) =>
      prev.map((s) => (s.id === saleId ? { ...s, status: 'cancelled' } : s))
    );

    // Return items to stock
    const restockMovements: StockMovement[] = [];
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const itemToReturn = targetSale.items.find((i) => i.productId === p.id);
        if (itemToReturn) {
          const nextStock = p.stock + itemToReturn.quantity;
          restockMovements.push({
            id: `mov-cancel-${Date.now()}-${p.id}`,
            productId: p.id,
            productName: p.name,
            type: 'cancellation',
            quantity: itemToReturn.quantity,
            previousStock: p.stock,
            newStock: nextStock,
            reason: `Estorno de venda cancelada ${targetSale.code}`,
            date: new Date().toISOString(),
          });
          return { ...p, stock: nextStock };
        }
        return p;
      })
    );

    if (restockMovements.length > 0) {
      setStockMovements((prev) => [...restockMovements, ...prev]);
    }

    // If cash register is open and sale was in cash, log bleed or adjust
    if (cashRegister.isOpen && targetSale.paymentMethod === 'dinheiro') {
      const cancelEntry: CashEntry = {
        id: `cash-cancel-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'bleed',
        amount: targetSale.total,
        description: `Estorno Venda ${targetSale.code}`,
        referenceId: targetSale.id,
      };
      setCashRegister((prev) => ({
        ...prev,
        currentAmount: Math.max(0, prev.currentAmount - targetSale.total),
        entries: [cancelEntry, ...prev.entries],
      }));
    }
  };

  // 3. Stock Movement manual record
  const handleRecordStockMovement = (movement: StockMovement, updatedProduct: Product) => {
    setStockMovements((prev) => [movement, ...prev]);
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  // 4. Transfers between branches
  const handleCompleteTransfer = (newTransfer: TransferRecord) => {
    setTransfers((prev) => [newTransfer, ...prev]);

    // Log movement in stock
    const targetProduct = products.find((p) => p.id === newTransfer.productId);
    if (targetProduct) {
      const transferMovement: StockMovement = {
        id: `mov-trf-${Date.now()}`,
        productId: targetProduct.id,
        productName: targetProduct.name,
        type: 'transfer',
        quantity: newTransfer.quantity,
        previousStock: targetProduct.stock,
        newStock: targetProduct.stock, // Local inventory balance remains preserved or tracked by branch
        reason: `Transferência ${newTransfer.code}: ${newTransfer.sourceBranchName} ➔ ${newTransfer.targetBranchName}`,
        date: new Date().toISOString(),
      };
      setStockMovements((prev) => [transferMovement, ...prev]);
    }
  };

  // 5. Save/Delete Product
  const handleSaveProduct = (prod: Product) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === prod.id);
      if (exists) {
        return prev.map((p) => (p.id === prod.id ? prod : p));
      }
      return [prod, ...prev];
    });
  };

  const handleSaveCalculatedProduct = (partialProd: Partial<Product>) => {
    const newProd: Product = {
      id: `prod-${Date.now()}`,
      code: generateCode('SKU'),
      name: partialProd.name || 'Novo Produto',
      category: partialProd.category || 'Geral',
      costPrice: partialProd.costPrice || 0,
      sellingPrice: partialProd.sellingPrice || 0,
      stock: 10,
      minStock: 3,
      unit: 'UN',
      branchId: currentBranchId,
      createdAt: new Date().toISOString(),
    };
    handleSaveProduct(newProd);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  // 6. Sellers CRUD
  const handleSaveSeller = (seller: Seller) => {
    setSellers((prev) => {
      const exists = prev.some((s) => s.id === seller.id);
      if (exists) {
        return prev.map((s) => (s.id === seller.id ? seller : s));
      }
      return [seller, ...prev];
    });
  };

  const handleDeleteSeller = (sellerId: string) => {
    if (userRole !== 'Administrador') {
      alert('Acesso Restrito: Apenas o Administrador possui autorização para desligar ou remover colaboradores.');
      return;
    }
    if (sellers.length <= 1) {
      alert('É necessário manter pelo menos um colaborador cadastrado no sistema.');
      return;
    }
    setSellers((prev) => {
      const updated = prev.filter((s) => s.id !== sellerId);
      if (currentSellerId === sellerId && updated.length > 0) {
        setCurrentSellerId(updated[0].id);
      }
      return updated;
    });
  };

  // 7. Branches CRUD
  const handleSaveBranch = (branch: Branch) => {
    setBranches((prev) => {
      const exists = prev.some((b) => b.id === branch.id);
      if (exists) {
        return prev.map((b) => (b.id === branch.id ? branch : b));
      }
      return [branch, ...prev];
    });
  };

  // 8. Convert Budget to Sale
  const handleConvertBudgetToSale = (budget: Budget) => {
    const costTotal = budget.items.reduce((acc, i) => acc + i.costPrice * i.quantity, 0);
    const activeBranchObj = branches.find((b) => b.id === currentBranchId);
    const activeSellerObj = sellers.find((s) => s.id === currentSellerId);

    const newSale: Sale = {
      id: `sale-bud-${Date.now()}`,
      code: generateCode('VD'),
      date: new Date().toISOString(),
      branchId: currentBranchId,
      branchName: activeBranchObj?.name || 'Embu das artes',
      sellerId: currentSellerId,
      sellerName: activeSellerObj?.name || 'Guilherme Gomes',
      items: budget.items,
      subtotal: budget.subtotal,
      discount: budget.discount,
      addition: 0,
      total: budget.total,
      costTotal,
      grossProfit: budget.total - costTotal,
      paymentMethod: 'pix',
      paymentDetails: {
        method: 'pix',
        netReceived: budget.total,
      },
      customer: budget.customer,
      status: 'completed',
      notes: `Venda gerada a partir do orçamento ${budget.code}`,
    };

    // Mark budget as converted
    setBudgets((prev) =>
      prev.map((b) =>
        b.id === budget.id ? { ...b, status: 'converted', convertedSaleId: newSale.id } : b
      )
    );

    // Complete sale
    handleCompleteSale(newSale);

    // Open receipt
    setReceiptBudget(null);
    setReceiptSale(newSale);
    setIsReceiptOpen(true);
  };

  // 9. Cash Register Open/Close/Entries
  const handleOpenCash = (initialAmount: number) => {
    const openEntry: CashEntry = {
      id: `cash-open-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'supply',
      amount: initialAmount,
      description: 'Abertura de Caixa (Fundo Inicial)',
    };

    setCashRegister({
      isOpen: true,
      openedAt: new Date().toISOString(),
      initialAmount,
      currentAmount: initialAmount,
      entries: [openEntry],
    });
  };

  const handleCloseCash = () => {
    setCashRegister((prev) => ({
      ...prev,
      isOpen: false,
      closedAt: new Date().toISOString(),
    }));
  };

  const handleAddCashEntry = (entry: CashEntry) => {
    setCashRegister((prev) => {
      let nextAmount = prev.currentAmount;
      if (entry.type === 'supply') nextAmount += entry.amount;
      if (entry.type === 'bleed' || entry.type === 'expense') nextAmount -= entry.amount;

      return {
        ...prev,
        currentAmount: Math.max(0, nextAmount),
        entries: [entry, ...prev.entries],
      };
    });
  };

  // 10. Expenses
  const handleAddExpense = (expense: Expense) => {
    setExpenses((prev) => [expense, ...prev]);
  };

  const handleDeleteExpense = (expenseId: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
  };

  // 11. Open Receipt / Budget Print Modal
  const handleOpenSaleReceipt = (sale: Sale) => {
    setReceiptBudget(null);
    setReceiptSale(sale);
    setIsReceiptOpen(true);
  };

  const handleOpenBudgetReceipt = (budget: Budget) => {
    setReceiptSale(null);
    setReceiptBudget(budget);
    setIsReceiptOpen(true);
  };

  const existingCategories = Array.from(
    new Set(products.map((p) => p.category || 'Geral'))
  );

  if (!isLoggedIn) {
    return <LoginScreen onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div
      style={getFontFamilyStyle()}
      className="min-h-screen bg-[#06030c] text-purple-100 flex flex-col antialiased selection:bg-purple-600 selection:text-white transition-colors duration-200"
    >
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        products={products}
        branches={branches}
        sellers={sellers}
        cashRegister={cashRegister}
        currentBranchId={currentBranchId}
        onSelectBranch={setCurrentBranchId}
        currentSellerId={currentSellerId}
        onSelectSeller={setCurrentSellerId}
        userRole={userRole}
        onToggleUserRole={() =>
          setUserRole((prev) =>
            prev === 'Administrador'
              ? 'Gerente'
              : prev === 'Gerente'
              ? 'Vendedor'
              : 'Administrador'
          )
        }
        darkMode={true}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAIModal={() => setIsAIModalOpen(true)}
        onOpenAccessModal={() => setIsAccessModalOpen(true)}
        todaySalesTotal={todaySalesTotal}
        onLogout={() => setIsLoggedIn(false)}
      />

      {/* Main Content Body */}
      <main className="flex-1 pb-12">
        {activeTab === 'dashboard' && (
          <ExecutiveDashboardView
            sales={sales}
            products={products}
            expenses={expenses}
            branches={branches}
            sellers={sellers}
            currentBranchId={currentBranchId}
            onSelectBranch={setCurrentBranchId}
            onNavigateToPOS={() => setActiveTab('pos')}
            onNavigateToRanking={() => setActiveTab('ranking')}
          />
        )}

        {activeTab === 'pos' && (
          <POSView
            products={products}
            settings={settings}
            branches={branches}
            sellers={sellers}
            currentBranchId={currentBranchId}
            currentSellerId={currentSellerId}
            onCompleteSale={handleCompleteSale}
            onOpenReceipt={handleOpenSaleReceipt}
          />
        )}

        {activeTab === 'innovations' && (
          <InnovationsHubView
            products={products}
            serviceOrders={serviceOrders}
            onSaveServiceOrders={setServiceOrders}
            vipCustomers={vipCustomers}
            onSaveVIPCustomers={setVipCustomers}
            smartBundles={smartBundles}
            onSaveSmartBundles={setSmartBundles}
            settings={settings}
            branches={branches}
            sellers={sellers}
            onSendToPOS={(_productIds, _discount) => {
              setActiveTab('pos');
            }}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView
            products={products}
            stockMovements={stockMovements}
            onOpenNewProduct={() => {
              setProductToEdit(null);
              setIsProductModalOpen(true);
            }}
            onEditProduct={(p) => {
              setProductToEdit(p);
              setIsProductModalOpen(true);
            }}
            onDeleteProduct={handleDeleteProduct}
            onRecordStockMovement={handleRecordStockMovement}
          />
        )}

        {activeTab === 'transfers' && (
          <TransfersView
            transfers={transfers}
            products={products}
            branches={branches}
            sellers={sellers}
            onCompleteTransfer={handleCompleteTransfer}
          />
        )}

        {activeTab === 'ranking' && (
          <TeamRankingView
            sellers={sellers}
            sales={sales}
            branches={branches}
            currentSellerId={currentSellerId}
            userRole={userRole}
            onSaveSeller={handleSaveSeller}
            onDeleteSeller={handleDeleteSeller}
          />
        )}

        {activeTab === 'calculators' && (
          <CalculatorsView
            products={products}
            settings={settings}
            onSaveNewProduct={handleSaveCalculatedProduct}
          />
        )}

        {activeTab === 'sales' && (
          <SalesHistoryView
            sales={sales}
            onOpenReceipt={handleOpenSaleReceipt}
            onCancelSale={handleCancelSale}
          />
        )}

        {activeTab === 'budgets' && (
          <BudgetsView
            budgets={budgets}
            products={products}
            onSaveBudget={(b) => setBudgets((prev) => [b, ...prev])}
            onDeleteBudget={(id) => setBudgets((prev) => prev.filter((b) => b.id !== id))}
            onConvertBudgetToSale={handleConvertBudgetToSale}
            onOpenReceiptModal={handleOpenBudgetReceipt}
          />
        )}

        {activeTab === 'cash' && (
          <CashRegisterView
            cashRegister={cashRegister}
            expenses={expenses}
            sales={sales}
            onOpenCash={handleOpenCash}
            onCloseCash={handleCloseCash}
            onAddCashEntry={handleAddCashEntry}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView sales={sales} products={products} expenses={expenses} />
        )}
      </main>

      {/* Modals */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        sale={receiptSale}
        budget={receiptBudget}
        settings={settings}
      />

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setProductToEdit(null);
        }}
        onSave={handleSaveProduct}
        productToEdit={productToEdit}
        existingCategories={existingCategories}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={setSettings}
        onLoadStarterCatalog={handleLoadStarterCatalog}
        onDataReset={() => {
          setProducts(StorageService.getProducts());
          setSales(StorageService.getSales());
          setBudgets(StorageService.getBudgets());
          setExpenses(StorageService.getExpenses());
          setCashRegister(StorageService.getCashRegister());
          setStockMovements(StorageService.getStockMovements());
          setBranches(StorageService.getBranches());
          setSellers(StorageService.getSellers());
          setTransfers(StorageService.getTransfers());
          setServiceOrders(StorageService.getServiceOrders());
          setVipCustomers(StorageService.getVIPCustomers());
          setSmartBundles(StorageService.getSmartBundles());
          setSettings(StorageService.getSettings());
        }}
      />

      <AIAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        products={products}
        sales={sales}
        branches={branches}
        sellers={sellers}
        expenses={expenses}
        onLoadStarterCatalog={handleLoadStarterCatalog}
      />

      <UserAccessModal
        isOpen={isAccessModalOpen}
        onClose={() => setIsAccessModalOpen(false)}
        sellers={sellers}
        branches={branches}
        onSaveSellers={setSellers}
        onDeleteSeller={handleDeleteSeller}
        userRole={userRole}
      />
    </div>
  );
}
