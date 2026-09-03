import React, { useState, useMemo } from 'react';
import { CashRegister, Expense, Sale, CashEntry } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Lock,
  Unlock,
  Plus,
  Receipt,
  FileText,
  DollarSign,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Trash2,
  X,
} from 'lucide-react';

interface CashRegisterViewProps {
  cashRegister: CashRegister;
  expenses: Expense[];
  sales: Sale[];
  onOpenCash: (initialAmount: number) => void;
  onCloseCash: () => void;
  onAddCashEntry: (entry: CashEntry) => void;
  onAddExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
}

export const CashRegisterView: React.FC<CashRegisterViewProps> = ({
  cashRegister,
  expenses,
  sales,
  onOpenCash,
  onCloseCash,
  onAddCashEntry,
  onAddExpense,
  onDeleteExpense,
}) => {
  const [activeTab, setActiveTab] = useState<'cash' | 'expenses' | 'dre'>('cash');

  // Modal states
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [entryType, setEntryType] = useState<'supply' | 'bleed'>('supply');
  const [entryAmount, setEntryAmount] = useState<number>(50);
  const [entryDescription, setEntryDescription] = useState('');

  const [isOpenCashModalOpen, setIsOpenCashModalOpen] = useState(false);
  const [initialCashInput, setInitialCashInput] = useState<number>(200);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Infraestrutura');
  const [expenseAmount, setExpenseAmount] = useState<number>(0);
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

  // Today sales breakdown by method
  const todaySales = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return sales.filter((s) => s.status === 'completed' && s.date.startsWith(today));
  }, [sales]);

  const cashSalesTotal = todaySales
    .filter((s) => s.paymentMethod === 'dinheiro')
    .reduce((acc, s) => acc + s.total, 0);

  const pixSalesTotal = todaySales
    .filter((s) => s.paymentMethod === 'pix')
    .reduce((acc, s) => acc + s.total, 0);

  const cardSalesTotal = todaySales
    .filter((s) => s.paymentMethod === 'cartao_credito' || s.paymentMethod === 'cartao_debito')
    .reduce((acc, s) => acc + s.total, 0);

  // Month DRE Metrics
  const dre = useMemo(() => {
    const completedSales = sales.filter((s) => s.status === 'completed');
    const grossRevenue = completedSales.reduce((acc, s) => acc + s.total + s.discount, 0);
    const discounts = completedSales.reduce((acc, s) => acc + s.discount, 0);
    const netRevenue = grossRevenue - discounts;
    const cmv = completedSales.reduce((acc, s) => acc + s.costTotal, 0);
    const grossProfit = netRevenue - cmv;

    // Card fees
    const cardFees = completedSales.reduce((acc, s) => {
      const fee = s.paymentDetails.cardFeePercent || 0;
      return acc + (s.total * fee) / 100;
    }, 0);

    // Total expenses paid
    const totalExpenses = expenses
      .filter((e) => e.status === 'paid')
      .reduce((acc, e) => acc + e.amount, 0);

    const operationalProfit = grossProfit - cardFees - totalExpenses;
    const netMarginPercent = netRevenue > 0 ? (operationalProfit / netRevenue) * 100 : 0;

    return {
      grossRevenue,
      discounts,
      netRevenue,
      cmv,
      grossProfit,
      cardFees,
      totalExpenses,
      operationalProfit,
      netMarginPercent,
    };
  }, [sales, expenses]);

  const handleConfirmEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (entryAmount <= 0) return;

    const newEntry: CashEntry = {
      id: `cash-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: entryType,
      amount: entryAmount,
      description:
        entryDescription ||
        (entryType === 'supply' ? 'Suprimento de Troco' : 'Sangria de Caixa'),
    };

    onAddCashEntry(newEntry);
    setIsEntryModalOpen(false);
    setEntryDescription('');
  };

  const handleConfirmExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseDesc || expenseAmount <= 0) return;

    onAddExpense({
      id: `exp-${Date.now()}`,
      description: expenseDesc.trim(),
      category: expenseCategory,
      amount: expenseAmount,
      date: expenseDate,
      status: 'paid',
    });

    setIsExpenseModalOpen(false);
    setExpenseDesc('');
    setExpenseAmount(0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-indigo-600" />
            Controle de Caixa & Financeiro
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Abertura e fechamento de caixa, sangrias, suprimentos, despesas operacionais e DRE da empresa.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('cash')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'cash'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Caixa do Dia
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'expenses'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Despesas Operacionais
          </button>
          <button
            onClick={() => setActiveTab('dre')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'dre'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            DRE / Lucratividade Líquida
          </button>
        </div>
      </div>

      {/* 1. CAIXA DO DIA */}
      {activeTab === 'cash' && (
        <div className="space-y-6">
          {/* Caixa Status Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Status do Caixa
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      cashRegister.isOpen ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'
                    }`}
                  />
                  <h3 className="text-lg font-bold text-slate-900">
                    {cashRegister.isOpen ? 'Caixa Aberto' : 'Caixa Fechado'}
                  </h3>
                </div>
                {cashRegister.isOpen && cashRegister.openedAt && (
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Aberto em: {formatDate(cashRegister.openedAt)}
                  </span>
                )}
              </div>

              {cashRegister.isOpen ? (
                <button
                  id="btn-close-cash"
                  onClick={() => {
                    if (
                      window.confirm(
                        'Tem certeza que deseja FECHAR o caixa do dia? Um resumo de conferência será registrado.'
                      )
                    ) {
                      onCloseCash();
                    }
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition"
                >
                  <Lock className="w-4 h-4" />
                  Fechar Caixa
                </button>
              ) : (
                <button
                  id="btn-open-cash"
                  onClick={() => setIsOpenCashModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  <Unlock className="w-4 h-4" />
                  Abrir Caixa
                </button>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Saldo Físico em Gaveta (Dinheiro)
              </span>
              <h3 className="text-2xl font-black text-emerald-700 mt-1">
                {formatCurrency(cashRegister.currentAmount)}
              </h3>
              <span className="text-xs text-slate-500">
                Fundo inicial: {formatCurrency(cashRegister.initialAmount)}
              </span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={!cashRegister.isOpen}
                onClick={() => {
                  setEntryType('supply');
                  setIsEntryModalOpen(true);
                }}
                className="flex-1 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-40"
              >
                <ArrowDownCircle className="w-4 h-4 text-emerald-600" />
                + Suprimento (Entrada)
              </button>

              <button
                type="button"
                disabled={!cashRegister.isOpen}
                onClick={() => {
                  setEntryType('bleed');
                  setIsEntryModalOpen(true);
                }}
                className="flex-1 py-3 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-40"
              >
                <ArrowUpCircle className="w-4 h-4 text-rose-600" />
                - Sangria (Retirada)
              </button>
            </div>
          </div>

          {/* Today's Sales by Payment Method */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Conferência de Vendas de Hoje ({todaySales.length} vendas)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-semibold block">Vendas em Dinheiro:</span>
                <span className="text-lg font-bold text-slate-900 mt-1 block">
                  {formatCurrency(cashSalesTotal)}
                </span>
                <span className="text-[10px] text-slate-400">Gera saldo físico em gaveta</span>
              </div>

              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <span className="text-emerald-800 font-semibold block">Vendas via PIX:</span>
                <span className="text-lg font-bold text-emerald-950 mt-1 block">
                  {formatCurrency(pixSalesTotal)}
                </span>
                <span className="text-[10px] text-emerald-700">Entrada direta em conta</span>
              </div>

              <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                <span className="text-indigo-800 font-semibold block">Vendas em Cartão (Débito/Crédito):</span>
                <span className="text-lg font-bold text-indigo-950 mt-1 block">
                  {formatCurrency(cardSalesTotal)}
                </span>
                <span className="text-[10px] text-indigo-700">Maquininhas / POS</span>
              </div>
            </div>
          </div>

          {/* Cash Entries Log */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Extrato de Movimentações do Caixa
              </h3>
            </div>
            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
              {cashRegister.entries.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Nenhum lançamento no caixa hoje.
                </div>
              ) : (
                cashRegister.entries.map((entry) => (
                  <div key={entry.id} className="p-3.5 px-5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{entry.description}</span>
                      <span className="text-[10px] text-slate-400">{formatDate(entry.timestamp)}</span>
                    </div>
                    <div className="text-right">
                      <span
                        className={`font-black text-sm ${
                          entry.type === 'supply' || entry.type === 'sale'
                            ? 'text-emerald-700'
                            : 'text-rose-600'
                        }`}
                      >
                        {entry.type === 'supply' || entry.type === 'sale' ? '+' : '-'}
                        {formatCurrency(entry.amount)}
                      </span>
                      <span className="text-[10px] text-slate-400 block uppercase">
                        {entry.type === 'supply'
                          ? 'Suprimento'
                          : entry.type === 'bleed'
                          ? 'Sangria'
                          : entry.type === 'expense'
                          ? 'Despesa'
                          : 'Venda'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. DESPESAS OPERACIONAIS */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Controle de Contas & Despesas Fixas</h3>
              <p className="text-xs text-slate-500">
                Cadastre os gastos da empresa para alimentar o DRE e o cálculo do ponto de equilíbrio.
              </p>
            </div>
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Lançar Despesa
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Descrição</th>
                  <th className="py-3.5 px-4">Categoria</th>
                  <th className="py-3.5 px-4">Data</th>
                  <th className="py-3.5 px-4 text-right">Valor</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Nenhuma despesa cadastrada.
                    </td>
                  </tr>
                ) : (
                  expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{exp.description}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-semibold">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{exp.date}</td>
                      <td className="py-3.5 px-4 text-right font-black text-rose-700">
                        {formatCurrency(exp.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                          Pago
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onDeleteExpense(exp.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                          title="Excluir Despesa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. DRE (DEMONSTRATIVO DE RESULTADOS DO EXERCÍCIO) */}
      {activeTab === 'dre' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 max-w-4xl mx-auto">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Receipt className="w-5 h-5 text-indigo-600" />
              Demonstrativo de Resultado do Exercício (DRE Sintético)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Visão real e transparente de faturamento, custos de produtos, taxas e lucro operacional líquido.
            </p>
          </div>

          <div className="space-y-3 font-mono text-sm">
            {/* (+) Receita Bruta */}
            <div className="flex justify-between items-center py-2 text-slate-800">
              <span>(+) RECEITA BRUTA DE VENDAS</span>
              <span className="font-bold">{formatCurrency(dre.grossRevenue)}</span>
            </div>

            {/* (-) Descontos */}
            <div className="flex justify-between items-center py-2 text-slate-600 border-b border-slate-100">
              <span>(-) Descontos Concedidos em Vendas</span>
              <span className="text-rose-600">-{formatCurrency(dre.discounts)}</span>
            </div>

            {/* (=) Receita Líquida */}
            <div className="flex justify-between items-center py-2.5 bg-slate-50 px-3 rounded-lg font-bold text-slate-900">
              <span>(=) RECEITA LÍQUIDA OPERACIONAL</span>
              <span>{formatCurrency(dre.netRevenue)}</span>
            </div>

            {/* (-) CMV */}
            <div className="flex justify-between items-center py-2 text-slate-600 border-b border-slate-100">
              <span>(-) Custo das Mercadorias Vendidas (CMV / Fornecedores)</span>
              <span className="text-rose-600">-{formatCurrency(dre.cmv)}</span>
            </div>

            {/* (=) Lucro Bruto */}
            <div className="flex justify-between items-center py-2.5 bg-emerald-50 px-3 rounded-lg font-bold text-emerald-950">
              <span>(=) LUCRO BRUTO DA OPERAÇÃO</span>
              <span className="text-emerald-700">{formatCurrency(dre.grossProfit)}</span>
            </div>

            {/* (-) Taxas Cartão */}
            <div className="flex justify-between items-center py-2 text-slate-600">
              <span>(-) Despesas com Taxas de Cartão & Maquininhas</span>
              <span className="text-amber-700">-{formatCurrency(dre.cardFees)}</span>
            </div>

            {/* (-) Despesas Fixas */}
            <div className="flex justify-between items-center py-2 text-slate-600 border-b border-slate-100">
              <span>(-) Despesas Operacionais Fixas (Aluguel, Luz, etc.)</span>
              <span className="text-rose-600">-{formatCurrency(dre.totalExpenses)}</span>
            </div>

            {/* (=) Lucro Líquido Real */}
            <div className="flex justify-between items-center py-4 bg-indigo-900 text-white px-4 rounded-xl font-bold text-base shadow-sm">
              <span className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                (=) RESULTADO LÍQUIDO FINAL (LUCRO REAL NO BOLSO)
              </span>
              <span className="text-xl font-black text-emerald-400">
                {formatCurrency(dre.operationalProfit)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Sangria / Suprimento Modal */}
      {isEntryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">
                {entryType === 'supply' ? 'Suprimento (Entrada de Troco)' : 'Sangria (Retirada de Dinheiro)'}
              </h3>
              <button onClick={() => setIsEntryModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleConfirmEntry} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={entryAmount}
                  onChange={(e) => setEntryAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-base font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Motivo / Observação
                </label>
                <input
                  type="text"
                  value={entryDescription}
                  onChange={(e) => setEntryDescription(e.target.value)}
                  placeholder={
                    entryType === 'supply'
                      ? 'Ex: Fundo de troco adicional'
                      : 'Ex: Retirada para cofre / depósito'
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEntryModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-xs"
                >
                  Confirmar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Open Cash Modal */}
      {isOpenCashModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">Abrir Caixa do Dia</h3>
              <button onClick={() => setIsOpenCashModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Fundo de Troco Inicial (R$)
                </label>
                <input
                  type="number"
                  step="10"
                  min="0"
                  value={initialCashInput}
                  onChange={(e) => setInitialCashInput(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-base font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-400">
                  Valor em cédulas e moedas presente na gaveta.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsOpenCashModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onOpenCash(initialCashInput);
                    setIsOpenCashModalOpen(false);
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs"
                >
                  Abrir Caixa Agora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">Lançar Nova Despesa Operacional</h3>
              <button onClick={() => setIsExpenseModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleConfirmExpense} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Descrição da Conta / Gasto *
                </label>
                <input
                  type="text"
                  required
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  placeholder="Ex: Conta de Energia / Aluguel do Mês"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Categoria</label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden"
                  >
                    <option value="Infraestrutura">Infraestrutura / Aluguel</option>
                    <option value="Contas Básicas">Contas Básicas (Luz/Água/Net)</option>
                    <option value="Materiais">Materiais & Embalagens</option>
                    <option value="Pessoal">Pessoal / Salários / Pró-labore</option>
                    <option value="Marketing">Marketing / Anúncios</option>
                    <option value="Outros">Outras Despesas</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={expenseAmount || ''}
                    onChange={(e) => setExpenseAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0,00"
                    className="w-full px-3 py-2 font-bold text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Data do Pagamento</label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Salvar Despesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
