import React, { useState } from 'react';
import {
  X,
  FileText,
  Lock,
  Unlock,
  Download,
  Calendar,
  Building,
  Tag,
  Sparkles,
  AlertTriangle,
  Copy,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { VaultDocument } from '../types';

interface DocumentViewerModalProps {
  document: VaultDocument | null;
  isOpen: boolean;
  onClose: () => void;
  language: 'bn' | 'en';
  onAskAi: (query: string) => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  document,
  isOpen,
  onClose,
  language,
  onAskAi,
}) => {
  const isBn = language === 'bn';

  if (!isOpen || !document) return null;

  const [copied, setCopied] = useState(false);

  const isExpired = document.expiryDate && new Date(document.expiryDate).getTime() < Date.now();
  const isExpiringSoon =
    document.expiryDate &&
    !isExpired &&
    new Date(document.expiryDate).getTime() - Date.now() < 90 * 24 * 3600 * 1000;

  const handleCopyText = () => {
    const textToCopy = `${document.title}\nID: ${document.documentNumber || 'N/A'}\n\nSummary:\n${document.summary}\n\nDetails:\n${document.extractedText}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = window.document.createElement('a');
    const file = new Blob(
      [
        `=======================================================\n` +
          `PDM GOOGLE SECURE DOCUMENT EXPORT\n` +
          `=======================================================\n` +
          `Title: ${document.title}\n` +
          `Category: ${document.category}\n` +
          `Document ID: ${document.documentNumber || 'N/A'}\n` +
          `Issuer: ${document.issuer || 'N/A'}\n` +
          `Issue Date: ${document.issueDate || 'N/A'}\n` +
          `Expiry Date: ${document.expiryDate || 'N/A'}\n` +
          `Encryption: ${document.isEncrypted ? 'AES-256-GCM Military Grade' : 'Standard'}\n` +
          `Exported At: ${new Date().toISOString()}\n\n` +
          `SUMMARY:\n${document.summary}\n\n` +
          `EXTRACTED CONTENT:\n${document.extractedText}\n`,
      ],
      { type: 'text/plain;charset=utf-8' }
    );
    element.href = URL.createObjectURL(file);
    element.download = `${document.title.replace(/\s+/g, '_')}_decrypted.txt`;
    window.document.body.appendChild(element);
    element.click();
    window.document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start justify-between pr-8 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-950 text-cyan-400 flex items-center justify-center border border-cyan-800">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {document.category}
                </span>
                {document.isEncrypted && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>AES-256 এনক্রিপ্ট করা</span>
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-white mt-1">{document.title}</h2>
            </div>
          </div>
        </div>

        {/* Expiry Warning */}
        {isExpired && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-800 flex items-center space-x-2 text-xs text-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              {isBn
                ? `সতর্কতা: এই ডকুমেন্টের মেয়াদ ${document.expiryDate} তারিখে শেষ হয়ে গেছে! জরুরি রিনিউ করা প্রয়োজন।`
                : `Alert: This document expired on ${document.expiryDate}! Immediate renewal required.`}
            </span>
          </div>
        )}

        {isExpiringSoon && (
          <div className="mb-4 p-3 rounded-xl bg-amber-950/80 border border-amber-800 flex items-center space-x-2 text-xs text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {isBn
                ? `সতর্কতা: এই ডকুমেন্টের মেয়াদ খুব শীঘ্রই (${document.expiryDate}) শেষ হতে চলেছে!`
                : `Notice: This document will expire soon on ${document.expiryDate}!`}
            </span>
          </div>
        )}

        {/* Structured Data Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800/80 mb-6">
          {document.documentNumber && (
            <div>
              <p className="text-[11px] text-slate-400">{isBn ? 'ডকুমেন্ট / আইডি নম্বর' : 'Document ID Number'}</p>
              <p className="text-sm font-mono font-bold text-cyan-300 mt-0.5">{document.documentNumber}</p>
            </div>
          )}

          {document.issuer && (
            <div>
              <p className="text-[11px] text-slate-400">{isBn ? 'প্রদানকারী কর্তৃপক্ষ' : 'Issuing Authority'}</p>
              <p className="text-sm font-medium text-slate-200 mt-0.5 flex items-center space-x-1">
                <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{document.issuer}</span>
              </p>
            </div>
          )}

          {document.issueDate && (
            <div>
              <p className="text-[11px] text-slate-400">{isBn ? 'প্রদানের তারিখ' : 'Issue Date'}</p>
              <p className="text-sm font-mono text-slate-200 mt-0.5 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{document.issueDate}</span>
              </p>
            </div>
          )}

          {document.expiryDate && (
            <div>
              <p className="text-[11px] text-slate-400">{isBn ? 'মেয়াদোত্তীর্ণের তারিখ' : 'Expiry Date'}</p>
              <p className="text-sm font-mono text-amber-300 mt-0.5 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{document.expiryDate}</span>
              </p>
            </div>
          )}

          <div>
            <p className="text-[11px] text-slate-400">{isBn ? 'ফাইল নাম ও সাইজ' : 'File Name & Size'}</p>
            <p className="text-xs text-slate-300 mt-0.5 truncate font-mono">
              {document.fileName} ({(document.fileSize / 1024).toFixed(1)} KB)
            </p>
          </div>

          <div>
            <p className="text-[11px] text-slate-400">{isBn ? 'সংরক্ষিত হয়েছে' : 'Added To Vault'}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {new Date(document.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Summary Block */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            {isBn ? 'জরুরি তথ্যের সারসংক্ষেপ (Summary)' : 'Key Summary'}
          </h4>
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-200 leading-relaxed">
            {document.summary || (isBn ? 'কোনো সারসংক্ষেপ নেই।' : 'No summary provided.')}
          </div>
        </div>

        {/* Extracted / Decrypted Full Content */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {isBn ? 'সম্পূর্ণ বিবরণ ও ডিক্রিপ্ট করা টেক্সট' : 'Extracted Text & Full Details'}
            </h4>
            <button
              onClick={handleCopyText}
              className="flex items-center space-x-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'কপি করুন' : 'Copy')}</span>
            </button>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
            {document.extractedText || document.summary}
          </div>
        </div>

        {/* Tags */}
        {document.tags && document.tags.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-500 mr-1" />
            {document.tags.map((t, idx) => (
              <span
                key={idx}
                className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Actions Footer */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onAskAi(isBn ? `${document.title} এর বিস্তারিত তথ্য আমাকে বলো` : `Tell me details of ${document.title}`);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800 hover:bg-cyan-900 transition-all text-xs font-medium cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>{isBn ? 'এআই কে এই ফাইল নিয়ে প্রশ্ন করুন' : 'Ask AI about this document'}</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isBn ? 'ডিক্রিপ্ট কপি ডাউনলোড' : 'Download Copy'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              {isBn ? 'বন্ধ করুন' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
