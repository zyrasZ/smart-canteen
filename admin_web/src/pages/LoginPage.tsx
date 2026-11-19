import { useState, useEffect, useCallback, type FC, type FormEvent } from 'react';
import {
  WarningCircleIcon as AlertCircle,
  SpinnerGapIcon as Loader2,
  EnvelopeIcon as Mail,
  LockIcon as Lock,
  EyeIcon as Eye,
  EyeSlashIcon as EyeOff,
  CrownIcon as Crown,
} from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import { api, enableMockMode } from '../services/api';
import logoImg from '../assets/logo.png';

const GoogleIcon: FC = () => (
  <svg className="size-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
    />
  </svg>
);

export const LoginPage: FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const performLogin = useCallback(async (loginEmail: string, loginPass: string) => {
    setError('');
    setInfoMsg('');
    setIsLoading(true);

    try {
      const cleanEmail = String(loginEmail || '').trim().toLowerCase();
      const cleanPass = String(loginPass || '').trim();
      const demoEmails = [
        'admin@smartcanteen.vn',
        'admin.cs1@smartcanteen.vn',
        'admin.cs2@smartcanteen.vn',
      ];
      if (
        !import.meta.env.VITE_API_BASE_URL &&
        import.meta.env.VITE_USE_MOCK !== 'false' &&
        demoEmails.includes(cleanEmail)
      ) {
        enableMockMode();
      }
      const res = await api.post('/auth/login', { email: cleanEmail, password: cleanPass });
      const { token, user } = res.data;

      if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
        setError(
          'Cổng Web Quản trị dành riêng cho Ban Quản trị (Admin Tổng HQ & Admin Cơ sở). Học sinh và phụ huynh vui lòng sử dụng Zalo Mini App.'
        );
        setIsLoading(false);
        return;
      }

      login(token, user);
    } catch (err: any) {
      const backendMsg = err.response?.data?.message;
      const netMsg = err.message;
      const status = err.response?.status;

      if (backendMsg) {
        setError(status ? `${backendMsg} (Mã lỗi: ${status})` : backendMsg);
      } else if (netMsg === 'Network Error' || !err.response) {
        setError('Không thể kết nối máy chủ API. Hãy kiểm tra Backend hoặc bật VITE_USE_MOCK="true".');
      } else {
        setError(netMsg || 'Email hoặc mật khẩu không chính xác.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  // Support ?demo=admin or ?demo=staff in URL for 1-click frictionless testing
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const demoRole = params.get('demo');
    if (demoRole === 'admin') {
      enableMockMode();
      setEmail('admin@smartcanteen.vn');
      setPassword('123456');
      performLogin('admin@smartcanteen.vn', '123456');
    } else if (demoRole === 'staff') {
      enableMockMode();
      setEmail('admin.cs1@smartcanteen.vn');
      setPassword('123456');
      performLogin('admin.cs1@smartcanteen.vn', '123456');
    }
  }, [performLogin]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await performLogin(email, password);
  };

  const handleMockDemoLogin = async () => {
    enableMockMode();
    setEmail('admin@smartcanteen.vn');
    setPassword('123456');
    await performLogin('admin@smartcanteen.vn', '123456');
  };

  return (
    <div className="min-h-screen min-h-dvh w-full relative overflow-x-hidden overflow-y-auto flex items-center justify-center px-4 py-6 sm:px-6 sm:py-10 font-sans antialiased bg-gradient-to-br from-[#eef5ff] via-[#f8fbff] to-[#d9ecff] selection:bg-blue-100 selection:text-[#0062ff]">
      {/* Flowing Blue Wave Background */}
      <div className="pointer-events-none select-none fixed inset-0 overflow-hidden" aria-hidden="true">
        {/* Soft top-left & right ambient glow */}
        <div className="absolute -top-24 -left-24 w-[320px] h-[320px] sm:w-[520px] sm:h-[520px] rounded-full bg-[#b9daff]/40 blur-3xl" />
        <div className="absolute top-1/4 -right-20 w-[280px] h-[280px] sm:w-[460px] sm:h-[460px] rounded-full bg-[#8ec5ff]/30 blur-3xl" />

        {/* Layered SVG waves matching the design */}
        <svg
          className="absolute bottom-0 left-0 w-full h-[42%] min-h-[240px] sm:h-[58%] sm:min-h-[380px]"
          viewBox="0 0 1440 520"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9ed0ff" stopOpacity="0.45" />
              <stop offset="55%" stopColor="#3b93ff" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#6eb4ff" stopOpacity="0.35" />
            </linearGradient>
            <linearGradient id="waveGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5ca8ff" stopOpacity="0.38" />
              <stop offset="50%" stopColor="#0066ff" stopOpacity="0.48" />
              <stop offset="100%" stopColor="#94ccff" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="waveGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e3f1ff" stopOpacity="0.7" />
              <stop offset="60%" stopColor="#72b7ff" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#cbe5ff" stopOpacity="0.65" />
            </linearGradient>
          </defs>

          <path
            d="M0,180 C260,80 520,310 860,260 C1140,220 1310,90 1440,35 L1440,520 L0,520 Z"
            fill="url(#waveGrad1)"
          />
          <path
            d="M0,260 C320,170 590,390 960,310 C1210,255 1350,150 1440,120 L1440,520 L0,520 Z"
            fill="url(#waveGrad2)"
          />
          <path
            d="M0,340 C380,450 760,240 1120,330 C1270,368 1370,330 1440,280 L1440,520 L0,520 Z"
            fill="url(#waveGrad3)"
          />
        </svg>
      </div>

      {/* Main 2-column Content */}
      <div className="relative z-10 w-full max-w-[1060px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-5 sm:gap-8 lg:gap-16">
        {/* Left Brand Showcase */}
        <div className="flex flex-col items-center lg:items-start justify-center lg:flex-1 pt-1 sm:pt-0">
          <div className="w-[190px] sm:w-[290px] lg:w-[400px] max-w-full aspect-[4/1] overflow-hidden flex items-center justify-center">
            <img
              src={logoImg}
              alt="Mino - Meal In No Time"
              className="w-full h-full object-contain scale-[1.85] translate-y-[1.5%] mix-blend-multiply"
            />
          </div>
        </div>

        {/* Right Login Card */}
        <div className="w-full max-w-[400px] shrink-0">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-[22px] border border-white shadow-[0_24px_60px_-15px_rgba(0,85,184,0.18)] p-5 sm:p-8">
            <h1 className="text-2xl sm:text-[26px] font-bold text-[#0f172a] tracking-tight mb-4">
              Login
            </h1>

            {/* 1-Click Recruiter Demo Box (always visible for showcase) */}
            <div className="mb-5 p-3 rounded-xl bg-blue-50/80 border border-blue-200/80 space-y-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={handleMockDemoLogin}
                className="w-full h-10 rounded-lg bg-[#0057b8] hover:bg-[#004593] active:bg-[#003e82] text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Crown className="size-4 shrink-0" />
                <span>Vào xem Demo ngay (Không cần tài khoản)</span>
              </button>
              <p className="text-[11px] text-slate-600 text-center leading-snug">
                Hoặc nhập tài khoản test: <code className="font-semibold text-[#0057b8]">admin@smartcanteen.vn</code> / <code className="font-semibold text-[#0057b8]">123456</code>
              </p>
            </div>

            {/* Google Sign-in */}
            <button
              type="button"
              onClick={() => setInfoMsg('Đăng nhập Google sẽ được kích hoạt khi kết nối OAuth Backend.')}
              className="w-full h-10.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-2xs"
            >
              <GoogleIcon />
              <span>Sign in with Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-5">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-semibold text-slate-500 whitespace-nowrap">
                Sign in with your Email
              </span>
              <div className="border-t border-slate-200 w-full" />
            </div>

            {/* Error / Info Alerts */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="size-4 shrink-0 text-rose-600 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}
            {infoMsg && (
              <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-[#0057b8] text-xs font-medium">
                {infoMsg}
              </div>
            )}

            {/* Email & Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-800">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="size-4" />
                  </div>
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Insert your email"
                    className="w-full h-10.5 pl-10 pr-3.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0057b8] focus:ring-2 focus:ring-[#0057b8]/15 outline-hidden transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-800">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="size-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Insert your password"
                    className="w-full h-10.5 pl-10 pr-10 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0057b8] focus:ring-2 focus:ring-[#0057b8]/15 outline-hidden transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Keep me logged in & Forgot password */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="inline-flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={keepLoggedIn}
                    onChange={(e) => setKeepLoggedIn(e.target.checked)}
                    className="size-4 rounded border-slate-300 text-[#0057b8] focus:ring-[#0057b8]/20 cursor-pointer"
                  />
                  <span>Keep me logged in</span>
                </label>

                <button
                  type="button"
                  onClick={() => setInfoMsg('Vui lòng liên hệ Super Admin HQ để cấp lại mật khẩu.')}
                  className="text-xs font-semibold text-[#0057b8] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* Primary Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 mt-1 bg-[#0057b8] hover:bg-[#004593] active:bg-[#003e82] text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_8px_20px_-6px_rgba(0,87,184,0.45)] disabled:opacity-60 disabled:cursor-not-allowed outline-hidden focus-visible:ring-2 focus-visible:ring-[#0057b8]/40"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Login</span>
                )}
              </button>
            </form>

            {/* Bottom Register Link */}
            <p className="mt-5 text-center text-xs text-slate-500">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => setInfoMsg('Tài khoản quản trị được cấp bởi Quản trị viên Tổng (Super Admin).')}
                className="font-semibold text-[#0057b8] hover:underline cursor-pointer"
              >
                Register
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
