import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileCheck, Download, Printer, Upload, FileText, CheckCircle2,
  Trophy, LogOut, LayoutDashboard, BrainCircuit, Zap,
  ArrowUpRight, Award, Sparkles, ExternalLink, Eye, ChevronDown, ChevronUp,
  X, Clock, BookOpen, Layers, AlertCircle, ArrowLeft, ChevronRight,
  Lock, Calendar, ShieldAlert, Loader2
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { getEvaluations, DEFAULT_EVALUATIONS, getEvaluationResultsApi, submitAnswerSheetApi } from '../utils/evaluationStorage';
import { getDailyMains } from '../utils/dailyMainsStorage';
import { uploadFileToCloudinary } from '../utils/uploadStorage';

const StudentDashboard = () => {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [purchasedEvaluations, setPurchasedEvaluations] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [uploadedAnswerSheets, setUploadedAnswerSheets] = useState({});
  const [evaluationResults, setEvaluationResults] = useState([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadingTestKey, setUploadingTestKey] = useState(null);

  // Mobile navigation mode: 'list' (show all courses) or 'details' (show active course tests)
  const [mobileViewMode, setMobileViewMode] = useState('list');

  // Expanded Test Cards State (Keyed by testId)
  const [openTestAccordions, setOpenTestAccordions] = useState({});

  // Expanded Inline PDF Viewers State (Keyed by unique ID e.g. "overview_pdf", "q_testId", "checked_testId")
  const [openInlinePdfs, setOpenInlinePdfs] = useState({});

  useEffect(() => {
    loadPurchasedEvaluations();
    loadUploadedAnswerSheets();
    loadEvaluationResults();
  }, [user]);

  // Load purchased evaluation plans for this student
  const loadPurchasedEvaluations = async () => {
    try {
      if (!user?.email) {
        setPurchasedEvaluations([]);
        return;
      }
      const userEmail = user.email.toLowerCase();
      const isDemoUser = user?.isDemo || user?.id === 'demo_student_fixed' || userEmail === 'demo@itopper.com' || userEmail === 'student@itopper.com' || userEmail.includes('demo');
      const userKey = `itopper_purchased_evals_${userEmail}`;

      if (isDemoUser) {
        // ALWAYS load all available courses for Demo Account so all plans & 30-day tests can be tested
        const allEvals = await getEvaluations(true);
        const allDailyMains = await getDailyMains(true);
        const allPlans = [...allEvals, ...allDailyMains];
        const demoEvals = allPlans.map((p, idx) => ({
          ...p,
          purchasedAt: p.purchasedAt || new Date(Date.now() - 3600000 * 24 * (idx % 2)).toISOString(),
          receiptId: "REC-" + Math.floor(100000 + Math.random() * 900000)
        }));
        localStorage.setItem(userKey, JSON.stringify(demoEvals));
        setPurchasedEvaluations(demoEvals);
        if (demoEvals.length > 0 && !selectedCourseId) {
          setSelectedCourseId(demoEvals[0]._id || demoEvals[0].id);
        }
        return;
      }

      let userEvals = JSON.parse(localStorage.getItem(userKey) || "[]");
      setPurchasedEvaluations(userEvals);
      if (userEvals.length > 0 && !selectedCourseId) {
        setSelectedCourseId(userEvals[0]._id || userEvals[0].id);
      }
    } catch (e) {
      console.error("Error loading purchased evaluations:", e);
      setPurchasedEvaluations([]);
    }
  };

  // Load uploaded answer sheets (keyed by `${planId}_${testId}`)
  const loadUploadedAnswerSheets = () => {
    try {
      const userEmail = user?.email || 'student@itopper.com';
      const savedSheets = localStorage.getItem(`itopper_answer_sheets_${userEmail}`);
      if (savedSheets) {
        setUploadedAnswerSheets(JSON.parse(savedSheets));
      } else {
        setUploadedAnswerSheets({});
      }
    } catch (e) {
      console.error("Error loading answer sheets:", e);
    }
  };

  // Load evaluation results uploaded by admin (Syncs with Live MongoDB API if reachable)
  const loadEvaluationResults = async () => {
    try {
      const userEmail = user?.email?.toLowerCase() || 'student@itopper.com';
      const resultsFromApi = await getEvaluationResultsApi(userEmail);
      if (Array.isArray(resultsFromApi) && resultsFromApi.length > 0) {
        setEvaluationResults(resultsFromApi);
        return;
      }
      const saved = JSON.parse(localStorage.getItem("itopper_evaluation_results") || "[]");
      const studentResults = saved.filter(item => {
        if (!item.studentEmail) return true;
        const targetEmail = item.studentEmail.toLowerCase();
        return targetEmail === userEmail || targetEmail === 'all' || targetEmail === 'all_students';
      });

      setEvaluationResults(studentResults);
    } catch (e) {
      console.error("Error loading evaluation results:", e);
      setEvaluationResults([]);
    }
  };

  // Handle Answer Sheet File Upload for a SPECIFIC TEST inside a Course
  const handleAnswerSheetUpload = async (plan, test, event) => {
    const file = event.target.files[0];
    if (!file) return;

    const planId = plan._id || plan.id || plan.title;
    const testId = test.id || test.testName || test.testTitle;
    const compositeKey = `${planId}_${testId}`;

    setIsUploadingFile(true);
    setUploadingTestKey(compositeKey);

    try {
      const userEmail = user?.email || 'student@itopper.com';

      // Upload file directly to Cloudinary (rsscwe4n)!
      const cloudinaryFileUrl = await uploadFileToCloudinary(file, 'student_answer_copies');

      const sheetInfo = {
        planId: planId,
        planTitle: plan.title,
        testId: testId,
        testName: test.testName || test.testTitle,
        studentName: user?.name || userEmail.split('@')[0] || "Aspirant",
        studentEmail: userEmail,
        fileName: file.name,
        fileSize: (file.size / (1024 * 1024)).toFixed(2) + " MB",
        uploadedAt: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
        status: "Under Evaluation",
        fileUrl: cloudinaryFileUrl
      };

      // Save to user local state
      const updatedSheets = {
        ...uploadedAnswerSheets,
        [compositeKey]: sheetInfo
      };
      setUploadedAnswerSheets(updatedSheets);
      localStorage.setItem(`itopper_answer_sheets_${userEmail}`, JSON.stringify(updatedSheets));

      // Also sync to Live MongoDB API
      try {
        await submitAnswerSheetApi(sheetInfo);
      } catch (err) {
        console.warn("MongoDB answer sheet sync failed, stored locally:", err);
      }

      // Also sync to global submissions array for Admin Portal view
      try {
        const allSubmissions = JSON.parse(localStorage.getItem("itopper_all_student_submissions") || "[]");
        const existingIdx = allSubmissions.findIndex(s => s.planId === planId && s.testId === testId && s.studentEmail === userEmail);
        if (existingIdx >= 0) {
          allSubmissions[existingIdx] = sheetInfo;
        } else {
          allSubmissions.unshift(sheetInfo);
        }
        localStorage.setItem("itopper_all_student_submissions", JSON.stringify(allSubmissions));
      } catch (e) {
        console.error("Error syncing submission to admin storage:", e);
      }

      alert(`✅ Answer Sheet "${file.name}" uploaded to Cloudinary & submitted for "${test.testName || test.testTitle}"! Sent to faculty for evaluation.`);
    } catch (error) {
      console.error("Upload error:", error);
      alert("❌ Upload failed. Please try again.");
    } finally {
      setIsUploadingFile(false);
      setUploadingTestKey(null);
    }
  };

  // Toggle inline PDF viewer
  const toggleInlinePdf = (pdfKey) => {
    setOpenInlinePdfs(prev => ({
      ...prev,
      [pdfKey]: !prev[pdfKey]
    }));
  };

  // Download PDF Helper
  const handleDownloadPdf = (pdfUrl, fileName) => {
    const targetUrl = pdfUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
    const link = document.createElement("a");
    link.href = targetUrl;
    link.target = "_blank";
    link.download = `${fileName.replace(/\s+/g, "_")}_iTopper.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print PDF Helper
  const handlePrintPdf = (pdfUrl) => {
    const targetUrl = pdfUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
    const printWindow = window.open(targetUrl, '_blank');
    if (printWindow) {
      printWindow.focus();
    } else {
      alert("Please allow popups to open the print view for your PDF.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Active Selected Course Object
  const selectedCourse = purchasedEvaluations.find(p => (p._id || p.id) === selectedCourseId) || purchasedEvaluations[0];

  // Get tests list for a course (or default tests if none explicitly defined)
  const getCourseTests = (course) => {
    if (!course) return [];
    let testsArr = [];
    if (course.tests && Array.isArray(course.tests) && course.tests.length > 0) {
      testsArr = course.tests;
    } else {
      // Fallback default tests if tests array is not yet explicitly created
      testsArr = [
        {
          id: `${course._id || course.id || 'eval'}-t1`,
          testName: `Test 1: ${course.paperTag || 'GS Paper'} Foundation & Concept Test`,
          testTitle: `Test 1: ${course.paperTag || 'GS Paper'} Foundation & Concept Test`,
          questionPdf: course.planPdf || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
        },
        {
          id: `${course._id || course.id || 'eval'}-t2`,
          testName: `Test 2: ${course.paperTag || 'GS Paper'} Applied & Diagram Practice Test`,
          testTitle: `Test 2: ${course.paperTag || 'GS Paper'} Applied & Diagram Practice Test`,
          questionPdf: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
        },
        {
          id: `${course._id || course.id || 'eval'}-t3`,
          testName: `Test 3: ${course.paperTag || 'GS Paper'} Full Length Simulation Test`,
          testTitle: `Test 3: ${course.paperTag || 'GS Paper'} Full Length Simulation Test`,
          questionPdf: ""
        }
      ];
    }
    return testsArr;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex flex-col selection:bg-[#EF961D]/20">
      {/* GLOBAL LIGHT NAVBAR */}
      <Navigation theme="light" />

      {/* TOP HEADER BANNER */}
      <section className="bg-white border-b border-slate-200 pt-6 sm:pt-10 pb-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-[#0a2968] rounded-full text-xs font-extrabold uppercase tracking-wider mb-2 border border-blue-100">
              <Sparkles size={14} className="text-[#EF961D]" /> Student Portal & Evaluation Dashboard
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#0a2968] tracking-tight">
              Welcome, <span className="text-[#EF961D]">{user?.name ? user.name.split(' ')[0] : 'Aspirant'}</span> 👋🏻
            </h1>
            <p className="text-slate-500 text-sm font-semibold mt-1">
              Select your enrolled course to access syllabus PDFs, submit handwritten answer copies test-by-test, and view evaluated results.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/evaluation"
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#0a2968] rounded-xl text-xs font-extrabold transition-all border border-slate-200 flex items-center gap-1.5"
            >
              Browse All Plans <ExternalLink size={14} />
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-extrabold transition-all border border-red-200 cursor-pointer shadow-xs"
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      </section>

      {/* MAIN TWO-COLUMN DASHBOARD LAYOUT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-grow w-full">
        {purchasedEvaluations.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-xs">
            <FileCheck size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-2xl font-black text-[#0a2968] mb-2">No Enrolled Evaluation Plans</h3>
            <p className="text-slate-500 font-semibold text-sm mb-6 max-w-md mx-auto">
              You haven't enrolled in any evaluation plan yet. Choose a plan to access test series PDFs and get line-by-line expert answer evaluation.
            </p>
            <Link
              to="/evaluation"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0a2968] hover:bg-[#EF961D] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
            >
              Browse Evaluation Plans <ArrowUpRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* ================= LEFT SIDEBAR: ENROLLED COURSES LIST ================= */}
            {/* On Mobile: Hidden when viewing course details in mobileViewMode === 'details' */}
            <div className={`lg:col-span-4 space-y-4 ${mobileViewMode === 'details' ? 'hidden lg:block' : 'block'}`}>
              <div className="flex items-center justify-between px-1 mb-2">
                <h2 className="text-xl font-black text-[#0a2968]">My Enrolled Courses</h2>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {purchasedEvaluations.length} Plans
                </span>
              </div>

              <div className="space-y-3">
                {purchasedEvaluations.map((course, idx) => {
                  const courseId = course._id || course.id;
                  const isSelected = selectedCourseId === courseId || (!selectedCourseId && idx === 0);
                  const testsCount = getCourseTests(course).length;

                  return (
                    <div
                      key={courseId}
                      onClick={() => {
                        setSelectedCourseId(courseId);
                        setMobileViewMode('details');
                      }}
                      className={`w-full text-left p-4.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between group ${
                        isSelected
                          ? "bg-white border-[#0a2968] shadow-md ring-2 ring-[#0a2968]/15"
                          : "bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white"
                      }`}
                    >
                      <div className="pr-3">
                        <span className="inline-block px-2.5 py-0.5 bg-blue-50 text-[#0a2968] font-bold text-[10px] rounded uppercase mb-1 border border-blue-100">
                          {course.paperTag || course.category || "GS Paper"}
                        </span>
                        <h3 className={`text-sm font-extrabold leading-snug line-clamp-2 ${isSelected ? "text-[#0a2968]" : "text-slate-700"}`}>
                          {course.title}
                        </h3>
                        <div className="text-[11px] font-bold text-slate-400 mt-1 flex items-center justify-between">
                          <span>{testsCount} Tests available</span>
                          <span className="text-[#0a2968] font-black lg:hidden inline-flex items-center gap-0.5">
                            Open Tests <ChevronRight size={13} />
                          </span>
                        </div>
                      </div>

                      <div className={`w-3.5 h-3.5 rounded-full shrink-0 border-2 transition-all ${
                        isSelected ? "bg-[#EF961D] border-[#0a2968] scale-110" : "border-slate-300 group-hover:border-slate-400"
                      }`} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ================= RIGHT MAIN PANEL: TEST SERIES & TOPICS ================= */}
            {/* On Mobile: Hidden when mobileViewMode === 'list' */}
            <div className={`lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 ${mobileViewMode === 'list' ? 'hidden lg:block' : 'block'}`}>
              
              {/* Mobile Back Button */}
              <div className="lg:hidden pb-2">
                <button
                  onClick={() => setMobileViewMode('list')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#0a2968] font-extrabold text-xs rounded-xl border border-slate-200 transition-all"
                >
                  <ArrowLeft size={15} /> Back to All Enrolled Courses List
                </button>
              </div>

              {/* Selected Course Header */}
              {selectedCourse && (
                <div className="space-y-6">
                  <div className="pb-6 border-b border-slate-100 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-2.5 py-1 bg-blue-50 text-[#0a2968] font-black text-xs rounded-lg uppercase border border-blue-100">
                          {selectedCourse.paperTag || selectedCourse.category || "GS Paper"}
                        </span>
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200">
                          Active Subscription
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-[#0a2968]">
                        {selectedCourse.title}
                      </h2>
                      <p className="text-slate-500 text-xs sm:text-sm font-semibold mt-1">
                        {selectedCourse.description}
                      </p>
                    </div>

                    <div className="text-xs font-bold text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200 shrink-0">
                      Total Tests: <strong className="text-[#0a2968] font-black">{getCourseTests(selectedCourse).length} Tests</strong>
                    </div>
                  </div>

                  {/* GENERAL / DEFAULT COURSE OVERVIEW PDF CARD (RIGHT BELOW DESCRIPTION LINE) */}
                  {(selectedCourse.planPdf || selectedCourse.pdfUrl) && (
                    <div className="mt-4 bg-gradient-to-r from-blue-50/90 via-slate-50 to-blue-50/50 border border-blue-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#0a2968] text-white flex items-center justify-center shrink-0 shadow-xs">
                            <FileText size={20} className="text-[#EF961D]" />
                          </div>
                          <div>
                            <span className="px-2 py-0.5 bg-blue-100 text-[#0a2968] font-extrabold text-[10px] rounded uppercase tracking-wider">
                              Course Overview Document
                            </span>
                            <h3 className="text-sm sm:text-base font-black text-[#0a2968] mt-0.5">
                              {selectedCourse.planPdfTitle || "Program Syllabus & Micro-Topics Overview PDF"}
                            </h3>
                            <p className="text-slate-500 text-xs font-semibold">
                              Read or download the program syllabus breakdown, recommended sources & structure map guide.
                            </p>
                          </div>
                        </div>

                        {/* PDF Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                          <button
                            type="button"
                            onClick={() => toggleInlinePdf("overview_pdf")}
                            className="px-3.5 py-2 bg-[#0a2968] hover:bg-[#12387a] text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                          >
                            <Eye size={15} className="text-[#EF961D]" />
                            {openInlinePdfs["overview_pdf"] ? "Hide PDF" : "View PDF"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePrintPdf(selectedCourse.planPdf || selectedCourse.pdfUrl)}
                            className="px-3 py-2 bg-white hover:bg-slate-100 text-[#0a2968] border border-slate-300 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                          >
                            <Printer size={15} /> Print
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadPdf(selectedCourse.planPdf || selectedCourse.pdfUrl, selectedCourse.planPdfTitle || selectedCourse.title)}
                            className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                          >
                            <Download size={15} /> Download
                          </button>
                        </div>
                      </div>

                      {/* PROPER INLINE EMBED PDF VIEWER */}
                      {openInlinePdfs["overview_pdf"] && (
                        <div className="pt-3 border-t border-blue-200/80 animate-in fade-in duration-200">
                          <div className="bg-slate-900 rounded-2xl p-2 h-[520px] shadow-inner">
                            <iframe
                              src={selectedCourse.planPdf || selectedCourse.pdfUrl}
                              title="Course Overview PDF Document"
                              className="w-full h-full rounded-xl border-0 bg-white"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Calculate Course Drip & Unlock Variables */}
                {(() => {
                  const isDayWiseCourse = selectedCourse?.isDayWiseSchedule || (selectedCourse?.tests && selectedCourse.tests.some(t => t.day !== undefined));
                  const purchaseDateStr = selectedCourse?.purchasedAt || selectedCourse?.createdAt || Date.now();
                  const purchaseDateObj = new Date(purchaseDateStr);
                  const nowObj = new Date();
                  const diffTimeMs = Math.max(0, nowObj.getTime() - purchaseDateObj.getTime());
                  const elapsedDays = Math.max(1, Math.floor(diffTimeMs / (1000 * 60 * 60 * 24)) + 1);

                  const rawTestsList = getCourseTests(selectedCourse);

                  const checkTestSubmitted = (testObj) => {
                    if (!selectedCourse || !testObj) return false;
                    const planId = selectedCourse._id || selectedCourse.id || selectedCourse.title;
                    const testId = testObj.id || testObj.testName || testObj.testTitle;
                    const compositeKey = `${planId}_${testId}`;
                    const uploadedSheet = uploadedAnswerSheets[compositeKey];

                    const userEmail = user?.email?.toLowerCase() || 'student@itopper.com';
                    const testTitleStr = testObj.testName || testObj.testTitle;
                    const personalCheckedCopy = evaluationResults.find(r => {
                      const rEmail = (r.studentEmail || '').toLowerCase();
                      const isTargetUser = rEmail === userEmail;
                      const isTargetTest = (r.testName && r.testName.toLowerCase() === testTitleStr.toLowerCase()) ||
                                           (r.planTitle && r.planTitle.toLowerCase().includes(selectedCourse.title.toLowerCase()));
                      return isTargetUser && isTargetTest;
                    });

                    return !!uploadedSheet || !!personalCheckedCopy;
                  };

                  const displayTestsList = isDayWiseCourse
                    ? [...rawTestsList].sort((a, b) => (a.day || 1) - (b.day || 1))
                    : [...rawTestsList].reverse();

                  const submittedCount = rawTestsList.filter(t => checkTestSubmitted(t)).length;
                  const totalDaysCount = selectedCourse?.totalDays || rawTestsList.length || 30;

                  return (
                    <div className="space-y-6 pt-2">
                      {/* 30-DAY DRIP COURSE PROGRESS TRACKER BANNER (BRAND THEME COLOR SYSTEM) */}
                      {isDayWiseCourse && (
                        <div className="bg-gradient-to-r from-[#0a2968] via-[#0f3482] to-[#0a2968] rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-[#0a2968]/50 space-y-5 relative overflow-hidden">
                          {/* Glow accent */}
                          <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#EF961D]/15 rounded-full blur-3xl pointer-events-none" />

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="px-3 py-1 bg-white/10 backdrop-blur-md text-[#EF961D] font-semibold text-[11px] rounded-full uppercase tracking-wider flex items-center gap-1.5 border border-[#EF961D]/30">
                                  <Sparkles size={13} className="text-[#EF961D]" /> 30-Day Sequential Drip Plan
                                </span>
                                <span className="px-3 py-1 bg-[#EF961D] text-[#0a2968] font-semibold text-[11px] rounded-full uppercase shadow-xs">
                                  Today is Day {elapsedDays}
                                </span>
                              </div>
                              <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white leading-tight">
                                Day-Wise Answer Writing & Daily Challenge Tracker
                              </h3>
                              <p className="text-slate-200 text-xs font-semibold mt-1.5">
                                Plan Purchase Date: <strong className="text-white font-semibold">{purchaseDateObj.toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</strong> • Day 1 = Purchase Date
                              </p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-right shrink-0 shadow-sm">
                              <div className="text-3xl font-semibold text-white">{submittedCount} / {totalDaysCount}</div>
                              <div className="text-[11px] font-semibold text-[#EF961D] uppercase tracking-wider mt-0.5">Days Completed</div>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-1.5 relative z-10">
                            <div className="flex justify-between text-xs font-semibold text-slate-200">
                              <span>Completion Progress</span>
                              <span className="text-[#EF961D]">{Math.round((submittedCount / Math.max(1, totalDaysCount)) * 100)}% Submitted</span>
                            </div>
                            <div className="w-full h-3.5 bg-black/30 rounded-full overflow-hidden p-0.5 border border-white/20">
                              <div
                                className="h-full bg-gradient-to-r from-[#EF961D] to-[#f7b750] rounded-full transition-all duration-500 shadow-xs"
                                style={{ width: `${Math.min(100, Math.round((submittedCount / Math.max(1, totalDaysCount)) * 100))}%` }}
                              />
                            </div>
                          </div>

                          <div className="text-xs font-semibold text-slate-100 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 flex items-center gap-2.5 relative z-10">
                            <ShieldAlert size={18} className="text-[#EF961D] shrink-0" />
                            <span>
                              <strong>Sequential Unlock Rule:</strong> Day 1 is unlocked today. Day 2 unlocks ONLY after Day 1 answer sheet is submitted AND Day 2 date arrives.
                            </span>
                          </div>
                        </div>
                      )}

                      {/* LIST OF TESTS INSIDE SELECTED COURSE */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="text-base font-semibold text-[#0a2968]">
                              {isDayWiseCourse
                                ? `30-Day Day-wise Content & Tests (${displayTestsList.length} Days)`
                                : `Test Series & Answer Submissions (${displayTestsList.length} Tests)`}
                            </h3>
                            <p className="text-xs text-slate-400 font-semibold">
                              {isDayWiseCourse
                                ? "Day 1 available on purchase date. Day 2 unlocks after Day 1 submission!"
                                : "Click any paper/test to view question PDF, upload answer scan, and check evaluated copies"}
                            </p>
                          </div>
                          <span className="text-[11px] font-bold text-[#0a2968] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 shrink-0">
                            {isDayWiseCourse ? "Day 1 to 30 Sequence" : "Latest Test First"}
                          </span>
                        </div>

                        {displayTestsList.map((test, index) => {
                          const planId = selectedCourse._id || selectedCourse.id || selectedCourse.title;
                          const testId = test.id || test.testName || test.testTitle;
                          const compositeKey = `${planId}_${testId}`;
                          const uploadedSheet = uploadedAnswerSheets[compositeKey];

                          const dayNum = test.day || (index + 1);
                          const isDayArrived = elapsedDays >= dayNum;
                          const allPreviousSubmitted = isDayWiseCourse
                            ? displayTestsList.slice(0, index).every(prevTest => checkTestSubmitted(prevTest))
                            : true;

                          const isUnlocked = !isDayWiseCourse || (index === 0) || (isDayArrived && allPreviousSubmitted);

                          // Accordion expand state (default index 0 expanded)
                          const isExpanded = openTestAccordions[testId] !== undefined ? openTestAccordions[testId] : (index === 0);
                          const toggleAccordion = () => {
                            if (!isUnlocked) return;
                            setOpenTestAccordions(prev => ({
                              ...prev,
                              [testId]: !isExpanded
                            }));
                          };

                          // Unique viewer state keys
                          const qPdfKey = `q_pdf_${testId}`;
                          const checkedPdfKey = `checked_pdf_${testId}`;
                          const modelPdfKey = `model_pdf_${testId}`;

                          const userEmail = user?.email?.toLowerCase() || 'student@itopper.com';
                          const testTitleStr = test.testName || test.testTitle;

                          // 1. PERSONAL CHECKED COPY
                          const personalCheckedCopy = evaluationResults.find(r => {
                            const rEmail = (r.studentEmail || '').toLowerCase();
                            const isTargetUser = rEmail === userEmail;
                            const isTargetTest = (r.testName && r.testName.toLowerCase() === testTitleStr.toLowerCase()) ||
                                                 (r.planTitle && r.planTitle.toLowerCase().includes(selectedCourse.title.toLowerCase()));
                            return isTargetUser && isTargetTest;
                          });

                          // 2. COURSE MODEL ANSWER / RESULT
                          const courseModelResult = evaluationResults.find(r => {
                            const rEmail = (r.studentEmail || '').toLowerCase();
                            const isAllUser = rEmail === 'all' || rEmail === 'all_students';
                            const isTargetTest = (r.testName && r.testName.toLowerCase() === testTitleStr.toLowerCase()) ||
                                                 (r.planTitle && r.planTitle.toLowerCase().includes(selectedCourse.title.toLowerCase()));
                            return isAllUser && isTargetTest;
                          });

                          const questionPdf = test.questionPdf;

                          // LOCKED DAY CARD RENDERING (BRAND THEME ACCORDANT)
                          if (!isUnlocked) {
                            return (
                              <div
                                key={testId}
                                className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-5 space-y-3 relative overflow-hidden transition-all shadow-2xs"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  <div className="flex items-start gap-3">
                                    <span className="w-9 h-9 rounded-xl bg-slate-200 text-slate-500 font-black text-sm flex items-center justify-center shrink-0 border border-slate-300 shadow-2xs">
                                      <Lock size={16} className="text-slate-500" />
                                    </span>
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2.5 py-0.5 bg-[#0a2968]/10 text-[#0a2968] font-black text-[10px] rounded uppercase border border-[#0a2968]/15">
                                          Day {dayNum}
                                        </span>
                                        <span className="px-2.5 py-0.5 bg-[#EF961D]/15 text-[#b86b02] border border-[#EF961D]/30 font-black text-[10px] rounded-full flex items-center gap-1">
                                          <Lock size={11} /> Locked Day
                                        </span>
                                      </div>
                                      <h4 className="text-base font-extrabold text-slate-600 leading-snug">
                                        {testTitleStr}
                                      </h4>
                                      {test.textNote && (
                                        <p className="text-xs text-slate-500 font-semibold mt-1">
                                          {test.textNote}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="px-3.5 py-2 bg-slate-200/80 text-slate-700 border border-slate-300/80 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 self-start sm:self-center shadow-2xs">
                                    <AlertCircle size={14} className="text-[#EF961D] shrink-0" />
                                    <span>
                                      {!isDayArrived
                                        ? `Unlocks on Day ${dayNum} (${dayNum - elapsedDays} day(s) left)`
                                        : `Submit Day ${dayNum - 1} answer copy first`}
                                    </span>
                                  </div>
                                </div>

                                <div className="p-3 bg-slate-100/90 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-2">
                                  <span className="flex items-center gap-1.5">
                                    <Lock size={13} className="text-slate-500 shrink-0" />
                                    Question Paper PDF & Answer Copy Upload will unlock once Day {dayNum - 1} is submitted.
                                  </span>
                                  <button disabled className="px-4 py-1.5 bg-slate-300 text-slate-600 rounded-lg text-xs font-bold cursor-not-allowed shrink-0">
                                    Locked
                                  </button>
                                </div>
                              </div>
                            );
                          }

                          // UNLOCKED ACTIVE DAY CARD RENDERING
                          return (
                            <div
                              key={testId}
                              className={`bg-white border rounded-2xl transition-all duration-200 ${
                                isExpanded
                                  ? "border-[#0a2968]/50 shadow-md ring-1 ring-[#0a2968]/10 p-5 space-y-4"
                                  : "border-slate-200 hover:border-slate-300 p-4"
                              }`}
                            >
                              {/* Top Bar / Header Clickable Row */}
                              <div
                                onClick={toggleAccordion}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                              >
                                <div className="flex items-start gap-3">
                                  <span className="w-8 h-8 rounded-xl bg-slate-100 text-[#0a2968] font-black text-sm flex items-center justify-center shrink-0 border border-slate-200">
                                    {isDayWiseCourse ? `Day ${dayNum}` : `#${rawTestsList.length - index}`}
                                  </span>
                                  <div>
                                    <h4 className="text-base font-black text-slate-900 leading-snug hover:text-[#0a2968] transition-colors">
                                      {testTitleStr}
                                    </h4>
                                    <span className="text-[11px] font-semibold text-slate-400">
                                      {isDayWiseCourse ? `Day ${dayNum} Content & Answer Copy Upload` : "Paper / Test Details & Submissions"}
                                    </span>
                                  </div>
                                </div>

                                {/* Status Badges & Accordion Icon */}
                                <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                                  {personalCheckedCopy ? (
                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 font-extrabold text-xs rounded-full uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                                      <CheckCircle2 size={13} className="text-emerald-600" /> Evaluated ({personalCheckedCopy.score || 'Checked'})
                                    </span>
                                  ) : uploadedSheet ? (
                                    <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-300 font-extrabold text-xs rounded-full uppercase tracking-wider flex items-center gap-1">
                                      <Clock size={13} className="text-amber-600" /> Under Evaluation
                                    </span>
                                  ) : (
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 font-bold text-xs rounded-full uppercase tracking-wider">
                                      Not Submitted
                                    </span>
                                  )}

                                  <button
                                    type="button"
                                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-[#0a2968] rounded-lg transition-all"
                                    title={isExpanded ? "Collapse Details" : "Expand Details"}
                                  >
                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                  </button>
                                </div>
                              </div>

                              {/* EXPANDED CONTENT PANEL */}
                              {isExpanded && (
                                <div className="pt-2 border-t border-slate-100 space-y-4 animate-in fade-in duration-200">
                                  
                                  {/* DAY TEXT NOTE / INSTRUCTIONS IF ANY */}
                                  {test.textNote && (
                                    <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs font-semibold text-slate-700">
                                      <span className="font-extrabold text-[#0a2968] block mb-0.5">📌 Day {dayNum} Note & Guidance:</span>
                                      {test.textNote}
                                    </div>
                                  )}

                                  {/* ACTION BLOCK 1: QUESTION PAPER PDF */}
                                  <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200 space-y-3 text-xs font-semibold text-slate-700">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                      <div className="flex items-center gap-2">
                                        <FileText size={16} className="text-[#0a2968]" />
                                        <span className="font-extrabold text-slate-800">Question Paper PDF:</span>
                                      </div>

                                      {questionPdf ? (
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                          <button
                                            type="button"
                                            onClick={() => toggleInlinePdf(qPdfKey)}
                                            className="px-3 py-1.5 bg-[#0a2968] hover:bg-[#12387a] text-white rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                          >
                                            <Eye size={13} className="text-[#EF961D]" /> {openInlinePdfs[qPdfKey] ? "Hide Paper PDF" : "View Paper PDF"}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handlePrintPdf(questionPdf)}
                                            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-[#0a2968] border border-slate-300 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                                          >
                                            <Printer size={13} /> Print
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDownloadPdf(questionPdf, testTitleStr)}
                                            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                                          >
                                            <Download size={13} /> Download
                                          </button>
                                        </div>
                                      ) : (
                                        <span className="text-[11px] font-bold text-slate-400 italic">
                                          Question Paper PDF will be uploaded soon by faculty
                                        </span>
                                      )}
                                    </div>

                                    {/* INLINE QUESTION PDF VIEWER */}
                                    {questionPdf && openInlinePdfs[qPdfKey] && (
                                      <div className="pt-2 animate-in fade-in duration-200">
                                        <div className="bg-slate-900 rounded-xl p-2 h-[480px]">
                                          <iframe
                                            src={questionPdf}
                                            title="Question Paper PDF Document"
                                            className="w-full h-full rounded-lg border-0 bg-white"
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* ACTION BLOCK 2: ANSWER COPY UPLOAD */}
                                  <div className="p-3.5 bg-blue-50/40 rounded-xl border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold">
                                    {(() => {
                                      const isThisUploading = uploadingTestKey === compositeKey;

                                      if (uploadedSheet) {
                                        return (
                                          <div className="flex items-center justify-between w-full">
                                            <div>
                                              <span className="text-[#0a2968] font-extrabold block">✅ Your Submitted Answer Sheet:</span>
                                              <span className="text-slate-600 font-bold">{uploadedSheet.fileName} ({uploadedSheet.fileSize})</span>
                                              <div className="text-[10px] text-slate-400">Uploaded on {uploadedSheet.uploadedAt}</div>
                                            </div>
                                            <label className={`inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-[#0a2968] rounded-xl border border-slate-300 font-bold text-xs cursor-pointer transition-all shadow-2xs ${isThisUploading ? 'opacity-70 pointer-events-none' : ''}`}>
                                              {isThisUploading ? (
                                                <>
                                                  <Loader2 size={13} className="animate-spin text-[#EF961D]" /> Uploading...
                                                </>
                                              ) : (
                                                <>
                                                  <Upload size={13} /> Re-upload
                                                </>
                                              )}
                                              <input
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                disabled={isThisUploading}
                                                className="hidden"
                                                onChange={(e) => handleAnswerSheetUpload(selectedCourse, test, e)}
                                              />
                                            </label>
                                          </div>
                                        );
                                      }

                                      return (
                                        <div className="flex items-center justify-between w-full">
                                          <div>
                                            <span className="text-[#0a2968] font-extrabold block">Upload Handwritten Answer Copy:</span>
                                            <span className="text-slate-500 text-[11px]">
                                              {isDayWiseCourse
                                                ? `Scan Day ${dayNum} written answer sheet to PDF & upload to unlock Day ${dayNum + 1}`
                                                : "Scan your written answer sheet as PDF and upload here"}
                                            </span>
                                          </div>
                                          <label className={`inline-flex items-center gap-2 px-5 py-2.5 bg-[#0a2968] hover:bg-[#EF961D] text-white rounded-xl text-xs font-extrabold uppercase tracking-wider cursor-pointer transition-all shadow-xs shrink-0 ${isThisUploading ? 'opacity-75 pointer-events-none bg-[#0a2968]/80' : ''}`}>
                                            {isThisUploading ? (
                                              <>
                                                <Loader2 size={15} className="animate-spin text-[#EF961D]" /> Uploading Answer...
                                              </>
                                            ) : (
                                              <>
                                                <Upload size={14} /> Upload Answer (PDF)
                                              </>
                                            )}
                                            <input
                                              type="file"
                                              accept=".pdf,.jpg,.jpeg,.png"
                                              disabled={isThisUploading}
                                              className="hidden"
                                              onChange={(e) => handleAnswerSheetUpload(selectedCourse, test, e)}
                                            />
                                          </label>
                                        </div>
                                      );
                                    })()}
                                  </div>

                                  {/* ACTION BLOCK 3: PERSONAL CHECKED COPY */}
                                  {personalCheckedCopy && (
                                    <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-3">
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200/80 pb-3">
                                        <div>
                                          <span className="px-2.5 py-0.5 bg-emerald-700 text-white rounded text-[10px] font-black uppercase tracking-wider">
                                            🔐 Personal Evaluated Copy (Checked For You)
                                          </span>
                                          <div className="text-xs font-bold text-emerald-900 mt-1">
                                            Score: <strong className="text-emerald-950 font-black">{personalCheckedCopy.score}</strong> | Remarks: "{personalCheckedCopy.remarks}"
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                          <button
                                            onClick={() => toggleInlinePdf(checkedPdfKey)}
                                            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                                          >
                                            <Award size={14} /> {openInlinePdfs[checkedPdfKey] ? "Hide Checked Copy" : "View Checked Copy PDF"}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handlePrintPdf(personalCheckedCopy.resultPdf)}
                                            className="px-3 py-2 bg-white hover:bg-slate-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                                          >
                                            <Printer size={14} /> Print
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDownloadPdf(personalCheckedCopy.resultPdf, `${testTitleStr}_Personal_Checked`)}
                                            className="px-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                                          >
                                            <Download size={14} /> Download
                                          </button>
                                        </div>
                                      </div>

                                      {/* INLINE EVALUATED CHECKED COPY PDF VIEWER */}
                                      {openInlinePdfs[checkedPdfKey] && (
                                        <div className="pt-2 animate-in fade-in duration-200">
                                          <div className="bg-slate-900 rounded-xl p-2 h-[500px]">
                                            <iframe
                                              src={personalCheckedCopy.resultPdf}
                                              title="Personal Evaluated Answer Sheet PDF"
                                              className="w-full h-full rounded-lg border-0 bg-white"
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* ACTION BLOCK 4: COURSE-WIDE MODEL ANSWER / RESULT */}
                                  {courseModelResult && (
                                    <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-3">
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-200/80 pb-3">
                                        <div>
                                          <span className="px-2.5 py-0.5 bg-purple-700 text-white rounded text-[10px] font-black uppercase tracking-wider">
                                            🌐 Course Model Solution & Result (All Students)
                                          </span>
                                          <div className="text-xs font-bold text-purple-900 mt-1">
                                            Official Model Answer Framework & Benchmark Score: <strong className="text-purple-950 font-black">{courseModelResult.score}</strong>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                          <button
                                            onClick={() => toggleInlinePdf(modelPdfKey)}
                                            className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                                          >
                                            <Award size={14} /> {openInlinePdfs[modelPdfKey] ? "Hide Model PDF" : "View Model Answer PDF"}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handlePrintPdf(courseModelResult.resultPdf)}
                                            className="px-3 py-2 bg-white hover:bg-slate-100 text-purple-900 border border-purple-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                                          >
                                            <Printer size={14} /> Print
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDownloadPdf(courseModelResult.resultPdf, `${testTitleStr}_Model_Answer`)}
                                            className="px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                                          >
                                            <Download size={14} /> Download
                                          </button>
                                        </div>
                                      </div>

                                      {/* INLINE MODEL ANSWER PDF VIEWER */}
                                      {openInlinePdfs[modelPdfKey] && (
                                        <div className="pt-2 animate-in fade-in duration-200">
                                          <div className="bg-slate-900 rounded-xl p-2 h-[500px]">
                                            <iframe
                                              src={courseModelResult.resultPdf}
                                              title="Course Model Answer PDF"
                                              className="w-full h-full rounded-lg border-0 bg-white"
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                </div>
                              )}

                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
                </div>
              )}
            </div>

          </div>
        )}
      </main>

      {/* GLOBAL FOOTER */}
      <Footer />
    </div>
  );
};

export default StudentDashboard;