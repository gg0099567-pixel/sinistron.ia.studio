import React, { useState } from 'react';
import { SinistronLogo } from './SinistronLogo';
import {
  Sparkles,
  Bot,
  TrendingUp,
  AlertTriangle,
  Send,
  RefreshCw,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  DollarSign,
  Package,
  Layers,
  X
} from 'lucide-react';
import { Product, Sale, Branch, Seller, Expense } from '../types';
import { formatCurrency, formatPercent } from '../utils/formatters';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  sales: Sale[];
  branches: Branch[];
  sellers: Seller[];
  expenses: Expense[];
  onLoadStarterCatalog?: () => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  products,
  sales,
  branches,
  sellers,
  expenses,
  onLoadStarterCatalog,
}) => {
  const [activeTab, setActiveTab] = useState<'diagnostic' | 'chat' | 'reports'>('diagnostic');
  const [chatPrompt, setChatPrompt] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; text: string; time: string }[]>([
    {
      role: 'assistant',
      text: `Olá! Sou o **sinistron.ia AI Advisor**, o seu consultor executivo de inteligência comercial. Posso analisar suas vendas, diagnosticar margens de lucro, projetar atingimento de metas ou sugerir estratégias de promoção para o seu estoque. Como posso acelerar seus resultados hoje?`,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [loadingAI, setLoadingAI] = useState<boolean>(false);
  const [diagnosticResult, setDiagnosticResult] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  if (!isOpen) return null;

  // Compute live metrics
  const completedSales = sales.filter((s) => s.status === 'completed');
  const totalRevenue = completedSales.reduce((acc, s) => acc + s.total, 0);
  const totalCost = completedSales.reduce((acc, s) => acc + s.costTotal, 0);
  const grossProfit = totalRevenue - totalCost;
  const marginPercent = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  const ticketAverage = completedSales.length > 0 ? totalRevenue / completedSales.length : 0;

  const totalStockCost = products.reduce((acc, p) => acc + p.costPrice * p.stock, 0);
  const totalStockRetail = products.reduce((acc, p) => acc + p.sellingPrice * p.stock, 0);
  const lowStockItems = products.filter((p) => p.stock <= p.minStock);

  // Quick run diagnostic
  const handleRunDiagnostic = async () => {
    setLoadingAI(true);
    try {
      const res = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'diagnostic',
          salesSummary: {
            totalRevenue,
            totalCount: completedSales.length,
            grossProfit,
            marginPercent,
            ticketAverage,
          },
          inventorySummary: {
            totalProducts: products.length,
            totalStockCost,
            totalStockRetail,
            lowStockCount: lowStockItems.length,
          },
          branchesSummary: branches.map((b) => ({ name: b.name, salesGoal: b.monthlySalesGoal, revGoal: b.monthlyRevenueGoal })),
          sellersSummary: sellers.map((s) => ({ name: s.name, role: s.role, commission: s.commissionRate })),
        }),
      });

      const data = await res.json();
      if (data.content) {
        setDiagnosticResult(data.content);
      }
    } catch (err) {
      console.error(err);
      setDiagnosticResult(`### ⚡ Análise Local Sinistron.ia\n\n- Faturamento Atual: R$ ${totalRevenue.toFixed(2)}\n- Produtos: ${products.length} itens\n- Status: Sistema calibrado.`);
    } finally {
      setLoadingAI(false);
    }
  };

  // Send Chat message
  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const messageToSend = (customText || chatPrompt).trim();
    if (!messageToSend || loadingAI) return;

    const userMsg = {
      role: 'user' as const,
      text: messageToSend,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatPrompt('');
    setLoadingAI(true);

    try {
      const res = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: messageToSend,
          salesSummary: {
            totalRevenue,
            totalCount: completedSales.length,
            grossProfit,
            marginPercent,
            ticketAverage,
          },
          inventorySummary: {
            totalProducts: products.length,
            totalStockCost,
            lowStockCount: lowStockItems.length,
          },
          branchesSummary: branches,
          sellersSummary: sellers,
        }),
      });

      const data = await res.json();
      const aiReply = data.content || 'Não foi possível gerar uma resposta no momento.';
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: aiReply,
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: '⚡ Resposta Sinistron: Operação registrada. Para aumentar o ticket médio, sugira películas e capas em formato de combo em todas as vendas.',
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoadingAI(false);
    }
  };

  // Export CSV Report
  const handleExportCSV = (type: 'sales' | 'inventory' | 'dre') => {
    setIsExporting(true);
    let csv = '';
    let filename = '';

    if (type === 'sales') {
      filename = `sinistron_vendas_${new Date().toISOString().slice(0, 10)}.csv`;
      csv = 'Codigo;Data;Filial;Vendedor;Itens;Subtotal;Desconto;Total;Custo;Lucro Bruto;Forma Pagamento\n';
      completedSales.forEach((s) => {
        const itemNames = s.items.map((i) => `${i.quantity}x ${i.productName}`).join(' | ');
        csv += `"${s.code}";"${new Date(s.date).toLocaleString('pt-BR')}";"${s.branchName || 'Matriz'}";"${s.sellerName || 'Admin'}";"${itemNames}";${s.subtotal};${s.discount};${s.total};${s.costTotal};${s.grossProfit};"${s.paymentMethod}"\n`;
      });
    } else if (type === 'inventory') {
      filename = `sinistron_estoque_${new Date().toISOString().slice(0, 10)}.csv`;
      csv = 'Codigo;Produto;Categoria;Estoque Atual;Estoque Minimo;Preco Custo;Preco Venda;Valor Total Custo;Valor Total Venda\n';
      products.forEach((p) => {
        csv += `"${p.code}";"${p.name}";"${p.category}";${p.stock};${p.minStock};${p.costPrice};${p.sellingPrice};${p.costPrice * p.stock};${p.sellingPrice * p.stock}\n`;
      });
    } else {
      filename = `sinistron_dre_executivo_${new Date().toISOString().slice(0, 10)}.csv`;
      csv = 'Indicador;Valor (R$)\n';
      csv += `Receita Bruta Total;${totalRevenue}\n`;
      csv += `Custo das Mercadorias Vendidas (CMV);${totalCost}\n`;
      csv += `Lucro Bruto Comercial;${grossProfit}\n`;
      csv += `Margem Bruta (%);${marginPercent.toFixed(2)}%\n`;
      csv += `Despesas Operacionais Registradas;${expenses.reduce((a, b) => a + b.amount, 0)}\n`;
      csv += `Resultado Liquido Estimado;${grossProfit - expenses.reduce((a, b) => a + b.amount, 0)}\n`;
    }

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExporting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SinistronLogo size={36} showText={false} glow={true} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight font-mono">SINISTRON<span className="text-fuchsia-400">.IA</span> Advisor</h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-fuchsia-500/30 text-fuchsia-200 border border-fuchsia-400/30">
                  IA Executiva
                </span>
              </div>
              <p className="text-xs text-purple-200/80">Inteligência de Vendas, Diagnósticos & Previsões de Negócio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('diagnostic')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'diagnostic'
                ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Diagnóstico & Previsões
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'chat'
                ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Bot className="w-4 h-4" />
            Consultor de Negócios (Chat)
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'reports'
                ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Relatórios & DRE Executivo
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50 dark:bg-slate-900/50">
          {/* TAB 1: DIAGNOSTIC */}
          {activeTab === 'diagnostic' && (
            <div className="space-y-6">
              {/* Snapshot Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Faturamento</div>
                  <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                    {formatCurrency(totalRevenue)}
                  </div>
                  <div className="text-[10px] text-indigo-500 font-semibold">{completedSales.length} vendas</div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Margem Bruta</div>
                  <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {formatPercent(marginPercent)}
                  </div>
                  <div className="text-[10px] text-slate-400">Lucro: {formatCurrency(grossProfit)}</div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ticket Médio</div>
                  <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                    {formatCurrency(ticketAverage)}
                  </div>
                  <div className="text-[10px] text-slate-400">Por atendimento</div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Estoque em Risco</div>
                  <div className="text-lg font-black text-amber-600 dark:text-amber-400 mt-1">
                    {lowStockItems.length} itens
                  </div>
                  <div className="text-[10px] text-slate-400">Abaixo do estoque mín.</div>
                </div>
              </div>

              {/* Action Banner */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">Auditoria Inteligente ao Vivo</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Gera diagnóstico estratégico, previsão de fechamento e 3 planos de ação imediatos.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRunDiagnostic}
                  disabled={loadingAI}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer disabled:opacity-50"
                >
                  {loadingAI ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Analisando Operação...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      Rodar Diagnóstico Sinistron
                    </>
                  )}
                </button>
              </div>

              {/* Diagnostic Output */}
              {diagnosticResult ? (
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                  {diagnosticResult}
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-800/80 p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
                  <Lightbulb className="w-10 h-10 text-amber-500 mx-auto mb-2 opacity-80" />
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Pronto para Auditar a Operação</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-4">
                    Clique no botão acima para rodar a inteligência preditiva ou escolha um dos atalhos abaixo.
                  </p>
                  {products.length === 0 && onLoadStarterCatalog && (
                    <button
                      onClick={onLoadStarterCatalog}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white text-xs font-bold transition cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Package className="w-3.5 h-3.5 text-indigo-500" />
                      Carregar Catálogo Inicial de Demonstração
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CHAT */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-[480px]">
              {/* Quick Prompts */}
              <div className="flex flex-wrap gap-1.5 mb-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 self-center mr-1">Sugestões:</span>
                {[
                  'Como aumentar o ticket médio hoje?',
                  'Ideia de promoção relâmpago para capas e películas',
                  'Como bater a meta de faturamento do mês?',
                  'Dica de script de negociação no WhatsApp',
                ].map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(undefined, sug)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 transition cursor-pointer"
                  >
                    {sug}
                  </button>
                ))}
              </div>

              {/* Chat Message List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-black shadow-xs">
                        ⚡
                      </div>
                    )}
                    <div
                      className={`p-3.5 rounded-2xl max-w-[85%] text-xs sm:text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white rounded-br-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-xs shadow-xs'
                      }`}
                    >
                      <div className="whitespace-pre-line">{msg.text}</div>
                      <div
                        className={`text-[9px] mt-1.5 text-right ${
                          msg.role === 'user' ? 'text-indigo-200' : 'text-slate-400'
                        }`}
                      >
                        {msg.time}
                      </div>
                    </div>
                  </div>
                ))}

                {loadingAI && (
                  <div className="flex gap-2 items-center text-slate-500 dark:text-slate-400 text-xs pl-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                    <span>sinistron.ia está calculando resposta...</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={chatPrompt}
                  onChange={(e) => setChatPrompt(e.target.value)}
                  placeholder="Pergunte sobre precificação, metas, estratégias ou produtos..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={loadingAI || !chatPrompt.trim()}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: REPORTS & DRE */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              {/* DRE Summary Card */}
              <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                    Demonstrativo de Resultado do Exercício (DRE Simulado)
                  </h4>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ao Vivo</span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-700 text-xs sm:text-sm">
                  <div className="py-2 flex justify-between">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">(+) Receita Bruta de Vendas</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(totalRevenue)}</span>
                  </div>
                  <div className="py-2 flex justify-between text-rose-600 dark:text-rose-400">
                    <span>(-) Custo das Mercadorias Vendidas (CMV)</span>
                    <span className="font-bold">-{formatCurrency(totalCost)}</span>
                  </div>
                  <div className="py-2 flex justify-between font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 px-2 rounded-lg">
                    <span>(=) Lucro Bruto da Operação</span>
                    <span>{formatCurrency(grossProfit)} ({formatPercent(marginPercent)})</span>
                  </div>
                  <div className="py-2 flex justify-between text-slate-600 dark:text-slate-400">
                    <span>(-) Despesas Operacionais / Caixa</span>
                    <span>-{formatCurrency(expenses.reduce((a, b) => a + b.amount, 0))}</span>
                  </div>
                  <div className="py-2.5 flex justify-between font-black text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 px-2 rounded-lg">
                    <span>(=) Resultado Líquido Operacional</span>
                    <span>{formatCurrency(grossProfit - expenses.reduce((a, b) => a + b.amount, 0))}</span>
                  </div>
                </div>
              </div>

              {/* Export Buttons Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-3">
                  <div>
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <h5 className="text-xs font-black text-slate-900 dark:text-white">Exportar Vendas (CSV)</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">Planilha completa de histórico de vendas e formas de pagamento.</p>
                  </div>
                  <button
                    onClick={() => handleExportCSV('sales')}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-indigo-50 dark:bg-slate-700 dark:hover:bg-indigo-950 text-slate-800 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-200 dark:border-slate-600"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Baixar Vendas.csv
                  </button>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-3">
                  <div>
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                      <Package className="w-4 h-4" />
                    </div>
                    <h5 className="text-xs font-black text-slate-900 dark:text-white">Exportar Estoque (CSV)</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">Posição física e financeira de cada produto cadastrado.</p>
                  </div>
                  <button
                    onClick={() => handleExportCSV('inventory')}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-emerald-50 dark:bg-slate-700 dark:hover:bg-emerald-950 text-slate-800 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-200 dark:border-slate-600"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Baixar Estoque.csv
                  </button>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-3">
                  <div>
                    <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <h5 className="text-xs font-black text-slate-900 dark:text-white">Relatório DRE (CSV)</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">Quadro financeiro executivo para contabilidade e sócios.</p>
                  </div>
                  <button
                    onClick={() => handleExportCSV('dre')}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-purple-50 dark:bg-slate-700 dark:hover:bg-purple-950 text-slate-800 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-200 dark:border-slate-600"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Baixar DRE.csv
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Motor Neural Sinistron v4.2
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
