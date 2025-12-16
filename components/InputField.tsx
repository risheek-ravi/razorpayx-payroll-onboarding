import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const InputField: React.FC<InputFieldProps> = ({ label, error, className, ...props }) => {
  return (
    <div className={`mb-4 ${className || ''}`}>
      <div 
        className={`
          group relative w-full rounded-t-md bg-gray-100 px-4 py-2 
          border-b-2 transition-colors duration-200
          ${error ? 'border-red-500 bg-red-50' : 'border-gray-300 focus-within:border-blue-600 focus-within:bg-blue-50/30'}
        `}
      >
        <label 
          htmlFor={props.id || props.name}
          className={`
            block text-xs font-medium mb-1 transition-colors
            ${error ? 'text-red-500' : 'text-gray-500 group-focus-within:text-blue-600'}
          `}
        >
          {label}
        </label>
        <input
          {...props}
          className="block w-full border-none bg-transparent p-0 text-gray-900 placeholder-transparent focus:ring-0 sm:text-sm font-medium outline-none"
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};