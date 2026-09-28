import React from "react";
import { Routes, Route, useLocation } from "react-router-dom"; // 👈 useLocation add kiya

// Toastify
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Context & Utils
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Public Components
import NewHero from "./components/NewHero";
import ProfessionalHero from "./components/ProfessionalHero";
import About from "./components/About";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import ChromaGrid from "./components/ChromaGrid";
import Courses from "./components/Courses";
import CoreValues from "./components/CoreValues";
import MeetOurFaculty from "./components/MeetOurFaculty";
import PopupModal from "./components/PopupModal";
import StudyWithMe from "./components/StudyWithMe";
import BlogsSection from "./components/BlogsSection";
import ContactSection from "./components/ContactSection";
import Testimonials from "./components/Testimonials";
import LeadFormSection from "./components/LeadFormSection";
import EvaluationHowItWorks from "./components/EvaluationHowItWorks";

// Course Components
import CourseCurriculum from "./components/CourseDetails";
import CourseDetails2 from "./components/CourseDetails2";

// Pages
import Programs from "./pages/Programs";
import BlogDetails from "./pages/BlogDetails";
import BlogsPage from "./pages/BlogsPage";
import AdminBlogsDashboard from "./pages/AdminBlogsDashboard";
import EvaluationPage from "./pages/EvaluationPage";
import DailyMainsPage from "./pages/DailyMainsPage";
import AdminPortal from "./pages/AdminPortal";

// Payment Pages
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";

// Student Components
import StudentLogin from "./pages/Login";
import StudentRegister from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import StudentDashboard from "./pages/StudentDashboard";

// Admin & Faculty Components
// import AdminDashboard from "./components/admin/Dashbaord";
// import AdminLogin from "./components/admin/AdminLogin";
// import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";
import FacultyLogin from "./components/faculty/FacultyLogin";
import FacultyForgotPassword from "./components/faculty/FacultyForgotPassword";
import FacultyRegister from "./components/faculty/FacultyRegister";
import FacultyDashboard from "./components/faculty/FacultyDashboard";
import AddClass from "./components/faculty/AddClass";
import EditClass from "./components/faculty/EditClass";

// Policies
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import RefundPolicy from "./pages/RefundPolicy";
import CancellationPolicy from "./pages/CancellationPolicy";
import AboutUsPage from "./pages/AboutUsPage";
import Navbar from "./components/Navigation";
import ScrollToTop from "./pages/ScrollToTop";
import FAQSection from "./components/Faq";

