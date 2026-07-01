// src/components/Ui/Input.jsx
import React from 'react';

export default function Input({ label, type = 'text', value, onChange, placeholder, disabled, className = '', ...props }) {
  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="block text-[10px] text-gray-400 uppercase font-black tracking-wider">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-[#070b19] border border-gray-800 text-xs text-gray-200 rounded-xl px-4 py-2.5 font-sans placeholder-gray-600 focus:outline-none focus:border-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
        {...props}
      />
    </div>
  );
}