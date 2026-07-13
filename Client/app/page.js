"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "../components/shared/Navbar";
import Footer from "../components/shared/Footer";
import { motion, AnimatePresence } from "framer-motion";

import {
  ChevronDown, HelpCircle, CheckCircle2, ArrowRight,
  Star, Brain, Zap, Trophy, Eye, BookOpen, Users,
  Clock, Award, MapPin, TrendingUp, ChevronRight
} from "lucide-react";

/* ─── Course Data ─── */
const abacusCourses = [
  {
    id: 1,
    emoji: "🔢",
    level: "Level 1",
    badge: "Beginner",
    badgeColor: "#10B981",
    title: "Junior Abacus Star",
    age: "Ages 5–7",
    description: "Introduction to the Soroban tool, basic finger theory, and number recognition. Simple 1 & 2 digit arithmetic using physical beads.",
    topics: ["Introduction to Soroban Tool", "Direct Addition & Subtraction", "Finger Theory Practice"],
    popular: false,
  },
  {
    id: 2,
    emoji: "🧠",
    level: "Level 2",
    badge: "Intermediate",
    badgeColor: "#3B82F6",
    title: "Mental Math Mastermind",
    age: "Ages 7+",
    description: "Mastering 'Big Friends' & 'Small Friends' formulas. Transitioning from physical abacus to pure mental imagery for lightning-fast calculations.",
    topics: ["Big & Small Friends Formulas", "Multi-digit Operations", "Mental Arithmetic Imagery"],
    popular: true,
  },
  {
    id: 3,
    emoji: "🏆",
    level: "Level 3",
    badge: "Expert",
    badgeColor: "#FF6B2B",
    title: "Advanced Math Champion",
    age: "Ages 8+",
    description: "High-speed multiplication, long division, and decimals. Perfect for students preparing for national and international math competitions.",
    topics: ["Advanced Long Division", "Decimal Operations", "Championship Speed Drills"],
    popular: false,
  },
  {
    id: 4,
    emoji: "📖",
    level: "Special Skill",
    badge: "All Ages",
    badgeColor: "#8B5CF6",
    title: "Speed Reading & Handwriting",
    age: "All Students",
    description: "Phonics-based reading drills for fluency, and dedicated hand muscle exercises with grip correction for beautiful handwriting.",
    topics: ["Phonics & Reading Fluency", "Handwriting Grip Correction", "Vocabulary Building"],
    popular: false,
  },
  {
    id: 5,
    emoji: "⚡",
    level: "Skill Up",
    badge: "10+ Years",
    badgeColor: "#FFCA28",
    title: "Vedic Mathematics Shortcuts",
    age: "Ages 10+",
    description: "Ancient Indian mathematical shortcuts to solve massive calculations, squares, cubes, and equations mentally in seconds.",
    topics: ["Lightning Multiplication Tricks", "Square & Cube Root Secrets", "Exam Stress Buster"],
    popular: false,
  },
  {
    id: 6,
    emoji: "🎯",
    level: "Brain Gym",
    badge: "Ages 6+",
    badgeColor: "#EC4899",
    title: "Memory & Rubik's Cube",
    age: "Ages 6+",
    description: "Photographic memory training combined with Rubik's cube algorithms to increase focus, patience, and brain coordination.",
    topics: ["Photographic Memory Drills", "3×3 Rubik's Cube Secrets", "Focus Enhancement"],
    popular: false,
  },
];

/* ─── FAQ Data ─── */
const faqs = [
  { id: 1, question: "What are the main benefits of enrolling my child in Smart Abacus?", answer: "Abacus training significantly enhances mental math skills. Your child will calculate 5× faster with accuracy. It also improves concentration, memory, and overall cognitive development, helping excel academically." },
  { id: 2, question: "How often are classes held, and what is the structure of levels?", answer: "Classes are conducted twice a week for 2 hours per session or as weekend batches. The program has 8 progressive levels, each lasting 3–4 months depending on the child's pace." },
  { id: 3, question: "How long does it take to complete the full abacus program?", answer: "To complete all foundation and advanced levels, it takes around 2 to 2.5 years. However, noticeable improvements in calculation speed and focus can be seen within the first 3–6 months." },
  { id: 4, question: "Are twice-a-week classes sufficient for Abacus learning?", answer: "Yes, twice-a-week interactive sessions are perfect, provided the child practices at home for at least 10–15 minutes daily. Consistent daily practice is the key to mastering mental arithmetic." },
  { id: 5, question: "Does every child have to enroll from Level 1?", answer: "Yes, every child starts from Level 1 because Abacus requires learning specific finger movements and bead formulas from scratch, regardless of the child's age or school grade." },
  { id: 6, question: "How can I as a parent support my child's abacus learning at home?", answer: "You don't need to know Abacus to help! Just ensure 10 minutes of daily homework, encourage mental theory methods, and appreciate their efforts to boost confidence." },
];

