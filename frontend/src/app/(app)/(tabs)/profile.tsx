import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/hooks/use-theme";
import { fontSizes, fontWeights, spacing } from "@/constants/tokens";

export default function ProfileScreen() {
  const theme = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Profile</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Your profile will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: spacing.lg, gap: spacing.xs },
  title: { fontSize: fontSizes.title, fontWeight: fontWeights.bold },
  subtitle: { fontSize: fontSizes.body },
});
