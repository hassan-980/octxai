export type ViewName =
  | 'overview'
  | 'orders'
  | 'ai-calling'
  | 'whatsapp'
  | 'tracking'
  | 'feedback'
  | 'billing'
  | 'reports'
  | 'settings'
  | 'landing';

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Failed';

export interface Order {
  id: string;
  initials: string;
  customer: string;
  phone: string;
  product: string;
  amount: number;
  paymentMode: 'COD' | 'Prepaid';
  channel: 'Amazon' | 'Flipkart' | 'Shopify' | 'Direct';
  status: OrderStatus;
  city: string;
  address: string;
  createdAt: string;
  aiCallStatus: 'Confirmed' | 'Pending' | 'Unanswered' | 'Not Called';
  whatsappSent: boolean;
}

export interface TranscriptMessage {
  speaker: string;
  time: string;
  text: string;
}

export type CallStatusType = 'Completed' | 'Unanswered' | 'Failed';

export type CallCategoryType =
  | 'Pre-shipment Confirmation'
  | 'Address Verification'
  | 'Out for Delivery Reminder'
  | 'Failed Delivery Retry'
  | 'Post Delivery Feedback';

export interface AICall {
  id: string;
  initials: string;
  name: string;
  phone: string;
  status: CallStatusType;
  badgeLabel: string;
  time: string;
  date: string;
  duration: string;
  durationSec: number;
  amount: string;
  orderDate: string;
  deliveryDate: string;
  product: string;
  voice: string;
  callType: CallCategoryType;
  ivrUsed: boolean;
  addressVerified: boolean;
  outcomeTitle: string;
  outcomeDesc: string;
  nextAction: string;
  nextActionSchedule: string;
  sentimentScore: number;
  intentDetected: string;
  confidence: number;
  transcript: TranscriptMessage[];
}

export interface CallTemplate {
  id: string;
  name: string;
  callType: CallCategoryType;
  language: string;
  voice: string;
  script: string;
  active: boolean;
}

export interface IVROption {
  digit: string;
  label: string;
  action: string;
}

export interface WhatsAppCampaign {
  id: string;
  name: string;
  subtitle: string;
  type: 'Transactional' | 'Marketing' | 'Conversion';
  status: 'Active' | 'Completed' | 'Scheduled' | 'Paused' | 'Failed';
  total: number;
  sent: number;
  delivered: number;
  read: number;
  replies: number;
  failed: number;
  date: string;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: 'Transactional' | 'Marketing' | 'Utility';
  status: 'Approved' | 'Pending';
  body: string;
  language: string;
}

export interface AutoReplyRule {
  id: string;
  keyword: string;
  matchType: 'Exact' | 'Contains';
  replyMessage: string;
  triggeredCount: number;
  enabled: boolean;
}

export interface WhatsAppContact {
  id: string;
  name: string;
  phone: string;
  lastOrder: string;
  optIn: boolean;
  tags: string[];
  lastMessageTime: string;
}

export interface ChatMessageLog {
  id: string;
  customer: string;
  phone: string;
  orderId: string;
  direction: 'outbound' | 'inbound';
  message: string;
  status: 'Read' | 'Delivered' | 'Sent' | 'Received';
  time: string;
}

export interface WebhookLog {
  id: string;
  event: string;
  source: string;
  statusCode: number;
  latencyMs: number;
  timestamp: string;
  payloadSummary: string;
}

export interface ShipmentStep {
  title: string;
  desc: string;
  location: string;
  time: string;
  completed: boolean;
}

export type ShipmentStatus =
  | 'Out for Delivery'
  | 'In Transit'
  | 'Delivered'
  | 'Delayed'
  | 'Failed Delivery';

export interface Shipment {
  orderId: string;
  customer: string;
  phone: string;
  courier: 'Delhivery' | 'XpressBees' | 'Ecom Express' | 'BlueDart' | 'Shadowfax';
  awb: string;
  status: ShipmentStatus;
  pickupDate: string;
  eta: string;
  deliveredOn?: string;
  delayReason?: string;
  steps: ShipmentStep[];
}

export interface CourierIntegration {
  id: string;
  name: string;
  code: string;
  connected: boolean;
  activeShipments: number;
  onTimeRate: string;
  webhookStatus: 'Live' | 'Disconnected';
}

export interface FeedbackReview {
  id: string;
  customer: string;
  phone: string;
  orderId: string;
  rating: number;
  comment: string;
  tags: string[];
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  date: string;
  reply?: string;
}

export interface FeedbackRequest {
  id: string;
  orderId: string;
  customer: string;
  date: string;
  channel: 'WhatsApp' | 'AI Call';
  status: 'Sent' | 'Delivered' | 'Read';
}

export interface WalletTransaction {
  id: string;
  date: string;
  description: string;
  type: 'Credit' | 'Debit';
  method: string;
  status: 'Success' | 'Pending';
  amount: number;
}

export interface GSTInvoice {
  id: string;
  period: string;
  issuedDate: string;
  amount: number;
  gstAmount: number;
  status: 'Paid';
}

export interface PaymentMethodItem {
  id: string;
  label: string;
  sublabel: string;
  type: 'UPI' | 'Card' | 'NetBanking';
  isPrimary: boolean;
}

export interface ConnectedAccount {
  id: string;
  name: string;
  identifier: string;
  connected: boolean;
  lastSynced: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  tone: 'emerald' | 'amber' | 'blue' | 'rose';
  read: boolean;
}

export interface SellerSettingsState {
  fullName: string;
  email: string;
  phone: string;
  businessName: string;
  businessType: string;
  address: string;
  timeZone: string;
  gstin: string;
  supportEmail: string;
  twoFactorEnabled: boolean;
  emailPrefs: {
    orderNotifications: boolean;
    deliveryUpdates: boolean;
    promotionsOffers: boolean;
    accountUpdates: boolean;
  };
  aiVoiceSettings: {
    defaultVoice: string;
    speechRate: string;
    maxRetries: number;
    quietHoursEnabled: boolean;
    quietStart: string;
    quietEnd: string;
    whatsappFallback: boolean;
  };
  sellerShieldThreshold: number;
}
