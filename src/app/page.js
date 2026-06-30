"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import confetti from "canvas-confetti"; 
import Navbar from "../components/shared/Navbar";
import Footer from "../components/shared/Footer";
import { ChevronDown, HelpCircle, CheckCircle2 } from "lucide-react"; 

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
    title: "Memory Booster & Rubiks Cube",
    age: "Ages 6+ Years",
    description: "Photographic memory training games combined with Rubiks cube algorithms. Designed to increase overall focus, patience, and left-right brain coordination.",
    topics: ["Photographic Memory Drills", "3x3 Rubiks Cube Secrets", "Focus Enhancement Exercises"]
  }
];

const faqs = [
  {
    id: 1,
    question: "What are the main benefits of enrolling my child in Smart Abacus training?",
    answer: "Abacus training significantly enhances mental math skills. After completion of the course, your child will be able to calculate five times faster with accuracy. It also improves concentration, memory, and overall cognitive development, helping children excel in academics.",
  },
  {
    id: 2,
    question: "How often are classes held, and what is the structure of the levels in the program?",
    answer: "Typically, classes are conducted twice a week for 2 hours per session, or as a weekend batch. The program is divided into different progressive levels (Level 1 to 8), each lasting around 3 to 4 months depending on the childs learning pace.",
  },
  {
    id: 3,
    question: "How long does it take for a child to complete the entire abacus program?",
    answer: "To complete the complete foundation and advanced levels, it usually takes around 2 to 2.5 years. However, noticeable improvements in calculation speed and focus can be seen within the first 3-6 months.",
  },
  {
    id: 4,
    question: "Are twice-a-week classes sufficient for Abacus learning?",
    answer: "Yes, twice-a-week interactive sessions are perfect, provided the child practices at home for at least 10-15 minutes daily. Consistent daily practice is key to mastering mental arithmetic.",
  },
  {
    id: 5,
    question: "Does every child have to enroll from Level 1 in your academy?",
    answer: "Yes, generally every child starts from Level 1 because Abacus requires learning specific finger movements and bead formulas from scratch, regardless of the childs age or school grade.",
  },
  {
    id: 6,
    question: "How can I, as a parent, support my child's abacus learning and practice at home?",
    answer: "You don't need to know Abacus to help them! Just ensure they spend 10 minutes daily doing their homework, encourage them to use the mental theory methods, and appreciate their efforts to boost their confidence.",
  }
];

