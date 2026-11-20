export type AdminTab =
  | 'revenue'
  | 'sellers'
  | 'subscriptions'
  | 'ai-calls'
  | 'whatsapp'
  | 'tickets'
  | 'logs'
  | 'reports';

export interface AdminUserPayload {
  id: string;
  fullName: string;
  email: string;
  role: 'Super Admin' | 'Operations Admin';
  phone: string;
  verifiedChannel?: 'sms' | 'whatsapp';
  loginAt: string;
}

export type SellerPlanTier = 'Starter' | 'Pro Plan' | 'Enterprise';
export type SellerAccountStatus = 'Active' | 'Pending KYC' | 'Suspended';

export interface AdminSeller {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  gstin: string;
  marketplace: 'Amazon' | 'Flipkart' | 'Shopify' | 'Multi-Channel';
  plan: SellerPlanTier;
  status: SellerAccountStatus;
  mrrContribution: number;
  monthlyOrders: number;
  aiCallsThisMonth: number;
  whatsappSentThisMonth: number;
  walletBalance: number;
  joinedDate: string;
  lastActive: string;
}

export type SubscriptionStatus = 'Active' | 'Trialing' | 'Past Due' | 'Cancelled';

export interface AdminSubscription {
  id: string;
  sellerId: string;
  businessName: string;
  ownerName: string;
  plan: SellerPlanTier;
  billingCycle: 'Monthly' | 'Annual';
  amount: number;
  status: SubscriptionStatus;
  renewalDate: string;
  paymentMethod: string;
  aiQuotaUsed: number;
  aiQuotaLimit: number;
  waQuotaUsed: number;
  waQuotaLimit: number;
  autoRenew: boolean;
}

export interface AdminAICallStream {
  id: string;
  sellerName: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  language: 'Hindi' | 'Hinglish' | 'English' | 'Tamil' | 'Marathi';
  provider: 'Exotel' | 'Twilio India' | 'Knowlarity';
  status: 'In Progress' | 'Completed' | 'Failed' | 'Unanswered';
  outcome: string;
  duration: string;
  latencyMs: number;
  costInr: number;
  timestamp: string;
  transcript: { speaker: 'AI' | 'Customer'; text: string }[];
}

export interface AdminWhatsAppSellerUsage {
  sellerId: string;
  businessName: string;
  plan: SellerPlanTier;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  utilityShare: number;
  marketingShare: number;
  creditsUsedInr: number;
}

export interface AdminWhatsAppTemplateQueueItem {
  id: string;
  sellerName: string;
  templateName: string;
  category: 'Utility' | 'Marketing' | 'Authentication';
  language: string;
  bodyPreview: string;
  submittedAt: string;
  status: 'Pending Review' | 'Approved' | 'Rejected';
}

export type TicketPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type TicketStatus = 'Open' | 'In Progress' | 'Waiting on Seller' | 'Resolved';

export interface TicketMessage {
  sender: string;
  role: 'Seller' | 'Admin';
  timestamp: string;
  text: string;
}

export interface AdminSupportTicket {
  id: string;
  sellerName: string;
  sellerEmail: string;
  subject: string;
  category: 'AI Calling' | 'WhatsApp API' | 'Billing & GST' | 'Courier Sync' | 'Account Access';
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo: string;
  slaRemaining: string;
  createdAt: string;
  messages: TicketMessage[];
}

export type LogSeverity = 'Info' | 'Warning' | 'Error' | 'Security';

export interface AdminSystemLog {
  id: string;
  timestamp: string;
  severity: LogSeverity;
  service:
    | 'Auth & OTP'
    | 'Billing Engine'
    | 'AI Voice Router'
    | 'WhatsApp Gateway'
    | 'Admin Audit'
    | 'Webhook Worker';
  actor: string;
  event: string;
  message: string;
  ipAddress: string;
  payload: Record<string, string | number | boolean>;
}

export interface AdminExportRecord {
  id: string;
  reportName: string;
  format: 'CSV' | 'JSON';
  dateRange: string;
  generatedBy: string;
  generatedAt: string;
  rowCount: number;
}

export const PLAN_CATALOG: Record<
  SellerPlanTier,
  { monthlyPrice: number; annualPrice: number; aiCallsLimit: number; waCreditsLimit: number; audience: string }
