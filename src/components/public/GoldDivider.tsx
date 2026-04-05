"use client";

import { motion } from "framer-motion";

const elegant = [0.25, 0.1, 0.25, 1] as const;

export default function GoldDivider({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`flex items-center justify-center py-12 ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
    >
      <svg
        viewBox="0 0 400 24"
        className="w-full max-w-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left line */}
        <motion.line
          x1="20"
          y1="12"
          x2="170"
          y2="12"
          stroke="#C9A96E"
          strokeWidth="0.5"
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            visible: {
              pathLength: 1,
              opacity: 1,
              transition: { duration: 1, ease: elegant },
            },
          }}
        />

        {/* Center diamond — outer */}
        <motion.path
          d="M188,12 L200,3 L212,12 L200,21 Z"
          stroke="#C9A96E"
          strokeWidth="0.6"
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            visible: {
              pathLength: 1,
              opacity: 1,
              transition: { duration: 0.8, delay: 0.3, ease: elegant },
            },
          }}
        />

        {/* Center diamond — inner */}
        <motion.path
          d="M193,12 L200,6.5 L207,12 L200,17.5 Z"
          stroke="#C9A96E"
          strokeWidth="0.4"
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            visible: {
              pathLength: 1,
              opacity: 1,
              transition: { duration: 0.6, delay: 0.5, ease: elegant },
            },
          }}
        />

        {/* Small dot at center */}
        <motion.circle
          cx="200"
          cy="12"
          r="1.2"
          fill="#C9A96E"
          variants={{
            hidden: { scale: 0, opacity: 0 },
            visible: {
              scale: 1,
              opacity: 1,
              transition: { duration: 0.4, delay: 0.7, ease: elegant },
            },
          }}
        />

        {/* Left curls */}
        <motion.path
          d="M172,12 Q178,6 184,12 Q178,18 172,12"
          stroke="#C9A96E"
          strokeWidth="0.4"
          fill="none"
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            visible: {
              pathLength: 1,
              opacity: 1,
              transition: { duration: 0.6, delay: 0.2, ease: elegant },
            },
          }}
        />

        {/* Right curls */}
        <motion.path
          d="M228,12 Q222,6 216,12 Q222,18 228,12"
          stroke="#C9A96E"
          strokeWidth="0.4"
          fill="none"
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            visible: {
              pathLength: 1,
              opacity: 1,
              transition: { duration: 0.6, delay: 0.2, ease: elegant },
            },
          }}
        />

        {/* Right line */}
        <motion.line
          x1="230"
          y1="12"
          x2="380"
          y2="12"
          stroke="#C9A96E"
          strokeWidth="0.5"
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            visible: {
              pathLength: 1,
              opacity: 1,
              transition: { duration: 1, ease: elegant },
            },
          }}
        />
      </svg>
    </motion.div>
  );
}
