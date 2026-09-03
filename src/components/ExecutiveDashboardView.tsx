import React, { useState, useMemo } from 'react';
import {
  Sale,
  Branch,
  Seller,
  Product,
  TradeInItem,
} from '../types';
import { formatCurrency, formatPercent, formatDate } from '../utils/formatters';
import { StorageService } from '../utils/storage';
import {
  TrendingUp,
  Target,
  Smartphone,
  Headphones,
  Shield,
  Gem,
  Award,
  CreditCard,
  Building2,
  Calendar,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  ArrowRight,
  Package,
  Layers,
  Zap,
  ShoppingBag,
  Store,
  ChevronRight,
  Users,
  Settings,
  X,
} from 'lucide-react';

interface ExecutiveDashboardViewProps {
  sales: Sale[];
  branches: Branch[];
  sellers: Seller[];
  products: Product[];
  selectedBranchId: string;
  onSelectBranch: (branchId: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const ExecutiveDashboardView: React.FC<ExecutiveDashboardViewProps> = ({
  sales,
  branches,
  sellers,
  products,
  selectedBranchId,
  onSelectBranch,
  onNavigateTab,
}) => {
  const [timeFilter] = useState<'today'>('today');
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [tempSalesGoal, setTempSalesGoal] = useState('300');
  const [tempRevenueGoal, setTempRevenueGoal] = useState('150000');

  // Active Date calculations
  const today = new Date();
  const todayDateStr = today.toISOString().split('T')[0];
  const currentDayOfMonth = today.getDate();
  const totalDaysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysRemaining = Math.max(1, totalDaysInMonth - currentDayOfMonth);

  const activeBranch = branches.find((b) => b.id === selectedBranchId) || null;
  const isConsolidated = selectedBranchId === 'all' || !activeBranch;

  // Filter sales for the selected branch (or all)
  const scopedSales = useMemo(() => {
    if (isConsolidated) return sales;
    return sales.filter((s) => s.branchId === selectedBranchId);
  }, [sales, isConsolidated, selectedBranchId]);

  // Today Sales
  const todaySales = useMemo(() => {
    return scopedSales.filter(
      (s) => s.status === 'completed' && s.date.startsWith(todayDateStr)
    );
  }, [scopedSales, todayDateStr]);

  // Monthly Sales
  const currentMonthStr = todayDateStr.substring(0, 7);
  const monthlySales = useMemo(() => {
    return scopedSales.filter(
      (s) => s.status === 'completed' && s.date.startsWith(currentMonthStr)
    );
  }, [scopedSales, currentMonthStr]);

  // Today Revenue & Volume
  const todayRevenue = useMemo(() => {
    return todaySales.reduce((acc, s) => acc + s.total, 0);
  }, [todaySales]);

  // Monthly Revenue & Volume
  const monthlyRevenue = useMemo(() => {
    return monthlySales.reduce((acc, s) => acc + s.total, 0);
  }, [monthlySales]);

  const monthlyVolumeCount = monthlySales.length;

  // Goals
  const targetMonthlySales = useMemo(() => {
    if (isConsolidated) {
      return branches.reduce((acc, b) => acc + (b.monthlySalesGoal || 0), 0);
    }
    return activeBranch?.monthlySalesGoal ?? 0;
  }, [isConsolidated, branches, activeBranch]);

  const targetMonthlyRevenue = useMemo(() => {
    if (isConsolidated) {
      return branches.reduce((acc, b) => acc + (b.monthlyRevenueGoal || 0), 0);
    }
    return activeBranch?.monthlyRevenueGoal ?? 0;
  }, [isConsolidated, branches, activeBranch]);

  const volumeProgressPercent = targetMonthlySales > 0 ? (monthlyVolumeCount / targetMonthlySales) * 100 : 0;
  const revenueProgressPercent = targetMonthlyRevenue > 0 ? (monthlyRevenue / targetMonthlyRevenue) * 100 : 0;

  const salesRemaining = Math.max(0, targetMonthlySales - monthlyVolumeCount);
  const dailySalesNeeded = daysRemaining > 0 ? (salesRemaining / daysRemaining).toFixed(1) : '0';
  const dailyRevenueNeeded = daysRemaining > 0 ? Math.max(0, targetMonthlyRevenue - monthlyRevenue) / daysRemaining : 0;

  // Mix breakdown for TODAY
  const mixStats = useMemo(() => {
    let newDevicesQty = 0;
    let newDevicesTotal = 0;
    let usedDevicesQty = 0;
    let usedDevicesTotal = 0;
    let casesQty = 0;
    let casesTotal = 0;
    let filmsQty = 0;
    let filmsTotal = 0;
    let otherAccQty = 0;
    let otherAccTotal = 0;

    let salesWithDevices = 0;
    let salesWithAccessories = 0;

    todaySales.forEach((sale) => {
      let hasDeviceInSale = false;
      let hasAccessoryInSale = false;

      sale.items.forEach((item) => {
        const cat = item.category || '';
        const name = (item.productName || '').toLowerCase();

        if (cat === 'Aparelho Novo' || name.includes('novo') || name.includes('iphone') || name.includes('galaxy') || name.includes('celular') || name.includes('smartphone')) {
          newDevicesQty += item.quantity;
          newDevicesTotal += item.total;
          hasDeviceInSale = true;
        } else if (cat === 'Aparelho Usado' || name.includes('usado') || name.includes('seminovo') || name.includes('troca')) {
          usedDevicesQty += item.quantity;
          usedDevicesTotal += item.total;
          hasDeviceInSale = true;
        } else if (cat === 'Capas' || name.includes('capa') || name.includes('case')) {
          casesQty += item.quantity;
          casesTotal += item.total;
          hasAccessoryInSale = true;
        } else if (cat === 'Películas' || name.includes('pelicula') || name.includes('película') || name.includes('vidro 3d')) {
          filmsQty += item.quantity;
          filmsTotal += item.total;
          hasAccessoryInSale = true;
        } else {
          otherAccQty += item.quantity;
          otherAccTotal += item.total;
          hasAccessoryInSale = true;
        }
      });

      if (hasDeviceInSale) salesWithDevices++;
      if (hasAccessoryInSale) salesWithAccessories++;
    });

    const totalAccessoriesTotal = casesTotal + filmsTotal + otherAccTotal;
    const totalDevicesQty = newDevicesQty + usedDevicesQty;
    const totalDevicesTotal = newDevicesTotal + usedDevicesTotal;
    const attachmentRate = salesWithDevices > 0 ? (salesWithAccessories / salesWithDevices) * 100 : (todaySales.length > 0 ? (salesWithAccessories / todaySales.length) * 100 : 0);
    const avgTicketPerDevice = totalDevicesQty > 0 ? totalDevicesTotal / totalDevicesQty : 0;

    return {
      newDevicesQty,
      newDevicesTotal,
      usedDevicesQty,
      usedDevicesTotal,
      casesQty,
      casesTotal,
      filmsQty,
      filmsTotal,
      otherAccQty,
      otherAccTotal,
      totalAccessoriesTotal,
      totalDevicesQty,
      totalDevicesTotal,
      attachmentRate,
      avgTicketPerDevice,
    };
  }, [todaySales]);

  // Payment methods breakdown for TODAY
  const paymentBreakdown = useMemo(() => {
    let pix = 0;
    let money = 0;
    let debit = 0;
    let credit = 0;
    let paymobiTotal = 0;
    let paymobiEntry = 0;
    let paymobiCount = 0;

    todaySales.forEach((sale) => {
      const method = sale.paymentMethod;
      if (method === 'pix') pix += sale.total;
      else if (method === 'dinheiro') money += sale.total;
      else if (method === 'cartao_debito') debit += sale.total;
      else if (method === 'cartao_credito') credit += sale.total;
      else if (method === 'paymobi') {
        paymobiCount++;
        const entry = sale.paymentDetails?.financing?.entryAmount || 0;
        paymobiEntry += entry;
        paymobiTotal += sale.total;
      }
    });

    return { pix, money, debit, credit, paymobiTotal, paymobiEntry, paymobiCount };
  }, [todaySales]);

  // Top Seller of the day
  const topSellerToday = useMemo(() => {
    const sellerMap = new Map<string, { seller: Seller | null; name: string; total: number; count: number }>();

    todaySales.forEach((s) => {
      const sId = s.sellerId || 'unknown';
      const sObj = sellers.find((item) => item.id === sId) || null;
      const current = sellerMap.get(sId) || {
        seller: sObj,
        name: s.sellerName || sObj?.name || 'Vendedor',
        total: 0,
        count: 0,
      };
      current.total += s.total;
      current.count += 1;
      sellerMap.set(sId, current);
    });

    const list = Array.from(sellerMap.values()).sort((a, b) => b.total - a.total);
    return list.length > 0 ? list[0] : null;
  }, [todaySales, sellers]);

  // Last 10 days sales volume series
  const last10DaysData = useMemo(() => {
    const result: { dateLabel: string; count: number; total: number }[] = [];
    for (let i = 9; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const daySales = scopedSales.filter((s) => s.status === 'completed' && s.date.startsWith(dStr));
      const weekDay = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'][d.getDay()];
      const dayNum = String(d.getDate()).padStart(2, '0');
      const monthNum = String(d.getMonth() + 1).padStart(2, '0');

      result.push({
        dateLabel: `${dayNum}/${monthNum} (${weekDay})`,
        count: daySales.length,
        total: daySales.reduce((acc, s) => acc + s.total, 0),
      });
    }
    return result;
  }, [scopedSales]);

  const totalLast10DaysCount = last10DaysData.reduce((acc, d) => acc + d.count, 0);
  const avgLast10Days = (totalLast10DaysCount / 10).toFixed(1);
  const max10DaysCount = Math.max(1, ...last10DaysData.map((d) => d.count));

  // Hourly distribution for today (08h to 21h)
  const hourlyData = useMemo(() => {
    const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
    return hours.map((h) => {
      const count = todaySales.filter((s) => {
        const saleHour = new Date(s.date).getHours();
        return saleHour === h;
      }).length;
      return {
        hourLabel: `${String(h).padStart(2, '0')}h`,
        count,
      };
    });
  }, [todaySales]);

  const maxHourlyCount = Math.max(1, ...hourlyData.map((h) => h.count));
  const peakHour = hourlyData.reduce((max, h) => (h.count > max.count ? h : max), { hourLabel: 'Sem vendas', count: 0 });

  // Trade-in (Seminovos) stats
  const tradeInStats = useMemo(() => {
    const todayTradeIns = todaySales.filter((s) => !!s.tradeIn);
    const todayCount = todayTradeIns.length;
    const todayVal = todayTradeIns.reduce((acc, s) => acc + (s.tradeIn?.evaluationValue || 0), 0);

    const monthTradeIns = monthlySales.filter((s) => !!s.tradeIn);
    const monthCount = monthTradeIns.length;
    const monthVal = monthTradeIns.reduce((acc, s) => acc + (s.tradeIn?.evaluationValue || 0), 0);

    return { todayCount, todayVal, monthCount, monthVal };
  }, [todaySales, monthlySales]);

  // Cancelled sales / Estornos audit for today
  const cancelledToday = useMemo(() => {
    return scopedSales.filter((s) => s.status === 'cancelled' && s.date.startsWith(todayDateStr));
  }, [scopedSales, todayDateStr]);

  return (
    <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-[#131722] rounded-2xl border border-slate-800 p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/60 flex items-center gap-1.5 font-mono">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                PAINEL EXECUTIVO DE GESTÃO & METAS
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                • AO VIVO
              </span>
            </div>
            <h1 className="text-2xl font-black text-white mt-2 tracking-tight">
              KPIs & Vendas
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Acompanhe o desempenho das filiais, volume de vendas, faturamento diário e progresso em relação às metas.
            </p>
          </div>

          {/* Controls: Branch Selector, Goals button, Refresh button */}
          <div className="flex items-center gap-2">
            {/* Branch Selector button */}
            <div className="relative">
              <button
                onClick={() => onSelectBranch(selectedBranchId === 'branch-embu' ? 'all' : 'branch-embu')}
                className="flex items-center gap-2 px-4 py-2 bg-[#1b2230] hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white transition cursor-pointer"
              >
                <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center text-white">
                  <Store className="w-3.5 h-3.5" />
                </div>
                <span>{isConsolidated ? 'Consolidado Geral ⌵' : `${activeBranch?.name || 'Embu das artes'} (Sua Loja) ⌵`}</span>
              </button>
            </div>

            {/* Goals button */}
            <button
              onClick={() => setShowGoalModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1b2230] hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 hover:text-white transition cursor-pointer"
            >
              <Target className="w-3.5 h-3.5 text-indigo-400" />
              <span>Metas</span>
            </button>

            {/* Refresh button */}
            <button
              onClick={() => {
                window.location.reload();
              }}
              className="p-2 bg-[#1b2230] hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition cursor-pointer"
              title="Atualizar dados"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Branch Context Info Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <span className="p-1 rounded-md bg-indigo-950 text-indigo-400">
              <Target className="w-3.5 h-3.5" />
            </span>
            <span>
              Exibindo dados para:{' '}
              <strong className="text-white font-bold">
                {isConsolidated ? 'Todas as Filiais (Consolidado)' : activeBranch?.name || 'Embu das artes'}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-[#1b2230] border border-slate-700/80 rounded-full text-slate-300">
              Meta Mensal: <strong className="text-white font-bold">{targetMonthlySales} vendas</strong>
            </span>
            <span className="px-3 py-1 bg-[#1b2230] border border-slate-700/80 rounded-full text-slate-300">
              Meta Faturamento: <strong className="text-white font-bold">{formatCurrency(targetMonthlyRevenue)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Destaques & Vendas do Dia, Mix, Destaque, PayMobi */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section: Destaques & Vendas do Dia */}
          <div className="bg-[#131722] rounded-2xl border border-slate-800 p-6 shadow-md space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white">
                      Destaques & Vendas do Dia
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1b2230] border border-slate-700 text-slate-300">
                      {formatDate(today.toISOString())}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Visão em tempo real do faturamento e vendas de hoje.
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-slate-300 bg-[#1b2230] border border-slate-700 px-3 py-1.5 rounded-full">
                📱 {mixStats.totalDevicesQty} aparelhos | 🎧 {formatCurrency(mixStats.totalAccessoriesTotal)} acess.
              </span>
            </div>

            {/* Row 1: Faturamento Total do Dia & Ticket Médio */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Faturamento Total do Dia */}
              <div className="p-5 bg-[#171c28] rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-black">
                      $
                    </div>
                    <span className="text-xs font-bold text-slate-300">
                      Faturamento Total do Dia
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                    {formatCurrency(mixStats.totalDevicesTotal)} aparelhos
                  </span>
                </div>

                <div className="pt-1">
                  <h3 className="text-3xl font-black text-white">
                    {formatCurrency(todayRevenue)}
                  </h3>
                </div>

                <div className="text-xs text-slate-400 space-y-0.5 pt-1">
                  <p>📱 {mixStats.totalDevicesQty} vendas de aparelhos hoje</p>
                  <p className="text-slate-500">
                    {mixStats.totalAccessoriesTotal > 0
                      ? `🎧 ${formatCurrency(mixStats.totalAccessoriesTotal)} em acessórios`
                      : 'Nenhum acessório vendido hoje'}
                  </p>
                </div>
              </div>

              {/* Ticket Médio por Aparelho */}
              <div className="p-5 bg-[#171c28] rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-black">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-300">
                      Ticket Médio por Aparelho
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                    Média / Venda
                  </span>
                </div>

                <div className="pt-1">
                  <h3 className="text-3xl font-black text-white">
                    {formatCurrency(mixStats.avgTicketPerDevice)}
                  </h3>
                </div>

                <p className="text-xs text-slate-400 pt-1">
                  Média de faturamento gerado por cada aparelho comercializado hoje.
                </p>
              </div>
            </div>

            {/* Row 2: Mix de Vendas do Dia & Destaque de Hoje */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Mix de Vendas do Dia */}
              <div className="p-5 bg-[#171c28] rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">
                      ⏱
                    </div>
                    <span className="text-xs font-bold text-slate-300">
                      Mix de Vendas do Dia
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                    Categorias
                  </span>
                </div>

                {/* Categories Breakdown */}
                <div className="space-y-1.5 text-xs text-slate-300 pt-1">
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span>📱 Novos:</span>
                    <span className="font-bold text-white">
                      {mixStats.newDevicesQty} un ({formatCurrency(mixStats.newDevicesTotal)})
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span>🔄 Usados:</span>
                    <span className="font-bold text-white">
                      {mixStats.usedDevicesQty} un ({formatCurrency(mixStats.usedDevicesTotal)})
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span>🛡️ Capas:</span>
                    <span className="font-bold text-white">
                      {mixStats.casesQty} un ({formatCurrency(mixStats.casesTotal)})
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span>💎 Películas:</span>
                    <span className="font-bold text-white">
                      {mixStats.filmsQty} un ({formatCurrency(mixStats.filmsTotal)})
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span>🎧 Outros Acessórios:</span>
                    <span className="font-bold text-white">
                      {mixStats.otherAccQty} un ({formatCurrency(mixStats.otherAccTotal)})
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 font-bold text-indigo-400">
                    <span>🛍️ TOTAL ACESSÓRIOS:</span>
                    <span>{formatCurrency(mixStats.totalAccessoriesTotal)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Taxa de Anexação:</span>
                  <span className={`font-bold ${mixStats.attachmentRate >= 40 ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {mixStats.attachmentRate.toFixed(1)}% {mixStats.attachmentRate >= 40 ? 'Excelente' : 'Abaixo'}
                  </span>
                </div>
              </div>

              {/* Destaque de Hoje */}
              <div className="p-5 bg-[#171c28] rounded-xl border border-slate-800 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs">
                        🏆
                      </div>
                      <span className="text-xs font-bold text-slate-300">
                        Destaque de Hoje
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                      Liderança
                    </span>
                  </div>

                  <div className="mt-4 text-center py-4 bg-[#131722] rounded-xl border border-slate-800/80">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">
                      VENDEDOR DESTAQUE
                    </span>
                    <h4 className="text-base font-bold text-white flex items-center justify-center gap-2">
                      <span>🏆</span>
                      <span>{topSellerToday ? topSellerToday.name : 'N/A'}</span>
                    </h4>
                    <p className="text-sm font-black text-emerald-400 mt-1">
                      {topSellerToday ? formatCurrency(topSellerToday.total) : 'R$ 0,00'}
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 text-center">
                  Líder em volume financeiro faturado até o momento.
                </p>
              </div>
            </div>

            {/* Row 3: Forma de Pagamento PayMobi (Hoje) */}
            <div className="p-5 bg-[#171c28] rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs">
                    <CreditCard className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-300">
                    Forma de Pagamento PayMobi (Hoje)
                  </span>
                </div>
                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-2 py-0.5 rounded-md">
                  PayMobi
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div>
                  <h3 className="text-2xl font-black text-white">
                    {formatCurrency(paymentBreakdown.paymobiTotal)}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {paymentBreakdown.paymobiCount} vendas financiadas
                  </span>
                </div>
                <div className="sm:text-right">
                  <span className="text-xs font-bold text-emerald-400 block">
                    💵 Entrou de Entrada:
                  </span>
                  <span className="text-base font-black text-white">
                    {formatCurrency(paymentBreakdown.paymobiEntry)}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                ℹ️ Nas vendas PayMobi, o faturamento da loja computa apenas o valor da entrada.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Progresso de Metas Acumulado do Mês */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#131722] rounded-2xl border border-slate-800 p-6 shadow-md space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Progresso de Metas
                  </h2>
                  <p className="text-xs text-slate-400">
                    Acumulado do Mês Atual
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowGoalModal(true)}
                className="p-1.5 text-slate-400 hover:text-white bg-[#1b2230] hover:bg-slate-800 border border-slate-700 rounded-lg transition cursor-pointer"
                title="Configurar Metas"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

            {/* Volume Section */}
            <div className="p-4 bg-[#171c28] rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                  <Package className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Volume</span>
                </div>
                <span className="font-extrabold text-white text-sm">
                  {monthlyVolumeCount} / {targetMonthlySales} ({volumeProgressPercent.toFixed(0)}%)
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, volumeProgressPercent)}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-400">
                Faltam {salesRemaining} vendas nos próximos {daysRemaining} dias.
              </p>
            </div>

            {/* Faturamento Section */}
            <div className="p-4 bg-[#171c28] rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                  <span className="text-emerald-400 font-black text-sm">$</span>
                  <span>Faturamento</span>
                </div>
                <span className="font-extrabold text-emerald-400 text-sm">
                  {revenueProgressPercent.toFixed(0)}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, revenueProgressPercent)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Atual: <strong className="text-white">{formatCurrency(monthlyRevenue)}</strong></span>
                <span>Meta: <strong className="text-white">{formatCurrency(targetMonthlyRevenue)}</strong></span>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                <p>
                  Ritmo diário necessário: <strong className="text-slate-200">{formatCurrency(dailyRevenueNeeded)}/dia</strong>
                </p>
                <p className="text-slate-500">
                  Dia {currentDayOfMonth} de {totalDaysInMonth} • {dailySalesNeeded} vendas/dia restantes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desempenho por Filial & Formas de Pagamento */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Desempenho por Filial & Formas de Pagamento (Hoje)
            </h3>
            <p className="text-xs text-slate-400">
              Vendas discriminadas por Aparelhos Novos, Usados/Trade-in, Acessórios e Entradas por Meio de Pagamento.
            </p>
          </div>
          <span className="text-xs font-black text-indigo-900 dark:text-white bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800">
            Faturamento Geral Hoje: {formatCurrency(todayRevenue)}
          </span>
        </div>

        {/* Consolidado Geral Card */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-300">
                CONSOLIDADO GERAL (TODAS AS FILIAIS)
              </span>
              <h4 className="text-lg font-bold">{formatDate(today.toISOString())}</h4>
            </div>
            <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full text-indigo-200 border border-white/10">
              {todaySales.length} vendas hoje
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/10 text-xs">
            <div className="bg-white/5 p-3 rounded-xl">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                📱 Aparelhos Novos
              </span>
              <span className="text-base font-black">{mixStats.newDevicesQty} aparelhos</span>
              <span className="text-xs text-indigo-300 block">{formatCurrency(mixStats.newDevicesTotal)}</span>
            </div>

            <div className="bg-white/5 p-3 rounded-xl">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                🔄 Aparelhos Usados
              </span>
              <span className="text-base font-black">{mixStats.usedDevicesQty} aparelhos</span>
              <span className="text-xs text-indigo-300 block">{formatCurrency(mixStats.usedDevicesTotal)}</span>
            </div>

            <div className="bg-white/5 p-3 rounded-xl">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                🎧 Acessórios
              </span>
              <span className="text-base font-black">
                {mixStats.casesQty + mixStats.filmsQty + mixStats.otherAccQty} itens
              </span>
              <span className="text-xs text-indigo-300 block">{formatCurrency(mixStats.totalAccessoriesTotal)}</span>
            </div>
          </div>

          {/* Formas de pagamento total */}
          <div className="pt-2 border-t border-white/10">
            <span className="text-[10px] font-extrabold text-indigo-200 uppercase tracking-wider block mb-2">
              💳 Valores Entrados por Forma de Pagamento (Total Hoje)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-white/5 p-2 rounded-lg">
                <span className="text-slate-400 block text-[10px]">⚡ PIX:</span>
                <span className="font-bold">{formatCurrency(paymentBreakdown.pix)}</span>
              </div>
              <div className="bg-white/5 p-2 rounded-lg">
                <span className="text-slate-400 block text-[10px]">💵 Dinheiro:</span>
                <span className="font-bold">{formatCurrency(paymentBreakdown.money)}</span>
              </div>
              <div className="bg-white/5 p-2 rounded-lg">
                <span className="text-slate-400 block text-[10px]">💳 Débito:</span>
                <span className="font-bold">{formatCurrency(paymentBreakdown.debit)}</span>
              </div>
              <div className="bg-white/5 p-2 rounded-lg">
                <span className="text-slate-400 block text-[10px]">💳 Crédito:</span>
                <span className="font-bold">{formatCurrency(paymentBreakdown.credit)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Individual Branch Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {branches.map((branch) => {
            const branchTodaySales = sales.filter(
              (s) => s.branchId === branch.id && s.status === 'completed' && s.date.startsWith(todayDateStr)
            );
            const bRevenue = branchTodaySales.reduce((acc, s) => acc + s.total, 0);

            // Mix per branch
            let bNewDev = 0;
            let bUsedDev = 0;
            let bAccCount = 0;
            let bPix = 0;
            let bMoney = 0;
            let bDebit = 0;
            let bCredit = 0;

            branchTodaySales.forEach((s) => {
              if (s.paymentMethod === 'pix') bPix += s.total;
              else if (s.paymentMethod === 'dinheiro') bMoney += s.total;
              else if (s.paymentMethod === 'cartao_debito') bDebit += s.total;
              else if (s.paymentMethod === 'cartao_credito') bCredit += s.total;

              s.items.forEach((i) => {
                const cat = i.category || '';
                if (cat === 'Aparelho Novo') bNewDev += i.quantity;
                else if (cat === 'Aparelho Usado') bUsedDev += i.quantity;
                else bAccCount += i.quantity;
              });
            });

            return (
              <div
                key={branch.id}
                className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      {branch.name}
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      {branch.isOpen ? `Aberto (${branch.manager})` : 'Fechado'}
                    </span>
                  </div>
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      branch.isOpen ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                  />
                </div>

                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-semibold block">
                    Faturamento Hoje
                  </span>
                  <span className="text-base font-black text-indigo-900 dark:text-white">
                    {formatCurrency(bRevenue)}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {branchTodaySales.length} vendas hoje
                  </span>
                </div>

                {/* Categories */}
                <div className="text-[11px] space-y-1 text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>📱 Novos:</span>
                    <strong>{bNewDev} un</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>🔄 Usados:</span>
                    <strong>{bUsedDev} un</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>🎧 Acessórios:</span>
                    <strong>{bAccCount} un</strong>
                  </div>
                </div>

                {/* Payments */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-[10px] space-y-1 text-slate-500 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>⚡ Pix:</span>
                    <strong>{formatCurrency(bPix)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>💵 Dinheiro:</span>
                    <strong>{formatCurrency(bMoney)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>💳 Cartões:</span>
                    <strong>{formatCurrency(bDebit + bCredit)}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gráficos & Estatísticas SmartOPS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quantidade de Vendas dos Últimos 10 Dias */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Quantidade de Vendas dos Últimos 10 Dias
              </h3>
              <p className="text-xs text-slate-400">
                Acompanhamento do volume diário de vendas finalizadas nos últimos 10 dias.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
              Total 10 Dias: {totalLast10DaysCount} vendas
            </span>
          </div>

          {/* Bar Chart Representation */}
          <div className="pt-4 space-y-2">
            <div className="flex items-end justify-between gap-1.5 h-36 border-b border-slate-200 dark:border-slate-700 pb-2">
              {last10DaysData.map((day, idx) => {
                const heightPercent = max10DaysCount > 0 ? (day.count / max10DaysCount) * 100 : 0;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition">
                      {day.count}
                    </span>
                    <div
                      className={`w-full max-w-[28px] rounded-t-md transition-all ${
                        idx === 9 ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700 group-hover:bg-indigo-400'
                      }`}
                      style={{ height: `${Math.max(6, heightPercent)}%` }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between text-[10px] text-slate-400 px-1 overflow-x-auto">
              {last10DaysData.map((day, idx) => (
                <span key={idx} className="text-center truncate max-w-[40px]">
                  {day.dateLabel.split(' ')[0]}
                </span>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
            <span>
              Foram concluídas <strong>{totalLast10DaysCount} vendas</strong> no período.
            </span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              Média Diária: {avgLast10Days} vendas/dia
            </span>
          </div>
        </div>

        {/* Distribuição de Vendas por Horário (Hoje) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Distribuição de Vendas por Horário (Hoje)
              </h3>
              <p className="text-xs text-slate-400">
                Acompanhe a curva de fluxo financeiro ao longo do dia para dimensionar a equipe.
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg">
              Pico Hoje: {peakHour.hourLabel} ({peakHour.count} vendas)
            </span>
          </div>

          {/* Hourly chart */}
          <div className="pt-4 space-y-2">
            <div className="flex items-end justify-between gap-1.5 h-36 border-b border-slate-200 dark:border-slate-700 pb-2">
              {hourlyData.map((h, idx) => {
                const heightPercent = maxHourlyCount > 0 ? (h.count / maxHourlyCount) * 100 : 0;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition">
                      {h.count}
                    </span>
                    <div
                      className={`w-full max-w-[20px] rounded-t-md transition-all ${
                        h.count > 0 ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'
                      }`}
                      style={{ height: `${Math.max(4, heightPercent)}%` }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between text-[10px] text-slate-400 px-0.5">
              {hourlyData.map((h, idx) => (
                <span key={idx} className="text-center">
                  {h.hourLabel}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                Giro de Seminovos (Trade-in)
              </span>
              <span className="font-bold text-slate-900 dark:text-white block mt-0.5">
                Hoje: {tradeInStats.todayCount} trocas ({formatCurrency(tradeInStats.todayVal)})
              </span>
              <span className="text-[10px] text-slate-500">
                Mês: {tradeInStats.monthCount} trocas ({formatCurrency(tradeInStats.monthVal)})
              </span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                Auditoria de Estornos (Hoje)
              </span>
              <span
                className={`font-bold block mt-0.5 ${
                  cancelledToday.length > 0 ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {cancelledToday.length === 0
                  ? '✅ Sem estornos hoje'
                  : `⚠️ ${cancelledToday.length} cancelamento(s)`}
              </span>
              <span className="text-[10px] text-slate-500">
                {cancelledToday.length === 0
                  ? 'Nenhuma venda cancelada'
                  : `Total: ${formatCurrency(cancelledToday.reduce((a, s) => a + s.total, 0))}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Atalhos Rápidos de Gestão SmartOPS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
          ATALHOS RÁPIDOS DE GESTÃO
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <button
            onClick={() => onNavigateTab('inventory')}
            className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-800 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center justify-between cursor-pointer"
          >
            <span>Produtos & Ativos</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onNavigateTab('transfers')}
            className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-800 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center justify-between cursor-pointer"
          >
            <span>Transferências</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onNavigateTab('pos')}
            className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-800 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center justify-between cursor-pointer"
          >
            <span>Registro de Vendas</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onNavigateTab('sales')}
            className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-800 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center justify-between cursor-pointer"
          >
            <span>Raio-X de Vendas</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onNavigateTab('pos')}
            className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-800 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center justify-between cursor-pointer"
          >
            <span>Puxadas PayMobi</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onNavigateTab('ranking')}
            className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-800 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center justify-between cursor-pointer"
          >
            <span>Ranking de Vendas</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#131722] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Configurar Metas Mensais</h3>
              </div>
              <button
                onClick={() => setShowGoalModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Defina as metas corporativas de volume de vendas e faturamento financeiro para acompanhamento em tempo real.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Meta Mensal de Volume (Aparelhos / Vendas)
                </label>
                <input
                  type="number"
                  value={tempSalesGoal}
                  onChange={(e) => setTempSalesGoal(e.target.value)}
                  className="w-full bg-[#1b2230] border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-hidden focus:border-indigo-500"
                  placeholder="Ex: 300"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Meta Mensal de Faturamento (R$)
                </label>
                <input
                  type="number"
                  value={tempRevenueGoal}
                  onChange={(e) => setTempRevenueGoal(e.target.value)}
                  className="w-full bg-[#1b2230] border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-hidden focus:border-indigo-500"
                  placeholder="Ex: 150000"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowGoalModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (activeBranch) {
                    activeBranch.monthlySalesGoal = Number(tempSalesGoal) || 300;
                    activeBranch.monthlyRevenueGoal = Number(tempRevenueGoal) || 150000;
                    StorageService.saveBranches(branches);
                  }
                  setShowGoalModal(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition"
              >
                Salvar Metas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
