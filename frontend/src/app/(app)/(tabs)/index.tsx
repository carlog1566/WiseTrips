import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Image } from "expo-image";
import { useState } from "react";
import type { StyleProp, ImageStyle } from "react-native";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SymbolView } from "expo-symbols";
import { useTheme } from "@/hooks/use-theme";
import { colorPallet, fontSizes, fontWeights, radious, spacing } from "@/constants/tokens";
import {
  createItineraryQueryKey,
  type RecentItinerary,
} from "@/itinerary/itinerary";
const imagePlaceholder = require("@/assets/images/placeholder.png");

const featuredGuides = [
  { 
    title: "New York Guide", 
    subtitle: "Description", 
    color: "#D7E8E8",
    imageUrl: "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=600&q=80"
  },
  { 
    title: "Tokyo Guide", 
    subtitle: "Description", 
    color: "#E5D6D1",
    imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=80"
  },
  { 
    title: "Paris Guide", 
    subtitle: "Description", 
    color: "#DDE4D3",
    imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80"
  },
];

const popularTrips = [
  { 
    title: "New York", 
    color: "#C4DDE3",
    imageUrl: "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=500&q=80"
  },
  { 
    title: "Italy", 
    color: "#E4D7CD",
    imageUrl: "https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=500&q=80"
  },
  { 
    title: "Japan", 
    color: "#D5DCE8",
    imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=500&q=80"
  },
  { 
    title: "Iceland", 
    color: "#D6E5E0",
    imageUrl: "https://images.unsplash.com/photo-1504829857797-ddff29c27927?auto=format&fit=crop&w=500&q=80"
  },
];

