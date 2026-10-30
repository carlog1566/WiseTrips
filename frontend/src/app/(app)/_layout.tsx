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
    </Stack>
  );
}

// options={{
//           headerShown: true,
//           headerTitle: word,
//           headerRight: () => (
//             <Pressable
//               onPress={confirmDelete}
//               hitSlop={12}
//               accessibilityRole="button"
//               accessibilityLabel="Remove word"
//               style={({ pressed }) => [
//                 styles.headerBtn,
//                 styles.headerBtnRight,
//                 pressed && styles.pressedDim,
//               ]}
//             >
//               <TrashIcon color={colors.textMuted} />
//             </Pressable>
//           ),
//         }}
