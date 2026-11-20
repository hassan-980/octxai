import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  BarChart3,
  Bell,
  ChevronDown,
  Layers,
  LayoutGrid,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  PhoneCall,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  Star,
  Upload,
  Wallet,
  X,
} from 'lucide-react';
import {
  CallCategoryType,
  Order,
  OrderStatus,
  ViewName,
} from './types';
import {
  INITIAL_INVOICES,
  INITIAL_WA_CONTACTS,
  INITIAL_WEBHOOK_LOGS,
} from './data/initialData';
import { formatINR, getInitials } from './utils/helpers';
import { LandingPageView } from './components/LandingPageView';
import { AuthUserPayload, AuthView } from './components/AuthView';
import { OverviewView } from './components/OverviewView';
import { OrdersView } from './components/OrdersView';
import { AICallingView } from './components/AICallingView';
import { WhatsAppView } from './components/WhatsAppView';
import { TrackingView } from './components/TrackingView';
import { FeedbackView } from './components/FeedbackView';
import { BillingView } from './components/BillingView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { AddOrderModal, CommandModal, CsvUploadModal } from './components/Modals';
import { AdminAuthView } from './components/AdminAuthView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { AdminUserPayload } from './data/adminData';
import { useAppDispatch, useAppSelector } from './store/hooks';
import {
  AppRoute,
  clearToast,
  getStoredAuthUser,
  loginAdminSuccess,
  loginSellerSuccess,
  logoutAdmin,
  logoutSeller,
  normalizeRoute,
  setActiveView,
  setPendingDashboardView,
  setRoutePath,
  showToast as showToastAction,
} from './store/slices/authSlice';
import {
  addAICall,
  addChatMessage,
  addMoney,
  addPaymentMethod,
  addWaCampaign,
  addWaTemplate,
  buyCredits,
  createOrder,
  importOrders,
  markAllNotificationsRead,
  replyReview,
  sendFeedbackRequest,
  sendWhatsAppFromOrder,
  setCurrentPlan,
  setPrimaryPaymentMethod,
  syncSettingsFromAuth,
  toggleAutoReply,
  toggleConnectedAccount,
  toggleCourier,
  triggerAICallFromOrder,
  triggerShipmentAICall,
  updateAICallType,
  updateOrderStatus,
  updateSettings,
} from './store/slices/sellerSlice';
import { recordAdminSessionStart } from './store/slices/adminSlice';

