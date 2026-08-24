"use client";
import { useState } from "react";
import Navbar from "../../../components/shared/Navbar";
import Footer from "../../../components/shared/Footer";
import { MapPin, Phone, Mail, CheckCircle2, TrendingUp, Users, Building, ArrowRight, Send } from "lucide-react";
import { api } from "@/services/api";

const branchList = [
  { name: "Pune Corporate Hub", address: "Kothrud, Near MIT College, Pune", contact: "+91 98765 43210", email: "pune@smartabacus.com", active: true },
  { name: "Mumbai Center", address: "Dadar West, Near Station, Mumbai", contact: "+91 98765 43211", email: "mumbai@smartabacus.com", active: true },
  { name: "Nashik Academy", address: "College Road, Above HDFC Bank, Nashik", contact: "+91 98765 43212", email: "nashik@smartabacus.com", active: true },
  { name: "Nagpur Center", address: "Ramdaspeth, Main Market, Nagpur", contact: "+91 98765 43213", email: "nagpur@smartabacus.com", active: true },
];

const benefits = [
  { icon: TrendingUp, title: "Low Investment, High Returns", desc: "Start your centre with minimal investment and earn profitable returns in the growing education sector.", color: "#2D1B69", textSize: "text-2xl",descSize:"text-base" },
  { icon: Users, title: "Full Training & Support", desc: "Comprehensive onboarding, instructor training, and ongoing academic & operational support from HQ.", color: "#FF6B2B", textSize: "text-2xl",descSize:"text-base" },
  { icon: Building, title: "Exclusive Territory Rights", desc: "Get exclusive rights to operate Smart Abacus in your chosen city or area — no direct competition.", color: "#FFCA28", textSize: "text-2xl",descSize:"text-base" },
  { icon: CheckCircle2, title: "Proven Curriculum", desc: "Use our ISO-certified, proven curriculum that has been refined over 15 years of excellence.", color: "#10B981", textSize: "text-2xl",descSize:"text-base" },
];

