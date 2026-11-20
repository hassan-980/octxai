import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  MessageCircle,
  PhoneCall,
  Plus,
  Search,
  Truck,
  Upload,
} from 'lucide-react';
import { Order, OrderStatus, ViewName } from '../types';
import { downloadCSV, formatINR, getOrderStatusBadgeClass } from '../utils/helpers';

interface OrdersViewProps {
  orders: Order[];
  onOpenNewOrderModal: () => void;
  onOpenCsvUpload: () => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onTriggerAICall: (order: Order) => void;
  onSendWhatsApp: (order: Order) => void;
  onNavigate: (view: ViewName) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  onOpenNewOrderModal,
  onOpenCsvUpload,
  onUpdateOrderStatus,
  onTriggerAICall,
  onSendWhatsApp,
  onNavigate,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'COD' | 'Prepaid'>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        !search.trim() ||
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.customer.toLowerCase().includes(search.toLowerCase()) ||
        o.phone.includes(search) ||
        o.product.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      const matchPayment = paymentFilter === 'all' || o.paymentMode === paymentFilter;
      return matchSearch && matchStatus && matchPayment;
    });
  }, [orders, search, statusFilter, paymentFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + pageSize);

  const pageNumbers = useMemo(() => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      pages.push(1, 2, 3, 'ellipsis', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, 'ellipsis', totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages);
    }
    return pages;
  }, [currentPage, totalPages]);

  const handleExport = () => {
    downloadCSV(
      'sellersaathi-orders.csv',
      ['Order ID', 'Customer', 'Phone', 'Product', 'Amount', 'Payment', 'Channel', 'Status', 'City'],
      filteredOrders.map((o) => [o.id, o.customer, o.phone, o.product, o.amount, o.paymentMode, o.channel, o.status, o.city])
    );
  };

  return (
    <section className="view-section space-y-5">
      {/* KPI Summary */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-2.5 sm:gap-5">
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-aisle">
          <div className="text-[11.5px] sm:text-[13.5px] font-medium text-slate-400 leading-tight">Active Orders Queue</div>
          <div className="mt-1.5 sm:mt-3 font-display text-[20px] sm:text-[28px] font-semibold text-slate-900 metric-tracking">{orders.length}</div>
          <div className="mt-1 sm:mt-2 text-[11px] sm:text-[12.5px] text-emerald-600 font-medium leading-snug">Synced with Amazon, Flipkart &amp; Shopify</div>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-aisle">
          <div className="text-[11.5px] sm:text-[13.5px] font-medium text-slate-400 leading-tight">COD Orders Pending Verify</div>
          <div className="mt-1.5 sm:mt-3 font-display text-[20px] sm:text-[28px] font-semibold text-slate-900 metric-tracking">
            {orders.filter((o) => o.paymentMode === 'COD' && o.status === 'Pending').length}
          </div>
          <div className="mt-1 sm:mt-2 text-[11px] sm:text-[12.5px] text-amber-600 font-medium leading-snug">AI Verification Ready</div>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-aisle">
          <div className="text-[11.5px] sm:text-[13.5px] font-medium text-slate-400 leading-tight">Confirmed via AI / WA</div>
          <div className="mt-1.5 sm:mt-3 font-display text-[20px] sm:text-[28px] font-semibold text-slate-900 metric-tracking">
            {orders.filter((o) => o.aiCallStatus === 'Confirmed').length}
          </div>
          <div className="mt-1 sm:mt-2 text-[11px] sm:text-[12.5px] text-emerald-600 font-medium leading-snug">Zero RTO Risk</div>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-aisle">
          <div className="text-[11.5px] sm:text-[13.5px] font-medium text-slate-400 leading-tight">Total Order Value</div>
          <div className="mt-1.5 sm:mt-3 font-display text-[20px] sm:text-[28px] font-semibold text-slate-900 metric-tracking">
            {formatINR(orders.reduce((acc, o) => acc + o.amount, 0))}
          </div>
          <div className="mt-1 sm:mt-2 text-[11px] sm:text-[12.5px] text-slate-400 leading-snug">Across {orders.length} recent orders</div>
        </div>
      </div>

      {/* Main Orders Table Card */}
      <div className="bg-white rounded-2xl p-6 shadow-aisle">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="font-display font-semibold text-[16px] text-slate-900">Marketplace Orders</h2>
            <p className="text-[12.5px] text-slate-400">Trigger AI confirmation calls, WhatsApp alerts, or update shipment status</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenCsvUpload}
              className="px-3.5 py-2 rounded-xl bg-[#F2F4F8] hover:bg-slate-200/70 text-slate-700 text-[12.5px] font-medium flex items-center gap-1.5 transition"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload CSV</span>
            </button>
            <button
              onClick={handleExport}
              className="px-3.5 py-2 rounded-xl bg-[#F2F4F8] hover:bg-slate-200/70 text-slate-700 text-[12.5px] font-medium flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onOpenNewOrderModal}
              className="px-3.5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[12.5px] font-medium flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Order</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search order ID, customer, product..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#F2F4F8] text-[13px] text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none transition"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-[#F2F4F8] p-1 rounded-xl inline-flex items-center text-[12px] font-medium">
              {(['all', 'COD', 'Prepaid'] as const).map((pm) => (
                <button
                  key={pm}
                  onClick={() => {
                    setPaymentFilter(pm);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    paymentFilter === pm ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {pm === 'all' ? 'All Modes' : pm}
                </button>
              ))}
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as 'all' | OrderStatus);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-[#F2F4F8] text-[12.5px] font-medium text-slate-700 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Shipped">Shipped</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[12px] font-medium text-slate-400 border-b border-slate-100">
                <th className="pb-3 font-medium">Order ID</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Product &amp; Channel</th>
                <th className="pb-3 font-medium">Payment</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13.5px]">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 text-[13px]">
                    No orders match your current filters.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 font-semibold text-[#2563EB] whitespace-nowrap">{order.id}</td>
                    <td className="py-3.5">
                      <div className="font-medium text-slate-900">{order.customer}</div>
                      <div className="text-[11.5px] text-slate-400">{order.phone} · {order.city}</div>
                    </td>
                    <td className="py-3.5">
                      <div className="font-medium text-slate-800">{order.product}</div>
                      <div className="text-[11.5px] text-slate-400">{order.channel} · {order.createdAt}</div>
                    </td>
                    <td className="py-3.5">
                      <div className="font-semibold text-slate-900 tabular-nums">{formatINR(order.amount)}</div>
                      <div className="text-[11.5px] text-slate-400">{order.paymentMode}</div>
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11.5px] font-medium ${getOrderStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => onTriggerAICall(order)}
                          title="Trigger AI Verification Call"
                          className="p-2 rounded-lg bg-[#EFF6FF] hover:bg-[#2563EB] text-[#2563EB] hover:text-white transition"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onSendWhatsApp(order)}
                          title="Send WhatsApp Update"
                          className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white transition"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onNavigate('tracking')}
                          title="Track Shipment"
                          className="p-2 rounded-lg bg-[#F2F4F8] hover:bg-slate-200 text-slate-700 transition"
                        >
                          <Truck className="w-3.5 h-3.5" />
                        </button>
                        {order.status === 'Pending' && (
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'Confirmed')}
                            title="Mark Confirmed"
                            className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white transition"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
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

        {/* Pagination Footer */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12.5px] text-slate-500">
          <div>
            {filteredOrders.length === 0 ? (
              <span>Showing 0 of 0 orders</span>
            ) : (
              <span>
                Showing <strong className="font-semibold text-slate-700">{startIndex + 1}</strong> to{' '}
                <strong className="font-semibold text-slate-700">
                  {Math.min(startIndex + paginatedOrders.length, filteredOrders.length)}
                </strong>{' '}
                of <strong className="font-semibold text-slate-700">{filteredOrders.length}</strong> orders
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
                className="p-1.5 rounded-lg bg-[#F2F4F8] hover:bg-slate-200/70 text-slate-700 disabled:opacity-40 disabled:pointer-events-none transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {pageNumbers.map((item, idx) =>
                item === 'ellipsis' ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-slate-400 select-none">
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPage(item)}
                    className={`min-w-[30px] h-[30px] px-2 rounded-lg font-medium tabular-nums transition ${
                      currentPage === item
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
                disabled={currentPage === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                aria-label="Next page"
                className="p-1.5 rounded-lg bg-[#F2F4F8] hover:bg-slate-200/70 text-slate-700 disabled:opacity-40 disabled:pointer-events-none transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <select
              aria-label="Orders per page"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-[#F2F4F8] text-[12px] font-medium text-slate-700 focus:outline-none"
            >
              <option value={8}>8 / page</option>
              <option value={16}>16 / page</option>
              <option value={24}>24 / page</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  );
};
