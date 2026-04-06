"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";

const elegant = [0.25, 0.1, 0.25, 1] as const;
const smooth = [0.16, 1, 0.3, 1] as const;

type InvitationStatus = "invited" | "attending" | "declined";

interface Invitation {
  invitation_id: number;
  event_id: number;
  event_name: string;
  event_date: string;
  event_time: string;
  venue_name: string;
  venue_address: string;
  google_maps_url: string;
  status: InvitationStatus;
}

interface Guest {
  guest_id: number;
  name: string;
  invitations: Invitation[];
}

interface Party {
  party_id: number;
  guests: Guest[];
}

type RSVPState =
  | "idle"
  | "searching"
  | "select-party"
  | "event-rsvp"
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

/** Get the unique events across all guests in the party, ordered by event date */
function getPartyEvents(party: Party) {
  const eventMap = new Map<
    number,
    { event_id: number; event_name: string; event_date: string; event_time: string; venue_name: string; venue_address: string; google_maps_url: string }
  >();
  for (const guest of party.guests) {
    for (const inv of guest.invitations) {
      if (!eventMap.has(inv.event_id)) {
        eventMap.set(inv.event_id, {
          event_id: inv.event_id,
          event_name: inv.event_name,
          event_date: inv.event_date,
          event_time: inv.event_time,
          venue_name: inv.venue_name,
          venue_address: inv.venue_address,
          google_maps_url: inv.google_maps_url,
        });
      }
    }
  }
  return Array.from(eventMap.values()).sort((a, b) =>
    a.event_date.localeCompare(b.event_date),
  );
}

/** Get guests who are invited to a specific event */
function getGuestsForEvent(party: Party, eventId: number) {
  return party.guests.filter((g) =>
    g.invitations.some((inv) => inv.event_id === eventId),
  );
}

