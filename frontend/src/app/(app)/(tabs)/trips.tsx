import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import type { ImageStyle, StyleProp } from "react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  colorPallet,
  fontSizes,
  fontWeights,
  radious,
  spacing,
} from "@/constants/tokens";
import { useTheme } from "@/hooks/use-theme";
import {
  parseItineraryParam,
  createItineraryQueryKey,
  type RecentItinerary,
} from "@/itinerary/itinerary";

const placeImages = [
  {
    placeId: 101,
    imageUrl:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80",
  },
  {
    placeId: 102,
    imageUrl:
      "https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=900&q=80",
  },
  {
    placeId: 103,
    imageUrl:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=80",
  },
];

const imagePlaceholder = require("@/assets/images/placeholder.png");

type ItineraryParams = {
  destination?: string | string[];
  itinerary?: string | string[];
  tripDate?: string | string[];
};

function getParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function getPlaceImageUrl(placeId: number) {
  return placeImages.find((place) => place.placeId === placeId)?.imageUrl;
}

function PlaceImage({
  accessibilityLabel,
  style,
  uri,
}: {
  accessibilityLabel: string;
  style: StyleProp<ImageStyle>;
  uri?: string;
}) {
  const [hasError, setHasError] = useState(false);

  return (
    <Image
      accessibilityLabel={accessibilityLabel}
      contentFit="cover"
      onError={() => setHasError(true)}
      placeholder={imagePlaceholder}
      placeholderContentFit="cover"
      source={hasError || !uri ? imagePlaceholder : { uri }}
      style={style}
      transition={200}
    />
  );
}

function getTripStatus(tripDate?: string) {
  if (!tripDate) {
    return "Upcoming";
  }

  const tripTime = new Date(`${tripDate}T00:00:00`).getTime();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysUntilTrip = Math.ceil((tripTime - today.getTime()) / 86_400_000);

  if (daysUntilTrip <= 0) {
    return "Today";
  }

  if (daysUntilTrip === 1) {
    return "Tomorrow";
  }

  if (daysUntilTrip < 30) {
    return `In ${daysUntilTrip} days`;
  }

  return "Upcoming";
}

function getDateLabel(tripDate?: string) {
  if (!tripDate) {
    return "Date to be confirmed";
  }

  const date = new Date(`${tripDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return tripDate;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TripsScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<ItineraryParams>();
  const { data: recentItinerary } = useQuery<RecentItinerary | null>({
    queryKey: createItineraryQueryKey("recent"),
    queryFn: async () => null,
    initialData: null,
    staleTime: Infinity,
  });
  const itinerary =
    parseItineraryParam(params.itinerary) ?? recentItinerary?.itinerary ?? null;
  const destination =
    getParamValue(params.destination) ??
    recentItinerary?.destination ??
    "City, Country";
  const tripDate =
    getParamValue(params.tripDate) ?? recentItinerary?.tripDate;
  const stops = itinerary
    ? [...itinerary.stops].sort(
        (first, second) => first.stop_order - second.stop_order,
      )
    : [];
  const firstPlaceId = stops[0]?.place_id;
  const placeImageUrl = firstPlaceId
    ? getPlaceImageUrl(firstPlaceId)
    : undefined;

  function openItinerary() {
    if (!itinerary) {
      return;
    }

    router.push({
      pathname: "/itinerary",
      params: {
        destination,
        itinerary: JSON.stringify(itinerary),
        tripDate: tripDate ?? "",
      },
    } as never);
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {itinerary ? (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Open itinerary for ${destination}`}
              onPress={openItinerary}
              style={({ pressed }) => [
                styles.itineraryCard,
                pressed && styles.pressed,
              ]}
            >
              <PlaceImage
                accessibilityLabel={`${destination} place image`}
                style={StyleSheet.absoluteFill}
                uri={placeImageUrl}
              />
              <View style={styles.cardImageOverlay} />

              <View style={styles.cardHeader}>
                <Text style={styles.cardDate}>
                  {getDateLabel(tripDate)}
                </Text>
                <View style={styles.statusBadge}>
                  <Text style={[styles.statusText, { color: theme.text }]}>
                    {getTripStatus(tripDate)}
                  </Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.cardKicker}>
                    Travel to
                  </Text>
                  <Text style={styles.destination}>
                    {destination}
                  </Text>
                </View>
                <SymbolView
                  name={{ ios: "chevron.right", android: "chevron_right" }}
                  size={22}
                  tintColor="#FFFFFF"
                />
              </View>
            </Pressable>
          </>
        ) : (
          <View style={styles.emptyState}>
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: theme.primaryBackground },
              ]}
            >
              <SymbolView
                name={{ ios: "map", android: "map" }}
                size={30}
                tintColor={theme.primary}
              />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No itineraries yet
            </Text>
            <Text style={[styles.emptyMessage, { color: colorPallet.muted }]}>
              Plan a trip to see your itinerary here.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.background }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Plan a trip"
          onPress={() => router.push("/(app)/trip-preferences")}
          style={({ pressed }) => [
            styles.planButton,
            { backgroundColor: theme.primary },
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.planButtonText}>+ Plan a trip</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  emptyState: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  emptyIcon: {
    alignItems: "center",
    borderRadius: radious.pill,
    justifyContent: "center",
    marginBottom: spacing.md,
    minHeight: 72,
    minWidth: 72,
  },
  emptyTitle: {
    fontSize: fontSizes.heading,
    fontWeight: fontWeights.semibold,
    marginBottom: spacing.xs,
  },
  emptyMessage: {
    fontSize: fontSizes.body,
    textAlign: "center",
  },
  itineraryCard: {
    borderRadius: radious.md,
    justifyContent: "space-between",
    minHeight: 142,
    overflow: "hidden",
    padding: spacing.sm,
  },
  cardImageOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  cardDate: {
    color: "#FFFFFF",
    flex: 1,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.medium,
  },
  statusBadge: {
    backgroundColor: "#FFFFFF",
    borderRadius: radious.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
  },
  statusText: {
    fontSize: fontSizes.caption,
    fontWeight: fontWeights.medium,
  },
  cardFooter: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardKicker: {
    color: "#FFFFFF",
    fontSize: fontSizes.caption,
  },
  destination: {
    color: "#FFFFFF",
    fontSize: fontSizes.body,
    fontWeight: fontWeights.medium,
  },
  footer: {
    borderTopColor: colorPallet.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
  },
  planButton: {
    alignItems: "center",
    borderRadius: radious.pill,
    justifyContent: "center",
    minHeight: 54,
    paddingHorizontal: spacing.md,
  },
  planButtonText: {
    color: "#FFFFFF",
    fontSize: fontSizes.body,
    fontWeight: fontWeights.semibold,
  },
  pressed: {
    opacity: 0.75,
  },
});
