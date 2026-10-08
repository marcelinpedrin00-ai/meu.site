import React, { useState, useEffect, useCallback } from 'react';
import {
  Lock,
  LogOut,
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Bell,
  Shield,
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  Plus,
  Edit3,
  Power,
  Search,
  RefreshCw,
  ArrowLeft,
  X,
  Upload,
  KeyRound,
  AlertTriangle,
} from 'lucide-react';
import {
  AdminDashboardData,
  CategorySlug,
  Order,
  OrderStatus,
  Product,
} from '../types';
import { formatKz } from './PurchaseModal';
import { getStatusMeta } from './OrderTrackModal';

interface AdminPanelProps {
  onBackToStore: () => void;
  onStoreUpdated: () => void;
}

const PRESET_IMAGES = [
  {
    label: 'Diamantes Free Fire',
    url: '/src/assets/images/product_diamonds_pack_1791402094650.jpg',
  },
  {
    label: 'Caixa Airdrop Especial',
    url: '/src/assets/images/product_airdrop_crate_1791402112740.jpg',
  },
  {
    label: 'Passe de Nível / Elite',
    url: '/src/assets/images/product_level_pass_1791402124233.jpg',
  },
  {
    label: 'Pacote Robux / Roblox',
    url: '/src/assets/images/product_robux_pack_1791402134408.jpg',
  },
];

