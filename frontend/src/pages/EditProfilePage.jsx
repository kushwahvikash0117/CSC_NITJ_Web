/**
 * @file EditProfilePage.jsx
 * @description User profile configuration panel for reviewing and editing
 * identity telemetry data using secure HttpOnly cookie authentication.
 */

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";
import { useAuth } from "../context/auth-context";

// --- 1. NEURAL NETWORK BACKGROUND ---
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
        if (mouse.x !== null && mouse.y !== null) {
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

// --- 2. CYBER INPUT COMPONENT ---

/**
 * Reusable cyber-styled input field with telemetry
 * character counter and holographic border effects.
 */
const CyberInput = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  maxLength,
  showCounter = false,
}) => {
  return (
    <div className="group relative mb-6">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-xs md:text-sm font-bold uppercase tracking-widest text-cyan-400 font-mono">
          {label}
        </label>

        {showCounter && maxLength && (
          <span className="text-[10px] font-mono text-gray-500 group-focus-within:text-cyan-400 transition-colors">
            {(value || "").length}/{maxLength}
          </span>
        )}
      </div>

      <div className="relative">
        <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-cyan-500/40 transition-all group-hover:w-full group-hover:h-full group-hover:border-none group-hover:bg-cyan-500/5 rounded-sm pointer-events-none" />

        <input
          type={type}
          name={name}
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full bg-[#050b14]/90 border-b border-gray-700 text-white px-4 py-3.5 font-mono text-sm md:text-base focus:outline-none focus:border-cyan-400 focus:bg-cyan-950/20 transition-all placeholder-gray-600 relative z-10 rounded-t-lg"
        />

        <div className="absolute bottom-0 left-0 h-[2px] bg-cyan-400 w-0 group-hover:w-full transition-all duration-500 shadow-[0_0_12px_#22d3ee]" />
      </div>
    </div>
  );
};

// --- 3. EDIT PROFILE PAGE COMPONENT ---

/**
 * Main profile modification module supporting direct form
 * configuration and live holographic card preview.
 *
 * Authentication:
 * - Uses AuthContext for the current session.
 * - Uses apiFetch() for API requests.
 * - Authentication credentials are sent through the
 *   HttpOnly cookie automatically.
 * - No localStorage token is accessed.
 */
const EditProfilePage = () => {
  const navigate = useNavigate();

  const {
    user: authenticatedUser,
    loading: authLoading,
    logout,
  } = useAuth();

  const [saving, setSaving] = useState(false);

  const [activeTab, setActiveTab] =
    useState("form");

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    github: "",
    linkedin: "",
  });

  /**
   * Display a temporary toast notification.
   */
  const showToast = (
    message,
    type = "success"
  ) => {
    setToast({
      show: true,
      message,
      type,
    });

    setTimeout(() => {
      setToast({
        show: false,
        message: "",
        type: "",
      });
    }, 3500);
  };

  /**
   * Load the authenticated user's profile.
   *
   * No token is manually retrieved.
   *
   * apiFetch() automatically sends:
   *
   * credentials: "include"
   *
   * allowing the backend to authenticate using
   * the HttpOnly cookie.
   */
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!authenticatedUser) {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    const loadProfile = async () => {
      try {
        const response = await apiFetch(
          "/api/users/profile"
        );

        const text = await response.text();

        let data;

        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(
            "Server response invalid"
          );
        }

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load profile"
          );
        }

        setFormData({
          name: data.name || "",
          email: data.email || authenticatedUser.email || "",
          bio: data.bio || "",
          github: data.github || "",
          linkedin: data.linkedin || "",
        });
      } catch (error) {
        console.error(
          "Failed to load profile data:",
          error
        );

        /*
         * A 401 means the session is no longer valid.
         * Clear the application auth state and return
         * the user to login.
         */
        if (error.message === "Authentication required") {
          await logout();

          navigate("/login", {
            replace: true,
          });

          return;
        }

        showToast(
          error.message ||
            "Failed to establish secure data sync.",
          "error"
        );
      }
    };

    loadProfile();
  }, [
    authLoading,
    authenticatedUser,
    navigate,
    logout,
  ]);

  /**
   * Handle profile field changes.
   */
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /**
   * Save updated profile configuration.
   *
   * Authentication is provided through the HttpOnly
   * cookie automatically by apiFetch().
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);

    try {
      /*
       * Only editable profile fields are submitted.
       *
       * Email and role are intentionally excluded
       * from the update payload.
       */
      const payload = {
        name: formData.name,
        bio: formData.bio,
        github: formData.github,
        linkedin: formData.linkedin,
      };

      const response = await apiFetch(
        "/api/users/update",
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const text = await response.text();

      let data = {};

      try {
        data = text
          ? JSON.parse(text)
          : {};
      } catch {
        throw new Error(
          "Server response invalid"
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to commit profile updates."
        );
      }

      showToast(
        "Configuration updated successfully. Redirecting...",
        "success"
      );

      /*
       * Give the toast a moment to display before
       * returning to the profile page.
       */
      setTimeout(() => {
        setSaving(false);

        navigate("/profile", {
          replace: true,
        });
      }, 1200);
    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      setSaving(false);

      /*
       * If the backend rejects the session,
       * refresh the authentication state.
       */
      if (
        error.message ===
        "Authentication required"
      ) {
        await logout();

        navigate("/login", {
          replace: true,
        });

        return;
      }

      showToast(
        error.message ||
          "Network uplink error encountered.",
        "error"
      );
    }
  };

  /*
   * Prevent the edit page from rendering before
   * the authentication state has been determined.
   */
  if (
    authLoading ||
    !authenticatedUser
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

  return (
    <div className="bg-[#010714] text-white min-h-screen relative flex flex-col font-sans selection:bg-cyan-500/30 pb-16">
      <NeuralNetwork />

      {/* Floating Toast Notification */}
      {toast.show && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div
            className={`px-6 py-3 rounded-xl border font-mono text-xs tracking-wider shadow-2xl backdrop-blur-md flex items-center gap-3 ${
              toast.type === "error"
                ? "bg-red-950/80 border-red-500/50 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                : "bg-cyan-950/80 border-cyan-500/50 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.3)]"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full animate-ping ${
                toast.type === "error"
                  ? "bg-red-400"
                  : "bg-cyan-400"
              }`}
            />

            {toast.message}
          </div>
        </div>
      )}

      <div className="relative z-10 flex-grow flex items-center justify-center py-20 px-6">
        <div className="w-full max-w-4xl bg-[#07101e]/90 backdrop-blur-2xl border border-cyan-500/20 rounded-[2.5rem] p-6 md:p-10 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">

          {/* Holographic Scanline Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20" />

          <div className="relative z-10">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-white/10 pb-6 gap-4">

              <div className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-500/10 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.15)]">
                  <span className="text-xl font-black text-cyan-300 font-mono uppercase">
                    {formData.name?.[0] ||
                      "U"}
                  </span>
                </div>

                <div>
                  <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-white">
                    Edit{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                      Identity
                    </span>
                  </h1>

                  <p className="text-xs font-mono text-cyan-400/70 tracking-widest mt-1">
                    NODE CONFIG // INTERACTIVE UPLINK
                  </p>
                </div>
              </div>

              {/* Interactive View Switcher */}
              <div className="flex bg-[#030712] p-1.5 rounded-xl border border-white/10 font-mono text-xs">

                <button
                  type="button"
                  onClick={() =>
                    setActiveTab("form")
                  }
                  className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                    activeTab === "form"
                      ? "bg-cyan-500 text-[#010714] font-bold shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Edit Form
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setActiveTab("preview")
                  }
                  className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                    activeTab === "preview"
                      ? "bg-cyan-500 text-[#010714] font-bold shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Live Preview
                </button>

              </div>
            </div>

            {/* Conditional Content */}
            {activeTab === "form" ? (
              <form
                onSubmit={handleSubmit}
                className="space-y-2 animate-fadeIn"
              >

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <CyberInput
                    label="Profile Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                  />

                  <div className="opacity-70 pointer-events-none">
                    <CyberInput
                      label="Email [LOCKED]"
                      name="email"
                      value={formData.email}
                      onChange={() => {}}
                    />
                  </div>

                </div>

                <CyberInput
                  label="Bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Brief description of your role..."
                  maxLength={120}
                  showCounter
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <CyberInput
                    label="GitHub Link"
                    name="github"
                    value={formData.github}
                    onChange={handleChange}
                    placeholder="github.com/username"
                  />

                  <CyberInput
                    label="LinkedIn"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    placeholder="linkedin.com/in/username"
                  />

                </div>

                <div className="flex gap-4 mt-8 pt-6 border-t border-white/10">

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/profile")
                    }
                    className="flex-1 py-4 rounded-xl border border-gray-700 text-gray-400 font-mono text-xs font-bold tracking-[0.2em] hover:bg-white/5 hover:border-gray-500 transition-all uppercase cursor-pointer"
                  >
                    Abort
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-[#010714] font-mono text-xs font-bold tracking-[0.2em] hover:from-cyan-400 hover:to-teal-300 shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all uppercase flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <span className="w-2 h-2 bg-black rounded-full animate-bounce" />
                        Saving Config...
                      </>
                    ) : (
                      "Save Configuration"
                    )}
                  </button>

                </div>
              </form>
            ) : (
              /* Live Preview */
              <div className="py-8 px-4 flex flex-col items-center justify-center animate-fadeIn">

                <div className="w-full max-w-md bg-[#030712] border border-cyan-500/40 rounded-3xl p-6 shadow-[0_0_30px_rgba(34,211,238,0.15)] relative">

                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
                      Active Node
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mb-6">

                    <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-2xl font-black font-mono text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                      {formData.name?.[0] ||
                        "?"}
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-white tracking-wide">
                        {formData.name ||
                          "Anonymous Operative"}
                      </h3>

                      <p className="text-xs font-mono text-cyan-400">
                        {formData.email ||
                          "node@domain.Sec"}
                      </p>
                    </div>

                  </div>

                  <div className="bg-[#07101e] rounded-xl p-4 border border-white/5 mb-6">
                    <p className="text-xs font-mono text-gray-300 leading-relaxed">
                      {formData.bio ||
                        "No telemetry bio provided yet. Update configuration to broadcast details."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center font-mono text-xs">

                    <div className="bg-cyan-950/30 border border-cyan-500/20 py-2.5 rounded-lg text-cyan-300 truncate px-2">
                      {formData.github
                        ? `github/${formData.github.replace(
                            /https?:\/\//,
                            ""
                          )}`
                        : "GitHub Unlinked"}
                    </div>

                    <div className="bg-cyan-950/30 border border-cyan-500/20 py-2.5 rounded-lg text-cyan-300 truncate px-2">
                      {formData.linkedin
                        ? `linkedin/${formData.linkedin.replace(
                            /https?:\/\//,
                            ""
                          )}`
                        : "LinkedIn Unlinked"}
                    </div>

                  </div>
                </div>

                <p className="text-xs font-mono text-gray-500 mt-6 tracking-widest text-center">
                  -- REAL-TIME IDENTITY TELEMETRY ACTIVE --
                </p>

              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

EditProfilePage.routePath =
  "/edit-profile";

export default EditProfilePage;