import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppInput } from "@/components/AppInput";
import { Card } from "@/components/Card";
import { Avatar } from "@/components/Avatar";
import { supabase } from "@/lib/supabase";
import { colors, font } from "@/lib/theme";

export default function Search() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const top = Platform.OS === "web" ? Math.max(insets.top, 24) : insets.top;
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [circles, setCircles] = useState<any[]>([]);
  const [tab, setTab] = useState<"users" | "posts" | "circles">("users");
  const [trending, setTrending] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("circles").select("*").order("member_count", { ascending: false }).limit(6).then(({ data }) => setTrending(data ?? []));
  }, []);

  const run = useCallback(async () => {
    const q = query.trim();
    if (!q) { setUsers([]); setPosts([]); setCircles([]); return; }
    const [{ data: u }, { data: p }, { data: c }] = await Promise.all([
      supabase.from("profiles").select("*").or(`nickname.ilike.%${q}%,bio.ilike.%${q}%,ambition_title.ilike.%${q}%`).limit(20),
      supabase.from("posts").select("*, profiles(nickname,avatar_style)").ilike("content", `%${q}%`).eq("status", "active").limit(20),
      supabase.from("circles").select("*").or(`name.ilike.%${q}%,description.ilike.%${q}%`).limit(20),
    ]);
    setUsers(u ?? []); setPosts(p ?? []); setCircles(c ?? []);
  }, [query]);

  useEffect(() => {
    const t = setTimeout(run, 220);
    return () => clearTimeout(t);
  }, [run]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: top + 12, paddingBottom: 110, paddingHorizontal: 18 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Discover</Text>

        <AppInput
          icon="search"
          placeholder="Search people, posts, circles…"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          containerStyle={{ marginBottom: 16 }}
        />

        <View style={styles.tabs}>
          {(["users", "posts", "circles"] as const).map((t) => (
            <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === "users" ? "People" : t === "posts" ? "Posts" : "Circles"}
              </Text>
            </Pressable>
          ))}
        </View>

        {!query.trim() ? (
          <View>
            <Text style={styles.section}>Trending circles</Text>
            <View style={{ gap: 10 }}>
              {trending.map((c) => (
                <Card key={c.id} onPress={() => router.push(`/community/${c.id}`)}>
                  <Text style={{ color: colors.text, fontFamily: font.semibold, fontSize: 15 }}>{c.name}</Text>
                  <Text style={{ color: colors.textDim, marginTop: 4, fontSize: 12 }}>{c.member_count} members</Text>
                </Card>
              ))}
            </View>
          </View>
        ) : tab === "users" ? (
          users.map((u) => (
            <Card key={u.id} onPress={() => router.push(`/user/${u.id}`)} style={{ marginBottom: 10 }}>
              <View style={styles.row}>
                <Avatar name={u.nickname} style={u.avatar_style} url={u.avatar_url} size={44} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.name}>{u.nickname ?? "Anonymous"}</Text>
                  {u.ambition_title ? <Text style={styles.sub}>{u.ambition_title}</Text> : null}
                </View>
                <View style={styles.xpBadge}><Text style={styles.xpText}>L{u.level ?? 1}</Text></View>
              </View>
            </Card>
          ))
        ) : tab === "posts" ? (
          posts.map((p) => (
            <Card key={p.id} onPress={() => router.push(`/post/${p.id}`)} style={{ marginBottom: 10 }}>
              <Text style={styles.author}>{p.profiles?.nickname ?? "Anonymous"}</Text>
              <Text style={{ color: colors.text, marginTop: 6, fontSize: 14, lineHeight: 20 }} numberOfLines={4}>{p.content}</Text>
            </Card>
          ))
        ) : (
          circles.map((c) => (
            <Card key={c.id} onPress={() => router.push(`/community/${c.id}`)} style={{ marginBottom: 10 }}>
              <Text style={styles.name}>{c.name}</Text>
              {c.description ? <Text style={styles.sub} numberOfLines={2}>{c.description}</Text> : null}
              <Text style={{ color: colors.textDim, marginTop: 6, fontSize: 11 }}>{c.member_count} members</Text>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontFamily: font.bold, fontSize: 24, marginBottom: 14 },
  tabs: { flexDirection: "row", backgroundColor: colors.card, borderRadius: 14, padding: 4, marginBottom: 14, borderWidth: 1, borderColor: colors.border },
  tab: { flex: 1, paddingVertical: 9, alignItems: "center", borderRadius: 10 },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textMuted, fontFamily: font.semibold, fontSize: 12 },
  tabTextActive: { color: "#07111F" },
  section: { color: colors.text, fontFamily: font.bold, fontSize: 14, marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center" },
  name: { color: colors.text, fontFamily: font.semibold, fontSize: 15 },
  sub: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
  author: { color: colors.primary, fontFamily: font.semibold, fontSize: 12 },
  xpBadge: { paddingHorizontal: 10, paddingVertical: 5, backgroundColor: "rgba(245,185,66,0.18)", borderRadius: 999 },
  xpText: { color: colors.primary, fontFamily: font.bold, fontSize: 11 },
});
