import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions, Animated } from "react-native";

const { width, height } = Dimensions.get("window");

export function GradientBackground() {
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const float3 = useRef(new Animated.Value(0)).current;
  const pulse1 = useRef(new Animated.Value(0.8)).current;
  const pulse2 = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float1, { toValue: 1, duration: 5000, useNativeDriver: true }),
        Animated.timing(float1, { toValue: 0, duration: 5000, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.delay(1800),
        Animated.timing(float2, { toValue: 1, duration: 6500, useNativeDriver: true }),
        Animated.timing(float2, { toValue: 0, duration: 6500, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.delay(3200),
        Animated.timing(float3, { toValue: 1, duration: 4500, useNativeDriver: true }),
        Animated.timing(float3, { toValue: 0, duration: 4500, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse1, { toValue: 1.15, duration: 3500, useNativeDriver: true }),
        Animated.timing(pulse1, { toValue: 0.8, duration: 3500, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.delay(1500),
        Animated.timing(pulse2, { toValue: 1.1, duration: 4000, useNativeDriver: true }),
        Animated.timing(pulse2, { toValue: 0.7, duration: 4000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const ty1 = float1.interpolate({ inputRange: [0, 1], outputRange: [0, -28] });
  const ty2 = float2.interpolate({ inputRange: [0, 1], outputRange: [0, -18] });
  const ty3 = float3.interpolate({ inputRange: [0, 1], outputRange: [0, -22] });

  return (
    <View style={styles.container} pointerEvents="none">
      <LinearGradient
        colors={["#050813", "#0A0F1F", "#0E1330", "#0A0F1F"]}
        locations={[0, 0.3, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Top blue glow */}
      <Animated.View
        style={[
          styles.orb,
          styles.orb1,
          { transform: [{ translateY: ty1 }, { scale: pulse1 }] },
        ]}
      />

      {/* Bottom purple glow */}
      <Animated.View
        style={[
          styles.orb,
          styles.orb2,
          { transform: [{ translateY: ty2 }, { scale: pulse2 }] },
        ]}
      />

      {/* Center drift */}
      <Animated.View
        style={[
          styles.orb,
          styles.orb3,
          { transform: [{ translateY: ty3 }] },
        ]}
      />

      {/* Subtle rings */}
      <View style={[styles.ring, styles.ring1]} />
      <View style={[styles.ring, styles.ring2]} />
      <View style={[styles.ring, styles.ring3]} />

      {/* Fine noise overlay */}
      <LinearGradient
        colors={["transparent", "rgba(10,15,31,0.2)", "transparent"]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  orb: {
    position: "absolute",
    borderRadius: 999,
  },
  orb1: {
    width: width * 0.95,
    height: width * 0.95,
    backgroundColor: "rgba(59,130,246,0.11)",
    top: -width * 0.3,
    left: -width * 0.2,
  },
  orb2: {
    width: width * 0.85,
    height: width * 0.85,
    backgroundColor: "rgba(99,102,241,0.09)",
    bottom: height * 0.05,
    right: -width * 0.25,
  },
  orb3: {
    width: width * 0.65,
    height: width * 0.65,
    backgroundColor: "rgba(139,92,246,0.07)",
    top: height * 0.32,
    left: width * 0.2,
  },
  ring: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.06)",
  },
  ring1: {
    width: width * 0.75,
    height: width * 0.75,
    top: height * 0.08,
    right: -width * 0.2,
  },
  ring2: {
    width: width * 0.5,
    height: width * 0.5,
    bottom: height * 0.18,
    left: -width * 0.12,
    borderColor: "rgba(59,130,246,0.05)",
  },
  ring3: {
    width: width * 0.35,
    height: width * 0.35,
    top: height * 0.48,
    right: width * 0.06,
    borderColor: "rgba(139,92,246,0.07)",
  },
});