const ALL_STATUSES: OrderStatus[] = [
  'Pendente',
  'Em análise',
  'Pago',
  'Em processamento',
  'Concluído',
  'Cancelado',
];

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBackToStore, onStoreUpdated }) => {
  const [token, setToken] = useState<string | null>(() =>
    sessionStorage.getItem('vicy_admin_token')
  );
  const [loginCode, setLoginCode] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'orders' | 'products' | 'customers' | 'security'
  >('dashboard');

  // Filters for Orders
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('todos');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [proofModalOrder, setProofModalOrder] = useState<Order | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    order: Order;
    targetStatus: OrderStatus;
    title: string;
  } | null>(null);

  // Product Form Modal
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('todas');

  // Change Admin Code state
  const [currentCodeInput, setCurrentCodeInput] = useState('');
  const [newCodeInput, setNewCodeInput] = useState('');
  const [adminNameInput, setAdminNameInput] = useState('Vicente (ADM)');
  const [codeMessage, setCodeMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );

  const fetchDashboard = useCallback(
    async (authToken: string) => {
      setLoadingData(true);
      try {
        const res = await fetch('/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (res.status === 401) {
          sessionStorage.removeItem('vicy_admin_token');
          setToken(null);
          setDashboard(null);
          return;
        }
        const data = await res.json();
        setDashboard(data);
        if (data?.adminProfile?.username) {
          setAdminNameInput(data.adminProfile.username);
        }
      } catch {
        // Keep existing state on transient error
      } finally {
        setLoadingData(false);
      }
    },
    []
  );

  useEffect(() => {
    if (token) {
      fetchDashboard(token);
    }
  }, [token, fetchDashboard]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: loginCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || 'Código ADM inválido.');
      } else {
        sessionStorage.setItem('vicy_admin_token', data.token);
        setToken(data.token);
        setLoginCode('');
      }
    } catch {
      setLoginError('Erro de comunicação com o servidor.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    if (token) {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    sessionStorage.removeItem('vicy_admin_token');
    setToken(null);
    setDashboard(null);
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus, note?: string) => {
    if (!token) return;
    const res = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status, note }),
    });
    if (res.ok) {
      const updated = await res.json();
      setDashboard(updated);
      setConfirmAction(null);
      if (selectedOrder && selectedOrder.id === orderId) {
        const refreshed = updated.orders.find((o: Order) => o.id === orderId);
        setSelectedOrder(refreshed || null);
      }
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingProduct) return;

    const url = isNewProduct
      ? '/api/admin/products'
      : `/api/admin/products/${editingProduct.id}`;
    const method = isNewProduct ? 'POST' : 'PUT';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(editingProduct),
    });

    if (res.ok) {
      const updated = await res.json();
      setDashboard(updated);
      setEditingProduct(null);
      onStoreUpdated();
    }
  };

  const handleToggleProductActive = async (prod: Product) => {
    if (!token) return;
    const res = await fetch(`/api/admin/products/${prod.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ active: !prod.active }),
    });
    if (res.ok) {
      const updated = await res.json();
      setDashboard(updated);
      onStoreUpdated();
    }
  };

  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditingProduct({ ...editingProduct, image: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleMarkNotificationsRead = async () => {
    if (!token) return;
    const res = await fetch('/api/admin/notifications/read', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const updated = await res.json();
      setDashboard(updated);
    }
  };

  const handleChangeAdminCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setCodeMessage(null);
    const res = await fetch('/api/admin/change-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentCode: currentCodeInput,
        newCode: newCodeInput,
        adminName: adminNameInput,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setCodeMessage({ type: 'err', text: data.error || 'Erro ao alterar código.' });
    } else {
      setCodeMessage({ type: 'ok', text: data.message });
      setCurrentCodeInput('');
      setNewCodeInput('');
      fetchDashboard(token);
    }
  };

  // =========================================================
  // LOGIN VIEW (IF NOT AUTHENTICATED)
  // =========================================================
  if (!token) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-[#0A0E17] border border-[#0066FF]/40 shadow-[0_0_50px_rgba(0,102,255,0.2)] p-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onBackToStore}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar à Loja</span>
            </button>
            <span className="text-xs font-mono-tabular text-[#00A8FF]">ACESSO RESTRITO</span>
          </div>

          <div className="w-12 h-12 rounded-xl bg-[#0066FF]/15 border border-[#00A8FF]/40 flex items-center justify-center text-[#00A8FF] mb-4">
            <Lock className="w-6 h-6" />
          </div>

          <h1 className="text-2xl font-bold font-display text-white">Painel ADM · VICY SHOP</h1>
          <p className="text-xs text-slate-400 mt-1 mb-6">
            Autenticação segura validada no servidor. Insira o código administrativo autorizado.
          </p>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Código de Acesso ADM
              </label>
              <input
                type="password"
                required
                value={loginCode}
                onChange={(e) => setLoginCode(e.target.value)}
                placeholder="Digite o código ADM..."
                className="w-full px-4 py-3 rounded-xl bg-[#050811] border border-white/15 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00A8FF]"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 px-6 rounded-xl bg-[#0066FF] hover:bg-[#00A8FF] text-white font-semibold text-sm transition-colors shadow-[0_0_25px_rgba(0,102,255,0.4)] cursor-pointer"
            >
              {loginLoading ? 'A VERIFICAR NO SERVIDOR...' : 'ENTRAR NO PAINEL ADM'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <RefreshCw className="w-5 h-5 text-[#00A8FF] animate-spin" />
          <span>A carregar dados administrativos da VICY SHOP...</span>
        </div>
      </div>
    );
  }

  const unreadNotifications = dashboard.notifications.filter((n) => !n.read);
  const filteredOrders = dashboard.orders.filter((o) => {
    const matchesStatus =
      orderStatusFilter === 'todos' || o.status === orderStatusFilter;
    const q = orderSearch.trim().toLowerCase();
    if (!q) return matchesStatus;
    return (
      matchesStatus &&
      (o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.freeFireId.toLowerCase().includes(q) ||
        o.nickname.toLowerCase().includes(q) ||
        o.phone.toLowerCase().includes(q) ||
        o.productName.toLowerCase().includes(q))
    );
  });

  const filteredProducts = dashboard.products.filter(
    (p) => productCategoryFilter === 'todas' || p.category === productCategoryFilter
  );

  const maxChartValue = Math.max(
    ...dashboard.chartData.map((d) => d.totalKz),
    10000
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col lg:flex-row">
      {/* Sidebar Navigation (260px on Desktop) */}
      <aside className="w-full lg:w-64 bg-[#080C14] border-b lg:border-b-0 lg:border-r border-white/10 shrink-0 flex flex-col justify-between">
        <div>
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div>
              <span className="text-lg font-extrabold tracking-tight font-display text-white">
                VICY <span className="text-[#00A8FF]">ADM</span>
              </span>
              <p className="text-xs text-slate-400 mt-0.5">{dashboard.adminProfile.username}</p>
            </div>
            <button
              onClick={onBackToStore}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-300 transition-colors cursor-pointer"
            >
              Ver Loja
            </button>
          </div>

          <nav className="p-3 flex lg:flex-col gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#0066FF] text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-[#0066FF] text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4" />
                <span>Pedidos</span>
              </div>
              {dashboard.stats.pendingOrders > 0 && (
                <span className="px-1.5 py-0.5 text-[11px] font-mono-tabular rounded bg-amber-500/20 text-amber-300">
                  {dashboard.stats.pendingOrders}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-[#0066FF] text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Produtos & Preços</span>
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'customers'
                  ? 'bg-[#0066FF] text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Clientes</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-[#0066FF] text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4" />
                <span>Notificações & Código</span>
              </div>
              {unreadNotifications.length > 0 && (
                <span className="px-1.5 py-0.5 text-[11px] font-mono-tabular rounded bg-[#00A8FF]/20 text-[#00A8FF]">
                  {unreadNotifications.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-white/10 hidden lg:block">
          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Encerrar Sessão ADM</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Admin Header */}
        <header className="px-6 py-4 bg-[#080C14] border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold font-display text-white">
              {activeTab === 'dashboard' && 'Visão Geral & Métricas'}
              {activeTab === 'orders' && 'Gerenciamento de Pedidos'}
              {activeTab === 'products' && 'Gerenciamento de Produtos & Categorias'}
              {activeTab === 'customers' && 'Base de Clientes Registados'}
              {activeTab === 'security' && 'Notificações & Segurança ADM'}
            </h2>
            <span className="text-xs text-slate-400 font-mono-tabular">
              · Pendentes: {dashboard.stats.pendingOrders}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('security')}
              className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-colors cursor-pointer"
              title="Notificações"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#00A8FF] text-[#050505] text-[10px] font-bold flex items-center justify-center font-mono-tabular">
                  {unreadNotifications.length}
                </span>
              )}
            </button>
            <button
              onClick={() => fetchDashboard(token)}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>
            <button
              onClick={handleLogout}
              className="lg:hidden px-3 py-2 rounded-xl bg-red-500/15 text-red-300 text-xs font-medium"
            >
              Sair
            </button>
          </div>
        </header>

        {/* First-Access Warning Banner if still using initial code "Vicy" */}
        {dashboard.adminProfile.mustChangeCode && (
          <div className="mx-6 mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-300">
                  RECOMENDAÇÃO DE SEGURANÇA · PRIMEIRO ACESSO
                </p>
                <p className="text-xs text-slate-300 mt-0.5">
                  Está a utilizar o código ADM inicial. Recomendamos alterar para um código
                  personalizado em Segurança ADM.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('security')}
              className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs whitespace-nowrap transition-colors cursor-pointer"
            >
              Alterar Código ADM
            </button>
          </div>
        )}

        {/* Workspace Content */}
        <main className="p-6 space-y-6 flex-1">
          {/* ========================================== */}
          {/* TAB 1: DASHBOARD */}
          {/* ========================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Primary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                <div className="p-4 rounded-xl bg-[#0A0E17] border border-white/10">
                  <p className="text-xs text-slate-400">Total de pedidos</p>
                  <p className="text-xl font-bold text-white font-mono-tabular mt-1">
                    {dashboard.stats.totalOrders}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#0A0E17] border border-[#0066FF]/40">
                  <p className="text-xs text-[#00A8FF]">Vendas totais</p>
                  <p className="text-lg font-bold text-white font-mono-tabular mt-1">
                    {formatKz(dashboard.stats.totalSalesKz)}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#0A0E17] border border-white/10">
                  <p className="text-xs text-amber-400">🟡 Pendentes</p>
                  <p className="text-xl font-bold text-white font-mono-tabular mt-1">
                    {dashboard.stats.pendingOrders}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#0A0E17] border border-white/10">
                  <p className="text-xs text-sky-400">🔵 Em análise</p>
                  <p className="text-xl font-bold text-white font-mono-tabular mt-1">
                    {dashboard.stats.inAnalysisOrders}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#0A0E17] border border-white/10">
                  <p className="text-xs text-emerald-400">🟢 Pagos</p>
                  <p className="text-xl font-bold text-white font-mono-tabular mt-1">
                    {dashboard.stats.paidOrders}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#0A0E17] border border-white/10">
                  <p className="text-xs text-emerald-300">✅ Concluídos</p>
                  <p className="text-xl font-bold text-white font-mono-tabular mt-1">
                    {dashboard.stats.completedOrders}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#0A0E17] border border-white/10">
                  <p className="text-xs text-red-400">🔴 Cancelados</p>
                  <p className="text-xl font-bold text-white font-mono-tabular mt-1">
                    {dashboard.stats.cancelledOrders}
                  </p>
                </div>
              </div>

              {/* Timeframe Sales Breakdown (Today / Week / Month) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl bg-[#0A0E17] border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Vendas de Hoje</p>
                    <p className="text-2xl font-bold text-white font-mono-tabular mt-1">
                      {formatKz(dashboard.stats.salesTodayKz)}
                    </p>
                  </div>
                  <span className="text-xs text-[#00A8FF] font-mono-tabular">24h</span>
                </div>
                <div className="p-5 rounded-xl bg-[#0A0E17] border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Vendas da Semana</p>
                    <p className="text-2xl font-bold text-white font-mono-tabular mt-1">
                      {formatKz(dashboard.stats.salesWeekKz)}
                    </p>
                  </div>
                  <span className="text-xs text-[#00A8FF] font-mono-tabular">7 dias</span>
                </div>
                <div className="p-5 rounded-xl bg-[#0A0E17] border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Vendas do Mês</p>
                    <p className="text-2xl font-bold text-white font-mono-tabular mt-1">
                      {formatKz(dashboard.stats.salesMonthKz)}
                    </p>
                  </div>
                  <span className="text-xs text-[#00A8FF] font-mono-tabular">Mensal</span>
                </div>
              </div>

              {/* Sales Chart & Recent Notifications/Logs */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 7-Day Sales Bar Chart */}
                <div className="lg:col-span-2 p-6 rounded-xl bg-[#0A0E17] border border-white/10">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-base font-bold text-white font-display">
                        Gráfico de Vendas (Últimos 7 Dias)
                      </h3>
                      <p className="text-xs text-slate-400">
                        Volume diário de pedidos em Kwanzas (KZ)
                      </p>
                    </div>
                  </div>

                  <div className="h-56 flex items-end gap-3 pt-6 border-b border-white/10 pb-3">
                    {dashboard.chartData.map((bar) => {
                      const heightPct = Math.max(
                        8,
                        Math.round((bar.totalKz / maxChartValue) * 100)
                      );
                      return (
                        <div
                          key={bar.date}
                          className="flex-1 flex flex-col items-center gap-2 h-full justify-end group"
                        >
                          <span className="text-[11px] font-mono-tabular text-slate-400 group-hover:text-[#00A8FF] transition-colors">
                            {bar.totalKz > 0 ? `${(bar.totalKz / 1000).toFixed(1)}k` : '0'}
                          </span>
                          <div
                            style={{ height: `${heightPct}%` }}
                            className={`w-full max-w-[42px] rounded-t-lg transition-all ${
                              bar.totalKz > 0
                                ? 'bg-gradient-to-t from-[#0066FF] to-[#00A8FF]'
                                : 'bg-white/10'
                            }`}
                            title={`${bar.label}: ${formatKz(bar.totalKz)} (${bar.ordersCount} pedidos)`}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-3 pt-2.5">
                    {dashboard.chartData.map((bar) => (
                      <div key={bar.date} className="flex-1 text-center">
                        <span className="text-[11px] text-slate-400 font-mono-tabular block truncate">
                          {bar.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Audit History Log */}
                <div className="p-6 rounded-xl bg-[#0A0E17] border border-white/10 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white font-display mb-1">
                      Registo de Ações ADM
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">
                      Histórico auditado de confirmações e estados
                    </p>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {dashboard.orderLogs.slice(0, 6).map((log) => (
                        <div
                          key={log.id}
                          className="p-3 rounded-lg bg-[#050811] border border-white/10 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#00A8FF] font-mono-tabular">
                              {log.orderNumber}
                            </span>
                            <span className="text-slate-400 font-mono-tabular">
                              {log.date} · {log.time}
                            </span>
                          </div>
                          <p className="text-slate-200">
                            {log.previousStatus} →{' '}
                            <span className="font-semibold text-white">{log.newStatus}</span>
                          </p>
                          <p className="text-slate-400 text-[11px]">
                            Resp: {log.adminName}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="mt-4 w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#00A8FF] transition-colors cursor-pointer"
                  >
                    Gerir Todos os Pedidos →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* TAB 2: ORDERS MANAGEMENT */}
          {/* ========================================== */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#0A0E17] p-4 rounded-xl border border-white/10">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Buscar por #VCY, cliente, ID Free Fire ou telefone..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#050811] border border-white/15 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00A8FF]"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                  {(['todos', ...ALL_STATUSES] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setOrderStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                        orderStatusFilter === st
                          ? 'bg-[#0066FF] text-white'
                          : 'bg-[#050811] text-slate-400 hover:text-white border border-white/10'
                      }`}
                    >
                      {st === 'todos' ? 'Todos' : st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-[#0A0E17] border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-[#050811] text-[11px] font-semibold text-slate-400">
                        <th className="py-3.5 px-4">ID</th>
                        <th className="py-3.5 px-4">CLIENTE / CONTA</th>
                        <th className="py-3.5 px-4">PRODUTO</th>
                        <th className="py-3.5 px-4 text-right">PREÇO</th>
                        <th className="py-3.5 px-4">PAGAMENTO</th>
                        <th className="py-3.5 px-4">DATA</th>
                        <th className="py-3.5 px-4">ESTADO</th>
                        <th className="py-3.5 px-4 text-right">AÇÕES</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 text-xs">
                      {filteredOrders.map((ord) => {
                        const st = getStatusMeta(ord.status);
                        return (
                          <tr
                            key={ord.id}
                            className="hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="py-3.5 px-4 font-bold text-[#00A8FF] font-mono-tabular whitespace-nowrap">
                              {ord.orderNumber}
                            </td>
                            <td className="py-3.5 px-4">
                              <p className="font-semibold text-white">{ord.customerName}</p>
                              <p className="text-slate-400 font-mono-tabular text-[11px]">
                                ID: {ord.freeFireId} · {ord.nickname}
                              </p>
                            </td>
                            <td className="py-3.5 px-4 text-slate-200">
                              {ord.quantity}x {ord.productName}
                            </td>
                            <td className="py-3.5 px-4 text-right font-bold text-white font-mono-tabular whitespace-nowrap">
                              {formatKz(ord.totalPriceKz)}
                            </td>
                            <td className="py-3.5 px-4 font-mono-tabular text-slate-300 whitespace-nowrap">
                              {ord.paymentMethod}
                            </td>
                            <td className="py-3.5 px-4 font-mono-tabular text-slate-400 whitespace-nowrap">
                              {ord.date} {ord.time}
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className={`font-semibold ${st.textClass}`}>{st.label}</span>
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => setSelectedOrder(ord)}
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-200 transition-colors cursor-pointer"
                                  title="Ver pedido e alterar estado"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setProofModalOrder(ord)}
                                  className="p-1.5 rounded-lg bg-[#0066FF]/15 hover:bg-[#0066FF]/30 text-[#00A8FF] transition-colors cursor-pointer"
                                  title="Ver comprovativo"
                                >
                                  <FileText className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    setConfirmAction({
                                      order: ord,
                                      targetStatus: 'Pago',
                                      title: 'Confirmar Pagamento',
                                    })
                                  }
                                  className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 transition-colors cursor-pointer"
                                  title="Confirmar pagamento"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    setConfirmAction({
                                      order: ord,
                                      targetStatus: 'Cancelado',
                                      title: 'Recusar Pagamento / Cancelar',
                                    })
                                  }
                                  className="p-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/30 text-red-400 transition-colors cursor-pointer"
                                  title="Recusar pagamento"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredOrders.length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-400">
                            Nenhum pedido encontrado para este filtro.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* TAB 3: PRODUCTS & CATEGORIES */}
          {/* ========================================== */}
          {activeTab === 'products' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0A0E17] p-4 rounded-xl border border-white/10">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {[
                    { slug: 'todas', label: 'Todas Categorias' },
                    { slug: 'diamantes', label: 'Diamantes' },
                    { slug: 'airdrop', label: 'Airdrop' },
                    { slug: 'passe_nivel', label: 'Passe de Nível' },
                    { slug: 'promocoes', label: 'Promoções' },
                    { slug: 'robux', label: 'Robux' },
                    { slug: 'outros', label: 'Outros' },
                  ].map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => setProductCategoryFilter(cat.slug)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                        productCategoryFilter === cat.slug
                          ? 'bg-[#0066FF] text-white'
                          : 'bg-[#050811] text-slate-400 hover:text-white border border-white/10'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setIsNewProduct(true);
                    setEditingProduct({
                      name: '',
                      category: 'diamantes',
                      priceKz: 1500,
                      diamondsOrRobux: '',
                      description: '',
                      image: PRESET_IMAGES[0].url,
                      stockStatus: 'Disponível',
                      active: true,
                    });
                  }}
                  className="px-4 py-2 rounded-xl bg-[#0066FF] hover:bg-[#00A8FF] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Produto</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className={`p-4 rounded-xl bg-[#0A0E17] border transition-all flex flex-col justify-between gap-4 ${
                      prod.active ? 'border-white/10' : 'border-red-500/30 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-lg object-cover bg-[#050811] border border-white/10 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] text-[#00A8FF] font-medium">
                            {prod.category.toUpperCase()}
                          </span>
                          <span className="text-[11px] text-slate-400">{prod.stockStatus}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white truncate mt-0.5">
                          {prod.name}
                        </h4>
                        <p className="text-base font-bold text-[#00A8FF] font-mono-tabular mt-1">
                          {formatKz(prod.priceKz)}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2">{prod.description}</p>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                      <button
                        onClick={() => {
                          setIsNewProduct(false);
                          setEditingProduct({ ...prod });
                        }}
                        className="flex-1 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#00A8FF]" />
                        <span>Editar Preço / Dados</span>
                      </button>
                      <button
                        onClick={() => handleToggleProductActive(prod)}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                          prod.active
                            ? 'bg-red-500/10 hover:bg-red-500/20 text-red-300'
                            : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>{prod.active ? 'Desativar' : 'Ativar'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* TAB 4: CUSTOMERS */}
          {/* ========================================== */}
          {activeTab === 'customers' && (
            <div className="rounded-xl bg-[#0A0E17] border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-[#050811] text-[11px] font-semibold text-slate-400">
                      <th className="py-3.5 px-4">NOME DO CLIENTE</th>
                      <th className="py-3.5 px-4">TELEFONE</th>
                      <th className="py-3.5 px-4">ID CONTA / NICKNAME</th>
                      <th className="py-3.5 px-4 text-right">Nº DE PEDIDOS</th>
                      <th className="py-3.5 px-4 text-right">TOTAL GASTO</th>
                      <th className="py-3.5 px-4">ÚLTIMO PEDIDO</th>
                      <th className="py-3.5 px-4">DATA DE CADASTRO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-xs">
                    {dashboard.customers.map((c) => (
                      <tr key={c.id} className="hover:bg-white/[0.02]">
                        <td className="py-3.5 px-4 font-semibold text-white">{c.name}</td>
                        <td className="py-3.5 px-4 font-mono-tabular text-slate-300">{c.phone}</td>
                        <td className="py-3.5 px-4 font-mono-tabular text-slate-400">
                          {c.freeFireId} · {c.nickname}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono-tabular font-bold text-white">
                          {c.ordersCount}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono-tabular font-bold text-[#00A8FF]">
                          {formatKz(c.totalSpentKz)}
                        </td>
                        <td className="py-3.5 px-4 font-mono-tabular text-slate-300">
                          {c.lastOrderNumber} ({c.lastOrderDate})
                        </td>
                        <td className="py-3.5 px-4 font-mono-tabular text-slate-400">
                          {c.createdAt}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* TAB 5: NOTIFICATIONS & SECURITY */}
          {/* ========================================== */}
          {activeTab === 'security' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Notifications Panel */}
              <div className="p-6 rounded-xl bg-[#0A0E17] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white font-display">
                      Notificações de Pedidos
                    </h3>
                    <p className="text-xs text-slate-400">
                      Alertas em tempo real de novos pedidos recebidos
                    </p>
                  </div>
                  {unreadNotifications.length > 0 && (
                    <button
                      onClick={handleMarkNotificationsRead}
                      className="text-xs text-[#00A8FF] hover:underline cursor-pointer"
                    >
                      Marcar todas como lidas
                    </button>
                  )}
                </div>

                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                  {dashboard.notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 rounded-xl border text-xs ${
                        n.read
                          ? 'bg-[#050811] border-white/10 text-slate-400'
                          : 'bg-[#0066FF]/10 border-[#00A8FF]/40 text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[#00A8FF]">🔔 {n.title}</span>
                        <span className="font-mono-tabular text-[11px] text-slate-400">
                          {n.createdAt}
                        </span>
                      </div>
                      <p>{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Change Admin Code Form */}
              <div className="p-6 rounded-xl bg-[#0A0E17] border border-white/10 space-y-4">
                <div className="flex items-center gap-2.5">
                  <KeyRound className="w-5 h-5 text-[#00A8FF]" />
                  <div>
                    <h3 className="text-base font-bold text-white font-display">
                      Alterar Código de Acesso ADM
                    </h3>
                    <p className="text-xs text-slate-400">
                      O código é encriptado no servidor (nunca guardado em texto puro).
                    </p>
                  </div>
                </div>

                {codeMessage && (
                  <div
                    className={`p-3 rounded-xl text-xs border ${
                      codeMessage.type === 'ok'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-red-500/10 border-red-500/30 text-red-300'
                    }`}
                  >
                    {codeMessage.text}
                  </div>
                )}

                <form onSubmit={handleChangeAdminCode} className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">
                      Nome do Administrador Responsável
                    </label>
                    <input
                      type="text"
                      value={adminNameInput}
                      onChange={(e) => setAdminNameInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#050811] border border-white/15 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">
                      Código ADM Atual *
                    </label>
                    <input
                      type="password"
                      required
                      value={currentCodeInput}
                      onChange={(e) => setCurrentCodeInput(e.target.value)}
                      placeholder="Digite o código atual..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#050811] border border-white/15 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">
                      Novo Código ADM (mín. 4 caracteres) *
                    </label>
                    <input
                      type="password"
                      required
                      value={newCodeInput}
                      onChange={(e) => setNewCodeInput(e.target.value)}
                      placeholder="Digite o novo código ADM..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#050811] border border-white/15 text-xs text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#0066FF] hover:bg-[#00A8FF] text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    ATUALIZAR CÓDIGO ADM
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ===================================================== */}
      {/* MODAL: VIEW ORDER DETAILS & CHANGE STATUS */}
      {/* ===================================================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#0A0E17] border border-[#0066FF]/40 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-xs text-[#00A8FF] font-mono-tabular">
                  {selectedOrder.orderNumber}
                </span>
                <h3 className="text-base font-bold text-white font-display">
                  Detalhes do Pedido
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs bg-[#050811] p-4 rounded-xl border border-white/10">
              <div className="flex justify-between">
                <span className="text-slate-400">Cliente:</span>
                <span className="text-white font-semibold">{selectedOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Telefone:</span>
                <span className="text-white font-mono-tabular">{selectedOrder.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ID da Conta / Nickname:</span>
                <span className="text-[#00A8FF] font-mono-tabular font-semibold">
                  {selectedOrder.freeFireId} ({selectedOrder.nickname})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Produto:</span>
                <span className="text-white">
                  {selectedOrder.quantity}x {selectedOrder.productName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Valor Total:</span>
                <span className="text-white font-bold font-mono-tabular">
                  {formatKz(selectedOrder.totalPriceKz)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Método de Pagamento:</span>
                <span className="text-white font-mono-tabular">
                  {selectedOrder.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estado Atual:</span>
                <span className="text-white font-semibold">{selectedOrder.status}</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-300 mb-2">
                🔄 Alterar Estado do Pedido:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ALL_STATUSES.map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, st)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      selectedOrder.status === st
                        ? 'bg-[#0066FF] border-[#00A8FF] text-white'
                        : 'bg-[#050811] border-white/10 text-slate-300 hover:border-white/30'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* MODAL: CONFIRM IMPORTANT ACTION */}
      {/* ===================================================== */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0A0E17] border border-white/15 p-6 space-y-4">
            <h3 className="text-base font-bold text-white font-display">
              {confirmAction.title}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Confirma alterar o estado do pedido{' '}
              <span className="text-[#00A8FF] font-mono-tabular font-bold">
                {confirmAction.order.orderNumber}
              </span>{' '}
              ({confirmAction.order.customerName} — {formatKz(confirmAction.order.totalPriceKz)})
              de <span className="font-semibold">{confirmAction.order.status}</span> para{' '}
              <span className="font-semibold text-white">{confirmAction.targetStatus}</span>? Esta
              ação será registada no histórico de auditoria.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() =>
                  handleUpdateOrderStatus(confirmAction.order.id, confirmAction.targetStatus)
                }
                className="px-4 py-2 rounded-lg bg-[#0066FF] hover:bg-[#00A8FF] text-xs font-semibold text-white cursor-pointer"
              >
                Confirmar Ação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* MODAL: VIEW PAYMENT PROOF */}
      {/* ===================================================== */}
      {proofModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#0A0E17] border border-[#0066FF]/40 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-xs text-[#00A8FF] font-mono-tabular">
                  Comprovativo · {proofModalOrder.orderNumber}
                </span>
                <h3 className="text-base font-bold text-white font-display">
                  {proofModalOrder.proofFileName || 'Comprovativo de Pagamento'}
                </h3>
              </div>
              <button
                onClick={() => setProofModalOrder(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#050811] border border-white/10 flex flex-col items-center justify-center min-h-[260px]">
              {proofModalOrder.proofDataUrl ? (
                proofModalOrder.proofMimeType === 'application/pdf' ? (
                  <div className="text-center space-y-3">
                    <FileText className="w-12 h-12 text-[#00A8FF] mx-auto" />
                    <p className="text-xs text-slate-300">{proofModalOrder.proofFileName}</p>
                    <a
                      href={proofModalOrder.proofDataUrl}
                      download={proofModalOrder.proofFileName || 'comprovativo.pdf'}
                      className="inline-block px-4 py-2 rounded-lg bg-[#0066FF] text-white text-xs font-semibold"
                    >
                      Baixar PDF do Comprovativo
                    </a>
                  </div>
                ) : (
                  <img
                    src={proofModalOrder.proofDataUrl}
                    alt="Comprovativo enviado"
                    className="max-h-96 rounded-lg object-contain"
                  />
                )
              ) : (
                <p className="text-xs text-slate-400">Nenhum comprovativo anexado.</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                Estado: <strong className="text-white">{proofModalOrder.status}</strong>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handleUpdateOrderStatus(proofModalOrder.id, 'Pago');
                    setProofModalOrder(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
                >
                  Confirmar Pagamento
                </button>
                <button
                  onClick={() => setProofModalOrder(null)}
                  className="px-4 py-2 rounded-lg bg-white/10 text-white text-xs font-semibold cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* MODAL: ADD / EDIT PRODUCT */}
      {/* ===================================================== */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-[#0A0E17] border border-[#0066FF]/40 p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white font-display">
                {isNewProduct ? 'Adicionar Novo Produto' : 'Editar Produto'}
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Nome do Produto *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, name: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#050811] border border-white/15 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Categoria *</label>
                  <select
                    value={editingProduct.category || 'diamantes'}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        category: e.target.value as CategorySlug,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#050811] border border-white/15 text-white"
                  >
                    <option value="diamantes">Diamantes</option>
                    <option value="airdrop">Airdrop</option>
                    <option value="passe_nivel">Passe de Nível</option>
                    <option value="promocoes">Promoções</option>
                    <option value="robux">Robux</option>
                    <option value="outros">Outros produtos</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Preço em Kwanzas (KZ) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editingProduct.priceKz || 0}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        priceKz: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#050811] border border-white/15 text-white font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Disponibilidade / Estoque</label>
                  <select
                    value={editingProduct.stockStatus || 'Disponível'}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        stockStatus: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#050811] border border-white/15 text-white"
                  >
                    <option value="Disponível">Disponível</option>
                    <option value="Estoque Limitado">Estoque Limitado</option>
                    <option value="Esgotado">Esgotado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">
                  Quantidade de Diamantes / Robux / Subtítulo
                </label>
                <input
                  type="text"
                  value={editingProduct.diamondsOrRobux || ''}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      diamondsOrRobux: e.target.value,
                    })
                  }
                  placeholder="Ex: 200 diamantes"
                  className="w-full px-3 py-2 rounded-lg bg-[#050811] border border-white/15 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={editingProduct.description || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#050811] border border-white/15 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5">Imagem do Produto</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() =>
                        setEditingProduct({ ...editingProduct, image: preset.url })
                      }
                      className={`p-1.5 rounded-lg border text-left transition-colors cursor-pointer ${
                        editingProduct.image === preset.url
                          ? 'border-[#00A8FF] bg-[#0066FF]/20'
                          : 'border-white/10 bg-[#050811]'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-12 object-cover rounded"
                      />
                      <span className="block text-[10px] text-slate-300 truncate mt-1">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer text-slate-300">
                  <Upload className="w-3.5 h-3.5 text-[#00A8FF]" />
                  <span>Ou carregar nova imagem do dispositivo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProductImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-lg bg-white/5 text-slate-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#0066FF] hover:bg-[#00A8FF] text-white font-semibold cursor-pointer"
                >
                  Guardar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
