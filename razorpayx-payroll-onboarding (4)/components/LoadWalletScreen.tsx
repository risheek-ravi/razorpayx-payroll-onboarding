
import React from 'react';
import { ArrowLeft, Copy, Wallet, Info, Landmark } from 'lucide-react';

interface LoadWalletScreenProps {
  onBack: () => void;
}

export const LoadWalletScreen: React.FC<LoadWalletScreenProps> = ({ onBack }) => {
  
  const accountDetails = {
    beneficiaryName: "Razorpay Software Private Limited",
    bankName: "HDFC Bank",
    accountNumber: "765432109876543",
    ifsc: "HDFC0000123",
    accountType: "Current Account",
    bankAddress: "HDFC Bank, Lower Parel, Mumbai, Maharashtra"
  };

  const sourceAccounts = [
    { accountNumber: "12345678901234", beneficiary: "Amit Sharma" }
  ];

  const copyToClipboard = (text: string) => {
    // navigator.clipboard.writeText(text); // In a real app
    alert(`Copied: ${text}`);
  };

  return (
    <div className="w-full max-w-md bg-white sm:shadow-lg sm:rounded-xl sm:overflow-hidden h-screen sm:h-auto flex flex-col mx-auto relative">
      
      {/* Header */}
      <div className="px-4 py-4 flex items-center shadow-sm relative z-10 bg-white border-b border-gray-100">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors mr-2"
        >
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Load Wallet</h1>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 pb-6">
        
        {/* Balance Card */}
        <div className="bg-white p-6 border-b border-gray-100">
           <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">Current Balance</p>
           <h2 className="text-3xl font-bold text-gray-900">₹ 2,500.00</h2>
        </div>

        <div className="p-4 space-y-6">

          {/* Transfer Instructions */}
          <div>
             <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
               <Landmark className="w-4 h-4 text-blue-600" />
               Transfer to this account
             </h3>
             <p className="text-xs text-gray-500 mb-3 leading-relaxed">
               To transfer money, please wire it to the following account via a validated source account (listed below).
             </p>

             <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-50 overflow-hidden">
                <DetailRow 
                  label="Beneficiary" 
                  value={accountDetails.beneficiaryName} 
                  onCopy={() => copyToClipboard(accountDetails.beneficiaryName)} 
                />
                <DetailRow 
                  label="Bank Name" 
                  value={accountDetails.bankName} 
                />
                <DetailRow 
                  label="Account Number" 
                  value={accountDetails.accountNumber} 
                  onCopy={() => copyToClipboard(accountDetails.accountNumber)} 
                  highlight
                />
                <DetailRow 
                  label="IFSC Code" 
                  value={accountDetails.ifsc} 
                  onCopy={() => copyToClipboard(accountDetails.ifsc)} 
                  highlight
                />
                <DetailRow 
                  label="Account Type" 
                  value={accountDetails.accountType} 
                />
                 <div className="p-4">
                   <p className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">Bank Address</p>
                   <p className="text-xs text-gray-600 leading-relaxed">{accountDetails.bankAddress}</p>
                 </div>
             </div>
          </div>

          {/* Important Info Box */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 space-y-3">
             <div className="flex gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-xs text-blue-900 leading-relaxed">
                    Please initiate the transfer from your company bank account. Transfers are usually completed within 24 hours.
                  </p>
                  <p className="text-xs text-blue-900 leading-relaxed">
                    <strong>Note:</strong> We are dependent on the banking system to receive funds. If funds haven't reflected after 24 hours, please email <span className="text-blue-600 underline cursor-pointer">xpayroll@razorpay.com</span>.
                  </p>
                  <p className="text-xs text-blue-800/70 italic">
                    NEFT and RTGS transfers might not work on bank holidays.
                  </p>
                </div>
             </div>
          </div>

          {/* Validated Source Accounts */}
          <div>
             <h3 className="text-sm font-bold text-gray-900 mb-2">Validated Source Accounts</h3>
             <p className="text-xs text-gray-500 mb-3">
               These are the validated and whitelisted accounts from which you can transfer funds to RazorpayX Payroll.
             </p>

             <div className="space-y-3">
                {sourceAccounts.map((acc, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                     <div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Account Number</p>
                        <p className="text-sm font-bold text-gray-900 font-mono tracking-tight">{acc.accountNumber}</p>
                        <p className="text-xs text-gray-500 mt-1">Beneficiary: {acc.beneficiary}</p>
                     </div>
                     <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                        <Wallet className="w-4 h-4 text-green-600" />
                     </div>
                  </div>
                ))}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const DetailRow = ({ label, value, onCopy, highlight }: { label: string, value: string, onCopy?: () => void, highlight?: boolean }) => (
  <div className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
     <div className="flex-1 pr-4">
       <p className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">{label}</p>
       <p className={`text-sm font-bold ${highlight ? 'text-blue-700' : 'text-gray-900'} break-words`}>{value}</p>
     </div>
     {onCopy && (
       <button onClick={onCopy} className="p-2 hover:bg-gray-100 rounded-lg text-blue-600 transition-colors flex-shrink-0">
         <Copy className="w-4 h-4" />
       </button>
     )}
  </div>
);
