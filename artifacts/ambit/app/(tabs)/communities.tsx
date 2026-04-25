import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card } from "@/components/Card";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { colors, font } from "@/lib/theme";

interface Circle { id: string; name: string; description: string | null; topic: string | null; member_count: number; joined?: boolean }

export default function Communities() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const top = Platform.OS === "web" ? Math.max(insets.top, 24) : insets.top;
  const { user } = useAuth();
  const [circles, setCircles] = useState<Circle[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<"all" | "joined">("all");

  const load = useCallback(async () => {
    if (!user) return;
    const [{ data: cs }, { data: my }] = await Promise.all([
      supabase.from("circles").select("*").order("member_count", { ascending: false }),
      supabase.from("circle_members").select("circle_id").eq("user_id", user.id),
    ]);
    const joinedSet = new Set((my ?? []).map((m: any) => m.circle_id));
    setCircles(((cs ?? []) as Circle[]).map((c) => ({ ...c, joined: joinedSet.has(c.id) })));
  }, [user]);

  useEffect(() => { load(); }, [load]);

  async function toggle(c: Circle) {
    if (!user) return;
    if (c.joined) {
      await supabase.from("circle_members").delete().eq("user_id", user.id).eq("circle_id", c.id);
    } else {
      await supabase.from("circle_members").upsert({ user_id: user.id, circle_id: c.id }, { onConflict: "user_id,circle_id" });
    }
    load();
  }

  const filtered = tab === "joined" ? circles.filter((c) => c.joined) : circles;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: top + 12, paddingBottom: 110, paddingHorizontal: 18 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor={colors.primary} />}
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>Circles</Text>
          <Pressable onPress={() => router.push("/(tabs)/search")} style={styles.iconBtn}>
            <Feather name="search" size={18} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.tabs}>
          {(["all", "joined"] as const).map((t) => (
            <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === "all" ? `Discover (${circles.length})` : `Joined (${circles.filter((c) => c.joined).length})`}
              </Text>
            </Pressable>
          ))}
        </View>

        {filtered.map((c) => (
          <Card key={c.id} style={{ marginBottom: 10 }}>
            <View style={styles.row}>
              <View style={styles.avatar}>
                <Text style={styles.initial}>{c.name[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Pressable onPress={() => router.push(`/community/${c.id}`)}>
                  <Text style={styles.name}>{c.name}</Text>
                  {c.description ? <Text style={styles.desc} numberOfLines={2}>{c.description}</Text> : null}
                  <Text style={styles.meta}>{c.member_count} members{c.topic ? ` · ${c.topic}` : ""}</Text>
                </Pressable>
              </View>
              <Pressable onPress={() => toggle(c)} style={[styles.joinBtn, c.joined && styles.joinedBtn]}>
                <Text style={[styles.joinText, c.joined && styles.joinedText]}>{c.joined ? "Joined" : "Join"}</Text>
              </Pressable>
            </View>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Text style={{ color: colors.textMuted, textAlign: "center", marginTop: 30 }}>No circles to show.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  title: { color: colors.text, fontFamily: font.bold, fontSize: 24, flex: 1 },
  iconBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  tabs: { flexDirection: "row", backgroundColor: colors.card, borderRadius: 14, padding: 4, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textMuted, fontFamily: font.semibold, fontSize: 13 },
  tabTextActive: { color: "#07111F" },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 14, backgroundColor: "rgba(245,185,66,0.18)", alignItems: "center", justifyContent: "center" },
  initial: { color: colors.primary, fontFamily: font.bold, fontSize: 20 },
  name: { color: colors.text, fontFamily: font.semibold, fontSize: 15 },
  desc: { color: colors.textMuted, fontSize: 12, marginTop: 2, lineHeight: 17 },
  meta: { color: colors.textDim, fontSize: 11, marginTop: 4 },
  joinBtn: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.primary, borderRadius: 999 },
  joinedBtn: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.border },
  joinText: { color: "#07111F", fontFamily: font.semibold, fontSize: 12 },
  joinedText: { color: colors.textMuted },
});
