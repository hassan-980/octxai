import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  CreditCard,
  Download,
  FileSpreadsheet,
  Layers,
  LifeBuoy,
  LogOut,
  Menu,
  MessageSquare,
  PhoneCall,
  Plus,
  RefreshCw,
  ScrollText,
  Search,
  Users,
  X,
} from 'lucide-react';
import {
  AdminSeller,
  AdminSubscription,
  AdminTab,
  AdminUserPayload,
  COHORT_RETENTION_ROWS,
  INITIAL_ADMIN_SELLERS,
  PLAN_CATALOG,
  REVENUE_SERIES_BY_RANGE,
  SellerAccountStatus,
  SellerPlanTier,
  TicketPriority,
  TicketStatus,
} from '../data/adminData';
import { downloadCSV, formatINR, getInitials } from '../utils/helpers';
import {
  AdminAICallMonitoringTab,
  AdminReportsExportTab,
  AdminSupportTicketsTab,
  AdminSystemLogsTab,
  AdminWhatsAppAnalyticsTab,
} from './admin/AdminOpsTabs';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  adjustSellerWallet,
  createAdminSeller,
  moderateWaTemplate,
  recordAdminExport,
  replySupportTicket,
  retryAdminAICall,
  retrySubscriptionPayment,
  setAdminActiveTab,
  setAdminRevRange,
  terminateAdminAICall,
  toggleSubscriptionCancel,
  updateSellerStatus,
  updateSubscriptionPlan,
  updateSupportTicketPriority,
  updateSupportTicketStatus,
} from '../store/slices/adminSlice';