/** Format a date string like "2026-07-16" to "Thursday, July 16, 2026" */
function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function RSVPSection() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [state, setState] = useState<RSVPState>("idle");
  const [parties, setParties] = useState<Party[]>([]);
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [responses, setResponses] = useState<
    Record<number, InvitationStatus>
  >({});
  const [errorMessage, setErrorMessage] = useState("");

  const partyEvents = useMemo(
    () => (selectedParty ? getPartyEvents(selectedParty) : []),
    [selectedParty],
  );

  const handleSearch = useCallback(async () => {
    if (firstName.trim().length < 1 && lastName.trim().length < 1) return;
    setState("searching");
    setErrorMessage("");

    try {
      const params = new URLSearchParams({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      });
      const res = await fetch(`/api/rsvp/lookup?${params}`);
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
  }, [firstName, lastName]);

  function selectParty(party: Party) {
    setSelectedParty(party);
    setCurrentEventIndex(0);
    const initial: Record<number, InvitationStatus> = {};
    for (const guest of party.guests) {
      for (const inv of guest.invitations) {
        if (inv.status !== "invited") {
          initial[inv.invitation_id] = inv.status;
        }
      }
    }
    setResponses(initial);
    setState("event-rsvp");
  }

  function handleNextEvent() {
    if (currentEventIndex < partyEvents.length - 1) {
      setCurrentEventIndex((i) => i + 1);
    } else {
      handleSubmit();
    }
  }

  const allCurrentEventResponded = useMemo(() => {
    if (!selectedParty || partyEvents.length === 0) return false;
    const currentEvent = partyEvents[currentEventIndex];
    if (!currentEvent) return false;
    const eventGuests = getGuestsForEvent(selectedParty, currentEvent.event_id);
    return eventGuests.every((guest) => {
      const inv = guest.invitations.find(
        (i) => i.event_id === currentEvent.event_id,
      );
      return inv && responses[inv.invitation_id] != null;
    });
  }, [selectedParty, partyEvents, currentEventIndex, responses]);

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
            }),
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
    setFirstName("");
    setLastName("");
    setState("idle");
    setParties([]);
    setSelectedParty(null);
    setCurrentEventIndex(0);
    setResponses({});
    setErrorMessage("");
  }

  const currentEvent = partyEvents[currentEventIndex] ?? null;
  const isLastEvent = currentEventIndex === partyEvents.length - 1;

  return (
    <section id="rsvp" className="py-24 md:py-32 px-6">
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
              <div className="max-w-md mx-auto space-y-4">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleSearch()
                  }
                  placeholder="First name"
                  className="input-elegant text-center text-lg"
                  disabled={state === "searching"}
                />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleSearch()
                  }
                  placeholder="Last name"
                  className="input-elegant text-center text-lg"
                  disabled={state === "searching"}
                />
                {state === "searching" ? (
                  <LoadingDots />
                ) : (
                  <button
                    onClick={handleSearch}
                    disabled={
                      firstName.trim().length < 1 &&
                      lastName.trim().length < 1
                    }
                    className="btn-gold mt-4 px-10 py-3.5 rounded-full text-sm tracking-wider disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Find Your Invitation
                  </button>
                )}
              </div>
              <p className="mt-8 text-stone-warm text-xs tracking-wide">
                Please RSVP by May 31, 2026
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
                    <span className="block font-body text-sm text-charcoal">
                      {party.guests.map((g) => g.name || "Guest").join(", ")}
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

          {/* EVENT-BY-EVENT RSVP */}
          {(state === "event-rsvp" || state === "submitting") &&
            selectedParty &&
            currentEvent && (
              <motion.div
                key={`event-${currentEvent.event_id}`}
                {...fadeUp}
              >
                {/* Progress indicator */}
                {partyEvents.length > 1 && (
                  <div className="flex justify-center gap-2 mb-8">
                    {partyEvents.map((ev, i) => (
                      <div
                        key={ev.event_id}
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          i <= currentEventIndex
                            ? "w-8 bg-gold"
                            : "w-4 bg-gold/20"
                        }`}
                      />
                    ))}
                  </div>
                )}

                <div className="bg-ivory-warm rounded-2xl border border-gold/15 p-6 md:p-10">
                  {/* Event Details Card */}
                  <div className="text-center mb-8">
                    <h3 className="heading-caps text-2xl md:text-3xl text-charcoal">
                      {currentEvent.event_name}
                    </h3>
                    <div className="w-12 h-px bg-gold/30 mx-auto my-5" />
                    <div className="space-y-2 font-body text-sm text-charcoal-light">
                      <p className="font-display text-base text-charcoal">
                        {formatDate(currentEvent.event_date)}
                      </p>
                      <p>{currentEvent.event_time}</p>
                      <p className="font-display text-base text-charcoal mt-3">
                        {currentEvent.venue_name}
                      </p>
                      <p className="text-xs">{currentEvent.venue_address}</p>
                    </div>
                    {currentEvent.event_name === "Shadi" && (
                      <p className="mt-4 font-display text-sm italic text-gold/80 tracking-wide">
                        Mr. &amp; Mrs. Only
                      </p>
                    )}
                  </div>

                  {/* Per-guest Accept/Decline */}
                  <div className="space-y-6">
                    {getGuestsForEvent(
                      selectedParty,
                      currentEvent.event_id,
                    ).map((guest, gi) => {
                      const inv = guest.invitations.find(
                        (i) => i.event_id === currentEvent.event_id,
                      )!;
                      return (
                        <motion.div
                          key={guest.guest_id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: gi * 0.1,
                            duration: 0.5,
                            ease: smooth,
                          }}
                          className="flex flex-col sm:flex-row items-center justify-between gap-3 py-3 border-b border-gold/10 last:border-0"
                        >
                          <p className="font-display text-lg text-charcoal">
                            {guest.name || "Guest"}
                          </p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setResponses((prev) => ({
                                  ...prev,
                                  [inv.invitation_id]: "attending",
                                }))
                              }
                              className={`px-5 py-2 rounded-full text-xs font-body font-medium tracking-wide transition-all duration-300 ${
                                responses[inv.invitation_id] === "attending"
                                  ? "bg-forest text-white shadow-sm"
                                  : "bg-transparent border border-forest/20 text-forest/60 hover:border-forest/40"
                              }`}
                              disabled={state === "submitting"}
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setResponses((prev) => ({
                                  ...prev,
                                  [inv.invitation_id]: "declined",
                                }))
                              }
                              className={`px-5 py-2 rounded-full text-xs font-body font-medium tracking-wide transition-all duration-300 ${
                                responses[inv.invitation_id] === "declined"
                                  ? "bg-charcoal-light text-white shadow-sm"
                                  : "bg-transparent border border-charcoal/15 text-charcoal-light/60 hover:border-charcoal/30"
                              }`}
                              disabled={state === "submitting"}
                            >
                              Decline
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Next / Submit button */}
                  <div className="mt-10 text-center">
                    {state === "submitting" ? (
                      <LoadingDots />
                    ) : (
                      <button
                        onClick={handleNextEvent}
                        disabled={!allCurrentEventResponded}
                        className="btn-gold px-12 py-3.5 rounded-full text-sm tracking-wider disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {isLastEvent ? "Confirm RSVP" : "Next"}
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
                We couldn&apos;t find an invitation for &ldquo;{firstName}{" "}
                {lastName}&rdquo;. Please check the spelling or contact the
                couple.
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
    <svg viewBox="0 0 120 8" className="mx-auto w-24" fill="none">
      <line x1="4" y1="4" x2="48" y2="4" stroke="#C9A96E" strokeWidth="0.5" />
      <path
        d="M54,4 L60,0.5 L66,4 L60,7.5 Z"
        stroke="#C9A96E"
        strokeWidth="0.5"
      />
      <line
        x1="72"
        y1="4"
        x2="116"
        y2="4"
        stroke="#C9A96E"
        strokeWidth="0.5"
      />
    </svg>
  );
}
