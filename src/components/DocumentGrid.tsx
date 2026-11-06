import React, { useState } from 'react';
import {
  Search,
  Filter,
  Grid,
  List,
  Lock,
  Unlock,
  Calendar,
  Building,
  Eye,
  Trash2,
  AlertTriangle,
  FileText,
  FileCheck,
  Shield,
  Plus,
  Download,
} from 'lucide-react';
import { VaultDocument, DocumentCategory } from '../types';

interface DocumentGridProps {
  documents: VaultDocument[];
  language: 'bn' | 'en';
  isVaultLocked: boolean;
  onSelectDocument: (doc: VaultDocument) => void;
  onDeleteDocument: (id: string) => void;
  onOpenAddModal: () => void;
  onOpenBackupModal?: () => void;
  onAskAiAboutDoc: (title: string) => void;
}

export const DocumentGrid: React.FC<DocumentGridProps> = ({
  documents,
  language,
  isVaultLocked,
  onSelectDocument,
  onDeleteDocument,
  onOpenAddModal,
  onOpenBackupModal,
  onAskAiAboutDoc,
}) => {
  const isBn = language === 'bn';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories: { id: string; labelBn: string; labelEn: string }[] = [
    { id: 'all', labelBn: 'সকল ডকুমেন্টস', labelEn: 'All Documents' },
    { id: 'identity', labelBn: 'পরিচয়পত্র ও পাসপোর্ট', labelEn: 'ID & Passports' },
    { id: 'education', labelBn: 'শিক্ষা ও ডিগ্রি', labelEn: 'Education' },
    { id: 'finance', labelBn: 'আর্থিক ও বিল', labelEn: 'Finance & Bills' },
    { id: 'medical', labelBn: 'চিকিৎসা ও স্বাস্থ্য', labelEn: 'Medical' },
    { id: 'legal', labelBn: 'আইনি ও চুক্তি', labelEn: 'Legal & Contracts' },
    { id: 'other', labelBn: 'অন্যান্য', labelEn: 'Other' },
  ];

  // Filtering documents
  const filteredDocs = documents.filter((doc) => {
    const matchesCategory =
      selectedCategory === 'all' || doc.category === selectedCategory;
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      doc.title.toLowerCase().includes(q) ||
      (doc.documentNumber && doc.documentNumber.toLowerCase().includes(q)) ||
      (doc.issuer && doc.issuer.toLowerCase().includes(q)) ||
      (doc.tags && doc.tags.some((t) => t.toLowerCase().includes(q))) ||
      (doc.summary && doc.summary.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  const getCategoryColor = (cat: DocumentCategory) => {
    switch (cat) {
      case 'identity':
        return 'bg-blue-950/80 text-blue-300 border-blue-800';
      case 'education':
        return 'bg-purple-950/80 text-purple-300 border-purple-800';
      case 'finance':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
      case 'medical':
        return 'bg-rose-950/80 text-rose-300 border-rose-800';
      case 'legal':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div>
      {/* Search, Category Filter & Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              isBn
                ? 'ডকুমেন্ট নাম, নম্বর বা ট্যাগ দিয়ে খুঁজুন...'
                : 'Search document name, ID number, or tags...'
            }
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* View mode toggle & Add Button */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-slate-800 text-cyan-400'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={isBn ? 'গ্রিড ভিউ' : 'Grid View'}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-slate-800 text-cyan-400'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={isBn ? 'লিস্ট ভিউ' : 'List View'}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {onOpenBackupModal && (
            <button
              onClick={onOpenBackupModal}
              title={isBn ? 'এনক্রিপ্টেড ব্যাকআপ এক্সপোর্ট ও রিস্টোর' : 'Export/Restore Encrypted Backup'}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">{isBn ? 'ব্যাকআপ' : 'Backup'}</span>
            </button>
          )}

          <button
            onClick={onOpenAddModal}
            className="flex items-center space-x-1.5 px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isBn ? 'ডকুমেন্ট যোগ করুন' : 'Add Document'}</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
        <Filter className="w-4 h-4 text-slate-500 shrink-0 ml-1" />
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              selectedCategory === c.id
                ? 'bg-cyan-950 text-cyan-300 border-cyan-700 shadow-sm shadow-cyan-900/50'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-850'
            }`}
          >
            {isBn ? c.labelBn : c.labelEn}
          </button>
        ))}
      </div>

      {/* If Vault is Locked */}
      {isVaultLocked && (
        <div className="p-8 text-center rounded-2xl bg-slate-900/50 border border-slate-800 mb-8">
          <div className="w-12 h-12 rounded-full bg-rose-950/60 border border-rose-800/80 text-rose-400 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">
            {isBn ? 'ভল্ট লক করা অবস্থায় রয়েছে' : 'Your Vault is Currently Locked'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            {isBn
              ? 'নিরাপত্তা নিশ্চিত করতে ফাইলগুলো এনক্রিপ্ট করা রয়েছে। দেখতে উপরে ভল্ট আনলক বাটনে ক্লিক করে আপনার মাস্টার পিন (PIN) প্রদান করুন।'
              : 'Files are zero-knowledge encrypted for privacy. Click the Unlock button in the header and enter your Master PIN.'}
          </p>
        </div>
      )}

      {/* Empty State */}
      {filteredDocs.length === 0 && !isVaultLocked && (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800">
          <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">
            {isBn ? 'কোনো ডকুমেন্ট পাওয়া যায়নি' : 'No documents found'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {searchTerm
              ? (isBn ? 'অনুগ্রহ করে ভিন্ন কোনো শব্দ দিয়ে খুঁজুন।' : 'Try searching with different keywords.')
              : (isBn ? 'আপনার প্রথম গুরুত্বপূর্ণ ফাইলটি এখানে আপলোড করুন।' : 'Upload your first sensitive document now.')}
          </p>
          <button
            onClick={onOpenAddModal}
            className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold"
          >
            {isBn ? 'নতুন ডকুমেন্ট আপলোড করুন' : 'Upload Document'}
          </button>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocs.map((doc) => {
            const isExpiringSoon =
              doc.expiryDate &&
              new Date(doc.expiryDate).getTime() - Date.now() < 90 * 24 * 3600 * 1000;

            return (
              <div
                key={doc.id}
                className="group relative rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/60 transition-all duration-200 p-5 flex flex-col justify-between shadow-lg hover:shadow-cyan-950/40"
              >
                <div>
                  {/* Card Header: Category & Lock */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getCategoryColor(
                        doc.category
                      )}`}
                    >
                      {doc.category.toUpperCase()}
                    </span>

                    <div className="flex items-center space-x-1.5">
                      {doc.isEncrypted ? (
                        <span
                          className="flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                          title="AES-256 Military Grade Encrypted"
                        >
                          <Lock className="w-3 h-3 text-emerald-400" />
                          <span>AES-256</span>
                        </span>
                      ) : (
                        <span
                          className="flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400"
                          title="Unencrypted"
                        >
                          <Unlock className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Document Number */}
                  <h4
                    onClick={() => onSelectDocument(doc)}
                    className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors cursor-pointer line-clamp-1"
                  >
                    {doc.title}
                  </h4>

                  {doc.documentNumber && (
                    <p className="mt-1 text-xs font-mono text-cyan-400/90 flex items-center space-x-1">
                      <span>ID:</span>
                      <span className="font-semibold">{doc.documentNumber}</span>
                    </p>
                  )}

                  {doc.issuer && (
                    <p className="mt-1 text-xs text-slate-400 flex items-center space-x-1">
                      <Building className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">{doc.issuer}</span>
                    </p>
                  )}

                  {/* Summary / Preview */}
                  <p className="mt-2.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {doc.summary || doc.extractedText || 'ডকুমেন্টের তথ্য সুরক্ষিত রাখা হয়েছে।'}
                  </p>

                  {/* Expiry Alert Badge */}
                  {doc.expiryDate && (
                    <div
                      className={`mt-3 inline-flex items-center space-x-1 text-[11px] px-2 py-0.5 rounded-md ${
                        isExpiringSoon
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isExpiringSoon && <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />}
                      <Calendar className="w-3 h-3 shrink-0" />
                      <span>
                        {isBn ? 'মেয়াদ:' : 'Expiry:'} {doc.expiryDate}
                      </span>
                    </div>
                  )}

                  {/* Tags */}
                  {doc.tags && doc.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {doc.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 font-mono"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => onSelectDocument(doc)}
                    className="flex items-center space-x-1 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isBn ? 'সম্পূর্ণ দেখুন' : 'View Full'}</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onAskAiAboutDoc(doc.title)}
                      className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title={isBn ? 'এআই কে এই ফাইল নিয়ে প্রশ্ন করুন' : 'Ask AI about this file'}
                    >
                      {isBn ? 'এআই সার্চ' : 'Ask AI'}
                    </button>

                    <button
                      onClick={() => onDeleteDocument(doc.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                      title={isBn ? 'মুছে ফেলুন' : 'Delete'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all gap-3"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4
                      onClick={() => onSelectDocument(doc)}
                      className="text-sm font-bold text-white hover:text-cyan-300 transition-colors cursor-pointer truncate"
                    >
                      {doc.title}
                    </h4>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border ${getCategoryColor(
                        doc.category
                      )}`}
                    >
                      {doc.category}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 text-xs text-slate-400 mt-1">
                    {doc.documentNumber && <span className="font-mono text-cyan-400">ID: {doc.documentNumber}</span>}
                    {doc.issuer && <span>{doc.issuer}</span>}
                    {doc.expiryDate && <span>Expiry: {doc.expiryDate}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => onSelectDocument(doc)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-950 text-cyan-400 text-xs font-medium border border-slate-700 hover:border-cyan-600 transition-all"
                >
                  {isBn ? 'দেখুন' : 'View'}
                </button>
                <button
                  onClick={() => onDeleteDocument(doc.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