> = {
  Starter: {
    monthlyPrice: 2499,
    annualPrice: 23990,
    aiCallsLimit: 3000,
    waCreditsLimit: 10000,
    audience: 'Early-stage D2C & single-store sellers',
  },
  'Pro Plan': {
    monthlyPrice: 7999,
    annualPrice: 76790,
    aiCallsLimit: 20000,
    waCreditsLimit: 50000,
    audience: 'High-volume Amazon, Flipkart & Shopify brands',
  },
  Enterprise: {
    monthlyPrice: 24999,
    annualPrice: 239990,
    aiCallsLimit: 100000,
    waCreditsLimit: 250000,
    audience: 'Multi-warehouse aggregators & enterprise brands',
  },
};

export const REVENUE_SERIES_BY_RANGE: Record<
  '30D' | '90D' | '12M',
  {
    labels: string[];
    mrrLakhs: number[];
    churnPct: number[];
    retentionPct: number[];
    mrrTotal: number;
    mrrGrowth: string;
    arrRunRate: number;
    avgRetention: number;
    avgChurn: number;
  }
> = {
  '30D': {
    labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Current'],
    mrrLakhs: [43.8, 45.1, 46.4, 47.5, 48.65],
    churnPct: [3.6, 3.5, 3.4, 3.3, 3.2],
    retentionPct: [96.4, 96.5, 96.6, 96.7, 96.8],
    mrrTotal: 4865200,
    mrrGrowth: '+18.4%',
    arrRunRate: 58382400,
    avgRetention: 96.8,
    avgChurn: 3.2,
  },
  '90D': {
    labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
    mrrLakhs: [35.2, 37.9, 40.4, 43.1, 45.8, 48.65],
    churnPct: [4.2, 4.0, 3.8, 3.6, 3.4, 3.2],
    retentionPct: [95.8, 96.0, 96.2, 96.4, 96.6, 96.8],
    mrrTotal: 4865200,
    mrrGrowth: '+38.2%',
    arrRunRate: 58382400,
    avgRetention: 96.5,
    avgChurn: 3.5,
  },
  '12M': {
    labels: ['Q1', 'Q2', 'Q3', 'Q4', 'Q1 (Curr)'],
    mrrLakhs: [24.6, 30.8, 36.9, 43.2, 48.65],
    churnPct: [4.9, 4.4, 3.9, 3.5, 3.2],
    retentionPct: [95.1, 95.6, 96.1, 96.5, 96.8],
    mrrTotal: 4865200,
    mrrGrowth: '+97.7%',
    arrRunRate: 58382400,
    avgRetention: 96.2,
    avgChurn: 3.8,
  },
};

export const COHORT_RETENTION_ROWS = [
  { cohort: 'Jul 2026', sellers: 842, m1: 98.1, m2: 96.4, m3: 95.2, m6: 93.8, nrr: '112.4%' },
  { cohort: 'Aug 2026', sellers: 915, m1: 98.4, m2: 96.9, m3: 95.8, m6: 94.5, nrr: '114.1%' },
  { cohort: 'Sep 2026', sellers: 1028, m1: 98.6, m2: 97.2, m3: 96.3, m6: 95.1, nrr: '115.8%' },
  { cohort: 'Oct 2026', sellers: 1140, m1: 98.9, m2: 97.6, m3: 96.8, m6: 0, nrr: '116.3%' },
  { cohort: 'Nov 2026', sellers: 1218, m1: 99.1, m2: 0, m3: 0, m6: 0, nrr: '118.0%' },
];

