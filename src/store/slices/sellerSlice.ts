import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  AICall,
  AutoReplyRule,
  CallCategoryType,
  ChatMessageLog,
  ConnectedAccount,
  CourierIntegration,
  FeedbackRequest,
  FeedbackReview,
  NotificationItem,
  Order,
  OrderStatus,
  PaymentMethodItem,
  SellerSettingsState,
  Shipment,
  WalletTransaction,
  WhatsAppCampaign,
  WhatsAppTemplate,
} from '../../types';
import {
  INITIAL_AI_CALLS,
  INITIAL_AUTO_REPLIES,
  INITIAL_CHAT_LOGS,
  INITIAL_CONNECTED_ACCOUNTS,
  INITIAL_COURIERS,
  INITIAL_FEEDBACK,
  INITIAL_FEEDBACK_REQUESTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ORDERS,
  INITIAL_PAYMENT_METHODS,
  INITIAL_SELLER_SETTINGS,
  INITIAL_SHIPMENTS,
  INITIAL_TRANSACTIONS,
  INITIAL_WA_CAMPAIGNS,
  INITIAL_WA_TEMPLATES,
} from '../../data/initialData';
import { formatINR, getInitials } from '../../utils/helpers';
import { AuthUserPayload } from '../../components/AuthView';
import { getStoredAuthUser } from './authSlice';

export type SellerPlan = 'Starter' | 'Pro Plan' | 'Enterprise';

export interface SellerState {
  orders: Order[];
  aiCalls: AICall[];
  waCampaigns: WhatsAppCampaign[];
  waTemplates: WhatsAppTemplate[];
  autoReplies: AutoReplyRule[];
  chatLogs: ChatMessageLog[];
  shipments: Shipment[];
  couriers: CourierIntegration[];
  reviews: FeedbackReview[];
  feedbackRequests: FeedbackRequest[];
  walletBalance: number;
  creditsUsed: number;
  creditsTotal: number;
  currentPlan: SellerPlan;
  transactions: WalletTransaction[];
  paymentMethods: PaymentMethodItem[];
  settings: SellerSettingsState;
  connectedAccounts: ConnectedAccount[];
  notifications: NotificationItem[];
}

const storedUser = typeof window !== 'undefined' ? getStoredAuthUser() : null;

const initialState: SellerState = {
  orders: INITIAL_ORDERS,
  aiCalls: INITIAL_AI_CALLS,
  waCampaigns: INITIAL_WA_CAMPAIGNS,
  waTemplates: INITIAL_WA_TEMPLATES,
  autoReplies: INITIAL_AUTO_REPLIES,
  chatLogs: INITIAL_CHAT_LOGS,
  shipments: INITIAL_SHIPMENTS,
  couriers: INITIAL_COURIERS,
  reviews: INITIAL_FEEDBACK,
  feedbackRequests: INITIAL_FEEDBACK_REQUESTS,
  walletBalance: 2450.75,
  creditsUsed: 15692,
  creditsTotal: 25000,
  currentPlan: 'Pro Plan',
  transactions: INITIAL_TRANSACTIONS,
  paymentMethods: INITIAL_PAYMENT_METHODS,
  settings: storedUser
    ? {
        ...INITIAL_SELLER_SETTINGS,
        fullName: storedUser.fullName,
        email: storedUser.email,
        businessName: storedUser.businessName,
        phone: storedUser.phone,
      }
    : INITIAL_SELLER_SETTINGS,
  connectedAccounts: INITIAL_CONNECTED_ACCOUNTS,
  notifications: INITIAL_NOTIFICATIONS,
};

