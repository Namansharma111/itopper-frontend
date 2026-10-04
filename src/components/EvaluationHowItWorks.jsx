import React, { useState } from "react";
import { 
  Edit3, 
  UploadCloud, 
  FileCheck2, 
  FileText, 
  Eye, 
  Printer, 
  Download, 
  X, 
  Sparkles,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SAMPLES = [
  {
    id: 1,
    title: "Sample 1 - GS Paper 1 Mains Evaluation",
    tag: "GS Paper 1",
    score: "112 / 250",
    date: "14 Sept 2026",
    pdfUrl: "/uploads/sample1.pdf",
    summary: "Detailed feedback on Modern History & Geography questions with diagram corrections.",
    samplePages: [
      {
        qNo: "Q1. Discuss the role of Women in Freedom Struggle.",
        marks: "11.5 / 15",
        feedback: "Good introduction detailing pre-1857 & 1920s phase. Added notes on Pritilata Waddedar and Usha Mehta for extra 2 marks."
      },
      {
        qNo: "Q2. Analyze the impact of climate change on Indian Monsoon.",
        marks: "9.0 / 15",
        feedback: "Structure is clear. Recommended adding an IOD (Indian Ocean Dipole) flowchart diagram."
      }
    ]
  },
  {
    id: 2,
    title: "Sample 2 - GS Paper 2 Governance & Polity",
    tag: "GS Paper 2",
    score: "118 / 250",
    date: "12 Sept 2026",
    pdfUrl: "/uploads/sample2.pdf",
    summary: "Evaluation focusing on Constitutional Articles, Supreme Court Landmarking judgments & Policy frameworks.",
    samplePages: [
      {
        qNo: "Q1. Examine Judicial Review in relation to Basic Structure Doctrine.",
        marks: "12.0 / 15",
        feedback: "Excellent citation of Kesavananda Bharati case and Minerva Mills judgment. Very well articulated!"
      },
      {
        qNo: "Q2. Role of Panchayati Raj institutions in rural governance.",
        marks: "10.5 / 15",
        feedback: "Solid coverage of 73rd Amendment. Added recommendation on financial autonomy of Gram Panchayats."
      }
    ]
  },
  {
    id: 3,
    title: "Sample 3 - Ethics & Case Studies Evaluation",
    tag: "GS Paper 4 Ethics",
    score: "126 / 250",
    date: "10 Sept 2026",
    pdfUrl: "/uploads/sample3.pdf",
    summary: "Comprehensive line-by-line review of Case Study stakeholder matrices and value frameworks.",
    samplePages: [
      {
        qNo: "Q1. Ethical dilemmas faced by a District Magistrate during communal tension.",
        marks: "14.0 / 20",
        feedback: "Stakeholder diagram is top-notch. Action plan balances rule of law with empathetic community dialogue."
      }
    ]
  }
];

const EvaluationHowItWorks = () => {
  const [selectedSample, setSelectedSample] = useState(null);
  const [loadingPdfKey, setLoadingPdfKey] = useState(null);

  const handleOpenPdf = (sample) => {
    const targetUrl = sample.pdfUrl || "/uploads/sample1.pdf";
    window.open(targetUrl, "_blank");
  };

  const handlePrintPdf = async (pdfUrl, btnKey) => {
    if (!pdfUrl) return;
    if (btnKey) setLoadingPdfKey(btnKey);

    try {
      let printFrame = document.getElementById("itopper-print-iframe");
      if (printFrame && document.body.contains(printFrame)) {
        document.body.removeChild(printFrame);
      }

      printFrame = document.createElement("iframe");
      printFrame.id = "itopper-print-iframe";
      printFrame.style.position = "fixed";
      printFrame.style.right = "-9999px";
      printFrame.style.bottom = "-9999px";
      printFrame.style.width = "1px";
      printFrame.style.height = "1px";
      printFrame.style.border = "0";

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

      let printed = false;
      printFrame.onload = () => {
        if (printed) return;
        printed = true;
        setTimeout(() => {
          try {
            printFrame.contentWindow.focus();
            printFrame.contentWindow.print();
          } catch (err) {
            console.error("Print iframe trigger error:", err);
          }
          setTimeout(() => {
            if (document.body.contains(printFrame)) {
              document.body.removeChild(printFrame);
            }
            if (frameSrc.startsWith("blob:")) {
              window.URL.revokeObjectURL(frameSrc);
            }
          }, 4000);
        }, 300);
      };

      document.body.appendChild(printFrame);
    } catch (err) {
      console.error("handlePrintPdf error:", err);
    } finally {
      setTimeout(() => setLoadingPdfKey(null), 1200);
    }
  };

  const handleDownloadPdf = async (pdfUrl, fileName, btnKey) => {
    if (!pdfUrl) return;
    if (btnKey) setLoadingPdfKey(btnKey);

    const cleanName = ((fileName || 'Document').replace(/[^a-zA-Z0-9_-]/g, "_") || "Evaluation_Sample") + "_iTopper.pdf";

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

  return (
    <div className="w-full bg-slate-50 font-sans selection:bg-[#EF961D]/20 overflow-hidden">
      {/* SECTION 1: HOW IT WORKS */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto text-center">
        {/* Underlined Header */}
        <div className="inline-block relative mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0a2968] tracking-tight pb-2">
            How It Works
          </h2>
          <div className="h-1 w-24 bg-[#0a2968] mx-auto rounded-full mt-1"></div>
        </div>

        {/* 3 Step Process Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
          {/* Step 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col items-center text-center group"
          >
            {/* Icon Circle */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white border-2 border-blue-100 shadow-md group-hover:shadow-xl group-hover:border-[#0a2968]/30 group-hover:-translate-y-1 transition-all duration-300 flex items-center justify-center mb-6 relative">
              <div className="w-14 h-14 rounded-2xl bg-blue-50/80 flex items-center justify-center">
                <Edit3 size={32} className="text-[#0a2968] group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="absolute -top-2 -right-2 bg-[#EF961D] text-white font-black text-xs w-7 h-7 rounded-full flex items-center justify-center shadow-xs">
                1
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-[#0a2968] mb-2 leading-snug">
              1. Write answers from any source
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm font-medium max-w-xs leading-relaxed">
              Write answers to questions from any source of your choice
            </p>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center text-center group"
          >
            {/* Icon Circle */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white border-2 border-blue-100 shadow-md group-hover:shadow-xl group-hover:border-[#0a2968]/30 group-hover:-translate-y-1 transition-all duration-300 flex items-center justify-center mb-6 relative">
              <div className="w-14 h-14 rounded-2xl bg-blue-50/80 flex items-center justify-center">
                <UploadCloud size={34} className="text-[#0a2968] group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="absolute -top-2 -right-2 bg-[#EF961D] text-white font-black text-xs w-7 h-7 rounded-full flex items-center justify-center shadow-xs">
                2
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-[#0a2968] mb-2 leading-snug">
              2. Upload it on the website
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm font-medium max-w-xs leading-relaxed">
              Upload them on our website itself through your personal dashboard
            </p>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col items-center text-center group"
          >
            {/* Icon Circle */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white border-2 border-blue-100 shadow-md group-hover:shadow-xl group-hover:border-[#0a2968]/30 group-hover:-translate-y-1 transition-all duration-300 flex items-center justify-center mb-6 relative">
              <div className="w-14 h-14 rounded-2xl bg-blue-50/80 flex items-center justify-center">
                <FileCheck2 size={34} className="text-[#0a2968] group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="absolute -top-2 -right-2 bg-[#EF961D] text-white font-black text-xs w-7 h-7 rounded-full flex items-center justify-center shadow-xs">
                3
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-[#0a2968] mb-2 leading-snug">
              3. Collect your evaluated papers
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm font-medium max-w-xs leading-relaxed">
              Your answers will get checked and appear on your dashboard
            </p>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: SAMPLE EVALUATIONS (iTOPPER Theme Dark Navy Banner) */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-[#0a2968] to-[#071d47] text-white px-4 sm:px-6 relative overflow-hidden">
        {/* Subtle background glow circles */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Header */}
          <div className="inline-block relative mb-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight pb-2">
              Sample Evaluations
            </h2>
            <div className="h-1 w-28 bg-[#EF961D] mx-auto rounded-full mt-1"></div>
          </div>

          <p className="text-slate-300 font-medium text-sm sm:text-base mb-12 sm:mb-16">
            Click on the PDF to check out sample evaluations
          </p>

          {/* 3 PDF Sample Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 max-w-4xl mx-auto">
            {SAMPLES.map((sample, idx) => (
              <motion.div
                key={sample.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="flex flex-col items-center group cursor-pointer"
                onClick={() => handleOpenPdf(sample)}
              >
                {/* PDF Paper Graphic (Matching Screenshot aesthetic in iTopper brand colors) */}
                <div className="relative w-36 h-44 sm:w-40 sm:h-48 bg-white rounded-2xl shadow-xl group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between p-4 overflow-hidden border-2 border-white/20">
                  {/* Top lines representing written paper */}
                  <div className="space-y-2 pt-2">
                    <div className="h-2 w-3/4 bg-slate-200 rounded-full"></div>
                    <div className="h-2 w-full bg-slate-100 rounded-full"></div>
                    <div className="h-2 w-5/6 bg-slate-100 rounded-full"></div>
                    <div className="h-2 w-2/3 bg-blue-100 rounded-full"></div>
                  </div>

                  {/* Evaluator Checkmark graphic overlay */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                    <CheckCircle2 size={24} className="text-emerald-600" />
                  </div>

                  {/* PDF Red/Orange Badge on bottom left */}
                  <div className="self-start px-2.5 py-1 bg-[#ef4444] text-white font-extrabold text-[11px] rounded-md tracking-wider shadow-xs uppercase flex items-center gap-1">
                    <FileText size={12} />
                    PDF
                  </div>

                  {/* Page fold corner effect */}
                  <div className="absolute top-0 right-0 w-8 h-8 bg-slate-100/90 border-b border-l border-slate-300 rounded-bl-lg shadow-xs"></div>
                </div>

                {/* Sample Button Box below card */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenPdf(sample);
                  }}
                  className="mt-6 px-6 py-2.5 bg-white/10 hover:bg-[#EF961D] text-white font-bold text-xs sm:text-sm rounded-xl border border-white/30 transition-all duration-200 shadow-sm uppercase tracking-wider group-hover:bg-[#EF961D] group-hover:border-[#EF961D]"
                >
                  Sample {sample.id}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SAMPLE EVALUATION PREVIEW MODAL */}
      <AnimatePresence>
        {selectedSample && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0a2968] text-white flex items-center justify-center shrink-0">
                    <FileText size={20} className="text-[#EF961D]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-blue-100 text-[#0a2968] font-bold text-[10px] rounded uppercase">
                        {selectedSample.tag}
                      </span>
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded uppercase">
                        Score: {selectedSample.score}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-[#0a2968] mt-0.5">
                      {selectedSample.title}
                    </h3>
                  </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={loadingPdfKey === "p_sample"}
                    onClick={() => handlePrintPdf(selectedSample.pdfUrl, "p_sample")}
                    className="px-3.5 py-2 bg-[#0a2968] hover:bg-[#EF961D] text-white disabled:opacity-70 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    {loadingPdfKey === "p_sample" ? (
                      <>
                        <Loader2 size={15} className="animate-spin text-white" /> Printing...
                      </>
                    ) : (
                      <>
                        <Printer size={15} /> Print (Ctrl + P)
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={loadingPdfKey === "d_sample"}
                    onClick={() => handleDownloadPdf(selectedSample.pdfUrl, selectedSample.title, "d_sample")}
                    className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 disabled:opacity-70 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {loadingPdfKey === "d_sample" ? (
                      <>
                        <Loader2 size={15} className="animate-spin text-slate-800" /> Downloading...
                      </>
                    ) : (
                      <>
                        <Download size={15} /> Download
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setSelectedSample(null)}
                    className="p-2 bg-slate-200 hover:bg-red-500 hover:text-white rounded-full text-slate-700 transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Sample Review Summary Bar */}
              <div className="px-5 py-3 bg-blue-50/70 border-b border-blue-100 text-xs font-medium text-slate-700 flex items-center gap-2">
                <Sparkles size={16} className="text-[#EF961D] shrink-0" />
                <span><strong>Evaluator Remarks Summary:</strong> {selectedSample.summary}</span>
              </div>

              {/* Modal Body - PDF Iframe Viewer */}
              <div className="flex-1 bg-slate-900 p-2 min-h-[480px]">
                <iframe
                  src={selectedSample.pdfUrl}
                  title="Sample Evaluation PDF"
                  className="w-full h-full min-h-[480px] rounded-2xl border-0"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EvaluationHowItWorks;
