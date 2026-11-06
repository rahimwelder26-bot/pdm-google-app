import React, { useState } from 'react';
import {
  X,
  Crown,
  CheckCircle2,
  Building,
  CreditCard,
  Send,
  Zap,
  Shield,
  Sparkles,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { AdminSettings, SubscriptionTier } from '../types';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: SubscriptionTier;
  onActivatePremium: () => void;
  adminSettings: AdminSettings;
  language: 'bn' | 'en';
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  tier,
  onActivatePremium,
  adminSettings,
  language,
}) => {
  const isBn = language === 'bn';

  if (!isOpen) return null;

  const [selectedBilling, setSelectedBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('USD Bank Wire / SWIFT');
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const priceUsd = selectedBilling === 'monthly' ? adminSettings.monthlyPriceUsd : adminSettings.yearlyPriceUsd;
  const priceBdt = selectedBilling === 'monthly' ? adminSettings.monthlyPriceBdt : adminSettings.yearlyPriceBdt;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      setErrorMsg(isBn ? 'অনুগ্রহ করে Transaction ID বা রেফারেন্স নম্বর দিন।' : 'Please enter Transaction ID.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const planName = selectedBilling === 'monthly' ? `Premium VIP ($${priceUsd}/mo)` : `Premium VIP ($${priceUsd}/yr)`;

      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: userName || 'সম্মানিত গ্রাহক',
          userEmail: userEmail || 'user@example.com',
          plan: planName,
          amount: `$${priceUsd} USD (৳${priceBdt})`,
          currency: 'USD',
          paymentMethod,
          transactionId: transactionId.trim(),
          notes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(
          isBn
            ? 'পেমেন্ট রিকোয়েস্ট সফলভাবে জমা হয়েছে! মালিকের ব্যাংক অ্যাকাউন্টে ডলার ভেরিফাই হলেই ভিআইপি চালু হবে। (আপনি নিচে তাৎক্ষণিক ডেমো ভিআইপি বাটনে ক্লিক করেও এখনি পরীক্ষা করতে পারেন)'
            : 'Payment submitted! The admin will verify the incoming transfer. You can also activate Instant Demo VIP below.'
        );
      } else {
        throw new Error(data.error || 'Failed to submit payment');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'পেমেন্ট জমা দিতে সমস্যা হয়েছে।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInstantUnlock = () => {
    onActivatePremium();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-600/60 text-amber-300 text-xs font-semibold mb-3">
            <Crown className="w-4 h-4 fill-amber-400" />
            <span>{isBn ? 'প্রিমিয়াম ভিআইপি সুবিধা' : 'Premium VIP Membership'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {isBn
              ? 'আপনার সমস্ত পার্সোনাল ডকুমেন্টের সর্বোচ্চ সুরক্ষা ও স্মার্ট এআই'
              : 'Unlock Unlimited Storage & Real-Time Voice AI'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            {isBn
              ? 'ডলার অথবা টাকায় সাবস্ক্রাইব করুন। সমস্ত পেমেন্ট সরাসরি মালিকের ব্যাংক অ্যাকাউন্টে জমা হবে।'
              : 'Subscribe using USD or BDT. All funds route directly to the designated bank account.'}
          </p>

          {/* Billing Interval Switcher */}
          <div className="mt-5 inline-flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
            <button
              onClick={() => setSelectedBilling('monthly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedBilling === 'monthly'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isBn ? 'মাসিক ($৯.৯৯ / ৳১,১৫০)' : 'Monthly ($9.99)'}
            </button>
            <button
              onClick={() => setSelectedBilling('yearly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${
                selectedBilling === 'yearly'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{isBn ? 'বাৎসরিক ($৮৯.০০)' : 'Yearly ($89.00)'}</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">
                -25%
              </span>
            </button>
          </div>
        </div>

        {/* Plan Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Standard Free Tier Card */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-base font-bold text-slate-200">
                  {isBn ? 'সাধারণ ফ্রি ভার্সন' : 'Standard Free'}
                </h4>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  {isBn ? 'আজীবন ফ্রি' : 'Free Forever'}
                </span>
              </div>
              <div className="text-2xl font-black text-slate-400 mb-4">$0</div>

              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{isBn ? 'সর্বোচ্চ ৫টি ডকুমেন্ট সংরক্ষণ' : 'Store up to 5 documents'}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{isBn ? 'বেসিক টেক্সট অনুসন্ধান' : 'Basic text search'}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{isBn ? 'স্ট্যান্ডার্ড এনক্রিপশন' : 'Standard client encryption'}</span>
                </li>
                <li className="flex items-center space-x-2 text-slate-500 line-through">
                  <span>{isBn ? 'ভয়েস অডিও রিডআউট (TTS)' : 'Voice audio reading (TTS)'}</span>
                </li>
                <li className="flex items-center space-x-2 text-slate-500 line-through">
                  <span>{isBn ? 'মেয়াদোত্তীর্ণ রিমাইন্ডার ও ব্যাকআপ' : 'Expiry warnings & priority backup'}</span>
                </li>
              </ul>
            </div>

            <div className="mt-6">
              <span className="block text-center py-2 text-xs text-slate-500 border border-slate-800 rounded-xl">
                {tier === 'free' ? (isBn ? 'বর্তমানে সক্রিয়' : 'Current Plan') : (isBn ? 'ডিফল্ট' : 'Default')}
              </span>
            </div>
          </div>

          {/* Premium VIP Card */}
          <div className="relative p-5 rounded-2xl bg-gradient-to-b from-amber-950/30 via-slate-900 to-slate-950 border-2 border-amber-500/70 shadow-xl shadow-amber-500/10 flex flex-col justify-between">
            <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider">
              {isBn ? 'সেরা পছন্দ' : 'Most Popular'}
            </span>

            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-base font-bold text-amber-300 flex items-center space-x-1.5">
                  <Crown className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span>{isBn ? 'প্রিমিয়াম ভিআইপি' : 'Premium VIP'}</span>
                </h4>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  {selectedBilling === 'monthly' ? (isBn ? 'মাসিক' : 'Monthly') : (isBn ? 'বাৎসরিক' : 'Yearly')}
                </span>
              </div>

              <div className="flex items-baseline space-x-2 mb-4">
                <span className="text-3xl font-black text-white">${priceUsd}</span>
                <span className="text-xs text-slate-400">
                  USD {selectedBilling === 'monthly' ? '/ মাস' : '/ বছর'} (৳{priceBdt})
                </span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-200">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-semibold text-white">
                    {isBn ? 'সীমাহীন (Unlimited) ডকুমেন্ট সংরক্ষণ' : 'Unlimited document storage'}
                  </span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    {isBn ? 'তাৎক্ষণিক ভয়েস কমান্ড ও অডিও রিডআউট (TTS)' : 'Real-time voice AI command & speech readout'}
                  </span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    {isBn ? 'মিলিটারি-গ্রেড AES-256 জিরো-নলেজ এনক্রিপশন' : 'Military-Grade AES-256 Zero-Knowledge'}
                  </span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    {isBn ? 'পাসপোর্ট ও বিলের স্বয়ংক্রিয় মেয়াদ অ্যালার্ট' : 'Auto-expiry reminders for passport & bills'}
                  </span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    {isBn ? 'জেমিনি ৩.৮ ফ্ল্যাশ সুপারফাস্ট রেজনিং' : 'Gemini 3.8 Flash priority reasoning'}
                  </span>
                </li>
              </ul>
            </div>

            {/* Instant Demo Test Trigger */}
            <div className="mt-6 pt-4 border-t border-amber-500/20">
              <button
                type="button"
                onClick={handleInstantUnlock}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/30 flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>
                  {tier === 'premium'
                    ? (isBn ? 'ভিআইপি প্ল্যান সক্রিয় আছে' : 'VIP Plan is Active')
                    : (isBn ? '⚡ তাৎক্ষণিক VIP ডেমো আনলক করুন' : '⚡ Instant VIP Demo Unlock')}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Bank Account Details Section */}
        <div className="rounded-2xl bg-slate-950 border border-slate-800 p-6 mb-8">
          <div className="flex items-center space-x-2.5 mb-4">
            <Building className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">
              {isBn ? 'মালিকের অফিসিয়াল ব্যাংক ও ডলার অ্যাকাউন্ট তথ্য' : 'Official Owner Bank & USD Account Info'}
            </h3>
          </div>

          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            {adminSettings.paymentInstructions}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {/* Bank Name */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Bank Name</span>
                <span className="text-slate-200 font-semibold">{adminSettings.bankName}</span>
              </div>
            </div>

            {/* Account Holder */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Account Holder</span>
                <span className="text-slate-200 font-semibold">{adminSettings.accountHolder}</span>
              </div>
            </div>

            {/* Account Number */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Account Number</span>
                <span className="text-cyan-300 font-bold">{adminSettings.accountNumber}</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(adminSettings.accountNumber, 'acc')}
                className="text-slate-400 hover:text-white"
              >
                {copiedKey === 'acc' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* SWIFT / Routing */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">SWIFT / Routing</span>
                <span className="text-slate-200 font-semibold">{adminSettings.swiftCode} / {adminSettings.routingNumber}</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(adminSettings.swiftCode, 'swift')}
                className="text-slate-400 hover:text-white"
              >
                {copiedKey === 'swift' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* USD IBAN / Wise */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">USD IBAN / Wise</span>
                <span className="text-emerald-300 font-semibold">{adminSettings.wiseEmail}</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(adminSettings.wiseEmail, 'wise')}
                className="text-slate-400 hover:text-white"
              >
                {copiedKey === 'wise' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* bKash / Nagad */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">bKash & Nagad (BDT)</span>
                <span className="text-rose-300 font-semibold">{adminSettings.bkashNumber}</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(adminSettings.bkashNumber, 'bkash')}
                className="text-slate-400 hover:text-white"
              >
                {copiedKey === 'bkash' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Payment Verification Submission Form */}
        <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-6">
          <h4 className="text-sm font-bold text-white mb-2 flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-cyan-400" />
            <span>{isBn ? 'পেমেন্ট ভেরিফিকেশন ও ট্রানজ্যাকশন আইডি জমা দিন' : 'Submit Payment Verification'}</span>
          </h4>
          <p className="text-xs text-slate-400 mb-4">
            {isBn
              ? 'টাকা বা ডলার পাঠানোর পর নিচের ফর্মটি পূরণ করে পাঠান। অ্যাডমিন আপনার পেমেন্ট পেয়ে সাথে সাথে ভিআইপি অ্যাক্টিভ করবেন।'
              : 'After transferring the funds, submit your details and transaction reference below for approval.'}
          </p>

          <form onSubmit={handleSubmitPayment} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isBn ? 'আপনার নাম' : 'Your Name'}
                </label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Md. Hasan"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isBn ? 'আপনার ইমেইল' : 'Your Email'}
                </label>
                <input
                  type="email"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="e.g. hasan@example.com"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isBn ? 'পেমেন্ট মাধ্যম' : 'Payment Method'}
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="USD Bank Wire / SWIFT">USD Bank Wire / SWIFT</option>
                  <option value="Wise Transfer (USD)">Wise Transfer (USD)</option>
                  <option value="Stripe / Card">Stripe / International Card</option>
                  <option value="City Bank Transfer (BDT)">City Bank Transfer (BDT)</option>
                  <option value="bKash Personal/Merchant">bKash (বিকাশ)</option>
                  <option value="Nagad">Nagad (নগদ)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isBn ? 'Transaction ID / রেফারেন্স নম্বর *' : 'Transaction ID / Reference *'}
                </label>
                <input
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. TRX-99238120 or SWIFT-REF"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isBn ? 'মন্তব্য বা প্রেরকের ব্যাংক বিবরণ (ঐচ্ছিক)' : 'Notes or Sender Details (Optional)'}
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={isBn ? 'কোন ব্যাংক বা নম্বর থেকে পাঠিয়েছেন...' : 'Sender bank or account details...'}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center space-x-2 shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? (isBn ? 'জমা হচ্ছে...' : 'Submitting...') : (isBn ? 'পেমেন্ট রিকোয়েস্ট পাঠান' : 'Submit Verification')}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
