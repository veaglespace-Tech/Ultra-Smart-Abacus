"use client"; // Interactive Form sathi client component
import { useState } from "react";
import Navbar from "../../../components/shared/Navbar";
import Footer from "../../../components/shared/Footer";

// Branches/Franchise Locations cha Data
const branchList = [
  { name: "Pune Corporate Hub", address: "Kothrud, Near MIT College, Pune", contact: "+91 98765 43210", email: "pune@smartabacus.com" },
  { name: "Mumbai Center", address: "Dadar West, Near Station, Mumbai", contact: "+91 98765 43211", email: "mumbai@smartabacus.com" },
  { name: "Nashik Academy", address: "College Road, Above HDFC Bank, Nashik", contact: "+91 98765 43212", email: "nashik@smartabacus.com" },
  { name: "Nagpur Center", address: "Ramdaspeth, Main Market, Nagpur", contact: "+91 98765 43213", email: "nagpur@smartabacus.com" },
];

export default function FranchisePage() {
  const [formData, setFormData] = useState({ name: "", phone: "", city: "", message: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Thank you ${formData.name}! Our team will contact you for Franchise details.`);
    setFormData({ name: "", phone: "", city: "", message: "" });
  };

  return (
    <div className="bg-slate-50 min-h-screen w-full flex flex-col justify-between">
      {/* Navbar Full Width */}
      <div className="w-full">
        <Navbar />
      </div>

      {/* Main Content Area -  */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 flex-grow space-y-16">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="px-4 py-1.5 bg-orange-100 text-orange-600 font-bold rounded-full text-xs uppercase tracking-wider">
            Grow With Us
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-blue-900 tracking-tight">
            Our Branches & <span className="text-orange-500">Franchise</span> Network
          </h1>
          <p className="text-gray-600 text-base md:text-lg">
            Join hands with Indias fastest-growing Abacus academy. Partner with us to start your own educational center kiva find a branch near you.
          </p>
        </div>

        {/* Main Layout Grid */}
        <div className="grid lg:grid-cols-3 gap-12 items-start">
          
          {/* Left 2 Columns: Existing Branches List */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Our Active Learning Centers</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {branchList.map((branch, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mb-3 animate-pulse"></div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{branch.name}</h3>
                  <p className="text-gray-500 text-sm mb-4">{branch.address}</p>
                  <div className="text-xs text-slate-700 space-y-1 pt-3 border-t border-slate-50">
                    <p>📞 <strong>Phone:</strong> {branch.contact}</p>
                    <p>✉️ <strong>Email:</strong> {branch.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right 1 Column: Franchise Application Form */}
          <div className="bg-white p-8 rounded-3xl border border-orange-100 shadow-xl shadow-orange-600/[0.03] space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">Start Your Own Center</h2>
              <p className="text-xs text-gray-500">Fill up this form to request franchise business model and investment details.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Your Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Enter Full Name"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-500 bg-slate-50/50"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Contact Number</label>
                <input 
                  type="tel" 
                  required 
                  placeholder="Enter 10-Digit Mobile"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-500 bg-slate-50/50"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Proposed City / Location</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Mumbai, Pune"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-500 bg-slate-50/50"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Message / Notes</label>
                <textarea 
                  rows="3" 
                  placeholder="Tell us about your background (optional)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-500 bg-slate-50/50 resize-none"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-sm font-bold uppercase tracking-wider rounded-xl transition shadow-lg shadow-orange-500/20 active:scale-95"
              >
                Submit Application
              </button>
            </form>
          </div>

        </div>
      </main>

     
      <div className="w-full mt-auto">
        <Footer />
      </div>
    </div>
  );
}