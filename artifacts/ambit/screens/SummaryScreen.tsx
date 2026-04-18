import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { GradientBackground } from "@/components/GradientBackground";
import { GradientButton } from "@/components/GradientButton";
import { MascotGuide } from "@/components/MascotGuide";
import { useOnboarding } from "@/context/OnboardingContext";

const AVATAR_COLORS = [
  "#3B82F6", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B", "#EF4444",
];
const AVATAR_LETTERS = ["A", "B", "C", "D", "E", "F"];

export function SummaryScreen({ onComplete }: { onComplete: () => void }) {
  const { data, goBack } = useOnboarding();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const contentFade = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(30)).current;
  const glowScale = useRef(new Animated.Value(0.8)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  const avatarIndex = AVATAR_LETTERS.indexOf(data.avatarStyle ?? "A");
  const avatarColor = AVATAR_COLORS[avatarIndex >= 0 ? avatarIndex : 0];

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(glowScale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 8,
          bounciness: 10,
        }),
        Animated.timing(glowOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(contentFade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(contentSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={styles.screen}>
      <GradientBackground />

      <View style={[styles.content, { paddingTop: topPad + 16, paddingBottom: bottomPad + 16 }]}>
        <TouchableOpacity onPress={goBack} style={[styles.backBtn, { marginBottom: 12 }]}>
          <Feather name="arrow-left" size={22} color="#8A94B0" />
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Animated.View
            style={{
              opacity: glowOpacity,
              transform: [{ scale: glowScale }],
              alignItems: "center",
              marginBottom: 32,
            }}
          >
            <View style={[styles.successRing, { borderColor: avatarColor }]}>
              <View style={[styles.successAvatar, { backgroundColor: avatarColor }]}>
                <Text style={styles.successLetter}>
                  {data.nickname?.[0]?.toUpperCase() ?? "A"}
                </Text>
              </View>
            </View>
            <Text style={styles.youreIn}>You're in</Text>
            <Text style={styles.startNow}>Your Ambit journey starts now.</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.summaryCard,
              { opacity: contentFade, transform: [{ translateY: contentSlide }] },
            ]}
          >
            <View style={styles.verifiedRow}>
              <Feather name="shield" size={14} color="#3B82F6" />
              <Text style={styles.verifiedText}>Account ready</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>Name</Text>
              <Text style={styles.summaryValue}>{data.nickname || "—"}</Text>
            </View>

            {data.shortIntro ? (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>Intro</Text>
                <Text style={styles.summaryValue}>{data.shortIntro}</Text>
              </View>
            ) : null}

            {data.studentIdentity ? (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>Mindset</Text>
                <Text style={styles.summaryValue}>{data.studentIdentity}</Text>
              </View>
            ) : null}

            {data.focusTopics.length > 0 && (
              <View style={styles.summarySection}>
                <Text style={styles.summaryKey}>Focus areas</Text>
                <View style={styles.tagWrap}>
                  {data.focusTopics.map((t) => (
                    <View key={t} style={styles.tag}>
                      <Text style={styles.tagText}>{t}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {data.circles.length > 0 && (
              <View style={styles.summarySection}>
                <Text style={styles.summaryKey}>Circles</Text>
                <View style={styles.tagWrap}>
                  {data.circles.map((c) => (
                    <View key={c} style={[styles.tag, styles.tagPurple]}>
                      <Text style={[styles.tagText, styles.tagTextPurple]}>{c}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Animated.View>

          <Animated.View
            style={{ opacity: contentFade, transform: [{ translateY: contentSlide }] }}
          >
            <MascotGuide
              message="You're not alone anymore. Let's begin."
              style={styles.mascot}
            />

            <GradientButton label="Enter Ambit" onPress={onComplete} style={styles.enterBtn} />

            <TouchableOpacity style={styles.editBtn} onPress={goBack} activeOpacity={0.7}>
              <Text style={styles.editText}>Edit setup</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0A0F1F" },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  successRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    padding: 6,
    marginBottom: 20,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 30,
  },
  successAvatar: {
    flex: 1,
    borderRadius: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  successLetter: {
    fontSize: 44,
    fontWeight: "800",
    color: "#fff",
  },
  youreIn: {
    fontSize: 36,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -1,
    marginBottom: 6,
  },
  startNow: {
    fontSize: 16,
    color: "#8A94B0",
    textAlign: "center",
  },
  summaryCard: {
    backgroundColor: "rgba(20,25,41,0.9)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: 16,
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  verifiedText: {
    color: "#3B82F6",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryKey: {
    color: "#8A94B0",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    flex: 1,
  },
  summaryValue: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    flex: 2,
    textAlign: "right",
  },
  summarySection: {
    gap: 10,
  },
  tagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    backgroundColor: "rgba(59,130,246,0.15)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.3)",
  },
  tagText: {
    color: "#3B82F6",
    fontSize: 12,
    fontWeight: "600",
  },
  tagPurple: {
    backgroundColor: "rgba(139,92,246,0.12)",
    borderColor: "rgba(139,92,246,0.3)",
  },
  tagTextPurple: {
    color: "#8B5CF6",
  },
  mascot: {
    marginBottom: 20,
  },
  enterBtn: {
    marginBottom: 14,
  },
  editBtn: {
    alignItems: "center",
    paddingVertical: 14,
    marginBottom: 24,
  },
  editText: {
    color: "#8A94B0",
    fontSize: 14,
    fontWeight: "500",
  },
});
