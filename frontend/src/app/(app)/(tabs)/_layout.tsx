import { useTheme } from "@/hooks/use-theme";
import { Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Image } from "expo-image";
import { Pressable, StyleSheet, View } from "react-native";

export default function TabsLayout() {
  const theme = useTheme();
  return (
    <Tabs
      screenOptions={{
          tabBarActiveTintColor: theme.primary
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerTitle: "WiseTrips",
          headerLeft: () => (
            <View style={styles.headerBrand}>
              <Image
                accessibilityLabel="WiseTrips logo"
                contentFit="contain"
                source={require("@/assets/images/wisetrips-logo.png")}
                style={styles.headerLogo}
              />
            </View>
          ),
          headerRight: () => (
            <Pressable accessibilityRole="button" accessibilityLabel="Notifications" hitSlop={10} style={styles.headerNotifications}>
              <SymbolView name={{ ios: "bell", android: "notifications_none" }} size={24} tintColor={theme.text} />
            </Pressable>
          ),
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
          headerShown: true,
          headerTitle: "Itinerary",
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

const styles = StyleSheet.create({
  headerBrand: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 8, 
    marginLeft: 16 
  },
  headerLogo: { 
    width: 32, 
    height: 32 
  },
  headerBrandName: { 
    fontSize: 16, 
    fontWeight: "600" 
  },
  headerNotifications: { 
    marginRight: 16 
  },
});
