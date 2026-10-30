import { useTheme } from "@/hooks/use-theme";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { router } from "expo-router";
import { fontSizes, fontWeights, radious, spacing } from "@/constants/tokens";

export default function HomeScreen() {
  const theme = useTheme();
  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <Pressable
        onPress={() => router.push("/(app)/trip-preferences")}
        style={({ pressed }) => [
          styles.planButton,
          { backgroundColor: theme.primary },
          pressed && { opacity: 0.7 },
        ]}
      >
        <Text style={styles.planButtonText}>+ Plan a trip</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  planButton: {
    width: "100%",
    minHeight: 54,
    borderRadius: radious.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  planButtonText: {
    color: "#ffffff",
    fontSize: fontSizes.body,
    fontWeight: fontWeights.semibold,
    textAlign: "center",
  },
});
