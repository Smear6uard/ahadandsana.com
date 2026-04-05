"use client";

import { motion } from "framer-motion";

const elegant = [0.25, 0.1, 0.25, 1] as const;

const headingVariants = {
  hidden: { opacity: 0, y: 30, letterSpacing: "0.3em" },
  visible: {
    opacity: 1,
    y: 0,
    letterSpacing: "0.2em",
    transition: { duration: 0.9, ease: elegant },
  },
};

function MiniDivider() {
  return (
    <svg
      viewBox="0 0 200 12"
      className="mx-auto w-32"
      fill="none"
    >
      <line x1="10" y1="6" x2="80" y2="6" stroke="#C9A96E" strokeWidth="0.5" />
      <path d="M90,6 L100,1 L110,6 L100,11 Z" stroke="#C9A96E" strokeWidth="0.5" />
      <line x1="120" y1="6" x2="190" y2="6" stroke="#C9A96E" strokeWidth="0.5" />
    </svg>
  );
}

export default function Details() {
  return (
    <section className="py-24 md:py-32 px-6">
      <div className="mx-auto max-w-2xl text-center">
        <motion.h2
          className="heading-caps text-3xl md:text-4xl lg:text-5xl text-charcoal"
          variants={headingVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          Details
        </motion.h2>

        <motion.div
          className="mt-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.3, duration: 0.8, ease: elegant }}
        >
          <MiniDivider />
        </motion.div>

        <motion.p
          className="mt-10 font-display text-lg md:text-xl text-charcoal-light leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.4, duration: 0.7, ease: elegant }}
        >
          More details coming soon — including parking information, dress code,
          and accommodation recommendations.
        </motion.p>

        <motion.div
          className="mt-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.6, duration: 0.8, ease: elegant }}
        >
          <MiniDivider />
        </motion.div>
      </div>
    </section>
  );
}