/* ─── Benefit Items ─── */
const benefits = [
  { icon: Brain, label: "Photographic Memory", color: "#a855f7", bg: "rgba(168,85,247,0.08)" },
  { icon: Zap, label: "Lightning Speed Math", color: "#FF6B2B", bg: "rgba(255,107,43,0.08)" },
  { icon: Eye, label: "Visualization Skills", color: "#EAB308", bg: "rgba(234,179,8,0.08)" },
  { icon: TrendingUp, label: "Self-Confidence", color: "#10B981", bg: "rgba(16,185,129,0.08)" },
  { icon: BookOpen, label: "Academic Excellence", color: "#3B82F6", bg: "rgba(59,130,246,0.08)" },
  { icon: Users, label: "Listening Skills", color: "#EC4899", bg: "rgba(236,72,153,0.08)" },
];

/* ─── Testimonials ─── */
const testimonials = [
  { name: "Radhika", age: 9, city: "Mumbai", initials: "R", color: "#FF6B2B", quote: "I improved my calculation speed by 10× in just 6 months! Now I solve math problems faster than my calculator.", stars: 5 },
  { name: "Arjun", age: 11, city: "Delhi", initials: "A", color: "#2D1B69", quote: "I won the National Abacus Championship! The training was rigorous but worth every moment. I'm now helping other students.", stars: 5 },
  { name: "Maya", age: 8, city: "Bangalore", initials: "M", color: "#FFCA28", quote: "My grades improved from C to A+ in mathematics! I feel more confident in class now and love solving problems.", stars: 5 },
];

