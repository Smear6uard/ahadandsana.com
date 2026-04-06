type GuestNameFields = {
  firstName: string | null | undefined;
  lastName: string | null | undefined;
};

export function isPlusOneGuest(guest: GuestNameFields) {
  return guest.firstName == null;
}

export function getGuestDisplayName(
  guest: GuestNameFields,
  fallback = "Plus One",
) {
  const name = [guest.firstName, guest.lastName]
    .filter((part): part is string => typeof part === "string" && part.trim().length > 0)
    .join(" ")
    .trim();

  return name || fallback;
}
