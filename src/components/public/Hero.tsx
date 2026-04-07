"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const elegant = [0.25, 0.1, 0.25, 1] as const;
const smooth = [0.16, 1, 0.3, 1] as const;

function GoldFlourish({ delay }: { delay: number }) {
  return (
    <motion.svg
      viewBox="0 0 200 12"
      className="mx-auto w-48 md:w-56"
      fill="none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.6, ease: elegant }}
    >
      <motion.line
        x1="10"
        y1="6"
        x2="80"
        y2="6"
        stroke="#C9A96E"
        strokeWidth="0.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay, duration: 0.8, ease: elegant }}
      />
      <motion.path
        d="M90,6 L100,1 L110,6 L100,11 Z"
        stroke="#C9A96E"
        strokeWidth="0.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: delay + 0.2, duration: 0.5, ease: elegant }}
      />
      <motion.line
        x1="120"
        y1="6"
        x2="190"
        y2="6"
        stroke="#C9A96E"
        strokeWidth="0.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay, duration: 0.8, ease: elegant }}
      />
    </motion.svg>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const photoY = useTransform(scrollY, [0, 600], [0, -90]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      <div className="mx-auto w-full max-w-7xl px-6 py-20 md:py-0">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16 lg:gap-24">
          {/* Photo — Arch Frame */}
          <motion.div
            className="relative w-full max-w-sm md:max-w-md lg:max-w-lg flex-shrink-0"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 1, ease: elegant }}
          >
            <motion.div
              className="arch-frame relative aspect-[3/4] border-2 border-gold/30 shadow-lg"
              style={{ y: photoY }}
            >
              <Image
                src="/herowedding.jpg"
                alt="Ahad and Sana"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            </motion.div>
            {/* Gold corner accents */}
            <div className="absolute -bottom-3 -right-3 h-16 w-16 border-b-2 border-r-2 border-gold/25 rounded-br-xl pointer-events-none" />
            <div className="absolute -top-3 -left-3 h-16 w-16 border-t-2 border-l-2 border-gold/25 rounded-tl-xl pointer-events-none" />
          </motion.div>

          {/* Text Content */}
          <div className="flex flex-col items-center text-center flex-1 max-w-xl mx-auto">
            {/* Top flourish */}
            <GoldFlourish delay={0.6} />

            {/* Bismillah */}
            <motion.p
              dir="rtl"
              lang="ar"
              className="mt-6 text-gold text-lg md:text-xl"
              style={{ fontFamily: "var(--font-arabic)" }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8, ease: smooth }}
            >
              بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
            </motion.p>

            {/* Parents of the bride */}
            <motion.p
              className="mt-6 font-display text-[15px] md:text-[16px] text-charcoal-light tracking-[0.1em]"
              style={{ fontVariant: "small-caps", textTransform: "lowercase" }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.7, ease: smooth }}
            >
              Mr. Amer Akhtar &amp; Mrs. Nabila Akhtar
            </motion.p>

            {/* Invitation line */}
            <motion.p
              className="mt-2 font-display text-[13px] md:text-[14px] text-stone-warm tracking-wide"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.95, duration: 0.7, ease: smooth }}
            >
              kindly invite you to celebrate the wedding of their daughter
            </motion.p>

            {/* Couple's Names — Sana first */}
            <div className="mt-6 md:mt-8">
              <motion.h1
                className="font-script text-6xl sm:text-7xl md:text-8xl lg:text-[100px] leading-[0.95] text-charcoal font-normal"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1, duration: 0.8, ease: smooth }}
              >
                Sana
              </motion.h1>

              <motion.span
                className="block font-script text-4xl sm:text-[2.7rem] md:text-5xl lg:text-[60px] text-gold my-1 md:my-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.4, duration: 0.5, ease: elegant }}
              >
                &amp;
              </motion.span>

              <motion.h1
                className="font-script text-6xl sm:text-7xl md:text-8xl lg:text-[100px] leading-[0.95] text-charcoal font-normal"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.6, duration: 0.8, ease: smooth }}
              >
                Ahad
              </motion.h1>

              {/* Parents of the groom */}
              <motion.p
                className="mt-3 font-display text-[11px] md:text-[12px] text-charcoal-light tracking-[0.1em]"
                style={{ fontVariant: "small-caps", textTransform: "lowercase" }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8, duration: 0.7, ease: smooth }}
              >
                Son of Mr. Mohammed Baqi &amp; Ms. Ruqia Ali
              </motion.p>
            </div>

            {/* Bottom flourish */}
            <motion.div className="mt-6 md:mt-8">
              <GoldFlourish delay={2.2} />
            </motion.div>

            {/* RSVP Button */}
            <motion.a
              href="#rsvp"
              className="mt-8 md:mt-10 inline-block bg-charcoal text-ivory px-8 py-3 text-[11px] font-medium tracking-[0.25em] uppercase transition-all duration-300 hover:bg-charcoal-light hover:shadow-lg hover:shadow-charcoal/10 hover:-translate-y-0.5 active:translate-y-0"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.6, duration: 0.7, ease: smooth }}
            >
              RSVP
            </motion.a>

          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: scrolled ? 0 : 1 }}
        transition={{ delay: scrolled ? 0 : 3.2, duration: 0.5 }}
      >
        <span className="label-caps text-[10px] text-stone-warm tracking-[0.25em]">
          Scroll
        </span>
        <div className="scroll-indicator-line" />
      </motion.div>
    </section>
  );
}
