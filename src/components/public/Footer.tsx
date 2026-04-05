"use client";

import { motion } from "framer-motion";

const elegant = [0.25, 0.1, 0.25, 1] as const;

export default function Footer() {
  return (
    <footer className="py-20 md:py-28 px-6">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8, ease: elegant }}
      >
        {/* Heart */}
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 mx-auto mb-5"
          fill="none"
          stroke="#C9A96E"
          strokeWidth="1.2"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>

        <p className="font-display italic text-2xl md:text-3xl text-charcoal">
          Ahad &amp; Sana
        </p>
        <p className="label-caps text-stone-warm mt-3 text-[10px] tracking-[0.2em]">
          July 2026
        </p>
      </motion.div>
    </footer>
  );
}
