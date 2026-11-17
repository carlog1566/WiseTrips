import { router, Stack, useLocalSearchParams } from "expo-router";
import MapView, { Callout, Marker, Polyline, PROVIDER_DEFAULT, UrlTile, } from "react-native-maps";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, Platform, } from "react-native";
import { colorPallet, fontSizes, fontWeights, radious, spacing } from "@/constants/tokens";
import { useItinerary } from "@/hooks/use-itinerary";
import { useTheme } from "@/hooks/use-theme";
import { useTripPreferences } from "@/hooks/use-trip-preferences";
import { formatTime, parseItineraryParam } from "@/itinerary/itinerary";
import type { ItineraryResponse, ItineraryStop } from "@/itinerary/itinerary.types";

type Coordinate = {
  latitude: number;
  longitude: number;
};

type StopWithOptionalPlace = ItineraryStop & {
  place?: {
    name?: string;
    latitude?: number;
    longitude?: number;
  } | null;
};

type MapStop = {
  stop: ItineraryStop;
  coordinate: Coordinate;
  name: string;
  isPreviewCoordinate: boolean;
};

const previewStartingCoordinate: Coordinate = {
  latitude: 40.758,
  longitude: -73.9855,
};

// The current ItineraryResponse only contains place_id values. These locations
// keep the map preview usable until the API returns place coordinates.
const previewPlaceCoordinates: Record<number, Coordinate> = {
  101: { latitude: 40.7411, longitude: -73.9897 },
  102: { latitude: 40.7061, longitude: -74.0087 },
  103: { latitude: 40.7484, longitude: -73.9857 },
};

const travelEstimates = [
  { minutes: 18, distance: "7.9 mi" },
  { minutes: 11, distance: "0.55 mi" },
] as const;

function getSingleParam(value?: string | string[]) {
  return typeof value === "string" ? value : undefined;
}

function getCoordinateForStop(stop: ItineraryStop, index: number): MapStop {
  const stopWithPlace = stop as StopWithOptionalPlace;
  const place = stopWithPlace.place;
  const latitude = place?.latitude;
  const longitude = place?.longitude;
  const hasPlaceCoordinate =
    typeof latitude === "number" && typeof longitude === "number";

  if (hasPlaceCoordinate) {
    return {
      stop,
      coordinate: {
        latitude,
        longitude,
      },
      name: place?.name ?? "Place " + stop.place_id,
      isPreviewCoordinate: false,
    };
  }

  return {
    stop,
    coordinate:
      previewPlaceCoordinates[stop.place_id] ?? {
        latitude: previewStartingCoordinate.latitude + (index + 1) * 0.01,
        longitude: previewStartingCoordinate.longitude - (index + 1) * 0.01,
      },
    name: "Place " + stop.place_id,
    isPreviewCoordinate: true,
  };
}

function getTravelEstimate(index: number) {
  return travelEstimates[index] ?? travelEstimates[0];
}

