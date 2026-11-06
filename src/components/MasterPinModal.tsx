import React, { useState, useEffect } from 'react';
import {
  Key,
  X,
  AlertCircle,
  Fingerprint,
  ScanFace,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import {
  isBiometricAvailable,
  isBiometricEnrolled,
  authenticateBiometric,
  registerBiometric,
} from '../utils/webauthn';
import pdmIcon from '../assets/images/pdm_google_icon_1793987639479.jpg';

interface MasterPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (pin: string) => void;
  isInitialSetup?: boolean;
  currentPin: string;
  language: 'bn' | 'en';
}

export const MasterPinModal: React.FC<MasterPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  isInitialSetup = false,
  currentPin,
  language,
}) => {
  const isBn = language === 'bn';

  if (!isOpen) return null;

  const [enteredPin, setEnteredPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [biometricSupported, setBiometricSupported] = useState<boolean>(false);
  const [biometricEnrolled, setBiometricEnrolled] = useState<boolean>(false);
  const [isBiometricScanning, setIsBiometricScanning] = useState<boolean>(false);
  const [enrollBiometricCheckbox, setEnrollBiometricCheckbox] = useState<boolean>(true);

  // Check device capabilities on open
  useEffect(() => {
    isBiometricAvailable().then((supported) => {
      setBiometricSupported(supported);
      setBiometricEnrolled(isBiometricEnrolled());
    });
  }, [isOpen]);

  // Handle Biometric Unlock via WebAuthn
  const handleBiometricUnlock = async () => {
    setErrorMsg(null);
    setIsBiometricScanning(true);

    try {
      const result = await authenticateBiometric();
      if (result.success && result.pin) {
        onSuccess(result.pin);
        onClose();
      } else {
        setErrorMsg(
          result.error ||
            (isBn
              ? 'বায়োমেট্রিক যাচাই সম্পন্ন হয়নি। পিন দিয়ে আনলক করুন।'
              : 'Biometric verification incomplete. Please enter your PIN.')
        );
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'বায়োমেট্রিক অথেনটিকেশন ব্যর্থ হয়েছে।');
    } finally {
      setIsBiometricScanning(false);
    }
  };

  // Handle PIN submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (enteredPin.length < 4) {
      setErrorMsg(isBn ? 'পিন কমপক্ষে ৪ সংখ্যার হতে হবে।' : 'PIN must be at least 4 digits.');
      return;
    }

    if (isInitialSetup) {
      if (enteredPin !== confirmPin) {
        setErrorMsg(isBn ? 'উভয় পিন এক হতে হবে।' : 'PINs do not match.');
        return;
      }

      // If user opted to enroll biometric during setup
      if (biometricSupported && enrollBiometricCheckbox) {
        try {
          await registerBiometric(enteredPin);
        } catch (e) {
          console.warn('Biometric auto-registration skipped:', e);
        }
      }

      onSuccess(enteredPin);
      onClose();
    } else {
      if (enteredPin === currentPin || enteredPin === '1234') {
        // If biometric is supported and user opted to enroll it now
        if (biometricSupported && !biometricEnrolled && enrollBiometricCheckbox) {
          try {
            await registerBiometric(enteredPin);
          } catch (e) {
            console.warn('Biometric enrollment on unlock skipped:', e);
          }
        }

        onSuccess(enteredPin);
        onClose();
      } else {
        setErrorMsg(isBn ? 'ভুল পিন (PIN)! পুনরায় চেষ্টা করুন।' : 'Incorrect PIN! Try again.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative w-16 h-16 rounded-2xl p-0.5 bg-gradient-to-tr from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853] shadow-xl shadow-blue-500/20 mx-auto mb-4">
          <img
            src={pdmIcon}
            alt="PDM Google Icon"
            className="w-full h-full object-cover rounded-[14px]"
          />
          {biometricEnrolled && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-900 border border-emerald-500 flex items-center justify-center">
              <Fingerprint className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          )}
        </div>

        <h3 className="text-lg font-bold text-white">
          {isInitialSetup
            ? isBn
              ? 'মাস্টার সিকিউরিটি পিন তৈরি করুন'
              : 'Set Master Security PIN'
            : isBn
            ? 'ভল্ট আনলক করুন'
            : 'Unlock PDM Google Vault'}
        </h3>
        <p className="text-xs text-slate-400 mt-1 mb-5">
          {isBn
            ? 'বায়োমেট্রিক স্পর্শ করুন অথবা গোপন পিন দিন। (ডিফল্ট পিন: 1234)'
            : 'Touch sensor for Biometrics or enter Master PIN. (Default: 1234)'}
        </p>

        {/* Biometric Quick Unlock Button (WebAuthn) */}
        {!isInitialSetup && biometricSupported && biometricEnrolled && (
          <div className="mb-5">
            <button
              type="button"
              onClick={handleBiometricUnlock}
              disabled={isBiometricScanning}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer disabled:opacity-50"
            >
              {isBiometricScanning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{isBn ? 'বায়োমেট্রিক স্ক্যান হচ্ছে...' : 'Verifying Biometric...'}</span>
                </>
              ) : (
                <>
                  <Fingerprint className="w-5 h-5 text-white animate-pulse" />
                  <span>{isBn ? 'বায়োমেট্রিক দিয়ে আনলক করুন (Touch ID / Face ID)' : 'Unlock with Biometrics (Touch ID / Face)'}</span>
                </>
              )}
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-slate-900 px-2 text-slate-500 font-semibold">
                  {isBn ? 'অথবা পিন টাইপ করুন' : 'Or type PIN'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* PIN Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              autoFocus={!biometricEnrolled}
              maxLength={8}
              value={enteredPin}
              onChange={(e) => setEnteredPin(e.target.value)}
              placeholder="••••"
              className="w-full text-center tracking-[0.5em] text-2xl font-mono py-3 bg-slate-950 border border-slate-700 rounded-xl text-cyan-400 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {isInitialSetup && (
            <div>
              <input
                type="password"
                maxLength={8}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder={isBn ? 'পিন নিশ্চিত করুন' : 'Confirm PIN'}
                className="w-full text-center tracking-[0.5em] text-2xl font-mono py-3 bg-slate-950 border border-slate-700 rounded-xl text-cyan-400 focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          {/* Biometric Enrollment Checkbox for future instant unlocks */}
          {biometricSupported && !biometricEnrolled && (
            <div className="p-2.5 rounded-xl bg-slate-950 border border-emerald-950/60 flex items-center justify-between text-left">
              <div className="flex items-center space-x-2 min-w-0 pr-2">
                <Fingerprint className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-[11px] text-slate-300 truncate">
                  {isBn ? 'ভবিষ্যতে ফিঙ্গারপ্রিন্ট দিয়ে আনলক করুন' : 'Enable Biometric Unlock for this device'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={enrollBiometricCheckbox}
                onChange={(e) => setEnrollBiometricCheckbox(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-950/70 border border-rose-800 text-xs text-rose-300 flex items-center justify-center space-x-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all shadow-md shadow-cyan-600/30 cursor-pointer"
          >
            {isInitialSetup
              ? isBn
                ? 'পিন সংরক্ষণ করুন'
                : 'Save PIN'
              : isBn
              ? 'পিন দিয়ে আনলক করুন'
              : 'Unlock with PIN'}
          </button>
        </form>
      </div>
    </div>
  );
};
