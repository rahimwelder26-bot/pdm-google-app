import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  FileText,
  ExternalLink,
  Bot,
  AlertCircle,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import { VaultDocument, AIAskResponse, SubscriptionTier } from '../types';
import pdmIcon from '../assets/images/pdm_google_icon_1793987639479.jpg';

interface SmartVoiceAssistantProps {
  documents: VaultDocument[];
  language: 'bn' | 'en';
  tier: SubscriptionTier;
  onSelectDocument: (doc: VaultDocument) => void;
  onOpenUpgradeModal: () => void;
}

export const SmartVoiceAssistant: React.FC<SmartVoiceAssistantProps> = ({
  documents,
  language,
  tier,
  onSelectDocument,
  onOpenUpgradeModal,
}) => {
  const isBn = language === 'bn';

  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState<AIAskResponse | null>(null);
  const [lastQuery, setLastQuery] = useState<string>('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'bn' ? 'bn-BD' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInputQuery(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError(
            isBn
              ? 'মাইক্রোফোন পারমিশন প্রয়োজন। ব্রাউজার সেটিংসে অনুমতি দিন।'
              : 'Microphone permission required.'
          );
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language, isBn]);

  // Toggle voice listening
  const handleToggleVoice = () => {
    if (!recognitionRef.current) {
      setSpeechError(
        isBn
          ? 'আপনার ব্রাউজারে ভয়েস রিকগনিশন সক্রিয় নয়। নিচে লিখে প্রশ্ন করুন।'
          : 'Voice recognition is not supported in this browser. Please type your query.'
      );
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setSpeechError(null);
      try {
        recognitionRef.current.lang = language === 'bn' ? 'bn-BD' : 'en-US';
        recognitionRef.current.start();
      } catch (e) {
        console.error('Failed to start recognition:', e);
      }
    }
  };

  // Submit query to Gemini AI
  const handleSubmitQuery = async (queryText?: string) => {
    const queryToUse = (queryText || inputQuery).trim();
    if (!queryToUse) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setIsProcessing(true);
    setLastQuery(queryToUse);
    setSpeechError(null);

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryToUse,
          documents: documents.map((d) => ({
            id: d.id,
            title: d.title,
            category: d.category,
            documentNumber: d.documentNumber,
            issueDate: d.issueDate,
            expiryDate: d.expiryDate,
            tags: d.tags,
            summary: d.summary,
            extractedText: d.extractedText,
          })),
          language,
        }),
      });

      const data = await res.json();
      if (data.success && data.result) {
        setAiResponse(data.result);

        // Optional auto-speak for Premium users
        if (tier === 'premium' && window.speechSynthesis) {
          playSpeech(data.result.answer);
        }
      } else {
        throw new Error(data.error || 'Failed to retrieve AI response');
      }
    } catch (err: any) {
      console.error('Query error:', err);
      setSpeechError(err.message || 'প্রশ্নটির উত্তর খুঁজতে সমস্যা হয়েছে।');
    } finally {
      setIsProcessing(false);
    }
  };

  // Text-To-Speech Synthesis Readout
  const playSpeech = (text: string) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    // Strip markdown formatting for cleaner audio
    const cleanText = text
      .replace(/[*#_`[\]]/g, '')
      .replace(/\n+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === 'bn' ? 'bn-BD' : 'en-US';
    utterance.rate = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Copy AI response text
  const handleCopy = () => {
    if (aiResponse?.answer) {
      navigator.clipboard.writeText(aiResponse.answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Preset quick query chips
  const quickPrompts = isBn
    ? [
        'আমার পাসপোর্ট নম্বর কত?',
        'বিদ্যুৎ বিল কত টাকা এসেছে?',
        'রক্তের গ্রুপ ও জরুরি অ্যালার্জি কী?',
        'বিএসসি সিজিপিএ (CGPA) কত?',
        'টিন (TIN) সার্টিফিকেট নম্বর',
        'কোনো কাগজপত্রের কি মেয়াদ শেষ?',
      ]
    : [
        'What is my Passport number?',
        'What is the electricity bill amount?',
        'What is my blood group and allergy?',
        'What is my BSc graduation CGPA?',
        'What is my TIN tax number?',
        'Are any documents expiring soon?',
      ];

  // Matched document objects
  const matchedDocs = (aiResponse?.matchedDocumentIds || [])
    .map((id) => documents.find((d) => d.id === id))
    .filter(Boolean) as VaultDocument[];

  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-cyan-900/40 shadow-2xl p-4 sm:p-6 mb-8 overflow-hidden">
      {/* Subtle security mesh accent */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="relative flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl p-0.5 bg-gradient-to-tr from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853] shadow-md shadow-blue-500/20 shrink-0">
            <img
              src={pdmIcon}
              alt="PDM Google Icon"
              className="w-full h-full object-cover rounded-[10px]"
            />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
              <span>{isBn ? 'PDM Google এআই ভয়েস অ্যাসিস্ট্যান্ট' : 'PDM Google AI Voice Assistant'}</span>
              <span className="flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                <Zap className="w-3 h-3 mr-0.5 text-emerald-400" />
                Gemini 3.8 Flash
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {isBn
                ? 'আপনার ভয়েস বা টেক্সট শুনলেই ভল্টের সকল ফাইল ঘেঁটে তাৎক্ষণিক নির্ভুল উত্তর দেবে।'
                : 'Ask in voice or text; AI scans your vault documents and delivers exact data instantly.'}
            </p>
          </div>
        </div>

        {/* Free vs Premium Voice badge */}
        {tier === 'free' ? (
          <button
            onClick={onOpenUpgradeModal}
            className="text-xs flex items-center space-x-1 px-2.5 py-1 rounded-md bg-amber-950/60 text-amber-300 border border-amber-800/60 hover:bg-amber-900/60 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isBn ? 'প্রিমিয়াম: অটো অডিও ভয়েস ও হাইপার স্পিড' : 'VIP: Auto Voice & Hyper Speed'}</span>
          </button>
        ) : (
          <span className="text-xs flex items-center space-x-1 px-2.5 py-1 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isBn ? 'প্রিমিয়াম ভয়েস সক্রিয়' : 'Premium Voice Active'}</span>
          </span>
        )}
      </div>

      {/* Main Input Bar with Mic */}
      <div className="relative">
        <div className="relative flex items-center rounded-xl bg-slate-950 border-2 border-slate-700/80 focus-within:border-cyan-500 shadow-inner transition-all">
          {/* Big Interactive Mic Button */}
          <button
            type="button"
            onClick={handleToggleVoice}
            disabled={isProcessing}
            title={
              isListening
                ? (isBn ? 'রেকর্ডিং বন্ধ করুন' : 'Stop Listening')
                : (isBn ? 'ভয়েস কমান্ড শুরু করুন' : 'Start Voice Command')
            }
            className={`relative p-3.5 sm:p-4 rounded-l-xl transition-all flex items-center justify-center ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/50'
                : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-900'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
              </>
            ) : (
              <Mic className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmitQuery();
              }
            }}
            placeholder={
              isListening
                ? (isBn ? 'আপনার ভয়েস শোনা হচ্ছে... বলুন...' : 'Listening to your voice... Speak now...')
                : (isBn
                    ? 'ভয়েসে বলুন অথবা লিখুন: "আমার পাসপোর্ট নম্বর কত?" বা "বিদ্যুৎ বিল কত?"'
                    : 'Speak or type: e.g. "What is my passport number?" or "Electricity bill?"')
            }
            className="flex-1 bg-transparent px-3 py-3.5 sm:py-4 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={() => handleSubmitQuery()}
            disabled={isProcessing || !inputQuery.trim()}
            className="mr-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:hover:bg-cyan-600 text-white font-semibold text-xs sm:text-sm flex items-center space-x-1.5 shadow-md shadow-cyan-600/30 transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isBn ? 'খুঁজুন' : 'Search'}</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        {/* Listening wave indicator */}
        {isListening && (
          <div className="mt-2 flex items-center justify-between px-3 py-1.5 bg-rose-950/40 border border-rose-800/40 rounded-lg text-xs text-rose-300 animate-fadeIn">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>{isBn ? '🎙️ মাইক্রোফোন সক্রিয়: বাংলা অথবা ইংরেজিতে কথা বলুন' : '🎙️ Microphone Active: Speak in Bengali or English'}</span>
            </div>
            <button
              onClick={() => {
                if (recognitionRef.current) recognitionRef.current.stop();
                setIsListening(false);
                handleSubmitQuery();
              }}
              className="text-xs underline hover:text-white"
            >
              {isBn ? 'এখনই পাঠান' : 'Submit now'}
            </button>
          </div>
        )}

        {/* Speech / API Error alert */}
        {speechError && (
          <div className="mt-2 flex items-center space-x-2 text-xs text-rose-400 bg-rose-950/50 border border-rose-900/60 rounded-lg p-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{speechError}</span>
          </div>
        )}
      </div>

      {/* Quick Suggested Prompt Pills */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] text-slate-400 font-medium mr-1">
          {isBn ? 'দ্রুত জিজ্ঞাসা:' : 'Quick Ask:'}
        </span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setInputQuery(prompt);
              handleSubmitQuery(prompt);
            }}
            disabled={isProcessing}
            className="text-xs px-2.5 py-1 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/50 transition-all text-left"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* AI Result Card Display */}
      {aiResponse && (
        <div className="mt-6 rounded-xl bg-slate-950/90 border border-cyan-800/60 p-4 sm:p-5 shadow-xl transition-all animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-cyan-900/50 text-cyan-400 border border-cyan-700">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                {isBn ? 'এআই উত্তর ও তথ্য উদ্ধৃতি' : 'AI Verified Response & Citations'}
              </span>
              {aiResponse.confidence && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                  {isBn ? 'নির্ভুলতা: ১০০%' : `Confidence: ${aiResponse.confidence}`}
                </span>
              )}
            </div>

            {/* Read aloud & Copy buttons */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => playSpeech(aiResponse.answer)}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  isSpeaking
                    ? 'bg-cyan-900/60 text-cyan-300 border-cyan-600'
                    : 'bg-slate-900 text-slate-300 hover:text-white border-slate-800 hover:bg-slate-800'
                }`}
                title={isBn ? 'ভয়েসে শুনুন (Text-To-Speech)' : 'Listen (Text-To-Speech)'}
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-cyan-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
                <span>{isSpeaking ? (isBn ? 'থামান' : 'Stop') : (isBn ? 'শুনুন' : 'Listen')}</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
                title={isBn ? 'কপি করুন' : 'Copy'}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'কপি' : 'Copy')}</span>
              </button>
            </div>
          </div>

          {/* Question asked tag */}
          <div className="mb-2 text-xs text-slate-400 italic">
            "{lastQuery}"
          </div>

          {/* Render Answer Text */}
          <div className="text-slate-100 text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal">
            {aiResponse.answer}
          </div>

          {/* Direct extracted data key-value pills */}
          {aiResponse.directDataExtracted && Object.keys(aiResponse.directDataExtracted).length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap gap-2">
              {Object.entries(aiResponse.directDataExtracted).map(([k, v], i) => (
                <div
                  key={i}
                  className="flex items-center space-x-1 text-xs px-2.5 py-1 rounded-md bg-cyan-950/70 border border-cyan-800 text-cyan-200"
                >
                  <span className="font-semibold text-cyan-400">{k}:</span>
                  <span className="font-mono">{String(v)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Matched Document Cards (Direct access to proof) */}
          {matchedDocs.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <div className="text-xs font-medium text-slate-400 mb-2 flex items-center space-x-1">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isBn ? 'উৎস ডকুমেন্ট (সরাসরি ভল্ট থেকে যাচাই করুন):' : 'Source Documents in Vault:'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {matchedDocs.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => onSelectDocument(doc)}
                    className="group flex items-center justify-between p-2.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-7 h-7 rounded bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-cyan-950 transition-colors">
                        <FileText className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 truncate">
                          {doc.title}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">
                          ID: {doc.documentNumber || doc.fileName}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-cyan-400 group-hover:text-cyan-300 shrink-0 ml-2 flex items-center">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Follow-up suggestions */}
          {aiResponse.suggestedFollowUps && aiResponse.suggestedFollowUps.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-800/60 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                {isBn ? 'পরবর্তী প্রশ্ন:' : 'Follow-up:'}
              </span>
              {aiResponse.suggestedFollowUps.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputQuery(q);
                    handleSubmitQuery(q);
                  }}
                  className="text-xs px-2.5 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 text-left transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