export const INITIAL_ADMIN_SELLERS: AdminSeller[] = [
  {
    id: 'SLR-1001',
    businessName: 'Aman Store',
    ownerName: 'Aman Kumar',
    email: 'aman.kumar@octxai.com',
    phone: '+91 98765 43210',
    city: 'Bengaluru, KA',
    gstin: '29AABCU9603R1ZM',
    marketplace: 'Multi-Channel',
    plan: 'Pro Plan',
    status: 'Active',
    mrrContribution: 7999,
    monthlyOrders: 12854,
    aiCallsThisMonth: 18420,
    whatsappSentThisMonth: 38900,
    walletBalance: 2450.75,
    joinedDate: '14 Jan 2025',
    lastActive: '2 mins ago',
  },
  {
    id: 'SLR-1002',
    businessName: 'Vastra House Ethnic',
    ownerName: 'Meera Nair',
    email: 'meera@vastrahouse.in',
    phone: '+91 98201 44819',
    city: 'Mumbai, MH',
    gstin: '27AADCV2145K1Z8',
    marketplace: 'Shopify',
    plan: 'Enterprise',
    status: 'Active',
    mrrContribution: 24999,
    monthlyOrders: 42610,
    aiCallsThisMonth: 74200,
    whatsappSentThisMonth: 182400,
    walletBalance: 19450.0,
    joinedDate: '03 Nov 2024',
    lastActive: '5 mins ago',
  },
  {
    id: 'SLR-1003',
    businessName: 'Kora Audio Labs',
    ownerName: 'Rohan Malhotra',
    email: 'rohan@koraaudio.in',
    phone: '+91 98114 77620',
    city: 'Gurugram, HR',
    gstin: '06AAECK8120B1Z2',
    marketplace: 'Amazon',
    plan: 'Enterprise',
    status: 'Active',
    mrrContribution: 24999,
    monthlyOrders: 31840,
    aiCallsThisMonth: 62810,
    whatsappSentThisMonth: 141200,
    walletBalance: 14820.5,
    joinedDate: '19 Feb 2025',
    lastActive: '11 mins ago',
  },
  {
    id: 'SLR-1004',
    businessName: 'AyurRoot Botanicals',
    ownerName: 'Neha Deshmukh',
    email: 'neha@ayurroot.co.in',
    phone: '+91 97652 10394',
    city: 'Pune, MH',
    gstin: '27AABCA4908P1Z4',
    marketplace: 'Multi-Channel',
    plan: 'Pro Plan',
    status: 'Active',
    mrrContribution: 7999,
    monthlyOrders: 9420,
    aiCallsThisMonth: 14110,
    whatsappSentThisMonth: 32500,
    walletBalance: 6120.0,
    joinedDate: '28 Mar 2025',
    lastActive: '24 mins ago',
  },
  {
    id: 'SLR-1005',
    businessName: 'Jaipur Looms Studio',
    ownerName: 'Devendra Rathore',
    email: 'dev@jaipurlooms.in',
    phone: '+91 94140 88211',
    city: 'Jaipur, RJ',
    gstin: '08AABCJ6721F1Z1',
    marketplace: 'Flipkart',
    plan: 'Starter',
    status: 'Active',
    mrrContribution: 2499,
    monthlyOrders: 2410,
    aiCallsThisMonth: 2680,
    whatsappSentThisMonth: 7450,
    walletBalance: 1290.0,
    joinedDate: '10 May 2025',
    lastActive: '42 mins ago',
  },
  {
    id: 'SLR-1006',
    businessName: 'UrbanFit Essentials',
    ownerName: 'Karan Bedi',
    email: 'karan@urbanfit.shop',
    phone: '+91 98102 65218',
    city: 'New Delhi, DL',
    gstin: '07AABCU3319N1Z9',
    marketplace: 'Amazon',
    plan: 'Pro Plan',
    status: 'Suspended',
    mrrContribution: 0,
    monthlyOrders: 5180,
    aiCallsThisMonth: 4120,
    whatsappSentThisMonth: 11200,
    walletBalance: 112.4,
    joinedDate: '17 Jun 2025',
    lastActive: '3 days ago',
  },
  {
    id: 'SLR-1007',
    businessName: 'Malabar Roast Co.',
    ownerName: 'Siddharth Menon',
    email: 'sid@malabarroast.in',
    phone: '+91 98470 51902',
    city: 'Kochi, KL',
    gstin: '32AABCM9412H1Z6',
    marketplace: 'Shopify',
    plan: 'Pro Plan',
    status: 'Active',
    mrrContribution: 7999,
    monthlyOrders: 7890,
    aiCallsThisMonth: 11340,
    whatsappSentThisMonth: 28900,
    walletBalance: 4850.25,
    joinedDate: '04 Jul 2025',
    lastActive: '18 mins ago',
  },
  {
    id: 'SLR-1008',
    businessName: 'ZestHome Appliances',
    ownerName: 'Ananya Chatterjee',
    email: 'ananya@zesthome.in',
    phone: '+91 98301 77423',
    city: 'Kolkata, WB',
    gstin: '19AABCZ2044E1Z5',
    marketplace: 'Flipkart',
    plan: 'Enterprise',
    status: 'Active',
    mrrContribution: 24999,
    monthlyOrders: 27940,
    aiCallsThisMonth: 51400,
    whatsappSentThisMonth: 119800,
    walletBalance: 22100.0,
    joinedDate: '12 Aug 2025',
    lastActive: '9 mins ago',
  },
  {
    id: 'SLR-1009',
    businessName: 'Niva Skincare India',
    ownerName: 'Priyanka Joshi',
    email: 'priyanka@nivaskincare.in',
    phone: '+91 98250 31884',
    city: 'Ahmedabad, GJ',
    gstin: '24AABCN8127G1Z3',
    marketplace: 'Shopify',
    plan: 'Starter',
    status: 'Pending KYC',
    mrrContribution: 2499,
    monthlyOrders: 1480,
    aiCallsThisMonth: 1210,
    whatsappSentThisMonth: 3920,
    walletBalance: 950.0,
    joinedDate: '08 Nov 2026',
    lastActive: '1 hour ago',
  },
  {
    id: 'SLR-1010',
    businessName: 'PeakGear Mobility',
    ownerName: 'Harshvardhan Rao',
    email: 'harsh@peakgear.in',
    phone: '+91 98490 66210',
    city: 'Hyderabad, TS',
    gstin: '36AABCP5542D1Z0',
    marketplace: 'Multi-Channel',
    plan: 'Pro Plan',
    status: 'Active',
    mrrContribution: 7999,
    monthlyOrders: 11240,
    aiCallsThisMonth: 16950,
    whatsappSentThisMonth: 41300,
    walletBalance: 8340.6,
    joinedDate: '21 Sep 2025',
    lastActive: '31 mins ago',
  },
];

