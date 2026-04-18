import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const progress = useRef(new Animated.Value((current - 1) / total)).current;

  useEffect(() => {
    const pct = current / total;
    Animated.spring(progress, {
      toValue: pct,
      useNativeDriver: false,
      speed: 10,
      bounciness: 3,
    }).start();
  }, [current, total]);

  const widthPct = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <Animated.View style={[styles.fillWrap, { width: widthPct }]}>
          <LinearGradient
            colors={["#3B82F6", "#6366F1", "#8B5CF6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.fill}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  track: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 2,
    overflow: "hidden",
  },
  fillWrap: {
    height: "100%",
    overflow: "hidden",
  },
  fill: {
    flex: 1,
    borderRadius: 2,
  },
});
