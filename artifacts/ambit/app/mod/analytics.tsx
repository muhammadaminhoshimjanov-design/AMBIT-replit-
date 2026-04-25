import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { Card } from "@/components/Card";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { colors, font, gradients } from "@/lib/theme";

export default function Analytics() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    users: 0, posts: 0, comments: 0, circles: 0, reports: 0, premium: 0, banned: 0, mods: 0,
  });
  const [topCircles, setTopCircles] = useState<any[]>([]);
  const [topUsers, setTopUsers] = useState<any[]>([]);

  const load = useCallback(async () => {
    const [u, p, c, ci, r, pr, ba, md, tc, tu] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("posts").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("comments").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("circles").select("*", { count: "exact", head: true }),
      supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "open"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_premium", true),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_banned", true),
      supabase.from("profiles").select("*", { count: "exact", head: true }).in("role", ["mod", "admin"]),
      supabase.from("circles").select("name,member_count").order("member_count", { ascending: false }).limit(5),
      supabase.from("profiles").select("nickname,xp,avatar_style").order("xp", { ascending: false }).limit(5),
    ]);
    setStats({
      users: u.count ?? 0, posts: p.count ?? 0, comments: c.count ?? 0, circles: ci.count ?? 0,
      reports: r.count ?? 0, premium: pr.count ?? 0, banned: ba.count ?? 0, mods: md.count ?? 0,
    });
    setTopCircles(tc.data ?? []);
    setTopUsers(tu.data ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (profile && profile.role !== "mod" && profile.role !== "admin") {
    return (
      <Screen>
        <Header back title="Analytics" />
        <Card style={{ alignItems: "center", paddingVertical: 40 }}>
          <Feather name="lock" size={28} color={colors.textDim} />
          <Text style={{ color: colors.text, fontFamily: font.semibold, marginTop: 12, fontSize: 16 }}>Staff only</Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Header back title="Analytics" subtitle="Community health" />

      <LinearGradient colors={gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <Text style={styles.heroLabel}>TOTAL USERS</Text>
        <Text style={styles.heroValue}>{stats.users.toLocaleString()}</Text>
        <View style={styles.heroRow}>
          <Pill icon="star" label={`${stats.premium} premium`} />
          <Pill icon="shield" label={`${stats.mods} staff`} />
        </View>
      </LinearGradient>

      <View style={styles.grid}>
        <Tile icon="message-circle" label="Posts" value={stats.posts} color={colors.secondary} />
        <Tile icon="message-square" label="Comments" value={stats.comments} color="#8B5CF6" />
        <Tile icon="users" label="Circles" value={stats.circles} color={colors.success} />
        <Tile icon="flag" label="Open reports" value={stats.reports} color={colors.error} />
        <Tile icon="slash" label="Banned" value={stats.banned} color={colors.warning} />
        <Tile icon="award" label="Premium" value={stats.premium} color={colors.primary} />
      </View>

      <Text style={styles.section}>Top circles</Text>
      {topCircles.map((c, i) => (
        <Card key={c.name} style={{ marginBottom: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Text style={styles.rank}>#{i + 1}</Text>
            <Text style={{ color: colors.text, fontFamily: font.semibold, flex: 1 }}>{c.name}</Text>
            <Text style={{ color: colors.primary, fontFamily: font.bold, fontSize: 13 }}>{c.member_count}</Text>
          </View>
        </Card>
      ))}

      <Text style={styles.section}>Top contributors</Text>
      {topUsers.map((u, i) => (
        <Card key={u.nickname} style={{ marginBottom: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Text style={styles.rank}>#{i + 1}</Text>
            <Text style={{ color: colors.text, fontFamily: font.semibold, flex: 1 }}>{u.nickname ?? "?"}</Text>
            <Text style={{ color: colors.primary, fontFamily: font.bold, fontSize: 13 }}>{u.xp} XP</Text>
          </View>
        </Card>
      ))}
    </Screen>
  );
}

function Pill({ icon, label }: { icon: any; label: string }) {
  return (
    <View style={styles.pill}>
      <Feather name={icon} size={11} color="#07111F" />
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

function Tile({ icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <View style={styles.tile}>
      <View style={[styles.tileIcon, { backgroundColor: color + "22" }]}>
        <Feather name={icon} size={16} color={color} />
      </View>
      <Text style={styles.tileValue}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { padding: 22, borderRadius: 24, marginBottom: 16 },
  heroLabel: { color: "rgba(7,17,31,0.7)", fontSize: 11, fontFamily: font.bold, letterSpacing: 1.2 },
  heroValue: { color: "#07111F", fontSize: 38, fontFamily: font.bold, marginTop: 4 },
  heroRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  pill: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(7,17,31,0.18)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  pillText: { color: "#07111F", fontSize: 11, fontFamily: font.semibold },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 18 },
  tile: { width: "31.3%", backgroundColor: colors.card, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 14, alignItems: "center" },
  tileIcon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  tileValue: { color: colors.text, fontFamily: font.bold, fontSize: 18 },
  tileLabel: { color: colors.textMuted, fontSize: 11, marginTop: 3, textAlign: "center" },
  section: { color: colors.text, fontFamily: font.bold, fontSize: 14, marginBottom: 10, marginTop: 4 },
  rank: { color: colors.textDim, fontFamily: font.bold, fontSize: 13, width: 30 },
});