export default function Home() {
  const [hasMounted, setHasMounted] = useState(false); 
  const [openFaq, setOpenFaq] = useState(1); 
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", subject: "General Inquiry", message: ""
  });

  useEffect(() => {
    setHasMounted(true);  
    confetti({ particleCount: 100, spread: 70, origin: { x: 0, y: 0.6 } });
    confetti({ particleCount: 100, spread: 70, origin: { x: 1, y: 0.6 } });

    const timeout = setTimeout(() => {
      confetti({ particleCount: 150, spread: 100, origin: { x: 0.5, y: 0.4 } });
    }, 400);

    return () => clearTimeout(timeout);
  }, []);

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  if (!hasMounted) {
    return null; 
  }

  return (
    <div className="bg-slate-50 min-h-screen w-full flex flex-col justify-between text-slate-800">
      
      {/* CSS For Infinite Automatic Scroll */}
      <style jsx global>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-350px * 6 - 1.5rem * 6)); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: scroll 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Navbar Section */}
      <div className="w-full">
        <Navbar />
      </div>

      {/* Hero Section */}
      <section
        className="relative w-full min-h-[90vh] flex items-center justify-center text-center bg-cover bg-center bg-no-repeat bg-fixed px-6 py-24"
        style={{
          backgroundImage: "url('/images/banner.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-slate-950/60 z-0"></div>

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center">
          <h1 className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-400 to-indigo-300 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] tracking-tight">
            Smart Abacus Academy
          </h1>
          <p className="mt-6 text-lg text-slate-200 max-w-2xl font-light leading-relaxed">
            Empowering young minds through Abacus and Mental Arithmetic. Unleash concentration, enhance memory, and accelerate math calculation speed.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pages/auth/login"
              className="px-8 py-3.5 bg-gradient-to-r from-blue-500 to-pink-600 hover:from-pink-600 hover:to-purple-700 text-white font-extrabold rounded-full text-sm tracking-wider uppercase transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.97] shadow-[0_10px_25px_rgba(245,158,11,0.35)] cursor-pointer"
            >
              Sign In to ERP Portal
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3.5 bg-white/10 hover:bg-white/15 text-white border border-white/20 hover:border-white/30 backdrop-blur-md font-bold rounded-full text-sm transition-all active:scale-[0.97] cursor-pointer"
            >
              Join Academy
            </Link>
          </div>
        </div>
      </section>

      {/* Main Page Content Container */}
      <main className="w-full max-w-7xl mx-auto px-6 py-12 space-y-16 flex-grow">
        
        {/* About Us Section */}
        <section className="py-16 px-8 bg-white rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-4xl font-bold mb-8 text-blue-900">About Smart Abacus</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <p className="text-gray-700 text-lg mb-4">
                Smart Abacus is a leading education platform dedicated to unlocking the mathematical potential in every child. With over 15 years of excellence, we have empowered thousands of students to achieve extraordinary computational abilities and academic success.
              </p>
              <p className="text-gray-700 text-lg mb-4">
                Our comprehensive curriculum combines traditional Abacus methodology with modern educational techniques, ensuring students develop not just calculation skills but also enhanced memory, focus, and problem-solving abilities.
              </p>
              <p className="text-gray-700 text-lg">
                We believe every child deserves access to world-class mathematics education. Our mission is to make excellence achievable for all.
              </p>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-blue-50 p-8 rounded-2xl border border-blue-100/50">
              <h3 className="text-2xl font-bold text-blue-900 mb-6">Our Promise</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-pink-600 font-bold text-xl mr-3">✓</span>
                  <span className="text-gray-700">Personalized learning paths for every student</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-600 font-bold text-xl mr-3">✓</span>
                  <span className="text-gray-700">Expert guidance from certified instructors</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-600 font-bold text-xl mr-3">✓</span>
                  <span className="text-gray-700">Proven results in 6-12 months</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-600 font-bold text-xl mr-3">✓</span>
                  <span className="text-gray-700">Interactive and engaging learning experience</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-600 font-bold text-xl mr-3">✓</span>
                  <span className="text-gray-700">Lifetime support and community access</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 🧠 Benefits of Abacus Section (Video Removed - Full Width Layout) */}
        <section className="py-16 px-8 bg-slate-100 rounded-3xl shadow-inner border border-slate-200">
          <div className="max-w-5xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black text-blue-900 tracking-tight uppercase text-center md:text-left">
              BENEFITS OF <span className="text-blue-900">ABACUS</span>
            </h2>
            <p className="text-gray-700 text-base sm:text-lg leading-relaxed text-center md:text-left">
              Smart <span className="font-semibold text-blue-900">Abacus training</span> develops a dynamic number sense in children. The specific game-based technique keeps kids engaged. It removes the fear of math right from childhood. Other than Mental Math, it also improves academic performance with the development of crucial life skills such as:
            </p>

            {/* Key Highlights Grid (Expanded to 3 columns for better look) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
              {[
                "Self-Confidence",
                "Ability To Recall",
                "Concentration",
                "Visualization",
                "Photographic Memory",
                "Listening Skill"
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3 bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm transition-all hover:border-blue-500/40 hover:shadow-md">
                  <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <span className="font-bold text-blue-900 text-sm sm:text-base">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Dynamic Detailed Courses Grid Section */}
        <section className="py-16 px-8 bg-white rounded-3xl shadow-sm border border-slate-100">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <h2 className="text-3xl md:text-4xl font-extrabold text-blue-900 tracking-tight">
              Our Comprehensive Courses
            </h2>
            <p className="text-gray-600">
              Unlock your childs full potential with our structured Abacus programs, creative reading-writing skills, and mental math bootcamps.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {abacusCourses.map((course) => (
              <div 
                key={course.id} 
                className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                      {course.level}
                    </span>
                    <span className="text-xs font-medium text-gray-500 bg-slate-100 px-2.5 py-1 rounded-full">
                      {course.age}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-3">{course.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">{course.description}</p>
                  
                  <div className="mb-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">What They Learn:</h4>
                    <ul className="space-y-1.5">
                      {course.topics.map((topic, index) => (
                        <li key={index} className="text-xs text-gray-700 flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2 shrink-0"></span>
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-auto">
                  <Link 
                    href="/contact" 
                    className="w-full block text-center py-2.5 bg-slate-50 hover:bg-blue-500 hover:text-white text-slate-800 font-bold text-xs rounded-xl uppercase tracking-wider transition-colors"
                  >
                    Inquire Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Student Success Stories Section */}
        <section className="py-16 px-8 bg-white rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-4xl font-bold mb-8 text-center text-blue-900">Student Success Stories</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className=" bg-gradient-to-br from-pink-50/30 to-white p-8 rounded-xl border-l-4 border-pink-600 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center text-white font-bold">R</div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-blue-900">Radhika - Age 9</h3>
                  <p className="text-sm text-gray-500">Mumbai, India</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">I improved my calculation speed by 10x in just 6 months! Now I solve math problems faster than my calculator.</p>
              <div className="flex text-yellow-400">★★★★★</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50/30 to-white p-8 rounded-xl border-l-4 border-blue-600 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">A</div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-blue-900">Arjun - Age 11</h3>
                  <p className="text-sm text-gray-500">Delhi, India</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">I won the National Abacus Championship! The training was rigorous but worth every moment. I'm now helping other students.</p>
              <div className="flex text-yellow-400">★★★★★</div>
            </div>
            <div className="bg-gradient-to-br from-pink-50/30 to-white p-8 rounded-xl border-l-4 border-pink-600 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center text-white font-bold">M</div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-blue-900">Maya - Age 8</h3>
                  <p className="text-sm text-gray-500">Bangalore, India</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">My grades improved from C to A+ in mathematics! I feel more confident in class now and love solving problems.</p>
              <div className="flex text-yellow-400">★★★★★</div>
            </div>
          </div>
        </section>

        {/* Frequently Asked Questions (FAQ) Section */}
        <section className="py-16 px-8 bg-white rounded-3xl shadow-sm border border-slate-100">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <h2 className="text-3xl md:text-4xl font-extrabold text-blue-900 tracking-tight uppercase">
              Frequently Asked <span className="text-blue-900">Questions</span>
            </h2>
            <p className="text-gray-600">
              Have questions about our Abacus classes? Find the answers right here.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq) => {
              const isOpen = openFaq === faq.id;
              
              return (
                <div
                  key={faq.id}
                  className={`border rounded-xl transition-all duration-300 overflow-hidden bg-white shadow-sm ${
                    isOpen ? "border-blue-500 ring-1 ring-blue-500/20" : "border-gray-200"
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className={`w-full flex items-center justify-between p-5 text-left font-semibold text-sm sm:text-base transition-colors ${
                      isOpen ? "bg-blue-500 text-white" : "text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3 pr-4">
                      <HelpCircle className={`h-5 w-5 flex-shrink-0 ${isOpen ? "text-white" : "text-blue-500"}`} />
                      <span>{faq.question}</span>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 flex-shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-white" : "text-gray-400"
                      }`}
                    />
                  </button>

                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="p-5 text-sm sm:text-base text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/50">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-16 px-8 bg-gradient-to-r from-blue-900 to-pink-600 rounded-3xl text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Childs Future?</h2>
          <p className="text-xl mb-8 text-blue-100">Join thousands of successful students and start your Abacus learning journey today</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button className="px-8 py-3 bg-white text-blue-900 font-bold rounded-xl hover:bg-gray-100 transition">
              Register for Free Demo
            </button>
            <button className="px-8 py-3 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition">
              Contact Us
            </button>
          </div>
        </section>

      </main>

      {/* Footer Section */}
      <div className="w-full mt-auto">
        <Footer />
      </div>
    </div>
  );
}