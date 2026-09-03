import React, { useState } from 'react';
import { TransferRecord, Product, Branch, Seller } from '../types';
import { generateCode, formatDate } from '../utils/formatters';
import {
  ArrowRightLeft,
  Package,
  Building2,
  CheckCircle2,
  Clock,
  Send,
  Plus,
  Printer,
  Search,
} from 'lucide-react';

interface TransfersViewProps {
  transfers: TransferRecord[];
  products: Product[];
  branches: Branch[];
  sellers: Seller[];
  onCompleteTransfer: (transfer: TransferRecord) => void;
}

export const TransfersView: React.FC<TransfersViewProps> = ({
  transfers,
  products,
  branches,
  sellers,
  onCompleteTransfer,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [sourceBranchId, setSourceBranchId] = useState<string>(branches[0]?.id || '');
  const [targetBranchId, setTargetBranchId] = useState<string>(branches[1]?.id || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [responsibleName, setResponsibleName] = useState<string>(sellers[0]?.name || 'Guilherme Gomes');
  const [reason, setReason] = useState<string>('Reposição de estoque entre lojas');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || quantity <= 0) return;
    if (sourceBranchId === targetBranchId) {
      alert('A filial de origem deve ser diferente da filial de destino.');
      return;
    }
    if (selectedProduct.stock < quantity) {
      alert(`Estoque insuficiente! Disponível: ${selectedProduct.stock} un`);
      return;
    }

    const sourceBranch = branches.find((b) => b.id === sourceBranchId);
    const targetBranch = branches.find((b) => b.id === targetBranchId);

    const newTransfer: TransferRecord = {
      id: `transf-${Date.now()}`,
      code: generateCode('TRF'),
      date: new Date().toISOString(),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity,
      sourceBranchId,
      sourceBranchName: sourceBranch?.name || 'Origem',
      targetBranchId,
      targetBranchName: targetBranch?.name || 'Destino',
      responsibleName,
      reason,
      status: 'completed',
    };

    onCompleteTransfer(newTransfer);
    setSuccessMessage(`Transferência ${newTransfer.code} realizada com sucesso!`);
    setSelectedProductId('');
    setQuantity(1);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const filteredTransfers = transfers.filter((t) => {
    const term = searchTerm.toLowerCase();
    return (
      t.code.toLowerCase().includes(term) ||
      t.productName.toLowerCase().includes(term) ||
      t.sourceBranchName.toLowerCase().includes(term) ||
      t.targetBranchName.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
            PRODUTOS & ATIVOS
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
            <ArrowRightLeft className="w-3.5 h-3.5" />
            Transferências entre Filiais
          </span>
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
          Movimentação de Estoque Inter-Lojas
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Transfira aparelhos, peças e acessórios entre as filiais com registro auditável e comprovante.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {successMessage}
        </div>
      )}

      {/* Grid: Form & History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transfer Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-indigo-600" />
            Nova Transferência
          </h3>

          <form onSubmit={handleTransferSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Selecionar Produto *
              </label>
              <select
                required
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Selecione o item...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.code}] {p.name} (Disponível: {p.stock} {p.unit})
                  </option>
                ))}
              </select>
            </div>

            {selectedProduct && (
              <div className="p-2.5 bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl text-[11px] space-y-0.5">
                <span className="font-bold text-indigo-900 dark:text-white block">
                  {selectedProduct.name}
                </span>
                <span className="text-slate-500 dark:text-slate-400 block">
                  Categoria: {selectedProduct.category} | Custo: R$ {selectedProduct.costPrice.toFixed(2)}
                </span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 block">
                  Estoque Atual: {selectedProduct.stock} {selectedProduct.unit}
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Origem
                </label>
                <select
                  value={sourceBranchId}
                  onChange={(e) => setSourceBranchId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Destino
                </label>
                <select
                  value={targetBranchId}
                  onChange={(e) => setTargetBranchId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Quantidade *
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedProduct ? selectedProduct.stock : 999}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Responsável
                </label>
                <select
                  value={responsibleName}
                  onChange={(e) => setResponsibleName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {sellers.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Motivo / Justificativa
              </label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Demanda urgente na filial centro..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={!selectedProduct || selectedProduct.stock < quantity}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl font-bold shadow-xs cursor-pointer transition flex items-center justify-center gap-2 mt-2"
            >
              <ArrowRightLeft className="w-4 h-4" />
              Confirmar Transferência
            </button>
          </form>
        </div>

        {/* Transfer History Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Histórico de Transferências ({filteredTransfers.length})
            </h3>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por código, produto ou filial..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Código / Data</th>
                  <th className="py-3 px-4">Produto</th>
                  <th className="py-3 px-4 text-center">Qtd</th>
                  <th className="py-3 px-4">Rota (Origem ➔ Destino)</th>
                  <th className="py-3 px-4">Responsável</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                {filteredTransfers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Nenhuma transferência registrada.
                    </td>
                  </tr>
                ) : (
                  filteredTransfers.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4">
                        <strong className="font-bold text-slate-900 dark:text-white block">
                          {t.code}
                        </strong>
                        <span className="text-[10px] text-slate-400">{formatDate(t.date)}</span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {t.productName}
                      </td>
                      <td className="py-3 px-4 text-center font-bold">{t.quantity} un</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-medium">
                          <span>{t.sourceBranchName}</span>
                          <span className="text-indigo-500">➔</span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {t.targetBranchName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-600 dark:text-slate-300">
                        {t.responsibleName}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          Concluída
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
