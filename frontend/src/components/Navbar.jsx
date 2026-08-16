/**
 * @file Navbar.jsx
 * @description Responsive navigation bar component supporting glassmorphism, mobile drawer, role-based links, and session management.
 */

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navbar({ isLoggedIn: propIsLoggedIn, onLogout }) {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        return propIsLoggedIn || !!localStorage.getItem("token") || !!localStorage.getItem("role");
    });
    
    const location = useLocation();
    const navigate = useNavigate();

    const role = localStorage.getItem("role");
    const isAdmin = role === "admin";

    // Keep sync with prop or localStorage changes
    useEffect(() => {
        const loggedInStatus = propIsLoggedIn || !!localStorage.getItem("token") || !!localStorage.getItem("role");
        setIsLoggedIn(loggedInStatus);
    }, [propIsLoggedIn, location]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        setOpen(false);
    }, [location.pathname]);

    const isActive = (path) =>
        location.pathname === path
            ? "text-cyan-400 font-bold relative after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-cyan-400 after:to-teal-400 after:shadow-[0_0_10px_rgba(34,211,238,0.8)]"
            : "text-slate-400 hover:text-white transition-all duration-300";

    const handleLogoutClick = () => {
        localStorage.clear();
        setIsLoggedIn(false);
        if (onLogout) onLogout();
        navigate("/");
    };

    return (
        <nav
            className={`fixed top-0 w-full z-50 transition-all duration-500 px-6 py-4 ${
                scrolled
                    ? "bg-[#020617]/90 backdrop-blur-xl border-b border-cyan-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                    : "bg-transparent border-b border-slate-800/60"
            }`}
        >
            <div className="flex justify-between items-center max-w-7xl mx-auto">
                <button
                    className="md:hidden text-cyan-400 text-2xl z-[60] focus:outline-none order-1 w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center hover:bg-cyan-500/20 transition cursor-pointer"
                    onClick={() => setOpen(!open)}
                    aria-label="Toggle menu"
                >
                    {open ? "✕" : "☰"}
                </button>

                <Link
                    to={isAdmin ? "/admin" : "/"}
                    className="text-white font-black text-xl italic z-[60] order-2 md:order-1 tracking-wider flex items-center gap-1 group"
                >
                    <span className="group-hover:text-cyan-400 transition-colors">CSC</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]">
                        NITJ
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-8 text-xs font-mono uppercase tracking-[0.2em] md:order-2">
                    {isAdmin ? (
                        <>
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
                                className="px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-black font-bold transition-all duration-300 shadow-[0_0_15px_rgba(239,68,68,0.2)] cursor-pointer"
                            >
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/" className={isActive("/")}>Home</Link>
                            <Link to="/about" className={isActive("/about")}>About</Link>
                            <Link to="/events" className={isActive("/events")}>Events</Link>
                            <Link to="/team" className={isActive("/team")}>Team</Link>
                            <Link to="/blog" className={isActive("/blog")}>Blog</Link>

                            {!isLoggedIn ? (
                                <Link
                                    to="/login"
                                    className="px-5 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-400 hover:text-black font-bold transition-all duration-300 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                                >
                                    Sign In
                                </Link>
                            ) : (
                                <Link
                                    to="/profile"
                                    className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 hover:bg-cyan-400 hover:text-black hover:border-cyan-400 transition-all duration-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                                    title="User Profile"
                                >
                                    👤
                                </Link>
                            )}
                        </>
                    )}
                </div>

                <div className="md:hidden z-[60] order-3">
                    {isAdmin ? (
                        <button
                            onClick={handleLogoutClick}
                            className="text-[10px] px-3.5 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl uppercase font-mono tracking-wider font-bold shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                        >
                            Sign Out
                        </button>
                    ) : !isLoggedIn ? (
                        <Link
                            to="/login"
                            className="text-[10px] px-3.5 py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-xl uppercase font-mono tracking-wider font-bold shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                        >
                            Sign In
                        </Link>
                    ) : (
                        <Link
                            to="/profile"
                            className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                        >
                            👤
                        </Link>
                    )}
                </div>
            </div>

            <div
                className={`fixed top-0 left-0 h-screen w-72 bg-[#091122]/95 backdrop-blur-2xl border-r border-cyan-500/20 transform transition-transform duration-500 ease-in-out z-[55] shadow-[10px_0_40px_rgba(0,0,0,0.8)] ${
                    open ? "translate-x-0" : "-translate-x-full"
                } md:hidden`}
            >
                <div className="flex flex-col gap-6 p-8 mt-24 text-xs font-mono uppercase tracking-[0.2em]">
                    <div className="text-[10px] text-cyan-400 tracking-[0.3em] pb-2 border-b border-white/10">
                        // Navigation Matrix
                    </div>
                    {isAdmin ? (
                        <>
                            <Link to="/admin" className={isActive("/admin")}>Home</Link>
                            <Link to="/admin/events" className={isActive("/admin/events")}>
                                Event Control
                            </Link>
                            <Link to="/admin/blogs" className={isActive("/admin/blogs")}>
                                Blog Moderation
                            </Link>
                            <button
                                onClick={handleLogoutClick}
                                className="text-red-400 text-left pt-4 border-t border-white/10 font-bold"
                            >
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/" className={isActive("/")}>Home</Link>
                            <Link to="/about" className={isActive("/about")}>About</Link>
                            <Link to="/events" className={isActive("/events")}>Events</Link>
                            <Link to="/team" className={isActive("/team")}>Team</Link>
                            <Link to="/blog" className={isActive("/blog")}>Blog</Link>
                        </>
                    )}
                </div>
            </div>

            {open && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-md z-[50] md:hidden transition-opacity duration-300"
                    onClick={() => setOpen(false)}
                />
            )}
        </nav>
    );
}