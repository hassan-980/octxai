import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Layers,
  Lock,
  Mail,
  MessageCircle,
  MessageSquare,
  Phone,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Store,
  User,
} from 'lucide-react';

export interface AuthUserPayload {
  fullName: string;
  email: string;
  businessName: string;
  phone: string;
}

interface AuthViewProps {
  mode: 'login' | 'signup';
  onSwitchRoute: (path: '/' | '/login' | '/signup' | '/dashboard' | '/admin') => void;
  onAuthSuccess: (user: AuthUserPayload, message: string) => void;
}

const DEMO_ACCOUNTS = [
  {
    email: 'aman.kumar@octxai.com',
    password: 'password123',
    fullName: 'Aman Kumar',
    businessName: 'Aman Store',
    phone: '+91 98765 43210',
  },
  {
    email: 'demo@octxai.com',
    password: 'password123',
    fullName: 'Aman Kumar',
    businessName: 'Aman Store',
    phone: '+91 98765 43210',
  },
  {
    email: 'aman.kumar@sellersaathi.com',
    password: 'password123',
    fullName: 'Aman Kumar',
    businessName: 'Aman Store',
    phone: '+91 98765 43210',
  },
];

const REGISTERED_USERS_KEY = 'octxai_registered_users';

interface StoredUser extends AuthUserPayload {
  password: string;
  verifiedChannel?: 'sms' | 'whatsapp';
}

function getRegisteredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    return [];
  }
}

function saveRegisteredUser(user: StoredUser) {
  try {
    const existing = getRegisteredUsers().filter(
      (u) => u.email.toLowerCase() !== user.email.toLowerCase()
    );
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify([user, ...existing]));
  } catch {
    // ignore storage errors
  }
}

function generateSixDigitOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export const AuthView: React.FC<AuthViewProps> = ({ mode, onSwitchRoute, onAuthSuccess }) => {
  const isLogin = mode === 'login';

  // Login form state
  const [loginEmail, setLoginEmail] = useState('aman.kumar@octxai.com');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [showLoginPwd, setShowLoginPwd] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Signup form state
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPwd, setShowSignupPwd] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(true);

  // Signup OTP verification state (SMS primary + WhatsApp fallback)
  const [signupStep, setSignupStep] = useState<'details' | 'otp'>('details');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState<string>('482910');
  const [otpChannel, setOtpChannel] = useState<'sms' | 'whatsapp'>('sms');
  const [smsFailed, setSmsFailed] = useState<boolean>(false);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [resendTimer, setResendTimer] = useState<number>(30);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [error, setError] = useState<string | null>(null);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (isLogin || signupStep !== 'otp' || resendTimer <= 0) return;
    const id = window.setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [isLogin, signupStep, resendTimer]);

  // Reset signup step when switching to login
  useEffect(() => {
    if (isLogin) {
      setSignupStep('details');
      setOtpDigits(['', '', '', '', '', '']);
      setSmsFailed(false);
      setOtpChannel('sms');
    }
  }, [isLogin]);

  const handleFillDemo = () => {
    setError(null);
    if (isLogin) {
      setLoginEmail('aman.kumar@octxai.com');
      setLoginPassword('password123');
    } else {
      setFullName('Priya Sharma');
      setBusinessName('Aura D2C Store');
      setSignupEmail('priya@aurad2c.in');
      setPhone('+91 98201 55443');
      setSignupPassword('password123');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const emailClean = loginEmail.trim().toLowerCase();
    const allUsers = [...DEMO_ACCOUNTS, ...getRegisteredUsers()];
    const matched = allUsers.find(
      (u) => u.email.toLowerCase() === emailClean && u.password === loginPassword
    );

    if (!matched) {
      setError('Invalid email or password. Try aman.kumar@octxai.com / password123.');
      return;
    }

    onAuthSuccess(
      {
        fullName: matched.fullName,
        email: matched.email,
        businessName: matched.businessName,
        phone: matched.phone,
      },
      `Welcome back, ${matched.fullName}!`
    );
  };

  const dispatchOtp = (channel: 'sms' | 'whatsapp', markSmsFailed = false) => {
    setError(null);
    setIsSendingOtp(true);
    const nextCode = generateSixDigitOtp();

    window.setTimeout(() => {
      setGeneratedOtp(nextCode);
      setOtpChannel(channel);
      setSmsFailed(markSmsFailed);
      setOtpDigits(['', '', '', '', '', '']);
      setResendTimer(30);
      setIsSendingOtp(false);
      setSignupStep('otp');
      window.setTimeout(() => otpInputRefs.current[0]?.focus(), 50);
    }, 350);
  };

  const handleSignupDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      setError('Please enter a valid 10-digit mobile number for OTP verification.');
      return;
    }
    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (!acceptedTerms) {
      setError('Please accept the Terms of Service to continue.');
      return;
    }

    // If phone ends in 0000, simulate carrier SMS failure and fall back automatically to WhatsApp OTP
    if (digitsOnly.endsWith('0000')) {
      dispatchOtp('whatsapp', true);
    } else {
      dispatchOtp('sms', false);
    }
  };

  const handleTriggerWhatsAppFallback = (fromFailureSimulation = false) => {
    setError(null);
    setIsSendingOtp(true);
    const fallbackCode = generateSixDigitOtp();

    window.setTimeout(() => {
      setGeneratedOtp(fallbackCode);
      setOtpChannel('whatsapp');
      setSmsFailed(true);
      setOtpDigits(['', '', '', '', '', '']);
      setResendTimer(30);
      setIsSendingOtp(false);
      if (!fromFailureSimulation) {
        setError(null);
      }
      window.setTimeout(() => otpInputRefs.current[0]?.focus(), 50);
    }, 350);
  };

  const handleOtpDigitChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, '');
    if (!clean) {
      setOtpDigits((prev) => {
        const next = [...prev];
        next[index] = '';
        return next;
      });
      return;
    }

    // Support paste of full 6-digit code
    if (clean.length > 1) {
      const sliced = clean.slice(0, 6).split('');
      const next = ['', '', '', '', '', ''];
      sliced.forEach((ch, idx) => {
        next[idx] = ch;
      });
      setOtpDigits(next);
      const focusIdx = Math.min(sliced.length, 5);
      otpInputRefs.current[focusIdx]?.focus();
      return;
    }

    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = clean;
      return next;
    });
    if (index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleAutoFillOtp = () => {
    setError(null);
    setOtpDigits(generatedOtp.split(''));
  };

  const handleVerifyOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const entered = otpDigits.join('');
    if (entered.length < 6) {
      setError('Please enter all 6 digits of your verification OTP.');
      return;
    }

    if (entered !== generatedOtp) {
      setError(
        otpChannel === 'sms'
          ? 'Incorrect SMS OTP. Check the code or switch to WhatsApp fallback OTP below.'
          : 'Incorrect WhatsApp OTP. Please check the 6-digit code and try again.'
      );
      return;
    }

    const newUser: StoredUser = {
      fullName: fullName.trim() || 'Aman Kumar',
      businessName: businessName.trim() || 'Aman Store',
      email: signupEmail.trim(),
      phone: phone.trim() || '+91 98765 43210',
      password: signupPassword,
      verifiedChannel: otpChannel,
    };

    saveRegisteredUser(newUser);
    onAuthSuccess(
      {
        fullName: newUser.fullName,
        email: newUser.email,
        businessName: newUser.businessName,
        phone: newUser.phone,
      },
      `Phone verified via ${otpChannel === 'whatsapp' ? 'WhatsApp' : 'SMS'}! Account created for ${newUser.businessName}.`
    );
  };

  return (
    <div className="min-h-screen bg-[#EEF1FA] flex flex-col relative isolate overflow-hidden">
      {/* Blurred Periwinkle Gradient Background Layer matching Landing Page */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[920px] h-[520px] rounded-full bg-gradient-to-tr from-[#8EA2FF]/45 via-[#A5B4FC]/40 to-[#C7D2FE]/50 blur-[120px]" />
        <div className="absolute top-[28%] -left-36 w-[620px] h-[520px] rounded-full bg-[#9BA9FF]/35 blur-[130px]" />
        <div className="absolute top-[42%] -right-36 w-[640px] h-[560px] rounded-full bg-[#818CF8]/30 blur-[140px]" />
      </div>

      {/* Minimal Top Bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        <button
          onClick={() => onSwitchRoute('/')}
          className="flex items-center gap-2.5 text-left group"
        >
          <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white shadow-sm">
            <Layers className="w-4 h-4" />
          </div>
          <span className="font-display font-semibold text-[17px] tracking-tight text-slate-900">octxAI</span>
        </button>

        <button
          onClick={() => onSwitchRoute('/')}
          className="px-3.5 py-2 rounded-xl bg-white/80 hover:bg-white text-[13px] font-medium text-slate-700 shadow-aisle flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>
      </header>

      {/* Centered Auth Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-[24px] p-7 sm:p-8 shadow-aisle-frame border border-slate-100">
          {/* Segmented Mode Switcher (/login <-> /signup) */}
          <div className="bg-[#F2F4F8] p-1 rounded-xl grid grid-cols-2 text-[13px] font-medium mb-6">
            <button
              type="button"
              onClick={() => {
                setError(null);
                onSwitchRoute('/login');
              }}
              className={`py-2 rounded-lg transition ${
                isLogin ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                onSwitchRoute('/signup');
              }}
              className={`py-2 rounded-lg transition ${
                !isLogin ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Create account
            </button>
          </div>

          <div className="mb-5">
            {!isLogin && (
              <div className="flex items-center justify-between text-[11.5px] font-medium text-[#2563EB] mb-1.5">
                <span>{signupStep === 'details' ? 'Step 1 of 2 · Seller Details' : 'Step 2 of 2 · Phone OTP Verification'}</span>
                {signupStep === 'otp' && (
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setSignupStep('details');
                    }}
                    className="text-slate-500 hover:text-slate-900 flex items-center gap-1 transition"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Edit details</span>
                  </button>
                )}
              </div>
            )}
            <h1 className="font-display text-[22px] font-semibold text-slate-900 tracking-tight">
              {isLogin
                ? 'Welcome back to octxAI'
                : signupStep === 'details'
                  ? 'Start your 14-day free trial'
                  : 'Verify your mobile number'}
            </h1>
            <p className="text-[13px] text-slate-500 mt-1">
              {isLogin
                ? 'Sign in to manage AI calls, WhatsApp flows & live courier tracking.'
                : signupStep === 'details'
                  ? 'Set up your seller workspace with SMS & WhatsApp OTP security.'
                  : otpChannel === 'sms'
                    ? `We sent a 6-digit SMS verification code to ${phone}.`
                    : `SMS failed — we sent a fallback 6-digit OTP via WhatsApp to ${phone}.`}
            </p>
          </div>

          {/* Demo Helper Banner (Login / Signup Step 1 / Signup Step 2 OTP) */}
          {isLogin || signupStep === 'details' ? (
            <div className="mb-5 p-3.5 rounded-xl bg-[#EFF6FF]/80 border border-blue-100 flex items-start justify-between gap-3">
              <div className="text-[12px] text-slate-700 leading-relaxed">
                <div className="font-semibold text-[#2563EB] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isLogin ? 'Demo Login Credentials' : 'Quick Demo Fill'}</span>
                </div>
                {isLogin ? (
                  <div className="mt-1 font-mono text-[11.5px] text-slate-600">
                    <div>Email: aman.kumar@octxai.com</div>
                    <div>Pass: password123</div>
                  </div>
                ) : (
                  <div className="mt-0.5 text-slate-600">
                    Auto-fill sample details (tip: phone ending in <span className="font-mono font-semibold">0000</span> simulates SMS fail).
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleFillDemo}
                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#2563EB] text-[#2563EB] hover:text-white text-[11.5px] font-semibold shadow-2xs transition shrink-0"
              >
                {isLogin ? 'Fill Demo' : 'Auto-fill'}
              </button>
            </div>
          ) : (
            <div className="mb-5 space-y-2.5">
              {/* Delivery Status Card */}
              {smsFailed ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 space-y-2">
                  <div className="flex items-center gap-2 text-[12px] text-rose-700 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>SMS OTP delivery failed (Carrier timeout / DND block)</span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-emerald-800 font-medium pt-1 border-t border-emerald-200/70">
                    <MessageCircle className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                    <span>WhatsApp Fallback OTP delivered to {phone}</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-blue-100 bg-[#EFF6FF]/70 p-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[12px] text-slate-700 font-medium">
                    <MessageSquare className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                    <span>SMS OTP sent to {phone}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Delivered
                  </span>
                </div>
              )}

              {/* Demo OTP Code Preview & Failure Simulator */}
              <div className="p-3 rounded-xl bg-[#F2F4F8] flex flex-wrap items-center justify-between gap-2">
                <div className="text-[12px] text-slate-700">
                  <span className="text-slate-500">
                    {otpChannel === 'sms' ? 'Demo SMS OTP: ' : 'WhatsApp OTP: '}
                  </span>
                  <span className="font-mono font-semibold text-slate-900 tracking-wider">{generatedOtp}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {otpChannel === 'sms' && (
                    <button
                      type="button"
                      disabled={isSendingOtp}
                      onClick={() => handleTriggerWhatsAppFallback(true)}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-semibold transition disabled:opacity-50"
                    >
                      Simulate SMS Fail
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleAutoFillOtp}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#2563EB] text-[#2563EB] hover:text-white text-[11px] font-semibold shadow-2xs transition"
                  >
                    Auto-fill OTP
                  </button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-rose-50 text-rose-700 text-[12.5px] font-medium">
              {error}
            </div>
          )}

          {isLogin ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-[13.5px]">
              <div>
                <label className="block text-slate-600 text-[12px] font-medium mb-1.5">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="aman.kumar@octxai.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#F2F4F8] text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-600 text-[12px] font-medium">Password</label>
                  <button
                    type="button"
                    onClick={handleFillDemo}
                    className="text-[11.5px] text-[#2563EB] font-medium hover:underline"
                  >
                    Use demo password
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showLoginPwd ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#F2F4F8] text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPwd(!showLoginPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showLoginPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[12.5px]">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#2563EB]"
                  />
                  <span>Keep me signed in</span>
                </label>
                <span className="text-slate-400 text-[12px]">Demo auth enabled</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-[14px] shadow-sm transition flex items-center justify-center gap-2"
              >
                <span>Sign in to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : signupStep === 'details' ? (
            <form onSubmit={handleSignupDetailsSubmit} className="space-y-3.5 text-[13.5px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 text-[12px] font-medium mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Aman Kumar"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#F2F4F8] text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-600 text-[12px] font-medium mb-1">Store Name</label>
                  <div className="relative">
                    <Store className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Aman Store"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#F2F4F8] text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 text-[12px] font-medium mb-1">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="seller@yourstore.in"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#F2F4F8] text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-600 text-[12px] font-medium">Mobile / WhatsApp Number</label>
                  <span className="text-[11px] text-slate-400">SMS OTP + WhatsApp fallback</span>
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#F2F4F8] text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 text-[12px] font-medium mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showSignupPwd ? 'text' : 'password'}
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#F2F4F8] text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPwd(!showSignupPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showSignupPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 text-[12.5px] text-slate-600 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#2563EB]"
                />
                <span>I agree to the Terms of Service &amp; Privacy Policy</span>
              </label>

              <button
                type="submit"
                disabled={isSendingOtp}
                className="w-full py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-[14px] shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <span>{isSendingOtp ? 'Sending SMS OTP...' : 'Continue & Send SMS OTP'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtpSubmit} className="space-y-4 text-[13.5px]">
              <div>
                <label className="block text-slate-600 text-[12px] font-medium mb-2">
                  Enter 6-digit {otpChannel === 'sms' ? 'SMS' : 'WhatsApp'} OTP
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      aria-label={`OTP digit ${idx + 1}`}
                      className="h-12 w-full text-center font-display font-semibold text-lg rounded-xl bg-[#F2F4F8] text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none transition"
                    />
                  ))}
                </div>
              </div>

              {/* Resend & WhatsApp Fallback Action Bar */}
              <div className="flex flex-col gap-2.5 pt-1">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-slate-500">
                    {resendTimer > 0
                      ? `Resend available in ${resendTimer}s`
                      : "Didn't receive the code?"}
                  </span>
                  <button
                    type="button"
                    disabled={resendTimer > 0 || isSendingOtp}
                    onClick={() => dispatchOtp(otpChannel, smsFailed)}
                    className="font-medium text-[#2563EB] hover:underline disabled:text-slate-400 disabled:no-underline flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSendingOtp ? 'animate-spin' : ''}`} />
                    <span>Resend {otpChannel === 'sms' ? 'SMS' : 'WhatsApp'} OTP</span>
                  </button>
                </div>

                {otpChannel === 'sms' ? (
                  <button
                    type="button"
                    disabled={isSendingOtp}
                    onClick={() => handleTriggerWhatsAppFallback(false)}
                    className="w-full py-2.5 px-3 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50 text-emerald-800 text-[12.5px] font-medium transition flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>
                      {isSendingOtp
                        ? 'Switching to WhatsApp OTP...'
                        : 'SMS not arriving? Send fallback OTP on WhatsApp'}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSendingOtp}
                    onClick={() => dispatchOtp('sms', false)}
                    className="w-full py-2 px-3 rounded-xl bg-[#F2F4F8] hover:bg-slate-200/70 text-slate-600 text-[12px] font-medium transition flex items-center justify-center gap-1.5 disabled:opacity-60"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Retry verification via SMS instead</span>
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isSendingOtp}
                className="w-full py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-[14px] shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify OTP &amp; Create Account</span>
              </button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[12px] text-slate-400">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 14-day free trial</span>
            <span aria-hidden="true">·</span>
            <span>No credit card required</span>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => onSwitchRoute('/admin')}
              className="text-slate-500 hover:text-slate-900 font-medium transition-colors"
            >
              Admin login
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
