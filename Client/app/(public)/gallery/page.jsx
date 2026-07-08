"use client";
import { useState } from "react";
import Navbar from "../../../components/shared/Navbar";
import Footer from "../../../components/shared/Footer";
import { X, ZoomIn } from "lucide-react";

const galleryItems = [
  {
    id: 1, category: "Classroom",
    title: "Interactive Abacus Session",
    desc: "Students practicing rapid finger movements and visual arithmetic in our daily batch.",
    imageUrl: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80",
    span: "col-span-1",
  },
  {
    id: 2, category: "Competitions",
    title: "National Abacus Championship",
    desc: "Our brilliant stars competing and showcasing lightning-fast calculation speeds on stage.",
    imageUrl: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80",
    span: "col-span-1 row-span-2",
  },
  {
    id: 3, category: "Events",
    title: "Handwriting & Reading Workshop",
    desc: "Special weekend bootcamp focusing on pencil grip correction and reading fluency drills.",
    imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
    span: "col-span-1",
  },
  {
    id: 4, category: "Celebrations",
    title: "Annual Award Ceremony",
    desc: "Proud moments as our Level-3 champions receive medals and certificates of excellence.",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
    span: "col-span-2",
  },
  {
    id: 5, category: "Brain Gym",
    title: "Rubik's Cube Speedcubing",
    desc: "Children cracking complex 3×3 Rubik's algorithms to improve hand-eye coordination.",
    imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
    span: "col-span-1",
  },
  {
    id: 6, category: "Classroom",
    title: "Vedic Math Bootcamp",
    desc: "High school students learning ancient mathematics shortcuts for school exam preparation.",
    imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80",
    span: "col-span-1",
  },
];

const categories = ["All", "Classroom", "Competitions", "Events", "Celebrations", "Brain Gym"];

const categoryColors = {
  Classroom:    { bg: "#2D1B69", text: "white" },
  Competitions: { bg: "#FF6B2B", text: "white" },
  Events:       { bg: "#10B981", text: "white" },
  Celebrations: { bg: "#FFCA28", text: "#1a1035" },
  "Brain Gym":  { bg: "#EC4899", text: "white" },
};

export default function GalleryPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [lightbox, setLightbox] = useState(null);

  const filtered = activeFilter === "All"
    ? galleryItems
    : galleryItems.filter((i) => i.category === activeFilter);

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
            Our Memories
          </span>
          <h1 className="font-black text-4xl sm:text-5xl leading-tight mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
            Academy{" "}
            <span style={{
              background: "linear-gradient(135deg, #FF6B2B, #FFCA28)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Photo Gallery
            </span>
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Take a look inside our smart classrooms, competition highlights, and life-changing student activities.
          </p>
        </div>
      </section>

      {/* ── Filter + Grid ── */}
      <section className="py-16 px-6 bg-[#FFF8F0] dark:bg-[#150e2a] transition-colors duration-300">
        <div className="max-w-7xl mx-auto">

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-14">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveFilter(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
                  activeFilter === cat 
                    ? "text-white" 
                    : "bg-white dark:bg-[#1e1445] text-[#64748b] dark:text-[#b8a9e8] border-2 border-slate-200 dark:border-slate-800"
                }`}
                style={{
                  background: activeFilter === cat ? "linear-gradient(135deg, #2D1B69, #3d2a88)" : "",
                  boxShadow: activeFilter === cat ? "0 4px 15px rgba(45,27,105,0.3)" : "none",
                  fontFamily: "Outfit, sans-serif",
                }}>
                {cat}
              </button>
            ))}
          </div>

          {/* Masonry-style Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => {
              const catColor = categoryColors[item.category] || { bg: "#2D1B69", text: "white" };
              return (
                <div key={item.id}
                  className="group relative rounded-3xl overflow-hidden bg-white shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                  onClick={() => setLightbox(item)}>

                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <img src={item.imageUrl} alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Zoom Icon on hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <ZoomIn size={20} color="white" />
                      </div>
                    </div>

                    {/* Category badge */}
                    <span className="absolute top-3 left-3 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg"
                      style={{ background: catColor.bg, color: catColor.text, fontFamily: "Outfit, sans-serif" }}>
                      {item.category}
                    </span>
                  </div>

                  {/* Text */}
                  <div className="p-5">
                    <h3 className="font-bold text-slate-800 text-base mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>{item.title}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              <div className="text-5xl mb-4">📷</div>
              <p className="font-bold text-lg" style={{ fontFamily: "Poppins, sans-serif" }}>No images in this category yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.9)", backdropFilter: "blur(10px)" }}
          onClick={() => setLightbox(null)}>
          <div className="relative max-w-3xl w-full rounded-3xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.imageUrl} alt={lightbox.title} className="w-full object-cover max-h-[70vh]" />
            <div className="p-6 text-white" style={{ background: "rgba(26,16,53,0.95)" }}>
              <h3 className="font-bold text-xl mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>{lightbox.title}</h3>
              <p className="text-slate-300 text-sm">{lightbox.desc}</p>
            </div>
            <button onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-[#FF6B2B] transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}