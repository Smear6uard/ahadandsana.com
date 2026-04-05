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

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.7, ease: elegant },
  }),
};

const hotels = [
  {
    name: "The Westin Chicago North Shore",
    area: "Wheeling, IL",
    note: "Minutes from the Mehndi venue. Perfect for guests attending both events.",
    link: "https://maps.google.com/?q=The+Westin+Chicago+North+Shore+Wheeling+IL",
  },
  {
    name: "The Palmer House Hilton",
    area: "Downtown Chicago",
    note: "A historic landmark hotel steps from the Shadi venue on Michigan Avenue.",
    link: "https://maps.google.com/?q=Palmer+House+Hilton+Chicago+IL",
  },
  {
    name: "Hotel Chicago Downtown",
    area: "River North, Chicago",
    note: "Contemporary style in the heart of the city with easy access to both venues.",
    link: "https://maps.google.com/?q=Hotel+Chicago+Downtown+Autograph+Collection",
  },
];

export default function Accommodation() {
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
            For Our Guests
          </motion.p>
          <motion.h2
            className="heading-caps text-3xl md:text-4xl lg:text-5xl text-charcoal"
            variants={headingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
          >
            Travel &amp; Stay
          </motion.h2>
          <motion.p
            className="mt-4 font-body text-charcoal-light text-sm md:text-base max-w-xl mx-auto"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.2, duration: 0.6, ease: elegant }}
          >
            For our out-of-town guests, here are some recommended hotels near
            our celebration venues.
          </motion.p>
        </div>

        {/* Hotel Cards */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {hotels.map((hotel, i) => (
            <motion.div
              key={hotel.name}
              className="bg-ivory-warm rounded-2xl border border-gold/10 p-8 text-center"
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              whileHover={{
                y: -6,
                boxShadow: "0 16px 48px rgba(201, 169, 110, 0.1)",
                transition: { duration: 0.3, ease: elegant },
              }}
            >
              <p className="label-caps text-gold mb-3">{hotel.area}</p>
              <h3 className="font-display text-xl text-charcoal leading-snug">
                {hotel.name}
              </h3>
              <p className="font-body text-sm text-charcoal-light mt-3 leading-relaxed">
                {hotel.note}
              </p>
              <a
                href={hotel.link}
                target="_blank"
                rel="noopener noreferrer"
                className="link-gold inline-block mt-5 font-body text-sm font-medium"
              >
                View Location →
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