/* ─── Animated Counter Hook ─── */
function useCounter(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

export default function Home() {
  const [openFaq, setOpenFaq] = useState(1);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  const students = useCounter(10000, 2000, statsVisible);
  const years = useCounter(15, 1500, statsVisible);
  const centres = useCounter(50, 1500, statsVisible);
  const satisfaction = useCounter(98, 2000, statsVisible);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const x = (clientX - window.innerWidth / 2) / 35;
      const y = (clientY - window.innerHeight / 2) / 35;
      setMousePos({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col bg-white dark:bg-[#0f0a1e] transition-colors duration-300" style={{ fontFamily: "Inter, sans-serif" }}>

      {/* Marquee CSS */}
      <style jsx global>{`
        @keyframes marqueeAnim {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track { animation: marqueeAnim 25s linear infinite; }
        .marquee-track:hover { animation-play-state: paused; }
      `}</style>

      <Navbar />

      {/* ════════════════════════════════════════
          HERO SECTION
          ════════════════════════════════════════ */}
      <section
        className="relative min-h-[92vh] flex items-center overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a1035 0%, #2D1B69 50%, #3d2a88 100%)" }}
      >
        {/* Background Image Overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "url('/images/banner.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            mixBlendMode: "luminosity",
          }}
        />

        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-20 dot-pattern" />

        {/* Animated Blobs */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-20 animate-blob1"
          style={{ background: "radial-gradient(circle, #FF6B2B, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute -bottom-40 -left-20 w-[400px] h-[400px] rounded-full opacity-15 animate-blob2"
          style={{ background: "radial-gradient(circle, #7C3AED, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5 animate-blob3"
          style={{ background: "radial-gradient(circle, #FFCA28, transparent 70%)", filter: "blur(80px)" }} />

        {/* Floating 3D glowing math tokens (Cursor reactive & auto-floating) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden hidden lg:block select-none z-10">
          
          {/* Token 1: Addition (+) - Top Left */}
          <div 
            className="absolute top-24 left-8 transition-transform duration-500 ease-out"
            style={{ transform: `translate(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px)` }}
          >
            <motion.div
              animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              whileHover={{ scale: 1.15, rotate: 15 }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white pointer-events-auto cursor-pointer"
              style={{
                background: "linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(139, 92, 246, 0.1))",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(139, 92, 246, 0.5)",
                boxShadow: "0 0 20px rgba(139, 92, 246, 0.3), inset 0 2px 4px rgba(255,255,255,0.2)",
                fontFamily: "Poppins, sans-serif",
                textShadow: "0 0 10px rgba(255, 255, 255, 0.6)"
              }}
            >
              +
            </motion.div>
          </div>

          {/* Token 2: Multiplication (×) - Mid Right */}
          <div 
            className="absolute top-36 right-10 transition-transform duration-500 ease-out"
            style={{ transform: `translate(${mousePos.x * -0.9}px, ${mousePos.y * -0.9}px)` }}
          >
            <motion.div
              animate={{ y: [0, -18, 0], rotate: [0, -6, 6, 0] }}
              transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 0.5 }}
              whileHover={{ scale: 1.15, rotate: -15 }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black text-[#FFCA28] pointer-events-auto cursor-pointer"
              style={{
                background: "linear-gradient(135deg, rgba(255, 202, 40, 0.35), rgba(255, 202, 40, 0.08))",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 202, 40, 0.5)",
                boxShadow: "0 0 20px rgba(255, 202, 40, 0.25), inset 0 2px 4px rgba(255,255,255,0.2)",
                fontFamily: "Poppins, sans-serif",
                textShadow: "0 0 8px rgba(255, 202, 40, 0.5)"
              }}
            >
              ×
            </motion.div>
          </div>

          {/* Token 3: Division (÷) - Bottom Left */}
          <div 
            className="absolute bottom-36 left-12 transition-transform duration-500 ease-out"
            style={{ transform: `translate(${mousePos.x * 1.1}px, ${mousePos.y * 1.1}px)` }}
          >
            <motion.div
              animate={{ y: [0, -16, 0], rotate: [0, 8, -8, 0] }}
              transition={{ repeat: Infinity, duration: 6.5, ease: "easeInOut", delay: 1 }}
              whileHover={{ scale: 1.15, rotate: 10 }}
              className="w-15 h-15 rounded-2xl flex items-center justify-center text-2xl font-black text-[white] pointer-events-auto cursor-pointer"
              style={{
                background: "linear-gradient(135deg, rgba(255, 107, 43, 0.35), rgba(255, 107, 43, 0.08))",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 107, 43, 0.5)",
                boxShadow: "0 0 20px rgba(255, 107, 43, 0.25), inset 0 2px 4px rgba(255,255,255,0.2)",
                fontFamily: "Poppins, sans-serif",
                textShadow: "0 0 8px rgba(255, 107, 43, 0.5)"
              }}
            >
              ÷
            </motion.div>
          </div>

          {/* Token 4: Subtraction (-) - Bottom Right */}
          <div 
            className="absolute bottom-28 right-8 transition-transform duration-500 ease-out"
            style={{ transform: `translate(${mousePos.x * -0.7}px, ${mousePos.y * -0.7}px)` }}
          >
            <motion.div
              animate={{ y: [0, -14, 0], rotate: [0, -5, 5, 0] }}
              transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut", delay: 1.5 }}
              whileHover={{ scale: 1.15, rotate: -20 }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black text-[#10B981] pointer-events-auto cursor-pointer"
              style={{
                background: "linear-gradient(135deg, rgba(16, 185, 129, 0.35), rgba(16, 185, 129, 0.08))",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(16, 185, 129, 0.5)",
                boxShadow: "0 0 20px rgba(16, 185, 129, 0.25), inset 0 2px 4px rgba(255,255,255,0.2)",
                fontFamily: "Poppins, sans-serif",
                textShadow: "0 0 8px rgba(16, 185, 129, 0.5)"
              }}
            >
              -
            </motion.div>
          </div>

        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left: Text Content */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-white text-center lg:text-left"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border border-[#FF6B2B]/40 bg-[#FF6B2B]/10">
                <span className="w-2 h-2 rounded-full bg-[#FFCA28] animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#FFCA28]" style={{ fontFamily: "Outfit, sans-serif" }}>
                  India&apos;s #1 Abacus Academy
                </span>
              </div>

              <h1 className="font-black text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight mb-6" style={{ fontFamily: "Poppins, sans-serif" }}>
                Unlock Your
                <br />
                Child&apos;s{" "}
                <span style={{
                  background: "linear-gradient(135deg, #FF6B2B, #FFCA28)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  Math Super
                </span>
                <br />
                Powers
              </h1>

              <p className="text-slate-300 text-lg leading-relaxed mb-10 max-w-xl" style={{ fontFamily: "Inter, sans-serif" }}>
                World-class Abacus & Mental Arithmetic training that builds concentration, memory, and blazing calculation speed in children from age 5 onwards.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/auth/login"
                  className="btn-shine group flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-white text-sm shadow-xl"
                  style={{
                    background: "linear-gradient(135deg, #FF6B2B, #e55a1f)",
                    boxShadow: "0 8px 30px rgba(255,107,43,0.45)",
                    fontFamily: "Poppins, sans-serif",
                  }}
                >
                  Sign In to ERP Portal
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/contact"
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-white text-sm border-2 border-white/20 hover:border-white/40 hover:bg-white/10 transition-all duration-300"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Book Free Demo
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-6 mt-10 justify-center lg:justify-start">
                <div className="flex items-center gap-2 text-white/70">
                  <Trophy size={16} className="text-[#FFCA28]" />
                  <span className="text-sm font-medium">National Champions</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <Award size={16} className="text-[#FFCA28]" />
                  <span className="text-sm font-medium">ISO Certified</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <MapPin size={16} className="text-[#FFCA28]" />
                  <span className="text-sm font-medium">50+ Centres</span>
                </div>
              </div>
            </motion.div>

            {/* Right: Abacus Illustration Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
              className="hidden lg:flex justify-center items-center"
            >
              <div className="relative">
                {/* Main card */}
                <div className="relative w-[420px] h-[480px] rounded-3xl overflow-hidden shadow-2xl" style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  backdropFilter: "blur(20px)",
                }}>
                  <img
                    src="/images/abacus-learning.png"
                    alt="Students practicing abacus"
                    className="w-full h-full object-cover opacity-90"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 40%, rgba(26,16,53,0.85) 100%)" }} />

                  {/* Bottom card content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-2 mb-2">
                      {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#FFCA28" color="#FFCA28" />)}
                      <span className="text-white/80 text-xs ml-1">5.0 rating</span>
                    </div>
                    <p className="text-white font-bold text-lg leading-snug" style={{ fontFamily: "Poppins, sans-serif" }}>
                      Transforming young minds<br />one calculation at a time
                    </p>
                  </div>
                </div>

                {/* Floating Stats Card 1 (Students Trained) */}
                <div className="absolute -left-16 top-12 px-5 py-4 rounded-3xl shadow-[0_15px_40px_rgba(139,92,246,0.3)] transition-transform duration-300 flex items-center gap-3.5 border border-[#8b5cf6]/40 backdrop-blur-xl"
                  style={{ 
                    background: "linear-gradient(135deg, rgba(30, 20, 70, 0.85), rgba(15, 10, 40, 0.9))", 
                    transform: `translate(${mousePos.x * -1.5}px, ${mousePos.y * -1.5}px)`
                  }}>
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-[#8b5cf6]/20 border border-[#8b5cf6]/50 shadow-[0_0_15px_rgba(139,92,246,0.35)] flex-shrink-0">
                    <Users size={20} className="text-[#a78bfa]" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-white leading-none mb-1 tracking-tight" style={{ fontFamily: "Poppins, sans-serif" }}>10K+</div>
                    <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest" style={{ fontFamily: "Outfit, sans-serif" }}>Students Trained</div>
                  </div>
                </div>

                {/* Floating Stats Card 2 (Parent Satisfaction) */}
                <div className="absolute -right-12 bottom-20 px-5 py-4 rounded-3xl shadow-[0_15px_40px_rgba(255,107,43,0.35)] transition-transform duration-300 flex items-center gap-3.5 border border-[#FF6B2B]/40 backdrop-blur-xl"
                  style={{ 
                    background: "linear-gradient(135deg, rgba(50, 20, 10, 0.85), rgba(25, 10, 5, 0.9))", 
                    transform: `translate(${mousePos.x * 1.8}px, ${mousePos.y * 1.8}px)`
                  }}>
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-[#FF6B2B]/20 border border-[#FF6B2B]/50 shadow-[0_0_15px_rgba(255,107,43,0.35)] flex-shrink-0">
                    <Star size={20} className="text-[#ff9f75] fill-[#ff9f75]" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-[#FFCA28] leading-none mb-1 tracking-tight" style={{ fontFamily: "Poppins, sans-serif" }}>98%</div>
                    <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest" style={{ fontFamily: "Outfit, sans-serif" }}>Parent Satisfaction</div>
                  </div>
                </div>

                {/* Floating Stats Card 3 (National Winners) */}
                <div className="absolute -right-8 top-8 px-5 py-3.5 rounded-3xl shadow-[0_15px_40px_rgba(16,185,129,0.35)] transition-transform duration-300 flex items-center gap-3 border border-[#10b981]/40 backdrop-blur-xl"
                  style={{ 
                    background: "linear-gradient(135deg, rgba(10, 45, 25, 0.85), rgba(5, 25, 12, 0.9))", 
                    transform: `translate(${mousePos.x * 0.9}px, ${mousePos.y * 0.9}px)`
                  }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#10b981]/20 border border-[#10b981]/50 shadow-[0_0_12px_rgba(16,185,129,0.35)] flex-shrink-0">
                    <Trophy size={16} className="text-[#34d399]" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black text-white uppercase tracking-widest" style={{ fontFamily: "Outfit, sans-serif" }}>National Winners</span>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* Bottom chevron */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 animate-bounce">
          <ChevronDown size={28} />
        </div>
      </section>

      {/* ════════════════════════════════════════
          ANIMATED STATS BAR
          ════════════════════════════════════════ */}
      <section ref={statsRef} className="py-12 px-6" style={{ background: "linear-gradient(135deg, #2D1B69, #1a1035)" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {[
            { value: students, suffix: "+", label: "Students Trained", icon: Users },
            { value: years, suffix: "+", label: "Years of Excellence", icon: Clock },
            { value: centres, suffix: "+", label: "Active Centres", icon: MapPin },
            { value: satisfaction, suffix: "%", label: "Parent Satisfaction", icon: Star },
          ].map(({ value, suffix, label, icon: Icon }, i) => (
            <div key={i} className="group">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Icon size={18} className="text-[#FF6B2B]" />
              </div>
              <div className="text-4xl font-black mb-1" style={{ fontFamily: "Poppins, sans-serif", color: "#FFCA28" }}>
                {value.toLocaleString()}{suffix}
              </div>
              <div className="text-sm text-white/60 font-medium" style={{ fontFamily: "Inter, sans-serif" }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          ABOUT SECTION
          ════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-[#FFF8F0] dark:bg-[#150e2a] transition-colors duration-300">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[420px]">
              <img src="/images/banner.jpg" alt="Smart Abacus Academy" className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(45,27,105,0.3), transparent)" }} />
            </div>
            {/* Decorative card floating */}
            <div className="absolute -bottom-6 -right-6 p-4 rounded-2xl shadow-xl"
              style={{ background: "linear-gradient(135deg, #2D1B69, #FF6B2B)", color: "white" }}>
              <div className="text-3xl font-black" style={{ fontFamily: "Poppins, sans-serif" }}>15+</div>
              <div className="text-xs font-medium opacity-80">Years of Trust</div>
            </div>
            {/* Dot decoration */}
            <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full opacity-20 dot-pattern" />
          </div>

          {/* Content */}
          <div>
            <span className="badge-accent mb-4 inline-flex">About Our Academy</span>
            <h2 className="section-heading text-[#2D1B69] mb-6">
              India&apos;s Most Trusted<br />
              <span style={{ color: "#FF6B2B" }}>Abacus Academy</span>
            </h2>
            <p className="text-slate-600 text-base leading-relaxed mb-4" style={{ fontFamily: "Inter, sans-serif" }}>
              Smart Abacus is a leading education platform dedicated to unlocking the mathematical potential in every child. With over 15 years of excellence, we have empowered thousands of students to achieve extraordinary computational abilities and academic success.
            </p>
            <p className="text-slate-600 text-base leading-relaxed mb-8" style={{ fontFamily: "Inter, sans-serif" }}>
              Our comprehensive curriculum combines traditional Abacus methodology with modern educational techniques, ensuring students develop not just calculation skills but also enhanced memory, focus, and problem-solving abilities.
            </p>

            {/* Promise List */}
            <ul className="space-y-3 mb-8">
              {[
                "Personalized learning paths for every student",
                "Expert guidance from certified instructors",
                "Proven results in 6–12 months",
                "Interactive and engaging learning experience",
                "Lifetime support and community access",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #FF6B2B, #FFCA28)" }}>
                    <CheckCircle2 size={12} color="white" />
                  </div>
                  <span className="text-slate-700 text-sm font-medium" style={{ fontFamily: "Inter, sans-serif" }}>{item}</span>
                </li>
              ))}
            </ul>

            <Link href="/about"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm text-white transition-all"
              style={{ background: "linear-gradient(135deg, #2D1B69, #3d2a88)", fontFamily: "Poppins, sans-serif" }}>
              Learn More About Us
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          BENEFITS SECTION — ULTRA MODERN CARDS
          ════════════════════════════════════════ */}
      <section className="py-24 px-6 overflow-hidden bg-gradient-to-b from-[#f8f6ff] to-white dark:from-[#150e2a] dark:to-[#0f0a1e] transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="badge-primary mb-4 inline-flex">Why Abacus?</span>
            <h2 className="section-heading text-[#2D1B69]">
              Benefits That Last a <span style={{ color: "#FF6B2B" }}>Lifetime</span>
            </h2>
            <p className="section-subheading mx-auto mt-4 text-center">
              Smart Abacus training develops a dynamic number sense. The game-based technique keeps kids engaged while building crucial life skills.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map(({ icon: Icon, label, color, bg }, i) => {
              const num = String(i + 1).padStart(2, "0");
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                  className="group relative rounded-3xl overflow-hidden cursor-default bg-white dark:bg-[#1e1445] border border-slate-100 dark:border-slate-850"
                  style={{
                    boxShadow: "0 2px 20px rgba(45,27,105,0.07)",
                    transition: "transform 0.35s ease, box-shadow 0.35s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-8px)";
                    e.currentTarget.style.boxShadow = `0 20px 50px ${color}30, 0 4px 20px rgba(45,27,105,0.1)`;
                    e.currentTarget.style.borderColor = `${color}50`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0px)";
                    e.currentTarget.style.boxShadow = "0 2px 20px rgba(45,27,105,0.07)";
                    e.currentTarget.style.borderColor = "";
                  }}
                >
                  {/* ── Diagonal Accent Strip (top-right corner) ── */}
                  <div
                    className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-15 group-hover:opacity-30 transition-opacity duration-400"
                    style={{ background: color, filter: "blur(20px)" }}
                  />

                   {/* ── Large Background Number ── */}
                  <div
                    className="absolute top-3 right-4 font-black select-none pointer-events-none leading-none opacity-[0.12] dark:opacity-[0.16] group-hover:opacity-[0.25] transition-all duration-400"
                    style={{
                      fontSize: "5rem",
                      color,
                      fontFamily: "Poppins, sans-serif",
                      lineHeight: 1,
                    }}
                  >
                    {num}
                  </div>

                  {/* ── Card Body ── */}
                  <div className="relative p-7">
                    {/* Icon Badge (Placed in the top-left circle wrapper) */}
                    <div
                      className="inline-flex items-center justify-center w-9 h-9 rounded-full mb-5 group-hover:scale-110 transition-all duration-300 relative"
                      style={{
                        background: `${color}1A`,
                        border: `1.5px solid ${color}40`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = `0 0 15px ${color}50`;
                        e.currentTarget.style.background = `${color}30`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "";
                        e.currentTarget.style.background = `${color}1A`;
                      }}
                    >
                      {/* Inner glow pulse */}
                      <div
                        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                        style={{ background: `radial-gradient(circle, ${color}40, transparent 70%)` }}
                      />
                      <Icon size={16} style={{ color, position: "relative", zIndex: 1 }} />
                    </div>

                    {/* Title */}
                    <h3
                      className="font-black text-lg text-slate-800 dark:text-white mb-2 leading-snug"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      {label}
                    </h3>

                    {/* Description */}
                    <p
                      className="text-slate-500 dark:text-violet-200 text-sm leading-relaxed"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      Develops through consistent abacus practice and mental exercises.
                    </p>

                    {/* ── Animated Bottom Progress Bar ── */}
                    <div className="mt-5 h-1 rounded-full overflow-hidden" style={{ background: `${color}15` }}>
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          background: `linear-gradient(90deg, ${color}, ${color}80)`,
                          width: "35%",
                        }}
                        ref={(el) => {
                          if (!el) return;
                          const parent = el.closest(".group");
                          if (!parent) return;
                          const enter = () => { el.style.width = "100%"; };
                          const leave = () => { el.style.width = "35%"; };
                          parent.addEventListener("mouseenter", enter);
                          parent.addEventListener("mouseleave", leave);
                        }}
                      />
                    </div>
                  </div>

                  {/* ── Left side vertical accent line ── */}
                  <div
                    className="absolute left-0 top-6 bottom-6 w-1 rounded-r-full opacity-0 group-hover:opacity-100 transition-all duration-400"
                    style={{ background: `linear-gradient(to bottom, ${color}, ${color}30)` }}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          COURSES SECTION
          ════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#FFF8F0] to-white dark:from-[#150e2a] dark:to-[#0f0a1e] transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="badge-accent mb-4 inline-flex">Our Programs</span>
            <h2 className="section-heading text-[#2D1B69]">
              Comprehensive <span style={{ color: "#FF6B2B" }}>Courses</span>
            </h2>
            <p className="section-subheading mx-auto mt-4 text-center">
              Unlock your child&apos;s full potential with structured Abacus programs, creative reading-writing skills, and mental math bootcamps.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {abacusCourses.map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="relative group bg-white dark:bg-[#1e1445] rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800/80 hover:shadow-2xl hover:-translate-y-2 transition-all duration-400"
                style={{ borderTop: `6px solid ${course.badgeColor}` }}
              >
                {/* Absolute badge aligned to the top line (Glassmorphism with border glow & pulse dot) */}
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md backdrop-blur-md transition-all duration-300 group-hover:scale-105 bg-white/95 dark:bg-[#0f0a1e]/90"
                  style={{
                    border: `1.5px solid ${course.badgeColor}`,
                    color: course.badgeColor,
                    boxShadow: `0 4px 12px ${course.badgeColor}25`,
                    fontFamily: "Outfit, sans-serif"
                  }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: course.badgeColor }} />
                  {course.badge}
                </span>

                <div className="p-6 card-shine-effect rounded-b-3xl">
                  {/* Emoji + Badges */}
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-4xl">{course.emoji}</span>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-full font-medium">
                        {course.age}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
                    {course.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-5" style={{ fontFamily: "Inter, sans-serif" }}>
                    {course.description}
                  </p>

                  {/* Topics */}
                  <div className="space-y-2 mb-6">
                    {course.topics.map((topic, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: course.badgeColor }} />
                        <span className="text-xs text-slate-600 font-medium" style={{ fontFamily: "Inter, sans-serif" }}>{topic}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <Link href="/contact"
                    className="group/btn flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 border-2"
                    style={{ borderColor: course.badgeColor, color: course.badgeColor, fontFamily: "Outfit, sans-serif" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = course.badgeColor; e.currentTarget.style.color = "white"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = course.badgeColor; }}>
                    Inquire Now
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/courses"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm text-white transition-all"
              style={{ background: "linear-gradient(135deg, #2D1B69, #3d2a88)", boxShadow: "0 4px 20px rgba(45,27,105,0.3)", fontFamily: "Poppins, sans-serif" }}>
              View All Courses
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          TESTIMONIALS SECTION
          ════════════════════════════════════════ */}
      <section className="py-24 px-6" style={{ background: "linear-gradient(135deg, #2D1B69 0%, #1a1035 100%)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
              style={{ background: "rgba(255,202,40,0.15)", color: "#FFCA28", border: "1px solid rgba(255,202,40,0.3)" }}>
              Student Stories
            </span>
            <h2 className="section-heading text-white">
              Real Results,<br />
              <span style={{ color: "#FFCA28" }}>Real Students</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="relative p-7 rounded-3xl transition-all duration-300 hover:-translate-y-2"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(20px)" }}>
                {/* Quote mark */}
                <div className="text-6xl font-black leading-none mb-4 opacity-30" style={{ color: t.color, fontFamily: "Georgia, serif" }}>&ldquo;</div>

                <p className="text-slate-200 text-sm leading-relaxed mb-6 -mt-4" style={{ fontFamily: "Inter, sans-serif" }}>
                  {t.quote}
                </p>

                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.stars)].map((_, si) => <Star key={si} size={14} fill="#FFCA28" color="#FFCA28" />)}
                </div>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-white"
                    style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}99)` }}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm" style={{ fontFamily: "Poppins, sans-serif" }}>
                      {t.name}, Age {t.age}
                    </p>
                    <p className="text-slate-400 text-xs">{t.city}, India</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FAQ SECTION
          ════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="badge-primary mb-4 inline-flex">Have Questions?</span>
            <h2 className="section-heading text-[#2D1B69]">
              Frequently Asked <span style={{ color: "#FF6B2B" }}>Questions</span>
            </h2>
            <p className="section-subheading mx-auto mt-4 text-center">
              Have questions about our Abacus classes? Find answers right here.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-2xl overflow-hidden transition-all duration-300"
                  style={{
                    border: `2px solid ${isOpen ? "#FF6B2B" : "#f1f5f9"}`,
                    boxShadow: isOpen ? "0 4px 20px rgba(255,107,43,0.1)" : "none",
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                    className={`w-full flex items-center justify-between px-6 py-5 text-left transition-all duration-200 ${isOpen ? "text-white" : "bg-white dark:bg-[#1a1035] text-[#1a1035] dark:text-[#f0ebff]"}`}
                    style={{ background: isOpen ? "linear-gradient(135deg, #FF6B2B, #e55a1f)" : "" }}
                  >
                    <div className="flex items-center gap-3 pr-4">
                      <HelpCircle size={18} style={{ color: isOpen ? "rgba(255,255,255,0.8)" : "#FF6B2B", flexShrink: 0 }} />
                      <span className="font-semibold text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                        {faq.question}
                      </span>
                    </div>
                    <ChevronDown
                      size={18}
                      style={{ color: isOpen ? "white" : "#94a3b8", flexShrink: 0 }}
                      className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-72 opacity-100" : "max-h-0 opacity-0"}`}>
                    <div className="px-6 py-4 text-slate-600 text-sm leading-relaxed" style={{ fontFamily: "Inter, sans-serif", borderTop: "1px solid #f1f5f9" }}>
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CTA SECTION
          ════════════════════════════════════════ */}
      <section className="relative py-24 px-6 overflow-hidden" style={{ background: "linear-gradient(135deg, #2D1B69, #3d2a88, #1a1035)" }}>
        <div className="absolute inset-0 dot-pattern opacity-10" />
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-20 animate-blob1"
          style={{ background: "radial-gradient(circle, #FF6B2B, transparent 70%)", filter: "blur(60px)" }} />

        <div className="relative max-w-4xl mx-auto text-center text-white">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-8"
            style={{ background: "rgba(255,202,40,0.15)", color: "#FFCA28", border: "1px solid rgba(255,202,40,0.3)" }}>
            🚀 Start Your Journey Today
          </span>

          <h2 className="font-black text-4xl md:text-5xl leading-tight mb-6" style={{ fontFamily: "Poppins, sans-serif" }}>
            Ready to Transform Your
            <br />
            <span style={{ color: "#FFCA28" }}>Child&apos;s Future?</span>
          </h2>

          <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto" style={{ fontFamily: "Inter, sans-serif" }}>
            Join 10,000+ successful students and families who have already unlocked the power of abacus and mental arithmetic.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact"
              className="btn-shine flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-white text-sm shadow-xl"
              style={{ background: "linear-gradient(135deg, #FF6B2B, #e55a1f)", boxShadow: "0 8px 30px rgba(255,107,43,0.45)", fontFamily: "Poppins, sans-serif" }}>
              Register for Free Demo
              <ArrowRight size={16} />
            </Link>
            <Link href="/contact"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-white text-sm border-2 border-white/25 hover:border-white/50 hover:bg-white/10 transition-all duration-300"
              style={{ fontFamily: "Poppins, sans-serif" }}>
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
