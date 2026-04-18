import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Image, Animated } from "react-native";

interface MascotGuideProps {
  message: string;
  style?: object;
  size?: "small" | "medium" | "large";
}

export function MascotGuide({ message, style, size = "medium" }: MascotGuideProps) {
  const bounce = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 600,
      delay: 400,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: -6, duration: 1800, useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const imgSize = size === "small" ? 48 : size === "large" ? 80 : 64;

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        { opacity: fadeIn },
      ]}
    >
      <Animated.Image
        source={require("@/assets/images/lion-mascot.png")}
        style={[
          styles.mascot,
          { width: imgSize, height: imgSize, transform: [{ translateY: bounce }] },
        ]}
        resizeMode="contain"
      />
      <View style={styles.bubble}>
        <View style={styles.bubbleTail} />
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  mascot: {
    borderRadius: 32,
  },
  bubble: {
    flex: 1,
    backgroundColor: "rgba(30,37,68,0.95)",
    borderRadius: 14,
    borderTopLeftRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.2)",
    position: "relative",
  },
  bubbleTail: {
    position: "absolute",
    left: -6,
    bottom: 12,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderRightWidth: 6,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderRightColor: "rgba(30,37,68,0.95)",
  },
  message: {
    color: "#C4CCE0",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
    fontStyle: "italic",
  },
});
