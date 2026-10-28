import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Palette,
  Type,
  Code,
  Quote,
  Eraser,
} from "lucide-react";
import { getBlogs, addBlog, updateBlog, deleteBlog } from "../utils/blogStorage";
import { getApiUrl } from "../config/api";

const AdminBlogsDashboard = () => {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem("admin_blog_auth") === "true"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const [blogs, setBlogs] = useState([]);
  const [blogLoading, setBlogLoading] = useState(false);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);

  // Blog Form States
  const [blogTitle, setBlogTitle] = useState("");
  const [blogCategory, setBlogCategory] = useState("Strategy");
  const [blogReadTime, setBlogReadTime] = useState("5 min read");
  const [blogExcerpt, setBlogExcerpt] = useState("");
  const [blogImage, setBlogImage] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [blogPublished, setBlogPublished] = useState(true);

  // Upload state
  const [imageInputMethod, setImageInputMethod] = useState("upload"); // 'upload' or 'url'
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // SEO fields
  const [seoTitle, setSeoTitle] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");

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

  useEffect(() => {
    if (isAuthenticated) {
      fetchBlogs();
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      // Upload directly to Cloudinary via backend /api/upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'itopper_blogs');

      const token = localStorage.getItem('token');
      const res = await fetch(getApiUrl('/api/upload'), {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Upload failed (${res.status})`);
      }

      const data = await res.json();
      if (data.url) {
        setBlogImage(data.url); // Permanent Cloudinary HTTPS URL
      } else {
        throw new Error('No URL returned from upload');
      }
    } catch (err) {
      console.error('Image upload error:', err);
      alert(`❌ Image upload failed: ${err.message}\n\nInternet connection ya backend check karein.`);
    } finally {
      setIsUploadingImage(false);
      // Reset file input so same file can be re-selected if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
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
    setImageInputMethod("upload");
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
  };

  const handleSaveBlog = async () => {
    if (!blogTitle.trim() || !blogExcerpt.trim() || !blogContent.trim()) {
      alert("Please fill in the title, excerpt, and content.");
      return;
    }
    setIsSaving(true);
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
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err?.message || "Unknown error";
      if (status === 401 || status === 403) {
        alert(`❌ Auth Error (${status}): ${msg}\n\nAdmin token expired ya invalid hai. Logout karke dobara login karein.`);
      } else if (status === 500) {
        alert(`❌ Server Error: ${msg}\n\nBackend mein kuch gadbad hai. Backend logs check karein.`);
      } else {
        alert(`❌ Blog save nahi hua!\n\nError: ${msg}\n\nStatus: ${status || "Network Error"}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans selection:bg-[#EF961D]/20">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="text-center mb-8">
            <div className="w-48 sm:w-56 mx-auto mb-4 flex items-center justify-center">
              <img
                src="/images/itopper.png"
                alt="iTopper Logo"
                className="w-full object-contain"
              />
            </div>
            <div className="inline-block px-3 py-1 bg-[#163F66]/10 text-[#163F66] text-xs font-black rounded-lg mb-2 uppercase tracking-wider">
              Blog Manager Access
            </div>
            <h2 className="text-2xl font-black text-[#163F66] tracking-tight">Admin Login</h2>
            <p className="text-xs text-slate-500 mt-1">Enter your admin credentials to manage blogs</p>
          </div>

          {authError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-600 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#163F66] mb-2 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="itopper@gmail.com"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#163F66] focus:bg-white rounded-xl pl-12 pr-4 py-3.5 text-slate-800 outline-none transition-all font-semibold text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#163F66] mb-2 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#163F66] focus:bg-white rounded-xl pl-12 pr-4 py-3.5 text-slate-800 outline-none transition-all font-semibold text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-4 bg-[#163F66] text-white hover:bg-[#EF961D] rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {authLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Sign In to Blog Manager"
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <Link
              to="/"
              className="text-xs font-bold text-slate-400 hover:text-[#163F66] inline-flex items-center gap-1 transition-colors"
            >
              ← Back to Main Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-[#EF961D]/20">
      {/* TOPBAR */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <img
              src="/images/itopper.png"
              alt="iTopper Logo"
              className="h-12 sm:h-14 md:h-16 object-contain"
            />
            <span className="bg-[#163F66]/10 text-[#163F66] text-xs sm:text-sm font-black px-3.5 py-1.5 rounded-xl border border-[#163F66]/15 uppercase tracking-wider">
              Blog Manager
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              id="view-website-btn"
              className="flex items-center gap-2 text-xs font-bold text-[#163F66] hover:text-[#EF961D] px-4 py-2 border border-slate-200 rounded-full hover:bg-slate-50 transition-all shadow-sm"
            >
              Go to Website <ExternalLink size={12} />
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 px-4 py-2 border border-red-200 rounded-full hover:bg-red-50 transition-all shadow-sm cursor-pointer"
            >
              <LogOut size={13} /> Logout
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-[#163F66]">Blog Articles</h2>
              <p className="text-sm text-slate-500 mt-1">Publish, edit, and optimize articles for SEO</p>
            </div>
            <button
              onClick={() => {
                resetBlogForm();
                setShowBlogForm(true);
              }}
              id="new-article-btn"
              className="flex items-center gap-2 px-6 py-3 bg-[#163F66] text-white hover:bg-[#EF961D] rounded-full font-bold shadow-md hover:shadow-lg hover:scale-103 transition-all cursor-pointer"
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
                  className="group bg-white rounded-3xl border border-slate-200/80 hover:border-[#163F66]/30 hover:shadow-xl transition-all flex flex-col overflow-hidden shadow-sm"
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
                          setImageInputMethod(b.image?.startsWith("data:") ? "upload" : "url");
                          setShowBlogForm(true);
                        }}
                        className="p-2 bg-white/95 rounded-full text-slate-800 hover:bg-[#163F66] hover:text-white border border-slate-200 shadow-md cursor-pointer transition-colors"
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
                              alert("Failed to delete article. Please check your admin login.");
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
                      <h3 className="text-xl font-bold text-[#163F66] mb-2 line-clamp-2">
                        {b.title}
                      </h3>
                      <p className="text-slate-500 text-sm line-clamp-3 mb-4 font-semibold leading-relaxed">
                        {b.excerpt}
                      </p>
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400 font-bold">
                      <span>{b.date}</span>
                      <Link to={`/blog/${b._id || b.id}`} className="text-[#163F66] hover:text-[#EF961D] font-bold flex items-center gap-1 transition-colors">
                        View Live <ExternalLink size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* WRITE / EDIT BLOG FORM SIDE PANEL */}
      {showBlogForm && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setShowBlogForm(false)}
          ></div>
          <div className="relative w-full max-w-5xl bg-white h-full shadow-2xl overflow-y-auto border-l border-slate-200 animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="sticky top-0 bg-white border-b border-slate-150 p-6 flex justify-between items-center z-20 shadow-sm">
              <div>
                <h2 className="text-2xl font-black text-[#163F66]">
                  {editingBlog ? "Edit Article" : "Write New Article"}
                </h2>
              </div>
              <button
                onClick={() => setShowBlogForm(false)}
                className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-450 hover:text-black cursor-pointer border border-slate-200"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-8 flex-grow">
              <style>{`
                .rich-editor-content:focus { outline: none; }
                .rich-editor-content h1 { font-size: 2rem; font-weight: 800; margin-top: 1.25rem; margin-bottom: 0.5rem; color: #163F66; }
                .rich-editor-content h2 { font-size: 1.6rem; font-weight: 700; margin-top: 1rem; margin-bottom: 0.4rem; color: #163F66; }
                .rich-editor-content h3 { font-size: 1.3rem; font-weight: 700; margin-top: 0.8rem; margin-bottom: 0.3rem; color: #163F66; }
                .rich-editor-content h4 { font-size: 1.1rem; font-weight: 700; margin-top: 0.6rem; margin-bottom: 0.3rem; color: #163F66; }
                .rich-editor-content p { margin-bottom: 0.75rem; color: #334155; line-height: 1.65; font-size: 1rem; }
                .rich-editor-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 0.75rem; color: #334155; }
                .rich-editor-content ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 0.75rem; color: #334155; }
                .rich-editor-content blockquote { border-left: 4px solid #EF961D; padding-left: 1rem; font-style: italic; margin: 1rem 0; color: #475569; background-color: #f8fafc; padding-top: 0.5rem; padding-bottom: 0.5rem; border-radius: 0 0.5rem 0.5rem 0; }
                .rich-editor-content pre { background-color: #0f172a; color: #f8fafc; padding: 1rem; border-radius: 0.75rem; font-family: monospace; overflow-x: auto; margin-bottom: 1rem; }
                .rich-editor-content img { border-radius: 0.75rem; margin: 1rem auto; max-width: 100%; display: block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
                .rich-editor-content a { color: #2563eb; text-decoration: underline; font-weight: 600; }
                .rich-editor-content hr { border: 0; border-top: 2px solid #e2e8f0; margin: 1.5rem 0; }
                .rich-editor-content font[size="1"] { font-size: 12px; }
                .rich-editor-content font[size="2"] { font-size: 14px; }
                .rich-editor-content font[size="3"] { font-size: 16px; }
                .rich-editor-content font[size="4"] { font-size: 18px; }
                .rich-editor-content font[size="5"] { font-size: 24px; }
                .rich-editor-content font[size="6"] { font-size: 32px; }
                .rich-editor-content font[size="7"] { font-size: 48px; }
              `}</style>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-[#163F66] mb-2">Title</label>
                    <input
                      type="text"
                      value={blogTitle}
                      onChange={(e) => setBlogTitle(e.target.value)}
                      placeholder="e.g. Mastering Mains Answer Writing"
                      className="w-full bg-slate-50 border border-slate-250 focus:border-[#163F66] focus:bg-white rounded-xl px-4 py-3 text-slate-800 outline-none transition-all font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#163F66] mb-2">Excerpt / Subtitle</label>
                    <textarea
                      value={blogExcerpt}
                      onChange={(e) => setBlogExcerpt(e.target.value)}
                      placeholder="Short summary displayed on the blog card list..."
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-250 focus:border-[#163F66] focus:bg-white rounded-xl px-4 py-3 text-slate-800 outline-none transition-all resize-none font-semibold leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#163F66] mb-2">Article Body Content</label>
                    <div className="border border-slate-250 rounded-2xl overflow-hidden bg-white shadow-sm">
                      {/* RICH EDITOR TOOLBAR */}
                      <div className="flex flex-wrap items-center gap-1.5 p-2.5 bg-slate-50 border-b border-slate-200">
                        {/* Font Family */}
                        <select
                          onChange={(e) => {
                            executeCommand("fontName", e.target.value);
                            e.target.selectedIndex = 0;
                          }}
                          className="h-8 text-xs font-semibold bg-white border border-slate-250 rounded-lg px-2 outline-none cursor-pointer hover:border-[#163F66]"
                          title="Font Family"
                        >
                          <option value="" disabled selected>Font</option>
                          <option value="sans-serif">Sans-Serif</option>
                          <option value="serif">Serif</option>
                          <option value="monospace">Monospace</option>
                          <option value="Arial">Arial</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Roboto">Roboto</option>
                          <option value="Verdana">Verdana</option>
                        </select>

                        {/* Font Size */}
                        <select
                          onChange={(e) => {
                            executeCommand("fontSize", e.target.value);
                            e.target.selectedIndex = 0;
                          }}
                          className="h-8 text-xs font-semibold bg-white border border-slate-250 rounded-lg px-2 outline-none cursor-pointer hover:border-[#163F66]"
                          title="Font Size"
                        >
                          <option value="" disabled selected>Size</option>
                          <option value="1">12px (Small)</option>
                          <option value="2">14px (Normal)</option>
                          <option value="3">16px (Medium)</option>
                          <option value="4">18px (Large)</option>
                          <option value="5">24px (XL)</option>
                          <option value="6">32px (XXL)</option>
                        </select>

                        {/* Heading / Block Format */}
                        <select
                          onChange={(e) => {
                            executeCommand("formatBlock", `<${e.target.value}>`);
                            e.target.selectedIndex = 0;
                          }}
                          className="h-8 text-xs font-semibold bg-white border border-slate-250 rounded-lg px-2 outline-none cursor-pointer hover:border-[#163F66]"
                          title="Format Block"
                        >
                          <option value="" disabled selected>Format</option>
                          <option value="p">Paragraph</option>
                          <option value="h1">Heading 1</option>
                          <option value="h2">Heading 2</option>
                          <option value="h3">Heading 3</option>
                          <option value="h4">Heading 4</option>
                          <option value="blockquote">Quote</option>
                          <option value="pre">Code Block</option>
                        </select>

                        <div className="h-6 w-px bg-slate-200 mx-1" />

                        {/* Formatting Buttons */}
                        <button
                          type="button"
                          onClick={() => executeCommand("bold")}
                          className="p-1.5 hover:bg-[#163F66]/10 rounded text-slate-700 font-bold w-8 h-8 flex items-center justify-center text-sm cursor-pointer"
                          title="Bold (Ctrl+B)"
                        >
                          <Bold size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => executeCommand("italic")}
                          className="p-1.5 hover:bg-[#163F66]/10 rounded text-slate-700 italic w-8 h-8 flex items-center justify-center text-sm cursor-pointer"
                          title="Italic (Ctrl+I)"
                        >
                          <Italic size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => executeCommand("underline")}
                          className="p-1.5 hover:bg-[#163F66]/10 rounded text-slate-700 underline w-8 h-8 flex items-center justify-center text-sm cursor-pointer"
                          title="Underline (Ctrl+U)"
                        >
                          <Underline size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => executeCommand("strikeThrough")}
                          className="p-1.5 hover:bg-[#163F66]/10 rounded text-slate-700 line-through w-8 h-8 flex items-center justify-center text-sm cursor-pointer"
                          title="Strikethrough"
                        >
                          <Strikethrough size={15} />
                        </button>

                        <div className="h-6 w-px bg-slate-200 mx-1" />

                        {/* Text Color Picker */}
                        <div className="relative flex items-center gap-1 bg-white border border-slate-250 rounded-lg px-2 h-8" title="Text Color">
                          <span className="text-xs font-bold text-slate-700">Color:</span>
                          <input
                            type="color"
                            onChange={(e) => executeCommand("foreColor", e.target.value)}
                            className="w-5 h-5 cursor-pointer border-0 bg-transparent p-0"
                          />
                        </div>

                        {/* Highlight / Background Color Picker */}
                        <div className="relative flex items-center gap-1 bg-white border border-slate-250 rounded-lg px-2 h-8" title="Highlight Color">
                          <span className="text-xs font-bold text-slate-700 bg-yellow-200 px-1 rounded">Bg:</span>
                          <input
                            type="color"
                            defaultValue="#ffff00"
                            onChange={(e) => executeCommand("hiliteColor", e.target.value)}
                            className="w-5 h-5 cursor-pointer border-0 bg-transparent p-0"
                          />
                        </div>

                        <div className="h-6 w-px bg-slate-200 mx-1" />

                        {/* Text Alignment */}
                        <button
                          type="button"
                          onClick={() => executeCommand("justifyLeft")}
                          className="p-1.5 hover:bg-[#163F66]/10 rounded text-slate-700 font-bold w-8 h-8 flex items-center justify-center cursor-pointer"
                          title="Align Left"
                        >
                          <AlignLeft size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => executeCommand("justifyCenter")}
                          className="p-1.5 hover:bg-[#163F66]/10 rounded text-slate-700 font-bold w-8 h-8 flex items-center justify-center cursor-pointer"
                          title="Align Center"
                        >
                          <AlignCenter size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => executeCommand("justifyRight")}
                          className="p-1.5 hover:bg-[#163F66]/10 rounded text-slate-700 font-bold w-8 h-8 flex items-center justify-center cursor-pointer"
                          title="Align Right"
                        >
                          <AlignRight size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => executeCommand("justifyFull")}
                          className="p-1.5 hover:bg-[#163F66]/10 rounded text-slate-700 font-bold w-8 h-8 flex items-center justify-center cursor-pointer"
                          title="Justify"
                        >
                          <AlignJustify size={15} />
                        </button>

                        <div className="h-6 w-px bg-slate-200 mx-1" />

                        {/* Lists */}
                        <button
                          type="button"
                          onClick={() => executeCommand("insertUnorderedList")}
                          className="p-1.5 hover:bg-[#163F66]/10 rounded text-slate-700 font-bold w-8 h-8 flex items-center justify-center cursor-pointer"
                          title="Bullet List"
                        >
                          <List size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => executeCommand("insertOrderedList")}
                          className="p-1.5 hover:bg-[#163F66]/10 rounded text-slate-700 font-bold w-8 h-8 flex items-center justify-center cursor-pointer"
                          title="Numbered List"
                        >
                          <ListOrdered size={15} />
                        </button>

                        <div className="h-6 w-px bg-slate-200 mx-1" />

                        {/* Links */}
                        <button
                          type="button"
                          onClick={() => {
                            const url = prompt("Enter link URL (e.g. https://itopper.com):");
                            if (url) executeCommand("createLink", url);
                          }}
                          className="p-1.5 hover:bg-[#163F66]/10 rounded text-slate-700 font-bold h-8 px-2 flex items-center gap-1 text-xs cursor-pointer"
                          title="Insert Link"
                        >
                          <LinkIcon size={14} /> Link
                        </button>
                        <button
                          type="button"
                          onClick={() => executeCommand("unlink")}
                          className="p-1.5 hover:bg-[#163F66]/10 rounded text-slate-700 font-bold h-8 px-2 flex items-center gap-1 text-xs cursor-pointer"
                          title="Remove Link"
                        >
                          <Unlink size={14} />
                        </button>

                        <div className="h-6 w-px bg-slate-200 mx-1" />

                        {/* Image Insert */}
                        <button
                          type="button"
                          onClick={() => {
                            const url = prompt("Enter image URL:");
                            if (url) executeCommand("insertImage", url);
                          }}
                          className="p-1.5 hover:bg-[#163F66]/10 rounded text-slate-700 font-bold h-8 px-2 flex items-center gap-1 text-xs cursor-pointer"
                          title="Insert Image URL"
                        >
                          <ImageIcon size={14} /> Image
                        </button>

                        {/* Divider Line */}
                        <button
                          type="button"
                          onClick={() => executeCommand("insertHorizontalRule")}
                          className="p-1.5 hover:bg-[#163F66]/10 rounded text-slate-700 font-bold h-8 px-2 flex items-center gap-1 text-xs cursor-pointer"
                          title="Horizontal Line"
                        >
                          <Minus size={14} /> HR
                        </button>

                        <div className="h-6 w-px bg-slate-200 mx-1" />

                        {/* Undo / Redo & Clear Format */}
                        <button
                          type="button"
                          onClick={() => executeCommand("undo")}
                          className="p-1.5 hover:bg-[#163F66]/10 rounded text-slate-700 font-bold w-8 h-8 flex items-center justify-center cursor-pointer"
                          title="Undo"
                        >
                          <Undo size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => executeCommand("redo")}
                          className="p-1.5 hover:bg-[#163F66]/10 rounded text-slate-700 font-bold w-8 h-8 flex items-center justify-center cursor-pointer"
                          title="Redo"
                        >
                          <Redo size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => executeCommand("removeFormat")}
                          className="p-1.5 hover:bg-[#163F66]/10 rounded text-slate-700 font-bold w-8 h-8 flex items-center justify-center cursor-pointer"
                          title="Clear Formatting"
                        >
                          <Eraser size={14} />
                        </button>
                      </div>

                      <div
                        ref={editorRef}
                        contentEditable
                        onInput={(e) => setBlogContent(e.currentTarget.innerHTML)}
                        className="rich-editor-content min-h-[350px] max-h-[500px] overflow-y-auto p-5 text-slate-800 bg-white font-sans text-base leading-relaxed"
                        placeholder="Write article details here..."
                        style={{ outline: "none" }}
                      />
                    </div>
                  </div>

                  {/* SEO Configuration Section */}
                  <div className="p-6 bg-slate-50 border border-slate-250 rounded-2xl space-y-4">
                    <h3 className="text-lg font-bold text-[#163F66] flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#EF961D]"></span>
                      SEO Optimization Details
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">SEO Title Meta Tag</label>
                        <input
                          type="text"
                          value={seoTitle}
                          onChange={(e) => setSeoTitle(e.target.value)}
                          placeholder="e.g. Master Answer Writing for UPSC | iTopper Guide"
                          className="w-full bg-white border border-slate-250 focus:border-[#163F66] rounded-xl px-4 py-3 text-slate-800 text-sm outline-none font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Meta Keywords (Comma separated)</label>
                        <input
                          type="text"
                          value={seoKeywords}
                          onChange={(e) => setSeoKeywords(e.target.value)}
                          placeholder="upsc, answer writing, gs, mains preparation, exam strategy"
                          className="w-full bg-white border border-slate-250 focus:border-[#163F66] rounded-xl px-4 py-3 text-slate-800 text-sm outline-none font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-[#163F66] mb-2">Category</label>
                    <select
                      value={blogCategory}
                      onChange={(e) => setBlogCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-250 focus:border-[#163F66] rounded-xl px-4 py-3 text-slate-800 outline-none font-semibold"
                    >
                      <option value="Strategy">Strategy</option>
                      <option value="Syllabus Guide">Syllabus Guide</option>
                      <option value="Current Affairs">Current Affairs</option>
                      <option value="Mentorship">Mentorship</option>
                      <option value="UPSC GS">UPSC GS</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#163F66] mb-2">Read Time</label>
                    <input
                      type="text"
                      value={blogReadTime}
                      onChange={(e) => setBlogReadTime(e.target.value)}
                      placeholder="e.g. 5 min read"
                      className="w-full bg-slate-50 border border-slate-250 focus:border-[#163F66] rounded-xl px-4 py-3 text-slate-800 outline-none font-semibold"
                    />
                  </div>

                  {/* FEATURED IMAGE UPLOADER */}
                  <div>
                    <label className="block text-sm font-bold text-[#163F66] mb-2">Featured Image</label>
                    <div className="flex gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => setImageInputMethod("upload")}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${imageInputMethod === 'upload' ? 'bg-[#163F66] text-white border-[#163F66]' : 'bg-slate-50 border-slate-250 text-slate-650 hover:bg-slate-100'}`}
                      >
                        <Upload size={13} /> Upload File
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageInputMethod("url")}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${imageInputMethod === 'url' ? 'bg-[#163F66] text-white border-[#163F66]' : 'bg-slate-50 border-slate-250 text-slate-650 hover:bg-slate-100'}`}
                      >
                        <Link2 size={13} /> Image URL
                      </button>
                    </div>

                    {/* Upload box — sirf tab dikhao jab image nahi hai ya upload ho rahi hai */}
                    {imageInputMethod === "upload" ? (
                      !blogImage || isUploadingImage ? (
                        <div
                          onClick={() => !isUploadingImage && fileInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-2 group min-h-[140px] transition-all ${
                            isUploadingImage
                              ? 'border-[#163F66]/50 bg-blue-50 cursor-wait'
                              : 'border-slate-250 hover:bg-slate-50 hover:border-[#163F66]/40 cursor-pointer'
                          }`}
                        >
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            className="hidden"
                            disabled={isUploadingImage}
                          />
                          {isUploadingImage ? (
                            <>
                              <div className="relative">
                                <Loader2 className="w-10 h-10 text-[#163F66] animate-spin" />
                              </div>
                              <span className="text-sm font-bold text-[#163F66]">Image upload ho rahi hai...</span>
                              <span className="text-[11px] text-slate-500 font-medium">Cloudinary pe save ho rahi hai, please wait ✨</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-8 h-8 text-slate-400 group-hover:text-[#163F66] transition-colors" />
                              <span className="text-xs font-bold text-[#163F66]">Click to upload image file</span>
                              <span className="text-[10px] text-slate-450 leading-tight">PNG, JPG, or WEBP — Cloudinary pe permanently save hogi</span>
                            </>
                          )}
                        </div>
                      ) : (
                        /* Image upload ho gayi — preview dikhao with cross + change option */
                        <div className="rounded-2xl overflow-hidden border-2 border-green-300 bg-green-50 relative">
                          {/* Success badge */}
                          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-green-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md">
                            <Check size={11} /> Uploaded!
                          </div>
                          {/* Cross button — always visible */}
                          <button
                            type="button"
                            onClick={() => {
                              setBlogImage("");
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="absolute top-3 right-3 z-10 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition-colors"
                            title="Remove image"
                          >
                            <X size={14} />
                          </button>
                          {/* Image preview */}
                          <div className="aspect-video w-full bg-slate-100">
                            <img src={blogImage} alt="Uploaded Preview" className="w-full h-full object-cover" />
                          </div>
                          {/* Change image button */}
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center justify-center gap-2 py-2.5 bg-white border-t-2 border-green-200 text-xs font-bold text-slate-500 hover:text-[#163F66] hover:bg-slate-50 cursor-pointer transition-colors"
                          >
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleImageUpload}
                              accept="image/*"
                              className="hidden"
                            />
                            <Upload size={12} /> Alag image upload karo
                          </div>
                        </div>
                      )
                    ) : (
                      <input
                        type="text"
                        value={blogImage}
                        onChange={(e) => setBlogImage(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-slate-50 border border-slate-250 focus:border-[#163F66] rounded-xl px-4 py-3 text-slate-800 text-sm outline-none font-semibold"
                      />
                    )}

                    {/* URL mode mein bhi preview dikhao */}
                    {imageInputMethod === "url" && blogImage && (
                      <div className="mt-3 rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-50 relative">
                        <div className="aspect-video w-full bg-slate-100">
                          <img src={blogImage} alt="URL Preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display='none'; }} />
                        </div>
                        <button
                          type="button"
                          onClick={() => setBlogImage("")}
                          className="absolute top-3 right-3 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition-colors"
                          title="Remove image"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#163F66]">Publish Directly</h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-tight font-medium">If disabled, this post will save as a Draft</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={blogPublished}
                        onChange={(e) => setBlogPublished(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-slate-150 p-6 flex justify-between items-center z-20 shadow-md">
              <button
                type="button"
                onClick={() => setShowBlogForm(false)}
                disabled={isSaving}
                className="px-6 py-3 text-slate-500 hover:text-black font-bold cursor-pointer disabled:opacity-50"
                id="cancel-blog-btn"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveBlog}
                disabled={isSaving || isUploadingImage}
                className="px-8 py-3 bg-[#163F66] text-white hover:bg-[#EF961D] font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                id="save-blog-btn"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Check size={18} /> Save Article
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlogsDashboard;
