import { getApiUrl } from '../config/api';

const API_BASE = getApiUrl('/api/evaluations');

export const DEFAULT_EVALUATIONS = [
  {
    _id: "eval-gs1",
    title: "GS Paper 1 Mains Answer Evaluation",
    category: "GS",
    paperTag: "GS Paper 1",
    description: "Comprehensive evaluation covering History, Art & Culture, Geography, Indian Society & World History.",
    features: [
      "Detailed Line-by-Line Feedback within 24 Hours",
      "Model Answer Framework & Structure Map",
      "Personalized One-on-One Mentor Call",
      "Keyword Enrichment & Diagram Suggestions"
    ],
    mrpPrice: 7999,
    finalPrice: 4999,
    duration: "Till Mains 2026",
    badge: "Popular",
    purchaseUrl: "/#contact",
    planPdf: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    planPdfTitle: "GS Paper 1 Program Syllabus & Micro-Topics Overview PDF",
    published: true,
    order: 1,
    tests: [
      { id: "eval-gs1-t1", testName: "Test 1: Modern Indian History & Freedom Struggle", questionPdf: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
      { id: "eval-gs1-t2", testName: "Test 2: Art, Culture & Ancient Literature", questionPdf: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
      { id: "eval-gs1-t3", testName: "Test 3: Physical & Indian Geography", questionPdf: "" },
      { id: "eval-gs1-t4", testName: "Test 4: Indian Society & World History", questionPdf: "" }
    ]
  },
  {
    _id: "eval-gs2",
    title: "GS Paper 2 Mains Answer Evaluation",
    category: "GS",
    paperTag: "GS Paper 2",
    description: "In-depth evaluation for Polity, Governance, Social Justice, Constitution & International Relations.",
    features: [
      "Constitutional Articles & Case Laws Integration",
      "Evaluation by Served Officers & Toppers",
      "24/7 Doubt Resolution & Mentorship Access",
      "Monthly Performance Tracking & Analytics"
    ],
    mrpPrice: 7999,
    finalPrice: 4999,
    duration: "Till Mains 2026",
    badge: "High Recommended",
    purchaseUrl: "/#contact",
    planPdf: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    planPdfTitle: "GS Paper 2 Polity & Governance Syllabus Overview PDF",
    published: true,
    order: 2,
    tests: [
      { id: "eval-gs2-t1", testName: "Test 1: Indian Constitution & Federal Framework", questionPdf: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
      { id: "eval-gs2-t2", testName: "Test 2: Governance, Welfare Schemes & Social Justice", questionPdf: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
      { id: "eval-gs2-t3", testName: "Test 3: International Relations & Global Organizations", questionPdf: "" }
    ]
  },
  {
    _id: "eval-gs3",
    title: "GS Paper 3 Mains Answer Evaluation",
    category: "GS",
    paperTag: "GS Paper 3",
    description: "Expert evaluation focusing on Indian Economy, Environment, Science & Tech, Disaster Management & Security.",
    features: [
      "Data Points, Budget & Economic Survey Enrichment",
      "Line-by-Line Feedback on Diagram & Flowcharts",
      "Personalized Strategy Call with Experts",
      "Copy Evaluation by Top Mains Scorer"
    ],
    mrpPrice: 7999,
    finalPrice: 4999,
    duration: "Till Mains 2026",
    badge: "Top Choice",
    purchaseUrl: "/#contact",
    planPdf: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    planPdfTitle: "GS Paper 3 Economy & Environment Syllabus Overview PDF",
    published: true,
    order: 3,
    tests: [
      { id: "eval-gs3-t1", testName: "Test 1: Indian Economy & Agriculture Development", questionPdf: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
      { id: "eval-gs3-t2", testName: "Test 2: Environment, Biodiversity & Climate Change", questionPdf: "" },
      { id: "eval-gs3-t3", testName: "Test 3: Science & Technology & Internal Security", questionPdf: "" }
    ]
  },
  {
    _id: "eval-gs4",
    title: "GS Paper 4 Ethics & Case Studies Evaluation",
    category: "GS",
    paperTag: "GS Paper 4",
    description: "Specialized evaluation for Ethics, Integrity, Aptitude and real-life Case Studies with philosophical grounding.",
    features: [
      "Ethical Thinkers & Quote Bank Integration",
      "Step-by-Step Case Study Solution Matrix",
      "Detailed Feedback on Value Alignment",
      "One-on-One Ethics Guidance Session"
    ],
    mrpPrice: 8999,
    finalPrice: 5499,
    duration: "Till Mains 2026",
    badge: "Ethics Special",
    purchaseUrl: "/#contact",
    planPdf: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    planPdfTitle: "GS Paper 4 Ethics Thinkers & Case Study Guide PDF",
    published: true,
    order: 4,
    tests: [
      { id: "eval-gs4-t1", testName: "Test 1: Ethics & Human Interface Theory", questionPdf: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
      { id: "eval-gs4-t2", testName: "Test 2: Emotional Intelligence & Probity in Governance", questionPdf: "" },
      { id: "eval-gs4-t3", testName: "Test 3: Case Studies & Ethical Dilemmas Matrix", questionPdf: "" }
    ]
  },
  {
    _id: "eval-opt-psir",
    title: "Optional PSIR Answer Evaluation",
    category: "Optional",
    paperTag: "PSIR",
    description: "Comprehensive evaluation for Political Science & International Relations (Paper 1 & Paper 2).",
    features: [
      "Scholarly Perspectives & Quotes Integration",
      "Global Affairs & Thinkers Analysis",
      "Line-by-Line Evaluation within 48h",
      "Personalized Mentorship by PSIR Toppers"
    ],
    mrpPrice: 12999,
    finalPrice: 7999,
    duration: "Till Mains 2026",
    badge: "Most Popular",
    purchaseUrl: "/#contact",
    planPdf: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    planPdfTitle: "Optional PSIR Syllabus & Scholarly Perspectives Guide PDF",
    published: true,
    order: 5,
    tests: [
      { id: "eval-psir-t1", testName: "Test 1: PSIR Paper 1 Section A - Political Theory & Thinkers", questionPdf: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
      { id: "eval-psir-t2", testName: "Test 2: PSIR Paper 1 Section B - Indian Government & Politics", questionPdf: "" },
      { id: "eval-psir-t3", testName: "Test 3: PSIR Paper 2 - Comparative & International Politics", questionPdf: "" }
    ]
  },
  {
    _id: "eval-opt-geog",
    title: "Optional Geography Answer Evaluation",
    category: "Optional",
    paperTag: "Geography",
    description: "Detailed evaluation for Geography Optional covering Physical, Human, and Indian Geography with Map Work.",
    features: [
      "Diagram & Map Marking Feedback",
      "Geographical Thinkers & Theories Focus",
      "Line-by-Line Detailed Annotations",
      "Personalized One-on-One Discussion"
    ],
    mrpPrice: 12999,
    finalPrice: 7999,
    duration: "Till Mains 2026",
    badge: "Specialized",
    purchaseUrl: "/#contact",
    planPdf: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    planPdfTitle: "Geography Optional Diagram & Syllabus Guide PDF",
    published: true,
    order: 6,
    tests: [
      { id: "eval-geog-t1", testName: "Test 1: Geomorphology, Climatology & Oceanography", questionPdf: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
      { id: "eval-geog-t2", testName: "Test 2: Human Geography & Economic Geography", questionPdf: "" },
      { id: "eval-geog-t3", testName: "Test 3: Geography of India & Map Work", questionPdf: "" }
    ]
  },
  {
    _id: "eval-opt-socio",
    title: "Optional Sociology Answer Evaluation",
    category: "Optional",
    paperTag: "Sociology",
    description: "Rigorous evaluation for Sociology Optional focusing on Thinkers, Concepts, Indian Society, and Current Affairs.",
    features: [
      "Sociological Thinkers & Case Studies Integration",
      "Paper 1 & Paper 2 Integrated Feedback",
      "Model Answers & Structured Notes",
      "Mentor Guidance by Sociology Toppers"
    ],
    mrpPrice: 12999,
    finalPrice: 7999,
    duration: "Till Mains 2026",
    badge: "High Success",
    purchaseUrl: "/#contact",
    planPdf: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    planPdfTitle: "Sociology Optional Thinkers & Concepts Overview PDF",
    published: true,
    order: 7,
    tests: [
      { id: "eval-socio-t1", testName: "Test 1: Sociological Thinkers & Research Methods", questionPdf: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
      { id: "eval-socio-t2", testName: "Test 2: Indian Society, Caste & Social Transformations", questionPdf: "" }
    ]
  },
  {
    _id: "eval-opt-anthro",
    title: "Optional Anthropology Answer Evaluation",
    category: "Optional",
    paperTag: "Anthropology",
    description: "Focused evaluation for Anthropology Optional covering Physical, Social, Cultural, and Tribal Anthropology.",
    features: [
      "Anatomical Diagrams & Flowchart Corrections",
      "Case Studies & Tribal Reports Integration",
      "Line-by-Line Expert Review within 48h",
      "One-on-One Mentorship Session"
    ],
    mrpPrice: 12999,
    finalPrice: 7999,
    duration: "Till Mains 2026",
    badge: "Topper Choice",
    purchaseUrl: "/#contact",
    planPdf: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    planPdfTitle: "Anthropology Optional Syllabus & Diagram Guide PDF",
    published: true,
    order: 8,
    tests: [
      { id: "eval-anthro-t1", testName: "Test 1: Physical Anthropology & Human Evolution", questionPdf: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
      { id: "eval-anthro-t2", testName: "Test 2: Socio-Cultural & Indian Anthropology", questionPdf: "" }
    ]
  },
  {
    _id: "eval-combo-1",
    title: "GS 1-4 + Optional Full Combo Evaluation",
    category: "Combo",
    paperTag: "Combo Plan",
    description: "Ultimate evaluation package combining complete GS Mains Papers 1 to 4 PLUS your chosen Optional Subject.",
    features: [
      "Unlimited Daily Mains Answer Evaluation",
      "All 4 GS Papers + Complete Optional Coverage",
      "Priority Evaluation within 24 Hours",
      "Dedicated Personal IAS Mentor",
      "Weekly LIVE Zoom Copy Discussion Sessions",
      "Complete Access to Model Answers & PYQ Solutions"
    ],
    mrpPrice: 28999,
    finalPrice: 16999,
    duration: "Till Mains 2026",
    badge: "Best Value Combo",
    purchaseUrl: "/#contact",
    planPdf: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    planPdfTitle: "GS 1-4 + Optional Full Combo Master Guidance PDF",
    published: true,
    order: 9,
    tests: [
      { id: "eval-combo1-t1", testName: "Test 1: GS Paper 1 Full Length Mock", questionPdf: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
      { id: "eval-combo1-t2", testName: "Test 2: GS Paper 2 Full Length Mock", questionPdf: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
      { id: "eval-combo1-t3", testName: "Test 3: GS Paper 3 Full Length Mock", questionPdf: "" },
      { id: "eval-combo1-t4", testName: "Test 4: GS Paper 4 Ethics Full Length Mock", questionPdf: "" },
      { id: "eval-combo1-t5", testName: "Test 5: Optional Paper 1 & 2 Combo Mock", questionPdf: "" }
    ]
  },
  {
    _id: "eval-combo-2",
    title: "GS Mains 1-4 Complete Package",
    category: "Combo",
    paperTag: "GS Combo",
    description: "All-in-one evaluation solution for GS Paper 1, 2, 3 & Ethics Paper 4 with Essay writing.",
    features: [
      "Complete GS 1-4 & Essay Copy Evaluation",
      "Personalized Weakness Analysis Matrix",
      "Step-by-step Structure & Keyword Enrichment",
      "Unlimited Mentor Call Access"
    ],
    mrpPrice: 22999,
    finalPrice: 12999,
    duration: "Till Mains 2026",
    badge: "GS Super Saver",
    purchaseUrl: "/#contact",
    planPdf: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    planPdfTitle: "GS Mains 1-4 Complete Package Guide PDF",
    published: true,
    order: 10,
    tests: [
      { id: "eval-combo2-t1", testName: "Test 1: GS Paper 1 & 2 Integrated Mock", questionPdf: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
      { id: "eval-combo2-t2", testName: "Test 2: GS Paper 3 & 4 Integrated Mock", questionPdf: "" },
      { id: "eval-combo2-t3", testName: "Test 3: Essay Paper Special Mock", questionPdf: "" }
    ]
  }
];

export const getEvaluations = async (isAdmin = false) => {
  try {
    const res = await fetch(`${API_BASE}${isAdmin ? '?admin=true' : ''}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem("itopper_evaluations_cache", JSON.stringify(data));
        return data;
      }
    }
  } catch (err) {
    console.warn("Backend evaluation API unreachable, checking local cache:", err.message);
  }

  const cached = localStorage.getItem("itopper_evaluations_cache");
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.error("Cache parse error:", e);
    }
  }

  return DEFAULT_EVALUATIONS;
};

export const addEvaluation = async (itemData) => {
  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(itemData),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("API add evaluation failed, fallback to local cache:", err.message);
  }

  const current = await getEvaluations(true);
  const newItem = {
    ...itemData,
    _id: "eval-" + Date.now(),
    createdAt: new Date().toISOString()
  };
  const updated = [newItem, ...current];
  localStorage.setItem("itopper_evaluations_cache", JSON.stringify(updated));
  return newItem;
};

export const updateEvaluation = async (id, itemData) => {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(itemData),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("API update evaluation failed, fallback to local cache:", err.message);
  }

  const current = await getEvaluations(true);
  const updated = current.map(item => (item._id === id || item.id === id) ? { ...item, ...itemData } : item);
  localStorage.setItem("itopper_evaluations_cache", JSON.stringify(updated));
  return updated.find(item => item._id === id || item.id === id);
};

export const deleteEvaluation = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      return true;
    }
  } catch (err) {
    console.warn("API delete evaluation failed, fallback to local cache:", err.message);
  }

  const current = await getEvaluations(true);
  const updated = current.filter(item => item._id !== id && item.id !== id);
  localStorage.setItem("itopper_evaluations_cache", JSON.stringify(updated));
  return true;
};

// Sync Results API
export const getEvaluationResultsApi = async (email = '') => {
  try {
    const url = email ? `${API_BASE}/results?email=${encodeURIComponent(email)}` : `${API_BASE}/results`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem("itopper_evaluation_results", JSON.stringify(data));
        return data;
      }
    }
  } catch (err) {
    console.warn("Backend evaluation results API unreachable, falling back to local storage:", err.message);
  }
  return JSON.parse(localStorage.getItem("itopper_evaluation_results") || "[]");
};

export const saveEvaluationResultApi = async (resultData) => {
  try {
    const res = await fetch(`${API_BASE}/results`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resultData),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Backend save evaluation result API failed, saving locally:", err.message);
  }
  return null;
};

export const submitAnswerSheetApi = async (submissionData) => {
  try {
    const res = await fetch(`${API_BASE}/submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submissionData),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Backend submit answer sheet API failed, saving locally:", err.message);
  }
  return null;
};

export const getStudentSubmissionsApi = async (email = '') => {
  try {
    const url = email ? `${API_BASE}/submissions?email=${encodeURIComponent(email)}` : `${API_BASE}/submissions`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem("itopper_all_student_submissions", JSON.stringify(data));
        return data;
      }
    }
  } catch (err) {
    console.warn("Backend student submissions API unreachable, falling back to local storage:", err.message);
  }
  return JSON.parse(localStorage.getItem("itopper_all_student_submissions") || "[]");
};

