import type { ExpoConfig } from "expo/config";

export default ({ config }: { config: ExpoConfig }): ExpoConfig => ({
  ...config,
  plugins: [
    ...(config.plugins ?? []),
    "expo-web-browser",
    [
      "react-native-maps",
      {
        androidGoogleMapsApiKey:
          process.env.GOOGLE_MAPS_ANDROID_API_KEY ??
          process.env.GOOGLE_MAPS_API_KEY,
      },
    ],
  ],
});
