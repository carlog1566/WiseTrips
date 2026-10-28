import { useTheme } from "@/hooks/use-theme";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Animated,
  ScrollView,
  Platform,
  Keyboard,
} from "react-native";
import {
  fontSizes,
  spacing,
  fontWeights,
  colorPallet,
  radious,
} from "@/constants/tokens";
import { useRef, useState } from "react";
import { SymbolView } from "expo-symbols";
import DateTimePicker from "@expo/ui/community/datetime-picker";
import CustomTextInput from "@/components/text-input";

const transportationOptions = [
  {
    value: "walking",
    label: "Walking",
    icon: { ios: "figure.walk", android: "directions_walk" },
  },
  {
    value: "publicTransit",
    label: "Public\nTransit",
    icon: { ios: "bus", android: "directions_bus" },
  },
  {
    value: "car",
    label: "Car",
    icon: { ios: "car.side", android: "directions_car" },
  },
  {
    value: "rideshare",
    label: "Rideshare",
    icon: { ios: "car", android: "local_taxi" },
  },
] as const;

type TransportationMethod = (typeof transportationOptions)[number]["value"];

const interestOptions = [
  {
    value: "relaxed",
    label: "Relaxed",
    icon: { ios: "chair.lounge", android: "chair" },
  },
  {
    value: "foodFocused",
    label: "Food-focused",
    icon: { ios: "fork.knife", android: "restaurant" },
  },
  {
    value: "touristFocused",
    label: "Tourist-\nfocused",
    icon: { ios: "camera", android: "photo_camera" },
  },
] as const;

type Interest = (typeof interestOptions)[number]["value"];

type DestinationField = {
  id: number;
  value: string;
};

type TripPreferences = {
  destinations: string[];
  startLocation: string;
  startDate: Date;
  endDate: Date;
  startTime: Date;
  endTime: Date;
  budget: string;
  transportationMethod: TransportationMethod;
  interests: Interest[];
};

