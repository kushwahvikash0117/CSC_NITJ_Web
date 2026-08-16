/**
 * @file About.jsx
 * @description About Page component featuring a neural network background,
 * interactive hero carousel, identity breakdown, and core objectives.
 */

import React, {
  useState,
  useEffect,
  useRef,
  memo,
  useCallback,
} from "react";

/**
 * NeuralNetwork Background Component
 * Renders an interactive canvas particle network.
 */
const NeuralNetwork = memo(() => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
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

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.radius = Math.random() * 1.5 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) {
          this.vx *= -1;
        }

        if (this.y < 0 || this.y > canvas.height) {
          this.vy *= -1;
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(
          this.x,
          this.y,
          this.radius,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = "#22d3ee";
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];

      const count = Math.floor(
        (canvas.width * canvas.height) / 16000
      );

      for (let i = 0; i < count; i++) {
        particles.push(
          new Particle(
            Math.random() * canvas.width,
            Math.random() * canvas.height
          )
        );
      }
    };

    const animate = () => {
      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        p1.update();

        ctx.shadowBlur = 12;
        ctx.shadowColor = "#22d3ee";

        p1.draw();

        if (
          mouse.x !== null &&
          mouse.y !== null
        ) {
          const mdx = p1.x - mouse.x;
          const mdy = p1.y - mouse.y;

          const mdist = Math.sqrt(
            mdx * mdx + mdy * mdy
          );

          if (mdist < mouse.radius) {
            ctx.beginPath();

            ctx.strokeStyle = `rgba(34, 211, 238, ${
              0.4 *
              (1 - mdist / mouse.radius)
            })`;

            ctx.lineWidth = 1;

            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);

            ctx.stroke();
          }
        }

        for (
          let j = i + 1;
          j < particles.length;
          j++
        ) {
          const p2 = particles[j];

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;

          const dist = Math.sqrt(
            dx * dx + dy * dy
          );

          if (dist < 200) {
            ctx.shadowBlur = 0;
            ctx.beginPath();

            ctx.strokeStyle = `rgba(34, 211, 238, ${
              0.6 * (1 - dist / 200)
            })`;

            ctx.lineWidth = 1;

            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);

            ctx.stroke();
          }
        }
      }

      ctx.globalCompositeOperation =
        "source-over";

      animationFrameId =
        requestAnimationFrame(animate);
    };

    window.addEventListener(
      "resize",
      resize
    );

    resize();
    animate();

    return () => {
      window.removeEventListener(
        "resize",
        resize
      );

      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      window.removeEventListener(
        "mouseleave",
        handleMouseLeave
      );

      cancelAnimationFrame(
        animationFrameId
      );
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
});

NeuralNetwork.displayName =
  "NeuralNetwork";

/**
 * SectionHeader Component
 * Displays structured titles with category eyebrows and styled accents.
 */
const SectionHeader = memo(
  ({ eyebrow, title, accent }) => (
    <div className="flex flex-col items-center text-center mb-16">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-px w-8 bg-cyan-500/40" />

        <span className="font-mono text-[9px] md:text-[10px] tracking-[0.35em] uppercase text-cyan-500/60">
          {eyebrow}
        </span>

        <div className="h-px w-8 bg-cyan-500/40" />
      </div>

      <h2 className="text-3xl md:text-5xl font-black uppercase tracking-[0.15em] text-white">
        {title}{" "}
        <span className="text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.35)]">
          {accent}
        </span>
      </h2>

      <div className="h-1 w-32 md:w-48 bg-cyan-500 mt-6 rounded-full shadow-[0_0_18px_rgba(34,211,238,0.65)]" />
    </div>
  )
);

SectionHeader.displayName =
  "SectionHeader";

/**
 * TerminalBox Component
 * Reusable terminal window container for descriptive content blocks.
 */
