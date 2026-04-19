import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState, useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";

const PALETTES: Record<string, [string, string]> = {
  A: ["#3B82F6", "#6366F1"],
  B: ["#8B5CF6", "#A855F7"],
  C: ["#EC4899", "#F43F5E"],
  D: ["#10B981", "#059669"],
  E: ["#F59E0B", "#EF4444"],
  F: ["#06B6D4", "#3B82F6"],
};

interface UserProfile {
  id: string;
  nickname: string | null;
  bio: string | null;
  avatar_style: string | null;
  focus_topics: string[];
  student_identity: string | null;
}

interface Props {
  userId: string;
  viewerId: string;
  onClose: () => void;
}

export function UserProfileModal({ userId, viewerId, onClose }: Props) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const slideAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 14, bounciness: 4 }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  async function loadData() {
    const [{ data: p }, { data: f }, { data: userPosts }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("follows").select("id").eq("follower_id", viewerId).eq("following_id", userId).maybeSingle(),
      supabase.from("posts").select("*, circles(name)").eq("author_id", userId).order("created_at", { ascending: false }).limit(5),
    ]);
    setProfile(p);
    setIsFollowing(!!f);
    setPosts(userPosts ?? []);
    setLoading(false);
  }

  async function toggleFollow() {
    if (userId === viewerId) return;
    setFollowLoading(true);
    if (isFollowing) {
      await supabase.from("follows").delete().eq("follower_id", viewerId).eq("following_id", userId);
    } else {
      await supabase.from("follows").upsert({ follower_id: viewerId, following_id: userId }, { onConflict: "follower_id,following_id" });
    }
    setIsFollowing(!isFollowing);
    setFollowLoading(false);
  }

  const palette = PALETTES[profile?.avatar_style ?? "A"] ?? PALETTES["A"];
  const initial = profile?.nickname?.[0]?.toUpperCase() ?? "?";
  const isSelf = userId === viewerId;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          <LinearGradient colors={["rgba(14,19,55,0.99)", "rgba(10,14,42,1)"]} style={styles.sheetGrad}>
            <View style={styles.handle} />

            {loading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator color="#6366F1" size="large" />
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                  <LinearGradient colors={palette} style={styles.avatar}>
                    <Text style={styles.avatarLetter}>{initial}</Text>
                  </LinearGradient>
                  <View style={styles.nameBlock}>
                    <Text style={styles.nickname}>{profile?.nickname ?? "Ambit Member"}</Text>
                    {profile?.student_identity && (
                      <View style={styles.identityBadge}>
                        <Text style={styles.identityText}>{profile.student_identity}</Text>
                      </View>
                    )}
                  </View>
                </View>

                {profile?.bio ? (
                  <Text style={styles.bio}>{profile.bio}</Text>
                ) : null}

                {/* Focus topics */}
                {profile?.focus_topics && profile.focus_topics.length > 0 && (
                  <View style={styles.tagsRow}>
                    {profile.focus_topics.map((t) => (
                      <View key={t} style={styles.tag}>
                        <Text style={styles.tagText}>{t}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Follow button */}
                {!isSelf && (
                  <TouchableOpacity
                    style={[styles.followBtn, isFollowing && styles.followingBtn]}
                    onPress={toggleFollow}
                    disabled={followLoading}
                    activeOpacity={0.85}
                  >
                    {followLoading ? (
                      <ActivityIndicator color={isFollowing ? "#475569" : "#fff"} size="small" />
                    ) : isFollowing ? (
                      <>
                        <Feather name="user-check" size={15} color="#475569" />
                        <Text style={styles.followingText}>Following</Text>
                      </>
                    ) : (
                      <>
                        <LinearGradient
                          colors={["#3B82F6", "#6366F1"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={StyleSheet.absoluteFill}
                        />
                        <Feather name="user-plus" size={15} color="#fff" />
                        <Text style={styles.followText}>Follow</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}

                <View style={styles.divider} />

                {/* Recent posts */}
                <Text style={styles.postsLabel}>Recent posts</Text>
                {posts.length === 0 ? (
                  <Text style={styles.noPostsText}>No posts yet</Text>
                ) : (
                  posts.map((post) => (
                    <View key={post.id} style={styles.postCard}>
                      <LinearGradient
                        colors={["rgba(20,26,60,0.8)", "rgba(14,19,46,0.9)"]}
                        style={styles.postGrad}
                      >
                        {post.circles?.name && (
                          <View style={styles.postCircle}>
                            <Text style={styles.postCircleText}>{post.circles.name}</Text>
                          </View>
                        )}
                        <Text style={styles.postContent} numberOfLines={3}>{post.content}</Text>
                        <View style={styles.postMeta}>
                          <Feather name="heart" size={11} color="#334155" />
                          <Text style={styles.postMetaNum}>{post.like_count}</Text>
                          <Feather name="message-circle" size={11} color="#334155" />
                          <Text style={styles.postMetaNum}>{post.comment_count}</Text>
                        </View>
                      </LinearGradient>
                    </View>
                  ))
                )}
              </ScrollView>
            )}

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Feather name="x" size={18} color="#475569" />
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  sheet: {
    height: "75%",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: "hidden",
  },
  sheetGrad: { flex: 1 },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignSelf: "center",
    marginTop: 14,
    marginBottom: 6,
  },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  header: { flexDirection: "row", alignItems: "center", gap: 16 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
  },
  avatarLetter: { fontSize: 28, fontWeight: "800", color: "#fff" },
  nameBlock: { flex: 1, gap: 8 },
  nickname: { color: "#F8FAFC", fontSize: 22, fontWeight: "800", letterSpacing: -0.5 },
  identityBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(99,102,241,0.15)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.3)",
  },
  identityText: { color: "#818CF8", fontSize: 12, fontWeight: "600" },
  bio: { color: "#64748B", fontSize: 14, lineHeight: 22 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: {
    backgroundColor: "rgba(59,130,246,0.1)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.2)",
  },
  tagText: { color: "#60A5FA", fontSize: 12, fontWeight: "600" },
  followBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 46,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  followingBtn: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  followText: { color: "#fff", fontSize: 15, fontWeight: "700", zIndex: 1 },
  followingText: { color: "#475569", fontSize: 15, fontWeight: "600" },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.05)" },
  postsLabel: {
    color: "#475569",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  noPostsText: { color: "#334155", fontSize: 14, paddingVertical: 8 },
  postCard: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },
  postGrad: { padding: 14, gap: 8 },
  postCircle: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(99,102,241,0.1)",
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.25)",
  },
  postCircleText: { color: "#818CF8", fontSize: 11, fontWeight: "600" },
  postContent: { color: "#94A3B8", fontSize: 14, lineHeight: 20 },
  postMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  postMetaNum: { color: "#334155", fontSize: 12, fontWeight: "600" },
  closeBtn: {
    position: "absolute",
    top: 18,
    right: 20,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
});
