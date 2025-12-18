import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { InputField } from './InputField';
import { InputName } from '../types';

interface BusinessDetailsScreenProps {
  onContinue: (data: { name: string; businessName: string; businessEmail: string }) => void;
  isSubmitting: boolean;
}

export const BusinessDetailsScreen: React.FC<BusinessDetailsScreenProps> = ({ onContinue, isSubmitting }) => {
  const [formData, setFormData] = useState({
    name: 'DEMO',
    businessName: 'XYZ Pvt Ltd',
    businessEmail: 'xyz@demo.com',
  });

  const [errors, setErrors] = useState<Partial<Record<InputName, string>>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as InputName]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<InputName, string>> = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business Name is required';
      isValid = false;
    }

    if (!formData.businessEmail.trim()) {
      newErrors.businessEmail = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.businessEmail)) {
      newErrors.businessEmail = 'Invalid email format';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onContinue(formData);
  };

  return (
    <div className="w-full max-w-md bg-white sm:shadow-lg sm:rounded-xl sm:overflow-hidden h-screen sm:h-auto flex flex-col mx-auto">
      {/* Header */}
      <div className="px-6 pt-6 pb-2 flex items-center">
        <button className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Business Details</h1>
          <p className="text-gray-500 text-sm leading-tight">
            Please provide details as asked below for unique account creation
          </p>
        </div>

        <div className="space-y-2">
          <InputField
            label="Your Name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleInputChange}
            error={errors.name}
            placeholder="e.g. John Doe"
          />

          <InputField
            label="Business Name"
            name="businessName"
            type="text"
            value={formData.businessName}
            onChange={handleInputChange}
            error={errors.businessName}
            placeholder="e.g. Acme Corp"
          />

          <InputField
            label="Business Email ID"
            name="businessEmail"
            type="email"
            value={formData.businessEmail}
            onChange={handleInputChange}
            error={errors.businessEmail}
            placeholder="e.g. john@acme.com"
          />
        </div>

        <div className="mt-auto pt-8">
            <p className="text-center text-xs text-gray-400 mb-4">
            By continuing you agree to <a href="#" className="text-blue-600 font-medium">Terms & Conditions</a>
          </p>
          
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`
              w-full rounded-md py-3.5 text-white font-semibold text-lg shadow-sm transition-all
              ${isSubmitting ? 'bg-blue-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'}
            `}
          >
            {isSubmitting ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};
