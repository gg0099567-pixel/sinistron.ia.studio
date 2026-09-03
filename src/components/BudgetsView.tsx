import React, { useState } from 'react';
import { Budget, Product, SaleItem, CustomerInfo } from '../types';
import { formatCurrency, formatDate, generateCode } from '../utils/formatters';
import {
  FileSpreadsheet,
  Plus,
  Printer,
  ArrowRightCircle,
  Trash2,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  X,
} from 'lucide-react';

interface BudgetsViewProps {
  budgets: Budget[];
  products: Product[];
  onSaveBudget: (budget: Budget) => void;
  onDeleteBudget: (budgetId: string) => void;
  onConvertBudgetToSale: (budget: Budget) => void;
  onOpenReceiptModal: (budget: Budget) => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  budgets,
  products,
  onSaveBudget,
  onDeleteBudget,
  onConvertBudgetToSale,
  onOpenReceiptModal,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: '',
    phone: '',
    document: '',
    email: '',
  });
  const [validDays, setValidDays] = useState(7);
  const [items, setItems] = useState<SaleItem[]>([]);
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Selected product to add to budget
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const subtotal = items.reduce((acc, i) => acc + i.total, 0);
  const total = Math.max(0, subtotal - (discountValue || 0));

  const handleAddItem = () => {
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    setItems((prev) => {
      const existing = prev.find((i) => i.productId === prod.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === prod.id
            ? {
                ...i,
                quantity: i.quantity + selectedQuantity,
                total: (i.quantity + selectedQuantity) * i.unitPrice,
              }
            : i
        );
      }
      return [
        ...prev,
        {
          productId: prod.id,
          productName: prod.name,
          code: prod.code,
          quantity: selectedQuantity,
          unitPrice: prod.sellingPrice,
          costPrice: prod.costPrice,
          discount: 0,
          total: prod.sellingPrice * selectedQuantity,
        },
      ];
    });
    setSelectedProductId('');
    setSelectedQuantity(1);
  };

  const handleRemoveItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.name.trim()) {
      alert('Informe o nome do cliente.');
      return;
    }
    if (items.length === 0) {
      alert('Adicione pelo menos 1 item ao orçamento.');
      return;
    }

    const newBudget: Budget = {
      id: `bud-${Date.now()}`,
      code: generateCode('ORC'),
      date: new Date().toISOString(),
      validUntil: new Date(Date.now() + validDays * 24 * 3600 * 1000).toISOString(),
      customer,
      items,
      subtotal,
      discount: discountValue || 0,
      total,
      status: 'open',
      notes: notes.trim() || undefined,
    };

    onSaveBudget(newBudget);
    setIsModalOpen(false);
    // Reset state
    setCustomer({ name: '', phone: '', document: '', email: '' });
    setItems([]);
    setDiscountValue(0);
    setNotes('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-indigo-600" />
            Orçamentos & Propostas Comerciais
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Gere propostas para clientes, imprima documentos com validade e converta em vendas com 1 clique.
          </p>
        </div>

        <button
          id="btn-new-budget"
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          Criar Novo Orçamento
        </button>
      </div>

      {/* List of Budgets */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Código / Emissão</th>
                <th className="py-3.5 px-4">Cliente</th>
                <th className="py-3.5 px-4">Validade</th>
                <th className="py-3.5 px-4">Itens</th>
                <th className="py-3.5 px-4 text-right">Valor Total</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {budgets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Nenhum orçamento emitido ainda. Clique em "Criar Novo Orçamento".
                  </td>
                </tr>
              ) : (
                budgets.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900 block">{b.code}</span>
                      <span className="text-[10px] text-slate-400">{formatDate(b.date)}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block">{b.customer.name}</span>
                      {b.customer.phone && (
                        <span className="text-[10px] text-slate-400">{b.customer.phone}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-slate-600">{formatDate(b.validUntil)}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-slate-700">
                        {b.items.length} item(ns) ({b.items.reduce((acc, i) => acc + i.quantity, 0)} un)
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-black text-slate-900">
                      {formatCurrency(b.total)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          b.status === 'converted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'approved'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {b.status === 'converted'
                          ? 'Venda Concluída'
                          : b.status === 'approved'
                          ? 'Aprovado'
                          : 'Em Aberto'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Print / View */}
                        <button
                          type="button"
                          onClick={() => onOpenReceiptModal(b)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Imprimir Proposta / Orçamento"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* Convert to Sale */}
                        {b.status !== 'converted' && (
                          <button
                            type="button"
                            onClick={() => onConvertBudgetToSale(b)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] transition shadow-xs"
                            title="Transformar em Venda Imediata"
                          >
                            <ArrowRightCircle className="w-3.5 h-3.5" />
                            Vender
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Deseja excluir o orçamento ${b.code}?`)) {
                              onDeleteBudget(b.id);
                            }
                          }}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                          title="Excluir Orçamento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-base">Nova Proposta / Orçamento</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
              {/* Customer Info */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Dados do Cliente & Validade
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Nome Completo *</label>
                    <input
                      type="text"
                      required
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      placeholder="Ex: João da Silva / Empresa X"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Telefone / WhatsApp</label>
                    <input
                      type="text"
                      value={customer.phone || ''}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      placeholder="(11) 99999-9999"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">CPF / CNPJ</label>
                    <input
                      type="text"
                      value={customer.document || ''}
                      onChange={(e) => setCustomer({ ...customer, document: e.target.value })}
                      placeholder="000.000.000-00"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Validade da Proposta</label>
                    <select
                      value={validDays}
                      onChange={(e) => setValidDays(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden font-medium"
                    >
                      <option value={3}>3 dias</option>
                      <option value={7}>7 dias (Padrão)</option>
                      <option value={15}>15 dias</option>
                      <option value={30}>30 dias</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Add Items to Budget */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Adicionar Produtos / Serviços
                </h4>
                <div className="flex gap-2">
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden font-medium"
                  >
                    <option value="">Selecione um produto do catálogo...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} - {formatCurrency(p.sellingPrice)}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    value={selectedQuantity}
                    onChange={(e) => setSelectedQuantity(parseInt(e.target.value, 10) || 1)}
                    className="w-20 px-2 py-2 text-xs font-bold border border-slate-300 rounded-lg text-center"
                  />

                  <button
                    type="button"
                    onClick={handleAddItem}
                    disabled={!selectedProductId}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition"
                  >
                    + Inserir
                  </button>
                </div>

                {/* Items List */}
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs"
                    >
                      <span className="font-semibold text-slate-800">
                        {item.quantity}x {item.productName}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900">{formatCurrency(item.total)}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discount and Notes */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Desconto Especial (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discountValue || ''}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden"
                  />
                </div>

                <div className="text-right flex flex-col justify-end">
                  <span className="text-slate-500">Valor Final da Proposta:</span>
                  <span className="text-xl font-extrabold text-indigo-700">{formatCurrency(total)}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Condições de Pagamento / Observações
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Faturado em 3x sem juros, frete grátis para entrega local..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-xs transition"
                >
                  Gerar Orçamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
