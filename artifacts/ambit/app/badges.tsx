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

export default function Badges() {
  const { user, profile } = useAuth();
  const [badges, setBadges] = useState<any[]>([]);
  const [earned, setEarned] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    if (!user) return;
    const [{ data: all }, { data: mine }] = await Promise.all([
      supabase.from("badges").select("*").order("xp_required"),
      supabase.from("user_badges").select("badge_id").eq("user_id", user.id),
    ]);
    setBadges(all ?? []);
    setEarned(new Set((mine ?? []).map((m: any) => m.badge_id)));
  }, [user]);

  useEffect(() => { load(); }, [load]);

  // auto-award when xp threshold hit
  useEffect(() => {
    if (!user || !profile) return;
    badges.forEach(async (b) => {
      if (!earned.has(b.id) && profile.xp >= b.xp_required && b.xp_required > 0) {
        await supabase.from("user_badges").upsert({ user_id: user.id, badge_id: b.id }, { onConflict: "user_id,badge_id" });
        await supabase.from("notifications").insert({
          user_id: user.id, title: "Badge unlocked", body: b.name, type: "badge", link: "/badges",
        });
      }
    });
  }, [profile?.xp, badges]);

  return (
    <Screen scroll>
      <Header back title="Badges" subtitle={`${earned.size} of ${badges.length} earned`} />

      <LinearGradient colors={gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.banner}>
        <Feather name="award" size={28} color="#07111F" />
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={styles.bannerTitle}>Earn badges by being active</Text>
          <Text style={styles.bannerSub}>Post, comment, complete goals, and help others to level up.</Text>
        </View>
      </LinearGradient>

      <View style={styles.grid}>
        {badges.map((b) => {
          const has = earned.has(b.id);
          return (
            <Card key={b.id} style={[styles.tile, !has && { opacity: 0.55 }]}>
              <View style={[styles.iconWrap, { backgroundColor: (b.color ?? colors.primary) + "22" }]}>
                <Feather name={(b.icon ?? "award") as any} size={22} color={b.color ?? colors.primary} />
              </View>
              <Text style={styles.bName}>{b.name}</Text>
              <Text style={styles.bDesc} numberOfLines={2}>{b.description}</Text>
              <Text style={styles.xp}>{b.xp_required} XP</Text>
              {has && <View style={styles.earnedTag}><Text style={styles.earnedText}>Earned</Text></View>}
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: "row", alignItems: "center", padding: 18, borderRadius: 22, marginBottom: 16 },
  bannerTitle: { color: "#07111F", fontFamily: font.bold, fontSize: 14 },
  bannerSub: { color: "rgba(7,17,31,0.75)", fontSize: 12, marginTop: 3, fontFamily: font.medium, lineHeight: 17 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: { width: "48%", padding: 16, alignItems: "flex-start" },
  iconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  bName: { color: colors.text, fontFamily: font.bold, fontSize: 14 },
  bDesc: { color: colors.textMuted, fontSize: 12, marginTop: 4, lineHeight: 17, minHeight: 34 },
  xp: { color: colors.primary, fontSize: 11, fontFamily: font.bold, marginTop: 6 },
  earnedTag: { position: "absolute", top: 12, right: 12, backgroundColor: colors.success, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  earnedText: { color: "#07111F", fontSize: 10, fontFamily: font.bold },
});
