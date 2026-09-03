import React, { useMemo } from 'react';
import { Sale, Product, Expense } from '../types';
import { formatCurrency, formatPercent, formatDateShort } from '../utils/formatters';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Award,
  DollarSign,
  ShoppingCart,
  Percent,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

interface AnalyticsViewProps {
  sales: Sale[];
  products: Product[];
  expenses: Expense[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ sales, products, expenses }) => {
  const completedSales = useMemo(() => sales.filter((s) => s.status === 'completed'), [sales]);

  // Overall Totals
  const totalRevenue = useMemo(
    () => completedSales.reduce((acc, s) => acc + s.total, 0),
    [completedSales]
  );
  const totalCost = useMemo(
    () => completedSales.reduce((acc, s) => acc + s.costTotal, 0),
    [completedSales]
  );
  const grossProfit = totalRevenue - totalCost;
  const grossMarginPercent = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  const avgTicket = completedSales.length > 0 ? totalRevenue / completedSales.length : 0;

  // Total items sold
  const totalItemsSold = useMemo(
    () =>
      completedSales.reduce(
        (acc, s) => acc + s.items.reduce((sum, item) => sum + item.quantity, 0),
        0
      ),
    [completedSales]
  );

  // Sales grouped by day for visual bar chart
  const salesByDay = useMemo(() => {
    const map: Record<string, { date: string; total: number; count: number }> = {};
    completedSales.forEach((sale) => {
      const dayKey = sale.date.split('T')[0];
      if (!map[dayKey]) {
        map[dayKey] = { date: dayKey, total: 0, count: 0 };
      }
      map[dayKey].total += sale.total;
      map[dayKey].count += 1;
    });

    const sortedDays = Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
    return sortedDays.slice(-7); // Last 7 active days
  }, [completedSales]);

  const maxDayTotal = useMemo(() => {
    return Math.max(...salesByDay.map((d) => d.total), 100);
  }, [salesByDay]);

  // Payment Methods Breakdown
  const paymentBreakdown = useMemo(() => {
    const map: Record<string, number> = {
      pix: 0,
      dinheiro: 0,
      cartao_credito: 0,
      cartao_debito: 0,
      outros: 0,
    };

    completedSales.forEach((s) => {
      if (map[s.paymentMethod] !== undefined) {
        map[s.paymentMethod] += s.total;
      } else {
        map['outros'] += s.total;
      }
    });

    return [
      { method: 'PIX', amount: map.pix, color: 'bg-emerald-500', barColor: '#10b981' },
      { method: 'Cartão Crédito', amount: map.cartao_credito, color: 'bg-indigo-500', barColor: '#6366f1' },
      { method: 'Dinheiro', amount: map.dinheiro, color: 'bg-emerald-700', barColor: '#047857' },
      { method: 'Cartão Débito', amount: map.cartao_debito, color: 'bg-sky-500', barColor: '#0ea5e9' },
    ].filter((p) => p.amount > 0);
  }, [completedSales]);

  // Products Ranking / ABC Curve
  const productRanking = useMemo(() => {
    const prodMap: Record<
      string,
      {
        id: string;
        name: string;
        code: string;
        category: string;
        quantitySold: number;
        revenue: number;
        cost: number;
        profit: number;
      }
    > = {};

    completedSales.forEach((s) => {
      s.items.forEach((item) => {
        if (!prodMap[item.productId]) {
          prodMap[item.productId] = {
            id: item.productId,
            name: item.productName,
            code: item.code,
            category: 'Geral',
            quantitySold: 0,
            revenue: 0,
            cost: 0,
            profit: 0,
          };
        }
        prodMap[item.productId].quantitySold += item.quantity;
        prodMap[item.productId].revenue += item.total;
        prodMap[item.productId].cost += item.costPrice * item.quantity;
        prodMap[item.productId].profit += item.total - item.costPrice * item.quantity;
      });
    });

    const sorted = Object.values(prodMap).sort((a, b) => b.revenue - a.revenue);

    // Calculate ABC classification
    let accumulatedRevenue = 0;
    return sorted.map((p) => {
      accumulatedRevenue += p.revenue;
      const accumulatedPercent = totalRevenue > 0 ? (accumulatedRevenue / totalRevenue) * 100 : 0;
      let classification: 'A' | 'B' | 'C' = 'C';
      if (accumulatedPercent <= 80) {
        classification = 'A';
      } else if (accumulatedPercent <= 95) {
        classification = 'B';
      }

      return {
        ...p,
        classification,
        revenueSharePercent: totalRevenue > 0 ? (p.revenue / totalRevenue) * 100 : 0,
      };
    });
  }, [completedSales, totalRevenue]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Faturamento Total Acumulado
          </span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">
            {formatCurrency(totalRevenue)}
          </h3>
          <span className="text-xs text-indigo-600 font-medium">
            {completedSales.length} vendas • {totalItemsSold} unidades
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Lucro Bruto Consolidado
          </span>
          <h3 className="text-2xl font-black text-emerald-700 mt-1">
            {formatCurrency(grossProfit)}
          </h3>
          <span className="text-xs text-emerald-600 font-medium">
            Margem Bruta Média: {formatPercent(grossMarginPercent, 1)}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Ticket Médio por Venda
          </span>
          <h3 className="text-2xl font-black text-indigo-900 mt-1">
            {formatCurrency(avgTicket)}
          </h3>
          <span className="text-xs text-slate-500">Gasto médio por cliente</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Top Produto Mais Vendido
          </span>
          <h3 className="text-base font-bold text-slate-900 mt-1 truncate">
            {productRanking[0]?.name || 'Nenhum item'}
          </h3>
          <span className="text-xs text-emerald-700 font-bold">
            {productRanking[0] ? formatCurrency(productRanking[0].revenue) : '-'} faturados
          </span>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales by Period Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              Evolução de Faturamento Diário
            </h3>
            <span className="text-xs text-slate-500">Últimos dias com atividade</span>
          </div>

          {salesByDay.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-xs">
              Nenhuma venda registrada no período.
            </div>
          ) : (
            <div className="space-y-4 pt-4">
              <div className="h-52 flex items-end gap-3 sm:gap-6 pt-6 px-2">
                {salesByDay.map((day) => {
                  const heightPercent = Math.max(12, (day.total / maxDayTotal) * 100);
                  return (
                    <div
                      key={day.date}
                      className="flex-1 flex flex-col items-center gap-2 group relative h-full justify-end"
                    >
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition absolute -top-8 bg-slate-900 text-white text-[10px] py-1 px-2 rounded font-bold whitespace-nowrap pointer-events-none z-10">
                        {formatCurrency(day.total)} ({day.count} vendas)
                      </div>

                      <div className="w-full bg-slate-100 rounded-t-lg h-full flex items-end overflow-hidden">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full bg-indigo-600 group-hover:bg-indigo-700 transition-all rounded-t-lg"
                        />
                      </div>

                      <span className="text-[10px] font-bold text-slate-600 whitespace-nowrap">
                        {formatDateShort(day.date)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Payment Methods Distribution (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-600" />
              Distribuição por Meio de Pagamento
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Participação de cada método no volume financeiro total.
            </p>
          </div>

          <div className="space-y-3 my-2">
            {paymentBreakdown.map((item) => {
              const percent = totalRevenue > 0 ? (item.amount / totalRevenue) * 100 : 0;
              return (
                <div key={item.method} className="space-y-1 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-700">{item.method}</span>
                    <span className="text-slate-900">
                      {formatCurrency(item.amount)} ({formatPercent(percent, 1)})
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percent}%` }}
                      className={`h-full ${item.color} rounded-full`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
            Dica: Vendas via PIX e Dinheiro proporcionam recebimento imediato e menor incidência de taxas de intermediação.
          </div>
        </div>
      </div>

      {/* Curva ABC / Ranking de Produtos */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              Classificação & Curva ABC de Produtos
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Classe A = 80% do faturamento (mais importantes) • Classe B = 15% • Classe C = 5%
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Posição / Produto</th>
                <th className="py-3.5 px-4 text-center">Classe ABC</th>
                <th className="py-3.5 px-4 text-center">Qtd Vendida</th>
                <th className="py-3.5 px-4 text-right">Faturamento Total</th>
                <th className="py-3.5 px-4 text-right">Lucro Bruto</th>
                <th className="py-3.5 px-4 text-right">Part. % Faturamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {productRanking.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Nenhum produto vendido ainda.
                  </td>
                </tr>
              ) : (
                productRanking.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-bold text-slate-900 block">{p.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Cód: {p.code}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          p.classification === 'A'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : p.classification === 'B'
                            ? 'bg-sky-100 text-sky-900 border border-sky-300'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        Classe {p.classification}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-semibold text-slate-800">
                      {p.quantitySold} un
                    </td>

                    <td className="py-3.5 px-4 text-right font-black text-slate-900">
                      {formatCurrency(p.revenue)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                      {formatCurrency(p.profit)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-semibold text-slate-600">
                      {formatPercent(p.revenueSharePercent, 1)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
