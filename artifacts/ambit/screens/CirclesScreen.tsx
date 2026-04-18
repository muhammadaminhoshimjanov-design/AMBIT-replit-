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
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { GradientBackground } from "@/components/GradientBackground";
import { GradientButton } from "@/components/GradientButton";
import { MascotGuide } from "@/components/MascotGuide";
import { ProgressBar } from "@/components/ProgressBar";
import { useOnboarding } from "@/context/OnboardingContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

const PREFS = ["Small & close-knit", "Competitive", "Supportive", "Mixed energy"];
const COUNTS = ["1", "2", "3+"];
const BADGE_CIRCLES = ["SAT 1500+", "Ivy / Top Universities", "Scholarship Hunters"];

interface CircleRow {
  id: string;
  name: string;
  member_count: number;
  topic: string | null;
}

export function CirclesScreen() {
  const { goNext, goBack, updateData, data, currentStep, totalSteps } = useOnboarding();
  const { user, refreshProfile } = useAuth();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [circles, setCircles] = useState<CircleRow[]>([]);
  const [selected, setSelected] = useState<string[]>(data.circles);
  const [pref, setPref] = useState(data.circlePreference);
  const [count, setCount] = useState(data.circleCount || "2");
  const [loadingCircles, setLoadingCircles] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fade = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(28)).current;

  useEffect(() => {
    loadCircles();
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  async function loadCircles() {
    const { data: rows } = await supabase
      .from("circles")
      .select("id, name, member_count, topic")
      .order("member_count", { ascending: false });
    setCircles(rows ?? []);
    setLoadingCircles(false);
  }

  function toggle(name: string) {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  }

  async function handleNext() {
    if (selected.length === 0) return;
    setSaving(true);
    setError(null);

    if (user) {
      // Update profile
      await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          email: user.email!,
          circle_preference: pref,
        }, { onConflict: "id" });

      // Join selected circles
      const selectedCircles = circles.filter((c) => selected.includes(c.name));
      for (const circle of selectedCircles) {
        await supabase
          .from("circle_members")
          .upsert({ circle_id: circle.id, user_id: user.id }, { onConflict: "circle_id,user_id" });
      }
      await refreshProfile();
    }

    updateData({ circles: selected, circlePreference: pref, circleCount: count });
    setSaving(false);
    goNext();
  }

  return (
    <View style={styles.screen}>
      <GradientBackground />

      <View style={[styles.content, { paddingTop: topPad + 16, paddingBottom: 16 }]}>
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
            <Text style={styles.subtitle}>Start with people who match your energy.</Text>

            {loadingCircles ? (
              <ActivityIndicator color="#6366F1" style={{ marginVertical: 24 }} />
            ) : (
              <View style={styles.grid}>
                {circles.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.circleCard, selected.includes(c.name) && styles.circleCardActive]}
                    onPress={() => toggle(c.name)}
                    activeOpacity={0.85}
                  >
                    {selected.includes(c.name) && (
                      <LinearGradient
                        colors={["rgba(59,130,246,0.18)", "rgba(99,102,241,0.1)"]}
                        style={StyleSheet.absoluteFill}
                      />
                    )}
                    {BADGE_CIRCLES.includes(c.name) && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>Best match</Text>
                      </View>
                    )}
                    <Text style={[styles.circleLabel, selected.includes(c.name) && styles.circleLabelActive]}>
                      {c.name}
                    </Text>
                    <Text style={styles.memberCount}>
                      {c.member_count} {c.member_count === 1 ? "member" : "members"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {selected.length > 0 && (
              <View style={styles.countPill}>
                <Feather name="users" size={12} color="#22D3EE" />
                <Text style={styles.countPillText}>
                  {selected.length} circle{selected.length !== 1 ? "s" : ""} selected
                </Text>
              </View>
            )}

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
                    circle{c !== "1" ? "s" : ""}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <MascotGuide message="Your people are waiting." compact style={styles.mascot} />

            <GradientButton
              label="Continue"
              onPress={handleNext}
              disabled={selected.length === 0}
              loading={saving}
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
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center", justifyContent: "center",
  },
  stepLabel: { color: "#334155", fontSize: 13, fontWeight: "600" },
  eyebrow: {
    color: "#6366F1", fontSize: 12, fontWeight: "700",
    letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8,
  },
  title: {
    fontSize: 34, fontWeight: "800", color: "#F8FAFC",
    letterSpacing: -1.2, lineHeight: 40, marginBottom: 10,
  },
  subtitle: { fontSize: 15, color: "#64748B", marginBottom: 22 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 14 },
  circleCard: {
    width: "47%",
    minHeight: 72,
    backgroundColor: "rgba(14,19,48,0.8)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    padding: 14,
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  circleCardActive: { borderColor: "rgba(99,102,241,0.65)" },
  circleLabel: { color: "#64748B", fontSize: 13, fontWeight: "600", textAlign: "center" },
  circleLabelActive: { color: "#E2E8F0", fontWeight: "700" },
  memberCount: { color: "#334155", fontSize: 11, textAlign: "center", marginTop: 4 },
  badge: {
    position: "absolute",
    top: 0, right: 0,
    backgroundColor: "#6366F1",
    paddingHorizontal: 7, paddingVertical: 3,
    borderBottomLeftRadius: 10,
    borderTopRightRadius: 13,
  },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "800", letterSpacing: 0.4 },
  countPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "rgba(34,211,238,0.08)", borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6, marginBottom: 24,
    borderWidth: 1, borderColor: "rgba(34,211,238,0.2)",
  },
  countPillText: { color: "#22D3EE", fontSize: 12, fontWeight: "700" },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#94A3B8", marginBottom: 14 },
  prefWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 },
  prefChip: {
    paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: 22,
    backgroundColor: "rgba(14,19,48,0.9)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
    overflow: "hidden", position: "relative",
  },
  prefChipActive: { borderColor: "rgba(99,102,241,0.5)" },
  prefText: { color: "#475569", fontSize: 13, fontWeight: "600" },
  prefTextActive: { color: "#818CF8", fontWeight: "700" },
  countRow: { flexDirection: "row", gap: 10, marginBottom: 28 },
  countBtn: {
    flex: 1, height: 72, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(14,19,48,0.8)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
    overflow: "hidden", position: "relative", gap: 2,
  },
  countBtnActive: { borderColor: "rgba(59,130,246,0.5)" },
  countNum: { color: "#334155", fontSize: 24, fontWeight: "800" },
  countNumActive: { color: "#3B82F6" },
  countLabel: { color: "#334155", fontSize: 11, fontWeight: "500" },
  countLabelActive: { color: "#6366F1" },
  errorText: {
    color: "#EF4444", fontSize: 13,
    backgroundColor: "rgba(239,68,68,0.08)", borderRadius: 10,
    padding: 10, marginBottom: 12,
  },
  mascot: { marginBottom: 20 },
  btn: { marginBottom: 32 },
});
