import React, { useState, useMemo } from 'react';
import { Product, StockMovement } from '../types';
import { formatCurrency, formatPercent, formatDate } from '../utils/formatters';
import {
  Package,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Edit2,
  Trash2,
  Download,
  Boxes,
  TrendingUp,
  History,
  CheckCircle,
  X,
} from 'lucide-react';

interface InventoryViewProps {
  products: Product[];
  stockMovements: StockMovement[];
  onOpenNewProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onRecordStockMovement: (movement: StockMovement, updatedProduct: Product) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  stockMovements,
  onOpenNewProduct,
  onEditProduct,
  onDeleteProduct,
  onRecordStockMovement,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [showMovementsModal, setShowMovementsModal] = useState(false);

  // Stock Movement Modal State
  const [selectedProductForMovement, setSelectedProductForMovement] = useState<Product | null>(
    null
  );
  const [movementType, setMovementType] = useState<'in' | 'out' | 'adjustment'>('in');
  const [movementQuantity, setMovementQuantity] = useState<number>(1);
  const [movementReason, setMovementReason] = useState<string>('');

  // Categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category || 'Geral')));
    return ['Todos', ...cats];
  }, [products]);

  // Inventory Totals
  const totalStockCount = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.stock || 0), 0);
  }, [products]);

  const totalCostValue = useMemo(() => {
    return products.reduce((acc, p) => acc + p.costPrice * (p.stock || 0), 0);
  }, [products]);

  const totalSellingValue = useMemo(() => {
    return products.reduce((acc, p) => acc + p.sellingPrice * (p.stock || 0), 0);
  }, [products]);

  const projectedProfit = totalSellingValue - totalCostValue;

  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.stock <= p.minStock).length;
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchCat = categoryFilter === 'Todos' || p.category === categoryFilter;
      const matchLow = !onlyLowStock || p.stock <= p.minStock;
      return matchSearch && matchCat && matchLow;
    });
  }, [products, searchTerm, categoryFilter, onlyLowStock]);

  const handleExportCSV = () => {
    const headers = 'Código,Nome,Categoria,Preço Custo,Preço Venda,Margem %,Estoque,Estoque Mínimo,Unidade\n';
    const rows = products
      .map((p) => {
        const margin = p.sellingPrice > 0 ? ((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100 : 0;
        return `"${p.code}","${p.name.replace(/"/g, '""')}","${p.category || 'Geral'}",${p.costPrice},${p.sellingPrice},${margin.toFixed(1)},${p.stock},${p.minStock},"${p.unit}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `estoque_produtos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenMovement = (product: Product, type: 'in' | 'out' | 'adjustment') => {
    setSelectedProductForMovement(product);
    setMovementType(type);
    setMovementQuantity(1);
    setMovementReason(
      type === 'in'
        ? 'Entrada de compra / reposição'
        : type === 'out'
        ? 'Saída avulsa / perda / avaria'
        : 'Ajuste de contagem física'
    );
  };

  const handleConfirmMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForMovement) return;

    const current = selectedProductForMovement.stock;
    let nextStock = current;

    if (movementType === 'in') {
      nextStock = current + movementQuantity;
    } else if (movementType === 'out') {
      if (movementQuantity > current) {
        alert('A quantidade de saída não pode ser maior que o estoque atual.');
        return;
      }
      nextStock = current - movementQuantity;
    } else if (movementType === 'adjustment') {
      nextStock = movementQuantity;
    }

    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      productId: selectedProductForMovement.id,
      productName: selectedProductForMovement.name,
      type: movementType,
      quantity: movementQuantity,
      previousStock: current,
      newStock: nextStock,
      reason: movementReason || 'Movimentação manual de estoque',
      date: new Date().toISOString(),
    };

    const updatedProduct: Product = {
      ...selectedProductForMovement,
      stock: nextStock,
    };

    onRecordStockMovement(movement, updatedProduct);
    setSelectedProductForMovement(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Total de Itens
            </span>
            <h3 className="text-xl font-bold text-slate-900">
              {totalStockCount} <span className="text-xs font-normal text-slate-500">unidades</span>
            </h3>
            <span className="text-xs text-slate-500">{products.length} produtos cadastrados</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Patrimônio em Custo
            </span>
            <h3 className="text-xl font-bold text-slate-900">
              {formatCurrency(totalCostValue)}
            </h3>
            <span className="text-xs text-slate-500">Valor investido em estoque</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Potencial de Venda
            </span>
            <h3 className="text-xl font-bold text-emerald-700">
              {formatCurrency(totalSellingValue)}
            </h3>
            <span className="text-xs text-emerald-600 font-medium">
              Lucro projetado: {formatCurrency(projectProfit(projectedProfit))}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              lowStockCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400'
            }`}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Estoque Baixo
            </span>
            <h3
              className={`text-xl font-bold ${
                lowStockCount > 0 ? 'text-amber-800' : 'text-slate-700'
              }`}
            >
              {lowStockCount} produto(s)
            </h3>
            <button
              type="button"
              onClick={() => setOnlyLowStock(!onlyLowStock)}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer underline"
            >
              {onlyLowStock ? 'Ver todos' : 'Filtrar em alerta'}
            </button>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex flex-1 items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="input-search-inventory"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome, SKU, código de barras..."
                className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            {/* Category Dropdown */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  Categoria: {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
              title="Exportar planilha CSV"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar CSV
            </button>

            <button
              type="button"
              onClick={() => setShowMovementsModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
              title="Ver histórico de movimentações"
            >
              <History className="w-3.5 h-3.5" />
              Movimentações ({stockMovements.length})
            </button>

            <button
              id="btn-new-product"
              type="button"
              onClick={onOpenNewProduct}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              Novo Produto
            </button>
          </div>
        </div>

        {/* Quick Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2 px-4 bg-white rounded-xl border border-slate-200 shadow-xs scrollbar-none">
          <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1 whitespace-nowrap">
            <Filter className="w-3.5 h-3.5 text-indigo-600" /> Filtro Rápido por Categoria:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Código / SKU</th>
                <th className="py-3.5 px-4">Produto</th>
                <th className="py-3.5 px-4">Categoria</th>
                <th className="py-3.5 px-4 text-right">Preço Custo</th>
                <th className="py-3.5 px-4 text-right">Preço Venda</th>
                <th className="py-3.5 px-4 text-center">Margem Bruta</th>
                <th className="py-3.5 px-4 text-center">Estoque</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Nenhum produto cadastrado com esses filtros.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const grossMargin = p.sellingPrice - p.costPrice;
                  const marginPercent = p.sellingPrice > 0 ? (grossMargin / p.sellingPrice) * 100 : 0;
                  const isLow = p.stock <= p.minStock;
                  const isZero = p.stock <= 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono text-slate-500">{p.code}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{p.name}</div>
                        {p.description && (
                          <div className="text-[10px] text-slate-400 truncate max-w-xs">
                            {p.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-semibold">
                          {p.category || 'Geral'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600 font-medium">
                        {formatCurrency(p.costPrice)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {formatCurrency(p.sellingPrice)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`font-semibold ${
                            marginPercent >= 40
                              ? 'text-emerald-700'
                              : marginPercent > 20
                              ? 'text-amber-700'
                              : 'text-rose-600'
                          }`}
                        >
                          {formatPercent(marginPercent, 1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            isZero
                              ? 'bg-rose-100 text-rose-700'
                              : isLow
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-50 text-emerald-800'
                          }`}
                        >
                          {p.stock} {p.unit}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Quick Stock In */}
                          <button
                            type="button"
                            onClick={() => handleOpenMovement(p, 'in')}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                            title="Dar Entrada de Estoque (+)"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                          {/* Quick Stock Out */}
                          <button
                            type="button"
                            onClick={() => handleOpenMovement(p, 'out')}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                            title="Dar Saída / Ajuste (-)"
                          >
                            <ArrowDownRight className="w-4 h-4" />
                          </button>
                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => onEditProduct(p)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Editar Produto"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Deseja realmente excluir o produto "${p.name}"?`
                                )
                              ) {
                                onDeleteProduct(p.id);
                              }
                            }}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                            title="Excluir Produto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Stock Movement Modal */}
      {selectedProductForMovement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">
                Movimentar Estoque:{' '}
                <span className="text-indigo-600">{selectedProductForMovement.name}</span>
              </h3>
              <button
                onClick={() => setSelectedProductForMovement(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmMovement} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between">
                <span>Estoque Atual:</span>
                <span className="font-bold text-slate-900">
                  {selectedProductForMovement.stock} {selectedProductForMovement.unit}
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Tipo de Movimentação</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMovementType('in')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                      movementType === 'in'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    + Entrada
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovementType('out')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                      movementType === 'out'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    - Saída
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovementType('adjustment')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                      movementType === 'adjustment'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Ajuste Exato
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  {movementType === 'adjustment'
                    ? 'Novo Saldo Exato de Estoque'
                    : 'Quantidade a Movimentar'}
                </label>
                <input
                  type="number"
                  min="1"
                  value={movementQuantity}
                  onChange={(e) => setMovementQuantity(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Motivo / Justificativa</label>
                <input
                  type="text"
                  value={movementReason}
                  onChange={(e) => setMovementReason(e.target.value)}
                  placeholder="Ex: Compra Nota Fiscal 1234, Troca de mercadoria..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedProductForMovement(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition"
                >
                  Confirmar Alteração
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Movements History Drawer / Modal */}
      {showMovementsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" />
                Histórico de Movimentações de Estoque
              </h3>
              <button
                onClick={() => setShowMovementsModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {stockMovements.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Nenhuma movimentação manual registrada até o momento.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 text-xs">
                  {stockMovements.map((mov) => (
                    <div key={mov.id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <span className="font-bold text-slate-900 block">{mov.productName}</span>
                        <span className="text-[10px] text-slate-400">
                          {formatDate(mov.date)} • {mov.reason}
                        </span>
                      </div>
                      <div className="text-right">
                        <span
                          className={`font-bold ${
                            mov.type === 'in'
                              ? 'text-emerald-600'
                              : mov.type === 'out' || mov.type === 'sale'
                              ? 'text-rose-600'
                              : 'text-indigo-600'
                          }`}
                        >
                          {mov.type === 'in'
                            ? `+${mov.quantity}`
                            : mov.type === 'out' || mov.type === 'sale'
                            ? `-${mov.quantity}`
                            : `Ajuste: ${mov.newStock}`}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          (De {mov.previousStock} p/ {mov.newStock})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function projectProfit(val: number): number {
  return isNaN(val) ? 0 : Math.max(0, val);
}
