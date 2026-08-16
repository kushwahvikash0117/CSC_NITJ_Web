/**
 * @file Admin.jsx
 * @description Admin Control Panel component featuring an interactive neural network canvas, clearance header, and module management grid.
 */

import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * NeuralNetwork Background Component
 * Renders an interactive canvas particle network.
 */
const NeuralNetwork = memo(() => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;
    let mouse = { x: null, y: null, radius: 180 };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 0.35;
        this.vy = (Math.random() - 0.5) * 0.35;
        this.radius = Math.random() * 1.8 + 1;
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
        ctx.fillStyle = '#22d3ee';
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      const count = Math.floor((canvas.width * canvas.height) / 14000);
      for (let i = 0; i < count; i++) {
        particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'lighter';

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.update();
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#22d3ee';
        p1.draw();

        if (mouse.x !== null && mouse.y !== null) {
          const mdx = p1.x - mouse.x;
          const mdy = p1.y - mouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < mouse.radius) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(34, 211, 238, ${0.5 * (1 - mdist / mouse.radius)})`;
            ctx.lineWidth = 1.2;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(34, 211, 238, ${0.45 * (1 - dist / 180)})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      ctx.globalCompositeOperation = 'source-over';
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />;
});

NeuralNetwork.displayName = 'NeuralNetwork';

/**
 * AdminModule Component
 * Displays individual management modules with animation states and navigation triggers.
 */
const AdminModule = memo(({ id, title, desc, active, prefix, link, icon, badgeText }) => {
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    if (active && link) {
      navigate(link);
    }
  }, [active, link, navigate]);

  return (
    <div
      onClick={handleClick}
      className={`group relative transition-all transform ${
        active
          ? 'opacity-100 translate-y-0 scale-100 duration-700 cursor-pointer'
          : 'opacity-0 translate-y-8 scale-95 duration-300 cursor-not-allowed'
      }`}
    >
      <div className="absolute -inset-[2px] bg-gradient-to-r from-cyan-500/50 via-blue-600/30 to-cyan-500/50 rounded-[2.5rem] opacity-40 group-hover:opacity-100 transition-all duration-500 blur-md group-hover:blur-xl" />
      <div className="relative h-full bg-[#071222]/90 backdrop-blur-2xl border border-cyan-500/20 group-hover:border-cyan-400/60 p-8 sm:p-10 rounded-[2.5rem] flex flex-col transition-all duration-500 shadow-[0_10px_30px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_40px_rgba(34,211,238,0.2)] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_15px_#22d3ee] transition-all duration-1000"
            style={{ width: active ? '100%' : '0%' }}
          />
        </div>
        <div className="flex justify-between items-center mb-6 mt-2">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-cyan-400 tracking-[3px] bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/30 shadow-sm">
              {prefix}_{id}
            </span>
            {badgeText && (
              <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 animate-pulse">
                {badgeText}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest hidden sm:inline">
              {active ? 'ONLINE' : 'LOCKED'}
            </span>
            <div
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                active ? 'bg-cyan-400 shadow-[0_0_12px_#22d3ee] animate-pulse' : 'bg-gray-600'
              }`}
            />
          </div>
        </div>
        <div className="flex items-center gap-4 mb-4">
          {icon && (
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xl shadow-[0_0_15px_rgba(34,211,238,0.1)] group-hover:scale-110 transition-transform duration-300">
              {icon}
            </div>
          )}
          <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight group-hover:text-cyan-300 transition-colors">
            {title}
          </h3>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed mb-8 font-sans">
          {desc}
        </p>
        <div
          className={`mt-auto pt-6 border-t border-white/10 flex items-center justify-between text-xs font-bold uppercase tracking-wider transition-colors ${
            active ? 'text-cyan-400 group-hover:text-cyan-300' : 'text-gray-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className={`h-[1px] w-8 bg-current transition-all ${active ? 'group-hover:w-14' : ''}`} />
            <span>{active ? 'Access Module' : 'Authentication Required'}</span>
          </div>
          <span className={`font-mono text-sm transition-transform duration-300 ${active ? 'group-hover:translate-x-1.5 text-cyan-400' : 'text-gray-600'}`}>
            →
          </span>
        </div>
      </div>
    </div>
  );
});

AdminModule.displayName = 'AdminModule';

/**
 * AdminPage Component
 * Main page view containing the neural network, clearance banner, and administrative module grid.
 */
const AdminPage = () => {
  const [visible, setVisible] = useState([false, false]);

  useEffect(() => {
    const timer1 = setTimeout(() => setVisible([true, false]), 250);
    const timer2 = setTimeout(() => setVisible([true, true]), 550);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="bg-[#010714] text-white min-h-screen relative overflow-x-hidden font-sans selection:bg-cyan-500/30">
      <NeuralNetwork />

      {/* Hero Section */}
      <section className="relative z-10 pt-28 pb-16 px-6 flex justify-center">
        <div className="max-w-4xl w-full bg-gradient-to-b from-[#0a1628]/80 to-[#071222]/90 backdrop-blur-3xl border border-cyan-500/20 p-12 sm:p-16 rounded-[3rem] text-center shadow-[0_0_50px_rgba(0,0,0,0.6)] relative overflow-hidden">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs uppercase tracking-[0.25em] mb-6 shadow-sm">
            <span>🛡️</span> Admin Security Clearance Verified
          </div>
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight mb-6">
            Admin <span className="text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">Control Panel</span>
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Authorized central command interface for institutional governance, workshop scheduling, payload moderation, and real-time operational control.
          </p>
        </div>
      </section>

      {/* Admin Modules Grid */}
      <section className="relative z-10 px-6 pb-36 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 justify-center max-w-4xl mx-auto">
          <AdminModule
            active={visible[0]}
            id="001"
            prefix="EVT"
            title="Event Control"
            desc="Create, modify, deploy, or retire official CSC security workshops, hackathons, and technical symposium streams."
            link="/admin/events"
            icon="⚡"
            badgeText="Live Sync"
          />
          <AdminModule
            active={visible[1]}
            id="002"
            prefix="MOD"
            title="Blog Moderation"
            desc="Review incoming analytical articles, inspect code payloads, and manage approval queues prior to public archive deployment."
            link="/admin/blogs"
            icon="🔒"
            badgeText="Queue Active"
          />
        </div>
      </section>
    </div>
  );
};

export default AdminPage;