export const INITIAL_ADMIN_SUBSCRIPTIONS: AdminSubscription[] = [
  {
    id: 'SUB-9041',
    sellerId: 'SLR-1002',
    businessName: 'Vastra House Ethnic',
    ownerName: 'Meera Nair',
    plan: 'Enterprise',
    billingCycle: 'Annual',
    amount: 239990,
    status: 'Active',
    renewalDate: '03 Nov 2027',
    paymentMethod: 'HDFC Corporate Card •••• 8841',
    aiQuotaUsed: 74200,
    aiQuotaLimit: 100000,
    waQuotaUsed: 182400,
    waQuotaLimit: 250000,
    autoRenew: true,
  },
  {
    id: 'SUB-9042',
    sellerId: 'SLR-1003',
    businessName: 'Kora Audio Labs',
    ownerName: 'Rohan Malhotra',
    plan: 'Enterprise',
    billingCycle: 'Monthly',
    amount: 24999,
    status: 'Active',
    renewalDate: '19 Dec 2026',
    paymentMethod: 'UPI AutoPay · kora@icici',
    aiQuotaUsed: 62810,
    aiQuotaLimit: 100000,
    waQuotaUsed: 141200,
    waQuotaLimit: 250000,
    autoRenew: true,
  },
  {
    id: 'SUB-9043',
    sellerId: 'SLR-1001',
    businessName: 'Aman Store',
    ownerName: 'Aman Kumar',
    plan: 'Pro Plan',
    billingCycle: 'Monthly',
    amount: 7999,
    status: 'Active',
    renewalDate: '14 Dec 2026',
    paymentMethod: 'ICICI Visa •••• 4242',
    aiQuotaUsed: 18420,
    aiQuotaLimit: 20000,
    waQuotaUsed: 38900,
    waQuotaLimit: 50000,
    autoRenew: true,
  },
  {
    id: 'SUB-9044',
    sellerId: 'SLR-1004',
    businessName: 'AyurRoot Botanicals',
    ownerName: 'Neha Deshmukh',
    plan: 'Pro Plan',
    billingCycle: 'Monthly',
    amount: 7999,
    status: 'Active',
    renewalDate: '28 Nov 2026',
    paymentMethod: 'UPI AutoPay · ayur@okhdfcbank',
    aiQuotaUsed: 14110,
    aiQuotaLimit: 20000,
    waQuotaUsed: 32500,
    waQuotaLimit: 50000,
    autoRenew: true,
  },
  {
    id: 'SUB-9045',
    sellerId: 'SLR-1006',
    businessName: 'UrbanFit Essentials',
    ownerName: 'Karan Bedi',
    plan: 'Pro Plan',
    billingCycle: 'Monthly',
    amount: 7999,
    status: 'Past Due',
    renewalDate: '17 Nov 2026',
    paymentMethod: 'Axis Mastercard •••• 1920',
    aiQuotaUsed: 4120,
    aiQuotaLimit: 20000,
    waQuotaUsed: 11200,
    waQuotaLimit: 50000,
    autoRenew: true,
  },
  {
    id: 'SUB-9046',
    sellerId: 'SLR-1008',
    businessName: 'ZestHome Appliances',
    ownerName: 'Ananya Chatterjee',
    plan: 'Enterprise',
    billingCycle: 'Annual',
    amount: 239990,
    status: 'Active',
    renewalDate: '12 Aug 2027',
    paymentMethod: 'Razorpay eMandate · Axis Bank',
    aiQuotaUsed: 51400,
    aiQuotaLimit: 100000,
    waQuotaUsed: 119800,
    waQuotaLimit: 250000,
    autoRenew: true,
  },
  {
    id: 'SUB-9047',
    sellerId: 'SLR-1009',
    businessName: 'Niva Skincare India',
    ownerName: 'Priyanka Joshi',
    plan: 'Starter',
    billingCycle: 'Monthly',
    amount: 2499,
    status: 'Trialing',
    renewalDate: '22 Nov 2026',
    paymentMethod: 'Trial — Card Pending',
    aiQuotaUsed: 1210,
    aiQuotaLimit: 3000,
    waQuotaUsed: 3920,
    waQuotaLimit: 10000,
    autoRenew: false,
  },
  {
    id: 'SUB-9048',
    sellerId: 'SLR-1005',
    businessName: 'Jaipur Looms Studio',
    ownerName: 'Devendra Rathore',
    plan: 'Starter',
    billingCycle: 'Monthly',
    amount: 2499,
    status: 'Active',
    renewalDate: '10 Dec 2026',
    paymentMethod: 'UPI AutoPay · jaipurlooms@ybl',
    aiQuotaUsed: 2680,
    aiQuotaLimit: 3000,
    waQuotaUsed: 7450,
    waQuotaLimit: 10000,
    autoRenew: true,
  },
];

