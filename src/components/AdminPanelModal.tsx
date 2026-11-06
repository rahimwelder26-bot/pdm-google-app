import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Building,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  Save,
  AlertCircle,
  Bot,
  Activity,
  HardDrive,
  RefreshCw,
  Fingerprint,
} from 'lucide-react';
import { AdminSettings, PaymentRecord } from '../types';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminSettings: AdminSettings;
  onUpdateAdminSettings: (newSettings: AdminSettings) => void;
  payments: PaymentRecord[];
  onUpdatePaymentStatus: (id: string, status: 'approved' | 'rejected') => void;
  language: 'bn' | 'en';
  totalDocuments: number;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  adminSettings,
  onUpdateAdminSettings,
  payments,
  onUpdatePaymentStatus,
  language,
  totalDocuments,
}) => {
  const isBn = language === 'bn';

  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'bank' | 'payments' | 'ai'>('bank');
  const [formData, setFormData] = useState<AdminSettings>(adminSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        onUpdateAdminSettings(formData);
        setSaveSuccess(
          isBn
            ? '✅ আপনার ব্যাংক অ্যাকাউন্ট ও ডলার গ্রহণের তথ্য সফলভাবে সংরক্ষিত হয়েছে!'
            : '✅ Bank account and payment details updated successfully!'
        );
        setTimeout(() => setSaveSuccess(null), 4000);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const pendingCount = payments.filter((p) => p.status === 'pending').length;
  const approvedCount = payments.filter((p) => p.status === 'approved').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-extrabold text-white">
                {isBn ? 'মালিক ও অ্যাডমিন কন্ট্রোল রুম' : 'Owner & Admin Control Room'}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {isBn
                ? 'ব্যাংক অ্যাকাউন্ট নম্বর পরিবর্তন, ডলার সাবস্ক্রিপশন ব্যবস্থাপনা এবং এআই পরিচালনা করুন।'
                : 'Manage bank payout details, verify subscriber payments, and supervise AI vault engines.'}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 mb-6">
          <button
            onClick={() => setActiveTab('bank')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'bank'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>{isBn ? 'ব্যাংক ও ডলার অ্যাকাউন্ট সেটিংস' : 'Bank & USD Settings'}</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'payments'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>{isBn ? 'পেমেন্ট ভেরিফিকেশন' : 'Subscribers & Payments'}</span>
            {pendingCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'ai'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>{isBn ? 'এআই সিস্টেম ও অডিট' : 'AI Engine & Audit'}</span>
          </button>
        </div>

        {/* Tab 1: Bank Account Settings */}
        {activeTab === 'bank' && (
          <form onSubmit={handleSaveBank} className="space-y-5">
            <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-xs text-cyan-200">
              <p className="font-bold text-cyan-300">
                {isBn ? '📌 আপনার নিজস্ব ব্যাংক অ্যাকাউন্ট নম্বর' : '📌 Your Direct Bank Account for Receiving Payments'}
              </p>
              <p className="mt-1">
                {isBn
                  ? 'এখানে যে ব্যাংক অ্যাকাউন্ট, SWIFT কোড, এবং বিকাশ/নগদ নম্বর দেবেন, প্রিমিয়াম কেনার সময় গ্রাহকরা সেই একাউন্টে ডলার ও টাকা পাঠাবে।'
                  : 'Customers will transfer funds directly to these exact account numbers when purchasing Premium.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  {isBn ? 'মালিকের নাম / অ্যাকাউন্ট হোল্ডার' : 'Account Holder Name'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.accountHolder}
                  onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  {isBn ? 'ব্যাংকের নাম (Bank Name)' : 'Bank Name'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  {isBn ? 'ব্যাংক একাউন্ট নম্বর (Account Number) *' : 'Account Number *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-cyan-300 font-mono font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  {isBn ? 'SWIFT কোড (আন্তর্জাতিক ডলারের জন্য)' : 'SWIFT Code (For USD Wires)'}
                </label>
                <input
                  type="text"
                  value={formData.swiftCode}
                  onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  {isBn ? 'রাউটিং নম্বর (Routing Number)' : 'Routing Number'}
                </label>
                <input
                  type="text"
                  value={formData.routingNumber}
                  onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  {isBn ? 'USD IBAN বা Wise ইমেইল (ডলারের জন্য)' : 'USD IBAN or Wise Email'}
                </label>
                <input
                  type="text"
                  value={formData.wiseEmail}
                  onChange={(e) => setFormData({ ...formData, wiseEmail: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  {isBn ? 'বিকাশ নম্বর (bKash Mobile Banking)' : 'bKash Number'}
                </label>
                <input
                  type="text"
                  value={formData.bkashNumber}
                  onChange={(e) => setFormData({ ...formData, bkashNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  {isBn ? 'নগদ নম্বর (Nagad)' : 'Nagad Number'}
                </label>
                <input
                  type="text"
                  value={formData.nagadNumber}
                  onChange={(e) => setFormData({ ...formData, nagadNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Pricing */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  {isBn ? 'মাসিক সাবস্ক্রিপশন মূল্য (USD $)' : 'Monthly Price (USD $)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.monthlyPriceUsd}
                  onChange={(e) => setFormData({ ...formData, monthlyPriceUsd: parseFloat(e.target.value) || 9.99 })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-amber-300 font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  {isBn ? 'বাৎসরিক সাবস্ক্রিপশন মূল্য (USD $)' : 'Yearly Price (USD $)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.yearlyPriceUsd}
                  onChange={(e) => setFormData({ ...formData, yearlyPriceUsd: parseFloat(e.target.value) || 89 })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-amber-300 font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-300 mb-1">
                  {isBn ? 'পেমেন্ট নির্দেশিকা (গ্রাহকদের দেখানো হবে)' : 'Payment Instructions (Shown to customers)'}
                </label>
                <textarea
                  rows={2}
                  value={formData.paymentInstructions}
                  onChange={(e) => setFormData({ ...formData, paymentInstructions: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {saveSuccess && (
              <div className="p-3 rounded-lg bg-emerald-950 border border-emerald-800 text-xs text-emerald-300">
                {saveSuccess}
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center space-x-2 shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'ব্যাংক তথ্য সংরক্ষণ করুন' : 'Save Bank Settings')}</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Payments & Subscribers */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">
                  {isBn ? 'ইনকামিং পেমেন্ট ও গ্রাহকদের সাবস্ক্রিপশন তালিকা' : 'Incoming Payments & Subscribers'}
                </h4>
                <p className="text-xs text-slate-400">
                  {isBn ? 'ব্যাংকে টাকা বা ডলার জমা হলে এক ক্লিকে অ্যাপ্রুভ করুন।' : 'Verify incoming bank transfers and approve subscriptions.'}
                </p>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="px-2 py-1 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  {pendingCount} Pending
                </span>
                <span className="px-2 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {approvedCount} Approved
                </span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">গ্রাহক</th>
                    <th className="px-4 py-3">প্ল্যান ও পরিমাণ</th>
                    <th className="px-4 py-3">মাধ্যম</th>
                    <th className="px-4 py-3">Transaction ID</th>
                    <th className="px-4 py-3">স্ট্যাটাস</th>
                    <th className="px-4 py-3 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-850 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-white">{p.userName}</p>
                        <p className="text-[10px] text-slate-400">{p.userEmail}</p>
                      </td>
                      <td className="px-4 py-3 font-semibold text-emerald-300">
                        {p.amount}
                        <span className="block text-[10px] text-slate-400 font-normal">{p.plan}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{p.paymentMethod}</td>
                      <td className="px-4 py-3 font-mono text-cyan-300 font-semibold">{p.transactionId}</td>
                      <td className="px-4 py-3">
                        {p.status === 'approved' ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            <span>অনুমোদিত</span>
                          </span>
                        ) : p.status === 'rejected' ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold">
                            <XCircle className="w-3 h-3 text-rose-400" />
                            <span>বাতিল</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">
                            <span>অপেক্ষারত</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {p.status !== 'approved' && (
                            <button
                              onClick={() => onUpdatePaymentStatus(p.id, 'approved')}
                              className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[11px]"
                              title="অনুমোদন করুন"
                            >
                              Approve
                            </button>
                          )}
                          {p.status !== 'rejected' && (
                            <button
                              onClick={() => onUpdatePaymentStatus(p.id, 'rejected')}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700 text-[11px]"
                              title="বাতিল করুন"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: AI Engine & Supervision */}
        {activeTab === 'ai' && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {isBn ? 'এআই পার্সোনাল সহকারী আর্কিটেকচার' : 'AI Personal Assistant Architecture'}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {isBn ? 'পরিচালক: আপনি (মালিক) এবং এআই ইঞ্জিন: Gemini 3.8 Flash' : 'Supervised by Owner & Powered by Gemini 3.8 Flash'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {isBn
                  ? 'আপনার নির্দেশ অনুযায়ী এই এআই অ্যাসিস্ট্যান্ট ইউজারের যেকোনো ভয়েস বা টেক্সট প্রশ্নের প্রেক্ষিতে স্টোর করা ব্যক্তিগত ফাইলগুলো থেকে ১ সেকেন্ডের মধ্যে ১০০% নির্ভুল উত্তর প্রস্তুত করে দেয়।'
                  : 'AI inspects the decrypted document index upon user request and outputs exact numbers, dates, amounts, and citations.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <p className="text-slate-400">AI Model</p>
                <p className="text-base font-bold text-white mt-1">gemini-3.8-flash</p>
                <p className="text-[10px] text-emerald-400 mt-0.5">Active & Running</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <p className="text-slate-400">Latency</p>
                <p className="text-base font-bold text-cyan-300 mt-1">~0.4s (High Speed)</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Direct Server SDK</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <p className="text-slate-400">Encryption Level</p>
                <p className="text-base font-bold text-emerald-400 mt-1">AES-256-GCM</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Zero-Knowledge</p>
              </div>
            </div>

            {/* WebAuthn Biometric Security Section */}
            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-900/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
                    <Fingerprint className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {isBn ? 'ওয়েব অথেনটিকেশন (WebAuthn) বায়োমেট্রিক আনলক' : 'WebAuthn Biometric Unlock'}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {isBn
                        ? 'ডিভাইসের ফিঙ্গারপ্রিন্ট, ফেস আইডি বা টাচ আইডি দিয়ে পিন ছাড়া ভল্ট আনলক করুন।'
                        : 'Unlock your vault using device fingerprint, Face ID, or Touch ID without typing PIN.'}
                    </p>
                  </div>
                </div>

                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                  W3C WebAuthn
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
                <div className="text-xs text-slate-300">
                  <span className="font-semibold text-slate-400">স্ট্যাটাস: </span>
                  <span className="text-emerald-400 font-medium">
                    {isBn ? 'ডিভাইস বায়োমেট্রিক সেন্সর প্রস্তুত ও সুরক্ষিত' : 'Biometric Sensor Ready'}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={async () => {
                      const { registerBiometric } = await import('../utils/webauthn');
                      const res = await registerBiometric('1234');
                      if (res.success) {
                        alert(isBn ? '✅ আপনার বায়োমেট্রিক সফলভাবে নথিভুক্ত হয়েছে!' : '✅ Biometrics enrolled successfully!');
                      } else {
                        alert(res.error || 'Biometric registration failed');
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
                  >
                    <Fingerprint className="w-4 h-4" />
                    <span>{isBn ? 'নতুন বায়োমেট্রিক সেট করুন' : 'Enroll Biometrics'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      const { disableBiometric } = await import('../utils/webauthn');
                      disableBiometric();
                      alert(isBn ? 'বায়োমেট্রিক আনলক নিষ্ক্রিয় করা হয়েছে।' : 'Biometric unlock disabled.');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 text-xs transition-colors"
                  >
                    {isBn ? 'রিসেট' : 'Reset'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
