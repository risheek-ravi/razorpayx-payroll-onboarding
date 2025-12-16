import React, { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';

interface WelcomeFlashProps {
  name: string;
  show: boolean;
  onClose: () => void;
}

export const WelcomeFlash: React.FC<WelcomeFlashProps> = ({ name, show, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      // Auto dismiss after 3 seconds, or let user click
      const timer = setTimeout(() => {
        handleClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  const handleClose = () => {
    setVisible(false);
    // Wait for animation to finish before unmounting logic if needed
    setTimeout(onClose, 300);
  };

  if (!show && !visible) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
    >
      <div 
        className={`bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full text-center transform transition-all duration-300 ${visible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
        <p className="text-gray-600 text-lg">
          Hi <span className="font-bold text-blue-600">{name}</span>,<br/> 
          welcome to RazorpayX Payroll!
        </p>
        <button 
          onClick={handleClose}
          className="mt-6 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:text-sm"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};