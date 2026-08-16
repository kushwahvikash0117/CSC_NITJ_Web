/**
 * @file EventManager.jsx
 * @description Admin panel component for creating, editing, monitoring events, and managing attendee registrations.
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

export default function EventManager() {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming"); // "upcoming" | "live" | "concluded"
  const [visible, setVisible] = useState(false);

  // Registrations Modal State
  const [selectedEventForRegs, setSelectedEventForRegs] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState("Offline");
  const [tag, setTag] = useState("Workshop");
  const [hasFee, setHasFee] = useState(false);
  const [registrationLink, setRegistrationLink] = useState("");
  const [brochure, setBrochure] = useState(null);
  const [timelinePdf, setTimelinePdf] = useState(null);
  const [galleryLink, setGalleryLink] = useState("");
  
  // Existing PDF File Paths returned from Backend
  const [existingBrochure, setExistingBrochure] = useState("");
  const [existingTimelinePdf, setExistingTimelinePdf] = useState("");
  
  const [submitting, setSubmitting] = useState(false);

  // Input refs for manual reset of file inputs
  const brochureInputRef = useRef(null);
  const timelineInputRef = useRef(null);

  const token = localStorage.getItem("token");

  // Helper function to resolve backend relative static file paths
  const getFileUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    return `${baseUrl.replace(/\/$/, "")}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  const getEventStatus = (rawDate) => {
    if (!rawDate) return "upcoming";
    const eventDate = new Date(rawDate);
    eventDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (eventDate.getTime() === today.getTime()) {
      return "live";
    } else if (eventDate > today) {
      return "upcoming";
    } else {
      return "concluded";
    }
  };

  // Check if currently editing a concluded event
  const isEditingConcludedEvent = () => {
    if (!editingEventId) return false;
    const currentEvent = events.find((e) => (e._id || e.id) === editingEventId);
    if (!currentEvent) return false;
    return getEventStatus(currentEvent.date) === "concluded";
  };

  // Fetch all events
  useEffect(() => {
    const fetchAdminEvents = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/events`);
        if (!res.ok) throw new Error("Fetch failed");

        const data = await res.json();
        const eventsArray = Array.isArray(data) ? data : data.events || [];
        setEvents(eventsArray);
        setTimeout(() => setVisible(true), 200);
      } catch (err) {
        console.error("Failed to fetch events", err);
      }
    };

    fetchAdminEvents();
  }, []);

  // Fetch registrations for a specific event
  const handleOpenRegistrations = async (eventObj) => {
    setSelectedEventForRegs(eventObj);
    setLoadingRegs(true);
    setRegistrations([]);
    try {
      const eventId = eventObj._id || eventObj.id;
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/events/${eventId}/registrations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch registrations");
      const data = await res.json();
      
      // Fixed: Properly handle whether response is an array or an object containing registrations/data
      const regArray = Array.isArray(data) 
        ? data 
        : (data.registrations || data.data || []);
        
      setRegistrations(regArray);
    } catch (err) {
      console.error("Error fetching registrations:", err);
      alert("Failed to load registrations for this event.");
    } finally {
      setLoadingRegs(false);
    }
  };

  const handleCloseRegistrations = () => {
    setSelectedEventForRegs(null);
    setRegistrations([]);
  };

  const getAllRegistrationKeys = () => {
    const allKeysSet = new Set();
    registrations.forEach((reg) => {
      Object.keys(reg).forEach((key) => {
        if (key === "user" && typeof reg.user === "object" && reg.user !== null) {
          Object.keys(reg.user).forEach((userKey) => {
            if (!["createdAt", "updatedAt"].includes(userKey)) {
              allKeysSet.add(`user_${userKey}`);
            }
          });
        } else {
          allKeysSet.add(key);
        }
      });
    });

    const hiddenKeys = ["__v", "_id", "createdAt", "updatedAt"];
    let keys = Array.from(allKeysSet).filter((k) => !hiddenKeys.includes(k));

    if (!keys.includes("registeredAt") && registrations.some(r => r.createdAt || r.registeredAt)) {
      keys.push("registeredAt");
    }

    return keys.length > 0 ? keys : ["salutation", "name", "email", "mobile", "instituteName", "designation", "category", "typeOfParticipant", "country"];
  };

  const formatCellVal = (reg, header) => {
    let val = "";
    if (header === "registeredAt") {
      val = reg.createdAt || reg.registeredAt || reg.date || "";
    } else if (header.startsWith("user_")) {
      const userKey = header.replace("user_", "");
      val = reg.user ? reg.user[userKey] : "";
    } else {
      val = reg[header];
    }

    if (val === null || val === undefined || val === "") return "—";

    if (typeof val === "string" && !isNaN(Date.parse(val)) && (val.includes("T") || val.includes("-"))) {
      const parsedDate = new Date(val);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
      }
    }

    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
  };

  const handleDownloadExcel = async () => {
    if (!selectedEventForRegs) return;
    setDownloadingExcel(true);
    try {
      const eventId = selectedEventForRegs._id || selectedEventForRegs.id;
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/events/${eventId}/registrations/export`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${selectedEventForRegs.title.replace(/[^a-zA-Z0-9]/g, "_")}_Registrations.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        if (registrations.length === 0) {
          alert("No registration data available to export.");
          return;
        }

        const headers = getAllRegistrationKeys();
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += headers.join(",") + "\r\n";

        registrations.forEach((reg) => {
          const row = headers.map((header) => {
            const val = formatCellVal(reg, header);
            return `"${String(val).replace(/"/g, '""')}"`;
          });
          csvContent += row.join(",") + "\r\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${selectedEventForRegs.title.replace(/[^a-zA-Z0-9]/g, "_")}_Registrations.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (err) {
      console.error("Failed to download spreadsheet:", err);
      alert("Failed to download registration sheet.");
    } finally {
      setDownloadingExcel(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingEventId(null);
    setTitle("");
    setDate("");
    setDescription("");
    setMode("Offline");
    setTag("Workshop");
    setHasFee(false);
    setRegistrationLink("");
    setBrochure(null);
    setTimelinePdf(null);
    setGalleryLink("");
    setExistingBrochure("");
    setExistingTimelinePdf("");
    if (brochureInputRef.current) brochureInputRef.current.value = "";
    if (timelineInputRef.current) timelineInputRef.current.value = "";
    setShowForm(true);
  };

  const handleOpenEdit = (e) => {
    const eventId = e._id || e.id;
    setEditingEventId(eventId);
    setTitle(e.title || "");
    setDate(e.date ? e.date.split("T")[0] : "");
    setDescription(e.description || "");
    setMode(e.mode || "Offline");
    setTag(e.tag || "Workshop");
    setHasFee(Boolean(e.hasFee));
    setRegistrationLink(e.registrationLink || "");
    setBrochure(null);
    setTimelinePdf(null);
    setGalleryLink(e.galleryLink || "");
    setExistingBrochure(e.brochure || "");
    setExistingTimelinePdf(e.timelinePdf || "");
    if (brochureInputRef.current) brochureInputRef.current.value = "";
    if (timelineInputRef.current) timelineInputRef.current.value = "";
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmitEvent = async (e) => {
    e.preventDefault();
    if (!title || !date || !description || !mode || !tag) {
      alert("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("date", date);
      formData.append("mode", mode);
      formData.append("tag", tag);
      formData.append("hasFee", hasFee);
      
      if (hasFee) {
        formData.append("registrationLink", registrationLink);
      } else {
        formData.append("registrationLink", "");
      }
      
      if (galleryLink) {
        formData.append("galleryLink", galleryLink);
      }
      
      if (brochure instanceof File) {
        formData.append("brochure", brochure);
      }
      if (timelinePdf instanceof File) {
        formData.append("timelinePdf", timelinePdf);
      }

      const cleanId = editingEventId ? String(editingEventId).trim() : "";
      const url = cleanId
        ? `${import.meta.env.VITE_API_BASE_URL}/api/events/${cleanId}`
        : `${import.meta.env.VITE_API_BASE_URL}/api/events`;
      
      const method = cleanId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || (cleanId ? "Update failed" : "Create failed"));
      }

      const savedEvent = await res.json();

      if (cleanId) {
        setEvents((prev) =>
          prev.map((ev) => ((ev._id || ev.id) === cleanId ? savedEvent : ev))
        );
      } else {
        setEvents((prev) => [...prev, savedEvent]);
      }

      setTitle("");
      setDate("");
      setDescription("");
      setMode("Offline");
      setTag("Workshop");
      setHasFee(false);
      setRegistrationLink("");
      setBrochure(null);
      setTimelinePdf(null);
      setGalleryLink("");
      setEditingEventId(null);
      setShowForm(false);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to save event. Check backend logs.");
    } finally {
      setSubmitting(false);
    }
  };

  const upcomingEvents = events.filter((e) => getEventStatus(e.date) === "upcoming");
  const liveEvents = events.filter((e) => getEventStatus(e.date) === "live");
  const concludedEvents = events.filter((e) => getEventStatus(e.date) === "concluded");

  const displayedEvents =
    activeTab === "upcoming"
      ? upcomingEvents
      : activeTab === "live"
      ? liveEvents
      : concludedEvents;

  const registrationTableHeaders = getAllRegistrationKeys();

  return (
    <div className="bg-[#010714] text-white min-h-screen relative overflow-x-hidden">
      <NeuralNetwork />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24">
        
        {/* --- PAGE HEADER SECTION --- */}
        <div
          className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-14 gap-6 transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="h-px w-8 bg-cyan-500/50" />
              <span className="font-mono text-[10px] tracking-[0.35em] uppercase text-cyan-400/80">
                Authorized Control Panel // Level_03
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
              Event <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">Management</span>
            </h1>
            <p className="text-slate-400 mt-2 text-xs md:text-sm font-mono tracking-widest uppercase">
              Authorized Control Panel • Create, Modify & Monitor
            </p>
          </div>

          <button
            onClick={() => (showForm ? setShowForm(false) : handleOpenCreate())}
            className="px-6 py-3.5 bg-cyan-400 text-black font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-cyan-300 transition shadow-[0_0_20px_rgba(34,211,238,0.3)] flex items-center gap-2 cursor-pointer"
          >
            {showForm ? "✕ Cancel" : "+ New Event"}
          </button>
        </div>

        {/* --- EVENT CREATION / EDITING FORM --- */}
        {showForm && (
          <div className="mb-16 bg-[#0a1628]/90 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(0,209,255,0.15)]">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
              <h3 className="text-sm font-mono uppercase tracking-[0.3em] text-cyan-400">
                {editingEventId ? "Edit Event Parameters" : "Initialize New Event Entry"}
              </h3>
              <span className="text-xs text-gray-500 font-mono">SECURE ADMIN CHANNEL</span>
            </div>

            <form onSubmit={handleSubmitEvent} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-2">Event Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Advanced Network Forensics Workshop"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-2">Event Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-2">Description</label>
                <textarea
                  required
                  placeholder="Provide comprehensive details about the event..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition h-32 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-2">Event Mode</label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                  >
                    <option value="Offline" className="bg-[#0a1628]">Offline</option>
                    <option value="Online" className="bg-[#0a1628]">Online</option>
                    <option value="Hybrid" className="bg-[#0a1628]">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-2">Tag / Category</label>
                  <input
                    type="text"
                    required
                    placeholder="Workshop / CTF / Expert Session"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
              </div>

              {/* Participation Fee Checkbox */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-2">Participation Fee Status</label>
                <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-xl px-4 py-3.5">
                  <input
                    type="checkbox"
                    id="hasFeeCheckbox"
                    checked={hasFee}
                    onChange={(e) => setHasFee(e.target.checked)}
                    className="w-4 h-4 accent-cyan-400 bg-black border-white/20 rounded cursor-pointer"
                  />
                  <label htmlFor="hasFeeCheckbox" className="text-xs font-mono uppercase tracking-widest text-gray-300 cursor-pointer select-none">
                    Event requires participation fee (Paid Event)
                  </label>
                </div>
              </div>

              {/* Conditional Registration Link input if fee is yes */}
              {hasFee && (
                <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                  <label className="block text-[11px] font-mono uppercase tracking-widest text-amber-400 mb-2">
                    🔗 External Registration Link (Paid Event)
                  </label>
                  <input
                    type="url"
                    required={hasFee}
                    placeholder="https://payment-gateway-or-form-link.com"
                    value={registrationLink}
                    onChange={(e) => setRegistrationLink(e.target.value)}
                    className="w-full bg-black/60 border border-amber-500/30 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-amber-400 transition"
                  />
                  <p className="text-[10px] text-gray-400 font-mono mt-2">
                    Since a participation fee is required, provide the external link where participants will register and pay.
                  </p>
                </div>
              )}

              {/* Conditional Photo Gallery Link input for concluded events */}
              {isEditingConcludedEvent() && (
                <div className="p-5 rounded-2xl bg-cyan-500/5 border border-cyan-500/20">
                  <label className="block text-[11px] font-mono uppercase tracking-widest text-cyan-400 mb-2">
                    📸 Event Photo Gallery Link (Concluded Event Archive)
                  </label>
                  <input
                    type="url"
                    placeholder="https://photos.app.goo.gl/... or drive link"
                    value={galleryLink}
                    onChange={(e) => setGalleryLink(e.target.value)}
                    className="w-full bg-black/60 border border-cyan-500/30 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                  />
                  <p className="text-[10px] text-gray-400 font-mono mt-2">
                    Provide the external link to the pictures or media album from this concluded event.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[11px] font-mono uppercase tracking-widest text-gray-400">Upload Brochure (PDF/Image)</label>
                    {existingBrochure && !brochure && (
                      <a 
                        href={getFileUrl(existingBrochure)} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[10px] text-cyan-400 hover:underline"
                      >
                        View Current File
                      </a>
                    )}
                  </div>
                  <input
                    ref={brochureInputRef}
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={(e) => setBrochure(e.target.files[0] || null)}
                    className="w-full text-xs text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500/20 file:cursor-pointer bg-black/40 border border-white/10 rounded-xl p-2 transition"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[11px] font-mono uppercase tracking-widest text-gray-400">Upload Event Timeline (PDF/Image)</label>
                    {existingTimelinePdf && !timelinePdf && (
                      <a 
                        href={getFileUrl(existingTimelinePdf)} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[10px] text-cyan-400 hover:underline"
                      >
                        View Current File
                      </a>
                    )}
                  </div>
                  <input
                    ref={timelineInputRef}
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={(e) => setTimelinePdf(e.target.files[0] || null)}
                    className="w-full text-xs text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500/20 file:cursor-pointer bg-black/40 border border-white/10 rounded-xl p-2 transition"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3.5 rounded-xl border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3.5 bg-cyan-400 text-black font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-cyan-300 transition shadow-[0_0_20px_rgba(34,211,238,0.3)] disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Processing..." : editingEventId ? "Save Changes" : "Commit to Database"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* --- NAVIGATION TABS --- */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-[#0a1628]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 shadow-lg">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === "upcoming"
                  ? "bg-cyan-400 text-black shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Upcoming ({upcomingEvents.length})
            </button>
            <button
              onClick={() => setActiveTab("live")}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === "live"
                  ? "bg-cyan-400 text-black shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Live ({liveEvents.length})
            </button>
            <button
              onClick={() => setActiveTab("concluded")}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === "concluded"
                  ? "bg-cyan-400 text-black shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Concluded ({concludedEvents.length})
            </button>
          </div>
        </div>

        {/* --- EVENTS LISTING SECTION --- */}
        <div className="space-y-6">
          {displayedEvents.length === 0 ? (
            <div className="text-center text-gray-500 font-mono tracking-widest py-16 bg-[#0a1628]/40 border border-white/5 rounded-3xl">
              No {activeTab} events registered in the system.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayedEvents.map((e, index) => {
                const status = getEventStatus(e.date);
                return (
                  <div
                    key={e._id || e.id || index}
                    className="group relative bg-[#0a1628]/85 backdrop-blur-xl border border-white/5 rounded-3xl p-8 hover:border-cyan-500/40 transition-all flex flex-col justify-between shadow-xl"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-mono tracking-[0.3em] text-cyan-400 uppercase">
                          {status === "live" ? "🔴 LIVE NOW" : status.toUpperCase()}
                        </span>
                        <div className="flex gap-2 items-center">
                          {e.hasFee && (
                            <span className="text-[10px] px-2.5 py-1 rounded-full border border-amber-500/30 text-amber-400 bg-amber-500/5 font-mono">
                              Paid
                            </span>
                          )}
                          <span className="text-[10px] px-3 py-1 rounded-full border border-cyan-500/30 text-cyan-400 bg-cyan-500/5">
                            {e.mode || "Offline"}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold mb-2 group-hover:text-cyan-400 transition">
                        {e.title}
                      </h3>

                      <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3">
                        {e.description}
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center pt-4 mb-6 text-xs text-gray-400 font-mono border-t border-white/5">
                        <span>📅 {e.date ? new Date(e.date).toDateString() : "N/A"}</span>
                        <span className="text-cyan-400 font-bold uppercase tracking-wider">{e.tag}</span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenEdit(e)}
                            className="px-4 py-2 bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/40 rounded-xl text-xs font-mono uppercase tracking-wider text-gray-300 hover:text-cyan-300 transition cursor-pointer"
                          >
                            ✎ Edit
                          </button>
                          <button
                            onClick={() => handleOpenRegistrations(e)}
                            className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/30 border border-cyan-500/30 hover:border-cyan-500/60 rounded-xl text-xs font-mono uppercase tracking-wider text-cyan-400 transition flex items-center gap-1.5 cursor-pointer"
                          >
                            👥 Registrations
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {e.registrationLink && (
                            <a
                              href={e.registrationLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[10px] font-mono tracking-wider text-amber-400 hover:bg-amber-500 hover:text-black transition"
                            >
                              External Reg Link
                            </a>
                          )}
                          {e.galleryLink && (
                            <a
                              href={e.galleryLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 bg-purple-500/10 border border-purple-500/30 rounded-xl text-[10px] font-mono tracking-wider text-purple-400 hover:bg-purple-500 hover:text-white transition"
                            >
                              📸 Gallery
                            </a>
                          )}
                          {e.brochure && (
                            <a
                              href={getFileUrl(e.brochure)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-[10px] font-mono tracking-wider text-cyan-400 hover:bg-cyan-500 hover:text-black transition"
                            >
                              Brochure PDF
                            </a>
                          )}
                          {e.timelinePdf && (
                            <a
                              href={getFileUrl(e.timelinePdf)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-[10px] font-mono tracking-wider text-cyan-400 hover:bg-cyan-500 hover:text-black transition"
                            >
                              Timeline PDF
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* --- REGISTRATIONS VIEW MODAL --- */}
      {selectedEventForRegs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0a1628] border border-cyan-500/40 rounded-3xl w-full max-w-6xl max-h-[85vh] flex flex-col shadow-[0_0_50px_rgba(0,209,255,0.2)] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 flex justify-between items-center bg-black/30 border-b border-white/5">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">
                  Complete Attendee Manifest
                </span>
                <h2 className="text-xl font-bold mt-1">{selectedEventForRegs.title}</h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownloadExcel}
                  disabled={downloadingExcel || registrations.length === 0}
                  className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition flex items-center gap-2 shadow-[0_0_15px_rgba(34,211,238,0.3)] disabled:opacity-50 cursor-pointer"
                >
                  {downloadingExcel ? "Exporting..." : "📥 Download Sheet"}
                </button>
                <button
                  onClick={handleCloseRegistrations}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition font-mono cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {loadingRegs ? (
                <div className="text-center py-16 text-cyan-400 font-mono tracking-widest animate-pulse">
                  FETCHING COMPLETE REGISTRATION DATA...
                </div>
              ) : registrations.length === 0 ? (
                <div className="text-center py-16 text-gray-500 font-mono tracking-widest bg-black/20 rounded-2xl border border-white/5">
                  No registrations found for this event yet.
                </div>
              ) : (
                <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[11px] font-mono uppercase tracking-widest text-gray-400 bg-black/30 border-b border-white/10">
                        <th className="p-4">#</th>
                        {registrationTableHeaders.map((header) => (
                          <th key={header} className="p-4 whitespace-nowrap">
                            {header === "registeredAt" ? "Registered At" : header.replace("user_", "User: ")}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {registrations.map((reg, idx) => (
                        <tr key={reg._id || idx} className="hover:bg-cyan-500/5 transition border-b border-white/5">
                          <td className="p-4 font-mono text-xs text-gray-500">{idx + 1}</td>
                          {registrationTableHeaders.map((header) => (
                            <td key={header} className="p-4 font-mono text-xs text-gray-300 whitespace-nowrap">
                              {formatCellVal(reg, header)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-black/30 flex justify-between items-center text-xs font-mono text-gray-400 px-6 border-t border-white/5">
              <span>Total Registrations: <strong className="text-cyan-400">{registrations.length}</strong></span>
              <button
                onClick={handleCloseRegistrations}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition uppercase tracking-wider cursor-pointer"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}