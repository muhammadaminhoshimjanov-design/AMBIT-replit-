import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Modal, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { Card } from "@/components/Card";
import { AppInput } from "@/components/AppInput";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { colors, font } from "@/lib/theme";
import { LinearGradient } from "expo-linear-gradient";

const TYPES = [
  { id: "study", label: "Study", icon: "book", color: "#3B82F6" },
  { id: "career", label: "Career", icon: "briefcase", color: "#F5B942" },
  { id: "health", label: "Health", icon: "heart", color: "#EF4444" },
  { id: "habit", label: "Habit", icon: "repeat", color: "#10B981" },
  { id: "general", label: "Other", icon: "target", color: "#8B5CF6" },
];

export default function Goals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<any[]>([]);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("study");

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("goals").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setGoals(data ?? []);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  async function add() {
    if (!user || !title.trim()) return;
    await supabase.from("goals").insert({ user_id: user.id, title: title.trim(), type, progress: 0 });
    setTitle(""); setType("study"); setAdding(false);
    load();
  }

  async function updateProgress(g: any, delta: number) {
    const next = Math.max(0, Math.min(100, (g.progress ?? 0) + delta));
    await supabase.from("goals").update({ progress: next, completed: next === 100 }).eq("id", g.id);
    if (next === 100) {
      // award xp
      await supabase.from("profiles").update({ xp: ((g._userXp ?? 0) + 10) }).eq("id", user!.id);
    }
    load();
  }

  async function remove(g: any) {
    await supabase.from("goals").delete().eq("id", g.id);
    load();
  }

  return (
    <Screen scroll>
      <Header back title="Your goals" right={
        <Pressable onPress={() => setAdding(true)} style={styles.iconBtn}><Feather name="plus" size={18} color={colors.text} /></Pressable>
      } />

      {goals.length === 0 ? (
        <Card style={{ alignItems: "center", paddingVertical: 36 }}>
          <Feather name="target" size={32} color={colors.textDim} />
          <Text style={{ color: colors.text, fontFamily: font.semibold, marginTop: 12, fontSize: 16 }}>Set your first goal</Text>
          <Text style={{ color: colors.textMuted, marginTop: 6, fontSize: 13, textAlign: "center", paddingHorizontal: 24 }}>
            Goals help you track what matters and earn XP toward your level.
          </Text>
          <PrimaryButton title="Add a goal" icon="plus" onPress={() => setAdding(true)} small style={{ marginTop: 16, minWidth: 160 }} />
        </Card>
      ) : (
        goals.map((g) => {
          const t = TYPES.find((x) => x.id === g.type) ?? TYPES[4];
          return (
            <Card key={g.id} style={{ marginBottom: 10 }}>
              <View style={styles.row}>
                <View style={[styles.typeIcon, { backgroundColor: t.color + "22" }]}>
                  <Feather name={t.icon as any} size={16} color={t.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.title, g.completed && { textDecorationLine: "line-through", color: colors.textMuted }]}>{g.title}</Text>
                  <Text style={styles.meta}>{t.label} · {g.progress}%</Text>
                </View>
                <Pressable onPress={() => remove(g)} hitSlop={10}>
                  <Feather name="x" size={16} color={colors.textDim} />
                </Pressable>
              </View>
              <View style={styles.bar}>
                <LinearGradient colors={[t.color, t.color]} style={[styles.fill, { width: `${g.progress}%` }]} />
              </View>
              <View style={styles.actions}>
                <Pressable onPress={() => updateProgress(g, -10)} style={styles.smallBtn}><Feather name="minus" size={13} color={colors.textMuted} /></Pressable>
                <Pressable onPress={() => updateProgress(g, 10)} style={[styles.smallBtn, { backgroundColor: colors.primary }]}><Feather name="plus" size={13} color="#07111F" /></Pressable>
                {!g.completed && (
                  <Pressable onPress={() => updateProgress(g, 100 - g.progress)} style={[styles.smallBtn, { backgroundColor: colors.success + "33", borderColor: colors.success, paddingHorizontal: 10 }]}>
                    <Text style={{ color: colors.success, fontSize: 11, fontFamily: font.semibold }}>Complete</Text>
                  </Pressable>
                )}
              </View>
            </Card>
          );
        })
      )}

      <Modal visible={adding} transparent animationType="slide" onRequestClose={() => setAdding(false)}>
        <View style={styles.modalBg}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>New goal</Text>
            <AppInput placeholder="Title (e.g. Read 12 books this year)" value={title} onChangeText={setTitle} />
            <Text style={styles.label}>Type</Text>
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              {TYPES.map((t) => (
                <Pressable key={t.id} onPress={() => setType(t.id)} style={[styles.chip, type === t.id && { backgroundColor: t.color + "22", borderColor: t.color }]}>
                  <Feather name={t.icon as any} size={13} color={type === t.id ? t.color : colors.textMuted} />
                  <Text style={[styles.chipText, type === t.id && { color: t.color }]}>{t.label}</Text>
                </Pressable>
              ))}
            </View>
            <PrimaryButton title="Add goal" icon="check" onPress={add} style={{ marginTop: 18 }} />
            <PrimaryButton title="Cancel" variant="ghost" onPress={() => setAdding(false)} style={{ marginTop: 6 }} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  iconBtn: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  typeIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  title: { color: colors.text, fontFamily: font.semibold, fontSize: 14 },
  meta: { color: colors.textDim, fontSize: 11, marginTop: 3, fontFamily: font.medium },
  bar: { height: 6, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 999, marginTop: 12, overflow: "hidden" },
  fill: { height: "100%" },
  actions: { flexDirection: "row", gap: 8, marginTop: 12, alignItems: "center" },
  smallBtn: { width: 32, height: 32, borderRadius: 999, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center", flexDirection: "row" },
  modalBg: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.55)" },
  sheet: { backgroundColor: colors.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 22, paddingBottom: 36 },
  sheetHandle: { alignSelf: "center", width: 44, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: 14 },
  sheetTitle: { color: colors.text, fontFamily: font.bold, fontSize: 18, marginBottom: 14 },
  label: { color: colors.textMuted, fontFamily: font.medium, fontSize: 13, marginVertical: 12 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg },
  chipText: { color: colors.textMuted, fontSize: 12, fontFamily: font.medium },
});
