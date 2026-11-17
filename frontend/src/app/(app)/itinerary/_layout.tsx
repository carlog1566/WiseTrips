import { router, Stack } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable } from "react-native";

export default function ItineraryLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: "Itinerary",
          headerTintColor: "black",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: "rgba(255, 255, 255, 0.12)" },
          headerLeft: () => (
            <Pressable
              onPress={() => router.dismissTo("/(app)/(tabs)")}
              accessibilityRole="button"
              accessibilityLabel="Go home"
              hitSlop={10}
            >
              <SymbolView
                name={{
                  ios: "house.fill",
                  android: "home",
                }}
                tintColor="black"
                size={24}
              />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="map"
        options={{
          headerShown: true,
          headerTitle: "Itinerary Map",
          headerTintColor: "black",
        }}
      />
    </Stack>
  );
}
