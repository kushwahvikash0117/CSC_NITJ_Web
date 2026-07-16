import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navbar({ isLoggedIn, user, onLogout }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Role is only used for UI branching (admin vs normal user)
  // Auth state still comes from App.jsx
  const isAdmin = user?.role === "admin";

  // Helper to highlight active links
  const isActive = (path) =>
    location.pathname === path
      ? "text-cyan-400"
      : "text-slate-400 hover:text-white transition-colors";

  // Logout handler
  const handleLogoutClick = async () => {
    await onLogout();
    setOpen(false);
    navigate("/");
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#020617]/80 backdrop-blur border-b border-slate-800 px-6 py-4">
      <div className="flex justify-between items-center max-w-7xl mx-auto">

        {/* Mobile hamburger toggle */}
        <button
          className="md:hidden text-cyan-400 text-3xl z-[60] focus:outline-none order-1"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? "✕" : "☰"}
        </button>

        {/* Logo (redirects admin to admin dashboard) */}
        <Link
          to={isAdmin ? "/admin" : "/"}
          onClick={() => setOpen(false)}
          className="text-white font-black text-xl italic z-[60] order-2 md:order-1"
        >
          CSC<span className="text-cyan-400">NITJ</span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest md:order-2">
          {isAdmin ? (
            <>
              {/* Admin-only navigation */}
              <Link to="/admin" className={isActive("/admin")}>
                Home
              </Link>
              <Link to="/admin/events" className={isActive("/admin/events")}>
                Event Control
              </Link>
              <Link to="/admin/blogs" className={isActive("/admin/blogs")}>
                Blog Moderation
              </Link>

              <button
                onClick={handleLogoutClick}
                className="px-4 py-2 border border-red-500 text-red-400 rounded hover:bg-red-500 hover:text-black transition"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              {/* Normal user navigation */}
              <Link to="/" className={isActive("/")}>Home</Link>
              <Link to="/about" className={isActive("/about")}>About</Link>
              <Link to="/events" className={isActive("/events")}>Events</Link>
              <Link to="/team" className={isActive("/team")}>Team</Link>
              <Link to="/blog" className={isActive("/blog")}>Blog</Link>

              {/* Auth-aware CTA */}
              {!isLoggedIn ? (
                <Link
                  to="/login"
                  className="px-4 py-2 border border-cyan-500 text-cyan-400 rounded hover:bg-cyan-500 hover:text-black transition"
                >
                  Sign In
                </Link>
              ) : (
                <Link
                  to="/profile"
                  className="w-9 h-9 rounded-full border border-cyan-500 flex items-center justify-center text-cyan-400"
                >
                  👤
                </Link>
              )}
            </>
          )}
        </div>

        {/* Mobile right-side action */}
        <div className="md:hidden z-[60] order-3">
          {isAdmin ? (
            <button
              onClick={handleLogoutClick}
              className="text-[10px] px-3 py-1.5 border border-red-500 text-red-400 rounded uppercase font-bold tracking-tighter"
            >
              Sign Out
            </button>
          ) : !isLoggedIn ? (
            <Link
              to="/login"
              className="text-[10px] px-3 py-1.5 border border-cyan-500 text-cyan-400 rounded uppercase font-bold tracking-tighter"
            >
              Sign In
            </Link>
          ) : (
            <Link
              to="/profile"
              className="w-8 h-8 rounded-full border border-cyan-500 flex items-center justify-center text-cyan-400"
            >
              👤
            </Link>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`fixed top-0 left-0 h-screen w-64 bg-[#020617] border-r border-slate-800 transform transition-transform duration-300 ease-in-out z-[55] shadow-2xl ${open ? "translate-x-0" : "-translate-x-full"
          } md:hidden`}
      >
        <div className="flex flex-col gap-8 p-10 mt-20 text-sm font-bold uppercase tracking-[0.2em]">
          {isAdmin ? (
            <>
              <Link to="/admin" onClick={() => setOpen(false)} className={isActive("/admin")}>Home</Link>
              <Link to="/admin/events" onClick={() => setOpen(false)} className={isActive("/admin/events")}>
                Event Control
              </Link>
              <Link to="/admin/blogs" onClick={() => setOpen(false)} className={isActive("/admin/blogs")}>
                Blog Moderation
              </Link>
              <button
                onClick={handleLogoutClick}
                className="text-red-400 text-left"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/" onClick={() => setOpen(false)} className={isActive("/")}>Home</Link>
              <Link to="/about" onClick={() => setOpen(false)} className={isActive("/about")}>About</Link>
              <Link to="/events" onClick={() => setOpen(false)} className={isActive("/events")}>Events</Link>
              <Link to="/team" onClick={() => setOpen(false)} className={isActive("/team")}>Team</Link>
              <Link to="/blog" onClick={() => setOpen(false)} className={isActive("/blog")}>Blog</Link>
            </>
          )}
        </div>
      </div>

      {/* Backdrop overlay for mobile drawer */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50] md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </nav>
  );
}
