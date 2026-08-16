/**
 * @file Blog.jsx
 * @description Comprehensive Blog & Article Hub component featuring an interactive particle hero, live database feed, dynamic categories, and optimized card layouts.
 */

import React, { useEffect, useRef, useState, memo, useCallback, useMemo } from 'react';
import { motion as Motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import blogImg from '../assets/blog.png';
import { useAuth } from '../context/auth-context';

/** Strips HTML tags and normalizes whitespace */
const stripHtml = (html = '') => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

/** Generates a text preview snippet up to a specified character limit */
const getPreview = (html, limit = 160) => {
  const text = stripHtml(html);
  return text.length > limit ? `${text.slice(0, limit)}...` : text;
};

/** Calculates estimated reading time based on word count */
const getReadingTime = (html = '') => {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/**
 * TerminalLabel Component
 * Styled typography for metadata tags and terminal headers.
 */
const TerminalLabel = memo(({ children, className = '' }) => (
  <span className={`font-mono text-[11px] md:text-xs font-medium uppercase tracking-[0.24em] text-cyan-500/65 ${className}`}>
    {children}
  </span>
));

TerminalLabel.displayName = 'TerminalLabel';

/**
 * BlogCard Component
 * Renders individual blog article cards with hover glow and metadata indicators.
 */
const BlogCard = memo(({ blog }) => {
  const navigate = useNavigate();
  const handleNavigate = useCallback(() => navigate(`/blog/${blog._id}`), [navigate, blog._id]);

  const authorInitial = blog.author?.name?.[0]?.toUpperCase() || 'U';
  const authorName = blog.author?.name || 'CSC Member';
  const formattedDate = blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : 'Recently';
  const blogCategory = blog.category || 'BLOG';

  return (
    <Motion.article
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      onClick={handleNavigate}
      className="group relative cursor-pointer h-full"
    >
      <div className="absolute -inset-px rounded-[1.5rem] bg-gradient-to-b from-cyan-500/30 via-cyan-500/5 to-transparent opacity-0 blur-[2px] group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative h-full min-h-[500px] flex flex-col overflow-hidden rounded-[1.5rem] border border-white/[0.07] bg-[#071426]/90 backdrop-blur-2xl transition-all duration-500 group-hover:border-cyan-400/25 group-hover:-translate-y-1 group-hover:shadow-[0_20px_60px_rgba(34,211,238,0.10)]">
        <div className="absolute top-0 left-0 right-0 h-px bg-cyan-500/20">
          <div className="h-full w-0 bg-cyan-400 shadow-[0_0_12px_#22d3ee] group-hover:w-full transition-all duration-700" />
        </div>

        {blog.image ? (
          <div className="relative h-56 overflow-hidden border-b border-white/[0.06]">
            <img
              src={`${API_BASE}${blog.image}`}
              alt={blog.title || 'Blog'}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#071426] via-transparent to-transparent" />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1.5 rounded-md bg-[#010714]/80 border border-cyan-400/20 backdrop-blur-md font-mono text-[11px] md:text-xs font-medium uppercase tracking-[0.18em] text-cyan-400">
                {blogCategory}
              </span>
            </div>
            <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#010714]/70 border border-white/10 flex items-center justify-center text-cyan-400 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              →
            </div>
          </div>
        ) : (
          <div className="relative h-56 overflow-hidden border-b border-white/[0.06] bg-gradient-to-br from-cyan-950/30 via-[#071426] to-[#010714] flex items-center justify-center">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.12)_1px,transparent_1px)] bg-[size:25px_25px]" />
            </div>
            <span className="relative font-mono text-cyan-400/30 text-5xl">{'</>'}</span>
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1.5 rounded-md bg-[#010714]/80 border border-cyan-400/20 font-mono text-[11px] md:text-xs font-medium uppercase tracking-[0.18em] text-cyan-400">
                {blogCategory}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col flex-1 p-5 sm:p-6 md:p-7">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-500 flex items-center justify-center text-[#010714] font-black text-sm">
                {authorInitial}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{authorName}</p>
                <p className="font-mono text-[11px] text-slate-500 mt-1">{formattedDate}</p>
              </div>
            </div>
            <TerminalLabel>BLOG</TerminalLabel>
          </div>

          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight leading-tight text-white group-hover:text-cyan-400 transition-colors duration-300">
            {blog.title || 'Untitled Blog'}
          </h2>

          <div className="mt-5 rounded-xl overflow-hidden border border-cyan-500/10 bg-[#010714]/70">
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-cyan-500/10 bg-cyan-500/[0.025]">
              <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400/40" />
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400/40" />
                <span className="w-1.5 h-1.5 rounded-full bg-green-400/40" />
              </div>
              <TerminalLabel>preview</TerminalLabel>
            </div>
            <div className="p-4">
              <p className="font-mono text-[13px] md:text-sm leading-6 md:leading-7 text-slate-400 line-clamp-3">
                <span className="text-cyan-400 mr-2">&gt;</span>
                {getPreview(blog.content || '')}
              </p>
            </div>
          </div>

          <div className="flex-1" />
          <div className="h-px bg-white/[0.06] my-6" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <span className="font-mono text-[11px] text-slate-500">♥ {blog.likes?.length || 0}</span>
              <span className="font-mono text-[11px] text-slate-500">💬 {blog.comments?.length || 0}</span>
              <span className="font-mono text-[11px] text-slate-500">{getReadingTime(blog.content || '')} MIN</span>
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-cyan-500/70 group-hover:text-cyan-400 transition-colors">
              Read →
            </span>
          </div>
        </div>
      </div>
    </Motion.article>
  );
});

BlogCard.displayName = 'BlogCard';

/**
 * BlogPage Component
 * Main view integrating hero particle canvas, search/category filtering, blog grids, and author modal prompt.
 */
export default function Blog() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWriter, setShowWriter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const { user: currentUser } = useAuth();
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/blogs`);
        if (!res.ok) throw new Error('Failed to fetch blogs');
        const data = await res.json();
        const blogsArray = Array.isArray(data) ? data : Array.isArray(data.blogs) ? data.blogs : [];
        setBlogs(blogsArray);
      } catch (error) {
        console.error('Blog fetch failed:', error);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const img = new Image();
    img.src = blogImg;

    let animationFrameId;
    let mounted = true;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      mouseRef.current = {
        x: ((e.clientX - rect.left) / rect.width) * canvas.width,
        y: ((e.clientY - rect.top) / rect.height) * canvas.height,
      };
    };

    window.addEventListener('mousemove', handleMouseMove);

    img.onload = () => {
      if (!mounted) return;
      const width = window.innerWidth < 768 ? 320 : 900;
      const height = (img.height / img.width) * width;
      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);
      const data = ctx.getImageData(0, 0, width, height).data;
      ctx.clearRect(0, 0, width, height);

      const particles = [];
      for (let y = 0; y < height; y += 3) {
        for (let x = 0; x < width; x += 3) {
          const i = (y * width + x) * 4;
          if (data[i + 3] > 120) {
            particles.push({
              x,
              y: Math.random() > 0.5 ? -400 : height + 400,
              tx: x,
              ty: y,
              c: `rgba(${data[i]},${data[i + 1]},${data[i + 2]},0.85)`,
              s: Math.random() * 2 + 1,
            });
          }
        }
      }

      const animate = () => {
        if (!mounted) return;
        ctx.fillStyle = 'rgba(2,6,23,0.30)';
        ctx.fillRect(0, 0, width, height);

        particles.forEach((p) => {
          const dx = mouseRef.current.x - p.x;
          const dy = mouseRef.current.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 55) {
            p.x -= dx * 0.02;
            p.y -= dy * 0.02;
          }

          p.x += (p.tx - p.x) * 0.06;
          p.y += (p.ty - p.y) * 0.06;

          ctx.fillStyle = p.c;
          ctx.fillRect(p.x, p.y, p.s, p.s);
        });

        animationFrameId = requestAnimationFrame(animate);
      };

      animate();
    };

    return () => {
      mounted = false;
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const categories = useMemo(() => ['All', 'Cybersecurity', 'Awareness', 'Ethical Hacking', 'AI & Tech'], []);

  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const matchesCategory = activeCategory === 'All' || blog.category?.toLowerCase() === activeCategory.toLowerCase();
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        blog.title?.toLowerCase().includes(query) ||
        stripHtml(blog.content || '').toLowerCase().includes(query) ||
        blog.author?.name?.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [blogs, activeCategory, searchQuery]);

  const handleWrite = useCallback(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }
    navigate('/create-blog');
  }, [navigate]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setActiveCategory('All');
  }, []);

  const handleMouseEnterWriter = useCallback(() => setShowWriter(true), []);
  const handleMouseLeaveWriter = useCallback(() => setShowWriter(false), []);

  return (
    <div className="blog-page min-h-screen bg-[#010714] text-slate-300 relative overflow-x-hidden selection:bg-cyan-500/30">
      {/* Hero Section */}
      <section className="relative z-10 pt-28 sm:pt-32 md:pt-40 pb-16 md:pb-20 px-4 sm:px-5 md:px-6">
        <div className="max-w-6xl mx-auto relative rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-white/[0.07] bg-[#071426]/80 backdrop-blur-2xl shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
          <div className="absolute top-0 left-0 right-0 h-px bg-cyan-400 shadow-[0_0_15px_#22d3ee]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.08),transparent_60%)] pointer-events-none" />

          <div className="relative flex flex-col items-center text-center px-4 sm:px-6 py-10 md:py-16">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
              <TerminalLabel className="text-cyan-400/80">CSC_NITJ // BLOG</TerminalLabel>
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tight leading-[0.95] text-white">
              <span className="text-white">Blogs</span>
            </h1>

            <p className="max-w-2xl mt-4 sm:mt-6 text-sm sm:text-base md:text-lg leading-6 sm:leading-7 md:leading-8 text-slate-400 px-2">
              Cybersecurity articles, technical guides, awareness, research, and insights from the CSC NITJ community.
            </p>

            <div className="relative w-full flex justify-center mt-8 sm:mt-10 overflow-hidden px-2">
              <canvas ref={canvasRef} className="max-w-full w-full h-auto rounded-xl opacity-90 drop-shadow-[0_0_35px_rgba(34,211,238,0.18)]" />
            </div>

            <div className="flex items-center gap-3 sm:gap-4 mt-8 font-mono text-[10px] sm:text-[11px] md:text-xs font-medium uppercase tracking-[0.2em] sm:tracking-[0.25em] text-cyan-500/65">
              <div className="h-px w-6 sm:w-10 bg-cyan-500/25" />
              BLOG DATABASE ONLINE
              <div className="h-px w-6 sm:w-10 bg-cyan-500/25" />
            </div>
          </div>
        </div>
      </section>

      {/* Main Blog Feed */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-5 md:px-6 py-8 md:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <TerminalLabel>BLOG_DATABASE // {filteredBlogs.length}</TerminalLabel>
            <h2 className="mt-3 text-2xl md:text-4xl font-black uppercase tracking-tight text-white">
              Latest <span className="text-cyan-400">Blogs</span>
            </h2>
          </div>
          <div className="hidden md:flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-cyan-500/55">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            LIVE FEED
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-7">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-[500px] rounded-[1.5rem] border border-white/[0.06] bg-[#071426]/70 animate-pulse" />
            ))}
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="py-20 text-center border border-white/[0.06] rounded-2xl bg-[#071426]/40 px-4">
            <TerminalLabel className="text-cyan-400/75">NO_MATCHING_BLOGS</TerminalLabel>
            <h3 className="mt-4 text-xl md:text-2xl font-black uppercase text-white">No Blogs Found</h3>
            <p className="mt-2 text-base text-slate-500">Try another search or category.</p>
            <button
              onClick={handleClearFilters}
              className="mt-5 px-5 py-3 rounded-lg bg-cyan-500 text-[#010714] font-mono text-[11px] md:text-xs font-black uppercase tracking-[0.18em] hover:bg-cyan-400 transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-7">
            {filteredBlogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        )}
      </main>

      {/* Floating Write Action */}
      <div
        className="fixed bottom-6 right-5 sm:bottom-8 sm:right-7 md:right-9 z-50"
        onMouseEnter={handleMouseEnterWriter}
        onMouseLeave={handleMouseLeaveWriter}
      >
        <button
          onClick={handleWrite}
          aria-label="Write a blog"
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-cyan-500 text-[#010714] font-black text-xl shadow-[0_0_30px_rgba(34,211,238,0.50)] hover:bg-cyan-400 hover:scale-105 transition-all flex items-center justify-center"
        >
          ✍
        </button>

        {showWriter && (
          <div className="absolute bottom-16 right-0 w-64 sm:w-72 rounded-2xl overflow-hidden bg-[#071426] border border-cyan-500/20 shadow-[0_0_40px_rgba(34,211,238,0.20)]">
            <div className="px-4 py-3 border-b border-white/[0.06] bg-white/[0.015] flex items-center justify-between">
              <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400/50" />
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400/50" />
                <span className="w-1.5 h-1.5 rounded-full bg-green-400/50" />
              </div>
              <TerminalLabel>writer_module</TerminalLabel>
            </div>
            <div className="p-4 sm:p-5">
              <h3 className="text-cyan-400 font-black text-sm uppercase tracking-[0.16em]">Start Writing</h3>
              <p className="text-sm sm:text-base text-slate-400 mt-2 sm:mt-3 mb-4 sm:mb-5 leading-5 sm:leading-6">
                Share your cybersecurity knowledge with the CSC NITJ community.
              </p>
              <button
                onClick={handleWrite}
                className="w-full py-3 bg-cyan-500 text-[#010714] font-black text-[11px] uppercase tracking-[0.18em] rounded-lg hover:bg-cyan-400 transition"
              >
                Start Writing →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}