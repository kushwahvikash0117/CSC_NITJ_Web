/**
 * @file Events.jsx
 * @description Events component for viewing upcoming, live, and concluded events, handling participant registration, and viewing/downloading event brochures and timelines.
 */

import React, { useEffect, useState, useRef } from "react";

// --- 1. NEURAL NETWORK BACKGROUND ---
const NeuralNetwork = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;
    let mouse = { x: null, y: null, radius: 150 };

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
        this.vx = (Math.random() - 0.5) * 0.3; 
        this.vy = (Math.random() - 0.5) * 0.3;
        this.radius = Math.random() * 1.5 + 1;
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
      const count = Math.floor((canvas.width * canvas.height) / 16000);
      for (let i = 0; i < count; i++) {
        particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i]; p1.update();
        ctx.shadowBlur = 12; ctx.shadowColor = '#22d3ee';
        p1.draw();

        if (mouse.x !== null && mouse.y !== null) {
          const mdx = p1.x - mouse.x;
          const mdy = p1.y - mouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < mouse.radius) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(34, 211, 238, ${0.4 * (1 - mdist / mouse.radius)})`;
            ctx.lineWidth = 1;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x; const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            ctx.shadowBlur = 0; ctx.beginPath();
            ctx.strokeStyle = `rgba(34, 211, 238, ${0.6 * (1 - dist / 200)})`;
            ctx.lineWidth = 1; ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
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


const Events = () => {
  const [visible, setVisible] = useState(false);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");

  // Registration Modal State
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    salutation: "",
    name: "",
    category: "",
    typeOfParticipant: "",
    country: "India",
    designation: "",
    instituteName: "",
    mobile: "",
    email: localStorage.getItem("user_email") || ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // PDF Viewer Modal State
  const [pdfModalData, setPdfModalData] = useState({ isOpen: false, title: "", url: "" });
  const [downloading, setDownloading] = useState(false);

  // Base API URL helper
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  /**
   * Calls backend API to verify registration via User's registeredEvents array.
   */
  const checkEventRegistration = async (eventId) => {
    const email = localStorage.getItem("user_email");
    if (!eventId || !email) return false;

    try {
      const res = await fetch(
        `${apiBaseUrl}/api/events/${eventId}/check-registration?email=${encodeURIComponent(email)}`
      );
      if (!res.ok) return false;
      const data = await res.json();
      return Boolean(data.isRegistered);
    } catch (err) {
      console.error("Error checking registration for event:", eventId, err);
      return false;
    }
  };

  /**
   * Fetches all events from the backend and maps registration statuses.
   */
  const fetchEvents = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/events`);
      if (!res.ok) throw new Error("Failed to fetch events");

      const data = await res.json();
      const eventsArray = Array.isArray(data) ? data : data.events || [];

      // Map events and check registration individually for each event item
      const formatted = await Promise.all(
        eventsArray.map(async (e) => {
          const isRegistered = await checkEventRegistration(e._id);

          return {
            id: e._id,
            title: e.title,
            desc: e.description,
            rawDate: e.date,
            date: new Date(e.date).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
            mode: e.mode,
            tag: e.tag,
            brochure: e.brochure,
            timelinePdf: e.timelinePdf,
            galleryLink: e.galleryLink || "",
            hasFee: e.hasFee || false,
            registrationLink: e.registrationLink || "",
            isRegistered: isRegistered
          };
        })
      );

      setEvents(formatted);
      setTimeout(() => setVisible(true), 200);
    } catch (err) {
      console.error("Fetch Events Error:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((evt) => {
    if (!evt.rawDate) return false;

    const eventDate = new Date(evt.rawDate);
    eventDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (activeTab === "upcoming") {
      return eventDate > today;
    } else if (activeTab === "live") {
      return eventDate.getTime() === today.getTime();
    } else if (activeTab === "concluded") {
      return eventDate.getTime() < today.getTime();
    }
    return false;
  });

  /**
   * Handles downloading document files like PDFs.
   */
  const handleDownloadPdf = async (url, customFilename) => {
    if (!url) return;
    try {
      setDownloading(true);
      const res = await fetch(url);
      if (!res.ok) throw new Error("Network response was not ok");
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      const filename = customFilename || url.substring(url.lastIndexOf("/") + 1) || "document.pdf";
      link.download = filename.includes(".pdf") ? filename : `${filename}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download Error:", err);
      window.open(url, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  const handleRegisterClick = (evt) => {
    if (evt.hasFee || evt.registrationLink) {
      const targetLink = evt.registrationLink || "#";
      window.open(targetLink, "_blank", "noopener,noreferrer");
      return;
    }
    setSelectedEvent(evt);
  };

  /**
   * Handles submitting participant registration details.
   */
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`${apiBaseUrl}/api/events/${selectedEvent.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to register for event");

      if (formData.email) {
        localStorage.setItem("user_email", formData.email);
      }

      setSuccessMsg("Successfully registered for the event!");
      
      await fetchEvents();

      setTimeout(() => {
        setSelectedEvent(null);
        setSuccessMsg("");
      }, 2500);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#020617] text-white min-h-screen relative overflow-x-hidden selection:bg-cyan-500 selection:text-black">
      <NeuralNetwork />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-36 pb-24">
        <div
          className={`text-center mb-16 transition-all duration-1000 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="flex justify-center items-center gap-4 mb-3">
            <div className="inline-block px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono tracking-widest uppercase">
              // Secure Portal Access
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">Events</span>
          </h1>
          <p className="text-gray-400 mt-4 text-xs md:text-sm tracking-[0.2em] uppercase font-mono">
            Workshops &bull; CTFs &bull; Expert Sessions
          </p>
        </div>

        <div className="flex justify-center mb-16">
          <div className="inline-flex bg-[#0b132b]/85 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-2xl">
            {["upcoming", "live", "concluded"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-7 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-cyan-400 to-teal-400 text-black shadow-[0_0_25px_rgba(34,211,238,0.4)] scale-105"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-20 bg-[#0b132b]/40 backdrop-blur-md border border-white/5 rounded-3xl max-w-md mx-auto">
            <div className="text-cyan-400 text-2xl mb-2 font-mono">⚡</div>
            <p className="text-gray-400 font-mono text-xs tracking-widest uppercase">
              No {activeTab} events found
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredEvents.map((evt, i) => {
              const hasExternalLink = Boolean(evt.hasFee || evt.registrationLink);

              return (
                <div
                  key={evt.id}
                  className={`group relative transition-all duration-700 ${
                    visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                  }`}
                  style={{ transitionDelay: `${i * 120}ms` }}
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-teal-500/0 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />

                  <div className="relative bg-[#091122]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 hover:border-cyan-500/40 hover:-translate-y-1.5 transition-all duration-300 h-full flex flex-col justify-between shadow-xl">
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono tracking-[0.3em] text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
                            EVT_0{i + 1}
                          </span>
                          {evt.hasFee && (
                            <span className="text-[10px] font-mono tracking-wider text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                              PAID EVENT
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] px-3 py-1 rounded-full border border-teal-500/30 text-teal-300 bg-teal-500/10 font-mono">
                          {evt.mode}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold mb-3 group-hover:text-cyan-300 transition tracking-wide">
                        {evt.title}
                      </h3>

                      <p className="text-gray-400 text-sm leading-relaxed mb-6">
                        {evt.desc}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        {evt.brochure ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => setPdfModalData({ 
                                isOpen: true, 
                                title: `${evt.title} - Brochure`, 
                                url: `${apiBaseUrl}${evt.brochure}` 
                              })}
                              className="flex-1 py-2.5 px-2 bg-white/[0.03] border border-white/10 rounded-xl text-center text-[10px] font-mono uppercase tracking-wider text-cyan-400 hover:bg-cyan-400 hover:text-black hover:border-cyan-400 transition-all flex items-center justify-center cursor-pointer"
                              title="View Brochure"
                            >
                              <span>📄 Brochure</span>
                            </button>
                            <button
                              onClick={() => handleDownloadPdf(`${apiBaseUrl}${evt.brochure}`, `${evt.title}-Brochure.pdf`)}
                              className="py-2.5 px-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-center text-[10px] font-mono text-cyan-400 hover:bg-cyan-400 hover:text-black hover:border-cyan-400 transition-all flex items-center justify-center cursor-pointer"
                              title="Download Brochure PDF"
                            >
                              ⬇
                            </button>
                          </div>
                        ) : (
                          <div className="py-2.5 px-3 bg-white/[0.01] border border-white/5 rounded-xl text-center text-[10px] font-mono uppercase tracking-wider text-gray-600 cursor-not-allowed">
                            No Brochure
                          </div>
                        )}

                        {evt.timelinePdf ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => setPdfModalData({ 
                                isOpen: true, 
                                title: `${evt.title} - Timeline`, 
                                url: `${apiBaseUrl}${evt.timelinePdf}` 
                              })}
                              className="flex-1 py-2.5 px-2 bg-white/[0.03] border border-white/10 rounded-xl text-center text-[10px] font-mono uppercase tracking-wider text-cyan-400 hover:bg-cyan-400 hover:text-black hover:border-cyan-400 transition-all flex items-center justify-center cursor-pointer"
                              title="View Timeline"
                            >
                              <span>⏱ Timeline</span>
                            </button>
                            <button
                              onClick={() => handleDownloadPdf(`${apiBaseUrl}${evt.timelinePdf}`, `${evt.title}-Timeline.pdf`)}
                              className="py-2.5 px-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-center text-[10px] font-mono text-cyan-400 hover:bg-cyan-400 hover:text-black hover:border-cyan-400 transition-all flex items-center justify-center cursor-pointer"
                              title="Download Timeline PDF"
                            >
                              ⬇
                            </button>
                          </div>
                        ) : (
                          <div className="py-2.5 px-3 bg-white/[0.01] border border-white/5 rounded-xl text-center text-[10px] font-mono uppercase tracking-wider text-gray-600 cursor-not-allowed">
                            No Timeline
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-white/5 mb-2 font-mono text-xs">
                        <span className="text-gray-500">
                          {evt.date}
                        </span>
                        <span className="font-bold uppercase tracking-widest text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded">
                          {evt.tag}
                        </span>
                      </div>

                      <>
                        {activeTab === "upcoming" && (
                          evt.isRegistered ? (
                            <div className="w-full py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center text-xs font-bold tracking-widest uppercase text-emerald-400 flex items-center justify-center gap-2 cursor-default">
                              <span>✓ Registered</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleRegisterClick(evt)}
                              className="w-full py-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-center text-xs font-bold tracking-widest uppercase text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all shadow-[0_0_15px_rgba(34,211,238,0.15)] cursor-pointer"
                            >
                              {hasExternalLink ? "Register Now ↗" : "Register Now \u2192"}
                            </button>
                          )
                        )}
                        {activeTab === "live" && (
                          evt.isRegistered ? (
                            <div className="w-full py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center text-xs font-bold tracking-widest uppercase text-emerald-400 flex items-center justify-center gap-2 cursor-default">
                              <span>✓ Registered &bull; Live Now</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleRegisterClick(evt)}
                              className="w-full py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-center text-xs font-bold tracking-widest uppercase text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.15)] cursor-pointer animate-pulse"
                            >
                              &bull; {hasExternalLink ? "Register Now ↗" : "Live Now - Register Now \u2192"}
                            </button>
                          )
                        )}
                        {activeTab === "concluded" && (
                          evt.galleryLink ? (
                            <a
                              href={evt.galleryLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-3 bg-teal-500/10 border border-teal-500/30 rounded-xl text-center text-xs font-bold tracking-widest uppercase text-teal-300 hover:bg-teal-400 hover:text-black transition-all shadow-[0_0_15px_rgba(45,212,191,0.15)] flex items-center justify-center cursor-pointer"
                            >
                              Event Gallery &rarr;
                            </a>
                          ) : (
                            <div className="w-full py-3 bg-white/[0.02] border border-white/5 rounded-xl text-center text-xs font-mono tracking-widest uppercase text-gray-500">
                              Event Concluded
                            </div>
                          )
                        )}
                      </>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PDF PREVIEW MODAL */}
      {pdfModalData.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
          <div className="relative w-full max-w-5xl h-[85vh] bg-[#091122] border border-cyan-500/40 rounded-3xl shadow-[0_0_60px_rgba(34,211,238,0.2)] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#020617]">
              <div>
                <span className="text-[10px] font-mono tracking-[0.3em] text-cyan-400 uppercase bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
                  Document Viewer // PDF
                </span>
                <h3 className="text-lg font-bold mt-1 text-white truncate max-w-lg">
                  {pdfModalData.title}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDownloadPdf(pdfModalData.url, `${pdfModalData.title}.pdf`)}
                  disabled={downloading}
                  className="px-3.5 py-2 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-300 hover:bg-teal-400 hover:text-black text-xs font-mono uppercase tracking-wider transition cursor-pointer disabled:opacity-50"
                >
                  {downloading ? "Downloading..." : "⬇ Download PDF"}
                </button>
                <a
                  href={pdfModalData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400 hover:bg-cyan-400 hover:text-black text-xs font-mono uppercase tracking-wider transition"
                >
                  Open in New Tab ↗
                </a>
                <button
                  onClick={() => setPdfModalData({ isOpen: false, title: "", url: "" })}
                  className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 w-9 h-9 rounded-full flex items-center justify-center transition-colors font-bold cursor-pointer"
                >
                  &times;
                </button>
              </div>
            </div>

            <div className="relative flex-1 bg-[#020617] p-2">
              <iframe
                src={`${pdfModalData.url}#view=FitH`}
                title={pdfModalData.title}
                className="w-full h-full rounded-2xl border border-white/10 bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* REGISTRATION MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#091122] border border-cyan-500/40 rounded-3xl p-8 shadow-[0_0_60px_rgba(34,211,238,0.15)] text-left my-8">
            <button 
              onClick={() => { setSelectedEvent(null); setSuccessMsg(""); setErrorMsg(""); }}
              className="absolute top-6 right-6 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 w-9 h-9 rounded-full flex items-center justify-center transition-colors z-10 font-bold"
            >
              &times;
            </button>

            <span className="text-[10px] font-mono tracking-[0.3em] text-cyan-400 uppercase bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
              Participant Verification Form
            </span>
            <h3 className="text-2xl font-bold mt-3 mb-1 text-white">
              {selectedEvent.title}
            </h3>
            <p className="text-gray-400 text-xs mb-6 font-mono">
              Complete the required fields below to secure your placement.
            </p>

            {successMsg && (
              <div className="mb-6 p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs text-center font-mono tracking-wider">
                {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs text-center font-mono tracking-wider">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-1.5">Salutation</label>
                  <select 
                    required
                    value={formData.salutation}
                    onChange={(e) => setFormData({ ...formData, salutation: e.target.value })}
                    className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                  >
                    <option value="" disabled className="bg-[#091122]">Select</option>
                    <option value="Mr." className="bg-[#091122]">Mr.</option>
                    <option value="Ms." className="bg-[#091122]">Ms.</option>
                    <option value="Mrs." className="bg-[#091122]">Mrs.</option>
                    <option value="Er." className="bg-[#091122]">Er.</option>
                    <option value="Dr." className="bg-[#091122]">Dr.</option>
                    <option value="Prof." className="bg-[#091122]">Prof.</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-1.5">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 transition placeholder:text-gray-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-1.5">Category</label>
                  <select 
                    required
                    value={formData.category}
                    onChange={(e) => {
                      const categoryVal = e.target.value;
                      setFormData({ 
                        ...formData, 
                        category: categoryVal, 
                        typeOfParticipant: "",
                        instituteName: categoryVal === "Internal" ? "NIT Jalandhar" : (formData.instituteName === "NIT Jalandhar" ? "" : formData.instituteName)
                      });
                    }}
                    className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                  >
                    <option value="" disabled className="bg-[#091122]">Select</option>
                    <option value="Internal" className="bg-[#091122]">Internal</option>
                    <option value="External" className="bg-[#091122]">External</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-1.5">Type of Participant</label>
                  <select 
                    required
                    value={formData.typeOfParticipant}
                    onChange={(e) => setFormData({ ...formData, typeOfParticipant: e.target.value })}
                    className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                  >
                    <option value="" disabled className="bg-[#091122]">Select</option>
                    <option value="Student" className="bg-[#091122]">Student</option>
                    <option value="Faculty" className="bg-[#091122]">Faculty</option>
                    <option value="Research Scholar" className="bg-[#091122]">Research Scholar</option>
                    {formData.category === "External" && (
                      <option value="Industrialist" className="bg-[#091122]">Industrialist</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-1.5">Country</label>
                  <select 
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                  >
                    <option value="" disabled className="bg-[#091122]">Select</option>
                    <option value="India" className="bg-[#091122]">India</option>
                    <option value="Other" className="bg-[#091122]">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-1.5">Designation</label>
                  <input 
                    type="text" 
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. Undergrad / Security Analyst"
                    className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 transition placeholder:text-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-1.5">Institute / Organization Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.instituteName}
                  onChange={(e) => setFormData({ ...formData, instituteName: e.target.value })}
                  placeholder="e.g. NIT Jalandhar"
                  className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 transition placeholder:text-gray-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-1.5">Mobile No.</label>
                  <input 
                    type="text" 
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 transition placeholder:text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-1.5">Email ID</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 transition placeholder:text-gray-600"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={submitting}
                className="w-full mt-6 py-4 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-black font-bold uppercase tracking-widest text-xs rounded-xl transition-all shadow-[0_0_25px_rgba(34,211,238,0.3)] disabled:opacity-50 cursor-pointer"
              >
                {submitting ? "Encrypting & Submitting..." : "Submit Registration"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;