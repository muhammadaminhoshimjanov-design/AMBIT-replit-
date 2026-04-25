import { LinearGradient } from "expo-linear-gradient";
import React, { useRef } from "react";
import { Animated, Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, gradients, radius, font } from "@/lib/theme";

interface Props {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Feather.glyphMap;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  style?: ViewStyle;
  small?: boolean;
}

export function PrimaryButton({ title, onPress, loading, disabled, icon, variant = "primary", style, small }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const handleIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 30, bounciness: 0 }).start();
  const handleOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }).start();

  const height = small ? 44 : 58;
  const isPrimary = variant === "primary";
  const isDanger = variant === "danger";
  const isSecondary = variant === "secondary";
  const isGhost = variant === "ghost";

  const textColor = isPrimary ? "#07111F" : isDanger ? "#fff" : colors.text;

  const content = (
    <View style={styles.row}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {icon && <Feather name={icon} size={small ? 16 : 18} color={textColor} style={{ marginRight: 8 }} />}
          <Text style={[styles.text, { color: textColor, fontSize: small ? 14 : 17 }]}>{title}</Text>
        </>
      )}
    </View>
  );

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        disabled={disabled || loading}
        onPress={onPress}
        onPressIn={handleIn}
        onPressOut={handleOut}
        style={{ opacity: disabled ? 0.5 : 1 }}
      >
        {isPrimary ? (
          <LinearGradient
            colors={gradients.gold}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.btn, styles.shadowGold, { height }]}
          >
            {content}
          </LinearGradient>
        ) : isDanger ? (
          <View style={[styles.btn, { height, backgroundColor: colors.error }]}>{content}</View>
        ) : isGhost ? (
          <View style={[styles.btn, { height, backgroundColor: "transparent" }]}>{content}</View>
        ) : (
          <View style={[styles.btn, styles.secondary, { height }]}>{content}</View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: radius.button,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  secondary: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  shadowGold: {
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  text: { fontFamily: font.bold, letterSpacing: 0.2 },
});
