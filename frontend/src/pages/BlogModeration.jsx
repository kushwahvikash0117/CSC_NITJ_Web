/**
 * @file BlogModeration.jsx
 * @description Admin panel component for reviewing, approving, or rejecting user-submitted blog payloads.
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NeuralNetwork = () => {
  const canvasRef = React.useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let particles = [];
    let animationFrameId;

    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 0.25;
        this.vy = (Math.random() - 0.5) * 0.25;
        this.radius = Math.random() > 0.8 ? 2.2 : 1.6;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#22d3ee";
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 25000));
      for (let i = 0; i < count; i++) {
        particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height));
      }
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.update();
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#22d3ee";
        p1.draw();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 200) {
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(34, 211, 238, ${0.4 * (1 - dist / 200)})`;
            ctx.lineWidth = 1;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      ctx.globalCompositeOperation = "source-over";
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resize);
    resize();
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity: 0.65 }}
    />
  );
};

const BlogModal = ({ blog, onClose, onApprove, onReject, showActions, getImageUrl }) => {
  if (!blog) return null;

  const rawImg = blog.image || blog.coverImage || blog.thumbnail || blog.photo;
  const coverImage = getImageUrl(rawImg);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#071426] border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(34,211,238,0.15)] overflow-hidden flex flex-col">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-cyan-500/[0.03]">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs tracking-widest text-cyan-400 uppercase">
              Payload Preview // ID: {blog._id ? blog._id.slice(-6).toUpperCase() : "SEC_00"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:bg-cyan-500/20 hover:border-cyan-400 text-gray-400 hover:text-white flex items-center justify-center font-mono transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#071426] [&::-webkit-scrollbar-thumb]:bg-cyan-500/30 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-cyan-400">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="font-mono text-xs text-cyan-400">By {blog.author?.name || blog.author || "Unknown Analyst"}</span>
              {blog.createdAt && (
                <span className="font-mono text-xs text-gray-500">• {new Date(blog.createdAt).toLocaleDateString()}</span>
              )}
            </div>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-4">
              {blog.title}
            </h2>

            {coverImage && (
              <div className="w-full h-64 md:h-80 rounded-xl overflow-hidden border border-cyan-500/30 mb-6 shadow-lg bg-black/50">
                <img 
                  src={coverImage} 
                  alt={blog.title} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.parentElement.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div 
            className="prose prose-invert max-w-none text-gray-300 font-sans leading-relaxed border-t border-b border-white/10 py-6 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-xl [&_img]:border [&_img]:border-cyan-500/30 [&_img]:my-6 [&_img]:shadow-[0_0_20px_rgba(34,211,238,0.15)]"
            dangerouslySetInnerHTML={{ __html: blog.content || "<p>No content specified.</p>" }}
          />
        </div>

        <div className="flex items-center justify-end gap-4 px-6 py-4 border-t border-cyan-500/20 bg-black/40">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 font-mono text-xs uppercase tracking-wider text-gray-300 transition-colors cursor-pointer"
          >
            Close Window
          </button>

          {showActions && (
            <>
              <button
                onClick={() => {
                  onReject(blog._id);
                  onClose();
                }}
                className="px-5 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-black font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Reject Payload
              </button>
              <button
                onClick={() => {
                  onApprove(blog._id);
                  onClose();
                }}
                className="px-5 py-2.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500 hover:text-black font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(74,222,128,0.2)] cursor-pointer"
              >
                Approve Payload
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const BlogModeration = () => {
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState({
    pending: [],
    approved: [],
    rejected: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedBlog, setSelectedBlog] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const token = localStorage.getItem("token");

  const getImageUrl = (imgPath) => {
    if (!imgPath) return null;
    if (imgPath.startsWith("http://") || imgPath.startsWith("https://") || imgPath.startsWith("data:")) {
      return imgPath;
    }
    const cleanBase = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;
    const cleanPath = imgPath.startsWith("/") ? imgPath : `/${imgPath}`;
    return `${cleanBase}${cleanPath}`;
  };

  useEffect(() => {
    if (!token) {
      console.error("No valid token found. Redirecting to login.");
      navigate("/login");
      return;
    }

    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const approvedRes = await fetch(`${BASE_URL}/api/blogs`);
        const approvedData = await approvedRes.json();

        const pendingRes = await fetch(`${BASE_URL}/api/blogs/pending`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!pendingRes.ok) {
          const err = await pendingRes.text();
          console.error("Pending blog fetch failed:", pendingRes.status, err);
          setLoading(false);
          return;
        }

        const pendingData = await pendingRes.json();

        setBlogs({
          approved: approvedData || [],
          pending: pendingData || [],
          rejected: [],
        });
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [token, BASE_URL, navigate]);

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${BASE_URL}/api/blogs/moderate/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Moderation failed");
      }

      setBlogs((prev) => {
        const targetBlog = prev.pending.find((b) => b._id === id);
        if (!targetBlog) return prev;

        const updatedBlog = { ...targetBlog, status: newStatus };

        return {
          ...prev,
          pending: prev.pending.filter((b) => b._id !== id),
          approved: newStatus === "approved" ? [...prev.approved, updatedBlog] : prev.approved,
          rejected: newStatus === "rejected" ? [...prev.rejected, updatedBlog] : prev.rejected,
        };
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const getListByTab = () => {
    if (activeTab === "pending") return blogs.pending;
    if (activeTab === "approved") return blogs.approved;
    return blogs.rejected;
  };

  const currentList = getListByTab();

  return (
    <div className="bg-[#010714] min-h-screen text-white relative overflow-x-hidden selection:bg-cyan-500/30 font-sans">
      <NeuralNetwork />

      <div className="relative z-10 max-w-7xl mx-auto pt-36 pb-28 px-4 sm:px-6">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-cyan-500/15 pb-8 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="h-px w-8 bg-cyan-500/50" />
              <span className="font-mono text-[10px] tracking-[0.35em] uppercase text-cyan-400/80">
                Admin Security Clearance // Level_03
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight">
              Blog <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">Moderation</span>
            </h1>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#071426]/80 border border-cyan-500/20 px-4 py-2.5 rounded-xl backdrop-blur-md text-center shadow-lg shadow-cyan-950/20">
              <span className="block font-mono text-[9px] uppercase tracking-wider text-cyan-400/60">Pending</span>
              <span className="text-xl font-black text-white">{blogs.pending.length}</span>
            </div>
            <div className="bg-[#071426]/80 border border-green-500/20 px-4 py-2.5 rounded-xl backdrop-blur-md text-center shadow-lg shadow-green-950/20">
              <span className="block font-mono text-[9px] uppercase tracking-wider text-green-400/60">Approved</span>
              <span className="text-xl font-black text-white">{blogs.approved.length}</span>
            </div>
            <div className="bg-[#071426]/80 border border-red-500/20 px-4 py-2.5 rounded-xl backdrop-blur-md text-center shadow-lg shadow-red-950/20">
              <span className="block font-mono text-[9px] uppercase tracking-wider text-red-400/60">Rejected</span>
              <span className="text-xl font-black text-white">{blogs.rejected.length}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: "pending", label: "Pending Review", count: blogs.pending.length },
            { id: "approved", label: "Approved Archives", count: blogs.approved.length },
            { id: "rejected", label: "Rejected Logs", count: blogs.rejected.length },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative group px-6 py-3 rounded-xl font-mono text-xs uppercase tracking-widest transition-all duration-300 flex items-center gap-3 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-cyan-500/15 border border-cyan-400/50 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                    : "bg-[#071426]/50 border border-white/5 text-gray-400 hover:bg-cyan-500/5 hover:border-cyan-500/20 hover:text-white"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${isActive ? "bg-cyan-400 text-black shadow-[0_0_10px_#22d3ee]" : "bg-white/10 text-gray-300"}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative">
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent opacity-40 pointer-events-none" />

          <div className="relative bg-[#071426]/70 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 md:p-8 min-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_#22d3ee]" />
                <p className="font-mono text-xs text-cyan-400 tracking-[0.25em] uppercase animate-pulse">
                  Decrypting Stream Records...
                </p>
              </div>
            ) : currentList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-28 text-center">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/5 border border-cyan-500/15 flex items-center justify-center text-cyan-400/40 text-2xl mb-4 font-mono shadow-[0_0_15px_rgba(34,211,238,0.05)]">
                  Ø
                </div>
                <h3 className="text-lg font-bold uppercase tracking-wider text-gray-300 mb-1">
                  No Records Found
                </h3>
                <p className="text-sm font-mono text-gray-500 tracking-wide">
                  There are currently no items under the "{activeTab}" sector.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {currentList.map((blog, idx) => {
                  const rawImg = blog.image || blog.coverImage || blog.thumbnail || blog.photo;
                  const coverImage = getImageUrl(rawImg);

                  return (
                    <div
                      key={blog._id || idx}
                      onClick={() => setSelectedBlog(blog)}
                      className="group relative bg-gradient-to-r from-[#030c1c] via-[#051022] to-[#071428] border border-cyan-500/20 hover:border-cyan-400/60 rounded-2xl p-6 md:p-7 transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(34,211,238,0.18)] cursor-pointer overflow-hidden"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-l-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_12px_#22d3ee]" />

                      {coverImage ? (
                        <div className="w-full md:w-36 h-28 rounded-xl overflow-hidden border border-cyan-500/30 shrink-0 bg-black/60 shadow-inner">
                          <img 
                            src={coverImage} 
                            alt={blog.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.target.parentElement.style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-full md:w-36 h-28 rounded-xl overflow-hidden border border-cyan-500/15 shrink-0 bg-cyan-950/20 flex flex-col items-center justify-center text-cyan-400/40 font-mono text-[10px] gap-1 group-hover:border-cyan-400/30 transition-colors">
                          <span className="text-base">⟨/⟩</span>
                          <span>NO_IMAGE</span>
                        </div>
                      )}

                      <div className="space-y-3 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-cyan-300 bg-cyan-500/10 px-3 py-1 rounded-md border border-cyan-400/25 shadow-sm">
                            ID: {blog._id ? blog._id.slice(-6).toUpperCase() : "SEC_00"}
                          </span>
                          <span className="font-mono text-[11px] text-cyan-400/70 group-hover:text-cyan-300 uppercase tracking-wider flex items-center gap-1.5 transition-colors">
                            <span>Click to preview payload</span>
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                          </span>
                        </div>

                        <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white group-hover:text-cyan-300 transition-colors drop-shadow-sm">
                          {blog.title}
                        </h3>

                        <div 
                          className="text-sm text-gray-300/80 line-clamp-2 font-sans leading-relaxed [&_img]:hidden"
                          dangerouslySetInnerHTML={{ __html: blog.content || "No excerpt or description provided." }}
                        />

                        <div className="flex flex-wrap items-center gap-4 pt-1">
                          <div className="flex items-center gap-2 bg-white/[0.03] border border-white/5 px-3 py-1 rounded-lg">
                            <span className="font-mono text-[10px] text-gray-400 uppercase tracking-wider">AUTHOR:</span>
                            <span className="font-mono text-xs text-cyan-300 font-bold tracking-wide">
                              {blog.author?.name || blog.author || "Unknown Analyst"}
                            </span>
                          </div>
                          {blog.createdAt && (
                            <div className="flex items-center gap-2 text-gray-500 font-mono text-[11px]">
                              <span>•</span>
                              <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-white/10 w-full md:w-auto justify-end shrink-0" onClick={(e) => e.stopPropagation()}>
                        {activeTab === "pending" ? (
                          <div className="flex items-center gap-3 w-full md:w-auto">
                            <button
                              onClick={() => updateStatus(blog._id, "approved")}
                              className="flex-1 md:flex-initial px-6 py-3 bg-green-500/10 border border-green-500/40 text-green-400 hover:bg-green-500 hover:text-black font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(74,222,128,0.1)] hover:shadow-[0_0_20px_rgba(74,222,128,0.4)] cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateStatus(blog._id, "rejected")}
                              className="flex-1 md:flex-initial px-6 py-3 bg-red-500/10 border border-red-500/40 text-red-400 hover:bg-red-500 hover:text-black font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(248,113,113,0.1)] hover:shadow-[0_0_20px_rgba(248,113,113,0.4)] cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 font-mono text-xs uppercase tracking-wider">
                            <span className={`w-2.5 h-2.5 rounded-full ${activeTab === "approved" ? "bg-green-400 shadow-[0_0_10px_#4ade80]" : "bg-red-400 shadow-[0_0_10px_#f87171]"}`} />
                            <span className={activeTab === "approved" ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                              {activeTab}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <BlogModal
        blog={selectedBlog}
        onClose={() => setSelectedBlog(null)}
        onApprove={(id) => updateStatus(id, "approved")}
        onReject={(id) => updateStatus(id, "rejected")}
        showActions={activeTab === "pending"}
        getImageUrl={getImageUrl}
      />
    </div>
  );
};

export default BlogModeration;