interface AdminDashboardViewProps {
  adminUser: AdminUserPayload;
  onSignOut: () => void;
  onGoToWebsite: () => void;
  onShowToast: (msg: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  adminUser,
  onSignOut,
  onGoToWebsite,
  onShowToast,
}) => {
  const dispatch = useAppDispatch();
  const {
    activeTab,
    revRange,
    sellers,
    subscriptions,
    aiCalls,
    waUsage,
    waTemplates,
    tickets,
    logs,
    exportHistory,
  } = useAppSelector((state) => state.admin);

  const setActiveTab = (tab: AdminTab) => dispatch(setAdminActiveTab(tab));
  const setRevRange = (range: '30D' | '90D' | '12M') => dispatch(setAdminRevRange(range));

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Seller management filters & modals (UI-local)
  const [sellerSearch, setSellerSearch] = useState('');
  const [sellerStatusFilter, setSellerStatusFilter] = useState<'All' | SellerAccountStatus>('All');
  const [sellerPlanFilter, setSellerPlanFilter] = useState<'All' | SellerPlanTier>('All');
  const [sellerPage, setSellerPage] = useState(1);
  const sellersPerPage = 6;
  const [inspectedSellerId, setInspectedSellerId] = useState<string | null>(null);
  const inspectedSeller = useMemo(
    () => (inspectedSellerId ? sellers.find((s) => s.id === inspectedSellerId) ?? null : null),
    [sellers, inspectedSellerId]
  );
  const [showAddSellerModal, setShowAddSellerModal] = useState(false);
  const [newSellerForm, setNewSellerForm] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '+91 ',
    city: 'Bengaluru, KA',
    gstin: '',
    marketplace: 'Multi-Channel' as AdminSeller['marketplace'],
    plan: 'Pro Plan' as SellerPlanTier,
  });

  // Subscription management filters & modals (UI-local)
  const [subStatusFilter, setSubStatusFilter] = useState<'All' | AdminSubscription['status']>('All');
  const [editingSub, setEditingSub] = useState<AdminSubscription | null>(null);
  const [editPlanDraft, setEditPlanDraft] = useState<SellerPlanTier>('Pro Plan');
  const [editCycleDraft, setEditCycleDraft] = useState<'Monthly' | 'Annual'>('Monthly');

  // Dynamic Platform-wide KPI Computations
  const activeSellersDelta = useMemo(() => {
    const initialActive = INITIAL_ADMIN_SELLERS.filter((s) => s.status === 'Active').length;
    const currentActive = sellers.filter((s) => s.status === 'Active').length;
    return currentActive - initialActive;
  }, [sellers]);

  const totalActiveSellers = 10482 + activeSellersDelta;

  const mrrDelta = useMemo(() => {
    const baseMrr = INITIAL_ADMIN_SELLERS.reduce((sum, s) => sum + s.mrrContribution, 0);
    const currentMrr = sellers.reduce((sum, s) => sum + s.mrrContribution, 0);
    return currentMrr - baseMrr;
  }, [sellers]);

  const revSeries = REVENUE_SERIES_BY_RANGE[revRange];
  const liveMrr = revSeries.mrrTotal + mrrDelta;
  const openTicketsCount = tickets.filter((t) => t.status !== 'Resolved').length;

  // Filtered Sellers
  const filteredSellers = useMemo(() => {
    const q = sellerSearch.trim().toLowerCase();
    return sellers.filter((s) => {
      if (sellerStatusFilter !== 'All' && s.status !== sellerStatusFilter) return false;
      if (sellerPlanFilter !== 'All' && s.plan !== sellerPlanFilter) return false;
      if (!q) return true;
      return (
        s.businessName.toLowerCase().includes(q) ||
        s.ownerName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q)
      );
    });
  }, [sellers, sellerSearch, sellerStatusFilter, sellerPlanFilter]);

  const sellerTotalPages = Math.max(1, Math.ceil(filteredSellers.length / sellersPerPage));
  const paginatedSellers = filteredSellers.slice(
    (sellerPage - 1) * sellersPerPage,
    sellerPage * sellersPerPage
  );

  const filteredSubs = useMemo(() => {
    return subscriptions.filter((s) => (subStatusFilter === 'All' ? true : s.status === subStatusFilter));
  }, [subscriptions, subStatusFilter]);

  // Seller Management Handlers (Redux-dispatched)
  const handleUpdateSellerStatus = (seller: AdminSeller, nextStatus: SellerAccountStatus) => {
    dispatch(updateSellerStatus({ sellerId: seller.id, nextStatus, actor: adminUser.email }));
    onShowToast(`${seller.businessName} marked as ${nextStatus}`);
  };

  const handleAdjustSellerWallet = (seller: AdminSeller, delta: number) => {
    dispatch(adjustSellerWallet({ sellerId: seller.id, delta, actor: adminUser.email }));
    onShowToast(`Added ${formatINR(delta)} credit to ${seller.businessName}`);
  };

  const handleCreateSeller = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSellerForm.businessName.trim() || !newSellerForm.ownerName.trim() || !newSellerForm.email.trim()) {
      return;
    }
    const businessName = newSellerForm.businessName.trim();
    dispatch(
      createAdminSeller({
        businessName,
        ownerName: newSellerForm.ownerName.trim(),
        email: newSellerForm.email.trim(),
        phone: newSellerForm.phone.trim(),
        city: newSellerForm.city.trim(),
        gstin: newSellerForm.gstin.trim(),
        marketplace: newSellerForm.marketplace,
        plan: newSellerForm.plan,
        actor: adminUser.email,
      })
    );
    setShowAddSellerModal(false);
    setNewSellerForm({
      businessName: '',
      ownerName: '',
      email: '',
      phone: '+91 ',
      city: 'Bengaluru, KA',
      gstin: '',
      marketplace: 'Multi-Channel',
      plan: 'Pro Plan',
    });
    onShowToast(`Seller ${businessName} provisioned successfully`);
  };

  // Subscription Management Handlers (Redux-dispatched)
  const handleSaveSubscriptionEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSub) return;
    dispatch(
      updateSubscriptionPlan({
        subId: editingSub.id,
        plan: editPlanDraft,
        billingCycle: editCycleDraft,
        actor: adminUser.email,
      })
    );
    const name = editingSub.businessName;
    setEditingSub(null);
    onShowToast(`Updated ${name} to ${editPlanDraft}`);
  };

  const handleRetryPayment = (sub: AdminSubscription) => {
    dispatch(retrySubscriptionPayment({ subId: sub.id, actor: adminUser.email }));
    onShowToast(`Payment captured for ${sub.businessName} — subscription active`);
  };

  const handleToggleSubCancel = (sub: AdminSubscription) => {
    const nextStatus = sub.status === 'Cancelled' ? 'Active' : 'Cancelled';
    dispatch(toggleSubscriptionCancel({ subId: sub.id, actor: adminUser.email }));
    onShowToast(`${sub.businessName} subscription ${nextStatus.toLowerCase()}`);
  };

  // Ops Tab Handlers (Redux-dispatched)
  const handleRetryAICall = (callId: string) => {
    dispatch(retryAdminAICall({ callId, actor: adminUser.email }));
    onShowToast(`Call ${callId} completed via Exotel failover`);
  };

  const handleTerminateAICall = (callId: string) => {
    dispatch(terminateAdminAICall({ callId, actor: adminUser.email }));
    onShowToast(`Live channel ${callId} closed`);
  };

  const handleModerateTemplate = (id: string, decision: 'Approved' | 'Rejected') => {
    const target = waTemplates.find((t) => t.id === id);
    dispatch(moderateWaTemplate({ id, decision, actor: adminUser.email }));
    onShowToast(`Template ${target?.templateName ?? id} ${decision.toLowerCase()}`);
  };

  const handleReplyTicket = (ticketId: string, text: string) => {
    dispatch(replySupportTicket({ ticketId, text, sender: adminUser.fullName, actor: adminUser.email }));
    onShowToast(`Reply sent on ${ticketId}`);
  };

  const handleUpdateTicketStatus = (ticketId: string, status: TicketStatus) => {
    dispatch(updateSupportTicketStatus({ ticketId, status, actor: adminUser.email }));
    onShowToast(`Ticket ${ticketId} marked ${status}`);
  };

  const handleUpdateTicketPriority = (ticketId: string, priority: TicketPriority) => {
    dispatch(updateSupportTicketPriority({ ticketId, priority }));
    onShowToast(`Ticket ${ticketId} priority set to ${priority}`);
  };

  const handleRecordExport = (
    reportName: string,
    format: 'CSV' | 'JSON',
    dateRange: string,
    rowCount: number
  ) => {
    dispatch(
      recordAdminExport({
        reportName,
        format,
        dateRange,
        rowCount,
        generatedBy: adminUser.fullName,
        actor: adminUser.email,
      })
    );
    onShowToast(`Downloaded ${reportName} (${format})`);
  };

  const handleQuickExportLogs = () => {
    downloadCSV(
      'octxai_system_logs.csv',
      ['Log ID', 'Timestamp', 'Severity', 'Service', 'Actor', 'Event', 'IP', 'Message'],
      logs.map((l) => [l.id, l.timestamp, l.severity, l.service, l.actor, l.event, l.ipAddress, l.message])
    );
    handleRecordExport('Security & System Audit Logs', 'CSV', 'Live Stream', logs.length);
  };

  const navItems: { id: AdminTab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'revenue', label: 'Revenue Dashboard', icon: BarChart3 },
    { id: 'sellers', label: 'Seller Management', icon: Users, count: sellers.length },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'ai-calls', label: 'AI Call Monitoring', icon: PhoneCall },
    { id: 'whatsapp', label: 'WhatsApp Analytics', icon: MessageSquare },
    { id: 'tickets', label: 'Support Tickets', icon: LifeBuoy, count: openTicketsCount },
    { id: 'logs', label: 'System Logs', icon: ScrollText },
    { id: 'reports', label: 'Reports Export', icon: FileSpreadsheet },
  ];

  const tabMeta: Record<AdminTab, { title: string; subtitle: string }> = {
    revenue: {
      title: 'Revenue & Platform Analytics',
      subtitle: 'Monthly recurring revenue, active sellers, AI voice throughput, retention cohorts & churn rate',
    },
    sellers: {
      title: 'Seller Management',
      subtitle: 'Onboard marketplace merchants, review KYC status, adjust prepaid wallets & manage account access',
    },
    subscriptions: {
      title: 'Subscription Management',
      subtitle: 'Manage Starter, Pro Plan & Enterprise billing cycles, seat quotas, and failed dunning retries',
    },
    'ai-calls': {
      title: 'AI Call Monitoring',
      subtitle: 'Live platform telephony trunks, concurrent voice agents, call transcripts & carrier failover',
    },
    whatsapp: {
      title: 'WhatsApp Usage Analytics',
      subtitle: 'Meta Cloud API conversation volume, delivery rates, top seller credit burn & template compliance',
    },
    tickets: {
      title: 'Support Tickets',
      subtitle: 'Prioritized merchant escalations, SLA response timers & live admin ticket threads',
    },
    logs: {
      title: 'System Logs',
      subtitle: 'Security audit trail, OTP verifications, billing webhooks, carrier alerts & admin actions',
    },
    reports: {
      title: 'Reports Export',
      subtitle: 'Generate CSV and JSON compliance exports across revenue, sellers, calls, WhatsApp & logs',
    },
  };

  // Build SVG path points for MRR chart
  const mrrPoints = useMemo(() => {
    const vals = revSeries.mrrLakhs;
    const min = Math.min(...vals) * 0.9;
    const max = Math.max(...vals) * 1.05;
    return vals.map((v, i) => {
      const x = (i / Math.max(vals.length - 1, 1)) * 560 + 20;
      const y = 165 - ((v - min) / Math.max(max - min, 1)) * 135;
      return { x, y, val: v, label: revSeries.labels[i] };
    });
  }, [revSeries]);

  const mrrLinePath = mrrPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
  const mrrAreaPath = `${mrrLinePath} L ${mrrPoints[mrrPoints.length - 1].x},180 L ${mrrPoints[0].x},180 Z`;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F2F4F8]">
      {/* Mobile Sticky Top Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200/80 sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open admin navigation"
            className="p-2 rounded-xl bg-[#F2F4F8] text-slate-700"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white">
            <Layers className="w-4 h-4" />
          </div>
          <span className="font-display font-semibold text-[15.5px] text-slate-900">octxAI Admin</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-900 text-white text-[11.5px] font-semibold flex items-center justify-center">
          {getInitials(adminUser.fullName)}
        </div>
      </div>

      {/* Left Admin Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 px-4 py-6 flex flex-col justify-between overflow-y-auto overscroll-contain transform lg:translate-x-0 lg:sticky lg:inset-auto lg:top-0 lg:h-screen lg:self-start transition-transform duration-200 ease-in-out shrink-0 select-none ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="flex items-center justify-between px-3 mb-7">
            <button
              type="button"
              onClick={() => {
                setActiveTab('revenue');
                setMobileSidebarOpen(false);
              }}
              className="flex items-center gap-2.5 text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <span className="font-display font-semibold text-[16.5px] tracking-tight text-slate-900">
                octxAI Admin
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileSidebarOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-[#F2F4F8] hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <Icon className="w-[17px] h-[17px] shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {typeof item.count === 'number' && (
                    <span
                      className={`text-[11.5px] font-mono tabular-nums ${
                        isActive ? 'text-slate-300' : 'text-slate-400'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Website Switch + Admin Profile */}
        <div className="space-y-2.5 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={onGoToWebsite}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-[13px] font-medium text-slate-600 hover:bg-[#F2F4F8] hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to octxAI Site</span>
          </button>
          <button
            type="button"
            onClick={onSignOut}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-[13px] font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>

          <div className="mt-2 p-3 rounded-xl bg-[#F2F4F8] flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-display font-semibold text-[12.5px] flex items-center justify-center shrink-0">
              {getInitials(adminUser.fullName)}
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-semibold text-slate-900 truncate">{adminUser.fullName}</div>
              <div className="text-[11.5px] text-slate-500 truncate">{adminUser.role}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/25 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* Main Content Workspace */}
      <main className="flex-1 min-w-0 px-4 sm:px-8 py-6 max-w-[1440px] w-full mx-auto">
        {/* Top Workspace Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="text-[12px] font-medium text-slate-500 mb-0.5">
              Admin Console / {navItems.find((n) => n.id === activeTab)?.label}
            </div>
            <h1 className="font-display text-[22px] sm:text-[24px] font-semibold text-slate-900 tracking-tight">
              {tabMeta[activeTab].title}
            </h1>
            <p className="text-[13px] text-slate-500 mt-0.5">{tabMeta[activeTab].subtitle}</p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('reports')}
              className="h-9 sm:h-10 px-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 text-[12.5px] sm:text-[13px] font-medium transition flex items-center gap-1.5 whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Center</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAddSellerModal(true)}
              className="h-9 sm:h-10 px-3.5 sm:px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[12.5px] sm:text-[13px] font-medium shadow-xs transition flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add Seller</span>
            </button>
          </div>
        </header>

        {/* ====================================================================
            TAB 1: REVENUE DASHBOARD & CORE ANALYTICS
        ==================================================================== */}
        {activeTab === 'revenue' && (
          <section className="view-section space-y-5">
            {/* 5 Core Required Analytics Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/70">
                <div className="text-[12.5px] font-medium text-slate-500">Monthly Recurring Revenue</div>
                <div className="mt-2 font-display text-[22px] sm:text-[26px] font-semibold text-slate-900 tabular-nums metric-tracking">
                  {formatINR(liveMrr)}
                </div>
                <div className="mt-1.5 text-[12px] text-emerald-700 font-medium tabular-nums">
                  {revSeries.mrrGrowth} · ARR {formatINR(liveMrr * 12)}
                </div>
              </div>

              <div
                onClick={() => setActiveTab('sellers')}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/70 cursor-pointer hover:border-slate-300 transition"
              >
                <div className="text-[12.5px] font-medium text-slate-500">Total Active Sellers</div>
                <div className="mt-2 font-display text-[22px] sm:text-[26px] font-semibold text-slate-900 tabular-nums metric-tracking">
                  {totalActiveSellers.toLocaleString('en-IN')}
                </div>
                <div className="mt-1.5 text-[12px] text-emerald-700 font-medium">+418 net new this month</div>
              </div>

              <div
                onClick={() => setActiveTab('ai-calls')}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/70 cursor-pointer hover:border-slate-300 transition"
              >
                <div className="text-[12.5px] font-medium text-slate-500">Total AI Calls</div>
                <div className="mt-2 font-display text-[22px] sm:text-[26px] font-semibold text-slate-900 tabular-nums metric-tracking">
                  54,28,910
                </div>
                <div className="mt-1.5 text-[12px] text-slate-500 tabular-nums">
                  83.9% answered · ₹1.54 avg cost
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/70">
                <div className="text-[12.5px] font-medium text-slate-500">Customer Retention</div>
                <div className="mt-2 font-display text-[22px] sm:text-[26px] font-semibold text-emerald-700 tabular-nums metric-tracking">
                  {revSeries.avgRetention.toFixed(1)}%
                </div>
                <div className="mt-1.5 text-[12px] text-slate-500 tabular-nums">
                  NRR 115.8% · +0.6% QoQ
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/70 col-span-2 md:col-span-1">
                <div className="text-[12.5px] font-medium text-slate-500">Churn Rate</div>
                <div className="mt-2 font-display text-[22px] sm:text-[26px] font-semibold text-rose-600 tabular-nums metric-tracking">
                  {revSeries.avgChurn.toFixed(1)}%
                </div>
                <div className="mt-1.5 text-[12px] text-slate-500 tabular-nums">
                  1.9% voluntary · 1.3% card fail
                </div>
              </div>
            </div>

            {/* MRR Trend Chart + Plan Revenue Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-8 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/70">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="font-display font-semibold text-[16px] text-slate-900">
                      MRR Trajectory &amp; Churn Compression
                    </h2>
                    <p className="text-[12.5px] text-slate-500">
                      Net recurring subscription revenue in ₹ Lakhs ({revRange})
                    </p>
                  </div>
                  <div className="flex items-center gap-1 p-1 bg-[#F2F4F8] rounded-xl text-[12px] font-medium">
                    {(['30D', '90D', '12M'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRevRange(r)}
                        className={`px-3 py-1 rounded-lg transition ${
                          revRange === r ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="w-full overflow-x-auto">
                  <svg viewBox="0 0 600 210" className="w-full h-52 min-w-[420px]">
                    <defs>
                      <linearGradient id="adminMrrGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563EB" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {[40, 85, 130, 175].map((y) => (
                      <line key={y} x1="20" y1={y} x2="580" y2={y} stroke="#E2E8F0" strokeDasharray="3 3" />
                    ))}
                    <path d={mrrAreaPath} fill="url(#adminMrrGrad)" />
                    <path d={mrrLinePath} fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    {mrrPoints.map((pt, idx) => (
                      <g key={idx}>
                        <circle cx={pt.x} cy={pt.y} r="4.5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2.5" />
                        <text
                          x={pt.x}
                          y={pt.y - 11}
                          textAnchor="middle"
                          className="fill-slate-700 text-[11px] font-semibold"
                        >
                          ₹{pt.val}L
                        </text>
                        <text
                          x={pt.x}
                          y="198"
                          textAnchor="middle"
                          className="fill-slate-400 text-[11px]"
                        >
                          {pt.label}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>

              {/* Plan Tier Revenue Breakdown */}
              <div className="lg:col-span-4 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/70 flex flex-col justify-between">
                <div>
                  <h2 className="font-display font-semibold text-[16px] text-slate-900">
                    MRR by Subscription Tier
                  </h2>
                  <p className="text-[12.5px] text-slate-500 mt-0.5">
                    Active revenue distribution across seller segments
                  </p>

                  <div className="mt-5 space-y-4">
                    {[
                      { tier: 'Enterprise', sellersCount: '112 sellers', mrr: '₹27,99,888', share: 57, color: 'bg-slate-900' },
                      { tier: 'Pro Plan', sellersCount: '204 sellers', mrr: '₹16,31,796', share: 34, color: 'bg-[#2563EB]' },
                      { tier: 'Starter', sellersCount: '174 sellers', mrr: '₹4,33,516', share: 9, color: 'bg-emerald-500' },
                    ].map((row) => (
                      <div key={row.tier}>
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="font-semibold text-slate-900">{row.tier}</span>
                          <span className="font-mono font-semibold text-slate-900 tabular-nums">{row.mrr}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11.5px] text-slate-500 mt-0.5 mb-1.5">
                          <span>{row.sellersCount}</span>
                          <span className="tabular-nums">{row.share}% of MRR</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div className={`h-full rounded-full ${row.color}`} style={{ width: `${row.share}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('subscriptions')}
                  className="mt-6 w-full py-2.5 rounded-xl bg-[#F2F4F8] hover:bg-slate-200/80 text-slate-800 text-[13px] font-medium transition flex items-center justify-center gap-1.5"
                >
                  <span>Manage Subscriptions</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Cohort Retention & Churn Table */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/70">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <h2 className="font-display font-semibold text-[15.5px] text-slate-900">
                    Seller Cohort Retention &amp; Net Revenue Retention
                  </h2>
                  <p className="text-[12.5px] text-slate-500">
                    Monthly logo retention across newly acquired merchant cohorts
                  </p>
                </div>
                <span className="text-[12px] text-slate-500 tabular-nums">
                  Avg 90-day retention: <strong className="text-slate-900">96.8%</strong>
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead>
                    <tr className="border-b border-slate-200/80 text-[12px] font-semibold text-slate-500">
                      <th className="py-2.5 pr-4">Signup Cohort</th>
                      <th className="py-2.5 px-3 text-right">New Sellers</th>
                      <th className="py-2.5 px-3 text-right">Month 1</th>
                      <th className="py-2.5 px-3 text-right">Month 2</th>
                      <th className="py-2.5 px-3 text-right">Month 3</th>
                      <th className="py-2.5 px-3 text-right">Month 6</th>
                      <th className="py-2.5 pl-3 text-right">Net Dollar Retention</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 tabular-nums font-mono">
                    {COHORT_RETENTION_ROWS.map((row) => (
                      <tr key={row.cohort} className="hover:bg-[#F8FAFC]">
                        <td className="py-3 pr-4 font-sans font-medium text-slate-900">{row.cohort}</td>
                        <td className="py-3 px-3 text-right text-slate-700">{row.sellers.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-3 text-right text-emerald-700 font-medium">{row.m1.toFixed(1)}%</td>
                        <td className="py-3 px-3 text-right text-slate-700">{row.m2 ? `${row.m2.toFixed(1)}%` : '—'}</td>
                        <td className="py-3 px-3 text-right text-slate-700">{row.m3 ? `${row.m3.toFixed(1)}%` : '—'}</td>
                        <td className="py-3 px-3 text-right text-slate-700">{row.m6 ? `${row.m6.toFixed(1)}%` : '—'}</td>
                        <td className="py-3 pl-3 text-right text-[#2563EB] font-semibold">{row.nrr}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ====================================================================
            TAB 2: SELLER MANAGEMENT
        ==================================================================== */}
        {activeTab === 'sellers' && (
          <section className="view-section space-y-5">
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/70">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="relative flex-1 min-w-[210px] max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={sellerSearch}
                    onChange={(e) => {
                      setSellerSearch(e.target.value);
                      setSellerPage(1);
                    }}
                    placeholder="Search store, owner, email, city..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F2F4F8] text-[13px] text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={sellerPlanFilter}
                    onChange={(e) => {
                      setSellerPlanFilter(e.target.value as 'All' | SellerPlanTier);
                      setSellerPage(1);
                    }}
                    className="px-3 py-2 rounded-xl bg-[#F2F4F8] text-[12.5px] font-medium text-slate-700 focus:outline-none"
                  >
                    <option value="All">All Plans</option>
                    <option value="Starter">Starter</option>
                    <option value="Pro Plan">Pro Plan</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>

                  <div className="flex items-center gap-1 p-1 bg-[#F2F4F8] rounded-xl text-[12px] font-medium">
                    {(['All', 'Active', 'Pending KYC', 'Suspended'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          setSellerStatusFilter(st);
                          setSellerPage(1);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg transition whitespace-nowrap ${
                          sellerStatusFilter === st
                            ? 'bg-white text-slate-900 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead>
                    <tr className="border-b border-slate-200/80 text-[12px] font-semibold text-slate-500">
                      <th className="py-2.5 pr-4">Seller &amp; Owner</th>
                      <th className="py-2.5 px-3">Plan &amp; Channel</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Monthly AI Calls</th>
                      <th className="py-2.5 px-3 text-right">Wallet</th>
                      <th className="py-2.5 pl-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedSellers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-slate-500">
                          No sellers match the current search or filters.
                        </td>
                      </tr>
                    ) : (
                      paginatedSellers.map((seller) => (
                        <tr key={seller.id} className="hover:bg-[#F8FAFC] transition-colors">
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#2563EB] font-display font-semibold text-[11.5px] flex items-center justify-center shrink-0">
                                {getInitials(seller.ownerName)}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-900 truncate">{seller.businessName}</div>
                                <div className="text-[11.5px] text-slate-500 truncate">
                                  {seller.ownerName} · {seller.city}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-medium text-slate-800">{seller.plan}</div>
                            <div className="text-[11.5px] text-slate-500">{seller.marketplace}</div>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`text-[12.5px] font-semibold ${
                                seller.status === 'Active'
                                  ? 'text-emerald-700'
                                  : seller.status === 'Suspended'
                                    ? 'text-rose-600'
                                    : 'text-amber-700'
                              }`}
                            >
                              {seller.status}
                            </span>
                            <div className="text-[11px] text-slate-400">Active {seller.lastActive}</div>
                          </td>
                          <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800">
                            {seller.aiCallsThisMonth.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3 text-right font-mono tabular-nums font-medium text-slate-900">
                            {formatINR(seller.walletBalance, true)}
                          </td>
                          <td className="py-3 pl-3 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setInspectedSellerId(seller.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-[#F2F4F8] hover:bg-slate-200 text-slate-700 text-[12px] font-medium transition"
                              >
                                Inspect
                              </button>
                              {seller.status === 'Pending KYC' ? (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSellerStatus(seller, 'Active')}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-medium transition"
                                >
                                  Approve KYC
                                </button>
                              ) : seller.status === 'Active' ? (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSellerStatus(seller, 'Suspended')}
                                  className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[12px] font-medium transition"
                                >
                                  Suspend
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSellerStatus(seller, 'Active')}
                                  className="px-2.5 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[12px] font-medium transition"
                                >
                                  Reactivate
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-[12.5px] text-slate-500">
                <span className="tabular-nums">
                  Showing {paginatedSellers.length} of {filteredSellers.length} sellers
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={sellerPage <= 1}
                    onClick={() => setSellerPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg bg-[#F2F4F8] hover:bg-slate-200 text-slate-700 font-medium disabled:opacity-40 transition"
                  >
                    Previous
                  </button>
                  <span className="px-2 font-mono text-slate-700 tabular-nums">
                    {sellerPage} / {sellerTotalPages}
                  </span>
                  <button
                    type="button"
                    disabled={sellerPage >= sellerTotalPages}
                    onClick={() => setSellerPage((p) => Math.min(sellerTotalPages, p + 1))}
                    className="px-3 py-1.5 rounded-lg bg-[#F2F4F8] hover:bg-slate-200 text-slate-700 font-medium disabled:opacity-40 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ====================================================================
            TAB 3: SUBSCRIPTION MANAGEMENT
        ==================================================================== */}
        {activeTab === 'subscriptions' && (
          <section className="view-section space-y-5">
            {/* Plan Pricing & Quota Catalog */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              {(Object.keys(PLAN_CATALOG) as SellerPlanTier[]).map((tier) => {
                const spec = PLAN_CATALOG[tier];
                const subscriberCount = subscriptions.filter((s) => s.plan === tier && s.status !== 'Cancelled').length;
                return (
                  <div key={tier} className="bg-white rounded-2xl p-5 border border-slate-200/70">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-display font-semibold text-[16px] text-slate-900">{tier}</h3>
                      <span className="text-[12px] text-slate-500 tabular-nums">{subscriberCount} active in ledger</span>
                    </div>
                    <p className="text-[12.5px] text-slate-500 mt-1">{spec.audience}</p>
                    <div className="mt-4 font-display text-[24px] font-semibold text-slate-900 tabular-nums">
                      {formatINR(spec.monthlyPrice)}
                      <span className="text-[12.5px] font-normal text-slate-400"> / mo</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-[12.5px] text-slate-600 tabular-nums">
                      <div className="flex justify-between">
                        <span>AI Voice Quota</span>
                        <strong className="text-slate-900">{spec.aiCallsLimit.toLocaleString('en-IN')} / mo</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>WhatsApp Credits</span>
                        <strong className="text-slate-900">{spec.waCreditsLimit.toLocaleString('en-IN')} / mo</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Annual Billing</span>
                        <strong className="text-slate-900">{formatINR(spec.annualPrice)} / yr</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Subscriptions Ledger */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/70">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="font-display font-semibold text-[15.5px] text-slate-900">
                    Seller Subscriptions &amp; Billing Health
                  </h2>
                  <p className="text-[12.5px] text-slate-500">
                    Modify plan tiers, monitor quota utilization, or retry past-due invoices
                  </p>
                </div>

                <div className="flex items-center gap-1 p-1 bg-[#F2F4F8] rounded-xl text-[12px] font-medium">
                  {(['All', 'Active', 'Trialing', 'Past Due', 'Cancelled'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSubStatusFilter(st)}
                      className={`px-2.5 py-1.5 rounded-lg transition whitespace-nowrap ${
                        subStatusFilter === st ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead>
                    <tr className="border-b border-slate-200/80 text-[12px] font-semibold text-slate-500">
                      <th className="py-2.5 pr-4">Subscription / Seller</th>
                      <th className="py-2.5 px-3">Plan &amp; Cycle</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">AI Quota Usage</th>
                      <th className="py-2.5 px-3 text-right">Billed</th>
                      <th className="py-2.5 pl-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSubs.map((sub) => {
                      const pct = Math.min(100, Math.round((sub.aiQuotaUsed / Math.max(sub.aiQuotaLimit, 1)) * 100));
                      return (
                        <tr key={sub.id} className="hover:bg-[#F8FAFC] transition-colors">
                          <td className="py-3 pr-4">
                            <div className="font-semibold text-slate-900">{sub.businessName}</div>
                            <div className="text-[11.5px] text-slate-500 font-mono">
                              {sub.id} · {sub.paymentMethod}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-medium text-slate-900">{sub.plan}</div>
                            <div className="text-[11.5px] text-slate-500">
                              {sub.billingCycle} · Renews {sub.renewalDate}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`text-[12.5px] font-semibold ${
                                sub.status === 'Active'
                                  ? 'text-emerald-700'
                                  : sub.status === 'Past Due'
                                    ? 'text-rose-600'
                                    : sub.status === 'Trialing'
                                      ? 'text-[#2563EB]'
                                      : 'text-slate-500'
                              }`}
                            >
                              {sub.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 min-w-[160px]">
                            <div className="flex justify-between text-[11.5px] text-slate-600 tabular-nums mb-1">
                              <span>{sub.aiQuotaUsed.toLocaleString('en-IN')}</span>
                              <span>{pct}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${pct > 85 ? 'bg-amber-500' : 'bg-[#2563EB]'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                            {formatINR(sub.amount)}
                          </td>
                          <td className="py-3 pl-3 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              {sub.status === 'Past Due' && (
                                <button
                                  type="button"
                                  onClick={() => handleRetryPayment(sub)}
                                  className="px-2.5 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[12px] font-medium transition flex items-center gap-1"
                                >
                                  <RefreshCw className="w-3 h-3" />
                                  <span>Retry Charge</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingSub(sub);
                                  setEditPlanDraft(sub.plan);
                                  setEditCycleDraft(sub.billingCycle);
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-[#F2F4F8] hover:bg-slate-200 text-slate-700 text-[12px] font-medium transition"
                              >
                                Change Plan
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleSubCancel(sub)}
                                className="px-2.5 py-1.5 rounded-lg bg-[#F2F4F8] hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-[12px] font-medium transition"
                              >
                                {sub.status === 'Cancelled' ? 'Resume' : 'Cancel'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ====================================================================
            TABS 4–8: OPERATIONAL ADMIN MODULES
        ==================================================================== */}
        {activeTab === 'ai-calls' && (
          <AdminAICallMonitoringTab
            calls={aiCalls}
            onRetryCall={handleRetryAICall}
            onTerminateCall={handleTerminateAICall}
          />
        )}

        {activeTab === 'whatsapp' && (
          <AdminWhatsAppAnalyticsTab
            sellerUsage={waUsage}
            templateQueue={waTemplates}
            onModerateTemplate={handleModerateTemplate}
          />
        )}

        {activeTab === 'tickets' && (
          <AdminSupportTicketsTab
            tickets={tickets}
            adminUser={adminUser}
            onReplyTicket={handleReplyTicket}
            onUpdateTicketStatus={handleUpdateTicketStatus}
            onUpdateTicketPriority={handleUpdateTicketPriority}
          />
        )}

        {activeTab === 'logs' && (
          <AdminSystemLogsTab logs={logs} onExportLogs={handleQuickExportLogs} />
        )}

        {activeTab === 'reports' && (
          <AdminReportsExportTab
            sellers={sellers}
            subscriptions={subscriptions}
            calls={aiCalls}
            waUsage={waUsage}
            tickets={tickets}
            logs={logs}
            exportHistory={exportHistory}
            onRecordExport={handleRecordExport}
          />
        )}
      </main>

      {/* ====================================================================
          MODAL: INSPECT SELLER DETAIL
      ==================================================================== */}
      {inspectedSeller && (
        <div className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-aisle-md border border-slate-200/80">
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-slate-900 text-white font-display font-semibold text-[14px] flex items-center justify-center shrink-0">
                  {getInitials(inspectedSeller.ownerName)}
                </div>
                <div>
                  <h3 className="font-display font-semibold text-[16.5px] text-slate-900">
                    {inspectedSeller.businessName}
                  </h3>
                  <p className="text-[12.5px] text-slate-500">
                    {inspectedSeller.ownerName} · {inspectedSeller.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectedSellerId(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-[12.5px]">
              <div className="p-3 rounded-xl bg-[#F2F4F8]">
                <div className="text-slate-500">GSTIN</div>
                <div className="mt-0.5 font-mono font-semibold text-slate-900">{inspectedSeller.gstin}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#F2F4F8]">
                <div className="text-slate-500">Plan &amp; MRR</div>
                <div className="mt-0.5 font-semibold text-slate-900 tabular-nums">
                  {inspectedSeller.plan} · {formatINR(inspectedSeller.mrrContribution)}/mo
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#F2F4F8]">
                <div className="text-slate-500">Monthly Orders / AI Calls</div>
                <div className="mt-0.5 font-mono font-semibold text-slate-900 tabular-nums">
                  {inspectedSeller.monthlyOrders.toLocaleString('en-IN')} /{' '}
                  {inspectedSeller.aiCallsThisMonth.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#F2F4F8]">
                <div className="text-slate-500">Wallet Balance</div>
                <div className="mt-0.5 font-mono font-semibold text-slate-900 tabular-nums">
                  {formatINR(inspectedSeller.walletBalance, true)}
                </div>
              </div>
            </div>

            <div className="mt-4 text-[12.5px] text-slate-600 space-y-1">
              <div>Email: <strong className="text-slate-900">{inspectedSeller.email}</strong></div>
              <div>Phone: <strong className="text-slate-900 font-mono">{inspectedSeller.phone}</strong></div>
              <div>Location: <strong className="text-slate-900">{inspectedSeller.city}</strong> · Joined {inspectedSeller.joinedDate}</div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAdjustSellerWallet(inspectedSeller, 2500)}
                  className="px-3 py-2 rounded-xl bg-[#EFF6FF] hover:bg-blue-100 text-[#2563EB] text-[12.5px] font-medium transition"
                >
                  + ₹2,500 Credit
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleUpdateSellerStatus(
                      inspectedSeller,
                      inspectedSeller.status === 'Suspended' ? 'Active' : 'Suspended'
                    )
                  }
                  className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-[12.5px] font-medium transition"
                >
                  {inspectedSeller.status === 'Suspended' ? 'Reactivate Account' : 'Suspend Account'}
                </button>
              </div>
              <button
                type="button"
                onClick={() => setInspectedSellerId(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-[12.5px] font-medium hover:bg-slate-800 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: ADD NEW SELLER
      ==================================================================== */}
      {showAddSellerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSeller}
            className="w-full max-w-md bg-white rounded-2xl p-6 shadow-aisle-md border border-slate-200/80 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-display font-semibold text-[16px] text-slate-900">
                Provision New Seller Account
              </h3>
              <button
                type="button"
                onClick={() => setShowAddSellerModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
              <div className="sm:col-span-2">
                <label className="block text-[12px] font-medium text-slate-600 mb-1">Business Name</label>
                <input
                  type="text"
                  required
                  value={newSellerForm.businessName}
                  onChange={(e) => setNewSellerForm({ ...newSellerForm, businessName: e.target.value })}
                  placeholder="e.g. Deccan Craft Collective"
                  className="w-full px-3 py-2 rounded-xl bg-[#F2F4F8] text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-slate-600 mb-1">Owner Name</label>
                <input
                  type="text"
                  required
                  value={newSellerForm.ownerName}
                  onChange={(e) => setNewSellerForm({ ...newSellerForm, ownerName: e.target.value })}
                  placeholder="e.g. Aditi Kulkarni"
                  className="w-full px-3 py-2 rounded-xl bg-[#F2F4F8] text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-slate-600 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newSellerForm.email}
                  onChange={(e) => setNewSellerForm({ ...newSellerForm, email: e.target.value })}
                  placeholder="owner@store.in"
                  className="w-full px-3 py-2 rounded-xl bg-[#F2F4F8] text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-slate-600 mb-1">Phone</label>
                <input
                  type="text"
                  value={newSellerForm.phone}
                  onChange={(e) => setNewSellerForm({ ...newSellerForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#F2F4F8] text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-slate-600 mb-1">Plan Tier</label>
                <select
                  value={newSellerForm.plan}
                  onChange={(e) => setNewSellerForm({ ...newSellerForm, plan: e.target.value as SellerPlanTier })}
                  className="w-full px-3 py-2 rounded-xl bg-[#F2F4F8] text-slate-900 focus:outline-none"
                >
                  <option value="Starter">Starter (₹2,499/mo)</option>
                  <option value="Pro Plan">Pro Plan (₹7,999/mo)</option>
                  <option value="Enterprise">Enterprise (₹24,999/mo)</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddSellerModal(false)}
                className="px-4 py-2 rounded-xl bg-[#F2F4F8] text-slate-700 text-[13px] font-medium hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-medium transition"
              >
                Create Seller
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ====================================================================
          MODAL: CHANGE SUBSCRIPTION PLAN
      ==================================================================== */}
      {editingSub && (
        <div className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveSubscriptionEdit}
            className="w-full max-w-md bg-white rounded-2xl p-6 shadow-aisle-md border border-slate-200/80 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-display font-semibold text-[16px] text-slate-900">
                  Update Subscription Plan
                </h3>
                <p className="text-[12px] text-slate-500">
                  {editingSub.businessName} · {editingSub.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingSub(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-[13px]">
              <div>
                <label className="block text-[12px] font-medium text-slate-600 mb-1">Plan Tier</label>
                <select
                  value={editPlanDraft}
                  onChange={(e) => setEditPlanDraft(e.target.value as SellerPlanTier)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F2F4F8] text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  <option value="Starter">Starter — ₹2,499/mo (3,000 AI calls)</option>
                  <option value="Pro Plan">Pro Plan — ₹7,999/mo (20,000 AI calls)</option>
                  <option value="Enterprise">Enterprise — ₹24,999/mo (1,00,000 AI calls)</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-slate-600 mb-1">Billing Cycle</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Monthly', 'Annual'] as const).map((cycle) => (
                    <button
                      key={cycle}
                      type="button"
                      onClick={() => setEditCycleDraft(cycle)}
                      className={`py-2 px-3 rounded-xl text-[13px] font-medium border transition ${
                        editCycleDraft === cycle
                          ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB]'
                          : 'bg-[#F2F4F8] border-transparent text-slate-700'
                      }`}
                    >
                      {cycle}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingSub(null)}
                className="px-4 py-2 rounded-xl bg-[#F2F4F8] text-slate-700 text-[13px] font-medium hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-medium transition"
              >
                Save Plan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