function formatRecentDate(tripDate: string) {
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

function DestinationImage({
  uri,
  style,
  accessibilityLabel,
}: {
  uri: string;
  style: StyleProp<ImageStyle>;
  accessibilityLabel: string;
}) {
  const [hasError, setHasError] = useState(false);

  return (
    <Image
      accessibilityLabel={accessibilityLabel}
      contentFit="cover"
      onError={() => setHasError(true)}
      placeholder={imagePlaceholder}
      placeholderContentFit="cover"
      source={hasError ? imagePlaceholder : { uri }}
      style={style}
      transition={200}
    />
  );
}

export default function HomeScreen() {
  const theme = useTheme();
  const { data: recentItinerary } = useQuery<RecentItinerary | null>({
    queryKey: createItineraryQueryKey("recent"),
    queryFn: async () => null,
    initialData: null,
    staleTime: Infinity,
  });

  function openRecentItinerary() {
    if (!recentItinerary) {
      return;
    }

    router.push({
      pathname: "/itinerary",
      params: {
        destination: recentItinerary.destination,
        itinerary: JSON.stringify(recentItinerary.itinerary),
        tripDate: recentItinerary.tripDate,
      },
    } as never);
  }

  return (
    <ScrollView 
      style={[styles.screen, { backgroundColor: theme.background }]} 
      contentContainerStyle={styles.content} 
      showsVerticalScrollIndicator={false}
    >

      <View style={[styles.searchBox, { borderColor: colorPallet.border }]}>
        <SymbolView name={{ ios: "magnifyingglass", android: "search" }} size={20} tintColor={theme.text} />
        <TextInput 
          accessibilityLabel="Search places or users" 
          placeholder="Search places or users" 
          placeholderTextColor={colorPallet.muted} 
          style={[styles.searchInput, { color: theme.text }]} 
        />
      </View>

      {recentItinerary ? (
        <>
          <View style={styles.sectionHeading}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Continue planning</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="See all itineraries"
              onPress={() => router.navigate("/(app)/(tabs)/trips")}
            >
              <Text style={[styles.seeAll, { color: theme.primary }]}>See all</Text>
            </Pressable>
          </View>

          <Pressable 
            accessibilityRole="button" 
            accessibilityLabel={`Continue planning your trip to ${recentItinerary.destination}`} 
            onPress={openRecentItinerary}
            style={({ pressed }) => [
              styles.continueCard, 
              pressed && styles.pressed
            ]}
          >
            <DestinationImage 
              uri={featuredGuides[0].imageUrl} 
              accessibilityLabel={`${recentItinerary.destination} destination`} 
              style={StyleSheet.absoluteFill} 
            />
            <View style={styles.continueCardOverlay} />
            
            <View style={styles.continueCopy}>
              <Text style={[styles.cardKicker, styles.continueCardText]}>Travel to</Text>
              <Text style={[styles.continueTitle, styles.continueCardText]}>{recentItinerary.destination}</Text>
              <Text style={[styles.cardMeta, styles.continueCardText]}>
                {formatRecentDate(recentItinerary.tripDate)}
              </Text>
            </View>

            <SymbolView name={{ ios: "chevron.right", android: "chevron_right" }} size={20} tintColor="#FFFFFF" />
          </Pressable>
        </>
      ) : (
        <>
          <View style={styles.sectionHeading}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Continue planning</Text>
          </View>
          
          <Text style={[styles.emptyPlanMessage, { color: theme.textSecondary }]}>You have no itineraries. Would you like to create one?</Text>
          
          <Pressable 
            accessibilityRole="button" 
            accessibilityLabel="Plan a trip" 
            onPress={() => router.navigate("/(app)/trip-preferences")} 
            style={({ pressed }) => [
              styles.emptyPlanButton, 
              { backgroundColor: theme.primary }, 
              pressed && styles.pressed
            ]}
          >
            <Text style={styles.emptyPlanButtonText}>+ Plan a trip</Text>
          </Pressable>
        </>
      )}

      <View style={styles.sectionHeading}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Featured Destinations</Text>
        <Text style={[styles.seeAll, { color: theme.primary }]}>See all</Text>
      </View>

      <View style={styles.featuredRow}>
        {featuredGuides.map((guide) => (
          <Pressable 
            key={guide.title} 
            accessibilityRole="button" 
            accessibilityLabel={`${guide.title} ${guide.subtitle}`} 
            style={({ pressed }) => [styles.guideCard, pressed && styles.pressed]}
          >

            <DestinationImage 
              uri={guide.imageUrl} 
              accessibilityLabel={`${guide.title} destination`} 
              style={styles.guideArt} 
            />

            <Text style={[styles.guideTitle, { color: theme.text }]}>{guide.title}</Text>
            <Text style={[styles.guideSubtitle, { color: colorPallet.muted }]}>{guide.subtitle}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.sectionHeading}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Popular trips</Text>
        <Text style={[styles.seeAll, { color: theme.primary }]}>See all</Text>
      </View>

      <View style={styles.popularRow}>
        {popularTrips.map((trip) => (
          <Pressable 
            key={trip.title} 
            accessibilityRole="button" 
            accessibilityLabel={trip.title} 
            style={({ pressed }) => [styles.popularCard, pressed && styles.pressed]}
          >

            <View style={styles.popularArt}> 
              <DestinationImage 
                uri={trip.imageUrl} 
                accessibilityLabel={`${trip.title} destination`} 
                style={StyleSheet.absoluteFill} 
              />

              <View style={styles.popularLabel}>
                <Text style={styles.popularTitle}>{trip.title}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { 
    flex: 1 
  },
  content: { 
    flexGrow: 1, 
    padding: spacing.lg, 
    gap: spacing.md 
  },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between" },
  brand: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: spacing.xs },
  logo: { 
    width: 32, 
    height: 32 },
  brandName: { 
    fontSize: fontSizes.body, 
    fontWeight: fontWeights.semibold 
  },
  searchBox: { 
    minHeight: 46, 
    borderWidth: 1, 
    borderRadius: radious.pill, 
    paddingHorizontal: spacing.sm, 
    flexDirection: "row", 
    alignItems: "center", 
    gap: spacing.xs 
  },
  searchInput: { 
    flex: 1, 
    fontSize: 
    fontSizes.label, 
    paddingVertical: 
    spacing.xs },
  sectionHeading: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginTop: spacing.xs 
  },
  sectionTitle: { 
    fontSize: fontSizes.body, 
    fontWeight: fontWeights.bold 
  },
  seeAll: { 
    fontSize: 
    fontSizes.label, 
    fontWeight: fontWeights.semibold 
  },
  continueCard: { 
    minHeight: 96, 
    borderRadius: radious.md, 
    padding: spacing.xs, 
    flexDirection: "row", alignItems: "center", 
    gap: spacing.sm,
    overflow: "hidden",
    position: "relative",
  },
  continueCardOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  continueCardText: {
    color: "#FFFFFF",
  },
  artText: { 
    color: "#1A5D67", 
    fontSize: fontSizes.title, 
    fontWeight: fontWeights.bold 
  },
  continueCopy: { 
    flex: 1, 
    gap: 2 
  },
  cardKicker: { 
    fontSize: fontSizes.caption 
  },
  continueTitle: { 
    fontSize: fontSizes.body, 
    fontWeight: fontWeights.semibold 
  },
  cardMeta: { 
    fontSize: fontSizes.caption 
  },
  emptyPlanMessage: { 
    fontSize: fontSizes.body, 
    lineHeight: 22 
  },
  emptyPlanButton: { 
    minHeight: 50, 
    borderRadius: radious.md, 
    alignItems: "center", 
    justifyContent: "center", 
    paddingHorizontal: spacing.lg, 
    marginTop: spacing.sm 
  },
  emptyPlanButtonText: { 
    color: "#FFFFFF", 
    fontSize: fontSizes.body, 
    fontWeight: fontWeights.semibold 
  },
  featuredRow: { 
    flexDirection: "row", 
    gap: spacing.sm },
  guideCard: { 
    flex: 1, 
    minWidth: 0 
  },
  guideArt: { 
    height: 92, 
    borderRadius: radious.sm, 
    alignItems: "center", 
    justifyContent: "center", 
    marginBottom: spacing.xs 
  },
  guideArtText: { 
    color: "#39747A", 
    fontSize: fontSizes.heading, 
    fontWeight: fontWeights.bold 
  },
  guideTitle: { 
    fontSize: fontSizes.label, 
    fontWeight: fontWeights.semibold 
  },
  guideSubtitle: { 
    fontSize: fontSizes.caption, 
    marginTop: 2 
  },
  popularRow: { 
    flexDirection: "row", 
    gap: spacing.sm 
  },
  popularCard: { 
    flex: 1, 
    minWidth: 0 
  },
  popularArt: { 
    width: "100%", 
    aspectRatio: 0.8, 
    borderRadius: radious.sm, 
    alignItems: "center", 
    justifyContent: "center", 
    overflow: "hidden" 
  },
  popularArtText: { 
    color: "rgba(57,116,122,0.72)", 
    fontSize: fontSizes.label, 
    fontWeight: fontWeights.bold 
  },
  popularLabel: { 
    position: "absolute", 
    left: 0, 
    right: 0, 
    bottom: 0, 
    paddingHorizontal: spacing.xs, 
    paddingVertical: spacing.xs, 
    backgroundColor: "rgba(0,0,0,0.4)" 
  },
  popularTitle: { 
    color: "#FFFFFF", 
    fontSize: fontSizes.caption, 
    fontWeight: fontWeights.semibold 
  },
  planButton: { 
    minHeight: 50, 
    borderRadius: radious.md, 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    gap: spacing.xs, 
    marginTop: spacing.sm 
  },
  planButtonText: { 
    color: "#FFFFFF", 
    fontSize: fontSizes.body, 
    fontWeight: fontWeights.semibold 
  },
  pressed: { 
    opacity: 0.75 
  },
});
