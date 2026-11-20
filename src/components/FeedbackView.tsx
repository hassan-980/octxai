import React, { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  Frown,
  Meh,
  MessageSquare,
  Send,
  ShieldCheck,
  Smile,
  Star,
  X,
} from 'lucide-react';
import { FeedbackRequest, FeedbackReview, SellerSettingsState } from '../types';
import { downloadCSV, getOrderStatusBadgeClass } from '../utils/helpers';

interface FeedbackViewProps {
  reviews: FeedbackReview[];
  requests: FeedbackRequest[];
  settings: SellerSettingsState;
  onUpdateSettings: (next: SellerSettingsState) => void;
  onReplyReview: (id: string, reply: string) => void;
  onSendFeedbackRequest: (req: FeedbackRequest) => void;
  onShowToast: (msg: string) => void;
}

type FeedbackSubTab = 'overview' | 'templates' | 'shield';

export const FeedbackView: React.FC<FeedbackViewProps> = ({
  reviews,
  requests,
  settings,
  onUpdateSettings,
  onReplyReview,
  onSendFeedbackRequest,
  onShowToast,
}) => {
  const [subTab, setSubTab] = useState<FeedbackSubTab>('overview');
  const [trendRange, setTrendRange] = useState<'7d' | '30d'>('7d');
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'Positive' | 'Neutral' | 'Negative'>('all');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // Modals
  const [activeReview, setActiveReview] = useState<FeedbackReview | null>(null);
  const [replyDraft, setReplyDraft] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [reqOrderId, setReqOrderId] = useState('ORD-10008');
  const [reqCustomer, setReqCustomer] = useState('Neha Patel');
  const [reqChannel, setReqChannel] = useState<'WhatsApp' | 'AI Call'>('WhatsApp');

  // Review Templates state
  const [waReviewTemplate, setWaReviewTemplate] = useState(
    'Hi {{customer_name}}, thank you for shopping with Aman Store! How was your {{product_name}}? Tap 1–5 stars below.'
  );

  const filteredReviews = useMemo(() => {
    if (sentimentFilter === 'all') return reviews;
    return reviews.filter((r) => r.sentiment === sentimentFilter);
  }, [reviews, sentimentFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / pageSize));
  const paginatedReviews = filteredReviews.slice((page - 1) * pageSize, page * pageSize);

  const handleExport = () => {
    downloadCSV(
      'sellersaathi-feedback.csv',
      ['Order ID', 'Customer', 'Phone', 'Rating', 'Sentiment', 'Tags', 'Comment', 'Date'],
      filteredReviews.map((r) => [r.orderId, r.customer, r.phone, r.rating, r.sentiment, r.tags.join('; '), r.comment, r.date])
    );
    onShowToast('Customer feedback exported to CSV');
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReview || !replyDraft.trim()) return;
    onReplyReview(activeReview.id, replyDraft.trim());
    setActiveReview(null);
    setReplyDraft('');
    onShowToast(`Reply sent to ${activeReview.customer} via WhatsApp`);
  };

  const handleSendRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendFeedbackRequest({
      id: `fr-${Date.now()}`,
      orderId: reqOrderId.trim() || 'ORD-10009',
      customer: reqCustomer.trim() || 'Customer',
      date: 'Just now',
      channel: reqChannel,
      status: 'Sent',
    });
    setShowRequestModal(false);
    onShowToast(`Feedback request sent to ${reqCustomer} via ${reqChannel}`);
  };

  return (
    <section className="view-section space-y-5">
      {/* Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="bg-white p-1 sm:p-1.5 rounded-xl sm:rounded-2xl shadow-aisle inline-flex flex-wrap items-center gap-1 text-[11.5px] sm:text-[13px] font-medium">
          {[
            { id: 'overview', label: 'Overview & Reviews' },
            { id: 'templates', label: 'Review Templates' },
            { id: 'shield', label: 'Seller Shield Settings' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as FeedbackSubTab)}
              className={`px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl transition ${
                subTab === tab.id ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:bg-[#F2F4F8]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowRequestModal(true)}
          className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-medium shadow-sm flex items-center gap-1.5 transition"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Request Feedback</span>
        </button>
      </div>

      {/* 6 KPI Cards (from Screenshot 2 & 8) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-aisle">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-slate-400">Total Feedback</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
              <Star className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 font-display text-2xl font-semibold text-slate-900 metric-tracking">4,856</div>
          <div className="mt-1.5 text-[11.5px] text-emerald-600 font-medium">↗ 18.7% vs 7d</div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-aisle">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-slate-400">Positive</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Smile className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 font-display text-2xl font-semibold text-slate-900 metric-tracking">4,132</div>
          <div className="mt-1.5 text-[11.5px] text-emerald-600 font-medium">85.1% of total</div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-aisle">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-slate-400">Neutral</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Meh className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 font-display text-2xl font-semibold text-slate-900 metric-tracking">512</div>
          <div className="mt-1.5 text-[11.5px] text-amber-600 font-medium">10.5% of total</div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-aisle">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-slate-400">Negative</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Frown className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 font-display text-2xl font-semibold text-slate-900 metric-tracking">212</div>
          <div className="mt-1.5 text-[11.5px] text-rose-600 font-medium">4.4% intercepted</div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-aisle">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-slate-400">Requests Sent</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 font-display text-2xl font-semibold text-slate-900 metric-tracking">6,245</div>
          <div className="mt-1.5 text-[11.5px] text-emerald-600 font-medium">↗ 16.3% vs 7d</div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-aisle">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-slate-400">Average Rating</span>
            <div className="w-7 h-7 rounded-lg bg-[#F1F5F9] text-[#2563EB] flex items-center justify-center">
              <Star className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 font-display text-2xl font-semibold text-slate-900 metric-tracking">
            4.6 <span className="text-sm font-normal text-slate-400">/ 5</span>
          </div>
          <div className="mt-1.5 text-[11.5px] text-amber-500">★★★★★</div>
        </div>
      </div>

      {subTab === 'overview' && (
        <>
          {/* Middle Row: Feedback Trend + Rating Distribution + Top Feedback Tags (from Screenshot 2) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Feedback Trend Multi-line Chart */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-aisle flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-display font-semibold text-[16px] text-slate-900">Feedback Trend</h2>
                  <div className="flex items-center gap-3 text-[11.5px] text-slate-500 mt-1">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Positive</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Neutral</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> Negative</span>
                  </div>
                </div>
                <div className="bg-[#F2F4F8] p-1 rounded-xl inline-flex text-[11.5px] font-medium">
                  <button
                    onClick={() => setTrendRange('7d')}
                    className={`px-2.5 py-1 rounded-lg ${trendRange === '7d' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'}`}
                  >
                    Last 7 Days
                  </button>
                  <button
                    onClick={() => setTrendRange('30d')}
                    className={`px-2.5 py-1 rounded-lg ${trendRange === '30d' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'}`}
                  >
                    30 Days
                  </button>
                </div>
              </div>

              <div className="h-44 w-full">
                <svg viewBox="0 0 360 140" className="w-full h-full overflow-visible">
                  <line x1="0" y1="25" x2="360" y2="25" stroke="#F1F5F9" strokeWidth="1" />
                  <line x1="0" y1="65" x2="360" y2="65" stroke="#F1F5F9" strokeWidth="1" />
                  <line x1="0" y1="105" x2="360" y2="105" stroke="#F1F5F9" strokeWidth="1" />
                  <polyline
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2.2"
                    points={trendRange === '7d' ? '10,65 65,48 120,54 175,35 230,38 290,26 350,18' : '10,75 65,62 120,50 175,45 230,30 290,22 350,14'}
                  />
                  <polyline fill="none" stroke="#F59E0B" strokeWidth="1.8" points="10,108 65,104 120,106 175,102 230,105 290,101 350,102" />
                  <polyline fill="none" stroke="#EF4444" strokeWidth="1.8" points="10,124 65,122 120,125 175,121 230,123 290,122 350,120" />
                </svg>
              </div>
              <div className="grid grid-cols-7 text-center text-[11px] text-slate-400 pt-1">
                <span>12 May</span><span>13 May</span><span>14 May</span><span>15 May</span><span>16 May</span><span>17 May</span><span>18 May</span>
              </div>
            </div>

            {/* Rating Distribution Donut */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-aisle flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display font-semibold text-[16px] text-slate-900">Rating Distribution</h2>
                <span className="text-[12px] text-slate-400">4,856 ratings</span>
              </div>
              <div className="flex items-center gap-5 my-auto">
                <div className="relative w-28 h-28 shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#F1F5F9" strokeWidth="4" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#10B981" strokeWidth="4" strokeDasharray="60.7 100" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#34D399" strokeWidth="4" strokeDasharray="24.4 100" strokeDashoffset="-60.7" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#F59E0B" strokeWidth="4" strokeDasharray="10.5 100" strokeDashoffset="-85.1" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#EF4444" strokeWidth="4" strokeDasharray="4.4 100" strokeDashoffset="-95.6" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-display text-lg font-semibold text-slate-900">4.6</span>
                    <span className="text-[10px] text-slate-400">Average</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2 text-[12px]">
                  {[
                    { stars: '5 ★', count: '2,945 (60.7%)', pct: 60.7, color: 'bg-emerald-500' },
                    { stars: '4 ★', count: '1,187 (24.4%)', pct: 24.4, color: 'bg-emerald-400' },
                    { stars: '3 ★', count: '512 (10.5%)', pct: 10.5, color: 'bg-amber-500' },
                    { stars: '2 ★', count: '128 (2.6%)', pct: 4, color: 'bg-orange-500' },
                    { stars: '1 ★', count: '84 (1.7%)', pct: 3, color: 'bg-rose-500' },
                  ].map((r) => (
                    <div key={r.stars} className="flex items-center gap-2">
                      <span className="w-7 text-slate-600 font-medium">{r.stars}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
                        <div className={`h-full rounded-full ${r.color}`} style={{ width: `${r.pct}%` }} />
                      </div>
                      <span className="text-[11px] text-slate-500 tabular-nums w-24 text-right">{r.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Feedback Tags */}
            <div className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-aisle flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-[16px] text-slate-900">Top Feedback Tags</h2>
                <span className="text-[11.5px] text-slate-400">4,556 tags</span>
              </div>
              <div className="space-y-3 text-[12.5px]">
                {[
                  { label: 'Fast Delivery', count: '1,245 (25.6%)', color: 'bg-emerald-50 text-emerald-700' },
                  { label: 'Good Product Quality', count: '1,102 (22.7%)', color: 'bg-blue-50 text-[#2563EB]' },
                  { label: 'Excellent Service', count: '986 (20.3%)', color: 'bg-indigo-50 text-indigo-700' },
                  { label: 'Well Packaged', count: '512 (10.5%)', color: 'bg-amber-50 text-amber-700' },
                  { label: 'Value for Money', count: '398 (8.2%)', color: 'bg-rose-50 text-rose-700' },
                ].map((tag) => (
                  <div key={tag.label} className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${tag.color}`}>{tag.label}</span>
                    <strong className="text-slate-800 text-[12px] tabular-nums">{tag.count}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Row: Recent Feedback Table + Recent Feedback Requests */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-8 bg-white rounded-2xl p-6 shadow-aisle flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                  <div>
                    <h2 className="font-display font-semibold text-[16px] text-slate-900">Recent Feedback</h2>
                    <p className="text-[12.5px] text-slate-400">Click any review to reply directly on WhatsApp</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-[#F2F4F8] px-2.5 py-1.5 rounded-xl">
                      <Filter className="w-3.5 h-3.5 text-slate-400" />
                      <select
                        value={sentimentFilter}
                        onChange={(e) => {
                          setSentimentFilter(e.target.value as typeof sentimentFilter);
                          setPage(1);
                        }}
                        className="bg-transparent text-[12px] font-medium text-slate-700 focus:outline-none"
                      >
                        <option value="all">All Sentiments</option>
                        <option value="Positive">Positive</option>
                        <option value="Neutral">Neutral</option>
                        <option value="Negative">Negative</option>
                      </select>
                    </div>
                    <button
                      onClick={handleExport}
                      className="px-3 py-1.5 rounded-xl bg-[#F2F4F8] hover:bg-slate-200 text-slate-700 text-[12px] font-medium flex items-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[12px] font-medium text-slate-400 border-b border-slate-100">
                        <th className="pb-3 font-medium">Customer</th>
                        <th className="pb-3 font-medium">Order ID</th>
                        <th className="pb-3 font-medium">Rating</th>
                        <th className="pb-3 font-medium">Feedback</th>
                        <th className="pb-3 font-medium">Tags</th>
                        <th className="pb-3 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[13px]">
                      {paginatedReviews.map((rev) => (
                        <tr key={rev.id} className="hover:bg-slate-50/70">
                          <td className="py-3.5">
                            <div className="font-medium text-slate-900">{rev.customer}</div>
                            <div className="text-[11px] text-slate-400">{rev.phone}</div>
                          </td>
                          <td className="py-3.5 font-semibold text-[#2563EB] whitespace-nowrap">{rev.orderId}</td>
                          <td className="py-3.5 text-amber-500 whitespace-nowrap">
                            {'★'.repeat(rev.rating)}<span className="text-slate-200">{'★'.repeat(5 - rev.rating)}</span>
                          </td>
                          <td className="py-3.5 max-w-xs">
                            <p className="text-slate-600 line-clamp-2">{rev.comment}</p>
                            {rev.reply && (
                              <p className="text-[11px] text-[#2563EB] mt-1 font-medium">Replied: {rev.reply}</p>
                            )}
                          </td>
                          <td className="py-3.5">
                            <div className="flex flex-wrap gap-1">
                              {rev.tags.map((t) => (
                                <span key={t} className="px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-[#F1F5F9] text-slate-700">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3.5 text-right">
                            <button
                              onClick={() => {
                                setActiveReview(rev);
                                setReplyDraft(rev.reply || '');
                              }}
                              className="p-1.5 rounded-lg bg-[#F2F4F8] hover:bg-[#2563EB] text-slate-600 hover:text-white transition"
                              title="View & Reply"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[12px] text-slate-500">
                <span>Showing {paginatedReviews.length} of {filteredReviews.length} reviews</span>
                <div className="flex items-center gap-1">
                  <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="p-1.5 rounded-lg bg-[#F2F4F8] disabled:opacity-40">
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2.5 py-1 rounded-lg bg-[#2563EB] text-white font-medium">{page}</span>
                  <button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="p-1.5 rounded-lg bg-[#F2F4F8] disabled:opacity-40">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Recent Feedback Requests */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-aisle flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-semibold text-[16px] text-slate-900">Recent Feedback Requests</h2>
                  <span className="text-[12px] text-slate-400">{requests.length} recent</span>
                </div>
                <div className="space-y-3">
                  {requests.slice(0, 5).map((fr) => (
                    <div key={fr.id} className="p-3 rounded-xl bg-[#F8FAFC] flex items-center justify-between gap-2 text-[12.5px]">
                      <div>
                        <div className="font-semibold text-slate-900">Order #{fr.orderId}</div>
                        <div className="text-slate-500">{fr.customer} · {fr.channel}</div>
                        <div className="text-[11px] text-slate-400">{fr.date}</div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${getOrderStatusBadgeClass(fr.status)}`}>
                        {fr.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setShowRequestModal(true)}
                className="mt-4 w-full py-2.5 rounded-xl bg-[#F2F4F8] hover:bg-slate-200 text-slate-800 text-[13px] font-medium transition"
              >
                Send Feedback Request
              </button>
            </div>
          </div>
        </>
      )}

      {subTab === 'templates' && (
        <div className="bg-white rounded-2xl p-6 shadow-aisle max-w-3xl space-y-4">
          <h2 className="font-display font-semibold text-[16px] text-slate-900">WhatsApp &amp; AI Review Request Template</h2>
          <textarea
            rows={4}
            value={waReviewTemplate}
            onChange={(e) => setWaReviewTemplate(e.target.value)}
            className="w-full p-4 rounded-xl bg-[#F8FAFC] text-[13.5px] text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
          />
          <div className="flex justify-end">
            <button
              onClick={() => onShowToast('Review request template saved')}
              className="px-5 py-2.5 rounded-xl bg-[#2563EB] text-white text-[13px] font-medium"
            >
              Save Template
            </button>
          </div>
        </div>
      )}

      {subTab === 'shield' && (
        <div className="bg-white rounded-2xl p-6 shadow-aisle max-w-3xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-[16px] text-slate-900">Amazon &amp; Marketplace Seller Shield</h2>
              <p className="text-[12.5px] text-slate-400">Intercept unhappy buyers privately before they leave a low marketplace rating</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#F8FAFC] flex items-center justify-between">
            <div>
              <div className="font-medium text-slate-900 text-[13.5px]">Private Support Routing Threshold</div>
              <div className="text-[12px] text-slate-400">Ratings at or below this star count route to your WhatsApp support desk</div>
            </div>
            <select
              value={settings.sellerShieldThreshold}
              onChange={(e) =>
                onUpdateSettings({ ...settings, sellerShieldThreshold: Number(e.target.value) })
              }
              className="px-3.5 py-2 rounded-xl bg-white text-slate-900 font-medium text-[13px] shadow-2xs focus:outline-none"
            >
              <option value={2}>≤ 2 Stars</option>
              <option value={3}>≤ 3 Stars</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => onShowToast('Seller Shield threshold saved')}
              className="px-5 py-2.5 rounded-xl bg-[#2563EB] text-white text-[13px] font-medium"
            >
              Save Shield Rules
            </button>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {activeReview && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-aisle-frame p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-display font-semibold text-[16px] text-slate-900">
                Reply to {activeReview.customer}
              </h3>
              <button onClick={() => setActiveReview(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4 p-3.5 rounded-xl bg-[#F8FAFC] text-[13px]">
              <div className="text-amber-500 text-xs mb-1">{'★'.repeat(activeReview.rating)} · {activeReview.orderId}</div>
              <p className="text-slate-700">{activeReview.comment}</p>
            </div>
            <form onSubmit={handleReplySubmit} className="mt-4 space-y-3">
              <textarea
                rows={3}
                required
                placeholder="Write a personal WhatsApp response or replacement offer..."
                value={replyDraft}
                onChange={(e) => setReplyDraft(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#F2F4F8] text-[13px] text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setActiveReview(null)} className="px-4 py-2 rounded-xl bg-[#F2F4F8] text-slate-700 text-[13px] font-medium">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-[#2563EB] text-white text-[13px] font-medium">
                  Send WhatsApp Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Feedback Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-aisle-frame p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-display font-semibold text-[16px] text-slate-900">Send Feedback Request</h3>
              <button onClick={() => setShowRequestModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSendRequestSubmit} className="mt-4 space-y-3.5 text-[13.5px]">
              <div>
                <label className="block text-slate-500 text-xs font-medium mb-1">Order ID</label>
                <input
                  type="text"
                  required
                  value={reqOrderId}
                  onChange={(e) => setReqOrderId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F2F4F8] text-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-xs font-medium mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  value={reqCustomer}
                  onChange={(e) => setReqCustomer(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F2F4F8] text-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-xs font-medium mb-1">Channel</label>
                <select
                  value={reqChannel}
                  onChange={(e) => setReqChannel(e.target.value as 'WhatsApp' | 'AI Call')}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F2F4F8] text-slate-900 focus:outline-none"
                >
                  <option value="WhatsApp">WhatsApp Interactive Star Poll</option>
                  <option value="AI Call">Post-Delivery AI Call</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowRequestModal(false)} className="px-4 py-2 rounded-xl bg-[#F2F4F8] text-slate-700 font-medium">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-[#2563EB] text-white font-medium">
                  Send Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
