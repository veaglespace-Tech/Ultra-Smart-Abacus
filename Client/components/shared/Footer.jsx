import React from "react";
import Link from "next/link";
import { Phone, Globe, Mail, MapPin, ChevronRight } from "lucide-react";

export default function Footer() {
  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Our Courses", href: "/courses" },
    { name: "Franchise Network", href: "/Franchise" },
    { name: "Gallery", href: "/gallery" },
    { name: "Contact Support", href: "/contact" },
  ];

  const courses = [
    "Junior Abacus Star",
    "Mental Math Mastermind",
    "Advanced Math Champion",
    "Speed Reading & Writing",
    "Vedic Mathematics",
    "Memory & Rubik's Cube",
  ];

  return (
    <footer className="relative text-white" style={{ background: "linear-gradient(160deg, #1a1035 0%, #2D1B69 60%, #1a1035 100%)" }}>

      {/* Wave Top Border SVG */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden leading-none" style={{ height: "60px", transform: "translateY(-99%)" }}>
        <svg viewBox="0 0 1440 60" className="w-full h-full" preserveAspectRatio="none">
          <path d="M0,20 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#1a1035" />
        </svg>
      </div>

      {/* Dot Pattern Overlay */}
      <div className="absolute inset-0 opacity-5 dot-pattern pointer-events-none" />

      {/* Glowing Blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 rounded-full opacity-10 animate-blob1" style={{ background: "radial-gradient(circle, #FF6B2B, transparent 70%)", filter: "blur(40px)" }} />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-10 animate-blob2" style={{ background: "radial-gradient(circle, #7C3AED, transparent 70%)", filter: "blur(50px)" }} />

      <div className="relative  mx-auto px-6 pt-16 pb-6">

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Column 1: Brand */}
          <div className="lg:col-span-1">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #FF6B2B, #FFCA28)" }}>
                <svg viewBox="0 0 32 32" className="w-6 h-6" fill="none">
                  <rect x="3" y="4" width="26" height="24" rx="3" stroke="white" strokeWidth="2" fill="none"/>
                  <line x1="10" y1="4" x2="10" y2="28" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
                  <line x1="16" y1="4" x2="16" y2="28" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
                  <line x1="22" y1="4" x2="22" y2="28" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
                  <line x1="3" y1="16" x2="29" y2="16" stroke="white" strokeWidth="1.5"/>
                  <circle cx="10" cy="11" r="3" fill="white"/>
                  <circle cx="16" cy="13" r="3" fill="white" fillOpacity="0.8"/>
                  <circle cx="22" cy="11" r="3" fill="white"/>
                  <circle cx="10" cy="22" r="3" fill="white" fillOpacity="0.5"/>
                  <circle cx="16" cy="21" r="3" fill="white" fillOpacity="0.5"/>
                  <circle cx="22" cy="22" r="3" fill="white" fillOpacity="0.5"/>
                </svg>
              </div>
              <div>
                <p className="font-black text-lg leading-none tracking-tight" style={{ fontFamily: "Poppins, sans-serif" }}>
                  SMART <span style={{ color: "#FF6B2B" }}>ABACUS</span>
                </p>
                <p className="text-[10px] font-semibold tracking-widest opacity-50 mt-0.5 uppercase" style={{ fontFamily: "Outfit, sans-serif" }}>
                  Academy
                </p>
              </div>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed mb-6" style={{ fontFamily: "Inter, sans-serif" }}>
              Empowering young minds through Abacus and Mental Arithmetic programs designed to improve concentration, memory and calculation speed since 2010.
            </p>

            {/* Badges */}
            <div className="flex gap-2 flex-wrap mb-6">
              <span className="px-3 py-1.5 rounded-lg text-xs font-bold border border-white/20 text-white/80 bg-white/5" style={{ fontFamily: "Outfit, sans-serif" }}>
                🏆 ISO Certified
              </span>
              <span className="px-3 py-1.5 rounded-lg text-xs font-bold border border-[#FFCA28]/30 text-[#FFCA28] bg-[#FFCA28]/5" style={{ fontFamily: "Outfit, sans-serif" }}>
                📅 Est. 2010
              </span>
            </div>

            {/* Social Icons */}
            <div className="flex gap-3">
              {/* WhatsApp */}
              <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/10 bg-white/5 hover:bg-[#25D366]/20 hover:border-[#25D366]/40 transition-all duration-200 group">
                <svg className="w-4 h-4 fill-current text-white/60 group-hover:text-[#25D366]" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.324 5.328 0 11.859 0c3.166.001 6.141 1.233 8.377 3.469 2.235 2.237 3.465 5.213 3.464 8.381-.003 6.535-5.328 11.859-11.859 11.859-2.007-.002-3.98-.511-5.73-1.483L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.725 1.451 5.402 0 9.799-4.394 9.802-9.797.002-2.618-1.017-5.08-2.87-6.934C16.35 2.02 13.89 1 11.272 1 5.874 1 1.478 5.394 1.475 10.795c-.001 1.637.432 3.238 1.254 4.673l-.995 3.635 3.72-.976z"/>
                </svg>
              </a>
              {/* Facebook */}
              <a href="https://www.facebook.com/smartabacus" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/10 bg-white/5 hover:bg-[#1877F2]/20 hover:border-[#1877F2]/40 transition-all duration-200 group">
                <svg className="w-4 h-4 fill-current text-white/60 group-hover:text-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/>
                </svg>
              </a>
              {/* Instagram */}
              <a href="https://www.instagram.com/smartabacus" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/10 bg-white/5 hover:bg-pink-500/20 hover:border-pink-500/40 transition-all duration-200 group">
                <svg className="w-4 h-4 text-white/60 group-hover:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <rect x="2" y="2" width="20" height="20" rx="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              {/* YouTube */}
              <a href="https://www.youtube.com/smartabacus" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/10 bg-white/5 hover:bg-[#FF0000]/20 hover:border-[#FF0000]/40 transition-all duration-200 group">
                <svg className="w-4 h-4 fill-current text-white/60 group-hover:text-[#FF0000]" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest mb-6 text-white/90" style={{ fontFamily: "Outfit, sans-serif" }}>
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-2 text-sm text-slate-300 hover:text-[#FFCA28] transition-colors duration-200"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    <ChevronRight size={12} className="text-[#FF6B2B] group-hover:translate-x-1 transition-transform duration-200 flex-shrink-0" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Our Presence */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest mb-6 text-white/90" style={{ fontFamily: "Outfit, sans-serif" }}>
              Our Presence
            </h3>
            <div className="space-y-4">
              <p className="text-sm text-slate-300 leading-relaxed font-medium" style={{ fontFamily: "Inter, sans-serif" }}>
                Pune, Mumbai, Nashik, Kolhapur, Satara, Nagpur and several
                cities across India.
              </p>
              <div className="border-t border-white/10 pt-4">
                <p className="text-sm text-slate-300 leading-relaxed font-medium" style={{ fontFamily: "Inter, sans-serif" }}>
                  International footprint in UAE, USA and Canada.
                </p>
              </div>
            </div>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest mb-6 text-white/90" style={{ fontFamily: "Outfit, sans-serif" }}>
              Get In Touch
            </h3>
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(255,107,43,0.15)", border: "1px solid rgba(255,107,43,0.3)" }}>
                  <MapPin size={14} className="text-[#FF6B2B]" />
                </div>
                <a
  href="https://maps.app.goo.gl/bGUXoYNs1f3paBaF6"
  target="_blank"
  rel="noopener noreferrer"
  className="text-sm text-slate-300 leading-relaxed hover:text-[#FFCA28] transition-colors"
  style={{ fontFamily: "Inter, sans-serif" }}
>
 Office no 207, Kudale Patil Chambers, Heritage, near Bhairavnath Temple, Jadhav Nagar, Vadgaon Budruk, Pune, Maharashtra 411041
</a>
              </div>

              <div className="flex items-start gap-3">
  <div
    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
    style={{
      background: "rgba(255,107,43,0.15)",
      border: "1px solid rgba(255,107,43,0.3)",
    }}
  >
    <Phone size={14} className="text-[#FF6B2B]" />
  </div>

  <div>
    <p
      className="text-xs font-bold text-white/70 mb-0.5 uppercase tracking-wider"
      style={{ fontFamily: "Outfit, sans-serif" }}
    >
      Phone
    </p>

    <a
      href="tel:+919876543210"
      className="block text-sm text-slate-300 hover:text-[#FFCA28] transition-colors"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      +91 9325252246
    </a>

    <a
      href="tel:+918767876567"
      className="block text-sm text-slate-300 hover:text-[#FFCA28] transition-colors"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      +91 87678 76567
    </a>
  </div>
</div>

<div className="flex items-start gap-3">
  <div
    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
    style={{
      background: "rgba(255,107,43,0.15)",
      border: "1px solid rgba(255,107,43,0.3)",
    }}
  >
    <Mail size={14} className="text-[#FF6B2B]" />
  </div>

  <div>
    <p
      className="text-xs font-bold text-white/70 mb-2 uppercase tracking-wider"
      style={{ fontFamily: "Outfit, sans-serif" }}
    >
      Email
    </p>

    <a
      href="mailto:gunjalsejal04@gmail.com"
      className="block text-sm text-slate-300 hover:text-[#FFCA28] transition-colors leading-6 break-all"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      gunjalsejal04@gmail.com
    </a>

    <a
      href="mailto:admissions@smartabacus.com"
      className="block text-sm text-slate-300 hover:text-[#FFCA28] transition-colors leading-6 break-all"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      admissions@smartabacus.com
    </a>
  </div>
</div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,107,43,0.15)", border: "1px solid rgba(255,107,43,0.3)" }}>
                  <Globe size={14} className="text-[#FF6B2B]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white/70 mb-0.5 uppercase tracking-wider" style={{ fontFamily: "Outfit, sans-serif" }}>Presence</p>
                  <p className="text-sm text-slate-300" style={{ fontFamily: "Inter, sans-serif" }}>Pune · Mumbai · Nashik · Nagpur</p>
                  <p className="text-sm text-slate-300 mt-0.5" style={{ fontFamily: "Inter, sans-serif" }}>UAE · USA · Canada</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t pt-6 flex flex-col md:flex-row justify-between items-center gap-3" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <p className="text-slate-400 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
            © {new Date().getFullYear()} <span className="text-[#FF6B2B] font-semibold">Smart Abacus</span>. All Rights Reserved.
          </p>
          <p className="text-slate-500 text-xs" style={{ fontFamily: "Outfit, sans-serif" }}>
            Designed &amp; Developed by{" "}
            <span className="text-[#FFCA28] font-semibold">Veagle Space technology Pvt. Ltd.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}