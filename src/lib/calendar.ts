/**
 * Calendar deep-link generators for the two wedding events.
 *
 * Times are hardcoded in UTC per event name since the events table stores
 * time as a free-form string ("6:00 PM") with no timezone.
 */

export interface CalendarEventDetails {
  event_name: string;
  venue_name: string;
  venue_address: string;
}

interface EventTimes {
  startUTC: string;
  endUTC: string;
  description: string;
}

// Mehndi: Thu Jul 16, 2026 6:00 PM CDT → 11:00 PM CDT
// Shadi:  Fri Jul 17, 2026 7:00 PM CDT → 12:00 AM CDT next day
const EVENT_TIMES: Record<string, EventTimes> = {
  Mehndi: {
    startUTC: "20260716T230000Z",
    endUTC: "20260717T040000Z",
    description: "Mehndi celebration for Ahad & Sana",
  },
  Shadi: {
    startUTC: "20260718T000000Z",
    endUTC: "20260718T050000Z",
    description: "Shadi celebration for Ahad & Sana",
  },
};

export function hasCalendarTimes(eventName: string): boolean {
  return eventName in EVENT_TIMES;
}

export function generateGoogleCalendarUrl(
  event: CalendarEventDetails,
): string | null {
  const times = EVENT_TIMES[event.event_name];
  if (!times) return null;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Ahad & Sana - ${event.event_name}`,
    dates: `${times.startUTC}/${times.endUTC}`,
    location: `${event.venue_name}, ${event.venue_address}`,
    details: times.description,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function escapeICSText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

export function generateICS(event: CalendarEventDetails): string | null {
  const times = EVENT_TIMES[event.event_name];
  if (!times) return null;

  const uid = `${event.event_name.toLowerCase()}-ahadandsana-2026@ahadandsana.com`;
  const location = `${event.venue_name}, ${event.venue_address}`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Ahad and Sana Wedding//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    "DTSTAMP:20260101T000000Z",
    `DTSTART:${times.startUTC}`,
    `DTEND:${times.endUTC}`,
    `SUMMARY:Ahad & Sana - ${event.event_name}`,
    `LOCATION:${escapeICSText(location)}`,
    `DESCRIPTION:${escapeICSText(times.description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadICS(event: CalendarEventDetails): void {
  const ics = generateICS(event);
  if (!ics) return;

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ahad-sana-${event.event_name.toLowerCase()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
