import React, { useState } from 'react';
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  Headphones,
  IndianRupee,
  MessageCircle,
  PackageCheck,
  PhoneCall,
  PhoneForwarded,
  Plus,
  ShoppingBag,
  Speaker,
  Star,
  Target,
  Upload,
  Watch,
} from 'lucide-react';
import { Order, ViewName } from '../types';
import { formatINR, getOrderStatusBadgeClass } from '../utils/helpers';

interface OverviewViewProps {
  orders: Order[];
  onNavigate: (view: ViewName) => void;
  onOpenNewOrderModal: () => void;
  onOpenCsvUpload: () => void;
  onShowToast: (msg: string) => void;
}

const CHART_CONFIGS = {
  day: {
    subtitle: 'Today (Hourly)',
    metric: '₹2,68,400',
    trend: '↗ 14.2%',
    labels: ['9 AM', '11 AM', '1 PM', '3 PM', '5 PM', '7 PM', '9 PM'],
    line: 'M 0,155 C 60,145 95,120 140,125 C 185,130 220,95 270,88 C 320,80 355,105 400,78 C 445,50 490,62 540,42 C 590,22 645,38 700,28',
    area: 'M 0,155 C 60,145 95,120 140,125 C 185,130 220,95 270,88 C 320,80 355,105 400,78 C 445,50 490,62 540,42 C 590,22 645,38 700,28 L 700,195 L 0,195 Z',
    deliveredLine: 'M 0,165 C 60,155 95,140 140,142 C 185,144 220,115 270,110 C 320,104 355,124 400,100 C 445,76 490,82 540,65 C 590,48 645,58 700,48',
  },
  week: {
    subtitle: 'May 12, 2024 – May 18, 2024',
    metric: '₹18,75,450',
    trend: '↗ 18.6%',
    labels: ['12 May', '13 May', '14 May', '15 May', '16 May', '17 May', '18 May'],
    line: 'M 0,145 C 55,125 85,112 120,122 C 165,135 200,158 245,135 C 290,110 315,72 360,82 C 405,92 435,125 480,100 C 525,75 565,30 615,32 C 655,34 680,48 700,52',
    area: 'M 0,145 C 55,125 85,112 120,122 C 165,135 200,158 245,135 C 290,110 315,72 360,82 C 405,92 435,125 480,100 C 525,75 565,30 615,32 C 655,34 680,48 700,52 L 700,195 L 0,195 Z',
    deliveredLine: 'M 0,160 C 55,142 85,132 120,140 C 165,148 200,168 245,148 C 290,126 315,96 360,104 C 405,112 435,140 480,118 C 525,96 565,58 615,60 C 655,62 680,72 700,76',
  },
  month: {
    subtitle: 'Last 30 days',
    metric: '₹74,20,900',
    trend: '↗ 24.1%',
    labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6', 'Now'],
    line: 'M 0,160 C 70,150 110,130 160,115 C 210,100 250,120 300,95 C 350,70 390,85 445,60 C 500,35 555,48 615,25 C 660,15 685,20 700,18',
    area: 'M 0,160 C 70,150 110,130 160,115 C 210,100 250,120 300,95 C 350,70 390,85 445,60 C 500,35 555,48 615,25 C 660,15 685,20 700,18 L 700,195 L 0,195 Z',
    deliveredLine: 'M 0,172 C 70,162 110,145 160,132 C 210,120 250,135 300,115 C 350,92 390,104 445,82 C 500,60 555,70 615,48 C 660,38 685,42 700,40',
  },
};

