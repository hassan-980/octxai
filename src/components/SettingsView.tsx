import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Copy,
  CreditCard,
  Eye,
  EyeOff,
  Key,
  RefreshCw,
  Shield,
  ShieldCheck,
  Store,
  Truck,
  User,
  Webhook,
  X,
} from 'lucide-react';
import { ConnectedAccount, SellerSettingsState, ViewName } from '../types';
import { getInitials } from '../utils/helpers';

interface SettingsViewProps {
  settings: SellerSettingsState;
  connectedAccounts: ConnectedAccount[];
  walletBalance: number;
  creditsUsed: number;
  creditsTotal: number;
  onUpdateSettings: (next: SellerSettingsState) => void;
  onToggleConnectedAccount: (id: string) => void;
  onNavigate: (view: ViewName) => void;
  onShowToast: (msg: string) => void;
}

type SettingsTab =
  | 'profile'
  | 'store'
  | 'notifications'
  | 'payment'
  | 'shipping'
  | 'api'
  | 'security';

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  connectedAccounts,
  walletBalance,
  creditsUsed,
  creditsTotal,
  onUpdateSettings,
  onToggleConnectedAccount,
  onNavigate,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [draft, setDraft] = useState<SellerSettingsState>(settings);

  // Change Password state (Screenshot 7)
  const [currentPwd, setCurrentPwd] = useState('••••••••••');
  const [newPwd, setNewPwd] = useState('••••••••••••');
  const [confirmPwd, setConfirmPwd] = useState('••••••••••••');
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  // 2FA Modal
  const [show2FAModal, setShow2FAModal] = useState(false);

  // API Key state
  const [apiKey, setApiKey] = useState('ss_live_98f2a4c71e8b309d4e21a6f7');
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(draft);
    onShowToast('Seller profile & store settings saved');
  };

  return (
    <section className="view-section space-y-5">
      {/* Horizontal Settings Sub-Navigation (exact match to Screenshot 7) */}
      <div className="bg-white p-1.5 rounded-2xl shadow-aisle flex flex-wrap items-center gap-1 text-[13px] font-medium">
        {[
          { id: 'profile', label: 'Profile Settings', icon: User },
          { id: 'store', label: 'Store Settings', icon: Store },
          { id: 'notifications', label: 'Notification Settings', icon: Bell },
          { id: 'payment', label: 'Payment Settings', icon: CreditCard },
          { id: 'shipping', label: 'Shipping Settings', icon: Truck },
          { id: 'api', label: 'API & Integrations', icon: Webhook },
          { id: 'security', label: 'Security Settings', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition ${
                active ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:bg-[#F2F4F8]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 8 Cols: Main Active Tab Content */}
        <div className="lg:col-span-8 space-y-5">
          {activeTab === 'profile' && (
            <>
              {/* Profile Information Card */}
              <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl p-6 shadow-aisle">
                <h2 className="font-display font-semibold text-[16px] text-slate-900 pb-4 border-b border-slate-100">
                  Profile Information
                </h2>

                <div className="mt-5 flex flex-col sm:flex-row gap-6">
                  {/* Avatar Column */}
                  <div className="flex flex-col items-center shrink-0">
                    <div
                      aria-label={draft.fullName}
                      className="w-24 h-24 rounded-full bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-white font-display font-semibold text-[28px] tracking-tight ring-4 ring-blue-50 shadow-aisle flex items-center justify-center select-none"
                    >
                      {getInitials(draft.fullName) || 'U'}
                    </div>
                    <button
                      type="button"
                      onClick={() => onShowToast('Profile photo updated')}
                      className="mt-3 px-3.5 py-1.5 rounded-xl bg-[#F2F4F8] hover:bg-slate-200 text-slate-700 text-[12px] font-medium transition"
                    >
                      Change Photo
                    </button>
                    <span className="text-[11px] text-slate-400 mt-1">JPG, PNG up to 2MB</span>
                  </div>

                  {/* Form Grid */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13.5px]">
                    <div>
                      <label className="block text-slate-500 text-[12px] font-medium mb-1">Full Name</label>
                      <input
                        type="text"
                        value={draft.fullName}
                        onChange={(e) => setDraft({ ...draft, fullName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F4F8] text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 text-[12px] font-medium mb-1">Email Address</label>
                      <input
                        type="email"
                        value={draft.email}
                        onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F4F8] text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 text-[12px] font-medium mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={draft.phone}
                        onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F4F8] text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 text-[12px] font-medium mb-1">Business Name</label>
                      <input
                        type="text"
                        value={draft.businessName}
                        onChange={(e) => setDraft({ ...draft, businessName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F4F8] text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 text-[12px] font-medium mb-1">Business Type</label>
                      <select
                        value={draft.businessType}
                        onChange={(e) => setDraft({ ...draft, businessType: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F4F8] text-slate-900 font-medium focus:outline-none"
                      >
                        <option>Online Seller</option>
                        <option>D2C Brand</option>
                        <option>Marketplace Aggregator</option>
                        <option>Wholesaler / Distributor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-500 text-[12px] font-medium mb-1">Time Zone</label>
                      <select
                        value={draft.timeZone}
                        onChange={(e) => setDraft({ ...draft, timeZone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F4F8] text-slate-900 font-medium focus:outline-none"
                      >
                        <option>(GMT +05:30) Asia/Kolkata</option>
                        <option>(GMT +00:00) UTC</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-slate-500 text-[12px] font-medium mb-1">Warehouse Address</label>
                      <input
                        type="text"
                        value={draft.address}
                        onChange={(e) => setDraft({ ...draft, address: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F4F8] text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                  <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13.5px] font-medium shadow-sm transition">
                    Save Changes
                  </button>
                </div>
              </form>

              {/* Change Password & 2FA Row (from Screenshot 7) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                <div className="md:col-span-7 bg-white rounded-2xl p-6 shadow-aisle">
                  <h3 className="font-display font-semibold text-[15px] text-slate-900 mb-4">Change Password</h3>
                  <div className="space-y-3 text-[13px]">
                    <div>
                      <label className="block text-slate-500 text-xs mb-1">Current Password</label>
                      <input
                        type="password"
                        value={currentPwd}
                        onChange={(e) => setCurrentPwd(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#F2F4F8] text-slate-900 focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="relative">
                        <label className="block text-slate-500 text-xs mb-1">New Password</label>
                        <input
                          type={showNewPwd ? 'text' : 'password'}
                          value={newPwd}
                          onChange={(e) => setNewPwd(e.target.value)}
                          className="w-full pl-3.5 pr-9 py-2 rounded-xl bg-[#F2F4F8] text-slate-900 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPwd(!showNewPwd)}
                          className="absolute right-2.5 top-7 text-slate-400 hover:text-slate-600"
                        >
                          {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="relative">
                        <label className="block text-slate-500 text-xs mb-1">Confirm Password</label>
                        <input
                          type={showConfirmPwd ? 'text' : 'password'}
                          value={confirmPwd}
                          onChange={(e) => setConfirmPwd(e.target.value)}
                          className="w-full pl-3.5 pr-9 py-2 rounded-xl bg-[#F2F4F8] text-slate-900 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                          className="absolute right-2.5 top-7 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onShowToast('Password updated securely')}
                      className="mt-1 px-4 py-2 rounded-xl bg-[#F2F4F8] hover:bg-[#2563EB] text-slate-800 hover:text-white text-[12.5px] font-medium transition"
                    >
                      Update Password
                    </button>
                  </div>
                </div>

                <div className="md:col-span-5 bg-white rounded-2xl p-6 shadow-aisle flex flex-col justify-between">
                  <div>
                    <h3 className="font-display font-semibold text-[15px] text-slate-900">Two-Factor Authentication</h3>
                    <p className="text-[12px] text-slate-400 mt-1">Add an extra layer of security to your seller account</p>
                    <div className="mt-4 p-3 rounded-xl bg-[#F8FAFC] flex items-center justify-between text-[13px]">
                      <span className="text-slate-600 font-medium">2FA Status</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${settings.twoFactorEnabled ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        {settings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShow2FAModal(true)}
                    className="mt-4 w-full py-2.5 rounded-xl bg-[#F2F4F8] hover:bg-slate-200 text-slate-800 text-[13px] font-medium transition"
                  >
                    Manage 2FA
                  </button>
                </div>
              </div>

              {/* Connected Accounts Strip (from Screenshot 7) */}
              <div className="bg-white rounded-2xl p-6 shadow-aisle">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-display font-semibold text-[16px] text-slate-900">Connected Accounts</h3>
                    <p className="text-[12px] text-slate-400">Manage your connected third-party marketplace &amp; payment integrations</p>
                  </div>
                  <button onClick={() => setActiveTab('api')} className="text-[12.5px] font-medium text-[#2563EB] hover:underline">
                    Manage Integrations →
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-[13px]">
                  {connectedAccounts.map((ca) => (
                    <div
                      key={ca.id}
                      onClick={() => {
                        onToggleConnectedAccount(ca.id);
                        onShowToast(`${ca.name} ${ca.connected ? 'disconnected' : 'connected'}`);
                      }}
                      className="p-3.5 rounded-xl bg-[#F8FAFC] hover:bg-slate-100 cursor-pointer flex items-center justify-between transition"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold text-slate-900 truncate">{ca.name}</div>
                        <div className="text-[11.5px] text-slate-400 truncate">{ca.identifier}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0 ${ca.connected ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-200 text-slate-600'}`}>
                        {ca.connected ? 'Connected' : 'Paused'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* STORE SETTINGS */}
          {activeTab === 'store' && (
            <div className="bg-white rounded-2xl p-6 shadow-aisle space-y-4 text-[13.5px]">
              <h2 className="font-display font-semibold text-[16px] text-slate-900 pb-3 border-b border-slate-100">Store &amp; GST Configuration</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 text-xs font-medium mb-1">Store Display Name</label>
                  <input
                    type="text"
                    value={draft.businessName}
                    onChange={(e) => setDraft({ ...draft, businessName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F4F8]"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-xs font-medium mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={draft.gstin}
                    onChange={(e) => setDraft({ ...draft, gstin: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F4F8] font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-500 text-xs font-medium mb-1">Customer Support Email</label>
                  <input
                    type="email"
                    value={draft.supportEmail}
                    onChange={(e) => setDraft({ ...draft, supportEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F4F8]"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    onUpdateSettings(draft);
                    onShowToast('Store & GSTIN details updated');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#2563EB] text-white font-medium"
                >
                  Save Store Settings
                </button>
              </div>
            </div>
          )}

          {/* NOTIFICATION SETTINGS */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl p-6 shadow-aisle space-y-4">
              <h2 className="font-display font-semibold text-[16px] text-slate-900 pb-3 border-b border-slate-100">
                Notification Channels
              </h2>
              {[
                { key: 'orderNotifications' as const, title: 'New Order Alerts', desc: 'Instant alert when a high-value COD order arrives' },
                { key: 'deliveryUpdates' as const, title: 'NDR & Delay Alerts', desc: 'Alert when courier marks shipment delayed or unreachable' },
                { key: 'promotionsOffers' as const, title: 'Product Updates & Offers', desc: 'Monthly feature releases and credit pack discounts' },
                { key: 'accountUpdates' as const, title: 'Wallet & Billing Alerts', desc: 'Notify when wallet balance drops below ₹200' },
              ].map((item) => (
                <div key={item.key} className="p-4 rounded-xl bg-[#F8FAFC] flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900 text-[13.5px]">{item.title}</div>
                    <div className="text-[12px] text-slate-400">{item.desc}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.emailPrefs[item.key]}
                    onChange={() => {
                      const next = {
                        ...settings,
                        emailPrefs: { ...settings.emailPrefs, [item.key]: !settings.emailPrefs[item.key] },
                      };
                      onUpdateSettings(next);
                      onShowToast(`${item.title} preference updated`);
                    }}
                    className="w-4 h-4 accent-[#2563EB]"
                  />
                </div>
              ))}
            </div>
          )}

          {/* PAYMENT SETTINGS */}
          {activeTab === 'payment' && (
            <div className="bg-white rounded-2xl p-6 shadow-aisle space-y-4">
              <h2 className="font-display font-semibold text-[16px] text-slate-900">Payment &amp; Billing Shortcut</h2>
              <p className="text-[13px] text-slate-500">
                Manage your Razorpay AutoPay, UPI methods, GST invoices, and auto-recharge rules in Billing &amp; Wallet.
              </p>
              <button
                onClick={() => onNavigate('billing')}
                className="px-4 py-2.5 rounded-xl bg-[#2563EB] text-white text-[13px] font-medium"
              >
                Open Billing &amp; Wallet →
              </button>
            </div>
          )}

          {/* SHIPPING SETTINGS */}
          {activeTab === 'shipping' && (
            <div className="bg-white rounded-2xl p-6 shadow-aisle space-y-4">
              <h2 className="font-display font-semibold text-[16px] text-slate-900">Shipping &amp; Courier Webhooks</h2>
              <p className="text-[13px] text-slate-500">
                Configure Delhivery, BlueDart, XpressBees, Ecom Express, and Shadowfax live status hooks inside Delivery Tracking.
              </p>
              <button
                onClick={() => onNavigate('tracking')}
                className="px-4 py-2.5 rounded-xl bg-[#2563EB] text-white text-[13px] font-medium"
              >
                Open Courier Integrations →
              </button>
            </div>
          )}

          {/* API & INTEGRATIONS */}
          {activeTab === 'api' && (
            <div className="bg-white rounded-2xl p-6 shadow-aisle space-y-5">
              <h2 className="font-display font-semibold text-[16px] text-slate-900 pb-3 border-b border-slate-100">
                API Keys &amp; Connected Integrations
              </h2>
              <div className="p-4 rounded-xl bg-[#F8FAFC] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-slate-900 flex items-center gap-2">
                    <Key className="w-4 h-4 text-[#2563EB]" />
                    <span>SellerSaathi Production API Key</span>
                  </span>
                  <button
                    onClick={() => {
                      const random = Math.random().toString(36).slice(2, 14);
                      setApiKey(`ss_live_${random}`);
                      onShowToast('New API key generated');
                    }}
                    className="text-xs font-medium text-[#2563EB] flex items-center gap-1 hover:underline"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Regenerate</span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    readOnly
                    value={apiKey}
                    className="flex-1 px-3 py-2 rounded-lg bg-white font-mono text-[12.5px] text-slate-800 border border-slate-200/70"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="p-2 rounded-lg bg-white text-slate-600 shadow-2xs"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(apiKey);
                      onShowToast('API Key copied to clipboard');
                    }}
                    className="p-2 rounded-lg bg-white text-[#2563EB] shadow-2xs"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {connectedAccounts.map((ca) => (
                  <div key={ca.id} className="p-3.5 rounded-xl bg-[#F8FAFC] flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900 text-[13.5px]">{ca.name}</div>
                      <div className="text-xs text-slate-400">{ca.identifier} · {ca.lastSynced}</div>
                    </div>
                    <button
                      onClick={() => {
                        onToggleConnectedAccount(ca.id);
                        onShowToast(`${ca.name} ${ca.connected ? 'disconnected' : 'reconnected'}`);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium ${
                        ca.connected ? 'bg-emerald-50 text-emerald-700' : 'bg-[#2563EB] text-white'
                      }`}
                    >
                      {ca.connected ? 'Connected' : 'Connect'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECURITY SETTINGS */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-2xl p-6 shadow-aisle space-y-4">
              <h2 className="font-display font-semibold text-[16px] text-slate-900">Active Sessions &amp; Security</h2>
              <div className="p-4 rounded-xl bg-[#F8FAFC] flex items-center justify-between text-[13px]">
                <div>
                  <div className="font-semibold text-slate-900">Chrome on macOS · Delhi, India</div>
                  <div className="text-xs text-emerald-600 mt-0.5">Current active session</div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-medium">Verified</span>
              </div>
              <button
                onClick={() => onShowToast('Signed out of all other sessions')}
                className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white text-[13px] font-medium transition"
              >
                Logout From All Other Devices
              </button>
            </div>
          )}
        </div>

        {/* Right 4 Cols: Account Overview + Email Preferences + Security Tips (from Screenshot 7) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white rounded-2xl p-6 shadow-aisle">
            <h3 className="font-display font-semibold text-[15px] text-slate-900 mb-4">Account Overview</h3>
            <div className="space-y-3 text-[13px]">
              <div className="flex justify-between"><span className="text-slate-400">Account Plan</span><span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#2563EB] text-xs font-semibold">Pro Plan</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Member Since</span><strong className="text-slate-800 font-medium">18 Jan 2024</strong></div>
              <div className="flex justify-between"><span className="text-slate-400">Account Status</span><span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-xs font-semibold">Active</span></div>
              <div className="flex justify-between"><span className="text-slate-400">WhatsApp Credits</span><strong className="text-slate-800 font-medium tabular-nums">{creditsUsed.toLocaleString('en-IN')} / {creditsTotal.toLocaleString('en-IN')}</strong></div>
              <div className="flex justify-between"><span className="text-slate-400">Wallet Balance</span><strong className="text-slate-900 font-semibold tabular-nums">₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></div>
              <div className="flex justify-between"><span className="text-slate-400">Next Billing Date</span><strong className="text-slate-800 font-medium">18 Jun 2024</strong></div>
            </div>
            <button
              onClick={() => onNavigate('billing')}
              className="mt-5 w-full py-2.5 rounded-xl bg-[#F2F4F8] hover:bg-slate-200 text-slate-800 text-[13px] font-medium transition"
            >
              Manage Subscription
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-aisle">
            <h3 className="font-display font-semibold text-[15px] text-slate-900 mb-4">Email Preferences</h3>
            <div className="space-y-3.5">
              {[
                { key: 'orderNotifications' as const, label: 'Order Notifications', sub: 'Get notified for new orders' },
                { key: 'deliveryUpdates' as const, label: 'Delivery Updates', sub: 'Get notified for delivery updates' },
                { key: 'promotionsOffers' as const, label: 'Promotions & Offers', sub: 'Receive promos and offers' },
                { key: 'accountUpdates' as const, label: 'Account Updates', sub: 'Important updates about your account' },
              ].map((pref) => (
                <div key={pref.key} className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[13px] font-medium text-slate-900">{pref.label}</div>
                    <div className="text-[11.5px] text-slate-400">{pref.sub}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={settings.emailPrefs[pref.key]}
                      onChange={() => {
                        onUpdateSettings({
                          ...settings,
                          emailPrefs: { ...settings.emailPrefs, [pref.key]: !settings.emailPrefs[pref.key] },
                        });
                        onShowToast(`${pref.label} updated`);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-[#2563EB] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-aisle">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="font-display font-semibold text-[15px] text-slate-900">Security Tips</h3>
            </div>
            <ul className="space-y-2 text-[12.5px] text-slate-500">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Use a strong unique password</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Enable two-factor authentication</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Never share API keys or login OTPs</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Logout from shared warehouse PCs</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 2FA Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-aisle-frame p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-display font-semibold text-[16px] text-slate-900">Manage Two-Factor Auth</h3>
              <button onClick={() => setShow2FAModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <p className="mt-4 text-[13px] text-slate-600">
              Authenticator App (TOTP) is currently{' '}
              <strong className="text-slate-900">{settings.twoFactorEnabled ? 'Enabled' : 'Disabled'}</strong> for {settings.email}.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShow2FAModal(false)} className="px-4 py-2 rounded-xl bg-[#F2F4F8] text-slate-700 text-[13px] font-medium">
                Close
              </button>
              <button
                onClick={() => {
                  onUpdateSettings({ ...settings, twoFactorEnabled: !settings.twoFactorEnabled });
                  setShow2FAModal(false);
                  onShowToast(`2FA ${settings.twoFactorEnabled ? 'disabled' : 'enabled'}`);
                }}
                className="px-4 py-2 rounded-xl bg-[#2563EB] text-white text-[13px] font-medium"
              >
                {settings.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