const TerminalBox = memo(
  ({
    children,
    label = "terminal",
    className = "",
  }) => (
    <div
      className={`group relative ${className}`}
    >
      <div className="absolute -inset-px bg-cyan-500/10 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative bg-[#010714]/90 border border-cyan-500/15 rounded-xl overflow-hidden transition-colors duration-500 group-hover:border-cyan-400/25">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-cyan-500/10 bg-cyan-500/[0.025]">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400/50" />
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400/50" />
            <span className="w-1.5 h-1.5 rounded-full bg-green-400/50" />
          </div>

          <span className="font-mono text-[7px] md:text-[8px] uppercase tracking-[0.25em] text-cyan-500/35">
            {label}
          </span>
        </div>

        <div className="p-5 md:p-6">
          <div className="flex items-start text-left">
            <span className="flex-shrink-0 w-6 font-mono text-cyan-400 text-sm md:text-base leading-7 md:leading-8">
              &gt;
            </span>

            <p
              className="flex-1 text-gray-300 group-hover:text-gray-200 transition-colors duration-300"
              style={{
                fontFamily:
                  "'Chakra Petch', sans-serif",
                fontSize: "1.05rem",
                lineHeight: "1.8",
                letterSpacing: "0.01em",
              }}
            >
              {children}

              <span className="inline-block ml-1 w-1.5 h-3.5 bg-cyan-400/80 align-middle opacity-70 shadow-[0_0_6px_#22d3ee]" />
            </p>
          </div>
        </div>
      </div>
    </div>
  )
);

TerminalBox.displayName =
  "TerminalBox";

/**
 * ObjectiveCard Component
 * Displays an informational organizational objective.
 *
 * Navigation has intentionally been removed.
 * These cards are now static informational modules.
 */
const ObjectiveCard = memo(
  ({
    id,
    title,
    desc,
    icon,
    active,
  }) => {
    return (
      <div
        className={`group relative transition-all duration-700 ease-out ${
          active
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-8 scale-[0.97]"
        }`}
      >
        <div className="absolute -inset-px rounded-[2rem] bg-gradient-to-b from-cyan-500/40 via-cyan-500/10 to-transparent opacity-40 group-hover:opacity-100 blur-[2px] transition-all duration-500" />

        <div className="relative h-full min-h-[430px] bg-[#0a1628]/90 backdrop-blur-2xl border border-white/[0.07] rounded-[2rem] overflow-hidden p-7 md:p-9 flex flex-col">
          {/* Animated top border */}
          <div className="absolute top-0 left-0 w-full h-px bg-white/5">
            <div
              className="h-full bg-cyan-400 shadow-[0_0_12px_#22d3ee] transition-all duration-[1200ms]"
              style={{
                width: active ? "100%" : "0%",
              }}
            />
          </div>

          {/* Module Header */}
          <div className="flex items-center justify-between mb-8">
            <span className="font-mono text-[10px] tracking-[0.25em] text-cyan-400/70 bg-cyan-400/5 border border-cyan-400/15 px-3 py-1.5 rounded-md">
              SEC_{id}
            </span>

            <span className="font-mono text-xs text-white/20">
              {icon}
            </span>
          </div>

          {/* Objective Title */}
          <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white group-hover:text-cyan-400 transition-colors duration-300">
            {title}
          </h3>

          {/* Objective Description */}
          <TerminalBox
            label={`objective_${id}`}
            className="mt-6"
          >
            {desc}
          </TerminalBox>

          {/* Bottom decorative separator */}
          <div className="mt-auto pt-7">
            <div className="h-px w-full bg-white/[0.06]" />
          </div>
        </div>
      </div>
    );
  }
);

ObjectiveCard.displayName =
  "ObjectiveCard";

/**
 * AboutPage Component
 * Main page view containing hero banner carousel,
 * who we are section, and core objectives.
 */
