import React, { useState, useMemo } from 'react';
import { Seller, Sale, Branch } from '../types';
import { formatCurrency, formatPercent } from '../utils/formatters';
import {
  Trophy,
  Award,
  Users,
  TrendingUp,
  Target,
  Smartphone,
  Headphones,
  Percent,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  UserCheck,
  Shield,
  ShieldAlert,
  AlertTriangle,
  Lock,
  X,
} from 'lucide-react';

interface TeamRankingViewProps {
  sellers: Seller[];
  sales: Sale[];
  branches: Branch[];
  currentSellerId: string;
  userRole: 'Administrador' | 'Gerente' | 'Vendedor';
  onSaveSeller: (seller: Seller) => void;
  onDeleteSeller: (sellerId: string) => void;
}

export const TeamRankingView: React.FC<TeamRankingViewProps> = ({
  sellers,
  sales,
  branches,
  currentSellerId,
  userRole,
  onSaveSeller,
  onDeleteSeller,
}) => {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('month');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const [editingSeller, setEditingSeller] = useState<Seller | null>(null);
  const [sellerToDelete, setSellerToDelete] = useState<Seller | null>(null);

  const isAdmin = userRole === 'Administrador';

  // Form State
  const [formData, setFormData] = useState<Partial<Seller>>({
    name: '',
    role: 'Vendedor',
    branchId: branches[0]?.id || '',
    commissionRate: 2.5,
    monthlySalesGoal: 60,
    monthlyRevenueGoal: 30000,
    avatar: '🧑‍💼',
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);

  // Filter sales based on period
  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      if (s.status !== 'completed') return false;
      if (branchFilter !== 'all' && s.branchId !== branchFilter) return false;

      if (period === 'today') {
        return s.date.startsWith(todayStr);
      }
      if (period === 'month') {
        return s.date.startsWith(currentMonthStr);
      }
      if (period === 'week') {
        const saleDate = new Date(s.date);
        const now = new Date();
        const diffDays = (now.getTime() - saleDate.getTime()) / (1000 * 3600 * 24);
        return diffDays <= 7;
      }
      return true;
    });
  }, [sales, period, branchFilter, todayStr, currentMonthStr]);

  // Compute seller ranking stats
  const rankingList = useMemo(() => {
    const list = sellers.map((seller) => {
      const sellerSales = filteredSales.filter((s) => s.sellerId === seller.id);
      const totalRevenue = sellerSales.reduce((acc, s) => acc + s.total, 0);
      const totalSalesCount = sellerSales.length;

      let devicesCount = 0;
      let accessoriesCount = 0;
      let salesWithDevices = 0;
      let salesWithAccessories = 0;

      sellerSales.forEach((s) => {
        let hasDev = false;
        let hasAcc = false;
        s.items.forEach((item) => {
          const cat = item.category || '';
          if (cat === 'Aparelho Novo' || cat === 'Aparelho Usado') {
            devicesCount += item.quantity;
            hasDev = true;
          } else {
            accessoriesCount += item.quantity;
            hasAcc = true;
          }
        });
        if (hasDev) salesWithDevices++;
        if (hasAcc) salesWithAccessories++;
      });

      const attachmentRate =
        salesWithDevices > 0
          ? (salesWithAccessories / salesWithDevices) * 100
          : totalSalesCount > 0
          ? (salesWithAccessories / totalSalesCount) * 100
          : 0;

      const avgTicket = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0;
      const commissionAmount = (totalRevenue * (seller.commissionRate || 2.5)) / 100;
      const goalRevenuePercent =
        seller.monthlyRevenueGoal > 0 ? (totalRevenue / seller.monthlyRevenueGoal) * 100 : 0;
      const goalVolumePercent =
        seller.monthlySalesGoal > 0 ? (totalSalesCount / seller.monthlySalesGoal) * 100 : 0;

      const branchObj = branches.find((b) => b.id === seller.branchId);

      return {
        ...seller,
        branchName: branchObj?.name || 'Filial',
        totalRevenue,
        totalSalesCount,
        devicesCount,
        accessoriesCount,
        attachmentRate,
        avgTicket,
        commissionAmount,
        goalRevenuePercent,
        goalVolumePercent,
      };
    });

    // Sort by revenue descending
    return list.sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [sellers, filteredSales, branches]);

  const activeLoggedInSellerStats = rankingList.find((s) => s.id === currentSellerId);

  const handleOpenNewSeller = () => {
    setEditingSeller(null);
    setFormData({
      name: '',
      role: 'Vendedor',
      branchId: branches[0]?.id || '',
      commissionRate: 2.5,
      monthlySalesGoal: 60,
      monthlyRevenueGoal: 30000,
      avatar: '🧑‍💼',
    });
    setIsSellerModalOpen(true);
  };

  const handleOpenEditSeller = (seller: Seller) => {
    setEditingSeller(seller);
    setFormData({ ...seller });
    setIsSellerModalOpen(true);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const sellerObj: Seller = {
      id: editingSeller?.id || `seller-${Date.now()}`,
      name: formData.name.trim(),
      role: formData.role || 'Vendedor',
      branchId: formData.branchId || branches[0]?.id || '',
      commissionRate: Number(formData.commissionRate) || 2.5,
      monthlySalesGoal: Number(formData.monthlySalesGoal) || 60,
      monthlyRevenueGoal: Number(formData.monthlyRevenueGoal) || 30000,
      avatar: formData.avatar || '🧑‍💼',
    };

    onSaveSeller(sellerObj);
    setIsSellerModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                RECURSOS HUMANOS & EQUIPE
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                <Trophy className="w-3.5 h-3.5" />
                Ranking de Vendas da Equipe
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              Desempenho Comercial & Metas Individuais
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Acompanhamento de volume, faturamento, comissionamento e taxa de anexação de acessórios por vendedor.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <span
              className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 shadow-xs ${
                isAdmin
                  ? 'bg-purple-950/80 text-purple-300 border-purple-600/50'
                  : 'bg-[#180d31] text-purple-300/70 border-purple-800/40'
              }`}
            >
              {isAdmin ? (
                <>
                  <Shield className="w-3.5 h-3.5 text-purple-400" />
                  <span>Administrador: Gestão & Desligamento</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-purple-400/60" />
                  <span>{userRole}: Remoção restrita ao Administrador</span>
                </>
              )}
            </span>

            {isAdmin && (
              <button
                onClick={handleOpenNewSeller}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Cadastrar Colaborador
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Period selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setPeriod('today')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                period === 'today'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Hoje
            </button>
            <button
              onClick={() => setPeriod('week')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                period === 'week'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Esta Semana
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                period === 'month'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Este Mês
            </button>
            <button
              onClick={() => setPeriod('all')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                period === 'all'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Todo Período
            </button>
          </div>

          {/* Branch filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Filial:</span>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Todas as Filiais</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Logged-in Seller Personal Focus Card (if in Seller View or specific seller selected) */}
      {activeLoggedInSellerStats && (
        <div className="p-5 bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl">
                {activeLoggedInSellerStats.avatar}
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-300">
                  SUAS MÉTRICAS INDIVIDUAIS • {activeLoggedInSellerStats.role.toUpperCase()}
                </span>
                <h3 className="text-lg font-black">{activeLoggedInSellerStats.name}</h3>
                <p className="text-xs text-indigo-200">
                  Filial: {activeLoggedInSellerStats.branchName} • Taxa de Comissão: {activeLoggedInSellerStats.commissionRate}%
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] font-extrabold uppercase text-slate-300 block">
                Sua Comissão Estimada ({period === 'today' ? 'Hoje' : 'Período'})
              </span>
              <span className="text-2xl font-black text-emerald-400">
                {formatCurrency(activeLoggedInSellerStats.commissionAmount)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/10 text-xs">
            <div className="bg-white/5 p-3 rounded-xl">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                Faturamento Realizado
              </span>
              <span className="text-base font-black">
                {formatCurrency(activeLoggedInSellerStats.totalRevenue)}
              </span>
              <span className="text-[10px] text-indigo-300 block">
                Meta: {formatCurrency(activeLoggedInSellerStats.monthlyRevenueGoal)} ({activeLoggedInSellerStats.goalRevenuePercent.toFixed(1)}%)
              </span>
            </div>

            <div className="bg-white/5 p-3 rounded-xl">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                Volume de Vendas
              </span>
              <span className="text-base font-black">
                {activeLoggedInSellerStats.totalSalesCount} vendas
              </span>
              <span className="text-[10px] text-indigo-300 block">
                Meta: {activeLoggedInSellerStats.monthlySalesGoal} vendas ({activeLoggedInSellerStats.goalVolumePercent.toFixed(1)}%)
              </span>
            </div>

            <div className="bg-white/5 p-3 rounded-xl">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                Aparelhos / Acessórios
              </span>
              <span className="text-base font-black">
                {activeLoggedInSellerStats.devicesCount} un / {activeLoggedInSellerStats.accessoriesCount} un
              </span>
              <span className="text-[10px] text-emerald-300 block">
                Taxa de Anexação: {activeLoggedInSellerStats.attachmentRate.toFixed(1)}%
              </span>
            </div>

            <div className="bg-white/5 p-3 rounded-xl">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                Ticket Médio
              </span>
              <span className="text-base font-black">
                {formatCurrency(activeLoggedInSellerStats.avgTicket)}
              </span>
              <span className="text-[10px] text-slate-300 block">Média por atendimento</span>
            </div>
          </div>
        </div>
      )}

      {/* Podium Cards for Top 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {rankingList.slice(0, 3).map((seller, idx) => {
          const medal = idx === 0 ? '🥇 1º Lugar' : idx === 1 ? '🥈 2º Lugar' : '🥉 3º Lugar';
          const medalBg =
            idx === 0
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300'
              : idx === 1
              ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200'
              : 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800 text-orange-900 dark:text-orange-300';

          return (
            <div
              key={seller.id}
              className={`rounded-2xl border p-5 shadow-xs flex flex-col justify-between ${medalBg}`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase tracking-wider">{medal}</span>
                  <span className="text-[11px] font-bold opacity-75">{seller.branchName}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/80 dark:bg-slate-900 flex items-center justify-center text-2xl shadow-xs">
                    {seller.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-base leading-tight">{seller.name}</h4>
                    <span className="text-xs opacity-75">{seller.role}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-current/10 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="opacity-75">Faturamento:</span>
                    <strong className="font-black text-sm">{formatCurrency(seller.totalRevenue)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-75">Vendas:</span>
                    <strong>{seller.totalSalesCount} fechamentos</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-75">Taxa de Anexação:</span>
                    <strong className="text-emerald-700 dark:text-emerald-400">
                      {seller.attachmentRate.toFixed(1)}%
                    </strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-current/10 flex items-center justify-between text-xs">
                <span className="opacity-75">Comissão:</span>
                <span className="font-extrabold">{formatCurrency(seller.commissionAmount)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Ranking Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Tabela Geral de Produtividade da Equipe
          </h3>
          <span className="text-xs text-slate-400">{rankingList.length} colaboradores listados</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 text-center">Pos.</th>
                <th className="py-3 px-4">Vendedor / Função</th>
                <th className="py-3 px-4">Filial</th>
                <th className="py-3 px-4 text-center">Volume</th>
                <th className="py-3 px-4 text-right">Faturamento</th>
                <th className="py-3 px-4 text-center">Aparelhos</th>
                <th className="py-3 px-4 text-center">Acessórios</th>
                <th className="py-3 px-4 text-center">Anexação</th>
                <th className="py-3 px-4 text-right">Comissão</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {rankingList.map((seller, index) => (
                <tr
                  key={seller.id}
                  className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition ${
                    seller.id === currentSellerId ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                  }`}
                >
                  <td className="py-3 px-4 text-center font-bold">
                    {index === 0 ? '🥇 1º' : index === 1 ? '🥈 2º' : index === 2 ? '🥉 3º' : `${index + 1}º`}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{seller.avatar}</span>
                      <div>
                        <strong className="text-slate-900 dark:text-white block font-bold">
                          {seller.name}
                        </strong>
                        <span className="text-[10px] text-slate-400">{seller.role}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium">{seller.branchName}</td>
                  <td className="py-3 px-4 text-center font-bold">{seller.totalSalesCount}</td>
                  <td className="py-3 px-4 text-right font-black text-indigo-950 dark:text-white">
                    {formatCurrency(seller.totalRevenue)}
                  </td>
                  <td className="py-3 px-4 text-center">{seller.devicesCount} un</td>
                  <td className="py-3 px-4 text-center">{seller.accessoriesCount} un</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        seller.attachmentRate >= 40
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {seller.attachmentRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(seller.commissionAmount)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditSeller(seller)}
                        className="p-1.5 text-purple-300 hover:text-white hover:bg-purple-900/50 rounded-lg transition cursor-pointer"
                        title="Editar Colaborador"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {isAdmin ? (
                        <button
                          onClick={() => setSellerToDelete(seller)}
                          className="p-1.5 text-rose-400 hover:text-white hover:bg-rose-950/80 border border-rose-900/40 hover:border-rose-600/60 rounded-lg transition cursor-pointer"
                          title="Remover / Desligar Colaborador (Exclusivo Administrador)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            alert(
                              'Acesso Restrito: Apenas o Administrador possui autorização para remover ou desligar colaboradores da equipe. Alterne para o perfil Administrador no menu superior.'
                            )
                          }
                          className="p-1.5 text-purple-300/40 hover:text-purple-300/70 rounded-lg transition cursor-not-allowed"
                          title="Remoção restrita ao Administrador"
                        >
                          <Lock className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Cadastrar / Editar Vendedor */}
      {isSellerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#120824] rounded-3xl max-w-md w-full border border-purple-500/30 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-purple-100">
            <div className="p-5 border-b border-purple-900/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-950/80 border border-purple-600/50 rounded-xl text-purple-300">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-base">
                  {editingSeller ? 'Editar Colaborador' : 'Novo Colaborador'}
                </h3>
              </div>
              <button
                onClick={() => setIsSellerModalOpen(false)}
                className="text-purple-400 hover:text-white p-1 rounded-lg hover:bg-purple-900/40 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-purple-200 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Guilherme Gomes"
                  className="w-full bg-[#180d31] border border-purple-800/60 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-purple-200 mb-1">
                    Função / Cargo
                  </label>
                  <select
                    value={formData.role || 'Vendedor'}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value as any })
                    }
                    className="w-full bg-[#180d31] border border-purple-800/60 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-400"
                  >
                    <option value="Administrador">Administrador</option>
                    <option value="Gerente">Gerente</option>
                    <option value="Vendedor">Vendedor</option>
                    <option value="Consultor">Consultor</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-purple-200 mb-1">
                    Filial Base
                  </label>
                  <select
                    value={formData.branchId || ''}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    className="w-full bg-[#180d31] border border-purple-800/60 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-400"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-purple-200 mb-1">
                    Comissão (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.commissionRate || 2.5}
                    onChange={(e) =>
                      setFormData({ ...formData, commissionRate: Number(e.target.value) })
                    }
                    className="w-full bg-[#180d31] border border-purple-800/60 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-purple-200 mb-1">
                    Meta Vendas
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.monthlySalesGoal || 60}
                    onChange={(e) =>
                      setFormData({ ...formData, monthlySalesGoal: Number(e.target.value) })
                    }
                    className="w-full bg-[#180d31] border border-purple-800/60 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-purple-200 mb-1">
                    Avatar (Emoji)
                  </label>
                  <input
                    type="text"
                    value={formData.avatar || '🧑‍💼'}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    className="w-full bg-[#180d31] border border-purple-800/60 rounded-xl px-3 py-2 text-center text-white focus:outline-hidden focus:border-purple-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-purple-200 mb-1">
                  Meta Mensal de Faturamento (R$)
                </label>
                <input
                  type="number"
                  step="100"
                  min="0"
                  value={formData.monthlyRevenueGoal || 30000}
                  onChange={(e) =>
                    setFormData({ ...formData, monthlyRevenueGoal: Number(e.target.value) })
                  }
                  className="w-full bg-[#180d31] border border-purple-800/60 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-400"
                />
              </div>

              <div className="pt-3 border-t border-purple-900/40 flex items-center justify-between gap-2">
                {editingSeller && isAdmin ? (
                  <button
                    type="button"
                    onClick={() => {
                      const toDelete = editingSeller;
                      setIsSellerModalOpen(false);
                      setSellerToDelete(toDelete);
                    }}
                    className="px-3 py-2 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 text-rose-300 hover:text-white rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer"
                    title="Desligar este colaborador do sistema"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    Desligar
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSellerModalOpen(false)}
                    className="px-4 py-2 bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 rounded-xl font-bold transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-lg shadow-purple-600/30 transition cursor-pointer"
                  >
                    Salvar Colaborador
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmação: Administrador desligando colaborador */}
      {sellerToDelete && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#120824] border border-rose-500/50 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-purple-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-950/80 border border-rose-500/50 flex items-center justify-center text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Desligar Colaborador da Equipe</h3>
                <p className="text-xs text-rose-300">Ação restrita ao Administrador</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#180d31] border border-purple-500/30 text-xs space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">{sellerToDelete.avatar || '🧑‍💼'}</span>
                <p className="text-white font-bold text-sm">{sellerToDelete.name}</p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-700">
                  {sellerToDelete.role}
                </span>
              </div>
              <p className="text-purple-300/80">E-mail: <span className="text-white font-semibold">{sellerToDelete.email || 'Não cadastrado'}</span></p>
              <p className="text-purple-300/80">Comissão Cadastrada: <span className="text-emerald-400 font-semibold">{sellerToDelete.commissionRate}%</span></p>
            </div>

            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/40 text-xs text-rose-200/90 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>
                Tem certeza que deseja desligar e remover o colaborador <strong>{sellerToDelete.name}</strong> da equipe? O histórico de vendas continuará salvo, mas o usuário perderá o acesso comercial.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSellerToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-purple-300 hover:text-white bg-purple-950/50 border border-purple-800/50 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteSeller(sellerToDelete.id);
                  setSellerToDelete(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition shadow-[0_0_15px_rgba(225,29,72,0.4)] flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Confirmar Desligamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
