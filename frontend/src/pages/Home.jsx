/**
 * @file Home.jsx
 * @description Landing page component featuring an interactive canvas background, mouse parallax, faculty messages, and founder profiles.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import backgroundImage from '../assets/clublogo.png';
import VikashImg from '../assets/vikash.png'; 
import KritikaImg from '../assets/kritika.png';

// Faculty Imports
import HarshImg from '../assets/harsh_sir.png';
import SamayImg from '../assets/samayveer_sir.png';
import KPImg from '../assets/kp_sir.png';
import UrvashiImg from '../assets/urvashi_mam.png';

const MagneticButton = ({ children, className, onClick }) => {
  const buttonRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = buttonRef.current.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    setPosition({ x: x * 0.3, y: y * 0.3 });
  };

  const handleMouseLeave = () => setPosition({ x: 0, y: 0 });

  return (
    <button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`${className} transition-transform duration-200 ease-out`}
      style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
    >
      {children}
    </button>
  );
};

const Home = () => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  
  // --- FACULTY MODAL & CAROUSEL STATE ---
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const canvasRef = useRef(null);

  // --- MOUSE PARALLAX ---
  const handleMouseMove = (e) => {
    const x = (window.innerWidth / 2 - e.pageX) / 45;
    const y = (window.innerHeight / 2 - e.pageY) / 45;
    setOffset({ x, y });
  };

  const facultyCoordinators = [
    {
      name: "Prof Harsh K Verma",
      role: "Faculty Coordinator, Cyber Security Club",
      img: HarshImg,
      msg: `Cybersecurity has become an indispensable pillar of the modern digital world. As technology continues to evolve, it is essential for students to develop not only technical expertise but also integrity, critical thinking, and a strong sense of professional responsibility. These qualities will enable them to address future challenges with confidence and contribute meaningfully to society.

The Cyber Security Club (CSC), Department of Computer Science and Engineering, provides a valuable platform for students to learn beyond the classroom, exchange ideas, and grow through collaboration and innovation. I encourage every student to make the most of this opportunity, remain committed to continuous learning, and uphold the highest ethical standards in all their endeavors.

I appreciate the sincere efforts of the student coordinators, executive team, and members in building this vibrant community. I am confident that the Cyber Security Club will continue to foster excellence, inspire future leaders, and bring pride to the department and the institute.

I extend my best wishes to the Cyber Security Club for its continued growth and success.

Prof Harsh K Verma
Faculty Coordinator, Cyber Security Club
Professor
Department of Computer Science & Engineering
Dr B R Ambedkar National Institute of Technology Jalandhar`
    },
    
    {
      name: "Dr K P Sharma",
      role: "Faculty Coordinator, Cyber Security Club",
      img: KPImg,
      msg: `Cybersecurity has become one of the most important and rapidly evolving fields in today's digital world. As technology advances, the need for skilled professionals who can protect digital systems and information continues to grow. Along with technical knowledge, it is equally important to develop ethical values, critical thinking, and a spirit of continuous learning.

The Cyber Security Club (CSC), Department of Computer Science and Engineering, provides students with an excellent platform to enhance their knowledge through workshops, hands-on training, Capture The Flag (CTF) competitions, hackathons, expert lectures, and collaborative projects. These activities help bridge the gap between classroom learning and real-world cybersecurity challenges.

I encourage every student to actively participate in the club's initiatives and make the most of the opportunities it offers. I also appreciate the dedication of the student coordinators, executive team, and members in taking this initiative forward. I am confident that the Cyber Security Club will continue to foster innovation, technical excellence, and a culture of responsible cybersecurity.

My best wishes to the Cyber Security Club for its continued growth and success.

Dr K P Sharma
Faculty Coordinator, Cyber Security Club
Assistant Professor
Department of Computer Science & Engineering
Dr B R Ambedkar National Institute of Technology Jalandhar`
    },

    {
      name: "Dr Samayveer Singh",
      role: "Faculty Coordinator, Cyber Security Club",
      img: SamayImg,
      msg: `Cybersecurity is one of the most dynamic and influential domains of modern technology. As digital systems become increasingly interconnected, the need for innovative thinking, continuous learning, ethical awareness, and the responsible use of technology has never been greater. Along with technical competence, curiosity, collaboration, and a research-oriented mindset are essential for addressing emerging cybersecurity challenges. 

The Cyber Security Club of the Department of Computer Science and Engineering provides a vibrant platform for students to exchange ideas, explore emerging technologies, participate in technical discussions, and undertake meaningful projects beyond the classroom. These activities promote independent thinking, strengthen problem-solving skills, and prepare students for advanced research, innovation, and professional careers in cybersecurity.

I encourage all students to actively participate in the club and make the most of the opportunities it provides. I sincerely appreciate the dedication of the student coordinators and executive team in building an engaging and collaborative learning community. I am confident that the Cyber Security Club will continue to promote ethical practices, technical excellence, teamwork, and innovation among students.

My best wishes to the Cyber Security Club for its continued growth and success.
Dr Samayveer Singh
Faculty Coordinator, Cyber Security Club
Assistant Professor
Department of Computer Science and Engineering
Dr B R Ambedkar National Institute of Technology Jalandhar`
    },

    {
      name: "Dr Urvashi Bansal",
      role: "Faculty Coordinator, Cyber Security Club",
      img: UrvashiImg,
      msg: `Welcome to the Cyber Security Club (CSC), Department of Computer Science and Engineering, Dr B R Ambedkar National Institute of Technology Jalandhar.

The digital world offers limitless opportunities, but it also brings evolving cybersecurity challenges that demand skilled, ethical, and innovative professionals. The Cyber Security Club serves as a platform where students can strengthen their technical expertise, explore emerging security technologies, and develop practical problem-solving skills beyond the classroom.

Our vision is to create an engaging learning environment through workshops, hands-on training sessions, Capture The Flag (CTF) competitions, hackathons, expert lectures, research discussions, and industry interactions. These activities are designed to encourage curiosity, teamwork, innovation, and responsible cybersecurity practices while preparing students for academic research, competitive examinations, and professional careers.

I encourage every student to actively participate, collaborate with fellow enthusiasts, and make the most of the opportunities offered by the club. Together, we can build a vibrant cybersecurity community that contributes to a safer and more secure digital ecosystem.

I appreciate the dedication and enthusiasm of our student members and executive team in making this initiative successful. I look forward to witnessing the club grow into a center of excellence for cybersecurity learning, innovation, and leadership.

Wishing the Cyber Security Club continued success in all its endeavors.

Dr Urvashi Bansal
Faculty Coordinator, Cyber Security Club
Assistant Professor
Department of Computer Science & Engineering
Dr B R Ambedkar National Institute of Technology Jalandhar`
    }
  ];

  // --- CAROUSEL NAVIGATION HANDLERS ---
  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % facultyCoordinators.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + facultyCoordinators.length) % facultyCoordinators.length);
  };

  // Auto-slide effect when not hovered
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, currentIndex]);

  // --- BACKGROUND CANVAS ANIMATION ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = document.documentElement.scrollHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', resize);

    const particles = [];
    const charSet = ['0', '1', 'λ', 'Ψ', 'Δ', 'Ω', '#', '$'];

    class DataBit {
      constructor() { this.reset(); }
      reset() {
        this.centerX = window.innerWidth / 2;
        this.centerY = window.innerHeight / 2;
        this.angle = Math.random() * Math.PI * 2;
        this.velocity = Math.random() * 1.0 + 0.8; 
        this.value = charSet[Math.floor(Math.random() * charSet.length)];
        this.fontSize = Math.random() * 5 + 11;
        this.opacity = 0; 
        this.maxOpacity = Math.random() * 0.6 + 0.2;
        this.distance = Math.random() * 50; 
        this.spawnRadius = 160; 
      }
      update(mouseOffset) {
        this.distance += this.velocity;
        const baseX = this.centerX + Math.cos(this.angle) * this.distance;
        const baseY = this.centerY + Math.sin(this.angle) * this.distance;
        this.x = baseX + (mouseOffset.x * 0.8);
        this.y = baseY + (mouseOffset.y * 0.8);
        if (this.distance > this.spawnRadius) {
          this.opacity = Math.min(this.maxOpacity, this.opacity + 0.02);
        }
        if (this.x < -100 || this.x > canvas.width + 100 || this.y < -100 || this.y > canvas.height + 100) {
          this.reset();
        }
      }
      draw() {
        if (this.distance > this.spawnRadius) {
          ctx.font = `bold ${this.fontSize}px monospace`;
          ctx.fillStyle = `rgba(0, 209, 255, ${this.opacity})`;
          ctx.fillText(this.value, this.x, this.y);
        }
      }
    }

    for (let i = 0; i < 160; i++) {
      const p = new DataBit();
      p.distance = Math.random() * Math.max(window.innerWidth, window.innerHeight);
      particles.push(p);
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(offset); p.draw(); });
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', resize);
    };
  }, [offset]);

  return (
    <div className="bg-[#020617] text-white min-h-screen font-sans relative overflow-x-hidden selection:bg-[#00D1FF] selection:text-black" onMouseMove={handleMouseMove}>      
      
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;500;700&display=swap');
          
          @keyframes energeticGlitch {
            0% { text-shadow: 3px 0 #ff00c1, -3px 0 #00fff9; transform: translate(0); }
            20% { text-shadow: -3px 0 #ff00c1, 3px 0 #00fff9; transform: translate(-2px, 1px); }
            40% { text-shadow: 3px 0 #00fff9, -3px 0 #ff00c1; transform: translate(2px, -1px); }
            60% { text-shadow: -3px 0 #ff00c1, 3px 0 #00fff9; transform: translate(-2px, -1px); }
            80% { text-shadow: 3px 0 #ff00c1, -3px 0 #ff00c1; transform: translate(2px, 1px); }
            100% { text-shadow: 3px 0 #ff00c1, -3px 0 #00fff9; transform: translate(0); }
          }
          .glitch-hover:hover { animation: energeticGlitch 0.4s steps(2) infinite; }
          .cyber-line-container { width: 100%; height: 2px; background: rgba(0, 209, 255, 0.1); position: relative; overflow: hidden; z-index: 20; }
          .cyber-line-pulse { position: absolute; top: 0; height: 100%; width: 30%; background: linear-gradient(90deg, transparent, rgba(0, 209, 255, 0.8), transparent); filter: drop-shadow(0 0 8px rgba(0, 209, 255, 0.8)); animation: cyberPulse 3s infinite linear; }
          @keyframes cyberPulse { 0% { left: -30%; } 100% { left: 100%; } }
          .cyber-grid { position: absolute; width: 200%; height: 200%; top: -50%; left: -50%; background-image: linear-gradient(to right, rgba(0, 209, 255, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 209, 255, 0.04) 1px, transparent 1px); background-size: 50px 50px; transform: perspective(1000px) rotateX(60deg); z-index: 0; pointer-events: none; }
          @keyframes revolve { from { stroke-dashoffset: 1200; } to { stroke-dashoffset: 0; } }
          @keyframes scan { 0% { top: 0%; opacity: 0; } 50% { opacity: 0.8; } 100% { top: 100%; opacity: 0; } }
          .hexagon-path { fill: none; stroke: #00ffff; stroke-width: 3; stroke-linecap: round; stroke-dasharray: 200 1000; animation: revolve 9s linear infinite; filter: drop-shadow(0 0 12px #00ffff); }
          .radar-scan { position: absolute; width: 100%; height: 1px; background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.6), transparent); box-shadow: 0 0 15px #00ffff; animation: scan 6s linear infinite; z-index: 25; pointer-events: none; }
          .cyber-button-tech { position: relative; overflow: hidden; border-radius: 6px; border: 2px solid #ffffff; background-color: #00D1FF; color: #000000; font-family: 'Space Grotesk', sans-serif; font-weight: 700; transition: 0.3s; z-index: 50; cursor: pointer; }
          .cyber-button-tech:hover { background-color: #000000 !important; color: #ffffff !important; box-shadow: 0 0 25px rgba(255, 255, 255, 0.3); }
          @keyframes dataPulse { 0% { left: -100%; opacity: 0; } 50% { opacity: 1; } 100% { left: 100%; opacity: 0; } }
          .neon-path-container { position: relative; width: 100%; height: 2px; background: rgba(0, 209, 255, 0.1); overflow: hidden; }
          .neon-pulse { position: absolute; top: 0; height: 100%; width: 20%; background: linear-gradient(90deg, transparent, #00D1FF, transparent); filter: drop-shadow(0 0 8px #00D1FF); animation: dataPulse 3s linear infinite; }
          
          .leader-img-container { 
            position: relative; 
            width: 125px; 
            height: 125px; 
            padding: 3px; 
            border-radius: 50%; 
            border: 2px solid rgba(0, 209, 255, 0.5); 
            background: #020617;
            box-shadow: 0 0 15px rgba(0, 209, 255, 0.2);
            transition: all 0.3s ease;
            flex-shrink: 0;
          }
          .leader-img-container:hover {
            border-color: #00D1FF;
            box-shadow: 0 0 25px rgba(0, 209, 255, 0.4);
          }

          .enhanced-faculty-font {
            font-family: 'Plus Jakarta Sans', sans-serif;
            letter-spacing: 0.015em;
            line-height: 1.8;
          }

          /* Hide scrollbar for Webkit browsers (Chrome, Safari, Edge) */
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          /* Hide scrollbar for IE, Edge and Firefox */
          .no-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
        `}
      </style>

      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />

      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center px-4 z-10 overflow-hidden">
        <div className="cyber-grid" style={{ transform: `perspective(1000px) rotateX(60deg) translateY(${offset.y * 5}px)` }} />
        <div className="relative w-full max-w-[85vh] aspect-square flex items-center justify-center" style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }}>
          <div className="radar-scan" />
          <img src={backgroundImage} className="absolute inset-0 w-full h-full object-contain opacity-60 z-10 select-none pointer-events-none" style={{ filter: 'brightness(0.7) contrast(1.1)', transform: `scale(1.05) translate(${offset.x * 0.4}px, ${offset.y * 0.4}px)` }} alt="Logo" />
          <svg viewBox="0 0 500 500" className="absolute inset-0 w-full h-full z-20 pointer-events-none scale-[0.88]">
            <path className="hexagon-path" d="M250,50 L423,150 L423,350 L250,450 L77,350 L77,150 Z" />
          </svg>
          <div className="relative z-30 flex flex-col items-center justify-center text-center">
            <div className="inline-block px-4 py-1 mb-3 rounded-full bg-[#00D1FF]/10 border border-[#00D1FF]/30 text-[#00D1FF] text-[10px] md:text-xs font-mono uppercase tracking-widest backdrop-blur-md">
              // NIT Jalandhar Security Cell
            </div>
            <h1 className="glitch-hover cursor-default text-5xl md:text-7xl font-black italic uppercase leading-none tracking-tighter">
              <span className="text-white">CSC</span> <span className="text-[#00D1FF]">NITJ</span>
            </h1>
            <p className="text-[10px] md:text-sm text-cyan-100 font-bold uppercase tracking-[0.2em] mt-4 opacity-85">Building Cyber Awareness & Ethical Hacking Skills</p>
            <div className="h-28"></div>
            <Link to='/about'>
              <MagneticButton 
                className="cyber-button-tech px-8 py-3 uppercase text-[11px] tracking-[0.3em]"
              >
                Explore Protocol
              </MagneticButton>
            </Link>
          </div>
        </div>
      </section>

      <div className="neon-path-container">
        <div className="neon-pulse" />
      </div>

      <div className="cyber-line-container">
        <div className="cyber-line-pulse"></div>
      </div>

      {/* Our Founders Section */}
      <section id="team" className="relative z-10 py-24 px-6 bg-black/40">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-block px-3 py-1 rounded-full bg-[#00D1FF]/10 border border-[#00D1FF]/30 text-[#00D1FF] text-[10px] font-mono uppercase tracking-widest mb-3">
            [ARCHITECTS OF EXCELLENCE]
          </div>
          <h2 className="glitch-hover text-[#00D1FF] text-5xl md:text-7xl font-black italic uppercase mb-20 tracking-tighter">
            Our Founders
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">

            {/* Vikash Kushwah (Founder) */}
            <div className="flex flex-col items-center bg-gradient-to-b from-white/[0.03] to-transparent p-8 rounded-3xl border border-cyan-500/20 hover:border-cyan-500/50 transition duration-300">
              <div className="leader-img-container mb-6 !w-40 !h-40">
                <img
                  src={VikashImg}
                  className="w-full h-full object-cover rounded-full"
                  style={{ objectPosition: '50% 20%' }}
                  alt="Vikash"
                />                    
              </div>

              <h3 className="text-[#00D1FF] text-2xl font-bold tracking-wider">
                Vikash Kushwah
              </h3>
              <p className="text-xs text-cyan-200/60 font-mono tracking-widest uppercase mt-1">Founder & Head</p>

              {/* Founder Message box */}
              <div className="mt-6 w-full bg-black/60 p-6 rounded-2xl border border-cyan-500/20 font-mono text-left relative overflow-hidden shadow-inner">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-transparent"></div>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed text-justify mb-4">
                  Cybersecurity is more than securing systems - it is about staying curious, thinking ahead, and taking responsibility.
                </p>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed text-justify mb-4">
                  The Cyber Security Club, NIT Jalandhar, was founded to create a space where students can explore, experiment, and grow together. I hope this community inspires every member to learn beyond the classroom and contribute meaningfully to the world of cybersecurity.
                </p>
                <p className="text-[#00D1FF] text-xs font-bold tracking-widest uppercase">
                  Stay curious. Think critically. Build responsibly.
                </p>
              </div>
            </div>

            {/* Co-Founder */}
            <div className="flex flex-col items-center bg-gradient-to-b from-white/[0.03] to-transparent p-8 rounded-3xl border border-cyan-500/20 hover:border-cyan-500/50 transition duration-300">
              <div className="leader-img-container mb-6 !w-40 !h-40">
                <img
                  src={KritikaImg}
                  className="w-full h-full object-cover rounded-full"
                  style={{ objectPosition: '50% 15%' }}
                  alt="Kritika"
                />
              </div>

              <h3 className="text-[#00D1FF] text-2xl font-bold tracking-wider">
                Kritika Joshi
              </h3>
              <p className="text-xs text-cyan-200/60 font-mono tracking-widest uppercase mt-1">Founder & Head</p>

              {/* Co-Founder Message box */}
              <div className="mt-6 w-full bg-black/60 p-6 rounded-2xl border border-cyan-500/20 font-mono text-left relative overflow-hidden shadow-inner">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-transparent"></div>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed text-justify mb-4">
                  Great ideas grow stronger when people come together to learn, question, and create.
                </p>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed text-justify mb-4">
                  The Cyber Security Club, NIT Jalandhar, is built around this belief - a community where curiosity is encouraged, knowledge is shared, and every student gets the opportunity to explore cybersecurity in their own way.
                </p>
                <p className="text-[#00D1FF] text-xs font-bold tracking-widest uppercase">
                  Learn together. Challenge yourself. Make an impact.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <div className="neon-path-container">
        <div className="neon-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Faculty Coordinators Section with Interactive Carousel Controls */}
      <section 
        className="relative z-10 py-32 bg-black/30 overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="max-w-6xl mx-auto text-center mb-16 px-6">
          <div className="inline-block px-3 py-1 rounded-full bg-[#00D1FF]/10 border border-[#00D1FF]/30 text-[#00D1FF] text-[10px] font-mono uppercase tracking-widest mb-3">
            [ACADEMIC MENTORSHIP]
          </div>
          <h2 className="glitch-hover text-[#00D1FF] text-5xl md:text-7xl font-black italic uppercase tracking-tighter">
            Faculty Coordinators
          </h2>
        </div>

        <div className="relative w-full max-w-5xl mx-auto px-6 flex items-center justify-center">
          {/* Left Arrow Button */}
          <button 
            onClick={handlePrev}
            className="absolute left-0 md:-left-6 z-30 bg-[#020617]/80 hover:bg-[#00D1FF] text-[#00D1FF] hover:text-black border border-cyan-500/40 hover:border-[#00D1FF] w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-300 shadow-[0_0_15px_rgba(0,209,255,0.2)] backdrop-blur-md cursor-pointer"
            aria-label="Previous Faculty"
          >
            &#8592;
          </button>

          {/* Active Card Viewer */}
          <div className="w-full px-2 md:px-12">
            {facultyCoordinators.map((faculty, idx) => {
              if (idx !== currentIndex) return null;
              return (
                <div 
                  key={idx}
                  onClick={() => setSelectedFaculty(faculty)}
                  className="w-full flex flex-col md:flex-row items-center gap-8 cursor-pointer group bg-black/60 p-8 md:p-10 rounded-3xl border border-cyan-500/30 hover:border-cyan-400/85 transition-all duration-500 shadow-[0_0_30px_rgba(0,209,255,0.15)] hover:shadow-[0_0_45px_rgba(0,209,255,0.35)] backdrop-blur-md"
                >
                  <div className="flex flex-col items-center shrink-0 w-[160px]">
                    <div className="leader-img-container mb-4 !w-32 !h-32 md:!w-40 md:!h-40">
                      <img
                        src={faculty.img}
                        className="w-full h-full object-cover rounded-full"
                        alt={faculty.name}
                      />
                    </div>
                    <h3 className="text-[#00D1FF] text-lg md:text-xl font-bold tracking-wider group-hover:underline text-center leading-tight">
                      {faculty.name}
                    </h3>
                    <p className="text-[11px] text-cyan-200/75 uppercase tracking-widest mt-1 text-center font-mono">Coordinator</p>
                  </div>

                  <div className="flex-1 bg-black/70 p-6 md:p-8 rounded-2xl text-left border border-cyan-400/20 flex flex-col justify-between h-full min-h-[190px]">
                    <p className="text-gray-200 text-sm md:text-base leading-relaxed text-justify enhanced-faculty-font line-clamp-4">
                      {faculty.msg}
                    </p>
                    <span className="text-xs text-[#00D1FF] mt-4 inline-block font-mono tracking-wide group-hover:translate-x-1 transition-transform">
                      Click for full message &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Arrow Button */}
          <button 
            onClick={handleNext}
            className="absolute right-0 md:-right-6 z-30 bg-[#020617]/80 hover:bg-[#00D1FF] text-[#00D1FF] hover:text-black border border-cyan-500/40 hover:border-[#00D1FF] w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-300 shadow-[0_0_15px_rgba(0,209,255,0.2)] backdrop-blur-md cursor-pointer"
            aria-label="Next Faculty"
          >
            &#8594;
          </button>
        </div>

        {/* Carousel Indicators */}
        <div className="flex justify-center items-center gap-2 mt-8">
          {facultyCoordinators.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${currentIndex === idx ? 'w-8 bg-[#00D1FF]' : 'w-2 bg-white/20'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Faculty Popup Modal */}
      {selectedFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar bg-[#020617] border border-cyan-500 rounded-3xl p-6 md:p-8 shadow-[0_0_60px_rgba(0,209,255,0.4)] text-left">
            <button 
              onClick={() => setSelectedFaculty(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 w-9 h-9 rounded-full flex items-center justify-center transition-colors z-10 font-bold"
            >
              ✕
            </button>
            <div className="flex items-center space-x-5 mb-6 pr-10">
              <div className="leader-img-container !w-20 !h-20 shrink-0">
                <img src={selectedFaculty.img} className="w-full h-full object-cover rounded-full" alt={selectedFaculty.name} />
              </div>
              <div>
                <h3 className="text-[#00D1FF] text-xl md:text-2xl font-bold">{selectedFaculty.name}</h3>
                <p className="text-xs md:text-sm text-cyan-200/80 uppercase tracking-widest mt-1 font-mono">{selectedFaculty.role}</p>
              </div>
            </div>
            <div className="border-t border-cyan-500/20 pt-6">
              <p className="text-gray-200 text-sm md:text-base leading-relaxed text-justify enhanced-faculty-font whitespace-pre-line">
                {selectedFaculty.msg}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;
