import React from 'react';
import { Sale, Budget, StoreSettings } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Printer, X, Download, CheckCircle2, Phone, MapPin, FileText } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale?: Sale | null;
  budget?: Budget | null;
  settings: StoreSettings;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  sale,
  budget,
  settings,
}) => {
  if (!isOpen || (!sale && !budget)) return null;

  const isBudget = !!budget;
  const data = budget || sale;
  if (!data) return null;

  const handlePrint = () => {
    window.print();
  };

  const getPaymentMethodLabel = (method: string) => {
    const map: Record<string, string> = {
      dinheiro: 'Dinheiro',
      pix: 'PIX (À Vista)',
      cartao_credito: 'Cartão de Crédito',
      cartao_debito: 'Cartão de Débito',
      boleto: 'Boleto Bancário',
      a_prazo: 'A Prazo / Crediário',
    };
    return map[method] || method;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden print:border-none print:shadow-none print:max-w-none print:w-full">
        {/* Header - Screen only */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-slate-800">
              {isBudget ? 'Orçamento / Proposta' : 'Comprovante de Venda'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="btn-print-receipt"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition shadow-xs"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
            <button
              id="btn-close-receipt-modal"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Receipt Content - Styled like a receipt / invoice */}
        <div className="p-6 md:p-8 space-y-6 text-slate-800 bg-white font-mono text-sm print:p-2 print:text-xs">
          {/* Business Info */}
          <div className="text-center border-b border-dashed border-slate-300 pb-4 space-y-1">
            <h2 className="text-xl font-bold font-sans tracking-tight text-slate-900">
              {settings.storeName}
            </h2>
            {settings.document && (
              <p className="text-slate-600">CNPJ/CPF: {settings.document}</p>
            )}
            {settings.phone && (
              <p className="text-slate-600 flex items-center justify-center gap-1">
                <Phone className="w-3.5 h-3.5 inline text-slate-400" /> {settings.phone}
              </p>
            )}
            {settings.address && (
              <p className="text-slate-500 text-xs flex items-center justify-center gap-1">
                <MapPin className="w-3.5 h-3.5 inline text-slate-400" /> {settings.address}
              </p>
            )}
            <div className="pt-2">
              <span className="inline-block px-3 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-full border border-slate-200 uppercase tracking-wider">
                {isBudget ? 'DOCUMENTO DE ORÇAMENTO' : 'CUPOM NÃO FISCAL'}
              </span>
            </div>
          </div>

          {/* Transaction Metadata */}
          <div className="flex justify-between items-start text-xs border-b border-dashed border-slate-300 pb-3 text-slate-600">
            <div>
              <p>
                <span className="font-semibold text-slate-800">Código:</span> {data.code}
              </p>
              <p>
                <span className="font-semibold text-slate-800">Data/Hora:</span> {formatDate(data.date)}
              </p>
              {isBudget && budget && (
                <p>
                  <span className="font-semibold text-slate-800">Validade:</span> {formatDate(budget.validUntil)}
                </p>
              )}
            </div>
            {data.customer?.name && (
              <div className="text-right">
                <p className="font-semibold text-slate-800">Cliente:</p>
                <p className="text-slate-700">{data.customer.name}</p>
                {data.customer.phone && <p>{data.customer.phone}</p>}
                {data.customer.document && <p>Doc: {data.customer.document}</p>}
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-700 border-b border-slate-300 pb-1">
              <span className="w-1/2">Item / Descrição</span>
              <span className="w-1/6 text-center">Qtd</span>
              <span className="w-1/6 text-right">Unit.</span>
              <span className="w-1/6 text-right">Total</span>
            </div>

            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto print:max-h-none">
              {data.items.map((item, idx) => (
                <div key={idx} className="py-2 flex justify-between items-start text-xs">
                  <div className="w-1/2 pr-2">
                    <p className="font-medium text-slate-800">{item.productName}</p>
                    <span className="text-[10px] text-slate-400">Cód: {item.code}</span>
                  </div>
                  <div className="w-1/6 text-center text-slate-700">{item.quantity}</div>
                  <div className="w-1/6 text-right text-slate-700">{formatCurrency(item.unitPrice)}</div>
                  <div className="w-1/6 text-right font-semibold text-slate-900">
                    {formatCurrency(item.total)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Calculation */}
          <div className="border-t border-dashed border-slate-300 pt-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span>{formatCurrency(data.subtotal)}</span>
            </div>
            {data.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Desconto Aplicado:</span>
                <span>-{formatCurrency(data.discount)}</span>
              </div>
            )}
            {!isBudget && sale?.addition && sale.addition > 0 ? (
              <div className="flex justify-between text-amber-700 font-medium">
                <span>Acréscimo:</span>
                <span>+{formatCurrency(sale.addition)}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-300 pt-2">
              <span>VALOR TOTAL:</span>
              <span>{formatCurrency(data.total)}</span>
            </div>
          </div>

          {/* Payment & Conditions */}
          {!isBudget && sale && (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-700">Forma de Pagamento:</span>
                <span className="text-slate-900 font-medium">
                  {getPaymentMethodLabel(sale.paymentMethod)}
                  {sale.paymentDetails.installments && sale.paymentDetails.installments > 1
                    ? ` (${sale.paymentDetails.installments}x)`
                    : ''}
                </span>
              </div>
              {sale.paymentMethod === 'dinheiro' && sale.paymentDetails.receivedAmount ? (
                <>
                  <div className="flex justify-between text-slate-600">
                    <span>Valor Recebido:</span>
                    <span>{formatCurrency(sale.paymentDetails.receivedAmount)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-slate-800">
                    <span>Troco:</span>
                    <span>{formatCurrency(sale.paymentDetails.changeAmount || 0)}</span>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {data.notes && (
            <div className="text-xs text-slate-600 italic bg-amber-50/50 p-2.5 rounded border border-amber-200/50">
              <span className="font-semibold not-italic text-amber-900">Observações: </span>
              {data.notes}
            </div>
          )}

          {/* Footer message */}
          <div className="text-center pt-3 border-t border-dashed border-slate-300 text-slate-500 text-xs">
            <p>{settings.receiptFooter}</p>
            <p className="text-[10px] text-slate-400 mt-1">
              Sistema de Gestão & PDV Pro • {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
