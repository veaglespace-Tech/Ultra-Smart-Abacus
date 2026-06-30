import React from "react";
import Link from "next/link";

import { MapPin, Phone, Globe, Award, Calendar } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-700 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Company */}
          <div>
            <h2 className="text-2xl font-black tracking-wider text-blue-500">
              Smart <span className="text-orange-500">Abacus</span>
            </h2>

            <p className="mt-5 text-xs text-slate-400 leading-relaxed font-medium">
              Empowering young minds through Abacus and Mental Arithmetic
              programs designed to improve concentration, memory and
              calculation speed.
            </p>

            <div className="flex gap-3 mt-4">
              <span className="border border-gray-700 px-4 py-2 rounded-lg text-sm">
                ISO Certified
              </span>

              <span className="bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold text-slate-300 flex items-center gap-1">
                <Calendar size={12} className="text-pink-400" />
                Since 2026
              </span>
            </div>

            <div className="flex gap-4 mt-4">
              {/* WhatsApp */}
                          <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-center hover:bg-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 transition-all cursor-pointer"
                title="WhatsApp"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.324 5.328 0 11.859 0c3.166.001 6.141 1.233 8.377 3.469 2.235 2.237 3.465 5.213 3.464 8.381-.003 6.535-5.328 11.859-11.859 11.859-2.007-.002-3.98-.511-5.73-1.483L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.725 1.451 5.402 0 9.799-4.394 9.802-9.797.002-2.618-1.017-5.08-2.87-6.934C16.35 2.02 13.89 1 11.272 1 5.874 1 1.478 5.394 1.475 10.795c-.001 1.637.432 3.238 1.254 4.673l-.995 3.635 3.72-.976z" />
                </svg>
              </a>

              {/* Facebook */}

              <a 
              href="https://www.facebook.com/smartabacus"
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 w-10 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-center hover:bg-blue-500/20 hover:border-blue-500/40 text-blue-400 transition-all cursor-pointer" title="Facebook">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
                </svg>
              </a>

              {/* Instagram */}
              <a 
                href="https://www.instagram.com/smartabacus"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-center hover:bg-pink-500/20 hover:border-pink-500/40 text-pink-400 transition-all cursor-pointer" title="Instagram">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>

              {/* YouTube */}
              <a 
                href="https://www.youtube.com/smartabacus"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/40 text-red-400 transition-all cursor-pointer" title="YouTube">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

         
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6 font-mono">
              Quick Links
            </h3>

            <ul className="space-y-3.5 text-xs font-medium text-slate-400">
              <li><Link href="/" className="hover:text-orange-400 transition-colors">Home Portal</Link></li>
              <li><Link href="/about" className="hover:text-orange-400 transition-colors">About Us</Link></li>
              <li><Link href="/courses" className="hover:text-orange-400 transition-colors">Our Courses</Link></li>
              <li><Link href="/Franchise" className="hover:text-orange-400 transition-colors">Franchise Network</Link></li>
              <li><Link href="/contact" className="hover:text-orange-400 transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6 font-mono">
              Our Presence
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Pune, Mumbai, Nashik, Kolhapur, Satara, Nagpur and several
              cities across India.
            </p>

            <p className="mt-4 text-xs text-slate-400 leading-relaxed font-medium border-t border-slate-900 pt-4">
              International footprint in UAE, USA and Canada.
            </p>
          </div>

        
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6 font-mono">
              Contact Us
            </h3>

            <div className="space-y-6">
              <div className="flex gap-4">
                {/* Location pin */}
                <svg className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>

                <p className="leading-7 text-gray-400">
                  123 Abacus Street, Pune, Maharashtra, India - 411001
                </p>
              </div>

              <div className="flex gap-3 items-center">
                <Phone size={15} className="text-emerald-400" />
                <p>+91 98765 43210</p>
              </div>

              <div className="flex gap-3 items-center">
                <Globe size={15} className="text-blue-400" />
                <p className="font-mono">www.smartabacus.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © 2026 Smart Abacus. All Rights Reserved.
          </p>

          <p className="text-slate-500 text-[11px] font-mono">
            Designed & Developed by Veagle Space Private limited
          </p>
        </div>
      </div>
    </footer>
  );
}