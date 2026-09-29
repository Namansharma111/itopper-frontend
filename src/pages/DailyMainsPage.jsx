import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  CheckCircle2,
  Calendar,
  FileText,
  Lock,
  ArrowRight,
  Download,
  Eye,
  X,
  Award,
  BookOpen,
  Clock,
  Zap,
  HelpCircle,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import EvaluationCheckoutModal from "../components/EvaluationCheckoutModal";
import { getDailyMains, DEFAULT_DAILY_MAINS } from "../utils/dailyMainsStorage";

const DailyMainsPage = () => {
  const [dailyMainsPlans, setDailyMainsPlans] = useState(DEFAULT_DAILY_MAINS);
  const [loading, setLoading] = useState(true);
  const [activeCategoryTab, setActiveCategoryTab] = useState("All");

  // Checkout Modal State
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // PDF Preview Modal State
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  const [previewPdfTitle, setPreviewPdfTitle] = useState("");

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await getDailyMains();
      if (Array.isArray(data) && data.length > 0) {
        setDailyMainsPlans(data);
      }
    } catch (err) {
      console.error("Failed to load Daily Mains plans:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollClick = (plan) => {
    setSelectedPlanForCheckout(plan);
    setIsCheckoutModalOpen(true);
  };

  const filteredPlans = dailyMainsPlans.filter((plan) => {
    if (activeCategoryTab === "All") return true;
    if (activeCategoryTab === "30-Day") return plan.totalDays === 30 || plan.paperTag?.includes("30-Day");
    if (activeCategoryTab === "60-Day") return plan.totalDays === 60 || plan.paperTag?.includes("60-Day");
    return true;
  });

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-[#EF961D]/20 flex flex-col justify-between">
      {/* GLOBAL NAVIGATION NAVBAR */}
      <Navigation theme="light" />

      <main className="flex-grow">
        {/* ================= 1. HERO BANNER SECTION ================= */}
        <section className="relative bg-gradient-to-b from-[#0a2968] via-[#0f3482] to-[#0a2968] text-white pt-28 pb-20 px-4 sm:px-6 overflow-hidden">
          {/* Subtle Background Elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] right-[-5%] w-[450px] h-[450px] rounded-full bg-[#EF961D]/15 blur-3xl" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-blue-400/10 blur-3xl" />
          </div>

          <div className="max-w-6xl mx-auto text-center relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#EF961D] text-xs font-semibold uppercase tracking-wider">
              <Sparkles size={14} /> Daily Mains Answer Writing & Drip Unlock Program
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight max-w-4xl mx-auto">
              Master UPSC Mains Answer Writing <br className="hidden sm:inline" />
              <span className="text-[#EF961D]">Day-by-Day with Daily Evaluation</span>
            </h1>

            <p className="text-sm sm:text-lg text-slate-200 font-medium max-w-3xl mx-auto leading-relaxed">
              Build unmatched answer-writing speed, structural clarity, and keyword precision. Practice daily micro-tests with strict sequential unlock logic and line-by-line faculty feedback within 24 hours.
            </p>

            {/* Feature Highlights Pill Grid */}
            <div className="pt-4 flex flex-wrap justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-semibold text-slate-200">
              <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/10">
                <CheckCircle2 size={16} className="text-[#EF961D]" /> Daily 1 Question Paper PDF
              </span>
              <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/10">
                <Lock size={16} className="text-[#EF961D]" /> Sequential Unlock System
              </span>
              <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/10">
                <Award size={16} className="text-[#EF961D]" /> 24-Hour Faculty Score Matrix
              </span>
              <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/10">
                <FileText size={16} className="text-[#EF961D]" /> Complete Model Answer Guides
              </span>
            </div>
          </div>
        </section>


        {/* ================= 2. DAILY MAINS PACKAGES GRID ================= */}
        <section id="packages" className="py-20 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <span className="px-3.5 py-1 bg-blue-50 text-[#0a2968] font-semibold text-xs rounded-lg uppercase tracking-wider border border-blue-200">
                Official Packages & Challenges
              </span>
              <h2 className="text-3xl sm:text-5xl font-semibold text-[#0a2968] tracking-tight">
                Select Your Daily Mains Writing Program
              </h2>
              <p className="text-sm sm:text-base text-slate-500 font-semibold max-w-2xl mx-auto">
                Choose from our popular 30-Day Mains Challenge or 60-Day Advanced Masterclass.
              </p>

              {/* Category Filter Tabs */}
              <div className="inline-flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 mt-4">
                {["All", "30-Day", "60-Day"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveCategoryTab(tab)}
                    className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeCategoryTab === tab
                      ? "bg-[#0a2968] text-white shadow-md"
                      : "text-slate-600 hover:text-slate-900"
                      }`}
                  >
                    {tab === "All" ? "All Programs" : `${tab} Challenges`}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="py-20 text-center text-slate-400 font-semibold">
                Loading Daily Mains Programs...
              </div>
            ) : filteredPlans.length === 0 ? (
              <div className="py-20 text-center text-slate-400 font-semibold bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                No Daily Mains Answer Writing programs found in this category.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                {filteredPlans.map((plan) => {
                  const mrp = plan.mrpPrice || 9999;
                  const price = plan.finalPrice || 5999;
                  const discountPct = Math.round(((mrp - price) / mrp) * 100);

                  return (
                    <div
                      key={plan._id || plan.id}
                      className="bg-white rounded-3xl border-2 border-slate-200 hover:border-[#0a2968] shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between p-6 sm:p-8 relative overflow-hidden group"
                    >
                      {/* Top Badge */}
                      {plan.badge && (
                        <div className="absolute top-5 right-5 px-3 py-1 bg-[#EF961D] text-white text-[10px] font-semibold uppercase tracking-wider rounded-full shadow-xs">
                          {plan.badge}
                        </div>
                      )}

                      <div className="space-y-6">
                        {/* Header info */}
                        <div>
                          <span className="px-2.5 py-1 bg-blue-50 text-[#0a2968] font-semibold text-[11px] rounded-md uppercase tracking-wider border border-blue-100 inline-block mb-3">
                            {plan.paperTag || "30-Day Program"}
                          </span>
                          <h3 className="text-xl sm:text-2xl font-semibold text-[#0a2968] leading-snug group-hover:text-[#0a2968]">
                            {plan.title}
                          </h3>
                          <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
                            {plan.description}
                          </p>
                        </div>

                        {/* Price Banner */}
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-semibold uppercase text-slate-400 block tracking-wider">
                              Special Program Fee
                            </span>
                            <div className="flex items-baseline gap-2 mt-0.5">
                              <span className="text-2xl sm:text-3xl font-semibold text-[#0a2968]">
                                ₹{price.toLocaleString("en-IN")}
                              </span>
                              {mrp > price && (
                                <span className="text-xs font-medium text-slate-400 line-through">
                                  ₹{mrp.toLocaleString("en-IN")}
                                </span>
                              )}
                            </div>
                          </div>

                          {mrp > price && (
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-semibold text-xs rounded-lg uppercase">
                              Save {discountPct}%
                            </span>
                          )}
                        </div>

                        {/* Feature Points Bullet List */}
                        <div>
                          <span className="text-xs font-semibold uppercase text-[#0a2968] tracking-wider block mb-3">
                            Key Program Deliverables:
                          </span>
                          <ul className="space-y-2.5 text-xs font-semibold text-slate-700">
                            {(plan.features || []).map((feat, fIdx) => (
                              <li key={fIdx} className="flex items-start gap-2.5">
                                <CheckCircle2 size={16} className="text-[#EF961D] shrink-0 mt-0.5" />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Program Syllabus & Schedule PDF Link */}
                        {plan.planPdf && (
                          <div className="pt-2">
                            <button
                              onClick={() => {
                                setPreviewPdfUrl(plan.planPdf);
                                setPreviewPdfTitle(plan.planPdfTitle || `${plan.title} Schedule PDF`);
                              }}
                              className="w-full py-2.5 px-4 bg-blue-50/80 hover:bg-blue-100 text-[#0a2968] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-blue-200 transition-colors cursor-pointer"
                            >
                              <FileText size={15} className="text-[#EF961D]" /> View {plan.planPdfTitle || "Micro-Topics & Schedule PDF"}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="pt-6 border-t border-slate-100 mt-6">
                        <button
                          onClick={() => handleEnrollClick(plan)}
                          className="w-full py-4 bg-[#0a2968] hover:bg-[#EF961D] text-white rounded-2xl font-semibold text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          Enroll Now & Unlock Day 1 <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>


        {/* ================= 3. HOW DAILY MAINS DRIP WORKS SECTION ================= */}
        <section className="py-16 px-4 sm:px-6 bg-slate-50 border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <span className="px-3.5 py-1 bg-amber-50 text-[#0a2968] font-semibold text-xs rounded-lg uppercase tracking-wider border border-amber-200">
                Workflow Mechanism
              </span>
              <h2 className="text-2xl sm:text-4xl font-semibold text-[#0a2968] tracking-tight">
                How Daily Mains Drip Unlock Works
              </h2>
              <p className="text-sm text-slate-500 font-semibold max-w-2xl mx-auto">
                Designed to instill discipline & consistency. You cannot skip days or accumulate backlogs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Step 1 */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative space-y-4 hover:border-[#0a2968] transition-all">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0a2968] font-semibold text-lg flex items-center justify-center border border-blue-100 shadow-2xs">
                  01
                </div>
                <h3 className="text-base font-semibold text-[#0a2968]">Day 1 Release on Purchase</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  As soon as you enroll, Day 1 question paper PDF and micro-topic guidance unlock immediately on your dashboard.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative space-y-4 hover:border-[#0a2968] transition-all">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 font-semibold text-lg flex items-center justify-center border border-amber-200 shadow-2xs">
                  02
                </div>
                <h3 className="text-base font-semibold text-[#0a2968]">Write & Upload Answer PDF</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Write your answer on A4 sheets under exam conditions, scan to PDF and upload directly under Day 1 on your student portal.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative space-y-4 hover:border-[#0a2968] transition-all">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 font-semibold text-lg flex items-center justify-center border border-purple-200 shadow-2xs">
                  03
                </div>
                <h3 className="text-base font-semibold text-[#0a2968]">Sequential Unlock of Next Day</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Submitting Day 1 unlocks Day 2 (provided calendar date has reached Day 2 from purchase date). Zero backlogs possible!
                </p>
              </div>

              {/* Step 4 */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative space-y-4 hover:border-[#0a2968] transition-all">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 font-semibold text-lg flex items-center justify-center border border-emerald-200 shadow-2xs">
                  04
                </div>
                <h3 className="text-base font-semibold text-[#0a2968]">24h Expert Evaluation</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Faculty evaluates your copy line-by-line, provides marks & structural remarks, and uploads your checked PDF to your dashboard.
                </p>
              </div>
            </div>
          </div>
        </section>


      </main>

      {/* PDF PREVIEW MODAL */}
      {previewPdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[85vh]">
            <div className="p-4 px-6 bg-[#0a2968] text-white flex items-center justify-between">
              <span className="font-semibold text-sm truncate">{previewPdfTitle}</span>
              <button
                onClick={() => setPreviewPdfUrl(null)}
                className="p-1 hover:bg-white/10 rounded-full text-slate-300 hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-grow bg-slate-100 p-2">
              <iframe
                src={previewPdfUrl}
                title={previewPdfTitle}
                className="w-full h-full rounded-xl border-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* EVALUATION / PROGRAM CHECKOUT MODAL */}
      <EvaluationCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        plan={selectedPlanForCheckout}
        onPaymentSuccess={() => {
          setIsCheckoutModalOpen(false);
        }}
      />

      {/* GLOBAL FOOTER */}
      <Footer />
    </div>
  );
};

export default DailyMainsPage;

