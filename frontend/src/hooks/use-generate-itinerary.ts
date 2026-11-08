import { apiClient } from "@/api/apiClient";
import {
  ItineraryResponse,
  TripPreferencesCreate,
} from "@/itinerary/itinerary.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const generateItinerayQueryKey = ["itinerary", "generate"] as const;

async function generateItinerary(
  preferences: TripPreferencesCreate,
): Promise<ItineraryResponse> {
  const itinerary = await apiClient.post<
    ItineraryResponse,
    TripPreferencesCreate
  >("/api/trips/generate", preferences);

  if (!itinerary) {
    throw new Error("Server returned an empty itinerary.");
  }

  return itinerary;
}

export function useGenerateItinerary() {
  return useMutation({
    mutationFn: (itinerary: TripPreferencesCreate) =>
      generateItinerary(itinerary),

    onSuccess: () => {},

    onError: (error, _ids, context) => {},

    onSettled: () => {},
  });
}
