import React, { useState } from 'react';
import {
  Globe,
  LayoutGrid,
  MessageSquare,
  PhoneCall,
  Search,
  ShoppingBag,
  Truck,
  Upload,
  X,
} from 'lucide-react';
import { Order, ViewName } from '../types';
import { getInitials } from '../utils/helpers';

interface CommandModalProps {
  open: boolean;
  orders: Order[];
  onClose: () => void;
  onNavigate: (view: ViewName) => void;
}

export const CommandModal: React.FC<CommandModalProps> = ({ open, orders, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');

  if (!open) return null;

  const q = query.trim().toLowerCase();
  const quickLinks: { label: string; meta: string; view: ViewName; icon: React.ElementType }[] = [
    { label: 'Go to Overview Dashboard', meta: 'View', view: 'overview', icon: LayoutGrid },
    { label: 'Open Orders Queue & CSV Import', meta: `${orders.length} orders`, view: 'orders', icon: ShoppingBag },
    { label: 'Open AI Calling Studio & Transcripts', meta: '12 active', view: 'ai-calling', icon: PhoneCall },
    { label: 'Manage WhatsApp Automation Flows', meta: '96.2% delivery', view: 'whatsapp', icon: MessageSquare },
    { label: 'Inspect Live Courier Shipments & NDR', meta: '3 delayed', view: 'tracking', icon: Truck },
    { label: 'Preview Public Landing Page', meta: 'Marketing', view: 'landing', icon: Globe },
  ];

  const matchingLinks = quickLinks.filter((item) => !q || item.label.toLowerCase().includes(q));
  const matchingOrders = orders
    .filter(
      (o) =>
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.customer.toLowerCase().includes(q) ||
        o.product.toLowerCase().includes(q)
    )
    .slice(0, 4);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 flex items-start justify-center pt-20 px-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-lg rounded-2xl shadow-aisle-frame overflow-hidden border border-slate-100"
      >
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3">
          <Search className="w-4 h-4 text-[#2563EB]" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to view, search order #ORD-10001, customer, or product..."
            className="w-full text-[14px] text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          <button onClick={onClose} className="text-xs text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded bg-slate-100">
            ESC
          </button>
        </div>
        <div className="p-2 max-h-80 overflow-y-auto divide-y divide-slate-50 text-[13.5px]">
          {matchingLinks.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => {
                  onNavigate(item.view);
                  onClose();
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#F2F4F8] flex items-center justify-between"
              >
                <span className="flex items-center gap-2.5 font-medium text-slate-800">
                  <Icon className="w-4 h-4 text-[#2563EB]" />
                  <span>{item.label}</span>
                </span>
                <span className="text-xs text-slate-400">{item.meta}</span>
              </button>
            );
          })}
          {matchingOrders.map((ord) => (
            <button
              key={ord.id}
              onClick={() => {
                onNavigate('orders');
                onClose();
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#F2F4F8] flex items-center justify-between"
            >
              <span className="flex items-center gap-2.5 font-medium text-slate-800">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span>#{ord.id} · {ord.customer} ({ord.product})</span>
              </span>
              <span className="text-xs font-semibold text-[#2563EB]">₹{ord.amount}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

interface AddOrderModalProps {
  open: boolean;
  onClose: () => void;
  onCreateOrder: (order: Order) => void;
}

export const AddOrderModal: React.FC<AddOrderModalProps> = ({ open, onClose, onCreateOrder }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91 98201 11223');
  const [amount, setAmount] = useState('1899');
  const [product, setProduct] = useState('Wireless ANC Earbuds Pro');
  const [paymentMode, setPaymentMode] = useState<'COD' | 'Prepaid'>('COD');
  const [channel, setChannel] = useState<'Amazon' | 'Flipkart' | 'Shopify'>('Amazon');

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim() || 'Rohan Mehta';
    const orderNum = 10009 + Math.floor(Math.random() * 90);
    onCreateOrder({
      id: `ORD-${orderNum}`,
      initials: getInitials(cleanName),
      customer: cleanName,
      phone,
      product,
      amount: Number(amount) || 1899,
      paymentMode,
      channel,
      status: 'Confirmed',
      city: 'Delhi',
      address: 'New Delhi - 110001',
      createdAt: '18 May, Just now',
      aiCallStatus: 'Confirmed',
      whatsappSent: true,
    });
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-aisle-frame p-6 border border-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-display font-semibold text-[16px] text-slate-900">
            Create Order &amp; Trigger AI Confirmation
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-[13.5px]">
          <div>
            <label className="block text-slate-500 text-xs font-medium mb-1">Customer Name</label>
            <input
              type="text"
              required
              placeholder="e.g., Rohan Mehta"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#F2F4F8] text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 text-xs font-medium mb-1">Phone (+91)</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#F2F4F8] text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 text-xs font-medium mb-1">Order Amount (₹)</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#F2F4F8] text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 text-xs font-medium mb-1">Payment Mode</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as 'COD' | 'Prepaid')}
                className="w-full px-3.5 py-2 rounded-xl bg-[#F2F4F8] text-slate-900 focus:outline-none"
              >
                <option value="COD">COD (Cash on Delivery)</option>
                <option value="Prepaid">Prepaid (UPI/Card)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-500 text-xs font-medium mb-1">Channel</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as 'Amazon' | 'Flipkart' | 'Shopify')}
                className="w-full px-3.5 py-2 rounded-xl bg-[#F2F4F8] text-slate-900 focus:outline-none"
              >
                <option value="Amazon">Amazon</option>
                <option value="Flipkart">Flipkart</option>
                <option value="Shopify">Shopify</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-slate-500 text-xs font-medium mb-1">Product</label>
            <input
              type="text"
              required
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#F2F4F8] text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
            />
          </div>
          <div className="pt-2 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-[#F2F4F8] text-slate-700 font-medium">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium shadow-sm">
              Create &amp; Auto-Call
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface CsvUploadModalProps {
  open: boolean;
  onClose: () => void;
  onImportOrders: (orders: Order[]) => void;
}

export const CsvUploadModal: React.FC<CsvUploadModalProps> = ({ open, onClose, onImportOrders }) => {
  const [csvText, setCsvText] = useState(
    'Meera Nair,+91 98450 22334,Nordic Smart Fitness Watch,2450,COD,Amazon,Bengaluru\nSiddharth Rao,+91 99102 33445,Terra Bluetooth Speaker,1299,Prepaid,Flipkart,Pune'
  );

  if (!open) return null;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCsvText(reader.result);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    const lines = csvText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    const parsed: Order[] = lines.map((line, i) => {
      const [customer = 'New Customer', phone = '+91 98000 00000', product = 'Bluetooth Speaker', amountStr = '1299', mode = 'COD', channel = 'Amazon', city = 'Delhi'] = line
        .split(',')
        .map((c) => c.trim());
      return {
        id: `ORD-${10020 + i}`,
        initials: getInitials(customer),
        customer,
        phone,
        product,
        amount: Number(amountStr) || 1299,
        paymentMode: mode.toUpperCase() === 'PREPAID' ? 'Prepaid' : 'COD',
        channel: (['Amazon', 'Flipkart', 'Shopify', 'Direct'].includes(channel) ? channel : 'Amazon') as Order['channel'],
        status: 'Pending',
        city,
        address: `${city}, India`,
        createdAt: '18 May, CSV Batch',
        aiCallStatus: 'Pending',
        whatsappSent: false,
      };
    });
    if (parsed.length > 0) {
      onImportOrders(parsed);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-aisle-frame p-6 border border-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-display font-semibold text-[16px] text-slate-900">Batch Upload Orders (CSV)</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
        </div>
        <div className="mt-4 space-y-3 text-[13px]">
          <label className="flex items-center justify-center gap-2 p-4 rounded-xl bg-[#F8FAFC] border border-dashed border-slate-300 cursor-pointer hover:bg-[#EFF6FF] transition">
            <Upload className="w-4 h-4 text-[#2563EB]" />
            <span className="font-medium text-slate-700">Choose .csv file or edit rows below</span>
            <input type="file" accept=".csv,.txt" onChange={handleFile} className="hidden" />
          </label>
          <textarea
            rows={4}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            className="w-full p-3 rounded-xl bg-[#F2F4F8] font-mono text-[12px] text-slate-800 focus:outline-none"
          />
          <div className="text-[11.5px] text-slate-400">
            Format: Name, Phone, Product, Amount, COD/Prepaid, Channel, City
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl bg-[#F2F4F8] text-slate-700 font-medium">Cancel</button>
            <button onClick={handleImport} className="px-4 py-2 rounded-xl bg-[#2563EB] text-white font-medium">
              Import &amp; Queue AI Calls
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
