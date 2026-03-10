/** Returns just the date portion "YYYY-MM-DD" from a deliveryDate string */
export function parseDatePart(deliveryDate: string): string {
  if (!deliveryDate) return "";
  return deliveryDate.slice(0, 10);
}

/** Returns time "HH:MM" if present in deliveryDate, else "" */
export function parseTimePart(deliveryDate: string): string {
  if (!deliveryDate) return "";
  const tIdx = deliveryDate.indexOf("T");
  if (tIdx === -1) return "";
  return deliveryDate.slice(tIdx + 1, tIdx + 6);
}

/** Formats a deliveryDate to a readable date string e.g. "15 Mar 2026" */
export function formatDisplayDate(deliveryDate: string): string {
  const datePart = parseDatePart(deliveryDate);
  if (!datePart) return "";
  const [year, month, day] = datePart.split("-").map(Number);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${day} ${months[month - 1]} ${year}`;
}

/** Returns "HH:MM" or "" if no time in deliveryDate */
export function formatDisplayTime(deliveryDate: string): string {
  return parseTimePart(deliveryDate);
}
