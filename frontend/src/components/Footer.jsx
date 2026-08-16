/**
 * @file Footer.jsx
 * @description Footer component featuring brand information, cyber-themed design, navigation links, and official secure channels.
 */

import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/clublogo.png";
import {
    FaInstagram,
    FaLinkedinIn,
    FaGithub,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const handleScrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <>
            <div className="relative h-[2px] w-full bg-gradient-to-r from-transparent via-[#00D1FF] to-transparent shadow-[0_0_20px_#00D1FF]" />

            <footer className="relative bg-[#010614] text-white pt-14 pb-8 px-6 md:px-12 overflow-hidden font-sans selection:bg-cyan-500/30">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-gradient-to-b from-cyan-500/10 to-transparent blur-[90px] rounded-full pointer-events-none" />

                <div className="relative max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center pb-10 border-b border-white/10">
                        
                        <div className="md:col-span-5 flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <div className="relative group">
                                    <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl opacity-40 blur-sm" />
                                    <img
                                        src={logo}
                                        alt="CSC NITJ Logo"
                                        className="relative w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(0,209,255,0.4)]"
                                    />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black tracking-tight text-white uppercase leading-none">
                                        CSC <span className="text-[#00D1FF] drop-shadow-[0_0_8px_rgba(0,209,255,0.5)]">NITJ</span>
                                    </h2>
                                    <span className="font-mono text-[9px] text-cyan-400/80 tracking-widest uppercase">
                                        Cyber Security Club • NIT Jalandhar
                                    </span>
                                </div>
                            </div>

                            <p className="text-gray-400 text-xs leading-relaxed max-w-md">
                                Building resilient network architectures, advancing malware forensics, and forging elite security analysts.
                            </p>

                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-500/5 border border-cyan-500/20 w-fit font-mono text-[10px] text-cyan-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" />
                                <span>SYS_NODE: SECURE & OPERATIONAL</span>
                            </div>
                        </div>

                        <div className="md:col-span-7 flex flex-col gap-6 md:items-end">
                            <div className="flex flex-col gap-2 md:items-end">
                                <h3 className="text-[11px] font-mono font-bold tracking-[0.15em] uppercase text-cyan-400">
                                    Navigation
                                </h3>
                                <ul className="flex flex-wrap gap-x-6 gap-y-2 text-gray-400 text-xs md:justify-end">
                                    {["Home", "About", "Events", "Team", "Blog"].map((item) => (
                                        <li key={item}>
                                            <Link
                                                to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                                                className="group relative inline-flex items-center gap-1.5 hover:text-[#00D1FF] transition-colors"
                                                onClick={handleScrollToTop}
                                            >
                                                <span className="text-cyan-500/40 group-hover:text-[#00D1FF] text-[10px] font-mono">›</span>
                                                <span>{item}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex flex-col gap-2 md:items-end">
                                <h3 className="text-[11px] font-mono font-bold tracking-[0.15em] uppercase text-cyan-400">
                                    Secure Channels
                                </h3>
                                <div className="flex items-center gap-2 flex-wrap md:justify-end">
                                    {[
                                        { name: "Instagram", icon: <FaInstagram />, href: "https://www.instagram.com/csc_nitj/" },
                                        { name: "LinkedIn", icon: <FaLinkedinIn />, href: "https://linkedin.com/company/cyber-security-club-nitj/" },
                                        { name: "GitHub", icon: <FaGithub />, href: "https://github.com/cybersecurityclub-nitj" },
                                        { name: "X", icon: <FaXTwitter />, href: "#" },
                                    ].map((social) => (
                                        <a
                                            key={social.name}
                                            href={social.href}
                                            target="_blank"
                                            rel="noreferrer"
                                            aria-label={social.name}
                                            className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#00D1FF] hover:border-cyan-500/40 hover:bg-cyan-500/[0.08] transition-all duration-300 text-sm"
                                        >
                                            {social.icon}
                                        </a>
                                    ))}
                                </div>
                            </div>

                        </div>

                    </div>

                    <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
                        <p className="text-gray-500 text-[11px] font-mono tracking-wider">
                            © {currentYear} <strong className="text-gray-300">CSC NITJ</strong> • Built with <span className="text-cyan-400">⚡</span> by Cyber Team
                        </p>
                        <p className="text-[#00D1FF]/60 text-[9px] font-mono uppercase tracking-[0.25em] font-bold">
                            // SECURING_CYBERSPACE
                        </p>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default Footer;