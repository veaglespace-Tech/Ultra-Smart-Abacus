"use client";
import { useState } from "react";
import Link from "next/link";
import Navbar from "../../../components/shared/Navbar";
import Footer from "../../../components/shared/Footer";
import { ArrowRight, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const abacusCourses = [
  {
    id: 1, emoji: "🔢", level: "Level 1", badge: "Beginner", badgeColor: "#10B981",
    title: "Junior Abacus Star", age: "Ages 5–7", filter: "Beginner",
    description: "Introduction to the Soroban tool, basic finger theory, and number recognition. Simple 1 & 2 digit arithmetic using physical beads.",
    topics: ["Introduction to Soroban Tool", "Direct Addition & Subtraction", "Finger Theory Practice"],
    duration: "3 months", sessions: "2× per week",
  },
  {
    id: 2, emoji: "🧠", level: "Level 2", badge: "Intermediate", badgeColor: "#3B82F6",
    title: "Mental Math Mastermind", age: "Ages 7+", filter: "Intermediate",
    description: "Mastering 'Big Friends' & 'Small Friends' formulas. Transitioning from physical abacus to pure mental imagery for lightning-fast calculations.",
    topics: ["Big & Small Friends Formulas", "Multi-digit Operations", "Mental Arithmetic Imagery"],
    duration: "4 months", sessions: "2× per week", popular: true,
  },
  {
    id: 3, emoji: "🏆", level: "Level 3", badge: "Advanced", badgeColor: "#FF6B2B",
    title: "Advanced Math Champion", age: "Ages 8+", filter: "Advanced",
    description: "High-speed multiplication, long division, and decimals. Perfect for national and international math competition preparation.",
    topics: ["Advanced Long Division", "Decimal Operations", "Championship Speed Drills"],
    duration: "5 months", sessions: "2–3× per week",
  },
  {
    id: 4, emoji: "📖", level: "Special Skill", badge: "All Ages", badgeColor: "#8B5CF6",
    title: "Speed Reading & Handwriting", age: "All Students", filter: "Special",
    description: "Phonics-based reading drills for fluency, and hand muscle exercises with grip correction for beautiful handwriting.",
    topics: ["Phonics & Reading Fluency", "Handwriting Grip Correction", "Vocabulary Building"],
    duration: "3 months", sessions: "2× per week",
  },
  {
    id: 5, emoji: "⚡", level: "Skill Up", badge: "Ages 10+", badgeColor: "#FFCA28",
    title: "Vedic Mathematics", age: "Ages 10+", filter: "Special",
    description: "Ancient Indian mathematical shortcuts to solve massive calculations, squares, cubes, and equations mentally in seconds.",
    topics: ["Lightning Multiplication Tricks", "Square & Cube Root Secrets", "Exam Stress Buster"],
    duration: "3 months", sessions: "Weekend batches",
  },
  {
    id: 6, emoji: "🎯", level: "Brain Gym", badge: "Ages 6+", badgeColor: "#EC4899",
    title: "Memory & Rubik's Cube", age: "Ages 6+", filter: "Special",
    description: "Photographic memory training combined with Rubik's cube algorithms to increase focus, patience, and brain coordination.",
    topics: ["Photographic Memory Drills", "3×3 Rubik's Cube Secrets", "Focus Enhancement"],
    duration: "2 months", sessions: "2× per week",
  },
];

const filters = ["All", "Beginner", "Intermediate", "Advanced", "Special"];

export default function CoursesPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = activeFilter === "All"
    ? abacusCourses
    : abacusCourses.filter((c) => c.filter === activeFilter);

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
            Our Programs
          </span>
          <h1 className="font-black text-4xl sm:text-5xl leading-tight mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
            Comprehensive{" "}
            <span style={{
              background: "linear-gradient(135deg, #FF6B2B, #FFCA28)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Courses
            </span>
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Structured programs designed to unlock your child&apos;s full mathematical potential — from beginner abacus to advanced mental math and brain training.
          </p>
        </div>
      </section>

      {/* ── Courses Grid ── */}
      <section className="py-16 px-6 bg-[#FFF8F0] dark:bg-[#150e2a] transition-colors duration-300">
        <div className="max-w-7xl mx-auto">

          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-14">
            {filters.map((f) => {
              const isActive = activeFilter === f;
              return (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className="relative px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 overflow-hidden"
                  style={{
                    color: isActive ? "#ffffff" : "#64748b",
                    fontFamily: "Outfit, sans-serif",
                  }}
                >
                  <span className="relative z-10">{f}</span>
                  {isActive && (
                    <motion.span
                      layoutId="activeFilterPublic"
                      className="absolute inset-0 bg-gradient-to-r from-[#2D1B69] to-[#3d2a88]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  {!isActive && (
                    <span className="absolute inset-0 bg-white dark:bg-[#1e1445] border-2 border-slate-200 dark:border-slate-800 rounded-full -z-10" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Course Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filtered.map((course) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  key={course.id}
                  className="relative group bg-white dark:bg-[#1e1445] rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800/85 hover:shadow-2xl hover:-translate-y-2 transition-all duration-350"
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

                  <div className="p-7 card-shine-effect rounded-b-3xl">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="text-4xl">{course.emoji}</div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-full font-medium">
                          {course.age}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>{course.title}</h3>
                    <p className="text-slate-500 dark:text-slate-300 text-sm leading-relaxed mb-5">{course.description}</p>

                    {/* Topics */}
                    <div className="space-y-2 mb-5">
                      {course.topics.map((t, ti) => (
                        <div key={ti} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: course.badgeColor }} />
                          <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{t}</span>
                        </div>
                      ))}
                    </div>

                    {/* Duration + Sessions */}
                    <div className="flex gap-3 mb-6">
                      <span className="text-[11px] font-bold px-3 py-1.5 rounded-full"
                        style={{ background: `${course.badgeColor}12`, color: course.badgeColor }}>
                        📅 {course.duration}
                      </span>
                      <span className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300">
                        🕒 {course.sessions}
                      </span>
                    </div>

                    {/* CTA */}
                    <Link href="/contact"
                      className="group/btn flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider border-2 transition-all duration-300"
                      style={{ borderColor: course.badgeColor, color: course.badgeColor, fontFamily: "Outfit, sans-serif" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = course.badgeColor; e.currentTarget.style.color = "white"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = course.badgeColor; }}>
                      Inquire Now
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>


        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-16 px-6" style={{ background: "linear-gradient(135deg, #2D1B69, #1a1035)" }}>
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="font-black text-3xl md:text-4xl mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
            Not Sure Which Course to Choose?
          </h2>
          <p className="text-slate-300 mb-8">
            Book a free 30-minute demo class and our expert advisors will guide you to the perfect program!
          </p>
          <Link href="/contact"
            className="btn-shine inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm text-white"
            style={{ background: "linear-gradient(135deg, #FF6B2B, #e55a1f)", boxShadow: "0 8px 25px rgba(255,107,43,0.4)", fontFamily: "Poppins, sans-serif" }}>
            Book Free Demo Class
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}