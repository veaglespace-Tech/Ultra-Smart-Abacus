"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Sun, Moon, ChevronRight } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme, mounted } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Courses", href: "/courses" },
    { name: "Franchise", href: "/Franchise" },
    { name: "Gallery", href: "/gallery" },
    { name: "Contact Us", href: "/contact" },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/90 dark:bg-[#0f0a1e]/90 backdrop-blur-xl shadow-lg shadow-[#2D1B69]/10"
          : "bg-white/80 dark:bg-[#0f0a1e]/80 backdrop-blur-md shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          {/* Abacus SVG Icon */}
          <div className="relative flex-shrink-0 w-10 h-10 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-[#2D1B69] to-[#FF6B2B] rounded-xl opacity-90 group-hover:opacity-100 transition-opacity shadow-lg" />
            <svg viewBox="0 0 32 32" className="relative w-6 h-6" fill="none">
              {/* Abacus frame */}
              <rect x="3" y="4" width="26" height="24" rx="3" stroke="white" strokeWidth="2" fill="none"/>
              {/* Rods */}
              <line x1="10" y1="4" x2="10" y2="28" stroke="rgba(255,202,40,0.8)" strokeWidth="1.5"/>
              <line x1="16" y1="4" x2="16" y2="28" stroke="rgba(255,202,40,0.8)" strokeWidth="1.5"/>
              <line x1="22" y1="4" x2="22" y2="28" stroke="rgba(255,202,40,0.8)" strokeWidth="1.5"/>
              {/* Divider */}
              <line x1="3" y1="16" x2="29" y2="16" stroke="white" strokeWidth="1.5" strokeDasharray="2 1"/>
              {/* Beads */}
              <circle cx="10" cy="11" r="3" fill="#FFCA28"/>
              <circle cx="16" cy="13" r="3" fill="#FF6B2B"/>
              <circle cx="22" cy="11" r="3" fill="#FFCA28"/>
              <circle cx="10" cy="22" r="3" fill="white" fillOpacity="0.7"/>
              <circle cx="16" cy="21" r="3" fill="white" fillOpacity="0.7"/>
              <circle cx="22" cy="22" r="3" fill="white" fillOpacity="0.7"/>
            </svg>
          </div>

          <div className="flex flex-col leading-none">
            <span className="font-black text-xl tracking-tight" style={{ fontFamily: "Poppins, sans-serif" }}>
              <span className="text-[#2D1B69] dark:text-violet-300">SMART</span>{" "}
              <span className="text-[#FF6B2B]">ABACUS</span>
            </span>
            <span className="text-[10px] font-semibold tracking-widest text-[#2D1B69]/50 dark:text-violet-400/60 uppercase mt-0.5" style={{ fontFamily: "Outfit, sans-serif" }}>
              Empowering Young Minds
            </span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-8">
          <ul className="flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href} className="relative">
                  <Link
                    href={link.href}
                    className={`relative z-10 px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors duration-300 group flex items-center gap-1 ${
                      isActive
                        ? "text-[#FF6B2B]"
                        : "text-slate-600 dark:text-slate-300 hover:text-[#2D1B69] dark:hover:text-violet-300"
                    }`}
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {link.name}
                  </Link>
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 bg-[#FF6B2B]/8 dark:bg-[#FF6B2B]/12 rounded-lg"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </li>
              );
            })}
          </ul>

          {/* Right Actions */}
          <div className="flex items-center gap-3 pl-6 border-l border-slate-200 dark:border-slate-700">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Theme"
            >
              {mounted && theme === "dark" ? (
                <Sun size={18} className="text-[#FFCA28]" />
              ) : (
                <Moon size={18} className="text-[#2D1B69]" />
              )}
            </button>

            {/* Sign In */}
            <Link
              href="/auth/login"
              className="px-5 py-2.5 text-sm font-bold text-[#2D1B69] dark:text-violet-300 border-2 border-[#2D1B69]/30 dark:border-violet-500/40 rounded-full hover:border-[#2D1B69] dark:hover:border-violet-400 hover:bg-[#2D1B69]/5 transition-all duration-200"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Sign In
            </Link>

            {/* Register CTA */}
            <Link
              href="/auth/register"
              className="btn-shine px-5 py-2.5 text-sm font-bold text-white rounded-full transition-all duration-200 flex items-center gap-1.5"
              style={{
                background: "linear-gradient(135deg, #FF6B2B, #e55a1f)",
                boxShadow: "0 4px 15px rgba(255,107,43,0.35)",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              Join Now
              <ChevronRight size={15} />
            </Link>
          </div>
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {mounted && theme === "dark" ? (
              <Sun size={18} className="text-[#FFCA28]" />
            ) : (
              <Moon size={18} className="text-[#2D1B69]" />
            )}
          </button>
          <button
            className="p-2 rounded-xl text-[#2D1B69] dark:text-violet-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="lg:hidden overflow-hidden"
          >
            <div className="px-4 pb-6 pt-2 bg-white/95 dark:bg-[#0f0a1e]/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800">
              <ul className="space-y-1 mb-4">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                          isActive
                            ? "bg-gradient-to-r from-[#2D1B69]/10 to-[#FF6B2B]/10 text-[#FF6B2B] border border-[#FF6B2B]/20"
                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        }`}
                      >
                        <span>{link.name}</span>
                        {isActive && <ChevronRight size={14} className="text-[#FF6B2B]" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="flex flex-col gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href="/auth/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-3 rounded-full font-bold text-sm text-[#2D1B69] dark:text-violet-300 border-2 border-[#2D1B69]/30 hover:border-[#2D1B69] hover:bg-[#2D1B69]/5 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-3 rounded-full font-bold text-sm text-white transition-all"
                  style={{ background: "linear-gradient(135deg, #FF6B2B, #e55a1f)" }}
                >
                  Join Now — It&apos;s Free
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