const AboutPage = () => {
  const pageFont = `@import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500&display=swap');`;

  const [activeCycle, setActiveCycle] =
    useState(0);

  const [heroScanning, setHeroScanning] =
    useState(true);

  const [heroPaused, setHeroPaused] =
    useState(false);

  const heroTimeoutRef =
    useRef(null);

  const [whoVisible, setWhoVisible] =
    useState(false);

  const whoRef = useRef(null);

  const [objectivesVisible, setObjectivesVisible] =
    useState(false);

  const [
    visibleObjectives,
    setVisibleObjectives,
  ] = useState([
    false,
    false,
    false,
  ]);

  const objectivesRef =
    useRef(null);

  const heroContent = [
    {
      title: "About CSC NITJ",
      desc: "Cyber Security Club NITJ is a student-led technical community focused on cybersecurity awareness, digital safety, and practical security skills at NIT Jalandhar.",
      status: "SYSTEM ONLINE",
      terminal: "csc_nitj // about",
    },
    {
      title: "Our Mission",
      desc: "To bridge the gap between theoretical knowledge and real-world cybersecurity challenges through hands-on learning, technical activities, competitions, and collaborative initiatives.",
      status: "MISSION LOADED",
      terminal: "csc_nitj // mission",
    },
    {
      title: "Our Vision",
      desc: "To build a security-conscious technical community where students can learn, experiment, compete, and contribute to a safer digital environment.",
      status: "VISION",
      terminal: "csc_nitj // vision",
    },
  ];

  const changeHeroSlide =
    useCallback(
      (direction) => {
        if (heroTimeoutRef.current) {
          clearTimeout(
            heroTimeoutRef.current
          );
        }

        setHeroScanning(false);

        heroTimeoutRef.current =
          setTimeout(() => {
            setActiveCycle((prev) => {
              if (direction === "next") {
                return (
                  (prev + 1) %
                  heroContent.length
                );
              }

              return (
                (prev -
                  1 +
                  heroContent.length) %
                heroContent.length
              );
            });

            setHeroScanning(true);
          }, 450);
      },
      [heroContent.length]
    );

  const goToHeroSlide =
    useCallback(
      (index) => {
        if (index === activeCycle) return;

        if (heroTimeoutRef.current) {
          clearTimeout(
            heroTimeoutRef.current
          );
        }

        setHeroScanning(false);

        heroTimeoutRef.current =
          setTimeout(() => {
            setActiveCycle(index);
            setHeroScanning(true);
          }, 450);
      },
      [activeCycle]
    );

  useEffect(() => {
    if (heroPaused) return;

    const heroInterval =
      setInterval(() => {
        setHeroScanning(false);

        heroTimeoutRef.current =
          setTimeout(() => {
            setActiveCycle(
              (prev) =>
                (prev + 1) %
                heroContent.length
            );

            setHeroScanning(true);
          }, 450);
      }, 5000);

    return () => {
      clearInterval(heroInterval);

      if (heroTimeoutRef.current) {
        clearTimeout(
          heroTimeoutRef.current
        );
      }
    };
  }, [
    heroPaused,
    heroContent.length,
  ]);

  useEffect(() => {
    return () => {
      if (heroTimeoutRef.current) {
        clearTimeout(
          heroTimeoutRef.current
        );
      }
    };
  }, []);

  useEffect(() => {
    const observer =
      new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setWhoVisible(true);
            observer.disconnect();
          }
        },
        { threshold: 0.2 }
      );

    if (whoRef.current) {
      observer.observe(whoRef.current);
    }

    return () =>
      observer.disconnect();
  }, []);

  useEffect(() => {
    const observer =
      new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting)
            return;

          setObjectivesVisible(true);

          setTimeout(
            () =>
              setVisibleObjectives([
                true,
                false,
                false,
              ]),
            150
          );

          setTimeout(
            () =>
              setVisibleObjectives([
                true,
                true,
                false,
              ]),
            350
          );

          setTimeout(
            () =>
              setVisibleObjectives([
                true,
                true,
                true,
              ]),
            550
          );

          observer.disconnect();
        },
        { threshold: 0.15 }
      );

    if (objectivesRef.current) {
      observer.observe(
        objectivesRef.current
      );
    }

    return () =>
      observer.disconnect();
  }, []);

  return (
    <div className="bg-[#010714] text-white min-h-screen relative overflow-x-hidden selection:bg-cyan-500/30">
      <style>{pageFont}</style>

      <NeuralNetwork />

      {/* Hero Section */}
      <section className="relative z-10 pt-40 md:pt-48 pb-24 px-5 md:px-6 flex flex-col items-center">
        <div
          className="relative w-full max-w-5xl"
          onMouseEnter={() =>
            setHeroPaused(true)
          }
          onMouseLeave={() =>
            setHeroPaused(false)
          }
        >
          <button
            type="button"
            onClick={() =>
              changeHeroSlide("prev")
            }
            aria-label="Previous slide"
            className="absolute z-30 left-2 md:-left-16 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full border border-cyan-400/30 bg-[#071426]/80 backdrop-blur-xl text-cyan-400 flex items-center justify-center text-xl md:text-2xl transition-all duration-300 hover:bg-cyan-500/10 hover:border-cyan-400 hover:text-cyan-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.35)] active:scale-90"
          >
            ←
          </button>

          <button
            type="button"
            onClick={() =>
              changeHeroSlide("next")
            }
            aria-label="Next slide"
            className="absolute z-30 right-2 md:-right-16 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full border border-cyan-400/30 bg-[#071426]/80 backdrop-blur-xl text-cyan-400 flex items-center justify-center text-xl md:text-2xl transition-all duration-300 hover:bg-cyan-500/10 hover:border-cyan-400 hover:text-cyan-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.35)] active:scale-90"
          >
            →
          </button>

          <div
            className={`relative max-w-5xl w-full bg-[#0a1628]/70 backdrop-blur-3xl border border-white/10 p-8 sm:p-12 md:p-20 rounded-[2rem] md:rounded-[3rem] shadow-2xl transition-all duration-500 ease-in-out ${
              heroScanning
                ? "opacity-100 scale-100"
                : "opacity-0 scale-[0.985]"
            }`}
          >
            <div className="absolute top-0 left-0 w-full h-px bg-white/5 rounded-t-[3rem] overflow-hidden">
              <div
                className="h-full bg-cyan-500 shadow-[0_0_15px_#22d3ee] transition-all duration-[1600ms] ease-out"
                style={{
                  width: heroScanning
                    ? "100%"
                    : "0%",
                }}
              />
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-3 mb-8">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-pulse" />

                <span className="font-mono text-[9px] md:text-[10px] uppercase tracking-[0.35em] text-cyan-500/60">
                  Cyber Security Club // NIT Jalandhar
                </span>

                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-pulse" />
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight uppercase leading-[0.95] mb-8">
                {
                  heroContent[
                    activeCycle
                  ].title.split(" ")[0]
                }{" "}
                <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">
                  {heroContent[
                    activeCycle
                  ].title
                    .split(" ")
                    .slice(1)
                    .join(" ")}
                </span>
              </h1>

              <div className="w-full max-w-3xl min-h-[125px] md:min-h-[105px]">
                <TerminalBox
                  label={
                    heroContent[
                      activeCycle
                    ].terminal
                  }
                >
                  {
                    heroContent[
                      activeCycle
                    ].desc
                  }
                </TerminalBox>
              </div>

              <div className="flex gap-3 mb-8 mt-8">
                {[0, 1, 2].map(
                  (index) => (
                    <button
                      key={index}
                      type="button"
                      aria-label={`Go to slide ${
                        index + 1
                      }`}
                      onClick={() =>
                        goToHeroSlide(
                          index
                        )
                      }
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        activeCycle ===
                        index
                          ? "bg-cyan-400 w-10 shadow-[0_0_12px_#22d3ee]"
                          : "bg-gray-700 w-3 hover:bg-gray-500"
                      }`}
                    />
                  )
                )}
              </div>

              <div className="flex items-center gap-4 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.35em] text-cyan-500/50">
                <div className="h-px w-8 md:w-12 bg-current opacity-20" />

                {
                  heroContent[
                    activeCycle
                  ].status
                }

                <div className="h-px w-8 md:w-12 bg-current opacity-20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Are Section */}
      <section
        ref={whoRef}
        className="relative z-10 px-5 md:px-6 py-20 md:py-28 max-w-6xl mx-auto"
      >
        <div
          className={`transition-all duration-1000 ${
            whoVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <SectionHeader
            eyebrow="Identity Module // 001"
            title="Who"
            accent="We Are"
          />

          <div className="relative">
            <div className="absolute -inset-px rounded-[2rem] bg-gradient-to-r from-cyan-500/20 via-transparent to-cyan-500/10 blur-xl opacity-60" />

            <div className="relative bg-[#071426]/90 backdrop-blur-2xl border border-white/[0.07] rounded-[2rem] overflow-hidden">
              <div className="flex items-center justify-between px-6 md:px-8 py-4 border-b border-white/[0.06] bg-white/[0.015]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400/60" />
                  <span className="w-2 h-2 rounded-full bg-yellow-400/60" />
                  <span className="w-2 h-2 rounded-full bg-green-400/60" />
                </div>

                <span className="font-mono text-[8px] md:text-[9px] uppercase tracking-[0.3em] text-cyan-500/40">
                  csc_nitj // identity
                </span>
              </div>

              <div className="grid md:grid-cols-[0.8fr_1.2fr] gap-0">
                <div className="p-7 md:p-12 border-b md:border-b-0 md:border-r border-white/[0.06]">
                  <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-cyan-500/50">
                    ORGANIZATION
                  </span>

                  <h3 className="mt-4 text-2xl md:text-4xl font-black uppercase tracking-tight">
                    Cyber Security
                    <span className="block text-cyan-400">
                      Club NITJ
                    </span>
                  </h3>

                  <div className="mt-8 flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />

                    <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-cyan-500/60">
                      Student-led technical community
                    </span>
                  </div>
                </div>

                <div className="p-7 md:p-12">
                  <TerminalBox label="csc_nitj // organization">
                    The Cyber Security Club of NIT Jalandhar is a student-led technical community under the CSE Department, working under faculty guidance to promote cybersecurity awareness, digital safety, and practical security skills.
                  </TerminalBox>

                  <TerminalBox
                    label="csc_nitj // community"
                    className="mt-5"
                  >
                    The club provides a platform for students to explore cybersecurity beyond the classroom through hands-on learning, technical discussions, competitions, collaborative initiatives, and exposure to real-world security challenges.
                  </TerminalBox>

                  <div className="mt-8 pt-6 border-t border-white/[0.06] grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                      <span className="block font-mono text-[8px] uppercase tracking-[0.2em] text-gray-600">
                        Focus
                      </span>

                      <span className="block mt-2 text-xs text-cyan-400/80">
                        Cybersecurity
                      </span>
                    </div>

                    <div>
                      <span className="block font-mono text-[8px] uppercase tracking-[0.2em] text-gray-600">
                        Approach
                      </span>

                      <span className="block mt-2 text-xs text-cyan-400/80">
                        Hands-on
                      </span>
                    </div>

                    <div>
                      <span className="block font-mono text-[8px] uppercase tracking-[0.2em] text-gray-600">
                        Community
                      </span>

                      <span className="block mt-2 text-xs text-cyan-400/80">
                        NITJ
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Objectives Section */}
      <section
        id="objectives"
        ref={objectivesRef}
        className="relative z-10 px-5 md:px-6 py-20 md:py-28 max-w-7xl mx-auto"
      >
        <div
          className={`transition-all duration-1000 ${
            objectivesVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-5"
          }`}
        >
          <SectionHeader
            eyebrow="Core Directives // 002"
            title="Our"
            accent="Objectives"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <ObjectiveCard
            active={visibleObjectives[0]}
            id="001"
            title="Education"
            icon="01"
            desc="Build practical cybersecurity knowledge through technical sessions, workshops, guided learning, and exposure to real-world security concepts."
          />

          <ObjectiveCard
            active={visibleObjectives[1]}
            id="002"
            title="Awareness"
            icon="02"
            desc="Promote cybersecurity awareness, digital safety, and responsible online behaviour across the student community."
          />

          <ObjectiveCard
            active={visibleObjectives[2]}
            id="003"
            title="Innovation"
            icon="03"
            desc="Encourage experimentation, research, and collaborative problem-solving around emerging cybersecurity challenges and technologies."
          />
        </div>
      </section>

      <div className="relative z-10 h-20" />
    </div>
  );
};

export default AboutPage;