function App() {
  // Override global alert → Convert to toast
  window.alert = function (msg) {
    toast(msg);
  };

  //  LOCATION CHECK START
  const location = useLocation();

  // Check karein ki kya user Home Page ('/') par hai jahan NewHero hai?
  const isLandingPage = location.pathname === "/";
  const isProgramsPage = location.pathname === "/programs";
  const isLightModePage =
    isLandingPage ||
    isProgramsPage ||
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/forgot-password" ||
    location.pathname === "/blogs" ||
    location.pathname === "/evaluation" ||
    location.pathname === "/daily-mains-writing" ||
    location.pathname === "/my-courses" ||
    location.pathname.startsWith("/curriculum") ||
    location.pathname.startsWith("/blog/") ||
    location.pathname === "/adminitopper" ||
    location.pathname === "/adminitopperblog";
  const isAdminPage = location.pathname === "/adminitopper" || location.pathname === "/adminitopperblog";
  const isFacultyPage = location.pathname === "/faculty/dashboard";
  //  LOCATION CHECK END

  return (
    <AuthProvider>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastClassName="!bg-zinc-800 !text-white !font-sans !rounded-xl !shadow-2xl !border !border-white/5"
        progressClassName="!bg-gradient-to-r !from-pink-500 !via-red-500 !to-purple-600 !h-1.5"
        bodyClassName="!text-sm !font-medium"
      />

      <div className="app min-h-screen overflow-x-hidden flex flex-col bg-white text-slate-800">
        {/* 👇 GLOBAL Navigation: Sirf tab dikhega jab hum Landing Page par NAHI hain */}
        {!isLightModePage && !isAdminPage && !isFacultyPage && <Navbar theme="light" />}
        <ScrollToTop />
        {/* Content Area - Flex grow ensures footer sticks to bottom if content is short */}
        <div className="flex-grow">
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route
              path="/"
              element={
                <>
                  <PopupModal />
                  {/* Landing page has its own layout */}
                  {/* <NewHero /> */}
                  <ProfessionalHero />
                  {/* <About /> */}
                  <Courses />
                  <EvaluationHowItWorks />
                  {/* <CoreValues /> */}
                  {/* <StudyWithMe /> */}
                  <Testimonials />
                  <BlogsSection />
                  <LeadFormSection />
                  <ContactSection />
                  {/* <ChromaGrid /> */}
                  {/* <CTA /> */}
                  <Footer />
                </>
              }
            />

            <Route path="/programs" element={<Programs />} />
            <Route path="/blogs" element={<BlogsPage />} />
            <Route path="/evaluation" element={<EvaluationPage />} />
            <Route path="/daily-mains-writing" element={<DailyMainsPage />} />
            <Route path="/curriculum/:subject" element={<CourseCurriculum />} />
            <Route path="/course/:id" element={<CourseDetails2 />} />

            {/* STUDENT AUTH */}
            <Route path="/login" element={<StudentLogin />} />
            <Route path="/register" element={<StudentRegister />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* PROTECTED ROUTES */}
            <Route
              path="/my-courses"
              element={
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            {/* ADMIN ROUTES */}
            <Route path="/adminitopper" element={<AdminPortal />} />
            <Route path="/adminitopperblog" element={<AdminPortal initialTab="blogs" />} />
            {/* <Route path="/adminittopper" element={<AdminLogin />} /> */}
            {/* <Route path="/admin/login" element={<AdminLogin />} /> */}
            {/* <Route element={<AdminProtectedRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/*" element={<AdminDashboard />} />
            </Route> */}

            {/* BLOG DETAILS */}
            <Route path="/blog/:id" element={<BlogDetails />} />
            {/* FACULTY */}
            <Route path="/faculty/login" element={<FacultyLogin />} />
            <Route
              path="/faculty/forgot-password"
              element={<FacultyForgotPassword />}
            />
            <Route path="/faculty/register" element={<FacultyRegister />} />
            <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
            <Route path="/faculty/add-class" element={<AddClass />} />
            <Route path="/faculty/edit-class/:id" element={<EditClass />} />

            {/* POLICIES & ABOUT */}
            <Route path="/about" element={<AboutUsPage />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/refund" element={<RefundPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/cancellation" element={<CancellationPolicy />} />

            {/* PAYMENT ROUTES */}
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-failed" element={<PaymentFailed />} />

            {/* 404 PAGE */}
            <Route
              path="*"
              element={
                <div className="min-h-[70vh] flex items-center justify-center bg-white text-slate-800 px-4 py-16">
                  <div className="text-center max-w-md mx-auto animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-36 mx-auto mb-6">
                      <img src="/images/itopper.png" alt="iTopper Logo" className="w-full object-contain" />
                    </div>
                    <h1 className="text-8xl md:text-9xl font-black text-[#0a2968] tracking-tight">
                      404
                    </h1>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-[#0a2968] mt-3">
                      Page Not Found
                    </h2>
                    <p className="text-sm font-semibold text-slate-500 mt-2 leading-relaxed">
                      The page you are looking for does not exist or has been moved.
                    </p>
                    <a
                      href="/"
                      className="mt-8 inline-flex items-center justify-center px-8 py-3.5 bg-[#0a2968] hover:bg-[#EF961D] text-white rounded-xl text-sm font-extrabold transition-all shadow-md hover:shadow-lg uppercase tracking-wider"
                    >
                      Back to Home
                    </a>
                  </div>
                </div>
              }
            />
          </Routes>
        </div>

        {/* 👇 GLOBAL FOOTER: Ye bhi tabhi dikhega jab hum Landing Page par NAHI hain */}
        {/* Note: Landing Page ka footer upar <Route path="/"> ke andar already included hai */}
        {!isLightModePage && <Footer />}
      </div>
    </AuthProvider>
  );
}

export default App;
