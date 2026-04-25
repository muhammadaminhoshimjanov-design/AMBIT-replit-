import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Card } from "@/components/Card";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { colors, font } from "@/lib/theme";

interface Circle { id: string; name: string; description: string | null; topic: string | null; member_count: number }

export default function CommunitiesOnb() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const [circles, setCircles] = useState<Circle[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.from("circles").select("*").order("member_count", { ascending: false }).then(({ data }) => {
      setCircles((data as Circle[]) ?? []);
      setLoading(false);
    });
  }, []);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function finish() {
    if (!user) return;
    setSubmitting(true);
    if (selected.size > 0) {
      const inserts = Array.from(selected).map((cid) => ({ circle_id: cid, user_id: user.id }));
      await supabase.from("circle_members").upsert(inserts, { onConflict: "circle_id,user_id" });
    }
    await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", user.id);
    // award starter badge
    const { data: starter } = await supabase.from("badges").select("id").eq("name", "First Step").single();
    if (starter) await supabase.from("user_badges").upsert({ user_id: user.id, badge_id: starter.id }, { onConflict: "user_id,badge_id" });
    await refreshProfile();
    setSubmitting(false);
    router.replace("/(tabs)");
  }

  return (
    <Screen scroll>
      <Header back title="Find your circles" subtitle="Step 3 of 3" />

      <View style={styles.progress}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={[styles.dot, styles.dotActive]} />
        <View style={[styles.dot, styles.dotActive]} />
      </View>

      <Text style={styles.intro}>Join the rooms where the conversations matter to you.</Text>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 30 }} />
      ) : (
        <View style={{ gap: 10 }}>
          {circles.map((c) => {
            const on = selected.has(c.id);
            return (
              <Card key={c.id} onPress={() => toggle(c.id)} style={on ? styles.cardActive : undefined}>
                <View style={styles.cardRow}>
                  <View style={[styles.bullet, on && styles.bulletActive]}>
                    {on && <Feather name="check" size={14} color="#07111F" />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{c.name}</Text>
                    {c.description ? <Text style={styles.desc} numberOfLines={1}>{c.description}</Text> : null}
                    <Text style={styles.meta}>{c.member_count} members{c.topic ? ` · ${c.topic}` : ""}</Text>
                  </View>
                </View>
              </Card>
            );
          })}
        </View>
      )}

      <PrimaryButton
        title={selected.size === 0 ? "Skip for now" : `Join ${selected.size} & finish`}
        icon="arrow-right"
        loading={submitting}
        onPress={finish}
        style={{ marginTop: 24, marginBottom: 8 }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  progress: { flexDirection: "row", gap: 8, marginBottom: 18 },
  dot: { flex: 1, height: 4, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primary },
  intro: { color: colors.textMuted, fontSize: 14, fontFamily: font.regular, marginBottom: 18, lineHeight: 20 },
  cardActive: { borderColor: colors.primary, backgroundColor: "rgba(245,185,66,0.06)" },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  bullet: {
    width: 26, height: 26, borderRadius: 999,
    borderWidth: 1.5, borderColor: colors.border,
    alignItems: "center", justifyContent: "center",
  },
  bulletActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  name: { color: colors.text, fontFamily: font.semibold, fontSize: 15 },
  desc: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  meta: { color: colors.textDim, fontSize: 12, marginTop: 4, fontFamily: font.medium },
});
