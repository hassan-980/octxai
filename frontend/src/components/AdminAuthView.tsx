import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Layers,
  Lock,
  Mail,
  MessageCircle,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { AdminUserPayload } from '../data/adminData';

interface AdminAuthViewProps {
  onBackHome: () => void;
  onAdminAuthSuccess: (admin: AdminUserPayload) => void;
}

const DEMO_ADMINS = [
  {
    id: 'ADM-01',
    email: 'admin@octxai.com',
    password: 'Admin@1234',
    fullName: 'Vikram Sethi',
    role: 'Super Admin' as const,
    phone: '+91 98110 44218',
  },
  {
    id: 'ADM-02',
    email: 'ops@octxai.com',
    password: 'Admin@1234',
    fullName: 'Meenakshi Rao',
    role: 'Operations Admin' as const,
    phone: '+91 98204 71902',
  },
];

function generateSixDigitOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function maskPhone(phone: string): string {
  const cleaned = phone.trim();
  if (cleaned.length < 6) return cleaned;
  return `${cleaned.slice(0, 7)} •••${cleaned.slice(-2)}`;
}

export const AdminAuthView: React.FC<AdminAuthViewProps> = ({
  onBackHome,
  onAdminAuthSuccess,
}) => {
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [email, setEmail] = useState('admin@octxai.com');
  const [password, setPassword] = useState('Admin@1234');
  const [showPassword, setShowPassword] = useState(false);
  const [matchedAdmin, setMatchedAdmin] = useState<(typeof DEMO_ADMINS)[number] | null>(null);

  // OTP state (SMS primary + WhatsApp fallback)
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState<string>('739204');
  const [otpChannel, setOtpChannel] = useState<'sms' | 'whatsapp'>('sms');
  const [smsFailed, setSmsFailed] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (step !== 'otp' || resendTimer <= 0) return;
    const id = window.setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [step, resendTimer]);

  const dispatchAdminOtp = (channel: 'sms' | 'whatsapp', simulateFail = false) => {
    setError(null);
    setIsSendingOtp(true);
    setOtpDigits(['', '', '', '', '', '']);
    const nextCode = generateSixDigitOtp();

    window.setTimeout(() => {
      setGeneratedOtp(nextCode);
      if (channel === 'sms' && simulateFail) {
        setSmsFailed(true);
        setOtpChannel('whatsapp');
      } else {
        setSmsFailed(false);
        setOtpChannel(channel);
      }
      setResendTimer(30);
      setIsSendingOtp(false);
      window.setTimeout(() => otpRefs.current[0]?.focus(), 50);
    }, 350);
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();
    const found = DEMO_ADMINS.find(
      (a) => a.email.toLowerCase() === normalizedEmail && a.password === password
    );

    if (!found) {
      setError('Invalid admin credentials. Use admin@octxai.com / Admin@1234.');
      return;
    }

    setMatchedAdmin(found);
    setStep('otp');
    dispatchAdminOtp('sms', false);
  };

  const handleOtpChange = (index: number, raw: string) => {
    const cleaned = raw.replace(/\D/g, '');
    if (!cleaned) {
      const next = [...otpDigits];
      next[index] = '';
      setOtpDigits(next);
      return;
    }
    if (cleaned.length > 1) {
      const pasted = cleaned.slice(0, 6).split('');
      const next = ['', '', '', '', '', ''];
      pasted.forEach((char, idx) => {
        next[idx] = char;
      });
      setOtpDigits(next);
      otpRefs.current[Math.min(pasted.length, 5)]?.focus();
      return;
    }
    const next = [...otpDigits];
    next[index] = cleaned;
    setOtpDigits(next);
    if (index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const entered = otpDigits.join('');
    if (entered.length < 6) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }
    if (entered !== generatedOtp) {
      setError('Incorrect OTP code. Check the verification code shown above or resend.');
      return;
    }
    if (!matchedAdmin) {
      setStep('credentials');
      return;
    }

    onAdminAuthSuccess({
      id: matchedAdmin.id,
      fullName: matchedAdmin.fullName,
      email: matchedAdmin.email,
      role: matchedAdmin.role,
      phone: matchedAdmin.phone,
      verifiedChannel: otpChannel,
      loginAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    });
  };

  return (
    <div className="min-h-screen bg-[#F2F4F8] flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-20 bg-[#F2F4F8]/90 backdrop-blur-md border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBackHome}
            className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-display font-semibold text-[17px] tracking-tight text-slate-900">
              octxAI Admin
            </span>
          </button>

          <button
            type="button"
            onClick={onBackHome}
            className="text-[13px] font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to website</span>
          </button>
        </div>
      </header>

      {/* Main Auth Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-[440px] bg-white rounded-2xl p-6 sm:p-8 shadow-aisle border border-slate-200/70">
          {/* Step Progress Indicator */}
          <div className="flex items-center justify-between text-[12px] font-medium text-slate-500 mb-6 pb-4 border-b border-slate-100">
            <span className={step === 'credentials' ? 'text-slate-900 font-semibold' : 'text-emerald-700'}>
              01. Admin Credentials
            </span>
            <span aria-hidden="true" className="text-slate-300">/</span>
            <span className={step === 'otp' ? 'text-[#2563EB] font-semibold' : 'text-slate-400'}>
              02. 2FA OTP Verification
            </span>
          </div>

          {step === 'credentials' ? (
            <>
              <div className="mb-6">
                <h1 className="font-display text-[24px] font-semibold text-slate-900 tracking-tight">
                  Sign in to Admin Console
                </h1>
                <p className="mt-1.5 text-[13.5px] text-slate-500 leading-relaxed">
                  Platform operations access requires valid admin credentials followed by a 6-digit OTP check.
                </p>
              </div>

              {/* Demo Credentials Helper */}
              <div className="mb-5 p-3.5 rounded-xl bg-[#F2F4F8] text-[12.5px] text-slate-600">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-800">Demo Admin Access</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('admin@octxai.com');
                      setPassword('Admin@1234');
                      setError(null);
                    }}
                    className="text-[#2563EB] hover:underline font-medium whitespace-nowrap"
                  >
                    Fill Super Admin
                  </button>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-slate-500 font-mono">
                  <span>admin@octxai.com</span>
                  <span aria-hidden="true">·</span>
                  <span>Admin@1234</span>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-[12.5px] flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div>
                  <label htmlFor="admin-email" className="block text-[12.5px] font-medium text-slate-700 mb-1.5">
                    Admin email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="admin-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@octxai.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#F2F4F8] text-[13.5px] text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="admin-password" className="block text-[12.5px] font-medium text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="admin-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter admin password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#F2F4F8] text-[13.5px] text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[13.5px] font-medium transition flex items-center justify-center gap-2"
                >
                  <span>Continue to OTP Verification</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setStep('credentials');
                    setError(null);
                  }}
                  className="text-[12.5px] font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-3 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change admin account</span>
                </button>
                <h1 className="font-display text-[22px] font-semibold text-slate-900 tracking-tight">
                  Verify Admin OTP
                </h1>
                <p className="mt-1 text-[13px] text-slate-500">
                  Enter the 6-digit code sent via{' '}
                  <strong className="text-slate-800">
                    {otpChannel === 'sms' ? 'SMS' : 'WhatsApp Fallback'}
                  </strong>{' '}
                  to{' '}
                  <span className="font-mono text-slate-800">
                    {maskPhone(matchedAdmin?.phone ?? '+91 98110 44218')}
                  </span>
                  .
                </p>
              </div>

              {smsFailed && (
                <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-[12px] flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <span>
                    SMS carrier timeout detected. Verification code automatically delivered via WhatsApp fallback.
                  </span>
                </div>
              )}

              {/* Demo OTP Display Helper */}
              <div className="mb-5 p-3.5 rounded-xl bg-[#EFF6FF] border border-blue-200/70 text-[12.5px] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <KeyRound className="w-4 h-4 text-[#2563EB] shrink-0" />
                  <div className="truncate">
                    <span className="text-slate-600">Demo {otpChannel === 'sms' ? 'SMS' : 'WhatsApp'} OTP: </span>
                    <strong className="font-mono text-[14px] text-slate-900 tracking-wider tabular-nums">
                      {isSendingOtp ? '••••••' : generatedOtp}
                    </strong>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={isSendingOtp}
                  onClick={() => {
                    setOtpDigits(generatedOtp.split(''));
                    setError(null);
                  }}
                  className="text-[12px] font-semibold text-[#2563EB] hover:underline whitespace-nowrap shrink-0 disabled:opacity-50"
                >
                  Auto-fill
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-[12.5px] flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="grid grid-cols-6 gap-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      aria-label={`Admin OTP digit ${idx + 1}`}
                      className="h-12 w-full text-center font-mono font-semibold text-[18px] tabular-nums rounded-xl bg-[#F2F4F8] text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none transition"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-[12px] pt-1">
                  <span className="text-slate-500 tabular-nums">
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Didn't receive the code?"}
                  </span>
                  <button
                    type="button"
                    disabled={resendTimer > 0 || isSendingOtp}
                    onClick={() => dispatchAdminOtp(otpChannel, false)}
                    className="font-medium text-[#2563EB] hover:underline disabled:text-slate-400 disabled:no-underline flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSendingOtp ? 'animate-spin' : ''}`} />
                    <span>Resend OTP</span>
                  </button>
                </div>

                {otpChannel === 'sms' ? (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      disabled={isSendingOtp}
                      onClick={() => dispatchAdminOtp('whatsapp', false)}
                      className="flex-1 py-2 px-3 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-50 text-emerald-800 text-[12px] font-medium transition flex items-center justify-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Use WhatsApp OTP</span>
                    </button>
                    <button
                      type="button"
                      disabled={isSendingOtp}
                      onClick={() => dispatchAdminOtp('sms', true)}
                      className="py-2 px-3 rounded-xl bg-[#F2F4F8] hover:bg-slate-200/70 text-slate-600 text-[12px] font-medium transition whitespace-nowrap"
                    >
                      Simulate SMS Fail
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isSendingOtp}
                    onClick={() => dispatchAdminOtp('sms', false)}
                    className="w-full py-2 px-3 rounded-xl bg-[#F2F4F8] hover:bg-slate-200/70 text-slate-600 text-[12px] font-medium transition flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Retry via SMS instead</span>
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13.5px] font-medium shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify &amp; Open Admin Dashboard</span>
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
};
