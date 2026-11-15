import { apiClient } from "@/api/apiClient";
import { createItineraryQueryKey } from "@/itinerary/itinerary";
import type { TripPreferencesResponse } from "@/itinerary/itinerary.types";
import { useQuery } from "@tanstack/react-query";

async function getUserTrips() {
  const savedTrips = await apiClient.get<TripPreferencesResponse[]>(
    '/api/trips',
  );

  if (!savedTrips) {
    throw new Error("Server returned an empty response.");
  }

  return savedTrips;
}

export function useSavedTrips() {
  return useQuery({
    queryKey: createItineraryQueryKey('saved'),
    queryFn: () => getUserTrips(),
  });
}
