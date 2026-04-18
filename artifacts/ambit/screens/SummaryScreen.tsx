import { LinearGradient } from "expo-linear-gradient";
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

const PALETTES: Record<string, [string, string]> = {
  A: ["#3B82F6", "#6366F1"],
  B: ["#8B5CF6", "#A855F7"],
  C: ["#EC4899", "#F43F5E"],
  D: ["#10B981", "#059669"],
  E: ["#F59E0B", "#EF4444"],
  F: ["#06B6D4", "#3B82F6"],
};

export function SummaryScreen({ onComplete }: { onComplete: () => void }) {
  const { data, goBack } = useOnboarding();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const heroScale = useRef(new Animated.Value(0.75)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.5)).current;
  const cardFade = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(32)).current;
  const ctaFade = useRef(new Animated.Value(0)).current;

  const palette = PALETTES[data.avatarStyle ?? "A"] ?? PALETTES["A"];

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(heroScale, { toValue: 1, useNativeDriver: true, speed: 8, bounciness: 12 }),
        Animated.timing(heroOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(ringScale, { toValue: 1, useNativeDriver: true, speed: 5, bounciness: 8 }),
      ]),
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(cardFade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(cardSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.timing(ctaFade, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.screen}>
      <GradientBackground />

      {/* Celebration glow at top */}
      <Animated.View
        style={[
          styles.celebGlow,
          { opacity: heroOpacity, transform: [{ scale: ringScale }] },
        ]}
      >
        <LinearGradient
          colors={[palette[0] + "22", palette[1] + "11", "transparent"]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <View style={[styles.content, { paddingTop: topPad + 12, paddingBottom: bottomPad + 20 }]}>
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* Hero */}
          <Animated.View
            style={[
              styles.heroSection,
              { opacity: heroOpacity, transform: [{ scale: heroScale }] },
            ]}
          >
            <Animated.View
              style={[styles.ringOuter, { borderColor: palette[0], transform: [{ scale: ringScale }] }]}
            />
            <View style={styles.avatarWrap}>
              <LinearGradient colors={palette} style={styles.avatar}>
                <Text style={styles.avatarLetter}>
                  {data.nickname?.[0]?.toUpperCase() ?? "A"}
                </Text>
              </LinearGradient>
            </View>

            <Text style={styles.youreIn}>You're in.</Text>
            <Text style={styles.subtitle}>Your Ambit journey starts now.</Text>

            <View style={styles.verifiedBadge}>
              <Feather name="shield" size={12} color="#22D3EE" />
              <Text style={styles.verifiedText}>Account ready</Text>
            </View>
          </Animated.View>

          {/* Summary Card */}
          <Animated.View
            style={[
              styles.summaryCard,
              { opacity: cardFade, transform: [{ translateY: cardSlide }] },
            ]}
          >
            <LinearGradient
              colors={["rgba(20,25,60,0.95)", "rgba(14,19,48,0.98)"]}
              style={styles.summaryGradient}
            >
              {/* Profile row */}
              <View style={styles.profileRow}>
                <LinearGradient colors={palette} style={styles.miniAvatar}>
                  <Text style={styles.miniAvatarLetter}>
                    {data.nickname?.[0]?.toUpperCase() ?? "A"}
                  </Text>
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={styles.profileName}>{data.nickname || "—"}</Text>
                  {data.shortIntro ? (
                    <Text style={styles.profileIntro}>{data.shortIntro}</Text>
                  ) : null}
                </View>
              </View>

              <View style={styles.divider} />

              {/* Mindset */}
              {data.studentIdentity ? (
                <View style={styles.infoRow}>
                  <Text style={styles.infoKey}>Mindset</Text>
                  <View style={styles.infoBadge}>
                    <Text style={styles.infoBadgeText}>{data.studentIdentity}</Text>
                  </View>
                </View>
              ) : null}

              {/* Focus Topics */}
              {data.focusTopics.length > 0 && (
                <View style={styles.tagsBlock}>
                  <Text style={styles.infoKey}>Focused on</Text>
                  <View style={styles.tagRow}>
                    {data.focusTopics.map((t) => (
                      <View key={t} style={styles.tagBlue}>
                        <Text style={styles.tagBlueText}>{t}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Circles */}
              {data.circles.length > 0 && (
                <View style={styles.tagsBlock}>
                  <Text style={styles.infoKey}>Circles</Text>
                  <View style={styles.tagRow}>
                    {data.circles.map((c) => (
                      <View key={c} style={styles.tagPurple}>
                        <Text style={styles.tagPurpleText}>{c}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </LinearGradient>
          </Animated.View>

          {/* Mascot */}
          <Animated.View style={{ opacity: ctaFade }}>
            <MascotGuide
              message="You're not alone anymore. Let's begin."
              style={styles.mascot}
            />

            <GradientButton label="Enter Ambit" onPress={onComplete} style={styles.enterBtn} />

            <TouchableOpacity style={styles.editBtn} onPress={goBack} activeOpacity={0.7}>
              <Feather name="edit-2" size={14} color="#334155" />
              <Text style={styles.editText}>Edit your setup</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#050813" },
  celebGlow: {
    position: "absolute",
    top: -100,
    left: -50,
    right: -50,
    height: 400,
    borderRadius: 999,
    overflow: "hidden",
  },
  content: { flex: 1, paddingHorizontal: 24 },
  heroSection: { alignItems: "center", marginBottom: 28, paddingTop: 20, position: "relative" },
  ringOuter: {
    position: "absolute",
    top: 6,
    width: 148,
    height: 148,
    borderRadius: 74,
    borderWidth: 1,
    opacity: 0.4,
  },
  avatarWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 16,
  },
  avatar: { flex: 1, alignItems: "center", justifyContent: "center" },
  avatarLetter: { fontSize: 48, fontWeight: "800", color: "#fff" },
  youreIn: {
    fontSize: 42,
    fontWeight: "800",
    color: "#F8FAFC",
    letterSpacing: -1.5,
    marginBottom: 8,
  },
  subtitle: { fontSize: 16, color: "#64748B", textAlign: "center", marginBottom: 16 },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(34,211,238,0.08)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(34,211,238,0.2)",
  },
  verifiedText: { color: "#22D3EE", fontSize: 11, fontWeight: "700", letterSpacing: 0.6, textTransform: "uppercase" },
  summaryCard: {
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.15)",
  },
  summaryGradient: { padding: 22, gap: 16 },
  profileRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  miniAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  miniAvatarLetter: { color: "#fff", fontSize: 20, fontWeight: "800" },
  profileName: { color: "#F1F5F9", fontSize: 17, fontWeight: "700" },
  profileIntro: { color: "#64748B", fontSize: 13, marginTop: 2 },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.05)" },
  infoRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  infoKey: { color: "#475569", fontSize: 12, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 10 },
  infoBadge: {
    backgroundColor: "rgba(99,102,241,0.14)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.3)",
  },
  infoBadgeText: { color: "#818CF8", fontSize: 13, fontWeight: "600" },
  tagsBlock: { gap: 8 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tagBlue: {
    backgroundColor: "rgba(59,130,246,0.12)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.25)",
  },
  tagBlueText: { color: "#60A5FA", fontSize: 12, fontWeight: "600" },
  tagPurple: {
    backgroundColor: "rgba(99,102,241,0.1)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.25)",
  },
  tagPurpleText: { color: "#818CF8", fontSize: 12, fontWeight: "600" },
  mascot: { marginBottom: 20 },
  enterBtn: { marginBottom: 14 },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 14,
    marginBottom: 32,
  },
  editText: { color: "#334155", fontSize: 14, fontWeight: "500" },
});
