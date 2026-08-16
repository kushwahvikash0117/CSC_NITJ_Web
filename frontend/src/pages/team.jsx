/**
 * @file team.jsx
 * @description Core team display component featuring network-themed circuits, dossiers, and dynamic clearance tiers for club members.
 */

import React, { useState, useEffect, useRef, forwardRef } from 'react';

// --- IMAGE IMPORTS ---
import vikashImg from '../assets/vikash.png';
import kritikaImg from '../assets/kritika.png';
import jassImg from '../assets/jass.png';
import samarthImg from '../assets/samarth.jsx.png';
import komleenImg from '../assets/komleen.png';
import simranImg from '../assets/simran.png';
import dhruvSagarImg from '../assets/dhruv_sagar.png';
import dhruvTyagiImg from '../assets/dhruv_tyagi.png';
import mohitImg from '../assets/mohit.png';
import sukhanImg from '../assets/sukhanpreet.png';
import sakshiImg from '../assets/sakshi.jpg';
import sushobhitImg from '../assets/sushobhit.png';
import kisnaImg from '../assets/kisna.png';
import pranjalImg from '../assets/pranjal.png';
import mandeepImg from '../assets/mandeep.png';
import riteshImg from '../assets/ritesh.png';
import sudiptoImg from '../assets/sudipto.png';

// Fallback avatar generator for newly added members without local assets
const getFallbackImg = (name) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

/**
 * @component NeuralNetwork
 * @description Interactive canvas background rendering animated nodes and connecting webs.
 */
const NeuralNetwork = () => {
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
        this.x = x; this.y = y;
        this.vx = (Math.random() - 0.5) * 0.4; 
        this.vy = (Math.random() - 0.5) * 0.4;
        this.radius = Math.random() * 1.8 + 1;
        this.pulse = Math.random() * Math.PI;
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        this.pulse += 0.03;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + Math.sin(this.pulse) * 0.3, 0, Math.PI * 2);
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
        const p1 = particles[i]; p1.update();
        ctx.shadowBlur = 15; ctx.shadowColor = '#22d3ee';
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
          const dx = p1.x - p2.x; const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            ctx.shadowBlur = 0; ctx.beginPath();
            ctx.strokeStyle = `rgba(34, 211, 238, ${0.45 * (1 - dist / 180)})`;
            ctx.lineWidth = 0.8; ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
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
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />;
};

/**
 * @component CircuitBFS
 * @description Animated circuit traces connecting member cards using BFS routing algorithms.
 */
const CircuitBFS = ({ cardRefs }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let traces = [];
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = document.documentElement.scrollHeight;
    };

    class Trace {
      constructor(start, end, delay) {
        this.start = start;
        this.end = end;
        this.midY = start.y + (end.y - start.y) * 0.5;
        this.progress = -delay;
        this.speed = 0.015; 
      }
      update() {
        this.progress += this.speed;
        if (this.progress > 1.2) this.progress = -0.2;
      }
      draw() {
        if (this.progress < 0 || this.progress > 1) return;
        ctx.beginPath();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = `rgba(34, 211, 238, ${Math.sin(this.progress * Math.PI) * 0.85})`;
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = 12;
        const p = this.progress;
        
        ctx.moveTo(this.start.x, this.start.y);
        
        if (Math.abs(this.start.y - this.end.y) < 20) {
            ctx.lineTo(this.start.x + (this.end.x - this.start.x) * p, this.start.y);
        } else {
            if (p < 0.3) {
              ctx.lineTo(this.start.x, this.start.y + (this.midY - this.start.y) * (p / 0.3));
            } else if (p < 0.7) {
              ctx.lineTo(this.start.x, this.midY);
              ctx.lineTo(this.start.x + (this.end.x - this.start.x) * ((p - 0.3) / 0.4), this.midY);
            } else {
              ctx.lineTo(this.start.x, this.midY);
              ctx.lineTo(this.end.x, this.midY);
              ctx.lineTo(this.end.x, this.midY + (this.end.y - this.midY) * ((p - 0.7) / 0.3));
            }
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }

    const init = () => {
      const nodes = cardRefs.current.filter(Boolean).map(el => {
        const rect = el.getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + window.scrollY + rect.height / 2 };
      });

      const tiers = [];
      nodes.forEach(n => {
        let t = tiers.find(tier => Math.abs(tier.y - n.y) < 100);
        if (t) t.nodes.push(n); else tiers.push({ y: n.y, nodes: [n] });
      });
      tiers.sort((a, b) => a.y - b.y);
      
      traces = [];
      for (let i = 0; i < tiers.length; i++) {
        const currentTier = tiers[i];
        for (let k = 0; k < currentTier.nodes.length - 1; k++) {
            traces.push(new Trace(currentTier.nodes[k], currentTier.nodes[k+1], k * 0.2));
        }
        if (i < tiers.length - 1) {
            currentTier.nodes.forEach(s => {
                tiers[i+1].nodes.forEach((e, idx) => {
                    traces.push(new Trace(s, e, i * 0.3 + idx * 0.1));
                });
            });
        }
      }
    };

    window.addEventListener('resize', () => { resize(); init(); });
    resize(); setTimeout(init, 800); 
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      traces.forEach(t => { t.update(); t.draw(); });
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [cardRefs]);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }} />;
};

