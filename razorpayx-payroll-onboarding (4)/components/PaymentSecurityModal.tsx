
import React, { useState, useEffect, useRef } from 'react';
import { Lock, Loader2, CheckCircle2 } from 'lucide-react';

interface PaymentSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount?: number;
}

type Step = 'preparing' | 'otp_input' | 'processing' | 'success';

export const PaymentSecurityModal: React.FC<PaymentSecurityModalProps> = ({ isOpen, onClose, onSuccess, amount }) => {
  const [step, setStep] = useState<Step>('preparing');
  const [otp, setOtp] = useState(['', '', '', '']);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setStep('preparing');
      setOtp(['', '', '', '']);
      // 1.5s Loading Screen
      const timer = setTimeout(() => {
        setStep('otp_input');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (step === 'otp_input' && inputsRef.current[0]) {
      inputsRef.current[0]?.focus();
    }
  }, [step]);

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }

    // Check completion
    if (newOtp.every(d => d !== '') && index === 3 && value) {
      setTimeout(() => startProcessing(), 300);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const startProcessing = () => {
    setStep('processing');
    // 5s Processing Screen
    setTimeout(() => {
      setStep('success');
      // Auto close after showing success for a bit
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }, 5000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-2xl p-8 flex flex-col items-center shadow-2xl relative overflow-hidden">
        
        {step === 'preparing' && (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Securing connection...</p>
          </div>
        )}

        {step === 'otp_input' && (
          <div className="flex flex-col items-center w-full animate-in zoom-in-95 duration-300">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-600">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Verify Payment</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Please enter the 4-digit PIN to authorize this payment{amount ? ` of ₹${amount}` : ''}.
            </p>

            <div className="flex gap-4 mb-8">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={el => inputsRef.current[idx] = el}
                  type="password"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:ring-0 outline-none transition-all"
                />
              ))}
            </div>
            
            <button onClick={onClose} className="text-sm text-gray-400 font-medium hover:text-gray-600">
              Cancel
            </button>
          </div>
        )}

        {step === 'processing' && (
          <div className="flex flex-col items-center py-8 animate-in fade-in duration-300">
            <div className="relative mb-6">
               <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
               <div className="w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Processing Payment</h3>
            <p className="text-sm text-gray-500">Please do not close this window</p>
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center py-6 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Payment Successful</h3>
          </div>
        )}

      </div>
    </div>
  );
};
