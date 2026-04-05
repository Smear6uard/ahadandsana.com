"use client";

import { motion } from "framer-motion";

const elegant = [0.25, 0.1, 0.25, 1] as const;
const smooth = [0.16, 1, 0.3, 1] as const;

const pathDraw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (delay: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: { delay, duration: 1.2, ease: elegant },
  }),
};

const dotReveal = {
  hidden: { scale: 0, opacity: 0 },
  visible: (delay: number) => ({
    scale: 1,
    opacity: 1,
    transition: { delay, duration: 0.4, ease: elegant },
  }),
};

/**
 * Ornamental flourish — mirrored calligraphic scrollwork with a center diamond.
 * More elaborate than the simple GoldDivider used between other sections.
 */
function OrnamentalFlourish({ baseDelay = 0 }: { baseDelay?: number }) {
  return (
    <motion.svg
      viewBox="0 0 400 32"
      className="mx-auto w-72 sm:w-80 md:w-96"
      fill="none"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
    >
      {/* Left extending line */}
      <motion.line
        x1="10"
        y1="16"
        x2="120"
        y2="16"
        stroke="#C9A96E"
        strokeWidth="0.5"
        custom={baseDelay}
        variants={pathDraw}
      />

      {/* Left scroll — an S-curve that curls inward */}
      <motion.path
        d="M120,16 C130,16 132,8 140,8 C148,8 148,16 155,16"
        stroke="#C9A96E"
        strokeWidth="0.7"
        fill="none"
        custom={baseDelay + 0.15}
        variants={pathDraw}
      />

      {/* Left inner curl */}
      <motion.path
        d="M134,8 C136,12 138,14 142,14"
        stroke="#C9A96E"
        strokeWidth="0.4"
        fill="none"
        custom={baseDelay + 0.3}
        variants={pathDraw}
      />

      {/* Left teardrop accent */}
      <motion.circle
        cx="155"
        cy="16"
        r="1.2"
        fill="#C9A96E"
        custom={baseDelay + 0.4}
        variants={dotReveal}
      />

      {/* Inner left line approaching diamond */}
      <motion.line
        x1="158"
        y1="16"
        x2="185"
        y2="16"
        stroke="#C9A96E"
        strokeWidth="0.5"
        custom={baseDelay + 0.2}
        variants={pathDraw}
      />

      {/* Center diamond — outer */}
      <motion.path
        d="M188,16 L200,5 L212,16 L200,27 Z"
        stroke="#C9A96E"
        strokeWidth="0.7"
        custom={baseDelay + 0.35}
        variants={pathDraw}
      />

      {/* Center diamond — inner */}
      <motion.path
        d="M193,16 L200,9 L207,16 L200,23 Z"
        stroke="#C9A96E"
        strokeWidth="0.4"
        custom={baseDelay + 0.5}
        variants={pathDraw}
      />

      {/* Center jewel dot */}
      <motion.circle
        cx="200"
        cy="16"
        r="1.5"
        fill="#C9A96E"
        custom={baseDelay + 0.6}
        variants={dotReveal}
      />

      {/* Inner right line departing diamond */}
      <motion.line
        x1="215"
        y1="16"
        x2="242"
        y2="16"
        stroke="#C9A96E"
        strokeWidth="0.5"
        custom={baseDelay + 0.2}
        variants={pathDraw}
      />

      {/* Right teardrop accent */}
      <motion.circle
        cx="245"
        cy="16"
        r="1.2"
        fill="#C9A96E"
        custom={baseDelay + 0.4}
        variants={dotReveal}
      />

      {/* Right scroll — mirrored S-curve */}
      <motion.path
        d="M245,16 C252,16 252,8 260,8 C268,8 270,16 280,16"
        stroke="#C9A96E"
        strokeWidth="0.7"
        fill="none"
        custom={baseDelay + 0.15}
        variants={pathDraw}
      />

      {/* Right inner curl */}
      <motion.path
        d="M258,14 C262,14 264,12 266,8"
        stroke="#C9A96E"
        strokeWidth="0.4"
        fill="none"
        custom={baseDelay + 0.3}
        variants={pathDraw}
      />

      {/* Right extending line */}
      <motion.line
        x1="280"
        y1="16"
        x2="390"
        y2="16"
        stroke="#C9A96E"
        strokeWidth="0.5"
        custom={baseDelay}
        variants={pathDraw}
      />
    </motion.svg>
  );
}

export default function DateBanner() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="relative py-28 sm:py-32 md:py-36 lg:py-40 px-6"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, #345A4C 0%, #2D4A3E 40%, #263F34 100%)",
        }}
      >
        {/* Subtle grain texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundRepeat: "repeat",
            backgroundSize: "200px 200px",
          }}
        />

        <div className="relative mx-auto max-w-3xl text-center">
          {/* Top ornamental flourish */}
          <OrnamentalFlourish baseDelay={0} />

          {/* Main text */}
          <motion.p
            className="mt-10 md:mt-12 font-display italic text-gold text-[40px] sm:text-[48px] md:text-[56px] lg:text-[64px] leading-[1.1] tracking-[0.08em]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.4, duration: 0.9, ease: smooth }}
          >
            Summer 2026
          </motion.p>

          {/* Gold dot separator */}
          <motion.div
            className="flex items-center justify-center gap-4 my-4 md:my-5"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.6, duration: 0.6, ease: elegant }}
          >
            <div className="w-8 h-px bg-gold/40" />
            <div className="w-1.5 h-1.5 rounded-full bg-gold/60" />
            <div className="w-8 h-px bg-gold/40" />
          </motion.div>

          {/* City name — slightly smaller, letter-spaced */}
          <motion.p
            className="font-display italic text-gold/80 text-2xl sm:text-3xl md:text-[34px] tracking-[0.15em]"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.7, duration: 0.8, ease: smooth }}
          >
            Chicago
          </motion.p>

          {/* Bottom ornamental flourish */}
          <div className="mt-10 md:mt-12">
            <OrnamentalFlourish baseDelay={0.3} />
          </div>
        </div>
      </div>
    </section>
  );
}
