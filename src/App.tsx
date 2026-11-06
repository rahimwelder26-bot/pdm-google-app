import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SmartVoiceAssistant } from './components/SmartVoiceAssistant';
import { DocumentStats } from './components/DocumentStats';
import { DocumentGrid } from './components/DocumentGrid';
import { AddDocumentModal } from './components/AddDocumentModal';
import { DocumentViewerModal } from './components/DocumentViewerModal';
import { UpgradeModal } from './components/UpgradeModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { MasterPinModal } from './components/MasterPinModal';
import { BackupModal } from './components/BackupModal';
import { VaultDocument, SubscriptionTier, AdminSettings, PaymentRecord } from './types';
import { initialSampleDocuments } from './utils/sampleData';
import { isBiometricEnrolled, authenticateBiometric } from './utils/webauthn';
import pdmIcon from './assets/images/pdm_google_icon_1793987639479.jpg';
import { ShieldCheck, Lock, Sparkles, Crown, Zap, RefreshCw } from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');
  const isBn = language === 'bn';

  // Subscription Tier (free vs premium)
  const [tier, setTier] = useState<SubscriptionTier>(() => {
    const saved = localStorage.getItem('vaultai_tier');
    return (saved as SubscriptionTier) || 'free';
  });

  // Master PIN & Vault Lock state
  const [masterPin, setMasterPin] = useState<string>('1234');
  const [isVaultLocked, setIsVaultLocked] = useState<boolean>(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);

  // Documents state
  const [documents, setDocuments] = useState<VaultDocument[]>(() => {
    const saved = localStorage.getItem('vaultai_documents');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialSampleDocuments;
      }
    }
    return initialSampleDocuments;
  });

  // Save documents to localStorage
  useEffect(() => {
    localStorage.setItem('vaultai_documents', JSON.stringify(documents));
  }, [documents]);

  // Save tier to localStorage
  useEffect(() => {
    localStorage.setItem('vaultai_tier', tier);
  }, [tier]);

  // Admin Settings & Payments state
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
    ownerName: 'Md. Rahim',
    ownerEmail: 'rahim.welder26@gmail.com',
    bankName: 'City Bank / Standard Chartered (USD & BDT Wire)',
    accountHolder: 'Md. Rahim',
    accountNumber: '1502938472001',
    routingNumber: '225272648',
    swiftCode: 'CIBLBDDH',
    ibanUsd: 'BD89CIBL22527264801502',
    wiseEmail: 'rahim.welder26@gmail.com',
    bkashNumber: '+8801700-000000 (Merchant/Personal)',
    nagadNumber: '+8801700-000000',
    stripePaymentLink: 'https://buy.stripe.com/demo_vaultai_upgrade',
    monthlyPriceUsd: 9.99,
    yearlyPriceUsd: 89.0,
    monthlyPriceBdt: 1150,
    yearlyPriceBdt: 9900,
    paymentInstructions:
      'যেকোনো দেশ থেকে ডলার (USD) পাঠাতে SWIFT / IBAN অথবা Wise ইমেইল ব্যবহার করুন। বাংলাদেশ থেকে bKash/Nagad বা সিটি ব্যাংক ট্রান্সফার করুন। টাকা বা ডলার পাঠানোর পর নিচে Transaction ID এবং প্রেরকের নাম জমা দিন। অ্যাডমিন যাচাই করে সর্বোচ্চ ১০ মিনিটে আপনার প্রিমিয়াম ভিআইপি আনলক করে দেবে।',
  });

  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isViewerModalOpen, setIsViewerModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<VaultDocument | null>(null);

  const handleRestoreDocuments = (newDocs: VaultDocument[], mode: 'merge' | 'replace') => {
    if (mode === 'replace') {
      setDocuments(newDocs);
    } else {
      setDocuments((prev) => {
        const newIds = new Set(newDocs.map((d) => d.id));
        const filteredPrev = prev.filter((d) => !newIds.has(d.id));
        return [...newDocs, ...filteredPrev];
      });
    }
  };

  // Load backend settings and payments on mount
  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setAdminSettings(data.settings);
        }
      })
      .catch((err) => console.warn('Could not load settings:', err));

    fetch('/api/payments')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.payments) {
          setPayments(data.payments);
        }
      })
      .catch((err) => console.warn('Could not load payments:', err));
  }, []);

  // Handlers
  const handleToggleVaultLock = async () => {
    if (isVaultLocked) {
      if (isBiometricEnrolled()) {
        try {
          const res = await authenticateBiometric();
          if (res.success && res.pin) {
            setMasterPin(res.pin);
            setIsVaultLocked(false);
            return;
          }
        } catch {
          // Fallback to PIN modal
        }
      }
      setIsPinModalOpen(true);
    } else {
      setIsVaultLocked(true);
    }
  };

  const handlePinUnlockSuccess = (pin: string) => {
    setMasterPin(pin);
    setIsVaultLocked(false);
  };

  const handleSaveDocument = (doc: VaultDocument) => {
    setDocuments((prev) => [doc, ...prev]);
  };

  const handleDeleteDocument = (id: string) => {
    if (
      window.confirm(
        isBn
          ? 'আপনি কি নিশ্চিত যে এই ডকুমেন্টটি স্থায়ীভাবে মুছে ফেলতে চান?'
          : 'Are you sure you want to permanently delete this document?'
      )
    ) {
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      if (selectedDocument?.id === id) {
        setIsViewerModalOpen(false);
        setSelectedDocument(null);
      }
    }
  };

  const handleSelectDocument = (doc: VaultDocument) => {
    setSelectedDocument(doc);
    setIsViewerModalOpen(true);
  };

  const handleUpdatePaymentStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/payments/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setPayments((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status } : p))
        );
        if (status === 'approved') {
          setTier('premium');
        }
      }
    } catch (err) {
      console.error('Update payment error:', err);
    }
  };

  const handleAskAiAboutDoc = (title: string) => {
    // Scroll to voice assistant
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleActivatePremium = () => {
    setTier('premium');
    localStorage.setItem('vaultai_tier', 'premium');
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar */}
      <Navbar
        language={language}
        setLanguage={setLanguage}
        tier={tier}
        isVaultLocked={isVaultLocked}
        onToggleVaultLock={handleToggleVaultLock}
        onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Hero Banner for Value Proposition */}
        <div className="relative mb-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 p-6 sm:p-8 overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 text-xs font-semibold mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isBn ? 'মিলিটারি-গ্রেড AES-256 জিরো-নলেজ সিকিউরিটি' : 'Zero-Knowledge Military-Grade Security'}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {isBn ? (
                <>
                  আপনার পার্সোনাল ডকুমেন্ট রাখুন নিরাপদে, <br />
                  <span className="bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853] bg-clip-text text-transparent">
                    ভয়েস বা লেখায় চাইলেই এআই সাথে সাথে দেবে।
                  </span>
                </>
              ) : (
                <>
                  Store Personal Documents Securely, <br />
                  <span className="bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853] bg-clip-text text-transparent">
                    Retrieve Anything Instantly by Voice AI.
                  </span>
                </>
              )}
            </h1>

            <p className="mt-3 text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
              {isBn
                ? 'পাসপোর্ট, এনআইডি, সার্টিফিকেট, প্রেসক্রিপশন, ইউটিলিটি বিল বা ট্যাক্স রসিদ—যেকোনো ফাইল রাখুন। ভয়েসে বললেই এআই স্ক্যান করে নির্ভুল তথ্য বের করে দেবে।'
                : 'National IDs, Passports, Degrees, Prescriptions, Utility Bills or Tax documents. Just speak to get instant, verified data.'}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-cyan-600/30 transition-all flex items-center space-x-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isBn ? 'ডকুমেন্ট আপলোড করুন' : 'Upload Document'}</span>
              </button>

              {tier === 'free' ? (
                <button
                  onClick={() => setIsUpgradeModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold text-xs sm:text-sm transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <Crown className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{isBn ? 'প্রিমিয়াম ভিআইপি সুবিধা ($৯.৯৯)' : 'Upgrade to VIP ($9.99)'}</span>
                </button>
              ) : (
                <div className="px-3 py-1.5 rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-xs font-semibold flex items-center space-x-1.5">
                  <Crown className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                  <span>{isBn ? 'ভিআইপি অ্যাকাউন্ট সক্রিয়' : 'VIP Active'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Featured App Icon with Google Colors */}
          <div className="relative shrink-0 flex flex-col items-center">
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 p-1 rounded-3xl bg-gradient-to-tr from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853] shadow-2xl shadow-blue-500/30 group">
              <img
                src={pdmIcon}
                alt="PDM Google App Icon"
                className="w-full h-full object-cover rounded-[22px] shadow-inner"
              />
              <span className="absolute -bottom-2.5 px-3 py-0.5 rounded-full bg-slate-950 border border-slate-700 text-[10px] font-bold text-slate-200 tracking-wider uppercase shadow-md flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4285F4]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#EA4335]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#FBBC05]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#34A853]"></span>
                <span className="ml-1">PDM Google</span>
              </span>
            </div>
          </div>
        </div>

        {/* Smart Voice & Chat Assistant */}
        <SmartVoiceAssistant
          documents={documents}
          language={language}
          tier={tier}
          onSelectDocument={handleSelectDocument}
          onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
        />

        {/* Storage, Encryption & Expiry Stats */}
        <DocumentStats
          documents={documents}
          tier={tier}
          language={language}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
          onOpenBackupModal={() => setIsBackupModalOpen(true)}
        />

        {/* Document Grid / Explorer */}
        <DocumentGrid
          documents={documents}
          language={language}
          isVaultLocked={isVaultLocked}
          onSelectDocument={handleSelectDocument}
          onDeleteDocument={handleDeleteDocument}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onOpenBackupModal={() => setIsBackupModalOpen(true)}
          onAskAiAboutDoc={handleAskAiAboutDoc}
        />
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-800 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <img src={pdmIcon} alt="PDM Google" className="w-5 h-5 rounded-md object-cover ring-1 ring-slate-700" />
            <span className="font-extrabold text-slate-200">PDM Google</span>
            <span>•</span>
            <span>{isBn ? 'পার্সোনাল ডকুমেন্ট ম্যানেজার ও এআই ভল্ট' : 'Personal Document Manager & AI Vault'}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center space-x-1">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>AES-256-GCM Zero-Knowledge</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Gemini 3.8 Flash Powered</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Standard & Premium VIP</span>
            </span>
          </div>

          <div>
            <p className="text-[11px] text-slate-500">
              {isBn ? 'পরিচালনায়: মালিক ও এআই ইঞ্জিন' : 'Managed by Owner & AI Studio'}
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AddDocumentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSaveDocument={handleSaveDocument}
        language={language}
        currentCount={documents.length}
        tier={tier}
        masterPin={masterPin}
        onOpenUpgradeModal={() => {
          setIsAddModalOpen(false);
          setIsUpgradeModalOpen(true);
        }}
      />

      <DocumentViewerModal
        document={selectedDocument}
        isOpen={isViewerModalOpen}
        onClose={() => {
          setIsViewerModalOpen(false);
          setSelectedDocument(null);
        }}
        language={language}
        onAskAi={(q) => {
          setIsViewerModalOpen(false);
          // Query trigger will be done through search assistant
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        documents={documents}
        onRestoreDocuments={handleRestoreDocuments}
        language={language}
      />

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        tier={tier}
        onActivatePremium={handleActivatePremium}
        adminSettings={adminSettings}
        language={language}
      />

      <AdminPanelModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        adminSettings={adminSettings}
        onUpdateAdminSettings={setAdminSettings}
        payments={payments}
        onUpdatePaymentStatus={handleUpdatePaymentStatus}
        language={language}
        totalDocuments={documents.length}
      />

      <MasterPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={handlePinUnlockSuccess}
        currentPin={masterPin}
        language={language}
      />
    </div>
  );
}
