import { apiClient } from "@/api/apiClient";
import type { TripPreferencesResponse } from "@/itinerary/itinerary.types";
import { useQuery } from "@tanstack/react-query";

export const tripPreferencesQueryKey = ["trip-preferences"] as const;

async function getTripPreferences(trip_id: number) {
  const tripPreferences = await apiClient.get<TripPreferencesResponse>(
    `/api/trips/${trip_id}`,
  );

  if (!tripPreferences) {
    throw new Error("Server returned an empty response.");
  }

  return tripPreferences;
}

export function useTripPreferences(trip_id: number) {
  return useQuery({
    queryKey: [...tripPreferencesQueryKey, trip_id],
    queryFn: () => getTripPreferences(trip_id),
    enabled: Number.isInteger(trip_id) && trip_id > 0,
  });
}
