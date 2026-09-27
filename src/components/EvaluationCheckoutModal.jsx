import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Sparkles, 
  ArrowRight, 
  Loader2, 
  Mail,
  User,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import { launchRazorpayCheckout } from "../utils/razorpay";
import { getApiUrl } from "../config/api";

const EvaluationCheckoutModal = ({ isOpen, onClose, plan, onPaymentSuccess }) => {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Modal Step State: 'auth' | 'checkout' | 'processing'
  const [step, setStep] = useState("auth");
  const [authMode, setAuthMode] = useState("login"); // 'login' | 'register'

  // Auth Form State
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (!user) {
        setStep("auth");
      } else {
        setStep("checkout");
      }
      setAuthError("");
    }
  }, [isOpen, user]);

  if (!isOpen || !plan) return null;

  const finalPayable = plan.finalPrice || 4999;

  // Function to save purchase and redirect immediately to Payment Success page
  const handleSuccess = (txnid, pricePaid) => {
    try {
      const currentUser = user || { email: authEmail };
      const userEmail = currentUser?.email;
      if (userEmail) {
        const userKey = `itopper_purchased_evals_${userEmail}`;
        const existingUserEvals = JSON.parse(localStorage.getItem(userKey) || "[]");
        const globalEvals = JSON.parse(localStorage.getItem("itopper_purchased_evals_all") || "[]");

        const newRecord = {
          ...plan,
          purchasedAt: new Date().toISOString(),
          receiptId: txnid,
          finalPaid: pricePaid || finalPayable
        };

        if (!existingUserEvals.some(p => (p._id && p._id === plan._id) || (p.id && p.id === plan.id))) {
          localStorage.setItem(userKey, JSON.stringify([...existingUserEvals, newRecord]));
        }
        if (!globalEvals.some(p => (p._id && p._id === plan._id) || (p.id && p.id === plan.id))) {
          localStorage.setItem("itopper_purchased_evals_all", JSON.stringify([...globalEvals, newRecord]));
        }
      }
    } catch (e) {
      console.error("Failed to save purchased evaluation:", e);
    }

    if (onPaymentSuccess) onPaymentSuccess(txnid);
    onClose();
    navigate(`/payment-success?txnid=${txnid}`);
  };

  // Launch Razorpay Checkout Payment Window
  const startPaymentGateway = (activeUser) => {
    setStep("processing");
    launchRazorpayCheckout({
      item: plan,
      user: activeUser || user,
      amount: finalPayable,
      onSuccess: (paymentId, paidAmount) => {
        handleSuccess(paymentId, paidAmount);
      },
      onError: (err) => {
        setStep(activeUser || user ? "checkout" : "auth");
      },
      onCancel: () => {
        setStep(activeUser || user ? "checkout" : "auth");
      }
    });
  };

  // Handle Login or Register submit
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    if (authMode === "register" && !authName.trim()) {
      setAuthError("Please enter your full name.");
      setAuthLoading(false);
      return;
    }
    if (!authEmail.trim()) {
      setAuthError("Please enter your email address.");
      setAuthLoading(false);
      return;
    }
    if (!authPassword.trim()) {
      setAuthError("Please enter your password.");
      setAuthLoading(false);
      return;
    }

    try {
      const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload = authMode === "login" 
        ? { email: authEmail, password: authPassword }
        : { name: authName, email: authEmail, password: authPassword };

      const res = await fetch(getApiUrl(endpoint), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
        login(data.user, data.token || "mock_token");
        setAuthLoading(false);
        startPaymentGateway(data.user);
        return;
      } else {
        setAuthError(data.message || (authMode === "login" ? "Invalid email or password." : "Registration failed."));
        setAuthLoading(false);
        return;
      }
    } catch (err) {
      console.warn("Backend auth network error:", err.message);
      setAuthError("Server connection error. Please try again.");
      setAuthLoading(false);
    }
  };

  const isLocal = typeof window !== "undefined" && (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.endsWith(".local")
  );

  // Quick Guest Login
  const handleQuickDemoLogin = () => {
    const demoUser = {
      id: "demo_student_fixed",
      name: "Demo Aspirant",
      email: "demo@itopper.com",
      role: "student",
      isDemo: true
    };
    login(demoUser, "demo_token_fixed");
    startPaymentGateway(demoUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 selection:bg-[#EF961D]/20 font-sans">
      {/* Backdrop overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#0a2968]/40 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.25 }}
        className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#0a2968] to-[#163F66] text-white p-5 px-6 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-[#EF961D]" size={20} />
            <span className="font-extrabold text-sm sm:text-base tracking-wide">
              {step === "auth" ? "Sign In to Enroll" : "iTopper Checkout"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 sm:p-7 overflow-y-auto flex-grow">
          {/* ================= STEP 1: AUTHENTICATION MODAL ================= */}
          {step === "auth" && (
            <div className="animate-in fade-in duration-300">
              <div className="text-center mb-6">
                <span className="inline-block px-3 py-1 bg-blue-50 text-[#0a2968] text-xs font-bold rounded-full uppercase tracking-wider mb-2">
                  Student Verification
                </span>
                <h3 className="text-xl font-bold text-slate-900">Sign in to Continue</h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  Login or create account to trigger immediate checkout for <span className="text-[#0a2968] font-bold">"{plan.title}"</span>
                </p>
              </div>

              {/* Login / Register Tab Switcher */}
              <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                <button
                  onClick={() => setAuthMode("login")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    authMode === "login" ? "bg-white text-[#0a2968] shadow-xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Student Login
                </button>
                <button
                  onClick={() => setAuthMode("register")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    authMode === "register" ? "bg-white text-[#0a2968] shadow-xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Create New Account
                </button>
              </div>

              {authError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600 flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  {authError}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === "register" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="text"
                        required
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#0a2968] focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 outline-none font-semibold"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="student@example.com"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#0a2968] focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 outline-none font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="password"
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#0a2968] focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 outline-none font-semibold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 bg-[#0a2968] hover:bg-[#EF961D] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
                >
                  {authLoading ? <Loader2 size={16} className="animate-spin" /> : <>Continue & Open Payment Gateway <ArrowRight size={14} /></>}
                </button>
              </form>

              {/* Fast 1-Click Guest Login button (Only visible on localhost / local dev) */}
              {isLocal && (
                <div className="mt-5 pt-4 border-t border-slate-100 text-center">
                  <button
                    onClick={handleQuickDemoLogin}
                    className="text-xs font-bold text-[#0a2968] hover:text-[#EF961D] transition-colors inline-flex items-center gap-1.5 bg-blue-50/80 hover:bg-blue-100 px-4 py-2 rounded-xl border border-blue-200 cursor-pointer shadow-2xs"
                  >
                    <Sparkles size={14} className="text-[#EF961D]" /> Guest Login & Open Payment Gateway
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================= STEP 2: CHECKOUT STEP ================= */}
          {step === "checkout" && (
            <div className="animate-in fade-in duration-300 space-y-5">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0a2968] bg-blue-100/80 px-2 py-0.5 rounded">
                      {plan.paperTag || plan.category}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-1 leading-snug">
                      {plan.title}
                    </h4>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 shrink-0">{plan.duration}</span>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 mt-3 text-xs text-slate-600 font-semibold">
                  <User size={13} className="text-[#0a2968]" />
                  <span>Logged in as: <strong className="text-slate-800">{user?.name || user?.email || "Student"}</strong></span>
                </div>
              </div>

              {/* Price Calculation Summary */}
              <div className="space-y-2 text-xs font-semibold text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex justify-between text-sm font-extrabold text-[#0a2968] pt-2 border-t border-slate-200">
                  <span>Total Payable Amount</span>
                  <span className="text-base font-black">₹{finalPayable.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Pay Now Button */}
              <button
                type="button"
                onClick={() => startPaymentGateway(user)}
                className="w-full py-3.5 bg-[#0a2968] hover:bg-[#EF961D] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-3"
              >
                Pay ₹{finalPayable.toLocaleString("en-IN")} via Razorpay <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* ================= STEP 3: PAYMENT PROCESSING ================= */}
          {step === "processing" && (
            <div className="py-12 text-center animate-in fade-in duration-300">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <Loader2 className="w-16 h-16 text-[#0a2968] animate-spin" />
                <Lock className="w-6 h-6 text-[#EF961D] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Opening Razorpay Payment Window...</h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">Please complete the payment in the Razorpay popup</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default EvaluationCheckoutModal;
