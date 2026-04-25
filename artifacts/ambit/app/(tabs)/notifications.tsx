import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card } from "@/components/Card";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { colors, font } from "@/lib/theme";
import { relativeTime } from "./index";

const ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  like: "heart", comment: "message-circle", follow: "user-plus", badge: "award",
  mention: "at-sign", system: "bell", goal: "target",
};
const COLORS: Record<string, string> = {
  like: "#EF4444", comment: "#3B82F6", follow: "#10B981", badge: "#F5B942",
  mention: "#8B5CF6", system: "#B8C3D9", goal: "#06B6D4",
};

export default function Notifications() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const top = Platform.OS === "web" ? Math.max(insets.top, 24) : insets.top;
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(80);
    setItems(data ?? []);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  async function markAll() {
    if (!user) return;
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    load();
  }

  function open(n: any) {
    if (!n.is_read) supabase.from("notifications").update({ is_read: true }).eq("id", n.id);
    if (n.link) router.push(n.link);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: top + 12, paddingBottom: 110, paddingHorizontal: 18 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor={colors.primary} />}
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>Inbox</Text>
          <Pressable onPress={markAll} hitSlop={8}>
            <Text style={styles.action}>Mark all read</Text>
          </Pressable>
        </View>

        {items.length === 0 ? (
          <Card style={{ alignItems: "center", paddingVertical: 40 }}>
            <Feather name="bell" size={28} color={colors.textDim} />
            <Text style={{ color: colors.text, fontFamily: font.semibold, marginTop: 10, fontSize: 16 }}>You're all caught up</Text>
            <Text style={{ color: colors.textMuted, marginTop: 6, fontSize: 13 }}>Notifications will appear here.</Text>
          </Card>
        ) : items.map((n) => (
          <Pressable key={n.id} onPress={() => open(n)}>
            <Card style={{ marginBottom: 10, opacity: n.is_read ? 0.75 : 1, borderColor: n.is_read ? colors.border : colors.primary + "55" }}>
              <View style={styles.row}>
                <View style={[styles.iconBox, { backgroundColor: (COLORS[n.type] ?? colors.primary) + "22" }]}>
                  <Feather name={ICONS[n.type] ?? "bell"} size={16} color={COLORS[n.type] ?? colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.notifTitle}>{n.title}</Text>
                  {n.body ? <Text style={styles.notifBody}>{n.body}</Text> : null}
                  <Text style={styles.time}>{relativeTime(n.created_at)}</Text>
                </View>
                {!n.is_read && <View style={styles.dot} />}
              </View>
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  title: { color: colors.text, fontFamily: font.bold, fontSize: 24, flex: 1 },
  action: { color: colors.primary, fontFamily: font.semibold, fontSize: 13 },
  row: { flexDirection: "row", gap: 12, alignItems: "center" },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  notifTitle: { color: colors.text, fontFamily: font.semibold, fontSize: 14 },
  notifBody: { color: colors.textMuted, fontSize: 12, marginTop: 3, lineHeight: 17 },
  time: { color: colors.textDim, fontSize: 11, marginTop: 5 },
  dot: { width: 8, height: 8, borderRadius: 999, backgroundColor: colors.primary },
});
