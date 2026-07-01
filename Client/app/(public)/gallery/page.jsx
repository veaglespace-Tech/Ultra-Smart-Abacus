"use client";
import { useState } from "react";
import Navbar from "../../../components/shared/Navbar";
import Footer from "../../../components/shared/Footer";

//
const galleryItems = [
  {
    id: 1,
    category: "Classroom",
    title: "Interactive Abacus Session",
    desc: "Students practicing rapid finger movements and visual arithmetic in our daily batch.",
    imageUrl: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 2,
    category: "Competitions",
    title: "National Abacus Championship",
    desc: "Our brilliant stars competing and showcasing lightning-fast calculation speeds on stage.",
    imageUrl: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 3,
    category: "Events",
    title: "Handwriting & Reading Workshop",
    desc: "Special weekend bootcamp focusing on pencil grip correction and reading fluency drills.",
    imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 4,
    category: "Celebrations",
    title: "Annual Award Ceremony",
    desc: "Proud moments as our Level-3 champions receive medals and certificates of excellence.",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 5,
    category: "Brain Gym",
    title: "Rubik's Cube Speedcubing",
    desc: "Children cracking complex 3x3 Rubik's algorithms to improve hand-eye coordination.",
    imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 6,
    category: "Classroom",
    title: "Vedic Math Bootcamp",
    desc: "High school students learning ancient mathematics shortcuts for school exam preparation.",
    imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80"
  }
];

export default function GalleryPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  // Filter Categories dynamic 
  const categories = ["All", "Classroom", "Competitions", "Events", "Celebrations", "Brain Gym"];

  const filteredItems = activeFilter === "All" 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeFilter);

  return (
    <div className="bg-slate-50 min-h-screen w-full flex flex-col justify-between">
   
      <div className="w-full">
        <Navbar />
      </div>

      {/* Main Content Area */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 flex-grow">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="px-4 py-1.5 bg-orange-100 text-orange-600 font-bold rounded-full text-xs uppercase tracking-wider">
            Our Memories
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-blue-900 tracking-tight">
            Academy Photo Gallery
          </h2>
          <p className="text-gray-600">
            Take a look inside our smart classrooms, competition highlights, and life-changing student activities.
          </p>
        </div>

        {/* Dynamic Category Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setActiveFilter(cat)}
              className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeFilter === cat
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Image Grid Layout */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              {/* Image Box */}
              <div className="relative h-56 w-full bg-slate-200 overflow-hidden group">
                <img 
                  src={item.imageUrl} 
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 left-4 bg-slate-900/80 text-white backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md">
                  {item.category}
                </span>
              </div>

              {/* Text Box */}
              <div className="p-5 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </main>

      
      <div className="w-full mt-auto">
        <Footer />
      </div>
    </div>
  );
}