import React, { useState } from 'react';
import { SinistronLogo } from './SinistronLogo';
import { StoreSettings, SystemFont, SystemColorTheme, LayoutWidth } from '../types';
import { StorageService, SAMPLE_STARTER_PRODUCTS } from '../utils/storage';
import { X, Building2, CreditCard, Save, Download, Upload, RotateCcw, Check, Palette, Sparkles, Package, Monitor } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StoreSettings;
  onSaveSettings: (settings: StoreSettings) => void;
  onDataReset: () => void;
  onLoadStarterCatalog?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onDataReset,
  onLoadStarterCatalog,
}) => {
  const [formData, setFormData] = useState<StoreSettings>(settings);
  const [activeTab, setActiveTab] = useState<'store' | 'appearance' | 'rates' | 'backup'>('store');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setFeedbackMessage('Configurações e preferências salvas com sucesso!');
    setTimeout(() => {
      setFeedbackMessage(null);
      onClose();
    }, 1000);
  };

  const handleExportBackup = () => {
    const dataStr = StorageService.exportAllData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_sinistron_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = StorageService.importAllData(content);
        if (success) {
          alert('Dados importados com sucesso! A página será atualizada.');
          window.location.reload();
        } else {
          alert('Arquivo de backup inválido.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (
      window.confirm(
        'Tem certeza que deseja ZERAR todos os dados, produtos, vendas, despesas e histórico do caixa? Todos os valores voltarão para R$ 0,00.'
      )
    ) {
      StorageService.resetToZero();
      onDataReset();
      window.location.reload();
    }
  };

  const handleLoadDemoCatalog = () => {
    if (
      window.confirm(
        'Deseja carregar o catálogo modelo de demonstração da Sinistron (smartphones, acessórios e serviços)?'
      )
    ) {
      if (onLoadStarterCatalog) {
        onLoadStarterCatalog();
      } else {
        StorageService.saveProducts(SAMPLE_STARTER_PRODUCTS);
        window.location.reload();
      }
      setFeedbackMessage('Catálogo modelo carregado com sucesso!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#120824] rounded-3xl shadow-2xl border border-purple-500/30 overflow-hidden text-purple-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-900/40 bg-[#0c0519]">
          <div className="flex items-center gap-3">
            <SinistronLogo size={28} showText={false} glow={true} />
            <div>
              <h3 className="text-base font-black tracking-tight text-white font-mono">
                SINISTRON<span className="bg-gradient-to-r from-fuchsia-400 to-purple-400 bg-clip-text text-transparent">.IA</span> - Configurações
              </h3>
              <p className="text-[11px] text-purple-300/70">Personalize empresa, tipografia e dados do sistema</p>
            </div>
          </div>
          <button
            id="btn-close-settings-modal"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950 px-6 pt-2 gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('store')}
            className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'store'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 rounded-t-xl'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Loja & Dados
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('appearance')}
            className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'appearance'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 rounded-t-xl'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            Aparência & Fontes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rates')}
            className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'rates'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 rounded-t-xl'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Taxas de Cartão
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'backup'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 rounded-t-xl'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            Backup & Catálogo
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* TAB: STORE */}
          {activeTab === 'store' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nome Fantasia do Sistema / Empresa *</label>
                <input
                  type="text"
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">CNPJ / CPF</label>
                  <input
                    type="text"
                    value={formData.document}
                    onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Endereço Completo</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mensagem de Rodapé do Cupom</label>
                <input
                  type="text"
                  value={formData.receiptFooter}
                  onChange={(e) => setFormData({ ...formData, receiptFooter: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* TAB: APPEARANCE & TYPOGRAPHY */}
          {activeTab === 'appearance' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  Família Tipográfica (Fonte do Sistema)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'outfit' as SystemFont, name: 'Outfit', subtitle: 'Moderna & Geométrica', preview: 'sinistron.ia' },
                    { id: 'plus-jakarta' as SystemFont, name: 'Plus Jakarta Sans', subtitle: 'Corporativa & Nítida', preview: 'sinistron.ia' },
                    { id: 'space-grotesk' as SystemFont, name: 'Space Grotesk', subtitle: 'Neo-Brutalist Tech', preview: 'sinistron.ia' },
                    { id: 'inter' as SystemFont, name: 'Inter', subtitle: 'Clean & Equilibrada', preview: 'sinistron.ia' },
                    { id: 'jetbrains' as SystemFont, name: 'JetBrains Mono', subtitle: 'Fintech & Código', preview: 'sinistron.ia' },
                  ].map((font) => (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, fontFamily: font.id })}
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                        (formData.fontFamily || 'outfit') === font.id
                          ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 dark:border-indigo-500 text-indigo-950 dark:text-indigo-200'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-800'
                      }`}
                    >
                      <div className="text-xs font-bold">{font.name}</div>
                      <div className="text-[10px] text-slate-400">{font.subtitle}</div>
                      <div className="text-xs font-black mt-1 text-slate-700 dark:text-slate-300 font-mono">{font.preview}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-purple-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-purple-400" />
                    Tema do Sistema (Padrão Único)
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Ativo & Exclusivo
                  </span>
                </label>
                <div className="p-3.5 rounded-2xl border border-purple-500/30 bg-[#160c2d] flex items-center justify-between shadow-inner">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-900 via-[#07040e] to-purple-600 border border-purple-400/40 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.35)]">
                      <span className="w-3.5 h-3.5 rounded-full bg-purple-400 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Preto & Roxo Escuro Premium</h4>
                      <p className="text-[11px] text-purple-300/70">Aura visual dark com acentuações neon violeta calibradas para alta legibilidade</p>
                    </div>
                  </div>
                  <div className="text-[11px] font-bold text-purple-300 bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-800/60">
                    Único do Site
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-indigo-500" />
                  Modo de Escala de Tela (Ultra-Wide)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, layoutWidth: 'ultrawide' })}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      (formData.layoutWidth || 'ultrawide') === 'ultrawide'
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 dark:border-indigo-500'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800'
                    }`}
                  >
                    <div className="text-xs font-bold">Ultra-Wide Adaptativo (Recomendado)</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Expande o painel e os bento-grids para preencher monitores grandes (1920px+).</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, layoutWidth: 'normal' })}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      formData.layoutWidth === 'normal'
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 dark:border-indigo-500'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800'
                    }`}
                  >
                    <div className="text-xs font-bold">Largura Padrão (Compacto)</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Largura centralizada com margens laterais limitadas a 1280px.</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: RATES */}
          {activeTab === 'rates' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 rounded-2xl text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
                Configure as taxas reais da sua maquininha de cartão. Elas serão deduzidas automaticamente nos simuladores de lucro e demonstrativos do PDV.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Taxa Débito (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.defaultCardRates.debit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        defaultCardRates: {
                          ...formData.defaultCardRates,
                          debit: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Taxa Crédito à Vista (1x) (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.defaultCardRates.creditCash}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        defaultCardRates: {
                          ...formData.defaultCardRates,
                          creditCash: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Taxa Crédito Parcelado (2x a 6x) (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.defaultCardRates.credit2xTo6x}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        defaultCardRates: {
                          ...formData.defaultCardRates,
                          credit2xTo6x: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Taxa Crédito Parcelado (7x a 12x) (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.defaultCardRates.credit7xTo12x}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        defaultCardRates: {
                          ...formData.defaultCardRates,
                          credit7xTo12x: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: BACKUP & STARTER DATA */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 rounded-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Carregar Catálogo Inicial / Modelo
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Adiciona modelos de produtos para eletrônicos, capas, películas e serviços com fotos de referência e margens pré-calculadas.
                </p>
                <button
                  type="button"
                  onClick={handleLoadDemoCatalog}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Carregar Catálogo Modelo Sinistron
                </button>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Exportar Cópia de Segurança (JSON)
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Baixe um arquivo contendo todos os cadastros, produtos, vendas e caixa para arquivamento seguro.
                </p>
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Baixar Backup JSON
                </button>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Restaurar Cópia de Segurança
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Importe dados a partir de um arquivo .json anteriormente gerado.
                </p>
                <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition">
                  <Upload className="w-4 h-4" />
                  Selecionar Arquivo JSON
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-2xl space-y-2">
                <h4 className="text-xs font-bold text-rose-900 dark:text-rose-300 uppercase tracking-wider">
                  Zerar Todos os Dados e Valores
                </h4>
                <p className="text-xs text-rose-700 dark:text-rose-400">
                  Redefine o sistema limpando vendas, orçamentos, estoque e caixa para iniciar do zero.
                </p>
                <button
                  type="button"
                  onClick={handleResetData}
                  className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Zerar Todos os Valores
                </button>
              </div>
            </div>
          )}

          {feedbackMessage && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-medium">
              <Check className="w-4 h-4 text-emerald-600" />
              {feedbackMessage}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              Fechar
            </button>
            <button
              id="btn-save-settings"
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
