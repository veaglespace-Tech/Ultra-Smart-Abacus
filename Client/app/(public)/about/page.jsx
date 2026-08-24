"use client";
import Navbar from "../../../components/shared/Navbar";
import Footer from "../../../components/shared/Footer";
import { CheckCircle2, Star, Trophy, Clock, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const milestones = [
  { year: "2010", title: "Academy Founded", desc: "Started with a single classroom and 20 students in Pune." },
  { year: "2014", title: "1000+ Students", desc: "Expanded to 3 cities — Mumbai, Nashik, and Kolhapur." },
  { year: "2018", title: "National Champions", desc: "Our students won Gold at the National Abacus Championship." },
  { year: "2021", title: "50+ Centres", desc: "Franchise network expanded across Maharashtra and beyond." },
  { year: "2024", title: "10,000 Minds Unlocked", desc: "Reached the milestone of training 10,000+ young students." },
];

const team = [
  { name: "Dr. Priya Sharma", role: "Founder & Head Trainer", initials: "PS", color: "#2D1B69", exp: "20+ years" },
  { name: "Rahul Mehta", role: "Curriculum Director", initials: "RM", color: "#FF6B2B", exp: "15+ years" },
  { name: "Sonal Patil", role: "Lead Abacus Coach", initials: "SP", color: "#FFCA28", exp: "12+ years" },
  { name: "Amit Joshi", role: "Franchise Manager", initials: "AJ", color: "#10B981", exp: "10+ years" },
];

const promise = [
  "Personalized learning paths for every student",
  "Expert guidance from certified instructors",
  "Proven results in 6–12 months",
  "Interactive and engaging learning experience",
  "Lifetime support and community access",
  "Regular parent-teacher progress sessions",
];

export default function About() {
  return (
    <div 
      className="min-h-screen flex flex-col bg-cover bg-center bg-fixed relative transition-colors duration-300" 
      style={{ 
        fontFamily: "Inter, sans-serif",
        backgroundImage: "linear-gradient(to bottom, rgba(15, 10, 30, 0.88), rgba(45, 27, 105, 0.85)), url('/images/contact.jpg')"
      }}
    >
      <Navbar />

      {/* ── Hero Banner ── */}
      <section className="relative py-28 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-15"
          style={{ backgroundImage: "url('/images/banner.jpg')", backgroundSize: "cover", backgroundPosition: "center", mixBlendMode: "luminosity" }} />
        <div className="absolute inset-0 dot-pattern opacity-15" />
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-20 animate-blob1"
          style={{ background: "radial-gradient(circle, #FF6B2B, transparent 70%)", filter: "blur(60px)" }} />

        <div className="relative max-w-4xl mx-auto text-center text-white">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
            style={{ background: "rgba(255,202,40,0.15)", color: "#FFCA28", border: "1px solid rgba(255,202,40,0.3)", fontFamily: "Outfit, sans-serif" }}>
            Our Story
          </span>
          <h1 className="font-black text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6" style={{ fontFamily: "Poppins, sans-serif" }}>
            About{" "}
            <span style={{
              background: "linear-gradient(135deg, #FF6B2B, #FFCA28)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Smart Abacus
            </span>
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto" style={{ fontFamily: "Inter, sans-serif" }}>
            India&apos;s most trusted Abacus Academy — empowering children with extraordinary mathematical abilities, sharp focus, and lifelong confidence since 2010.
          </p>
        </div>
      </section>

      {/* ── About Content ── */}
      <section className="pt-16 pb-6 px-6 bg-white/70 dark:bg-[#150e2a]/70 backdrop-blur-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[420px]">
              <img src="/images/demo.jpg" alt="Smart Abacus Classroom" className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(45,27,105,0.3), transparent)" }} />
            </div>
            <div className="absolute -bottom-6 -right-6 p-5 rounded-2xl shadow-xl"
              style={{ background: "linear-gradient(135deg, #2D1B69, #FF6B2B)", color: "white" }}>
              <div className="text-3xl font-black leading-none" style={{ fontFamily: "Poppins, sans-serif" }}>15+</div>
              <div className="text-xs font-medium opacity-80 mt-0.5">Years of Excellence</div>
            </div>
            <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full opacity-20 dot-pattern" />
          </div>

          <div>
            <span className="badge-accent mb-4 inline-flex">Who We Are</span>
            <h2 className="section-heading text-[#2D1B69] dark:text-white mb-6">
              Leading the Future of<br />
              <span style={{ color: "#FF6B2B" }}>Math Education</span>
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-4">
              Smart Abacus is a leading education platform dedicated to unlocking the mathematical potential in every child. With over 15 years of excellence, we have empowered thousands of students to achieve extraordinary computational abilities and academic success.
            </p>
            <p className="text-slate-600 text-lg leading-relaxed mb-8">
              Our comprehensive curriculum combines traditional Abacus methodology with modern educational techniques, ensuring students develop not just calculation skills but also enhanced memory, focus, and problem-solving abilities.
            </p>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { value: "10K+", label: "Students", icon: Users },
                { value: "15+", label: "Years", icon: Clock },
                { value: "50+", label: "Centres", icon: Trophy },
              ].map(({ value, label, icon: Icon }, i) => (
                <div key={i} className="text-center p-4 rounded-2xl bg-[#2D1B69]/5 dark:bg-[#2D1B69]/20 border border-[#2D1B69]/10 dark:border-[#2D1B69]/40">
                  <Icon size={20} className="mx-auto mb-2" style={{ color: "#FF6B2B" }} />
                  <div className="text-2xl font-black text-[#2D1B69]" style={{ fontFamily: "Poppins, sans-serif" }}>{value}</div>
                  <div className="text-xl text-slate-500 font-medium">{label}</div>
                </div>
              ))}
            </div>

            <Link href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm text-white"
              style={{ background: "linear-gradient(135deg, #FF6B2B, #e55a1f)", boxShadow: "0 4px 15px rgba(255,107,43,0.35)", fontFamily: "Poppins, sans-serif" }}>
              Book Free Demo
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Our Promise ── */}
      <section className="py-16 px-4 sm:px-6 bg-white/70 dark:bg-[#0f0a1e]/70 backdrop-blur-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <span className="badge-primary inline-flex items-center px-6 py-2.5 text-base sm:text-lg font-bold rounded-full mb-3">Our Commitment</span>
            <h2 className="section-heading text-[#2D1B69] dark:text-white mb-6">
              Our Promise to<br />
              <span style={{ color: "#FF6B2B" }}>Every Family</span>
            </h2>
            <ul className="space-y-3.5">
              {promise.map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #FF6B2B, #FFCA28)" }}>
                    <CheckCircle2 size={12} color="white" />
                  </div>
                  <span className="text-slate-700 dark:text-slate-200 text-base sm:text-lg font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Decorative bento grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {[
              { title: "Game-Based Learning", desc: "Interactive gamified modules keep children motivated & excited.", color: "#2D1B69", bg: "rgba(45,27,105,0.08)", emoji: "🎮" },
              { title: "Certified Instructors", desc: "Accredited teachers trained in specialized mental math pedagogy.", color: "#FF6B2B", bg: "rgba(255,107,43,0.08)", emoji: "👩‍🏫" },
              { title: "Progress Tracking", desc: "Detailed performance telemetry and level assessment metrics.", color: "#FFCA28", bg: "rgba(255,202,40,0.1)", emoji: "📊" },
              { title: "Parent Reports", desc: "Transparent weekly feedback and dedicated progress reviews.", color: "#10B981", bg: "rgba(16,185,129,0.08)", emoji: "📋" },
            ].map(({ title, desc, color, bg, emoji }, i) => (
              <div key={i} className="p-5 sm:p-6 rounded-3xl card-hover bg-white/90 dark:bg-[#1e1445]/90 backdrop-blur-md shadow-md flex flex-col justify-between" style={{ border: `2px solid ${color}25` }}>
                <div>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-3" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                    {emoji}
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-white mb-1.5 leading-snug break-words" style={{ fontFamily: "Poppins, sans-serif" }}>{title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="py-20 px-6" style={{ background: "linear-gradient(135deg, #2D1B69, #1a1035)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
              style={{ background: "rgba(255,202,40,0.15)", color: "#FFCA28", border: "1px solid rgba(255,202,40,0.3)", fontFamily: "Outfit, sans-serif" }}>
              Our Journey
            </span>
            <h2 className="section-heading text-white">
              Milestones of <span style={{ color: "#FFCA28" }}>Excellence</span>
            </h2>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5" style={{ background: "linear-gradient(to bottom, #FF6B2B, rgba(255,107,43,0.1))" }} />

            <div className="space-y-8">
              {milestones.map(({ year, title, desc }, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative flex items-start gap-8 pl-20"
                >
                  {/* Dot */}
                  <div className="absolute left-5 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #FF6B2B, #FFCA28)", border: "3px solid #1a1035" }}>
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>

                  {/* Year Badge */}
                  <span className="absolute left-0 top-0.5 text-xs font-black px-3 py-1 rounded-full flex-shrink-0"
                    style={{ background: "rgba(255,202,40,0.15)", color: "#FFCA28", border: "1px solid rgba(255,202,40,0.3)", fontFamily: "Outfit, sans-serif", minWidth: "60px", textAlign: "center" }}>
                    {year}
                  </span>

                  {/* Content */}
                  <div className="p-5 rounded-2xl flex-1" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <h3 className="font-bold text-white text-base mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>{title}</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Team Section ── */}
      <section className="py-20 px-6 bg-white/70 dark:bg-[#0f0a1e]/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="badge-accent mb-4 inline-flex">Meet the Team</span>
            <h2 className="section-heading text-[#2D1B69]">
              The Experts Behind <span style={{ color: "#FF6B2B" }}>Your Child&apos;s Success</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map(({ name, role, initials, color, exp }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group p-6 rounded-3xl text-center border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#1e1445] card-shine-effect shadow-sm transition-all duration-300"
              >
                {/* Avatar */}
                <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center font-black text-xl text-white group-hover:scale-105 transition-transform duration-300"
                  style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}>
                  {initials}
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white text-base mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>{name}</h3>
                <p className="text-[#FF6B2B] text-xs font-bold mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>{role}</p>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ background: `${color}15`, color }}>
                  <Star size={10} fill={color} />
                  {exp} Experience
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
