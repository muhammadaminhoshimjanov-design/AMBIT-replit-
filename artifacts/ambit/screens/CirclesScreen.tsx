import { LinearGradient } from "expo-linear-gradient";
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { GradientBackground } from "@/components/GradientBackground";
import { GradientButton } from "@/components/GradientButton";
import { MascotGuide } from "@/components/MascotGuide";
import { ProgressBar } from "@/components/ProgressBar";
import { SelectableCard } from "@/components/SelectableCard";
import { useOnboarding } from "@/context/OnboardingContext";

const CIRCLES = [
  { label: "SAT 1500+", badge: "Hot" },
  { label: "Ivy / Top Universities", badge: "Best match" },
  { label: "Business & Economics" },
  { label: "STEM Builders" },
  { label: "Scholarship Hunters", badge: "Best match" },
  { label: "Self-Improvement" },
  { label: "International Students" },
  { label: "Productivity Circle" },
  { label: "Future Entrepreneurs" },
  { label: "Essay & Applications" },
];

const PREFS = ["Small & close-knit", "Competitive", "Supportive", "Mixed energy"];
const COUNTS = ["1", "2", "3+"];

export function CirclesScreen() {
  const { goNext, goBack, updateData, data, currentStep, totalSteps } = useOnboarding();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [selected, setSelected] = useState<string[]>(data.circles);
  const [pref, setPref] = useState(data.circlePreference);
  const [count, setCount] = useState(data.circleCount || "2");
  const fade = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(28)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  function toggle(label: string) {
    setSelected((prev) =>
      prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label]
    );
  }

  function handleNext() {
    updateData({ circles: selected, circlePreference: pref, circleCount: count });
    goNext();
  }

  return (
    <View style={styles.screen}>
      <GradientBackground />

      <View style={[styles.content, { paddingTop: topPad + 16, paddingBottom: bottomPad + 16 }]}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={goBack} style={styles.backBtn}>
            <Feather name="chevron-left" size={24} color="#64748B" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <ProgressBar current={currentStep} total={totalSteps} />
          </View>
          <Text style={styles.stepLabel}>{currentStep}/{totalSteps}</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: fade, transform: [{ translateY: slideAnim }] }}>
            <Text style={styles.eyebrow}>Step {currentStep}</Text>
            <Text style={styles.title}>Choose your{"\n"}first circles</Text>
            <Text style={styles.subtitle}>
              Start with people who match your energy.
            </Text>

            <View style={styles.grid}>
              {CIRCLES.map((c) => (
                <View key={c.label} style={styles.gridCell}>
                  <SelectableCard
                    label={c.label}
                    selected={selected.includes(c.label)}
                    onPress={() => toggle(c.label)}
                    badge={c.badge}
                  />
                </View>
              ))}
            </View>

            {selected.length > 0 && (
              <View style={styles.countPill}>
                <Feather name="users" size={12} color="#22D3EE" />
                <Text style={styles.countPillText}>{selected.length} circle{selected.length !== 1 ? "s" : ""} selected</Text>
              </View>
            )}

            {/* Energy preference */}
            <Text style={styles.sectionTitle}>Circle energy</Text>
            <View style={styles.prefWrap}>
              {PREFS.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.prefChip, pref === p && styles.prefChipActive]}
                  onPress={() => setPref(p)}
                  activeOpacity={0.8}
                >
                  {pref === p && (
                    <LinearGradient
                      colors={["rgba(99,102,241,0.2)", "rgba(139,92,246,0.12)"]}
                      style={StyleSheet.absoluteFill}
                    />
                  )}
                  <Text style={[styles.prefText, pref === p && styles.prefTextActive]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Count selector */}
            <Text style={styles.sectionTitle}>How many to start with?</Text>
            <View style={styles.countRow}>
              {COUNTS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.countBtn, count === c && styles.countBtnActive]}
                  onPress={() => setCount(c)}
                  activeOpacity={0.85}
                >
                  {count === c && (
                    <LinearGradient
                      colors={["rgba(59,130,246,0.18)", "rgba(99,102,241,0.12)"]}
                      style={StyleSheet.absoluteFill}
                    />
                  )}
                  <Text style={[styles.countNum, count === c && styles.countNumActive]}>{c}</Text>
                  <Text style={[styles.countLabel, count === c && styles.countLabelActive]}>
                    {c === "1" ? "circle" : c === "2" ? "circles" : "circles"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <MascotGuide message="Your people are waiting." compact style={styles.mascot} />

            <GradientButton
              label="Continue"
              onPress={handleNext}
              disabled={selected.length === 0}
              style={styles.btn}
            />
          </Animated.View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#050813" },
  content: { flex: 1, paddingHorizontal: 24 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepLabel: { color: "#334155", fontSize: 13, fontWeight: "600" },
  eyebrow: {
    color: "#6366F1",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#F8FAFC",
    letterSpacing: -1.2,
    lineHeight: 40,
    marginBottom: 10,
  },
  subtitle: { fontSize: 15, color: "#64748B", marginBottom: 22 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 14 },
  gridCell: { width: "47%" },
  countPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "rgba(34,211,238,0.08)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(34,211,238,0.2)",
  },
  countPillText: { color: "#22D3EE", fontSize: 12, fontWeight: "700" },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#94A3B8", marginBottom: 14 },
  prefWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 },
  prefChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 22,
    backgroundColor: "rgba(14,19,48,0.9)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
    position: "relative",
  },
  prefChipActive: { borderColor: "rgba(99,102,241,0.5)" },
  prefText: { color: "#475569", fontSize: 13, fontWeight: "600" },
  prefTextActive: { color: "#818CF8", fontWeight: "700" },
  countRow: { flexDirection: "row", gap: 10, marginBottom: 28 },
  countBtn: {
    flex: 1,
    height: 72,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(14,19,48,0.8)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
    position: "relative",
    gap: 2,
  },
  countBtnActive: { borderColor: "rgba(59,130,246,0.5)" },
  countNum: { color: "#334155", fontSize: 24, fontWeight: "800" },
  countNumActive: { color: "#3B82F6" },
  countLabel: { color: "#334155", fontSize: 11, fontWeight: "500" },
  countLabelActive: { color: "#6366F1" },
  mascot: { marginBottom: 20 },
  btn: { marginBottom: 32 },
});
