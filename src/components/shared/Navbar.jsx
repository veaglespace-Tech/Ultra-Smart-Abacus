"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation"; // 💡 Active Page check krnyasathi
import { Menu, X, ChevronDown } from "lucide-react"; // Dropdown icon sathi
import Logo from "./Logo";
// Demo component import

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname(); // Get current URL path

  // Navigation Items Dynamic Array
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Courses", href: "/courses" },
    { name: "Franchise", href: "/Franchise" },
    { name: "Gallery", href: "/gallery" },
    { name: "Contact Us", href: "/contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-md transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">

        {/* 🏢 Logo and Brand Name Container */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex-shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
            <Logo />
          </div>
          
          <div className="flex flex-col justify-center">
            <span className="text-2xl sm:text-3xl font-bold text-pink-500 leading-none tracking-tight">
              SMART <span className="text-purple-500">ABACUS</span>
            </span>
            <span className="text-[10px] sm:text-xs text-purple-500 tracking-widest mt-1 leading-none font-medium">
              Empowering Young Minds
            </span>
          </div>
        </Link>

        {/* 💻 Desktop Menu */}
        <div className="hidden lg:flex items-center gap-6">
          <ul className="flex items-center gap-8 text-gray-700 font-semibold text-sm">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href} className="relative group/link py-1">
                  <Link 
                    href={link.href} 
                    className={`transition-colors duration-200 ${
                      isActive ? "text-blue-900 font-bold" : "hover:text-blue-900"
                    }`}
                  >
                    {link.name}
                  </Link>
                  {/* ✨ Smooth Hover or Active Border Line Effect */}
                  <span 
                    className={`absolute bottom-0 left-0 h-[2px] bg-black-500 transition-all duration-300 ${
                      isActive ? "w-full" : "w-0 group-hover/link:w-full"
                    }`}
                  ></span>
                </li>
              );
            })}
          </ul>

          {/* 🔐 Authentication Buttons */}
          <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
            {/* Sign In Button */}
            <Link
              href="/pages/auth/login"
              className="bg-[#1e3a8a] hover:bg-[#172554] hover:scale-105 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-md shadow-blue-900/20 transition-all duration-200"
            >
              Sign In
            </Link>
            
            {/* Register Button */}
            <Link
              href="/pages/auth/register"
              className="bg-blue-500 hover:bg-blue-600 hover:scale-105 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-md shadow-blue-500/20 transition-all duration-200"
            >
              Register
            </Link>
          </div>
        </div>

        {/* 📱 Mobile Menu Button */}
        <button
          className="lg:hidden text-[#1e3a8a] p-1 rounded-md hover:bg-gray-100 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* 📱 Mobile Dropdown Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t shadow-inner animate-in slide-in-from-top duration-200">
          <ul className="flex flex-col p-4 space-y-3 text-gray-700 font-medium">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    onClick={() => setIsOpen(false)} // Menu close krayla click vr
                    className={`block p-2 rounded-lg transition-colors ${
                      isActive ? "bg-blue-50 text-blue-950 font-bold" : "hover:bg-gray-50"
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              );
            })}

            <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
              <Link
                href="/pages/auth/login"
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-2.5 rounded-full font-bold text-blue-900 border border-blue-900 hover:bg-blue-50 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/pages/auth/register"
                onClick={() => setIsOpen(false)}
                className="w-full bg-blue-500 text-white text-center py-2.5 rounded-full font-bold hover:bg-blue-600 transition-colors"
              >
                Join Now
              </Link>
            </div>
          </ul>
        </div>
      )}
    </nav>
  );
}