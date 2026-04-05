"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState } from "react";

const elegant = [0.25, 0.1, 0.25, 1] as const;
const smooth = [0.16, 1, 0.3, 1] as const;

type InvitationStatus = "invited" | "attending" | "declined";

interface Invitation {
  invitation_id: number;
  event_name: string;
  event_date: string;
  status: InvitationStatus;
}

interface Guest {
  guest_id: number;
  name: string;
  invitations: Invitation[];
}

interface Party {
  party_id: number;
  party_name: string;
  guests: Guest[];
}

type RSVPState =
  | "idle"
  | "searching"
  | "select-party"
  | "results"
  | "not-found"
  | "submitting"
  | "success"
  | "error";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
  transition: { duration: 0.4, ease: elegant },
};

const headingVariants = {
  hidden: { opacity: 0, y: 30, letterSpacing: "0.3em" },
  visible: {
    opacity: 1,
    y: 0,
    letterSpacing: "0.2em",
    transition: { duration: 0.9, ease: elegant },
  },
};

function LoadingDots() {
  return (
    <div className="loading-dots flex justify-center py-8">
      <span />
      <span />
      <span />
    </div>
  );
}

function SuccessCheck() {
  return (
    <svg viewBox="0 0 40 40" className="w-16 h-16 mx-auto">
      <circle cx="20" cy="20" r="18" stroke="#C9A96E" strokeWidth="1.5" fill="none" />
      <path
        d="M12 20 L18 26 L28 14"
        stroke="#C9A96E"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="24"
        strokeDashoffset="0"
        style={{ animation: "checkmark-draw 0.6s ease forwards" }}
      />
    </svg>
  );
}