const sellerSlice = createSlice({
  name: 'seller',
  initialState,
  reducers: {
    syncSettingsFromAuth(state, action: PayloadAction<AuthUserPayload>) {
      state.settings.fullName = action.payload.fullName;
      state.settings.email = action.payload.email;
      state.settings.businessName = action.payload.businessName;
      state.settings.phone = action.payload.phone;
    },
    createOrder(state, action: PayloadAction<Order>) {
      const newOrder = action.payload;
      state.orders.unshift(newOrder);
      const defaultVoice = state.settings.aiVoiceSettings.defaultVoice;
      const autoCall: AICall = {
        id: newOrder.id,
        initials: newOrder.initials,
        name: newOrder.customer,
        phone: newOrder.phone,
        status: 'Completed',
        badgeLabel: 'Confirmed',
        time: 'Just now',
        date: '18 May 2024',
        duration: '01:18',
        durationSec: 78,
        amount: `${formatINR(newOrder.amount)} (${newOrder.paymentMode})`,
        orderDate: '18 May 2024',
        deliveryDate: '21 May 2024',
        product: newOrder.product,
        voice: defaultVoice,
        callType: 'Pre-shipment Confirmation',
        ivrUsed: false,
        addressVerified: true,
        outcomeTitle: 'Order Confirmed via AI Call',
        outcomeDesc: `Customer confirmed ${newOrder.product} order and delivery address.`,
        nextAction: 'WhatsApp Tracking Alert',
        nextActionSchedule: 'Scheduled on dispatch',
        sentimentScore: 94,
        intentDetected: 'Order Confirmed',
        confidence: 98.1,
        transcript: [
          {
            speaker: `AI (${defaultVoice.split(' ')[0]})`,
            time: 'Just now',
            text: `Namaste ${newOrder.customer} ji, main octxAI bol rahi hoon. Aapka ${newOrder.product} order ₹${newOrder.amount} confirm karne ke liye call kiya hai.`,
          },
          { speaker: 'Customer', time: 'Just now', text: 'Haan ji order confirm hai.' },
        ],
      };
      state.aiCalls.unshift(autoCall);
    },
    importOrders(state, action: PayloadAction<Order[]>) {
      state.orders = [...action.payload, ...state.orders];
    },
    updateOrderStatus(state, action: PayloadAction<{ orderId: string; status: OrderStatus }>) {
      const target = state.orders.find((o) => o.id === action.payload.orderId);
      if (target) {
        target.status = action.payload.status;
      }
    },
    triggerAICallFromOrder(state, action: PayloadAction<Order>) {
      const order = action.payload;
      if (state.aiCalls.some((c) => c.id === order.id)) return;
      const created: AICall = {
        id: order.id,
        initials: order.initials,
        name: order.customer,
        phone: order.phone,
        status: 'Completed',
        badgeLabel: 'Confirmed',
        time: 'Just now',
        date: '18 May 2024',
        duration: '01:26',
        durationSec: 86,
        amount: `${formatINR(order.amount)} (${order.paymentMode})`,
        orderDate: '18 May 2024',
        deliveryDate: '21 May 2024',
        product: order.product,
        voice: state.settings.aiVoiceSettings.defaultVoice,
        callType: 'Pre-shipment Confirmation',
        ivrUsed: false,
        addressVerified: true,
        outcomeTitle: 'Order & Address Confirmed',
        outcomeDesc: `AI voice verification completed for ${order.customer}.`,
        nextAction: 'Dispatch Notification',
        nextActionSchedule: 'Ready for pickup',
        sentimentScore: 92,
        intentDetected: 'Order Verification',
        confidence: 97.0,
        transcript: [
          {
            speaker: 'AI (Neha)',
            time: 'Just now',
            text: `Namaste ${order.customer} ji, verifying your order ${order.id} for ${order.product}.`,
          },
          { speaker: 'Customer', time: 'Just now', text: 'Confirmed, please ship it.' },
        ],
      };
      state.aiCalls.unshift(created);
    },
    addAICall(state, action: PayloadAction<AICall>) {
      state.aiCalls.unshift(action.payload);
    },
    triggerShipmentAICall(state, action: PayloadAction<Shipment>) {
      const s = action.payload;
      const call: AICall = {
        id: s.orderId,
        initials: getInitials(s.customer),
        name: s.customer,
        phone: s.phone,
        status: 'Completed',
        badgeLabel: 'Confirmed',
        time: 'Just now',
        date: '18 May 2024',
        duration: '01:15',
        durationSec: 75,
        amount: '₹1,499 (COD)',
        orderDate: s.pickupDate,
        deliveryDate: s.eta,
        product: 'Shipment Update',
        voice: state.settings.aiVoiceSettings.defaultVoice,
        callType:
          s.status === 'Delayed' || s.status === 'Failed Delivery'
            ? 'Failed Delivery Retry'
            : 'Out for Delivery Reminder',
        ivrUsed: false,
        addressVerified: true,
        outcomeTitle: `Shipment Update Shared (${s.courier})`,
        outcomeDesc: `Customer notified regarding AWB ${s.awb} (${s.status}).`,
        nextAction: 'Courier Re-Attempt Synced',
        nextActionSchedule: 'Updated automatically',
        sentimentScore: 88,
        intentDetected: 'Delivery Slot Re-confirmed',
        confidence: 96.5,
        transcript: [
          {
            speaker: 'AI (Neha)',
            time: 'Just now',
            text: `Namaste ${s.customer} ji, aapke ${s.courier} parcel ${s.orderId} ka status abhi "${s.status}" hai. Kya aap delivery ke liye available hain?`,
          },
          { speaker: 'Customer', time: 'Just now', text: 'Haan ji, please evening mein deliver karwa dijiye.' },
        ],
      };
      state.aiCalls = [call, ...state.aiCalls.filter((c) => c.id !== s.orderId)];
    },
    updateAICallType(state, action: PayloadAction<{ id: string; callType: CallCategoryType }>) {
      const target = state.aiCalls.find((c) => c.id === action.payload.id);
      if (target) {
        target.callType = action.payload.callType;
      }
    },
    addWaCampaign(state, action: PayloadAction<WhatsAppCampaign>) {
      state.waCampaigns.unshift(action.payload);
      state.creditsUsed += action.payload.sent;
    },
    addWaTemplate(state, action: PayloadAction<WhatsAppTemplate>) {
      state.waTemplates.unshift(action.payload);
    },
    toggleAutoReply(state, action: PayloadAction<string>) {
      const target = state.autoReplies.find((r) => r.id === action.payload);
      if (target) {
        target.enabled = !target.enabled;
      }
    },
    addChatMessage(state, action: PayloadAction<ChatMessageLog>) {
      state.chatLogs.unshift(action.payload);
    },
    sendWhatsAppFromOrder(state, action: PayloadAction<Order>) {
      const order = action.payload;
      state.chatLogs.unshift({
        id: `cl-${Date.now()}`,
        customer: order.customer,
        phone: order.phone,
        orderId: order.id,
        direction: 'outbound',
        message: `Hi ${order.customer}, your order ${order.id} (${order.product}) is ${order.status}.`,
        status: 'Sent',
        time: 'Just now',
      });
    },
    toggleCourier(state, action: PayloadAction<string>) {
      const target = state.couriers.find((c) => c.id === action.payload);
      if (target) {
        target.connected = !target.connected;
        target.webhookStatus = target.connected ? 'Live' : 'Disconnected';
      }
    },
    replyReview(state, action: PayloadAction<{ id: string; reply: string }>) {
      const target = state.reviews.find((r) => r.id === action.payload.id);
      if (target) {
        target.reply = action.payload.reply;
      }
    },
    sendFeedbackRequest(state, action: PayloadAction<FeedbackRequest>) {
      state.feedbackRequests.unshift(action.payload);
    },
    addMoney(state, action: PayloadAction<{ amount: number; method: string }>) {
      const { amount, method } = action.payload;
      state.walletBalance += amount;
      state.transactions.unshift({
        id: `tx-${Date.now()}`,
        date: 'Just now',
        description: 'Added Money to Wallet',
        type: 'Credit',
        method,
        status: 'Success',
        amount,
      });
    },
    buyCredits(state, action: PayloadAction<{ credits: number; cost: number }>) {
      const { credits, cost } = action.payload;
      state.creditsTotal += credits;
      state.walletBalance = Math.max(0, state.walletBalance - cost);
      state.transactions.unshift({
        id: `tx-${Date.now()}`,
        date: 'Just now',
        description: `WhatsApp Credits Pack (${credits.toLocaleString('en-IN')})`,
        type: 'Debit',
        method: 'Wallet Balance',
        status: 'Success',
        amount: cost,
      });
    },
    setCurrentPlan(state, action: PayloadAction<SellerPlan>) {
      state.currentPlan = action.payload;
    },
    addPaymentMethod(state, action: PayloadAction<PaymentMethodItem>) {
      state.paymentMethods.push(action.payload);
    },
    setPrimaryPaymentMethod(state, action: PayloadAction<string>) {
      state.paymentMethods.forEach((p) => {
        p.isPrimary = p.id === action.payload;
      });
    },
    updateSettings(state, action: PayloadAction<SellerSettingsState>) {
      state.settings = action.payload;
    },
    toggleConnectedAccount(state, action: PayloadAction<string>) {
      const target = state.connectedAccounts.find((a) => a.id === action.payload);
      if (target) {
        target.connected = !target.connected;
      }
    },
    markAllNotificationsRead(state) {
      state.notifications.forEach((n) => {
        n.read = true;
      });
    },
  },
});

export const {
  syncSettingsFromAuth,
  createOrder,
  importOrders,
  updateOrderStatus,
  triggerAICallFromOrder,
  addAICall,
  triggerShipmentAICall,
  updateAICallType,
  addWaCampaign,
  addWaTemplate,
  toggleAutoReply,
  addChatMessage,
  sendWhatsAppFromOrder,
  toggleCourier,
  replyReview,
  sendFeedbackRequest,
  addMoney,
  buyCredits,
  setCurrentPlan,
  addPaymentMethod,
  setPrimaryPaymentMethod,
  updateSettings,
  toggleConnectedAccount,
  markAllNotificationsRead,
} = sellerSlice.actions;

export default sellerSlice.reducer;
