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
import { getEvaluations, DEFAULT_EVALUATIONS, getEvaluationResultsApi, submitAnswerSheetApi, getUserPurchasesApi } from '../utils/evaluationStorage';
import { getDailyMains } from '../utils/dailyMainsStorage';
import { uploadFileToCloudinary } from '../utils/uploadStorage';

const StudentDashboard = () => {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [purchasedEvaluations, setPurchasedEvaluations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [uploadedAnswerSheets, setUploadedAnswerSheets] = useState({});
  const [evaluationResults, setEvaluationResults] = useState([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadingTestKey, setUploadingTestKey] = useState(null);

  // Light-themed Toast state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

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

  // Load purchased evaluation plans for this student (Syncs MongoDB DB + Local Storage)
  const loadPurchasedEvaluations = async () => {
    setIsLoading(true);
    try {
      if (!user?.email) {
        setPurchasedEvaluations([]);
        return;
      }
      const userEmail = user.email.toLowerCase();
      const isDemoUser = user?.isDemo || user?.id === 'demo_student_fixed' || userEmail === 'demo@itopper.com' || userEmail === 'student@itopper.com' || userEmail.includes('demo');
      const userKey = `itopper_purchased_evals_${userEmail}`;

      const allEvals = await getEvaluations(true);
      const allDailyMains = await getDailyMains(true);
      const masterCatalog = [...allEvals, ...allDailyMains];

      if (isDemoUser) {
        // ALWAYS load all available courses for Demo Account so all plans & tests can be tested
        const demoEvals = masterCatalog.map((p, idx) => ({
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

      // 1. Fetch user's permanent enrollments & transactions from MongoDB database
      const dbPurchases = await getUserPurchasesApi(userEmail);
      const dbEnrollments = dbPurchases.enrollments || [];
      const dbTransactions = dbPurchases.transactions || [];

      let userEvals = JSON.parse(localStorage.getItem(userKey) || "[]");

      // Merge MongoDB enrollment records into userEvals
      dbEnrollments.forEach(enr => {
        const masterMatch = masterCatalog.find(
          m => String(m._id || m.id) === String(enr.courseId) || m.title === enr.courseName
        );
        if (masterMatch && !userEvals.some(u => String(u._id || u.id) === String(masterMatch._id || masterMatch.id) || u.title === masterMatch.title)) {
          userEvals.push({
            ...masterMatch,
            purchasedAt: enr.createdAt || new Date().toISOString(),
            receiptId: enr.paymentId || "REC-" + Math.floor(100000 + Math.random() * 900000)
          });
        }
      });

      // Merge MongoDB transaction records into userEvals
      dbTransactions.forEach(txn => {
        const masterMatch = masterCatalog.find(
          m => String(m._id || m.id) === String(txn.courseId) || m.title === txn.itemName
        );
        if (masterMatch && !userEvals.some(u => String(u._id || u.id) === String(masterMatch._id || masterMatch.id) || u.title === masterMatch.title)) {
          userEvals.push({
            ...masterMatch,
            purchasedAt: txn.createdAt || new Date().toISOString(),
            receiptId: txn.receipt || txn.paymentId || "REC-" + Math.floor(100000 + Math.random() * 900000)
          });
        }
      });

      // Merge latest test series updates & PDFs from master catalog
      const syncedEvals = userEvals.map(purchasedPlan => {
        const masterMatch = masterCatalog.find(
          m => String(m._id || m.id) === String(purchasedPlan._id || purchasedPlan.id) || m.title === purchasedPlan.title
        );
        if (masterMatch) {
          return {
            ...purchasedPlan,
            ...masterMatch,
            purchasedAt: purchasedPlan.purchasedAt,
            receiptId: purchasedPlan.receiptId
          };
        }
        return purchasedPlan;
      });

      localStorage.setItem(userKey, JSON.stringify(syncedEvals));
      setPurchasedEvaluations(syncedEvals);
      if (syncedEvals.length > 0 && !selectedCourseId) {
        setSelectedCourseId(syncedEvals[0]._id || syncedEvals[0].id);
      }
    } catch (e) {
      console.error("Error loading purchased evaluations:", e);
      setPurchasedEvaluations([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load uploaded answer sheets (keyed by `${planId}_${testId}`)
  const loadUploadedAnswerSheets = () => {
    try {
      const userEmail = user?.email?.toLowerCase() || 'student@itopper.com';
      const savedSheets = localStorage.getItem(`itopper_answer_sheets_${userEmail}`);
      let sheetsObj = savedSheets ? JSON.parse(savedSheets) : {};

      // Also merge any submissions stored in global "itopper_all_student_submissions"
      const allSubmissions = JSON.parse(localStorage.getItem("itopper_all_student_submissions") || "[]");
      allSubmissions.forEach(sub => {
        if (sub.studentEmail && sub.studentEmail.toLowerCase() === userEmail) {
          const key = `${sub.planId}_${sub.testId}`;
          if (!sheetsObj[key]) {
            sheetsObj[key] = sub;
          }
        }
      });

      setUploadedAnswerSheets(sheetsObj);
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

      showToast("Answer sheet uploaded & submitted!", "success");
    } catch (error) {
      console.error("Upload error:", error);
      showToast("Upload failed. Please try again.", "error");
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

  const [loadingPdfKey, setLoadingPdfKey] = useState(null);

  // View PDF Helper (Opens PDF in new tab with loading feedback)
  const handleViewPdf = (pdfUrl, btnKey) => {
    if (!pdfUrl) return;
    if (btnKey) setLoadingPdfKey(btnKey);
    try {
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setTimeout(() => setLoadingPdfKey(null), 600);
    }
  };

  // Download PDF Helper (100% Direct Disk Download across Cloudinary & CORS)
  const handleDownloadPdf = async (pdfUrl, fileName, btnKey) => {
    if (!pdfUrl) return;
    if (btnKey) setLoadingPdfKey(btnKey);

    const cleanName = ((fileName || 'Document').replace(/[^a-zA-Z0-9_-]/g, "_") || "Document") + "_iTopper.pdf";

    try {
      // 1. Cloudinary direct attachment download
      if (pdfUrl.includes("cloudinary.com") && pdfUrl.includes("/upload/")) {
        const attachmentUrl = pdfUrl.includes("/fl_attachment/")
          ? pdfUrl
          : pdfUrl.replace("/upload/", "/upload/fl_attachment/");
        
        const link = document.createElement("a");
        link.href = attachmentUrl;
        link.download = cleanName;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // 2. Fetch Blob method (for local files, blobs, data URIs, or CORS-enabled URLs)
      const response = await fetch(pdfUrl, { mode: 'cors' });
      if (!response.ok) throw new Error("HTTP error " + response.status);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = cleanName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 2000);
    } catch (err) {
      console.warn("Direct download fallback triggered:", err);
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.download = cleanName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setTimeout(() => setLoadingPdfKey(null), 800);
    }
  };

  // Print PDF Helper (Triggers Native Browser Print Dialog in SAME tab)
  const handlePrintPdf = async (pdfUrl, btnKey) => {
    if (!pdfUrl) return;
    if (btnKey) setLoadingPdfKey(btnKey);

    try {
      // Check if mobile browser where iframe printing is blocked
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        window.open(pdfUrl, '_blank');
        showToast("PDF opened! Click Download PDF if print fails.", "info");
        return;
      }

      let printFrame = document.getElementById("itopper-print-iframe");
      if (printFrame && document.body.contains(printFrame)) {
        document.body.removeChild(printFrame);
      }

      // Create hidden iframe & APPEND TO BODY FIRST so DOM events bind correctly
      printFrame = document.createElement("iframe");
      printFrame.id = "itopper-print-iframe";
      printFrame.style.position = "fixed";
      printFrame.style.right = "-9999px";
      printFrame.style.bottom = "-9999px";
      printFrame.style.width = "1px";
      printFrame.style.height = "1px";
      printFrame.style.border = "0";
      document.body.appendChild(printFrame);

      let printed = false;
      const doPrint = () => {
        if (printed) return;
        printed = true;
        try {
          printFrame.contentWindow.focus();
          printFrame.contentWindow.print();
        } catch (err) {
          console.error("Print iframe trigger error:", err);
          window.open(pdfUrl, '_blank');
        }
        setTimeout(() => {
          if (document.body.contains(printFrame)) {
            document.body.removeChild(printFrame);
          }
        }, 4000);
      };

      printFrame.onload = () => {
        setTimeout(doPrint, 300);
      };

      // Fetch blob or direct src, then set src to trigger onload
      let frameSrc = pdfUrl;
      try {
        const response = await fetch(pdfUrl, { mode: 'cors' });
        if (response.ok) {
          const blob = await response.blob();
          frameSrc = window.URL.createObjectURL(blob);
        }
      } catch (e) {
        console.warn("Blob fetch fallback for print:", e);
      }

      printFrame.src = frameSrc;

    } catch (err) {
      console.error("handlePrintPdf error:", err);
      window.open(pdfUrl, '_blank');
    } finally {
      setTimeout(() => setLoadingPdfKey(null), 1000);
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
          questionPdf: ""
        },
        {
          id: `${course._id || course.id || 'eval'}-t2`,
          testName: `Test 2: ${course.paperTag || 'GS Paper'} Applied & Diagram Practice Test`,
          testTitle: `Test 2: ${course.paperTag || 'GS Paper'} Applied & Diagram Practice Test`,
          questionPdf: ""
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
      <section className="bg-white border-b border-slate-200 pt-5 sm:pt-8 pb-5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0a2968] tracking-tight">
              Welcome, <span className="text-[#EF961D]">{user?.name ? user.name.split(' ')[0] : 'Aspirant'}</span> 👋🏻
            </h1>
            <p className="text-slate-500 text-xs font-semibold mt-1">
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
        {isLoading ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-xs flex flex-col items-center justify-center min-h-[350px] space-y-3 animate-in fade-in duration-200">
            <Loader2 size={36} className="animate-spin text-[#0a2968]" />
            <h3 className="text-base font-bold text-[#0a2968]">Loading Your Enrolled Courses...</h3>
            <p className="text-xs text-slate-400 font-medium">Synchronizing syllabus PDFs, test papers & evaluated copies</p>
          </div>
        ) : purchasedEvaluations.length === 0 ? (
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
            <div className={`lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-6 shadow-2xs space-y-5 ${mobileViewMode === 'list' ? 'hidden lg:block' : 'block'}`}>
              
              {/* Mobile Back Button */}
              <div className="lg:hidden pb-1">
                <button
                  onClick={() => setMobileViewMode('list')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#0a2968] font-bold text-xs rounded-lg border border-slate-200 transition-all"
                >
                  <ArrowLeft size={14} /> Back to Courses
                </button>
              </div>

              {/* Selected Course Header */}
              {selectedCourse && (
                <div className="space-y-5">
                  <div className="pb-4 border-b border-slate-100 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 bg-blue-50 text-[#0a2968] font-bold text-[10px] rounded uppercase border border-blue-100">
                            {selectedCourse.paperTag || selectedCourse.category || "GS Paper"}
                          </span>
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-full border border-emerald-200">
                            Active Subscription
                          </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-[#0a2968] leading-tight">
                          {selectedCourse.title}
                        </h2>
                        <p className="text-slate-500 text-xs font-medium mt-1">
                          {selectedCourse.description}
                        </p>
                      </div>

                      <div className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shrink-0 self-start sm:self-center">
                        Total: <strong className="text-[#0a2968] font-bold">{getCourseTests(selectedCourse).length} Papers</strong>
                      </div>
                    </div>

                    {/* GENERAL / DEFAULT COURSE OVERVIEW PDF BAR (CLEAN MINIMAL INLINE ROW) */}
                    {(selectedCourse.planPdf || selectedCourse.pdfUrl) && (
                      <div className="mt-3 bg-slate-50 rounded-xl border border-slate-200/80 p-3 text-xs space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText size={16} className="text-[#0a2968] shrink-0" />
                            <span className="font-bold text-slate-800 truncate">
                              {selectedCourse.planPdfTitle || "Program Syllabus & Micro-Topics Guide PDF"}
                            </span>
                          </div>

                          {/* PDF Action Buttons */}
                          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                            <button
                              type="button"
                              disabled={loadingPdfKey === "v_overview"}
                              onClick={() => handleViewPdf(selectedCourse.planPdf || selectedCourse.pdfUrl, "v_overview")}
                              className="px-2.5 py-1 bg-[#0a2968] hover:bg-[#12387a] text-white disabled:opacity-70 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                            >
                              {loadingPdfKey === "v_overview" ? (
                                <Loader2 size={12} className="animate-spin text-[#EF961D]" />
                              ) : (
                                <Eye size={12} className="text-[#EF961D]" />
                              )}
                              <span>View PDF</span>
                            </button>
                            <button
                              type="button"
                              disabled={loadingPdfKey === "p_overview"}
                              onClick={() => handlePrintPdf(selectedCourse.planPdf || selectedCourse.pdfUrl, "p_overview")}
                              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-[#0a2968] disabled:opacity-70 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              {loadingPdfKey === "p_overview" ? (
                                <Loader2 size={12} className="animate-spin text-[#0a2968]" />
                              ) : (
                                <Printer size={12} />
                              )}
                              <span>Print</span>
                            </button>
                            <button
                              type="button"
                              disabled={loadingPdfKey === "d_overview"}
                              onClick={() => handleDownloadPdf(selectedCourse.planPdf || selectedCourse.pdfUrl, selectedCourse.planPdfTitle || selectedCourse.title, "d_overview")}
                              className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 disabled:opacity-70 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              {loadingPdfKey === "d_overview" ? (
                                <Loader2 size={12} className="animate-spin text-slate-700" />
                              ) : (
                                <Download size={12} />
                              )}
                              <span>Download</span>
                            </button>
                          </div>
                        </div>

                        {/* INLINE EMBED PDF VIEWER */}
                        {openInlinePdfs["overview_pdf"] && (
                          <div className="pt-2 animate-in fade-in duration-200">
                            <div className="bg-slate-900 rounded-xl p-1.5 h-[360px] sm:h-[480px]">
                              <iframe
                                src={selectedCourse.planPdf || selectedCourse.pdfUrl}
                                title="Course Overview PDF Document"
                                className="w-full h-full rounded-lg border-0 bg-white"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Calculate Course Drip & Unlock Variables */}
                  {(() => {
                    const isDayWiseCourse = !!selectedCourse?.isDayWiseSchedule || selectedCourse?.category === 'Daily Mains';
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
                      const testTitleStr = (testObj.testName || testObj.testTitle || '').toLowerCase().trim();
                      const dayNum = testObj.day;

                      const personalCheckedCopy = evaluationResults.find(r => {
                        const rEmail = (r.studentEmail || '').toLowerCase();
                        const isTargetUser = rEmail === userEmail;
                        const rTestName = (r.testName || '').toLowerCase().trim();
                        if (!rTestName) return false;

                        const isMatchingTestName = (rTestName === testTitleStr || rTestName.includes(testTitleStr) || testTitleStr.includes(rTestName));
                        const isMatchingDay = dayNum && (rTestName.includes(`day ${dayNum}`) || rTestName.includes(`day-${dayNum}`) || rTestName === `day ${dayNum}`);

                        return isTargetUser && (isMatchingTestName || isMatchingDay);
                      });

                      return !!uploadedSheet || !!personalCheckedCopy;
                    };

                    const displayTestsList = isDayWiseCourse
                      ? [...rawTestsList].sort((a, b) => (a.day || 1) - (b.day || 1))
                      : [...rawTestsList].reverse();

                    const submittedCount = rawTestsList.filter(t => checkTestSubmitted(t)).length;
                    const totalDaysCount = selectedCourse?.totalDays || rawTestsList.length || 30;

                    return (
                      <div className="space-y-4 pt-1">
                        {/* SLEEK MINIMAL PROGRESS BAR (CLEAN MODERN TRACKER) */}
                        {isDayWiseCourse && (
                          <div className="bg-[#0a2968] text-white rounded-xl p-4 space-y-2.5 shadow-xs">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-white/10 text-[#EF961D] font-bold text-[10px] rounded uppercase border border-white/15">
                                  Today is Day {elapsedDays}
                                </span>
                                <span className="font-semibold text-slate-200">30-Day Drip Challenge Progress</span>
                              </div>
                              <span className="font-bold text-[#EF961D]">
                                {submittedCount} / {totalDaysCount} Days Submitted ({Math.round((submittedCount / Math.max(1, totalDaysCount)) * 100)}%)
                              </span>
                            </div>

                            <div className="w-full h-2.5 bg-black/30 rounded-full overflow-hidden p-0.5 border border-white/15">
                              <div
                                className="h-full bg-gradient-to-r from-[#EF961D] to-[#f7b750] rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, Math.round((submittedCount / Math.max(1, totalDaysCount)) * 100))}%` }}
                              />
                            </div>

                            <div className="text-[11px] text-slate-300 flex items-center gap-1.5 font-medium">
                              <ShieldAlert size={13} className="text-[#EF961D] shrink-0" />
                              <span>Day N unlocks after Day N-1 answer copy submission AND Day N date arrives.</span>
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
                                ? "Day 1 available on purchase date. Day 2 unlocks on Day 2 after Day 1 submission!"
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

                          // LOCKED DAY ROW RENDERING (ULTRA-MINIMAL & CLEAN 1-LINE ROW)
                          if (!isUnlocked) {
                            return (
                              <div
                                key={testId}
                                className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 transition-all text-xs"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className="w-7 h-7 rounded-lg bg-slate-200/80 text-slate-400 flex items-center justify-center shrink-0">
                                    <Lock size={14} />
                                  </span>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-400 text-[11px] shrink-0">
                                        Day {dayNum}
                                      </span>
                                      <h4 className="font-semibold text-slate-600 text-xs truncate">
                                        {testTitleStr}
                                      </h4>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center text-[11px] font-semibold text-slate-400">
                                  <span>
                                    {!isDayArrived
                                      ? `Unlocks Day ${dayNum} (${dayNum - elapsedDays}d left)`
                                      : `Requires Day ${dayNum - 1} submission`}
                                  </span>
                                  <span className="px-2 py-0.5 bg-slate-200/60 text-slate-500 rounded font-bold text-[10px]">
                                    Locked
                                  </span>
                                </div>
                              </div>
                            );
                          }

                          // UNLOCKED ACTIVE DAY CARD RENDERING (UN-BOXED & PROFESSIONAL)
                          return (
                            <div
                              key={testId}
                              className={`bg-white border rounded-xl transition-all duration-200 ${
                                isExpanded
                                  ? "border-[#0a2968]/40 shadow-xs ring-1 ring-[#0a2968]/10 p-4 space-y-4"
                                  : "border-slate-200/90 hover:border-slate-300 p-3.5"
                              }`}
                            >
                              {/* Accordion Header Clickable Row */}
                              <div
                                onClick={toggleAccordion}
                                className="flex items-center justify-between gap-3 cursor-pointer select-none"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className="w-8 h-8 rounded-lg bg-blue-50 text-[#0a2968] font-bold text-xs flex items-center justify-center shrink-0 border border-blue-100">
                                    {isDayWiseCourse ? `Day ${dayNum}` : `#${rawTestsList.length - index}`}
                                  </span>
                                  <div className="min-w-0">
                                    <h4 className="text-sm font-bold text-slate-900 truncate hover:text-[#0a2968] transition-colors">
                                      {testTitleStr}
                                    </h4>
                                    <span className="text-[11px] text-slate-400 font-medium hidden sm:inline-block">
                                      {isDayWiseCourse ? `Day ${dayNum} Content & Answer Submission` : "Test Details & Submissions"}
                                    </span>
                                  </div>
                                </div>

                                {/* Status Badges & Toggle */}
                                <div className="flex items-center gap-2 shrink-0">
                                  {personalCheckedCopy ? (
                                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px] rounded-full flex items-center gap-1">
                                      <CheckCircle2 size={12} className="text-emerald-600" /> Evaluated ({personalCheckedCopy.score || 'Checked'})
                                    </span>
                                  ) : uploadedSheet ? (
                                    <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[11px] rounded-full flex items-center gap-1">
                                      <Clock size={12} className="text-amber-600" /> Under Evaluation
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 font-bold text-[10px] rounded-full uppercase">
                                      Pending
                                    </span>
                                  )}

                                  <button
                                    type="button"
                                    className="p-1 bg-slate-100 hover:bg-slate-200 text-[#0a2968] rounded-md transition-all"
                                    title={isExpanded ? "Collapse Details" : "Expand Details"}
                                  >
                                    {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                                  </button>
                                </div>
                              </div>

                              {/* EXPANDED CONTENT PANEL (UN-BOXED CLEAN LAYOUT) */}
                              {isExpanded && (
                                <div className="pt-3 border-t border-slate-100 space-y-3.5 animate-in fade-in duration-200">
                                  
                                  {/* DAY TEXT NOTE / INSTRUCTIONS */}
                                  {test.textNote && (
                                    <div className="pl-3 border-l-2 border-[#0a2968] py-0.5 text-xs text-slate-600">
                                      <span className="font-bold text-[#0a2968]">Guidance: </span>
                                      {test.textNote}
                                    </div>
                                  )}

                                  {/* ROW 1: QUESTION PAPER PDF */}
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-1 border-b border-slate-100 text-xs">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <FileText size={15} className="text-[#0a2968] shrink-0" />
                                      <span className="font-bold text-slate-800">Question Paper PDF:</span>
                                    </div>

                                    {questionPdf ? (
                                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                                        <button
                                          type="button"
                                          disabled={loadingPdfKey === `v_q_${test.id}`}
                                          onClick={() => handleViewPdf(questionPdf, `v_q_${test.id}`)}
                                          className="px-2.5 py-1 bg-[#0a2968] hover:bg-[#12387a] text-white disabled:opacity-70 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                        >
                                          {loadingPdfKey === `v_q_${test.id}` ? (
                                            <Loader2 size={12} className="animate-spin text-[#EF961D]" />
                                          ) : (
                                            <Eye size={12} className="text-[#EF961D]" />
                                          )}
                                          <span>View PDF</span>
                                        </button>
                                        <button
                                          type="button"
                                          disabled={loadingPdfKey === `p_q_${test.id}`}
                                          onClick={() => handlePrintPdf(questionPdf, `p_q_${test.id}`)}
                                          className="px-2.5 py-1 bg-white hover:bg-slate-100 text-[#0a2968] disabled:opacity-70 border border-slate-300 rounded-lg font-semibold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                                        >
                                          {loadingPdfKey === `p_q_${test.id}` ? (
                                            <Loader2 size={12} className="animate-spin text-[#0a2968]" />
                                          ) : (
                                            <Printer size={12} />
                                          )}
                                          <span>Print</span>
                                        </button>
                                        <button
                                          type="button"
                                          disabled={loadingPdfKey === `d_q_${test.id}`}
                                          onClick={() => handleDownloadPdf(questionPdf, testTitleStr, `d_q_${test.id}`)}
                                          className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 disabled:opacity-70 rounded-lg font-semibold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                                        >
                                          {loadingPdfKey === `d_q_${test.id}` ? (
                                            <Loader2 size={12} className="animate-spin text-slate-700" />
                                          ) : (
                                            <Download size={12} />
                                          )}
                                          <span>Download</span>
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="text-[11px] font-medium text-slate-400 italic">
                                        Paper will be uploaded soon
                                      </span>
                                    )}
                                  </div>

                                  {/* INLINE QUESTION PDF VIEWER */}
                                  {questionPdf && openInlinePdfs[qPdfKey] && (
                                    <div className="pt-1 animate-in fade-in duration-200">
                                      <div className="bg-slate-900 rounded-xl p-1.5 h-[360px] sm:h-[460px]">
                                        <iframe
                                          src={questionPdf}
                                          title="Question Paper PDF Document"
                                          className="w-full h-full rounded-lg border-0 bg-white"
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {/* ROW 2: ANSWER COPY UPLOAD */}
                                  <div className="py-1 text-xs">
                                    {(() => {
                                      const isThisUploading = uploadingTestKey === compositeKey;

                                      if (uploadedSheet) {
                                        return (
                                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                                            <div className="min-w-0">
                                              <span className="text-[#0a2968] font-bold block truncate">✅ Submitted Answer Sheet:</span>
                                              <span className="text-slate-600 text-[11px] font-medium truncate block">{uploadedSheet.fileName}</span>
                                            </div>
                                            <label className={`inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-slate-100 text-[#0a2968] rounded-lg border border-slate-300 font-bold text-xs cursor-pointer transition-all shrink-0 ${isThisUploading ? 'opacity-70 pointer-events-none' : ''}`}>
                                              {isThisUploading ? (
                                                <Loader2 size={12} className="animate-spin text-[#EF961D]" />
                                              ) : (
                                                <Upload size={12} />
                                              )}
                                              <span>Re-upload PDF</span>
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
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 py-1">
                                          <div>
                                            <span className="text-slate-800 font-bold block">Upload Answer Copy:</span>
                                            <span className="text-slate-500 text-[11px]">
                                              Scan handwritten sheet to PDF & upload here
                                            </span>
                                          </div>
                                          <label className={`inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#0a2968] hover:bg-[#12387a] text-white rounded-lg text-xs font-bold cursor-pointer transition-all shadow-2xs shrink-0 ${isThisUploading ? 'opacity-75 pointer-events-none' : ''}`}>
                                            {isThisUploading ? (
                                              <>
                                                <Loader2 size={13} className="animate-spin text-[#EF961D]" /> Uploading...
                                              </>
                                            ) : (
                                              <>
                                                <Upload size={13} /> Upload Answer (PDF)
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

                                  {/* ROW 3: PERSONAL CHECKED COPY */}
                                  {personalCheckedCopy && (
                                    <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-xl space-y-2 text-xs">
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div>
                                          <span className="font-bold text-emerald-900 block">
                                            Evaluated Copy — Score: <strong className="text-emerald-950 font-black">{personalCheckedCopy.score}</strong>
                                          </span>
                                          <span className="text-[11px] text-emerald-800 italic block">
                                            "{personalCheckedCopy.remarks}"
                                          </span>
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                                          <button
                                            disabled={loadingPdfKey === `v_chk_${test.id}`}
                                            onClick={() => handleViewPdf(personalCheckedCopy.resultPdf, `v_chk_${test.id}`)}
                                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white disabled:opacity-70 rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                                          >
                                            {loadingPdfKey === `v_chk_${test.id}` ? (
                                              <Loader2 size={12} className="animate-spin text-[#EF961D]" />
                                            ) : (
                                              <Award size={12} />
                                            )}
                                            <span>View Checked PDF</span>
                                          </button>
                                          <button
                                            type="button"
                                            disabled={loadingPdfKey === `p_chk_${test.id}`}
                                            onClick={() => handlePrintPdf(personalCheckedCopy.resultPdf, `p_chk_${test.id}`)}
                                            className="px-2 py-1 bg-white hover:bg-slate-100 text-emerald-900 disabled:opacity-70 border border-emerald-300 rounded-lg text-xs font-semibold cursor-pointer"
                                          >
                                            {loadingPdfKey === `p_chk_${test.id}` ? (
                                              <Loader2 size={12} className="animate-spin text-emerald-900" />
                                            ) : (
                                              <Printer size={12} />
                                            )}
                                            <span>Print</span>
                                          </button>
                                          <button
                                            type="button"
                                            disabled={loadingPdfKey === `d_chk_${test.id}`}
                                            onClick={() => handleDownloadPdf(personalCheckedCopy.resultPdf, `${testTitleStr}_Personal_Checked`, `d_chk_${test.id}`)}
                                            className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 disabled:opacity-70 rounded-lg text-xs font-semibold cursor-pointer"
                                          >
                                            {loadingPdfKey === `d_chk_${test.id}` ? (
                                              <Loader2 size={12} className="animate-spin text-emerald-900" />
                                            ) : (
                                              <Download size={12} />
                                            )}
                                            <span>Download</span>
                                          </button>
                                        </div>
                                      </div>

                                      {/* INLINE EVALUATED CHECKED COPY PDF VIEWER */}
                                      {openInlinePdfs[checkedPdfKey] && (
                                        <div className="pt-1 animate-in fade-in duration-200">
                                          <div className="bg-slate-900 rounded-xl p-1.5 h-[360px] sm:h-[460px]">
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

                                  {/* ROW 4: COURSE MODEL ANSWER / RESULT */}
                                  {courseModelResult && (
                                    <div className="p-3 bg-purple-50/80 border border-purple-200/80 rounded-xl space-y-2 text-xs">
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div>
                                          <span className="font-bold text-purple-900 block">
                                            Official Model Solution & Benchmark Score: <strong className="text-purple-950 font-black">{courseModelResult.score}</strong>
                                          </span>
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                                          <button
                                            disabled={loadingPdfKey === `v_mdl_${test.id}`}
                                            onClick={() => handleViewPdf(courseModelResult.resultPdf, `v_mdl_${test.id}`)}
                                            className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white disabled:opacity-70 rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                                          >
                                            {loadingPdfKey === `v_mdl_${test.id}` ? (
                                              <Loader2 size={12} className="animate-spin text-[#EF961D]" />
                                            ) : (
                                              <Award size={12} />
                                            )}
                                            <span>View Model PDF</span>
                                          </button>
                                          <button
                                            type="button"
                                            disabled={loadingPdfKey === `p_mdl_${test.id}`}
                                            onClick={() => handlePrintPdf(courseModelResult.resultPdf, `p_mdl_${test.id}`)}
                                            className="px-2 py-1 bg-white hover:bg-slate-100 text-purple-900 disabled:opacity-70 border border-purple-300 rounded-lg text-xs font-semibold cursor-pointer"
                                          >
                                            {loadingPdfKey === `p_mdl_${test.id}` ? (
                                              <Loader2 size={12} className="animate-spin text-purple-900" />
                                            ) : (
                                              <Printer size={12} />
                                            )}
                                            <span>Print</span>
                                          </button>
                                          <button
                                            type="button"
                                            disabled={loadingPdfKey === `d_mdl_${test.id}`}
                                            onClick={() => handleDownloadPdf(courseModelResult.resultPdf, `${testTitleStr}_Model_Answer`, `d_mdl_${test.id}`)}
                                            className="px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-900 disabled:opacity-70 rounded-lg text-xs font-semibold cursor-pointer"
                                          >
                                            {loadingPdfKey === `d_mdl_${test.id}` ? (
                                              <Loader2 size={12} className="animate-spin text-purple-900" />
                                            ) : (
                                              <Download size={12} />
                                            )}
                                            <span>Download</span>
                                          </button>
                                        </div>
                                      </div>

                                      {/* INLINE MODEL ANSWER PDF VIEWER */}
                                      {openInlinePdfs[modelPdfKey] && (
                                        <div className="pt-1 animate-in fade-in duration-200">
                                          <div className="bg-slate-900 rounded-xl p-1.5 h-[360px] sm:h-[460px]">
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

      {/* LIGHT BRAND THEMED TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className={`bg-white border text-slate-800 shadow-xl rounded-xl px-4 py-3 flex items-center gap-2.5 max-w-xs sm:max-w-sm ${
            toast.type === 'error' ? 'border-red-200 bg-red-50/95 text-red-900' :
            toast.type === 'success' ? 'border-emerald-200 bg-emerald-50/95 text-emerald-950' :
            'border-blue-200 bg-blue-50/95 text-[#0a2968]'
          }`}>
            {toast.type === 'error' ? (
              <AlertCircle size={16} className="text-red-500 shrink-0" />
            ) : toast.type === 'success' ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            ) : (
              <Sparkles size={16} className="text-[#EF961D] shrink-0" />
            )}
            <span className="text-xs font-bold leading-tight">{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="p-1 hover:bg-black/5 rounded-md text-slate-400 hover:text-slate-600 ml-auto shrink-0 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* GLOBAL FOOTER */}
      <Footer />
    </div>
  );
};

export default StudentDashboard;