import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useEffect } from "react";
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from "react-native";

interface GradientButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: "primary" | "secondary" | "ghost";
  icon?: React.ReactNode;
}

export function GradientButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  style,
  textStyle,
  variant = "primary",
  icon,
}: GradientButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (variant === "primary") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmer, { toValue: 1, duration: 2400, useNativeDriver: true }),
          Animated.timing(shimmer, { toValue: 0, duration: 2400, useNativeDriver: true }),
        ])
      ).start();
    }
  }, []);

  const shimmerOpacity = shimmer.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.85, 1, 0.85],
  });

  function handlePressIn() {
    Animated.spring(scale, {
      toValue: 0.965,
      useNativeDriver: true,
      speed: 60,
      bounciness: 3,
    }).start();
  }

  function handlePressOut() {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 35,
      bounciness: 8,
    }).start();
  }

  if (variant === "primary") {
    return (
      <Animated.View
        style={[
          styles.shadowWrap,
          { transform: [{ scale }], opacity: disabled ? 0.45 : shimmerOpacity },
          style,
        ]}
      >
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          activeOpacity={1}
          style={styles.touchable}
        >
          <LinearGradient
            colors={["#3B82F6", "#6366F1", "#8B5CF6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryGradient}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <View style={styles.buttonInner}>
                {icon}
                <Text style={[styles.primaryLabel, textStyle]}>{label}</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  if (variant === "secondary") {
    return (
      <Animated.View style={[{ transform: [{ scale }] }, style]}>
        <TouchableOpacity
          style={styles.secondaryContainer}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          activeOpacity={0.9}
        >
          <Text style={styles.secondaryLabel}>{label}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <TouchableOpacity
        style={styles.ghostContainer}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.7}
      >
        <Text style={styles.ghostLabel}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    borderRadius: 18,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.55,
    shadowRadius: 28,
    elevation: 14,
  },
  touchable: {
    borderRadius: 18,
    overflow: "hidden",
  },
  primaryGradient: {
    height: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  primaryLabel: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  secondaryContainer: {
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "rgba(59,130,246,0.1)",
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.35)",
  },
  secondaryLabel: {
    color: "#818CF8",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  ghostContainer: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "transparent",
  },
  ghostLabel: {
    color: "#555D7A",
    fontSize: 15,
    fontWeight: "500",
  },
});
