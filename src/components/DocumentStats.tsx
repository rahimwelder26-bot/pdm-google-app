import {
  FileCheck2,
  Lock,
  AlertTriangle,
  HardDrive,
  PlusCircle,
  Crown,
  Download,
} from 'lucide-react';
import { VaultDocument, SubscriptionTier } from '../types';

interface DocumentStatsProps {
  documents: VaultDocument[];
  tier: SubscriptionTier;
  language: 'bn' | 'en';
  onOpenAddModal: () => void;
  onOpenUpgradeModal: () => void;
  onOpenBackupModal: () => void;
}

export const DocumentStats: React.FC<DocumentStatsProps> = ({
  documents,
  tier,
  language,
  onOpenAddModal,
  onOpenUpgradeModal,
  onOpenBackupModal,
}) => {
  const isBn = language === 'bn';

  const totalDocs = documents.length;
  const encryptedDocs = documents.filter((d) => d.isEncrypted).length;
  const freeLimit = 5;

  // Check for upcoming or past expiry dates
  const now = new Date();
  const expiringDocs = documents.filter((d) => {
    if (!d.expiryDate) return false;
    const exp = new Date(d.expiryDate);
    const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays < 90; // within 90 days or already expired
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Documents Card */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">
              {isBn ? 'মোট সংরক্ষিত ফাইল' : 'Total Documents'}
            </p>
            <h3 className="text-2xl font-bold text-white mt-1">{totalDocs}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-950 text-cyan-400 flex items-center justify-center border border-cyan-800/60">
            <FileCheck2 className="w-5 h-5" />
          </div>
        </div>

        {/* Quota Progress */}
        <div className="mt-3">
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>{tier === 'premium' ? (isBn ? 'সীমাহীন স্টোরেজ' : 'Unlimited Storage') : `${totalDocs}/${freeLimit} ${isBn ? 'টি ব্যবহৃত' : 'used'}`}</span>
            <span>{tier === 'premium' ? 'VIP' : (isBn ? 'ফ্রি লিমিট' : 'Free Limit')}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                tier === 'premium'
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 w-full'
                  : totalDocs >= freeLimit
                  ? 'bg-rose-500'
                  : 'bg-cyan-500'
              }`}
              style={{
                width: tier === 'premium' ? '100%' : `${Math.min(100, (totalDocs / freeLimit) * 100)}%`,
              }}
            />
          </div>
          {tier === 'free' && totalDocs >= freeLimit && (
            <button
              onClick={onOpenUpgradeModal}
              className="mt-2 text-[10px] text-amber-400 hover:underline flex items-center space-x-1"
            >
              <Crown className="w-3 h-3" />
              <span>{isBn ? 'লিমিট শেষ! আনলিমিটেড করতে আপগ্রেড করুন' : 'Limit reached! Upgrade for unlimited'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Military Grade Encryption Status Card */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-900/30 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">
              {isBn ? 'মিলিটারি-গ্রেড এনক্রিপশন' : 'AES-256 Encryption'}
            </p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1">
              {totalDocs > 0 ? `${Math.round((encryptedDocs / totalDocs) * 100)}%` : '100%'}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-800/60">
            <Lock className="w-5 h-5" />
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-400 flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
          <span>{isBn ? `${encryptedDocs}টি ফাইল শূন্য-জ্ঞান সুরক্ষায়` : `${encryptedDocs} files zero-knowledge locked`}</span>
        </p>
      </div>

      {/* Expiry / Deadlines Alert Card */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">
              {isBn ? 'মেয়াদ ও বিল রিমাইন্ডার' : 'Expiry & Bill Alerts'}
            </p>
            <h3 className={`text-2xl font-bold mt-1 ${expiringDocs.length > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
              {expiringDocs.length}
            </h3>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
            expiringDocs.length > 0
              ? 'bg-amber-950 text-amber-400 border-amber-800/60'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-400 truncate">
          {expiringDocs.length > 0
            ? (isBn ? 'বিল বা পাসপোর্টের মেয়াদ সন্নিকটে!' : 'Upcoming bill or document renewal!')
            : (isBn ? 'সব কাগজপত্রের মেয়াদ ঠিক আছে' : 'All documents up to date')}
        </p>
      </div>

      {/* Fast Upload CTA Card */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/80 via-slate-900 to-slate-900 border border-cyan-800/50 shadow-lg flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-cyan-300">
              {isBn ? 'নতুন ডকুমেন্ট রাখুন' : 'Add New Document'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isBn ? 'এআই দিয়ে স্ক্যান ও এনক্রিপ্ট' : 'AI scan & secure storage'}
            </p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-cyan-600/20 text-cyan-400 flex items-center justify-center">
            <HardDrive className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={onOpenAddModal}
            className="py-2 px-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center justify-center space-x-1 shadow-md shadow-cyan-600/30 transition-all cursor-pointer truncate"
          >
            <PlusCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{isBn ? 'ফাইল আপলোড' : 'Upload'}</span>
          </button>

          <button
            onClick={onOpenBackupModal}
            title={isBn ? 'পাসওয়ার্ড দিয়ে সম্পূর্ণ ভল্ট এনক্রিপ্ট করে অফলাইনে সেভ করুন' : 'Export/Restore Encrypted JSON Backup'}
            className="py-2 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-xs border border-slate-700 flex items-center justify-center space-x-1 transition-all cursor-pointer truncate"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">{isBn ? 'অফলাইন ব্যাকআপ' : 'Backup'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