export default function ItineraryMapScreen() {
  const theme = useTheme();
  const mapRef = useRef<MapView | null>(null);
  const [selectedStopId, setSelectedStopId] = useState<number | null>(null);
  const {
    trip_id,
    itinerary: itineraryParam,
    destination: destinationParam,
    starting_location: startingLocationParam,
  } = useLocalSearchParams<{
    trip_id?: string;
    itinerary?: string;
    destination?: string;
    starting_location?: string;
  }>();
  const tripId = Number(trip_id);
  const itineraryFromParams = parseItineraryParam(itineraryParam);
  const queryTripId = itineraryFromParams ? 0 : tripId;
  const itineraryQuery = useItinerary(queryTripId);
  const preferencesQuery = useTripPreferences(queryTripId);
  const itinerary: ItineraryResponse | null =
    itineraryFromParams ?? itineraryQuery.data ?? null;

  const stops = useMemo(
    () =>
      [...(itinerary?.stops ?? [])]
        .sort((first, second) => first.stop_order - second.stop_order)
        .map((stop, index) => getCoordinateForStop(stop, index)),
    [itinerary],
  );
  const routeCoordinates = useMemo(
    () => [previewStartingCoordinate, ...stops.map((item) => item.coordinate)],
    [stops],
  );
  const selectedStop = stops.find((item) => item.stop.id === selectedStopId);
  const isLoading = !itineraryFromParams && itineraryQuery.isPending;
  const hasError =
    !itineraryFromParams &&
    Boolean(itineraryQuery.error || preferencesQuery.error) &&
    !itineraryQuery.data;
  const destination =
    getSingleParam(destinationParam) ??
    preferencesQuery.data?.destination ??
    "Your destination";
  const startingLocation =
    getSingleParam(startingLocationParam) ??
    preferencesQuery.data?.starting_location ??
    "Starting location";

  useEffect(() => {
    if (routeCoordinates.length < 2) {
      return;
    }

    const timeout = setTimeout(() => {
      mapRef.current?.fitToCoordinates(routeCoordinates, {
        edgePadding: { top: 72, right: 48, bottom: 72, left: 48 },
        animated: false,
      });
    }, 100);

    return () => clearTimeout(timeout);
  }, [routeCoordinates]);

  useEffect(() => {
    if (!selectedStopId && stops[0]) {
      setSelectedStopId(stops[0].stop.id);
    }
  }, [selectedStopId, stops]);

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator
          size="large"
          color={theme.primary}
          accessibilityLabel="Loading itinerary map"
        />
      </View>
    );
  }

  if (hasError || !itinerary) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>
          We couldn&apos;t load this itinerary map.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void itineraryQuery.refetch();
            void preferencesQuery.refetch();
          }}
          style={[styles.retryButton, { backgroundColor: theme.primary }]}
        >
          <Text style={[styles.retryButtonText, { color: theme.background }]}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ headerBackButtonDisplayMode: "minimal" }} />
        <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          provider={Platform.OS === "ios" ? PROVIDER_DEFAULT : undefined}
          mapType={Platform.OS === "android" ? "none" : "standard"}
          initialRegion={{
            ...previewStartingCoordinate,
            latitudeDelta: 0.08,
            longitudeDelta: 0.08,
          }}
          showsCompass
          showsScale
          toolbarEnabled
        >

          <Marker
            coordinate={previewStartingCoordinate}
            pinColor={theme.primary}
            title={startingLocation}
            description="Starting location"
          />

          <Polyline
            coordinates={routeCoordinates}
            strokeColor={theme.primary}
            strokeWidth={5}
          />

          {stops.map((item, index) => {
            const isSelected = item.stop.id === selectedStopId;

            return (
              <Marker
                key={item.stop.id}
                coordinate={item.coordinate}
                onPress={() => setSelectedStopId(item.stop.id)}
                title={item.name}
                description={
                  "Stop " +
                  (index + 1) +
                  " · " +
                  formatTime(item.stop.arrival_time)
                }
                tracksViewChanges={false}
              >
                <View
                  style={[
                    styles.numberedMarker,
                    { backgroundColor: isSelected ? theme.primary : "#FFFFFF" },
                    { borderColor: theme.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.markerText,
                      { color: isSelected ? "#FFFFFF" : theme.primary },
                    ]}
                  >
                    {index + 1}
                  </Text>
                </View>
                <Callout>
                  <View style={styles.callout}>
                    <Text style={styles.calloutTitle}>{item.name}</Text>
                    <Text style={styles.calloutText}>
                      Arrives {formatTime(item.stop.arrival_time)}
                    </Text>
                  </View>
                </Callout>
              </Marker>
            );
          })}
        </MapView>
      </View>

      <ScrollView
        contentContainerStyle={styles.detailsContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.detailsHeading}>
          <Text style={[styles.detailsTitle, { color: theme.text }]}>Stops</Text>
          <Text style={[styles.totalTravel, { color: theme.text }]}>
            {itinerary.total_travel_minutes} mins total travel
          </Text>
        </View>

        {stops.map((item, index) => {
          const estimate = getTravelEstimate(index);
          const isLastStop = index === stops.length - 1;

          return (
            <Pressable
              key={item.stop.id}
              accessibilityRole="button"
              accessibilityLabel={"Select " + item.name}
              onPress={() => setSelectedStopId(item.stop.id)}
              style={[
                styles.stopCard,
                item.stop.id === selectedStopId && {
                  borderColor: theme.primary,
                },
              ]}
            >
              <View style={[styles.stopNumber, { backgroundColor: theme.primary }]}>
                <Text style={styles.stopNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.stopCopy}>
                <Text style={[styles.stopName, { color: theme.text }]}>
                  {item.name}
                </Text>
                <Text style={[styles.stopTime, { color: theme.text }]}>
                  {formatTime(item.stop.arrival_time)} -{" "}
                  {formatTime(item.stop.departure_time)}
                </Text>
                {!isLastStop && (
                  <Text style={[styles.travelText, { color: theme.text }]}>
                    {estimate.minutes} mins · {estimate.distance} to next stop
                  </Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  centered: {
    alignItems: "center",
    flex: 1,
    gap: spacing.md,
    justifyContent: "center",
    padding: spacing.lg,
  },
  errorText: {
    fontSize: fontSizes.body,
    textAlign: "center",
  },
  retryButton: {
    borderRadius: radious.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  retryButtonText: {
    fontSize: fontSizes.body,
    fontWeight: fontWeights.semibold,
  },
  mapContainer: {
    height: "58%",
    minHeight: 330,
    overflow: "hidden",
    position: "relative",
  },
  numberedMarker: {
    alignItems: "center",
    borderRadius: radious.pill,
    borderWidth: 3,
    elevation: 3,
    height: 34,
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    width: 34,
  },
  markerText: {
    fontSize: fontSizes.label,
    fontWeight: fontWeights.bold,
  },
  callout: {
    minWidth: 130,
    padding: spacing.xs,
  },
  calloutTitle: {
    fontSize: fontSizes.label,
    fontWeight: fontWeights.semibold,
  },
  calloutText: {
    color: "#444444",
    fontSize: fontSizes.caption,
    marginTop: spacing.xxs,
  },
  detailsContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  detailsHeading: {
    alignItems: "baseline",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  detailsTitle: {
    fontSize: fontSizes.heading,
    fontWeight: fontWeights.semibold,
  },
  totalTravel: {
    fontSize: fontSizes.caption,
  },
  stopCard: {
    alignItems: "center",
    borderColor: colorPallet.border,
    borderRadius: radious.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
    padding: spacing.sm,
  },
  stopNumber: {
    alignItems: "center",
    borderRadius: radious.pill,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  stopNumberText: {
    color: "#FFFFFF",
    fontSize: fontSizes.caption,
    fontWeight: fontWeights.bold,
  },
  stopCopy: {
    flex: 1,
    gap: spacing.xxs,
  },
  stopName: {
    fontSize: fontSizes.label,
    fontWeight: fontWeights.semibold,
  },
  stopTime: {
    fontSize: fontSizes.caption,
  },
  travelText: {
    color: "#555555",
    fontSize: fontSizes.caption,
  },
});
