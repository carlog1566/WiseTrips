import { useState, type ComponentProps } from "react";
import {
  View,
  TextInput as NativeTextInput,
  StyleSheet,
  type TextInputProps,
} from "react-native";
import { SymbolView } from "expo-symbols";
import { useTheme } from "@/hooks/use-theme";
import { colorPallet, fontSizes, spacing, radious } from "@/constants/tokens";

type Props = TextInputProps & {
  icon: ComponentProps<typeof SymbolView>["name"];
};

export default function CustomTextInput({
  icon,
  style,
  onFocus,
  onBlur,
  ...props
}: Props) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={[
        styles.container,
        focused && { borderColor: theme.primary },
      ]}
    >
      <SymbolView name={icon} size={20} tintColor={colorPallet.muted} />
      <NativeTextInput
        placeholderTextColor={colorPallet.muted}
        {...props}
        style={[styles.input, { color: theme.text }, style]}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colorPallet.border,
    borderRadius: radious.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontSize: fontSizes.body,
  },
});
