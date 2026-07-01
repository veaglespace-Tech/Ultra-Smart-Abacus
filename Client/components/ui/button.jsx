import React from "react";

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const baseStyle = "font-bold rounded-xl transition-all active:scale-[0.98] duration-200 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:brightness-110 shadow-lg shadow-orange-600/20 border border-orange-400/20",
    secondary: "bg-white/10 hover:bg-white/15 text-white border border-white/10 backdrop-blur-md",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20",
    ghost: "bg-transparent hover:bg-white/5 text-slate-300",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};