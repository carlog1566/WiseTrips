import type { ItineraryResponse } from "@/itinerary/itinerary.types";

export function parseItineraryParam(
  value?: string | string[],
): ItineraryResponse | null {
  if (!value || Array.isArray(value)) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as ItineraryResponse;
    if (!parsed || !Array.isArray(parsed.stops)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function formatTime(value: string): string {
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return value;
  }

  const suffix = hours >= 12 ? "PM" : "AM";
  const hour = hours % 12 || 12;
  return `${hour}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

export function formatDate(value?: string): string {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "numeric",
    day: "numeric",
  });
}
