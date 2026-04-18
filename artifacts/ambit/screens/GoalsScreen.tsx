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
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

const FOCUS_TOPICS = [
  "SAT / Exams",
  "Universities",
  "Scholarships",
  "Essays",
  "Self-growth",
  "Career direction",
  "Student life",
  "Productivity",
];

const IDENTITIES = [
  { label: "Just starting out", desc: "Exploring my path", icon: "map" as const },
  { label: "Improve fast", desc: "Level up as quickly as possible", icon: "trending-up" as const },
  { label: "Highly ambitious", desc: "I'm set on reaching the top", icon: "target" as const },
  { label: "Serious circle", desc: "Want driven people around me", icon: "users" as const },
];

export function GoalsScreen() {
  const { goNext, goBack, updateData, data, currentStep, totalSteps } = useOnboarding();
  const { user, refreshProfile } = useAuth();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [topics, setTopics] = useState<string[]>(data.focusTopics);
  const [identity, setIdentity] = useState(data.studentIdentity);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fade = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(28)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  function toggleTopic(t: string) {
    setTopics((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  }

  async function handleNext() {
    setSaving(true);
    setError(null);
    if (user) {
      const { error: err } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          email: user.email!,
          focus_topics: topics,
          student_identity: identity,
        }, { onConflict: "id" });
      if (err) { setError(err.message); setSaving(false); return; }
      await refreshProfile();
    }
    updateData({ focusTopics: topics, studentIdentity: identity });
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
            <Text style={styles.title}>What are you{"\n"}focused on?</Text>
            <Text style={styles.subtitle}>Select everything that applies to you now.</Text>

            <View style={styles.grid}>
              {FOCUS_TOPICS.map((topic) => (
                <View key={topic} style={styles.gridCell}>
                  <SelectableCard
                    label={topic}
                    selected={topics.includes(topic)}
                    onPress={() => toggleTopic(topic)}
                  />
                </View>
              ))}
            </View>

            {topics.length > 0 && (
              <View style={styles.countPill}>
                <Feather name="check-circle" size={13} color="#22D3EE" />
                <Text style={styles.countText}>{topics.length} selected</Text>
              </View>
            )}

            <Text style={styles.sectionTitle}>What drives you most?</Text>

            <View style={styles.identityList}>
              {IDENTITIES.map((id) => (
                <IdentityCard
                  key={id.label}
                  item={id}
                  selected={identity === id.label}
                  onPress={() => setIdentity(id.label)}
                />
              ))}
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <MascotGuide message="This helps me build your feed." compact style={styles.mascot} />

            <GradientButton
              label="Continue"
              onPress={handleNext}
              disabled={topics.length === 0}
              loading={saving}
              style={styles.btn}
            />
          </Animated.View>
        </ScrollView>
      </View>
    </View>
  );
}

function IdentityCard({
  item,
  selected,
  onPress,
}: {
  item: { label: string; desc: string; icon: string };
  selected: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, { toValue: selected ? 1 : 0, useNativeDriver: false, speed: 22, bounciness: 4 }).start();
    if (selected) {
      Animated.sequence([
        Animated.timing(scale, { toValue: 0.975, duration: 80, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 28, bounciness: 6 }),
      ]).start();
    }
  }, [selected]);

  const borderColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(255,255,255,0.05)", "rgba(99,102,241,0.6)"],
  });

  return (
    <Animated.View style={[styles.idCard, { borderColor, transform: [{ scale }] }]}>
      <TouchableOpacity style={styles.idInner} onPress={onPress} activeOpacity={0.9}>
        {selected && (
          <LinearGradient
            colors={["rgba(59,130,246,0.12)", "rgba(99,102,241,0.07)"]}
            style={StyleSheet.absoluteFill}
          />
        )}
        <View style={[styles.idIcon, selected && styles.idIconSelected]}>
          <Feather name={item.icon as any} size={17} color={selected ? "#818CF8" : "#334155"} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.idLabel, selected && styles.idLabelSelected]}>{item.label}</Text>
          <Text style={styles.idDesc}>{item.desc}</Text>
        </View>
        {selected && <Feather name="check-circle" size={18} color="#6366F1" />}
      </TouchableOpacity>
    </Animated.View>
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
  gridCell: { width: "47%" },
  countPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "rgba(34,211,238,0.08)", borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6, marginBottom: 24,
    borderWidth: 1, borderColor: "rgba(34,211,238,0.2)",
  },
  countText: { color: "#22D3EE", fontSize: 12, fontWeight: "700" },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: "#E2E8F0", marginBottom: 14 },
  identityList: { gap: 10, marginBottom: 24 },
  idCard: {
    borderRadius: 18, borderWidth: 1, overflow: "hidden",
    backgroundColor: "rgba(14,19,48,0.8)",
  },
  idInner: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16 },
  idIcon: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center", justifyContent: "center",
  },
  idIconSelected: { backgroundColor: "rgba(99,102,241,0.14)" },
  idLabel: { color: "#94A3B8", fontSize: 15, fontWeight: "600", marginBottom: 3 },
  idLabelSelected: { color: "#F1F5F9" },
  idDesc: { color: "#334155", fontSize: 12 },
  errorText: {
    color: "#EF4444", fontSize: 13,
    backgroundColor: "rgba(239,68,68,0.08)", borderRadius: 10,
    padding: 10, marginBottom: 12,
  },
  mascot: { marginBottom: 20 },
  btn: { marginBottom: 32 },
});