export default function HomeScreen() {
  const theme = useTheme();

  const [destinations, setDestinations] = useState<DestinationField[]>([
    { id: 0, value: "" },
  ]);
  const nextDestinationId = useRef(1);
  const [startLocation, setStartLocation] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [budget, setBudget] = useState("");
  const [transportationMethod, setTransportationMethod] =
    useState<TransportationMethod>("walking");
  const [interests, setInterests] = useState<Interest[]>([]);

  const onPress = () => {
    const preferences: TripPreferences = {
      destinations: destinations
        .map((destination) => destination.value.trim())
        .filter((destination) => destination.length > 0),
      startLocation,
      startDate,
      endDate,
      startTime,
      endTime,
      budget,
      transportationMethod,
      interests,
    };

    console.log(preferences);
  };

  const [btnScale] = useState(() => new Animated.Value(1));
  const pressIn = () =>
    Animated.spring(btnScale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  const pressOut = () =>
    Animated.spring(btnScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.safe}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      automaticallyAdjustKeyboardInsets
    >
      <View style={styles.section}>
        <Text style={styles.label}>Where to?</Text>
        {destinations.map((destination, index) => (
          <CustomTextInput
            key={destination.id}
            icon={{ ios: "magnifyingglass", android: "search" }}
            value={destination.value}
            autoCapitalize="words"
            autoCorrect={true}
            onChangeText={(text) =>
              setDestinations((current) =>
                current.map((field) =>
                  field.id === destination.id ? { ...field, value: text } : field,
                ),
              )
            }
            onRemove={
              index > 0
                ? () =>
                    setDestinations((current) =>
                      current.filter((field) => field.id !== destination.id),
                    )
                : undefined
            }
            placeholder={
              index === 0 ? "Enter destination" : "Enter another destination"
            }
          />
        ))}
        <Pressable
          style={({ pressed }) => [
            styles.textButtonContainer,
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => {
            const id = nextDestinationId.current++;
            setDestinations((current) => [...current, { id, value: "" }]);
          }}
        >
          <Text style={styles.text}>+ Add More</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>From?</Text>
        <CustomTextInput
          icon={{ ios: "mappin", android: "location_on" }}
          value={startLocation}
          autoCapitalize="words"
          autoCorrect={true}
          onChangeText={setStartLocation}
          placeholder="Starting location"
        />
      </View>

      <View style={styles.dateTimeSection}>
        <View style={styles.dateTimeColumn}>
          <Text style={styles.label}>Start Date</Text>

          <View
            style={[
              styles.dateTimeContainer,
              showStartPicker && {
                borderColor: theme.primary,
                backgroundColor: theme.primaryBackground,
              },
            ]}
          >
            <SymbolView
              name={{ ios: "calendar", android: "calendar_month" }}
              size={20}
              tintColor={colorPallet.muted}
            />
            <Pressable
              onPress={() => {
                Keyboard.dismiss();
                setShowStartPicker(!showStartPicker);
                setShowEndPicker(false);
                setShowStartTimePicker(false);
                setShowEndTimePicker(false);
              }}
            >
              <Text style={{ fontSize: fontSizes.body, color: theme.text }}>
                {startDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.dateTimeColumn}>
          <Text style={styles.label}>End Date</Text>

          <View
            style={[
              styles.dateTimeContainer,
              showEndPicker && {
                borderColor: theme.primary,
                backgroundColor: theme.primaryBackground,
              },
            ]}
          >
            <SymbolView
              name={{ ios: "calendar", android: "calendar_month" }}
              size={20}
              tintColor={colorPallet.muted}
            />
            <Pressable
              onPress={() => {
                Keyboard.dismiss();
                setShowEndPicker(!showEndPicker);
                setShowStartPicker(false);
                setShowStartTimePicker(false);
                setShowEndTimePicker(false);
              }}
            >
              <Text style={{ fontSize: fontSizes.body, color: theme.text }}>
                {endDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          presentation="dialog"
          onDismiss={() => setShowStartPicker(false)}
          accentColor={theme.primary}
          themeVariant="light"
          minimumDate={new Date()}
          onValueChange={(_, date) => {
            setStartDate(date);

            if (date > endDate) {
              setEndDate(date);
            }

            setShowStartPicker(false);
          }}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          presentation="dialog"
          onDismiss={() => setShowEndPicker(false)}
          accentColor={theme.primary}
          themeVariant="light"
          minimumDate={startDate}
          onValueChange={(_, date) => {
            setEndDate(date);
            setShowEndPicker(false);
          }}
        />
      )}
      <View style={styles.dateTimeSection}>
        <View style={styles.dateTimeColumn}>
          <Text style={styles.label}>Start Time</Text>

          <View
            style={[
              styles.dateTimeContainer,
              showStartTimePicker && {
                borderColor: theme.primary,
                backgroundColor: theme.primaryBackground,
              },
            ]}
          >
            <SymbolView
              name={{ ios: "clock", android: "schedule" }}
              size={20}
              tintColor={colorPallet.muted}
            />
            <Pressable
              onPress={() => {
                Keyboard.dismiss();
                setShowStartTimePicker(!showStartTimePicker);
                setShowEndTimePicker(false);
                setShowStartPicker(false);
                setShowEndPicker(false);
              }}
            >
              <Text style={{ fontSize: fontSizes.body, color: theme.text }}>
                {startTime.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.dateTimeColumn}>
          <Text style={styles.label}>End Time</Text>

          <View
            style={[
              styles.dateTimeContainer,
              showEndTimePicker && {
                borderColor: theme.primary,
                backgroundColor: theme.primaryBackground,
              },
            ]}
          >
            <SymbolView
              name={{ ios: "clock", android: "schedule" }}
              size={20}
              tintColor={colorPallet.muted}
            />
            <Pressable
              onPress={() => {
                Keyboard.dismiss();
                setShowEndTimePicker(!showEndTimePicker);
                setShowStartTimePicker(false);
                setShowStartPicker(false);
                setShowEndPicker(false);
              }}
            >
              <Text style={{ fontSize: fontSizes.body, color: theme.text }}>
                {endTime.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {showStartTimePicker && (
        <View>
          <DateTimePicker
            value={startTime}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            presentation="dialog"
            onDismiss={() => setShowStartTimePicker(false)}
            accentColor={theme.primary}
            themeVariant="light"
            onValueChange={(_, time) => {
              setStartTime(time);
              if (Platform.OS === "android") {
                setShowStartTimePicker(false);
              }
            }}
          />
          {Platform.OS === "ios" && (
            <Pressable
              accessibilityRole="button"
              onPress={() => setShowStartTimePicker(false)}
              style={styles.doneButton}
            >
              <Text style={{ color: theme.primary, fontSize: fontSizes.body }}>
                Done
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {showEndTimePicker && (
        <View>
          <DateTimePicker
            value={endTime}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            presentation="dialog"
            onDismiss={() => setShowEndTimePicker(false)}
            accentColor={theme.primary}
            themeVariant="light"
            onValueChange={(_, time) => {
              setEndTime(time);
              if (Platform.OS === "android") {
                setShowEndTimePicker(false);
              }
            }}
          />
          {Platform.OS === "ios" && (
            <Pressable
              accessibilityRole="button"
              onPress={() => setShowEndTimePicker(false)}
              style={styles.doneButton}
            >
              <Text style={{ color: theme.primary, fontSize: fontSizes.body }}>
                Done
              </Text>
            </Pressable>
          )}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.label}>Budget?</Text>
        <CustomTextInput
          icon={{ ios: "dollarsign", android: "attach_money" }}
          value={budget}
          onChangeText={setBudget}
          placeholder="0.00"
          inputMode="decimal"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Transportation Method</Text>
        <View style={styles.transportationOptions}>
          {transportationOptions.map((option) => {
            const selected = transportationMethod === option.value;
            const color = selected ? theme.primary : theme.text;

            return (
              <Pressable
                key={option.value}
                onPress={() => setTransportationMethod(option.value)}
                style={({ pressed }) => [
                  styles.transportationOption,
                  selected && {
                    borderColor: theme.primary,
                    backgroundColor: "#D9EDFF",
                  },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <SymbolView name={option.icon} size={28} tintColor={color} />
                <Text style={[styles.transportationLabel, { color }]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Interests</Text>
        <View style={styles.transportationOptions}>
          {interestOptions.map((option) => {
            const selected = interests.includes(option.value);
            const color = selected ? theme.primary : theme.text;

            return (
              <Pressable
                key={option.value}
                onPress={() =>
                  setInterests((current) =>
                    current.includes(option.value)
                      ? current.filter((interest) => interest !== option.value)
                      : [...current, option.value],
                  )
                }
                style={({ pressed }) => [
                  styles.transportationOption,
                  selected && {
                    borderColor: theme.primary,
                    backgroundColor: "#D9EDFF",
                  },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <SymbolView name={option.icon} size={28} tintColor={color} />
                <Text style={[styles.transportationLabel, { color }]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <Animated.View style={{ transform: [{ scale: btnScale }] }}>
        <Pressable
          accessibilityRole="button"
          onPress={onPress}
          onPressIn={pressIn}
          onPressOut={pressOut}
          style={({ pressed }) => [
            styles.generateButton,
            { backgroundColor: theme.primary },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={styles.generateButtonText}>Generate Itinerary</Text>
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  generateButton: {
    width: "100%",
    minHeight: 54,
    borderRadius: radious.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  generateButtonText: {
    color: "#ffffff",
    fontSize: fontSizes.body,
    fontWeight: fontWeights.semibold,
    textAlign: "center",
  },
  safe: {
    flexGrow: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  section: {
    justifyContent: "center",
    flexDirection: "column",
    gap: spacing.xs,
  },
  dateTimeSection: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  dateTimeColumn: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  transportationOptions: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  transportationOption: {
    flex: 1,
    minWidth: 0,
    minHeight: 104,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.xxs,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: radious.md,
    backgroundColor: "#F5F5F7",
  },
  transportationLabel: {
    fontSize: fontSizes.caption,
    fontWeight: fontWeights.medium,
    textAlign: "center",
    minHeight: 32,
    lineHeight: 16,
  },
  label: {
    fontSize: fontSizes.heading,
    fontWeight: fontWeights.bold,
  },
  text: {
    fontSize: fontSizes.body,
  },
  textButtonContainer: {
    alignItems: "center",
  },
  doneButton: {
    alignSelf: "flex-end",
    padding: spacing.sm,
    minHeight: 44,
    justifyContent: "center",
  },
  dateTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    minHeight: 54,
    borderWidth: 1,
    borderColor: colorPallet.border,
    borderRadius: radious.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
});
