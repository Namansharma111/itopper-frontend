import { blogPath } from "../utils/blogSeo";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock, Search, BookOpen, ArrowLeft } from "lucide-react";
import { getBlogs } from "../utils/blogStorage";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

const BlogsPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchAllBlogs = async () => {
      setLoading(true);
      try {
        const data = await getBlogs();
        const published = data.filter((b) => b.published);
        setBlogs(published);
      } catch (err) {
        console.error("Failed to load blogs page:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllBlogs();
  }, []);

  const categories = ["All", ...new Set(blogs.map((b) => b.category).filter(Boolean))];

  const filteredBlogs = blogs.filter((blog) => {
    const matchesCategory = selectedCategory === "All" || blog.category === selectedCategory;
    const matchesSearch =
      blog.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-white min-h-screen text-slate-800 font-sans flex flex-col relative overflow-hidden">
      {/* Navigation */}
      <div className="absolute top-0 left-0 w-full z-50">
        <Navigation theme="light" />
      </div>

      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[45%] h-[45%] rounded-full bg-blue-50 blur-[140px] opacity-70"></div>
        <div className="absolute top-[35%] -right-[10%] w-[45%] h-[55%] rounded-full bg-orange-50 blur-[150px] opacity-60"></div>
      </div>

      {/* Main Content */}
      <main className="relative pt-32 pb-24 px-4 md:px-6 z-10 flex-grow max-w-7xl mx-auto w-full">
        {/* Breadcrumb Navigation */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#163F66] hover:text-[#EF961D] transition-colors group"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>
        </div>

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[#163F66] text-xs font-black uppercase tracking-widest mb-4">
            iTOPPER KNOWLEDGE HUB
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#163F66] tracking-tight mb-6">
            All Articles & <span className="text-[#EF961D]">Insights</span>
          </h1>
          <p className="text-slate-500 text-lg font-medium leading-relaxed">
            Stay ahead in your preparation with expert answer writing strategies, exam updates, syllabus breakdowns, and guidance.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="mb-12 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50 border border-slate-200 p-4 md:p-6 rounded-3xl shadow-sm">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles by keyword..."
              className="w-full bg-white border border-slate-200 focus:border-[#163F66] rounded-2xl pl-12 pr-4 py-3 text-slate-800 outline-none transition-all font-semibold text-sm shadow-xs"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#163F66] text-white shadow-md"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-[#163F66] hover:text-[#163F66]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Cards Grid */}
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <div className="w-10 h-10 border-4 border-[#163F66] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-200">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-bold text-lg mb-1">No articles found</p>
            <p className="text-slate-400 text-sm">Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {filteredBlogs.map((blog, index) => {
              const blogId = blog._id || blog.id || index;
              return (
                <div
                  key={blogId}
                  className="flex flex-col bg-white rounded-[24px] border border-slate-200/80 hover:border-[#163F66]/30 shadow-sm hover:shadow-xl overflow-hidden group transition-all duration-300 h-full"
                >
                  {/* Blog Image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    <img
                      src={blog.image || "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=400"}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
                    />
                    <span className="absolute top-4 left-4 bg-white border border-slate-200 px-3 py-1 rounded-lg text-[10px] font-black text-[#163F66] tracking-wider uppercase shadow-sm">
                      {blog.category}
                    </span>
                  </div>

                  {/* Blog Content */}
                  <div className="p-6 sm:p-7 flex flex-col flex-grow text-left">
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400 mb-3.5">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-[#EF961D]" />
                        <span>{blog.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-[#EF961D]" />
                        <span>{blog.readTime}</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-black text-slate-900 leading-snug mb-3 pr-1 group-hover:text-[#163F66] transition-colors duration-300">
                      {blog.title}
                    </h3>

                    <p className="text-sm text-slate-500 font-semibold leading-relaxed mb-6 line-clamp-3">
                      {blog.excerpt}
                    </p>

                    <div className="mt-auto pt-4 border-t border-slate-100">
                      <Link
                        to={blogPath(blog)}
                        className="inline-flex items-center gap-2 text-sm font-black text-[#163F66] hover:text-[#EF961D] transition-colors duration-300 group/btn"
                      >
                        <span>Read Full Article</span>
                        <ArrowRight size={13} className="stroke-[3] transition-transform duration-300 group-hover/btn:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BlogsPage;
