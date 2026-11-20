import React, { useMemo, useState } from 'react';
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Crown,
  Download,
  MessageCircle,
  Plus,
  Receipt,
  Wallet,
  X,
} from 'lucide-react';
import { GSTInvoice, PaymentMethodItem, WalletTransaction } from '../types';
import { downloadTextFile, formatINR, getOrderStatusBadgeClass } from '../utils/helpers';

interface BillingViewProps {
  walletBalance: number;
  creditsUsed: number;
  creditsTotal: number;
  currentPlan: 'Starter' | 'Pro Plan' | 'Enterprise';
  transactions: WalletTransaction[];
  invoices: GSTInvoice[];
  paymentMethods: PaymentMethodItem[];
  onAddMoney: (amount: number, method: string) => void;
  onBuyCredits: (credits: number, cost: number) => void;
  onUpgradePlan: (plan: 'Starter' | 'Pro Plan' | 'Enterprise') => void;
  onAddPaymentMethod: (pm: PaymentMethodItem) => void;
  onSetPrimaryMethod: (id: string) => void;
  onShowToast: (msg: string) => void;
}

type BillingSubTab = 'overview' | 'transactions' | 'invoices' | 'subscriptions' | 'payment-methods';

export const BillingView: React.FC<BillingViewProps> = ({
  walletBalance,
  creditsUsed,
  creditsTotal,
  currentPlan,
  transactions,
  invoices,
  paymentMethods,
  onAddMoney,
  onBuyCredits,
  onUpgradePlan,
  onAddPaymentMethod,
  onSetPrimaryMethod,
  onShowToast,
}) => {
  const [subTab, setSubTab] = useState<BillingSubTab>('overview');
  const [autoRecharge, setAutoRecharge] = useState(true);
  const [autoThreshold, setAutoThreshold] = useState('100');
  const [autoAmount, setAutoAmount] = useState('500');
  const [showAutoConfig, setShowAutoConfig] = useState(false);

  // Modals
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [addAmount, setAddAmount] = useState('1000');
  const [addMethod, setAddMethod] = useState('UPI (Google Pay)');

  const [showBuyCreditsModal, setShowBuyCreditsModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [newPmLabel, setNewPmLabel] = useState('');
  const [newPmSub, setNewPmSub] = useState('');
  const [newPmType, setNewPmType] = useState<'UPI' | 'Card' | 'NetBanking'>('UPI');
  const [txPage, setTxPage] = useState(1);
  const [txPageSize, setTxPageSize] = useState(5);

  const totalTxPages = Math.max(1, Math.ceil(transactions.length / txPageSize));
  const currentTxPage = Math.min(txPage, totalTxPages);
  const txStartIndex = (currentTxPage - 1) * txPageSize;
  const paginatedTransactions = transactions.slice(txStartIndex, txStartIndex + txPageSize);

  const txPageNumbers = useMemo(() => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalTxPages <= 5) {
      for (let i = 1; i <= totalTxPages; i++) pages.push(i);
    } else if (currentTxPage <= 3) {
      pages.push(1, 2, 3, 'ellipsis', totalTxPages);
    } else if (currentTxPage >= totalTxPages - 2) {
      pages.push(1, 'ellipsis', totalTxPages - 2, totalTxPages - 1, totalTxPages);
    } else {
      pages.push(1, 'ellipsis', currentTxPage - 1, currentTxPage, currentTxPage + 1, 'ellipsis', totalTxPages);
    }
    return pages;
  }, [currentTxPage, totalTxPages]);

  const creditsPct = Math.min(100, (creditsUsed / creditsTotal) * 100).toFixed(1);

  const handleDownloadInvoice = (inv: GSTInvoice) => {
    downloadTextFile(
      `${inv.id}.txt`,
      `TAX INVOICE — SellerSaathi AI Technologies Pvt. Ltd.\nInvoice: ${inv.id}\nPeriod: ${inv.period}\nIssued: ${inv.issuedDate}\nBase Amount: ${formatINR(inv.amount)}\nGST (18%): ${formatINR(inv.gstAmount, true)}\nStatus: ${inv.status}\n`
    );
    onShowToast(`GST Invoice ${inv.id} downloaded`);
  };

  return (
    <section className="view-section space-y-5">
      {/* Sub-Tabs (from Screenshot 6 Sidebar Sub-menu) */}
      <div className="bg-white p-1.5 rounded-2xl shadow-aisle inline-flex flex-wrap items-center gap-1 text-[13px] font-medium">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'transactions', label: 'Transactions' },
          { id: 'invoices', label: 'Invoices' },
          { id: 'subscriptions', label: 'Subscriptions' },
          { id: 'payment-methods', label: 'Payment Methods' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id as BillingSubTab)}
            className={`px-3.5 py-2 rounded-xl transition ${
              subTab === tab.id ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:bg-[#F2F4F8]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 5 KPI Cards (from Screenshot 6) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-aisle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-slate-400">Wallet Balance</span>
              <div className="w-8 h-8 rounded-lg bg-[#F1F5F9] text-[#2563EB] flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5 font-display text-2xl font-semibold text-slate-900 metric-tracking">
              {formatINR(walletBalance, true)}
            </div>
            <div className="mt-1 text-[11.5px] text-emerald-600 font-medium">↗ ₹350 added this month</div>
          </div>
          <button
            onClick={() => setShowAddMoneyModal(true)}
            className="mt-3 w-full py-2 rounded-xl bg-[#EFF6FF] hover:bg-[#2563EB] text-[#2563EB] hover:text-white text-[12.5px] font-semibold transition"
          >
            Add Money
          </button>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-aisle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-slate-400">WhatsApp Credits</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <MessageCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5 font-display text-2xl font-semibold text-slate-900 metric-tracking">
              {creditsUsed.toLocaleString('en-IN')} <span className="text-sm font-normal text-slate-400">/ {creditsTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#F1F5F9] mt-2 overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${creditsPct}%` }} />
            </div>
          </div>
          <button
            onClick={() => setShowBuyCreditsModal(true)}
            className="mt-3 w-full py-2 rounded-xl bg-[#F2F4F8] hover:bg-slate-200 text-slate-800 text-[12.5px] font-semibold transition"
          >
            Buy Credits
          </button>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-aisle">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-slate-400">Monthly Spending</span>
            <div className="w-8 h-8 rounded-lg bg-[#F1F5F9] text-slate-700 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 font-display text-2xl font-semibold text-slate-900 metric-tracking">₹4,856.00</div>
          <div className="mt-2 text-[12px] text-slate-400"><span className="text-emerald-600 font-medium">↗ 18.7%</span> vs last month</div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-aisle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-slate-400">Plan</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                <Crown className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5 font-display text-2xl font-semibold text-slate-900 metric-tracking">{currentPlan}</div>
            <div className="mt-1 text-[11.5px] text-slate-400">Renews on 18 Jun 2024</div>
          </div>
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="mt-3 w-full py-2 rounded-xl bg-[#F2F4F8] hover:bg-slate-200 text-slate-800 text-[12.5px] font-semibold transition"
          >
            Manage Plan
          </button>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-aisle">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-slate-400">Due Amount</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 font-display text-2xl font-semibold text-slate-900 metric-tracking">₹0.00</div>
          <div className="mt-2 text-[12px] text-emerald-600 font-medium">No pending payments</div>
        </div>
      </div>

      {/* OVERVIEW / TRANSACTIONS */}
      {(subTab === 'overview' || subTab === 'transactions') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left 8 Cols: Recent Transactions Ledger */}
          <div className="lg:col-span-8 bg-white rounded-2xl p-6 shadow-aisle flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-semibold text-[16px] text-slate-900">Recent Transactions</h2>
                <button
                  onClick={() => setSubTab('invoices')}
                  className="text-[13px] font-medium text-[#2563EB] hover:underline"
                >
                  Download GST Invoices
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[12px] font-medium text-slate-400 border-b border-slate-100">
                      <th className="pb-3 font-medium">Date &amp; Time</th>
                      <th className="pb-3 font-medium">Description</th>
                      <th className="pb-3 font-medium">Type</th>
                      <th className="pb-3 font-medium">Payment Method</th>
                      <th className="pb-3 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[13px]">
                    {paginatedTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-slate-400 text-[13px]">
                          No transactions recorded yet.
                        </td>
                      </tr>
                    ) : (
                      paginatedTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50/70">
                          <td className="py-3.5 text-slate-500 whitespace-nowrap">{tx.date}</td>
                          <td className="py-3.5 font-medium text-slate-900">{tx.description}</td>
                          <td className="py-3.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${tx.type === 'Credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="py-3.5 text-slate-600">{tx.method}</td>
                          <td className={`py-3.5 text-right font-semibold tabular-nums whitespace-nowrap ${tx.type === 'Credit' ? 'text-emerald-600' : 'text-slate-900'}`}>
                            {tx.type === 'Credit' ? '+' : '-'} {formatINR(tx.amount, true)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Footer */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12.5px] text-slate-500">
              <div>
                {transactions.length === 0 ? (
                  <span>Showing 0 of 0 transactions</span>
                ) : (
                  <span>
                    Showing <strong className="font-semibold text-slate-700">{txStartIndex + 1}</strong> to{' '}
                    <strong className="font-semibold text-slate-700">
                      {Math.min(txStartIndex + paginatedTransactions.length, transactions.length)}
                    </strong>{' '}
                    of <strong className="font-semibold text-slate-700">{transactions.length}</strong> transactions
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={currentTxPage === 1}
                    onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                    aria-label="Previous transactions page"
                    className="p-1.5 rounded-lg bg-[#F2F4F8] hover:bg-slate-200/70 text-slate-700 disabled:opacity-40 disabled:pointer-events-none transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {txPageNumbers.map((item, idx) =>
                    item === 'ellipsis' ? (
                      <span key={`tx-ellipsis-${idx}`} className="px-2 text-slate-400 select-none">
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setTxPage(item)}
                        className={`min-w-[30px] h-[30px] px-2 rounded-lg font-medium tabular-nums transition ${
                          currentTxPage === item
                            ? 'bg-[#2563EB] text-white shadow-2xs'
                            : 'bg-[#F2F4F8] hover:bg-slate-200/70 text-slate-700'
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}

                  <button
                    type="button"
                    disabled={currentTxPage === totalTxPages}
                    onClick={() => setTxPage((p) => Math.min(totalTxPages, p + 1))}
                    aria-label="Next transactions page"
                    className="p-1.5 rounded-lg bg-[#F2F4F8] hover:bg-slate-200/70 text-slate-700 disabled:opacity-40 disabled:pointer-events-none transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <select
                  aria-label="Transactions per page"
                  value={txPageSize}
                  onChange={(e) => {
                    setTxPageSize(Number(e.target.value));
                    setTxPage(1);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-[#F2F4F8] text-[12px] font-medium text-slate-700 focus:outline-none"
                >
                  <option value={5}>5 / page</option>
                  <option value={8}>8 / page</option>
                  <option value={15}>15 / page</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right 4 Cols: Wallet Summary Donut + Auto Recharge + Payment Methods */}
          <div className="lg:col-span-4 space-y-5">
            {/* Wallet Summary Donut (from Screenshot 6) */}
            <div className="bg-white rounded-2xl p-6 shadow-aisle">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-[15px] text-slate-900">Wallet Summary</h3>
                <button onClick={() => setSubTab('transactions')} className="text-[12px] text-[#2563EB] font-medium">View Statement</button>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#F1F5F9" strokeWidth="4" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#10B981" strokeWidth="4" strokeDasharray="36 100" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#EF4444" strokeWidth="4" strokeDasharray="44 100" strokeDashoffset="-36" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#F59E0B" strokeWidth="4" strokeDasharray="20 100" strokeDashoffset="-80" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="font-display text-xs font-semibold text-slate-900 tabular-nums">{formatINR(walletBalance)}</span>
                    <span className="text-[9px] text-slate-400">Balance</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2 text-[12px]">
                  <div className="flex justify-between"><span className="text-slate-500">Added This Month</span><strong className="text-emerald-600 tabular-nums">+ ₹3,500.00</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">Spent This Month</span><strong className="text-rose-600 tabular-nums">- ₹4,856.00</strong></div>
                  <div className="flex justify-between"><span className="text-slate-500">Remaining</span><strong className="text-slate-900 tabular-nums">{formatINR(walletBalance, true)}</strong></div>
                </div>
              </div>
            </div>

            {/* Auto Recharge */}
            <div className="bg-white rounded-2xl p-6 shadow-aisle">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-semibold text-[15px] text-slate-900">Auto Recharge</h3>
                  <p className="text-[12px] text-slate-400 mt-0.5">Never pause AI calls due to low balance</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRecharge}
                    onChange={() => {
                      setAutoRecharge(!autoRecharge);
                      onShowToast(`Auto-recharge ${!autoRecharge ? 'enabled' : 'disabled'}`);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-[#2563EB] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                </label>
              </div>
              <p className="mt-3 text-[12.5px] text-slate-500 bg-[#F8FAFC] p-3 rounded-xl">
                When balance goes below <strong className="text-slate-800">₹{autoThreshold}</strong>, auto add <strong className="text-slate-800">₹{autoAmount}</strong> to wallet.
              </p>
              {showAutoConfig ? (
                <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
                  <input
                    type="number"
                    value={autoThreshold}
                    onChange={(e) => setAutoThreshold(e.target.value)}
                    placeholder="Threshold ₹"
                    className="px-2.5 py-1.5 rounded-lg bg-[#F2F4F8] focus:outline-none"
                  />
                  <input
                    type="number"
                    value={autoAmount}
                    onChange={(e) => setAutoAmount(e.target.value)}
                    placeholder="Add ₹"
                    className="px-2.5 py-1.5 rounded-lg bg-[#F2F4F8] focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      setShowAutoConfig(false);
                      onShowToast('Auto-recharge thresholds updated');
                    }}
                    className="col-span-2 py-1.5 rounded-lg bg-[#2563EB] text-white font-medium"
                  >
                    Save Rule
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAutoConfig(true)}
                  className="mt-2.5 text-[12px] font-medium text-[#2563EB] hover:underline"
                >
                  Manage Threshold →
                </button>
              )}
            </div>

            {/* Saved Payment Methods */}
            <div className="bg-white rounded-2xl p-6 shadow-aisle">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-[15px] text-slate-900">Payment Methods</h3>
                <button onClick={() => setShowAddPaymentModal(true)} className="text-[12px] font-medium text-[#2563EB] hover:underline">
                  + Add
                </button>
              </div>
              <div className="space-y-2.5 text-[13px]">
                {paymentMethods.map((pm) => (
                  <div key={pm.id} className="p-3 rounded-xl bg-[#F8FAFC] flex items-center justify-between gap-2">
                    <div>
                      <div className="font-medium text-slate-900">{pm.label}</div>
                      <div className="text-xs text-slate-400">{pm.sublabel}</div>
                    </div>
                    {pm.isPrimary ? (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[11px] font-medium">Primary</span>
                    ) : (
                      <button
                        onClick={() => {
                          onSetPrimaryMethod(pm.id);
                          onShowToast(`${pm.label} set as primary payment method`);
                        }}
                        className="text-[11px] text-[#2563EB] font-medium hover:underline"
                      >
                        Make Primary
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INVOICES TAB */}
      {subTab === 'invoices' && (
        <div className="bg-white rounded-2xl p-6 shadow-aisle">
          <h2 className="font-display font-semibold text-[16px] text-slate-900 mb-4">GST Tax Invoices</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13.5px]">
              <thead>
                <tr className="text-[12px] text-slate-400 border-b border-slate-100">
                  <th className="pb-3 font-medium">Invoice ID</th>
                  <th className="pb-3 font-medium">Billing Period</th>
                  <th className="pb-3 font-medium">Issued Date</th>
                  <th className="pb-3 font-medium text-right">Amount (incl. GST)</th>
                  <th className="pb-3 font-medium text-right">Status</th>
                  <th className="pb-3 font-medium text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="py-3.5 font-semibold text-[#2563EB]">{inv.id}</td>
                    <td className="py-3.5 text-slate-800">{inv.period}</td>
                    <td className="py-3.5 text-slate-500">{inv.issuedDate}</td>
                    <td className="py-3.5 text-right font-semibold tabular-nums">{formatINR(inv.amount)}</td>
                    <td className="py-3.5 text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${getOrderStatusBadgeClass(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => handleDownloadInvoice(inv)}
                        className="px-3 py-1.5 rounded-lg bg-[#F2F4F8] hover:bg-[#2563EB] text-slate-700 hover:text-white text-[12px] font-medium inline-flex items-center gap-1 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Invoice</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBSCRIPTIONS TAB */}
      {subTab === 'subscriptions' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              name: 'Starter' as const,
              price: '₹999 / month',
              desc: 'For emerging Amazon & D2C sellers',
              features: ['5,000 AI Calling Minutes', '10,000 WhatsApp Credits', '2 Marketplace Channels', 'Email Support'],
            },
            {
              name: 'Pro Plan' as const,
              price: '₹1,999 / month',
              desc: 'For scaling multi-channel stores',
              features: ['20,000 AI Calling Minutes', '25,000 WhatsApp Credits', 'Unlimited Courier Tracking', 'Priority WhatsApp Support'],
            },
            {
              name: 'Enterprise' as const,
              price: '₹4,999 / month',
              desc: 'For high-volume D2C & aggregator brands',
              features: ['Unlimited AI Calling', '1,00,000 WhatsApp Credits', 'Dedicated Voice Cloning', 'Dedicated Account Manager'],
            },
          ].map((pl) => {
            const isCurrent = currentPlan === pl.name;
            return (
              <div key={pl.name} className={`bg-white rounded-2xl p-6 shadow-aisle flex flex-col justify-between ${isCurrent ? 'ring-2 ring-[#2563EB]' : ''}`}>
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-semibold text-[17px] text-slate-900">{pl.name}</h3>
                    {isCurrent && <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2563EB] text-[11px] font-semibold">Current</span>}
                  </div>
                  <div className="mt-2 font-display text-2xl font-semibold text-slate-900">{pl.price}</div>
                  <p className="text-[12.5px] text-slate-400 mt-1">{pl.desc}</p>
                  <ul className="mt-5 space-y-2.5 text-[13px] text-slate-700">
                    {pl.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  disabled={isCurrent}
                  onClick={() => {
                    onUpgradePlan(pl.name);
                    onShowToast(`Switched subscription to ${pl.name}`);
                  }}
                  className={`mt-6 w-full py-2.5 rounded-xl text-[13px] font-medium transition ${
                    isCurrent ? 'bg-[#F2F4F8] text-slate-400 cursor-default' : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white'
                  }`}
                >
                  {isCurrent ? 'Active Plan' : `Switch to ${pl.name}`}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* PAYMENT METHODS TAB */}
      {subTab === 'payment-methods' && (
        <div className="bg-white rounded-2xl p-6 shadow-aisle max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-[16px] text-slate-900">Saved Payment Methods</h2>
            <button
              onClick={() => setShowAddPaymentModal(true)}
              className="px-3.5 py-2 rounded-xl bg-[#2563EB] text-white text-[12.5px] font-medium flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Payment Method</span>
            </button>
          </div>
          <div className="space-y-3">
            {paymentMethods.map((pm) => (
              <div key={pm.id} className="p-4 rounded-xl bg-[#F8FAFC] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-[#2563EB] shadow-2xs">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-[13.5px]">{pm.label}</div>
                    <div className="text-[12px] text-slate-400">{pm.sublabel}</div>
                  </div>
                </div>
                {pm.isPrimary ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[11.5px] font-medium">Primary</span>
                ) : (
                  <button
                    onClick={() => {
                      onSetPrimaryMethod(pm.id);
                      onShowToast(`${pm.label} set as primary`);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white text-[#2563EB] text-[12px] font-medium shadow-2xs"
                  >
                    Set Primary
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Subscription Footer Strip (from Screenshot 6) */}
      {subTab === 'overview' && (
        <div className="bg-white rounded-2xl p-6 shadow-aisle flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <div className="font-display font-semibold text-[16px] text-slate-900">{currentPlan}</div>
              <div className="text-[12px] text-slate-400">Monthly Plan · Active</div>
            </div>
            <div>
              <div className="text-[11.5px] text-slate-400">Amount</div>
              <div className="font-semibold text-slate-900">₹1,999 / month</div>
            </div>
            <div>
              <div className="text-[11.5px] text-slate-400">Next Billing Date</div>
              <div className="font-semibold text-slate-900">18 Jun 2024</div>
            </div>
          </div>
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-medium transition"
          >
            Upgrade Plan
          </button>
        </div>
      )}

      {/* Add Money Modal */}
      {showAddMoneyModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-aisle-frame p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-display font-semibold text-[16px] text-slate-900">Add Money to Wallet</h3>
              <button onClick={() => setShowAddMoneyModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <div className="mt-4 space-y-3.5 text-[13.5px]">
              <div className="grid grid-cols-3 gap-2">
                {['500', '1000', '2500'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAddAmount(amt)}
                    className={`py-2 rounded-xl font-medium ${addAmount === amt ? 'bg-[#2563EB] text-white' : 'bg-[#F2F4F8] text-slate-700'}`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-slate-500 text-xs font-medium mb-1">Custom Amount (₹)</label>
                <input
                  type="number"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F2F4F8] text-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-xs font-medium mb-1">Payment Method</label>
                <select
                  value={addMethod}
                  onChange={(e) => setAddMethod(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F2F4F8] text-slate-900 focus:outline-none"
                >
                  <option>UPI (Google Pay)</option>
                  <option>UPI (PhonePe)</option>
                  <option>HDFC Corporate Visa</option>
                  <option>Net Banking</option>
                </select>
              </div>
              <button
                onClick={() => {
                  const val = Number(addAmount) || 1000;
                  onAddMoney(val, addMethod);
                  setShowAddMoneyModal(false);
                }}
                className="w-full py-2.5 rounded-xl bg-[#2563EB] text-white font-medium"
              >
                Pay ₹{addAmount} Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Buy Credits Modal */}
      {showBuyCreditsModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-aisle-frame p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-display font-semibold text-[16px] text-slate-900">Buy WhatsApp Credits</h3>
              <button onClick={() => setShowBuyCreditsModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <div className="mt-4 space-y-3">
              {[
                { credits: 5000, cost: 750, label: '5,000 WhatsApp Credits' },
                { credits: 10000, cost: 1400, label: '10,000 WhatsApp Credits (Save 7%)' },
                { credits: 25000, cost: 3250, label: '25,000 WhatsApp Credits (Best Value)' },
              ].map((pack) => (
                <button
                  key={pack.credits}
                  onClick={() => {
                    onBuyCredits(pack.credits, pack.cost);
                    setShowBuyCreditsModal(false);
                  }}
                  className="w-full p-4 rounded-xl bg-[#F8FAFC] hover:bg-[#EFF6FF] flex items-center justify-between text-left transition"
                >
                  <div>
                    <div className="font-semibold text-slate-900 text-[13.5px]">{pack.label}</div>
                    <div className="text-[11.5px] text-slate-400">Deducted from wallet balance</div>
                  </div>
                  <span className="font-display font-semibold text-[#2563EB]">{formatINR(pack.cost)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Plan Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-aisle-frame p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-display font-semibold text-[16px] text-slate-900">Select Subscription Plan</h3>
              <button onClick={() => setShowUpgradeModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <div className="mt-4 space-y-3">
              {(['Starter', 'Pro Plan', 'Enterprise'] as const).map((plan) => (
                <button
                  key={plan}
                  onClick={() => {
                    onUpgradePlan(plan);
                    setShowUpgradeModal(false);
                    onShowToast(`Subscribed to ${plan}`);
                  }}
                  className={`w-full p-4 rounded-xl text-left flex items-center justify-between ${
                    currentPlan === plan ? 'bg-[#EFF6FF] ring-2 ring-[#2563EB]' : 'bg-[#F8FAFC] hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-slate-900">{plan}</div>
                    <div className="text-xs text-slate-400">
                      {plan === 'Starter' ? '₹999/mo' : plan === 'Pro Plan' ? '₹1,999/mo' : '₹4,999/mo'}
                    </div>
                  </div>
                  {currentPlan === plan && <span className="text-xs font-semibold text-[#2563EB]">Active</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Payment Method Modal */}
      {showAddPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-aisle-frame p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-display font-semibold text-[16px] text-slate-900">Add Payment Method</h3>
              <button onClick={() => setShowAddPaymentModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onAddPaymentMethod({
                  id: `pm-${Date.now()}`,
                  label: newPmLabel.trim() || `${newPmType} Method`,
                  sublabel: newPmSub.trim() || 'aman@upi',
                  type: newPmType,
                  isPrimary: false,
                });
                setShowAddPaymentModal(false);
                setNewPmLabel('');
                setNewPmSub('');
                onShowToast('New payment method saved');
              }}
              className="mt-4 space-y-3 text-[13.5px]"
            >
              <select
                value={newPmType}
                onChange={(e) => setNewPmType(e.target.value as typeof newPmType)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#F2F4F8]"
              >
                <option value="UPI">UPI ID</option>
                <option value="Card">Credit / Debit Card</option>
                <option value="NetBanking">Net Banking</option>
              </select>
              <input
                type="text"
                required
                placeholder="Label (e.g., UPI · Paytm)"
                value={newPmLabel}
                onChange={(e) => setNewPmLabel(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#F2F4F8]"
              />
              <input
                type="text"
                required
                placeholder="Details (e.g., aman@paytm)"
                value={newPmSub}
                onChange={(e) => setNewPmSub(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#F2F4F8]"
              />
              <button type="submit" className="w-full py-2.5 rounded-xl bg-[#2563EB] text-white font-medium">
                Save Method
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
