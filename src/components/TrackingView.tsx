import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  Eye,
  MessageCircle,
  Navigation,
  PackageCheck,
  PhoneCall,
  Search,
  Truck,
  X,
} from 'lucide-react';
import { CourierIntegration, Shipment, ShipmentStatus } from '../types';
import { downloadCSV, getOrderStatusBadgeClass } from '../utils/helpers';

interface TrackingViewProps {
  shipments: Shipment[];
  couriers: CourierIntegration[];
  onToggleCourier: (id: string) => void;
  onTriggerShipmentCall: (shipment: Shipment) => void;
  onShowToast: (msg: string) => void;
}

type TrackingTab = 'live' | 'couriers' | 'delays';

export const TrackingView: React.FC<TrackingViewProps> = ({
  shipments,
  couriers,
  onToggleCourier,
  onTriggerShipmentCall,
  onShowToast,
}) => {
  const [subTab, setSubTab] = useState<TrackingTab>('live');
  const [search, setSearch] = useState('');
  const [courierFilter, setCourierFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ShipmentStatus>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('ORD-10004');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // External courier tracking modal (avoids window.open)
  const [courierPreviewShipment, setCourierPreviewShipment] = useState<Shipment | null>(null);

  const filteredShipments = useMemo(() => {
    return shipments.filter((s) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        s.orderId.toLowerCase().includes(q) ||
        s.customer.toLowerCase().includes(q) ||
        s.awb.toLowerCase().includes(q);
      const matchCourier = courierFilter === 'all' || s.courier === courierFilter;
      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchSearch && matchCourier && matchStatus;
    });
  }, [shipments, search, courierFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredShipments.length / pageSize));
  const paginatedShipments = filteredShipments.slice((page - 1) * pageSize, page * pageSize);

  const selectedShipment =
    shipments.find((s) => s.orderId === selectedOrderId) || filteredShipments[0] || shipments[0];

  const delayedShipments = shipments.filter((s) => s.status === 'Delayed' || s.status === 'Failed Delivery');

  const handleExport = () => {
    downloadCSV(
      'sellersaathi-shipments.csv',
      ['Order ID', 'Customer', 'Phone', 'Courier', 'AWB', 'Status', 'Pickup Date', 'Est Delivery'],
      filteredShipments.map((s) => [s.orderId, s.customer, s.phone, s.courier, s.awb, s.status, s.pickupDate, s.eta])
    );
    onShowToast('Shipments tracking report exported as CSV');
  };

  return (
    <section className="view-section space-y-5">
      {/* Sub-navigation + Header Metrics (Screenshot 4) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="bg-white p-1 sm:p-1.5 rounded-xl sm:rounded-2xl shadow-aisle inline-flex flex-wrap items-center gap-1 text-[11.5px] sm:text-[13px] font-medium">
          {[
            { id: 'live', label: 'Live Tracking' },
            { id: 'couriers', label: 'Courier Integration' },
            { id: 'delays', label: `Delay Alerts (${delayedShipments.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as TrackingTab)}
              className={`px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl transition ${
                subTab === tab.id ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:bg-[#F2F4F8]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-[12.5px]">
          <div className="bg-white px-3.5 py-2 rounded-xl shadow-aisle">
            <span className="text-slate-400">Total Shipments: </span>
            <strong className="text-slate-900 tabular-nums">12,854</strong>
          </div>
          <div className="bg-white px-3.5 py-2 rounded-xl shadow-aisle">
            <span className="text-slate-400">Delayed: </span>
            <strong className="text-amber-600 tabular-nums">312</strong>
          </div>
        </div>
      </div>

      {/* 5 KPI Cards (from Screenshot 4) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        <div onClick={() => setStatusFilter('In Transit')} className="bg-white rounded-2xl p-4 shadow-aisle cursor-pointer hover:shadow-aisle-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-slate-400">In Transit</span>
            <div className="w-7 h-7 rounded-lg bg-[#F1F5F9] text-[#2563EB] flex items-center justify-center">
              <Truck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 font-display text-2xl font-semibold text-slate-900 metric-tracking">6,245</div>
          <div className="mt-1.5 text-[11.5px] text-[#2563EB] font-medium">48.6% of total</div>
        </div>

        <div onClick={() => setStatusFilter('Out for Delivery')} className="bg-white rounded-2xl p-4 shadow-aisle cursor-pointer hover:shadow-aisle-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-slate-400">Out for Delivery</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Navigation className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 font-display text-2xl font-semibold text-slate-900 metric-tracking">2,156</div>
          <div className="mt-1.5 text-[11.5px] text-indigo-600 font-medium">16.8% arriving today</div>
        </div>

        <div onClick={() => setStatusFilter('Delivered')} className="bg-white rounded-2xl p-4 shadow-aisle cursor-pointer hover:shadow-aisle-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-slate-400">Delivered</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <PackageCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 font-display text-2xl font-semibold text-slate-900 metric-tracking">3,842</div>
          <div className="mt-1.5 text-[11.5px] text-emerald-600 font-medium">29.9% of total</div>
        </div>

        <div onClick={() => setStatusFilter('Delayed')} className="bg-white rounded-2xl p-4 shadow-aisle cursor-pointer hover:shadow-aisle-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-slate-400">Delayed</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 font-display text-2xl font-semibold text-slate-900 metric-tracking">312</div>
          <div className="mt-1.5 text-[11.5px] text-amber-600 font-medium">2.4% of total</div>
        </div>

        <div onClick={() => setStatusFilter('Failed Delivery')} className="bg-white rounded-2xl p-4 shadow-aisle cursor-pointer hover:shadow-aisle-md transition col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-slate-400">Failed Delivery</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 font-display text-2xl font-semibold text-slate-900 metric-tracking">299</div>
          <div className="mt-1.5 text-[11.5px] text-rose-600 font-medium">2.3% NDR active</div>
        </div>
      </div>

      {/* LIVE TRACKING TAB */}
      {subTab === 'live' && selectedShipment && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left 8 Cols: Filterable Shipments Table */}
            <div className="lg:col-span-8 bg-white rounded-2xl p-6 shadow-aisle flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      placeholder="Search by Order ID, Tracking ID, Customer Name..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F2F4F8] text-[12.5px] text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={courierFilter}
                      onChange={(e) => {
                        setCourierFilter(e.target.value);
                        setPage(1);
                      }}
                      className="px-3 py-2 rounded-xl bg-[#F2F4F8] text-[12px] font-medium text-slate-700 focus:outline-none"
                    >
                      <option value="all">All Couriers</option>
                      <option value="Delhivery">Delhivery</option>
                      <option value="XpressBees">XpressBees</option>
                      <option value="Ecom Express">Ecom Express</option>
                      <option value="BlueDart">BlueDart</option>
                      <option value="Shadowfax">Shadowfax</option>
                    </select>
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value as 'all' | ShipmentStatus);
                        setPage(1);
                      }}
                      className="px-3 py-2 rounded-xl bg-[#F2F4F8] text-[12px] font-medium text-slate-700 focus:outline-none"
                    >
                      <option value="all">All Status</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Delayed">Delayed</option>
                      <option value="Failed Delivery">Failed Delivery</option>
                    </select>
                    <button
                      onClick={handleExport}
                      className="px-3 py-2 rounded-xl bg-[#F2F4F8] hover:bg-slate-200 text-slate-700 text-[12px] font-medium flex items-center gap-1.5 transition"
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
                        <th className="pb-3 font-medium">Order ID</th>
                        <th className="pb-3 font-medium">Customer</th>
                        <th className="pb-3 font-medium">Courier &amp; AWB</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium text-right">Est. Delivery</th>
                        <th className="pb-3 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[13px]">
                      {paginatedShipments.map((s) => {
                        const active = s.orderId === selectedShipment.orderId;
                        return (
                          <tr
                            key={s.orderId}
                            onClick={() => setSelectedOrderId(s.orderId)}
                            className={`cursor-pointer transition ${active ? 'bg-[#EFF6FF]/60' : 'hover:bg-slate-50/90'}`}
                          >
                            <td className="py-3.5 font-semibold text-[#2563EB] whitespace-nowrap">{s.orderId}</td>
                            <td className="py-3.5">
                              <div className="font-medium text-slate-900">{s.customer}</div>
                              <div className="text-[11.5px] text-slate-400">{s.phone}</div>
                            </td>
                            <td className="py-3.5">
                              <div className="font-medium text-slate-800">{s.courier}</div>
                              <div className="text-[11.5px] font-mono text-slate-400">{s.awb}</div>
                            </td>
                            <td className="py-3.5">
                              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${getOrderStatusBadgeClass(s.status)}`}>
                                {s.status}
                              </span>
                            </td>
                            <td className="py-3.5 text-right text-slate-600 font-medium text-[12px]">{s.eta}</td>
                            <td className="py-3.5 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrderId(s.orderId);
                                }}
                                className="p-1.5 rounded-lg bg-[#F2F4F8] hover:bg-[#2563EB] text-slate-600 hover:text-white transition"
                                title="Inspect Timeline"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[12px] text-slate-500">
                <span>Showing {paginatedShipments.length} of {filteredShipments.length} shipments</span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg bg-[#F2F4F8] disabled:opacity-40"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2.5 py-1 rounded-lg bg-[#2563EB] text-white font-medium">{page}</span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded-lg bg-[#F2F4F8] disabled:opacity-40"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Shipment Details & Delivery Timeline */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-aisle flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Shipment Details</span>
                    <h3 className="font-display font-semibold text-[16px] text-slate-900 mt-0.5">
                      {selectedShipment.orderId} · {selectedShipment.customer}
                    </h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11.5px] font-medium ${getOrderStatusBadgeClass(selectedShipment.status)}`}>
                    {selectedShipment.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 py-4 border-b border-slate-100 text-[12.5px]">
                  <div>
                    <span className="text-slate-400 block">Courier Partner</span>
                    <strong className="text-slate-900 font-semibold mt-0.5 block">{selectedShipment.courier}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Tracking AWB</span>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(selectedShipment.awb);
                        onShowToast(`Copied AWB ${selectedShipment.awb}`);
                      }}
                      className="text-slate-900 hover:text-[#2563EB] font-mono text-[12px] mt-0.5 flex items-center gap-1 font-semibold"
                    >
                      <span>{selectedShipment.awb}</span>
                      <Copy className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Pick-up Date</span>
                    <strong className="text-slate-800 font-medium mt-0.5 block">{selectedShipment.pickupDate}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{selectedShipment.deliveredOn ? 'Delivered On' : 'Estimated'}</span>
                    <strong className="text-slate-800 font-medium mt-0.5 block">
                      {selectedShipment.deliveredOn || selectedShipment.eta}
                    </strong>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="text-[12.5px] font-medium text-slate-400 mb-4">Delivery Timeline</div>
                  <div className="space-y-5 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-slate-200">
                    {selectedShipment.steps.map((st, idx) => (
                      <div key={idx} className="relative pl-6">
                        <span
                          className={`w-3.5 h-3.5 rounded-full absolute left-0 top-1 ${
                            idx === 0 ? 'bg-[#2563EB] ring-4 ring-blue-50' : 'bg-emerald-500'
                          }`}
                        />
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-[13px] font-semibold text-slate-900">{st.title}</div>
                          <span className="text-[11px] text-slate-400 shrink-0">{st.location}</span>
                        </div>
                        <div className="text-[12px] text-slate-500 mt-0.5">{st.desc}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{st.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onTriggerShipmentCall(selectedShipment)}
                    className="py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[12.5px] font-medium flex items-center justify-center gap-1.5 transition"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>AI Update Call</span>
                  </button>
                  <button
                    onClick={() =>
                      onShowToast(`WhatsApp live tracking link sent to ${selectedShipment.customer}`)
                    }
                    className="py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white text-[12.5px] font-medium flex items-center justify-center gap-1.5 transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Link</span>
                  </button>
                </div>
                <button
                  onClick={() => setCourierPreviewShipment(selectedShipment)}
                  className="w-full py-2 rounded-xl bg-[#F2F4F8] hover:bg-slate-200 text-slate-700 text-[12.5px] font-medium flex items-center justify-center gap-1.5 transition"
                >
                  <span>Track on {selectedShipment.courier} Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Delay Alerts Strip (from Screenshot 4) */}
          <div className="bg-white rounded-2xl p-6 shadow-aisle">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                <h2 className="font-display font-semibold text-[15px] text-slate-900">Delay Alerts (Last 7 Days)</h2>
              </div>
              <button onClick={() => setSubTab('delays')} className="text-[12.5px] font-medium text-[#2563EB] hover:underline">
                View All Alerts →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { orderId: 'ORD-10005', msg: 'Shipment delayed by 2 days', sub: 'Expected: 19 May · Now: 21 May' },
                { orderId: 'ORD-10007', msg: 'Failed delivery — Door locked', sub: 'Buyer requested evening re-attempt' },
                { orderId: 'ORD-10003', msg: 'Linehaul transit hold (1 day)', sub: 'Bengaluru Mother Hub weather advisory' },
              ].map((alert) => (
                <div key={alert.orderId} className="p-4 rounded-xl bg-rose-50/60 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-900 text-[13.5px]">{alert.orderId}</div>
                    <div className="text-[12px] text-rose-700 mt-0.5">{alert.msg}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{alert.sub}</div>
                  </div>
                  <button
                    onClick={() => setSelectedOrderId(alert.orderId)}
                    className="px-3 py-1.5 rounded-lg bg-white text-slate-800 text-[12px] font-medium shadow-2xs hover:bg-[#2563EB] hover:text-white transition shrink-0"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* COURIER INTEGRATION TAB */}
      {subTab === 'couriers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {couriers.map((cr) => (
            <div key={cr.id} className="bg-white rounded-2xl p-6 shadow-aisle flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="font-display font-semibold text-[16px] text-slate-900">{cr.name}</div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${getOrderStatusBadgeClass(cr.webhookStatus)}`}>
                    {cr.webhookStatus}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-[12.5px] bg-[#F8FAFC] p-3.5 rounded-xl mt-3">
                  <div>
                    <span className="text-slate-400 block">Active Shipments</span>
                    <strong className="text-slate-900 font-semibold tabular-nums">{cr.activeShipments.toLocaleString('en-IN')}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">On-Time SLA</span>
                    <strong className="text-emerald-600 font-semibold tabular-nums">{cr.onTimeRate}</strong>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-[12px] text-slate-400 font-mono">Code: {cr.code}</span>
                <button
                  onClick={() => {
                    onToggleCourier(cr.id);
                    onShowToast(`${cr.name} webhook ${cr.connected ? 'paused' : 'connected'}`);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-[12px] font-medium transition ${
                    cr.connected ? 'bg-[#F2F4F8] text-slate-700 hover:bg-rose-50 hover:text-rose-600' : 'bg-[#2563EB] text-white'
                  }`}
                >
                  {cr.connected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DELAY ALERTS TAB */}
      {subTab === 'delays' && (
        <div className="bg-white rounded-2xl p-6 shadow-aisle space-y-4">
          <h2 className="font-display font-semibold text-[16px] text-slate-900">Active NDR &amp; Delay Exceptions</h2>
          <div className="divide-y divide-slate-100">
            {delayedShipments.map((s) => (
              <div key={s.orderId} className="py-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-semibold text-[#2563EB]">{s.orderId}</span>
                    <span className="font-medium text-slate-900">{s.customer}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${getOrderStatusBadgeClass(s.status)}`}>{s.status}</span>
                  </div>
                  <p className="text-[13px] text-slate-600 mt-1">{s.delayReason || s.steps[0]?.desc}</p>
                  <p className="text-[11.5px] text-slate-400 mt-0.5">{s.courier} · AWB {s.awb}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onTriggerShipmentCall(s)}
                    className="px-3.5 py-2 rounded-xl bg-[#2563EB] text-white text-[12.5px] font-medium"
                  >
                    Launch NDR AI Call
                  </button>
                  <button
                    onClick={() => {
                      setSelectedOrderId(s.orderId);
                      setSubTab('live');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#F2F4F8] text-slate-700 text-[12.5px] font-medium"
                  >
                    Inspect Timeline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Courier Portal Preview Modal (replaces window.open) */}
      {courierPreviewShipment && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-aisle-frame p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-display font-semibold text-[16px] text-slate-900">
                {courierPreviewShipment.courier} Official Tracking Sync
              </h3>
              <button onClick={() => setCourierPreviewShipment(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-[13px]">
              <div className="p-3.5 rounded-xl bg-[#F8FAFC]">
                <div className="text-slate-400 text-xs">AWB Number</div>
                <div className="font-mono font-semibold text-slate-900 mt-0.5">{courierPreviewShipment.awb}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F8FAFC]">
                <div className="text-slate-400 text-xs">Latest Courier Webhook Scan</div>
                <div className="font-semibold text-slate-900 mt-0.5">{courierPreviewShipment.steps[0]?.title}</div>
                <div className="text-slate-600 mt-0.5">{courierPreviewShipment.steps[0]?.desc} · {courierPreviewShipment.steps[0]?.location}</div>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => {
                  onShowToast(`Refreshed live scan from ${courierPreviewShipment.courier} API`);
                  setCourierPreviewShipment(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#2563EB] text-white text-[13px] font-medium"
              >
                Force Re-Sync Scan
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
