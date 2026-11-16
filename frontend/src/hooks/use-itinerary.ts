import { apiClient } from "@/api/apiClient";
import { ItineraryResponse } from "@/itinerary/itinerary.types";
import { useQuery } from "@tanstack/react-query";
import { createItineraryQueryKey } from "@/itinerary/itinerary";

async function getItinerary(trip_id: number) {
  const itinerary = await apiClient.get<ItineraryResponse>(
    `/api/trips/${trip_id}/itinerary`,
  );

  if (!itinerary) {
    throw new Error("Server returned an empty itinerary.");
  }

  return itinerary;
}

export function useItinerary(trip_id: number) {
  return useQuery({
    queryKey: createItineraryQueryKey(trip_id),
    queryFn: () => getItinerary(trip_id),
    enabled: Number.isInteger(trip_id) && trip_id > 0,
  });
}
