import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { AppInput } from "@/components/AppInput";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { colors, font, POST_TYPES } from "@/lib/theme";

export default function CreatePost() {
  const router = useRouter();
  const { circle: presetCircle } = useLocalSearchParams<{ circle?: string }>();
  const { user } = useAuth();
  const [type, setType] = useState<string>("general");
  const [content, setContent] = useState("");
  const [circleId, setCircleId] = useState<string | null>(presetCircle ?? null);
  const [circles, setCircles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("circle_members")
      .select("circle_id, circles(id,name)")
      .eq("user_id", user.id)
      .then(({ data }) => {
        setCircles((data ?? []).map((d: any) => d.circles).filter(Boolean));
      });
  }, [user]);

  async function submit() {
    setErr(null);
    if (!user) return;
    if (!content.trim()) return setErr("Write something first");
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .insert({ author_id: user.id, content: content.trim(), post_type: type, circle_id: circleId })
      .select("id")
      .single();
    if (error) { setErr(error.message); setLoading(false); return; }
    // award xp
    await supabase.rpc("toggle_like", { p_post_id: data.id, p_user_id: user.id }).catch(() => {});
    setLoading(false);
    router.replace(`/post/${data.id}`);
  }

  return (
    <Screen scroll>
      <Header back title="New post" />

      <Text style={styles.label}>Type</Text>
      <View style={styles.typeRow}>
        {POST_TYPES.map((t) => (
          <Pressable key={t.id} onPress={() => setType(t.id)} style={[styles.typeBtn, type === t.id && { borderColor: t.color, backgroundColor: t.color + "22" }]}>
            <Feather name={t.icon as any} size={14} color={type === t.id ? t.color : colors.textMuted} />
            <Text style={[styles.typeText, type === t.id && { color: t.color }]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Post in circle</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
        <Pressable onPress={() => setCircleId(null)} style={[styles.chip, !circleId && styles.chipActive]}>
          <Text style={[styles.chipText, !circleId && styles.chipTextActive]}>Public</Text>
        </Pressable>
        {circles.map((c) => (
          <Pressable key={c.id} onPress={() => setCircleId(c.id)} style={[styles.chip, circleId === c.id && styles.chipActive]}>
            <Text style={[styles.chipText, circleId === c.id && styles.chipTextActive]}>{c.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <AppInput
        placeholder="What's on your mind?"
        value={content}
        onChangeText={setContent}
        multiline
        containerStyle={{ marginTop: 18 }}
        style={{ minHeight: 180 }}
        error={err}
      />

      <PrimaryButton title="Share with Ambit" icon="send" onPress={submit} loading={loading} style={{ marginTop: 22 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.textMuted, fontFamily: font.medium, fontSize: 13, marginBottom: 8, marginTop: 8 },
  typeRow: { flexDirection: "row", gap: 8, marginBottom: 14, flexWrap: "wrap" },
  typeBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  typeText: { color: colors.textMuted, fontSize: 13, fontFamily: font.medium },
  chip: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontFamily: font.medium, fontSize: 12 },
  chipTextActive: { color: "#07111F", fontFamily: font.semibold },
});
