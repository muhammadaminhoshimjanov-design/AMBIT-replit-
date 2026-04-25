import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { Card } from "@/components/Card";
import { Avatar } from "@/components/Avatar";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { colors, font } from "@/lib/theme";
import { PostCard } from "../(tabs)";

export default function UserPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [following, setFollowing] = useState(false);
  const [stats, setStats] = useState({ followers: 0, following: 0 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    const [{ data: p }, { data: po }, { data: fol }, { count: fc }, { count: fgc }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", id).single(),
      supabase.from("posts").select("*, profiles(nickname,avatar_style,avatar_url), circles(name)").eq("author_id", id).eq("status", "active").order("created_at", { ascending: false }),
      user ? supabase.from("follows").select("id").eq("follower_id", user.id).eq("following_id", id).maybeSingle() : Promise.resolve({ data: null }),
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", id),
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", id),
    ]);
    setProfile(p); setPosts(po ?? []); setFollowing(!!fol); setStats({ followers: fc ?? 0, following: fgc ?? 0 }); setLoading(false);
  }, [id, user]);

  useEffect(() => { load(); }, [load]);

  async function toggleFollow() {
    if (!user || !id || user.id === id) return;
    if (following) {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", id);
      setFollowing(false); setStats((s) => ({ ...s, followers: Math.max(0, s.followers - 1) }));
    } else {
      await supabase.from("follows").upsert({ follower_id: user.id, following_id: id }, { onConflict: "follower_id,following_id" });
      setFollowing(true); setStats((s) => ({ ...s, followers: s.followers + 1 }));
    }
  }

  if (loading) return <Screen><ActivityIndicator color={colors.primary} style={{ marginTop: 60 }} /></Screen>;
  if (!profile) return <Screen><Header back title="User not found" /></Screen>;
  const isMe = user?.id === id;

  return (
    <Screen scroll>
      <Header back title={profile.nickname ?? "Profile"} right={
        !isMe ? (
          <Pressable onPress={() => router.push(`/report?user=${id}`)} style={styles.iconBtn}><Feather name="flag" size={15} color={colors.text} /></Pressable>
        ) : null
      } />

      <Card glow style={{ alignItems: "center", marginBottom: 14, paddingVertical: 22 }}>
        <Avatar name={profile.nickname} style={profile.avatar_style} url={profile.avatar_url} size={84} border />
        <Text style={styles.name}>{profile.nickname ?? "Anonymous"}</Text>
        {profile.ambition_title ? <Text style={styles.amb}>{profile.ambition_title}</Text> : null}
        {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

        <View style={styles.statsRow}>
          <View style={styles.stat}><Text style={styles.statValue}>{stats.followers}</Text><Text style={styles.statLabel}>Followers</Text></View>
          <View style={styles.stat}><Text style={styles.statValue}>{stats.following}</Text><Text style={styles.statLabel}>Following</Text></View>
          <View style={styles.stat}><Text style={styles.statValue}>{profile.level ?? 1}</Text><Text style={styles.statLabel}>Level</Text></View>
          <View style={styles.stat}><Text style={styles.statValue}>{profile.xp ?? 0}</Text><Text style={styles.statLabel}>XP</Text></View>
        </View>

        {!isMe && (
          <PrimaryButton
            title={following ? "Following" : "Follow"}
            variant={following ? "secondary" : "primary"}
            icon={following ? "check" : "user-plus"}
            onPress={toggleFollow}
            small
            style={{ marginTop: 16, minWidth: 160 }}
          />
        )}
      </Card>

      <Text style={styles.section}>Posts</Text>
      {posts.length === 0 ? (
        <Card style={{ alignItems: "center", paddingVertical: 24 }}>
          <Text style={{ color: colors.textMuted }}>No posts yet.</Text>
        </Card>
      ) : posts.map((p) => <PostCard key={p.id} post={p} />)}
    </Screen>
  );
}

const styles = StyleSheet.create({
  iconBtn: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  name: { color: colors.text, fontFamily: font.bold, fontSize: 22, marginTop: 14 },
  amb: { color: colors.primary, fontFamily: font.semibold, fontSize: 13, marginTop: 4 },
  bio: { color: colors.textMuted, fontSize: 13, textAlign: "center", marginTop: 10, lineHeight: 19, paddingHorizontal: 12 },
  statsRow: { flexDirection: "row", marginTop: 18, width: "100%", borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16 },
  stat: { flex: 1, alignItems: "center" },
  statValue: { color: colors.text, fontFamily: font.bold, fontSize: 18 },
  statLabel: { color: colors.textDim, fontSize: 11, marginTop: 2, fontFamily: font.medium },
  section: { color: colors.text, fontFamily: font.bold, fontSize: 14, marginBottom: 10, marginTop: 4 },
});