export default function FranchisePage() {
  const [formData, setFormData] = useState({ name: "", phone: "", city: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    try {
      await api.public.submitInquiry({
        name: formData.name,
        email: "franchise-applicant@abacus.com",
        phone: formData.phone,
        subject: `Franchise Application (${formData.city})`,
        message: `Proposed City: ${formData.city}\nMessage: ${formData.message || 'N/A'}`
      });
    } catch (err) {
      console.error("Franchise application submission error:", err);
    }
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", phone: "", city: "", message: "" });
    }, 3500);
  };

  const inputClass = "w-full rounded-2xl border-2 border-slate-200 bg-slate-50 py-3.5 px-5 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-[#FF6B2B] focus:bg-white focus:ring-4 focus:ring-[#FF6B2B]/10 transition-all duration-200";

  return (
    <div 
      className="min-h-screen flex flex-col bg-cover bg-center bg-fixed relative transition-colors duration-300" 
      style={{ 
        fontFamily: "Inter, sans-serif",
        backgroundImage: "linear-gradient(to bottom, rgba(15, 10, 30, 0.88), rgba(45, 27, 105, 0.85)), url('/images/contact.jpg')"
      }}
    >
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-15" />
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-20 animate-blob1"
          style={{ background: "radial-gradient(circle, #FF6B2B, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full opacity-10 animate-blob2"
          style={{ background: "radial-gradient(circle, #FFCA28, transparent 70%)", filter: "blur(60px)" }} />

        <div className="relative max-w-4xl mx-auto text-center text-white">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
            style={{ background: "rgba(255,202,40,0.15)", color: "#FFCA28", border: "1px solid rgba(255,202,40,0.3)", fontFamily: "Outfit, sans-serif" }}>
            Grow With Us
          </span>
          <h1 className="font-black text-4xl sm:text-5xl leading-tight mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
            Franchise &{" "}
            <span style={{
              background: "linear-gradient(135deg, #FF6B2B, #FFCA28)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Branch Network
            </span>
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Join India&apos;s fastest-growing Abacus academy network. Partner with us to start your own educational centre or find a branch near you.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-10">
            {[
              { value: "50+", label: "Active Centres" },
              { value: "10K+", label: "Students" },
              { value: "15+", label: "Years Trusted" },
            ].map(({ value, label }, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-black text-[#FFCA28]" style={{ fontFamily: "Poppins, sans-serif" }}>{value}</div>
                <div className="text-slate-300 text-xs font-medium mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-white/70 dark:bg-[#150e2a]/70 backdrop-blur-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="badge-accent mb-4 inline-flex">Why Franchise With Us?</span>
            <h2 className="section-heading text-[#2D1B69] dark:text-white">
              The Smart Abacus <span style={{ color: "#FF6B2B" }}>Advantage</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map(({ icon: Icon, title, desc, color, textSize, descSize }, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/90 dark:bg-[#1e1445]/90 backdrop-blur-sm card-hover text-center shadow-md" style={{ border: `1px solid ${color}20` }}>
                <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: `${color}15` }}>
                  <Icon size={24} style={{ color }} />
                </div>
                <h3 className={`font-bold text-slate-800 dark:text-white ${textSize} mb-2`} style={{ fontFamily: "Poppins, sans-serif" }}>{title}</h3>
                <p className={`text-slate-500 dark:text-slate-300 ${descSize} leading-relaxed`}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Active Branches + Application Form ── */}
      <section className="py-16 px-6 bg-white/70 dark:bg-[#0f0a1e]/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-12 items-start">

          {/* Branches Grid Wrapper */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <span className="badge-primary mb-3 inline-flex">Our Network</span>
              <h2 className="text-2xl font-black text-[#2D1B69] dark:text-white" style={{ fontFamily: "Poppins, sans-serif" }}>
                Active Learning Centers
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              {branchList.map(({ name, address, contact, email, active }, idx) => (
                <div key={idx} className="p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-[#FF6B2B]/30 hover:shadow-lg transition-all duration-300 bg-white/90 dark:bg-[#1e1445]/90 backdrop-blur-sm card-hover">
                  {/* Active indicator */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider" style={{ fontFamily: "Outfit, sans-serif" }}>Active</span>
                  </div>

                  <h3 className="font-bold text-slate-800 dark:text-white text-base mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>{name}</h3>

                  <div className="flex items-start gap-2 mb-4">
                    <MapPin size={13} className="text-[#FF6B2B] mt-0.5 flex-shrink-0" />
                    <p className="text-slate-500 dark:text-slate-300 text-xs leading-relaxed">{address}</p>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Phone size={12} className="text-[#2D1B69] dark:text-[#b8a9e8] flex-shrink-0" />
                      <span className="text-xs text-slate-600 dark:text-slate-200 font-medium">{contact}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={12} className="text-[#2D1B69] dark:text-[#b8a9e8] flex-shrink-0" />
                      <span className="text-xs text-slate-600 dark:text-slate-200 font-medium">{email}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA to register */}
            <div className="p-6 rounded-2xl flex items-center justify-between"
              style={{ background: "linear-gradient(135deg, #2D1B69, #3d2a88)" }}>
              <div>
                <p className="font-bold text-white text-sm mb-0.5" style={{ fontFamily: "Poppins, sans-serif" }}>
                  Register as a Franchise Admin
                </p>
                <p className="text-slate-300 text-xs">Access the ERP portal to manage your centre</p>
              </div>
              <a href="/auth/register?role=FRANCHISE"
                className="btn-shine flex items-center gap-1.5 px-5 py-3 rounded-full text-xs font-bold text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #FF6B2B, #e55a1f)", fontFamily: "Outfit, sans-serif" }}>
                Register
                <ArrowRight size={13} />
              </a>
            </div>
          </div>

          {/* Application Form */}
          <div className="bg-white/90 dark:bg-[#1a1035]/90 backdrop-blur-md rounded-3xl border-2 border-[#FF6B2B]/15 shadow-xl p-7">
            <div className="mb-6">
              <span className="badge-accent mb-3 inline-flex">Apply Now</span>
              <h2 className="text-xl font-black text-[#2D1B69] dark:text-white" style={{ fontFamily: "Poppins, sans-serif" }}>
                Start Your Own Center
              </h2>
              <p className="text-slate-500 dark:text-slate-300 text-xs mt-1">
                Fill this form to receive franchise model and investment details.
              </p>
            </div>

            {submitted ? (
              <div className="flex flex-col items-center py-10 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}>
                  <CheckCircle2 size={28} color="white" />
                </div>
                <h3 className="font-bold text-[#2D1B69] mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>Application Received!</h3>
                <p className="text-slate-500 text-sm">Our franchise team will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { label: "Your Name", key: "name", type: "text", placeholder: "Enter Full Name" },
                  { label: "Contact Number", key: "phone", type: "tel", placeholder: "10-Digit Mobile" },
                  { label: "Proposed City", key: "city", type: "text", placeholder: "e.g. Mumbai, Pune" },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
                      {label}
                    </label>
                    <input type={type} required placeholder={placeholder}
                      value={formData[key]}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                      className={inputClass} />
                  </div>
                ))}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
                    Message (Optional)
                  </label>
                  <textarea rows={3} placeholder="Tell us about your background..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className={inputClass + " resize-none"} style={{ paddingTop: "0.875rem" }} />
                </div>

                <button type="submit"
                  className="btn-shine w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider text-white flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: "linear-gradient(135deg, #FF6B2B, #e55a1f)",
                    boxShadow: "0 4px 15px rgba(255,107,43,0.3)",
                    fontFamily: "Outfit, sans-serif",
                  }}>
                  Submit Application
                  <Send size={14} />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}