import { Redirect, useLocalSearchParams } from "expo-router";

type ItineraryParams = {
  destination?: string | string[];
  itinerary?: string | string[];
  tripDate?: string | string[];
};

function getParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default function ItineraryRedirect() {
  const params = useLocalSearchParams<ItineraryParams>();

  return (
    <Redirect
      href={
        {
          pathname: "/(app)/(tabs)/trips",
          params: {
            destination: getParamValue(params.destination),
            itinerary: getParamValue(params.itinerary),
            tripDate: getParamValue(params.tripDate),
          },
        } as never
      }
    />
  );
}