export const OverviewView: React.FC<OverviewViewProps> = ({
  orders,
  onNavigate,
  onOpenNewOrderModal,
  onOpenCsvUpload,
  onShowToast,
}) => {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [dateRangeLabel, setDateRangeLabel] = useState('May 12, 2024 – May 18, 2024');
  const [showDateMenu, setShowDateMenu] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [rightFeedTab, setRightFeedTab] = useState<'orders' | 'activities'>('orders');
  const [showAllKpis, setShowAllKpis] = useState(false);

  const cfg = CHART_CONFIGS[period];
  const totalOrdersCount = 12854 + Math.max(0, orders.length - 8);

  const recentActivities = [
    { icon: PhoneCall, color: 'text-[#2563EB] bg-blue-50', title: 'AI Call Completed', desc: 'Order #ORD-10045 · Rahul Sharma', time: '10:30 AM', badge: 'Success', badgeClass: 'bg-[#ECFDF5] text-[#059669]' },
    { icon: MessageCircle, color: 'text-emerald-600 bg-emerald-50', title: 'WhatsApp Sent', desc: 'Order #ORD-10044 · Priya Verma', time: '10:28 AM', badge: 'Sent', badgeClass: 'bg-[#EFF6FF] text-[#2563EB]' },
    { icon: PackageCheck, color: 'text-indigo-600 bg-indigo-50', title: 'Order Shipped', desc: 'Order #ORD-10043 · Amit Kumar', time: '09:45 AM', badge: 'Shipped', badgeClass: 'bg-[#EFF6FF] text-[#2563EB]' },
    { icon: Star, color: 'text-amber-600 bg-amber-50', title: 'Feedback Received', desc: 'Order #ORD-10042 · Sneha Reddy', time: '09:30 AM', badge: 'Positive', badgeClass: 'bg-[#ECFDF5] text-[#059669]' },
    { icon: AlertCircle, color: 'text-rose-600 bg-rose-50', title: 'Delivery Failed', desc: 'Order #ORD-10041 · Vikas Singh', time: 'Yesterday', badge: 'Failed', badgeClass: 'bg-[#FEF2F2] text-[#DC2626]' },
  ];

  return (
    <section className="view-section space-y-5">
      {/* Sub-header Toolbar: Date Range + Quick Actions (from Screenshot 3, styled in Aisle minimalism) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-slate-500">Here’s what’s happening with your store today.</p>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5">
          {/* Date Range Picker */}
          <div className="relative">
            <button
              onClick={() => {
                setShowDateMenu(!showDateMenu);
                setShowQuickMenu(false);
              }}
              className="bg-white hover:bg-slate-50 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl shadow-aisle flex items-center gap-1.5 sm:gap-2 text-[11.5px] sm:text-[13px] font-medium text-slate-700 transition"
            >
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0" />
              <span>{dateRangeLabel}</span>
              <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0" />
            </button>
            {showDateMenu && (
              <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-56 bg-white rounded-2xl shadow-aisle-md border border-slate-100 p-1.5 z-30 text-[13px]">
                {[
                  { label: 'Today (18 May 2024)', p: 'day' as const },
                  { label: 'May 12, 2024 – May 18, 2024', p: 'week' as const },
                  { label: 'Last 30 Days', p: 'month' as const },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => {
                      setDateRangeLabel(opt.label);
                      setPeriod(opt.p);
                      setShowDateMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#F2F4F8] text-slate-700 font-medium transition"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowQuickMenu(!showQuickMenu);
                setShowDateMenu(false);
              }}
              className="bg-white hover:bg-slate-50 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl shadow-aisle flex items-center gap-1.5 sm:gap-2 text-[11.5px] sm:text-[13px] font-medium text-slate-700 transition"
            >
              <span>Quick Actions</span>
              <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0" />
            </button>
            {showQuickMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-aisle-md border border-slate-100 p-1.5 z-30 text-[13px]">
                <button
                  onClick={() => {
                    setShowQuickMenu(false);
                    onOpenCsvUpload();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#F2F4F8] flex items-center gap-2.5 text-slate-700 font-medium"
                >
                  <Upload className="w-4 h-4 text-[#2563EB]" />
                  <span>Upload CSV Orders</span>
                </button>
                <button
                  onClick={() => {
                    setShowQuickMenu(false);
                    onOpenNewOrderModal();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#F2F4F8] flex items-center gap-2.5 text-slate-700 font-medium"
                >
                  <Plus className="w-4 h-4 text-[#2563EB]" />
                  <span>Add New Order</span>
                </button>
                <button
                  onClick={() => {
                    setShowQuickMenu(false);
                    onNavigate('ai-calling');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#F2F4F8] flex items-center gap-2.5 text-slate-700 font-medium"
                >
                  <PhoneForwarded className="w-4 h-4 text-[#2563EB]" />
                  <span>Create AI Call</span>
                </button>
                <button
                  onClick={() => {
                    setShowQuickMenu(false);
                    onNavigate('whatsapp');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#F2F4F8] flex items-center gap-2.5 text-slate-700 font-medium"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Send WhatsApp</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowAllKpis(!showAllKpis)}
            className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl bg-[#E8ECF2]/80 hover:bg-slate-200 text-slate-700 text-[11.5px] sm:text-[12.5px] font-medium transition"
          >
            {showAllKpis ? 'Compact KPIs' : 'All 7 KPIs'}
          </button>
        </div>
      </div>

      {/* Top KPI Row (4 Cards exact Aisle layout + toggleable extra KPIs from Screenshot 3) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 shadow-aisle">
          <div className="flex items-center justify-between">
            <span className="text-[13.5px] font-medium text-slate-400">Total Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-[#F1F5F9] text-[#2563EB] flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3.5 font-display text-[28px] font-semibold text-slate-900 metric-tracking">₹18,75,450</div>
          <div className="mt-2.5 flex items-center gap-1.5 text-[12.5px]">
            <span className="text-emerald-600 font-medium">↗ 18.6%</span>
            <span className="text-slate-400">vs last 7 days</span>
          </div>
        </div>

        <div onClick={() => onNavigate('orders')} className="bg-white rounded-2xl p-5 shadow-aisle cursor-pointer hover:shadow-aisle-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[13.5px] font-medium text-slate-400">Total Orders</span>
            <div className="w-8 h-8 rounded-lg bg-[#F1F5F9] text-[#2563EB] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3.5 font-display text-[28px] font-semibold text-slate-900 metric-tracking">
            {totalOrdersCount.toLocaleString('en-IN')}
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-[12.5px]">
            <span className="text-emerald-600 font-medium">↗ 18.5%</span>
            <span className="text-slate-400">vs last 7 days</span>
          </div>
        </div>

        <div onClick={() => onNavigate('ai-calling')} className="bg-white rounded-2xl p-5 shadow-aisle cursor-pointer hover:shadow-aisle-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[13.5px] font-medium text-slate-400">AI Calls Confirmed</span>
            <div className="w-8 h-8 rounded-lg bg-[#F1F5F9] text-[#2563EB] flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3.5 font-display text-[28px] font-semibold text-slate-900 metric-tracking">8,456</div>
          <div className="mt-2.5 flex items-center gap-1.5 text-[12.5px]">
            <span className="text-emerald-600 font-medium">↗ 20.3%</span>
            <span className="text-slate-400">vs last 7 days</span>
          </div>
        </div>

        <div onClick={() => onNavigate('tracking')} className="bg-white rounded-2xl p-5 shadow-aisle cursor-pointer hover:shadow-aisle-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[13.5px] font-medium text-slate-400">Delivery Success</span>
            <div className="w-8 h-8 rounded-lg bg-[#F1F5F9] text-[#2563EB] flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3.5 font-display text-[28px] font-semibold text-slate-900 metric-tracking">92.6%</div>
          <div className="mt-2.5 flex items-center gap-1.5 text-[12.5px]">
            <span className="text-emerald-600 font-medium">↗ 6.2%</span>
            <span className="text-slate-400">call &amp; delivery rate</span>
          </div>
        </div>
      </div>

      {/* Expandable Secondary KPI Strip (Pending Confirmations, Delivered Orders, Failed Deliveries, WhatsApp Sent) */}
      {showAllKpis && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <div onClick={() => onNavigate('orders')} className="bg-white rounded-2xl p-5 shadow-aisle cursor-pointer hover:shadow-aisle-md transition">
            <div className="text-[13px] font-medium text-slate-400">Pending Confirmations</div>
            <div className="mt-2 font-display text-2xl font-semibold text-slate-900 metric-tracking">2,145</div>
            <div className="mt-1.5 text-[12px] text-amber-600 font-medium">↗ 11.3% queued for AI call</div>
          </div>
          <div onClick={() => onNavigate('tracking')} className="bg-white rounded-2xl p-5 shadow-aisle cursor-pointer hover:shadow-aisle-md transition">
            <div className="text-[13px] font-medium text-slate-400">Delivered Orders</div>
            <div className="mt-2 font-display text-2xl font-semibold text-slate-900 metric-tracking">9,247</div>
            <div className="mt-1.5 text-[12px] text-emerald-600 font-medium">↗ 21.8% vs last 7 days</div>
          </div>
          <div onClick={() => onNavigate('tracking')} className="bg-white rounded-2xl p-5 shadow-aisle cursor-pointer hover:shadow-aisle-md transition">
            <div className="text-[13px] font-medium text-slate-400">Failed Deliveries</div>
            <div className="mt-2 font-display text-2xl font-semibold text-slate-900 metric-tracking">312</div>
            <div className="mt-1.5 text-[12px] text-emerald-600 font-medium">↘ 8.4% RTO reduced</div>
          </div>
          <div onClick={() => onNavigate('whatsapp')} className="bg-white rounded-2xl p-5 shadow-aisle cursor-pointer hover:shadow-aisle-md transition">
            <div className="text-[13px] font-medium text-slate-400">WhatsApp Sent</div>
            <div className="mt-2 font-display text-2xl font-semibold text-slate-900 metric-tracking">15,692</div>
            <div className="mt-1.5 text-[12px] text-emerald-600 font-medium">↗ 15.1% vs last 7 days</div>
          </div>
        </div>
      )}

      {/* Middle Row: 2/3 Revenue & Order Flow Chart + 1/3 Recent Orders / Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 shadow-aisle flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-4">
                  <h2 className="font-display font-semibold text-[16px] text-slate-900">Revenue &amp; Order Flow</h2>
                  <div className="hidden sm:flex items-center gap-3 text-[12px] text-slate-500">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#2563EB]" /> Orders &amp; Revenue</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Delivered</span>
                  </div>
                </div>
                <p className="text-[12.5px] text-slate-400 mt-0.5">{cfg.subtitle}</p>
              </div>
              <div className="bg-[#F2F4F8] p-1 rounded-xl inline-flex items-center text-[12.5px] font-medium">
                {(['day', 'week', 'month'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1 rounded-lg capitalize transition ${
                      period === p ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-baseline justify-between gap-4">
              <div className="flex items-baseline gap-2.5">
                <span className="font-display text-[28px] font-semibold text-slate-900 metric-tracking">{cfg.metric}</span>
                <span className="text-[12.5px] font-medium text-emerald-600">{cfg.trend}</span>
              </div>
              <div className="flex items-center gap-5 text-[12.5px]">
                <div>
                  <span className="text-slate-400">COD Amount: </span>
                  <strong className="text-slate-800 font-semibold tabular-nums">₹11,25,300</strong>
                </div>
                <div>
                  <span className="text-slate-400">Refunds: </span>
                  <strong className="text-rose-600 font-semibold tabular-nums">₹45,680</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-2">
            <div className="relative h-52 w-full">
              <svg viewBox="0 0 700 200" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="aisleBlueGradReact" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.14" />
                    <stop offset="85%" stopColor="#2563EB" stopOpacity="0.01" />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="35" x2="700" y2="35" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="0" y1="95" x2="700" y2="95" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="0" y1="155" x2="700" y2="155" stroke="#F1F5F9" strokeWidth="1" />

                <path d={cfg.area} fill="url(#aisleBlueGradReact)" className="transition-all duration-500" />
                <path d={cfg.deliveredLine} fill="none" stroke="#10B981" strokeWidth="1.8" strokeDasharray="4 4" strokeLinecap="round" className="transition-all duration-500" />
                <path d={cfg.line} fill="none" stroke="#2563EB" strokeWidth="2.4" strokeLinecap="round" className="transition-all duration-500" />
              </svg>
            </div>
            <div className="grid grid-cols-7 text-center text-[12px] text-slate-400 pt-2">
              {cfg.labels.map((lbl) => (
                <span key={lbl}>{lbl}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Recent Orders / Recent Activities Toggle */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-aisle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="bg-[#F2F4F8] p-1 rounded-xl inline-flex items-center text-[12px] font-medium">
                <button
                  onClick={() => setRightFeedTab('orders')}
                  className={`px-2.5 py-1 rounded-lg transition ${rightFeedTab === 'orders' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'}`}
                >
                  Recent Orders
                </button>
                <button
                  onClick={() => setRightFeedTab('activities')}
                  className={`px-2.5 py-1 rounded-lg transition ${rightFeedTab === 'activities' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'}`}
                >
                  Activities
                </button>
              </div>
              <button
                onClick={() => onNavigate(rightFeedTab === 'orders' ? 'orders' : 'ai-calling')}
                className="text-[13px] font-medium text-[#2563EB] hover:text-[#1D4ED8]"
              >
                View all
              </button>
            </div>

            {rightFeedTab === 'orders' ? (
              <div className="divide-y divide-slate-100">
                {orders.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onNavigate('orders')}
                    className="py-3 first:pt-0 last:pb-0 flex items-center justify-between cursor-pointer hover:bg-slate-50/60 -mx-2 px-2 rounded-xl transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[#F1F5F9] text-slate-600 font-semibold text-[12px] flex items-center justify-center shrink-0">
                        {item.initials}
                      </div>
                      <div className="truncate">
                        <div className="text-[13.5px] font-medium text-slate-900 truncate">{item.customer}</div>
                        <div className="text-[11.5px] text-slate-400">#{item.id} · {item.createdAt.split(',')[1] || 'Today'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${getOrderStatusBadgeClass(item.status)}`}>
                        {item.status}
                      </span>
                      <span className="text-[13.5px] font-semibold text-slate-900 tabular-nums w-16 text-right">
                        {formatINR(item.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentActivities.map((act, i) => {
                  const Icon = act.icon;
                  return (
                    <div key={i} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${act.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <div className="text-[13px] font-medium text-slate-900 truncate">{act.title}</div>
                          <div className="text-[11.5px] text-slate-400 truncate">{act.desc}</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[11px] text-slate-400">{act.time}</div>
                        <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10.5px] font-medium ${act.badgeClass}`}>
                          {act.badge}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Screenshot 3 Analytics Row: Order Status Distribution + Call Success Gauge + Customer Satisfaction */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Order Status Distribution Donut */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-aisle">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-[16px] text-slate-900">Order Status Distribution</h2>
            <button onClick={() => onNavigate('orders')} className="text-[12.5px] font-medium text-[#2563EB] hover:underline">Manage</button>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-36 h-36 shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#F1F5F9" strokeWidth="4" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#F59E0B" strokeWidth="4" strokeDasharray="14.7 100" strokeDashoffset="0" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#2563EB" strokeWidth="4" strokeDasharray="22 100" strokeDashoffset="-14.7" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#6366F1" strokeWidth="4" strokeDasharray="20.4 100" strokeDashoffset="-36.7" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#0EA5E9" strokeWidth="4" strokeDasharray="14.7 100" strokeDashoffset="-57.1" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#10B981" strokeWidth="4" strokeDasharray="14 100" strokeDashoffset="-71.8" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#EF4444" strokeWidth="4" strokeDasharray="2.2 100" strokeDashoffset="-85.8" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-display text-lg font-semibold text-slate-900 tabular-nums">12,854</span>
                <span className="text-[10.5px] text-slate-400">Total Orders</span>
              </div>
            </div>
            <div className="flex-1 w-full space-y-2 text-[12.5px]">
              {[
                { label: 'Pending', count: '2,145', pct: '16.7%', dot: 'bg-amber-500' },
                { label: 'Confirmed', count: '3,214', pct: '25.0%', dot: 'bg-[#2563EB]' },
                { label: 'Shipped', count: '2,987', pct: '23.2%', dot: 'bg-indigo-500' },
                { label: 'Out for Delivery', count: '2,156', pct: '16.8%', dot: 'bg-sky-500' },
                { label: 'Delivered', count: '2,040', pct: '15.9%', dot: 'bg-emerald-500' },
                { label: 'Failed / Returned', count: '312', pct: '2.4%', dot: 'bg-rose-500' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className={`w-2 h-2 rounded-full ${row.dot}`} />
                    <span>{row.label}</span>
                  </span>
                  <span className="font-medium text-slate-900 tabular-nums">
                    {row.count} <span className="text-slate-400 font-normal">({row.pct})</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call Success Rate Gauge */}
        <div onClick={() => onNavigate('ai-calling')} className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-aisle flex flex-col justify-between cursor-pointer hover:shadow-aisle-md transition">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-[16px] text-slate-900">Call Success Rate</h2>
            <span className="text-[11.5px] text-emerald-600 font-medium">↗ 6.2%</span>
          </div>
          <div className="my-4 flex flex-col items-center">
            <div className="relative w-44 h-24 overflow-hidden">
              <svg viewBox="0 0 100 55" className="w-full h-full">
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#F1F5F9" strokeWidth="9" strokeLinecap="round" />
                <path d="M 10 50 A 40 40 0 0 1 87 38" fill="none" stroke="#10B981" strokeWidth="9" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-x-0 bottom-0 text-center">
                <div className="font-display text-2xl font-semibold text-slate-900 metric-tracking">92.6%</div>
                <div className="text-[11px] text-slate-400">vs last 7 days</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-[12.5px]">
            <div>
              <span className="text-slate-400 block">Successful Calls</span>
              <strong className="text-emerald-600 font-semibold tabular-nums">7,823</strong>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block">Unanswered</span>
              <strong className="text-rose-600 font-semibold tabular-nums">633</strong>
            </div>
          </div>
        </div>

        {/* Customer Satisfaction Donut */}
        <div onClick={() => onNavigate('feedback')} className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-aisle flex flex-col justify-between cursor-pointer hover:shadow-aisle-md transition">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-[16px] text-slate-900">Customer Satisfaction</h2>
            <span className="text-[12.5px] font-medium text-[#2563EB]">View Feedback →</span>
          </div>
          <div className="flex items-center gap-5 my-auto">
            <div className="relative w-32 h-32 shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#F1F5F9" strokeWidth="3.8" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#10B981" strokeWidth="3.8" strokeDasharray="62 100" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#F59E0B" strokeWidth="3.8" strokeDasharray="16 100" strokeDashoffset="-62" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#EF4444" strokeWidth="3.8" strokeDasharray="10 100" strokeDashoffset="-78" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-xl font-semibold text-slate-900">4.6<span className="text-xs text-slate-400">/5</span></span>
                <span className="text-[10px] text-amber-500">★★★★★</span>
              </div>
            </div>
            <div className="flex-1 space-y-2.5 text-[12.5px]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Positive</span>
                <strong className="text-slate-900 tabular-nums">2,458 <span className="text-slate-400 font-normal">(70.1%)</span></strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600"><span className="w-2 h-2 rounded-full bg-amber-500" /> Neutral</span>
                <strong className="text-slate-900 tabular-nums">632 <span className="text-slate-400 font-normal">(18.0%)</span></strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600"><span className="w-2 h-2 rounded-full bg-rose-500" /> Negative</span>
                <strong className="text-slate-900 tabular-nums">413 <span className="text-slate-400 font-normal">(11.9%)</span></strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Top Products + Automation by Channel (Exact HTML Prototype) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 shadow-aisle">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-[16px] text-slate-900">Top Products</h2>
            <button onClick={() => onNavigate('orders')} className="text-[13px] font-medium text-[#2563EB] hover:text-[#1D4ED8]">
              View all
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            <div className="py-3.5 first:pt-0 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#F1F5F9] flex items-center justify-center text-slate-700">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[14px] font-medium text-slate-900">Wireless ANC Earbuds Pro</div>
                  <div className="text-[12px] text-slate-400">1,245 units sold · 1,156 delivered</div>
                </div>
              </div>
              <div className="text-[14px] font-semibold text-slate-900 tabular-nums">₹12,45,000</div>
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#F1F5F9] flex items-center justify-center text-slate-700">
                  <Speaker className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[14px] font-medium text-slate-900">Terra Bluetooth Speaker</div>
                  <div className="text-[12px] text-slate-400">987 units sold · 912 delivered</div>
                </div>
              </div>
              <div className="text-[14px] font-semibold text-slate-900 tabular-nums">₹9,85,200</div>
            </div>

            <div className="py-3.5 last:pb-0 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#F1F5F9] flex items-center justify-center text-slate-700">
                  <Watch className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[14px] font-medium text-slate-900">Nordic Smart Fitness Watch</div>
                  <div className="text-[12px] text-slate-400">856 units sold · 798 delivered</div>
                </div>
              </div>
              <div className="text-[14px] font-semibold text-slate-900 tabular-nums">₹8,45,600</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 bg-white rounded-2xl p-6 shadow-aisle flex flex-col justify-between">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-[16px] text-slate-900">Automation by Channel</h2>
            <button onClick={() => onShowToast('Automation channel breakdown synced')} className="text-[12.5px] text-slate-400 hover:text-slate-600">
              This month
            </button>
          </div>

          <div className="space-y-6 my-auto">
            <div>
              <div className="flex items-center justify-between text-[13.5px] mb-2">
                <span className="flex items-center gap-2 text-slate-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                  <span>AI Voice Pre-Shipment Calls</span>
                </span>
                <span className="space-x-1.5">
                  <strong className="font-semibold text-slate-900 tabular-nums">8,456 confirmed</strong>
                  <span className="text-slate-400 text-[12px]">62%</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#F1F5F9] overflow-hidden">
                <div className="h-full rounded-full bg-[#2563EB]" style={{ width: '62%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[13.5px] mb-2">
                <span className="flex items-center gap-2 text-slate-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span>WhatsApp COD &amp; Tracking Flows</span>
                </span>
                <span className="space-x-1.5">
                  <strong className="font-semibold text-slate-900 tabular-nums">15,692 sent</strong>
                  <span className="text-slate-400 text-[12px]">27%</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#F1F5F9] overflow-hidden">
                <div className="h-full rounded-full bg-indigo-500" style={{ width: '27%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[13.5px] mb-2">
                <span className="flex items-center gap-2 text-slate-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  <span>Automated NDR &amp; Delay Recovery</span>
                </span>
                <span className="space-x-1.5">
                  <strong className="font-semibold text-slate-900 tabular-nums">1,420 resolved</strong>
                  <span className="text-slate-400 text-[12px]">11%</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#F1F5F9] overflow-hidden">
                <div className="h-full rounded-full bg-sky-500" style={{ width: '11%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
