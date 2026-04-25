import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { Card } from "@/components/Card";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { colors, font } from "@/lib/theme";
import { relativeTime } from "../(tabs)";

export default function ModDashboard() {
  const router = useRouter();
  const { profile } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [stats, setStats] = useState({ open: 0, reviewing: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"open" | "all">("open");

  const load = useCallback(async () => {
    const q = supabase.from("reports").select("*, reporter:reporter_id(nickname,avatar_style), reported:reported_user_id(nickname,avatar_style)").order("created_at", { ascending: false }).limit(60);
    const { data } = filter === "open" ? await q.eq("status", "open") : await q;
    setReports(data ?? []);
    const { data: counts } = await supabase.from("reports").select("status");
    const s = { open: 0, reviewing: 0, resolved: 0 };
    (counts ?? []).forEach((r: any) => { if (s[r.status as keyof typeof s] !== undefined) s[r.status as keyof typeof s]++; });
    setStats(s);
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function update(r: any, status: string) {
    await supabase.from("reports").update({ status }).eq("id", r.id);
    load();
  }

  if (profile && profile.role !== "mod" && profile.role !== "admin") {
    return (
      <Screen>
        <Header back title="Mod dashboard" />
        <Card style={{ alignItems: "center", paddingVertical: 40 }}>
          <Feather name="lock" size={28} color={colors.textDim} />
          <Text style={{ color: colors.text, fontFamily: font.semibold, marginTop: 12, fontSize: 16 }}>Staff only</Text>
          <Text style={{ color: colors.textMuted, marginTop: 6, fontSize: 13, textAlign: "center" }}>Only moderators and admins can access this area.</Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Header back title="Mod dashboard" subtitle="Reports queue" />

      <View style={styles.statRow}>
        <StatBox label="Open" value={stats.open} color={colors.error} />
        <StatBox label="Reviewing" value={stats.reviewing} color={colors.warning} />
        <StatBox label="Resolved" value={stats.resolved} color={colors.success} />
      </View>

      <View style={styles.tabs}>
        <Pressable onPress={() => setFilter("open")} style={[styles.tab, filter === "open" && styles.tabActive]}>
          <Text style={[styles.tabText, filter === "open" && styles.tabTextActive]}>Open ({stats.open})</Text>
        </Pressable>
        <Pressable onPress={() => setFilter("all")} style={[styles.tab, filter === "all" && styles.tabActive]}>
          <Text style={[styles.tabText, filter === "all" && styles.tabTextActive]}>All</Text>
        </Pressable>
      </View>

      {loading ? <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} /> :
       reports.length === 0 ? (
        <Card style={{ alignItems: "center", paddingVertical: 40 }}>
          <Feather name="check-circle" size={32} color={colors.success} />
          <Text style={{ color: colors.text, fontFamily: font.semibold, marginTop: 12, fontSize: 16 }}>Queue clear</Text>
          <Text style={{ color: colors.textMuted, marginTop: 6, fontSize: 13 }}>Nothing here. Nice work.</Text>
        </Card>
      ) : reports.map((r) => (
        <Card key={r.id} style={{ marginBottom: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <View style={[styles.severity, { backgroundColor: severityColor(r.severity) + "22" }]}>
              <Text style={[styles.severityText, { color: severityColor(r.severity) }]}>{r.severity}</Text>
            </View>
            <Text style={{ color: colors.textDim, fontSize: 11 }}>{relativeTime(r.created_at)}</Text>
          </View>
          <Text style={styles.reason}>{r.reason}</Text>
          {r.details ? <Text style={styles.details}>{r.details}</Text> : null}
          <View style={styles.metaRow}>
            <Text style={styles.meta}>By {r.reporter?.nickname ?? "Anonymous"}</Text>
            {r.reported?.nickname && <Text style={styles.meta}>· On {r.reported.nickname}</Text>}
          </View>
          <View style={styles.actionRow}>
            {r.post_id && (
              <Pressable onPress={() => router.push(`/post/${r.post_id}`)} style={styles.linkBtn}>
                <Feather name="external-link" size={12} color={colors.text} /><Text style={styles.linkText}>View post</Text>
              </Pressable>
            )}
            <Pressable onPress={() => update(r, "reviewing")} style={[styles.linkBtn, { backgroundColor: colors.warning + "22", borderColor: colors.warning }]}>
              <Text style={[styles.linkText, { color: colors.warning }]}>Reviewing</Text>
            </Pressable>
            <Pressable onPress={() => update(r, "resolved")} style={[styles.linkBtn, { backgroundColor: colors.success + "22", borderColor: colors.success }]}>
              <Text style={[styles.linkText, { color: colors.success }]}>Resolve</Text>
            </Pressable>
            <Pressable onPress={() => update(r, "dismissed")} style={[styles.linkBtn]}>
              <Text style={[styles.linkText, { color: colors.textDim }]}>Dismiss</Text>
            </Pressable>
          </View>
        </Card>
      ))}
    </Screen>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={[styles.stat, { borderColor: color + "55" }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function severityColor(s: string) {
  return s === "critical" ? colors.error : s === "high" ? "#F97316" : s === "medium" ? colors.warning : colors.textMuted;
}

const styles = StyleSheet.create({
  statRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  stat: { flex: 1, padding: 14, borderRadius: 18, backgroundColor: colors.card, borderWidth: 1, alignItems: "center" },
  statValue: { fontFamily: font.bold, fontSize: 22 },
  statLabel: { color: colors.textMuted, fontSize: 11, marginTop: 4, fontFamily: font.medium },
  tabs: { flexDirection: "row", backgroundColor: colors.card, borderRadius: 14, padding: 4, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  tab: { flex: 1, paddingVertical: 9, alignItems: "center", borderRadius: 10 },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textMuted, fontFamily: font.semibold, fontSize: 13 },
  tabTextActive: { color: "#07111F" },
  severity: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  severityText: { fontSize: 10, fontFamily: font.bold, textTransform: "uppercase" },
  reason: { color: colors.text, fontFamily: font.semibold, fontSize: 14 },
  details: { color: colors.textMuted, fontSize: 12.5, marginTop: 6, lineHeight: 18 },
  metaRow: { flexDirection: "row", gap: 6, marginTop: 10 },
  meta: { color: colors.textDim, fontSize: 11, fontFamily: font.medium },
  actionRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 },
  linkBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: "rgba(255,255,255,0.04)" },
  linkText: { color: colors.text, fontSize: 11.5, fontFamily: font.semibold },
});