export default function RSVPSection() {
  const [searchName, setSearchName] = useState("");
  const [state, setState] = useState<RSVPState>("idle");
  const [parties, setParties] = useState<Party[]>([]);
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [responses, setResponses] = useState<
    Record<number, InvitationStatus>
  >({});
  const [errorMessage, setErrorMessage] = useState("");

  const handleSearch = useCallback(async () => {
    if (searchName.trim().length < 2) return;
    setState("searching");
    setErrorMessage("");

    try {
      const res = await fetch(
        `/api/rsvp/lookup?name=${encodeURIComponent(searchName.trim())}`
      );
      if (!res.ok) throw new Error("Search failed");
      const data: Party[] = await res.json();

      if (data.length === 0) {
        setState("not-found");
      } else if (data.length === 1) {
        selectParty(data[0]);
      } else {
        setParties(data);
        setState("select-party");
      }
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setState("error");
    }
  }, [searchName]);

  function selectParty(party: Party) {
    setSelectedParty(party);
    const initial: Record<number, InvitationStatus> = {};
    for (const guest of party.guests) {
      for (const inv of guest.invitations) {
        initial[inv.invitation_id] = inv.status === "invited" ? "attending" : inv.status;
      }
    }
    setResponses(initial);
    setState("results");
  }

  const handleSubmit = useCallback(async () => {
    if (!selectedParty) return;
    setState("submitting");

    try {
      const res = await fetch("/api/rsvp/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          party_id: selectedParty.party_id,
          responses: Object.entries(responses).map(
            ([invitation_id, status]) => ({
              invitation_id: Number(invitation_id),
              status,
            })
          ),
        }),
      });
      if (!res.ok) throw new Error("Submit failed");
      setState("success");
    } catch {
      setErrorMessage("Failed to submit your RSVP. Please try again.");
      setState("error");
    }
  }, [selectedParty, responses]);

  function reset() {
    setSearchName("");
    setState("idle");
    setParties([]);
    setSelectedParty(null);
    setResponses({});
    setErrorMessage("");
  }

  return (
    <section className="py-24 md:py-32 px-6 bg-blush/60">
      <div className="mx-auto max-w-2xl">
        {/* Section Heading */}
        <div className="text-center mb-12 md:mb-16">
          <motion.h2
            className="heading-caps text-3xl md:text-4xl lg:text-5xl text-charcoal"
            variants={headingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
          >
            Kindly Respond
          </motion.h2>
          <motion.p
            className="mt-4 font-body text-charcoal-light text-sm md:text-base"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.2, duration: 0.6, ease: elegant }}
          >
            Please search for your name to RSVP
          </motion.p>
        </div>

        {/* RSVP Flow */}
        <AnimatePresence mode="wait">
          {/* IDLE / SEARCH */}
          {(state === "idle" || state === "searching") && (
            <motion.div key="search" {...fadeUp} className="text-center">
              <div className="max-w-md mx-auto">
                <input
                  type="text"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Enter your last name"
                  className="input-elegant text-center text-lg"
                  disabled={state === "searching"}
                />
                {state === "searching" ? (
                  <LoadingDots />
                ) : (
                  <button
                    onClick={handleSearch}
                    disabled={searchName.trim().length < 2}
                    className="btn-gold mt-8 px-10 py-3.5 rounded-full text-sm tracking-wider disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Find Your Invitation
                  </button>
                )}
              </div>
              <p className="mt-8 text-stone-warm text-xs tracking-wide">
                Please RSVP by June 15, 2026
              </p>
            </motion.div>
          )}

          {/* PARTY SELECTION (multiple matches) */}
          {state === "select-party" && (
            <motion.div key="select-party" {...fadeUp} className="text-center">
              <p className="font-body text-charcoal-light mb-6">
                We found multiple parties. Please select yours:
              </p>
              <div className="space-y-3 max-w-md mx-auto">
                {parties.map((party) => (
                  <button
                    key={party.party_id}
                    onClick={() => selectParty(party)}
                    className="w-full px-6 py-4 bg-ivory-warm rounded-xl border border-gold/15 font-display text-lg text-charcoal hover:border-gold/40 hover:shadow-md transition-all duration-300"
                  >
                    {party.party_name}
                    <span className="block font-body text-xs text-stone-warm mt-1">
                      {party.guests.map((g) => g.name).join(", ")}
                    </span>
                  </button>
                ))}
              </div>
              <button
                onClick={reset}
                className="mt-6 link-gold text-sm font-body"
              >
                ← Search again
              </button>
            </motion.div>
          )}

          {/* RESULTS */}
          {(state === "results" || state === "submitting") &&
            selectedParty && (
              <motion.div key="results" {...fadeUp}>
                <div className="bg-ivory-warm rounded-2xl border border-gold/15 p-6 md:p-10">
                  <h3 className="font-display text-2xl text-charcoal text-center mb-8">
                    {selectedParty.party_name}
                  </h3>

                  <div className="space-y-8">
                    {selectedParty.guests.map((guest, gi) => (
                      <motion.div
                        key={guest.guest_id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: gi * 0.15,
                          duration: 0.5,
                          ease: smooth,
                        }}
                      >
                        <p className="font-display text-xl text-charcoal mb-4">
                          {guest.name}
                        </p>

                        <div className="space-y-3 ml-1">
                          {guest.invitations.map((inv) => (
                            <div
                              key={inv.invitation_id}
                              className="flex items-center justify-between gap-4 py-2 border-b border-gold/10 last:border-0"
                            >
                              <span className="font-body text-sm text-charcoal-light">
                                {inv.event_name}
                              </span>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setResponses((prev) => ({
                                      ...prev,
                                      [inv.invitation_id]: "attending",
                                    }))
                                  }
                                  className={`px-4 py-1.5 rounded-full text-xs font-body font-medium tracking-wide transition-all duration-300 ${
                                    responses[inv.invitation_id] === "attending"
                                      ? "bg-forest text-white shadow-sm"
                                      : "bg-transparent border border-forest/20 text-forest/60 hover:border-forest/40"
                                  }`}
                                  disabled={state === "submitting"}
                                >
                                  Joyfully Accept
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setResponses((prev) => ({
                                      ...prev,
                                      [inv.invitation_id]: "declined",
                                    }))
                                  }
                                  className={`px-4 py-1.5 rounded-full text-xs font-body font-medium tracking-wide transition-all duration-300 ${
                                    responses[inv.invitation_id] === "declined"
                                      ? "bg-charcoal-light text-white shadow-sm"
                                      : "bg-transparent border border-charcoal/15 text-charcoal-light/60 hover:border-charcoal/30"
                                  }`}
                                  disabled={state === "submitting"}
                                >
                                  Regretfully Decline
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-10 text-center">
                    {state === "submitting" ? (
                      <LoadingDots />
                    ) : (
                      <button
                        onClick={handleSubmit}
                        className="btn-gold px-12 py-3.5 rounded-full text-sm tracking-wider"
                      >
                        Confirm RSVP
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-center mt-4">
                  <button
                    onClick={reset}
                    className="link-gold text-sm font-body"
                    disabled={state === "submitting"}
                  >
                    ← Search again
                  </button>
                </div>
              </motion.div>
            )}

          {/* NOT FOUND */}
          {state === "not-found" && (
            <motion.div key="not-found" {...fadeUp} className="text-center">
              <p className="font-display text-xl text-charcoal mb-2">
                No invitation found
              </p>
              <p className="font-body text-sm text-charcoal-light mb-6">
                We couldn&apos;t find an invitation for &ldquo;{searchName}
                &rdquo;. Please check the spelling or contact the couple.
              </p>
              <button onClick={reset} className="link-gold text-sm font-body">
                ← Try again
              </button>
            </motion.div>
          )}

          {/* SUCCESS */}
          {state === "success" && (
            <motion.div key="success" {...fadeUp} className="text-center">
              <SuccessCheck />
              <motion.p
                className="font-display text-2xl md:text-3xl text-charcoal mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                Thank you!
              </motion.p>
              <motion.p
                className="font-body text-sm text-charcoal-light mt-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                Your response has been recorded.
              </motion.p>
              <motion.div
                className="mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <GoldFlourish />
              </motion.div>
              <motion.button
                onClick={reset}
                className="link-gold text-sm font-body mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
              >
                RSVP for another guest
              </motion.button>
            </motion.div>
          )}

          {/* ERROR */}
          {state === "error" && (
            <motion.div key="error" {...fadeUp} className="text-center">
              <p className="font-display text-xl text-charcoal mb-2">
                Something went wrong
              </p>
              <p className="font-body text-sm text-charcoal-light mb-6">
                {errorMessage}
              </p>
              <button onClick={reset} className="link-gold text-sm font-body">
                ← Try again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

/* Small inline flourish for success state */
function GoldFlourish() {
  return (
    <svg
      viewBox="0 0 120 8"
      className="mx-auto w-24"
      fill="none"
    >
      <line x1="4" y1="4" x2="48" y2="4" stroke="#C9A96E" strokeWidth="0.5" />
      <path d="M54,4 L60,0.5 L66,4 L60,7.5 Z" stroke="#C9A96E" strokeWidth="0.5" />
      <line x1="72" y1="4" x2="116" y2="4" stroke="#C9A96E" strokeWidth="0.5" />
    </svg>
  );
}
