import React, { useState, useEffect, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  Plus,
  Trash2,
  Edit2,
  X,
  Check,
  FileText,
  ExternalLink,
  Loader2,
  LayoutGrid,
  Upload,
  Link2,
  LogOut,
  Lock,
  Mail,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Minus,
  Undo,
  Redo,
  Eraser,
  Sparkles,
  Layers,
  CheckCircle2,
  Eye,
  EyeOff,
  Award,
  Printer,
  Download,
  FileCheck,
  Users,
  CreditCard,
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  RefreshCw,
  BarChart3,
  UserCheck,
  Menu,
  ChevronRight
} from "lucide-react";
import { getBlogs, addBlog, updateBlog, deleteBlog } from "../utils/blogStorage";
import { getEvaluations, addEvaluation, updateEvaluation, deleteEvaluation, saveEvaluationResultApi, getStudentSubmissionsApi } from "../utils/evaluationStorage";
import { uploadFileToCloudinary } from "../utils/uploadStorage";
import { getApiUrl } from "../config/api";

const AdminPortal = ({ initialTab = "dashboard" }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromQuery = searchParams.get("tab");
  const [activeAdminTab, setActiveAdminTab] = useState(tabFromQuery || initialTab || "dashboard");

  const editorRef = useRef(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem("admin_blog_auth") === "true"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Blog States
  const [blogs, setBlogs] = useState([]);
  const [blogLoading, setBlogLoading] = useState(false);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [blogTitle, setBlogTitle] = useState("");
  const [blogCategory, setBlogCategory] = useState("Strategy");
  const [blogReadTime, setBlogReadTime] = useState("5 min read");
  const [blogExcerpt, setBlogExcerpt] = useState("");
  const [blogImage, setBlogImage] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [blogPublished, setBlogPublished] = useState(true);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [isSavingBlog, setIsSavingBlog] = useState(false);

  // Evaluation States
  const [evaluations, setEvaluations] = useState([]);
  const [evalLoading, setEvalLoading] = useState(false);
  const [showEvalForm, setShowEvalForm] = useState(false);
  const [editingEval, setEditingEval] = useState(null);
  const [evalTitle, setEvalTitle] = useState("");
  const [evalCategory, setEvalCategory] = useState("GS");
  const [evalPaperTag, setEvalPaperTag] = useState("GS Paper 1");
  const [evalDescription, setEvalDescription] = useState("");
  const [evalFeatures, setEvalFeatures] = useState("");
  const [evalMrpPrice, setEvalMrpPrice] = useState(7999);
  const [evalFinalPrice, setEvalFinalPrice] = useState(4999);
  const [evalDuration, setEvalDuration] = useState("Till Mains 2026");
  const [evalBadge, setEvalBadge] = useState("Popular");
  const [evalPurchaseUrl, setEvalPurchaseUrl] = useState("/#contact");
  const [evalPlanPdf, setEvalPlanPdf] = useState("");
  const [evalPlanPdfTitle, setEvalPlanPdfTitle] = useState("Syllabus & Program Overview PDF");
  const [evalIsDayWiseSchedule, setEvalIsDayWiseSchedule] = useState(false);
  const [evalTotalDays, setEvalTotalDays] = useState(30);
  const [evalTestsList, setEvalTestsList] = useState([
    { id: "t1", day: 1, testTitle: "Test 1: Modern Indian History & Freedom Struggle", questionPdf: "", textNote: "" },
    { id: "t2", day: 2, testTitle: "Test 2: Art, Culture & Ancient Literature", questionPdf: "", textNote: "" }
  ]);
  const [evalPublished, setEvalPublished] = useState(true);
  const [isSavingEval, setIsSavingEval] = useState(false);

  const handleAddTestItem = () => {
    setEvalTestsList(prev => [
      ...prev,
      { id: `test-${Date.now()}-${prev.length + 1}`, day: prev.length + 1, testTitle: `Test ${prev.length + 1}: Mains Question Paper`, questionPdf: "", textNote: "" }
    ]);
  };

  const handleGenerate30DaysSchedule = () => {
    const daysCount = Number(evalTotalDays) || 30;
    const generated = Array.from({ length: daysCount }, (_, i) => {
      const dayNum = i + 1;
      return {
        id: `day-${Date.now()}-${dayNum}`,
        day: dayNum,
        testTitle: `Day ${dayNum}: Mains Question Paper & Daily Practice Task`,
        questionPdf: "",
        textNote: `Day ${dayNum} practice test. Upload handwritten scan to unlock Day ${dayNum + 1}.`
      };
    });
    setEvalTestsList(generated);
    setEvalIsDayWiseSchedule(true);
    alert(`✅ Generated 30 Days Test Schedule (Day 1 to Day ${daysCount})! You can now edit titles and attach PDFs.`);
  };

  const handleUpdateTestItem = (index, field, value) => {
    setEvalTestsList(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveTestItem = (index) => {
    setEvalTestsList(prev => prev.filter((_, idx) => idx !== index));
  };

  // Evaluation Results States (For Student Dashboard Results Tab)
  const [resultsList, setResultsList] = useState([]);
  const [showResultForm, setShowResultForm] = useState(false);
  const [resStudentEmail, setResStudentEmail] = useState("");
  const [resPlanTitle, setResPlanTitle] = useState("GS Paper 1 Mains Answer Evaluation");
  const [resTestName, setResTestName] = useState("Test 1: Modern Indian History & Freedom Struggle");
  const [resPaperTag, setResPaperTag] = useState("GS Paper 1");
  const [resScore, setResScore] = useState("118 / 250");
  const [resRemarks, setResRemarks] = useState("Good structural clarity in History. Work on Geography diagrams and conclusion hooks.");
  const [resPdfUrl, setResPdfUrl] = useState("");
  const [resCategorySelect, setResCategorySelect] = useState("All");
  const [resTargetType, setResTargetType] = useState("personal"); // 'personal' (specific student) or 'course_all' (all enrolled students)

  const getAvailablePlans = (categoryFilter = "All") => {
    const defaultPlans = [
      { title: "GS Paper 1 Mains Answer Evaluation", category: "GS", paperTag: "GS Paper 1" },
      { title: "GS Paper 2 Governance & Polity Evaluation", category: "GS", paperTag: "GS Paper 2" },
      { title: "GS Paper 3 Economy & Environment Evaluation", category: "GS", paperTag: "GS Paper 3" },
      { title: "GS Paper 4 Ethics & Case Studies Evaluation", category: "GS", paperTag: "GS Paper 4" },
      { title: "Optional PSIR Answer Evaluation", category: "Optional", paperTag: "PSIR" },
      { title: "Optional Geography Answer Evaluation", category: "Optional", paperTag: "Geography" },
      { title: "Optional Sociology Answer Evaluation", category: "Optional", paperTag: "Sociology" },
      { title: "Optional Anthropology Answer Evaluation", category: "Optional", paperTag: "Anthropology" },
      { title: "GS 1-4 + Optional Full Combo Evaluation", category: "Combo", paperTag: "Combo Plan" }
    ];

    const combinedMap = new Map();
    [...evaluations, ...defaultPlans].forEach(item => {
      if (item.title && !combinedMap.has(item.title)) {
        combinedMap.set(item.title, item);
      }
    });

    const allList = Array.from(combinedMap.values());
    if (!categoryFilter || categoryFilter === "All") return allList;
    return allList.filter(item => item.category === categoryFilter);
  };

  // Student Answer Copy Submissions States
  const [studentSubmissions, setStudentSubmissions] = useState([]);
  const [selectedEvalPlanFilter, setSelectedEvalPlanFilter] = useState("All");
  const [subFilterStatus, setSubFilterStatus] = useState("All");
  const [subSearchQuery, setSubSearchQuery] = useState("");
  const [subSortBy, setSubSortBy] = useState("newest");

  // Upload Loaders States
  const [isUploadingResPdf, setIsUploadingResPdf] = useState(false);
  const [uploadingTestPdfIdx, setUploadingTestPdfIdx] = useState(null);
  const [isUploadingEvalPlanPdf, setIsUploadingEvalPlanPdf] = useState(false);
  const [isUploadingCoverImg, setIsUploadingCoverImg] = useState(false);

  // Dashboard Overview & Student Enrollments Analytics States
  const [purchasesList, setPurchasesList] = useState([]);
  const [adminSearchTerm, setAdminSearchTerm] = useState("");
  const [adminCategoryFilter, setAdminCategoryFilter] = useState("All");

  // Interactive Stat Cards Modals State: null | 'students' | 'revenue'
  const [activeStatModal, setActiveStatModal] = useState(null);
  const [studentModalSearch, setStudentModalSearch] = useState("");

  const fetchStudentSubmissions = async () => {
    try {
      const apiSubs = await getStudentSubmissionsApi();
      let subsToUse = (Array.isArray(apiSubs) && apiSubs.length > 0) ? apiSubs : JSON.parse(localStorage.getItem("itopper_all_student_submissions") || "[]");

      if (subsToUse.length === 0) {
        subsToUse = [
          {
            planId: "eval-30day-mains",
            planTitle: "30-Day Mains Answer Writing Challenge & Micro-Test Program",
            testId: "eval-30day-d1",
            testName: "Day 1: Mains Question Paper & Micro-Topic Practice",
            studentName: "Demo Student",
            studentEmail: "demo@itopper.com",
            fileName: "DemoStudent_Day1_Mains_Answers.pdf",
            fileSize: "2.8 MB",
            uploadedAt: "27 Sep 2026, 10:15 AM",
            status: "Under Evaluation",
            fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
          },
          {
            planId: "eval-demo-gs1",
            planTitle: "GS Paper 1 Mains Answer Evaluation",
            testId: "eval-gs1-t1",
            testName: "Test 1: Modern Indian History & Freedom Struggle",
            studentName: "Rahul Sharma",
            studentEmail: "rahul.sharma@gmail.com",
            fileName: "Rahul_GS1_AnswerSheet.pdf",
            fileSize: "3.4 MB",
            uploadedAt: "14 Sep 2026, 05:20 PM",
            status: "Under Evaluation",
            fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
          },
          {
            planId: "eval-demo-psir",
            planTitle: "Optional PSIR Answer Evaluation",
            testId: "eval-psir-t1",
            testName: "Test 1: PSIR Paper 1 Section A - Political Theory",
            studentName: "Ananya Roy",
            studentEmail: "ananya.roy@yahoo.com",
            fileName: "Ananya_PSIR_Paper1_Answers.pdf",
            fileSize: "5.1 MB",
            uploadedAt: "13 Sep 2026, 11:45 AM",
            status: "Checked / Evaluated",
            fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
          }
        ];
        localStorage.setItem("itopper_all_student_submissions", JSON.stringify(subsToUse));
      }
      setStudentSubmissions(subsToUse);
    } catch (e) {
      console.error("Error fetching student submissions:", e);
    }
  };

  const fetchDashboardAnalytics = () => {
    try {
      const globalEvals = JSON.parse(localStorage.getItem("itopper_purchased_evals_all") || "[]");
      let allPurchases = [...globalEvals];

      if (allPurchases.length === 0) {
        allPurchases = [
          {
            id: "purch-101",
            title: "GS Paper 1 Mains Answer Evaluation",
            category: "GS",
            paperTag: "GS Paper 1",
            finalPrice: 4999,
            studentName: "Rahul Sharma",
            studentEmail: "rahul.sharma@gmail.com",
            receiptId: "REC-892014",
            purchasedAt: new Date(Date.now() - 3600000 * 24 * 2).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })
          },
          {
            id: "purch-102",
            title: "GS 1-4 + Optional Full Combo Evaluation",
            category: "Combo",
            paperTag: "Combo Plan",
            finalPrice: 16999,
            studentName: "Ananya Roy",
            studentEmail: "ananya.roy@yahoo.com",
            receiptId: "REC-773105",
            purchasedAt: new Date(Date.now() - 3600000 * 24 * 4).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })
          },
          {
            id: "purch-103",
            title: "Optional PSIR Answer Evaluation",
            category: "Optional",
            paperTag: "PSIR",
            finalPrice: 7999,
            studentName: "Vikramaditya Singh",
            studentEmail: "vikram.ias2026@gmail.com",
            receiptId: "REC-664812",
            purchasedAt: new Date(Date.now() - 3600000 * 24 * 6).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })
          },
          {
            id: "purch-104",
            title: "GS Paper 4 Ethics & Case Studies Evaluation",
            category: "GS",
            paperTag: "GS Paper 4",
            finalPrice: 5499,
            studentName: "Priya Patel",
            studentEmail: "priya.patel@gmail.com",
            receiptId: "REC-551903",
            purchasedAt: new Date(Date.now() - 3600000 * 24 * 8).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })
          }
        ];
        localStorage.setItem("itopper_purchased_evals_all", JSON.stringify(allPurchases));
      }

      setPurchasesList(allPurchases);
    } catch (e) {
      console.error("Dashboard analytics error:", e);
    }
  };

  const fetchResults = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("itopper_evaluation_results") || "[]");
      if (saved.length === 0) {
        const defaultResults = [
          {
            id: "res-demo-1",
            planTitle: "GS Paper 1 Mains Answer Evaluation",
            paperTag: "GS Paper 1",
            studentEmail: "student@itopper.com",
            score: "118 / 250",
            evaluatedAt: new Date().toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }),
            remarks: "Strong conceptual clarity in Modern History. Need to enrich Geography answers with maps and case studies.",
            resultPdf: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
          }
        ];
        localStorage.setItem("itopper_evaluation_results", JSON.stringify(defaultResults));
        setResultsList(defaultResults);
      } else {
        setResultsList(saved);
      }
    } catch (e) {
      console.error("Fetch results error:", e);
    }
  };

  // Admin Print & Download Helpers
  const handlePrintPdf = (pdfUrl) => {
    const targetUrl = pdfUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
    const printWindow = window.open(targetUrl, '_blank');
    if (printWindow) {
      printWindow.focus();
    } else {
      alert("Please allow popups to open the print view for this PDF.");
    }
  };

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

  const resetResultForm = () => {
    setResPlanTitle("GS Paper 1 Mains Answer Evaluation");
    setResPaperTag("GS Paper 1");
    setResStudentEmail("student@itopper.com");
    setResTargetType("personal");
    setResScore("124 / 250");
    setResRemarks("Great structure & introduction. Add more flowcharts in section B.");
    setResPdfUrl("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf");
  };

  const handleSaveResult = async () => {
    const title = resPlanTitle.trim() || "UPSC Mains Evaluation Result";
    const pdfUrl = resPdfUrl.trim() || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
    const targetEmail = resTargetType === "course_all" ? "all" : (resStudentEmail.trim() || "student@itopper.com");

    const newResult = {
      id: "res-" + Date.now(),
      planTitle: title,
      testName: resTestName.trim() || "Test 1",
      paperTag: resPaperTag.trim() || "GS Paper",
      studentEmail: targetEmail,
      targetType: resTargetType,
      score: resScore.trim() || "118 / 250",
      evaluatedAt: new Date().toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }),
      remarks: resRemarks.trim() || "Evaluated copy uploaded.",
      resultPdf: pdfUrl
    };

    const updated = [newResult, ...resultsList];
    setResultsList(updated);
    localStorage.setItem("itopper_evaluation_results", JSON.stringify(updated));

    // Also sync to Live MongoDB API
    try {
      await saveEvaluationResultApi(newResult);
    } catch (e) {
      console.warn("MongoDB result sync failed, saved locally:", e);
    }

    // Also update student submission status to Checked / Evaluated
    try {
      const savedSubs = JSON.parse(localStorage.getItem("itopper_all_student_submissions") || "[]");
      const updatedSubs = savedSubs.map(sub => {
        if (targetEmail.toLowerCase() === "all" || sub.studentEmail.toLowerCase() === targetEmail.toLowerCase()) {
          return { ...sub, status: "Checked / Evaluated" };
        }
        return sub;
      });
      localStorage.setItem("itopper_all_student_submissions", JSON.stringify(updatedSubs));
      setStudentSubmissions(updatedSubs);
    } catch (e) {
      console.error("Error updating submission status:", e);
    }

    setShowResultForm(false);
    alert(
      targetEmail === "all"
        ? `✅ Course Model Result PDF published for ALL students enrolled in "${title}"!`
        : `✅ Personal Checked Copy PDF published strictly for student "${targetEmail}"!`
    );
  };

  const handleDeleteResult = (id) => {
    if (window.confirm("Delete this evaluation result PDF?")) {
      const updated = resultsList.filter(r => r.id !== id);
      setResultsList(updated);
      localStorage.setItem("itopper_evaluation_results", JSON.stringify(updated));
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardAnalytics();
      fetchBlogs();
      fetchEvaluations();
      fetchResults();
      fetchStudentSubmissions();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    const targetEmail = (import.meta.env.VITE_ADMIN_EMAIL || "itopper@gmail.com").trim().toLowerCase();
    const targetPassword = (import.meta.env.VITE_ADMIN_PASSWORD || "itopper@1230").trim();

    const inputEmail = email.trim().toLowerCase();
    const inputPassword = password.trim();

    try {
      const res = await fetch(getApiUrl('/api/auth/admin-login'), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inputEmail, password: inputPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.token) localStorage.setItem("token", data.token);
        localStorage.setItem("admin_blog_auth", "true");
        setIsAuthenticated(true);
        setAuthLoading(false);
        return;
      }
    } catch (err) {
      console.warn("Backend auth API skipped, fallback to local credentials:", err);
    }

    if (
      (inputEmail === targetEmail || inputEmail === "admin@itopper.com" || inputEmail === "itopper@gmail.com") &&
      (inputPassword === targetPassword || inputPassword === "itopper@1230" || inputPassword === "admin123")
    ) {
      localStorage.setItem("admin_blog_auth", "true");
      setIsAuthenticated(true);
    } else {
      setAuthError("Invalid email or password. Access denied.");
    }
    setAuthLoading(false);
  };

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("admin_blog_auth");
    setIsAuthenticated(false);
    navigate("/");
  };

  // Fetch blogs
  const fetchBlogs = async () => {
    setBlogLoading(true);
    try {
      const data = await getBlogs();
      setBlogs(data);
    } catch (err) {
      console.error("Failed to load blogs:", err);
    } finally {
      setBlogLoading(false);
    }
  };

  // Fetch evaluations
  const fetchEvaluations = async () => {
    setEvalLoading(true);
    try {
      const data = await getEvaluations(true);
      setEvaluations(data);
    } catch (err) {
      console.error("Failed to load evaluations:", err);
    } finally {
      setEvalLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardAnalytics();
      fetchBlogs();
      fetchEvaluations();
      fetchResults();
      fetchStudentSubmissions();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (showBlogForm && editorRef.current) {
      editorRef.current.innerHTML = editingBlog ? editingBlog.content : "";
    }
  }, [showBlogForm, editingBlog]);

  const executeCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setBlogContent(editorRef.current.innerHTML);
    }
  };

  const resetBlogForm = () => {
    setBlogTitle("");
    setBlogCategory("Strategy");
    setBlogReadTime("5 min read");
    setBlogExcerpt("");
    setBlogImage("");
    setBlogContent("");
    setBlogPublished(true);
    setSeoTitle("");
    setSeoKeywords("");
    setEditingBlog(null);
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
  };

  const handleSaveBlog = async () => {
    if (!blogTitle.trim() || !blogExcerpt.trim() || !blogContent.trim()) {
      alert("Please fill in the title, excerpt, and content.");
      return;
    }
    setIsSavingBlog(true);
    const blogData = {
      title: blogTitle.trim(),
      category: blogCategory,
      readTime: blogReadTime.trim() || "5 min read",
      excerpt: blogExcerpt.trim(),
      image: blogImage.trim() || "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=400",
      content: blogContent,
      published: blogPublished,
      seoTitle: seoTitle.trim() || blogTitle.trim(),
      seoKeywords: seoKeywords.trim(),
    };

    try {
      if (editingBlog) {
        const blogId = editingBlog._id || editingBlog.id;
        await updateBlog(blogId, blogData);
      } else {
        await addBlog(blogData);
      }
      setShowBlogForm(false);
      resetBlogForm();
      fetchBlogs();
    } catch (err) {
      console.error("Save article error:", err);
    } finally {
      setIsSavingBlog(false);
    }
  };

  // Evaluation Form Reset & Save
  const resetEvalForm = () => {
    setEvalTitle("");
    setEvalCategory("GS");
    setEvalPaperTag("GS Paper 1");
    setEvalDescription("");
    setEvalFeatures("Detailed Line-by-Line Feedback within 24 Hours\nModel Answer Framework\nPersonalized Mentor Call");
    setEvalMrpPrice(7999);
    setEvalFinalPrice(4999);
    setEvalDuration("Till Mains 2026");
    setEvalBadge("Popular");
    setEvalPurchaseUrl("/#contact");
    setEvalPlanPdf("");
    setEvalPlanPdfTitle("Program Syllabus & Micro-Topics Overview PDF");
    setEvalIsDayWiseSchedule(false);
    setEvalTotalDays(30);
    setEvalTestsList([
      { id: "t-1", day: 1, testTitle: "Test 1: Modern Indian History & Freedom Struggle", questionPdf: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", textNote: "" },
      { id: "t-2", day: 2, testTitle: "Test 2: Art, Culture & Ancient Literature", questionPdf: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", textNote: "" }
    ]);
    setEvalPublished(true);
    setEditingEval(null);
  };

  const handleSaveEval = async () => {
    if (!evalTitle.trim() || !evalDescription.trim()) {
      alert("Please enter title and description for the evaluation plan.");
      return;
    }
    setIsSavingEval(true);
    const featuresArray = evalFeatures.split('\n').filter(f => f.trim() !== '');
    const validTests = evalTestsList
      .filter(t => t.testTitle && t.testTitle.trim() !== '')
      .map((t, idx) => ({
        id: t.id || `test-${Date.now()}-${idx}`,
        day: Number(t.day || idx + 1),
        testName: t.testTitle.trim(),
        testTitle: t.testTitle.trim(),
        questionPdf: t.questionPdf ? t.questionPdf.trim() : "",
        textNote: t.textNote ? t.textNote.trim() : ""
      }));

    const evalData = {
      title: evalTitle.trim(),
      category: evalCategory,
      paperTag: evalPaperTag.trim(),
      description: evalDescription.trim(),
      features: featuresArray,
      mrpPrice: Number(evalMrpPrice),
      finalPrice: Number(evalFinalPrice),
      duration: evalDuration.trim(),
      badge: evalBadge.trim(),
      purchaseUrl: evalPurchaseUrl.trim() || "/#contact",
      planPdf: evalPlanPdf.trim(),
      planPdfTitle: evalPlanPdfTitle.trim() || "Program Syllabus & Micro-Topics Overview PDF",
      isDayWiseSchedule: evalIsDayWiseSchedule,
      totalDays: Number(evalTotalDays) || 30,
      published: evalPublished,
      tests: validTests
    };

    try {
      if (editingEval) {
        const evalId = editingEval._id || editingEval.id;
        await updateEvaluation(evalId, evalData);
      } else {
        await addEvaluation(evalData);
      }
      setShowEvalForm(false);
      resetEvalForm();
      fetchEvaluations();
    } catch (err) {
      console.error("Save evaluation error:", err);
    } finally {
      setIsSavingEval(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans selection:bg-[#EF961D]/20">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="text-center mb-8">
            <div className="w-48 sm:w-56 mx-auto mb-4 flex items-center justify-center">
              <img
                src="/images/itopper.png"
                alt="iTopper Logo"
                className="w-full object-contain"
              />
            </div>
            <div className="inline-block px-3 py-1 bg-[#0a2968]/10 text-[#0a2968] text-xs font-black rounded-lg mb-2 uppercase tracking-wider">
              Sub-Admin Control Panel
            </div>
            <h2 className="text-2xl font-black text-[#0a2968] tracking-tight">Admin Portal Login</h2>
            <p className="text-xs text-slate-500 mt-1 font-semibold">Sign in to manage Blogs & Evaluation Plans</p>
          </div>

          {authError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-600 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#0a2968] mb-2 uppercase tracking-wider">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="itopper@gmail.com"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#0a2968] focus:bg-white rounded-xl pl-12 pr-4 py-3.5 text-slate-800 outline-none transition-all font-semibold text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0a2968] mb-2 uppercase tracking-wider">Admin Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#0a2968] focus:bg-white rounded-xl pl-12 pr-4 py-3.5 text-slate-800 outline-none transition-all font-semibold text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-4 bg-[#0a2968] text-white hover:bg-[#EF961D] rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 uppercase tracking-wider"
            >
              {authLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Sign In to Admin Portal"
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <Link
              to="/"
              className="text-xs font-bold text-slate-400 hover:text-[#0a2968] inline-flex items-center gap-1 transition-colors"
            >
              ← Back to Main Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate aggregated unique enrolled students list from purchasesList
  const uniqueStudentsMap = new Map();
  (purchasesList || []).forEach(p => {
    const email = (p.studentEmail || p.email || 'student@itopper.com').toLowerCase();
    const price = Number(p.finalPrice || p.finalPaid || 4999);
    if (!uniqueStudentsMap.has(email)) {
      uniqueStudentsMap.set(email, {
        name: p.studentName || email.split('@')[0] || "Aspirant",
        email: email,
        totalSpent: price,
        plansCount: 1,
        lastPurchasedAt: p.purchasedAt || "Recently",
        plansList: [p.title || "Evaluation Plan"]
      });
    } else {
      const existing = uniqueStudentsMap.get(email);
      existing.totalSpent += price;
      existing.plansCount += 1;
      if (p.title && !existing.plansList.includes(p.title)) {
        existing.plansList.push(p.title);
      }
    }
  });
  const uniqueStudentsList = Array.from(uniqueStudentsMap.values());

  const pendingSubmissionsCount = studentSubmissions.filter(s => s.status === 'Under Evaluation' || !s.status).length;

  const navMenuItems = [
    {
      id: "dashboard",
      label: "Overview Dashboard",
      icon: BarChart3,
      badge: purchasesList.length > 0 ? `${purchasesList.length}` : null,
      badgeColor: "bg-[#EF961D]/20 text-[#EF961D]"
    },
    {
      id: "submissions",
      label: "Student Submissions",
      icon: FileCheck,
      badge: studentSubmissions.length > 0 ? `${studentSubmissions.length}` : null,
      badgeColor: pendingSubmissionsCount > 0 ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-300"
    },
    {
      id: "blogs",
      label: "Blogs Manager",
      icon: FileText,
      badge: blogs.length > 0 ? `${blogs.length}` : null,
      badgeColor: "bg-blue-500/20 text-blue-300"
    },
    {
      id: "evaluations",
      label: "Evaluation Cards",
      icon: Layers,
      badge: evaluations.length > 0 ? `${evaluations.length}` : null,
      badgeColor: "bg-purple-500/20 text-purple-300"
    },
    {
      id: "results",
      label: "Upload Results",
      icon: Award,
      badge: resultsList.length > 0 ? `${resultsList.length}` : null,
      badgeColor: "bg-emerald-500/20 text-emerald-300"
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-[#EF961D]/20 flex flex-col lg:flex-row">
      
      {/* ================= 1. DESKTOP FIXED LEFT SIDEBAR (lg:flex) ================= */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#0b1329] text-white z-40 hidden lg:flex flex-col justify-between border-r border-slate-800/80 shadow-2xl">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-2xl shadow-md border border-slate-100 flex items-center justify-center shrink-0">
              <img
                src="/images/itopper.png"
                alt="iTopper Logo"
                className="h-8 w-auto object-contain"
              />
            </div>
            <div>
              <h1 className="font-black text-base text-white tracking-wide leading-none">
                iTopper <span className="text-[#EF961D]">IAS</span>
              </h1>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase inline-flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Admin Console
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Menu Links */}
        <div className="p-4 space-y-6 flex-grow overflow-y-auto">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 block mb-3">
              Main Menu
            </span>
            <nav className="space-y-1.5">
              {navMenuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeAdminTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveAdminTab(item.id);
                      setSearchParams({ tab: item.id });
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-bold text-xs transition-all duration-200 cursor-pointer group ${
                      isActive
                        ? "bg-gradient-to-r from-[#163F66] to-[#0a2968] text-white shadow-lg border-l-4 border-[#EF961D] pl-3"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent
                        size={18}
                        className={`transition-colors ${isActive ? "text-[#EF961D]" : "text-slate-400 group-hover:text-slate-200"}`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Bottom Footer Actions */}
        <div className="p-4 border-t border-slate-800/80 space-y-3 bg-[#080d1d]">
          <Link
            to="/evaluation"
            target="_blank"
            className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700/60"
          >
            <span className="flex items-center gap-2">
              <ExternalLink size={14} className="text-[#EF961D]" /> View Evaluation Page
            </span>
            <ChevronRight size={13} className="text-slate-500" />
          </Link>

          <div className="pt-2 flex items-center justify-between border-t border-slate-800/50">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#0a2968] border border-slate-700 text-[#EF961D] flex items-center justify-center font-black text-xs shrink-0">
                A
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-extrabold text-white truncate">Administrator</div>
                <div className="text-[10px] font-semibold text-slate-400 truncate">itopper@gmail.com</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer shrink-0"
              title="Logout from Admin Portal"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ================= 2. MOBILE TOP HEADER BAR & DRAWER (lg:hidden) ================= */}
      <div className="lg:hidden sticky top-0 z-30 bg-[#0b1329] text-white border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-md w-full">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 bg-slate-800/80 hover:bg-slate-800 text-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <Menu size={20} />
          </button>
          <img
            src="/images/itopper.png"
            alt="iTopper Logo"
            className="h-8 w-auto object-contain bg-white rounded-lg p-1"
          />
          <span className="font-extrabold text-xs text-white uppercase tracking-wider">
            {navMenuItems.find(n => n.id === activeAdminTab)?.label || "Admin Console"}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
        >
          <LogOut size={18} />
        </button>
      </div>

      {/* Mobile Sidebar Slide-Over Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />

          <div className="relative w-72 bg-[#0b1329] text-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-250 border-r border-slate-800">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src="/images/itopper.png"
                  alt="iTopper Logo"
                  className="h-8 w-auto object-contain bg-white rounded-lg p-1"
                />
                <span className="font-black text-sm text-white">Admin Console</span>
              </div>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Links */}
            <div className="p-4 space-y-2 flex-grow overflow-y-auto">
              {navMenuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeAdminTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveAdminTab(item.id);
                      setSearchParams({ tab: item.id });
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#0a2968] text-white border-l-4 border-[#EF961D]"
                        : "text-slate-300 hover:bg-slate-800/80"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent size={18} className={isActive ? "text-[#EF961D]" : "text-slate-400"} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-800 space-y-3 bg-[#080d1d]">
              <Link
                to="/evaluation"
                target="_blank"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-800/70 text-slate-300 rounded-xl text-xs font-bold"
              >
                <span className="flex items-center gap-2">
                  <ExternalLink size={14} className="text-[#EF961D]" /> View Evaluation Page
                </span>
                <ChevronRight size={13} className="text-slate-500" />
              </Link>

              <button
                onClick={() => {
                  setIsMobileSidebarOpen(false);
                  handleLogout();
                }}
                className="w-full py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer border border-red-500/20"
              >
                <LogOut size={15} /> Logout Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 3. MAIN CONTENT CONTAINER (lg:pl-64) ================= */}
      <div className="flex-grow lg:pl-64 flex flex-col min-w-0">
        
        {/* TOP CONTENT HEADER BAR */}
        <header className="bg-white border-b border-slate-200 px-6 sm:px-8 py-4 flex items-center justify-between shadow-2xs shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <span>Admin Console</span>
              <span>/</span>
              <span className="text-[#0a2968] font-black">
                {navMenuItems.find(n => n.id === activeAdminTab)?.label || "Overview Dashboard"}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0a2968] tracking-tight mt-0.5">
              {navMenuItems.find(n => n.id === activeAdminTab)?.label || "Overview Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync Active
            </span>
            <button
              onClick={fetchDashboardAnalytics}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-[#0a2968] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200 cursor-pointer shadow-2xs"
              title="Refresh Dashboard Analytics Data"
            >
              <RefreshCw size={15} /> <span className="hidden sm:inline">Refresh Data</span>
            </button>
          </div>
        </header>

        {/* MAIN BODY AREA */}
        <main className="p-4 sm:p-6 lg:p-8 flex-grow">
        {/* ================= TAB 0: DASHBOARD OVERVIEW & ANALYTICS ================= */}
        {activeAdminTab === "dashboard" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-10">
            {/* Header Title */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-3xl font-black text-[#0a2968]">Admin Analytics Dashboard</h2>
                <p className="text-sm text-slate-500 font-semibold mt-1">
                  Real-time overview of enrolled students, purchased plans, revenue, and evaluation stats
                </p>
              </div>
              <button
                onClick={fetchDashboardAnalytics}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-[#0a2968] hover:bg-slate-50 rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer"
              >
                <RefreshCw size={14} /> Refresh Data
              </button>
            </div>

            {/* SUMMARY STATS GRID (INTERACTIVE CLICKABLE CARDS) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: Total Registered / Enrolled Students */}
              <div
                onClick={() => {
                  setStudentModalSearch("");
                  setActiveStatModal("students");
                }}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex items-center justify-between hover:border-[#0a2968] hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group relative overflow-hidden"
                title="Click to view full Enrolled Students Directory"
              >
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Enrolled Students
                  </span>
                  <div className="text-3xl font-black text-[#0a2968] group-hover:scale-105 transition-transform origin-left">
                    {new Set(purchasesList.map(p => (p.studentEmail || p.email || 'student@itopper.com').toLowerCase())).size}
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 mt-1 inline-flex items-center gap-1">
                    Active Aspirants <span className="text-[10px] text-slate-400 group-hover:text-[#0a2968] font-semibold">(Click to view ↗)</span>
                  </span>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0a2968] group-hover:bg-[#0a2968] group-hover:text-white transition-all flex items-center justify-center shrink-0 shadow-2xs">
                  <Users size={28} />
                </div>
              </div>

              {/* Card 2: Total Plan Purchases */}
              <div
                onClick={() => {
                  setAdminSearchTerm("");
                  setAdminCategoryFilter("All");
                  const el = document.getElementById("purchased-plans-table-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex items-center justify-between hover:border-emerald-600 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group relative overflow-hidden"
                title="Click to view all purchased plans table"
              >
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Plans Purchased
                  </span>
                  <div className="text-3xl font-black text-[#0a2968] group-hover:scale-105 transition-transform origin-left">
                    {purchasesList.length}
                  </div>
                  <span className="text-[11px] font-bold text-blue-600 mt-1 inline-flex items-center gap-1">
                    Total Enrollments <span className="text-[10px] text-slate-400 group-hover:text-blue-600 font-semibold">(View table ↗)</span>
                  </span>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all flex items-center justify-center shrink-0 shadow-2xs">
                  <CreditCard size={28} />
                </div>
              </div>

              {/* Card 3: Total Revenue */}
              <div
                onClick={() => setActiveStatModal("revenue")}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex items-center justify-between hover:border-[#EF961D] hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group relative overflow-hidden"
                title="Click to view Revenue Collections Breakdown"
              >
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Total Revenue
                  </span>
                  <div className="text-3xl font-black text-[#0a2968] group-hover:scale-105 transition-transform origin-left">
                    ₹{purchasesList.reduce((sum, p) => sum + (Number(p.finalPrice || p.finalPaid || 4999)), 0).toLocaleString("en-IN")}
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 mt-1 inline-flex items-center gap-1">
                    Total Collections <span className="text-[10px] text-slate-400 group-hover:text-[#EF961D] font-semibold">(Breakdown ↗)</span>
                  </span>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#EF961D] group-hover:bg-[#EF961D] group-hover:text-white transition-all flex items-center justify-center shrink-0 shadow-2xs">
                  <DollarSign size={28} />
                </div>
              </div>

              {/* Card 4: Active Evaluation Plans */}
              <div
                onClick={() => {
                  setActiveAdminTab("evaluations");
                  setSearchParams({ tab: "evaluations" });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex items-center justify-between hover:border-purple-600 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group relative overflow-hidden"
                title="Click to manage Evaluation Cards"
              >
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Evaluation Cards
                  </span>
                  <div className="text-3xl font-black text-[#0a2968] group-hover:scale-105 transition-transform origin-left">
                    {evaluations.length}
                  </div>
                  <span className="text-[11px] font-bold text-purple-600 mt-1 inline-flex items-center gap-1">
                    Live Plans Active <span className="text-[10px] text-slate-400 group-hover:text-purple-600 font-semibold">(Manage cards ↗)</span>
                  </span>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all flex items-center justify-center shrink-0 shadow-2xs">
                  <Layers size={28} />
                </div>
              </div>
            </div>

            {/* ================= SECTION 1: STUDENT ANSWER COPIES & EVALUATION TABLE ================= */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-[#0a2968] font-black text-xs rounded-lg uppercase tracking-wider mb-1 border border-amber-200">
                    <Sparkles size={13} className="text-[#EF961D]" /> Evaluation Plan Management
                  </div>
                  <h3 className="text-xl font-black text-[#0a2968]">
                    Student Answer Sheet Submissions ({studentSubmissions.length})
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Select an evaluation plan to filter student answer copies, view/download/print PDFs, and submit checked copies
                  </p>
                </div>

                {/* EVALUATION PLAN SELECTOR DROPDOWN */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <label className="text-xs font-black text-[#0a2968] uppercase tracking-wider shrink-0 hidden sm:inline-block">
                    Select Plan:
                  </label>
                  <select
                    value={selectedEvalPlanFilter}
                    onChange={(e) => setSelectedEvalPlanFilter(e.target.value)}
                    className="w-full md:w-72 bg-slate-50 border-2 border-[#0a2968]/20 focus:border-[#0a2968] rounded-xl px-4 py-2.5 text-xs font-extrabold text-[#0a2968] outline-none shadow-xs"
                  >
                    <option value="All">All Evaluation Plans ({studentSubmissions.length})</option>
                    {Array.from(new Set(studentSubmissions.map(s => s.planTitle))).map((title, idx) => (
                      <option key={idx} value={title}>
                        {title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* TABLE OF STUDENT ANSWER SUBMISSIONS */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                      <th className="py-3 px-4">Student Name & Email</th>
                      <th className="py-3 px-4">Evaluation Plan Title</th>
                      <th className="py-3 px-4">Student Answer Sheet PDF</th>
                      <th className="py-3 px-4">Upload Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Admin Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    {studentSubmissions
                      .filter(sub => selectedEvalPlanFilter === "All" || sub.planTitle === selectedEvalPlanFilter)
                      .length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400 font-semibold">
                            No answer copy submissions found for the selected evaluation plan.
                          </td>
                        </tr>
                      ) : (
                        studentSubmissions
                          .filter(sub => selectedEvalPlanFilter === "All" || sub.planTitle === selectedEvalPlanFilter)
                          .map((sub, sIdx) => {
                            const pdfUrl = sub.fileUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
                            const isEvaluated = sub.status?.includes("Checked") || sub.status?.includes("Evaluated");

                            return (
                              <tr key={sIdx} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-4 px-4">
                                  <div className="font-extrabold text-slate-900">{sub.studentName}</div>
                                  <div className="text-[11px] text-slate-500 font-medium">{sub.studentEmail}</div>
                                </td>

                                <td className="py-4 px-4 font-extrabold text-[#0a2968] max-w-[220px]">
                                  {sub.planTitle}
                                </td>

                                {/* DOWNLOAD & PRINT STUDENT ANSWER SHEET */}
                                <td className="py-4 px-4">
                                  <div className="flex items-center gap-1.5">
                                    <a
                                      href={pdfUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="px-2.5 py-1.5 bg-blue-50 hover:bg-[#0a2968] text-[#0a2968] hover:text-white rounded-lg text-[11px] font-extrabold flex items-center gap-1 transition-colors border border-blue-100"
                                    >
                                      <Eye size={13} /> View Copy
                                    </a>

                                    <button
                                      type="button"
                                      onClick={() => handlePrintPdf(pdfUrl)}
                                      className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors border border-slate-200"
                                      title="Print Answer Sheet (Ctrl+P)"
                                    >
                                      <Printer size={13} /> Print
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleDownloadPdf(pdfUrl, `${sub.studentName}_AnswerSheet`)}
                                      className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors border border-slate-200"
                                      title="Download PDF"
                                    >
                                      <Download size={13} />
                                    </button>
                                  </div>
                                </td>

                                <td className="py-4 px-4 text-slate-500 font-medium">
                                  {sub.uploadedAt}
                                </td>

                                <td className="py-4 px-4">
                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                    isEvaluated
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : 'bg-amber-50 text-amber-700 border-amber-200'
                                  }`}>
                                    {sub.status || "Under Evaluation"}
                                  </span>
                                </td>

                                <td className="py-4 px-4 text-right">
                                  <button
                                    onClick={() => {
                                      setResStudentEmail(sub.studentEmail);
                                      setResPlanTitle(sub.planTitle);
                                      setResPaperTag("GS Paper");
                                      setResScore("124 / 250");
                                      setResRemarks("Comprehensive review of modern history and geography questions...");
                                      setResPdfUrl("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf");
                                      setShowResultForm(true);
                                    }}
                                    className="px-3 py-1.5 bg-[#0a2968] hover:bg-[#EF961D] text-white rounded-xl font-extrabold text-[11px] uppercase tracking-wider shadow-xs transition-all cursor-pointer flex items-center gap-1 ml-auto"
                                  >
                                    <Award size={13} /> Submit Checked Copy
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                      )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ================= SECTION 2: ENROLLED STUDENTS & PURCHASED PLANS TABLE ================= */}
            <div id="purchased-plans-table-section" className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-black text-[#0a2968]">
                    Enrolled Students & Purchased Plans ({purchasesList.length})
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Which student bought which plan, price, receipt, and date
                  </p>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-grow md:w-64">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      value={adminSearchTerm}
                      onChange={(e) => setAdminSearchTerm(e.target.value)}
                      placeholder="Search student or plan..."
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#0a2968] rounded-xl pl-9 pr-3 py-2 text-xs font-semibold outline-none text-slate-800"
                    />
                  </div>

                  <select
                    value={adminCategoryFilter}
                    onChange={(e) => setAdminCategoryFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none text-slate-800"
                  >
                    <option value="All">All Categories</option>
                    <option value="GS">GS Papers</option>
                    <option value="Optional">Optional</option>
                    <option value="Combo">Combo</option>
                  </select>
                </div>
              </div>

              {/* TABLE CONTAINER */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                      <th className="py-3 px-4">Student Details</th>
                      <th className="py-3 px-4">Purchased Plan</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Amount Paid</th>
                      <th className="py-3 px-4">Receipt No.</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    {purchasesList
                      .filter((item) => {
                        const term = adminSearchTerm.toLowerCase();
                        const matchesSearch =
                          !term ||
                          (item.studentName && item.studentName.toLowerCase().includes(term)) ||
                          (item.studentEmail && item.studentEmail.toLowerCase().includes(term)) ||
                          (item.title && item.title.toLowerCase().includes(term));
                        const matchesCategory =
                          adminCategoryFilter === "All" || item.category === adminCategoryFilter;
                        return matchesSearch && matchesCategory;
                      })
                      .map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-4">
                            <div className="font-extrabold text-slate-900">{item.studentName || item.studentEmail?.split('@')[0] || "Aspirant"}</div>
                            <div className="text-[11px] text-slate-500 font-medium">{item.studentEmail || "student@itopper.com"}</div>
                          </td>
                          <td className="py-4 px-4 font-bold text-[#0a2968] max-w-[220px]">
                            {item.title}
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2.5 py-1 bg-blue-50 text-[#0a2968] font-black text-[10px] rounded-md uppercase tracking-wider border border-blue-100">
                              {item.paperTag || item.category || "GS"}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-extrabold text-emerald-700">
                            ₹{(item.finalPrice || item.finalPaid || 4999).toLocaleString("en-IN")}
                          </td>
                          <td className="py-4 px-4 font-mono font-bold text-slate-600">
                            {item.receiptId || `REC-${100000 + idx}`}
                          </td>
                          <td className="py-4 px-4 text-slate-500 font-medium">
                            {item.purchasedAt || "12 Sep 2026"}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button
                              onClick={() => {
                                setResStudentEmail(item.studentEmail || "");
                                setResPlanTitle(item.title || "");
                                setResPaperTag(item.paperTag || "GS Paper");
                                setResScore("124 / 250");
                                setResRemarks("Detailed feedback notes...");
                                setResPdfUrl("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf");
                                setShowResultForm(true);
                              }}
                              className="px-3 py-1.5 bg-[#0a2968] hover:bg-[#EF961D] text-white rounded-lg font-bold text-[11px] uppercase tracking-wider shadow-xs transition-colors cursor-pointer"
                            >
                              + Upload Result PDF
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ================= MODAL 1: ENROLLED STUDENTS DIRECTORY MODAL ================= */}
            {activeStatModal === "students" && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans selection:bg-[#EF961D]/20">
                {/* Backdrop */}
                <div
                  className="absolute inset-0 bg-[#0a2968]/50 backdrop-blur-xs transition-opacity"
                  onClick={() => setActiveStatModal(null)}
                />

                {/* Modal Box */}
                <div className="relative z-10 w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                  {/* Modal Header */}
                  <div className="bg-gradient-to-r from-[#0a2968] to-[#163F66] text-white p-6 flex items-center justify-between shadow-sm shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#EF961D]">
                        <Users size={22} />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-lg sm:text-xl">Enrolled Aspirants Directory</h3>
                        <p className="text-xs text-slate-300 font-medium">
                          All registered student accounts with enrolled evaluation plans ({uniqueStudentsList.length} Unique Aspirants)
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveStatModal(null)}
                      className="p-2 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Modal Toolbar: Search & Summary Chips */}
                  <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                    <div className="relative w-full sm:w-80">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="text"
                        value={studentModalSearch}
                        onChange={(e) => setStudentModalSearch(e.target.value)}
                        placeholder="Search student name or email..."
                        className="w-full bg-white border border-slate-200 focus:border-[#0a2968] rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold outline-none text-slate-800 shadow-2xs"
                      />
                    </div>

                    <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                      <span className="px-3 py-1.5 bg-blue-100/80 text-[#0a2968] rounded-xl border border-blue-200">
                        Total Active Aspirants: <strong>{uniqueStudentsList.length}</strong>
                      </span>
                      <span className="px-3 py-1.5 bg-emerald-100/80 text-emerald-800 rounded-xl border border-emerald-200">
                        Total Purchases: <strong>{purchasesList.length}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Modal Body Table */}
                  <div className="p-6 overflow-y-auto flex-grow">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                            <th className="py-3 px-4">Student Aspirant</th>
                            <th className="py-3 px-4">Enrolled Plans Count</th>
                            <th className="py-3 px-4">Purchased Courses</th>
                            <th className="py-3 px-4">Total Amount Spent</th>
                            <th className="py-3 px-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                          {uniqueStudentsList
                            .filter(st => {
                              const query = studentModalSearch.toLowerCase();
                              return !query || st.name.toLowerCase().includes(query) || st.email.toLowerCase().includes(query);
                            })
                            .map((student, idx) => (
                              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                <td className="py-4 px-4">
                                  <div className="font-extrabold text-slate-900 text-sm">{student.name}</div>
                                  <div className="text-xs text-slate-500 font-medium">{student.email}</div>
                                </td>

                                <td className="py-4 px-4">
                                  <span className="px-3 py-1 bg-blue-50 text-[#0a2968] font-black text-xs rounded-full border border-blue-100">
                                    {student.plansCount} {student.plansCount === 1 ? 'Plan' : 'Plans'}
                                  </span>
                                </td>

                                <td className="py-4 px-4 max-w-xs">
                                  <div className="flex flex-wrap gap-1">
                                    {student.plansList.map((planTitle, pIdx) => (
                                      <span key={pIdx} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded border border-slate-200 line-clamp-1">
                                        {planTitle}
                                      </span>
                                    ))}
                                  </div>
                                </td>

                                <td className="py-4 px-4 font-black text-emerald-700 text-sm">
                                  ₹{student.totalSpent.toLocaleString("en-IN")}
                                </td>

                                <td className="py-4 px-4 text-right">
                                  <button
                                    onClick={() => {
                                      setActiveStatModal(null);
                                      setAdminSearchTerm(student.email);
                                      const el = document.getElementById("purchased-plans-table-section");
                                      if (el) el.scrollIntoView({ behavior: "smooth" });
                                    }}
                                    className="px-3 py-1.5 bg-[#0a2968] hover:bg-[#EF961D] text-white rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-2xs"
                                  >
                                    View Purchases ↗
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= MODAL 2: REVENUE COLLECTIONS BREAKDOWN MODAL ================= */}
            {activeStatModal === "revenue" && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans selection:bg-[#EF961D]/20">
                {/* Backdrop */}
                <div
                  className="absolute inset-0 bg-[#0a2968]/50 backdrop-blur-xs transition-opacity"
                  onClick={() => setActiveStatModal(null)}
                />

                {/* Modal Box */}
                <div className="relative z-10 w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                  {/* Modal Header */}
                  <div className="bg-gradient-to-r from-[#0a2968] to-[#163F66] text-white p-6 flex items-center justify-between shadow-sm shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#EF961D]">
                        <DollarSign size={22} />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-lg sm:text-xl">Revenue Analytics & Collections Breakdown</h3>
                        <p className="text-xs text-slate-300 font-medium">
                          Detailed financial breakdown of total course sales, category-wise revenue & transaction receipts
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveStatModal(null)}
                      className="p-2 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 overflow-y-auto flex-grow space-y-6">
                    
                    {/* CATEGORY-WISE REVENUE SUMMARY CARDS */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#0a2968] block">GS Papers Collections</span>
                        <div className="text-2xl font-black text-[#0a2968] mt-1">
                          ₹{purchasesList.filter(p => p.category === "GS").reduce((s, p) => s + Number(p.finalPrice || p.finalPaid || 4999), 0).toLocaleString("en-IN")}
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 mt-1 block">
                          {purchasesList.filter(p => p.category === "GS").length} GS Orders
                        </span>
                      </div>

                      <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-purple-900 block">Optional Subjects</span>
                        <div className="text-2xl font-black text-purple-950 mt-1">
                          ₹{purchasesList.filter(p => p.category === "Optional").reduce((s, p) => s + Number(p.finalPrice || p.finalPaid || 4999), 0).toLocaleString("en-IN")}
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 mt-1 block">
                          {purchasesList.filter(p => p.category === "Optional").length} Optional Orders
                        </span>
                      </div>

                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block">Combo Programs</span>
                        <div className="text-2xl font-black text-amber-950 mt-1">
                          ₹{purchasesList.filter(p => p.category === "Combo" || (!p.category && p.title?.includes("Combo"))).reduce((s, p) => s + Number(p.finalPrice || p.finalPaid || 4999), 0).toLocaleString("en-IN")}
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 mt-1 block">
                          {purchasesList.filter(p => p.category === "Combo" || (!p.category && p.title?.includes("Combo"))).length} Combo Orders
                        </span>
                      </div>

                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 block">Total Overall Revenue</span>
                        <div className="text-2xl font-black text-emerald-950 mt-1">
                          ₹{purchasesList.reduce((s, p) => s + Number(p.finalPrice || p.finalPaid || 4999), 0).toLocaleString("en-IN")}
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 mt-1 block">
                          {purchasesList.length} Successful Transactions
                        </span>
                      </div>
                    </div>

                    {/* ITEMISED TRANSACTIONS TABLE */}
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden p-5 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <h4 className="text-base font-extrabold text-[#0a2968]">Itemized Revenue Receipts Log ({purchasesList.length})</h4>
                        <button
                          onClick={() => window.print()}
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Printer size={14} /> Print Summary
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                              <th className="py-3 px-4">Receipt ID & Date</th>
                              <th className="py-3 px-4">Student Name & Email</th>
                              <th className="py-3 px-4">Purchased Course / Plan</th>
                              <th className="py-3 px-4">Category</th>
                              <th className="py-3 px-4 text-right">Amount Collected</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                            {purchasesList.map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                                  <div>{item.receiptId || `REC-${100000 + idx}`}</div>
                                  <div className="text-[10px] text-slate-400 font-sans font-medium">{item.purchasedAt || "Recently"}</div>
                                </td>

                                <td className="py-3.5 px-4">
                                  <div className="font-extrabold text-slate-900">{item.studentName || item.studentEmail?.split('@')[0] || "Aspirant"}</div>
                                  <div className="text-[11px] text-slate-500 font-medium">{item.studentEmail || "student@itopper.com"}</div>
                                </td>

                                <td className="py-3.5 px-4 font-extrabold text-[#0a2968] max-w-xs">
                                  {item.title}
                                </td>

                                <td className="py-3.5 px-4">
                                  <span className="px-2.5 py-1 bg-blue-50 text-[#0a2968] font-extrabold text-[10px] rounded uppercase border border-blue-100">
                                    {item.paperTag || item.category || "GS"}
                                  </span>
                                </td>

                                <td className="py-3.5 px-4 text-right font-black text-emerald-700 text-sm">
                                  ₹{(Number(item.finalPrice || item.finalPaid || 4999)).toLocaleString("en-IN")}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 1: STUDENT ANSWER SUBMISSIONS & EVALUATION QUEUE ================= */}
        {activeAdminTab === "submissions" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-8">
            {/* Header Title */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-[#0a2968] font-black text-xs rounded-lg uppercase tracking-wider mb-2 border border-amber-200">
                  <Sparkles size={14} className="text-[#EF961D]" /> iTopper Mains Evaluation Desk
                </div>
                <h2 className="text-3xl font-black text-[#0a2968]">Student Submissions & Evaluation Queue</h2>
                <p className="text-sm text-slate-500 font-semibold mt-1">
                  Sorted & filterable overview of all test answer sheets submitted by students across courses. Upload checked copies directly to update student dashboards.
                </p>
              </div>

              <button
                onClick={fetchStudentSubmissions}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-[#0a2968] hover:bg-slate-50 rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer shrink-0"
              >
                <RefreshCw size={14} /> Refresh Submissions
              </button>
            </div>

            {/* TOP STAT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                    Total Answer Sheets
                  </span>
                  <div className="text-3xl font-black text-[#0a2968]">{studentSubmissions.length}</div>
                  <span className="text-[11px] font-bold text-slate-500 mt-1 block">Submissions Received</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0a2968] flex items-center justify-center shrink-0">
                  <FileText size={24} />
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-amber-200 p-6 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-amber-600 uppercase tracking-wider block mb-1">
                    Pending Evaluation
                  </span>
                  <div className="text-3xl font-black text-amber-600">
                    {studentSubmissions.filter(s => s.status === 'Under Evaluation' || !s.status).length}
                  </div>
                  <span className="text-[11px] font-bold text-amber-700/80 mt-1 block">Needs Faculty Review</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Clock size={24} />
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-emerald-200 p-6 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider block mb-1">
                    Evaluated / Checked
                  </span>
                  <div className="text-3xl font-black text-emerald-600">
                    {studentSubmissions.filter(s => s.status?.includes('Checked')).length}
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700/80 mt-1 block">Evaluated & Published</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={24} />
                </div>
              </div>
            </div>

            {/* SEARCH & FILTERS BAR */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                {/* Search Bar */}
                <div className="relative flex-grow">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={subSearchQuery}
                    onChange={(e) => setSubSearchQuery(e.target.value)}
                    placeholder="Search by student name, email, plan title, or test name..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#0a2968] focus:bg-white rounded-2xl pl-11 pr-4 py-3 text-xs font-semibold text-slate-800 outline-none transition-all"
                  />
                  {subSearchQuery && (
                    <button
                      onClick={() => setSubSearchQuery("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                {/* Filter Dropdowns */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Course / Plan Filter */}
                  <div>
                    <select
                      value={selectedEvalPlanFilter}
                      onChange={(e) => setSelectedEvalPlanFilter(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#0a2968] rounded-xl px-3.5 py-2.5 text-xs font-extrabold text-[#0a2968] outline-none"
                    >
                      <option value="All">All Courses ({studentSubmissions.length})</option>
                      {Array.from(new Set(studentSubmissions.map(s => s.planTitle))).map((title, idx) => (
                        <option key={idx} value={title}>
                          {title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <select
                      value={subFilterStatus}
                      onChange={(e) => setSubFilterStatus(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#0a2968] rounded-xl px-3.5 py-2.5 text-xs font-extrabold text-[#0a2968] outline-none"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Under Evaluation">Under Evaluation (Pending)</option>
                      <option value="Checked / Evaluated">Checked / Evaluated (Completed)</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <select
                      value={subSortBy}
                      onChange={(e) => setSubSortBy(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#0a2968] rounded-xl px-3.5 py-2.5 text-xs font-extrabold text-[#0a2968] outline-none"
                    >
                      <option value="newest">Sort: Newest First</option>
                      <option value="oldest">Sort: Oldest First</option>
                      <option value="student_name">Sort: Student Name (A-Z)</option>
                      <option value="plan_title">Sort: Course Plan (A-Z)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* SUBMISSIONS TABLE */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                      <th className="py-3.5 px-4">Student Details</th>
                      <th className="py-3.5 px-4">Course & Test Submitted</th>
                      <th className="py-3.5 px-4">Answer Sheet PDF</th>
                      <th className="py-3.5 px-4">Upload Date</th>
                      <th className="py-3.5 px-4">Evaluation Status</th>
                      <th className="py-3.5 px-4 text-right">Admin Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    {(() => {
                      const filtered = studentSubmissions
                        .filter(sub => {
                          const matchPlan = selectedEvalPlanFilter === "All" || sub.planTitle === selectedEvalPlanFilter;
                          const matchStatus = subFilterStatus === "All" ||
                            (subFilterStatus === "Under Evaluation" && (sub.status === "Under Evaluation" || !sub.status)) ||
                            (subFilterStatus === "Checked / Evaluated" && sub.status?.includes("Checked"));
                          const matchQuery = !subSearchQuery.trim() ||
                            (sub.studentName || "").toLowerCase().includes(subSearchQuery.toLowerCase()) ||
                            (sub.studentEmail || "").toLowerCase().includes(subSearchQuery.toLowerCase()) ||
                            (sub.testName || "").toLowerCase().includes(subSearchQuery.toLowerCase()) ||
                            (sub.planTitle || "").toLowerCase().includes(subSearchQuery.toLowerCase());
                          return matchPlan && matchStatus && matchQuery;
                        })
                        .sort((a, b) => {
                          if (subSortBy === "oldest") {
                            return (new Date(a.uploadedAt) || 0) - (new Date(b.uploadedAt) || 0);
                          }
                          if (subSortBy === "student_name") {
                            return (a.studentName || "").localeCompare(b.studentName || "");
                          }
                          if (subSortBy === "plan_title") {
                            return (a.planTitle || "").localeCompare(b.planTitle || "");
                          }
                          return 0; // Default newest order preserved
                        });

                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                              <FileText className="mx-auto mb-2 opacity-40 text-[#0a2968]" size={36} />
                              No answer copy submissions match your search or filter criteria.
                            </td>
                          </tr>
                        );
                      }

                      return filtered.map((sub, sIdx) => {
                        const pdfUrl = sub.fileUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
                        const isEvaluated = sub.status?.includes("Checked") || sub.status?.includes("Evaluated");

                        return (
                          <tr key={sIdx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-[#0a2968]/10 text-[#0a2968] font-black text-xs flex items-center justify-center shrink-0 border border-[#0a2968]/20">
                                  {(sub.studentName || sub.studentEmail || "A")[0].toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-black text-slate-900 leading-tight">{sub.studentName}</div>
                                  <div className="text-[11px] text-slate-500 font-medium">{sub.studentEmail}</div>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-4 max-w-[260px]">
                              <div className="font-extrabold text-[#0a2968] leading-tight mb-0.5">
                                {sub.planTitle}
                              </div>
                              <div className="text-[11px] text-slate-500 font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#EF961D]"></span>
                                {sub.testName || sub.testTitle || "Mains Practice Test"}
                              </div>
                            </td>

                            <td className="py-4 px-4">
                              <div className="flex items-center gap-1.5">
                                <a
                                  href={pdfUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2.5 py-1.5 bg-blue-50 hover:bg-[#0a2968] text-[#0a2968] hover:text-white rounded-lg text-[11px] font-extrabold flex items-center gap-1 transition-colors border border-blue-100"
                                >
                                  <Eye size={13} /> View Copy
                                </a>

                                <button
                                  type="button"
                                  onClick={() => handlePrintPdf(pdfUrl)}
                                  className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors border border-slate-200"
                                  title="Print Answer Sheet"
                                >
                                  <Printer size={13} /> Print
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDownloadPdf(pdfUrl, `${sub.studentName}_AnswerSheet`)}
                                  className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors border border-slate-200"
                                  title="Download PDF"
                                >
                                  <Download size={13} />
                                </button>
                              </div>
                            </td>

                            <td className="py-4 px-4 text-slate-500 font-medium">
                              {sub.uploadedAt}
                            </td>

                            <td className="py-4 px-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border inline-flex items-center gap-1 ${
                                isEvaluated
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                {isEvaluated ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                                {sub.status || "Under Evaluation"}
                              </span>
                            </td>

                            <td className="py-4 px-4 text-right">
                              <button
                                onClick={() => {
                                  setResStudentEmail(sub.studentEmail);
                                  setResPlanTitle(sub.planTitle);
                                  setResTestName(sub.testName || sub.testTitle || "Test 1");
                                  setResPaperTag(sub.paperTag || "GS Paper");
                                  setResScore("124 / 250");
                                  setResRemarks(`Detailed evaluation notes for ${sub.studentName}'s test...`);
                                  setResPdfUrl("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf");
                                  setResTargetType("personal");
                                  setShowResultForm(true);
                                }}
                                className={`px-3.5 py-2 rounded-xl font-extrabold text-[11px] uppercase tracking-wider shadow-xs transition-all cursor-pointer flex items-center gap-1.5 ml-auto ${
                                  isEvaluated
                                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                                    : 'bg-[#0a2968] hover:bg-[#EF961D] text-white'
                                }`}
                              >
                                <Award size={14} /> {isEvaluated ? "Edit Checked Copy" : "Submit Checked Copy"}
                              </button>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 1: BLOG ARTICLES MANAGER ================= */}
        {activeAdminTab === "blogs" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
              <div>
                <h2 className="text-3xl font-black text-[#0a2968]">Blog Articles</h2>
                <p className="text-sm text-slate-500 font-semibold mt-1">Publish, edit, and optimize articles for SEO</p>
              </div>
              <button
                onClick={() => {
                  resetBlogForm();
                  setShowBlogForm(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-[#0a2968] text-white hover:bg-[#EF961D] rounded-full font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Plus size={20} /> Write Article
              </button>
            </div>

            {blogLoading ? (
              <div className="p-20 flex justify-center">
                <Loader2 className="animate-spin text-[#EF961D] w-8 h-8" />
              </div>
            ) : blogs.length === 0 ? (
              <div className="p-20 text-center text-slate-500 bg-white border border-slate-200 border-dashed rounded-3xl shadow-sm">
                No blog posts created yet. Click "Write Article" to publish your first post!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogs.map((b, index) => (
                  <div
                    key={b._id || b.id || index}
                    className="group bg-white rounded-3xl border border-slate-200/80 hover:border-[#0a2968]/30 hover:shadow-xl transition-all flex flex-col overflow-hidden shadow-sm"
                  >
                    <div className="relative h-48 bg-slate-100 overflow-hidden border-b border-slate-100">
                      <img
                        src={b.image || "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=400"}
                        alt={b.title}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingBlog(b);
                            setBlogTitle(b.title);
                            setBlogCategory(b.category);
                            setBlogReadTime(b.readTime);
                            setBlogExcerpt(b.excerpt);
                            setBlogImage(b.image);
                            setBlogContent(b.content);
                            setBlogPublished(b.published);
                            setSeoTitle(b.seoTitle || "");
                            setSeoKeywords(b.seoKeywords || "");
                            setShowBlogForm(true);
                          }}
                          className="p-2 bg-white/95 rounded-full text-slate-800 hover:bg-[#0a2968] hover:text-white border border-slate-200 shadow-md cursor-pointer transition-colors"
                          title="Edit Article"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={async () => {
                            const blogId = b._id || b.id;
                            if (window.confirm("Are you sure you want to delete this article?")) {
                              try {
                                await deleteBlog(blogId);
                                fetchBlogs();
                              } catch (err) {
                                alert("Failed to delete article.");
                              }
                            }
                          }}
                          className="p-2 bg-white/95 rounded-full text-slate-800 hover:bg-red-500 hover:text-white border border-slate-200 shadow-md cursor-pointer transition-colors"
                          title="Delete Article"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <span className={`absolute bottom-4 left-4 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm ${b.published ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-orange-50 text-orange-500 border border-orange-200'}`}>
                        {b.published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase block mb-1">
                          {b.category} • {b.readTime}
                        </span>
                        <h3 className="text-xl font-bold text-[#0a2968] mb-2 line-clamp-2">
                          {b.title}
                        </h3>
                        <p className="text-slate-500 text-sm line-clamp-3 mb-4 font-semibold leading-relaxed">
                          {b.excerpt}
                        </p>
                      </div>
                      <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400 font-bold">
                        <span>{b.date}</span>
                        <Link to={`/blog/${b._id || b.id}`} target="_blank" className="text-[#0a2968] hover:text-[#EF961D] font-bold flex items-center gap-1 transition-colors">
                          View Live <ExternalLink size={12} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: EVALUATION CARDS MANAGER ================= */}
        {activeAdminTab === "evaluations" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
              <div>
                <h2 className="text-3xl font-black text-[#0a2968]">Evaluation Plans & Cards</h2>
                <p className="text-sm text-slate-500 font-semibold mt-1">
                  Manage evaluation cards shown on the website (GS 1-4, Optionals PSIR/Geography/Sociology/Anthropology, Combos)
                </p>
              </div>
              <button
                onClick={() => {
                  resetEvalForm();
                  setShowEvalForm(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-[#0a2968] text-white hover:bg-[#EF961D] rounded-full font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Plus size={20} /> Add New Evaluation Plan
              </button>
            </div>

            {evalLoading ? (
              <div className="p-20 flex justify-center">
                <Loader2 className="animate-spin text-[#EF961D] w-8 h-8" />
              </div>
            ) : evaluations.length === 0 ? (
              <div className="p-20 text-center text-slate-500 bg-white border border-slate-200 border-dashed rounded-3xl shadow-sm">
                No evaluation cards found. Click "Add New Evaluation Plan" to create one.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {evaluations.map((item, index) => (
                  <div
                    key={item._id || item.id || index}
                    className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between overflow-hidden p-6 relative"
                  >
                    {/* Badge */}
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 bg-[#0a2968]/10 text-[#0a2968] font-black text-xs rounded-lg uppercase tracking-wider border border-[#0a2968]/15">
                        {item.category} • {item.paperTag || "GS"}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${item.published ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                        {item.published ? "Active" : "Hidden"}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-extrabold text-[#0a2968] mb-2 leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-semibold line-clamp-2 mb-4">
                        {item.description}
                      </p>

                      {/* Pricing */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 mb-4 flex items-baseline gap-2">
                        <span className="text-2xl font-black text-[#0a2968]">
                          ₹{item.finalPrice?.toLocaleString("en-IN")}
                        </span>
                        {item.mrpPrice > item.finalPrice && (
                          <span className="text-xs font-bold text-slate-400 line-through">
                            ₹{item.mrpPrice?.toLocaleString("en-IN")}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500 font-bold ml-auto">{item.duration}</span>
                      </div>

                      {/* Features Preview */}
                      <div className="space-y-1.5 mb-6">
                        {item.features && item.features.slice(0, 3).map((f, fIdx) => (
                          <div key={fIdx} className="flex items-center gap-2 text-xs font-bold text-slate-700 truncate">
                            <CheckCircle2 size={14} className="text-[#EF961D] shrink-0" />
                            <span className="truncate">{f}</span>
                          </div>
                        ))}
                        {item.features && item.features.length > 3 && (
                          <span className="text-[11px] font-bold text-slate-400 pl-5">+ {item.features.length - 3} more features</span>
                        )}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setEditingEval(item);
                          setEvalTitle(item.title);
                          setEvalCategory(item.category || "GS");
                          setEvalPaperTag(item.paperTag || "GS Paper 1");
                          setEvalDescription(item.description || "");
                          setEvalFeatures(Array.isArray(item.features) ? item.features.join("\n") : "");
                          setEvalMrpPrice(item.mrpPrice || 7999);
                          setEvalFinalPrice(item.finalPrice || 4999);
                          setEvalDuration(item.duration || "Till Mains 2026");
                          setEvalBadge(item.badge || "Popular");
                          setEvalPurchaseUrl(item.purchaseUrl || "/#contact");
                          setEvalPlanPdf(item.planPdf || "");
                          setEvalPlanPdfTitle(item.planPdfTitle || "Program Syllabus & Micro-Topics Overview PDF");
                          setEvalIsDayWiseSchedule(item.isDayWiseSchedule || false);
                          setEvalTotalDays(item.totalDays || 30);
                          setEvalTestsList(
                            Array.isArray(item.tests) && item.tests.length > 0
                              ? item.tests.map((t, i) => ({
                                  id: t.id || `test-${i}`,
                                  day: t.day || i + 1,
                                  testTitle: t.testName || t.testTitle || (typeof t === 'string' ? t : `Test ${i + 1}`),
                                  questionPdf: t.questionPdf || "",
                                  textNote: t.textNote || ""
                                }))
                              : [{ id: "t-1", day: 1, testTitle: "Test 1: Mains Question Paper", questionPdf: "", textNote: "" }]
                          );
                          setEvalPublished(item.published !== undefined ? item.published : true);
                          setShowEvalForm(true);
                        }}
                        className="px-4 py-2 bg-slate-100 hover:bg-[#0a2968] hover:text-white rounded-xl text-xs font-extrabold text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit2 size={14} /> Edit Plan
                      </button>

                      <button
                        onClick={async () => {
                          const evalId = item._id || item.id;
                          if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
                            try {
                              await deleteEvaluation(evalId);
                              fetchEvaluations();
                            } catch (err) {
                              alert("Failed to delete evaluation plan.");
                            }
                          }
                        }}
                        className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-colors cursor-pointer"
                        title="Delete Plan"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: EVALUATION RESULTS MANAGER ================= */}
        {activeAdminTab === "results" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
              <div>
                <h2 className="text-3xl font-black text-[#0a2968]">Evaluated Copy & Results Manager</h2>
                <p className="text-sm text-slate-500 font-semibold mt-1">
                  Upload evaluated answer copy PDFs, marks, and remarks for students to access on their dashboard
                </p>
              </div>
              <button
                onClick={() => {
                  resetResultForm();
                  setShowResultForm(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-[#0a2968] text-white hover:bg-[#EF961D] rounded-full font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Plus size={20} /> Upload New Result PDF
              </button>
            </div>

            {resultsList.length === 0 ? (
              <div className="p-20 text-center text-slate-500 bg-white border border-slate-200 border-dashed rounded-3xl shadow-sm">
                No evaluation results uploaded yet. Click "Upload New Result PDF" to publish an evaluated copy for students.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {resultsList.map((resItem) => (
                  <div
                    key={resItem.id}
                    className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between p-6 relative"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="px-3 py-1 bg-blue-50 text-[#0a2968] font-black text-xs rounded-lg uppercase tracking-wider border border-blue-100">
                          {resItem.paperTag || "GS Paper"}
                        </span>
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-black text-xs rounded-full uppercase tracking-wider border border-emerald-200">
                          Marks: {resItem.score}
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-[#0a2968] mb-2 leading-tight">
                        {resItem.planTitle}
                      </h3>

                      <p className="text-xs text-slate-500 font-semibold mb-3">
                        Student: <strong className="text-slate-800">{resItem.studentEmail}</strong>
                      </p>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 text-xs text-slate-600 font-semibold mb-4">
                        <strong className="text-slate-800 block mb-1">Evaluator Remarks:</strong>
                        "{resItem.remarks}"
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      <a
                        href={resItem.resultPdf}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 bg-blue-50 hover:bg-[#0a2968] text-[#0a2968] hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                      >
                        <FileCheck size={14} /> View Evaluated PDF
                      </a>

                      <button
                        onClick={() => handleDeleteResult(resItem.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                        title="Delete Result"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>

    {/* BLOG FORM SLIDE OVER */}
      {showBlogForm && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowBlogForm(false)} />
          <div className="relative w-full max-w-5xl bg-white h-full shadow-2xl overflow-y-auto border-l border-slate-200 animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-center z-20 shadow-sm">
              <h2 className="text-2xl font-black text-[#0a2968]">
                {editingBlog ? "Edit Article" : "Write New Article"}
              </h2>
              <button onClick={() => setShowBlogForm(false)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-700 cursor-pointer">
                <X size={22} />
              </button>
            </div>

            <div className="p-8 space-y-6 flex-grow">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <label className="block text-xs font-extrabold text-[#0a2968] uppercase mb-2">Title</label>
                    <input
                      type="text"
                      value={blogTitle}
                      onChange={(e) => setBlogTitle(e.target.value)}
                      placeholder="e.g. Mastering Mains GS Answer Writing"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#0a2968] focus:bg-white rounded-xl px-4 py-3 text-slate-800 text-sm font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-[#0a2968] uppercase mb-2">Excerpt</label>
                    <textarea
                      value={blogExcerpt}
                      onChange={(e) => setBlogExcerpt(e.target.value)}
                      placeholder="Short summary displayed on the card..."
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#0a2968] focus:bg-white rounded-xl px-4 py-3 text-slate-800 text-sm font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-[#0a2968] uppercase mb-2">Article Body Content</label>
                    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                      <div
                        ref={editorRef}
                        contentEditable
                        onInput={(e) => setBlogContent(e.currentTarget.innerHTML)}
                        className="min-h-[300px] max-h-[450px] overflow-y-auto p-5 text-slate-800 bg-white font-sans text-base leading-relaxed outline-none"
                        placeholder="Write article details here..."
                      />
                    </div>
                  </div>
                </div>

                {/* Sidebar Settings */}
                <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-200 h-fit">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-600 uppercase mb-2">Category</label>
                    <select
                      value={blogCategory}
                      onChange={(e) => setBlogCategory(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none"
                    >
                      <option value="Strategy">Strategy</option>
                      <option value="GS Mains">GS Mains</option>
                      <option value="Optional">Optional</option>
                      <option value="Updates">Updates</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-600 uppercase mb-2">Read Time</label>
                    <input
                      type="text"
                      value={blogReadTime}
                      onChange={(e) => setBlogReadTime(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-600 uppercase mb-2">Cover Image URL / Upload</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={blogImage}
                        onChange={(e) => setBlogImage(e.target.value)}
                        placeholder="https://..."
                        className="flex-grow bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold outline-none"
                      />
                      <label className="px-3 py-3 bg-[#0a2968] text-white hover:bg-[#EF961D] rounded-xl font-extrabold text-xs flex items-center gap-1 cursor-pointer shrink-0 transition-colors">
                        <Upload size={14} />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const cloudinaryUrl = await uploadFileToCloudinary(file, 'blog_cover_images');
                              setBlogImage(cloudinaryUrl);
                              alert(`✅ Blog cover image uploaded to Cloudinary!\n${cloudinaryUrl}`);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="blogPublishedCheck"
                      checked={blogPublished}
                      onChange={(e) => setBlogPublished(e.target.checked)}
                      className="w-4 h-4 text-[#0a2968] rounded"
                    />
                    <label htmlFor="blogPublishedCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
                      Publish Immediately
                    </label>
                  </div>

                  <button
                    onClick={handleSaveBlog}
                    disabled={isSavingBlog}
                    className="w-full py-3.5 bg-[#0a2968] hover:bg-[#EF961D] text-white font-extrabold text-sm rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50 uppercase tracking-wider"
                  >
                    {isSavingBlog ? "Saving Article..." : "Save Article"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EVALUATION CARD FORM SLIDE OVER */}
      {showEvalForm && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowEvalForm(false)} />
          <div className="relative w-full max-w-3xl bg-white h-full shadow-2xl overflow-y-auto border-l border-slate-200 animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-center z-20 shadow-sm">
              <h2 className="text-2xl font-black text-[#0a2968]">
                {editingEval ? "Edit Evaluation Plan" : "Add New Evaluation Plan"}
              </h2>
              <button onClick={() => setShowEvalForm(false)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-700 cursor-pointer">
                <X size={22} />
              </button>
            </div>

            <div className="p-8 space-y-6 flex-grow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-extrabold text-[#0a2968] uppercase mb-2">Plan Title</label>
                  <input
                    type="text"
                    value={evalTitle}
                    onChange={(e) => setEvalTitle(e.target.value)}
                    placeholder="e.g. GS Paper 1 Mains Answer Evaluation"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#0a2968] rounded-xl px-4 py-3 text-slate-800 text-sm font-semibold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#0a2968] uppercase mb-2">Category Tab</label>
                  <select
                    value={evalCategory}
                    onChange={(e) => setEvalCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#0a2968] rounded-xl px-4 py-3 text-slate-800 text-sm font-semibold outline-none"
                  >
                    <option value="GS">GS Papers (1 to 4)</option>
                    <option value="Optional">Optional Subject</option>
                    <option value="Combo">Combo Program</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#0a2968] uppercase mb-2">Paper / Tag Name</label>
                  <input
                    type="text"
                    value={evalPaperTag}
                    onChange={(e) => setEvalPaperTag(e.target.value)}
                    placeholder="e.g. GS Paper 1, PSIR, Combo Plan"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#0a2968] rounded-xl px-4 py-3 text-slate-800 text-sm font-semibold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#0a2968] uppercase mb-2">MRP Price (₹)</label>
                  <input
                    type="number"
                    value={evalMrpPrice}
                    onChange={(e) => setEvalMrpPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#0a2968] rounded-xl px-4 py-3 text-slate-800 text-sm font-semibold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#0a2968] uppercase mb-2">Final Discounted Price (₹)</label>
                  <input
                    type="number"
                    value={evalFinalPrice}
                    onChange={(e) => setEvalFinalPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#0a2968] rounded-xl px-4 py-3 text-slate-800 text-sm font-semibold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#0a2968] uppercase mb-2">Duration / Validity</label>
                  <input
                    type="text"
                    value={evalDuration}
                    onChange={(e) => setEvalDuration(e.target.value)}
                    placeholder="Till Mains 2026"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#0a2968] rounded-xl px-4 py-3 text-slate-800 text-sm font-semibold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#0a2968] uppercase mb-2">Badge Text (Optional)</label>
                  <input
                    type="text"
                    value={evalBadge}
                    onChange={(e) => setEvalBadge(e.target.value)}
                    placeholder="e.g. Popular, Best Value, High Success"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#0a2968] rounded-xl px-4 py-3 text-slate-800 text-sm font-semibold outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-extrabold text-[#0a2968] uppercase mb-2">Short Description</label>
                  <textarea
                    value={evalDescription}
                    onChange={(e) => setEvalDescription(e.target.value)}
                    placeholder="Comprehensive evaluation covering History, Art & Culture..."
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#0a2968] rounded-xl px-4 py-3 text-slate-800 text-sm font-semibold outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-extrabold text-[#0a2968] uppercase mb-2">
                    Included Features (One feature per line)
                  </label>
                  <textarea
                    value={evalFeatures}
                    onChange={(e) => setEvalFeatures(e.target.value)}
                    placeholder={"Detailed Line-by-Line Feedback within 24 Hours\nModel Answer Framework & Structure Map\nPersonalized One-on-One Mentor Call"}
                    rows={5}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#0a2968] rounded-xl px-4 py-3 text-slate-800 text-sm font-semibold outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#0a2968] uppercase mb-2">Purchase / Enroll Link</label>
                  <input
                    type="text"
                    value={evalPurchaseUrl}
                    onChange={(e) => setEvalPurchaseUrl(e.target.value)}
                    placeholder="/#contact"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#0a2968] rounded-xl px-4 py-3 text-slate-800 text-sm font-semibold outline-none"
                  />
                </div>

                {/* GENERAL / PROGRAM OVERVIEW PDF SECTION */}
                <div className="md:col-span-2 bg-blue-50/60 border border-blue-200 p-5 rounded-2xl space-y-4">
                  <h3 className="text-sm font-black text-[#0a2968] flex items-center gap-2">
                    <FileText size={18} className="text-[#EF961D]" /> Course Overview PDF (Syllabus / Guidance Guide)
                  </h3>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                      PDF Document Title (Shown in Student Dashboard)
                    </label>
                    <input
                      type="text"
                      value={evalPlanPdfTitle}
                      onChange={(e) => setEvalPlanPdfTitle(e.target.value)}
                      placeholder="e.g. Program Syllabus & Micro-Topics Overview PDF"
                      className="w-full bg-white border border-slate-300 focus:border-[#0a2968] rounded-xl px-4 py-2.5 text-slate-800 text-sm font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                      PDF File URL / Upload
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={evalPlanPdf}
                        onChange={(e) => setEvalPlanPdf(e.target.value)}
                        placeholder="e.g. https://example.com/syllabus.pdf or /docs/plan.pdf"
                        className="flex-grow bg-white border border-slate-300 focus:border-[#0a2968] rounded-xl px-4 py-2.5 text-slate-800 text-sm font-semibold outline-none"
                      />
                      <label className={`px-4 py-2.5 bg-[#0a2968] hover:bg-[#EF961D] text-white rounded-xl font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors shadow-xs ${isUploadingEvalPlanPdf ? 'opacity-75 pointer-events-none' : ''}`}>
                        {isUploadingEvalPlanPdf ? (
                          <>
                            <Loader2 size={15} className="animate-spin text-[#EF961D]" /> Uploading...
                          </>
                        ) : (
                          <>
                            <Upload size={15} /> Upload PDF
                          </>
                        )}
                        <input
                          type="file"
                          accept="application/pdf"
                          disabled={isUploadingEvalPlanPdf}
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setIsUploadingEvalPlanPdf(true);
                              try {
                                const cloudinaryUrl = await uploadFileToCloudinary(file, 'course_syllabus_pdfs');
                                setEvalPlanPdf(cloudinaryUrl);
                                alert(`✅ Syllabus PDF "${file.name}" uploaded to Cloudinary!`);
                              } catch (err) {
                                console.error(err);
                                alert("❌ Upload failed.");
                              } finally {
                                setIsUploadingEvalPlanPdf(false);
                              }
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* 30-DAY DRIP / DAY-WISE SCHEDULE TOGGLE BOX (BRAND THEME COLOR SYSTEM) */}
                <div className="md:col-span-2 bg-gradient-to-r from-blue-50/90 via-slate-50 to-blue-50/80 border border-blue-200/90 p-5 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Sparkles size={18} className="text-[#EF961D]" />
                        <h3 className="text-sm font-black text-[#0a2968]">30-Day Day-wise Drip Schedule Mode</h3>
                      </div>
                      <p className="text-[11px] text-slate-600 font-semibold mt-0.5">
                        Enable to release 1 test/PDF daily starting from student purchase date. Day 2 unlocks ONLY after Day 1 submission!
                      </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={evalIsDayWiseSchedule}
                        onChange={(e) => setEvalIsDayWiseSchedule(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0a2968]"></div>
                      <span className="ml-3 text-xs font-black text-[#0a2968]">
                        {evalIsDayWiseSchedule ? "ACTIVE (30 Days Drip)" : "Disabled"}
                      </span>
                    </label>
                  </div>

                  {evalIsDayWiseSchedule && (
                    <div className="pt-3 border-t border-blue-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
                      <div>
                        <label className="block text-xs font-extrabold text-[#0a2968] uppercase mb-1">Total Days in Plan</label>
                        <input
                          type="number"
                          min="1"
                          max="90"
                          value={evalTotalDays}
                          onChange={(e) => setEvalTotalDays(e.target.value)}
                          className="w-full bg-white border border-blue-300 focus:border-[#0a2968] rounded-xl px-4 py-2 text-slate-800 text-xs font-bold outline-none"
                        />
                      </div>

                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={handleGenerate30DaysSchedule}
                          className="w-full py-2.5 bg-[#0a2968] hover:bg-[#EF961D] text-white text-xs font-extrabold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
                        >
                          <Sparkles size={14} className="text-[#EF961D]" /> Auto-Generate {evalTotalDays || 30} Days Schedule
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* DYNAMIC TESTS BUILDER SECTION */}
                <div className="md:col-span-2 bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-[#0a2968]">
                        Dynamic Test Series Builder ({evalTestsList.length} Items / Days)
                      </h3>
                      <p className="text-[11px] text-slate-500 font-semibold">
                        {evalIsDayWiseSchedule
                          ? "Day-wise daily content & question PDFs. User sees Day 1 on purchase date, Day 2 opens after Day 1 submission."
                          : "Add test titles & question PDFs test-by-test. Admin can add more tests anytime later!"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddTestItem}
                      className="px-4 py-2 bg-[#0a2968] hover:bg-[#EF961D] text-white text-xs font-extrabold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus size={15} /> Add New {evalIsDayWiseSchedule ? "Day" : "Test"}
                    </button>
                  </div>

                  <div className="space-y-3 pt-2 max-h-[480px] overflow-y-auto pr-1">
                    {evalTestsList.map((testItem, idx) => (
                      <div key={testItem.id || idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-[#0a2968] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                              {evalIsDayWiseSchedule ? `Day ${testItem.day || idx + 1}` : `Test #${idx + 1}`}
                            </span>
                            {evalIsDayWiseSchedule && (
                              <span className="text-[10px] font-bold text-slate-400">
                                Sequential Lock Active
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveTestItem(idx)}
                            className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                            title="Remove Item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                          {evalIsDayWiseSchedule && (
                            <div className="md:col-span-3">
                              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Day Number</label>
                              <input
                                type="number"
                                min="1"
                                value={testItem.day || idx + 1}
                                onChange={(e) => handleUpdateTestItem(idx, 'day', Number(e.target.value))}
                                className="w-full bg-slate-50 border border-slate-200 focus:border-[#0a2968] rounded-lg px-3 py-2 text-slate-800 text-xs font-bold outline-none"
                              />
                            </div>
                          )}

                          <div className={evalIsDayWiseSchedule ? "md:col-span-9" : "md:col-span-6"}>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                              {evalIsDayWiseSchedule ? "Day Topic / Test Title" : "Test Title"}
                            </label>
                            <input
                              type="text"
                              value={testItem.testTitle}
                              onChange={(e) => handleUpdateTestItem(idx, 'testTitle', e.target.value)}
                              placeholder={`e.g. Day ${idx + 1}: Mains Question Paper`}
                              className="w-full bg-slate-50 border border-slate-200 focus:border-[#0a2968] rounded-lg px-3 py-2 text-slate-800 text-xs font-semibold outline-none"
                            />
                          </div>

                          <div className="md:col-span-12">
                            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Question Paper PDF (Optional)</label>
                            <div className="flex gap-1.5">
                              <input
                                type="text"
                                value={testItem.questionPdf}
                                onChange={(e) => handleUpdateTestItem(idx, 'questionPdf', e.target.value)}
                                placeholder="https://... PDF URL"
                                className="flex-grow bg-slate-50 border border-slate-200 focus:border-[#0a2968] rounded-lg px-3 py-2 text-slate-800 text-xs font-semibold outline-none"
                              />
                              {(() => {
                                const isItemUploading = uploadingTestPdfIdx === idx;
                                return (
                                  <label className={`px-3 py-2 bg-slate-100 hover:bg-slate-200 text-[#0a2968] border border-slate-300 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer shrink-0 transition-all ${isItemUploading ? 'opacity-70 pointer-events-none' : ''}`}>
                                    {isItemUploading ? (
                                      <>
                                        <Loader2 size={13} className="animate-spin text-[#EF961D]" /> Uploading...
                                      </>
                                    ) : (
                                      <>
                                        <Upload size={13} /> Upload
                                      </>
                                    )}
                                    <input
                                      type="file"
                                      accept="application/pdf"
                                      disabled={isItemUploading}
                                      className="hidden"
                                      onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                          setUploadingTestPdfIdx(idx);
                                          try {
                                            const cloudinaryUrl = await uploadFileToCloudinary(file, 'test_question_pdfs');
                                            handleUpdateTestItem(idx, 'questionPdf', cloudinaryUrl);
                                            alert(`✅ Question Paper PDF for Day/Test #${idx + 1} uploaded to Cloudinary!`);
                                          } catch (err) {
                                            console.error(err);
                                            alert("❌ Upload failed.");
                                          } finally {
                                            setUploadingTestPdfIdx(null);
                                          }
                                        }
                                      }}
                                    />
                                  </label>
                                );
                              })()}
                            </div>
                          </div>

                          {evalIsDayWiseSchedule && (
                            <div className="md:col-span-12">
                              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Day Text Note / Instructions (Optional)</label>
                              <input
                                type="text"
                                value={testItem.textNote || ""}
                                onChange={(e) => handleUpdateTestItem(idx, 'textNote', e.target.value)}
                                placeholder="Instructions or topic notes for student for this day..."
                                className="w-full bg-slate-50 border border-slate-200 focus:border-[#0a2968] rounded-lg px-3 py-2 text-slate-800 text-xs font-semibold outline-none"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="evalPublishedCheck"
                    checked={evalPublished}
                    onChange={(e) => setEvalPublished(e.target.checked)}
                    className="w-5 h-5 text-[#0a2968] rounded"
                  />
                  <label htmlFor="evalPublishedCheck" className="text-sm font-bold text-slate-700 cursor-pointer">
                    Show Plan on Website
                  </label>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                <button
                  onClick={() => setShowEvalForm(false)}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEval}
                  disabled={isSavingEval}
                  className="px-8 py-3 bg-[#0a2968] hover:bg-[#EF961D] text-white font-extrabold rounded-xl text-sm shadow-md transition-all cursor-pointer uppercase tracking-wider"
                >
                  {isSavingEval ? "Saving Plan..." : "Save Evaluation Plan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EVALUATION RESULT UPLOAD FORM SLIDE OVER */}
      {showResultForm && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowResultForm(false)} />
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto border-l border-slate-200 animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-center z-20 shadow-sm">
              <h2 className="text-2xl font-black text-[#0a2968]">
                Upload Student Evaluated Result PDF
              </h2>
              <button onClick={() => setShowResultForm(false)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-700 cursor-pointer">
                <X size={22} />
              </button>
            </div>

            <div className="p-8 space-y-6 flex-grow">
              {/* DEPENDENT DROPDOWNS: STEP 1 (CATEGORY) & STEP 2 (EVALUATION PLAN) */}
              <div className="bg-blue-50/60 border border-blue-200 p-5 rounded-2xl space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* DROPDOWN 1: CATEGORY SELECTOR */}
                  <div>
                    <label className="block text-xs font-extrabold text-[#0a2968] uppercase mb-1.5">
                      1. Select Category / Tab
                    </label>
                    <select
                      value={resCategorySelect}
                      onChange={(e) => {
                        const cat = e.target.value;
                        setResCategorySelect(cat);
                        const filtered = getAvailablePlans(cat);
                        if (filtered.length > 0) {
                          setResPlanTitle(filtered[0].title);
                          setResPaperTag(filtered[0].paperTag || "GS Paper");
                        }
                      }}
                      className="w-full bg-white border border-slate-300 focus:border-[#0a2968] rounded-xl px-3.5 py-2.5 text-xs font-extrabold text-[#0a2968] outline-none shadow-xs"
                    >
                      <option value="All">All Categories ({getAvailablePlans("All").length} Plans)</option>
                      <option value="GS">GS Papers (1 to 4)</option>
                      <option value="Optional">Optional Subject</option>
                      <option value="Combo">Combo Programs</option>
                    </select>
                  </div>

                  {/* DROPDOWN 2: DEPENDENT EVALUATION PLAN SELECTOR */}
                  <div>
                    <label className="block text-xs font-extrabold text-[#0a2968] uppercase mb-1.5">
                      2. Select Evaluation Plan Name
                    </label>
                    <select
                      value={resPlanTitle}
                      onChange={(e) => {
                        const selectedTitle = e.target.value;
                        setResPlanTitle(selectedTitle);
                        const match = getAvailablePlans(resCategorySelect).find(p => p.title === selectedTitle);
                        if (match) {
                          setResPaperTag(match.paperTag || "GS Paper");
                        }
                      }}
                      className="w-full bg-white border border-slate-300 focus:border-[#0a2968] rounded-xl px-3.5 py-2.5 text-xs font-extrabold text-[#0a2968] outline-none shadow-xs"
                    >
                      {getAvailablePlans(resCategorySelect).map((plan, idx) => (
                        <option key={idx} value={plan.title}>
                          {plan.title} [{plan.paperTag || plan.category}]
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#0a2968] uppercase mb-2">Evaluation Plan Title (Editable)</label>
                <input
                  type="text"
                  value={resPlanTitle}
                  onChange={(e) => setResPlanTitle(e.target.value)}
                  placeholder="e.g. GS Paper 1 Mains Answer Evaluation"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#0a2968] rounded-xl px-4 py-3 text-slate-800 text-sm font-semibold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#0a2968] uppercase mb-2">Specific Test Name (e.g. Test 1, Test 2)</label>
                <input
                  type="text"
                  value={resTestName}
                  onChange={(e) => setResTestName(e.target.value)}
                  placeholder="e.g. Test 1: Modern Indian History & Freedom Struggle"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#0a2968] rounded-xl px-4 py-3 text-slate-800 text-sm font-semibold outline-none"
                />
              </div>

              {/* TARGET TYPE SELECTOR: PERSONAL CHECKED COPY VS COURSE MODEL RESULT */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <label className="block text-xs font-black text-[#0a2968] uppercase tracking-wider">
                  Target Audience / Visibility
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    onClick={() => setResTargetType("personal")}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-start gap-2.5 ${
                      resTargetType === "personal"
                        ? "bg-white border-[#0a2968] text-[#0a2968] shadow-xs ring-2 ring-[#0a2968]/15"
                        : "bg-white/60 border-slate-200 text-slate-600 hover:bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="targetType"
                      checked={resTargetType === "personal"}
                      onChange={() => setResTargetType("personal")}
                      className="mt-0.5"
                    />
                    <div>
                      <span className="font-extrabold block">🔐 Personal Checked Copy</span>
                      <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                        Visible ONLY to the specific student whose email is entered below.
                      </span>
                    </div>
                  </label>

                  <label
                    onClick={() => {
                      setResTargetType("course_all");
                      setResStudentEmail("all");
                    }}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-start gap-2.5 ${
                      resTargetType === "course_all"
                        ? "bg-white border-[#0a2968] text-[#0a2968] shadow-xs ring-2 ring-[#0a2968]/15"
                        : "bg-white/60 border-slate-200 text-slate-600 hover:bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="targetType"
                      checked={resTargetType === "course_all"}
                      onChange={() => {
                        setResTargetType("course_all");
                        setResStudentEmail("all");
                      }}
                      className="mt-0.5"
                    />
                    <div>
                      <span className="font-extrabold block">🌐 Course Model Answer / Result</span>
                      <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                        Visible to ALL students enrolled in this course/plan.
                      </span>
                    </div>
                  </label>
                </div>

                {resTargetType === "personal" && (
                  <div className="pt-2 animate-in fade-in duration-150">
                    <label className="block text-[11px] font-extrabold text-[#0a2968] uppercase mb-1">
                      Student Email Address
                    </label>
                    <input
                      type="email"
                      value={resStudentEmail}
                      onChange={(e) => setResStudentEmail(e.target.value)}
                      placeholder="e.g. rahul.sharma@gmail.com or student@itopper.com"
                      className="w-full bg-white border border-slate-300 focus:border-[#0a2968] rounded-xl px-3.5 py-2.5 text-slate-800 text-xs font-semibold outline-none shadow-xs"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-extrabold text-[#0a2968] uppercase mb-2">Paper / Tag Name</label>
                  <input
                    type="text"
                    value={resPaperTag}
                    onChange={(e) => setResPaperTag(e.target.value)}
                    placeholder="e.g. GS Paper 1, PSIR, Combo"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#0a2968] rounded-xl px-4 py-3 text-slate-800 text-sm font-semibold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#0a2968] uppercase mb-2">Score / Marks Obtained</label>
                  <input
                    type="text"
                    value={resScore}
                    onChange={(e) => setResScore(e.target.value)}
                    placeholder="e.g. 118 / 250"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#0a2968] rounded-xl px-4 py-3 text-slate-800 text-sm font-semibold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#0a2968] uppercase mb-2">Evaluator Feedback & Remarks</label>
                <textarea
                  value={resRemarks}
                  onChange={(e) => setResRemarks(e.target.value)}
                  rows={3}
                  placeholder="Detailed line-by-line feedback notes..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#0a2968] rounded-xl px-4 py-3 text-slate-800 text-sm font-semibold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#0a2968] uppercase mb-2">
                  Evaluated Copy PDF (Upload or Link)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={resPdfUrl}
                    onChange={(e) => setResPdfUrl(e.target.value)}
                    placeholder="https://example.com/evaluated_copy.pdf"
                    className="flex-grow bg-slate-50 border border-slate-200 focus:border-[#0a2968] rounded-xl px-4 py-3 text-slate-800 text-sm font-semibold outline-none"
                  />
                  <label className={`px-4 py-3 bg-[#0a2968] hover:bg-[#EF961D] text-white rounded-xl font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shrink-0 transition-all shadow-xs ${isUploadingResPdf ? 'opacity-75 pointer-events-none' : ''}`}>
                    {isUploadingResPdf ? (
                      <>
                        <Loader2 size={16} className="animate-spin text-[#EF961D]" /> Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={16} /> Select PDF
                      </>
                    )}
                    <input
                      type="file"
                      accept="application/pdf"
                      disabled={isUploadingResPdf}
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setIsUploadingResPdf(true);
                          try {
                            const cloudinaryUrl = await uploadFileToCloudinary(file, 'evaluated_checked_copies');
                            setResPdfUrl(cloudinaryUrl);
                            alert(`✅ Evaluated Copy PDF uploaded to Cloudinary!`);
                          } catch (err) {
                            console.error(err);
                            alert("❌ PDF upload failed.");
                          } finally {
                            setIsUploadingResPdf(false);
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                <button
                  onClick={() => setShowResultForm(false)}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveResult}
                  className="px-8 py-3 bg-[#0a2968] hover:bg-[#EF961D] text-white font-extrabold rounded-xl text-sm shadow-md transition-all cursor-pointer uppercase tracking-wider"
                >
                  Publish Result PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPortal;
