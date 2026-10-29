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
import { useState } from "react";
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
    value: "food",
    label: "Food",
    icon: { ios: "fork.knife", android: "restaurant" },
  },
  {
    value: "nature",
    label: "Nature",
    icon: { ios: "leaf", android: "park" },
  },
  {
    value: "shopping",
    label: "Shopping",
    icon: { ios: "bag", android: "shopping_bag" },
  },
  {
    value: "museums",
    label: "Museums",
    icon: { ios: "building.columns", android: "museum" },
  },
  {
    value: "entertainment",
    label: "Entertainment",
    icon: { ios: "ticket", android: "confirmation_number" },
  },
] as const;

type Interest = (typeof interestOptions)[number]["value"];

const paceOptions = [
  {
    value: "relaxed",
    label: "Relaxed",
    icon: { ios: "chair.lounge", android: "chair" },
  },
  {
    value: "moderate",
    label: "Moderate",
    icon: { ios: "figure.walk", android: "directions_walk" },
  },
  {
    value: "packed",
    label: "Packed",
    icon: { ios: "hare", android: "directions_run" },
  },
] as const;

type Pace = (typeof paceOptions)[number]["value"];

type TripPreferencesCreate = {
  destination: string;
  trip_date: string;
  starting_location: string;
  start_time: string;
  end_time: string;
  budget: number;
  transportation_mode: TransportationMethod;
  interests: Interest[];
  pace: Pace;
};

export default function HomeScreen() {
  const theme = useTheme();

  const [destination, setDestination] = useState("");
  const [startLocation, setStartLocation] = useState("");
  const [tripDate, setTripDate] = useState(new Date());
  const [showTripDatePicker, setShowTripDatePicker] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [budget, setBudget] = useState("");
  const [transportationMethod, setTransportationMethod] =
    useState<TransportationMethod>("walking");
  const [interests, setInterests] = useState<Interest[]>([]);
  const [pace, setPace] = useState<Pace>("relaxed");
  const [error, setError] = useState("");

  const onPress = () => {
    setError("");
    const errorMessage = "Please fill in all fields correctly.";

    const startsAt = new Date(tripDate);
    startsAt.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);
    const endsAt = new Date(tripDate);
    endsAt.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);
    const parsedBudget = Number(budget);

    if (
      !startLocation.trim() ||
      !destination.trim() ||
      !transportationMethod ||
      !Number.isFinite(startsAt.getTime()) ||
      !Number.isFinite(endsAt.getTime()) ||
      startsAt.getTime() <= Date.now() ||
      endsAt.getTime() <= startsAt.getTime() ||
      !budget.trim() ||
      !Number.isFinite(parsedBudget) ||
      parsedBudget < 0 ||
      interests.length === 0
    ) {
      setError(errorMessage);
      return;
    }

    const preferences: TripPreferencesCreate = {
      destination: destination.trim(),
      trip_date: `${tripDate.getFullYear()}-${String(
        tripDate.getMonth() + 1,
      ).padStart(2, "0")}-${String(tripDate.getDate()).padStart(2, "0")}`,
      starting_location: startLocation.trim(),
      start_time: startTime.toTimeString().slice(0, 8),
      end_time: endTime.toTimeString().slice(0, 8),
      budget: parsedBudget,
      transportation_mode: transportationMethod,
      interests,
      pace,
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
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      automaticallyAdjustKeyboardInsets
    >
      <View style={styles.section}>
        <Text style={styles.label}>Where to?</Text>
        <CustomTextInput
          icon={{ ios: "magnifyingglass", android: "search" }}
          value={destination}
          autoCapitalize="words"
          autoCorrect={true}
          onChangeText={setDestination}
          placeholder="Enter city or region"
        />
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

      <View style={styles.section}>
        <Text style={styles.label}>Trip Date</Text>
        <Pressable
          onPress={() => {
            Keyboard.dismiss();
            setShowTripDatePicker(!showTripDatePicker);
            setShowStartTimePicker(false);
            setShowEndTimePicker(false);
          }}
          style={[
            styles.dateTimeContainer,
            showTripDatePicker && {
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
          <Text style={{ fontSize: fontSizes.body, color: theme.text }}>
            {tripDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
        </Pressable>
      </View>

      {showTripDatePicker && (
        <DateTimePicker
          value={tripDate}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          presentation="dialog"
          onDismiss={() => setShowTripDatePicker(false)}
          accentColor={theme.primary}
          themeVariant="light"
          minimumDate={new Date()}
          onValueChange={(_, date) => {
            setTripDate(date);
            setShowTripDatePicker(false);
          }}
        />
      )}

      <View style={styles.dateTimeSection}>
        <View style={styles.dateTimeColumn}>
          <Text style={styles.label}>Start Time</Text>
          <Pressable
            onPress={() => {
              Keyboard.dismiss();
              setShowStartTimePicker(!showStartTimePicker);
              setShowEndTimePicker(false);
              setShowTripDatePicker(false);
            }}
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
            <Text style={{ fontSize: fontSizes.body, color: theme.text }}>
              {startTime.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}
            </Text>
          </Pressable>
        </View>

        <View style={styles.dateTimeColumn}>
          <Text style={styles.label}>End Time</Text>
          <Pressable
            accessibilityLabel="End Time"
            onPress={() => {
              Keyboard.dismiss();
              setShowEndTimePicker(!showEndTimePicker);
              setShowStartTimePicker(false);
              setShowTripDatePicker(false);
            }}
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
            <Text style={{ fontSize: fontSizes.body, color: theme.text }}>
              {endTime.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}
            </Text>
          </Pressable>
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
            const color = selected ? theme.background : theme.text;
            return (
              <Pressable
                key={option.value}
                onPress={() => setTransportationMethod(option.value)}
                style={({ pressed }) => [
                  styles.transportationOption,
                  selected && {
                    borderColor: theme.primary,
                    backgroundColor: theme.primary,
                    borderRadius: radious.md,
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
        <View style={styles.interestOptions}>
          {interestOptions.map((option) => {
            const selected = interests.includes(option.value);
            const color = selected ? theme.background : theme.text;
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
                  styles.interestOption,
                  selected && {
                    borderColor: theme.primary,
                    backgroundColor: theme.primary,
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
        <Text style={styles.label}>Pace</Text>
        <View style={styles.transportationOptions}>
          {paceOptions.map((option) => {
            const selected = pace === option.value;
            const color = selected ? theme.background : theme.text;
            return (
              <Pressable
                key={option.value}
                onPress={() => setPace(option.value)}
                style={({ pressed }) => [
                  styles.transportationOption,
                  selected && {
                    borderColor: theme.primary,
                    backgroundColor: theme.primary,
                    borderRadius: radious.md,
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

      {error ? (
        <Text accessibilityRole="alert" style={styles.errorText}>
          {error}
        </Text>
      ) : null}

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
  errorText: {
    color: colorPallet.error,
    fontSize: fontSizes.label,
  },
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
    backgroundColor: colorPallet.surface,
  },
  // Five interests don't fit in one row, so they wrap (3 per row)
  interestOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  interestOption: {
    flexGrow: 1,
    flexBasis: "30%",
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
    backgroundColor: colorPallet.surface,
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