export const INITIAL_ADMIN_AI_CALLS: AdminAICallStream[] = [
  {
    id: 'CALL-88421',
    sellerName: 'Vastra House Ethnic',
    orderId: '#VH-44910',
    customerName: 'Shruti Tiwari',
    customerPhone: '+91 98234 11209',
    language: 'Hinglish',
    provider: 'Exotel',
    status: 'In Progress',
    outcome: 'Confirming COD order ₹3,499',
    duration: '00:42',
    latencyMs: 310,
    costInr: 1.45,
    timestamp: 'Just now',
    transcript: [
      { speaker: 'AI', text: 'Namaste Shruti ji, Vastra House se bol rahi hoon. Aapka ₹3,499 ka silk kurta COD order confirm karne ke liye call kiya hai.' },
      { speaker: 'Customer', text: 'Haan ji, order maine hi place kiya tha, please dispatch kar dijiye.' },
    ],
  },
  {
    id: 'CALL-88420',
    sellerName: 'Kora Audio Labs',
    orderId: '#KA-99214',
    customerName: 'Vikramaditya Sen',
    customerPhone: '+91 99103 88421',
    language: 'English',
    provider: 'Twilio India',
    status: 'Completed',
    outcome: 'COD Confirmed · Address Verified',
    duration: '01:18',
    latencyMs: 285,
    costInr: 1.8,
    timestamp: '1 min ago',
    transcript: [
      { speaker: 'AI', text: 'Hello Vikramaditya, calling from Kora Audio Labs to confirm your ANC Earbuds COD order for Sector 43 Gurugram.' },
      { speaker: 'Customer', text: 'Confirmed, delivery at gate 2 security is fine.' },
    ],
  },
  {
    id: 'CALL-88419',
    sellerName: 'Aman Store',
    orderId: '#ORD-10045',
    customerName: 'Rahul Sharma',
    customerPhone: '+91 98765 11024',
    language: 'Hindi',
    provider: 'Exotel',
    status: 'Completed',
    outcome: 'COD Confirmed · Prepaid Link Sent',
    duration: '01:05',
    latencyMs: 340,
    costInr: 1.55,
    timestamp: '3 mins ago',
    transcript: [
      { speaker: 'AI', text: 'Namaste Rahul ji, Aman Store se aapke order #ORD-10045 ke confirmation ke liye call hai.' },
      { speaker: 'Customer', text: 'Ji confirm hai, WhatsApp par UPI link bhej dijiye.' },
    ],
  },
  {
    id: 'CALL-88418',
    sellerName: 'ZestHome Appliances',
    orderId: '#ZH-21804',
    customerName: 'Pradeep Nair',
    customerPhone: '+91 98451 90342',
    language: 'Tamil',
    provider: 'Knowlarity',
    status: 'Failed',
    outcome: 'SIP Trunk Timeout (503)',
    duration: '00:00',
    latencyMs: 1420,
    costInr: 0.0,
    timestamp: '6 mins ago',
    transcript: [
      { speaker: 'AI', text: 'Dial attempt failed at carrier gateway (Knowlarity South-IN). Eligible for automatic retry.' },
    ],
  },
  {
    id: 'CALL-88417',
    sellerName: 'AyurRoot Botanicals',
    orderId: '#AR-77102',
    customerName: 'Kavita Deshpande',
    customerPhone: '+91 97641 22901',
    language: 'Marathi',
    provider: 'Exotel',
    status: 'Completed',
    outcome: 'NDR Rescheduled · Tomorrow 4 PM',
    duration: '01:34',
    latencyMs: 302,
    costInr: 1.9,
    timestamp: '9 mins ago',
    transcript: [
      { speaker: 'AI', text: 'Namaskar Kavita tai, AyurRoot parcel delivery attempt miss zala hota. Udya sandhyakali pathvu ka?' },
      { speaker: 'Customer', text: 'Ho, udya 4 nantar pathva.' },
    ],
  },
  {
    id: 'CALL-88416',
    sellerName: 'PeakGear Mobility',
    orderId: '#PG-55391',
    customerName: 'Arjun Verma',
    customerPhone: '+91 98491 44019',
    language: 'Hinglish',
    provider: 'Twilio India',
    status: 'Unanswered',
    outcome: 'No Answer · WhatsApp Fallback Queued',
    duration: '00:28',
    latencyMs: 390,
    costInr: 0.45,
    timestamp: '14 mins ago',
    transcript: [
      { speaker: 'AI', text: 'Ring timeout after 28 seconds. Auto-dispatched WhatsApp COD confirmation template.' },
    ],
  },
];

