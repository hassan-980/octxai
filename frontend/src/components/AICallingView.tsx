import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Download,
  FileText,
  Filter,
  GitBranch,
  KeyRound,
  Pause,
  PhoneCall,
  PhoneMissed,
  PhoneOff,
  Play,
  Plus,
  Search,
  Sliders,
  Volume2,
} from 'lucide-react';
import {
  AICall,
  CallCategoryType,
  CallStatusType,
  CallTemplate,
  IVROption,
  SellerSettingsState,
} from '../types';
import {
  INITIAL_CALL_TEMPLATES,
  INITIAL_IVR_OPTIONS,
} from '../data/initialData';
import { downloadTextFile, formatSeconds, getInitials, getOrderStatusBadgeClass } from '../utils/helpers';

interface AICallingViewProps {
  calls: AICall[];
  settings: SellerSettingsState;
  onUpdateSettings: (next: SellerSettingsState) => void;
  onAddCall: (call: AICall) => void;
  onUpdateCallType: (callId: string, callType: CallCategoryType) => void;
  onShowToast: (msg: string) => void;
}

type AISubTab = 'dashboard' | 'create' | 'templates' | 'ivr' | 'voice-settings';
type RightInspectorTab = 'transcript' | 'ivr-flow' | 'analysis';

export const AICallingView: React.FC<AICallingViewProps> = ({
  calls,
  settings,
  onUpdateSettings,
  onAddCall,
  onUpdateCallType,
  onShowToast,
}) => {
  const [subTab, setSubTab] = useState<AISubTab>('dashboard');
  const [selectedCallId, setSelectedCallId] = useState<string>(calls[0]?.id || 'ORD-10001');
  const [statusFilter, setStatusFilter] = useState<'all' | CallStatusType>('all');
  const [voiceFilter, setVoiceFilter] = useState<string>('all');
  const [showFiltersPopover, setShowFiltersPopover] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [rightTab, setRightTab] = useState<RightInspectorTab>('transcript');

  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSec, setCurrentSec] = useState(34);
  const [speed, setSpeed] = useState<'1x' | '1.5x' | '2x'>('1x');
  const [activeTranscriptIdx, setActiveTranscriptIdx] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);

  // Create New Call state
  const [newOrderId, setNewOrderId] = useState('ORD-10019');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newPhone, setNewPhone] = useState('+91 98112 45678');
  const [newProduct, setNewProduct] = useState('Bluetooth Speaker');
  const [newAmount, setNewAmount] = useState('1299');
  const [newCallType, setNewCallType] = useState<CallCategoryType>('Pre-shipment Confirmation');
  const [newVoice, setNewVoice] = useState(settings.aiVoiceSettings.defaultVoice);

  // Templates & IVR state
  const [templates, setTemplates] = useState<CallTemplate[]>(INITIAL_CALL_TEMPLATES);
  const [ivrOptions, setIvrOptions] = useState<IVROption[]>(INITIAL_IVR_OPTIONS);
  const [ivrTestLog, setIvrTestLog] = useState<string>('Press any keypad digit (0–9) to simulate buyer DTMF input.');

  const filteredCalls = useMemo(() => {
    return calls.filter((c) => {
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchVoice = voiceFilter === 'all' || c.voice === voiceFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        c.id.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q);
      return matchStatus && matchVoice && matchSearch;
    });
  }, [calls, statusFilter, voiceFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredCalls.length / pageSize));
  const paginatedCalls = filteredCalls.slice((page - 1) * pageSize, page * pageSize);

  const selectedCall = calls.find((c) => c.id === selectedCallId) || filteredCalls[0] || calls[0];

  // Reset playback when switching calls
  useEffect(() => {
    setIsPlaying(false);
    setCurrentSec(0);
    setActiveTranscriptIdx(null);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [selectedCallId]);

  useEffect(() => {
    if (!isPlaying || !selectedCall) {
      if (timerRef.current) window.clearInterval(timerRef.current);
      return;
    }
    const maxSec = Math.max(10, selectedCall.durationSec || 60);
    const stepMs = speed === '2x' ? 500 : speed === '1.5x' ? 667 : 1000;
    timerRef.current = window.setInterval(() => {
      setCurrentSec((prev) => {
        if (prev + 1 >= maxSec) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, stepMs);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, selectedCall]);

  const togglePlayAudio = (customText?: string, idx?: number) => {
    if (!selectedCall) return;
    if (typeof idx === 'number') {
      setActiveTranscriptIdx(idx);
    }

    const nextPlaying = customText ? true : !isPlaying;
    setIsPlaying(nextPlaying);

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (nextPlaying) {
        const textToSpeak =
          customText ||
          selectedCall.transcript.map((t) => `${t.text}`).join('. ');
        const utter = new SpeechSynthesisUtterance(textToSpeak);
        utter.lang = 'en-IN';
        utter.rate = speed === '2x' ? 1.5 : speed === '1.5x' ? 1.25 : 1.0;
        utter.onend = () => {
          if (customText) {
            setIsPlaying(false);
            setActiveTranscriptIdx(null);
          }
        };
        window.speechSynthesis.speak(utter);
      }
    }
  };

  const handleDownloadRecording = () => {
    if (!selectedCall) return;
    const text = [
      `Octxai AI Call Transcript & Metadata`,
      `Order ID: ${selectedCall.id}`,
      `Customer: ${selectedCall.name} (${selectedCall.phone})`,
      `Voice: ${selectedCall.voice} | Duration: ${selectedCall.duration} | Status: ${selectedCall.status}`,
      `Outcome: ${selectedCall.outcomeTitle} - ${selectedCall.outcomeDesc}`,
      `--------------------------------------------------`,
      ...selectedCall.transcript.map((t) => `[${t.time}] ${t.speaker}: ${t.text}`),
    ].join('\n');
    downloadTextFile(`${selectedCall.id}-ai-call-transcript.txt`, text);
    onShowToast(`Call recording & transcript for ${selectedCall.id} downloaded`);
  };

  const handleCreateNewCall = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCustomerName.trim() || 'Karan Malhotra';
    const created: AICall = {
      id: newOrderId.trim() || `ORD-${10010 + calls.length}`,
      initials: getInitials(name),
      name,
      phone: newPhone.trim(),
      status: 'Completed',
      badgeLabel: 'Confirmed',
      time: 'Just now',
      date: '18 May 2024',
      duration: '01:24',
      durationSec: 84,
      amount: `₹${newAmount} (COD)`,
      orderDate: '18 May 2024',
      deliveryDate: '21 May 2024',
      product: newProduct,
      voice: newVoice,
      callType: newCallType,
      ivrUsed: false,
      addressVerified: true,
      outcomeTitle: 'Order Confirmed by AI Call',
      outcomeDesc: `AI voice agent ${newVoice} successfully confirmed order & delivery slot.`,
      nextAction: 'WhatsApp Dispatch Confirmation',
      nextActionSchedule: 'Triggered immediately',
      sentimentScore: 93,
      intentDetected: newCallType,
      confidence: 97.4,
      transcript: [
        {
          speaker: `AI (${newVoice.split(' ')[0]})`,
          time: 'Just now',
          text: `Namaste ${name} ji, Octxai AI bol rahi hoon. Aapka ${newProduct} order ₹${newAmount} confirm karne ke liye call kiya hai.`,
        },
        { speaker: 'Customer', time: 'Just now', text: 'Haan ji, order confirm hai, address bilkul sahi hai.' },
      ],
    };
    onAddCall(created);
    setSelectedCallId(created.id);
    setSubTab('dashboard');
    setNewCustomerName('');
    onShowToast(`Live AI call completed for ${created.id} (${created.name})`);
  };

  const handleKeypadPress = (digit: string) => {
    const matched = ivrOptions.find((opt) => opt.digit === digit);
    if (matched) {
      setIvrTestLog(`DTMF [${digit}] detected → "${matched.label}" → ${matched.action}`);
      onShowToast(`IVR Key ${digit}: ${matched.label}`);
    } else {
      setIvrTestLog(`DTMF [${digit}] pressed → Unassigned key (replays main menu prompt)`);
    }
  };

  // Compute live counts
  const totalCalls = 8456 + Math.max(0, calls.length - 7);
  const completedCalls = 7823 + Math.max(0, calls.filter((c) => c.status === 'Completed').length - 5);
  const successfulCalls = 6512 + Math.max(0, calls.filter((c) => c.status === 'Completed').length - 5);
  const unansweredCalls = 1234 + Math.max(0, calls.filter((c) => c.status === 'Unanswered').length - 1);
  const failedCalls = 710 + Math.max(0, calls.filter((c) => c.status === 'Failed').length - 1);

  return (
    <section className="view-section space-y-5">
      {/* Sub-navigation Tabs (from Screenshot 1 Sidebar Sub-menu, cleanly styled in Aisle Segmented Pill) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="bg-white p-1 sm:p-1.5 rounded-xl sm:rounded-2xl shadow-aisle inline-flex flex-wrap items-center gap-1 text-[11.5px] sm:text-[13px] font-medium">
          {[
            { id: 'dashboard', label: 'Call Dashboard', icon: PhoneCall },
            { id: 'create', label: 'Create New Call', icon: Plus },
            { id: 'templates', label: 'Call Templates', icon: FileText },
            { id: 'ivr', label: 'IVR Keypad', icon: KeyRound },
            { id: 'voice-settings', label: 'AI Voice Settings', icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = subTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id as AISubTab)}
                className={`px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl flex items-center gap-1.5 sm:gap-2 transition ${
                  active ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:bg-[#F2F4F8] hover:text-slate-900'
                }`}
              >
                <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="text-[12.5px] text-slate-500 bg-white px-3.5 py-2 rounded-xl shadow-aisle">
          AI Calls Used: <strong className="text-slate-900 tabular-nums">6,512 / 20,000</strong> <span className="text-[#2563EB] font-medium ml-1">(32%)</span>
        </div>
      </div>

      {/* 6 KPI Cards (Matching Screenshot 1 & HTML aesthetic) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-aisle">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-slate-400">Total Calls</span>
            <div className="w-7 h-7 rounded-lg bg-[#F1F5F9] text-[#2563EB] flex items-center justify-center">
              <PhoneCall className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 font-display text-2xl font-semibold text-slate-900 metric-tracking">{totalCalls.toLocaleString('en-IN')}</div>
          <div className="mt-1.5 text-[11.5px] text-slate-400"><span className="text-emerald-600 font-medium">↗ 20.3%</span> vs 7d</div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-aisle">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-slate-400">Completed Calls</span>
            <div className="w-7 h-7 rounded-lg bg-[#F1F5F9] text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 font-display text-2xl font-semibold text-slate-900 metric-tracking">{completedCalls.toLocaleString('en-IN')}</div>
          <div className="mt-1.5 text-[11.5px] text-slate-400"><span className="text-emerald-600 font-medium">↗ 18.6%</span> vs 7d</div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-aisle">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-slate-400">Successful Calls</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 font-display text-2xl font-semibold text-slate-900 metric-tracking">{successfulCalls.toLocaleString('en-IN')}</div>
          <div className="mt-1.5 text-[11.5px] text-emerald-600 font-medium">81.6% Success Rate</div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-aisle">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-slate-400">Unanswered</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <PhoneMissed className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 font-display text-2xl font-semibold text-slate-900 metric-tracking">{unansweredCalls.toLocaleString('en-IN')}</div>
          <div className="mt-1.5 text-[11.5px] text-slate-400"><span className="text-emerald-600 font-medium">↘ 5.4%</span> vs 7d</div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-aisle">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-slate-400">Failed Calls</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <PhoneOff className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 font-display text-2xl font-semibold text-slate-900 metric-tracking">{failedCalls.toLocaleString('en-IN')}</div>
          <div className="mt-1.5 text-[11.5px] text-slate-400"><span className="text-emerald-600 font-medium">↘ 8.2%</span> vs 7d</div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-aisle">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-slate-400">Avg Call Duration</span>
            <div className="w-7 h-7 rounded-lg bg-[#F1F5F9] text-[#2563EB] flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 font-display text-2xl font-semibold text-slate-900 metric-tracking">01:42</div>
          <div className="mt-1.5 text-[11.5px] text-slate-400"><span className="text-emerald-600 font-medium">↗ 12.5%</span> vs 7d</div>
        </div>
      </div>

      {/* SUB-TAB 1: CALL DASHBOARD */}
      {subTab === 'dashboard' && selectedCall && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left 3 Cols: Call List + Search + Filters + Pagination */}
            <div className="lg:col-span-3 bg-white rounded-2xl p-5 shadow-aisle flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 relative">
                  <h2 className="font-display font-semibold text-[15px] text-slate-900">Call List</h2>
                  <button
                    onClick={() => setShowFiltersPopover(!showFiltersPopover)}
                    className="px-2.5 py-1 rounded-lg bg-[#F2F4F8] hover:bg-slate-200/70 text-slate-700 text-[11.5px] font-medium flex items-center gap-1 transition"
                  >
                    <Filter className="w-3 h-3" />
                    <span>Filters</span>
                  </button>
                  {showFiltersPopover && (
                    <div className="absolute right-0 top-8 w-52 bg-white rounded-2xl shadow-aisle-md border border-slate-100 p-3 z-20 text-[12.5px]">
                      <label className="block text-slate-400 text-[11px] font-medium mb-1">Filter by Voice</label>
                      <select
                        value={voiceFilter}
                        onChange={(e) => {
                          setVoiceFilter(e.target.value);
                          setPage(1);
                          setShowFiltersPopover(false);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#F2F4F8] text-slate-800 focus:outline-none"
                      >
                        <option value="all">All AI Voices</option>
                        <option value="Neha (Hindi)">Neha (Hindi)</option>
                        <option value="Arjun (Hindi)">Arjun (Hindi)</option>
                        <option value="Priya (Hinglish)">Priya (Hinglish)</option>
                        <option value="Rahul (English)">Rahul (English)</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1 bg-[#F2F4F8] p-1 rounded-xl text-[11px] font-medium mb-3">
                  {(['all', 'Completed', 'Unanswered', 'Failed'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        setStatusFilter(st);
                        setPage(1);
                      }}
                      className={`flex-1 py-1 rounded-lg transition ${
                        statusFilter === st ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {st === 'all' ? 'All' : st}
                    </button>
                  ))}
                </div>

                {/* Search Input */}
                <div className="relative mb-3">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search order ID, name, phone..."
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#F2F4F8] text-[12px] text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                  />
                </div>

                {/* Call Rows */}
                <div className="space-y-1.5 max-h-[370px] overflow-y-auto pr-0.5">
                  {paginatedCalls.length === 0 ? (
                    <div className="py-8 text-center text-[12.5px] text-slate-400">No calls match filter</div>
                  ) : (
                    paginatedCalls.map((call) => {
                      const isSelected = call.id === selectedCall.id;
                      return (
                        <div
                          key={call.id}
                          onClick={() => setSelectedCallId(call.id)}
                          className={`p-3 rounded-xl cursor-pointer transition border ${
                            isSelected ? 'bg-[#EFF6FF]/80 border-[#2563EB]/30' : 'bg-[#F8FAFC] hover:bg-slate-100/80 border-transparent'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[13px] font-semibold text-slate-900">{call.id}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-medium ${getOrderStatusBadgeClass(call.status)}`}>
                              {call.status}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center justify-between text-[12px]">
                            <span className="font-medium text-slate-700 truncate">{call.name}</span>
                            <span className="text-slate-400 shrink-0">{call.time} · {call.duration}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Pagination */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[12px] text-slate-500">
                <span>Page {page} of {totalPages}</span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg bg-[#F2F4F8] disabled:opacity-40 hover:bg-slate-200 transition"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded-lg bg-[#F2F4F8] disabled:opacity-40 hover:bg-slate-200 transition"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Center 5 Cols: Active Call Inspector & Audio Player */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-aisle flex flex-col justify-between">
              <div>
                {/* Inspector Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-display font-semibold text-[16px] text-slate-900">{selectedCall.id}</span>
                      <span className={`text-[11.5px] font-medium px-2.5 py-0.5 rounded-full ${getOrderStatusBadgeClass(selectedCall.status)}`}>
                        {selectedCall.badgeLabel}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[12px] text-slate-500">
                      <span>Call Type:</span>
                      <select
                        value={selectedCall.callType}
                        onChange={(e) => {
                          onUpdateCallType(selectedCall.id, e.target.value as CallCategoryType);
                          onShowToast(`Call type updated to ${e.target.value}`);
                        }}
                        className="text-[#2563EB] font-medium bg-transparent focus:outline-none cursor-pointer"
                      >
                        <option value="Pre-shipment Confirmation">Pre-shipment Confirmation</option>
                        <option value="Address Verification">Address Verification</option>
                        <option value="Out for Delivery Reminder">Out for Delivery Reminder</option>
                        <option value="Failed Delivery Retry">Failed Delivery Retry</option>
                        <option value="Post Delivery Feedback">Post Delivery Feedback</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleDownloadRecording}
                    className="px-3 py-1.5 rounded-xl bg-[#F2F4F8] hover:bg-slate-200/70 text-slate-700 text-[12px] font-medium flex items-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Recording</span>
                  </button>
                </div>

                {/* Customer & Order Summary Grid */}
                <div className="mt-4 bg-[#F8FAFC] rounded-xl p-4 grid grid-cols-2 gap-4 text-[13px]">
                  <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-[#2563EB] font-semibold flex items-center justify-center shrink-0">
                      {selectedCall.initials}
                    </div>
                    <div className="truncate">
                      <div className="font-semibold text-slate-900">{selectedCall.name}</div>
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(selectedCall.phone);
                          onShowToast(`Copied ${selectedCall.phone}`);
                        }}
                        className="text-slate-400 hover:text-[#2563EB] text-[12px] flex items-center gap-1 transition"
                      >
                        <span>{selectedCall.phone}</span>
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 col-span-2 sm:col-span-1">
                    <div>
                      <div className="text-slate-400 text-[11.5px]">Order Amount</div>
                      <div className="font-semibold text-slate-900 tabular-nums">{selectedCall.amount}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[11.5px]">Product</div>
                      <div className="font-semibold text-slate-900 truncate">{selectedCall.product}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[11.5px]">Order Date</div>
                      <div className="font-medium text-slate-700 text-[12px]">{selectedCall.orderDate}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[11.5px]">Delivery Date</div>
                      <div className="font-medium text-slate-700 text-[12px]">{selectedCall.deliveryDate}</div>
                    </div>
                  </div>
                </div>

                {/* Royal Blue Waveform Audio Player */}
                <div className={`mt-4 bg-[#F2F4F8] rounded-2xl p-3.5 flex items-center gap-3.5 ${isPlaying ? 'waveform-playing' : ''}`}>
                  <button
                    onClick={() => togglePlayAudio()}
                    className="w-10 h-10 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white flex items-center justify-center shadow-sm shrink-0 transition"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                        setCurrentSec(Math.round(ratio * (selectedCall.durationSec || 60)));
                      }}
                      className="flex items-center justify-between gap-[3px] h-7 px-1 cursor-pointer"
                      title="Click to seek"
                    >
                      {[12, 20, 24, 16, 28, 20, 12, 24, 16, 28, 20, 12, 24, 16, 20, 12, 24, 16].map((h, i) => {
                        const progressRatio = (selectedCall.durationSec || 60) > 0 ? currentSec / (selectedCall.durationSec || 60) : 0;
                        const isPlayed = i / 18 <= progressRatio;
                        return (
                          <span
                            key={i}
                            className={`wave-bar w-1 rounded-full transition-colors ${isPlayed ? 'bg-[#2563EB]' : 'bg-slate-300'}`}
                            style={{ height: `${h}px`, animationDelay: `${(i % 5) * 0.1}s` }}
                          />
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 px-1 tabular-nums">
                      <span>{formatSeconds(currentSec)}</span>
                      <span>{selectedCall.duration}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const order: ('1x' | '1.5x' | '2x')[] = ['1x', '1.5x', '2x'];
                      setSpeed(order[(order.indexOf(speed) + 1) % order.length]);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white text-slate-700 font-semibold text-[11.5px] shadow-2xs"
                  >
                    {speed}
                  </button>
                </div>

                {/* Call Metadata */}
                <div className="mt-5 grid grid-cols-3 gap-3 text-[12.5px] border-t border-slate-100 pt-4">
                  <div>
                    <span className="text-slate-400 block">AI Voice Persona</span>
                    <strong className="text-slate-800 font-medium mt-0.5 block">{selectedCall.voice}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Call Start Time</span>
                    <strong className="text-slate-800 font-medium mt-0.5 block">{selectedCall.date}, {selectedCall.time}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">IVR / Address</span>
                    <strong className="text-emerald-600 font-medium mt-0.5 block">
                      {selectedCall.ivrUsed ? 'IVR Used' : 'Natural AI'} · {selectedCall.addressVerified ? 'Verified' : 'Pending'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Call Outcome Box */}
              <div className="mt-5 pt-4 border-t border-slate-100 space-y-2.5">
                <div className="p-3.5 rounded-xl bg-emerald-50/70 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div className="text-[12.5px]">
                    <div className="font-semibold text-emerald-900">{selectedCall.outcomeTitle}</div>
                    <div className="text-emerald-700 mt-0.5">{selectedCall.outcomeDesc}</div>
                  </div>
                </div>
                <div className="px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] flex flex-wrap items-center justify-between gap-2 text-[12px]">
                  <span className="text-slate-500">
                    Next Action: <strong className="text-slate-800">{selectedCall.nextAction}</strong>
                  </span>
                  <button
                    onClick={() => onShowToast(`Executed: ${selectedCall.nextAction} for ${selectedCall.id}`)}
                    className="text-[#2563EB] font-medium hover:underline"
                  >
                    {selectedCall.nextActionSchedule}
                  </button>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Transcript / IVR Flow / Call Analysis Tabs */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-aisle flex flex-col">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 gap-2">
                <div className="bg-[#F2F4F8] p-1 rounded-xl inline-flex items-center text-[12px] font-medium">
                  <button
                    onClick={() => setRightTab('transcript')}
                    className={`px-2.5 py-1 rounded-lg transition ${rightTab === 'transcript' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'}`}
                  >
                    Transcript
                  </button>
                  <button
                    onClick={() => setRightTab('ivr-flow')}
                    className={`px-2.5 py-1 rounded-lg transition ${rightTab === 'ivr-flow' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'}`}
                  >
                    IVR Flow
                  </button>
                  <button
                    onClick={() => setRightTab('analysis')}
                    className={`px-2.5 py-1 rounded-lg transition ${rightTab === 'analysis' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'}`}
                  >
                    Call Analysis
                  </button>
                </div>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#F1F5F9] text-slate-600">Hinglish</span>
              </div>

              {rightTab === 'transcript' && (
                <div className="mt-4 space-y-2.5 overflow-y-auto max-h-[410px] pr-1 text-[13px]">
                  {selectedCall.transcript.map((line, i) => {
                    const isAI = line.speaker.startsWith('AI');
                    const isActiveLine = activeTranscriptIdx === i;
                    return (
                      <div
                        key={i}
                        className={`p-3.5 rounded-2xl transition ${
                          isActiveLine
                            ? 'ring-2 ring-[#2563EB] bg-[#EFF6FF]'
                            : isAI
                              ? 'bg-[#F8FAFC]'
                              : 'bg-[#EFF6FF]/60'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <strong className={`${isAI ? 'text-[#2563EB]' : 'text-emerald-700'} font-semibold`}>
                            {line.speaker}
                          </strong>
                          <div className="flex items-center gap-2">
                            <span>{line.time}</span>
                            <button
                              onClick={() => togglePlayAudio(line.text, i)}
                              className="p-1 rounded-md bg-white hover:bg-[#2563EB] text-slate-500 hover:text-white shadow-2xs transition"
                              title="Play this turn"
                            >
                              <Play className="w-2.5 h-2.5 fill-current" />
                            </button>
                          </div>
                        </div>
                        <p className="text-slate-700 leading-relaxed">{line.text}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {rightTab === 'ivr-flow' && (
                <div className="mt-4 space-y-3 text-[13px]">
                  <div className="text-[12px] text-slate-400 flex items-center gap-1.5 mb-2">
                    <GitBranch className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Decision tree executed during call</span>
                  </div>
                  {[
                    { step: '1. Greeting & Identity Check', status: 'Passed · Customer confirmed name', tone: 'bg-emerald-50 text-emerald-700' },
                    { step: '2. Order & Amount Verification', status: `Confirmed ${selectedCall.amount}`, tone: 'bg-emerald-50 text-emerald-700' },
                    { step: '3. Address & Pincode Validation', status: selectedCall.addressVerified ? 'Verified Pincode & Landmark' : 'Pending Customer Input', tone: selectedCall.addressVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700' },
                    { step: '4. Post-Call Automation', status: selectedCall.nextAction, tone: 'bg-[#EFF6FF] text-[#2563EB]' },
                  ].map((node, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-[#F8FAFC]">
                      <div className="font-semibold text-slate-900">{node.step}</div>
                      <span className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${node.tone}`}>
                        {node.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {rightTab === 'analysis' && (
                <div className="mt-4 space-y-4 text-[13px]">
                  <div className="p-4 rounded-xl bg-[#F8FAFC] space-y-3">
                    <div>
                      <div className="flex justify-between text-[12px] mb-1">
                        <span className="text-slate-500">Buyer Sentiment Score</span>
                        <strong className="text-emerald-600 tabular-nums">{selectedCall.sentimentScore}% Positive</strong>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${selectedCall.sentimentScore}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[12px] mb-1">
                        <span className="text-slate-500">ASR Speech Confidence</span>
                        <strong className="text-[#2563EB] tabular-nums">{selectedCall.confidence}%</strong>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div className="h-full rounded-full bg-[#2563EB]" style={{ width: `${selectedCall.confidence}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#F8FAFC]">
                    <div className="text-[11.5px] text-slate-400">Primary Intent Detected</div>
                    <div className="font-semibold text-slate-900 mt-1">{selectedCall.intentDetected}</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#F8FAFC]">
                    <div className="text-[11.5px] text-slate-400">Extracted Entities</div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11.5px]">
                      <span className="px-2.5 py-1 rounded-lg bg-white text-slate-700 font-medium shadow-2xs">Product: {selectedCall.product}</span>
                      <span className="px-2.5 py-1 rounded-lg bg-white text-slate-700 font-medium shadow-2xs">Amount: {selectedCall.amount}</span>
                      <span className="px-2.5 py-1 rounded-lg bg-white text-slate-700 font-medium shadow-2xs">Voice: {selectedCall.voice}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Row: AI Calling Analytics (5 Cards from Screenshot 1) */}
          <div className="bg-white rounded-2xl p-6 shadow-aisle">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
              <h2 className="font-display font-semibold text-[16px] text-slate-900">AI Calling Analytics</h2>
              <span className="text-[12.5px] text-slate-400">Best Answer Window: 10:00 AM – 1:00 PM</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
              {/* Call Success Sparkline */}
              <div className="p-4 rounded-xl bg-[#F8FAFC]">
                <div className="text-[12px] text-slate-400 font-medium">Call Success Rate</div>
                <div className="text-xl font-display font-semibold text-slate-900 mt-1 tabular-nums">81.6%</div>
                <div className="text-[11px] text-emerald-600 font-medium mb-3">↗ 6.2% vs last 7d</div>
                <svg viewBox="0 0 140 36" className="w-full h-9">
                  <polyline fill="none" stroke="#10B981" strokeWidth="2" points="0,28 22,22 45,25 68,14 92,16 115,8 140,10" />
                </svg>
              </div>

              {/* Call Duration Sparkline */}
              <div className="p-4 rounded-xl bg-[#F8FAFC]">
                <div className="text-[12px] text-slate-400 font-medium">Call Duration (Avg)</div>
                <div className="text-xl font-display font-semibold text-slate-900 mt-1 tabular-nums">01:42</div>
                <div className="text-[11px] text-emerald-600 font-medium mb-3">↗ 12.5% vs last 7d</div>
                <svg viewBox="0 0 140 36" className="w-full h-9">
                  <polyline fill="none" stroke="#2563EB" strokeWidth="2" points="0,26 22,18 45,22 68,12 92,19 115,10 140,14" />
                </svg>
              </div>

              {/* Best Time to Call Bar Chart */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] flex flex-col justify-between">
                <div>
                  <div className="text-[12px] text-slate-400 font-medium">Best Time to Call</div>
                  <div className="text-lg font-display font-semibold text-slate-900 mt-1">10 AM – 1 PM</div>
                  <div className="text-[11px] text-slate-400">Highest Pickup Rate</div>
                </div>
                <div className="flex items-end gap-1.5 h-10 mt-3">
                  {[40, 55, 70, 95, 100, 85, 60, 48].map((h, idx) => (
                    <div
                      key={idx}
                      className={`flex-1 rounded-t ${idx >= 3 && idx <= 5 ? 'bg-amber-500' : 'bg-amber-200'}`}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* Call Type Performance */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] space-y-2.5 text-[12px]">
                <div className="font-medium text-slate-700">Call Type Performance</div>
                {[
                  { name: 'Pre-shipment', val: '92.4%', pct: 92.4, color: 'bg-[#2563EB]' },
                  { name: 'Delivery Reminder', val: '78.6%', pct: 78.6, color: 'bg-sky-500' },
                  { name: 'Address Verify', val: '85.7%', pct: 85.7, color: 'bg-indigo-500' },
                  { name: 'NDR Retry', val: '73.2%', pct: 73.2, color: 'bg-amber-500' },
                ].map((item) => (
                  <div key={item.name}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-600">{item.name}</span>
                      <strong className="text-slate-900 tabular-nums">{item.val}</strong>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-200"><div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} /></div>
                  </div>
                ))}
              </div>

              {/* AI Voice Performance */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] space-y-2 text-[12px]">
                <div className="font-medium text-slate-700 mb-2">AI Voice Performance</div>
                {[
                  { name: 'Neha (Hindi)', pct: '65.2%', dot: 'bg-[#2563EB]' },
                  { name: 'Arjun (Hindi)', pct: '18.7%', dot: 'bg-emerald-500' },
                  { name: 'Priya (Hinglish)', pct: '10.3%', dot: 'bg-indigo-500' },
                  { name: 'Rahul (English)', pct: '5.8%', dot: 'bg-rose-500' },
                ].map((v) => (
                  <div key={v.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-600">
                      <span className={`w-2 h-2 rounded-full ${v.dot}`} />
                      <span>{v.name}</span>
                    </span>
                    <strong className="text-slate-900 tabular-nums">{v.pct}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* SUB-TAB 2: CREATE NEW CALL */}
      {subTab === 'create' && (
        <div className="bg-white rounded-2xl p-6 shadow-aisle max-w-3xl">
          <h2 className="font-display font-semibold text-[16px] text-slate-900 pb-4 border-b border-slate-100">
            Launch Automated AI Voice Call
          </h2>
          <form onSubmit={handleCreateNewCall} className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13.5px]">
            <div>
              <label className="block text-slate-500 text-xs font-medium mb-1">Order ID</label>
              <input
                type="text"
                required
                value={newOrderId}
                onChange={(e) => setNewOrderId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F4F8] text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 text-xs font-medium mb-1">Customer Name</label>
              <input
                type="text"
                required
                placeholder="e.g., Karan Malhotra"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F4F8] text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 text-xs font-medium mb-1">Phone Number</label>
              <input
                type="text"
                required
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F4F8] text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 text-xs font-medium mb-1">Order Amount (₹)</label>
              <input
                type="number"
                required
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F4F8] text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 text-xs font-medium mb-1">Product Name</label>
              <input
                type="text"
                required
                value={newProduct}
                onChange={(e) => setNewProduct(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F4F8] text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 text-xs font-medium mb-1">Call Type</label>
              <select
                value={newCallType}
                onChange={(e) => setNewCallType(e.target.value as CallCategoryType)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F4F8] text-slate-900 focus:outline-none"
              >
                <option value="Pre-shipment Confirmation">Pre-shipment Confirmation</option>
                <option value="Address Verification">Address Verification</option>
                <option value="Out for Delivery Reminder">Out for Delivery Reminder</option>
                <option value="Failed Delivery Retry">Failed Delivery Retry</option>
                <option value="Post Delivery Feedback">Post Delivery Feedback</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-slate-500 text-xs font-medium mb-1">AI Voice Persona</label>
              <select
                value={newVoice}
                onChange={(e) => setNewVoice(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F4F8] text-slate-900 focus:outline-none"
              >
                <option value="Neha (Hindi)">Neha (Hindi — Warm &amp; Natural)</option>
                <option value="Arjun (Hindi)">Arjun (Hindi — Crisp &amp; Professional)</option>
                <option value="Priya (Hinglish)">Priya (Hinglish — Urban D2C)</option>
                <option value="Rahul (English)">Rahul (English — Indian Neutral)</option>
              </select>
            </div>
            <div className="sm:col-span-2 pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSubTab('dashboard')}
                className="px-4 py-2.5 rounded-xl bg-[#F2F4F8] text-slate-700 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium shadow-sm flex items-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Initiate AI Call Now</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUB-TAB 3: CALL TEMPLATES */}
      {subTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {templates.map((tpl) => (
            <div key={tpl.id} className="bg-white rounded-2xl p-6 shadow-aisle flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="font-display font-semibold text-[15px] text-slate-900">{tpl.name}</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tpl.active}
                      onChange={() => {
                        setTemplates((prev) =>
                          prev.map((item) => (item.id === tpl.id ? { ...item, active: !item.active } : item))
                        );
                        onShowToast(`Template "${tpl.name}" ${tpl.active ? 'paused' : 'activated'}`);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-[#2563EB] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                  </label>
                </div>
                <div className="text-[12px] text-slate-400 mb-3">
                  {tpl.callType} · {tpl.language} · Voice: {tpl.voice}
                </div>
                <textarea
                  rows={3}
                  value={tpl.script}
                  onChange={(e) =>
                    setTemplates((prev) =>
                      prev.map((item) => (item.id === tpl.id ? { ...item, script: e.target.value } : item))
                    )
                  }
                  className="w-full p-3.5 rounded-xl bg-[#F8FAFC] text-[13px] text-slate-700 leading-relaxed focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                />
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => togglePlayAudio(tpl.script)}
                  className="px-3 py-1.5 rounded-xl bg-[#F2F4F8] hover:bg-slate-200 text-slate-700 text-[12px] font-medium flex items-center gap-1.5"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Preview Voice</span>
                </button>
                <button
                  onClick={() => onShowToast(`Saved script for "${tpl.name}"`)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#2563EB] text-white text-[12px] font-medium"
                >
                  Save Script
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUB-TAB 4: IVR KEYPAD */}
      {subTab === 'ivr' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-aisle">
            <h2 className="font-display font-semibold text-[16px] text-slate-900 mb-1">Interactive IVR DTMF Simulator</h2>
            <p className="text-[12.5px] text-slate-400 mb-5">Test how customer keypresses route calls in real time</p>

            <div className="p-3.5 rounded-xl bg-[#F8FAFC] text-[12.5px] text-slate-700 font-medium mb-5">
              {ivrTestLog}
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
                <button
                  key={k}
                  onClick={() => handleKeypadPress(k)}
                  className="h-14 rounded-2xl bg-[#F2F4F8] hover:bg-[#2563EB] hover:text-white font-display font-semibold text-lg text-slate-900 transition shadow-2xs"
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-aisle">
            <h2 className="font-display font-semibold text-[16px] text-slate-900 mb-4">Configured IVR Key Bindings</h2>
            <div className="space-y-3">
              {ivrOptions.map((opt) => (
                <div key={opt.digit} className="p-4 rounded-xl bg-[#F8FAFC] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <span className="w-9 h-9 rounded-xl bg-[#2563EB] text-white font-display font-semibold flex items-center justify-center">
                      {opt.digit}
                    </span>
                    <div>
                      <div className="font-semibold text-slate-900 text-[13.5px]">{opt.label}</div>
                      <div className="text-[12px] text-slate-500">{opt.action}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleKeypadPress(opt.digit)}
                    className="px-3 py-1.5 rounded-xl bg-white text-[#2563EB] text-[12px] font-medium shadow-2xs hover:bg-blue-50 transition"
                  >
                    Simulate Key {opt.digit}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: AI VOICE SETTINGS */}
      {subTab === 'voice-settings' && (
        <div className="bg-white rounded-2xl p-6 shadow-aisle max-w-3xl">
          <h2 className="font-display font-semibold text-[16px] text-slate-900 pb-4 border-b border-slate-100">
            AI Voice &amp; Retry Rules
          </h2>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13.5px]">
            <div>
              <label className="block text-slate-500 text-xs font-medium mb-1">Default AI Voice Persona</label>
              <select
                value={settings.aiVoiceSettings.defaultVoice}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    aiVoiceSettings: { ...settings.aiVoiceSettings, defaultVoice: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F4F8] text-slate-900 focus:outline-none"
              >
                <option>Neha (Hindi)</option>
                <option>Arjun (Hindi)</option>
                <option>Priya (Hinglish)</option>
                <option>Rahul (English)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-500 text-xs font-medium mb-1">Speech Rate</label>
              <select
                value={settings.aiVoiceSettings.speechRate}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    aiVoiceSettings: { ...settings.aiVoiceSettings, speechRate: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F4F8] text-slate-900 focus:outline-none"
              >
                <option>0.9x (Calm)</option>
                <option>1.0x (Natural)</option>
                <option>1.15x (Crisp)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-500 text-xs font-medium mb-1">Max Retry Attempts (Unanswered)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={settings.aiVoiceSettings.maxRetries}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    aiVoiceSettings: { ...settings.aiVoiceSettings, maxRetries: Number(e.target.value) },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F4F8] text-slate-900 focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8FAFC]">
              <div>
                <div className="font-medium text-slate-900 text-[13px]">Auto WhatsApp Fallback</div>
                <div className="text-[11.5px] text-slate-400">Send WhatsApp if call unanswered</div>
              </div>
              <input
                type="checkbox"
                checked={settings.aiVoiceSettings.whatsappFallback}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    aiVoiceSettings: { ...settings.aiVoiceSettings, whatsappFallback: e.target.checked },
                  })
                }
                className="w-4 h-4 accent-[#2563EB]"
              />
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => onShowToast('AI Voice & retry rules saved')}
              className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13.5px] font-medium"
            >
              Save Voice Settings
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
