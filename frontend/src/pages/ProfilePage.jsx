/**
 * @file ProfilePage.jsx
 * @description User profile component displaying secure identity details,
 * account telemetry, and an interactive terminal log panel.
 */

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import { apiFetch } from "../api";

// ============================================================
// 1. NEURAL NETWORK BACKGROUND
// ============================================================

const NeuralNetwork = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    let particles = [];
    let animationFrameId;

    let mouse = {
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

        // Mouse connections
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
              0.4 *
              (1 - mdist / mouse.radius)
            })`;

            ctx.lineWidth = 1;

            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);

            ctx.stroke();
          }
        }

        // Particle connections
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

// ============================================================
// 2. REUSABLE CYBER CARD
// ============================================================

const CyberCard = ({
  active,
  className = "",
  children,
  delay = 0,
}) => {
  return (
    <div
      className={`group relative transition-all transform ease-in-out ${className} ${
        active
          ? "opacity-100 translate-y-0 scale-100 duration-1000"
          : "opacity-0 translate-y-12 scale-95 duration-300"
      }`}
      style={{
        transitionDelay: `${delay}ms`,
      }}
    >
      <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500/50 via-teal-500/20 to-transparent rounded-[2.5rem] opacity-40 group-hover:opacity-90 transition-all duration-500 blur-[3px]" />

      <div className="relative h-full bg-[#07101e]/90 backdrop-blur-2xl border border-cyan-500/10 group-hover:border-cyan-500/30 p-8 md:p-10 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl transition-all duration-500">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20" />

        <div className="relative z-10 flex flex-col h-full">
          {children}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// 3. MAIN PROFILE PAGE
// ============================================================

const ProfilePage = () => {
  const navigate = useNavigate();

  /*
   * Authentication is now managed centrally.
   *
   * The actual JWT is stored in an HttpOnly cookie.
   * JavaScript never reads the token.
   */
  const {
    user: authUser,
    loading: authLoading,
    logout,
  } = useAuth();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] =
    useState(null);

  const [headerVisible, setHeaderVisible] =
    useState(false);

  const [cardsVisible, setCardsVisible] =
    useState(false);

  // Terminal state
  const [terminalInput, setTerminalInput] =
    useState("");

  const [terminalLogs, setTerminalLogs] =
    useState([]);

  // ============================================================
  // FETCH PROFILE
  // ============================================================

  useEffect(() => {
    /*
     * Wait until AuthContext finishes its initial
     * authentication check.
     */
    if (authLoading) {
      return;
    }

    /*
     * No authenticated user means the session does
     * not exist or has expired.
     */
    if (!authUser) {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    const fetchProfile = async () => {
      try {
        /*
         * IMPORTANT:
         *
         * apiFetch automatically uses:
         *
         * credentials: "include"
         *
         * Therefore the HttpOnly cookie is sent
         * automatically.
         *
         * No token is read from localStorage.
         * No Authorization header is manually created.
         */
        const res = await apiFetch(
          "/api/users/profile"
        );

        const text = await res.text();

        let data;

        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(
            "Server response invalid"
          );
        }

        /*
         * If the backend says the session is no
         * longer valid, return to login.
         */
        if (res.status === 401) {
          throw new Error(
            "Authentication session expired"
          );
        }

        if (!res.ok) {
          throw new Error(
            data.message ||
              "Profile fetch failed"
          );
        }

        const profileData = {
          name:
            data.name ||
            authUser.name ||
            "User",

          email:
            data.email ||
            authUser.email ||
            "",

          role:
            data.role ||
            authUser.role ||
            "user",

          bio: data.bio || "",

          github: data.github || "",

          linkedin:
            data.linkedin || "",

          joinedAt: data.createdAt
            ? new Date(
                data.createdAt
              ).toLocaleDateString(
                "en-IN",
                {
                  month: "long",
                  year: "numeric",
                }
              )
            : "Unknown",

          blogs:
            data.blogsCount || 0,
        };

        setUser(profileData);

        setTerminalLogs([
          `> session_active: verified for ${profileData.email}.`,
          `> clearance_level: [${profileData.role}] confirmed.`,
          `> payload_loaded: ${profileData.blogs} logs indexed.`,
          `> type 'help' for available commands.`,
        ]);
      } catch (err) {
        console.error(
          "Profile error:",
          err.message
        );

        setUser(null);

        /*
         * Do not touch localStorage.
         *
         * Authentication is handled by the
         * HttpOnly cookie and AuthContext.
         */
        if (
          err.message ===
          "Authentication session expired"
        ) {
          await logout();

          navigate("/login", {
            replace: true,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [
    authUser,
    authLoading,
    navigate,
    logout,
  ]);

  // ============================================================
  // PAGE ANIMATIONS
  // ============================================================

  useEffect(() => {
    if (!loading && user) {
      const headerTimer = setTimeout(() => {
        setHeaderVisible(true);
      }, 100);

      const cardsTimer = setTimeout(() => {
        setCardsVisible(true);
      }, 400);

      return () => {
        clearTimeout(headerTimer);
        clearTimeout(cardsTimer);
      };
    }
  }, [loading, user]);

  // ============================================================
  // COPY
  // ============================================================

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);

    setCopiedField(field);

    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  // ============================================================
  // TERMINAL
  // ============================================================

  const handleTerminalCommand = (e) => {
    e.preventDefault();

    const cmd = terminalInput
      .trim()
      .toLowerCase();

    if (!cmd) return;

    let response = [];

    switch (cmd) {
      case "help":
        response = [
          "available commands:",
          "  - whoami     : displays current operative info",
          "  - status     : checks system telemetry status",
          "  - clear      : clears terminal logs",
          "  - date       : prints node timestamp",
        ];
        break;

      case "whoami":
        response = [
          `operative: ${user.name} <${user.email}> [Tier: ${user.role}]`,
        ];
        break;

      case "status":
        response = [
          "system operational // neural network synchronization at 99.8%",
        ];
        break;

      case "clear":
        setTerminalLogs([
          `> session_active: verified for ${user.email}.`,
        ]);

        setTerminalInput("");

        return;

      case "date":
        response = [
          `node_timestamp: ${new Date().toUTCString()}`,
        ];
        break;

      default:
        response = [
          `command not recognized: '${cmd}'. type 'help' for options.`,
        ];
        break;
    }

    setTerminalLogs((prev) => [
      ...prev,
      `> ${cmd}`,
      ...response,
    ]);

    setTerminalInput("");
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (
    authLoading ||
    loading ||
    !user
  ) {
    return (
      <div className="min-h-screen bg-[#010714] flex items-center justify-center text-cyan-400 font-mono">
        <NeuralNetwork />

        <div className="relative z-10 flex flex-col items-center animate-pulse">
          <div className="h-1 w-24 bg-cyan-500 shadow-[0_0_20px_#22d3ee] mb-4 rounded-full" />

          <span className="tracking-[0.5em] text-xs font-bold uppercase">
            Establishing Secure Uplink...
          </span>
        </div>
      </div>
    );
  }

  // ============================================================
  // PROFILE UI
  // ============================================================

  return (
    <div className="bg-[#010714] text-white min-h-screen relative overflow-x-hidden selection:bg-cyan-500/30 pb-20">
      <NeuralNetwork />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-12">

        {/* HEADER */}
        <div
          className={`flex flex-col items-center mb-12 text-center transition-all transform ${
            headerVisible
              ? "opacity-100 translate-y-0 duration-1000"
              : "opacity-0 -translate-y-10 duration-500"
          }`}
        >
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-md mb-4 shadow-[0_0_20px_rgba(34,211,238,0.15)] hover:border-cyan-400 transition-colors cursor-pointer">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_12px_#22d3ee]" />

            <span className="text-[10px] font-mono tracking-[0.25em] text-cyan-300">
              SECURE CONNECTION ESTABLISHED // NODE: NITJ
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white">
            Cyber{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-500 drop-shadow-[0_0_25px_rgba(34,211,238,0.5)]">
              Identity
            </span>
          </h1>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-4">
            <CyberCard
              active={cardsVisible}
              delay={0}
              className="h-full"
            >
              <div className="flex justify-between items-center mb-8">
                <span className="font-mono text-[10px] text-cyan-400 tracking-[3px] bg-cyan-500/10 px-3.5 py-1.5 rounded-lg border border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.1)]">
                  ID_PROFILE
                </span>

                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />

                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee]" />
                </div>
              </div>

              <div className="flex flex-col items-center mb-6">
                <div className="relative w-32 h-32 mb-6 group-hover:scale-105 transition-transform duration-500 cursor-pointer">
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/40 animate-[spin_12s_linear_infinite]" />

                  <div className="absolute inset-2 rounded-full border border-teal-400/40 animate-[spin_18s_linear_infinite_reverse]" />

                  <div className="absolute inset-4 rounded-full bg-[#07101e] flex items-center justify-center border border-cyan-500/30 shadow-[0_0_25px_rgba(34,211,238,0.25)]">
                    <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 to-teal-400">
                      {user.name?.[0] || "U"}
                    </span>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-white text-center mb-1 tracking-wide">
                  {user.name}
                </h2>

                <button
                  onClick={() =>
                    handleCopy(
                      user.email,
                      "email"
                    )
                  }
                  className="text-cyan-400/80 hover:text-cyan-300 font-mono text-xs tracking-wider mb-4 transition-colors flex items-center gap-1.5 bg-cyan-500/5 px-3 py-1 rounded-full border border-cyan-500/20"
                  title="Click to copy email"
                >
                  <span>
                    &lt; {user.email} /&gt;
                  </span>

                  {copiedField ===
                    "email" && (
                    <span className="text-[9px] text-emerald-400 font-bold">
                      [COPIED]
                    </span>
                  )}
                </button>

                {user.bio && (
                  <p className="text-gray-300 text-xs text-center italic bg-white/[0.03] border border-white/10 p-3.5 rounded-2xl w-full shadow-inner">
                    "{user.bio}"
                  </p>
                )}
              </div>

              {/* SOCIAL LINKS */}
              <div className="space-y-3.5 mt-auto pt-5 border-t border-white/10">

                {user.github && (
                  <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                    <span className="text-gray-400 text-xs uppercase tracking-widest font-mono">
                      GitHub
                    </span>

                    <a
                      href={
                        user.github.startsWith(
                          "http"
                        )
                          ? user.github
                          : `https://${user.github}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 hover:underline font-mono text-xs truncate max-w-[170px] transition-colors"
                    >
                      {user.github}
                    </a>
                  </div>
                )}

                {user.linkedin && (
                  <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                    <span className="text-gray-400 text-xs uppercase tracking-widest font-mono">
                      LinkedIn
                    </span>

                    <a
                      href={
                        user.linkedin.startsWith(
                          "http"
                        )
                          ? user.linkedin
                          : `https://${user.linkedin}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 hover:underline font-mono text-xs truncate max-w-[170px] transition-colors"
                    >
                      {user.linkedin}
                    </a>
                  </div>
                )}

                <div className="flex justify-between items-center pb-1">
                  <span className="text-gray-400 text-xs uppercase tracking-widest font-mono">
                    Joined Node
                  </span>

                  <span className="text-white font-mono text-xs">
                    {user.joinedAt}
                  </span>
                </div>
              </div>
            </CyberCard>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-8 flex flex-col gap-8 justify-between">

            {/* STATS */}
            <CyberCard
              active={cardsVisible}
              delay={200}
              className="flex-1"
            >
              <div className="flex justify-between items-center mb-6">
                <span className="font-mono text-[10px] text-cyan-400 tracking-[3px] bg-cyan-500/10 px-3.5 py-1.5 rounded-lg border border-cyan-500/30">
                  METRICS_001 // TELEMETRY
                </span>

                <div className="flex items-center gap-2 font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE DATA STREAM
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-auto">

                {/* BLOG STAT */}
                <div className="relative p-6 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 group hover:border-cyan-400/50 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-bold text-gray-300 tracking-[0.2em] uppercase font-mono">
                      Published Logs
                    </h3>

                    <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      COUNT
                    </span>
                  </div>

                  <div className="flex items-end justify-between">
                    <span className="text-5xl font-black text-white group-hover:text-cyan-400 transition-colors duration-500">
                      {user.blogs < 10
                        ? `0${user.blogs}`
                        : user.blogs}
                    </span>

                    <div className="flex gap-1 h-9 items-end opacity-50 mb-1">
                      {[45, 75, 35, 85, 60, 95].map(
                        (h, i) => (
                          <div
                            key={i}
                            className="w-1.5 bg-cyan-400 rounded-t transition-all group-hover:bg-teal-300"
                            style={{
                              height: `${h}%`,
                            }}
                          />
                        )
                      )}
                    </div>
                  </div>

                  <div className="mt-4 w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
                    <div
                      className="bg-gradient-to-r from-cyan-400 to-teal-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_#22d3ee]"
                      style={{
                        width: `${Math.min(
                          user.blogs * 10,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* ROLE */}
                <div className="relative p-6 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 group hover:border-cyan-400/50 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-bold text-gray-300 tracking-[0.2em] uppercase font-mono">
                      Access Tier
                    </h3>

                    <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      CLEARANCE
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className="text-2xl md:text-3xl font-black text-white group-hover:text-cyan-300 transition-colors duration-500 font-mono tracking-wider truncate uppercase">
                      {user.role}
                    </span>

                    <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                      <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 animate-ping" />
                    </div>
                  </div>

                  <div className="mt-4 w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
                    <div className="bg-gradient-to-r from-cyan-400 to-teal-400 h-full rounded-full w-full animate-pulse shadow-[0_0_8px_#22d3ee]" />
                  </div>
                </div>
              </div>
            </CyberCard>

            {/* ACTION BUTTONS */}
            <div
              className={`grid grid-cols-1 md:grid-cols-3 gap-4 transition-all duration-1000 delay-500 ${
                cardsVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <button
                onClick={() =>
                  navigate("/edit-profile")
                }
                className="relative group overflow-hidden rounded-2xl bg-[#07101e] border border-cyan-500/30 p-4 text-center hover:border-cyan-400 transition-all duration-300 shadow-lg shadow-cyan-500/5 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] active:scale-95"
              >
                <div className="absolute inset-0 bg-cyan-500/15 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />

                <span className="relative font-mono text-xs font-bold tracking-[0.2em] text-cyan-300 group-hover:text-white uppercase">
                  Edit Profile
                </span>
              </button>

              <button
                onClick={() =>
                  navigate("/my-blogs")
                }
                className="relative group overflow-hidden rounded-2xl bg-[#07101e] border border-white/10 p-4 text-center hover:border-white/30 transition-all duration-300 shadow-lg active:scale-95"
              >
                <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />

                <span className="relative font-mono text-xs font-bold tracking-[0.2em] text-gray-300 group-hover:text-white uppercase">
                  My Blogs
                </span>
              </button>

              <button
                onClick={async () => {
                  await logout();

                  navigate("/", {
                    replace: true,
                  });
                }}
                className="relative group overflow-hidden rounded-2xl bg-[#07101e] border border-red-500/30 p-4 text-center hover:border-red-500 transition-all duration-300 shadow-lg shadow-red-500/5 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] active:scale-95"
              >
                <div className="absolute inset-0 bg-red-500/15 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />

                <span className="relative font-mono text-xs font-bold tracking-[0.2em] text-red-400 group-hover:text-white uppercase">
                  Logout
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* TERMINAL */}
        <div
          className={`mt-8 transition-all duration-1000 delay-700 ${
            cardsVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <div className="relative bg-[#040810]/95 backdrop-blur-2xl border border-cyan-500/20 rounded-2xl p-6 font-mono text-xs shadow-2xl overflow-hidden">

            {/* Terminal Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full bg-red-500/80 inline-block cursor-pointer hover:opacity-100"
                  title="Close"
                />

                <span
                  className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block cursor-pointer hover:opacity-100"
                  title="Minimize"
                />

                <span
                  className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block cursor-pointer hover:opacity-100"
                  title="Expand"
                />

                <span className="text-gray-400 text-[10px] ml-3 tracking-widest font-bold">
                  SEC_TERMINAL // v4.2.0-interactive
                </span>
              </div>

              <span className="text-cyan-400 text-[10px] tracking-widest animate-pulse flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                ● READY FOR INPUT
              </span>
            </div>

            {/* Terminal Logs */}
            <div className="space-y-1.5 text-gray-300 mb-4 max-h-36 overflow-y-auto pr-2 custom-scrollbar">
              {terminalLogs.map(
                (log, index) => (
                  <p
                    key={index}
                    className="leading-relaxed"
                  >
                    {log.startsWith(">") ? (
                      <span className="text-cyan-400 font-bold">
                        &gt;
                      </span>
                    ) : null}

                    <span
                      className={
                        log.includes(
                          "confirmed"
                        ) ||
                        log.includes(
                          "ready"
                        ) ||
                        log.includes(
                          "operational"
                        )
                          ? "text-emerald-400"
                          : "text-gray-300"
                      }
                    >
                      {log.startsWith(">")
                        ? log.slice(1)
                        : log}
                    </span>
                  </p>
                )
              )}
            </div>

            {/* Terminal Input */}
            <form
              onSubmit={
                handleTerminalCommand
              }
              className="flex items-center gap-2 pt-3 border-t border-white/10"
            >
              <span className="text-cyan-400 font-bold">
                &gt;
              </span>

              <input
                type="text"
                value={terminalInput}
                onChange={(e) =>
                  setTerminalInput(
                    e.target.value
                  )
                }
                placeholder="Type command (try 'help' or 'status')..."
                className="w-full bg-transparent border-none outline-none text-white font-mono text-xs placeholder:text-gray-600 focus:ring-0"
              />

              <button
                type="submit"
                className="px-3 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded text-[10px] tracking-widest uppercase transition-colors"
              >
                Execute
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;