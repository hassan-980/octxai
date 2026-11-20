import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  AdminAICallStream,
  AdminExportRecord,
  AdminSeller,
  AdminSubscription,
  AdminSupportTicket,
  AdminSystemLog,
  AdminTab,
  AdminUserPayload,
  AdminWhatsAppSellerUsage,
  AdminWhatsAppTemplateQueueItem,
  INITIAL_ADMIN_AI_CALLS,
  INITIAL_ADMIN_EXPORTS,
  INITIAL_ADMIN_LOGS,
  INITIAL_ADMIN_SELLERS,
  INITIAL_ADMIN_SUBSCRIPTIONS,
  INITIAL_ADMIN_TICKETS,
  INITIAL_WA_SELLER_USAGE,
  INITIAL_WA_TEMPLATE_QUEUE,
  PLAN_CATALOG,
  SellerAccountStatus,
  SellerPlanTier,
  TicketPriority,
  TicketStatus,
} from '../../data/adminData';
import { formatINR } from '../../utils/helpers';

export interface AdminState {
  activeTab: AdminTab;
  revRange: '30D' | '90D' | '12M';
  sellers: AdminSeller[];
  subscriptions: AdminSubscription[];
  aiCalls: AdminAICallStream[];
  waUsage: AdminWhatsAppSellerUsage[];
  waTemplates: AdminWhatsAppTemplateQueueItem[];
  tickets: AdminSupportTicket[];
  logs: AdminSystemLog[];
  exportHistory: AdminExportRecord[];
}

const initialState: AdminState = {
  activeTab: 'revenue',
  revRange: '30D',
  sellers: INITIAL_ADMIN_SELLERS,
  subscriptions: INITIAL_ADMIN_SUBSCRIPTIONS,
  aiCalls: INITIAL_ADMIN_AI_CALLS,
  waUsage: INITIAL_WA_SELLER_USAGE,
  waTemplates: INITIAL_WA_TEMPLATE_QUEUE,
  tickets: INITIAL_ADMIN_TICKETS,
  logs: INITIAL_ADMIN_LOGS,
  exportHistory: INITIAL_ADMIN_EXPORTS,
};

