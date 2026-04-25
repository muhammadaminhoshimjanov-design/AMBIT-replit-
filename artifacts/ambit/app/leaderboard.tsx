import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { Card } from "@/components/Card";
import { Avatar } from "@/components/Avatar";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { colors, font, gradients } from "@/lib/theme";

export default function Leaderboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [scope, setScope] = useState<"global" | "weekly">("global");

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id,nickname,avatar_style,avatar_url,ambition_title,xp,level,streak")
      .eq("is_banned", false)
      .order("xp", { ascending: false })
      .limit(50);
    setUsers(data ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const myRank = users.findIndex((u) => u.id === user?.id);
  const top3 = users.slice(0, 3);
  const rest = users.slice(3);

  return (
    <Screen scroll>
      <Header back title="Leaderboard" subtitle={myRank >= 0 ? `Your rank: #${myRank + 1}` : ""} />

      <View style={styles.tabs}>
        {(["global", "weekly"] as const).map((s) => (
          <Pressable key={s} onPress={() => setScope(s)} style={[styles.tab, scope === s && styles.tabActive]}>
            <Text style={[styles.tabText, scope === s && styles.tabTextActive]}>{s === "global" ? "All time" : "This week"}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.podium}>
        {[1, 0, 2].map((idx) => {
          const u = top3[idx]; if (!u) return <View key={idx} style={{ flex: 1 }} />;
          const place = idx + 1;
          const heights = [110, 130, 90];
          return (
            <View key={u.id} style={{ flex: 1, alignItems: "center" }}>
              <Pressable onPress={() => router.push(`/user/${u.id}`)}>
                <Avatar name={u.nickname} style={u.avatar_style} url={u.avatar_url} size={place === 1 ? 70 : 56} border />
              </Pressable>
              <Text style={styles.podName} numberOfLines={1}>{u.nickname ?? "?"}</Text>
              <Text style={styles.podXp}>{u.xp} XP</Text>
              <LinearGradient
                colors={place === 1 ? gradients.gold : place === 2 ? ["#9CA3AF", "#6B7280"] : ["#A16207", "#92400E"]}
                style={[styles.podBlock, { height: heights[idx] }]}
              >
                <Text style={styles.podRank}>{place}</Text>
              </LinearGradient>
            </View>
          );
        })}
      </View>

      <View style={{ marginTop: 16 }}>
        {rest.map((u, i) => (
          <Card key={u.id} onPress={() => router.push(`/user/${u.id}`)} style={[{ marginBottom: 8 }, u.id === user?.id && { borderColor: colors.primary }]}>
            <View style={styles.row}>
              <Text style={styles.rank}>#{i + 4}</Text>
              <Avatar name={u.nickname} style={u.avatar_style} url={u.avatar_url} size={40} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.name}>{u.nickname ?? "Anonymous"}</Text>
                {u.ambition_title ? <Text style={styles.amb} numberOfLines={1}>{u.ambition_title}</Text> : null}
              </View>
              <View style={styles.xpBadge}><Text style={styles.xpText}>{u.xp} XP</Text></View>
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: "row", backgroundColor: colors.card, borderRadius: 14, padding: 4, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textMuted, fontFamily: font.semibold, fontSize: 13 },
  tabTextActive: { color: "#07111F" },
  podium: { flexDirection: "row", alignItems: "flex-end", gap: 10, marginBottom: 6 },
  podName: { color: colors.text, fontFamily: font.semibold, fontSize: 12, marginTop: 8, maxWidth: 100 },
  podXp: { color: colors.primary, fontFamily: font.bold, fontSize: 11, marginTop: 2 },
  podBlock: { width: "100%", borderTopLeftRadius: 12, borderTopRightRadius: 12, alignItems: "center", justifyContent: "center", marginTop: 8 },
  podRank: { color: "#07111F", fontFamily: font.bold, fontSize: 26 },
  row: { flexDirection: "row", alignItems: "center" },
  rank: { color: colors.textMuted, fontFamily: font.bold, fontSize: 13, width: 36 },
  name: { color: colors.text, fontFamily: font.semibold, fontSize: 14 },
  amb: { color: colors.textDim, fontSize: 11, marginTop: 2 },
  xpBadge: { paddingHorizontal: 10, paddingVertical: 5, backgroundColor: "rgba(245,185,66,0.18)", borderRadius: 999 },
  xpText: { color: colors.primary, fontFamily: font.bold, fontSize: 11 },
});
