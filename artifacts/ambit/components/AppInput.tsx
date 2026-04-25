import React from "react";
import { View, Text, TextInput, StyleSheet, TextInputProps, ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, radius, font } from "@/lib/theme";

interface Props extends TextInputProps {
  label?: string;
  icon?: keyof typeof Feather.glyphMap;
  containerStyle?: ViewStyle;
  multiline?: boolean;
  error?: string | null;
}

export function AppInput({ label, icon, containerStyle, multiline, error, style, ...rest }: Props) {
  return (
    <View style={[{ width: "100%" }, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.wrap,
          multiline && { minHeight: 96, alignItems: "flex-start", paddingVertical: 12 },
          error && { borderColor: colors.error },
        ]}
      >
        {icon && (
          <Feather
            name={icon}
            size={18}
            color={colors.textMuted}
            style={{ marginRight: 10, marginTop: multiline ? 2 : 0 }}
          />
        )}
        <TextInput
          placeholderTextColor={colors.textDim}
          style={[styles.input, multiline && { minHeight: 80, textAlignVertical: "top" }, style]}
          multiline={multiline}
          {...rest}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.textMuted,
    fontSize: 13,
    fontFamily: font.medium,
    marginBottom: 8,
  },
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    paddingHorizontal: 14,
    minHeight: 52,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontFamily: font.regular,
    fontSize: 15,
    paddingVertical: 0,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
    fontFamily: font.medium,
  },
});