function createLogEntry(
  severity: AdminSystemLog['severity'],
  service: AdminSystemLog['service'],
  actor: string,
  event: string,
  message: string,
  payload: Record<string, string | number | boolean>
): AdminSystemLog {
  return {
    id: `LOG-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    severity,
    service,
    actor,
    event,
    message,
    ipAddress: '103.21.58.14',
    payload,
  };
}

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setAdminActiveTab(state, action: PayloadAction<AdminTab>) {
      state.activeTab = action.payload;
    },
    setAdminRevRange(state, action: PayloadAction<'30D' | '90D' | '12M'>) {
      state.revRange = action.payload;
    },
    recordAdminSessionStart(state, action: PayloadAction<AdminUserPayload>) {
      const admin = action.payload;
      state.logs.unshift(
        createLogEntry(
          'Security',
          'Auth & OTP',
          admin.email,
          'ADMIN_SESSION_STARTED',
          `${admin.fullName} (${admin.role}) verified via ${(admin.verifiedChannel ?? 'sms').toUpperCase()} OTP and entered Admin Console.`,
          { adminId: admin.id, role: admin.role, otpChannel: admin.verifiedChannel ?? 'sms' }
        )
      );
    },
    updateSellerStatus(
      state,
      action: PayloadAction<{ sellerId: string; nextStatus: SellerAccountStatus; actor: string }>
    ) {
      const { sellerId, nextStatus, actor } = action.payload;
      const seller = state.sellers.find((s) => s.id === sellerId);
      if (!seller) return;
      const previousStatus = seller.status;
      seller.status = nextStatus;
      seller.mrrContribution =
        nextStatus === 'Suspended' ? 0 : PLAN_CATALOG[seller.plan].monthlyPrice;
      state.logs.unshift(
        createLogEntry(
          nextStatus === 'Suspended' ? 'Warning' : 'Info',
          'Admin Audit',
          actor,
          `SELLER_${nextStatus.toUpperCase().replace(/\s+/g, '_')}`,
          `Updated ${seller.businessName} (${seller.id}) account status to ${nextStatus}.`,
          { sellerId: seller.id, previousStatus, nextStatus }
        )
      );
    },
    adjustSellerWallet(
      state,
      action: PayloadAction<{ sellerId: string; delta: number; actor: string }>
    ) {
      const { sellerId, delta, actor } = action.payload;
      const seller = state.sellers.find((s) => s.id === sellerId);
      if (!seller) return;
      seller.walletBalance = Math.max(0, seller.walletBalance + delta);
      state.logs.unshift(
        createLogEntry(
          'Info',
          'Billing Engine',
          actor,
          'WALLET_CREDIT_ADJUSTED',
          `Credited ${formatINR(delta)} to ${seller.businessName} wallet.`,
          { sellerId: seller.id, creditInr: delta }
        )
      );
    },
    createAdminSeller(
      state,
      action: PayloadAction<{
        businessName: string;
        ownerName: string;
        email: string;
        phone: string;
        city: string;
        gstin: string;
        marketplace: AdminSeller['marketplace'];
        plan: SellerPlanTier;
        actor: string;
      }>
    ) {
      const p = action.payload;
      const id = `SLR-${1011 + state.sellers.length}`;
      const planPrice = PLAN_CATALOG[p.plan].monthlyPrice;
      const created: AdminSeller = {
        id,
        businessName: p.businessName,
        ownerName: p.ownerName,
        email: p.email,
        phone: p.phone || '+91 98000 11223',
        city: p.city || 'Bengaluru, KA',
        gstin: p.gstin || '29AABCO1234K1Z5',
        marketplace: p.marketplace,
        plan: p.plan,
        status: 'Active',
        mrrContribution: planPrice,
        monthlyOrders: 0,
        aiCallsThisMonth: 0,
        whatsappSentThisMonth: 0,
        walletBalance: 1000,
        joinedDate: 'Just now',
        lastActive: 'Just now',
      };
      state.sellers.unshift(created);
      state.subscriptions.unshift({
        id: `SUB-${9050 + state.subscriptions.length}`,
        sellerId: id,
        businessName: created.businessName,
        ownerName: created.ownerName,
        plan: created.plan,
        billingCycle: 'Monthly',
        amount: planPrice,
        status: 'Active',
        renewalDate: '19 Dec 2026',
        paymentMethod: 'Admin Provisioned',
        aiQuotaUsed: 0,
        aiQuotaLimit: PLAN_CATALOG[created.plan].aiCallsLimit,
        waQuotaUsed: 0,
        waQuotaLimit: PLAN_CATALOG[created.plan].waCreditsLimit,
        autoRenew: true,
      });
      state.logs.unshift(
        createLogEntry(
          'Info',
          'Admin Audit',
          p.actor,
          'SELLER_PROVISIONED',
          `Provisioned seller ${created.businessName} on ${created.plan}.`,
          { sellerId: id, plan: created.plan }
        )
      );
    },
    updateSubscriptionPlan(
      state,
      action: PayloadAction<{
        subId: string;
        plan: SellerPlanTier;
        billingCycle: 'Monthly' | 'Annual';
        actor: string;
      }>
    ) {
      const { subId, plan, billingCycle, actor } = action.payload;
      const sub = state.subscriptions.find((s) => s.id === subId);
      if (!sub) return;
      const spec = PLAN_CATALOG[plan];
      const nextAmount = billingCycle === 'Annual' ? spec.annualPrice : spec.monthlyPrice;
      sub.plan = plan;
      sub.billingCycle = billingCycle;
      sub.amount = nextAmount;
      sub.aiQuotaLimit = spec.aiCallsLimit;
      sub.waQuotaLimit = spec.waCreditsLimit;

      const seller = state.sellers.find((sl) => sl.id === sub.sellerId);
      if (seller) {
        seller.plan = plan;
        seller.mrrContribution = seller.status === 'Suspended' ? 0 : spec.monthlyPrice;
      }

      state.logs.unshift(
        createLogEntry(
          'Info',
          'Billing Engine',
          actor,
          'SUBSCRIPTION_PLAN_CHANGED',
          `Updated ${sub.businessName} (${sub.id}) to ${plan} (${billingCycle}).`,
          { subscriptionId: sub.id, plan, cycle: billingCycle, amountInr: nextAmount }
        )
      );
    },
    retrySubscriptionPayment(state, action: PayloadAction<{ subId: string; actor: string }>) {
      const { subId, actor } = action.payload;
      const sub = state.subscriptions.find((s) => s.id === subId);
      if (!sub) return;
      sub.status = 'Active';
      sub.renewalDate = '19 Dec 2026';
      const seller = state.sellers.find((sl) => sl.id === sub.sellerId);
      if (seller) {
        seller.status = 'Active';
        seller.mrrContribution = PLAN_CATALOG[seller.plan].monthlyPrice;
      }
      state.logs.unshift(
        createLogEntry(
          'Info',
          'Billing Engine',
          actor,
          'DUNNING_RETRY_CAPTURED',
          `Manual payment retry succeeded for ${sub.businessName} (${sub.id}) — ${formatINR(sub.amount)}.`,
          { subscriptionId: sub.id, amountInr: sub.amount }
        )
      );
    },
    toggleSubscriptionCancel(state, action: PayloadAction<{ subId: string; actor: string }>) {
      const { subId, actor } = action.payload;
      const sub = state.subscriptions.find((s) => s.id === subId);
      if (!sub) return;
      const nextStatus = sub.status === 'Cancelled' ? 'Active' : 'Cancelled';
      sub.status = nextStatus;
      sub.autoRenew = nextStatus === 'Active';
      state.logs.unshift(
        createLogEntry(
          nextStatus === 'Cancelled' ? 'Warning' : 'Info',
          'Billing Engine',
          actor,
          nextStatus === 'Cancelled' ? 'SUBSCRIPTION_CANCELLED' : 'SUBSCRIPTION_REACTIVATED',
          `${sub.businessName} (${sub.id}) set to ${nextStatus}.`,
          { subscriptionId: sub.id, nextStatus }
        )
      );
    },
    retryAdminAICall(state, action: PayloadAction<{ callId: string; actor: string }>) {
      const { callId, actor } = action.payload;
      const call = state.aiCalls.find((c) => c.id === callId);
      if (!call) return;
      call.status = 'Completed';
      call.provider = 'Exotel';
      call.latencyMs = 298;
      call.duration = '01:08';
      call.costInr = 1.5;
      call.outcome = 'COD Confirmed via Exotel Failover';
      call.timestamp = 'Just now';
      state.logs.unshift(
        createLogEntry(
          'Info',
          'AI Voice Router',
          actor,
          'CALL_RETRY_SUCCEEDED',
          `Re-routed ${callId} to Exotel failover trunk.`,
          { callId, provider: 'Exotel' }
        )
      );
    },
    terminateAdminAICall(state, action: PayloadAction<{ callId: string; actor: string }>) {
      const { callId, actor } = action.payload;
      const call = state.aiCalls.find((c) => c.id === callId);
      if (!call) return;
      call.status = 'Completed';
      call.outcome = 'Ended by Admin Monitor';
      call.timestamp = 'Just now';
      state.logs.unshift(
        createLogEntry(
          'Warning',
          'AI Voice Router',
          actor,
          'CALL_ADMIN_TERMINATED',
          `Admin terminated live voice channel ${callId}.`,
          { callId }
        )
      );
    },
    moderateWaTemplate(
      state,
      action: PayloadAction<{ id: string; decision: 'Approved' | 'Rejected'; actor: string }>
    ) {
      const { id, decision, actor } = action.payload;
      const target = state.waTemplates.find((t) => t.id === id);
      if (!target) return;
      target.status = decision;
      state.logs.unshift(
        createLogEntry(
          decision === 'Rejected' ? 'Warning' : 'Info',
          'WhatsApp Gateway',
          actor,
          `TEMPLATE_${decision.toUpperCase()}`,
          `Template ${target.templateName} (${target.sellerName}) marked ${decision}.`,
          { templateId: id, decision }
        )
      );
    },
    replySupportTicket(
      state,
      action: PayloadAction<{ ticketId: string; text: string; sender: string; actor: string }>
    ) {
      const { ticketId, text, sender, actor } = action.payload;
      const ticket = state.tickets.find((t) => t.id === ticketId);
      if (!ticket) return;
      if (ticket.status === 'Open') {
        ticket.status = 'In Progress';
      }
      ticket.messages.push({ sender, role: 'Admin', timestamp: 'Just now', text });
      state.logs.unshift(
        createLogEntry(
          'Info',
          'Admin Audit',
          actor,
          'TICKET_REPLY_SENT',
          `Posted admin response on ticket ${ticketId}.`,
          { ticketId }
        )
      );
    },
    updateSupportTicketStatus(
      state,
      action: PayloadAction<{ ticketId: string; status: TicketStatus; actor: string }>
    ) {
      const { ticketId, status, actor } = action.payload;
      const ticket = state.tickets.find((t) => t.id === ticketId);
      if (!ticket) return;
      ticket.status = status;
      state.logs.unshift(
        createLogEntry(
          'Info',
          'Admin Audit',
          actor,
          'TICKET_STATUS_UPDATED',
          `Ticket ${ticketId} status changed to ${status}.`,
          { ticketId, status }
        )
      );
    },
    updateSupportTicketPriority(
      state,
      action: PayloadAction<{ ticketId: string; priority: TicketPriority }>
    ) {
      const ticket = state.tickets.find((t) => t.id === action.payload.ticketId);
      if (ticket) {
        ticket.priority = action.payload.priority;
      }
    },
    recordAdminExport(
      state,
      action: PayloadAction<{
        reportName: string;
        format: 'CSV' | 'JSON';
        dateRange: string;
        rowCount: number;
        generatedBy: string;
        actor: string;
      }>
    ) {
      const { reportName, format, dateRange, rowCount, generatedBy, actor } = action.payload;
      const rec: AdminExportRecord = {
        id: `EXP-${205 + state.exportHistory.length}`,
        reportName,
        format,
        dateRange,
        generatedBy,
        generatedAt: 'Just now',
        rowCount,
      };
      state.exportHistory.unshift(rec);
      state.logs.unshift(
        createLogEntry(
          'Info',
          'Admin Audit',
          actor,
          'REPORT_EXPORTED',
          `Exported ${reportName} (${format}, ${dateRange}).`,
          { exportId: rec.id, format, rowCount }
        )
      );
    },
  },
});

export const {
  setAdminActiveTab,
  setAdminRevRange,
  recordAdminSessionStart,
  updateSellerStatus,
  adjustSellerWallet,
  createAdminSeller,
  updateSubscriptionPlan,
  retrySubscriptionPayment,
  toggleSubscriptionCancel,
  retryAdminAICall,
  terminateAdminAICall,
  moderateWaTemplate,
  replySupportTicket,
  updateSupportTicketStatus,
  updateSupportTicketPriority,
  recordAdminExport,
} = adminSlice.actions;

export default adminSlice.reducer;
