import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface RsvpNotification {
  guestName: string;
  partyName: string;
  eventName: string;
  status: "attending" | "declined";
}

export function sendRsvpNotification(notifications: RsvpNotification[]) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — skipping email notification.");
    return;
  }

  for (const { guestName, partyName, eventName, status } of notifications) {
    const submittedAt = new Date().toLocaleString();

    resend.emails.send({
      from: "Wedding RSVP <onboarding@resend.dev>",
      to: "ahadandsana@gmail.com",
      subject: `RSVP: ${guestName} — ${eventName} — ${status}`,
      html: `
        <h2>New RSVP Response</h2>
        <p><strong>Guest:</strong> ${guestName}</p>
        <p><strong>Party:</strong> ${partyName}</p>
        <p><strong>Event:</strong> ${eventName}</p>
        <p><strong>Status:</strong> ${status}</p>
        <p><em>Submitted at ${submittedAt}</em></p>
      `,
    }).catch((error) => {
      console.error("Resend email failed:", error);
    });
  }
}
