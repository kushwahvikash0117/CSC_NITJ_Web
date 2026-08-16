/**
 * @file MyBlogs.jsx
 * @description User panel component for viewing, filtering, and managing
 * user-submitted blog payloads and knowledge logs.
 *
 * Authentication:
 * - Uses the centralized apiFetch() wrapper.
 * - Authentication is handled through the backend HttpOnly cookie.
 * - No JWT is read from or stored in localStorage.
 */

import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";

/* -------------------------------------------------------------------------- */
/* Neural Network Background                                                  */
/* -------------------------------------------------------------------------- */

const NeuralNetwork = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    let particles = [];
    let animationFrameId;

    const mouse = {
      x: null,
      y: null,
      radius: 150,
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      init();
    };

    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;

        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;

        this.radius = Math.random() * 1.5 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) {
          this.vx *= -1;
        }

        if (this.y < 0 || this.y > canvas.height) {
          this.vy *= -1;
        }
      }

      draw() {
        ctx.beginPath();

        ctx.arc(
          this.x,
          this.y,
          this.radius,
          0,
          Math.PI * 2
        );

        ctx.fillStyle = "#22d3ee";
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];

      const count = Math.floor(
        (canvas.width * canvas.height) / 16000
      );

      for (let i = 0; i < count; i++) {
        particles.push(
          new Particle(
            Math.random() * canvas.width,
            Math.random() * canvas.height
          )
        );
      }
    };

    const animate = () => {
      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        p1.update();

        ctx.shadowBlur = 12;
        ctx.shadowColor = "#22d3ee";

        p1.draw();

        /* Mouse connection */
        if (
          mouse.x !== null &&
          mouse.y !== null
        ) {
          const mdx = p1.x - mouse.x;
          const mdy = p1.y - mouse.y;

          const mdist = Math.sqrt(
            mdx * mdx + mdy * mdy
          );

          if (mdist < mouse.radius) {
            ctx.beginPath();

            ctx.strokeStyle = `rgba(34, 211, 238, ${
              0.4 * (1 - mdist / mouse.radius)
            })`;

            ctx.lineWidth = 1;

            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);

            ctx.stroke();
          }
        }

        /* Particle connections */
        for (
          let j = i + 1;
          j < particles.length;
          j++
        ) {
          const p2 = particles[j];

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;

          const dist = Math.sqrt(
            dx * dx + dy * dy
          );

          if (dist < 200) {
            ctx.shadowBlur = 0;

            ctx.beginPath();

            ctx.strokeStyle = `rgba(34, 211, 238, ${
              0.6 * (1 - dist / 200)
            })`;

            ctx.lineWidth = 1;

            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);

            ctx.stroke();
          }
        }
      }

      ctx.globalCompositeOperation =
        "source-over";

      animationFrameId =
        requestAnimationFrame(animate);
    };

    window.addEventListener(
      "resize",
      resize
    );

    window.addEventListener(
      "mousemove",
      handleMouseMove
    );

    window.addEventListener(
      "mouseleave",
      handleMouseLeave
    );

    resize();
    animate();

    return () => {
      window.removeEventListener(
        "resize",
        resize
      );

      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      window.removeEventListener(
        "mouseleave",
        handleMouseLeave
      );

      cancelAnimationFrame(
        animationFrameId
      );
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

/* -------------------------------------------------------------------------- */
/* My Blogs                                                                    */
/* -------------------------------------------------------------------------- */

const MyBlogs = () => {
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState([]);
  const [filter, setFilter] = useState("all");
  const [visible, setVisible] = useState(false);

  /**
   * Fetch blogs belonging to the currently authenticated user.
   *
   * Authentication is handled automatically by apiFetch():
   *
   * frontend
   *    ↓
   * apiFetch()
   *    ↓
   * credentials: include
   *    ↓
   * HttpOnly token cookie
   *    ↓
   * backend protect middleware
   */
  useEffect(() => {
    let isMounted = true;

    const fetchMyBlogs = async () => {
      try {
        const res = await apiFetch(
          "/api/blogs/user"
        );

        /*
         * A 401 means the backend did not recognize
         * an authenticated session.
         */
        if (res.status === 401) {
          console.warn(
            "Authentication session unavailable. Redirecting to login."
          );

          if (isMounted) {
            navigate("/login", {
              replace: true,
            });
          }

          return;
        }

        if (!res.ok) {
          throw new Error(
            "Failed to fetch blogs"
          );
        }

        const data = await res.json();

        /*
         * Normalize backend response for UI rendering.
         */
        const formatted = data.map((b) => ({
          id: b._id,

          title: b.title,

          status:
            b.status === "approved"
              ? "Published"
              : b.status === "rejected"
              ? "Rejected"
              : "Pending",

          date: new Date(
            b.createdAt
          ).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
        }));

        if (!isMounted) return;

        setBlogs(formatted);

        setTimeout(() => {
          if (isMounted) {
            setVisible(true);
          }
        }, 200);
      } catch (err) {
        console.error(
          "My Blogs fetch error:",
          err
        );

        /*
         * Do not blindly redirect for every error.
         *
         * Network/server errors are different from
         * authentication failures.
         */
      }
    };

    fetchMyBlogs();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  /* ------------------------------------------------------------------------ */
  /* Filtering                                                                 */
  /* ------------------------------------------------------------------------ */

  const filteredBlogs = blogs.filter(
    (blog) => {
      if (filter === "all") {
        return true;
      }

      return blog.status === filter;
    }
  );

  /* ------------------------------------------------------------------------ */
  /* Render                                                                    */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="bg-[#010714] text-white min-h-screen relative overflow-x-hidden selection:bg-cyan-500/30 font-sans">
      <NeuralNetwork />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-24">

        {/* Header */}
        <div
          className={`text-center mb-12 transition-all ${
            visible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">

            <button
              onClick={() =>
                navigate("/profile")
              }
              className="px-6 py-2 rounded-full border border-white/10 text-gray-400 hover:text-white hover:border-cyan-500/50 text-xs uppercase tracking-widest transition cursor-pointer"
            >
              &larr; Back to Profile
            </button>

            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
              My{" "}
              <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                Blogs
              </span>
            </h1>

            <button
              onClick={() =>
                navigate("/create-blog")
              }
              className="px-6 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/20 text-xs uppercase tracking-widest transition shadow-lg shadow-cyan-500/10 cursor-pointer"
            >
              + Create Blog
            </button>
          </div>

          <p className="text-gray-400 text-sm tracking-widest uppercase font-mono">
            Your published & submitted knowledge logs
          </p>
        </div>

        {/* Filter Navigation */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {[
            "all",
            "Published",
            "Pending",
            "Rejected",
          ].map((tab) => (
            <button
              key={tab}
              onClick={() =>
                setFilter(tab)
              }
              className={`px-5 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all border cursor-pointer ${
                filter === tab
                  ? "bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-md shadow-cyan-500/20"
                  : "bg-[#0a1628]/60 border-white/5 text-gray-400 hover:border-white/20 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Blog Cards */}
        <div className="space-y-4">

          {filteredBlogs.length === 0 && (
            <div className="text-center py-16 bg-[#0a1628]/40 border border-white/5 rounded-2xl backdrop-blur-md">
              <p className="text-gray-500 font-mono text-sm tracking-wider">
                No logs found matching this filter.
              </p>
            </div>
          )}

          {filteredBlogs.map(
            (blog, i) => (
              <div
                key={blog.id}
                onClick={() =>
                  navigate(
                    `/blog/${blog.id}`
                  )
                }
                className={`group relative cursor-pointer transition-all duration-700 ${
                  visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-6"
                }`}
                style={{
                  transitionDelay: `${i * 100}ms`,
                }}
              >
                <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500/30 via-cyan-500/10 to-transparent rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-500" />

                <div className="relative bg-[#0a1628]/80 backdrop-blur-xl border border-white/5 group-hover:border-cyan-500/40 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition duration-300">

                  <div className="space-y-1">
                    <h3 className="text-lg font-bold group-hover:text-cyan-400 transition-colors uppercase tracking-tight">
                      {blog.title}
                    </h3>

                    <p className="text-xs text-gray-400 font-mono tracking-wider">
                      Submitted on:{" "}
                      {blog.date}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">

                    <span
                      className={`text-xs font-mono px-3 py-1 rounded-full border ${
                        blog.status ===
                        "Published"
                          ? "text-cyan-400 border-cyan-500/30 bg-cyan-500/5"
                          : blog.status ===
                            "Rejected"
                          ? "text-red-400 border-red-500/30 bg-red-500/5"
                          : "text-yellow-400 border-yellow-500/30 bg-yellow-500/5"
                      }`}
                    >
                      {blog.status}
                    </span>

                    <span className="text-gray-500 group-hover:text-cyan-400 transition transform group-hover:translate-x-1 font-mono text-sm">
                      &rarr;
                    </span>
                  </div>

                </div>
              </div>
            )
          )}

        </div>
      </div>
    </div>
  );
};

export default MyBlogs;