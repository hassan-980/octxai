import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  FileSpreadsheet,
  LifeBuoy,
  MessageSquare,
  PhoneCall,
  RefreshCw,
  ScrollText,
  Search,
  Send,
  X,
} from 'lucide-react';
import {
  AdminAICallStream,
  AdminExportRecord,
  AdminSeller,
  AdminSubscription,
  AdminSupportTicket,
  AdminSystemLog,
  AdminUserPayload,
  AdminWhatsAppSellerUsage,
  AdminWhatsAppTemplateQueueItem,
  LogSeverity,
  TicketPriority,
  TicketStatus,
} from '../../data/adminData';
import { downloadCSV, downloadTextFile, formatINR, getInitials } from '../../utils/helpers';

/* ============================================================================
   1. AI CALL MONITORING TAB
============================================================================ */
interface AICallMonitoringProps {
  calls: AdminAICallStream[];
  onRetryCall: (id: string) => void;
  onTerminateCall: (id: string) => void;
}

export const AdminAICallMonitoringTab: React.FC<AICallMonitoringProps> = ({
  calls,
  onRetryCall,
  onTerminateCall,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | AdminAICallStream['status']>('All');
  const [providerFilter, setProviderFilter] = useState<'All' | AdminAICallStream['provider']>('All');
  const [selectedCall, setSelectedCall] = useState<AdminAICallStream | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return calls.filter((c) => {
      if (statusFilter !== 'All' && c.status !== statusFilter) return false;
      if (providerFilter !== 'All' && c.provider !== providerFilter) return false;
      if (!q) return true;
      return (
        c.id.toLowerCase().includes(q) ||
        c.sellerName.toLowerCase().includes(q) ||
        c.customerName.toLowerCase().includes(q) ||
        c.orderId.toLowerCase().includes(q)
      );
    });
  }, [calls, search, statusFilter, providerFilter]);

  const activeCount = calls.filter((c) => c.status === 'In Progress').length;
  const failedCount = calls.filter((c) => c.status === 'Failed').length;
  const avgLatency = Math.round(
    calls.reduce((sum, c) => sum + c.latencyMs, 0) / Math.max(calls.length, 1)
  );

  const providerHealth = [
    { name: 'Exotel India', region: 'Mumbai / Bengaluru', answerRate: '84.6%', avgLatency: '318 ms', load: '62%', status: 'Nominal' },
    { name: 'Twilio India', region: 'Mumbai SIP', answerRate: '82.1%', avgLatency: '334 ms', load: '48%', status: 'Nominal' },
    { name: 'Knowlarity', region: 'Chennai South-IN', answerRate: '73.4%', avgLatency: '1,120 ms', load: '81%', status: 'Degraded' },
  ];

  const statusTone = (status: AdminAICallStream['status']) => {
    if (status === 'Completed') return 'text-emerald-700';
    if (status === 'In Progress') return 'text-[#2563EB]';
    if (status === 'Failed') return 'text-rose-600';
    return 'text-amber-700';
  };

  return (
    <section className="view-section space-y-5">
      {/* Top KPI Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/70">
          <div className="text-[12.5px] font-medium text-slate-500">Total AI Calls (30D)</div>
          <div className="mt-2 font-display text-[24px] sm:text-[28px] font-semibold text-slate-900 tabular-nums metric-tracking">
            54,28,910
          </div>
          <div className="mt-1.5 text-[12px] text-emerald-700 font-medium">+21.8% vs previous 30d</div>
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/70">
          <div className="text-[12.5px] font-medium text-slate-500">Concurrent Live Channels</div>
          <div className="mt-2 font-display text-[24px] sm:text-[28px] font-semibold text-slate-900 tabular-nums metric-tracking">
            {142 + activeCount} / 300
          </div>
          <div className="mt-1.5 text-[12px] text-slate-500">{activeCount} inspected in live stream</div>
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/70">
          <div className="text-[12.5px] font-medium text-slate-500">Voice Response Latency</div>
          <div className="mt-2 font-display text-[24px] sm:text-[28px] font-semibold text-slate-900 tabular-nums metric-tracking">
            {avgLatency} ms
          </div>
          <div className="mt-1.5 text-[12px] text-slate-500">Target SLA &lt; 450 ms</div>
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/70">
          <div className="text-[12.5px] font-medium text-slate-500">Carrier Failure Queue</div>
          <div className="mt-2 font-display text-[24px] sm:text-[28px] font-semibold text-rose-600 tabular-nums metric-tracking">
            {failedCount}
          </div>
          <div className="mt-1.5 text-[12px] text-slate-500">Auto-failover to Exotel ready</div>
        </div>
      </div>

      {/* Carrier Trunk Health */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/70">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h2 className="font-display font-semibold text-[15.5px] text-slate-900">
              Telephony Provider Trunks
            </h2>
            <p className="text-[12.5px] text-slate-500">
              Real-time SIP gateway capacity and answer rates across Indian telecom routes
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 pt-4">
          {providerHealth.map((p) => (
            <div key={p.name} className="py-3 md:py-0 md:px-5 first:md:pl-0 last:md:pr-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-[14px] text-slate-900">{p.name}</span>
                <span
                  className={`text-[12px] font-semibold ${
                    p.status === 'Nominal' ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {p.status}
                </span>
              </div>
              <div className="mt-1 text-[12px] text-slate-500">{p.region}</div>
              <div className="mt-3 flex items-center gap-3 text-[12.5px] text-slate-600 tabular-nums">
                <span>Answer <strong className="text-slate-900">{p.answerRate}</strong></span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span>RTT <strong className="text-slate-900">{p.avgLatency}</strong></span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span>Load <strong className="text-slate-900">{p.load}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live AI Call Stream Table */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/70">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-display font-semibold text-[15.5px] text-slate-900">
              Platform AI Call Stream
            </h2>
            <p className="text-[12.5px] text-slate-500">
              Inspect transcripts, terminate stuck channels, or retry failed carrier dials
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search call ID, seller, order..."
                className="pl-8 pr-3 py-1.5 rounded-lg bg-[#F2F4F8] text-[12.5px] text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none w-52"
              />
            </div>

            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value as 'All' | AdminAICallStream['provider'])}
              className="px-3 py-1.5 rounded-lg bg-[#F2F4F8] text-[12.5px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="All">All Providers</option>
              <option value="Exotel">Exotel</option>
              <option value="Twilio India">Twilio India</option>
              <option value="Knowlarity">Knowlarity</option>
            </select>

            <div className="flex items-center gap-1 p-1 bg-[#F2F4F8] rounded-lg text-[12px] font-medium">
              {(['All', 'In Progress', 'Completed', 'Failed', 'Unanswered'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md transition whitespace-nowrap ${
                    statusFilter === st
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
                <th className="py-2.5 pr-4">Call / Order</th>
                <th className="py-2.5 px-3">Seller</th>
                <th className="py-2.5 px-3">Customer &amp; Lang</th>
                <th className="py-2.5 px-3">Provider</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Duration / RTT</th>
                <th className="py-2.5 pl-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    No AI calls match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((call) => (
                  <tr key={call.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 pr-4">
                      <div className="font-mono text-[12.5px] font-semibold text-slate-900">{call.id}</div>
                      <div className="text-[11.5px] text-slate-500">
                        {call.orderId} · {call.timestamp}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800">{call.sellerName}</td>
                    <td className="py-3 px-3">
                      <div className="text-slate-900 font-medium">{call.customerName}</div>
                      <div className="text-[11.5px] text-slate-500 tabular-nums">
                        {call.customerPhone} · {call.language}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{call.provider}</td>
                    <td className="py-3 px-3">
                      <div className={`font-semibold text-[12.5px] ${statusTone(call.status)}`}>
                        {call.status}
                      </div>
                      <div className="text-[11.5px] text-slate-500 max-w-[200px] truncate">{call.outcome}</div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-[12px] tabular-nums text-slate-700">
                      <div>{call.duration}</div>
                      <div className={call.latencyMs > 800 ? 'text-rose-600 font-semibold' : 'text-slate-400'}>
                        {call.latencyMs} ms
                      </div>
                    </td>
                    <td className="py-3 pl-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedCall(call)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#F2F4F8] hover:bg-slate-200 text-slate-700 text-[12px] font-medium transition"
                        >
                          Transcript
                        </button>
                        {call.status === 'Failed' && (
                          <button
                            type="button"
                            onClick={() => onRetryCall(call.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[12px] font-medium transition"
                          >
                            Retry
                          </button>
                        )}
                        {call.status === 'In Progress' && (
                          <button
                            type="button"
                            onClick={() => onTerminateCall(call.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[12px] font-medium transition"
                          >
                            End Call
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
      </div>

      {/* Transcript Modal */}
      {selectedCall && (
        <div className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-aisle-md border border-slate-200/80">
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-display font-semibold text-[16px] text-slate-900">
                  Call Transcript · {selectedCall.id}
                </h3>
                <p className="text-[12.5px] text-slate-500 mt-0.5">
                  {selectedCall.sellerName} · {selectedCall.customerName} ({selectedCall.language})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCall(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 max-h-72 overflow-y-auto pr-1">
              {selectedCall.transcript.map((line, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl text-[13px] leading-relaxed ${
                    line.speaker === 'AI'
                      ? 'bg-[#EFF6FF] text-slate-800'
                      : 'bg-[#F2F4F8] text-slate-900'
                  }`}
                >
                  <div className="text-[11px] font-semibold text-slate-500 mb-1">
                    {line.speaker === 'AI' ? 'octxAI Voice Agent' : selectedCall.customerName}
                  </div>
                  <p>{line.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[12px] text-slate-500 tabular-nums">
              <span>
                Provider: <strong className="text-slate-800">{selectedCall.provider}</strong> · Cost:{' '}
                <strong className="text-slate-800">{formatINR(selectedCall.costInr, true)}</strong>
              </span>
              <button
                type="button"
                onClick={() => setSelectedCall(null)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

/* ============================================================================
   2. WHATSAPP USAGE ANALYTICS TAB
============================================================================ */
interface WhatsAppAnalyticsProps {
  sellerUsage: AdminWhatsAppSellerUsage[];
  templateQueue: AdminWhatsAppTemplateQueueItem[];
  onModerateTemplate: (id: string, decision: 'Approved' | 'Rejected') => void;
}

export const AdminWhatsAppAnalyticsTab: React.FC<WhatsAppAnalyticsProps> = ({
  sellerUsage,
  templateQueue,
  onModerateTemplate,
}) => {
  const [tplFilter, setTplFilter] = useState<'All' | 'Pending Review' | 'Approved' | 'Rejected'>('All');

  const totals = useMemo(() => {
    return sellerUsage.reduce(
      (acc, row) => ({
        sent: acc.sent + row.sent,
        delivered: acc.delivered + row.delivered,
        read: acc.read + row.read,
        failed: acc.failed + row.failed,
        credits: acc.credits + row.creditsUsedInr,
      }),
      { sent: 0, delivered: 0, read: 0, failed: 0, credits: 0 }
    );
  }, [sellerUsage]);

  const deliveryRate = ((totals.delivered / Math.max(totals.sent, 1)) * 100).toFixed(1);
  const readRate = ((totals.read / Math.max(totals.delivered, 1)) * 100).toFixed(1);
  const pendingTemplates = templateQueue.filter((t) => t.status === 'Pending Review').length;

  const dailyVolume = [
    { day: 'Mon', utility: 78, marketing: 34 },
    { day: 'Tue', utility: 84, marketing: 42 },
    { day: 'Wed', utility: 91, marketing: 39 },
    { day: 'Thu', utility: 88, marketing: 47 },
    { day: 'Fri', utility: 96, marketing: 55 },
    { day: 'Sat', utility: 108, marketing: 64 },
    { day: 'Sun', utility: 94, marketing: 49 },
  ];

  const filteredTemplates = templateQueue.filter((t) =>
    tplFilter === 'All' ? true : t.status === tplFilter
  );

  return (
    <section className="view-section space-y-5">
      {/* KPI Strip */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/70">
          <div className="text-[12.5px] font-medium text-slate-500">WhatsApp Volume (30D)</div>
          <div className="mt-2 font-display text-[24px] sm:text-[28px] font-semibold text-slate-900 tabular-nums metric-tracking">
            1,14,82,400
          </div>
          <div className="mt-1.5 text-[12px] text-emerald-700 font-medium">+16.9% MoM across WABA pool</div>
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/70">
          <div className="text-[12.5px] font-medium text-slate-500">Meta Delivery Rate</div>
          <div className="mt-2 font-display text-[24px] sm:text-[28px] font-semibold text-slate-900 tabular-nums metric-tracking">
            {deliveryRate}%
          </div>
          <div className="mt-1.5 text-[12px] text-slate-500">Read rate {readRate}% · Opt-out 0.14%</div>
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/70">
          <div className="text-[12.5px] font-medium text-slate-500">API Credits Consumed</div>
          <div className="mt-2 font-display text-[24px] sm:text-[28px] font-semibold text-slate-900 tabular-nums metric-tracking">
            {formatINR(totals.credits + 1248000)}
          </div>
          <div className="mt-1.5 text-[12px] text-slate-500">68% Utility · 24% Marketing · 8% Auth</div>
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/70">
          <div className="text-[12.5px] font-medium text-slate-500">Pending Template Reviews</div>
          <div className="mt-2 font-display text-[24px] sm:text-[28px] font-semibold text-slate-900 tabular-nums metric-tracking">
            {pendingTemplates}
          </div>
          <div className="mt-1.5 text-[12px] text-amber-700 font-medium">Awaiting Meta compliance sign-off</div>
        </div>
      </div>

      {/* Daily Volume Chart + Category Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/70">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
            <div>
              <h2 className="font-display font-semibold text-[15.5px] text-slate-900">
                Daily Conversation Volume (Thousands)
              </h2>
              <p className="text-[12.5px] text-slate-500">Utility transactional alerts vs promotional campaigns</p>
            </div>
            <div className="flex items-center gap-4 text-[12px] text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#2563EB]" /> Utility
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" /> Marketing
              </span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-3 items-end h-44 pt-4">
            {dailyVolume.map((d) => {
              const total = d.utility + d.marketing;
              return (
                <div key={d.day} className="flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[11px] font-mono text-slate-500 tabular-nums">{total}k</span>
                  <div className="w-full max-w-[36px] flex flex-col justify-end rounded-lg overflow-hidden bg-slate-100 h-32">
                    <div
                      className="w-full bg-emerald-500 transition-all"
                      style={{ height: `${(d.marketing / 180) * 100}%` }}
                    />
                    <div
                      className="w-full bg-[#2563EB] transition-all"
                      style={{ height: `${(d.utility / 180) * 100}%` }}
                    />
                  </div>
                  <span className="text-[12px] font-medium text-slate-600">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Template Moderation Queue */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/70 flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h2 className="font-display font-semibold text-[15.5px] text-slate-900">
                Template Compliance Queue
              </h2>
              <p className="text-[12px] text-slate-500">Approve or reject seller WABA templates</p>
            </div>
            <select
              value={tplFilter}
              onChange={(e) => setTplFilter(e.target.value as typeof tplFilter)}
              className="px-2.5 py-1 rounded-lg bg-[#F2F4F8] text-[12px] font-medium text-slate-700 focus:outline-none"
            >
              <option value="All">All</option>
              <option value="Pending Review">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="divide-y divide-slate-100 mt-1 flex-1 overflow-y-auto max-h-72">
            {filteredTemplates.map((tpl) => (
              <div key={tpl.id} className="py-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-mono text-[12.5px] font-semibold text-slate-900 truncate">
                      {tpl.templateName}
                    </div>
                    <div className="text-[11.5px] text-slate-500 mt-0.5">
                      {tpl.sellerName} · {tpl.category} · {tpl.language}
                    </div>
                  </div>
                  <span
                    className={`text-[11.5px] font-semibold shrink-0 ${
                      tpl.status === 'Approved'
                        ? 'text-emerald-700'
                        : tpl.status === 'Rejected'
                          ? 'text-rose-600'
                          : 'text-amber-700'
                    }`}
                  >
                    {tpl.status}
                  </span>
                </div>
                <p className="mt-2 text-[12px] text-slate-600 leading-relaxed">{tpl.bodyPreview}</p>
                {tpl.status === 'Pending Review' && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onModerateTemplate(tpl.id, 'Approved')}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-medium transition flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onModerateTemplate(tpl.id, 'Rejected')}
                      className="px-3 py-1 rounded-lg bg-[#F2F4F8] hover:bg-rose-50 hover:text-rose-700 text-slate-700 text-[12px] font-medium transition"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Seller WhatsApp Consumers Table */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/70">
        <h2 className="font-display font-semibold text-[15.5px] text-slate-900 mb-4">
          Top Seller WhatsApp Consumption (30D)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-slate-200/80 text-[12px] font-semibold text-slate-500">
                <th className="py-2.5 pr-4">Seller</th>
                <th className="py-2.5 px-3">Plan</th>
                <th className="py-2.5 px-3 text-right">Sent</th>
                <th className="py-2.5 px-3 text-right">Delivery Rate</th>
                <th className="py-2.5 px-3 text-right">Read Rate</th>
                <th className="py-2.5 px-3 text-right">Utility / Mktg</th>
                <th className="py-2.5 pl-3 text-right">Credits Billed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 tabular-nums">
              {sellerUsage.map((u) => {
                const delPct = ((u.delivered / Math.max(u.sent, 1)) * 100).toFixed(1);
                const rdPct = ((u.read / Math.max(u.delivered, 1)) * 100).toFixed(1);
                return (
                  <tr key={u.sellerId} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 pr-4 font-medium text-slate-900">{u.businessName}</td>
                    <td className="py-3 px-3 text-slate-600">{u.plan}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-800">{u.sent.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-right text-emerald-700 font-medium">{delPct}%</td>
                    <td className="py-3 px-3 text-right text-[#2563EB] font-medium">{rdPct}%</td>
                    <td className="py-3 px-3 text-right text-slate-600">
                      {u.utilityShare}% / {u.marketingShare}%
                    </td>
                    <td className="py-3 pl-3 text-right font-semibold text-slate-900">
                      {formatINR(u.creditsUsedInr)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

/* ============================================================================
   3. SUPPORT TICKETS TAB
============================================================================ */
interface SupportTicketsProps {
  tickets: AdminSupportTicket[];
  adminUser: AdminUserPayload;
  onReplyTicket: (ticketId: string, text: string) => void;
  onUpdateTicketStatus: (ticketId: string, status: TicketStatus) => void;
  onUpdateTicketPriority: (ticketId: string, priority: TicketPriority) => void;
}

export const AdminSupportTicketsTab: React.FC<SupportTicketsProps> = ({
  tickets,
  adminUser,
  onReplyTicket,
  onUpdateTicketStatus,
  onUpdateTicketPriority,
}) => {
  const [statusFilter, setStatusFilter] = useState<'All' | TicketStatus>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | TicketPriority>('All');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string>(tickets[0]?.id ?? '');
  const [replyDraft, setReplyDraft] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tickets.filter((t) => {
      if (statusFilter !== 'All' && t.status !== statusFilter) return false;
      if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
      if (!q) return true;
      return (
        t.id.toLowerCase().includes(q) ||
        t.sellerName.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q)
      );
    });
  }, [tickets, statusFilter, priorityFilter, search]);

  const activeTicket =
    tickets.find((t) => t.id === selectedId) ?? filtered[0] ?? tickets[0] ?? null;

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyDraft.trim()) return;
    onReplyTicket(activeTicket.id, replyDraft.trim());
    setReplyDraft('');
  };

  const priorityTone = (p: TicketPriority) => {
    if (p === 'Critical') return 'text-rose-600';
    if (p === 'High') return 'text-amber-700';
    if (p === 'Medium') return 'text-[#2563EB]';
    return 'text-slate-500';
  };

  return (
    <section className="view-section space-y-5">
      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/70 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ticket ID, seller, subject..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F2F4F8] text-[13px] text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as 'All' | TicketPriority)}
            className="px-3 py-2 rounded-xl bg-[#F2F4F8] text-[12.5px] font-medium text-slate-700 focus:outline-none"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <div className="flex items-center gap-1 p-1 bg-[#F2F4F8] rounded-xl text-[12px] font-medium">
            {(['All', 'Open', 'In Progress', 'Waiting on Seller', 'Resolved'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1.5 rounded-lg transition whitespace-nowrap ${
                  statusFilter === st ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Split Master-Detail Helpdesk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Ticket Queue List */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/70 divide-y divide-slate-100 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-[13px] text-slate-500">
              No support tickets match the selected filters.
            </div>
          ) : (
            filtered.map((ticket) => {
              const selected = activeTicket?.id === ticket.id;
              return (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => setSelectedId(ticket.id)}
                  className={`w-full text-left p-4 transition-colors ${
                    selected ? 'bg-[#EFF6FF]/70' : 'hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-[12px]">
                    <span className="font-mono font-semibold text-slate-700">{ticket.id}</span>
                    <span className={`font-semibold ${priorityTone(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>
                  <div className="mt-1 font-semibold text-[13.5px] text-slate-900 line-clamp-1">
                    {ticket.subject}
                  </div>
                  <div className="mt-1.5 flex items-center justify-between gap-2 text-[12px] text-slate-500">
                    <span className="truncate">
                      {ticket.sellerName} · {ticket.category}
                    </span>
                    <span className="shrink-0 font-medium text-slate-600">{ticket.status}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Ticket Conversation Panel */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/70 flex flex-col justify-between min-h-[460px]">
          {activeTicket ? (
            <>
              <div>
                <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 text-[12px] text-slate-500">
                      <span className="font-mono font-semibold text-slate-700">{activeTicket.id}</span>
                      <span aria-hidden="true">·</span>
                      <span>{activeTicket.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>SLA {activeTicket.slaRemaining}</span>
                    </div>
                    <h3 className="mt-1 font-display font-semibold text-[16px] text-slate-900">
                      {activeTicket.subject}
                    </h3>
                    <div className="mt-1 text-[12.5px] text-slate-500">
                      {activeTicket.sellerName} ({activeTicket.sellerEmail}) · Assigned to{' '}
                      <span className="text-slate-800 font-medium">{activeTicket.assignedTo}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={activeTicket.priority}
                      onChange={(e) =>
                        onUpdateTicketPriority(activeTicket.id, e.target.value as TicketPriority)
                      }
                      aria-label="Ticket priority"
                      className="px-2.5 py-1.5 rounded-lg bg-[#F2F4F8] text-[12px] font-medium text-slate-700 focus:outline-none"
                    >
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                    <select
                      value={activeTicket.status}
                      onChange={(e) =>
                        onUpdateTicketStatus(activeTicket.id, e.target.value as TicketStatus)
                      }
                      aria-label="Ticket status"
                      className="px-2.5 py-1.5 rounded-lg bg-[#F2F4F8] text-[12px] font-medium text-slate-700 focus:outline-none"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Waiting on Seller">Waiting on Seller</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                </div>

                {/* Thread */}
                <div className="mt-4 space-y-3 max-h-[260px] overflow-y-auto pr-1">
                  {activeTicket.messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-3.5 rounded-xl text-[13px] ${
                        msg.role === 'Admin'
                          ? 'bg-[#EFF6FF] border border-blue-100'
                          : 'bg-[#F2F4F8]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-[11.5px] mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-semibold flex items-center justify-center">
                            {getInitials(msg.sender)}
                          </span>
                          <span className="font-semibold text-slate-900">{msg.sender}</span>
                          <span className="text-slate-400">· {msg.role}</span>
                        </div>
                        <span className="text-slate-400">{msg.timestamp}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{msg.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reply Box */}
              <form onSubmit={handleSendReply} className="mt-4 pt-4 border-t border-slate-100">
                <textarea
                  rows={2}
                  value={replyDraft}
                  onChange={(e) => setReplyDraft(e.target.value)}
                  placeholder={`Reply as ${adminUser.fullName}...`}
                  className="w-full p-3 rounded-xl bg-[#F2F4F8] text-[13px] text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none resize-none"
                />
                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateTicketStatus(
                        activeTicket.id,
                        activeTicket.status === 'Resolved' ? 'Open' : 'Resolved'
                      )
                    }
                    className="px-3 py-1.5 rounded-lg bg-[#F2F4F8] hover:bg-slate-200 text-slate-700 text-[12.5px] font-medium transition"
                  >
                    {activeTicket.status === 'Resolved' ? 'Reopen Ticket' : 'Mark Resolved'}
                  </button>
                  <button
                    type="submit"
                    disabled={!replyDraft.trim()}
                    className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-medium transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reply</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <LifeBuoy className="w-8 h-8 mb-2" />
              <p className="text-[13px]">Select a support ticket to inspect and reply.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

/* ============================================================================
   4. SYSTEM LOGS TAB
============================================================================ */
interface SystemLogsProps {
  logs: AdminSystemLog[];
  onExportLogs: () => void;
}

export const AdminSystemLogsTab: React.FC<SystemLogsProps> = ({ logs, onExportLogs }) => {
  const [severityFilter, setSeverityFilter] = useState<'All' | LogSeverity>('All');
  const [serviceFilter, setServiceFilter] = useState<'All' | AdminSystemLog['service']>('All');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(logs[0]?.id ?? null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return logs.filter((l) => {
      if (severityFilter !== 'All' && l.severity !== severityFilter) return false;
      if (serviceFilter !== 'All' && l.service !== serviceFilter) return false;
      if (!q) return true;
      return (
        l.id.toLowerCase().includes(q) ||
        l.event.toLowerCase().includes(q) ||
        l.message.toLowerCase().includes(q) ||
        l.actor.toLowerCase().includes(q)
      );
    });
  }, [logs, severityFilter, serviceFilter, search]);

  const severityColor = (sev: LogSeverity) => {
    if (sev === 'Error') return 'text-rose-600';
    if (sev === 'Warning') return 'text-amber-700';
    if (sev === 'Security') return 'text-[#2563EB]';
    return 'text-emerald-700';
  };

  return (
    <section className="view-section space-y-5">
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/70">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-display font-semibold text-[15.5px] text-slate-900">
              Platform Audit &amp; System Logs
            </h2>
            <p className="text-[12.5px] text-slate-500">
              Immutable trail of authentication OTP events, billing webhooks, carrier faults, and admin actions
            </p>
          </div>
          <button
            type="button"
            onClick={onExportLogs}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[12.5px] font-medium transition flex items-center gap-1.5 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Logs CSV</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter event code, actor, message..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#F2F4F8] text-[12.5px] text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value as 'All' | AdminSystemLog['service'])}
              className="px-3 py-1.5 rounded-lg bg-[#F2F4F8] text-[12.5px] font-medium text-slate-700 focus:outline-none"
            >
              <option value="All">All Services</option>
              <option value="Auth & OTP">Auth &amp; OTP</option>
              <option value="Billing Engine">Billing Engine</option>
              <option value="AI Voice Router">AI Voice Router</option>
              <option value="WhatsApp Gateway">WhatsApp Gateway</option>
              <option value="Admin Audit">Admin Audit</option>
              <option value="Webhook Worker">Webhook Worker</option>
            </select>

            <div className="flex items-center gap-1 p-1 bg-[#F2F4F8] rounded-lg text-[12px] font-medium">
              {(['All', 'Info', 'Warning', 'Error', 'Security'] as const).map((sev) => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2.5 py-1 rounded-md transition whitespace-nowrap ${
                    severityFilter === sev ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Log Rows */}
        <div className="divide-y divide-slate-100 mt-1">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-[13px] text-slate-500">
              No system logs match the active query.
            </div>
          ) : (
            filtered.map((log) => {
              const isExpanded = expandedId === log.id;
              return (
                <div key={log.id} className="py-3">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    className="w-full text-left flex flex-wrap items-start justify-between gap-3 group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px]">
                        <span className="font-mono text-slate-400 tabular-nums">{log.timestamp}</span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className={`font-semibold ${severityColor(log.severity)}`}>{log.severity}</span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="font-medium text-slate-700">{log.service}</span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="font-mono text-[11.5px] text-slate-500">{log.event}</span>
                      </div>
                      <p className="mt-1 text-[13px] text-slate-800 group-hover:text-slate-950">
                        {log.message}
                      </p>
                      <div className="mt-1 text-[11.5px] text-slate-400 font-mono">
                        actor: {log.actor} · ip: {log.ipAddress} · id: {log.id}
                      </div>
                    </div>
                    <span className="text-slate-400 mt-1 shrink-0">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>

                  {isExpanded && (
                    <pre className="mt-2.5 p-3 rounded-xl bg-slate-950 text-slate-200 text-[12px] font-mono overflow-x-auto leading-relaxed">
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

/* ============================================================================
   5. REPORTS EXPORT TAB
============================================================================ */
interface ReportsExportProps {
  sellers: AdminSeller[];
  subscriptions: AdminSubscription[];
  calls: AdminAICallStream[];
  waUsage: AdminWhatsAppSellerUsage[];
  tickets: AdminSupportTicket[];
  logs: AdminSystemLog[];
  exportHistory: AdminExportRecord[];
  onRecordExport: (reportName: string, format: 'CSV' | 'JSON', dateRange: string, rowCount: number) => void;
}

export const AdminReportsExportTab: React.FC<ReportsExportProps> = ({
  sellers,
  subscriptions,
  calls,
  waUsage,
  tickets,
  logs,
  exportHistory,
  onRecordExport,
}) => {
  const [dateRange, setDateRange] = useState<'Last 7 Days' | 'Last 30 Days' | 'Last 90 Days' | 'FY 2026-27'>('Last 30 Days');
  const [format, setFormat] = useState<'CSV' | 'JSON'>('CSV');

  const triggerDownload = (
    slug: string,
    reportName: string,
    headers: string[],
    rows: (string | number)[][],
    jsonObj: unknown
  ) => {
    const ext = format.toLowerCase();
    const filename = `octxai_admin_${slug}_${dateRange.toLowerCase().replace(/\s+/g, '_')}.${ext}`;
    if (format === 'CSV') {
      downloadCSV(filename, headers, rows);
    } else {
      downloadTextFile(filename, JSON.stringify({ reportName, dateRange, exportedAt: new Date().toISOString(), data: jsonObj }, null, 2));
    }
    onRecordExport(reportName, format, dateRange, rows.length);
  };

  const reportCards = [
    {
      id: 'mrr-ledger',
      title: 'MRR, Churn & Retention Ledger',
      desc: 'Monthly recurring revenue breakdown by plan tier, cohort retention percentages, and involuntary churn totals.',
      rowsLabel: `${subscriptions.length} active subscriptions`,
      icon: FileSpreadsheet,
      onExport: () =>
        triggerDownload(
          'mrr_ledger',
          'MRR, Churn & Retention Ledger',
          ['Subscription ID', 'Seller', 'Plan', 'Billing Cycle', 'Amount (INR)', 'Status', 'Renewal Date'],
          subscriptions.map((s) => [s.id, s.businessName, s.plan, s.billingCycle, s.amount, s.status, s.renewalDate]),
          subscriptions
        ),
    },
    {
      id: 'sellers-directory',
      title: 'Active Sellers & Wallet Audit',
      desc: 'Complete seller roster with GSTIN, marketplace channel, monthly order volume, and prepaid wallet balance.',
      rowsLabel: `${sellers.length} seller accounts`,
      icon: CheckCircle2,
      onExport: () =>
        triggerDownload(
          'sellers_directory',
          'Active Sellers & Wallet Audit',
          ['Seller ID', 'Business', 'Owner', 'City', 'GSTIN', 'Plan', 'Status', 'MRR (INR)', 'Wallet (INR)'],
          sellers.map((s) => [
            s.id,
            s.businessName,
            s.ownerName,
            s.city,
            s.gstin,
            s.plan,
            s.status,
            s.mrrContribution,
            s.walletBalance,
          ]),
          sellers
        ),
    },
    {
      id: 'ai-calls-audit',
      title: 'AI Voice Monitoring & Telephony Cost',
      desc: 'Call-level carrier latency, SIP provider performance, answer outcomes, and per-call cost accounting.',
      rowsLabel: `${calls.length} monitored calls`,
      icon: PhoneCall,
      onExport: () =>
        triggerDownload(
          'ai_calls_audit',
          'AI Voice Monitoring & Telephony Cost',
          ['Call ID', 'Seller', 'Order', 'Language', 'Provider', 'Status', 'Duration', 'Latency (ms)', 'Cost (INR)'],
          calls.map((c) => [c.id, c.sellerName, c.orderId, c.language, c.provider, c.status, c.duration, c.latencyMs, c.costInr]),
          calls
        ),
    },
    {
      id: 'whatsapp-usage',
      title: 'WhatsApp API Consumption Report',
      desc: 'Per-seller message throughput, delivery/read conversion rates, utility vs marketing ratio, and Meta credits billed.',
      rowsLabel: `${waUsage.length} high-volume WABA accounts`,
      icon: MessageSquare,
      onExport: () =>
        triggerDownload(
          'whatsapp_usage',
          'WhatsApp API Consumption Report',
          ['Seller ID', 'Business', 'Plan', 'Sent', 'Delivered', 'Read', 'Failed', 'Credits (INR)'],
          waUsage.map((u) => [u.sellerId, u.businessName, u.plan, u.sent, u.delivered, u.read, u.failed, u.creditsUsedInr]),
          waUsage
        ),
    },
    {
      id: 'support-sla',
      title: 'Support Tickets & SLA Compliance',
      desc: 'Helpdesk resolution queue, ticket priorities, assigned engineers, and remaining response SLA timers.',
      rowsLabel: `${tickets.length} support tickets`,
      icon: AlertCircle,
      onExport: () =>
        triggerDownload(
          'support_sla',
          'Support Tickets & SLA Compliance',
          ['Ticket ID', 'Seller', 'Category', 'Priority', 'Status', 'Assigned To', 'SLA'],
          tickets.map((t) => [t.id, t.sellerName, t.category, t.priority, t.status, t.assignedTo, t.slaRemaining]),
          tickets
        ),
    },
    {
      id: 'system-logs',
      title: 'Security & System Audit Logs',
      desc: 'Chronological audit export covering admin OTP logins, billing webhooks, rate limits, and voice carrier alerts.',
      rowsLabel: `${logs.length} audit events`,
      icon: ScrollText,
      onExport: () =>
        triggerDownload(
          'system_logs',
          'Security & System Audit Logs',
          ['Log ID', 'Timestamp', 'Severity', 'Service', 'Actor', 'Event', 'IP Address', 'Message'],
          logs.map((l) => [l.id, l.timestamp, l.severity, l.service, l.actor, l.event, l.ipAddress, l.message]),
          logs
        ),
    },
  ];

  return (
    <section className="view-section space-y-5">
      {/* Export Controls Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/70 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-semibold text-[16px] text-slate-900">
            Admin Reports &amp; Data Export Center
          </h2>
          <p className="text-[12.5px] text-slate-500 mt-0.5">
            Download audit-ready platform reports in CSV or structured JSON format
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
            className="px-3 py-2 rounded-xl bg-[#F2F4F8] text-[13px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          >
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="Last 90 Days">Last 90 Days</option>
            <option value="FY 2026-27">FY 2026-27</option>
          </select>

          <div className="flex items-center gap-1 p-1 bg-[#F2F4F8] rounded-xl text-[12.5px] font-medium">
            {(['CSV', 'JSON'] as const).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setFormat(fmt)}
                className={`px-3 py-1 rounded-lg transition ${
                  format === fmt ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        {reportCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/70 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[12px] text-slate-400 tabular-nums">{card.rowsLabel}</span>
                </div>
                <h3 className="font-display font-semibold text-[15px] text-slate-900">{card.title}</h3>
                <p className="mt-1.5 text-[12.5px] text-slate-500 leading-relaxed">{card.desc}</p>
              </div>
              <button
                type="button"
                onClick={card.onExport}
                className="mt-5 w-full py-2.5 px-4 rounded-xl bg-[#F2F4F8] hover:bg-[#2563EB] text-slate-800 hover:text-white text-[13px] font-medium flex items-center justify-center gap-2 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export {format} · {dateRange}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Recent Export History */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/70">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-[15px] text-slate-900">Recent Export Activity</h3>
          <span className="text-[12px] text-slate-500 tabular-nums">{exportHistory.length} generated</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-slate-200/80 text-[12px] font-semibold text-slate-500">
                <th className="py-2.5 pr-4">Export ID</th>
                <th className="py-2.5 px-3">Report</th>
                <th className="py-2.5 px-3">Window &amp; Format</th>
                <th className="py-2.5 px-3">Generated By</th>
                <th className="py-2.5 pl-3 text-right">Records</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 tabular-nums">
              {exportHistory.map((item) => (
                <tr key={item.id} className="hover:bg-[#F8FAFC]">
                  <td className="py-2.5 pr-4 font-mono text-[12px] text-slate-600">{item.id}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-900">{item.reportName}</td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {item.dateRange} · {item.format}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {item.generatedBy} · {item.generatedAt}
                  </td>
                  <td className="py-2.5 pl-3 text-right font-mono text-slate-800">
                    {item.rowCount.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
