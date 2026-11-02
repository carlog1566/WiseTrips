import { useTheme } from "@/hooks/use-theme";
import { Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";

export default function TabsLayout() {
  const theme = useTheme();
  return (
    <Tabs
      screenOptions={{
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.text,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          
          tabBarIcon: ({ focused }) => (
            <SymbolView
              name={{
                ios: "house.fill",
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

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <SymbolView
              name={{
                ios: "person",
                android: "person",
              }}
              tintColor={focused ? theme.primary : "black"}
            />
          ),
        }}
      />
    </Tabs>
  );
}
