import React from "react";

export const Card = ({ children, className = "" }) => {
  return (
    <div className={`bg-slate-950/40 border border-slate-800/60 backdrop-blur-md rounded-2xl p-6 shadow-xl ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = "" }) => {
  return <div className={`mb-4 flex items-center justify-between ${className}`}>{children}</div>;
};

export const CardTitle = ({ children, className = "" }) => {
  return <h3 className={`text-lg font-bold text-white tracking-tight ${className}`}>{children}</h3>;
};

export const CardContent = ({ children, className = "" }) => {
  return <div className={`text-slate-300 text-sm ${className}`}>{children}</div>;
};