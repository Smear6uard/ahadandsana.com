"use client";

import { motion, type Variants } from "framer-motion";
import { type ReactNode } from "react";

const elegant = [0.25, 0.1, 0.25, 1] as const;

interface ArchCardProps {
  children: ReactNode;
  className?: string;
  bgColor?: string;
  direction?: "left" | "right";
  delay?: number;
}

const cardVariants: Variants = {
  hidden: (direction: "left" | "right") => ({
    opacity: 0,
    x: direction === "left" ? -60 : 60,
  }),
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.9,
      ease: elegant,
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

const childVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: elegant },
  },
};

export default function ArchCard({
  children,
  className = "",
  bgColor = "bg-ivory-warm",
  direction = "left",
  delay = 0,
}: ArchCardProps) {
  return (
    <motion.div
      className={`relative overflow-hidden rounded-t-[120px] rounded-b-2xl border border-gold/15 ${bgColor} ${className}`}
      custom={direction}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay }}
      whileHover={{
        y: -8,
        boxShadow: "0 20px 60px rgba(201, 169, 110, 0.15)",
        transition: { duration: 0.4, ease: elegant },
      }}
    >
      {children}
    </motion.div>
  );
}

export { childVariants };
