import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";

/* Animated neural-network background */
const NeuralNetwork = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let particles = [];
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 0.25;
        this.vy = (Math.random() - 0.5) * 0.25;
        this.radius = 2;
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
      const count = Math.floor(
        (canvas.width * canvas.height) / 18000
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

          if (dist < 220) {
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(34, 211, 238, ${
              0.7 * (1 - dist / 220)
            })`;
            ctx.lineWidth = 1.2;
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
      style={{ zIndex: 0 }}
    />
  );
};

/* Reusable cyber-styled input */
const CyberInput = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
}) => {
  return (
    <div className="group relative mb-8">
      <label className="block text-xs md:text-sm font-bold uppercase tracking-widest text-cyan-400 mb-3 font-mono">
        {label}
      </label>

      <div className="relative">
        <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-cyan-500 transition-all group-hover:w-full group-hover:h-full group-hover:border-none group-hover:bg-cyan-500/5 rounded-sm pointer-events-none" />

        <input
          type={type}
          name={name}
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-[#050b14]/80 border-b border-gray-600 text-white px-4 py-4 font-mono text-sm md:text-base focus:outline-none focus:border-cyan-400 focus:bg-cyan-900/10 transition-all placeholder-gray-600 relative z-10"
        />

        <div className="absolute bottom-0 left-0 h-[2px] bg-cyan-400 w-0 group-hover:w-full transition-all duration-500 shadow-[0_0_10px_#22d3ee]" />
      </div>
    </div>
  );
};

const EditProfilePage = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  // Profile form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    bio: "",
    github: "",
    linkedin: "",
  });

  // Load existing profile data
  useEffect(() => {
    apiFetch("/api/users/profile")
      .then((res) => res.json())
      .then((data) => {
        setFormData({
          name: data.name || "",
          email: data.email || "",
          role: data.role || "",
          bio: data.bio || "",
          github: data.github || "",
          linkedin: data.linkedin || "",
        });
      })
      .catch((err) => {
        console.error("Failed to load profile data", err);
      });
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Save updated profile
  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);

    apiFetch("/api/users/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((res) => {
        if (res.ok) {
          setTimeout(() => {
            setSaving(false);
            navigate("/profile");
          }, 1000);
        } else {
          setSaving(false);
          alert("Failed to update profile.");
        }
      })
      .catch((err) => {
        console.error(err);
        setSaving(false);
      });
  };

  return (
    <div className="bg-[#010714] text-white min-h-screen relative flex flex-col font-sans">
      <NeuralNetwork />

      <div className="relative z-10 flex-grow flex items-center justify-center py-24 px-6">
        <div className="w-full max-w-2xl bg-[#0a1628]/90 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-2xl">
          <div className="flex justify-between items-start mb-12 border-b border-white/10 pb-6">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-wider text-white">
                Edit{" "}
                <span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                  Your Identity
                </span>
              </h1>
            </div>

            <div className="w-10 h-10 border border-cyan-500/30 rounded-lg flex items-center justify-center bg-cyan-900/10">
              <div className="w-4 h-4 bg-cyan-400 rounded-sm animate-pulse" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <CyberInput
                label="Profile Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
              />

              <div className="opacity-60 pointer-events-none grayscale">
                <CyberInput
                  label="Email [LOCKED]"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <CyberInput
              label="Bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Brief description of your role..."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

            <div className="flex gap-4 mt-10 pt-6 border-t border-white/10">
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="flex-1 py-4 rounded-xl border border-gray-600 text-gray-400 font-mono text-xs font-bold tracking-[0.2em] hover:bg-white/5 transition-colors uppercase"
              >
                Abort
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-4 rounded-xl bg-cyan-500 text-[#010714] font-mono text-xs font-bold tracking-[0.2em] hover:bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all uppercase flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <span className="w-2 h-2 bg-black rounded-full animate-bounce" />
                    Processing...
                  </>
                ) : (
                  "Save Configuration"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
