import React from 'react';
import {
  ArrowRight,
  BarChart3,
  Check,
  Layers,
  MessageCircle,
  PhoneCall,
  PhoneOutgoing,
  PackageCheck,
  PlayCircle,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  Zap,
} from 'lucide-react';
import { ViewName } from '../types';

interface LandingPageViewProps {
  onNavigate: (view: ViewName) => void;
  onNavigateRoute?: (path: '/' | '/login' | '/signup' | '/dashboard' | '/admin', targetView?: ViewName) => void;
  isAuthenticated?: boolean;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onNavigate,
  onNavigateRoute,
  isAuthenticated = false,
}) => {
  const goAuthOrDashboard = (targetView?: ViewName) => {
    if (onNavigateRoute) {
      onNavigateRoute(isAuthenticated ? '/dashboard' : '/login', targetView);
    } else if (targetView) {
      onNavigate(targetView);
    }
  };
  return (
    <div className="min-h-screen bg-[#EEF1FA] flex flex-col relative isolate overflow-hidden">
      {/* Blurred Periwinkle Gradient Background Layer */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[920px] h-[520px] rounded-full bg-gradient-to-tr from-[#8EA2FF]/45 via-[#A5B4FC]/40 to-[#C7D2FE]/50 blur-[120px]" />
        <div className="absolute top-[28%] -left-36 w-[620px] h-[520px] rounded-full bg-[#9BA9FF]/35 blur-[130px]" />
        <div className="absolute top-[42%] -right-36 w-[640px] h-[560px] rounded-full bg-[#818CF8]/30 blur-[140px]" />
        <div className="absolute bottom-0 inset-x-0 h-[420px] bg-gradient-to-t from-[#C3CBFF]/35 via-transparent to-transparent blur-[100px]" />
      </div>

      {/* Top Sticky Minimal Header */}
      <header className="sticky top-0 z-30 bg-[#F2F4F8]/85 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <button onClick={() => onNavigateRoute?.('/')} className="flex items-center gap-2.5 text-left group">
              <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white shadow-sm">
                <Layers className="w-4 h-4" />
              </div>
              <span className="font-display font-semibold text-[17px] tracking-tight text-slate-900">octxAI</span>
            </button>
            <nav className="hidden md:flex items-center gap-7 text-[14px] font-medium text-slate-600">
              <a href="#features-grid" className="hover:text-slate-900 transition-colors">Platform</a>
              <a href="#workflow-section" className="hover:text-slate-900 transition-colors">AI Voice &amp; WhatsApp</a>
              <a href="#metrics-strip" className="hover:text-slate-900 transition-colors">Customer Stories</a>
              <button onClick={() => goAuthOrDashboard('billing')} className="hover:text-slate-900 transition-colors">Pricing</button>
            </nav>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3">
            <button
              onClick={() => onNavigateRoute?.('/login')}
              className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-[12px] sm:text-[13.5px] font-medium text-slate-700 hover:text-slate-900 rounded-lg sm:rounded-xl hover:bg-white/60 transition-all whitespace-nowrap"
            >
              Sign in
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-14 pb-16 px-4 sm:px-8 max-w-7xl mx-auto text-center w-full">
        {/* <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-white shadow-aisle text-[10.5px] sm:text-[12.5px] font-medium text-slate-600 mb-4 sm:mb-6 max-w-full">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#2563EB] shrink-0" />
          <span>AI-Powered Communication OS for Indian Marketplace Sellers</span>
        </div> */}
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-white shadow-aisle text-[10.5px] sm:text-[12.5px] font-medium text-slate-600 mb-4 sm:mb-6 max-w-full">
  <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2 shrink-0">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2563EB] opacity-75"></span>
    <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-[#2563EB]"></span>
  </span>
  <span>AI-Powered Communication OS for Indian Marketplace Sellers</span>
</div>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-[56px] font-semibold text-slate-900 tracking-tight leading-[1.1] max-w-4xl mx-auto">
          Automate calls, WhatsApp &amp; delivery updates with <span className="text-[#2563EB]">quiet precision.</span>
        </h1>
        <p className="mt-5 text-[16px] sm:text-[18px] text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
          Octxai helps Amazon, Flipkart, and D2C sellers verify COD orders via human-like Hindi/Hinglish AI calls, send instant WhatsApp updates, and reduce NDR returns.
        </p>

        {/* Hero Actions */}
        <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5">
          <button
            onClick={() => onNavigateRoute?.(isAuthenticated ? '/dashboard' : '/signup')}
            className="px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-[12.5px] sm:text-[14.5px] shadow-sm transition-all flex items-center gap-1.5 sm:gap-2"
          >
            <span>{isAuthenticated ? 'Go to Dashboard' : 'Start 14-Day Free Trial'}</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={() => goAuthOrDashboard('ai-calling')}
            className="px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-medium text-[12.5px] sm:text-[14.5px] shadow-aisle transition-all flex items-center gap-1.5 sm:gap-2"
          >
            <PlayCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2563EB]" />
            <span>Listen to Live AI Call Demo</span>
          </button>
        </div>

        {/* Trust Sub-bar */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-6 text-[13px] text-slate-500">
          <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-600" /> No credit card required</span>
          <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-[#2563EB]" /> 2-minute Amazon &amp; Shiprocket sync</span>
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-slate-500" /> Official WhatsApp Business API</span>
        </div>

        {/* Interactive Framed "Aisle" Preview Window */}
        <div className="mt-12 rounded-[24px] p-3 sm:p-5 bg-gradient-to-b from-[#DDE4F0] to-[#E6ECF5] shadow-aisle-frame text-left">
          <div className="bg-[#F2F4F8] rounded-[18px] p-4 sm:p-6 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center text-white">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="font-display font-semibold text-[15px] text-slate-900">Octxai Workspace</span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs font-medium text-slate-500">Interactive Live Preview</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => goAuthOrDashboard('overview')} className="px-3 py-1.5 rounded-lg bg-white text-slate-700 hover:text-[#2563EB] text-xs font-medium shadow-aisle transition">
                  Overview
                </button>
                <button onClick={() => goAuthOrDashboard('ai-calling')} className="px-3 py-1.5 rounded-lg bg-white text-slate-700 hover:text-[#2563EB] text-xs font-medium shadow-aisle transition">
                  AI Calling
                </button>
                <button onClick={() => goAuthOrDashboard('tracking')} className="px-3 py-1.5 rounded-lg bg-white text-slate-700 hover:text-[#2563EB] text-xs font-medium shadow-aisle transition">
                  Live Tracking
                </button>
                <button onClick={() => goAuthOrDashboard('overview')} className="px-3 py-1.5 rounded-lg bg-[#2563EB] text-white text-xs font-medium shadow-sm transition">
                  Enter Full Dashboard →
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 shadow-aisle">
                <div className="flex items-center justify-between text-[13px] text-slate-500 font-medium">
                  <span>Total Orders</span>
                  <span className="w-8 h-8 rounded-lg bg-slate-100/80 flex items-center justify-center text-[#2563EB]">
                    <ShoppingBag className="w-4 h-4" />
                  </span>
                </div>
                <div className="mt-3 font-display text-2xl font-semibold text-slate-900 metric-tracking">12,854</div>
                <div className="mt-2 text-[12px] text-slate-400"><span className="text-emerald-600 font-medium">↗ 18.5%</span> vs last month</div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-aisle">
                <div className="flex items-center justify-between text-[13px] text-slate-500 font-medium">
                  <span>AI Calls Confirmed</span>
                  <span className="w-8 h-8 rounded-lg bg-slate-100/80 flex items-center justify-center text-[#2563EB]">
                    <PhoneCall className="w-4 h-4" />
                  </span>
                </div>
                <div className="mt-3 font-display text-2xl font-semibold text-slate-900 metric-tracking">8,456</div>
                <div className="mt-2 text-[12px] text-slate-400"><span className="text-emerald-600 font-medium">↗ 20.3%</span> vs last month</div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-aisle">
                <div className="flex items-center justify-between text-[13px] text-slate-500 font-medium">
                  <span>Delivered Orders</span>
                  <span className="w-8 h-8 rounded-lg bg-slate-100/80 flex items-center justify-center text-[#2563EB]">
                    <PackageCheck className="w-4 h-4" />
                  </span>
                </div>
                <div className="mt-3 font-display text-2xl font-semibold text-slate-900 metric-tracking">9,247</div>
                <div className="mt-2 text-[12px] text-slate-400"><span className="text-emerald-600 font-medium">↗ 21.8%</span> vs last month</div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-aisle">
                <div className="flex items-center justify-between text-[13px] text-slate-500 font-medium">
                  <span>Customer Rating</span>
                  <span className="w-8 h-8 rounded-lg bg-slate-100/80 flex items-center justify-center text-[#2563EB]">
                    <Star className="w-4 h-4" />
                  </span>
                </div>
                <div className="mt-3 font-display text-2xl font-semibold text-slate-900 metric-tracking">4.6 / 5</div>
                <div className="mt-2 text-[12px] text-slate-400"><span className="text-emerald-600 font-medium">+0.4</span> this month</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Core Capabilities Bar */}
      <section id="features-grid" className="py-10 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div onClick={() => goAuthOrDashboard('ai-calling')} className="bg-white rounded-2xl p-5 shadow-aisle hover:shadow-aisle-md transition cursor-pointer group">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center mb-3.5 group-hover:bg-[#2563EB] group-hover:text-white transition">
              <PhoneOutgoing className="w-4 h-4" />
            </div>
            <h3 className="font-display font-semibold text-[15px] text-slate-900">AI Voice Calls</h3>
            <p className="mt-1.5 text-[13px] text-slate-500 leading-relaxed">Automate calls for COD confirmation, address verification &amp; feedback.</p>
          </div>

          <div onClick={() => goAuthOrDashboard('whatsapp')} className="bg-white rounded-2xl p-5 shadow-aisle hover:shadow-aisle-md transition cursor-pointer group">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3.5 group-hover:bg-emerald-600 group-hover:text-white transition">
              <MessageCircle className="w-4 h-4" />
            </div>
            <h3 className="font-display font-semibold text-[15px] text-slate-900">WhatsApp Automation</h3>
            <p className="mt-1.5 text-[13px] text-slate-500 leading-relaxed">Send instant order updates, delivery alerts, and COD-to-prepaid nudges.</p>
          </div>

          <div onClick={() => goAuthOrDashboard('tracking')} className="bg-white rounded-2xl p-5 shadow-aisle hover:shadow-aisle-md transition cursor-pointer group">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center mb-3.5 group-hover:bg-[#2563EB] group-hover:text-white transition">
              <Truck className="w-4 h-4" />
            </div>
            <h3 className="font-display font-semibold text-[15px] text-slate-900">Smart Tracking</h3>
            <p className="mt-1.5 text-[13px] text-slate-500 leading-relaxed">Real-time courier tracking across Delhivery, BlueDart &amp; XpressBees.</p>
          </div>

          <div onClick={() => goAuthOrDashboard('feedback')} className="bg-white rounded-2xl p-5 shadow-aisle hover:shadow-aisle-md transition cursor-pointer group">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3.5 group-hover:bg-amber-500 group-hover:text-white transition">
              <Star className="w-4 h-4" />
            </div>
            <h3 className="font-display font-semibold text-[15px] text-slate-900">Customer Feedback</h3>
            <p className="mt-1.5 text-[13px] text-slate-500 leading-relaxed">Collect post-delivery reviews, analyze sentiment &amp; boost marketplace ratings.</p>
          </div>

          <div onClick={() => goAuthOrDashboard('reports')} className="bg-white rounded-2xl p-5 shadow-aisle hover:shadow-aisle-md transition cursor-pointer group">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-3.5 group-hover:bg-slate-900 group-hover:text-white transition">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="font-display font-semibold text-[15px] text-slate-900">Analytics &amp; Reports</h3>
            <p className="mt-1.5 text-[13px] text-slate-500 leading-relaxed">Actionable unit economics, RTO reduction metrics &amp; SKU performance.</p>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow-section" className="py-4 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-aisle grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <span className="text-xs font-semibold text-[#2563EB]">01 · Order Sync</span>
            <h3 className="font-display font-semibold text-[16px] text-slate-900 mt-1">Instant Marketplace Ingestion</h3>
            <p className="text-[13px] text-slate-500 mt-1.5 leading-relaxed">
              New COD and prepaid orders from Amazon, Flipkart, and Shopify sync automatically in under 5 seconds.
            </p>
          </div>
          <div>
            <span className="text-xs font-semibold text-[#2563EB]">02 · AI Voice &amp; WhatsApp</span>
            <h3 className="font-display font-semibold text-[16px] text-slate-900 mt-1">Human-Like Hinglish Verification</h3>
            <p className="text-[13px] text-slate-500 mt-1.5 leading-relaxed">
              Neural voices confirm addresses, convert COD to UPI prepaid with instant discounts, and handle NDR retries.
            </p>
          </div>
          <div>
            <span className="text-xs font-semibold text-[#2563EB]">03 · Post-Delivery Shield</span>
            <h3 className="font-display font-semibold text-[16px] text-slate-900 mt-1">Review Booster &amp; Analytics</h3>
            <p className="text-[13px] text-slate-500 mt-1.5 leading-relaxed">
              Route happy buyers to public reviews while intercepting negative feedback directly to your support team.
            </p>
          </div>
        </div>
      </section>

      {/* Trusted By 10,000+ Sellers Across India */}
      <section id="metrics-strip" className="py-12 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-white rounded-2xl p-8 shadow-aisle">
          <p className="text-center text-[13px] font-medium uppercase tracking-wider text-slate-400 mb-8">Trusted by 10,000+ Sellers Across India</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div className="pt-4 md:pt-0">
              <div className="font-display text-3xl font-semibold text-slate-900 metric-tracking">10,000+</div>
              <div className="mt-1 text-[13px] text-slate-500">Active Sellers</div>
            </div>
            <div className="pt-4 md:pt-0">
              <div className="font-display text-3xl font-semibold text-slate-900 metric-tracking">25 Lakh+</div>
              <div className="mt-1 text-[13px] text-slate-500">Orders Processed</div>
            </div>
            <div className="pt-4 md:pt-0">
              <div className="font-display text-3xl font-semibold text-slate-900 metric-tracking">50 Lakh+</div>
              <div className="mt-1 text-[13px] text-slate-500">AI Calls Completed</div>
            </div>
            <div className="pt-4 md:pt-0">
              <div className="font-display text-3xl font-semibold text-slate-900 metric-tracking">1 Cr+</div>
              <div className="mt-1 text-[13px] text-slate-500">WhatsApp Sent</div>
            </div>
            <div className="pt-4 md:pt-0 col-span-2 md:col-span-1">
              <div className="font-display text-3xl font-semibold text-slate-900 metric-tracking">4.7 / 5</div>
              <div className="mt-1 text-[13px] text-slate-500">Customer Rating</div>
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-auto py-8 px-4 sm:px-8 border-t border-slate-200/60 text-center text-[13px] text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>© 2025 octxAI Technologies Pvt. Ltd. Crafted with minimal precision.</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => onNavigateRoute?.('/admin')}
              className="text-slate-500 hover:text-slate-900 font-medium transition-colors"
            >
              Admin Portal
            </button>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <button onClick={() => goAuthOrDashboard('overview')} className="text-[#2563EB] font-medium hover:underline">
              {isAuthenticated ? 'Return to Seller Dashboard →' : 'Sign in to Seller Dashboard →'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
