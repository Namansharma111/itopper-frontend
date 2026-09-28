import { getApiUrl } from '../config/api';

const API_BASE = getApiUrl('/api/daily-mains');

export const DEFAULT_DAILY_MAINS = [
  {
    _id: "daily-mains-30day",
    title: "30-Day Mains Answer Writing Challenge & Micro-Test Program",
    category: "Daily Mains",
    paperTag: "30-Day Program",
    description: "Daily 1-on-1 Mains Answer Writing & Micro-Topic Practice. Day-wise sequential unlock based on daily answer submission.",
    features: [
      "Daily 1 Mains Question Paper & Answer Upload",
      "Strict Sequential Unlock: Day 2 opens only after Day 1 submission",
      "Day-by-Day Release starting from Purchase Date",
      "24-Hour Faculty Feedback & Score Matrix",
      "Comprehensive Model Answer Framework for All 30 Days"
    ],
    mrpPrice: 9999,
    finalPrice: 5999,
    duration: "30 Days Program",
    badge: "30 Days Challenge",
    purchaseUrl: "/daily-mains-writing",
    planPdf: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    planPdfTitle: "30-Day Mains Micro-Topics & Schedule Guide PDF",
    isDayWiseSchedule: true,
    totalDays: 30,
    published: true,
    order: 0,
    tests: Array.from({ length: 30 }, (_, i) => ({
      id: `daily-mains-d${i + 1}`,
      day: i + 1,
      testName: `Day ${i + 1}: Mains Question Paper & Micro-Topic Practice`,
      testTitle: `Day ${i + 1}: Mains Question Paper & Micro-Topic Practice`,
      questionPdf: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      textNote: `Daily task for Day ${i + 1}. Write answers on A4 sheet, scan to PDF and upload to unlock Day ${i + 2}.`
    }))
  },
  {
    _id: "daily-mains-60day",
    title: "60-Day Advanced Mains Masterclass & Answer Writing Program",
    category: "Daily Mains",
    paperTag: "60-Day Program",
    description: "Extended 60-Day Intensive Answer Writing covering GS 1 to 4 with daily line-by-line faculty evaluation & one-to-one mentorship calls.",
    features: [
      "60 Days Daily Mains Answer Writing & Personal Copy Review",
      "GS 1-4 Complete Micro-Topics & Case Studies Coverage",
      "Day-wise Sequential Unlock & Automated Progress Tracking",
      "One-on-One Weekly Strategy Calls with UPSC Toppers",
      "Complete Model Answers & Diagram Frameworks"
    ],
    mrpPrice: 15999,
    finalPrice: 8999,
    duration: "60 Days Program",
    badge: "Masterclass",
    purchaseUrl: "/daily-mains-writing",
    planPdf: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    planPdfTitle: "60-Day Mains Masterclass Syllabus & Micro-Topics Guide PDF",
    isDayWiseSchedule: true,
    totalDays: 60,
    published: true,
    order: 1,
    tests: Array.from({ length: 60 }, (_, i) => ({
      id: `daily-mains-60d-${i + 1}`,
      day: i + 1,
      testName: `Day ${i + 1}: GS Mains Advanced Micro-Test Paper`,
      testTitle: `Day ${i + 1}: GS Mains Advanced Micro-Test Paper`,
      questionPdf: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      textNote: `Daily Mains task for Day ${i + 1}. Upload scanned answer PDF to proceed to Day ${i + 2}.`
    }))
  }
];

export const getDailyMains = async (isAdmin = false) => {
  try {
    const res = await fetch(`${API_BASE}${isAdmin ? '?admin=true' : ''}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem("itopper_daily_mains_cache", JSON.stringify(data));
        return data;
      }
    }
  } catch (err) {
    console.warn("Backend daily mains API unreachable, checking local cache:", err.message);
  }

  const cached = localStorage.getItem("itopper_daily_mains_cache");
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.error("Cache parse error:", e);
    }
  }

  return DEFAULT_DAILY_MAINS;
};

export const addDailyMains = async (itemData) => {
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
    console.warn("API add daily mains failed, fallback to local cache:", err.message);
  }

  const current = await getDailyMains(true);
  const newItem = {
    ...itemData,
    _id: "daily-mains-" + Date.now(),
    createdAt: new Date().toISOString()
  };
  const updated = [newItem, ...current];
  localStorage.setItem("itopper_daily_mains_cache", JSON.stringify(updated));
  return newItem;
};

export const updateDailyMains = async (id, itemData) => {
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
    console.warn("API update daily mains failed, fallback to local cache:", err.message);
  }

  const current = await getDailyMains(true);
  const updated = current.map(item => (item._id === id || item.id === id) ? { ...item, ...itemData } : item);
  localStorage.setItem("itopper_daily_mains_cache", JSON.stringify(updated));
  return updated.find(item => item._id === id || item.id === id);
};

export const deleteDailyMains = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      return true;
    }
  } catch (err) {
    console.warn("API delete daily mains failed, fallback to local cache:", err.message);
  }

  const current = await getDailyMains(true);
  const updated = current.filter(item => item._id !== id && item.id !== id);
  localStorage.setItem("itopper_daily_mains_cache", JSON.stringify(updated));
  return true;
};
