import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";

// --- 1. NEURAL NETWORK BACKGROUND (Exact Copy) ---
const NeuralNetwork = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };
    class Particle {
      constructor(x, y) {
        this.x = x; this.y = y;
        this.vx = (Math.random() - 0.5) * 0.25;
        this.vy = (Math.random() - 0.5) * 0.25;
        this.radius = 2;
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#22d3ee';
        ctx.fill();
      }
    }
    const init = () => {
      particles = [];
      const count = Math.floor((canvas.width * canvas.height) / 18000);
      for (let i = 0; i < count; i++) {
        particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height));
      }
    };
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i]; p1.update();
        ctx.shadowBlur = 15; ctx.shadowColor = '#22d3ee';
        p1.draw();
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x; const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 220) {
            ctx.shadowBlur = 0; ctx.beginPath();
            ctx.strokeStyle = `rgba(34, 211, 238, ${0.7 * (1 - dist / 220)})`;
            ctx.lineWidth = 1.2; ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
          }
        }
      }
      ctx.globalCompositeOperation = 'source-over';
      animationFrameId = requestAnimationFrame(animate);
    };
    window.addEventListener('resize', resize);
    resize(); animate();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />;
};

// --- 2. REUSABLE CYBER CARD (Adapted for Profile Content) ---
const CyberCard = ({ active, className, children, delay = 0 }) => {
  return (
    <div
      className={`group relative transition-all transform ease-in-out ${className} ${
        active
          ? 'opacity-100 translate-y-0 scale-100 duration-1000'
          : 'opacity-0 translate-y-12 scale-95 duration-300'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Glow Backdrop */}
      <div className="absolute -inset-[1px] bg-gradient-to-b from-cyan-500/40 to-transparent rounded-[2.5rem] opacity-30 group-hover:opacity-60 transition-all duration-500 blur-[2px]" />

      {/* Main Container */}
      <div className="relative h-full bg-[#0a1628]/80 backdrop-blur-2xl border border-white/5 p-8 md:p-10 rounded-[2.5rem] overflow-hidden flex flex-col">

        {/* Top Scanning Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
          <div
            className="h-full bg-cyan-500 shadow-[0_0_10px_#22d3ee] transition-all duration-[1500ms] ease-out"
            style={{ width: active ? '100%' : '0%' }}
          />
        </div>

        {children}
      </div>
    </div>
  );
};

// --- 3. MAIN PROFILE PAGE ---
const ProfilePage = ({ onLogout }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Animation State
  const [headerVisible, setHeaderVisible] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiFetch("/api/users/profile");

        const text = await res.text();
        let data;

        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Server response invalid");
        }

        if (!res.ok) {
          throw new Error(data.message || "Profile fetch failed");
        }

        setUser({
          name: data.name,
          email: data.email,
          role: data.role,
          joinedAt: new Date(data.createdAt).toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric",
          }),
          blogs: data.blogsCount || 0,
          likes: data.likesCount || 0,
        });

      } catch (err) {
        console.error("Profile error:", err.message);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);


  useEffect(() => {
    if (!loading && user) {
      setTimeout(() => setHeaderVisible(true), 100);
      setTimeout(() => setCardsVisible(true), 400);
    }
  }, [loading, user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#010714] flex items-center justify-center text-cyan-400 font-mono">
        <NeuralNetwork />
        <div className="relative z-10 flex flex-col items-center animate-pulse">
            <div className="h-1 w-24 bg-cyan-500 shadow-[0_0_15px_#22d3ee] mb-4"/>
            <span className="tracking-[0.5em] text-xs font-bold uppercase">Initializing Uplink...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#010714] text-white min-h-screen relative overflow-x-hidden selection:bg-cyan-500/30">

      {/* Background Canvas */}
      <NeuralNetwork />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 md:py-32">

        {/* HEADER SECTION */}
        <div className={`flex flex-col items-center mb-16 text-center transition-all transform ${
           headerVisible ? 'opacity-100 translate-y-0 duration-1000' : 'opacity-0 -translate-y-10 duration-500'
        }`}>
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 backdrop-blur-md mb-6">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#22d3ee]"></span>
            <span className="text-[10px] font-mono tracking-[0.2em] text-cyan-300">SECURE CONNECTION ESTABLISHED</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white/90">
            Cyber <span className="text-cyan-500 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]">Identity</span>
          </h1>
        </div>

        {/* GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

          {/* --- LEFT COLUMN: IDENTITY CARD --- */}
          <div className="lg:col-span-4">
            <CyberCard active={cardsVisible} delay={0} className="h-full">

               {/* Card Header */}
               <div className="flex justify-between items-center mb-10">
                  <span className="font-mono text-[10px] text-cyan-500/80 tracking-[3px] bg-cyan-500/5 px-3 py-1 rounded-md border border-cyan-500/20">
                    ID_{user.role.toUpperCase().substring(0,3)}
                  </span>
                  <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
               </div>

               {/* Avatar Section */}
               <div className="flex flex-col items-center mb-8">
                  <div className="relative w-32 h-32 mb-6 group-hover:scale-105 transition-transform duration-500">
                    {/* Rotating Rings */}
                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/30 animate-[spin_10s_linear_infinite]" />
                    <div className="absolute inset-2 rounded-full border border-cyan-500/50 animate-[spin_15s_linear_infinite_reverse]" />

                    {/* Center Initials */}
                    <div className="absolute inset-4 rounded-full bg-[#0a1628] flex items-center justify-center border border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                      <span className="text-4xl font-black text-cyan-400">{user.name?.[0] || "U"}</span>
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-white text-center mb-1 tracking-wide">{user.name}</h2>
                  <p className="text-cyan-500/60 font-mono text-xs tracking-wider">&lt; {user.email} /&gt;</p>
               </div>

               {/* Details List */}
               <div className="space-y-4 mt-auto">
                 <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-gray-400 text-xs uppercase tracking-widest">Role</span>
                    <span className="text-cyan-400 font-bold text-sm shadow-cyan-glow">{user.role}</span>
                 </div>
                 <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-gray-400 text-xs uppercase tracking-widest">Joined</span>
                    <span className="text-white font-mono text-xs">{user.joinedAt}</span>
                 </div>
               </div>
            </CyberCard>
          </div>

          {/* --- RIGHT COLUMN: STATS & ACTIONS --- */}
          <div className="lg:col-span-8 flex flex-col gap-8">

            {/* STATS CARD */}
            <CyberCard active={cardsVisible} delay={200} className="flex-1">
                <div className="flex justify-between items-center mb-8">
                  <span className="font-mono text-[10px] text-cyan-500/80 tracking-[3px] bg-cyan-500/5 px-3 py-1 rounded-md border border-cyan-500/20">
                    METRICS_001
                  </span>
                  <div className="w-16 h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-12 flex-1 items-center">

                  {/* Blog Stat */}
                  <div className="relative p-6 rounded-2xl bg-white/5 border border-white/5 group hover:border-cyan-500/30 transition-colors">
                    <h3 className="text-xs font-bold text-gray-400 tracking-[0.3em] uppercase mb-4">Total Blogs</h3>
                    <div className="flex items-end gap-4">
                      <span className="text-6xl font-black text-white group-hover:text-cyan-400 transition-colors duration-500">
                        {user.blogs < 10 ? `0${user.blogs}` : user.blogs}
                      </span>
                      {/* Visualizer Lines */}
                      <div className="flex gap-1 h-8 items-end opacity-40 mb-2">
                         {[40, 70, 30, 80, 50].map((h, i) => (
                           <div key={i} className="w-1 bg-cyan-500" style={{ height: `${h}%` }} />
                         ))}
                      </div>
                    </div>
                  </div>

                  {/* Likes Stat */}
                  <div className="relative p-6 rounded-2xl bg-white/5 border border-white/5 group hover:border-purple-500/30 transition-colors">
                    <h3 className="text-xs font-bold text-gray-400 tracking-[0.3em] uppercase mb-4">Reputation</h3>
                    <div className="flex items-end gap-4">
                      <span className="text-6xl font-black text-white group-hover:text-purple-400 transition-colors duration-500">
                        {user.likes < 10 ? `0${user.likes}` : user.likes}
                      </span>
                       {/* Visualizer Lines */}
                       <div className="flex gap-1 h-8 items-end opacity-40 mb-2">
                         {[60, 20, 90, 40, 70].map((h, i) => (
                           <div key={i} className="w-1 bg-purple-500" style={{ height: `${h}%` }} />
                         ))}
                      </div>
                    </div>
                  </div>

               </div>
            </CyberCard>

            {/* ACTION BUTTONS ROW */}
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 transition-all duration-1000 delay-500 ${
              cardsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>

              <button
                onClick={() => navigate('/edit-profile')}// <--- ADD THIS LINE
                 className="relative group overflow-hidden rounded-xl bg-[#0a1628] border border-cyan-500/30 p-4 text-center hover:border-cyan-500 transition-all duration-300"
              >
                 <div className="absolute inset-0 bg-cyan-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                 <span className="relative font-mono text-xs font-bold tracking-[0.2em] text-cyan-400 group-hover:text-white uppercase">
                   Edit Profile
                 </span>
              </button>


               <button
               onClick={() => navigate('/my-blogs')}
               className="relative group overflow-hidden rounded-xl bg-[#0a1628] border border-white/10 p-4 text-center hover:border-white/30 transition-all duration-300">
                  <span className="relative font-mono text-xs font-bold tracking-[0.2em] text-gray-400 group-hover:text-white uppercase">
                    My Blogs
                  </span>
               </button>

               <button
                 onClick={async () => {
                   await onLogout();
                   navigate("/");
                 }}
                 className="relative group overflow-hidden rounded-xl bg-[#0a1628] border border-red-500/30 p-4 text-center hover:border-red-500 transition-all duration-300"
               >
                  <div className="absolute inset-0 bg-red-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative font-mono text-xs font-bold tracking-[0.2em] text-red-500 group-hover:text-white uppercase">
                   LOGOUT
                  </span>
               </button>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
