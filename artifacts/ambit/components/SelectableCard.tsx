import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useEffect } from "react";
import { Text, StyleSheet, TouchableOpacity, Animated, View } from "react-native";
import { Feather } from "@expo/vector-icons";

interface SelectableCardProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  badge?: string;
  sub?: string;
}

export function SelectableCard({
  label,
  selected,
  onPress,
  badge,
  sub,
}: SelectableCardProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: selected ? 1 : 0,
      useNativeDriver: false,
      speed: 22,
      bounciness: 5,
    }).start();
    if (selected) {
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.05, duration: 90, useNativeDriver: true }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 30,
          bounciness: 8,
        }),
      ]).start();
    }
  }, [selected]);

  const borderColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(255,255,255,0.07)", "rgba(99,102,241,0.75)"],
  });

  const bgOpacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View style={[styles.outer, { transform: [{ scale }], borderColor }]}>
      <TouchableOpacity
        style={styles.touchable}
        onPress={onPress}
        activeOpacity={0.85}
      >
        {/* Selected gradient layer */}
        <Animated.View
          style={[StyleSheet.absoluteFill, { opacity: bgOpacity, borderRadius: 14 }]}
        >
          <LinearGradient
            colors={["rgba(59,130,246,0.18)", "rgba(99,102,241,0.12)"]}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}

        <View style={styles.content}>
          {selected && (
            <Animated.View style={[styles.checkIcon, { opacity: anim }]}>
              <Feather name="check" size={11} color="#6366F1" />
            </Animated.View>
          )}
          <Text style={[styles.label, selected && styles.labelSelected]}>
            {label}
          </Text>
          {sub && <Text style={styles.sub}>{sub}</Text>}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    backgroundColor: "rgba(14,19,48,0.7)",
  },
  touchable: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    minHeight: 54,
    justifyContent: "center",
    position: "relative",
  },
  content: {
    gap: 3,
  },
  label: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  labelSelected: {
    color: "#E2E8F0",
    fontWeight: "700",
  },
  sub: {
    color: "#475569",
    fontSize: 11,
    textAlign: "center",
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#6366F1",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderBottomLeftRadius: 10,
    borderTopRightRadius: 13,
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  checkIcon: {
    position: "absolute",
    top: -2,
    left: 10,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(99,102,241,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
});
