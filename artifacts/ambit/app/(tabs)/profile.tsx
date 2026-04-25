import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Card } from "@/components/Card";
import { Avatar } from "@/components/Avatar";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { colors, font, gradients } from "@/lib/theme";
import { PostCard } from "./index";

export default function Profile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const top = Platform.OS === "web" ? Math.max(insets.top, 24) : insets.top;
  const { user, profile, signOut } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0, badges: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const [{ data: p, count: pc }, { count: fc }, { count: fgc }, { count: bc }] = await Promise.all([
      supabase.from("posts").select("*, profiles(nickname,avatar_style,avatar_url), circles(name)", { count: "exact" }).eq("author_id", user.id).order("created_at", { ascending: false }),
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", user.id),
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", user.id),
      supabase.from("user_badges").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    ]);
    setPosts(p ?? []);
    setStats({ posts: pc ?? 0, followers: fc ?? 0, following: fgc ?? 0, badges: bc ?? 0 });
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const xpProgress = ((profile?.xp ?? 0) % 100) / 100;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: top + 12, paddingBottom: 110, paddingHorizontal: 18 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor={colors.primary} />}
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>Me</Text>
          <Pressable onPress={() => router.push("/settings")} style={styles.iconBtn}>
            <Feather name="settings" size={18} color={colors.text} />
          </Pressable>
        </View>

        {/* Profile card */}
        <Card glow style={{ marginBottom: 16, alignItems: "center", paddingVertical: 22 }}>
          <Avatar name={profile?.nickname} style={profile?.avatar_style} url={profile?.avatar_url} size={92} border />
          <Text style={styles.name}>{profile?.nickname ?? "Anonymous"}</Text>
          {profile?.ambition_title ? <Text style={styles.amb}>{profile.ambition_title}</Text> : null}
          {profile?.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

          <View style={styles.statsRow}>
            <Stat label="Posts" value={stats.posts} />
            <Stat label="Followers" value={stats.followers} />
            <Stat label="Following" value={stats.following} />
            <Stat label="Badges" value={stats.badges} />
          </View>

          <View style={styles.xpRow}>
            <Text style={styles.xpLabel}>Level {profile?.level ?? 1}</Text>
            <View style={styles.xpBar}>
              <LinearGradient colors={gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.xpFill, { width: `${xpProgress * 100}%` }]} />
            </View>
            <Text style={styles.xpLabel}>{profile?.xp ?? 0} XP</Text>
          </View>

          <Pressable onPress={() => router.push("/edit-profile")} style={styles.editBtn}>
            <Feather name="edit-2" size={14} color="#07111F" />
            <Text style={styles.editText}>Edit profile</Text>
          </Pressable>
        </Card>

        {/* Quick links */}
        <View style={styles.quickRow}>
          {[
            { icon: "target" as const, label: "Goals", to: "/goals" },
            { icon: "award" as const, label: "Badges", to: "/badges" },
            { icon: "trending-up" as const, label: "Leaderboard", to: "/leaderboard" },
            { icon: "star" as const, label: "Premium", to: "/premium" },
          ].map((q) => (
            <Pressable key={q.label} onPress={() => router.push(q.to as any)} style={styles.quick}>
              <Feather name={q.icon} size={18} color={colors.primary} />
              <Text style={styles.quickLabel}>{q.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Mod only */}
        {(profile?.role === "mod" || profile?.role === "admin") && (
          <Card style={{ marginBottom: 16, borderColor: colors.primary + "55" }}>
            <Text style={{ color: colors.primary, fontFamily: font.bold, fontSize: 12, letterSpacing: 1 }}>STAFF</Text>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <ModLink icon="shield" label="Mod dashboard" onPress={() => router.push("/mod/dashboard")} />
              <ModLink icon="users" label="Users" onPress={() => router.push("/mod/users")} />
              <ModLink icon="bar-chart-2" label="Analytics" onPress={() => router.push("/mod/analytics")} />
            </View>
          </Card>
        )}

        <Text style={styles.section}>Your posts</Text>
        {posts.length === 0 ? (
          <Card style={{ alignItems: "center", paddingVertical: 30 }}>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>You haven't posted yet.</Text>
          </Card>
        ) : posts.map((p) => <PostCard key={p.id} post={p} />)}

        <Pressable onPress={signOut} style={styles.signOut}>
          <Feather name="log-out" size={14} color={colors.error} />
          <Text style={{ color: colors.error, fontFamily: font.semibold, fontSize: 13 }}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={{ alignItems: "center", flex: 1 }}>
      <Text style={{ color: colors.text, fontFamily: font.bold, fontSize: 18 }}>{value}</Text>
      <Text style={{ color: colors.textDim, fontSize: 11, marginTop: 2, fontFamily: font.medium }}>{label}</Text>
    </View>
  );
}

function ModLink({ icon, label, onPress }: { icon: any; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.modLink}>
      <Feather name={icon} size={13} color={colors.primary} />
      <Text style={{ color: colors.primary, fontFamily: font.semibold, fontSize: 12 }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  title: { color: colors.text, fontFamily: font.bold, fontSize: 24, flex: 1 },
  iconBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  name: { color: colors.text, fontFamily: font.bold, fontSize: 22, marginTop: 14 },
  amb: { color: colors.primary, fontFamily: font.semibold, fontSize: 13, marginTop: 4 },
  bio: { color: colors.textMuted, fontSize: 13, textAlign: "center", marginTop: 10, lineHeight: 19, paddingHorizontal: 12 },
  statsRow: { flexDirection: "row", marginTop: 18, width: "100%", borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16 },
  xpRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 16, width: "100%" },
  xpLabel: { color: colors.textMuted, fontFamily: font.medium, fontSize: 11 },
  xpBar: { flex: 1, height: 8, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 999, overflow: "hidden" },
  xpFill: { height: "100%" },
  editBtn: { flexDirection: "row", gap: 6, alignItems: "center", backgroundColor: colors.primary, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999, marginTop: 18 },
  editText: { color: "#07111F", fontFamily: font.semibold, fontSize: 13 },
  quickRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  quick: { flex: 1, alignItems: "center", paddingVertical: 14, gap: 6, backgroundColor: colors.card, borderRadius: 18, borderWidth: 1, borderColor: colors.border },
  quickLabel: { color: colors.text, fontSize: 11, fontFamily: font.medium },
  modLink: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: colors.primary + "55" },
  section: { color: colors.text, fontFamily: font.bold, fontSize: 14, marginBottom: 10, marginTop: 4 },
  signOut: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 24, paddingVertical: 14 },
});
