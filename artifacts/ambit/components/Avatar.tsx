import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { colors, font } from "@/lib/theme";

const PALETTES: Record<string, [string, string]> = {
  A: ["#3B82F6", "#6366F1"],
  B: ["#8B5CF6", "#A855F7"],
  C: ["#EC4899", "#F43F5E"],
  D: ["#10B981", "#059669"],
  E: ["#F5B942", "#FFD76A"],
  F: ["#06B6D4", "#3B82F6"],
};

interface Props {
  name?: string | null;
  style?: string | null;
  url?: string | null;
  size?: number;
  border?: boolean;
}

export function Avatar({ name, style, url, size = 44, border }: Props) {
  const colorsArr = PALETTES[style ?? "A"] ?? PALETTES.A;
  const initial = (name?.trim()?.[0] ?? "?").toUpperCase();
  const radius = size / 2;

  if (url) {
    return (
      <Image
        source={{ uri: url }}
        style={[
          { width: size, height: size, borderRadius: radius, backgroundColor: colors.card },
          border && { borderWidth: 2, borderColor: colors.primary },
        ]}
      />
    );
  }
  return (
    <LinearGradient
      colors={colorsArr}
      style={[
        styles.box,
        { width: size, height: size, borderRadius: radius },
        border && { borderWidth: 2, borderColor: colors.primary },
      ]}
    >
      <Text style={[styles.initial, { fontSize: size * 0.42 }]}>{initial}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: "center", justifyContent: "center" },
  initial: { color: "#fff", fontFamily: font.bold },
});
