import React, { useState, useRef, useEffect } from 'react';
import { SinistronLogo } from './SinistronLogo';
import {
  LayoutDashboard,
  ShoppingCart,
  Calculator,
  Package,
  History,
  FileSpreadsheet,
  Wallet,
  BarChart3,
  Settings,
  Sparkles,
  Users,
  ArrowRightLeft,
  Sun,
  Moon,
  UserCheck,
  ChevronDown,
  Layers,
  MapPin,
  Bell,
  Eye,
  Store,
  Shield,
  CreditCard,
  TrendingUp,
  Lock,
} from 'lucide-react';
import { StoreSettings, Product, CashRegister, Branch, Seller } from '../types';
import { formatCurrency } from '../utils/formatters';

export type ActiveTab =
  | 'dashboard'
  | 'pos'
  | 'innovations'
  | 'inventory'
  | 'transfers'
  | 'calculators'
  | 'budgets'
  | 'sales'
  | 'cash'
  | 'ranking'
  | 'analytics';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  settings: StoreSettings;
  products: Product[];
  branches: Branch[];
  sellers: Seller[];
  cashRegister: CashRegister;
  currentBranchId: string;
  onSelectBranch: (branchId: string) => void;
  currentSellerId: string;
  onSelectSeller: (sellerId: string) => void;
  userRole: 'Administrador' | 'Gerente' | 'Vendedor';
  onToggleUserRole: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  onOpenSettings: () => void;
  onOpenAIModal?: () => void;
  onOpenAccessModal?: () => void;
  todaySalesTotal: number;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  settings,
  products,
  branches,
  sellers,
  cashRegister,
  currentBranchId,
  onSelectBranch,
  currentSellerId,
  onSelectSeller,
  userRole,
  onToggleUserRole,
  darkMode,
  onToggleDarkMode,
  onOpenSettings,
  onOpenAIModal,
  onOpenAccessModal,
  todaySalesTotal,
  onLogout,
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;
  const currentSeller = sellers.find((s) => s.id === currentSellerId) || sellers[0];
  const currentBranch = branches.find((b) => b.id === currentBranchId) || branches[0];
  const isUltrawide = settings.layoutWidth !== 'normal';

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.nav-dropdown-container')) {
        setOpenDropdown(null);
        setBranchDropdownOpen(false);
        setProfileDropdownOpen(false);
        setNotificationOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const menuSections = [
    {
      id: 'vendas',
      label: 'Vendas',
      items: [
        { id: 'dashboard' as ActiveTab, label: 'Painel Executivo & Metas', icon: LayoutDashboard, desc: 'Visão executiva em tempo real' },
        { id: 'pos' as ActiveTab, label: 'PDV / Vendas', icon: ShoppingCart, desc: 'Frente de caixa rápida com PayMobi' },
        { id: 'sales' as ActiveTab, label: 'Histórico de Vendas', icon: History, desc: 'Auditoria de pedidos e cupons' },
        { id: 'analytics' as ActiveTab, label: 'Raio-X & DRE', icon: BarChart3, desc: 'Lucratividade e métricas diárias' },
        { id: 'transfers' as ActiveTab, label: 'Transferências', icon: ArrowRightLeft, desc: 'Movimentação entre filiais' },
      ],
    },
    {
      id: 'produtos',
      label: 'Produtos',
      items: [
        { id: 'inventory' as ActiveTab, label: 'Produtos & Ativos', icon: Package, badge: lowStockCount > 0 ? lowStockCount : undefined, desc: 'Catálogo de aparelhos e peças' },
        { id: 'calculators' as ActiveTab, label: 'Calculadoras & Preços', icon: Calculator, desc: 'Markup e formação de preço' },
      ],
    },
    {
      id: 'solucoes',
      label: 'Soluções',
      items: [
        { id: 'innovations' as ActiveTab, label: 'Central de Inovação IA', icon: Sparkles, highlight: true, desc: 'Copywriter, Diagnóstico OS & CRM VIP' },
        { id: 'budgets' as ActiveTab, label: 'Orçamentos & OS', icon: FileSpreadsheet, desc: 'Propostas comerciais em PDF' },
        { id: 'cash' as ActiveTab, label: 'Caixa & Despesas', icon: Wallet, desc: 'Fluxo financeiro e sangrias' },
      ],
    },
    {
      id: 'rh',
      label: 'Recursos Humanos',
      items: [
        { id: 'ranking' as ActiveTab, label: 'Equipe & Ranking', icon: Users, desc: 'Metas e comissão de vendedores' },
      ],
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#090414]/95 backdrop-blur-md border-b border-purple-900/40 text-white shadow-[0_4px_25px_rgba(168,85,247,0.08)] transition-colors duration-200">
      {/* Top Main Navbar */}
      <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${isUltrawide ? 'max-w-[1920px]' : 'max-w-7xl'}`}>
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand + Main Menu Items */}
          <div className="flex items-center gap-6 lg:gap-8">
            {/* Logo sinistron.ia */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-3 text-left group cursor-pointer focus:outline-hidden"
            >
              <SinistronLogo
                size={34}
                variant="horizontal"
                glow={true}
                animated={true}
                textColor={darkMode ? 'text-white' : 'text-slate-900'}
              />
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-purple-950/70 text-purple-300 border border-purple-800/80 hidden sm:inline-block">
                PRO
              </span>
            </button>

            {/* Navigation Menus with Dropdowns */}
            <nav className="hidden md:flex items-center gap-1">
              {menuSections.map((sec) => (
                <div key={sec.id} className="relative nav-dropdown-container">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(openDropdown === sec.id ? null : sec.id);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      openDropdown === sec.id || sec.items.some((it) => it.id === activeTab)
                        ? darkMode ? 'text-white bg-slate-800/80' : 'text-indigo-700 bg-indigo-50'
                        : darkMode ? 'text-slate-300 hover:text-white hover:bg-slate-800/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <span>{sec.label}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === sec.id ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {openDropdown === sec.id && (
                    <div className={`absolute left-0 mt-2 w-64 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150 ${
                      darkMode ? 'bg-[#161b22] border border-slate-800 text-slate-100' : 'bg-white border border-slate-200 text-slate-900'
                    }`}>
                      {sec.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id);
                              setOpenDropdown(null);
                            }}
                            className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition cursor-pointer ${
                              isActive
                                ? 'bg-indigo-600 text-white'
                                : darkMode ? 'text-slate-200 hover:bg-slate-800/80' : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <div className={`p-1.5 rounded-lg mt-0.5 ${isActive ? 'bg-white/20 text-white' : darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold truncate">{item.label}</span>
                                {item.badge && (
                                  <span className="text-[10px] bg-rose-500 text-white font-bold px-1.5 py-0.2 rounded-full">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <p className={`text-[11px] truncate mt-0.5 ${isActive ? 'text-indigo-100' : darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                {item.desc}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Right Area: Branch Selector, Notifications, User Profile */}
          <div className="flex items-center gap-3">
            {/* Branch Selector Pill */}
            <div className="relative nav-dropdown-container">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setBranchDropdownOpen(!branchDropdownOpen);
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer shadow-xs ${
                  darkMode ? 'bg-[#161b22] hover:bg-slate-800 border border-slate-800 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                <span>{currentBranch?.name || 'Embu das artes'}</span>
              </button>

              {/* Branch Dropdown */}
              {branchDropdownOpen && (
                <div className={`absolute right-0 mt-2 w-56 rounded-2xl shadow-xl p-2 z-50 ${
                  darkMode ? 'bg-[#161b22] border border-slate-800 text-slate-100' : 'bg-white border border-slate-200 text-slate-900'
                }`}>
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Filiais do Sistema
                  </div>
                  <button
                    onClick={() => {
                      onSelectBranch('all');
                      setBranchDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition cursor-pointer ${
                      currentBranchId === 'all'
                        ? 'bg-indigo-600 text-white'
                        : darkMode ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>Consolidado Geral</span>
                    <Store className="w-3.5 h-3.5 opacity-70" />
                  </button>
                  {branches.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        onSelectBranch(b.id);
                        setBranchDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition cursor-pointer mt-0.5 ${
                        currentBranchId === b.id
                          ? 'bg-indigo-600 text-white'
                          : darkMode ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${b.isOpen ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                        <span>{b.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {b.isOpen ? 'Aberto' : 'Fechado'}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative nav-dropdown-container">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setNotificationOpen(!notificationOpen);
                }}
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition cursor-pointer ${
                  darkMode ? 'bg-[#161b22] hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                }`}
                title="Notificações"
              >
                <Bell className="w-4 h-4" />
              </button>

              {notificationOpen && (
                <div className={`absolute right-0 mt-2 w-72 rounded-2xl shadow-xl p-3 z-50 text-xs ${
                  darkMode ? 'bg-[#161b22] border border-slate-800 text-slate-100' : 'bg-white border border-slate-200 text-slate-900'
                }`}>
                  <div className={`flex items-center justify-between pb-2 border-b font-bold ${darkMode ? 'border-slate-800 text-white' : 'border-slate-200 text-slate-800'}`}>
                    <span>Notificações</span>
                    <span className="text-[10px] text-emerald-400">Sistema Ao Vivo</span>
                  </div>
                  <div className="py-3 space-y-2">
                    <p className={`text-[11px] leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      ✅ Sincronização em tempo real ativa com as 4 filiais.
                    </p>
                    <p className={`text-[11px] leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      🎯 Meta de faturamento da loja Embu das Artes atingida este mês!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Card */}
            <div className="relative nav-dropdown-container">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setProfileDropdownOpen(!profileDropdownOpen);
                }}
                className={`flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-full border transition cursor-pointer ${
                  darkMode ? 'bg-[#161b22] hover:bg-slate-800 border-slate-800' : 'bg-slate-100 hover:bg-slate-200 border-slate-200'
                }`}
              >
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
                    alt={currentSeller?.name || 'Guilherme Gomes'}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-500"
                  />
                  <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ${darkMode ? 'ring-[#0d1117]' : 'ring-white'}`} />
                </div>
                <div className="text-left hidden sm:block">
                  <span className={`text-xs font-bold block leading-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                    {currentSeller?.name || 'Guilherme Gomes'}
                  </span>
                  <span className="text-[10px] font-semibold text-amber-500 flex items-center gap-1 leading-none mt-0.5">
                    <span>👤</span> {userRole}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-[#161b22] border border-slate-800 rounded-2xl shadow-xl p-2 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="font-bold text-white">{currentSeller?.name || 'Guilherme Gomes'}</p>
                    <p className="text-[11px] text-amber-400 font-semibold">{userRole} • {currentBranch?.name}</p>
                  </div>
                  <div className="p-1 space-y-1">
                    <button
                      onClick={() => {
                        onToggleUserRole();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer text-left"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Alternar Cargo ({userRole})</span>
                    </button>
                    {onOpenAIModal && (
                      <button
                        onClick={() => {
                          onOpenAIModal();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer text-left"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Central IA Sinistron</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onOpenSettings();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer text-left"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      <span>Configurações & Backup</span>
                    </button>
                    {onOpenAccessModal && (
                      <button
                        onClick={() => {
                          onOpenAccessModal();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer text-left"
                      >
                        <Users className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Gerenciar Acessos & Equipe</span>
                      </button>
                    )}
                    {onLogout && (
                      <button
                        onClick={() => {
                          onLogout();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition cursor-pointer text-left border-t border-slate-800 mt-1 pt-2"
                      >
                        <Lock className="w-3.5 h-3.5 text-rose-400" />
                        <span>Bloquear / Sair</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Subheader action bar for quick view switches */}
      <div className="bg-[#0b0f15] border-t border-slate-800/60 py-2">
        <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${isUltrawide ? 'max-w-[1920px]' : 'max-w-7xl'} flex items-center justify-between`}>
          {/* Quick tab breadcrumb/shortcut for mobile */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              📊 Painel Executivo
            </button>
            <button
              onClick={() => setActiveTab('pos')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'pos' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              🛒 PDV / Vendas
            </button>
            <button
              onClick={() => setActiveTab('innovations')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'innovations' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              ✨ Inovações IA
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'inventory' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              📦 Estoque
            </button>
          </div>

          {/* Toggle View button as seen in screenshot */}
          <button
            onClick={onToggleUserRole}
            className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#161b22] hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition cursor-pointer shadow-xs whitespace-nowrap ml-2"
          >
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>Alternar para Visão de {userRole === 'Vendedor' ? 'Gerente' : 'Vendedor'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
