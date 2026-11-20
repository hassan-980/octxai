import React, { useState } from 'react';
import { BarChart3, Calendar, Download, FileSpreadsheet, PhoneCall, Star, Truck, MessageCircle } from 'lucide-react';
import { AICall, FeedbackReview, Order, Shipment } from '../types';
import { downloadCSV } from '../utils/helpers';

interface ReportsViewProps {
  orders: Order[];
  calls: AICall[];
  shipments: Shipment[];
  reviews: FeedbackReview[];
  onShowToast: (msg: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  orders,
  calls,
  shipments,
  reviews,
  onShowToast,
}) => {
  const [dateWindow, setDateWindow] = useState('Last 7 Days (12 May – 18 May)');

  const reports = [
    {
      id: 'orders',
      title: 'Orders & COD Conversion Report',
      desc: 'Complete marketplace order log, COD vs Prepaid split, and AI verification status.',
      icon: FileSpreadsheet,
      records: `${orders.length} live rows`,
      action: () => {
        downloadCSV(
          'Octxai-orders-report.csv',
          ['Order ID', 'Customer', 'Product', 'Amount', 'Mode', 'Channel', 'Status'],
          orders.map((o) => [o.id, o.customer, o.product, o.amount, o.paymentMode, o.channel, o.status])
        );
        onShowToast('Orders & COD Conversion Report downloaded');
      },
    },
    {
      id: 'calls',
      title: 'AI Voice Calling Performance Report',
      desc: 'Call completion rates, Hinglish ASR confidence scores, durations, and retry outcomes.',
      icon: PhoneCall,
      records: `${calls.length} call logs`,
      action: () => {
        downloadCSV(
          'Octxai-ai-calls-report.csv',
          ['Order ID', 'Customer', 'Phone', 'Voice', 'Call Type', 'Duration', 'Status', 'Outcome'],
          calls.map((c) => [c.id, c.name, c.phone, c.voice, c.callType, c.duration, c.status, c.outcomeTitle])
        );
        onShowToast('AI Voice Calling Report downloaded');
      },
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp Campaign & Read-Rate Report',
      desc: 'Meta Cloud API delivery, read receipts, button reply conversions, and template usage.',
      icon: MessageCircle,
      records: '15,692 messages',
      action: () => {
        downloadCSV(
          'Octxai-whatsapp-report.csv',
          ['Metric', 'Count', 'Rate'],
          [
            ['Messages Sent', 15692, '100%'],
            ['Delivered', 15102, '96.2%'],
            ['Read', 10789, '71.4%'],
            ['Customer Replies', 2340, '14.9%'],
            ['Failed', 590, '3.8%'],
          ]
        );
        onShowToast('WhatsApp Campaign Report downloaded');
      },
    },
    {
      id: 'tracking',
      title: 'Courier SLA & NDR Exception Report',
      desc: 'Delhivery, BlueDart, XpressBees, Ecom Express & Shadowfax delivery timelines and delays.',
      icon: Truck,
      records: `${shipments.length} shipments`,
      action: () => {
        downloadCSV(
          'Octxai-courier-ndr-report.csv',
          ['Order ID', 'Customer', 'Courier', 'AWB', 'Status', 'Pickup Date', 'ETA'],
          shipments.map((s) => [s.orderId, s.customer, s.courier, s.awb, s.status, s.pickupDate, s.eta])
        );
        onShowToast('Courier SLA & NDR Report downloaded');
      },
    },
    {
      id: 'feedback',
      title: 'Customer Sentiment & Rating Report',
      desc: 'Post-delivery star ratings, top sentiment tags, and Seller Shield interceptions.',
      icon: Star,
      records: `${reviews.length} recent reviews`,
      action: () => {
        downloadCSV(
          'Octxai-sentiment-report.csv',
          ['Order ID', 'Customer', 'Rating', 'Sentiment', 'Tags', 'Comment'],
          reviews.map((r) => [r.orderId, r.customer, r.rating, r.sentiment, r.tags.join('; '), r.comment])
        );
        onShowToast('Customer Sentiment Report downloaded');
      },
    },
  ];

  return (
    <section className="view-section space-y-5">
      <div className="bg-white rounded-2xl p-6 shadow-aisle flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-[16px] text-slate-900">Analytics &amp; Exportable Reports</h2>
            <p className="text-[12.5px] text-slate-400">Generate instant CSV exports for accounting, RTO audits, and courier reconciliation</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-[#F2F4F8] px-3.5 py-2 rounded-xl text-[13px] font-medium text-slate-700">
          <Calendar className="w-4 h-4 text-slate-400" />
          <select
            value={dateWindow}
            onChange={(e) => setDateWindow(e.target.value)}
            className="bg-transparent focus:outline-none"
          >
            <option>Last 7 Days (12 May – 18 May)</option>
            <option>Last 30 Days</option>
            <option>This Financial Quarter</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reports.map((rep) => {
          const Icon = rep.icon;
          return (
            <div key={rep.id} className="bg-white rounded-2xl p-6 shadow-aisle flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[11.5px] font-medium text-slate-400">{rep.records}</span>
                </div>
                <h3 className="font-display font-semibold text-[15px] text-slate-900">{rep.title}</h3>
                <p className="mt-1.5 text-[12.5px] text-slate-500 leading-relaxed">{rep.desc}</p>
              </div>
              <button
                onClick={rep.action}
                className="mt-5 w-full py-2.5 rounded-xl bg-[#F2F4F8] hover:bg-[#2563EB] text-slate-800 hover:text-white text-[13px] font-medium flex items-center justify-center gap-2 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download CSV ({dateWindow.split(' ')[0]} {dateWindow.split(' ')[1]})</span>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
