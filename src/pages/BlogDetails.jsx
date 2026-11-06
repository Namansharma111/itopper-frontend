import React, { useEffect, useState } from "react";
import { sanitizeArticleHtml } from "../utils/blogContent";
import { applyBlogMetadata, blogPath } from "../utils/blogSeo";
import "../styles/blogContent.css";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Share2 } from "lucide-react";
import { getBlogById } from "../utils/blogStorage";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { toast } from "react-toastify";

const BlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    let active = true;
    setBlog(null);
    getBlogById(id).then(foundBlog => {
      if (!active) return;
      if (!foundBlog) { toast.error("Blog post not found."); navigate('/blogs', { replace: true }); return; }
      setBlog(foundBlog);
      const path = blogPath(foundBlog);
      if (window.location.pathname !== path) navigate(path, { replace: true });
    });
    return () => { active = false; };
  }, [id, navigate]);

  useEffect(() => {
    if (!blog) return;
    return applyBlogMetadata(blog);
  }, [blog]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  if (!blog) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#163F66] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen text-slate-800 font-sans flex flex-col relative overflow-hidden">
      {/* Navigation Layer */}
      <div className="absolute top-0 left-0 w-full z-50">
        <Navigation theme="light" />
      </div>

      {/* Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-50 blur-[130px] opacity-70"></div>
        <div className="absolute top-[30%] -right-[10%] w-[45%] h-[60%] rounded-full bg-orange-50 blur-[150px] opacity-60"></div>
      </div>

      {/* Main Content Area */}
      <main className="relative pt-32 pb-20 px-4 md:px-6 z-10 flex-grow max-w-4xl mx-auto w-full">
        {/* Back Button */}
        <Link
          to="/blogs"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#163F66] hover:text-[#EF961D] transition-colors mb-10 group"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          Back to Articles
        </Link>

        {/* Article Metadata Header */}
        <article className="space-y-6">
          <div className="space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#163F66] text-xs font-bold uppercase tracking-wider">
              {blog.category}
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#163F66] leading-tight tracking-tight">
              {blog.title}
            </h1>
            <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed italic">
              {blog.excerpt}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between border-y border-slate-100 py-4 gap-4">
            <div className="flex items-center gap-6 text-sm text-slate-500 font-bold">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-[#EF961D]" />
                <span>{blog.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-[#EF961D]" />
                <span>{blog.readTime}</span>
              </div>
            </div>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 hover:border-[#163F66] text-slate-600 hover:text-[#163F66] transition-colors rounded-full text-xs font-bold cursor-pointer"
            >
              <Share2 size={14} />
              Share Article
            </button>
          </div>

          {/* Featured Thumbnail */}
          {blog.image && (
            <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-[21/10] bg-slate-100 border border-slate-100">
              <img
                src={blog.image}
                alt={blog.imageAlt || blog.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article Body */}

          <div
            className="blog-article-content pt-8 pb-12"
            dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(blog.content) }}
          />
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default BlogDetails;
