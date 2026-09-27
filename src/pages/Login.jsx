import React, { useState, useContext } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Mail, Lock, ArrowRight, Loader2, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { getApiUrl } from "../config/api";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);

  const from = location.state?.from?.pathname || "/my-courses";

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      setLoading(false);
      return;
    }
    if (!formData.password.trim()) {
      setError("Please enter your password.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        getApiUrl('/api/auth/login'),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      const data = await res.json();

      if (res.ok && data.user) {
        if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
        login(data.user, data.token || "mock_token");
        navigate(from, { replace: true });
        return;
      } else {
        setError(data.message || "Invalid email or password. Please try again.");
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn("Backend login offline or network error:", err.message);
      setError("Server connection error. Please check your internet connection.");
      setLoading(false);
    }
  };

  const isLocal = typeof window !== "undefined" && (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.endsWith(".local")
  );

  // Quick Demo Login for testing
  const handleQuickDemoLogin = () => {
    const demoUser = {
      id: "demo_student_fixed",
      name: "Demo Aspirant",
      email: "demo@itopper.com",
      role: "student",
      isDemo: true
    };
    login(demoUser, "demo_token_fixed");
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-[#EF961D]/20 flex flex-col justify-between relative overflow-hidden">
      {/* GLOBAL NAVBAR */}
      <Navigation theme="light" />

      {/* SOFT BACKGROUND GLOWS */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] -left-[10%] w-[45%] h-[45%] rounded-full bg-blue-100/60 blur-[130px]" />
        <div className="absolute top-[30%] -right-[10%] w-[45%] h-[45%] rounded-full bg-orange-100/50 blur-[130px]" />
      </div>

      {/* MAIN CONTAINER */}
      <div className="relative z-10 pt-20 sm:pt-22 pb-6 px-4 flex items-center justify-center flex-grow">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 animate-in fade-in duration-300">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0a2968] flex items-center justify-center mx-auto mb-3 shadow-xs">
              <ShieldCheck size={26} className="text-[#0a2968]" />
            </div>
            <span className="inline-block px-3 py-1 bg-blue-50 text-[#0a2968] text-xs font-bold rounded-full uppercase tracking-wider mb-2 border border-blue-100">
              iTopper IAS Academy
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0a2968] tracking-tight">
              Welcome Back
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
              Sign in to access your courses & evaluation dashboard
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-600 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5 ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="student@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#0a2968] focus:bg-white rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-800 outline-none font-semibold transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5 ml-1">
                <label className="text-xs font-bold text-slate-600 uppercase">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-[#0a2968] hover:text-[#EF961D] transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#0a2968] focus:bg-white rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-800 outline-none font-semibold transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#0a2968] hover:bg-[#EF961D] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <button
              onClick={handleQuickDemoLogin}
              className="text-xs font-bold text-[#0a2968] hover:text-[#EF961D] transition-colors inline-flex items-center gap-1.5 bg-blue-50/80 hover:bg-blue-100 px-4 py-2.5 rounded-xl border border-blue-200 cursor-pointer shadow-2xs"
            >
              <Sparkles size={14} className="text-[#EF961D]" /> Instant Demo Student Login (Access All Courses)
            </button>
          </div>

          {/* Register Link */}
          <p className="mt-6 text-center text-xs text-slate-500 font-semibold">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-[#0a2968] hover:text-[#EF961D] font-bold transition-colors underline"
            >
              Create New Account
            </Link>
          </p>
        </div>
      </div>

      {/* GLOBAL FOOTER */}
      <Footer />
    </div>
  );
};

export default Login;
