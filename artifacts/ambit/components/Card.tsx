import React from "react";
import { View, StyleSheet, ViewStyle, Pressable } from "react-native";
import { colors, radius } from "@/lib/theme";

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  glow?: boolean;
  pad?: number;
}

export function Card({ children, style, onPress, glow, pad = 18 }: Props) {
  const inner = (
    <View
      style={[
        styles.card,
        glow && styles.glow,
        { padding: pad },
        style,
      ]}
    >
      {children}
    </View>
  );
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
        {inner}
      </Pressable>
    );
  }
  return inner;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  glow: {
    shadowColor: colors.primary,
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});
