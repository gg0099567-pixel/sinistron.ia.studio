import React, { useState } from 'react';
import { Seller, Branch } from '../types';
import { Users, UserPlus, Shield, Trash2, Key, Mail, Check, X, Building2, AlertTriangle, ShieldAlert, Lock } from 'lucide-react';

interface UserAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellers: Seller[];
  branches: Branch[];
  onSaveSellers: (sellers: Seller[]) => void;
  onDeleteSeller?: (sellerId: string) => void;
  userRole?: string;
}

export const UserAccessModal: React.FC<UserAccessModalProps> = ({
  isOpen,
  onClose,
  sellers,
  branches,
  onSaveSellers,
  onDeleteSeller,
  userRole = 'Administrador',
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Administrador' | 'Gerente' | 'Vendedor' | 'Consultor'>('Vendedor');
  const [branchId, setBranchId] = useState(branches[0]?.id || 'branch-embu');
  const [commissionRate, setCommissionRate] = useState('2.5');
  const [monthlySalesGoal, setMonthlySalesGoal] = useState('50');
  const [monthlyRevenueGoal, setMonthlyRevenueGoal] = useState('25000');
  const [successMsg, setSuccessMsg] = useState('');
  const [confirmDeleteSeller, setConfirmDeleteSeller] = useState<Seller | null>(null);

  if (!isOpen) return null;

  const isAdmin = userRole === 'Administrador';

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Acesso negado: Apenas o Administrador pode criar novos acessos no sistema.');
      return;
    }
    if (!name.trim()) return;

    const newSeller: Seller = {
      id: `seller-${Date.now()}`,
      name: name.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@sinistron.ia`,
      role,
      branchId,
      commissionRate: Number(commissionRate) || 2.5,
      monthlySalesGoal: Number(monthlySalesGoal) || 50,
      monthlyRevenueGoal: Number(monthlyRevenueGoal) || 25000,
    };

    onSaveSellers([...sellers, newSeller]);
    setSuccessMsg(`Acesso criado com sucesso para ${name}!`);
    setName('');
    setEmail('');
    setPassword('');
    setTimeout(() => {
      setSuccessMsg('');
      setActiveTab('list');
    }, 1500);
  };

  const handleConfirmDelete = () => {
    if (!confirmDeleteSeller) return;
    if (!isAdmin) {
      alert('Acesso negado: Apenas o Administrador pode revogar ou excluir acessos de colaboradores.');
      setConfirmDeleteSeller(null);
      return;
    }
    if (sellers.length <= 1) {
      alert('Você precisa manter ao menos um usuário no sistema.');
      setConfirmDeleteSeller(null);
      return;
    }

    const targetName = confirmDeleteSeller.name;
    if (onDeleteSeller) {
      onDeleteSeller(confirmDeleteSeller.id);
    } else {
      onSaveSellers(sellers.filter((s) => s.id !== confirmDeleteSeller.id));
    }
    setConfirmDeleteSeller(null);
    setSuccessMsg(`Colaborador ${targetName} foi desligado pelo Administrador.`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#120824] border border-purple-500/30 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 text-purple-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-purple-900/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-950/80 border border-purple-600/50 rounded-2xl text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Gerenciamento de Colaboradores & Acessos</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                  isAdmin 
                    ? 'bg-purple-950/80 text-purple-300 border-purple-600/50' 
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {isAdmin ? 'ADMINISTRADOR ATIVO' : 'MODO CONSULTA'}
                </span>
              </div>
              <p className="text-xs text-purple-300/70">
                {isAdmin 
                  ? 'Permissão concedida: Crie novos logins ou desligue colaboradores do sistema.'
                  : 'Visualização da equipe. Apenas o Administrador pode adicionar ou desligar colaboradores.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-purple-300/70 hover:text-white bg-purple-950/40 hover:bg-purple-900/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 bg-[#0c0519] p-1.5 rounded-2xl border border-purple-900/40">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'list'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-purple-300/70 hover:text-white hover:bg-purple-950/50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Colaboradores Ativos ({sellers.length})</span>
          </button>
          <button
            onClick={() => {
              if (!isAdmin) {
                alert('Acesso Restrito: Apenas o Administrador pode criar novos acessos de colaboradores.');
                return;
              }
              setActiveTab('create');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'create'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-purple-300/70 hover:text-white hover:bg-purple-950/50'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Criar Novo Acesso {isAdmin ? '(Admin)' : '(Bloqueado)'}</span>
          </button>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-950/70 border border-emerald-800 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'list' ? (
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {sellers.map((seller) => {
              const branch = branches.find((b) => b.id === seller.branchId);
              return (
                <div
                  key={seller.id}
                  className="bg-[#180d31] border border-purple-900/40 hover:border-purple-600/40 rounded-2xl p-4 flex items-center justify-between gap-4 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-sm">
                      {seller.avatar || seller.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{seller.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          seller.role === 'Administrador'
                            ? 'bg-purple-950/70 text-purple-300 border-purple-600'
                            : seller.role === 'Gerente'
                            ? 'bg-blue-950/70 text-blue-300 border-blue-700'
                            : 'bg-purple-900/30 text-purple-200 border-purple-700/50'
                        }`}>
                          {seller.role}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-purple-300/70 mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-purple-400" />
                          {seller.email || 'Sem e-mail'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-purple-400" />
                          {branch?.name || 'Filial Principal'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right text-xs">
                      <div className="text-purple-300/60">Comissão</div>
                      <div className="font-bold text-emerald-400">{seller.commissionRate}%</div>
                    </div>

                    {isAdmin ? (
                      <button
                        onClick={() => setConfirmDeleteSeller(seller)}
                        className="p-2 rounded-xl bg-rose-950/50 hover:bg-rose-900/70 border border-rose-800/60 text-rose-300 hover:text-white transition cursor-pointer"
                        title="Tirar/Desligar Colaborador (Admin)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => alert('Acesso negado: Apenas o Administrador pode remover ou desligar colaboradores.')}
                        className="p-2 rounded-xl bg-slate-800/40 border border-slate-700/40 text-slate-500 cursor-not-allowed"
                        title="Apenas o Administrador pode remover colaboradores"
                      >
                        <Lock className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-purple-200 font-bold mb-1">Nome Completo do Colaborador *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Carlos Eduardo"
                  className="w-full bg-[#180d31] border border-purple-800/60 rounded-xl px-3 py-2 text-white font-medium focus:outline-hidden focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-purple-200 font-bold mb-1">E-mail Profissional (Login)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="carlos@sinistron.ia"
                  className="w-full bg-[#180d31] border border-purple-800/60 rounded-xl px-3 py-2 text-white font-medium focus:outline-hidden focus:border-purple-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-purple-200 font-bold mb-1">Senha Inicial / PIN de Acesso</label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 w-4 h-4 text-purple-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 dígitos"
                    className="w-full bg-[#180d31] border border-purple-800/60 rounded-xl pl-9 pr-3 py-2 text-white font-medium focus:outline-hidden focus:border-purple-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-purple-200 font-bold mb-1">Cargo / Nível de Acesso</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-[#180d31] border border-purple-800/60 rounded-xl px-3 py-2 text-white font-medium focus:outline-hidden focus:border-purple-400"
                >
                  <option value="Vendedor">Vendedor (PDV & Orçamentos)</option>
                  <option value="Consultor">Consultor (Vendas & Atendimento)</option>
                  <option value="Gerente">Gerente (Metas, Estoque & Caixa)</option>
                  <option value="Administrador">Administrador (Acesso Total & Gestão de Equipe)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-purple-200 font-bold mb-1">Filial / Loja</label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full bg-[#180d31] border border-purple-800/60 rounded-xl px-3 py-2 text-white font-medium focus:outline-hidden focus:border-purple-400"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-purple-200 font-bold mb-1">Comissão de Vendas (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  className="w-full bg-[#180d31] border border-purple-800/60 rounded-xl px-3 py-2 text-white font-medium focus:outline-hidden focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-purple-200 font-bold mb-1">Meta Mensal (Aparelhos)</label>
                <input
                  type="number"
                  value={monthlySalesGoal}
                  onChange={(e) => setMonthlySalesGoal(e.target.value)}
                  className="w-full bg-[#180d31] border border-purple-800/60 rounded-xl px-3 py-2 text-white font-medium focus:outline-hidden focus:border-purple-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-purple-900/40">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="px-4 py-2 rounded-xl font-bold text-purple-300 hover:text-white bg-purple-950/60 hover:bg-purple-900/60 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-500 transition shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer"
              >
                <Shield className="w-4 h-4" />
                <span>Salvar & Criar Acesso</span>
              </button>
            </div>
          </form>
        )}

        {/* Footer info */}
        <div className="pt-3 border-t border-purple-900/40 text-[11px] text-purple-300/70 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            Contas protegidas com criptografia de ponta a ponta SINISTRON.IA
          </span>
          <button
            onClick={onClose}
            className="text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
          >
            Fechar Janela
          </button>
        </div>

      </div>

      {/* Modal interno de confirmação para Administrador desligar colaborador */}
      {confirmDeleteSeller && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#120824] border border-rose-500/50 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-purple-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-950/80 border border-rose-500/50 flex items-center justify-center text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Desligar Colaborador</h3>
                <p className="text-xs text-rose-300">Ação restrita ao Administrador</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#180d31] border border-purple-500/30 text-xs space-y-1">
              <p className="text-white font-bold text-sm">{confirmDeleteSeller.name}</p>
              <p className="text-purple-300/80">Cargo: <span className="text-white font-semibold">{confirmDeleteSeller.role}</span></p>
              <p className="text-purple-300/80">E-mail: <span className="text-white font-semibold">{confirmDeleteSeller.email || 'Não informado'}</span></p>
            </div>

            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/40 text-xs text-rose-200/90 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>
                Tem certeza que deseja revogar o acesso e tirar este colaborador da equipe? Esta ação é definitiva para o cadastro de logins.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteSeller(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-purple-300 hover:text-white bg-purple-950/50 border border-purple-800/50 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition shadow-[0_0_15px_rgba(225,29,72,0.4)] flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Confirmar Desligamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
