import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="trip-preferences"
        options={{
          headerShown: true,
          headerBackButtonDisplayMode: "minimal",
          headerTitle: "Trip Preferences",
          headerTintColor: "black",
        }}
      />
      <Stack.Screen
        name="itinerary"
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}