export const INITIAL_WA_SELLER_USAGE: AdminWhatsAppSellerUsage[] = [
  { sellerId: 'SLR-1002', businessName: 'Vastra House Ethnic', plan: 'Enterprise', sent: 182400, delivered: 177475, read: 138430, failed: 4925, utilityShare: 64, marketingShare: 36, creditsUsedInr: 86420 },
  { sellerId: 'SLR-1003', businessName: 'Kora Audio Labs', plan: 'Enterprise', sent: 141200, delivered: 137810, read: 108900, failed: 3390, utilityShare: 72, marketingShare: 28, creditsUsedInr: 62180 },
  { sellerId: 'SLR-1008', businessName: 'ZestHome Appliances', plan: 'Enterprise', sent: 119800, delivered: 116206, read: 88310, failed: 3594, utilityShare: 78, marketingShare: 22, creditsUsedInr: 51940 },
  { sellerId: 'SLR-1010', businessName: 'PeakGear Mobility', plan: 'Pro Plan', sent: 41300, delivered: 39978, read: 31180, failed: 1322, utilityShare: 68, marketingShare: 32, creditsUsedInr: 18420 },
  { sellerId: 'SLR-1001', businessName: 'Aman Store', plan: 'Pro Plan', sent: 38900, delivered: 37733, read: 28680, failed: 1167, utilityShare: 74, marketingShare: 26, creditsUsedInr: 16910 },
  { sellerId: 'SLR-1004', businessName: 'AyurRoot Botanicals', plan: 'Pro Plan', sent: 32500, delivered: 31460, read: 24530, failed: 1040, utilityShare: 59, marketingShare: 41, creditsUsedInr: 15890 },
];

export const INITIAL_WA_TEMPLATE_QUEUE: AdminWhatsAppTemplateQueueItem[] = [
  {
    id: 'TPL-401',
    sellerName: 'Vastra House Ethnic',
    templateName: 'festive_cod_to_prepaid_10off',
    category: 'Marketing',
    language: 'en_IN',
    bodyPreview: 'Hi {{1}}, switch your COD order {{2}} to instant UPI payment & unlock flat 10% off before dispatch.',
    submittedAt: '18 mins ago',
    status: 'Pending Review',
  },
  {
    id: 'TPL-402',
    sellerName: 'Malabar Roast Co.',
    templateName: 'order_out_for_delivery_alert',
    category: 'Utility',
    language: 'en_IN',
    bodyPreview: 'Fresh coffee alert! Your order {{1}} is out for delivery with {{2}}. Share OTP {{3}} at doorstep.',
    submittedAt: '44 mins ago',
    status: 'Pending Review',
  },
  {
    id: 'TPL-403',
    sellerName: 'Niva Skincare India',
    templateName: 'ndr_address_reconfirm_hi',
    category: 'Utility',
    language: 'hi_IN',
    bodyPreview: 'Namaste {{1}}, aapka Niva Skincare order {{2}} delivery ke liye address confirm karein.',
    submittedAt: '2 hours ago',
    status: 'Pending Review',
  },
  {
    id: 'TPL-404',
    sellerName: 'Kora Audio Labs',
    templateName: 'warranty_registration_otp',
    category: 'Authentication',
    language: 'en_IN',
    bodyPreview: 'Use verification code {{1}} to activate your 12-month Kora Audio warranty. Valid for 10 mins.',
    submittedAt: 'Yesterday',
    status: 'Approved',
  },
];

