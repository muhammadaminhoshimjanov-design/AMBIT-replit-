import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card } from "@/components/Card";
import { Avatar } from "@/components/Avatar";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { colors, font, gradients, POST_TYPES } from "@/lib/theme";
import { LinearGradient as LG } from "expo-linear-gradient";

interface Post {
  id: string; author_id: string; content: string; post_type: string;
  like_count: number; comment_count: number; created_at: string;
  circle_id: string | null; image_url: string | null;
  profiles?: { nickname: string | null; avatar_style: string | null; avatar_url: string | null } | null;
  circles?: { name: string } | null;
}

interface Circle { id: string; name: string; topic: string | null; member_count: number }

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const top = Platform.OS === "web" ? Math.max(insets.top, 24) : insets.top;
  const { profile, user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [unread, setUnread] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "circles" | "following">("all");

  const load = useCallback(async () => {
    if (!user) return;
    const [{ data: feedData }, { data: circleData }, { count }] = await Promise.all([
      supabase
        .from("posts")
        .select("*, profiles(nickname,avatar_style,avatar_url), circles(name)")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(50),
      supabase.from("circles").select("*").order("member_count", { ascending: false }).limit(8),
      supabase.from("notifications").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("is_read", false),
    ]);
    setPosts((feedData as Post[]) ?? []);
    setCircles((circleData as Circle[]) ?? []);
    setUnread(count ?? 0);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const filtered = posts; // filters can be expanded; UI shows control

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingTop: top + 8, paddingBottom: 110, paddingHorizontal: 18 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <LG colors={gradients.bg} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.push("/(tabs)/profile")} hitSlop={6}>
          <Avatar name={profile?.nickname} style={profile?.avatar_style} url={profile?.avatar_url} size={44} border />
        </Pressable>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.greeting}>Hey, {profile?.nickname ?? "there"}</Text>
          <Text style={styles.subgreeting}>Level {profile?.level ?? 1} · {profile?.xp ?? 0} XP</Text>
        </View>
        <Pressable onPress={() => router.push("/(tabs)/notifications")} style={styles.iconBtn} hitSlop={6}>
          <Feather name="bell" size={18} color={colors.text} />
          {unread > 0 && <View style={styles.dot} />}
        </Pressable>
      </View>

      {/* XP card */}
      <Pressable onPress={() => router.push("/leaderboard")}>
        <LG colors={gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.xpCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.xpLabel}>YOUR PROGRESS</Text>
            <Text style={styles.xpTitle}>{profile?.streak ?? 0} day streak</Text>
            <Text style={styles.xpSub}>Keep it going to reach Level {(profile?.level ?? 1) + 1}</Text>
          </View>
          <Feather name="zap" size={42} color="#07111F" />
        </LG>
      </Pressable>

      {/* Quick actions */}
      <View style={styles.quickRow}>
        {[
          { icon: "edit-3" as const, label: "Post", to: "/create", color: colors.primary },
          { icon: "target" as const, label: "Goals", to: "/goals", color: colors.success },
          { icon: "award" as const, label: "Badges", to: "/badges", color: "#F59E0B" },
          { icon: "message-square" as const, label: "Mentor", to: "/mentor", color: colors.secondary },
        ].map((q) => (
          <Pressable key={q.label} onPress={() => router.push(q.to as any)} style={styles.quick}>
            <View style={[styles.quickIcon, { backgroundColor: q.color + "22" }]}>
              <Feather name={q.icon} size={18} color={q.color} />
            </View>
            <Text style={styles.quickLabel}>{q.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Filter pills */}
      <View style={styles.filters}>
        {(["all", "circles", "following"] as const).map((f) => (
          <Pressable key={f} onPress={() => setFilter(f)} style={[styles.filter, filter === f && styles.filterActive]}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === "all" ? "All" : f === "circles" ? "My circles" : "Following"}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Trending circles strip */}
      <Text style={styles.sectionTitle}>Active circles</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 4 }} style={{ marginBottom: 16 }}>
        {circles.map((c) => (
          <Pressable key={c.id} onPress={() => router.push(`/community/${c.id}`)} style={styles.circleChip}>
            <View style={styles.circleAvatar}>
              <Text style={styles.circleInitial}>{c.name[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.circleName} numberOfLines={1}>{c.name}</Text>
              <Text style={styles.circleMeta}>{c.member_count} members</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* Feed */}
      <Text style={styles.sectionTitle}>Latest in Ambit</Text>
      {filtered.length === 0 ? (
        <Card style={{ alignItems: "center", paddingVertical: 36 }}>
          <Feather name="message-circle" size={32} color={colors.textDim} />
          <Text style={styles.empty}>No posts yet</Text>
          <Text style={styles.emptySub}>Be the first to share something with the community.</Text>
        </Card>
      ) : (
        filtered.map((p) => <PostCard key={p.id} post={p} />)
      )}
    </ScrollView>
  );
}

export function PostCard({ post }: { post: Post }) {
  const router = useRouter();
  const type = POST_TYPES.find((t) => t.id === post.post_type) ?? POST_TYPES[3];
  const author = post.profiles;
  return (
    <Card style={{ marginBottom: 12 }} onPress={() => router.push(`/post/${post.id}`)}>
      <View style={styles.postHeader}>
        <Pressable onPress={() => router.push(`/user/${post.author_id}`)} hitSlop={6}>
          <Avatar name={author?.nickname} style={author?.avatar_style} url={author?.avatar_url} size={36} />
        </Pressable>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.author}>{author?.nickname ?? "Someone"}</Text>
          <Text style={styles.timestamp}>{relativeTime(post.created_at)}{post.circles?.name ? ` · ${post.circles.name}` : ""}</Text>
        </View>
        <View style={[styles.typeBadge, { backgroundColor: type.color + "22" }]}>
          <Feather name={type.icon as any} size={11} color={type.color} />
          <Text style={[styles.typeText, { color: type.color }]}>{type.label}</Text>
        </View>
      </View>

      <Text style={styles.postContent} numberOfLines={6}>{post.content}</Text>

      <View style={styles.postFooter}>
        <View style={styles.metric}><Feather name="arrow-up" size={14} color={colors.textMuted} /><Text style={styles.metricText}>{post.like_count}</Text></View>
        <View style={styles.metric}><Feather name="message-circle" size={14} color={colors.textMuted} /><Text style={styles.metricText}>{post.comment_count}</Text></View>
        <Pressable hitSlop={8} onPress={() => router.push(`/report?post=${post.id}`)} style={[styles.metric, { marginLeft: "auto" }]}>
          <Feather name="flag" size={13} color={colors.textDim} />
        </Pressable>
      </View>
    </Card>
  );
}

export function relativeTime(iso: string) {
  const now = Date.now();
  const t = new Date(iso).getTime();
  const s = Math.max(1, Math.floor((now - t) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60); if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24); if (d < 7) return `${d}d`;
  return new Date(iso).toLocaleDateString();
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 18 },
  greeting: { color: colors.text, fontFamily: font.bold, fontSize: 18 },
  subgreeting: { color: colors.textMuted, fontSize: 12, marginTop: 2, fontFamily: font.medium },
  iconBtn: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    alignItems: "center", justifyContent: "center",
  },
  dot: { position: "absolute", top: 10, right: 11, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.error },
  xpCard: {
    flexDirection: "row", alignItems: "center", borderRadius: 22, padding: 18, marginBottom: 18,
    shadowColor: colors.primary, shadowOpacity: 0.4, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 8,
  },
  xpLabel: { color: "rgba(7,17,31,0.7)", fontSize: 11, fontFamily: font.bold, letterSpacing: 1.2 },
  xpTitle: { color: "#07111F", fontSize: 22, fontFamily: font.bold, marginTop: 4 },
  xpSub: { color: "rgba(7,17,31,0.75)", fontSize: 12, marginTop: 2, fontFamily: font.medium },
  quickRow: { flexDirection: "row", gap: 10, marginBottom: 18 },
  quick: { flex: 1, alignItems: "center", paddingVertical: 12, backgroundColor: colors.card, borderRadius: 18, borderWidth: 1, borderColor: colors.border },
  quickIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  quickLabel: { color: colors.text, fontSize: 12, fontFamily: font.medium },
  filters: { flexDirection: "row", gap: 8, marginBottom: 18 },
  filter: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  filterActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { color: colors.textMuted, fontSize: 12, fontFamily: font.medium },
  filterTextActive: { color: "#07111F", fontFamily: font.semibold },
  sectionTitle: { color: colors.text, fontSize: 14, fontFamily: font.bold, marginBottom: 10, letterSpacing: 0.2 },
  circleChip: {
    width: 220, padding: 12, borderRadius: 18, backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center", gap: 10,
  },
  circleAvatar: {
    width: 36, height: 36, borderRadius: 12, backgroundColor: "rgba(245,185,66,0.18)",
    alignItems: "center", justifyContent: "center",
  },
  circleInitial: { color: colors.primary, fontFamily: font.bold, fontSize: 16 },
  circleName: { color: colors.text, fontFamily: font.semibold, fontSize: 13 },
  circleMeta: { color: colors.textDim, fontSize: 11, marginTop: 2 },
  postHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  author: { color: colors.text, fontFamily: font.semibold, fontSize: 14 },
  timestamp: { color: colors.textDim, fontSize: 11, marginTop: 2 },
  typeBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999 },
  typeText: { fontSize: 10.5, fontFamily: font.semibold },
  postContent: { color: colors.text, fontSize: 14.5, lineHeight: 21, fontFamily: font.regular },
  postFooter: { flexDirection: "row", gap: 16, marginTop: 12, alignItems: "center" },
  metric: { flexDirection: "row", alignItems: "center", gap: 5 },
  metricText: { color: colors.textMuted, fontSize: 12, fontFamily: font.medium },
  empty: { color: colors.text, fontSize: 16, fontFamily: font.semibold, marginTop: 12 },
  emptySub: { color: colors.textMuted, fontSize: 13, marginTop: 6, textAlign: "center", paddingHorizontal: 30, lineHeight: 18 },
});
