import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { View, StyleSheet, ScrollView, Platform, ScrollViewProps, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { gradients } from "@/lib/theme";

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  refreshControl?: ScrollViewProps["refreshControl"];
  noPadding?: boolean;
  noTopInset?: boolean;
  noBottomInset?: boolean;
}

export function Screen({
  children,
  scroll = false,
  style,
  contentContainerStyle,
  refreshControl,
  noPadding = false,
  noTopInset = false,
  noBottomInset = false,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const top = noTopInset ? 0 : Platform.OS === "web" ? Math.max(insets.top, 24) : insets.top;
  const bottom = noBottomInset ? 0 : Platform.OS === "web" ? Math.max(insets.bottom, 16) : insets.bottom;

  const padding = noPadding ? {} : { paddingHorizontal: 20, paddingTop: top + 12, paddingBottom: bottom + 12 };

  const Inner = scroll ? ScrollView : View;
  const innerProps: any = scroll
    ? {
        contentContainerStyle: [padding, contentContainerStyle],
        showsVerticalScrollIndicator: false,
        refreshControl,
        keyboardShouldPersistTaps: "handled" as const,
      }
    : { style: [padding, contentContainerStyle] };

  return (
    <View style={[styles.root, style]}>
      <LinearGradient colors={gradients.bg} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />
      <View style={styles.glow1} />
      <View style={styles.glow2} />
      <Inner style={!scroll ? undefined : styles.flex} {...innerProps}>
        {children}
      </Inner>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#07111F" },
  flex: { flex: 1 },
  glow1: {
    position: "absolute",
    top: -120,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 999,
    backgroundColor: "rgba(245,185,66,0.10)",
  },
  glow2: {
    position: "absolute",
    bottom: -160,
    left: -80,
    width: 360,
    height: 360,
    borderRadius: 999,
    backgroundColor: "rgba(59,130,246,0.10)",
  },
});
