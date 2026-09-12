import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { ShieldCheck, Lock, Mail, ArrowRight, CheckCircle2, ShieldAlert, Sparkles, ArrowLeft } from 'lucide-react';

interface AdminLoginPageProps {
  onNavigateToCustomerLogin: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onNavigateToCustomerLogin }) => {
  const { login, loginAsDemo } = useAuth();
  const { t } = useLanguage();

  const [email, setEmail] = useState('admin@bluecart.store');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await login(email, password);
      if (res.success) {
        setSuccessMessage('Admin credentials verified. Opening Admin Control Center...');
      } else {
        setErrorMessage(res.error || 'Access denied: Invalid administrator credentials');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error');
    } finally {
      setIsLoading(false);
    }
  };

  const handle1ClickAdmin = () => {
    setEmail('admin@bluecart.store');
    setPassword('admin123');
    loginAsDemo('admin');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-slate-900 dark:bg-slate-900/95 text-white py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-800 relative overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-blue-600/20 rounded-full blur-2xl pointer-events-none" />

        {/* Security Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600/30 text-blue-400 border border-blue-500/30 mb-3 shadow-inner">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
          </div>
          <div className="inline-block px-2.5 py-0.5 bg-blue-950 text-blue-300 border border-blue-800 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1.5">
            Internal Operations Gate
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {t('auth.adminLoginTitle')}
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            {t('auth.adminLoginSub')}
          </p>
        </div>

        {/* 1-Click Instant Demo Admin Access */}
        <div className="mb-6 p-3 bg-slate-800/80 border border-slate-700/80 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              {t('auth.demoNotice')}
            </span>
            <span className="text-[10px] text-slate-400">Demo Root Clearance</span>
          </div>
          <button
            type="button"
            onClick={handle1ClickAdmin}
            className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>1-Click Admin Access (Sarah Chen - Store Admin)</span>
          </button>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-xl text-center">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {t('auth.email')}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@bluecart.store"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-800/80 border border-slate-700 text-white rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-300 font-semibold">
                {t('auth.password')}
              </label>
              <button
                type="button"
                onClick={() => setPassword('admin123')}
                className="text-[11px] text-blue-400 hover:underline cursor-pointer"
              >
                Auto-fill password
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-800/80 border border-slate-700 text-white rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
          >
            <span>{isLoading ? 'Verifying Clearance...' : t('auth.adminSignInBtn')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Back to Customer Shop */}
        <div className="mt-6 pt-5 border-t border-slate-800 text-center text-xs">
          <button
            type="button"
            onClick={onNavigateToCustomerLogin}
            className="text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('auth.isCustomerPrompt')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
