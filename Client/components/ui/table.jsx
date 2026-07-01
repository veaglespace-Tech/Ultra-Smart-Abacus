// src/components/Ui/Table.jsx
import React from 'react';

export default function Table({ headers, children, className = '' }) {
  return (
    <div className={`bg-[#0d1527]/40 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-800 bg-[#0d1527] text-[10px] uppercase font-black tracking-widest text-gray-400">
              {headers.map((header, idx) => (
                <th key={idx} className="py-4 px-6">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/40 text-xs text-gray-300">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
}