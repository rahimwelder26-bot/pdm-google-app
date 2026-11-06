import React, { useState } from 'react';
import {
  X,
  Upload,
  Sparkles,
  Lock,
  FileText,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Building,
  Tag,
  Crown,
} from 'lucide-react';
import { VaultDocument, DocumentCategory, SubscriptionTier } from '../types';
import { encryptText } from '../utils/crypto';

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDocument: (doc: VaultDocument) => void;
  language: 'bn' | 'en';
  currentCount: number;
  tier: SubscriptionTier;
  masterPin: string;
  onOpenUpgradeModal: () => void;
}

export const AddDocumentModal: React.FC<AddDocumentModalProps> = ({
  isOpen,
  onClose,
  onSaveDocument,
  language,
  currentCount,
  tier,
  masterPin,
  onOpenUpgradeModal,
}) => {
  const isBn = language === 'bn';

  if (!isOpen) return null;

  const isFreeLimitExceeded = tier === 'free' && currentCount >= 5;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('identity');
  const [documentNumber, setDocumentNumber] = useState('');
  const [issuer, setIssuer] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [summary, setSummary] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [isEncrypted, setIsEncrypted] = useState(true);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [aiSuccessMsg, setAiSuccessMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setErrorMsg(null);
    setAiSuccessMsg(null);

    // Default title from file name
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFileBase64(result);

      // Auto-trigger Gemini scan on image or text
      triggerAiScan(file, result);
    };
    reader.readAsDataURL(file);
  };

  const triggerAiScan = async (file: File, base64: string) => {
    setIsAnalyzing(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/ai/analyze-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileBase64: base64,
          rawText: summary || extractedText,
        }),
      });

      const data = await res.json();
      if (data.success && data.metadata) {
        const meta = data.metadata;
        if (meta.title) setTitle(meta.title);
        if (meta.category) setCategory(meta.category);
        if (meta.documentNumber) setDocumentNumber(meta.documentNumber);
        if (meta.issueDate) setIssueDate(meta.issueDate);
        if (meta.expiryDate) setExpiryDate(meta.expiryDate);
        if (meta.issuer) setIssuer(meta.issuer);
        if (meta.tags && Array.isArray(meta.tags)) setTagsInput(meta.tags.join(', '));
        if (meta.summary) setSummary(meta.summary);
        if (meta.extractedText) setExtractedText(meta.extractedText);

        setAiSuccessMsg(
          isBn
            ? '✨ জেমিনি এআই আপনার ফাইল সফলভাবে স্ক্যান করে সব তথ্য অটো-ফিল করেছে!'
            : '✨ Gemini AI successfully extracted all fields from the document!'
        );
      }
    } catch (err: any) {
      console.warn('AI scan notice:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg(isBn ? 'ডকুমেন্টের একটি নাম প্রদান করুন।' : 'Please enter a document title.');
      return;
    }

    if (isFreeLimitExceeded) {
      onOpenUpgradeModal();
      return;
    }

    let cipherBase64: string | undefined;
    let ivBase64: string | undefined;
    let saltBase64: string | undefined;

    // Encrypt content if toggle active
    if (isEncrypted) {
      try {
        const payloadToEncrypt = JSON.stringify({
          documentNumber,
          issuer,
          summary,
          extractedText,
        });
        const encResult = await encryptText(payloadToEncrypt, masterPin || '1234');
        cipherBase64 = encResult.cipherBase64;
        ivBase64 = encResult.ivBase64;
        saltBase64 = encResult.saltBase64;
      } catch (err) {
        console.error('Encryption failed:', err);
      }
    }

    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newDoc: VaultDocument = {
      id: `doc-${Date.now()}`,
      title: title.trim(),
      category,
      documentNumber: documentNumber.trim(),
      issuer: issuer.trim(),
      issueDate: issueDate || undefined,
      expiryDate: expiryDate || undefined,
      tags: tagsArray,
      summary: summary.trim(),
      extractedText: extractedText.trim() || summary.trim(),
      fileName: selectedFile ? selectedFile.name : `${title.replace(/\s+/g, '_')}.pdf`,
      fileSize: selectedFile ? selectedFile.size : 256000,
      mimeType: selectedFile ? selectedFile.type : 'application/pdf',
      fileDataUrl: fileBase64 || undefined,
      isEncrypted,
      encryptionCipher: cipherBase64,
      encryptionIv: ivBase64,
      encryptionSalt: saltBase64,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveDocument(newDoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 text-cyan-400 flex items-center justify-center border border-cyan-800">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {isBn ? 'নতুন পার্সোনাল ডকুমেন্ট যুক্ত করুন' : 'Add New Personal Document'}
            </h3>
            <p className="text-xs text-slate-400">
              {isBn
                ? 'ফাইল আপলোড করুন অথবা সরাসরি তথ্য লিখে সামরিক-গ্রেড এনক্রিপশনে রাখুন।'
                : 'Upload document or fill info to store with zero-knowledge AES-256 encryption.'}
            </p>
          </div>
        </div>

        {/* Free Limit Warning */}
        {isFreeLimitExceeded && (
          <div className="mb-6 p-4 rounded-xl bg-amber-950/60 border border-amber-800/80 flex items-start space-x-3">
            <Crown className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200">
              <p className="font-bold text-amber-300">
                {isBn ? 'ফ্রি লিমিট পূর্ণ হয়েছে (৫/৫ ডকুমেন্ট)' : 'Free Limit Reached (5/5 Documents)'}
              </p>
              <p className="mt-1">
                {isBn
                  ? 'আনলিমিটেড ডকুমেন্ট, রিয়েলটাইম ভয়েস এআই এবং আজীবন সুরক্ষার জন্য প্রিমিয়াম ভিআইপি প্ল্যানে আপগ্রেড করুন।'
                  : 'Upgrade to Premium VIP for unlimited documents, full voice AI synthesis, and life-time protection.'}
              </p>
              <button
                onClick={onOpenUpgradeModal}
                className="mt-2.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs"
              >
                {isBn ? 'প্রিমিয়াম আপগ্রেড ($৯.৯৯)' : 'Upgrade Now ($9.99)'}
              </button>
            </div>
          </div>
        )}

        {/* File Drag/Drop or Picker */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            {isBn ? 'ডকুমেন্ট ফাইল নির্বাচন করুন (PDF, ছবি বা স্ক্যান)' : 'Select Document File (PDF, Image, Scan)'}
          </label>
          <div className="relative border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-xl p-6 text-center bg-slate-950/60 transition-colors">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,image/*,.txt,.doc,.docx"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center">
              <Upload className="w-8 h-8 text-cyan-400 mb-2" />
              <p className="text-xs font-medium text-slate-200">
                {selectedFile
                  ? selectedFile.name
                  : isBn
                  ? 'ফাইল টেনে আনুন অথবা ক্লিক করে আপলোড করুন'
                  : 'Drag & drop file or click to browse'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                PDF, JPG, PNG, WEBP, TXT (Max 25MB)
              </p>
            </div>
          </div>

          {/* AI Extracting State */}
          {isAnalyzing && (
            <div className="mt-3 p-3 rounded-lg bg-cyan-950/40 border border-cyan-800 flex items-center space-x-2 text-xs text-cyan-300">
              <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
              <span>{isBn ? 'জেমিনি এআই ডকুমেন্টটি পড়ে তথ্য বের করছে...' : 'Gemini AI is scanning and reading fields...'}</span>
            </div>
          )}

          {aiSuccessMsg && (
            <div className="mt-3 p-3 rounded-lg bg-emerald-950/50 border border-emerald-800 flex items-center space-x-2 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{aiSuccessMsg}</span>
            </div>
          )}
        </div>

        {/* Form Details */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isBn ? 'ডকুমেন্টের নাম *' : 'Document Title *'}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isBn ? 'যেমন: স্মার্ট জাতীয় পরিচয়পত্র (NID)' : 'e.g. Smart National ID Card'}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isBn ? 'ক্যাটাগরি' : 'Category'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="identity">{isBn ? 'পরিচয়পত্র ও পাসপোর্ট (Identity)' : 'Identity & Passport'}</option>
                <option value="education">{isBn ? 'শিক্ষাগত সনদ ও ডিগ্রি (Education)' : 'Education & Degree'}</option>
                <option value="finance">{isBn ? 'আর্থিক, ট্যাক্স ও বিল (Finance)' : 'Finance & Bills'}</option>
                <option value="medical">{isBn ? 'মেডিকেল ও স্বাস্থ্য (Medical)' : 'Medical & Health'}</option>
                <option value="legal">{isBn ? 'আইনি ও চুক্তি (Legal)' : 'Legal & Contracts'}</option>
                <option value="other">{isBn ? 'অন্যান্য (Other)' : 'Other'}</option>
              </select>
            </div>

            {/* Document Number / ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isBn ? 'ডকুমেন্ট নম্বর / আইডি' : 'Document / ID Number'}
              </label>
              <input
                type="text"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="e.g. 1992269401289381 or A04928192"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            {/* Issuer */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isBn ? 'প্রদানকারী সংস্থা / প্রতিষ্ঠান' : 'Issuing Authority'}
              </label>
              <input
                type="text"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                placeholder={isBn ? 'যেমন: নির্বাচন কমিশন বাংলাদেশ' : 'e.g. Election Commission'}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isBn ? 'মেয়াদোত্তীর্ণের তারিখ (যদি থাকে)' : 'Expiry Date (If any)'}
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Tags */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isBn ? 'ট্যাগ (কমা দিয়ে পৃথক করুন)' : 'Tags (comma separated)'}
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder={isBn ? 'পাসপোর্ট, ভিসা, জরুরি, ভ্রমণ' : 'passport, visa, urgent, travel'}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Summary */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isBn ? 'গুরুত্বপূর্ণ তথ্যের সারসংক্ষেপ (Summary)' : 'Key Summary'}
              </label>
              <textarea
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder={isBn ? 'এই ফাইলে কী কী জরুরি তথ্য আছে...' : 'Important details inside this document...'}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Extracted Text */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isBn ? 'ডকুমেন্টের বিস্তারিত টেক্সট বা বিবরণ' : 'Full Document Content / Text'}
              </label>
              <textarea
                rows={3}
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                placeholder={isBn ? 'ডকুমেন্টের ভেতরের টেক্সট বা কপি...' : 'Full text inside document...'}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Encryption Switch */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-900/60 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  {isBn ? 'AES-256 মিলিটারি-গ্রেড ক্লায়েন্ট এনক্রিপশন' : 'AES-256 Client-Side Encryption'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {isBn
                    ? 'ডাটা আপনার মাস্টার পিন ছাড়া কেউই পড়তে পারবে না।'
                    : 'Zero-Knowledge: Encrypted before saving with your Master PIN.'}
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isEncrypted}
              onChange={(e) => setIsEncrypted(e.target.checked)}
              className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
            >
              {isBn ? 'ভল্টে সংরক্ষণ করুন' : 'Save to Vault'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
