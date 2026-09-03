import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { formatCurrency, formatPercent, generateCode } from '../utils/formatters';
import { X, Calculator, Sparkles, AlertCircle, Check } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  productToEdit?: Product | null;
  existingCategories: string[];
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  productToEdit,
  existingCategories,
}) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    code: '',
    category: 'Geral',
    costPrice: 0,
    sellingPrice: 0,
    stock: 0,
    minStock: 5,
    unit: 'UN',
    description: '',
  });

  const [desiredMarginPercent, setDesiredMarginPercent] = useState<number>(50);
  const [showCalculator, setShowCalculator] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (productToEdit) {
      setFormData(productToEdit);
      if (productToEdit.costPrice > 0 && productToEdit.sellingPrice > 0) {
        const margin = ((productToEdit.sellingPrice - productToEdit.costPrice) / productToEdit.sellingPrice) * 100;
        setDesiredMarginPercent(Math.round(margin));
      }
    } else {
      setFormData({
        id: `prod-${Date.now()}`,
        name: '',
        code: generateCode('SKU'),
        category: existingCategories[0] || 'Geral',
        costPrice: 0,
        sellingPrice: 0,
        stock: 10,
        minStock: 3,
        unit: 'UN',
        description: '',
        createdAt: new Date().toISOString(),
      });
      setDesiredMarginPercent(50);
    }
    setErrors({});
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const cost = formData.costPrice || 0;
  const selling = formData.sellingPrice || 0;
  const grossProfit = selling - cost;
  const marginPercent = selling > 0 ? (grossProfit / selling) * 100 : 0;
  const markupMultiplier = cost > 0 ? selling / cost : 0;

  const applyCalculatedPrice = () => {
    if (cost <= 0) return;
    // Price = Cost / (1 - Margin/100)
    const factor = 1 - (desiredMarginPercent / 100);
    if (factor > 0.05) {
      const calculated = cost / factor;
      setFormData((prev) => ({ ...prev, sellingPrice: parseFloat(calculated.toFixed(2)) }));
    }
  };

  const handleGenerateCode = () => {
    setFormData((prev) => ({ ...prev, code: generateCode('SKU') }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = 'Nome do produto é obrigatório';
    if (!formData.code?.trim()) newErrors.code = 'Código ou SKU é obrigatório';
    if ((formData.costPrice ?? 0) < 0) newErrors.costPrice = 'Preço de custo não pode ser negativo';
    if ((formData.sellingPrice ?? 0) <= 0) newErrors.sellingPrice = 'Preço de venda deve ser maior que zero';
    if ((formData.stock ?? 0) < 0) newErrors.stock = 'Estoque não pode ser negativo';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      id: productToEdit?.id || `prod-${Date.now()}`,
      name: formData.name!.trim(),
      code: formData.code!.trim(),
      category: formData.category || 'Geral',
      costPrice: Number(formData.costPrice) || 0,
      sellingPrice: Number(formData.sellingPrice) || 0,
      stock: Number(formData.stock) || 0,
      minStock: Number(formData.minStock) || 0,
      unit: formData.unit || 'UN',
      description: formData.description?.trim(),
      createdAt: productToEdit?.createdAt || new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              {productToEdit ? 'Editar Produto / Serviço' : 'Novo Cadastro de Produto'}
            </h3>
            <p className="text-xs text-slate-500">
              Preencha os dados e utilize o assistente de formação de preços
            </p>
          </div>
          <button
            id="btn-close-product-modal"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Nome do Produto / Serviço *
              </label>
              <input
                id="input-product-name"
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Fone Bluetooth Pro Max"
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden ${
                  errors.name ? 'border-rose-500 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {errors.name && <p className="text-xs text-rose-600">{errors.name}</p>}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-700">Código / SKU *</label>
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  className="text-[10px] text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Gerar Automático
                </button>
              </div>
              <input
                id="input-product-code"
                type="text"
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="SKU-12345"
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden ${
                  errors.code ? 'border-rose-500 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {errors.code && <p className="text-xs text-rose-600">{errors.code}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Categoria</label>
              <input
                id="input-product-category"
                type="text"
                list="category-suggestions"
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Ex: Eletrônicos, Acessórios..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
              <datalist id="category-suggestions">
                {existingCategories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Unidade de Medida</label>
              <select
                id="select-product-unit"
                value={formData.unit || 'UN'}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
              >
                <option value="UN">Unidade (UN)</option>
                <option value="CX">Caixa (CX)</option>
                <option value="PCT">Pacote (PCT)</option>
                <option value="KG">Quilograma (KG)</option>
                <option value="G">Grama (G)</option>
                <option value="M">Metro (M)</option>
                <option value="L">Litro (L)</option>
                <option value="SRV">Serviço (SRV)</option>
              </select>
            </div>
          </div>

          {/* Pricing Section with Quick Calculator */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-indigo-600" />
                Valores e Formação de Preço
              </h4>
              <button
                type="button"
                onClick={() => setShowCalculator(!showCalculator)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {showCalculator ? 'Ocultar Assistente' : 'Assistente de Margem'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Preço de Custo (R$)
                </label>
                <input
                  id="input-product-cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costPrice ?? ''}
                  onChange={(e) =>
                    setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0,00"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Preço de Venda Final (R$) *
                </label>
                <input
                  id="input-product-price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.sellingPrice ?? ''}
                  onChange={(e) =>
                    setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0,00"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-bold text-indigo-900 ${
                    errors.sellingPrice ? 'border-rose-500 bg-rose-50/30' : 'border-slate-300'
                  }`}
                />
                {errors.sellingPrice && (
                  <p className="text-xs text-rose-600">{errors.sellingPrice}</p>
                )}
              </div>
            </div>

            {/* Quick Margin Assistant */}
            {showCalculator && (
              <div className="bg-white p-3 rounded-lg border border-indigo-100 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-700">
                    Margem de Lucro Desejada sobre Venda:
                  </span>
                  <span className="text-xs font-bold text-indigo-700">
                    {desiredMarginPercent}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="5"
                    max="80"
                    step="1"
                    value={desiredMarginPercent}
                    onChange={(e) => setDesiredMarginPercent(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={applyCalculatedPrice}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold whitespace-nowrap transition"
                  >
                    Calcular & Aplicar
                  </button>
                </div>
              </div>
            )}

            {/* Profit & Markup Badge */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/80 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Lucro Bruto:</span>
                <span
                  className={`font-semibold ${
                    grossProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {formatCurrency(grossProfit)} ({formatPercent(marginPercent, 1)})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Markup Multiplicador:</span>
                <span className="font-bold text-indigo-700">
                  {markupMultiplier > 0 ? `${markupMultiplier.toFixed(2)}x` : '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Stock Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Estoque Atual</label>
              <input
                id="input-product-stock"
                type="number"
                min="0"
                value={formData.stock ?? ''}
                onChange={(e) =>
                  setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })
                }
                placeholder="0"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Estoque Mínimo (Alerta de Reposição)
              </label>
              <input
                id="input-product-min-stock"
                type="number"
                min="0"
                value={formData.minStock ?? ''}
                onChange={(e) =>
                  setFormData({ ...formData, minStock: parseInt(e.target.value, 10) || 0 })
                }
                placeholder="5"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              Descrição / Observações Técnicas (Opcional)
            </label>
            <textarea
              id="input-product-desc"
              rows={2}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detalhes adicionais, especificações, garantia..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              id="btn-save-product"
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-xs transition"
            >
              <Check className="w-4 h-4" />
              Salvar Produto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
