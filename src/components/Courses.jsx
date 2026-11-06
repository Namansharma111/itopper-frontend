import React, { useState } from "react";
import {
  Target,
  PenTool,
  ClipboardList,
  BookOpen,
  Globe,
  Leaf,
  FileText,
  ChevronRight,
  Check,
  Users,
  Star,
  Award,
  TrendingUp,
  Layers,
  FileCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

/* ───────────────────────────────────────────────
   DATA
─────────────────────────────────────────────── */
const tabs = [
  { id: "programs", label: "Programs", icon: Target },
  { id: "mains", label: "Mains Writing", icon: PenTool },
  { id: "modules", label: "Modules", icon: Layers },
  { id: "rank", label: "Rank", icon: Award },
  { id: "evaluation", label: "Evaluation", icon: FileCheck, link: "/evaluation" },
];


const allCourses = {
  programs: [
    {
      id: "p1",
      slug: "mentorship-prelims",
      title: "Mentorship – Prelims",
      badge: "BESTSELLER",
      badgeColor: "bg-orange-50 text-orange-600 border-orange-200",
      price: "Premium Plan",
      priceNote: "Custom Pricing",
      icon: Target,
      tag: "1-on-1 Guidance",
      tagColor: "text-[#163F66] bg-[#163F66]/8 border-[#163F66]/15",
      bullets: [
        "Dedicated Prelims Strategy",
        "PYQ Deep Dives with Topper",
        "Weekly Progress Reviews",
        "Mock Interview Sessions",
      ],
      students: "1,200+",
      rating: "4.9",
    },
    {
      id: "p2",
      slug: "mentorship-mains",
      title: "Mentorship – Mains",
      badge: "MOST POPULAR",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      price: "Premium Plan",
      priceNote: "Custom Pricing",
      icon: PenTool,
      tag: "1-on-1 Guidance",
      tagColor: "text-[#163F66] bg-[#163F66]/8 border-[#163F66]/15",
      bullets: [
        "GS Paper Answer Writing",
        "Optional Subject Mentoring",
        "Essay Strategy & Reviews",
        "Unlimited Doubt Sessions",
      ],
      students: "980+",
      rating: "4.8",
    },
    {
      id: "p3",
      slug: "mentorship-comprehensive",
      title: "Mentorship – Comprehensive",
      subtitle: "(Pre + Mains)",
      badge: "ALL-IN-ONE",
      badgeColor: "bg-violet-50 text-violet-700 border-violet-200",
      price: "Premium Plan",
      priceNote: "Custom Pricing",
      icon: Award,
      tag: "Complete Package",
      tagColor: "text-violet-700 bg-violet-50 border-violet-200",
      bullets: [
        "End-to-End UPSC Coverage",
        "Prelims + Mains Strategy",
        "Interview Preparation",
        "Notes Making Guidance",
      ],
      students: "650+",
      rating: "5.0",
    },
  ],
  mains: [
    {
      id: "m1",
      slug: "daily-mains-answer-writing",
      title: "Daily Mains Answer Writing",
      badge: "MOST ENROLLED",
      badgeColor: "bg-rose-50 text-rose-600 border-rose-200",
      price: "₹9,999/-",
      priceNote: "Annual Plan",
      icon: PenTool,
      tag: "Daily Practice",
      tagColor: "text-rose-600 bg-rose-50 border-rose-200",
      bullets: [
        "Evaluation Within 24 Hours",
        "1-on-1 Doubt Clearance",
        "GS 1–4 & Essay Coverage",
        "Model Answers Provided",
      ],
      students: "2,100+",
      rating: "4.9",
    },
    {
      id: "m2",
      slug: "answer-writing-test-series",
      title: "Answer Writing with Test Series",
      badge: "COMBO OFFER",
      badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
      price: "₹14,999/-",
      priceNote: "Annual Plan",
      icon: ClipboardList,
      tag: "Writing + Tests",
      tagColor: "text-teal-700 bg-teal-50 border-teal-200",
      bullets: [
        "20 Full-Length Mains Tests",
        "Answer Evaluation Included",
        "All GS Papers Covered",
        "Rank & Percentile Report",
      ],
      students: "1,500+",
      rating: "4.8",
    },
    {
      id: "m3",
      slug: "answer-evaluation",
      title: "Answer Evaluation",
      badge: "FOCUSED",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
      price: "₹4,999/-",
      priceNote: "Per Semester",
      icon: Star,
      tag: "Expert Feedback",
      tagColor: "text-indigo-700 bg-indigo-50 border-indigo-200",
      bullets: [
        "Topper-Reviewed Copies",
        "Detailed Margin Comments",
        "Score Improvement Tracking",
        "Strategy Corrections",
      ],
      students: "800+",
      rating: "4.7",
    },
  ],
  modules: [
    {
      id: "mod1",
      slug: "gs-paper-4-ethics",
      title: "GS Paper IV – Ethics",
      badge: "HIGH SCORING",
      badgeColor: "bg-yellow-50 text-yellow-700 border-yellow-200",
      price: "₹2,999/-",
      priceNote: "One-Time",
      icon: BookOpen,
      tag: "GS Paper 4",
      tagColor: "text-yellow-700 bg-yellow-50 border-yellow-200",
      bullets: [
        "Ethics Theory & Cases",
        "Case Study Bank (100+)",
        "Answer Framework Training",
        "Mock Tests Included",
      ],
      students: "1,800+",
      rating: "4.9",
    },
    {
      id: "mod2",
      slug: "geography",
      title: "Geography",
      badge: "FOUNDATION",
      badgeColor: "bg-sky-50 text-sky-700 border-sky-200",
      price: "₹2,499/-",
      priceNote: "One-Time",
      icon: Globe,
      tag: "Physical + Human",
      tagColor: "text-sky-700 bg-sky-50 border-sky-200",
      bullets: [
        "Physical Geography Mastery",
        "Indian Geography Deep Dive",
        "Map-Based Questions",
        "PYQ Analysis Included",
      ],
      students: "1,300+",
      rating: "4.8",
    },
    {
      id: "mod3",
      slug: "environment",
      title: "Environment",
      badge: "TRENDING",
      badgeColor: "bg-green-50 text-green-700 border-green-200",
      price: "₹2,499/-",
      priceNote: "One-Time",
      icon: Leaf,
      tag: "Ecology + CA",
      tagColor: "text-green-700 bg-green-50 border-green-200",
      bullets: [
        "Ecology & Biodiversity",
        "Climate Change & Policies",
        "Current Affairs Integration",
        "Environment Acts Covered",
      ],
      students: "1,100+",
      rating: "4.7",
    },
    {
      id: "mod4",
      slug: "essay",
      title: "Essay",
      badge: "SCORE BOOSTER",
      badgeColor: "bg-pink-50 text-pink-700 border-pink-200",
      price: "₹2,999/-",
      priceNote: "One-Time",
      icon: FileText,
      tag: "GS Paper 1 Essay",
      tagColor: "text-pink-700 bg-pink-50 border-pink-200",
      bullets: [
        "Essay Structure & Format",
        "100+ Topic Brainstorming",
        "Weekly Essay Practice",
        "Topper Essay Reviews",
      ],
      students: "900+",
      rating: "4.9",
    },
  ],
  rank: [
    {
      id: "r1",
      slug: "rank-20-days",
      title: "20 Days Program",
      subtitle: "(Mains)",
      badge: "RANK STORM",
      badgeColor: "bg-orange-50 text-orange-600 border-orange-200",
      price: "Premium Plan",
      priceNote: "Custom Pricing",
      icon: Award,
      tag: "Ethics & Essay",
      tagColor: "text-orange-600 bg-orange-50 border-orange-200",
      bullets: [
        "Essay & Ethics foundation",
        "Daily assignment during classes",
        "Detailed evaluation by mentors",
        "One-to-one mentorship",
      ],
      students: "500+",
      rating: "4.8",
    },
    {
      id: "r2",
      slug: "rank-3-months",
      title: "3 Months Program",
      subtitle: "(Mains)",
      badge: "ADVANCED",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      price: "Premium Plan",
      priceNote: "Custom Pricing",
      icon: Award,
      tag: "GS Papers + Essay",
      tagColor: "text-amber-700 bg-amber-50 border-amber-200",
      bullets: [
        "Answer writing sessions",
        "Real-time evaluation",
        "Complete Ethics & Essay",
        "Skill: Presentation & Time Mgmt",
      ],
      students: "800+",
      rating: "4.9",
    },
    {
      id: "r3",
      slug: "rank-12-months",
      title: "12 Months Program",
      subtitle: "(Prelims + Mains)",
      badge: "COMPREHENSIVE",
      badgeColor: "bg-violet-50 text-violet-700 border-violet-200",
      price: "Premium Plan",
      priceNote: "Custom Pricing",
      icon: Award,
      tag: "4-Phase Prep",
      tagColor: "text-violet-700 bg-violet-50 border-violet-200",
      bullets: [
        "Holistic prep (NCERT to Adv)",
        "Prelims–Mains Bridge",
        "Intensive Simulation & Tests",
        "Direct teaching by Amit Sir",
      ],
      students: "1200+",
      rating: "5.0",
    },
  ],
};

allCourses.all = [
  ...allCourses.programs,
  ...allCourses.mains,
  ...allCourses.modules,
  ...allCourses.rank,
];

/* ───────────────────────────────────────────────
   CARD COMPONENT
─────────────────────────────────────────────── */
const CourseCard = ({ course, onView }) => {
  const IconComponent = course.icon;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.97 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex flex-col bg-white rounded-2xl border border-slate-200/70 hover:border-[#163F66]/30 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 relative overflow-hidden group"
    >
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-[#163F66] to-[#EF961D]" />

      <div className="p-6 sm:p-7 flex flex-col flex-grow">
        {/* Header row */}
        <div className="flex justify-between items-start mb-5 mt-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#163F66]/5 border border-[#163F66]/10 text-[#163F66] flex items-center justify-center shrink-0">
              <IconComponent size={19} strokeWidth={2.5} />
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold border tracking-wider uppercase ${course.tagColor}`}>
              {course.tag}
            </span>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold border tracking-wider uppercase ${course.badgeColor}`}>
            {course.badge}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-[17px] font-black text-slate-900 leading-snug mb-1 group-hover:text-[#163F66] transition-colors duration-300">
          {course.title}
        </h3>
        {course.subtitle && (
          <p className="text-xs font-bold text-slate-400 mb-3">{course.subtitle}</p>
        )}

        {/* Price */}
        <div className="mb-5 mt-2 flex items-center gap-3">
          <div className="bg-[#EF961D]/6 text-slate-800 border border-[#EF961D]/20 px-3 py-1.5 rounded-xl font-black text-sm flex items-center gap-2">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold">Price:</span>
            <span className="text-[#163F66]">{course.price}</span>
          </div>
          <span className="text-[11px] text-slate-400 font-bold">{course.priceNote}</span>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 mb-5 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <Users size={12} className="text-slate-400" strokeWidth={2.5} />
            <span className="text-xs font-extrabold text-slate-500">{course.students} students</span>
          </div>
          <div className="flex items-center gap-1">
            <Star size={11} className="text-[#EF961D] fill-[#EF961D]" />
            <span className="text-xs font-extrabold text-slate-700">{course.rating}</span>
          </div>
        </div>

        {/* Bullets */}
        <ul className="space-y-3 mb-7 flex-grow">
          {course.bullets.map((bullet, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <div className="flex items-center justify-center w-4.5 h-4.5 mt-0.5 rounded-full bg-[#EF961D]/12 text-[#EF961D] shrink-0">
                <Check size={10} strokeWidth={3.5} />
              </div>
              <span className="text-[13px] text-slate-600 font-semibold leading-relaxed">{bullet}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="mt-auto">
          <button
            onClick={() => onView(course.slug)}
            className="w-full py-3.5 rounded-[11px] bg-[#0b1329] hover:bg-[#EF961D] text-white hover:text-black font-extrabold text-[13px] transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer group/btn"
          >
            <span>View Program Details</span>
            <ChevronRight size={14} strokeWidth={2.5} className="transition-transform duration-300 group-hover/btn:translate-x-0.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

/* ───────────────────────────────────────────────
   MAIN COMPONENT
─────────────────────────────────────────────── */
const Courses = () => {
  const [activeTab, setActiveTab] = useState("programs");
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get("tab");
    if (tabParam && ["programs", "mains", "modules", "rank", "all"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  const handleView = (slug) => {
    if (slug === "mentorship-prelims") { navigate("/programs/prelims"); return; }
    if (slug) {
      if (slug.startsWith("rank-")) {
        navigate("/programs");
      } else {
        navigate(`/curriculum/${slug}`);
      }
    }
  };

  const currentCourses = allCourses[activeTab];

  const tabMeta = {
    programs: {
      heading: "Mentorship Programs",
      sub: "1-on-1 personalised guidance from UPSC toppers — Prelims, Mains, or both.",
    },
    mains: {
      heading: "Mains Writing Programs",
      sub: "India's most rigorous answer-writing platform with expert evaluation.",
    },
    modules: {
      heading: "Standalone Modules",
      sub: "Subject-specific deep-dives crafted for high-scoring GS topics.",
    },
    rank: {
      heading: "Rank Storm Mentorship",
      sub: "Specially designed for serious aspirants aiming to become future rankers.",
    },
    all: {
      heading: "All Courses",
      sub: "Explore all our programs and modules.",
    },
  };

  return (
    <section id="courses" className="pt-8 pb-10 px-4 bg-white relative overflow-hidden border-b border-slate-100">

      {/* Subtle BG Pattern */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #163F66 1px, transparent 0)`,
          backgroundSize: "36px 36px",
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* ─── Section Title ─── */}
        <div className="mb-8 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tight mb-4">
            OUR <span className="text-[#EF961D]">PROGRAMS</span>
          </h2>
          <div className="w-16 h-[3px] bg-[#EF961D] mx-auto rounded-full" />
        </div>

        {/* ─── Tab Switcher ─── */}
        <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-2 sm:gap-2.5 md:gap-3 mb-4 max-w-4xl mx-auto">
          {tabs.map(({ id, label, icon: Icon, link }) => (
            <button
              key={id}
              onClick={() => {
                if (link) {
                  navigate(link);
                } else {
                  setActiveTab(id);
                }
              }}
              className={`relative flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 md:px-4.5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold border transition-all duration-300 cursor-pointer overflow-hidden shrink-0 ${activeTab === id
                  ? "bg-[#163F66] text-white border-[#163F66] shadow-lg shadow-[#163F66]/20 scale-105"
                  : "bg-white text-slate-600 border-slate-200 hover:border-[#163F66]/40 hover:text-[#163F66] hover:bg-[#163F66]/3"
                }`}
            >
              <Icon size={14} strokeWidth={2.5} className="shrink-0" />
              <span className="whitespace-nowrap">{label}</span>
              {activeTab === id && (
                <motion.span
                  layoutId="tab-active-pill"
                  className="absolute inset-0 bg-[#163F66] -z-10 rounded-xl"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* ─── Tab Sub-heading ─── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="text-center mb-12 px-4"
          >
            <h3 className="text-lg font-black text-slate-800 mb-1">{tabMeta[activeTab].heading}</h3>
            <p className="text-sm text-slate-500 font-medium max-w-xl mx-auto">{tabMeta[activeTab].sub}</p>
          </motion.div>
        </AnimatePresence>

        {/* ─── Course Cards Grid ─── */}
        <div
          className={`grid grid-cols-1 gap-7 sm:gap-8 items-stretch mx-auto max-w-6xl ${currentCourses.length === 4
              ? "md:grid-cols-2 lg:grid-cols-4"
              : "md:grid-cols-2 lg:grid-cols-3"
            }`}
        >
          <AnimatePresence mode="popLayout">
            {currentCourses.map((course) => (
              <CourseCard key={course.id} course={course} onView={handleView} />
            ))}
          </AnimatePresence>
        </div>

        {/* ─── View All Button ─── */}
        {activeTab !== "all" && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => setActiveTab("all")}
              className="px-6 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-sm transition-all duration-300 flex items-center gap-2 group shadow-sm hover:shadow"
            >
              View All Courses
              <ChevronRight size={14} strokeWidth={2.5} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        )}

        {/* ─── Bottom CTA Banner ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 rounded-2xl bg-gradient-to-r from-[#0b1329] via-[#163F66] to-[#0b1329] p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl"
        >
          <div>
            <p className="text-[11px] font-extrabold tracking-widest text-[#EF961D] uppercase mb-1">Not sure which program suits you?</p>
            <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Book a <span className="text-[#EF961D]">Free Counselling</span> Session
            </h3>
            <p className="text-slate-300 text-sm mt-1 font-medium">Talk to a UPSC topper and choose the perfect path for you.</p>
          </div>
          <a
            href="#contact"
            className="shrink-0 px-8 py-4 rounded-xl bg-[#EF961D] hover:bg-white text-black font-extrabold text-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 whitespace-nowrap"
          >
            Book Free Call
            <ChevronRight size={15} strokeWidth={2.5} />
          </a>
        </motion.div>

      </div>
    </section>
  );
};

export default Courses;