export const INITIAL_ADMIN_TICKETS: AdminSupportTicket[] = [
  {
    id: 'TKT-3081',
    sellerName: 'ZestHome Appliances',
    sellerEmail: 'ananya@zesthome.in',
    subject: 'Elevated SIP timeout errors on Tamil AI voice route',
    category: 'AI Calling',
    priority: 'Critical',
    status: 'Open',
    assignedTo: 'Raghav Iyer',
    slaRemaining: '24m left',
    createdAt: '32 mins ago',
    messages: [
      {
        sender: 'Ananya Chatterjee',
        role: 'Seller',
        timestamp: '32 mins ago',
        text: 'We are seeing ~9% call failures on our Chennai and Coimbatore COD orders over the past hour with Knowlarity South-IN trunk.',
      },
      {
        sender: 'Raghav Iyer',
        role: 'Admin',
        timestamp: '14 mins ago',
        text: 'Investigating carrier latency spikes on South-IN trunk. Preparing automatic failover to Exotel backup SIP pool.',
      },
    ],
  },
  {
    id: 'TKT-3080',
    sellerName: 'UrbanFit Essentials',
    sellerEmail: 'karan@urbanfit.shop',
    subject: 'Account suspended after card decline — need manual retry link',
    category: 'Billing & GST',
    priority: 'High',
    status: 'In Progress',
    assignedTo: 'Meenakshi Rao',
    slaRemaining: '1h 18m left',
    createdAt: '2 hours ago',
    messages: [
      {
        sender: 'Karan Bedi',
        role: 'Seller',
        timestamp: '2 hours ago',
        text: 'Our corporate Axis card hit its monthly e-commerce limit. We have increased the limit — can you re-trigger invoice SUB-9045 and reactivate our AI calls?',
      },
    ],
  },
  {
    id: 'TKT-3079',
    sellerName: 'Vastra House Ethnic',
    sellerEmail: 'meera@vastrahouse.in',
    subject: 'Requesting WhatsApp Tier-3 daily messaging limit upgrade (100K/day)',
    category: 'WhatsApp API',
    priority: 'Medium',
    status: 'Waiting on Seller',
    assignedTo: 'Aarav Kulkarni',
    slaRemaining: '4h 05m left',
    createdAt: '5 hours ago',
    messages: [
      {
        sender: 'Meera Nair',
        role: 'Seller',
        timestamp: '5 hours ago',
        text: 'Our wedding season sale begins Friday and we need Meta messaging limit raised from 50K to 100K conversations/day.',
      },
      {
        sender: 'Aarav Kulkarni',
        role: 'Admin',
        timestamp: '3 hours ago',
        text: 'Quality rating is High (Green). Please confirm Business Manager ID verification screenshot so we can submit the tier upgrade.',
      },
    ],
  },
  {
    id: 'TKT-3078',
    sellerName: 'Aman Store',
    sellerEmail: 'aman.kumar@octxai.com',
    subject: 'BlueDart webhook delay on NCR pincodes',
    category: 'Courier Sync',
    priority: 'Medium',
    status: 'Resolved',
    assignedTo: 'Raghav Iyer',
    slaRemaining: 'Met SLA',
    createdAt: 'Yesterday',
    messages: [
      {
        sender: 'Aman Kumar',
        role: 'Seller',
        timestamp: 'Yesterday, 4:10 PM',
        text: 'Out-for-delivery scans for 18 NCR shipments lagged by ~40 minutes.',
      },
      {
        sender: 'Raghav Iyer',
        role: 'Admin',
        timestamp: 'Yesterday, 4:45 PM',
        text: 'Refreshed BlueDart polling token and replayed missed webhook events. All 18 shipments are now synced.',
      },
    ],
  },
  {
    id: 'TKT-3077',
    sellerName: 'Niva Skincare India',
    sellerEmail: 'priyanka@nivaskincare.in',
    subject: 'GSTIN verification pending for Starter onboarding',
    category: 'Account Access',
    priority: 'Low',
    status: 'Open',
    assignedTo: 'Meenakshi Rao',
    slaRemaining: '6h 40m left',
    createdAt: 'Yesterday',
    messages: [
      {
        sender: 'Priyanka Joshi',
        role: 'Seller',
        timestamp: 'Yesterday, 6:15 PM',
        text: 'Uploaded GST certificate 24AABCN8127G1Z3. Kindly approve our seller KYC so we can enable live COD verification calls.',
      },
    ],
  },
];

