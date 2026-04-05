import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface RsvpNotification {
  guestName: string;
  partyName: string;
  eventName: string;
  status: "attending" | "declined";
}

export async function sendRsvpNotification(notifications: RsvpNotification[]) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping email notification.");
    return;
  }

  const lines = notifications.map(
    (n) =>
      `• ${n.guestName} (${n.partyName}) — ${n.eventName}: ${n.status === "attending" ? "Accepted" : "Declined"}`,
  );

  const subject =
    notifications.length === 1
      ? `RSVP: ${notifications[0].guestName} — ${notifications[0].eventName}`
      : `RSVP Update: ${notifications[0].partyName}`;

  await resend.emails.send({
    from: "Wedding RSVP <onboarding@resend.dev>",
    to: "ahadandsana@gmail.com",
    subject,
    text: `New RSVP Response\n\n${lines.join("\n")}\n`,
  });
}
