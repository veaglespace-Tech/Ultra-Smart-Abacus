"use client";
import { useState } from "react";
import Navbar from "../../../components/shared/Navbar";
import Footer from "../../../components/shared/Footer";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Thank you for reaching out, ${formData.name}! Our team will get back to you shortly.`);
    setFormData({ name: "", email: "", phone: "", subject: "General Inquiry", message: "" });
  };

  return (
    <div className="bg-slate-50 min-h-screen w-full flex flex-col justify-between">
      {/* Navbar Layout */}
      <div className="w-full">
        <Navbar />
      </div>

      {/* Main Content Area */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 flex-grow space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="px-4 py-1.5 bg-orange-100 text-orange-600 font-bold rounded-full text-xs uppercase tracking-wider">
            Get In Touch
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-blue-900 tracking-tight">
            Contact Our Academy
          </h2>
          <p className="text-gray-600">
            Have questions about admissions, course details, or trial batches? Reach out to us, and we will guide you forward.
          </p>
        </div>

        {/* Contact Page Layout Grid */}
        <div className="grid lg:grid-cols-3 gap-12 items-start">
          
          {/* Left Column: Academy Details */}
          <div className="lg:col-span-1 space-y-6">
            <h3 className="text-2xl font-bold text-slate-800">Our Information</h3>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-6">
              {/* Phone Detail */}
              <div className="flex items-start gap-4">
                <div className="text-2xl mt-0.5">📞</div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Call Us Directly</h4>
                  <p className="text-gray-600 text-xs mt-1">+91 8767876567</p>
                  <p className="text-gray-600 text-xs">+91 7867896734</p>
                </div>
              </div>

              {/* Email Detail */}
              <div className="flex items-start gap-4">
                <div className="text-2xl mt-0.5">✉️</div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Email Inquiries</h4>
                  <p className="text-gray-600 text-xs mt-1">info@smartabacus.com</p>
                  <p className="text-gray-600 text-xs">admissions@smartabacus.com</p>
                </div>
              </div>

              {/* Timing Detail */}
              <div className="flex items-start gap-4">
                <div className="text-2xl mt-0.5">🕒</div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Working Hours</h4>
                  <p className="text-gray-600 text-xs mt-1">Monday - Saturday</p>
                  <p className="text-gray-600 text-xs">09:00 AM - 06:00 PM (IST)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right 2 Columns: Single Unified Contact Form (मुख्य बॉक्स आणि इनपुट बॉक्स सुधारणा) */}
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl border-2 border-slate-200 shadow-xl space-y-6">
            <div className="space-y-1 border-b border-slate-100 pb-4">
              <h3 className="text-2xl font-bold text-slate-900">Send Us A Message</h3>
              <p className="text-xs text-gray-500">Please provide your valid details below so our academic counselor can assist you.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Name Field */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Your Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Enter Full Name"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm focus:outline-none focus:border-orange-500 focus:bg-white bg-slate-50 transition-all duration-200"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                {/* Phone Field */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Contact Number</label>
                  <input 
                    type="tel" 
                    required 
                    placeholder="Enter 10-Digit Mobile"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm focus:outline-none focus:border-orange-500 focus:bg-white bg-slate-50 transition-all duration-200"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Email Field */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="name@example.com"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm focus:outline-none focus:border-orange-500 focus:bg-white bg-slate-50 transition-all duration-200"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                {/* Subject Selection */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Inquiry Purpose</label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm focus:outline-none focus:border-orange-500 focus:bg-white bg-slate-50 transition-all duration-200 h-[48px]"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Abacus Course Admission">Abacus Course Admission</option>
                    <option value="Reading & Handwriting Track">Reading & Handwriting Track</option>
                    <option value="Vedic Math Class">Vedic Math Class</option>
                    <option value="Free Demo Session">Request Free Demo Session</option>
                  </select>
                </div>
              </div>

              {/* Message Field */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Message / Questions</label>
                <textarea 
                  rows="4" 
                  required
                  placeholder="Describe your query or mention your child's age group here..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm focus:outline-none focus:border-orange-500 focus:bg-white bg-slate-50 transition-all duration-200 resize-none"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                ></textarea>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-sm font-bold uppercase tracking-wider rounded-xl transition shadow-lg shadow-orange-500/20 active:scale-95"
              >
                Send Message
              </button>
            </form>
          </div>

        </div>
      </main>

      {/* Footer Layout */}
      <div className="w-full mt-auto">
        <Footer />
      </div>
    </div>
  );
}