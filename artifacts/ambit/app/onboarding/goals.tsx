import { useRouter } from "expo-router";
import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { colors, font } from "@/lib/theme";

const TOPICS = [
  { id: "academic", label: "Academic excellence", icon: "📚" },
  { id: "career", label: "Career & internships", icon: "💼" },
  { id: "scholarships", label: "Scholarships", icon: "🎓" },
  { id: "health", label: "Health & habits", icon: "💪" },
  { id: "creative", label: "Creative projects", icon: "🎨" },
  { id: "startup", label: "Build a startup", icon: "🚀" },
  { id: "skills", label: "New skills", icon: "🧠" },
  { id: "community", label: "Find a community", icon: "🤝" },
  { id: "research", label: "Research", icon: "🔬" },
  { id: "exams", label: "Crush exams", icon: "🎯" },
];

export default function GoalsOnb() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const [selected, setSelected] = useState<string[]>(profile?.focus_topics ?? []);
  const [loading, setLoading] = useState(false);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function next() {
    if (!user) return;
    setLoading(true);
    await supabase.from("profiles").update({ focus_topics: selected }).eq("id", user.id);
    await refreshProfile();
    setLoading(false);
    router.push("/onboarding/communities");
  }

  return (
    <Screen scroll>
      <Header back title="What drives you?" subtitle="Step 2 of 3" />

      <View style={styles.progress}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
      </View>

      <Text style={styles.intro}>Pick a few. We'll personalize your feed and circles.</Text>

      <View style={styles.grid}>
        {TOPICS.map((t) => {
          const on = selected.includes(t.id);
          return (
            <Pressable
              key={t.id}
              onPress={() => toggle(t.id)}
              style={[styles.tile, on && styles.tileActive]}
            >
              <Text style={styles.icon}>{t.icon}</Text>
              <Text style={[styles.tileText, on && styles.tileTextActive]}>{t.label}</Text>
              {on && <View style={styles.check} />}
            </Pressable>
          );
        })}
      </View>

      <PrimaryButton
        title={selected.length === 0 ? "Pick at least one" : `Continue with ${selected.length}`}
        icon="arrow-right"
        loading={loading}
        disabled={selected.length === 0}
        onPress={next}
        style={{ marginTop: 24 }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  progress: { flexDirection: "row", gap: 8, marginBottom: 18 },
  dot: { flex: 1, height: 4, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primary },
  intro: { color: colors.textMuted, fontSize: 14, fontFamily: font.regular, marginBottom: 18, lineHeight: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: {
    width: "48%", padding: 16, borderRadius: 18,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    minHeight: 100, position: "relative", justifyContent: "space-between",
  },
  tileActive: { borderColor: colors.primary, backgroundColor: "rgba(245,185,66,0.08)" },
  icon: { fontSize: 28 },
  tileText: { color: colors.text, fontFamily: font.semibold, fontSize: 14 },
  tileTextActive: { color: colors.primary },
  check: {
    position: "absolute", top: 10, right: 10,
    width: 18, height: 18, borderRadius: 999,
    backgroundColor: colors.primary,
  },
});
