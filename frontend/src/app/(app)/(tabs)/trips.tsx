import { router } from "expo-router";
import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { memo, useCallback, useState } from "react";
import type { ImageStyle, ListRenderItem, StyleProp } from "react-native";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  colorPallet,
  fontSizes,
  fontWeights,
  radious,
  spacing,
} from "@/constants/tokens";
import { useTheme } from "@/hooks/use-theme";
import type { TripPreferencesResponse } from "@/itinerary/itinerary.types";
import { useSavedTrips } from "@/hooks/use-saved-trips";

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

  const { data: savedTrips, isPending, error, refetch } = useSavedTrips();

  const renderTripRow = useCallback<ListRenderItem<TripPreferencesResponse>>(
    ({ item }) => <TripRow trip={item} />,
    [],
  );

  if (isPending) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.background }]}>
        <ActivityIndicator
          size="large"
          color={theme.primary}
          accessibilityLabel="Loading itinerary"
        />
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[styles.errorContainer, { backgroundColor: theme.background }]}
      >
        <Text style={[styles.errorMessage, { color: theme.text }]}>
          We had an error getting your saved itineraries.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => refetch()}
          style={[styles.retryButton, { backgroundColor: theme.primary }]}
        >
          <Text style={[styles.retryButtonText, { color: theme.background }]}>
            Retry
          </Text>
        </Pressable>

        {/* START: Temporary Itinerary Preview Access */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Preview temporary itinerary"
          onPress={() =>
            router.push({
              pathname: "/(app)/itinerary",
              params: { trip_id: "1" },
            })
          }
          style={[styles.previewMapButton, { borderColor: theme.primary }]}
        >
          <Text style={[styles.previewMapButtonText, { color: theme.primary }]}>
            Temporary Itinerary
          </Text>
        </Pressable>
        {/* END: Temporary Itinerary Preview Access */}
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <FlatList
          data={savedTrips ?? []}
          renderItem={renderTripRow}
          keyExtractor={tripRowKey}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onEndReachedThreshold={0.5}
          ListEmptyComponent={() => (
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
        />
      </View>

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

const tripRowKey = (trip: TripPreferencesResponse) => String(trip.id);

const TripRow = memo(function TripRow({
  trip,
}: {
  trip: TripPreferencesResponse;
}) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open itinerary for ${trip.destination}`}
      onPress={() => {
        router.replace({
          pathname: "/(app)/itinerary",
          params: {
            trip_id: trip.id,
          },
        });
      }}
      style={({ pressed }) => [styles.itineraryCard, pressed && styles.pressed]}
    >
      <PlaceImage
        accessibilityLabel={`${trip.destination} place image`}
        style={StyleSheet.absoluteFill}
        uri={placeImages[0].imageUrl}
      />
      <View style={styles.cardImageOverlay} />

      <View style={styles.cardHeader}>
        <Text style={styles.cardDate}>{getDateLabel(trip.trip_date)}</Text>
        <View style={styles.statusBadge}>
          <Text style={[styles.statusText, { color: theme.text }]}>
            {getTripStatus(trip.trip_date)}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.cardKicker}>Travel to</Text>
          <Text style={styles.destination}>{trip.destination}</Text>
        </View>
        <SymbolView
          name={{ ios: "chevron.right", android: "chevron_right" }}
          size={22}
          tintColor="#FFFFFF"
        />
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  scrollContent: {
    flexGrow: 1,
    gap: spacing.md,
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
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
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.md,
  },
  errorMessage: {
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
  // START: Temporary Styles
  previewMapButton: {
    borderRadius: radious.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  previewMapButtonText: {
    fontSize: fontSizes.body,
    fontWeight: fontWeights.semibold,
  },
  // END: Temporary Styles
});
