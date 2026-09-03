import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Wrench,
  Crown,
  Layers,
  QrCode,
  Send,
  Copy,
  Check,
  Plus,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileText,
  DollarSign,
  Smartphone,
  ShieldCheck,
  Percent,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  Gift,
  Award,
  ChevronRight,
  ShoppingBag,
  Zap,
} from 'lucide-react';
import {
  Product,
  ServiceOrder,
  ServiceOrderStatus,
  CustomerVIP,
  SmartBundle,
  StoreSettings,
  Branch,
  Seller,
} from '../types';
import { formatCurrency, formatDateTime } from '../utils/formatters';

interface InnovationsHubViewProps {
  products: Product[];
  serviceOrders: ServiceOrder[];
  onSaveServiceOrders: (orders: ServiceOrder[]) => void;
  vipCustomers: CustomerVIP[];
  onSaveVIPCustomers: (customers: CustomerVIP[]) => void;
  smartBundles: SmartBundle[];
  onSaveSmartBundles: (bundles: SmartBundle[]) => void;
  settings: StoreSettings;
  branches: Branch[];
  sellers: Seller[];
  onSendToPOS?: (itemIds: string[], bundleDiscount?: number) => void;
}

type InnovationSubTab = 'marketing' | 'service-orders' | 'crm-vip' | 'smart-bundles' | 'digital-catalog';

