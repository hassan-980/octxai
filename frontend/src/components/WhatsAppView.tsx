import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bot,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Filter,
  MessageSquare,
  Plus,
  Reply,
  Send,
  Users,
  Wallet,
  Webhook,
  X,
} from 'lucide-react';
import {
  AutoReplyRule,
  ChatMessageLog,
  ViewName,
  WebhookLog,
  WhatsAppCampaign,
  WhatsAppContact,
  WhatsAppTemplate,
} from '../types';
import { getOrderStatusBadgeClass } from '../utils/helpers';

interface WhatsAppViewProps {
  campaigns: WhatsAppCampaign[];
  templates: WhatsAppTemplate[];
  autoReplies: AutoReplyRule[];
  contacts: WhatsAppContact[];
  chatLogs: ChatMessageLog[];
  webhookLogs: WebhookLog[];
  creditsUsed: number;
  creditsTotal: number;
  onAddCampaign: (camp: WhatsAppCampaign) => void;
  onAddTemplate: (tpl: WhatsAppTemplate) => void;
  onToggleAutoReply: (id: string) => void;
  onAddChatMessage: (log: ChatMessageLog) => void;
  onNavigate: (view: ViewName) => void;
  onShowToast: (msg: string) => void;
}

type WATab =
  | 'campaigns'
  | 'history'
  | 'scheduled'
  | 'failed'
  | 'auto-replies'
  | 'contacts'
  | 'webhooks';