export const INITIAL_ADMIN_LOGS: AdminSystemLog[] = [
  {
    id: 'LOG-7021',
    timestamp: '2026-11-19 20:21:14',
    severity: 'Error',
    service: 'AI Voice Router',
    actor: 'sip-pool-south-02',
    event: 'TRUNK_TIMEOUT_503',
    message: 'Knowlarity South-IN trunk exceeded 1200ms handshake SLA for ZestHome Appliances (#ZH-21804).',
    ipAddress: '10.42.8.114',
    payload: { callId: 'CALL-88418', sellerId: 'SLR-1008', provider: 'Knowlarity', latencyMs: 1420, failoverReady: true },
  },
  {
    id: 'LOG-7020',
    timestamp: '2026-11-19 20:18:49',
    severity: 'Info',
    service: 'Billing Engine',
    actor: 'razorpay-webhook',
    event: 'SUBSCRIPTION_RENEWED',
    message: 'Annual Enterprise renewal ₹2,39,990 settled for Vastra House Ethnic (SUB-9041).',
    ipAddress: '52.66.191.44',
    payload: { subscriptionId: 'SUB-9041', amountInr: 239990, status: 'captured', gstInvoice: 'INV-2026-8812' },
  },
  {
    id: 'LOG-7019',
    timestamp: '2026-11-19 20:11:03',
    severity: 'Security',
    service: 'Auth & OTP',
    actor: 'ops@octxai.com',
    event: 'ADMIN_OTP_VERIFIED',
    message: '2FA OTP verified via SMS channel for Operations Admin session.',
    ipAddress: '49.37.210.88',
    payload: { channel: 'sms', mfaPassed: true, sessionTtlHours: 8 },
  },
  {
    id: 'LOG-7018',
    timestamp: '2026-11-19 19:56:22',
    severity: 'Warning',
    service: 'Billing Engine',
    actor: 'dunning-worker',
    event: 'PAYMENT_RETRY_FAILED',
    message: 'Auto-debit retry #2 failed for UrbanFit Essentials (SUB-9045). Account flagged Past Due.',
    ipAddress: '10.42.4.19',
    payload: { sellerId: 'SLR-1006', subscriptionId: 'SUB-9045', declineCode: 'CARD_LIMIT_EXCEEDED', attempt: 2 },
  },
  {
    id: 'LOG-7017',
    timestamp: '2026-11-19 19:42:10',
    severity: 'Info',
    service: 'WhatsApp Gateway',
    actor: 'meta-cloud-sync',
    event: 'TEMPLATE_SUBMITTED',
    message: 'New marketing template festive_cod_to_prepaid_10off queued for admin moderation.',
    ipAddress: '10.42.9.61',
    payload: { templateId: 'TPL-401', sellerId: 'SLR-1002', category: 'Marketing' },
  },
  {
    id: 'LOG-7016',
    timestamp: '2026-11-19 19:15:38',
    severity: 'Info',
    service: 'Webhook Worker',
    actor: 'bluedart-poller',
    event: 'WEBHOOK_REPLAY_COMPLETE',
    message: 'Replayed 18 delayed tracking scans for Aman Store across NCR hubs.',
    ipAddress: '10.42.6.203',
    payload: { sellerId: 'SLR-1001', replayedEvents: 18, courier: 'BlueDart' },
  },
  {
    id: 'LOG-7015',
    timestamp: '2026-11-19 18:40:02',
    severity: 'Security',
    service: 'Admin Audit',
    actor: 'admin@octxai.com',
    event: 'RATE_LIMIT_UPDATED',
    message: 'Increased concurrent AI voice channel cap for Enterprise tier to 120 simultaneous calls.',
    ipAddress: '103.21.58.14',
    payload: { tier: 'Enterprise', previousCap: 80, nextCap: 120 },
  },
];

export const INITIAL_ADMIN_EXPORTS: AdminExportRecord[] = [
  {
    id: 'EXP-204',
    reportName: 'Monthly Recurring Revenue & GST Ledger',
    format: 'CSV',
    dateRange: 'Last 30 Days',
    generatedBy: 'Vikram Sethi',
    generatedAt: 'Today, 06:30 PM',
    rowCount: 10482,
  },
  {
    id: 'EXP-203',
    reportName: 'AI Voice Telephony Cost & Answer Rate Audit',
    format: 'CSV',
    dateRange: 'Last 7 Days',
    generatedBy: 'Raghav Iyer',
    generatedAt: 'Yesterday, 09:15 PM',
    rowCount: 184210,
  },
  {
    id: 'EXP-202',
    reportName: 'Seller Cohort Retention & Churn Breakdown',
    format: 'JSON',
    dateRange: 'Last 90 Days',
    generatedBy: 'Vikram Sethi',
    generatedAt: '16 Nov 2026',
    rowCount: 5143,
  },
];
