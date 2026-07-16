import React, { useState, useEffect } from "react";
import { apiFetch } from "../api";

export default function EventManager() {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState("Offline");
  const [tag, setTag] = useState("Workshop");

  // Load all events (admin view)
  useEffect(() => {
    const fetchAdminEvents = async () => {
      try {
        const res = await apiFetch("/api/events");

        if (!res.ok) throw new Error("Fetch failed");

        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error("Failed to fetch events", err);
      }
    };

    fetchAdminEvents();
  }, []);

  // Create a new event entry
  const handleCreate = async () => {
    if (!title || !date || !description) return;

    try {
      const res = await apiFetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          date,
          mode,
          tag,
        }),
      });

      if (!res.ok) throw new Error("Create failed");

      const newEvent = await res.json();
      setEvents((prev) => [...prev, newEvent]);

      // Reset form after successful creation
      setTitle("");
      setDate("");
      setDescription("");
      setMode("Offline");
      setTag("Workshop");
      setShowForm(false);
    } catch (err) {
      console.error(err);
      alert("Failed to create event");
    }
  };

  // Split events by status for display
  const upcomingEvents = events.filter((e) => e.status === "upcoming");
  const completedEvents = events.filter((e) => e.status === "completed");

  return (
    <div className="bg-[#010714] min-h-screen text-white pt-32 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <div className="flex justify-between items-center mb-14">
          <div>
            <h1 className="text-4xl font-black">
              Event <span className="text-cyan-400">Management</span>
            </h1>
            <p className="text-slate-400 mt-2">
              Authorized Control Panel: Event Creation
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-cyan-500 text-black font-black text-xs uppercase tracking-widest rounded-lg hover:bg-cyan-400 transition"
          >
            {showForm ? "Cancel" : "+ New Event"}
          </button>
        </div>

        {/* Event creation form */}
        {showForm && (
          <div className="mb-16 bg-[#0a1628]/80 border border-cyan-500/20 rounded-2xl p-8 shadow-2xl">
            <h3 className="text-sm font-black uppercase tracking-widest text-cyan-400 mb-6">
              Initialize New Event
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <input
                placeholder="Event Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="p-4 rounded-lg bg-black/50 border border-white/10"
              />

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="p-4 rounded-lg bg-black/50 border border-white/10"
              />
            </div>

            <textarea
              placeholder="Event Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 mb-6 rounded-lg bg-black/50 border border-white/10 h-32"
            />

            <div className="grid grid-cols-2 gap-6 mb-6">
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="p-4 rounded-lg bg-black/50 border border-white/10"
              >
                <option>Offline</option>
                <option>Online</option>
              </select>

              <input
                placeholder="Tag (Workshop / CTF)"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="p-4 rounded-lg bg-black/50 border border-white/10"
              />
            </div>

            <button
              onClick={handleCreate}
              className="px-8 py-3 bg-cyan-500 text-black font-black text-xs uppercase tracking-widest rounded-lg hover:bg-cyan-400 transition"
            >
              Commit to Database
            </button>
          </div>
        )}

        {/* Upcoming events */}
        <section className="mb-20">
          <h2 className="text-xl font-black uppercase tracking-widest mb-6">
            Upcoming <span className="text-cyan-400">Events</span>
          </h2>

          {upcomingEvents.map((e) => (
            <div
              key={e._id}
              className="bg-[#0a1628]/70 border border-cyan-500/20 rounded-xl p-6 mb-4"
            >
              <h3 className="text-lg font-bold">{e.title}</h3>
              <p className="text-slate-400 text-sm">
                {new Date(e.date).toDateString()}
              </p>
              <p className="text-xs text-cyan-400 mt-1">
                {e.mode} • {e.tag}
              </p>
            </div>
          ))}
        </section>

        {/* Completed events */}
        <section>
          <h2 className="text-xl font-black uppercase tracking-widest mb-6">
            Completed <span className="text-yellow-400">Events</span>
          </h2>

          {completedEvents.map((e) => (
            <div
              key={e._id}
              className="bg-[#0a1628]/70 border border-yellow-500/20 rounded-xl p-6 mb-4"
            >
              <h3 className="text-lg font-bold">{e.title}</h3>
              <p className="text-slate-400 text-sm">
                {new Date(e.date).toDateString()}
              </p>
              <p className="text-xs text-yellow-400 mt-1">
                {e.mode} • {e.tag}
              </p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
