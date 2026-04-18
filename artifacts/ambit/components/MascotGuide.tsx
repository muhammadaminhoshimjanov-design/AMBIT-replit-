import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Image, Animated, Platform } from "react-native";

interface MascotGuideProps {
  message: string;
  style?: object;
  compact?: boolean;
}

export function MascotGuide({ message, style, compact = false }: MascotGuideProps) {
  const float = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideIn = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 500,
        delay: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideIn, {
        toValue: 0,
        duration: 500,
        delay: 500,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: -5, duration: 2200, useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  if (compact) {
    return (
      <Animated.View
        style={[
          styles.compactContainer,
          style,
          { opacity: fadeIn, transform: [{ translateY: slideIn }] },
        ]}
      >
        <Animated.Image
          source={require("@/assets/images/lion-mascot.png")}
          style={[styles.compactMascot, { transform: [{ translateY: float }] }]}
          resizeMode="contain"
        />
        <View style={styles.compactBubble}>
          <Text style={styles.compactText}>{message}</Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        { opacity: fadeIn, transform: [{ translateY: slideIn }] },
      ]}
    >
      <LinearGradient
        colors={["rgba(30,37,68,0.95)", "rgba(20,25,50,0.98)"]}
        style={styles.card}
      >
        <View style={styles.cardBorder} />
        <Animated.Image
          source={require("@/assets/images/lion-mascot.png")}
          style={[styles.mascot, { transform: [{ translateY: float }] }]}
          resizeMode="contain"
        />
        <View style={styles.textBlock}>
          <View style={styles.namePill}>
            <View style={styles.nameDot} />
            <Text style={styles.nameText}>Leo · Ambit Guide</Text>
          </View>
          <Text style={styles.message}>{message}</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.2)",
    position: "relative",
    overflow: "hidden",
  },
  cardBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(99,102,241,0.3)",
  },
  mascot: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  textBlock: {
    flex: 1,
    gap: 6,
  },
  namePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  nameDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22D3EE",
  },
  nameText: {
    color: "#22D3EE",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  message: {
    color: "#E2E8F0",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  // Compact variant
  compactContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  compactMascot: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  compactBubble: {
    flex: 1,
    backgroundColor: "rgba(30,37,68,0.9)",
    borderRadius: 14,
    borderTopLeftRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.2)",
  },
  compactText: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
    fontStyle: "italic",
  },
});
