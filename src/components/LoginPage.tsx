import React, { useState } from 'react';
import { CustomerLoginPage } from './auth/CustomerLoginPage';
import { CustomerRegisterPage } from './auth/CustomerRegisterPage';
import { AdminLoginPage } from './auth/AdminLoginPage';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { ShoppingBag, Sun, Moon, Globe, Shield, User, UserPlus } from 'lucide-react';

export type AuthView = 'customer-login' | 'customer-register' | 'admin-login';

export const LoginPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<AuthView>('customer-login');
  const { language, setLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      {/* Top utility bar with Language & Theme switcher */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
            Blue<span className="text-blue-600">Cart</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-0.5 shadow-2xs text-xs">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 cursor-pointer ${
                language === 'en'
                  ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>🇬🇧</span>
              <span>EN</span>
            </button>
            <button
              onClick={() => setLanguage('de')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 cursor-pointer ${
                language === 'de'
                  ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>🇩🇪</span>
              <span>DE</span>
            </button>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="my-auto py-6">
        {/* Navigation Selector between separate auth views */}
        <div className="max-w-md mx-auto mb-6">
          <div className="bg-slate-200/80 dark:bg-slate-900 p-1 rounded-2xl flex items-center gap-1 border border-slate-200 dark:border-slate-800 text-xs shadow-inner">
            <button
              type="button"
              onClick={() => setCurrentView('customer-login')}
              className={`flex-1 py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                currentView === 'customer-login'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{t('nav.signIn')}</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('customer-register')}
              className={`flex-1 py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                currentView === 'customer-register'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t('nav.register')}</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('admin-login')}
              className={`flex-1 py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                currentView === 'admin-login'
                  ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{t('nav.adminPortal')}</span>
            </button>
          </div>
        </div>

        {/* Dynamic View Display */}
        {currentView === 'customer-login' && (
          <CustomerLoginPage
            onNavigateToRegister={() => setCurrentView('customer-register')}
            onNavigateToAdmin={() => setCurrentView('admin-login')}
          />
        )}

        {currentView === 'customer-register' && (
          <CustomerRegisterPage
            onNavigateToLogin={() => setCurrentView('customer-login')}
            onNavigateToAdmin={() => setCurrentView('admin-login')}
          />
        )}

        {currentView === 'admin-login' && (
          <AdminLoginPage
            onNavigateToCustomerLogin={() => setCurrentView('customer-login')}
          />
        )}
      </div>

      {/* Footer minimal info */}
      <div className="max-w-md mx-auto text-center text-[11px] text-slate-500 dark:text-slate-500 py-2">
        <p>© 2026 BlueCart Retail • Encrypted Stripe Payments • PCI-DSS Certified</p>
      </div>
    </div>
  );
};