export default function App() {
  const dispatch = useAppDispatch();

  // Global Auth & Navigation State from Redux
  const { authUser, adminUser, routePath, activeView, toastMsg } = useAppSelector(
    (state) => state.auth
  );

  // Global Seller Workspace State from Redux
  const {
    orders,
    aiCalls,
    waCampaigns,
    waTemplates,
    autoReplies,
    chatLogs,
    shipments,
    couriers,
    reviews,
    feedbackRequests,
    walletBalance,
    creditsUsed,
    creditsTotal,
    currentPlan,
    transactions,
    paymentMethods,
    settings,
    connectedAccounts,
    notifications,
  } = useAppSelector((state) => state.seller);

  // Ephemeral UI popover/modal states
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHeaderActionMenu, setShowHeaderActionMenu] = useState(false);
  const headerActionMenuRef = useRef<HTMLDivElement | null>(null);
  const [showCommandModal, setShowCommandModal] = useState(false);
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);

  const showToast = (msg: string) => {
    dispatch(showToastAction(msg));
  };

  useEffect(() => {
    if (!toastMsg) return;
    const t = window.setTimeout(() => dispatch(clearToast()), 3200);
    return () => window.clearTimeout(t);
  }, [toastMsg, dispatch]);

  // Sync initial unauthenticated /dashboard URL to /login & handle browser back/forward
  useEffect(() => {
    const current = normalizeRoute(window.location.pathname);
    if (current === '/dashboard' && !authUser) {
      window.history.replaceState({}, '', '/login');
      dispatch(setRoutePath('/login'));
    } else if (window.location.pathname !== routePath) {
      window.history.replaceState({}, '', routePath);
    }

    const onPopState = () => {
      const next = normalizeRoute(window.location.pathname);
      if (next === '/dashboard' && !getStoredAuthUser()) {
        window.history.replaceState({}, '', '/login');
        dispatch(setRoutePath('/login'));
        return;
      }
      dispatch(setRoutePath(next));
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [authUser, routePath, dispatch]);

  // Global keyboard shortcuts (Cmd/Ctrl + K & Escape) & outside-click close for header dropdown
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        if (routePath === '/dashboard') {
          e.preventDefault();
          setShowCommandModal((prev) => !prev);
        }
      } else if (e.key === 'Escape') {
        setShowCommandModal(false);
        setShowAddOrderModal(false);
        setShowCsvModal(false);
        setShowNotifications(false);
        setShowHeaderActionMenu(false);
      }
    };
    const onMouseDown = (e: MouseEvent) => {
      if (
        headerActionMenuRef.current &&
        !headerActionMenuRef.current.contains(e.target as Node)
      ) {
        setShowHeaderActionMenu(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('mousedown', onMouseDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('mousedown', onMouseDown);
    };
  }, [routePath]);

  const navigateRoute = (path: AppRoute, targetView?: ViewName) => {
    if (path === '/dashboard' && !authUser) {
      if (targetView && targetView !== 'landing') {
        dispatch(setPendingDashboardView(targetView));
      }
      if (window.location.pathname !== '/login') {
        window.history.pushState({}, '', '/login');
      }
      dispatch(setRoutePath('/login'));
      showToast('Please sign in to access your dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    dispatch(setRoutePath(path));
    if (targetView && targetView !== 'landing') {
      dispatch(setActiveView(targetView));
    }
    setMobileSidebarOpen(false);
    setShowNotifications(false);
    setShowHeaderActionMenu(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateTo = (view: ViewName) => {
    if (view === 'landing') {
      navigateRoute('/');
      return;
    }
    if (routePath !== '/dashboard') {
      navigateRoute('/dashboard', view);
      return;
    }
    dispatch(setActiveView(view));
    setMobileSidebarOpen(false);
    setShowNotifications(false);
    setShowHeaderActionMenu(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = (user: AuthUserPayload, message: string) => {
    dispatch(syncSettingsFromAuth(user));
    dispatch(loginSellerSuccess({ user, message }));
    window.history.pushState({}, '', '/dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignOut = () => {
    setMobileSidebarOpen(false);
    setShowNotifications(false);
    dispatch(logoutSeller());
    window.history.pushState({}, '', '/login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminAuthSuccess = (admin: AdminUserPayload) => {
    dispatch(loginAdminSuccess(admin));
    dispatch(recordAdminSessionStart(admin));
    if (window.location.pathname !== '/admin') {
      window.history.pushState({}, '', '/admin');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminSignOut = () => {
    dispatch(logoutAdmin());
    if (window.location.pathname !== '/admin') {
      window.history.pushState({}, '', '/admin');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Redux-dispatched Seller Handlers
  const handleCreateOrder = (newOrder: Order) => {
    dispatch(createOrder(newOrder));
    showToast(`Order #${newOrder.id} created & AI confirmation call initiated`);
  };

  const handleImportOrders = (imported: Order[]) => {
    dispatch(importOrders(imported));
    showToast(`${imported.length} orders imported & queued for AI verification`);
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    dispatch(updateOrderStatus({ orderId, status }));
    showToast(`Order #${orderId} marked as ${status}`);
  };

  const handleTriggerAICallFromOrder = (order: Order) => {
    dispatch(triggerAICallFromOrder(order));
    showToast(`AI verification call triggered for #${order.id} (${order.customer})`);
    navigateTo('ai-calling');
  };

  const handleSendWhatsAppFromOrder = (order: Order) => {
    dispatch(sendWhatsAppFromOrder(order));
    showToast(`WhatsApp update sent to ${order.customer} (${order.phone})`);
  };

  const handleAddMoney = (amount: number, method: string) => {
    dispatch(addMoney({ amount, method }));
    showToast(`${formatINR(amount)} added to octxAI Wallet via ${method}`);
  };

  const handleBuyCredits = (credits: number, cost: number) => {
    dispatch(buyCredits({ credits, cost }));
    showToast(`Purchased ${credits.toLocaleString('en-IN')} WhatsApp credits`);
  };

  const toastElement = toastMsg ? (
    <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg text-[13px] font-medium flex items-center gap-2.5">
      <span className="w-2 h-2 rounded-full bg-emerald-400" />
      <span>{toastMsg}</span>
    </div>
  ) : null;

  if (routePath === '/') {
    return (
      <>
        <LandingPageView
          onNavigate={navigateTo}
          onNavigateRoute={navigateRoute}
          isAuthenticated={Boolean(authUser)}
        />
        {toastElement}
      </>
    );
  }

  if (routePath === '/login' || routePath === '/signup') {
    return (
      <>
        <AuthView
          mode={routePath === '/signup' ? 'signup' : 'login'}
          onSwitchRoute={navigateRoute}
          onAuthSuccess={handleAuthSuccess}
        />
        {toastElement}
      </>
    );
  }

  if (routePath === '/admin') {
    return (
      <>
        {adminUser ? (
          <AdminDashboardView
            adminUser={adminUser}
            onSignOut={handleAdminSignOut}
            onGoToWebsite={() => navigateRoute('/')}
            onShowToast={showToast}
          />
        ) : (
          <AdminAuthView
            onBackHome={() => navigateRoute('/')}
            onAdminAuthSuccess={handleAdminAuthSuccess}
          />
        )}
        {toastElement}
      </>
    );
  }

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const headerMetaMap: Record<Exclude<ViewName, 'landing'>, { title: string; sub: string; cta: string }> = {
    overview: { title: `Good morning, ${settings.fullName.split(' ')[0]} 👋`, sub: '', cta: 'Add order' },
    orders: { title: 'Orders Management', sub: 'Manage marketplace orders, batch CSV imports & instant AI/WhatsApp triggers', cta: 'Add order' },
    'ai-calling': { title: 'AI Calling', sub: 'Automate calls with AI voice. Confirm orders, verify addresses & improve delivery success.', cta: 'Create Call' },
    whatsapp: { title: 'WhatsApp Automation', sub: 'Transactional order alerts, tracking links & COD-to-prepaid flows', cta: 'New Campaign' },
    tracking: { title: 'Delivery Tracking', sub: 'Real-time courier intelligence across Delhivery, BlueDart & XpressBees', cta: 'Add order' },
    feedback: { title: 'Customer Feedback', sub: 'Sentiment analysis & automated marketplace rating booster', cta: 'Request Feedback' },
    billing: { title: 'Billing & Wallet', sub: 'Manage prepaid credits, UPI auto-recharge & GST invoices', cta: 'Add Money' },
    reports: { title: 'Analytics & Reports', sub: 'Export orders, AI calling logs, courier SLAs & sentiment data', cta: 'Export All' },
    settings: { title: 'Seller Settings', sub: 'Configure store details, pickup warehouse & connected marketplaces', cta: 'Add order' },
  };

  const headerMeta = headerMetaMap[activeView];

  const navItems: {
    id: ViewName;
    label: string;
    icon: React.ElementType;
    badge?: string;
    badgeTone?: 'blue' | 'rose';
  }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'ai-calling', label: 'AI Calling', icon: PhoneCall, badge: String(aiCalls.length), badgeTone: 'blue' },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, badge: String(waCampaigns.length), badgeTone: 'blue' },
    { id: 'tracking', label: 'Tracking', icon: Package, badge: '3', badgeTone: 'rose' },
    { id: 'feedback', label: 'Reviews', icon: Star, badge: '4', badgeTone: 'rose' },
    { id: 'billing', label: 'Billing & Wallet', icon: Wallet },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F2F4F8]">
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#F2F4F8] border-b border-slate-200/70 sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <button onClick={() => setMobileSidebarOpen(true)} className="p-2 rounded-xl bg-white text-slate-700 shadow-aisle">
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center text-white">
            <Layers className="w-4 h-4" />
          </div>
          <span className="font-display font-semibold text-[16px] text-slate-900">octxAI</span>
        </div>
      </div>

      {/* LEFT SIDEBAR (Exact Aisle #F2F4F8 surface) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#F2F4F8] px-4 py-6 flex flex-col justify-between overflow-y-auto overscroll-contain transform lg:translate-x-0 lg:sticky lg:inset-auto lg:top-0 lg:h-screen lg:self-start transition-transform duration-200 ease-in-out shrink-0 select-none ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="flex items-center justify-between px-3 mb-7">
            <button onClick={() => navigateTo('overview')} className="flex items-center gap-2.5 group focus:outline-none">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#2563EB] flex items-center justify-center transition-transform group-hover:scale-105">
                <Layers className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="font-display font-semibold text-[17px] tracking-tight text-slate-900">octxAI</span>
            </button>
            <button onClick={() => setMobileSidebarOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-all ${
                    isActive
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="w-[18px] h-[18px]" />
                    <span>{item.label}</span>
                  </span>
                  {item.badge && (
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.badgeTone === 'rose'
                            ? 'bg-rose-100/90 text-rose-600'
                            : 'bg-blue-100/90 text-[#2563EB]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Settings, Sign Out & White Profile Card */}
        <div className="space-y-3 pt-6">
          <div className="space-y-1">
            <button
              onClick={() => navigateTo('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-all ${
                activeView === 'settings'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
              }`}
            >
              <Settings className="w-[18px] h-[18px]" />
              <span>Settings</span>
            </button>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all"
            >
              <LogOut className="w-[18px] h-[18px]" />
              <span>Sign out</span>
            </button>
          </div>

          <div
            onClick={() => navigateTo('settings')}
            className="bg-white rounded-2xl p-3 shadow-aisle flex items-center justify-between cursor-pointer hover:shadow-aisle-md transition-all group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                aria-label={settings.fullName}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-white font-display font-semibold text-[12.5px] tracking-tight ring-2 ring-blue-50 flex items-center justify-center shrink-0 select-none"
              >
                {getInitials(settings.fullName) || 'U'}
              </div>
              <div className="truncate">
                <div className="text-[13.5px] font-semibold text-slate-900 truncate group-hover:text-[#2563EB] transition-colors">
                  {settings.fullName}
                </div>
                <div className="text-[11.5px] text-slate-400 truncate">
                  {settings.businessName} · {currentPlan === 'Pro Plan' ? 'Pro' : currentPlan}
                </div>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* MAIN WORKSPACE */}
      <main className="flex-1 min-w-0 px-4 sm:px-8 py-6 max-w-[1440px] w-full mx-auto">
        {/* TOP HEADER ROW 1 */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h1 className="font-display text-[22px] sm:text-[24px] font-semibold text-slate-900 tracking-tight">
              {headerMeta.title}
            </h1>
            {headerMeta.sub && <p className="text-[13px] text-slate-500 mt-0.5">{headerMeta.sub}</p>}
          </div>

          <div className="w-full sm:w-auto flex flex-nowrap items-center gap-1.5 sm:gap-2.5">
            {/* Wallet Quick Pill */}
            <button
              onClick={() => navigateTo('billing')}
              className="h-8 sm:h-10 bg-white hover:bg-slate-50 px-2.5 sm:px-3.5 rounded-xl shadow-aisle flex items-center gap-1.5 sm:gap-2 text-[11.5px] sm:text-[13px] font-medium text-slate-700 transition whitespace-nowrap shrink-0"
            >
              <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0" />
              <span className="text-slate-400">Wallet</span>
              <span className="font-semibold text-slate-900 tabular-nums">{formatINR(walletBalance, true)}</span>
            </button>

            {/* Primary CTA Dropdown Button (Add Order / Upload CSV) */}
            <div ref={headerActionMenuRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowHeaderActionMenu((prev) => !prev);
                  setShowNotifications(false);
                }}
                aria-expanded={showHeaderActionMenu}
                aria-haspopup="menu"
                className="h-8 sm:h-10 px-2.5 sm:px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[12px] sm:text-[13.5px] font-medium shadow-sm transition flex items-center gap-1 sm:gap-1.5 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
                <span>Add order</span>
                <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform ${showHeaderActionMenu ? 'rotate-180' : ''}`} />
              </button>

              {showHeaderActionMenu && (
                <div
                  role="menu"
                  className="absolute left-0 sm:left-auto sm:right-0 mt-1.5 sm:mt-2 w-36 sm:w-48 bg-white rounded-xl sm:rounded-2xl shadow-aisle-md border border-slate-100 p-1 sm:p-1.5 z-50 text-[11.5px] sm:text-[13px]"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setShowHeaderActionMenu(false);
                      setShowAddOrderModal(true);
                    }}
                    className="w-full text-left px-2.5 py-1.5 sm:px-3 sm:py-2.5 rounded-lg sm:rounded-xl hover:bg-[#F2F4F8] flex items-center gap-2 sm:gap-2.5 text-slate-700 font-medium transition"
                  >
                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2563EB]" />
                    <span>Add order</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setShowHeaderActionMenu(false);
                      setShowCsvModal(true);
                    }}
                    className="w-full text-left px-2.5 py-1.5 sm:px-3 sm:py-2.5 rounded-lg sm:rounded-xl hover:bg-[#F2F4F8] flex items-center gap-2 sm:gap-2.5 text-slate-700 font-medium transition"
                  >
                    <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2563EB]" />
                    <span>Upload CSV</span>
                  </button>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative ml-auto sm:ml-0 shrink-0">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowHeaderActionMenu(false);
                }}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white hover:bg-slate-50 shadow-aisle flex items-center justify-center text-slate-700 transition relative"
                title="Notifications"
              >
                <Bell className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                {unreadNotifications > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 sm:top-2.5 sm:right-2.5 ring-2 ring-white" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-aisle-md border border-slate-100 p-4 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="font-display font-semibold text-[14px] text-slate-900">Notifications</span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB]">
                      {unreadNotifications} new
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 my-1 text-[13px]">
                    {notifications.map((n) => (
                      <div key={n.id} className="py-2.5 flex items-start gap-2.5">
                        <span
                          className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            n.tone === 'emerald'
                              ? 'bg-emerald-500'
                              : n.tone === 'amber'
                                ? 'bg-amber-500'
                                : 'bg-[#2563EB]'
                          }`}
                        />
                        <div>
                          <p className="text-slate-800 font-medium">{n.title}</p>
                          <p className="text-slate-400 text-xs mt-0.5">{n.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      dispatch(markAllNotificationsRead());
                      setShowNotifications(false);
                      showToast('All notifications marked as read');
                    }}
                    className="w-full mt-2 py-1.5 text-center text-xs font-medium text-[#2563EB] hover:bg-blue-50 rounded-lg transition"
                  >
                    Mark all as read
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => navigateTo('settings')}
              title={settings.fullName}
              aria-label={`${settings.fullName} profile`}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-white font-display font-semibold text-[13.5px] tracking-tight shadow-aisle hover:shadow-aisle-md hover:brightness-105 transition cursor-pointer hidden sm:flex items-center justify-center shrink-0 select-none ring-2 ring-white"
            >
              {getInitials(settings.fullName) || 'U'}
            </button>
          </div>
        </header>

        {/* TOP HEADER ROW 2: Full-width Command Search Bar */}
        <div className="mb-4 sm:mb-6">
          <div
            onClick={() => setShowCommandModal(true)}
            className="w-full bg-[#E8ECF2]/75 hover:bg-[#E2E7F0] focus-within:bg-white focus-within:shadow-aisle transition-all rounded-lg sm:rounded-xl px-2.5 py-1.5 sm:px-4 sm:py-2.5 flex items-center justify-between gap-2 cursor-pointer group"
          >
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
              <span className="text-[11.5px] sm:text-[13.5px] text-slate-400 group-hover:text-slate-500 select-none truncate">
                Search orders, AWB, customers, or AI transcripts...
              </span>
            </div>
            <kbd className="px-1.5 py-0.5 sm:px-2 text-[10px] sm:text-[11px] font-medium text-slate-400 bg-white/90 rounded-md shadow-2xs shrink-0">⌘K</kbd>
          </div>
        </div>

        {/* ACTIVE VIEW CONTENT */}
        {activeView === 'overview' && (
          <OverviewView
            orders={orders}
            onNavigate={navigateTo}
            onOpenNewOrderModal={() => setShowAddOrderModal(true)}
            onOpenCsvUpload={() => setShowCsvModal(true)}
            onShowToast={showToast}
          />
        )}

        {activeView === 'orders' && (
          <OrdersView
            orders={orders}
            onOpenNewOrderModal={() => setShowAddOrderModal(true)}
            onOpenCsvUpload={() => setShowCsvModal(true)}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onTriggerAICall={handleTriggerAICallFromOrder}
            onSendWhatsApp={handleSendWhatsAppFromOrder}
            onNavigate={navigateTo}
          />
        )}

        {activeView === 'ai-calling' && (
          <AICallingView
            calls={aiCalls}
            settings={settings}
            onUpdateSettings={(next) => dispatch(updateSettings(next))}
            onAddCall={(c) => dispatch(addAICall(c))}
            onUpdateCallType={(id, callType: CallCategoryType) =>
              dispatch(updateAICallType({ id, callType }))
            }
            onShowToast={showToast}
          />
        )}

        {activeView === 'whatsapp' && (
          <WhatsAppView
            campaigns={waCampaigns}
            templates={waTemplates}
            autoReplies={autoReplies}
            contacts={INITIAL_WA_CONTACTS}
            chatLogs={chatLogs}
            webhookLogs={INITIAL_WEBHOOK_LOGS}
            creditsUsed={creditsUsed}
            creditsTotal={creditsTotal}
            onAddCampaign={(c) => dispatch(addWaCampaign(c))}
            onAddTemplate={(t) => dispatch(addWaTemplate(t))}
            onToggleAutoReply={(id) => dispatch(toggleAutoReply(id))}
            onAddChatMessage={(log) => dispatch(addChatMessage(log))}
            onNavigate={navigateTo}
            onShowToast={showToast}
          />
        )}

        {activeView === 'tracking' && (
          <TrackingView
            shipments={shipments}
            couriers={couriers}
            onToggleCourier={(id) => dispatch(toggleCourier(id))}
            onTriggerShipmentCall={(s) => {
              dispatch(triggerShipmentAICall(s));
              showToast(`AI update call completed for ${s.orderId} (${s.customer})`);
            }}
            onShowToast={showToast}
          />
        )}

        {activeView === 'feedback' && (
          <FeedbackView
            reviews={reviews}
            requests={feedbackRequests}
            settings={settings}
            onUpdateSettings={(next) => dispatch(updateSettings(next))}
            onReplyReview={(id, reply) => dispatch(replyReview({ id, reply }))}
            onSendFeedbackRequest={(req) => dispatch(sendFeedbackRequest(req))}
            onShowToast={showToast}
          />
        )}

        {activeView === 'billing' && (
          <BillingView
            walletBalance={walletBalance}
            creditsUsed={creditsUsed}
            creditsTotal={creditsTotal}
            currentPlan={currentPlan}
            transactions={transactions}
            invoices={INITIAL_INVOICES}
            paymentMethods={paymentMethods}
            onAddMoney={handleAddMoney}
            onBuyCredits={handleBuyCredits}
            onUpgradePlan={(plan) => dispatch(setCurrentPlan(plan))}
            onAddPaymentMethod={(pm) => dispatch(addPaymentMethod(pm))}
            onSetPrimaryMethod={(id) => dispatch(setPrimaryPaymentMethod(id))}
            onShowToast={showToast}
          />
        )}

        {activeView === 'reports' && (
          <ReportsView
            orders={orders}
            calls={aiCalls}
            shipments={shipments}
            reviews={reviews}
            onShowToast={showToast}
          />
        )}

        {activeView === 'settings' && (
          <SettingsView
            settings={settings}
            connectedAccounts={connectedAccounts}
            walletBalance={walletBalance}
            creditsUsed={creditsUsed}
            creditsTotal={creditsTotal}
            onUpdateSettings={(next) => dispatch(updateSettings(next))}
            onToggleConnectedAccount={(id) => dispatch(toggleConnectedAccount(id))}
            onNavigate={navigateTo}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Modals */}
      <CommandModal
        open={showCommandModal}
        orders={orders}
        onClose={() => setShowCommandModal(false)}
        onNavigate={navigateTo}
      />
      <AddOrderModal
        open={showAddOrderModal}
        onClose={() => setShowAddOrderModal(false)}
        onCreateOrder={handleCreateOrder}
      />
      <CsvUploadModal
        open={showCsvModal}
        onClose={() => setShowCsvModal(false)}
        onImportOrders={handleImportOrders}
      />

      {/* Floating Toast Notification */}
      {toastElement}
    </div>
  );
}
