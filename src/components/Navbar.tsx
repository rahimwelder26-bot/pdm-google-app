import React from 'react';
import {
  ShieldCheck,
  Lock,
  Unlock,
  Crown,
  Settings,
  Globe,
  Sparkles,
  Fingerprint,
} from 'lucide-react';
import { SubscriptionTier } from '../types';
import { isBiometricEnrolled } from '../utils/webauthn';

import pdmIcon from '../assets/images/pdm_google_icon_1793987639479.jpg';

interface NavbarProps {
  language: 'bn' | 'en';
  setLanguage: (lang: 'bn' | 'en') => void;
  tier: SubscriptionTier;
  isVaultLocked: boolean;
  onToggleVaultLock: () => void;
  onOpenUpgradeModal: () => void;
  onOpenAdminModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  setLanguage,
  tier,
  isVaultLocked,
  onToggleVaultLock,
  onOpenUpgradeModal,
  onOpenAdminModal,
}) => {
  const isBn = language === 'bn';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo with Google-colored App Icon */}
        <div className="flex items-center space-x-3">
          <div className="relative group flex items-center justify-center w-11 h-11 rounded-2xl p-0.5 bg-gradient-to-tr from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853] shadow-lg shadow-blue-500/20">
            <img
              src={pdmIcon}
              alt="PDM Google Icon"
              className="w-full h-full object-cover rounded-[14px] bg-slate-950"
            />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#34A853]"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight select-none flex items-center">
                <span className="text-[#4285F4]">P</span>
                <span className="text-[#EA4335]">D</span>
                <span className="text-[#FBBC05]">M</span>
                <span className="ml-1.5 flex items-center font-bold">
                  <span className="text-[#4285F4]">G</span>
                  <span className="text-[#EA4335]">o</span>
                  <span className="text-[#FBBC05]">o</span>
                  <span className="text-[#4285F4]">g</span>
                  <span className="text-[#34A853]">l</span>
                  <span className="text-[#EA4335]">e</span>
                </span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-mono">
                AES-256
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {isBn ? 'পার্সোনাল ডকুমেন্ট ম্যানেজার ও ভয়েস এআই ভল্ট' : 'Personal Document Manager & Voice AI Vault'}
            </p>
          </div>
        </div>

        {/* Actions & Navigation Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Vault Lock / Unlock Button with Biometric WebAuthn */}
          <button
            onClick={onToggleVaultLock}
            title={
              isVaultLocked
                ? (isBn ? 'বায়োমেট্রিক বা পিন দিয়ে ভল্ট আনলক করুন' : 'Unlock Vault with Biometric or PIN')
                : (isBn ? 'ভল্ট লক করুন' : 'Lock Vault')
            }
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              isVaultLocked
                ? 'bg-rose-950/60 text-rose-300 border-rose-800/80 hover:bg-rose-900/60'
                : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80 hover:bg-emerald-900/60'
            }`}
          >
            {isVaultLocked ? (
              isBiometricEnrolled() ? <Fingerprint className="w-3.5 h-3.5 text-rose-400" /> : <Lock className="w-3.5 h-3.5" />
            ) : (
              isBiometricEnrolled() ? <Fingerprint className="w-3.5 h-3.5 text-emerald-400" /> : <Unlock className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">
              {isVaultLocked
                ? (isBn ? 'ভল্ট লক করা' : 'Vault Locked')
                : (isBn ? 'ভল্ট সুরক্ষিত' : 'Vault Unlocked')}
            </span>
            {isBiometricEnrolled() && (
              <span className="text-[9px] px-1 py-0.2 bg-emerald-900/60 text-emerald-300 rounded font-mono hidden md:inline">
                BIO
              </span>
            )}
          </button>

          {/* Subscription Tier Badge / Upgrade Button */}
          {tier === 'premium' ? (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-600/20 border border-amber-500/40 text-amber-300 shadow-sm shadow-amber-500/10">
              <Crown className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              <span>{isBn ? 'প্রিমিয়াম ভিআইপি' : 'Premium VIP'}</span>
            </div>
          ) : (
            <button
              onClick={onOpenUpgradeModal}
              className="group flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all hover:scale-105"
            >
              <Crown className="w-3.5 h-3.5 fill-slate-950" />
              <span>{isBn ? 'প্রিমিয়াম আপগ্রেড ($৯.৯৯)' : 'Upgrade VIP ($9.99)'}</span>
              <Sparkles className="w-3 h-3 text-slate-950 animate-pulse" />
            </button>
          )}

          {/* Admin Dashboard Button */}
          <button
            onClick={onOpenAdminModal}
            title={isBn ? 'মালিক ও অ্যাডমিন সেটিংস (ব্যাংক ও পেমেন্ট)' : 'Admin & Bank Payment Settings'}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:text-white transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{isBn ? 'মালিক প্যানেল' : 'Admin'}</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:text-white transition-colors"
            title={isBn ? 'Switch to English' : 'বাংলায় দেখুন'}
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isBn ? 'ENG' : 'বাংলা'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
