"use client";

import { motion } from "framer-motion";
import ArchCard, { childVariants } from "./ArchCard";

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

/* Small decorative icons rendered as SVG */
function MehndiIcon() {
  return (
    <svg viewBox="0 0 40 40" className="w-10 h-10 mx-auto" fill="none">
      <path
        d="M20 4C20 4 10 14 10 22C10 28 14 34 20 36C26 34 30 28 30 22C30 14 20 4 20 4Z"
        stroke="#C9A96E"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M20 10C20 10 15 17 15 22C15 26 17 30 20 32C23 30 25 26 25 22C25 17 20 10 20 10Z"
        stroke="#C9A96E"
        strokeWidth="0.6"
        fill="none"
      />
      <circle cx="20" cy="22" r="2" fill="#C9A96E" opacity="0.4" />
    </svg>
  );
}

function ShadiIcon() {
  return (
    <svg viewBox="0 0 40 40" className="w-10 h-10 mx-auto" fill="none">
      <path
        d="M6 28 Q6 10 20 6 Q34 10 34 28"
        stroke="#C9A96E"
        strokeWidth="1"
        fill="none"
      />
      <line x1="6" y1="28" x2="34" y2="28" stroke="#C9A96E" strokeWidth="1" />
      <path
        d="M12 28 Q12 16 20 12 Q28 16 28 28"
        stroke="#C9A96E"
        strokeWidth="0.6"
        fill="none"
      />
      <circle cx="20" cy="18" r="1.5" fill="#C9A96E" opacity="0.4" />
    </svg>
  );
}

interface EventInfo {
  icon: React.ReactNode;
  title: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  mapsUrl: string;
  bgColor: string;
  direction: "left" | "right";
  adultsOnly?: boolean;
}

const eventData: EventInfo[] = [
  {
    icon: <MehndiIcon />,
    title: "Mehndi",
    date: "Thursday, July 16, 2026",
    time: "6:30 PM",
    venue: "The Canvas Venue",
    address: "97 East Marquardt Drive, Wheeling, IL 60090",
    mapsUrl:
      "https://maps.google.com/?q=97+East+Marquardt+Drive+Wheeling+IL+60090",
    bgColor: "bg-blush/40",
    direction: "left",
  },
  {
    icon: <ShadiIcon />,
    title: "Shadi",
    date: "Friday, July 17, 2026",
    time: "7:00 PM",
    venue: "Chicago Cultural Center",
    address: "78 East Washington Street, Chicago, IL 60602",
    mapsUrl:
      "https://maps.google.com/?q=78+East+Washington+Street+Chicago+IL+60602",
    bgColor: "bg-ivory-warm",
    direction: "right",
    adultsOnly: true,
  },
];

export default function Events() {
  return (
    <section className="py-24 md:py-32 px-6">
      <div className="mx-auto max-w-5xl">
        {/* Section Heading */}
        <div className="text-center mb-16 md:mb-20">
          <motion.p
            className="label-caps text-gold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: elegant }}
          >
            Celebrations
          </motion.p>
          <motion.h2
            className="heading-caps text-3xl md:text-4xl lg:text-5xl text-charcoal"
            variants={headingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
          >
            The Events
          </motion.h2>
        </div>

        {/* Event Cards */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {eventData.map((event, i) => (
            <ArchCard
              key={event.title}
              bgColor={event.bgColor}
              direction={event.direction}
              delay={i * 0.2}
              className="px-8 py-12 md:px-10 md:py-16"
            >
              <div className="flex flex-col items-center text-center">
                <motion.div variants={childVariants}>
                  {event.icon}
                </motion.div>

                <motion.h3
                  className="heading-caps text-2xl md:text-3xl text-charcoal mt-6"
                  variants={childVariants}
                >
                  {event.title}
                </motion.h3>

                <motion.div
                  className="w-12 h-px bg-gold/30 my-6"
                  variants={childVariants}
                />

                <motion.div className="space-y-5 w-full" variants={childVariants}>
                  <div>
                    <p className="label-caps mb-1">Date</p>
                    <p className="font-display text-lg text-charcoal">
                      {event.date}
                    </p>
                  </div>

                  <div>
                    <p className="label-caps mb-1">Time</p>
                    <p className="font-display text-lg text-charcoal">
                      {event.time}
                    </p>
                  </div>

                  <div>
                    <p className="label-caps mb-1">Venue</p>
                    <p className="font-display text-lg text-charcoal">
                      {event.venue}
                    </p>
                  </div>

                  <div>
                    <p className="label-caps mb-1">Address</p>
                    <p className="font-body text-sm text-charcoal-light leading-relaxed">
                      {event.address}
                    </p>
                  </div>
                </motion.div>

                {event.adultsOnly && (
                  <motion.p
                    className="mt-6 font-display text-sm italic text-gold/80 tracking-wide"
                    variants={childVariants}
                  >
                    Mr. &amp; Mrs. Only
                  </motion.p>
                )}

                <motion.a
                  href={event.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-gold mt-8 font-body text-sm font-medium tracking-wide"
                  variants={childVariants}
                >
                  View on Map →
                </motion.a>
              </div>
            </ArchCard>
          ))}
        </div>
      </div>
    </section>
  );
}