export const InnovationsHubView: React.FC<InnovationsHubViewProps> = ({
  products,
  serviceOrders,
  onSaveServiceOrders,
  vipCustomers,
  onSaveVIPCustomers,
  smartBundles,
  onSaveSmartBundles,
  settings,
  branches,
  sellers,
  onSendToPOS,
}) => {
  const [subTab, setSubTab] = useState<InnovationSubTab>('marketing');

  // --- 1. AI Marketing State ---
  const [campaignType, setCampaignType] = useState('Promoção Relâmpago 24h');
  const [marketingProduct, setMarketingProduct] = useState(products[0]?.name || 'iPhone 15 Pro Titânio');
  const [marketingPrice, setMarketingPrice] = useState('7.299,00');
  const [marketingDiscount, setMarketingDiscount] = useState('15% OFF + Película Grátis');
  const [targetAudience, setTargetAudience] = useState('Clientes da base e seguidores locais');
  const [extraDetails, setExtraDetails] = useState('Parcelamos em até 12x sem juros no cartão, aceitamos seminovo na troca');
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [generatedCopy, setGeneratedCopy] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  // --- 2. Service Orders State ---
  const [osSearch, setOsSearch] = useState('');
  const [osStatusFilter, setOsStatusFilter] = useState<string>('all');
  const [isNewOSModalOpen, setIsNewOSModalOpen] = useState(false);
  const [selectedOS, setSelectedOS] = useState<ServiceOrder | null>(null);
  const [osDiagnosisAi, setOsDiagnosisAi] = useState<string | null>(null);
  const [isLoadingDiagnosis, setIsLoadingDiagnosis] = useState(false);

  // New OS Form
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newDeviceModel, setNewDeviceModel] = useState('');
  const [newDeviceImei, setNewDeviceImei] = useState('');
  const [newReportedDefect, setNewReportedDefect] = useState('');
  const [newTechnicianName, setNewTechnicianName] = useState(sellers[0]?.name || 'Técnico Especialista');
  const [newPriority, setNewPriority] = useState<'Normal' | 'Alta' | 'Urgente'>('Normal');
  const [newLaborCost, setNewLaborCost] = useState(150);
  const [newPartsCost, setNewPartsCost] = useState(200);
  const [newTotalAmount, setNewTotalAmount] = useState(450);

  // --- 3. CRM VIP State ---
  const [vipSearch, setVipSearch] = useState('');
  const [selectedVip, setSelectedVip] = useState<CustomerVIP | null>(null);
  const [isNewVipModalOpen, setIsNewVipModalOpen] = useState(false);
  const [newVipName, setNewVipName] = useState('');
  const [newVipPhone, setNewVipPhone] = useState('');
  const [newVipEmail, setNewVipEmail] = useState('');
  const [newVipTier, setNewVipTier] = useState<'Bronze' | 'Prata' | 'Ouro' | 'Diamante'>('Bronze');

  // --- 4. Smart Bundles State ---
  const [selectedBundleProductIds, setSelectedBundleProductIds] = useState<string[]>([]);
  const [bundleName, setBundleName] = useState('');
  const [bundleDescription, setBundleDescription] = useState('');
  const [bundleDiscountPercent, setBundleDiscountPercent] = useState(15);

  // --- 5. Digital Catalog & QR PIX State ---
  const [catalogSearch, setCatalogSearch] = useState('');
  const [pixKeyInput, setPixKeyInput] = useState(settings.phone || 'financeiro@sinistron.ia');
  const [pixAmount, setPixAmount] = useState<number>(100);
  const [pixCopied, setPixCopied] = useState(false);

  // --- Handlers: AI Marketing ---
  const handleGenerateMarketing = async () => {
    setIsGeneratingCopy(true);
    try {
      const res = await fetch('/api/ai/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignType,
          productName: marketingProduct,
          price: marketingPrice,
          discount: marketingDiscount,
          targetAudience,
          extraDetails,
        }),
      });
      const data = await res.json();
      if (data.success && data.content) {
        setGeneratedCopy(data.content);
      } else {
        setGeneratedCopy('Não foi possível gerar no momento. Tente novamente.');
      }
    } catch (e: any) {
      setGeneratedCopy(`Erro ao conectar com a IA: ${e.message}`);
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // --- Handlers: Service Orders ---
  const handleCreateOS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName || !newDeviceModel || !newReportedDefect) return;

    const newOS: ServiceOrder = {
      id: `os-${Date.now()}`,
      code: `OS-${serviceOrders.length + 1001}`,
      date: new Date().toISOString(),
      customerName: newCustomerName,
      customerPhone: newCustomerPhone,
      deviceModel: newDeviceModel,
      deviceImei: newDeviceImei,
      reportedDefect: newReportedDefect,
      technicianName: newTechnicianName,
      status: 'Aguardando Avaliação',
      priority: newPriority,
      laborCost: Number(newLaborCost) || 0,
      partsCost: Number(newPartsCost) || 0,
      totalAmount: Number(newTotalAmount) || 0,
      warrantyDays: 90,
      branchId: settings.currentBranchId,
    };

    const updated = [newOS, ...serviceOrders];
    onSaveServiceOrders(updated);
    setIsNewOSModalOpen(false);

    // Reset fields
    setNewCustomerName('');
    setNewCustomerPhone('');
    setNewDeviceModel('');
    setNewDeviceImei('');
    setNewReportedDefect('');
    setNewLaborCost(150);
    setNewPartsCost(200);
    setNewTotalAmount(450);
  };

  const handleUpdateOSStatus = (id: string, newStatus: ServiceOrderStatus) => {
    const updated = serviceOrders.map((os) =>
      os.id === id
        ? {
            ...os,
            status: newStatus,
            completedAt: newStatus === 'Entregue / Concluído' ? new Date().toISOString() : os.completedAt,
          }
        : os
    );
    onSaveServiceOrders(updated);
    if (selectedOS && selectedOS.id === id) {
      setSelectedOS({ ...selectedOS, status: newStatus });
    }
  };

  const handleRunAiDiagnosis = async (os: ServiceOrder) => {
    setIsLoadingDiagnosis(true);
    setOsDiagnosisAi(null);
    try {
      const res = await fetch('/api/ai/diagnostics-os', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceModel: os.deviceModel,
          reportedDefect: os.reportedDefect,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOsDiagnosisAi(data.content);
      }
    } catch (e: any) {
      setOsDiagnosisAi(`Erro ao consultar laudo técnico: ${e.message}`);
    } finally {
      setIsLoadingDiagnosis(false);
    }
  };

  // --- Handlers: VIP CRM ---
  const handleCreateVip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVipName || !newVipPhone) return;

    const newVip: CustomerVIP = {
      id: `vip-${Date.now()}`,
      name: newVipName,
      phone: newVipPhone,
      email: newVipEmail,
      totalSpent: 0,
      salesCount: 0,
      pointsBalance: 50, // Bônus de boas-vindas
      cashbackBalance: 15.0, // Saldo inicial cortesia
      loyaltyTier: newVipTier,
      churnRisk: 'Baixo',
      lastPurchaseDate: new Date().toISOString(),
    };

    onSaveVIPCustomers([newVip, ...vipCustomers]);
    setIsNewVipModalOpen(false);
    setNewVipName('');
    setNewVipPhone('');
    setNewVipEmail('');
  };

  // --- Handlers: Smart Bundles ---
  const selectedBundleProducts = useMemo(() => {
    return products.filter((p) => selectedBundleProductIds.includes(p.id));
  }, [products, selectedBundleProductIds]);

  const bundleCalculations = useMemo(() => {
    const originalPrice = selectedBundleProducts.reduce((acc, p) => acc + p.sellingPrice, 0);
    const totalCost = selectedBundleProducts.reduce((acc, p) => acc + p.costPrice, 0);
    const discountMultiplier = 1 - bundleDiscountPercent / 100;
    const bundlePrice = Math.round(originalPrice * discountMultiplier * 100) / 100;
    const profit = bundlePrice - totalCost;
    const margin = bundlePrice > 0 ? (profit / bundlePrice) * 100 : 0;

    return {
      originalPrice,
      totalCost,
      bundlePrice,
      profit,
      margin,
    };
  }, [selectedBundleProducts, bundleDiscountPercent]);

  const handleSaveNewBundle = () => {
    if (selectedBundleProductIds.length < 2 || !bundleName) return;

    const newBundle: SmartBundle = {
      id: `bundle-${Date.now()}`,
      name: bundleName,
      description: bundleDescription || `Combo inteligente com ${selectedBundleProducts.length} itens.`,
      productIds: selectedBundleProductIds,
      originalPrice: bundleCalculations.originalPrice,
      bundlePrice: bundleCalculations.bundlePrice,
      discountPercent: bundleDiscountPercent,
      combinedMarginPercent: Math.round(bundleCalculations.margin * 10) / 10,
      tag: 'Personalizado',
    };

    onSaveSmartBundles([...smartBundles, newBundle]);
    setSelectedBundleProductIds([]);
    setBundleName('');
    setBundleDescription('');
  };

  return (
    <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-950 rounded-3xl border border-indigo-500/20 p-6 shadow-xl text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-300 bg-indigo-500/20 px-2.5 py-0.5 rounded-md border border-indigo-400/30 font-mono">
                sinistron.ia • ECOSSISTEMA DE INOVAÇÃO
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                <Sparkles className="w-3 h-3 text-amber-300 animate-spin" />
                Módulos 5.0 Ativos
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              Central de Inovação & Automação Inteligente
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl mt-1">
              Ferramentas de ponta para alavancar seu ticket médio, automação de marketing em redes sociais, controle de assistência técnica com IA, CRM preditivo e combos de alta lucratividade.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-3 text-center">
              <div className="text-xs text-indigo-200 font-medium">O.S. em Aberto</div>
              <div className="text-xl font-black text-amber-300">
                {serviceOrders.filter((os) => os.status !== 'Entregue / Concluído' && os.status !== 'Cancelado').length}
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-3 text-center">
              <div className="text-xs text-indigo-200 font-medium">Clientes VIP</div>
              <div className="text-xl font-black text-emerald-300">{vipCustomers.length}</div>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-3 text-center">
              <div className="text-xs text-indigo-200 font-medium">Combos Ativos</div>
              <div className="text-xl font-black text-purple-300">{smartBundles.length}</div>
            </div>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-white/10">
          <button
            onClick={() => setSubTab('marketing')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer ${
              subTab === 'marketing'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>IA Social & Copywriter</span>
          </button>

          <button
            onClick={() => setSubTab('service-orders')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer ${
              subTab === 'service-orders'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Wrench className="w-4 h-4 text-cyan-300" />
            <span>O.S. & Assistência Técnica Tech</span>
          </button>

          <button
            onClick={() => setSubTab('crm-vip')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer ${
              subTab === 'crm-vip'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Clube VIP & Cashback Preditivo</span>
          </button>

          <button
            onClick={() => setSubTab('smart-bundles')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer ${
              subTab === 'smart-bundles'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Smart Bundles (Combos Lucrativos)</span>
          </button>

          <button
            onClick={() => setSubTab('digital-catalog')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer ${
              subTab === 'digital-catalog'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4 text-pink-400" />
            <span>Vitrine Digital & PIX Instantâneo</span>
          </button>
        </div>
      </div>

      {/* --- SUBTAB 1: AI SOCIAL & COPYWRITING --- */}
      {subTab === 'marketing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Campaign Form */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Configurar Oferta com IA
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Alta Conversão
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tipo de Campanha
                </label>
                <select
                  value={campaignType}
                  onChange={(e) => setCampaignType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Promoção Relâmpago 24h">⚡ Promoção Relâmpago 24h (Urgência Alta)</option>
                  <option value="Lançamento & Novidades">🚀 Lançamento & Novidades no Estoque</option>
                  <option value="Trade-In (Troque seu usado)">🔁 Trade-In: Troque seu Usado por um Novo</option>
                  <option value="Combo Proteção Total">🛡️ Combo Proteção Total (Aparelho + Acessórios)</option>
                  <option value="Resgate de Clientes Inativos">🎁 Resgate de Clientes com Cupom Especial</option>
                  <option value="Assistência Técnica Express">🛠️ Assistência Técnica: Troca de Tela e Bateria em 40min</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Produto ou Serviço Principal
                </label>
                <input
                  type="text"
                  value={marketingProduct}
                  onChange={(e) => setMarketingProduct(e.target.value)}
                  placeholder="Ex: iPhone 15 Pro 128GB ou Troca de Tela iPhone"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Preço / Condição
                  </label>
                  <input
                    type="text"
                    value={marketingPrice}
                    onChange={(e) => setMarketingPrice(e.target.value)}
                    placeholder="Ex: R$ 3.590,00 ou 12x de R$ 330"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Desconto / Brinde
                  </label>
                  <input
                    type="text"
                    value={marketingDiscount}
                    onChange={(e) => setMarketingDiscount(e.target.value)}
                    placeholder="Ex: 15% OFF + Capa Grátis"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Diferenciais & Condições de Pagamento
                </label>
                <textarea
                  rows={3}
                  value={extraDetails}
                  onChange={(e) => setExtraDetails(e.target.value)}
                  placeholder="Ex: Parcelamento em 12x no cartão, garantia de 1 ano, retirada na matriz ou entrega motoboy."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <button
                onClick={handleGenerateMarketing}
                disabled={isGeneratingCopy}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold flex items-center justify-center gap-2 shadow-md transition cursor-pointer disabled:opacity-50"
              >
                {isGeneratingCopy ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Criando Campanhas com IA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Gerar Scripts & Campanhas com 1 Clique</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Result Output */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-500" />
                    Peças Geradas Prontas para Envio
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Copie o script para o WhatsApp ou use nos Stories do Instagram.
                  </p>
                </div>
                {generatedCopy && (
                  <button
                    onClick={() => copyToClipboard(generatedCopy, 'all-copy')}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedIndex === 'all-copy' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === 'all-copy' ? 'Copiado!' : 'Copiar Tudo'}</span>
                  </button>
                )}
              </div>

              {generatedCopy ? (
                <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 whitespace-pre-line max-h-[500px] overflow-y-auto">
                  {generatedCopy}
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400 space-y-3">
                  <Sparkles className="w-10 h-10 mx-auto text-indigo-400/50 animate-pulse" />
                  <p className="font-bold text-sm text-slate-600 dark:text-slate-400">
                    Selecione os parâmetros e clique em "Gerar Scripts & Campanhas"
                  </p>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    A IA Sinistron criará mensagens prontas para lista de transmissão no WhatsApp, legenda com hashtags para Instagram e roteiro de 15 segundos para Reels/Stories.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Suggestions Pills */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 block mb-2">Sugestões Rápidas de Disparo:</span>
              <div className="flex flex-wrap gap-2">
                {['iPhone 15 Pro + MagSafe', 'Troca de Bateria em 30min', 'Seminovos Grade A com Garantia', 'Carregador 20W Original'].map((sug) => (
                  <button
                    key={sug}
                    onClick={() => {
                      setMarketingProduct(sug);
                      setCampaignType('Promoção Relâmpago 24h');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-300 hover:text-indigo-600 text-[11px] font-medium transition cursor-pointer"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SUBTAB 2: SERVICE ORDERS (ASSISTÊNCIA TÉCNICA) --- */}
      {subTab === 'service-orders' && (
        <div className="space-y-6">
          {/* OS Controls Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={osSearch}
                  onChange={(e) => setOsSearch(e.target.value)}
                  placeholder="Buscar por cliente, modelo ou IMEI..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <select
                value={osStatusFilter}
                onChange={(e) => setOsStatusFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200"
              >
                <option value="all">Todos os Status</option>
                <option value="Aguardando Avaliação">Aguardando Avaliação</option>
                <option value="Em Diagnóstico">Em Diagnóstico</option>
                <option value="Aguardando Peça">Aguardando Peça</option>
                <option value="Em Execução">Em Execução</option>
                <option value="Pronto para Retirada">Pronto para Retirada</option>
                <option value="Entregue / Concluído">Entregue / Concluído</option>
              </select>
            </div>

            <button
              onClick={() => setIsNewOSModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Abrir Nova Ordem de Serviço</span>
            </button>
          </div>

          {/* OS Kanban & List Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {serviceOrders
              .filter((os) => {
                const matchSearch =
                  os.customerName.toLowerCase().includes(osSearch.toLowerCase()) ||
                  os.deviceModel.toLowerCase().includes(osSearch.toLowerCase()) ||
                  os.code.toLowerCase().includes(osSearch.toLowerCase());
                const matchStatus = osStatusFilter === 'all' || os.status === osStatusFilter;
                return matchSearch && matchStatus;
              })
              .map((os) => {
                const isReady = os.status === 'Pronto para Retirada';
                const isDelivered = os.status === 'Entregue / Concluído';

                return (
                  <div
                    key={os.id}
                    className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                      isReady
                        ? 'border-emerald-400 dark:border-emerald-600/60 ring-2 ring-emerald-500/20'
                        : isDelivered
                        ? 'border-slate-200 dark:border-slate-800 opacity-75'
                        : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300'
                    }`}
                  >
                    <div>
                      {/* Code & Priority */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="font-mono font-black text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-md">
                          {os.code}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            os.priority === 'Urgente'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : os.priority === 'Alta'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {os.priority}
                        </span>
                      </div>

                      {/* Device & Customer */}
                      <h4 className="font-black text-slate-900 dark:text-white text-sm mb-1 flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span className="truncate">{os.deviceModel}</span>
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Cliente: <strong className="text-slate-700 dark:text-slate-200">{os.customerName}</strong>
                      </p>
                      {os.customerPhone && (
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{os.customerPhone}</p>
                      )}

                      {/* Defect preview */}
                      <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                        <strong>Defeito:</strong> {os.reportedDefect}
                      </div>

                      {/* Financial info */}
                      <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400 font-medium">Valor Total:</span>
                        <span className="font-black text-indigo-600 dark:text-indigo-400 text-sm">
                          {formatCurrency(os.totalAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Status Changer & Quick Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <select
                        value={os.status}
                        onChange={(e) => handleUpdateOSStatus(os.id, e.target.value as ServiceOrderStatus)}
                        className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Aguardando Avaliação">⏳ Aguardando Avaliação</option>
                        <option value="Em Diagnóstico">🔍 Em Diagnóstico</option>
                        <option value="Aguardando Peça">📦 Aguardando Peça</option>
                        <option value="Em Execução">🛠️ Em Execução</option>
                        <option value="Pronto para Retirada">✅ Pronto para Retirada</option>
                        <option value="Entregue / Concluído">🏁 Entregue / Concluído</option>
                        <option value="Cancelado">❌ Cancelado</option>
                      </select>

                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedOS(os);
                            handleRunAiDiagnosis(os);
                          }}
                          className="px-2 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 flex items-center justify-center gap-1 transition cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>Laudo IA</span>
                        </button>

                        <button
                          onClick={() => {
                            const waText = encodeURIComponent(
                              `Olá ${os.customerName}! Aqui é da ${settings.storeName || 'Sinistron'}.\n\nSeu aparelho *${os.deviceModel}* (OS #${os.code}) está com status: *${os.status}*.\nValor: ${formatCurrency(os.totalAmount)}.\n\nQualquer dúvida estamos à disposição!`
                            );
                            window.open(`https://wa.me/?text=${waText}`, '_blank');
                          }}
                          className="px-2 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1 transition cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {serviceOrders.length === 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
              <Wrench className="w-12 h-12 mx-auto text-slate-400" />
              <h3 className="font-black text-slate-800 dark:text-white text-base">
                Nenhuma Ordem de Serviço Registrada
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Cadastre ordens de serviço para controlar manutenções, trocas de tela, laudos com inteligência artificial e avisar os clientes automaticamente.
              </p>
              <button
                onClick={() => setIsNewOSModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                + Criar Primeira Ordem de Serviço
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- SUBTAB 3: VIP CRM & CASHBACK PREDITIVO --- */}
      {subTab === 'crm-vip' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="relative flex-1 sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={vipSearch}
                onChange={(e) => setVipSearch(e.target.value)}
                placeholder="Buscar cliente VIP por nome ou telefone..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              onClick={() => setIsNewVipModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
            >
              <Crown className="w-4 h-4" />
              <span>Cadastrar Novo Cliente VIP</span>
            </button>
          </div>

          {/* VIP Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vipCustomers
              .filter((vip) => vip.name.toLowerCase().includes(vipSearch.toLowerCase()) || vip.phone.includes(vipSearch))
              .map((vip) => (
                <div
                  key={vip.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs hover:border-amber-400/50 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 flex items-center justify-center text-lg shadow-xs">
                          {vip.loyaltyTier === 'Diamante' ? '💎' : vip.loyaltyTier === 'Ouro' ? '👑' : '⭐'}
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 dark:text-white text-base leading-tight">
                            {vip.name}
                          </h4>
                          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                            Nível {vip.loyaltyTier}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          vip.churnRisk === 'Alto'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : vip.churnRisk === 'Médio'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        Risco Churn: {vip.churnRisk}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Total Investido</span>
                        <span className="font-black text-slate-900 dark:text-white">
                          {formatCurrency(vip.totalSpent)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Cashback Acumulado</span>
                        <span className="font-black text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(vip.cashbackBalance)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Pontos Sinistron</span>
                        <span className="font-black text-indigo-600 dark:text-indigo-400">
                          {vip.pointsBalance} pts
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Total de Compras</span>
                        <span className="font-black text-slate-700 dark:text-slate-300">{vip.salesCount} vendas</span>
                      </div>
                    </div>

                    {vip.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 italic">
                        "{vip.notes}"
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-mono">{vip.phone}</span>
                    <button
                      onClick={() => {
                        const promoText = encodeURIComponent(
                          `Olá ${vip.name}! Você possui *${formatCurrency(vip.cashbackBalance)}* de Cashback e *${vip.pointsBalance} pontos* disponíveis no seu Clube VIP Sinistron!\n\nVenha aproveitar na nossa loja neste fim de semana.`
                        );
                        window.open(`https://wa.me/?text=${promoText}`, '_blank');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>Enviar Saldo WhatsApp</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {vipCustomers.length === 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
              <Crown className="w-12 h-12 mx-auto text-amber-400" />
              <h3 className="font-black text-slate-800 dark:text-white text-base">
                Nenhum Cliente VIP Cadastrado
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Crie seu programa de fidelidade, pontuação e cashback automático para aumentar a retenção de clientes.
              </p>
              <button
                onClick={() => setIsNewVipModalOpen(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                + Cadastrar Primeiro Cliente VIP
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- SUBTAB 4: SMART BUNDLES (COMBOS LUCRATIVOS) --- */}
      {subTab === 'smart-bundles' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Bundle Creator */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-500" />
                Engenharia de Combos de Alta Margem
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Ticket Médio +40%
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nome do Combo / Pacote Promocional
                </label>
                <input
                  type="text"
                  value={bundleName}
                  onChange={(e) => setBundleName(e.target.value)}
                  placeholder="Ex: Combo Apple Care Protection (iPhone + Capa + Película + Fonte 20W)"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Selecione os Produtos do Combo ({selectedBundleProductIds.length} selecionados)
                </label>
                <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  {products.map((p) => {
                    const isSelected = selectedBundleProductIds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedBundleProductIds(selectedBundleProductIds.filter((id) => id !== p.id));
                          } else {
                            setSelectedBundleProductIds([...selectedBundleProductIds, p.id]);
                          }
                        }}
                        className={`p-2 rounded-lg flex items-center justify-between cursor-pointer transition ${
                          isSelected
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                            : 'hover:bg-slate-200/60 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-4 h-4 rounded-md flex items-center justify-center border text-[10px] font-bold ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'border-slate-300 dark:border-slate-600'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                          </span>
                          <span className="font-bold truncate max-w-xs">{p.name}</span>
                        </div>
                        <span className="font-mono font-bold">{formatCurrency(p.sellingPrice)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Desconto Estratégico no Pacote
                  </label>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">{bundleDiscountPercent}% OFF</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={bundleDiscountPercent}
                  onChange={(e) => setBundleDiscountPercent(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              {/* Simulation Result Box */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Soma dos Itens Avulsos:</span>
                  <span className="font-mono line-through text-slate-400">
                    {formatCurrency(bundleCalculations.originalPrice)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm font-black">
                  <span className="text-slate-800 dark:text-slate-100">Preço Final do Combo:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 text-lg">
                    {formatCurrency(bundleCalculations.bundlePrice)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs pt-1 border-t border-emerald-200 dark:border-emerald-800/60 font-medium">
                  <span className="text-slate-600 dark:text-slate-300">Margem Combinada Estimada:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">
                    {bundleCalculations.margin.toFixed(1)}% (Lucro: {formatCurrency(bundleCalculations.profit)})
                  </span>
                </div>
              </div>

              <button
                onClick={handleSaveNewBundle}
                disabled={selectedBundleProductIds.length < 2 || !bundleName}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 shadow-md transition cursor-pointer disabled:opacity-40"
              >
                <Plus className="w-4 h-4" />
                <span>Salvar Combo Promocional Sinistron</span>
              </button>
            </div>
          </div>

          {/* Active Bundles List */}
          <div className="lg:col-span-6 space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Combos Cadastrados na Loja ({smartBundles.length})
            </h3>

            <div className="space-y-3">
              {smartBundles.map((b) => (
                <div
                  key={b.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-slate-900 dark:text-white text-sm">{b.name}</h4>
                      {b.tag && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          {b.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{b.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-xs text-slate-400 line-through mr-2">
                        {formatCurrency(b.originalPrice)}
                      </span>
                      <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(b.bundlePrice)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {onSendToPOS && (
                        <button
                          onClick={() => onSendToPOS(b.productIds, b.discountPercent)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Lançar no PDV</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- SUBTAB 5: DIGITAL CATALOG & INSTANT PIX --- */}
      {subTab === 'digital-catalog' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Instant PIX Dynamic QR Generator */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-500" />
                Gerador de PIX Instantâneo
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                0% Taxa
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Chave PIX da Loja (CNPJ / Telefone / E-mail / Aleatória)
                </label>
                <input
                  type="text"
                  value={pixKeyInput}
                  onChange={(e) => setPixKeyInput(e.target.value)}
                  placeholder="sua-chave-pix@loja.com"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Valor da Cobrança (R$)
                </label>
                <input
                  type="number"
                  value={pixAmount}
                  onChange={(e) => setPixAmount(Number(e.target.value))}
                  placeholder="0,00"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-black text-slate-900 dark:text-slate-100 text-base focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* QR Mock Display */}
              <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <div className="w-40 h-40 mx-auto bg-white p-2 rounded-2xl border border-slate-300 shadow-sm flex items-center justify-center">
                  <div className="w-full h-full bg-slate-900 rounded-xl flex flex-col items-center justify-center text-white p-2">
                    <QrCode className="w-20 h-20 text-white" />
                    <span className="text-[9px] font-mono mt-1">sinistron.pix</span>
                  </div>
                </div>
                <div className="text-center">
                  <span className="font-black text-lg text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(pixAmount)}
                  </span>
                  <p className="text-[11px] text-slate-400">Aponte a câmera do app do banco para pagar</p>
                </div>

                <button
                  onClick={() => {
                    const pixCode = `00020126580014br.gov.bcb.pix0136${pixKeyInput}520400005303986540${pixAmount.toFixed(
                      2
                    )}5802BR5915${settings.storeName || 'SINISTRON IA'}6009SAO PAULO62070503***6304`;
                    copyToClipboard(pixCode, 'pix-copy');
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  {copiedIndex === 'pix-copy' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedIndex === 'pix-copy' ? 'Chave Copia e Cola Copiada!' : 'Copiar Chave Copia e Cola'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Showcase / Catalog View */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-indigo-500" />
                    Vitrine Digital de Produtos
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Compartilhe itens diretamente para o cliente com cálculo de parcelas em até 12x.
                  </p>
                </div>
                <div className="relative w-48">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    placeholder="Filtrar..."
                    className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
                {products
                  .filter((p) => p.name.toLowerCase().includes(catalogSearch.toLowerCase()))
                  .map((p) => {
                    const installment12x = Math.round((p.sellingPrice / 10) * 100) / 100;
                    return (
                      <div
                        key={p.id}
                        className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between"
                      >
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            {p.category}
                          </span>
                          <h4 className="font-black text-slate-900 dark:text-white text-xs leading-snug mt-1">
                            {p.name}
                          </h4>
                          <div className="mt-2">
                            <span className="text-base font-black text-slate-900 dark:text-white">
                              {formatCurrency(p.sellingPrice)}
                            </span>
                            <span className="block text-[11px] text-slate-500 font-medium">
                              ou até 10x de {formatCurrency(installment12x)}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-medium">Estoque: {p.stock} un</span>
                          <button
                            onClick={() => {
                              const shareText = encodeURIComponent(
                                `Olha que oportunidade na ${settings.storeName || 'Sinistron'}!\n\n📱 *${p.name}*\n💰 Por apenas *${formatCurrency(
                                  p.sellingPrice
                                )}* à vista ou até 10x de ${formatCurrency(installment12x)}.\n\nGaranta o seu antes que acabe!`
                              );
                              window.open(`https://wa.me/?text=${shareText}`, '_blank');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                            <span>Enviar Oferta</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 1: NEW SERVICE ORDER --- */}
      {isNewOSModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-indigo-600" />
                Nova Ordem de Serviço & Manutenção
              </h3>
              <button
                onClick={() => setIsNewOSModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOS} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nome do Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    placeholder="Nome completo"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Telefone / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Modelo do Aparelho *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDeviceModel}
                    onChange={(e) => setNewDeviceModel(e.target.value)}
                    placeholder="Ex: iPhone 13 Pro 128GB"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    IMEI ou Número de Série
                  </label>
                  <input
                    type="text"
                    value={newDeviceImei}
                    onChange={(e) => setNewDeviceImei(e.target.value)}
                    placeholder="Opcional"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Defeito Relatado pelo Cliente *
                </label>
                <textarea
                  required
                  rows={2}
                  value={newReportedDefect}
                  onChange={(e) => setNewReportedDefect(e.target.value)}
                  placeholder="Ex: Aparelho caiu no chão, tela trincada sem touch e bateria descarregando rápido."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Custo Peças (R$)
                  </label>
                  <input
                    type="number"
                    value={newPartsCost}
                    onChange={(e) => {
                      const parts = Number(e.target.value) || 0;
                      setNewPartsCost(parts);
                      setNewTotalAmount(parts + newLaborCost);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mão de Obra (R$)
                  </label>
                  <input
                    type="number"
                    value={newLaborCost}
                    onChange={(e) => {
                      const labor = Number(e.target.value) || 0;
                      setNewLaborCost(labor);
                      setNewTotalAmount(newPartsCost + labor);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Total ao Cliente (R$)
                  </label>
                  <input
                    type="number"
                    value={newTotalAmount}
                    onChange={(e) => setNewTotalAmount(Number(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-black text-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Prioridade
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-bold"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Técnico Responsável
                  </label>
                  <input
                    type="text"
                    value={newTechnicianName}
                    onChange={(e) => setNewTechnicianName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewOSModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs transition cursor-pointer"
                >
                  Salvar Ordem de Serviço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: NEW VIP CUSTOMER --- */}
      {isNewVipModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                Cadastrar Cliente VIP
              </h3>
              <button
                onClick={() => setIsNewVipModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateVip} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={newVipName}
                  onChange={(e) => setNewVipName(e.target.value)}
                  placeholder="Nome do cliente"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  WhatsApp / Celular *
                </label>
                <input
                  type="text"
                  required
                  value={newVipPhone}
                  onChange={(e) => setNewVipPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  E-mail (Opcional)
                </label>
                <input
                  type="email"
                  value={newVipEmail}
                  onChange={(e) => setNewVipEmail(e.target.value)}
                  placeholder="cliente@email.com"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Categoria de Fidelidade
                </label>
                <select
                  value={newVipTier}
                  onChange={(e) => setNewVipTier(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-bold"
                >
                  <option value="Bronze">🥉 Bronze (1% Cashback)</option>
                  <option value="Prata">🥈 Prata (2% Cashback)</option>
                  <option value="Ouro">🥇 Ouro (3.5% Cashback)</option>
                  <option value="Diamante">💎 Diamante (5% Cashback + Brindes)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewVipModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-xs transition cursor-pointer"
                >
                  Salvar Cliente VIP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: OS AI DIAGNOSIS --- */}
      {selectedOS && osDiagnosisAi && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 font-mono">
                  {selectedOS.code}
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Laudo Técnico Inteligente • {selectedOS.deviceModel}
                </h3>
              </div>
              <button
                onClick={() => setOsDiagnosisAi(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 whitespace-pre-line">
              {osDiagnosisAi}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setOsDiagnosisAi(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
