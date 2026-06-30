"use client";
import Link from "next/link";
import Navbar from "../../../components/shared/Navbar";
import Footer from "../../../components/shared/Footer";

const abacusCourses = [
  {
    id: 1,
    level: "Level 1",
    title: "Junior Abacus Star (Beginner)",
    age: "Ages 5-7 Years",
    description: "Introduction to the Abacus tool, basic finger theory, and number recognition. Children learn simple 1 & 2 digit addition and subtraction using physical beads.",
    topics: ["Introduction to Soroban Tool", "Direct Addition & Subtraction", "Finger Theory Practice"]
  },
  {
    id: 2,
    level: "Level 2",
    title: "Mental Math Mastermind (Intermediate)",
    age: "Ages 7+ Years",
    description: "Mastering 'Big Friends' and 'Small Friends' formulas. Moving from the physical abacus to mental imagery for faster, paperless, and calculator-free calculations.",
    topics: ["Big & Small Friends Formulas", "Multi-digit Operations", "Mental Arithmetic Imagery"]
  },
  {
    id: 3,
    level: "Level 3",
    title: "Advanced Math Champion (Expert)",
    age: "Ages 8+ Years",
    description: "High-speed complex multiplication, long division, and decimals. Perfect for students preparing for school exams and national or international math competitions.",
    topics: ["Advanced Long Division", "Decimal Operations", "Championship Speed Drills"]
  },
  {
    id: 4,
    level: "Special Skill",
    title: "Speed Reading & Handwriting Mastery",
    age: "All School Students",
    description: "Phonics-based reading drills for perfect pronunciation and fluency. Includes dedicated hand muscle exercises and grip correction for beautiful cursive and print handwriting.",
    topics: ["Phonics & Reading Fluency", "Handwriting Grip Correction", "Vocabulary Building"]
  },
  {
    id: 5,
    level: "Skill Up",
    title: "Vedic Mathematics Shortcuts",
    age: "Ages 10+ Years",
    description: "Ancient Indian mathematical shortcuts to solve massive calculations, squares, cubes, and algebraic equations mentally in just a few seconds.",
    topics: ["Lightning-fast Multiplication Tricks", "Square & Cube Root Secrets", "Exam Stress Buster"]
  },
  {
    id: 6,
    level: "Brain Gym",
    title: "Memory Booster & Rubik's Cube",
    age: "Ages 6+ Years",
    description: "Photographic memory training games combined with Rubik's cube algorithms. Designed to increase overall focus, patience, and left-right brain coordination.",
    topics: ["Photographic Memory Drills", "3x3 Rubik's Cube Secrets", "Focus Enhancement Exercises"]
  }
];

export default function CoursesPage() {
  return (
    <div className="bg-slate-50 min-h-screen w-full flex flex-col justify-between">
      {/* 1. Navbar*/}
      <div className="w-full">
        <Navbar />
      </div>

      {/* 2. Main Content  */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 flex-grow">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <h2 className="text-3xl md:text-4xl font-extrabold text-blue-900 tracking-tight">
            Our Comprehensive Courses
          </h2>
          <p className="text-gray-600">
            Unlock your childs full potential with our structured Abacus programs, creative reading-writing skills, and mental math bootcamps.
          </p>
        </div>

        {/* Course Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {abacusCourses.map((course) => (
            <div 
              key={course.id} 
              className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Badge & Age Row */}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md">
                    {course.level}
                  </span>
                  <span className="text-xs font-medium text-gray-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    {course.age}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-xl font-bold text-slate-900 mb-3">{course.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">{course.description}</p>
                
                {/* Core Topics Covered */}
                <div className="mb-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">What They Learn:</h4>
                  <ul className="space-y-1.5">
                    {course.topics.map((topic, index) => (
                      <li key={index} className="text-xs text-gray-700 flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mr-2 shrink-0"></span>
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* CTA Button Inside Card */}
              <div className="pt-4 border-t border-slate-100 mt-auto">
                <Link 
                  href="/contact" 
                  className="w-full block text-center py-2.5 bg-slate-50 hover:bg-orange-500 hover:text-white text-slate-800 font-bold text-xs rounded-xl uppercase tracking-wider transition-colors"
                >
                  Inquire Now
                </Link>
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