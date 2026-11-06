import React, { useState } from 'react';
import {
  X,
  Download,
  Upload,
  Lock,
  Unlock,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileJson,
  Eye,
  EyeOff,
  Sparkles,
  HardDrive,
} from 'lucide-react';
import { VaultDocument } from '../types';
import { createEncryptedVaultBackup, restoreEncryptedVaultBackup } from '../utils/crypto';
import pdmIcon from '../assets/images/pdm_google_icon_1793987639479.jpg';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: VaultDocument[];
  onRestoreDocuments: (newDocs: VaultDocument[], mode: 'merge' | 'replace') => void;
  language: 'bn' | 'en';
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  documents,
  onRestoreDocuments,
  language,
}) => {
  const isBn = language === 'bn';

  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'export' | 'restore'>('export');

  // Export State
  const [exportPassword, setExportPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showExportPassword, setShowExportPassword] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Restore State
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restoreFileContent, setRestoreFileContent] = useState<string>('');
  const [restorePassword, setRestorePassword] = useState('');
  const [showRestorePassword, setShowRestorePassword] = useState(false);
  const [restoreMode, setRestoreMode] = useState<'merge' | 'replace'>('merge');
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreSuccessMsg, setRestoreSuccessMsg] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  // Handle Export
  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setExportError(null);
    setExportSuccess(false);

    if (exportPassword.length < 4) {
      setExportError(isBn ? 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' : 'Password must be at least 4 characters.');
      return;
    }

    if (exportPassword !== confirmPassword) {
      setExportError(isBn ? 'উভয় পাসওয়ার্ড এক হতে হবে।' : 'Passwords do not match.');
      return;
    }

    if (documents.length === 0) {
      setExportError(isBn ? 'ভল্টে ব্যাকআপ নেওয়ার মতো কোনো ফাইল নেই।' : 'No documents available to backup.');
      return;
    }

    setIsExporting(true);

    try {
      const backupData = await createEncryptedVaultBackup(documents, exportPassword);

      // Create downloadable JSON file
      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `pdm_google_vault_backup_${dateStr}.enc.json`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportSuccess(true);
      setExportPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setExportError(err.message || 'ব্যাকআপ ফাইল তৈরিতে সমস্যা হয়েছে।');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle File Selection for Restore
  const handleRestoreFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreFile(file);
    setRestoreError(null);
    setRestoreSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = () => {
      setRestoreFileContent(reader.result as string);
    };
    reader.onerror = () => {
      setRestoreError(isBn ? 'ফাইলটি পড়তে ব্যর্থ হয়েছে।' : 'Failed to read file.');
    };
    reader.readAsText(file);
  };

  // Handle Restore
  const handleRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    setRestoreError(null);
    setRestoreSuccessMsg(null);

    if (!restoreFileContent) {
      setRestoreError(isBn ? 'অনুগ্রহ করে ব্যাকআপ JSON ফাইল নির্বাচন করুন।' : 'Please select backup JSON file.');
      return;
    }

    if (!restorePassword) {
      setRestoreError(isBn ? 'ব্যাকআপের পাসওয়ার্ড প্রদান করুন।' : 'Please enter backup password.');
      return;
    }

    setIsRestoring(true);

    try {
      const result = await restoreEncryptedVaultBackup(restoreFileContent, restorePassword);

      if (result.success && result.documents) {
        onRestoreDocuments(result.documents, restoreMode);
        setRestoreSuccessMsg(
          isBn
            ? `✅ সফলভাবে ${result.documents.length}টি ডকুমেন্ট ভল্টে রিস্টোর করা হয়েছে!`
            : `✅ Successfully restored ${result.documents.length} documents into vault!`
        );
        setRestorePassword('');
        setRestoreFile(null);
        setRestoreFileContent('');
      } else {
        setRestoreError(result.error || 'রিস্টোর ব্যর্থ হয়েছে। সঠিক পাসওয়ার্ড দিন।');
      }
    } catch (err: any) {
      setRestoreError(err.message || 'ডিক্রিপ্ট করতে ব্যর্থ হয়েছে।');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-2xl p-0.5 bg-gradient-to-tr from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853] shadow-lg shadow-blue-500/20 shrink-0">
            <img src={pdmIcon} alt="PDM Google" className="w-full h-full object-cover rounded-[14px]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-white">
                {isBn ? 'অফলাইন এনক্রিপ্টেড ব্যাকআপ ও রিস্টোর' : 'Encrypted Offline Backup & Restore'}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                AES-256
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {isBn
                ? 'পাসওয়ার্ড দিয়ে সম্পূর্ণ ভল্ট এনক্রিপ্ট করে অফলাইনে সেভ রাখুন।'
                : 'Zero-knowledge password-protected backup of all personal documents.'}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 mb-6">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'export'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>{isBn ? 'এনক্রিপ্ট ব্যাকআপ এক্সপোর্ট' : 'Export Encrypted Backup'}</span>
          </button>

          <button
            onClick={() => setActiveTab('restore')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'restore'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>{isBn ? 'ব্যাকআপ রিস্টোর করুন' : 'Restore from Backup'}</span>
          </button>
        </div>

        {/* Tab 1: Export Backup */}
        {activeTab === 'export' && (
          <form onSubmit={handleExport} className="space-y-4">
            {/* Info Card */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span>{isBn ? 'মোট এক্সপোর্টযোগ্য ডকুমেন্ট:' : 'Documents to export:'}</span>
                <span className="font-bold text-white font-mono">{documents.length} টি ফাইল</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>{isBn ? 'এনক্রিপশন স্ট্যান্ডার্ড:' : 'Encryption:'}</span>
                <span className="font-semibold text-emerald-400 font-mono">AES-256-GCM + PBKDF2</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>{isBn ? 'ফরম্যাট:' : 'File format:'}</span>
                <span className="font-mono text-cyan-300">.enc.json (Password Protected)</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/60 text-[11px] text-amber-200 flex items-start space-x-2">
              <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                {isBn
                  ? 'সতর্কতা: আপনার দেওয়া পাসওয়ার্ডটি মনে রাখুন। এই পাসওয়ার্ড ভুলে গেলে ব্যাকআপ ফাইলটি কোনোভাবেই উদ্ধার বা ডিক্রিপ্ট করা যাবে না।'
                  : 'Important: Remember your backup password. Without it, the encrypted offline backup cannot be decrypted.'}
              </span>
            </div>

            {/* Password input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isBn ? 'ব্যাকআপ সুরক্ষার জন্য পাসওয়ার্ড সেট করুন *' : 'Set Backup Protection Password *'}
              </label>
              <div className="relative">
                <input
                  type={showExportPassword ? 'text' : 'password'}
                  required
                  value={exportPassword}
                  onChange={(e) => setExportPassword(e.target.value)}
                  placeholder={isBn ? 'কমপক্ষে ৪ অক্ষরের শক্তিশালী পাসওয়ার্ড' : 'Enter strong password (min 4 chars)'}
                  className="w-full pl-3 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowExportPassword(!showExportPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showExportPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isBn ? 'পাসওয়ার্ড নিশ্চিত করুন *' : 'Confirm Password *'}
              </label>
              <input
                type={showExportPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={isBn ? 'পুনরায় পাসওয়ার্ডটি লিখুন' : 'Re-enter password'}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            {exportError && (
              <div className="p-3 rounded-lg bg-rose-950/70 border border-rose-800 text-xs text-rose-300 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{exportError}</span>
              </div>
            )}

            {exportSuccess && (
              <div className="p-3 rounded-lg bg-emerald-950/70 border border-emerald-800 text-xs text-emerald-300 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  {isBn
                    ? '✅ পাসওয়ার্ড প্রটেক্টেড এনক্রিপ্টেড JSON ব্যাকআপ ডাউনলোড হয়েছে!'
                    : '✅ Password-protected encrypted backup JSON downloaded!'}
                </span>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isExporting || documents.length === 0}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{isBn ? 'AES-256 এনক্রিপ্ট হচ্ছে...' : 'Encrypting with AES-256...'}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>{isBn ? 'এনক্রিপ্ট করে ব্যাকআপ ডাউনলোড করুন' : 'Download Encrypted Backup'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Restore Backup */}
        {activeTab === 'restore' && (
          <form onSubmit={handleRestore} className="space-y-4">
            {/* File upload picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isBn ? 'এনক্রিপ্টেড ব্যাকআপ JSON ফাইল নির্বাচন করুন *' : 'Select Encrypted Backup JSON File *'}
              </label>
              <div className="relative border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-xl p-4 text-center bg-slate-950 transition-colors">
                <input
                  type="file"
                  accept=".json,.enc"
                  onChange={handleRestoreFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center">
                  <FileJson className="w-7 h-7 text-cyan-400 mb-1.5" />
                  <p className="text-xs font-medium text-slate-200">
                    {restoreFile ? restoreFile.name : (isBn ? 'ফাইল বেছে নিতে ক্লিক করুন (.enc.json)' : 'Click to select backup (.enc.json)')}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    PDM Google Encrypted JSON Format
                  </p>
                </div>
              </div>
            </div>

            {/* Decryption password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isBn ? 'ব্যাকআপের পাসওয়ার্ড প্রদান করুন *' : 'Enter Backup Decryption Password *'}
              </label>
              <div className="relative">
                <input
                  type={showRestorePassword ? 'text' : 'password'}
                  required
                  value={restorePassword}
                  onChange={(e) => setRestorePassword(e.target.value)}
                  placeholder={isBn ? 'এক্সপোর্ট করার সময় যে পাসওয়ার্ড দিয়েছিলেন' : 'Password used during export'}
                  className="w-full pl-3 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowRestorePassword(!showRestorePassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showRestorePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Merge / Replace Mode */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isBn ? 'রিস্টোর মোড' : 'Restore Mode'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRestoreMode('merge')}
                  className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                    restoreMode === 'merge'
                      ? 'bg-cyan-950 text-cyan-200 border-cyan-600'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  <p className="font-bold">{isBn ? 'মার্জ (Merge)' : 'Merge'}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {isBn ? 'বর্তমান ফাইলগুলোর সাথে যুক্ত হবে' : 'Append to existing vault'}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setRestoreMode('replace')}
                  className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                    restoreMode === 'replace'
                      ? 'bg-rose-950 text-rose-200 border-rose-600'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  <p className="font-bold">{isBn ? 'রিপ্লেস (Replace)' : 'Replace All'}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {isBn ? 'বর্তমান সব মুছে ব্যাকআপ বসবে' : 'Overwrite current vault'}
                  </p>
                </button>
              </div>
            </div>

            {restoreError && (
              <div className="p-3 rounded-lg bg-rose-950/70 border border-rose-800 text-xs text-rose-300 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{restoreError}</span>
              </div>
            )}

            {restoreSuccessMsg && (
              <div className="p-3 rounded-lg bg-emerald-950/70 border border-emerald-800 text-xs text-emerald-300 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{restoreSuccessMsg}</span>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isRestoring || !restoreFileContent}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                {isRestoring ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{isBn ? 'ডিক্রিপ্ট ও রিস্টোর হচ্ছে...' : 'Decrypting & Restoring...'}</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>{isBn ? 'ডিক্রিপ্ট করে ভল্ট রিস্টোর করুন' : 'Decrypt & Restore Vault'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
