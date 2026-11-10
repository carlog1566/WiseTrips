import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import type { ImageStyle, StyleProp } from "react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  colorPallet,
  fontSizes,
  fontWeights,
  radious,
  spacing,
} from "@/constants/tokens";
import { useTheme } from "@/hooks/use-theme";
import {
  formatDate,
  formatTime,
  parseItineraryParam,
} from "@/itinerary/itinerary";
import type {
  ItineraryResponse,
  ItineraryStop,
} from "@/itinerary/itinerary.types";

type ItineraryDetailParams = {
  destination?: string | string[];
  itinerary?: string | string[];
  tripDate?: string | string[];
};

const itineraryTabs = ["Itinerary", "Explore", "Budget", "Map"] as const;

const travelEstimates = [
  {
    minutes: 18,
    distance: "7.9 mi",
    icon: { ios: "car", android: "directions_car" },
  },
  {
    minutes: 11,
    distance: "0.55 mi",
    icon: { ios: "figure.walk", android: "directions_walk" },
  },
] as const;

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

function getDayLabel(tripDate?: string) {
  if (!tripDate) {
    return "Day 1";
  }

  const date = new Date(`${tripDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return "Day 1";
  }

  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "numeric",
    weekday: "short",
  });
}

function getDayTitle(tripDate?: string) {
  return tripDate ? formatDate(tripDate) : "Your itinerary";
}

function getPlaceName(stop: ItineraryStop) {
  return `Place ${stop.place_id}`;
}

function getPlaceHours(stop: ItineraryStop) {
  return `Open ${formatTime(stop.arrival_time)} - ${formatTime(stop.departure_time)}`;
}

function getItineraryFromParams(value?: string | string[]): ItineraryResponse {
  return (
    parseItineraryParam(value) ?? {
      stops: [],
      total_travel_minutes: 0,
    }
  );
}

export default function ItineraryDetailScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<ItineraryDetailParams>();
  const itinerary = getItineraryFromParams(params.itinerary);
  const destination = getParamValue(params.destination) ?? "Place";
  const tripDate = getParamValue(params.tripDate);
  const stops = [...itinerary.stops].sort(
    (first, second) => first.stop_order - second.stop_order,
  );
  const heroImageUrl = stops[0]
    ? getPlaceImageUrl(stops[0].place_id)
    : undefined;

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.heroPlaceholder,
            {
              height: 180 + insets.top,
              marginTop: -insets.top,
              paddingTop: insets.top,
            },
          ]}
        >
          <PlaceImage
            accessibilityLabel={`${destination} place image`}
            style={StyleSheet.absoluteFill}
            uri={heroImageUrl}
          />
          <View style={styles.heroOverlay} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={10}
            onPress={() => router.back()}
            style={[styles.backButton, { top: insets.top + spacing.xs }]}
          >
            <SymbolView
              name={{ ios: "chevron.left", android: "arrow_back" }}
              size={24}
              tintColor={theme.background}
            />
          </Pressable>
        </View>

        <View style={[styles.tripSummary, { backgroundColor: theme.background }]}>
          <View style={styles.summaryHeading}>
            <View style={styles.summaryCopy}>
              <Text style={[styles.kicker, { color: theme.text }]}>Travel to</Text>
              <Text style={[styles.destination, { color: theme.text }]}>
                {destination}
              </Text>
            </View>
            <View style={styles.summaryActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Share itinerary"
                hitSlop={8}
                onPress={() => undefined}
              >
                <SymbolView
                  name={{ ios: "square.and.arrow.up", android: "share" }}
                  size={20}
                  tintColor={theme.primary}
                />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="More itinerary options"
                hitSlop={8}
                onPress={() => undefined}
              >
                <SymbolView
                  name={{ ios: "ellipsis", android: "more_horiz" }}
                  size={22}
                  tintColor={theme.primary}
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.dateRow}>
            <SymbolView
              name={{ ios: "calendar", android: "calendar_month" }}
              size={16}
              tintColor={theme.text}
            />
            <Text style={[styles.date, { color: theme.text }]}>
              {tripDate ? formatDate(tripDate) : "Date to be confirmed"}
            </Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          {itineraryTabs.map((tab, index) => (
            <Pressable
              key={tab}
              accessibilityRole="button"
              accessibilityLabel={tab}
              disabled={index !== 0}
              onPress={() => undefined}
              style={[
                styles.actionTab,
                index === 0 && { borderBottomColor: theme.primary },
              ]}
            >
              <Text
                style={[
                  styles.actionText,
                  { color: index === 0 ? theme.primary : theme.text },
                ]}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>

        <ScrollView
          horizontal
          contentContainerStyle={styles.dayChips}
          showsHorizontalScrollIndicator={false}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="First trip day"
            style={[styles.dayChip, { backgroundColor: theme.primary }]}
          >
            <Text style={styles.selectedDayText}>{getDayLabel(tripDate)}</Text>
          </Pressable>
          {["Day 2", "Day 3", "Day 4"].map((day) => (
            <Pressable
              key={day}
              accessibilityRole="button"
              accessibilityLabel={day}
              style={styles.dayChip}
            >
              <Text style={[styles.dayText, { color: theme.text }]}>{day}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.dayHeadingRow}>
          <Text style={[styles.dayTitle, { color: theme.text }]}>
            {getDayTitle(tripDate)}
          </Text>
        </View>

        <View style={styles.timeline}>
          {stops.map((stop, index) => {
            const travelEstimate =
              travelEstimates[index] ?? travelEstimates[0];

            return (
              <View key={stop.id} style={styles.stopRow}>
                <View style={styles.timelineRail}>
                  <View
                    style={[
                      styles.timelineDot,
                      { borderColor: theme.primary },
                    ]}
                  />
                  {index < stops.length - 1 && (
                    <View
                      style={[
                        styles.timelineLine,
                        { backgroundColor: colorPallet.border },
                      ]}
                    />
                  )}
                </View>

                <Text style={[styles.stopTime, { color: theme.text }]}>
                  {formatTime(stop.arrival_time)}
                </Text>

                <PlaceImage
                  accessibilityLabel={`${getPlaceName(stop)} image`}
                  style={styles.stopImage}
                  uri={getPlaceImageUrl(stop.place_id)}
                />

                <View style={styles.stopDetails}>
                  <Text style={[styles.placeName, { color: theme.text }]}>
                    {getPlaceName(stop)}
                  </Text>
                  <Text style={[styles.placeMeta, { color: theme.text }]}>
                    {getPlaceHours(stop)}
                  </Text>
                  {index < stops.length - 1 && (
                    <View style={styles.travelRow}>
                      <SymbolView
                        name={travelEstimate.icon}
                        size={18}
                        tintColor={theme.text}
                      />
                      <Text style={[styles.travelText, { color: theme.text }]}>
                        {travelEstimate.minutes} mins
                      </Text>
                      <Text
                        style={[styles.travelSeparator, { color: theme.text }]}
                      >
                        •
                      </Text>
                      <Text style={[styles.travelText, { color: theme.text }]}>
                        {travelEstimate.distance}
                      </Text>
                      <SymbolView
                        name={{ ios: "chevron.down.circle.fill", android: "arrow_drop_down", }}
                        size={18}
                        tintColor={theme.text}
                      />
                      <Text
                        style={[styles.directionsText, { color: theme.primary }]}
                      >
                        Directions
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  heroPlaceholder: {
    alignItems: "center",
    height: 180,
    justifyContent: "center",
    overflow: "hidden",
    paddingHorizontal: spacing.md,
    paddingTop: 0,
    position: "relative",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.28)",
  },
  backButton: {
    alignSelf: "flex-start",
    left: spacing.md,
    position: "absolute",
    top: spacing.md,
  },
  tripSummary: {
    borderRadius: radious.sm,
    elevation: 3,
    marginHorizontal: spacing.md,
    marginTop: -44,
    padding: spacing.sm,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
  },
  summaryHeading: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryCopy: {
    flex: 1,
  },
  summaryActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    paddingTop: spacing.xxs,
  },
  kicker: {
    fontSize: fontSizes.caption,
  },
  destination: {
    fontSize: fontSizes.heading,
    fontWeight: fontWeights.medium,
    marginBottom: spacing.sm,
  },
  dateRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xxs,
  },
  date: {
    fontSize: fontSizes.caption,
  },
  actionRow: {
    borderBottomColor: colorPallet.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: spacing.md,
  },
  actionTab: {
    alignItems: "center",
    borderBottomColor: "transparent",
    borderBottomWidth: 2,
    minWidth: 72,
    paddingBottom: spacing.xs,
  },
  actionText: {
    fontSize: fontSizes.label,
    fontWeight: fontWeights.medium,
  },
  dayChips: {
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  dayChip: {
    alignItems: "center",
    backgroundColor: "#E2E2E2",
    borderRadius: radious.pill,
    justifyContent: "center",
    minHeight: 34,
    minWidth: 64,
    paddingHorizontal: spacing.sm,
  },
  selectedDayText: {
    color: "#FFFFFF",
    fontSize: fontSizes.caption,
    fontWeight: fontWeights.medium,
  },
  dayText: {
    fontSize: fontSizes.caption,
  },
  dayHeadingRow: {
    alignItems: "baseline",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
  },
  dayTitle: {
    flex: 1,
    fontSize: fontSizes.heading,
    fontWeight: fontWeights.medium,
  },
  timeline: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  stopRow: {
    flexDirection: "row",
    gap: spacing.xs,
    minHeight: 100,
  },
  timelineRail: {
    alignItems: "center",
    alignSelf: "stretch",
    width: 18,
  },
  timelineDot: {
    backgroundColor: "#FFFFFF",
    borderRadius: radious.pill,
    borderWidth: 2,
    height: 16,
    width: 16,
  },
  timelineLine: {
    flex: 1,
    marginTop: spacing.xxs,
    width: 2,
  },
  stopTime: {
    fontSize: fontSizes.caption,
    paddingTop: spacing.xxs / 4,
    width: 62,
  },
  stopImage: {
    borderRadius: radious.sm,
    height: 52,
    width: 52,
  },
  stopDetails: {
    flex: 1,
    gap: spacing.xxs,
    paddingTop: spacing.xxs,
  },
  travelRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xxs,
    marginTop: spacing.xxs,
  },
  travelText: {
    fontSize: fontSizes.caption,
  },
  travelSeparator: {
    fontSize: fontSizes.body,
    fontWeight: fontWeights.bold,
  },
  placeName: {
    fontSize: fontSizes.label,
    fontWeight: fontWeights.medium,
  },
  placeMeta: {
    fontSize: fontSizes.caption,
  },
  directionsText: {
    fontSize: fontSizes.caption,
    fontWeight: fontWeights.medium,
  },
});
