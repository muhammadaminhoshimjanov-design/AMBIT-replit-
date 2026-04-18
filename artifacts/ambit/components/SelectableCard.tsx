import React, { useRef, useEffect } from "react";
import { Text, StyleSheet, TouchableOpacity, Animated } from "react-native";

interface SelectableCardProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: string;
  badge?: string;
}

export function SelectableCard({
  label,
  selected,
  onPress,
  badge,
}: SelectableCardProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(borderAnim, {
      toValue: selected ? 1 : 0,
      useNativeDriver: false,
      speed: 20,
      bounciness: 4,
    }).start();
    if (selected) {
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.04, duration: 100, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [selected]);

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(255,255,255,0.08)", "rgba(59,130,246,0.7)"],
  });

  const bgColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(20,25,41,0.8)", "rgba(59,130,246,0.15)"],
  });

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          transform: [{ scale }],
          borderColor,
          backgroundColor: bgColor,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.inner}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {badge && (
          <Animated.View
            style={[styles.badge, { opacity: borderAnim }]}
          >
            <Text style={styles.badgeText}>{badge}</Text>
          </Animated.View>
        )}
        <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0,
    shadowRadius: 12,
  },
  inner: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    position: "relative",
  },
  label: {
    color: "#8A94B0",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  labelSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  badge: {
    position: "absolute",
    top: -1,
    right: -1,
    backgroundColor: "#3B82F6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderBottomLeftRadius: 8,
    borderTopRightRadius: 13,
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
