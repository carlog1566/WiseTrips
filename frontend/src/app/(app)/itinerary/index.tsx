import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ItineraryResponse } from "@/itinerary/itinerary.types";

const fakeItineraryResponse: ItineraryResponse = {
  stops: [
    {
      id: 1,
      trip_id: 1,
      place_id: 101,
      stop_order: 1,
      arrival_time: "09:00:00",
      departure_time: "10:00:00",
    },
    {
      id: 2,
      trip_id: 1,
      place_id: 102,
      stop_order: 2,
      arrival_time: "10:15:00",
      departure_time: "11:45:00",
    },
    {
      id: 3,
      trip_id: 1,
      place_id: 103,
      stop_order: 3,
      arrival_time: "12:00:00",
      departure_time: "13:00:00",
    },
  ],
  total_travel_minutes: 30,
};

export default function Itinerary() {

  return <View></View>;
}
