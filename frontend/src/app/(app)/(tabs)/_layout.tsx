import { useTheme } from "@/hooks/use-theme";
import { Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";

export default function TabsLayout() {
  const theme = useTheme();
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <SymbolView
              name={{
                ios: "house",
                android: "home",
              }}
              tintColor={focused ? theme.primary : "black"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: "Trips",
          tabBarIcon: ({ focused }) => (
            <SymbolView
              name={{
                ios: "calendar",
                android: "calendar_month",
              }}
              tintColor={focused ? theme.primary : "black"}
            />
          ),
        }}
      />
    </Tabs>
  );
}
