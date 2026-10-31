import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SymbolView } from "expo-symbols";
import { useTheme } from "@/hooks/use-theme";
import { colorPallet, fontSizes, fontWeights, radious, spacing } from "@/constants/tokens";

const featuredGuides = [
  { 
    title: "New York Guide", 
    subtitle: "Description", 
    color: "#D7E8E8"
  },
  { 
    title: "Tokyo Guide", 
    subtitle: "Description", 
    color: "#E5D6D1"
  },
  { 
    title: "Paris Guide", 
    subtitle: "Description", 
    color: "#DDE4D3"
  },
];

const popularTrips = [
  { 
    title: "New York", 
    color: "#C4DDE3"
  },
  { 
    title: "Italy", 
    color: "#E4D7CD"
  },
  { 
    title: "Japan", 
    color: "#D5DCE8"
  },
  { 
    title: "Iceland", 
    color: "#D6E5E0"
  },
];

export default function HomeScreen() {
  const theme = useTheme();
  const { recentDestination, recentDates } = useLocalSearchParams<{
    recentDestination?: string;
    recentDates?: string;
  }>();
  const hasRecentItinerary = Boolean(recentDestination);

  return (
    <ScrollView 
      style={[styles.screen, { backgroundColor: theme.background }]} 
      contentContainerStyle={styles.content} 
      showsVerticalScrollIndicator={false}
    >

      <View style={styles.header}>

        <View style={styles.brand}>
          <Image 
            accessibilityLabel="WiseTrips logo" 
            contentFit="contain" 
            source={require("@/assets/images/wisetrips-logo.png")} 
            style={styles.logo} 
          />

          <Text style={[styles.brandName, { color: theme.text }]}>WiseTrips</Text>
        </View>
        
        <Pressable accessibilityRole="button" accessibilityLabel="Notifications" hitSlop={10}>
          <SymbolView name={{ ios: "bell", android: "notifications_none" }} size={24} tintColor={theme.text} />
        </Pressable>

      </View>

      <View style={[styles.searchBox, { borderColor: colorPallet.border }]}>
        <SymbolView name={{ ios: "magnifyingglass", android: "search" }} size={20} tintColor={theme.text} />
        <TextInput 
          accessibilityLabel="Search places or users" 
          placeholder="Search places or users" 
          placeholderTextColor={colorPallet.muted} 
          style={[styles.searchInput, { color: theme.text }]} 
        />
      </View>

      {hasRecentItinerary ? (
        <>
          <View style={styles.sectionHeading}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Plan</Text>
            <Text style={[styles.seeAll, { color: theme.primary }]}>See all</Text>
          </View>

          <Pressable 
            accessibilityRole="button" 
            accessibilityLabel={`Continue planning your trip to ${recentDestination}`} 
            onPress={() => router.navigate("/(app)/trip-preferences")} 
            style={({ pressed }) => [styles.continueCard, { backgroundColor: theme.primaryBackground }, 
            pressed && styles.pressed]}
          >

            <View style={[styles.destinationArt, { backgroundColor: "#B5D4D8" }]}>
              <Text style={styles.artText}>TRIP</Text>
            </View>

            <View style={styles.continueCopy}>
              <Text style={[styles.cardKicker, { color: colorPallet.muted }]}>Continue planning</Text>
              <Text style={[styles.continueTitle, { color: theme.text }]}>{recentDestination}</Text>
              <Text style={[styles.cardMeta, { color: colorPallet.muted }]}>{recentDates ?? "Trip preferences saved"}</Text>
            </View>

            <SymbolView 
              name={{ ios: "chevron.right", android: "chevron_right" }} 
              size={20} tintColor={theme.primary} 
            />
          </Pressable>
        </>
      ) : null}

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

            <View style={[styles.guideArt, { backgroundColor: guide.color }]}>
              <Text style={styles.guideArtText}>{guide.icon}</Text>
            </View>

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

            <View style={[styles.popularArt, { backgroundColor: trip.color }]}> 
              <Text style={styles.popularArtText}>{trip.icon}</Text>

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
    gap: spacing.sm 
  },
  destinationArt: { 
    width: 84, 
    height: 80, 
    borderRadius: radious.sm, 
    alignItems: "center", 
    justifyContent: "center" 
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
    backgroundColor: "rgba(0,0,0,0.2)" 
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