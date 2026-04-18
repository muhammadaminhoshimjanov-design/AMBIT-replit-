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
  { label: "Business & Economics", badge: undefined },
  { label: "STEM Builders", badge: undefined },
  { label: "Scholarship Hunters", badge: "Best match" },
  { label: "Self-Improvement", badge: undefined },
  { label: "International Students", badge: undefined },
  { label: "Productivity Circle", badge: undefined },
  { label: "Future Entrepreneurs", badge: undefined },
  { label: "Essay & Applications", badge: undefined },
];

const PREFERENCES = ["Small close-knit", "Competitive", "Supportive", "Mixed-energy"];
const COUNT_OPTIONS = ["1", "2", "3+"];

export function CirclesScreen() {
  const { goNext, goBack, updateData, data, currentStep, totalSteps } = useOnboarding();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [selected, setSelected] = useState<string[]>(data.circles);
  const [preference, setPreference] = useState(data.circlePreference);
  const [count, setCount] = useState(data.circleCount || "2");
  const contentFade = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(contentSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  function toggleCircle(label: string) {
    setSelected((prev) =>
      prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label]
    );
  }

  function handleNext() {
    updateData({ circles: selected, circlePreference: preference, circleCount: count });
    goNext();
  }

  return (
    <View style={styles.screen}>
      <GradientBackground />

      <View style={[styles.content, { paddingTop: topPad + 16, paddingBottom: bottomPad + 16 }]}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={goBack} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#8A94B0" />
          </TouchableOpacity>
          <ProgressBar current={currentStep} total={totalSteps} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Animated.View
            style={{ opacity: contentFade, transform: [{ translateY: contentSlide }] }}
          >
            <Text style={styles.title}>Choose your first circles</Text>
            <Text style={styles.subtitle}>
              Start with people who match your energy.
            </Text>

            <View style={styles.grid}>
              {CIRCLES.map((c) => (
                <View key={c.label} style={styles.gridItem}>
                  <SelectableCard
                    label={c.label}
                    selected={selected.includes(c.label)}
                    onPress={() => toggleCircle(c.label)}
                    badge={c.badge}
                  />
                </View>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Circle energy</Text>
            <View style={styles.prefRow}>
              {PREFERENCES.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.prefPill, preference === p && styles.prefPillActive]}
                  onPress={() => setPreference(p)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[styles.prefText, preference === p && styles.prefTextActive]}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>How many to start with?</Text>
            <View style={styles.countRow}>
              {COUNT_OPTIONS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.countBtn, count === c && styles.countBtnActive]}
                  onPress={() => setCount(c)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.countText, count === c && styles.countTextActive]}>
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <MascotGuide message="Your people are waiting." style={styles.mascot} />

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
  screen: { flex: 1, backgroundColor: "#0A0F1F" },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  topBar: {
    gap: 16,
    marginBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.8,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#8A94B0",
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 28,
  },
  gridItem: {
    width: "47%",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#C4CCE0",
    marginBottom: 12,
  },
  prefRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  prefPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(30,37,68,0.8)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  prefPillActive: {
    backgroundColor: "rgba(139,92,246,0.2)",
    borderColor: "rgba(139,92,246,0.5)",
  },
  prefText: {
    color: "#8A94B0",
    fontSize: 13,
    fontWeight: "500",
  },
  prefTextActive: {
    color: "#8B5CF6",
    fontWeight: "700",
  },
  countRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 28,
  },
  countBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(20,25,41,0.8)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  countBtnActive: {
    backgroundColor: "rgba(59,130,246,0.15)",
    borderColor: "rgba(59,130,246,0.5)",
  },
  countText: {
    color: "#8A94B0",
    fontSize: 18,
    fontWeight: "700",
  },
  countTextActive: {
    color: "#3B82F6",
  },
  mascot: {
    marginBottom: 20,
  },
  btn: {
    marginBottom: 24,
  },
});
