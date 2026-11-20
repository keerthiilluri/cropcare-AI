import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Sprout, 
  Menu, 
  X, 
  Languages, 
  User, 
  ShieldCheck, 
  LayoutDashboard, 
  LogOut, 
  Activity, 
  BookOpen, 
  FileText,
  Lightbulb
} from 'lucide-react';

export const Navbar = ({ activePage, setActivePage }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: t('nav.home'), icon: Sprout },
    { id: 'detect', label: t('nav.detect'), icon: Activity },
    { id: 'library', label: t('nav.library'), icon: BookOpen },
    { id: 'outbreaks', label: t('nav.outbreaks'), icon: Activity },
    { id: 'reports', label: t('nav.reports'), icon: FileText },
    { id: 'tips', label: t('nav.tips'), icon: Lightbulb },
  ];

  if (isAuthenticated && !isAdmin) {
    navLinks.push({ id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard });
  }

  if (isAdmin) {
    navLinks.push({ id: 'admin', label: t('nav.admin'), icon: ShieldCheck });
  }

  const handleNavClick = (pageId) => {
    setActivePage(pageId);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-forest-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Brand Logo */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-forest-700 via-forest-600 to-agricultural-500 flex items-center justify-center text-white shadow-md shadow-forest-600/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-bold tracking-tight text-forest-900 font-sans">
                  CropCare<span className="text-agricultural-600">AI</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-forest-100 text-forest-800 rounded-md">
                  CSP
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Smart Farming, Healthy Crops</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activePage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-forest-600 text-white shadow-sm shadow-forest-600/20'
                      : 'text-slate-600 hover:text-forest-800 hover:bg-forest-50/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </button>
              );
            })}
          </div>

          {/* Actions & Language Switcher */}
          <div className="hidden lg:flex items-center gap-3">
            
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                title="Change Language"
              >
                <Languages className="w-4 h-4 text-forest-600" />
                <span>
                  {language === 'en' ? 'English' : language === 'te' ? 'తెలుగు' : 'हिन्दी'}
                </span>
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50">
                  <button
                    onClick={() => { setLanguage('en'); setLangDropdownOpen(false); }}
                    className={`w-full text-left px-3.5 py-1.5 text-xs font-semibold ${
                      language === 'en' ? 'text-forest-700 bg-forest-50' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => { setLanguage('te'); setLangDropdownOpen(false); }}
                    className={`w-full text-left px-3.5 py-1.5 text-xs font-semibold ${
                      language === 'te' ? 'text-forest-700 bg-forest-50' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    తెలుగు (Telugu)
                  </button>
                  <button
                    onClick={() => { setLanguage('hi'); setLangDropdownOpen(false); }}
                    className={`w-full text-left px-3.5 py-1.5 text-xs font-semibold ${
                      language === 'hi' ? 'text-forest-700 bg-forest-50' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    हिन्दी (Hindi)
                  </button>
                </div>
              )}
            </div>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <button
                  onClick={() => handleNavClick(isAdmin ? 'admin' : 'dashboard')}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-forest-50 text-forest-800 hover:bg-forest-100 transition-colors text-xs font-bold"
                >
                  <User className="w-3.5 h-3.5 text-forest-600" />
                  <span className="max-w-[120px] truncate">{user.full_name}</span>
                  {isAdmin && (
                    <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[9px] uppercase font-extrabold">
                      Admin
                    </span>
                  )}
                </button>
                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNavClick('login')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-forest-700 hover:bg-slate-50 transition-colors"
                >
                  {t('nav.login')}
                </button>
                <button
                  onClick={() => handleNavClick('register')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-forest-700 hover:bg-forest-800 text-white shadow-sm shadow-forest-700/20 transition-all hover:shadow"
                >
                  {t('nav.register')}
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setLanguage(language === 'en' ? 'te' : 'en')}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700"
            >
              {language === 'en' ? 'TE' : 'EN'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activePage === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-left transition-colors ${
                  isActive
                    ? 'bg-forest-600 text-white'
                    : 'text-slate-700 hover:bg-forest-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </button>
            );
          })}

          <div className="pt-4 border-t border-slate-100">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="px-4 py-2 bg-slate-50 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-forest-600" />
                    <span className="text-sm font-bold text-slate-800">{user.full_name}</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-forest-100 text-forest-800 font-bold uppercase">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleNavClick('login')}
                  className="w-full py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 text-center"
                >
                  {t('nav.login')}
                </button>
                <button
                  onClick={() => handleNavClick('register')}
                  className="w-full py-2.5 rounded-xl bg-forest-700 text-sm font-bold text-white text-center shadow-sm"
                >
                  {t('nav.register')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
