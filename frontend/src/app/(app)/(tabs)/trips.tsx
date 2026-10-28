import { useTheme } from "@/hooks/use-theme";
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { router } from 'expo-router';



export default function HomeScreen() {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Pressable onPress={() => router.push('/(app)/trip-preferences')}>
        <Text>Go to trip preferences</Text>
      </Pressable>
    </View>
  );
}

const style = StyleSheet.create({
  
})