/**
 * @component SectionHeading
 * @description Section title component featuring animated gradient borders and clearance counts.
 */
const SectionHeading = ({ title, count }) => (
  <div className="relative flex items-center justify-center w-full max-w-7xl mx-auto mb-16 px-4">
    <style dangerouslySetInnerHTML={{ __html: `
      @keyframes breatheLine {
        0%, 100% { opacity: 0.3; transform: scaleX(0.98); }
        50% { opacity: 0.85; transform: scaleX(1); }
      }
      .animate-breathe { animation: breatheLine 4s ease-in-out infinite; }
    `}} />
    <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-cyan-400 animate-breathe relative">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]" />
    </div>
    <div className="px-8 flex items-center gap-3">
      <h2 className="text-[11px] md:text-[13px] font-mono tracking-[1em] text-cyan-400 uppercase whitespace-nowrap drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]">
        {title}
      </h2>
      {count !== undefined && (
        <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono">
          0{count}
        </span>
      )}
    </div>
    <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-cyan-500 to-cyan-400 animate-breathe relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]" />
    </div>
  </div>
);

/**
 * @component MemberCard
 * @description Individual team member display node with hover highlights and secure styling.
 */
const MemberCard = forwardRef(({ name, role, type, image, onSelect }, ref) => {
  const styles = {
    coordinator: { border: "border-amber-400/30", hoverBorder: "group-hover:border-amber-400", glow: "group-hover:shadow-[0_0_35px_rgba(251,191,36,0.25)]", text: "text-amber-400", badge: "bg-amber-400/10 text-amber-300 border-amber-400/30" },
    head: { border: "border-cyan-500/30", hoverBorder: "group-hover:border-cyan-500", glow: "group-hover:shadow-[0_0_35px_rgba(34,211,238,0.25)]", text: "text-cyan-400", badge: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30" },
    member: { border: "border-gray-700/40", hoverBorder: "group-hover:border-gray-400", glow: "group-hover:shadow-[0_0_35px_rgba(255,255,255,0.08)]", text: "text-gray-400", badge: "bg-gray-500/10 text-gray-300 border-gray-500/30" }
  };
  const currentStyle = styles[type] || styles.head;

  const isVikash = name.includes("Vikash");
  const isKritika = name.includes("Kritika");

  return (
    <div 
      ref={ref} 
      onClick={onSelect}
      className={`group relative bg-[#0a1628]/60 backdrop-blur-2xl border ${currentStyle.border} p-8 rounded-[2.5rem] flex flex-col items-center text-center transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] ${currentStyle.glow} z-25 cursor-pointer`}
    >
      <div className={`absolute inset-0 rounded-[2.5rem] border-2 border-transparent ${currentStyle.hoverBorder} transition-all duration-500 opacity-0 group-hover:opacity-100 pointer-events-none`} />
      <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-b from-white/[0.07] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative w-32 h-32 rounded-full overflow-hidden mb-6 border-2 border-white/10 bg-gray-900 group-hover:border-cyan-400/50 transition-all duration-500 shadow-lg shadow-black/50 flex items-center justify-center">
        <img 
          src={image} 
          alt={name} 
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110
            ${isVikash ? 'mix-blend-lighten scale-150 object-[center_35%]' : ''} 
            ${isKritika ? 'object-top scale-110' : 'object-center'}`} 
        />
      </div>

      <h4 className="relative text-white font-bold text-xl tracking-tight uppercase group-hover:text-cyan-200 transition-colors">{name}</h4>
      <p className={`relative font-mono text-[10px] mt-2 tracking-[0.25em] uppercase ${currentStyle.text}`}>{role}</p>
      
      <div className="mt-4 pt-4 border-t border-white/5 w-full flex items-center justify-center">
        <span className={`text-[9px] font-mono px-3 py-1 rounded-full border ${currentStyle.badge} tracking-widest uppercase`}>
          [SECURE_NODE]
        </span>
      </div>
    </div>
  );
});

/**
 * @component MemberModal
 * @description Detailed modal popup presenting security clearance dossier for selected operatives.
 */
const MemberModal = ({ member, onClose }) => {
  if (!member) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all">
      <div className="relative w-full max-w-lg bg-[#081120] border border-cyan-500/50 rounded-3xl p-8 shadow-[0_0_50px_rgba(34,211,238,0.25)] text-left animate-in fade-in zoom-in duration-300">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 w-9 h-9 rounded-full flex items-center justify-center transition-colors font-bold cursor-pointer"
        >
          ✕
        </button>
        <div className="flex items-center gap-6 mb-6">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-cyan-400/40 bg-gray-900 shrink-0 flex items-center justify-center">
            <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">// DOSSIER ID: 0x{Math.floor(Math.random() * 8999 + 1000)}</span>
            <h3 className="text-2xl font-bold uppercase text-white mt-1">{member.name}</h3>
            <p className="text-xs font-mono text-cyan-300 tracking-wider uppercase mt-1">{member.role}</p>
          </div>
        </div>
        <div className="space-y-3 bg-black/40 p-5 rounded-2xl border border-cyan-500/20 font-mono text-xs text-gray-300">
          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-gray-500">SECTION:</span>
            <span className="text-cyan-400 uppercase">{member.section}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-gray-500">SECURITY CLEARANCE:</span>
            <span className="text-emerald-400">LEVEL 4 - AUTHORIZED</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-500">PROTOCOL STATUS:</span>
            <span className="text-cyan-300">ACTIVE OPERATIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * @component TeamsPage
 * @description Main parent view orchestrating layout sections, cards, and modal states for the team directory.
 */
const TeamsPage = () => {
  const [mounted, setMounted] = useState(false);
  const [activeModalMember, setActiveModalMember] = useState(null);

  const cardRefs = useRef([]);
  cardRefs.current = [];
  const addToRefs = (el) => { if (el) cardRefs.current.push(el); };

  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const studentCoordinators = [
    { name: "Vikash Kushwah", role: "Student Coordinator", type: "coordinator", image: vikashImg, section: "Core Command" },
    { name: "Kritika Joshi", role: "Student Coordinator", type: "coordinator", image: kritikaImg, section: "Core Command" }
  ];

  const coCoordinators = [
    { name: "Mohit Gangwar", role: "Co-Coordinator & PR Lead", type: "head", image: mohitImg, section: "Co-Coordinators" },
    { name: "Simran Maurya", role: "Co-Coordinator & Digital Lead", type: "head", image: simranImg, section: "Co-Coordinators" }
  ];

  const communicationsTeam = [
    { name: "Sakshi Jha", role: "Digital Lead", type: "head", image: sakshiImg, section: "Communications" },
    { name: "Dhruv Tyagi", role: "Social Media Lead", type: "head", image: dhruvTyagiImg, section: "Communications" }
  ];

  const techTeam = [
    { name: "Jaspreet Kaur", role: "Tech Lead", type: "head", image: jassImg, section: "Tech Command" },
    { name: "Sukhanpreet Singh", role: "Tech Lead", type: "head", image: sukhanImg, section: "Tech Command" },
    { name: "Sushobhit Goyal", role: "Tech Lead", type: "head", image: sushobhitImg, section: "Tech Command" }
  ];

  const websiteTeam = [
    { name: "Samarth Chakrawarti", role: "Website Lead", type: "head", image: samarthImg, section: "Website Command" },
    { name: "Kisna Garg", role: "Website Lead", type: "head", image: kisnaImg, section: "Website Command" }
  ];

  const managementTeam = [
    { name: "Komleen Kaur", role: "Management Lead", type: "head", image: komleenImg, section: "Management" },
    { name: "Mandeep Singh", role: "Management Lead", type: "head", image: mandeepImg, section: "Management" },
    { name: "Pranjal Bansal", role: "Management Lead", type: "head", image: pranjalImg, section: "Management" }
  ];

  const disciplineTeam = [
    { name: "Dhruv Sagar", role: "Discipline Lead", type: "head", image: dhruvSagarImg, section: "Discipline" },
    { name: "Ritesh Kumar", role: "Discipline Lead", type: "head", image: riteshImg, section: "Discipline" },
    { name: "Sudipto Bairagi", role: "Discipline Lead", type: "head", image: sudiptoImg, section: "Discipline" }
  ];

  return (
    <div className="bg-[#010714] text-white relative overflow-x-hidden font-sans pb-32">
      <NeuralNetwork />
      <CircuitBFS cardRefs={cardRefs} />

      {/* HEADER SECTION */}
      <section className="relative z-10 pt-44 pb-12 px-6 max-w-7xl mx-auto text-center">
        <div className={`transition-all duration-1000 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
          <div className="inline-block px-6 py-2 border border-cyan-500/30 bg-cyan-500/10 rounded-full mb-6 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
            <span className="text-cyan-400 font-mono text-[10px] tracking-[0.5em] uppercase">// Core Network Command v2.6</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-widest uppercase leading-none">
            OUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-cyan-400 to-teal-400">TEAM</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base font-mono max-w-2xl mx-auto tracking-wider">
            Engineers, analysts, and visionaries driving security protocols and innovation at NIT Jalandhar.
          </p>
        </div>
      </section>

      {/* STUDENT COORDINATORS */}
      <section className={`relative z-10 py-12 px-6 max-w-5xl mx-auto transition-all duration-1000 delay-300 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
        <SectionHeading title="Student Coordinators" count={1} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {studentCoordinators.map((m, idx) => (
            <MemberCard key={idx} ref={addToRefs} {...m} onSelect={() => setActiveModalMember(m)} />
          ))}
        </div>
      </section>

      {/* CO-COORDINATORS */}
      <section className={`relative z-10 py-16 px-6 max-w-5xl mx-auto transition-all duration-1000 delay-400 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
        <SectionHeading title="Co-Coordinators" count={2} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {coCoordinators.map((m, idx) => (
            <MemberCard key={idx} ref={addToRefs} {...m} onSelect={() => setActiveModalMember(m)} />
          ))}
        </div>
      </section>

      {/* COMMUNICATIONS & MEDIA */}
      <section className={`relative z-10 py-16 px-6 max-w-7xl mx-auto transition-all duration-1000 delay-500 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
        <SectionHeading title="Communications & Social Media" count={3} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          {communicationsTeam.map((m, idx) => (
            <MemberCard key={idx} ref={addToRefs} {...m} onSelect={() => setActiveModalMember(m)} />
          ))}
        </div>
      </section>

      {/* TECH COMMAND */}
      <section className={`relative z-10 py-16 px-6 max-w-7xl mx-auto transition-all duration-1000 delay-600 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
        <SectionHeading title="Tech Command" count={4} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {techTeam.map((m, idx) => (
            <MemberCard key={idx} ref={addToRefs} {...m} onSelect={() => setActiveModalMember(m)} />
          ))}
        </div>
      </section>

      {/* WEBSITE COMMAND */}
      <section className={`relative z-10 py-16 px-6 max-w-5xl mx-auto transition-all duration-1000 delay-700 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
        <SectionHeading title="Website Command" count={5} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {websiteTeam.map((m, idx) => (
            <MemberCard key={idx} ref={addToRefs} {...m} onSelect={() => setActiveModalMember(m)} />
          ))}
        </div>
      </section>

      {/* MANAGEMENT */}
      <section className={`relative z-10 py-16 px-6 max-w-7xl mx-auto transition-all duration-1000 delay-800 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
        <SectionHeading title="Management" count={6} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {managementTeam.map((m, idx) => (
            <MemberCard key={idx} ref={addToRefs} {...m} onSelect={() => setActiveModalMember(m)} />
          ))}
        </div>
      </section>

      {/* DISCIPLINE */}
      <section className={`relative z-10 py-16 px-6 max-w-7xl mx-auto transition-all duration-1000 delay-900 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
        <SectionHeading title="Discipline Team" count={7} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {disciplineTeam.map((m, idx) => (
            <MemberCard key={idx} ref={addToRefs} {...m} onSelect={() => setActiveModalMember(m)} />
          ))}
        </div>
      </section>

      {/* MEMBER DOSSIER MODAL */}
      <MemberModal member={activeModalMember} onClose={() => setActiveModalMember(null)} />
    </div>
  );
};

export default TeamsPage;