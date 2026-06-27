"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Lock,
  Mail,
  AlertTriangle,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      redirectByRole(user.role);
    }
  }, [user]);

  const redirectByRole = (role) => {
    if (!role) return;

    switch (role.toUpperCase()) {
      case "ADMIN":
        router.push("/dashboard/admin");
        break;

      case "FRANCHISE":
        router.push("/dashboard/franchise");
        break;

      case "TEACHER":
        router.push("/dashboard/teacher");
        break;

      case "STUDENT":
        router.push("/dashboard/student");
        break;

      default:
        setError("Unauthorized role.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(null);
    setLoading(true);

    try {
      const profile = await login(email, password);
      redirectByRole(profile.role);
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (roleEmail) => {
    setEmail(roleEmail);
    setPassword("password");
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 pt-24 pb-10 px-8 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-[450px] h-[450px] rounded-full bg-blue-300/30 blur-[120px]" />
      <div className="absolute -bottom-40 -right-40 w-[450px] h-[450px] rounded-full bg-purple-300/30 blur-[120px]" />
    <div className="relative z-10 w-full max-w-md rounded-3xl bg-white shadow-2xl border border-gray-200 p-8">

        {/* Logo */}

        <div className="text-center mb-8">

          <div className="mx-auto h-14 w-14 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-lg">
            S
          </div>

          <h2 className="mt-4 text-3xl font-black text-blue-700 tracking-wide">
            SMART <span className="text-orange-500">ABACUS</span>
          </h2>

          <p className="mt-2 text-sm text-gray-500 uppercase tracking-[3px]">
            Class Management System
          </p>

        </div>

        {error && (

          <div className="mb-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">

            <AlertTriangle className="h-5 w-5 shrink-0" />

            <p className="text-sm">{error}</p>

          </div>

        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email */}

          <div>

            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>

            <div className="relative">

              <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@smartabacus.com"
                className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />

            </div>

          </div>
                    {/* Password */}

          <div>

            <div className="flex items-center justify-between mb-2">

              <label className="block text-sm font-semibold text-gray-700">
                Password
              </label>

              <button
                type="button"
                className="text-sm font-medium text-blue-600 hover:text-purple-600"
              >
                Forgot Password?
              </button>

            </div>

            <div className="relative">

              <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />

              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-12 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-gray-500 hover:text-blue-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>

          </div>

          {/* Login Button */}

          <button
            type="submit"
            disabled={loading || authLoading}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3.5 text-white font-bold shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>
              {loading ? "Signing In..." : "Sign In"}
            </span>

            <ArrowRight size={18} />
          </button>

        </form>

        {/* Quick Login */}

        <div className="mt-8 border-t border-gray-200 pt-6">

          <div className=" m-2 flex items-center gap-2 mb-4">

            <KeyRound className="h-5 w-5 text-orange-500" />

            <span className="text-sm font-bold text-gray-700">
              Quick Demo Login
            </span>

          </div>

        <div className="grid grid-cols-2 gap-4">
  {[
    {
      label: "System Admin",
      email: "admin@abacus.com",
    },
    {
      label: "Franchise Desk",
      email: "franchise@abacus.com",
    },
    {
      label: "Teacher Portal",
      email: "teacher@abacus.com",
    },
    {
      label: "Student Module",
      email: "student@abacus.com",
    },
  ].map((credential) => (
    <button
      key={credential.label}
      type="button"
      onClick={() => fillCredentials(credential.email)}
      className="rounded-xl border border-gray-300 bg-white p-4 text-left shadow-sm transition-all hover:border-blue-500 hover:bg-blue-50 hover:shadow-md"
    >
      <span className="block text-sm font-bold text-gray-800">
        {credential.label}
      </span>

      <span className="mt-2 block text-xs text-gray-500">
        {credential.email}
      </span>
    </button>
  ))}
</div>
          {/* Register Link */}

          <div className="mt-6 text-center">

            <p className="text-sm text-gray-600">
              Dont have an account?

              <button
                type="button"
                onClick={() => router.push("/pages/auth/register")}
                className="ml-2 font-bold text-blue-600 hover:text-purple-600 transition-colors"
              >
                Register
              </button>

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}