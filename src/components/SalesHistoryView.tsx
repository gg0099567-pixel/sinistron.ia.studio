import React, { useState, useMemo } from 'react';
import { Sale } from '../types';
import { formatCurrency, formatPercent, formatDate } from '../utils/formatters';
import {
  History,
  Search,
  Filter,
  Download,
  Printer,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Eye,
  Calendar,
  CreditCard,
  Banknote,
  QrCode,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';

interface SalesHistoryViewProps {
  sales: Sale[];
  onOpenReceipt: (sale: Sale) => void;
  onCancelSale: (saleId: string) => void;
}

export const SalesHistoryView: React.FC<SalesHistoryViewProps> = ({
  sales,
  onOpenReceipt,
  onCancelSale,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [periodFilter, setPeriodFilter] = useState<'today' | '7days' | '30days' | 'all'>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSaleDetail, setSelectedSaleDetail] = useState<Sale | null>(null);

  // Filter logic
  const filteredSales = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysAgo = startOfToday - 7 * 24 * 3600 * 1000;
    const thirtyDaysAgo = startOfToday - 30 * 24 * 3600 * 1000;

    return sales.filter((sale) => {
      const saleTime = new Date(sale.date).getTime();

      // Period filter
      if (periodFilter === 'today' && saleTime < startOfToday) return false;
      if (periodFilter === '7days' && saleTime < sevenDaysAgo) return false;
      if (periodFilter === '30days' && saleTime < thirtyDaysAgo) return false;

      // Payment filter
      if (paymentFilter !== 'all' && sale.paymentMethod !== paymentFilter) return false;

      // Status filter
      if (statusFilter !== 'all' && sale.status !== statusFilter) return false;

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchCode = sale.code.toLowerCase().includes(query);
        const matchCustomer = sale.customer?.name?.toLowerCase().includes(query) || false;
        const matchItem = sale.items.some((i) => i.productName.toLowerCase().includes(query));
        return matchCode || matchCustomer || matchItem;
      }

      return true;
    });
  }, [sales, periodFilter, paymentFilter, statusFilter, searchTerm]);

  // Aggregate Metrics (only for completed sales)
  const activeSales = useMemo(() => {
    return filteredSales.filter((s) => s.status === 'completed');
  }, [filteredSales]);

  const totalGrossRevenue = useMemo(() => {
    return activeSales.reduce((acc, s) => acc + s.total, 0);
  }, [activeSales]);

  const totalCost = useMemo(() => {
    return activeSales.reduce((acc, s) => acc + s.costTotal, 0);
  }, [activeSales]);

  const totalGrossProfit = totalGrossRevenue - totalCost;
  const averageProfitMargin = totalGrossRevenue > 0 ? (totalGrossProfit / totalGrossRevenue) * 100 : 0;
  const avgTicket = activeSales.length > 0 ? totalGrossRevenue / activeSales.length : 0;

  const handleExportCSV = () => {
    const headers = 'Código,Data,Cliente,Forma Pagamento,Subtotal,Desconto,Total,Custo,Lucro,Status\n';
    const rows = filteredSales
      .map((s) => {
        return `"${s.code}","${formatDate(s.date)}","${s.customer?.name || 'Consumidor Final'}","${s.paymentMethod}",${s.subtotal},${s.discount},${s.total},${s.costTotal},${s.grossProfit},"${s.status}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `historico_vendas_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case 'pix':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <QrCode className="w-3 h-3" /> PIX
          </span>
        );
      case 'dinheiro':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Banknote className="w-3 h-3" /> Dinheiro
          </span>
        );
      case 'cartao_credito':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <CreditCard className="w-3 h-3" /> Crédito
          </span>
        );
      case 'cartao_debito':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <CreditCard className="w-3 h-3" /> Débito
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
            {method}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Financial Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Faturamento Selecionado
          </span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">
            {formatCurrency(totalGrossRevenue)}
          </h3>
          <span className="text-xs text-slate-500">{activeSales.length} venda(s) concluída(s)</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Lucro Bruto Real
          </span>
          <h3 className="text-2xl font-black text-emerald-700 mt-1">
            {formatCurrency(totalGrossProfit)}
          </h3>
          <span className="text-xs text-emerald-600 font-medium">
            Margem Bruta Média: {formatPercent(averageProfitMargin, 1)}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Custo das Mercadorias (CMV)
          </span>
          <h3 className="text-2xl font-black text-slate-700 mt-1">
            {formatCurrency(totalCost)}
          </h3>
          <span className="text-xs text-slate-500">Custo direto dos produtos</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Ticket Médio
          </span>
          <h3 className="text-2xl font-black text-indigo-900 mt-1">
            {formatCurrency(avgTicket)}
          </h3>
          <span className="text-xs text-indigo-600 font-medium">Média gasta por cliente</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por código (VD-...), cliente ou produto..."
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Period Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {[
              { id: 'today', label: 'Hoje' },
              { id: '7days', label: '7 Dias' },
              { id: '30days', label: '30 Dias' },
              { id: 'all', label: 'Todos' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriodFilter(p.id as any)}
                className={`px-3 py-1 rounded-lg transition ${
                  periodFilter === p.id
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Payment Method Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-hidden"
          >
            <option value="all">Todas as Formas</option>
            <option value="pix">PIX</option>
            <option value="dinheiro">Dinheiro</option>
            <option value="cartao_credito">Cartão de Crédito</option>
            <option value="cartao_debito">Cartão de Débito</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" />
          Exportar Relatório CSV
        </button>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Código / Data</th>
                <th className="py-3.5 px-4">Cliente</th>
                <th className="py-3.5 px-4">Itens</th>
                <th className="py-3.5 px-4">Pagamento</th>
                <th className="py-3.5 px-4 text-right">Valor Total</th>
                <th className="py-3.5 px-4 text-right">Lucro Bruto</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Nenhuma venda encontrada para o período selecionado.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => {
                  const isCancelled = sale.status === 'cancelled';
                  return (
                    <tr
                      key={sale.id}
                      className={`hover:bg-slate-50/80 transition ${
                        isCancelled ? 'opacity-50 bg-rose-50/20' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 block">{sale.code}</span>
                        <span className="text-[10px] text-slate-400">{formatDate(sale.date)}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 block">
                          {sale.customer?.name || 'Consumidor Final'}
                        </span>
                        {sale.customer?.phone && (
                          <span className="text-[10px] text-slate-400">{sale.customer.phone}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-slate-700">
                          {sale.items.length} item(ns) ({sale.items.reduce((a, b) => a + b.quantity, 0)} un)
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate max-w-xs">
                          {sale.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">{getPaymentMethodBadge(sale.paymentMethod)}</td>

                      <td className="py-3.5 px-4 text-right font-black text-slate-900">
                        {formatCurrency(sale.total)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                        {isCancelled ? '-' : formatCurrency(sale.grossProfit)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isCancelled
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {isCancelled ? (
                            <>
                              <XCircle className="w-3 h-3" /> Cancelada
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> Concluída
                            </>
                          )}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Re-print receipt */}
                          <button
                            type="button"
                            onClick={() => onOpenReceipt(sale)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Ver / Reimprimir Cupom"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Cancel sale / Return stock */}
                          {!isCancelled && (
                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Deseja realmente CANCELAR a venda ${sale.code}? Os produtos serão devolvidos automaticamente ao estoque.`
                                  )
                                ) {
                                  onCancelSale(sale.id);
                                }
                              }}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                              title="Cancelar Venda e Devolver ao Estoque"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
