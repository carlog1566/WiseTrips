import { Stack, useLocalSearchParams } from "expo-router";
import MapView, { Callout, Marker, Polyline, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from "react-native-maps";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, Platform } from "react-native";
import { colorPallet, fontSizes, fontWeights, radious, spacing } from "@/constants/tokens";
import { useItinerary } from "@/hooks/use-itinerary";
import { useTheme } from "@/hooks/use-theme";
import { formatTime, getTravelMinutes } from "@/itinerary/itinerary";
import type { ItineraryResponse, ItineraryStop } from "@/itinerary/itinerary.types";

type Coordinate = {
  latitude: number;
  longitude: number;
};


type MapStop = {
  stop: ItineraryStop;
  coordinate: Coordinate;
  name: string;
};

function getCoordinateForStop(stop: ItineraryStop): MapStop {
  return {
    stop,
    coordinate: {
      latitude: stop.place.latitude,
      longitude: stop.place.longitude,
    },
    name: stop.place.name,
  };
}


export default function ItineraryMapScreen() {
  const theme = useTheme();
  const mapRef = useRef<MapView | null>(null);
  const [selectedStopId, setSelectedStopId] = useState<number | null>(null);
  const { trip_id } = useLocalSearchParams<{ trip_id?: string }>();
  const tripId = Number(trip_id);

  const itineraryQuery = useItinerary(tripId);
  const itinerary: ItineraryResponse | null = itineraryQuery.data ?? null;

  const stops = useMemo(
    () =>
      [...(itinerary?.stops ?? [])]
        .sort((first, second) => first.stop_order - second.stop_order)
        .map(getCoordinateForStop),
    [itinerary],
  );

  const routeCoordinates = useMemo(
    () => stops.map((item) => item.coordinate),
    [stops],
  );

  const isLoading = tripId > 0 && itineraryQuery.isPending;
  const hasError =
    !Number.isInteger(tripId) ||
    tripId <= 0 ||
    Boolean(itineraryQuery.error);

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

  if (hasError || !itinerary || stops.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>
          We couldn&apos;t load this itinerary map.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void itineraryQuery.refetch();
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
          provider={Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
          initialRegion={{
            ...stops[0].coordinate,
            latitudeDelta: 0.08,
            longitudeDelta: 0.08,
          }}
          showsCompass
          showsScale
          toolbarEnabled
        >

          {routeCoordinates.length > 1 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor={theme.primary}
              strokeWidth={5}
            />
          )}

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
          const isLastStop = index === stops.length - 1;
          const travelMinutes = !isLastStop
            ? getTravelMinutes(
                item.stop.departure_time,
                stops[index + 1].stop.arrival_time,
              )
            : 0;

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
                    {travelMinutes} mins to next stop
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
