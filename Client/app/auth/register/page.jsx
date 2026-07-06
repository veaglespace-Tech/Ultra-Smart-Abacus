"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Building,
  ArrowRight,
  Eye,
  EyeOff,
  UserCheck,
  Share2,
  Copy,
  Check,
} from "lucide-react";

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedRole, setCopiedRole] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobileCode: "+91",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
    gender: "Male",
    city: "",
    Address: "",
    role: "STUDENT"
  });

  // Pre-select role if passed in query parameters (e.g. ?role=TEACHER)
  useEffect(() => {
    if (roleParam) {
      const upperRole = roleParam.toUpperCase();
      if (["STUDENT", "TEACHER", "FRANCHISE"].includes(upperRole)) {
        setFormData((prev) => ({ ...prev, role: upperRole }));
      }
    }
  }, [roleParam]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${baseUrl}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: formData.role
        })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || "Registration failed");
      }

      // Clear any active session to prevent auto-redirection of previous logged-in users
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      alert("Registration completed successfully!");
      window.location.href = "/auth/login";
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = (role) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3001";
    const link = `${origin}/auth/register?role=${role}`;
    navigator.clipboard.writeText(link);
    setCopiedRole(role);
    setTimeout(() => setCopiedRole(""), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Blur */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-300/30 rounded-full blur-[120px]"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-300/30 rounded-full blur-[120px]"></div>

      {/* Card */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-200 p-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg">
            S
          </div>

          <h1 className="mt-5 text-4xl font-black text-blue-700">
            SMART <span className="text-blue-500">ABACUS</span>
          </h1>

          <p className="text-gray-500 mt-2 tracking-widest uppercase text-sm">
            Class Management System
          </p>

          <div className="mt-8">
            <span className="px-5 py-2 rounded-full bg-blue-100 text-blue-600 text-xs font-bold uppercase tracking-widest">
              Member Registration
            </span>

            <h2 className="mt-5 text-3xl font-bold text-gray-800">
              Join Your Team
            </h2>

            <p className="text-gray-500 mt-2">
              Register as a member in your organization
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full bg-white border border-gray-300 rounded-xl py-3 pl-12 pr-4 text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@smartabacus.com"
                  className="w-full bg-white border border-gray-300 rounded-xl py-3 pl-12 pr-4 text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mobile Number
              </label>
              <div className="flex">
                <select
                  name="mobileCode"
                  value={formData.mobileCode}
                  onChange={handleChange}
                  className="w-24 border border-gray-300 rounded-l-xl bg-white text-gray-700 px-3 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="+91">+91</option>
                  <option value="+1">+1</option>
                </select>

                <div className="relative flex-1">
                  <Phone className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    name="mobileNumber"
                    required
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className="w-full border border-l-0 border-gray-300 rounded-r-xl py-3 pl-12 pr-4 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter Password"
                  className="w-full bg-white border border-gray-300 rounded-xl py-3 pl-12 pr-12 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-500 hover:text-blue-600"
                >
                  {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-red-500 mt-2">
                Password must contain at least one capital letter.
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  className="w-full bg-white border border-gray-300 rounded-xl py-3 pl-12 pr-12 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-3.5 text-gray-500 hover:text-blue-600"
                >
                  {showConfirmPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Gender
              </label>
              <div className="relative">
                <UserCheck className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-xl py-3 pl-12 pr-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 appearance-none font-semibold"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            {/* Role selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Role / Type {roleParam && <span className="text-xs text-blue-600 font-bold">(Locked via Invite Link)</span>}
              </label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={!!roleParam}
                  className="w-full bg-white border border-gray-300 rounded-xl py-3 pl-12 pr-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 appearance-none font-semibold disabled:bg-gray-100 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="FRANCHISE">Franchise Admin</option>
                </select>
              </div>
            </div>

            {/* City */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                City
              </label>
              <div className="relative">
                <Building className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Pune"
                  className="w-full bg-white border border-gray-300 rounded-xl py-3 pl-12 pr-4 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
              <textarea
                rows={3}
                name="Address"
                value={formData.Address}
                onChange={handleChange}
                placeholder="Enter Current Address"
                className="w-full bg-white border border-gray-300 rounded-xl py-3 pl-12 pr-4 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg shadow-lg hover:scale-[1.02] hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55"
          >
            {loading ? "Registering..." : "Complete Registration"}
            <ArrowRight size={20} />
          </button>



          {/* Login Link */}
          <div className="text-center pt-2">
            <p className="text-gray-600">
              Already have an account?
              <button
                type="button"
                onClick={() => router.push("/auth/login")}
                className="ml-2 text-blue-600 font-bold hover:text-purple-600 transition-colors cursor-pointer"
              >
                Sign In
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-bold">Loading registration...</div>}>
      <RegisterPageContent />
    </Suspense>
  );
}
