import React, { useState, useMemo } from 'react';
import { Product, StoreSettings } from '../types';
import { formatCurrency, formatPercent } from '../utils/formatters';
import {
  calculateSellingPrice,
  simulateCardRates,
  calculateDiscountImpact,
} from '../utils/calculators';
import {
  Calculator,
  Percent,
  CreditCard,
  Target,
  TrendingDown,
  ArrowRight,
  PlusCircle,
  HelpCircle,
  CheckCircle,
  DollarSign,
  TrendingUp,
  PieChart,
  AlertCircle,
} from 'lucide-react';

interface CalculatorsViewProps {
  products: Product[];
  settings: StoreSettings;
  onSaveNewProduct: (product: Partial<Product>) => void;
}

export const CalculatorsView: React.FC<CalculatorsViewProps> = ({
  products,
  settings,
  onSaveNewProduct,
}) => {
  const [activeCalculator, setActiveCalculator] = useState<
    'pricing' | 'card_fees' | 'break_even' | 'discount_impact'
  >('pricing');

  // State for Pricing Formation
  const [pricingCost, setPricingCost] = useState<number>(0);
  const [fixedCostsPercent, setFixedCostsPercent] = useState<number>(0);
  const [variableCostsPercent, setVariableCostsPercent] = useState<number>(0); // Impostos + comissões
  const [cardFeePercent, setCardFeePercent] = useState<number>(0);
  const [desiredProfitPercent, setDesiredProfitPercent] = useState<number>(0);
  const [monthlyFixedCostInput, setMonthlyFixedCostInput] = useState<number>(0);
  const [productNameInput, setProductNameInput] = useState<string>('');
  const [selectedPresetProduct, setSelectedPresetProduct] = useState<string>('');
  const [pricingSuccessMsg, setPricingSuccessMsg] = useState<string | null>(null);

  // State for Card Machine Simulator
  const [cardSaleAmount, setCardSaleAmount] = useState<number>(0);
  const [debitRateInput, setDebitRateInput] = useState<number>(0);
  const [creditCashRateInput, setCreditCashRateInput] = useState<number>(0);

  // State for Break Even
  const [beMonthlyFixedCosts, setBeMonthlyFixedCosts] = useState<number>(0);
  const [beAvgTicket, setBeAvgTicket] = useState<number>(0);
  const [beContributionMarginPercent, setBeContributionMarginPercent] = useState<number>(0);
  const [beWorkingDays, setBeWorkingDays] = useState<number>(0);

  // State for Discount Impact
  const [discOriginalPrice, setDiscOriginalPrice] = useState<number>(0);
  const [discCostPrice, setDiscCostPrice] = useState<number>(0);
  const [discDiscountPercent, setDiscDiscountPercent] = useState<number>(0);

  // Pricing calculations result
  const pricingResult = useMemo(() => {
    return calculateSellingPrice(
      pricingCost,
      fixedCostsPercent,
      variableCostsPercent,
      cardFeePercent,
      desiredProfitPercent,
      monthlyFixedCostInput
    );
  }, [
    pricingCost,
    fixedCostsPercent,
    variableCostsPercent,
    cardFeePercent,
    desiredProfitPercent,
    monthlyFixedCostInput,
  ]);

  // Card Simulations
  const cardResults = useMemo(() => {
    return simulateCardRates(cardSaleAmount, debitRateInput, creditCashRateInput);
  }, [cardSaleAmount, debitRateInput, creditCashRateInput]);

  // Discount Results
  const discountResult = useMemo(() => {
    return calculateDiscountImpact(discOriginalPrice, discCostPrice, discDiscountPercent);
  }, [discOriginalPrice, discCostPrice, discDiscountPercent]);

  // Break-even results
  const breakEvenRevenue = useMemo(() => {
    if (beContributionMarginPercent <= 0) return 0;
    return beMonthlyFixedCosts / (beContributionMarginPercent / 100);
  }, [beMonthlyFixedCosts, beContributionMarginPercent]);

  const breakEvenSalesCount = useMemo(() => {
    if (beAvgTicket <= 0) return 0;
    return Math.ceil(breakEvenRevenue / beAvgTicket);
  }, [breakEvenRevenue, beAvgTicket]);

  const breakEvenDailySales = useMemo(() => {
    if (beWorkingDays <= 0) return 0;
    return Math.ceil(breakEvenSalesCount / beWorkingDays);
  }, [breakEvenSalesCount, beWorkingDays]);

  const handleSelectExistingProduct = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const prodId = e.target.value;
    setSelectedPresetProduct(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setProductNameInput(prod.name);
      setPricingCost(prod.costPrice);
    }
  };

  const handleSaveToCatalog = () => {
    if (!productNameInput.trim()) {
      alert('Informe o nome do produto para salvar no catálogo.');
      return;
    }
    onSaveNewProduct({
      name: productNameInput.trim(),
      costPrice: pricingCost,
      sellingPrice: parseFloat(pricingResult.suggestedSellingPrice.toFixed(2)),
      category: 'Geral',
    });
    setPricingSuccessMsg('Produto salvo com sucesso no catálogo!');
    setTimeout(() => setPricingSuccessMsg(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Title and Top Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="w-6 h-6 text-indigo-600" />
            Central de Cálculos & Formação de Preços
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Ferramentas matemáticas e comerciais para precificação estratégica, markup, taxas e ponto de equilíbrio.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: 'pricing', label: 'Formação de Preço (Markup)', icon: DollarSign },
            { id: 'card_fees', label: 'Taxas de Cartão & Maquininha', icon: CreditCard },
            { id: 'break_even', label: 'Ponto de Equilíbrio', icon: Target },
            { id: 'discount_impact', label: 'Elasticidade & Descontos', icon: TrendingDown },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeCalculator === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCalculator(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. FORMAÇÃO DE PREÇO & MARKUP */}
      {activeCalculator === 'pricing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inputs Section (6 Cols) */}
          <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Percent className="w-4 h-4 text-indigo-600" />
                1. Parâmetros de Custo e Margem
              </h3>
              {products.length > 0 && (
                <select
                  value={selectedPresetProduct}
                  onChange={handleSelectExistingProduct}
                  className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 text-slate-700 focus:outline-hidden"
                >
                  <option value="">Puxar do Estoque...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Custo: {formatCurrency(p.costPrice)})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nome do Item / Produto
                </label>
                <input
                  type="text"
                  placeholder="Ex: Teclado Mecânico Pro RGB"
                  value={productNameInput}
                  onChange={(e) => setProductNameInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Custo de Aquisição / Compra (R$) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    R$
                  </span>
                  <input
                    id="input-calc-cost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={pricingCost || ''}
                    onChange={(e) => setPricingCost(parseFloat(e.target.value) || 0)}
                    className="w-full pl-9 pr-3 py-2.5 text-base font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 flex items-center justify-between mb-1">
                    <span>Custos Fixos da Empresa (%)</span>
                    <span className="text-indigo-600 font-bold">{fixedCostsPercent}%</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="50"
                    value={fixedCostsPercent}
                    onChange={(e) => setFixedCostsPercent(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400">Aluguel, luz, salários rateados</span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 flex items-center justify-between mb-1">
                    <span>Despesas Variáveis + Impostos (%)</span>
                    <span className="text-indigo-600 font-bold">{variableCostsPercent}%</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="50"
                    value={variableCostsPercent}
                    onChange={(e) => setVariableCostsPercent(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400">Simples Nacional, comissões, frete</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 flex items-center justify-between mb-1">
                    <span>Taxa Média de Cartão (%)</span>
                    <span className="text-indigo-600 font-bold">{cardFeePercent}%</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="30"
                    value={cardFeePercent}
                    onChange={(e) => setCardFeePercent(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400">Taxa cobrada pela maquininha</span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-emerald-800 flex items-center justify-between mb-1">
                    <span>Margem de Lucro Líquido Desejada (%) *</span>
                    <span className="text-emerald-700 font-bold">{desiredProfitPercent}%</span>
                  </label>
                  <input
                    id="input-calc-desired-margin"
                    type="number"
                    step="1"
                    min="1"
                    max="80"
                    value={desiredProfitPercent}
                    onChange={(e) => setDesiredProfitPercent(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs font-bold border border-emerald-300 bg-emerald-50/40 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-emerald-950"
                  />
                  <span className="text-[10px] text-emerald-700">Lucro limpo no bolso sobre a venda</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Custos Fixos Mensais da Loja (R$) (Para cálculo do Ponto de Equilíbrio)
                </label>
                <input
                  type="number"
                  step="50"
                  min="0"
                  value={monthlyFixedCostInput}
                  onChange={(e) => setMonthlyFixedCostInput(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Results Section (6 Cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-2xl text-white shadow-md space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 block">
                Preço de Venda Sugerido (Ideal)
              </span>
              <div className="flex items-baseline justify-between">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  {formatCurrency(pricingResult.suggestedSellingPrice)}
                </h1>
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-indigo-200 border border-white/10">
                  Markup: {pricingResult.markupMultiplier.toFixed(2)}x
                </span>
              </div>

              <p className="text-xs text-indigo-200 leading-relaxed">
                Preço calculado com base na fórmula de formação de preço divisora, cobrindo custo,
                despesas e garantindo o lucro líquido desejado.
              </p>

              {/* Breakdown Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                <div className="bg-white/10 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-indigo-200 uppercase font-semibold block">
                    Lucro Líquido Real
                  </span>
                  <span className="text-base font-bold text-emerald-400">
                    {formatCurrency(pricingResult.netProfitAmount)}
                  </span>
                  <span className="text-[10px] text-slate-300 block">
                    ({formatPercent(pricingResult.netProfitPercent, 1)})
                  </span>
                </div>

                <div className="bg-white/10 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-indigo-200 uppercase font-semibold block">
                    Lucro Bruto
                  </span>
                  <span className="text-base font-bold text-white">
                    {formatCurrency(pricingResult.grossMarginAmount)}
                  </span>
                  <span className="text-[10px] text-slate-300 block">
                    (Venda - Custo)
                  </span>
                </div>

                <div className="bg-white/10 p-3 rounded-xl border border-white/5 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-indigo-200 uppercase font-semibold block">
                    Total de Deduções
                  </span>
                  <span className="text-base font-bold text-amber-300">
                    {formatPercent(
                      fixedCostsPercent + variableCostsPercent + cardFeePercent
                    )}
                  </span>
                  <span className="text-[10px] text-slate-300 block">taxas & despesas</span>
                </div>
              </div>

              {/* Action: Save to catalog */}
              <div className="pt-2">
                <button
                  id="btn-save-calculated-product"
                  onClick={handleSaveToCatalog}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  Salvar Este Preço no Catálogo de Produtos
                </button>
                {pricingSuccessMsg && (
                  <p className="text-xs text-emerald-300 font-semibold text-center mt-2 animate-fadeIn">
                    {pricingSuccessMsg}
                  </p>
                )}
              </div>
            </div>

            {/* Detailed Decomposition */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <PieChart className="w-4 h-4 text-indigo-600" />
                Composição de Cada R$ 100,00 Vendidos
              </h4>

              <div className="space-y-2 text-xs">
                {/* Cost */}
                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                    Custo do Produto (CMV):
                  </span>
                  <span className="font-semibold">{formatCurrency(pricingCost)}</span>
                </div>

                {/* Fixed */}
                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    Custos Fixos ({fixedCostsPercent}%):
                  </span>
                  <span className="font-semibold">
                    {formatCurrency((pricingResult.suggestedSellingPrice * fixedCostsPercent) / 100)}
                  </span>
                </div>

                {/* Variable */}
                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    Impostos & Comissões ({variableCostsPercent}%):
                  </span>
                  <span className="font-semibold">
                    {formatCurrency((pricingResult.suggestedSellingPrice * variableCostsPercent) / 100)}
                  </span>
                </div>

                {/* Card */}
                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    Taxa Cartão ({cardFeePercent}%):
                  </span>
                  <span className="font-semibold">
                    {formatCurrency((pricingResult.suggestedSellingPrice * cardFeePercent) / 100)}
                  </span>
                </div>

                {/* Net profit */}
                <div className="flex items-center justify-between text-emerald-800 font-bold pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Lucro Líquido Real ({desiredProfitPercent}%):
                  </span>
                  <span>{formatCurrency(pricingResult.netProfitAmount)}</span>
                </div>
              </div>

              {/* Break-even badge */}
              {pricingResult.breakEvenUnits ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 mt-3">
                  <span className="font-bold text-slate-800">
                    Ponto de Equilíbrio deste Produto:
                  </span>
                  <p className="text-slate-600">
                    Para pagar os custos fixos de {formatCurrency(monthlyFixedCostInput)}/mês vendendo apenas este item, você precisaria vender{' '}
                    <strong className="text-indigo-700">{pricingResult.breakEvenUnits} unidades</strong> ({formatCurrency(pricingResult.breakEvenRevenue)}) por mês.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* 2. SIMULADOR DE TAXAS DE CARTÃO & MAQUININHA */}
      {activeCalculator === 'card_fees' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                Simulador Completo de Parcelamento (1x até 12x)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Compare quanto você recebe limpo ou quanto cobrar caso queira repassar os juros da maquininha ao comprador.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                Valor da Venda (R$):
              </label>
              <input
                id="input-card-sale-amount"
                type="number"
                step="10"
                min="1"
                value={cardSaleAmount}
                onChange={(e) => setCardSaleAmount(parseFloat(e.target.value) || 0)}
                className="w-36 px-3 py-1.5 text-sm font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Table of Installments */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Parcelas</th>
                  <th className="py-3 px-4 text-center">Taxa Operadora</th>
                  <th className="py-3 px-4 bg-indigo-50/50 text-indigo-950 font-bold">
                    Cenário 1: Lojista Absorve (Valor Cliente / Líquido Loja)
                  </th>
                  <th className="py-3 px-4 bg-emerald-50/50 text-emerald-950 font-bold">
                    Cenário 2: Repassar Juros (Valor a Cobrar / Parcela Cliente)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cardResults.map((item) => (
                  <tr key={item.installments} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {item.installments}x {item.installments === 1 ? '(À Vista)' : ''}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-600">
                      {formatPercent(item.ratePercent)}
                    </td>
                    {/* Cenário 1 */}
                    <td className="py-3 px-4 bg-indigo-50/20">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">
                          {item.installments}x de {formatCurrency(item.installmentValueCustomerPays)}
                        </span>
                        <span className="text-[11px] text-indigo-700 font-bold">
                          Líquido na sua conta: {formatCurrency(item.netMerchantReceives)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Taxa descontada: -{formatCurrency(item.feeAmountMerchantPays)}
                        </span>
                      </div>
                    </td>
                    {/* Cenário 2 */}
                    <td className="py-3 px-4 bg-emerald-50/20">
                      <div className="flex flex-col">
                        <span className="font-bold text-emerald-900">
                          Cobrar Total: {formatCurrency(item.passedPriceTotal)}
                        </span>
                        <span className="text-[11px] text-slate-700 font-semibold">
                          {item.installments}x de {formatCurrency(item.passedInstallmentValue)}
                        </span>
                        <span className="text-[10px] text-emerald-700">
                          Você recebe exatamente: {formatCurrency(cardSaleAmount)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. PONTO DE EQUILÍBRIO (BREAK EVEN) */}
      {activeCalculator === 'break_even' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
              <Target className="w-4 h-4 text-indigo-600" />
              Parâmetros da Empresa
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Custos Fixos Totais Mensais (R$)
                </label>
                <input
                  type="number"
                  step="100"
                  min="0"
                  value={beMonthlyFixedCosts}
                  onChange={(e) => setBeMonthlyFixedCosts(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-400">
                  Soma de aluguel, funcionários, pró-labore, contador, sistemas, etc.
                </span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Margem de Contribuição Média (%)
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  max="100"
                  value={beContributionMarginPercent}
                  onChange={(e) => setBeContributionMarginPercent(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-400">
                  (Preço de Venda - Custo - Impostos - Taxas) / Preço de Venda
                </span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Ticket Médio por Venda / Cliente (R$)
                </label>
                <input
                  type="number"
                  step="10"
                  min="1"
                  value={beAvgTicket}
                  onChange={(e) => setBeAvgTicket(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Dias Úteis de Funcionamento por Mês
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={beWorkingDays}
                  onChange={(e) => setBeWorkingDays(parseInt(e.target.value, 10) || 26)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider text-slate-500">
                Resultado do Ponto de Equilíbrio
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Volume mínimo que sua empresa precisa faturar e vender apenas para empatar (lucro zero, sem prejuízo).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <span className="text-xs font-semibold text-indigo-700 block">
                    Faturamento Mínimo Mensal
                  </span>
                  <span className="text-2xl font-black text-indigo-950 mt-1 block">
                    {formatCurrency(breakEvenRevenue)}
                  </span>
                  <span className="text-[11px] text-indigo-600 mt-1 block">
                    Meta mensal para zerar despesas
                  </span>
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <span className="text-xs font-semibold text-emerald-700 block">
                    Quantidade de Vendas Mensais
                  </span>
                  <span className="text-2xl font-black text-emerald-950 mt-1 block">
                    {breakEvenSalesCount} vendas
                  </span>
                  <span className="text-[11px] text-emerald-600 mt-1 block">
                    Baseado no ticket médio de {formatCurrency(beAvgTicket)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <span className="font-bold text-slate-800">Meta Diária de Operação:</span>
              <p className="text-slate-600 leading-relaxed">
                Você precisa realizar no mínimo <strong className="text-indigo-700">{breakEvenDailySales} vendas por dia</strong> ({formatCurrency(breakEvenRevenue / beWorkingDays)}/dia) para cobrir todas as despesas fixas. A partir da {breakEvenDailySales + 1}ª venda diária média, sua empresa entra em <strong className="text-emerald-700">zona de lucro líquido real</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. ELASTICIDADE & DESCONTOS */}
      {activeCalculator === 'discount_impact' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
              <TrendingDown className="w-4 h-4 text-indigo-600" />
              Simulação de Promoção / Desconto
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Preço Normal de Venda (R$)</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={discOriginalPrice}
                  onChange={(e) => setDiscOriginalPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Preço de Custo do Item (R$)</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={discCostPrice}
                  onChange={(e) => setDiscCostPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 flex justify-between mb-1">
                  <span>Desconto Pretendido (%)</span>
                  <span className="text-rose-600 font-bold">{discDiscountPercent}%</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={discDiscountPercent}
                  onChange={(e) => setDiscDiscountPercent(parseFloat(e.target.value) || 0)}
                  className="w-full accent-rose-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">
              Impacto no Lucro & Elasticidade Necessária
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium block">Preço Original</span>
                <span className="text-base font-bold text-slate-900">
                  {formatCurrency(discOriginalPrice)}
                </span>
                <div className="mt-2 text-slate-600">
                  Lucro Bruto: <strong>{formatCurrency(discountResult.originalGrossMargin)}</strong> ({formatPercent(discountResult.originalGrossMarginPercent, 1)})
                </div>
              </div>

              <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-200">
                <span className="text-rose-700 font-medium block">Preço com Desconto</span>
                <span className="text-base font-bold text-rose-900">
                  {formatCurrency(discountResult.discountedPrice)}
                </span>
                <div className="mt-2 text-rose-800">
                  Novo Lucro: <strong>{formatCurrency(discountResult.newGrossMargin)}</strong> ({formatPercent(discountResult.newGrossMarginPercent, 1)})
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-2 text-amber-950">
              <span className="font-bold text-amber-900 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Aumento de Volume Exigido:
              </span>
              <p className="leading-relaxed">
                Ao conceder <strong>{discDiscountPercent}% de desconto</strong>, seu lucro unitário cai de {formatCurrency(discountResult.originalGrossMargin)} para {formatCurrency(discountResult.newGrossMargin)}.
              </p>
              <p className="font-bold text-amber-900">
                Para obter exatamente o mesmo lucro total em dinheiro, você precisará vender{' '}
                <span className="text-indigo-800 underline">
                  +{formatPercent(discountResult.requiredSalesVolumeIncreasePercent, 1)} a mais
                </span>{' '}
                de unidades deste produto!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
