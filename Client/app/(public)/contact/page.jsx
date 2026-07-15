"use client";
import { useState } from "react";
import Navbar from "../../../components/shared/Navbar";
import Footer from "../../../components/shared/Footer";
import { Phone, Mail, Clock, MapPin, Send, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const contactInfo = [
  {
    icon: Phone,
    title: "Call Us Directly",
    lines: ["+91 9325252246", "+91 7867 896 734"],
    color: "#2D1B69",
   
    bg: "rgba(45,27,105,0.08)",
  },
  {
    icon: Mail,
    title: "Email Inquiries",
    lines: ["info@smartabacus.com", "admissions@smartabacus.com"],
    color: "#FF6B2B",
    bg: "rgba(255,107,43,0.08)",
  },
  {
    icon: Clock,
    title: "Working Hours",
    lines: ["Monday – Saturday", "09:00 AM – 06:00 PM (IST)"],
    color: "#10B981",
    bg: "rgba(16,185,129,0.08)",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    lines: ["123 Abacus Street, Pune", "Maharashtra – 411001"],
    color: "#FFCA28",
    bg: "rgba(255,202,40,0.1)",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", subject: "General Inquiry", message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", phone: "", subject: "General Inquiry", message: "" });
    }, 3000);
  };

  const inputClass = "w-full rounded-2xl border-2 border-slate-200 bg-slate-50 py-3.5 px-5 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-[#FF6B2B] focus:bg-white focus:ring-4 focus:ring-[#FF6B2B]/10 transition-all duration-200";

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0f0a1e] transition-colors duration-300" style={{ fontFamily: "Inter, sans-serif" }}>
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative py-24 px-6 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a1035 0%, #2D1B69 60%, #3d2a88 100%)" }}>
        <div className="absolute inset-0 dot-pattern opacity-15" />
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-20 animate-blob1"
          style={{ background: "radial-gradient(circle, #FF6B2B, transparent 70%)", filter: "blur(60px)" }} />

        <div className="relative max-w-4xl mx-auto text-center text-white">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
            style={{ background: "rgba(255,202,40,0.15)", color: "#FFCA28", border: "1px solid rgba(255,202,40,0.3)", fontFamily: "Outfit, sans-serif" }}>
            Get In Touch
          </span>
          <h1 className="font-black text-4xl sm:text-5xl leading-tight mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
            Contact Our{" "}
            <span style={{
              background: "linear-gradient(135deg, #FF6B2B, #FFCA28)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Academy
            </span>
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Have questions about admissions, courses, or trial batches? Reach out and we&apos;ll guide you forward.
          </p>
        </div>
      </section>

      <section className="py-14 px-6 bg-[#FFF8F0] dark:bg-[#150e2a] transition-colors duration-300">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-5">
          {contactInfo.map(({ icon: Icon, title, lines, color, bg }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="p-6 rounded-2xl bg-white dark:bg-[#1e1445] card-shine-effect text-center shadow-sm transition-all duration-300"
              style={{ border: `1px solid ${color}25` }}
            >
              <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                <Icon size={20} style={{ color }} />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>{title}</h3>
              {lines.map((line, li) => {
  if (title === "Call Us Directly") {
    return (
      <a
        key={li}
        href={`tel:${line.replace(/\s+/g, "")}`}
        className="block text-slate-600 dark:text-slate-300 text-xs leading-relaxed hover:text-[#FF6B2B] hover:underline transition-colors"
      >
        {line}
      </a>
    );
  }

  if (title === "Email Inquiries") {
    return (
      <a
        key={li}
        href={`mailto:${line}`}
        className="block text-slate-600 dark:text-slate-300 text-xs leading-relaxed hover:text-[#FF6B2B] hover:underline transition-colors"
      >
        {line}
      </a>
    );
  }

  return (
    <p
      key={li}
      className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed"
    >
      {line}
    </p>
  );
})}

            </motion.div>
          ))}
        </div>
      </section>


      {/* ── Main Form + Map Area ── */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-12">

          {/* Left: Form */}
          <motion.div 
            initial={{ opacity: 0, x: -35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="bg-white dark:bg-[#1a1035] rounded-3xl border-2 border-slate-100 dark:border-slate-800 shadow-xl p-8">
              <div className="mb-8">
                <span className="badge-accent mb-3 inline-flex">Send a Message</span>
                <h2 className="text-2xl font-black text-[#2D1B69] dark:text-white" style={{ fontFamily: "Poppins, sans-serif" }}>
                  We&apos;d Love to Hear from You
                </h2>
                <p className="text-slate-500 dark:text-slate-300 text-sm mt-1">
                  Fill in your details and our team will get back to you within 24 hours.
                </p>
              </div>

              {submitted ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
                    style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}>
                    <CheckCircle2 size={36} color="white" />
                  </div>
                  <h3 className="text-xl font-black text-[#2D1B69] mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
                    Message Sent!
                  </h3>
                  <p className="text-slate-500 text-sm">
                    Thank you for reaching out. Our team will contact you shortly!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
                        Your Name
                      </label>
                      <input type="text" required placeholder="Enter Full Name"
                        value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
                        Mobile Number
                      </label>
                      <input type="tel" required placeholder="10-Digit Number"
                        value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={inputClass} />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
                        Email Address
                      </label>
                      <input type="email" required placeholder="name@example.com"
                        value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
                        Inquiry Purpose
                      </label>
                      <select value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className={inputClass + " appearance-none"} style={{ paddingLeft: "1.25rem" }}>
                        <option>General Inquiry</option>
                        <option>Abacus Course Admission</option>
                        <option>Reading & Handwriting Track</option>
                        <option>Vedic Math Class</option>
                        <option>Request Free Demo Session</option>
                        <option>Franchise Inquiry</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
                      Message
                    </label>
                    <textarea rows={5} required
                      placeholder="Describe your query or mention your child's age group..."
                      value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className={inputClass + " resize-none"} style={{ paddingTop: "0.875rem" }} />
                  </div>

                  <button type="submit"
                    className="btn-shine w-full py-4 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all"
                    style={{
                      background: "linear-gradient(135deg, #FF6B2B, #e55a1f)",
                      boxShadow: "0 6px 20px rgba(255,107,43,0.35)",
                      fontFamily: "Poppins, sans-serif",
                    }}>
                    Send Message
                    <Send size={16} />
                  </button>
                </form>
              )}
            </div>
          </motion.div>

          {/* Right: Side Info */}
          <motion.div 
            initial={{ opacity: 0, x: 35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Map Placeholder */}
            <div className="h-56 rounded-3xl overflow-hidden relative" style={{ background: "linear-gradient(135deg, #2D1B69, #3d2a88)" }}>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <MapPin size={40} className="mb-2 opacity-60" />
                <p className="text-sm font-bold opacity-60" style={{ fontFamily: "Poppins, sans-serif" }}>Academy Location</p>
                <p className="text-xs opacity-40 text-center mt-1">123 Abacus Street, Pune<br/>Maharashtra – 411001</p>
              </div>
            </div>

            {/* Quick Facts */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#FFF8F0] to-white dark:from-[#1e1445] dark:to-[#1a1035] border-2 border-[#FF6B2B]/20">
              <h3 className="font-black text-[#2D1B69] dark:text-white text-base mb-5" style={{ fontFamily: "Poppins, sans-serif" }}>
                Why Choose Smart Abacus?
              </h3>
              <div className="space-y-3">
                {[
                  "Free Demo Class Available",
                  "Certified Expert Instructors",
                  "Flexible Batch Timings",
                  "Regular Parent Updates",
                  "Certificate on Completion",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #FF6B2B, #FFCA28)" }}>
                      <CheckCircle2 size={11} color="white" />
                    </div>
                    <span className="text-slate-700 dark:text-slate-200 text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>


        </div>
      </section>

      <Footer />
    </div>
  );
}