export const WhatsAppView: React.FC<WhatsAppViewProps> = ({
  campaigns,
  templates,
  autoReplies,
  contacts,
  chatLogs,
  webhookLogs,
  creditsUsed,
  creditsTotal,
  onAddCampaign,
  onAddTemplate,
  onToggleAutoReply,
  onAddChatMessage,
  onNavigate,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<WATab>('campaigns');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Transactional' | 'Marketing' | 'Conversion'>('all');
  const [page, setPage] = useState(1);
  const pageSize = 7;

  // Modals
  const [showSendCampaignModal, setShowSendCampaignModal] = useState(false);
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  const [campName, setCampName] = useState('');
  const [campType, setCampType] = useState<'Transactional' | 'Marketing' | 'Conversion'>('Marketing');
  const [campTargetCount, setCampTargetCount] = useState('450');
  const [campTemplateId, setCampTemplateId] = useState(templates[0]?.id || 'watpl-1');

  const [tplName, setTplName] = useState('');
  const [tplCategory, setTplCategory] = useState<'Transactional' | 'Marketing' | 'Utility'>('Transactional');
  const [tplBody, setTplBody] = useState('Hi {{customer_name}}, your order {{order_id}} is confirmed! Track live updates here.');

  // Quick Reply in Chat History
  const [quickChatPhone, setQuickChatPhone] = useState('+91 98765 43210');
  const [quickChatText, setQuickChatText] = useState('');

  const filteredCampaigns = useMemo(() => {
    let base = campaigns;
    if (activeTab === 'scheduled') base = campaigns.filter((c) => c.status === 'Scheduled');
    if (activeTab === 'failed') base = campaigns.filter((c) => c.failed > 0 || c.status === 'Failed');
    if (typeFilter !== 'all') base = base.filter((c) => c.type === typeFilter);
    return base;
  }, [campaigns, activeTab, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCampaigns.length / pageSize));
  const paginatedCampaigns = filteredCampaigns.slice((page - 1) * pageSize, page * pageSize);

  const handleLaunchCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    const total = Number(campTargetCount) || 250;
    const delivered = Math.round(total * 0.96);
    const read = Math.round(delivered * 0.72);
    const replies = Math.round(read * 0.18);
    const created: WhatsAppCampaign = {
      id: `camp-${Date.now()}`,
      name: campName.trim() || 'Festive Order Broadcast',
      subtitle: templates.find((t) => t.id === campTemplateId)?.name || 'WhatsApp broadcast',
      type: campType,
      status: 'Completed',
      total,
      sent: total,
      delivered,
      read,
      replies,
      failed: total - delivered,
      date: 'Just now',
    };
    onAddCampaign(created);
    setShowSendCampaignModal(false);
    setCampName('');
    setActiveTab('campaigns');
    onShowToast(`WhatsApp campaign "${created.name}" sent to ${total} customers`);
  };

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    const created: WhatsAppTemplate = {
      id: `watpl-${Date.now()}`,
      name: tplName.trim() || 'custom_order_update',
      category: tplCategory,
      status: 'Approved',
      language: 'en / hi',
      body: tplBody.trim(),
    };
    onAddTemplate(created);
    setShowCreateTemplateModal(false);
    setTplName('');
    onShowToast(`Template "${created.name}" approved & added`);
  };

  const handleSendQuickChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickChatText.trim()) return;
    onAddChatMessage({
      id: `cl-${Date.now()}`,
      customer: 'Rahul Sharma',
      phone: quickChatPhone,
      orderId: 'ORD-10001',
      direction: 'outbound',
      message: quickChatText.trim(),
      status: 'Sent',
      time: 'Just now',
    });
    setQuickChatText('');
    onShowToast(`WhatsApp message sent to ${quickChatPhone}`);
  };

  const pct = (part: number, whole: number) => (whole > 0 ? ((part / whole) * 100).toFixed(1) + '%' : '0%');
  const creditsPct = Math.min(100, (creditsUsed / creditsTotal) * 100).toFixed(1);

  return (
    <section className="view-section space-y-5">
      {/* 6 KPI Cards (from Screenshot 5) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-aisle">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-slate-400">Messages Sent</span>
            <div className="w-7 h-7 rounded-lg bg-[#F1F5F9] text-[#2563EB] flex items-center justify-center">
              <Send className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 font-display text-2xl font-semibold text-slate-900 metric-tracking">15,692</div>
          <div className="mt-1.5 text-[11.5px] text-slate-400"><span className="text-emerald-600 font-medium">↗ 15.1%</span> vs 7d</div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-aisle">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-slate-400">Delivered</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 font-display text-2xl font-semibold text-slate-900 metric-tracking">15,102</div>
          <div className="mt-1.5 text-[11.5px] text-emerald-600 font-medium">96.2% Delivery Rate</div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-aisle">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-slate-400">Read</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <Eye className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 font-display text-2xl font-semibold text-slate-900 metric-tracking">10,789</div>
          <div className="mt-1.5 text-[11.5px] text-[#2563EB] font-medium">71.4% Read Rate</div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-aisle">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-slate-400">Replies</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Reply className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 font-display text-2xl font-semibold text-slate-900 metric-tracking">2,340</div>
          <div className="mt-1.5 text-[11.5px] text-slate-400"><span className="text-emerald-600 font-medium">↗ 18.7%</span> vs 7d</div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-aisle">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-slate-400">Failed</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 font-display text-2xl font-semibold text-slate-900 metric-tracking">590</div>
          <div className="mt-1.5 text-[11.5px] text-rose-600 font-medium">3.8% Failed Rate</div>
        </div>

        <div onClick={() => onNavigate('billing')} className="bg-white rounded-2xl p-4 shadow-aisle cursor-pointer hover:shadow-aisle-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-slate-400">Credits Balance</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 font-display text-2xl font-semibold text-slate-900 metric-tracking">{creditsUsed.toLocaleString('en-IN')}</div>
          <div className="mt-1.5 text-[11.5px] text-[#2563EB] font-medium hover:underline">Buy More Credits →</div>
        </div>
      </div>

      {/* Main Split: Left 8 Cols (Tabs & Views) + Right 4 Cols (Templates & Analytics Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 shadow-aisle flex flex-col justify-between">
          <div>
            {/* Sub-Tabs from Screenshot 5 */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-1 bg-[#F2F4F8] p-1 rounded-xl text-[12px] font-medium">
                {[
                  { id: 'campaigns', label: 'Campaigns' },
                  { id: 'history', label: 'Message History' },
                  { id: 'scheduled', label: 'Scheduled' },
                  { id: 'failed', label: 'Failed' },
                  { id: 'auto-replies', label: 'Auto Replies' },
                  { id: 'contacts', label: 'Contacts' },
                  { id: 'webhooks', label: 'Webhook Logs' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setActiveTab(t.id as WATab);
                      setPage(1);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg transition ${
                      activeTab === t.id ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowSendCampaignModal(true)}
                className="px-3.5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[12.5px] font-medium flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Send Campaign</span>
              </button>
            </div>

            {/* Info Banner + Filter */}
            {(activeTab === 'campaigns' || activeTab === 'scheduled' || activeTab === 'failed') && (
              <>
                <div className="mt-4 mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="px-3.5 py-2 rounded-xl bg-emerald-50/70 text-emerald-800 text-[12px] font-medium">
                    Official Meta Cloud API · Use approved WhatsApp templates to send bulk or triggered order updates.
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
                      className="px-2.5 py-1.5 rounded-xl bg-[#F2F4F8] text-[12px] font-medium text-slate-700 focus:outline-none"
                    >
                      <option value="all">All Types</option>
                      <option value="Transactional">Transactional</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Conversion">Conversion</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[12px] font-medium text-slate-400 border-b border-slate-100">
                        <th className="pb-3 font-medium">Campaign Name</th>
                        <th className="pb-3 font-medium">Type</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium text-right">Sent</th>
                        <th className="pb-3 font-medium text-right">Delivered</th>
                        <th className="pb-3 font-medium text-right">Read</th>
                        <th className="pb-3 font-medium text-right">Replies</th>
                        <th className="pb-3 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[13px]">
                      {paginatedCampaigns.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3.5">
                            <div className="font-medium text-slate-900">{c.name}</div>
                            <div className="text-[11.5px] text-slate-400">{c.subtitle} · {c.date}</div>
                          </td>
                          <td className="py-3.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${getOrderStatusBadgeClass(c.type)}`}>
                              {c.type}
                            </span>
                          </td>
                          <td className="py-3.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${getOrderStatusBadgeClass(c.status)}`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="py-3.5 text-right font-medium tabular-nums">{c.sent.toLocaleString('en-IN')}</td>
                          <td className="py-3.5 text-right text-emerald-600 font-medium tabular-nums">
                            {c.delivered.toLocaleString('en-IN')} <span className="text-[10.5px] text-slate-400">({pct(c.delivered, c.sent)})</span>
                          </td>
                          <td className="py-3.5 text-right text-[#2563EB] font-medium tabular-nums">
                            {c.read.toLocaleString('en-IN')} <span className="text-[10.5px] text-slate-400">({pct(c.read, c.sent)})</span>
                          </td>
                          <td className="py-3.5 text-right font-medium text-slate-700 tabular-nums">{c.replies}</td>
                          <td className="py-3.5 text-right">
                            <button
                              onClick={() => onShowToast(`Test WhatsApp for "${c.name}" sent to +91 98765 43210`)}
                              className="text-xs font-medium text-[#2563EB] hover:underline"
                            >
                              Test
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* MESSAGE HISTORY / CHAT LOGS */}
            {activeTab === 'history' && (
              <div className="mt-4 space-y-4">
                <form onSubmit={handleSendQuickChat} className="flex flex-wrap gap-2 bg-[#F8FAFC] p-3 rounded-xl">
                  <input
                    type="text"
                    value={quickChatPhone}
                    onChange={(e) => setQuickChatPhone(e.target.value)}
                    className="w-40 px-3 py-2 rounded-lg bg-white text-[12.5px] text-slate-800 border border-slate-200/70 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={quickChatText}
                    onChange={(e) => setQuickChatText(e.target.value)}
                    placeholder="Send direct WhatsApp reply to customer..."
                    className="flex-1 min-w-[200px] px-3 py-2 rounded-lg bg-white text-[12.5px] text-slate-800 border border-slate-200/70 focus:outline-none"
                  />
                  <button type="submit" className="px-4 py-2 rounded-lg bg-[#2563EB] text-white text-[12.5px] font-medium">
                    Send
                  </button>
                </form>

                <div className="divide-y divide-slate-100">
                  {chatLogs.map((log) => (
                    <div key={log.id} className="py-3 flex items-start justify-between gap-3 text-[13px]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{log.customer}</span>
                          <span className="text-[11.5px] text-[#2563EB] font-medium">{log.orderId}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-medium ${log.direction === 'inbound' ? 'bg-amber-50 text-amber-700' : 'bg-[#EFF6FF] text-[#2563EB]'}`}>
                            {log.direction === 'inbound' ? 'Customer Reply' : 'Outbound'}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-1">{log.message}</p>
                      </div>
                      <div className="text-right shrink-0 text-[11.5px] text-slate-400">
                        <div>{log.time}</div>
                        <div className="text-emerald-600 font-medium">{log.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AUTO REPLIES */}
            {activeTab === 'auto-replies' && (
              <div className="mt-4 space-y-3">
                {autoReplies.map((rule) => (
                  <div key={rule.id} className="p-4 rounded-xl bg-[#F8FAFC] flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-white text-[#2563EB] font-mono text-[12px] font-semibold shadow-2xs">
                          {rule.keyword}
                        </span>
                        <span className="text-[11.5px] text-slate-400">{rule.matchType} match · {rule.triggeredCount} triggers</span>
                      </div>
                      <p className="mt-2 text-[13px] text-slate-700">{rule.replyMessage}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={() => {
                          onToggleAutoReply(rule.id);
                          onShowToast(`Auto-reply rule "${rule.keyword}" ${rule.enabled ? 'disabled' : 'enabled'}`);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-[#2563EB] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                    </label>
                  </div>
                ))}
              </div>
            )}

            {/* CONTACTS */}
            {activeTab === 'contacts' && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead>
                    <tr className="text-[12px] text-slate-400 border-b border-slate-100">
                      <th className="pb-3 font-medium">Customer</th>
                      <th className="pb-3 font-medium">Last Order</th>
                      <th className="pb-3 font-medium">Opt-in Status</th>
                      <th className="pb-3 font-medium">Tags</th>
                      <th className="pb-3 font-medium text-right">Last Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {contacts.map((ct) => (
                      <tr key={ct.id}>
                        <td className="py-3">
                          <div className="font-medium text-slate-900">{ct.name}</div>
                          <div className="text-[11.5px] text-slate-400">{ct.phone}</div>
                        </td>
                        <td className="py-3 text-[#2563EB] font-medium">{ct.lastOrder}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${ct.optIn ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {ct.optIn ? 'Opted-in' : 'Opted-out'}
                          </span>
                        </td>
                        <td className="py-3 text-slate-600">{ct.tags.join(', ')}</td>
                        <td className="py-3 text-right text-slate-400">{ct.lastMessageTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* WEBHOOK LOGS */}
            {activeTab === 'webhooks' && (
              <div className="mt-4 space-y-2.5">
                {webhookLogs.map((wh) => (
                  <div key={wh.id} className="p-3.5 rounded-xl bg-[#F8FAFC] flex flex-wrap items-center justify-between gap-2 text-[12.5px]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-[#2563EB]">{wh.event}</span>
                        <span className="text-slate-400">· {wh.source}</span>
                      </div>
                      <div className="text-slate-600 text-[12px] mt-0.5 font-mono">{wh.payloadSummary}</div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-semibold">
                        HTTP {wh.statusCode} · {wh.latencyMs}ms
                      </span>
                      <div className="text-[11px] text-slate-400 mt-0.5">{wh.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {(activeTab === 'campaigns' || activeTab === 'scheduled' || activeTab === 'failed') && (
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[12.5px] text-slate-500">
              <span>Showing {paginatedCampaigns.length} of {filteredCampaigns.length} campaigns</span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg bg-[#F2F4F8] disabled:opacity-40 hover:bg-slate-200 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2.5 py-1 rounded-lg bg-[#2563EB] text-white font-medium text-xs">{page}</span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg bg-[#F2F4F8] disabled:opacity-40 hover:bg-slate-200 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right 4 Cols: Message Templates + WhatsApp Analytics Donut + Credits */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white rounded-2xl p-6 shadow-aisle">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-[16px] text-slate-900">Message Templates</h2>
              <span className="text-[12px] text-emerald-600 font-medium">Meta Verified</span>
            </div>
            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
              {templates.map((tpl) => (
                <div key={tpl.id} className="p-3.5 rounded-xl bg-[#F8FAFC] text-[12.5px]">
                  <div className="flex items-center justify-between mb-1">
                    <strong className="text-slate-900">{tpl.name}</strong>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[11px] font-medium">
                      {tpl.status}
                    </span>
                  </div>
                  <p className="text-slate-500 line-clamp-2">{tpl.body}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowCreateTemplateModal(true)}
              className="mt-4 w-full py-2.5 rounded-xl bg-[#F2F4F8] hover:bg-slate-200/70 text-slate-800 text-[13px] font-medium transition"
            >
              + Create New Template
            </button>
          </div>

          {/* WhatsApp Analytics Donut (from Screenshot 5) */}
          <div className="bg-white rounded-2xl p-6 shadow-aisle">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-[16px] text-slate-900">WhatsApp Analytics</h2>
              <span className="text-[12px] text-slate-400">Last 7 Days</span>
            </div>
            <div className="flex items-center gap-5">
              <div className="relative w-28 h-28 shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#F1F5F9" strokeWidth="4" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#10B981" strokeWidth="4" strokeDasharray="65 100" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#2563EB" strokeWidth="4" strokeDasharray="20 100" strokeDashoffset="-65" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#F59E0B" strokeWidth="4" strokeDasharray="10 100" strokeDashoffset="-85" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#EF4444" strokeWidth="4" strokeDasharray="5 100" strokeDashoffset="-95" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-display text-sm font-semibold text-slate-900 tabular-nums">15,692</span>
                  <span className="text-[10px] text-slate-400">Total Sent</span>
                </div>
              </div>
              <div className="flex-1 space-y-2 text-[12px]">
                <div className="flex justify-between"><span className="text-slate-600">Delivered</span><strong className="text-slate-900 tabular-nums">15,102 (96.2%)</strong></div>
                <div className="flex justify-between"><span className="text-slate-600">Read</span><strong className="text-slate-900 tabular-nums">10,789 (71.4%)</strong></div>
                <div className="flex justify-between"><span className="text-slate-600">Replies</span><strong className="text-slate-900 tabular-nums">2,340 (14.9%)</strong></div>
                <div className="flex justify-between"><span className="text-slate-600">Failed</span><strong className="text-rose-600 tabular-nums">590 (3.8%)</strong></div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-[12px] mb-1.5">
                <span className="text-slate-500">Credits Quota ({creditsPct}% used)</span>
                <strong className="text-slate-900 tabular-nums">{creditsUsed.toLocaleString('en-IN')} / {creditsTotal.toLocaleString('en-IN')}</strong>
              </div>
              <div className="w-full h-2 rounded-full bg-[#F1F5F9] overflow-hidden">
                <div className="h-full rounded-full bg-[#2563EB]" style={{ width: `${creditsPct}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Quick Actions Row (from Screenshot 5) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Send Campaign', desc: 'Send WhatsApp campaign to customers', icon: Send, action: () => setShowSendCampaignModal(true) },
          { label: 'Template Manager', desc: 'Create, edit & manage templates', icon: MessageSquare, action: () => setShowCreateTemplateModal(true) },
          { label: 'Contacts', desc: 'Manage customer opt-ins & tags', icon: Users, action: () => setActiveTab('contacts') },
          { label: 'Auto Replies', desc: 'Configure automated keyword bots', icon: Bot, action: () => setActiveTab('auto-replies') },
          { label: 'Webhook Logs', desc: 'Inspect Meta & Shiprocket webhooks', icon: Webhook, action: () => setActiveTab('webhooks') },
        ].map((qa) => {
          const Icon = qa.icon;
          return (
            <button
              key={qa.label}
              onClick={qa.action}
              className="bg-white rounded-2xl p-4 shadow-aisle hover:shadow-aisle-md text-left transition flex items-start justify-between gap-2 group"
            >
              <div>
                <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mb-2.5 group-hover:bg-[#2563EB] group-hover:text-white transition">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="font-display font-semibold text-[13.5px] text-slate-900">{qa.label}</div>
                <div className="text-[11.5px] text-slate-400 mt-0.5">{qa.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Send Campaign Modal */}
      {showSendCampaignModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-aisle-frame p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-display font-semibold text-[16px] text-slate-900">Launch WhatsApp Campaign</h3>
              <button onClick={() => setShowSendCampaignModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleLaunchCampaign} className="mt-4 space-y-3.5 text-[13.5px]">
              <div>
                <label className="block text-slate-500 text-xs font-medium mb-1">Campaign Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Weekend COD-to-Prepaid Offer"
                  value={campName}
                  onChange={(e) => setCampName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F2F4F8] text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 text-xs font-medium mb-1">Type</label>
                  <select
                    value={campType}
                    onChange={(e) => setCampType(e.target.value as typeof campType)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F2F4F8] text-slate-900 focus:outline-none"
                  >
                    <option value="Transactional">Transactional</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Conversion">Conversion</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 text-xs font-medium mb-1">Audience Size</label>
                  <input
                    type="number"
                    required
                    value={campTargetCount}
                    onChange={(e) => setCampTargetCount(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F2F4F8] text-slate-900 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-500 text-xs font-medium mb-1">Approved Template</label>
                <select
                  value={campTemplateId}
                  onChange={(e) => setCampTemplateId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F2F4F8] text-slate-900 focus:outline-none"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowSendCampaignModal(false)} className="px-4 py-2 rounded-xl bg-[#F2F4F8] text-slate-700 font-medium">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium shadow-sm">
                  Send Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Template Modal */}
      {showCreateTemplateModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-aisle-frame p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-display font-semibold text-[16px] text-slate-900">Create WhatsApp Template</h3>
              <button onClick={() => setShowCreateTemplateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateTemplate} className="mt-4 space-y-3.5 text-[13.5px]">
              <div>
                <label className="block text-slate-500 text-xs font-medium mb-1">Template Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., ndr_reschedule_v3"
                  value={tplName}
                  onChange={(e) => setTplName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F2F4F8] text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-xs font-medium mb-1">Category</label>
                <select
                  value={tplCategory}
                  onChange={(e) => setTplCategory(e.target.value as typeof tplCategory)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F2F4F8] text-slate-900 focus:outline-none"
                >
                  <option value="Transactional">Transactional</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Utility">Utility</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-500 text-xs font-medium mb-1">Message Body (supports {'{{customer_name}}'})</label>
                <textarea
                  rows={3}
                  required
                  value={tplBody}
                  onChange={(e) => setTplBody(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#F2F4F8] text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowCreateTemplateModal(false)} className="px-4 py-2 rounded-xl bg-[#F2F4F8] text-slate-700 font-medium">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium shadow-sm">
                  Submit &amp; Approve
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
