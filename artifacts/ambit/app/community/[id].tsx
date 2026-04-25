import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { colors, font } from "@/lib/theme";
import { PostCard } from "../(tabs)";

export default function SingleCommunity() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [circle, setCircle] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    const [{ data: c }, { data: p }, { data: m }] = await Promise.all([
      supabase.from("circles").select("*").eq("id", id).single(),
      supabase.from("posts").select("*, profiles(nickname,avatar_style,avatar_url), circles(name)").eq("circle_id", id).eq("status", "active").order("created_at", { ascending: false }),
      user ? supabase.from("circle_members").select("id").eq("circle_id", id).eq("user_id", user.id).maybeSingle() : Promise.resolve({ data: null }),
    ]);
    setCircle(c); setPosts(p ?? []); setJoined(!!m); setLoading(false);
  }, [id, user]);

  useEffect(() => { load(); }, [load]);

  async function toggle() {
    if (!user || !id) return;
    if (joined) {
      await supabase.from("circle_members").delete().eq("circle_id", id).eq("user_id", user.id);
      setJoined(false);
    } else {
      await supabase.from("circle_members").upsert({ circle_id: id, user_id: user.id }, { onConflict: "circle_id,user_id" });
      setJoined(true);
    }
    load();
  }

  if (loading) return <Screen><ActivityIndicator color={colors.primary} style={{ marginTop: 60 }} /></Screen>;
  if (!circle) return <Screen><Header back title="Not found" /></Screen>;

  return (
    <Screen scroll>
      <Header back title={circle.name} subtitle={`${circle.member_count} members`} right={
        <Pressable onPress={() => router.push(`/create?circle=${id}`)} style={styles.iconBtn}><Feather name="edit-3" size={16} color={colors.text} /></Pressable>
      } />

      <Card glow style={{ marginBottom: 14 }}>
        <View style={styles.row}>
          <View style={styles.icon}><Text style={styles.initial}>{circle.name[0]}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{circle.name}</Text>
            <Text style={styles.topic}>{circle.topic ?? "Community"}</Text>
          </View>
        </View>
        {circle.description ? <Text style={styles.desc}>{circle.description}</Text> : null}
        <PrimaryButton
          title={joined ? "Leave circle" : "Join circle"}
          variant={joined ? "secondary" : "primary"}
          onPress={toggle}
          icon={joined ? "check" : "plus"}
          small
          style={{ marginTop: 14 }}
        />
      </Card>

      <Text style={styles.section}>Recent posts</Text>
      {posts.length === 0 ? (
        <Card style={{ alignItems: "center", paddingVertical: 28 }}>
          <Text style={{ color: colors.textMuted }}>No posts in this circle yet.</Text>
        </Card>
      ) : posts.map((p) => <PostCard key={p.id} post={p} />)}
    </Screen>
  );
}

const styles = StyleSheet.create({
  iconBtn: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: 14 },
  icon: { width: 56, height: 56, borderRadius: 18, backgroundColor: "rgba(245,185,66,0.18)", alignItems: "center", justifyContent: "center" },
  initial: { color: colors.primary, fontFamily: font.bold, fontSize: 24 },
  name: { color: colors.text, fontFamily: font.bold, fontSize: 20 },
  topic: { color: colors.textMuted, fontSize: 12, marginTop: 2, fontFamily: font.medium },
  desc: { color: colors.textMuted, marginTop: 12, fontSize: 13.5, lineHeight: 20 },
  section: { color: colors.text, fontFamily: font.bold, fontSize: 14, marginBottom: 10, marginTop: 4 },
});
