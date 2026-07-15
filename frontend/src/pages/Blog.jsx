import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import blogImg from "../assets/blog.png";

/*
  Removes HTML tags and normalizes spacing.
  Used for previews and search indexing.
*/
const stripHtml = (html = "") =>
  html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

/*
  Generates a readable preview from rich HTML content.
*/
const getPreview = (html, limit = 130) => {
  const text = stripHtml(html);
  return text.length > limit ? `${text.slice(0, limit)}...` : text;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/*
  Individual blog card.
  Handles only UI and navigation.
*/
const BlogCard = ({ blog }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={() => navigate(`/blog/${blog._id}`)}
      className="
        group cursor-pointer
        bg-slate-900/40
        border border-slate-800
        rounded-2xl
        p-7
        hover:border-cyan-400
        transition
        flex flex-col
        justify-between
      "
    >
      {/* Author info */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-xs text-black font-bold">
          {blog.author?.name?.[0] || "U"}
        </div>
        <div>
          <p className="text-sm font-semibold text-white leading-none">
            {blog.author?.name || "Unknown"}
          </p>
          <p className="text-[11px] text-slate-500">
            {new Date(blog.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex gap-5 items-start">
        <div className="flex-1">
          <h2 className="text-xl font-black text-white group-hover:text-cyan-400 transition leading-snug mb-3">
            {blog.title}
          </h2>

          <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">
            {getPreview(blog.content, 160)}
          </p>

          {/* Engagement stats */}
          <div className="flex gap-6 text-xs text-slate-500 font-mono">
            <span className="flex items-center gap-1">
              ♥ {blog.likes?.length || 0}
            </span>
            <span className="flex items-center gap-1">
              💬 {blog.comments?.length || 0}
            </span>
          </div>
        </div>

        {/* Optional cover image */}
        {blog.image && (
          <div className="w-28 h-28 shrink-0 rounded-xl overflow-hidden border border-slate-800">
            <img
              src={`${API_BASE}${blog.image}`}
              alt={blog.title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />

          </div>
        )}
      </div>
    </motion.div>
  );
};

/*
  Main blog listing page.
  Handles fetching, filtering, and global UI state.
*/
export default function Blog() {
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWriter, setShowWriter] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentUser, setCurrentUser] = useState(null);

  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  /*
    Reads auth data once on mount.
    Used only to control write access.
  */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const role = localStorage.getItem("role");

    if (token && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setCurrentUser({
        ...parsedUser,
        role: role || parsedUser.role || "user",
      });
    }
  }, []);

  /*
    Fetches all approved blogs from backend.
    Filters out malformed author data defensively.
  */
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/blogs`
        );
        const data = await res.json();

        const blogsArray = Array.isArray(data) ? data : data.blogs;

        setBlogs(
          blogsArray.filter(
            (b) => b.author && b.author.name
          )
        );
      } catch (err) {
        console.error("Blog fetch failed");
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  /*
    Canvas-based hero animation.
    Pixel particles react to mouse movement.
  */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", {
      willReadFrequently: true,
    });
    const img = new Image();
    img.src = blogImg;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x:
          ((e.clientX - rect.left) / rect.width) *
          canvas.width,
        y:
          ((e.clientY - rect.top) / rect.height) *
          canvas.height,
      };
    };

    window.addEventListener("mousemove", handleMouseMove);

    img.onload = () => {
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
        ctx.fillStyle = "rgba(2,6,23,0.35)";
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

        requestAnimationFrame(animate);
      };

      animate();
    };

    return () =>
      window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const categories = [
    "All",
    "Cybersecurity",
    "Awareness",
    "Ethical Hacking",
    "AI & Tech",
  ];

  /*
    Applies category and search filtering together.
  */
  const filteredBlogs = blogs.filter((blog) => {
    const matchesCategory =
      activeCategory === "All" ||
      blog.category?.toLowerCase() ===
        activeCategory.toLowerCase();

    const matchesSearch =
      blog.title
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      stripHtml(blog.content)
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      blog.author?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleWrite = () => {
    if (!currentUser) navigate("/login");
    else navigate("/create-blog");
  };

  return (
    <div className="bg-[#020617] min-h-screen text-slate-300">
      {/* Hero */}
      <section className="pt-28 pb-20 flex justify-center border-b border-slate-800">
        <canvas
          ref={canvasRef}
          className="max-w-full drop-shadow-[0_0_25px_rgba(34,211,238,0.35)]"
        />
      </section>

      {/* Search */}
      <div className="max-w-5xl mx-auto px-6 mt-10">
        <input
          type="text"
          placeholder="Search by title, content, or author..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:border-cyan-400 outline-none"
        />
      </div>

      {/* Category filter */}
      <div className="max-w-5xl mx-auto px-6 mt-6 flex flex-wrap gap-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
              activeCategory === cat
                ? "bg-cyan-500 text-black"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Blog grid */}
      <main className="w-full px-10 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {loading ? (
            <p className="text-slate-500 col-span-full">
              Loading blogs...
            </p>
          ) : (
            filteredBlogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))
          )}
        </div>
      </main>

      {/* Floating write button */}
      <div
        className="fixed bottom-8 right-8 z-50"
        onMouseEnter={() => setShowWriter(true)}
        onMouseLeave={() => setShowWriter(false)}
      >
        <button
          onClick={handleWrite}
          className="w-14 h-14 rounded-full bg-cyan-500 text-black font-black text-xl shadow-[0_0_25px_rgba(34,211,238,0.6)] hover:bg-cyan-400 transition"
        >
          ✍️
        </button>

        {showWriter && (
          <div className="absolute bottom-16 right-0 w-72 bg-[#020617] border border-cyan-500/30 rounded-2xl p-6 shadow-[0_0_40px_rgba(34,211,238,0.35)]">
            <h3 className="text-cyan-400 font-black text-xs uppercase tracking-widest mb-3">
              Start Writing
            </h3>
            <p className="text-sm text-slate-400 mb-5">
              Share your cybersecurity knowledge with CSC NITJ.
            </p>
            <button
              onClick={handleWrite}
              className="w-full py-3 bg-cyan-500 text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-lg hover:bg-cyan-400 transition"
            >
              Start Writing
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
