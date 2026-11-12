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
          headerTitle: "Itinerary",
          headerTintColor: "black",
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
    </Stack>
  );
}
