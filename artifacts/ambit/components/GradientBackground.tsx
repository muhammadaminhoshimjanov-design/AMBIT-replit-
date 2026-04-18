import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions, Animated } from "react-native";

const { width, height } = Dimensions.get("window");

export function GradientBackground() {
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const float3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float1, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(float1, { toValue: 0, duration: 4000, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.delay(1500),
        Animated.timing(float2, { toValue: 1, duration: 5000, useNativeDriver: true }),
        Animated.timing(float2, { toValue: 0, duration: 5000, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.delay(2500),
        Animated.timing(float3, { toValue: 1, duration: 3500, useNativeDriver: true }),
        Animated.timing(float3, { toValue: 0, duration: 3500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const translateY1 = float1.interpolate({ inputRange: [0, 1], outputRange: [0, -20] });
  const translateY2 = float2.interpolate({ inputRange: [0, 1], outputRange: [0, -15] });
  const translateY3 = float3.interpolate({ inputRange: [0, 1], outputRange: [0, -25] });

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.baseGradient} />
      <Animated.View
        style={[styles.glow1, { transform: [{ translateY: translateY1 }] }]}
      />
      <Animated.View
        style={[styles.glow2, { transform: [{ translateY: translateY2 }] }]}
      />
      <Animated.View
        style={[styles.glow3, { transform: [{ translateY: translateY3 }] }]}
      />
      <View style={[styles.circle, styles.circle1]} />
      <View style={[styles.circle, styles.circle2]} />
      <View style={[styles.circle, styles.circle3]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  baseGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0A0F1F",
  },
  glow1: {
    position: "absolute",
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: "rgba(59,130,246,0.08)",
    top: -width * 0.2,
    left: -width * 0.1,
  },
  glow2: {
    position: "absolute",
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: "rgba(139,92,246,0.07)",
    bottom: height * 0.1,
    right: -width * 0.2,
  },
  glow3: {
    position: "absolute",
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: "rgba(59,130,246,0.05)",
    top: height * 0.35,
    left: width * 0.3,
  },
  circle: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },
  circle1: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    top: height * 0.1,
    right: -width * 0.15,
  },
  circle2: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    bottom: height * 0.2,
    left: -width * 0.1,
  },
  circle3: {
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: width * 0.15,
    top: height * 0.5,
    right: width * 0.05,
  },
});
