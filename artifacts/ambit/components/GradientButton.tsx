import React, { useRef, useEffect } from "react";
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from "react-native";

interface GradientButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: "primary" | "secondary" | "ghost";
}

export function GradientButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  style,
  textStyle,
  variant = "primary",
}: GradientButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (variant === "primary") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glow, { toValue: 1, duration: 2000, useNativeDriver: true }),
          Animated.timing(glow, { toValue: 0, duration: 2000, useNativeDriver: true }),
        ])
      ).start();
    }
  }, []);

  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });

  function handlePressIn() {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }

  function handlePressOut() {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  }

  const containerStyle =
    variant === "primary"
      ? styles.primaryContainer
      : variant === "secondary"
      ? styles.secondaryContainer
      : styles.ghostContainer;

  const labelStyle =
    variant === "primary"
      ? styles.primaryLabel
      : variant === "secondary"
      ? styles.secondaryLabel
      : styles.ghostLabel;

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { transform: [{ scale }], opacity: disabled ? 0.5 : glowOpacity },
        style,
      ]}
    >
      <TouchableOpacity
        style={[containerStyle]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={1}
      >
        {loading ? (
          <ActivityIndicator color={variant === "primary" ? "#fff" : "#3B82F6"} />
        ) : (
          <Text style={[labelStyle, textStyle]}>{label}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 16,
    overflow: "hidden",
  },
  primaryContainer: {
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#3B82F6",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  secondaryContainer: {
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "rgba(59,130,246,0.12)",
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.3)",
  },
  ghostContainer: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "transparent",
  },
  primaryLabel: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  secondaryLabel: {
    color: "#3B82F6",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  ghostLabel: {
    color: "#8A94B0",
    fontSize: 15,
    fontWeight: "500",
  },
});
