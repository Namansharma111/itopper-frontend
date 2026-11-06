import { blogPath } from "../utils/blogSeo";
import React, { useState, useEffect } from "react";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { getBlogs } from "../utils/blogStorage";

const BlogsSection = () => {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    // Fetch published blogs for the public home page
    const fetchBlogsData = async () => {
      try {
        const allBlogs = await getBlogs();
        const publishedBlogs = allBlogs.filter((b) => b.published);
        setBlogs(publishedBlogs);
      } catch (err) {
        console.error("Failed to fetch blogs:", err);
      }
    };
    fetchBlogsData();
  }, []);

  const displayedBlogs = blogs.slice(0, 3);

  return (
    <section id="blogs" className="py-20 px-4 bg-white relative overflow-hidden border-b border-slate-100">
      {/* Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[30%] h-[40%] rounded-full bg-blue-50 blur-[100px] opacity-40"></div>
        <div className="absolute top-[40%] -right-[15%] w-[40%] h-[50%] rounded-full bg-orange-50 blur-[120px] opacity-50"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <span className="text-xs sm:text-sm font-extrabold tracking-widest text-[#EF961D] uppercase mb-3 block">
            iTOPPER INSIGHTS
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-[#163F66] tracking-tight mb-4">
            LATEST <span className="text-[#EF961D]">ARTICLES</span>
          </h2>
          <div className="w-16 h-[3px] bg-[#EF961D] mx-auto rounded-full shadow-sm"></div>
        </div>

        {/* Blog Cards Grid (Max 3) */}
        {blogs.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-medium">
            No articles published yet. Check back soon!
          </div>
        ) : (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 max-w-6xl mx-auto items-stretch">
              {displayedBlogs.map((blog, index) => {
                const blogId = blog._id || blog.id || index;
                return (
                  <motion.div
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    key={blogId}
                    className="flex flex-col bg-white rounded-[24px] border border-slate-200/80 hover:border-[#163F66]/30 shadow-sm hover:shadow-xl overflow-hidden group transition-all duration-300 h-full"
                  >
                    {/* Blog Image Container */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                      <img
                        src={blog.image || "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=400"}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
                      />

                      {/* Category badge */}
                      <span className="absolute top-4 left-4 bg-white border border-slate-200 px-3 py-1 rounded-lg text-[10px] font-black text-[#163F66] tracking-wider uppercase shadow-sm">
                        {blog.category}
                      </span>
                    </div>

                    {/* Blog Content */}
                    <div className="p-6 sm:p-7 flex flex-col flex-grow text-left">
                      {/* Metadata Row */}
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

                      {/* Title */}
                      <h3 className="text-lg font-black text-slate-900 leading-snug mb-3 pr-1 group-hover:text-[#163F66] transition-colors duration-300">
                        {blog.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-sm text-slate-500 font-semibold leading-relaxed mb-6 line-clamp-3">
                        {blog.excerpt}
                      </p>

                      {/* Read Link */}
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
                  </motion.div>
                );
              })}
            </div>

            {/* View More Button (If more than 3 blogs exist) */}
            {blogs.length > 3 && (
              <div className="text-center pt-4">
                <Link
                  to="/blogs"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-[#163F66] text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl hover:bg-[#EF961D] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  <span>View More Articles ({blogs.length - 3} More)</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogsSection;
