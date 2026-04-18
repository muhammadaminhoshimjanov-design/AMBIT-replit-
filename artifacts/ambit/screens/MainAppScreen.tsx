import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Platform,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { GradientBackground } from "@/components/GradientBackground";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

const PALETTES: Record<string, [string, string]> = {
  A: ["#3B82F6", "#6366F1"],
  B: ["#8B5CF6", "#A855F7"],
  C: ["#EC4899", "#F43F5E"],
  D: ["#10B981", "#059669"],
  E: ["#F59E0B", "#EF4444"],
  F: ["#06B6D4", "#3B82F6"],
};

const POST_TYPES = [
  { id: "question", label: "Question", icon: "help-circle", color: "#3B82F6" },
  { id: "debate", label: "Debate", icon: "zap", color: "#F59E0B" },
  { id: "experience", label: "Experience", icon: "star", color: "#10B981" },
  { id: "general", label: "General", icon: "message-circle", color: "#8B5CF6" },
];

interface Post {
  id: string;
  author_id: string;
  content: string;
  post_type: string;
  like_count: number;
  comment_count: number;
  created_at: string;
  circle_id: string | null;
  profiles?: { nickname: string | null; avatar_style: string | null };
  circles?: { name: string } | null;
  liked?: boolean;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  profiles?: { nickname: string | null; avatar_style: string | null };
}

export function MainAppScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const { user, profile, signOut } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [myCircles, setMyCircles] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [activeTab, setActiveTab] = useState<"feed" | "circles" | "profile">("feed");

  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
    Animated.timing(fadeIn, { toValue: 1, duration: 700, useNativeDriver: true }).start();
  }, []);

  async function loadData() {
    await Promise.all([loadPosts(), loadMyCircles()]);
    setLoading(false);
  }

  async function loadPosts() {
    const { data } = await supabase
      .from("posts")
      .select("*, profiles(nickname, avatar_style), circles(name)")
      .order("created_at", { ascending: false })
      .limit(30);
    if (!data) return;

    // Check which ones the current user liked
    const ids = data.map((p: Post) => p.id);
    const { data: likes } = await supabase
      .from("post_likes")
      .select("post_id")
      .eq("user_id", user!.id)
      .in("post_id", ids);
    const likedSet = new Set((likes ?? []).map((l: any) => l.post_id));
    setPosts(data.map((p: Post) => ({ ...p, liked: likedSet.has(p.id) })));
  }

  async function loadMyCircles() {
    const { data } = await supabase
      .from("circle_members")
      .select("circles(id, name)")
      .eq("user_id", user!.id);
    const circles = (data ?? []).map((r: any) => r.circles).filter(Boolean);
    setMyCircles(circles);
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  async function handleLike(post: Post) {
    const wasLiked = post.liked;
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? { ...p, liked: !wasLiked, like_count: p.like_count + (wasLiked ? -1 : 1) }
          : p
      )
    );
    if (wasLiked) {
      await supabase.from("post_likes").delete().eq("post_id", post.id).eq("user_id", user!.id);
      await supabase.from("posts").update({ like_count: post.like_count - 1 }).eq("id", post.id);
    } else {
      await supabase.from("post_likes").upsert({ post_id: post.id, user_id: user!.id }, { onConflict: "post_id,user_id" });
      await supabase.from("posts").update({ like_count: post.like_count + 1 }).eq("id", post.id);
    }
  }

  const palette = PALETTES[profile?.avatar_style ?? "A"] ?? PALETTES["A"];
  const initial = profile?.nickname?.[0]?.toUpperCase() ?? "A";

  return (
    <View style={styles.screen}>
      <GradientBackground />

      <Animated.View style={[styles.container, { paddingTop: topPad, opacity: fadeIn }]}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>Ambit</Text>
            <Text style={styles.headerSub}>
              {activeTab === "feed" ? "Your network" : activeTab === "circles" ? "Your circles" : "Your profile"}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => setShowCreatePost(true)}>
              <Feather name="edit" size={19} color="#818CF8" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatarSmall} onPress={() => setActiveTab("profile")}>
              <LinearGradient colors={palette} style={styles.avatarGrad}>
                <Text style={styles.avatarSmallText}>{initial}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab bar */}
        <View style={styles.tabBar}>
          {[
            { id: "feed", icon: "home", label: "Feed" },
            { id: "circles", icon: "users", label: "Circles" },
            { id: "profile", icon: "user", label: "Profile" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab.id as any)}
              activeOpacity={0.8}
            >
              <Feather
                name={tab.icon as any}
                size={19}
                color={activeTab === tab.id ? "#818CF8" : "#334155"}
              />
              <Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>
                {tab.label}
              </Text>
              {activeTab === tab.id && <View style={styles.tabDot} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingCenter}>
            <ActivityIndicator color="#6366F1" size="large" />
          </View>
        ) : activeTab === "feed" ? (
          <FeedTab
            posts={posts}
            myCircles={myCircles}
            onRefresh={onRefresh}
            refreshing={refreshing}
            onLike={handleLike}
            onOpenPost={() => {}}
            userId={user!.id}
            bottomPad={bottomPad}
            onCreatePost={() => setShowCreatePost(true)}
          />
        ) : activeTab === "circles" ? (
          <CirclesTab
            myCircles={myCircles}
            userId={user!.id}
            onJoin={loadMyCircles}
            bottomPad={bottomPad}
          />
        ) : (
          <ProfileTab
            profile={profile}
            palette={palette}
            initial={initial}
            posts={posts.filter((p) => p.author_id === user!.id)}
            onSignOut={signOut}
            bottomPad={bottomPad}
          />
        )}
      </Animated.View>

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePostModal
          onClose={() => setShowCreatePost(false)}
          onPosted={() => { loadPosts(); setShowCreatePost(false); }}
          userId={user!.id}
          myCircles={myCircles}
        />
      )}
    </View>
  );
}

// ─── Feed Tab ────────────────────────────────────────────────────────────────

function FeedTab({
  posts, myCircles, onRefresh, refreshing, onLike, onOpenPost, userId, bottomPad, onCreatePost
}: any) {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: bottomPad + 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />}
      >
        {/* My circles row */}
        <Text style={styles.sectionLabel}>My circles</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 20 }}
          contentContainerStyle={{ gap: 8, paddingRight: 4 }}
        >
          {myCircles.map((c: any, i: number) => (
            <View key={c.id} style={styles.circleChip}>
              <LinearGradient
                colors={[Object.values(PALETTES)[i % 6][0] + "30", Object.values(PALETTES)[i % 6][0] + "10"]}
                style={StyleSheet.absoluteFill}
              />
              <View style={[styles.circleDot, { backgroundColor: Object.values(PALETTES)[i % 6][0] }]} />
              <Text style={styles.circleChipText}>{c.name}</Text>
            </View>
          ))}
          <TouchableOpacity style={styles.addCircleBtn} onPress={onCreatePost}>
            <Feather name="plus" size={16} color="#475569" />
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.feedHeader}>
          <Text style={styles.sectionLabel}>Feed</Text>
          {posts.length > 0 && (
            <Text style={styles.feedCount}>{posts.length} posts</Text>
          )}
        </View>

        {posts.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="message-circle" size={32} color="#334155" />
            <Text style={styles.emptyTitle}>No posts yet</Text>
            <Text style={styles.emptySub}>Be the first to post in your circles</Text>
          </View>
        ) : (
          posts.map((post: Post, i: number) => (
            <FeedCard
              key={post.id}
              post={post}
              delay={i * 60}
              onLike={() => onLike(post)}
              onComment={() => setSelectedPost(post)}
              isOwnPost={post.author_id === userId}
            />
          ))
        )}
      </ScrollView>

      {selectedPost && (
        <CommentsModal
          post={selectedPost}
          userId={userId}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </>
  );
}

function FeedCard({ post, delay, onLike, onComment, isOwnPost }: any) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;
  const postType = POST_TYPES.find((t) => t.id === post.post_type) ?? POST_TYPES[3];
  const palette = PALETTES[post.profiles?.avatar_style ?? "A"] ?? PALETTES["A"];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 450, delay, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 450, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  const initial = post.profiles?.nickname?.[0]?.toUpperCase() ?? "?";
  const nickname = post.profiles?.nickname ?? "Ambit Member";
  const timeAgo = getTimeAgo(post.created_at);

  return (
    <Animated.View style={[styles.feedCard, { opacity: fade, transform: [{ translateY: slide }] }]}>
      <LinearGradient
        colors={["rgba(16,22,56,0.9)", "rgba(12,17,44,0.95)"]}
        style={styles.feedGrad}
      >
        <View style={styles.feedTop}>
          <LinearGradient colors={palette} style={styles.feedAvatar}>
            <Text style={styles.feedAvatarText}>{initial}</Text>
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={styles.feedAuthor}>{nickname}</Text>
            <View style={styles.feedMeta}>
              {post.circles?.name && (
                <View style={styles.circleTag}>
                  <Text style={styles.circleTagText}>{post.circles.name}</Text>
                </View>
              )}
              <View style={[styles.typeBadge, { backgroundColor: postType.color + "20", borderColor: postType.color + "40" }]}>
                <Feather name={postType.icon as any} size={10} color={postType.color} />
                <Text style={[styles.typeBadgeText, { color: postType.color }]}>{postType.label}</Text>
              </View>
              <Text style={styles.feedTime}>{timeAgo}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.feedContent}>{post.content}</Text>

        <View style={styles.feedActions}>
          <TouchableOpacity style={styles.feedAction} onPress={onLike}>
            <Feather name="heart" size={15} color={post.liked ? "#EF4444" : "#334155"} />
            <Text style={[styles.feedActionNum, post.liked && { color: "#EF4444" }]}>
              {post.like_count}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.feedAction} onPress={onComment}>
            <Feather name="message-circle" size={15} color="#334155" />
            <Text style={styles.feedActionNum}>{post.comment_count}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.feedAction} onPress={onComment}>
            <Feather name="share-2" size={15} color="#334155" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

// ─── Comments Modal ───────────────────────────────────────────────────────────

function CommentsModal({ post, userId, onClose }: { post: Post; userId: string; onClose: () => void }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => { loadComments(); }, []);

  async function loadComments() {
    const { data } = await supabase
      .from("comments")
      .select("*, profiles(nickname, avatar_style)")
      .eq("post_id", post.id)
      .order("created_at", { ascending: true });
    setComments(data ?? []);
  }

  async function postComment() {
    if (!text.trim()) return;
    setPosting(true);
    await supabase.from("comments").insert({ post_id: post.id, author_id: userId, content: text.trim() });
    setText("");
    await loadComments();
    setPosting(false);
  }

  return (
    <Modal visible animationType="slide" transparent>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <LinearGradient colors={["rgba(14,19,50,0.98)", "rgba(10,15,40,0.99)"]} style={styles.modalGrad}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Comments ({comments.length})</Text>
                <TouchableOpacity onPress={onClose}>
                  <Feather name="x" size={20} color="#475569" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 12 }}>
                <View style={styles.postPreview}>
                  <Text style={styles.postPreviewText} numberOfLines={2}>{post.content}</Text>
                </View>
                {comments.map((c) => {
                  const palette = PALETTES[c.profiles?.avatar_style ?? "A"] ?? PALETTES["A"];
                  return (
                    <View key={c.id} style={styles.commentRow}>
                      <LinearGradient colors={palette} style={styles.commentAvatar}>
                        <Text style={styles.commentAvatarText}>
                          {c.profiles?.nickname?.[0]?.toUpperCase() ?? "?"}
                        </Text>
                      </LinearGradient>
                      <View style={styles.commentBubble}>
                        <Text style={styles.commentAuthor}>{c.profiles?.nickname ?? "Member"}</Text>
                        <Text style={styles.commentContent}>{c.content}</Text>
                        <Text style={styles.commentTime}>{getTimeAgo(c.created_at)}</Text>
                      </View>
                    </View>
                  );
                })}
                {comments.length === 0 && (
                  <Text style={styles.noComments}>No comments yet. Start the conversation.</Text>
                )}
              </ScrollView>

              <View style={styles.commentInput}>
                <TextInput
                  style={styles.commentTextInput}
                  placeholder="Add a comment..."
                  placeholderTextColor="#334155"
                  value={text}
                  onChangeText={setText}
                  multiline
                />
                <TouchableOpacity
                  style={[styles.commentSend, !text.trim() && styles.commentSendDisabled]}
                  onPress={postComment}
                  disabled={!text.trim() || posting}
                >
                  {posting ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Feather name="send" size={15} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Create Post Modal ────────────────────────────────────────────────────────

function CreatePostModal({
  onClose, onPosted, userId, myCircles,
}: { onClose: () => void; onPosted: () => void; userId: string; myCircles: any[] }) {
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState("general");
  const [circleId, setCircleId] = useState<string | null>(myCircles[0]?.id ?? null);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePost() {
    if (!content.trim()) return;
    setPosting(true);
    setError(null);
    const { error: err } = await supabase.from("posts").insert({
      author_id: userId,
      content: content.trim(),
      post_type: postType,
      circle_id: circleId,
    });
    setPosting(false);
    if (err) { setError(err.message); return; }
    onPosted();
  }

  const selected = POST_TYPES.find((t) => t.id === postType) ?? POST_TYPES[3];

  return (
    <Modal visible animationType="slide" transparent>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <LinearGradient colors={["rgba(14,19,50,0.98)", "rgba(10,15,40,0.99)"]} style={styles.modalGrad}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>New Post</Text>
                <TouchableOpacity onPress={onClose}>
                  <Feather name="x" size={20} color="#475569" />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
                {/* Post type */}
                <Text style={styles.fieldLabel}>Post type</Text>
                <View style={styles.typeRow}>
                  {POST_TYPES.map((t) => (
                    <TouchableOpacity
                      key={t.id}
                      style={[styles.typeBtn, postType === t.id && { borderColor: t.color }]}
                      onPress={() => setPostType(t.id)}
                      activeOpacity={0.8}
                    >
                      <Feather name={t.icon as any} size={14} color={postType === t.id ? t.color : "#475569"} />
                      <Text style={[styles.typeBtnText, postType === t.id && { color: t.color }]}>{t.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Circle picker */}
                {myCircles.length > 0 && (
                  <>
                    <Text style={styles.fieldLabel}>Post to circle</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                      {myCircles.map((c) => (
                        <TouchableOpacity
                          key={c.id}
                          style={[styles.circlePickerBtn, circleId === c.id && styles.circlePickerBtnActive]}
                          onPress={() => setCircleId(c.id)}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.circlePickerText, circleId === c.id && styles.circlePickerTextActive]}>
                            {c.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </>
                )}

                {/* Content */}
                <Text style={styles.fieldLabel}>What's on your mind?</Text>
                <TextInput
                  style={styles.postTextInput}
                  placeholder={
                    postType === "question" ? "Ask your question..."
                    : postType === "debate" ? "Start a debate..."
                    : postType === "experience" ? "Share your experience..."
                    : "Share with your circle..."
                  }
                  placeholderTextColor="#334155"
                  value={content}
                  onChangeText={setContent}
                  multiline
                  maxLength={500}
                />
                <Text style={styles.charCount}>{content.length}/500</Text>

                {error && <Text style={styles.errorText}>{error}</Text>}

                <TouchableOpacity
                  style={[styles.postBtn, !content.trim() && { opacity: 0.4 }]}
                  onPress={handlePost}
                  disabled={!content.trim() || posting}
                  activeOpacity={0.9}
                >
                  <LinearGradient colors={["#3B82F6", "#6366F1", "#8B5CF6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.postBtnGrad}>
                    {posting ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.postBtnText}>Post to Ambit</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </ScrollView>
            </LinearGradient>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Circles Tab ──────────────────────────────────────────────────────────────

function CirclesTab({ myCircles, userId, onJoin, bottomPad }: any) {
  const [allCircles, setAllCircles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    const { data } = await supabase.from("circles").select("*").order("member_count", { ascending: false });
    setAllCircles(data ?? []);
    setLoading(false);
  }

  async function toggleJoin(circle: any) {
    const joined = myCircles.some((c: any) => c.id === circle.id);
    if (joined) {
      await supabase.from("circle_members").delete().eq("circle_id", circle.id).eq("user_id", userId);
    } else {
      await supabase.from("circle_members").upsert({ circle_id: circle.id, user_id: userId }, { onConflict: "circle_id,user_id" });
    }
    await loadAll();
    await onJoin();
  }

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: bottomPad + 24 }}>
      <Text style={styles.sectionLabel}>All circles</Text>
      {loading ? (
        <ActivityIndicator color="#6366F1" style={{ marginTop: 24 }} />
      ) : (
        allCircles.map((circle, i) => {
          const joined = myCircles.some((c: any) => c.id === circle.id);
          const pal = Object.values(PALETTES)[i % 6] as [string, string];
          return (
            <View key={circle.id} style={styles.circleRow}>
              <LinearGradient colors={["rgba(15,20,50,0.85)", "rgba(12,16,42,0.9)"]} style={styles.circleRowGrad}>
                <LinearGradient colors={pal} style={styles.circleIcon}>
                  <Feather name="users" size={16} color="#fff" />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={styles.circleRowName}>{circle.name}</Text>
                  <Text style={styles.circleRowCount}>{circle.member_count} members</Text>
                </View>
                <TouchableOpacity
                  style={[styles.joinBtn, joined && styles.joinedBtn]}
                  onPress={() => toggleJoin(circle)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.joinBtnText, joined && styles.joinedBtnText]}>
                    {joined ? "Joined" : "Join"}
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileTab({ profile, palette, initial, posts, onSignOut, bottomPad }: any) {
  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: bottomPad + 24 }}>
      <View style={styles.profileHeader}>
        <LinearGradient colors={palette} style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>{initial}</Text>
        </LinearGradient>
        <Text style={styles.profileName}>{profile?.nickname ?? "Ambit Member"}</Text>
        {profile?.bio ? (
          <Text style={styles.profileBio}>{profile.bio}</Text>
        ) : null}
        <View style={styles.profileTags}>
          {(profile?.focus_topics ?? []).map((t: string) => (
            <View key={t} style={styles.profileTag}>
              <Text style={styles.profileTagText}>{t}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={styles.sectionLabel}>My posts ({posts.length})</Text>
      {posts.length === 0 && (
        <Text style={styles.emptySub}>No posts yet</Text>
      )}
      {posts.map((post: Post) => {
        const pt = POST_TYPES.find((t) => t.id === post.post_type) ?? POST_TYPES[3];
        return (
          <View key={post.id} style={styles.profilePost}>
            <LinearGradient colors={["rgba(15,20,50,0.85)", "rgba(12,16,42,0.9)"]} style={styles.profilePostGrad}>
              <View style={[styles.typeBadge, { backgroundColor: pt.color + "20", borderColor: pt.color + "40", alignSelf: "flex-start", marginBottom: 8 }]}>
                <Feather name={pt.icon as any} size={10} color={pt.color} />
                <Text style={[styles.typeBadgeText, { color: pt.color }]}>{pt.label}</Text>
              </View>
              <Text style={styles.profilePostContent}>{post.content}</Text>
              <View style={styles.profilePostMeta}>
                <Feather name="heart" size={12} color="#334155" />
                <Text style={styles.profilePostMetaText}>{post.like_count}</Text>
                <Feather name="message-circle" size={12} color="#334155" />
                <Text style={styles.profilePostMetaText}>{post.comment_count}</Text>
                <Text style={styles.feedTime}>{getTimeAgo(post.created_at)}</Text>
              </View>
            </LinearGradient>
          </View>
        );
      })}

      <TouchableOpacity style={styles.signOutBtn} onPress={onSignOut} activeOpacity={0.8}>
        <Feather name="log-out" size={15} color="#475569" />
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#050813" },
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 4,
  },
  appName: { fontSize: 26, fontWeight: "800", color: "#F8FAFC", letterSpacing: -0.8 },
  headerSub: { color: "#334155", fontSize: 12, marginTop: 2 },
  headerRight: { flexDirection: "row", gap: 10, alignItems: "center" },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(99,102,241,0.1)",
    alignItems: "center", justifyContent: "center",
  },
  avatarSmall: { width: 36, height: 36, borderRadius: 18, overflow: "hidden" },
  avatarGrad: { flex: 1, alignItems: "center", justifyContent: "center" },
  avatarSmallText: { color: "#fff", fontSize: 14, fontWeight: "800" },
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
    marginBottom: 8,
  },
  tabItem: { flex: 1, alignItems: "center", paddingVertical: 10, gap: 3, position: "relative" },
  tabLabel: { color: "#334155", fontSize: 10, fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase" },
  tabLabelActive: { color: "#818CF8" },
  tabDot: {
    position: "absolute", bottom: 0,
    width: 20, height: 2, borderRadius: 1,
    backgroundColor: "#6366F1",
  },
  loadingCenter: { flex: 1, alignItems: "center", justifyContent: "center" },
  sectionLabel: {
    color: "#334155", fontSize: 11, fontWeight: "700",
    letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12,
  },
  feedHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  feedCount: { color: "#334155", fontSize: 12 },
  circleChip: {
    flexDirection: "row", alignItems: "center", gap: 7,
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 22,
    backgroundColor: "rgba(14,19,48,0.8)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
    overflow: "hidden", position: "relative",
  },
  circleDot: { width: 7, height: 7, borderRadius: 4 },
  circleChipText: { color: "#94A3B8", fontSize: 13, fontWeight: "600" },
  addCircleBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(14,19,48,0.8)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
    alignItems: "center", justifyContent: "center", alignSelf: "center",
  },
  emptyState: { alignItems: "center", paddingVertical: 48, gap: 10 },
  emptyTitle: { color: "#475569", fontSize: 16, fontWeight: "600" },
  emptySub: { color: "#334155", fontSize: 14 },
  feedCard: {
    borderRadius: 20, overflow: "hidden", marginBottom: 12,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.04)",
  },
  feedGrad: { padding: 16 },
  feedTop: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 12 },
  feedAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  feedAvatarText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  feedAuthor: { color: "#E2E8F0", fontSize: 14, fontWeight: "700", marginBottom: 5 },
  feedMeta: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  circleTag: {
    borderRadius: 7, borderWidth: 1,
    borderColor: "rgba(99,102,241,0.3)",
    backgroundColor: "rgba(99,102,241,0.1)",
    paddingHorizontal: 7, paddingVertical: 2,
  },
  circleTagText: { color: "#818CF8", fontSize: 10, fontWeight: "600" },
  typeBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    borderRadius: 7, borderWidth: 1,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  typeBadgeText: { fontSize: 10, fontWeight: "700" },
  feedTime: { color: "#334155", fontSize: 11 },
  feedContent: { color: "#94A3B8", fontSize: 14, lineHeight: 22, marginBottom: 14 },
  feedActions: {
    flexDirection: "row", gap: 18,
    paddingTop: 12,
    borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.04)",
  },
  feedAction: { flexDirection: "row", alignItems: "center", gap: 6 },
  feedActionNum: { color: "#334155", fontSize: 13, fontWeight: "600" },
  // Circles tab
  circleRow: {
    borderRadius: 18, overflow: "hidden",
    marginBottom: 10, borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  circleRowGrad: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14 },
  circleIcon: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: "center", justifyContent: "center",
  },
  circleRowName: { color: "#E2E8F0", fontSize: 14, fontWeight: "700" },
  circleRowCount: { color: "#475569", fontSize: 12, marginTop: 2 },
  joinBtn: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 14, borderWidth: 1,
    borderColor: "rgba(99,102,241,0.5)",
    backgroundColor: "rgba(99,102,241,0.1)",
  },
  joinedBtn: { borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.04)" },
  joinBtnText: { color: "#818CF8", fontSize: 13, fontWeight: "700" },
  joinedBtnText: { color: "#475569" },
  // Profile tab
  profileHeader: { alignItems: "center", paddingVertical: 24, gap: 10 },
  profileAvatar: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: "center", justifyContent: "center",
    marginBottom: 6,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 20,
  },
  profileAvatarText: { fontSize: 36, fontWeight: "800", color: "#fff" },
  profileName: { color: "#F1F5F9", fontSize: 22, fontWeight: "800" },
  profileBio: { color: "#64748B", fontSize: 14, textAlign: "center" },
  profileTags: { flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: "center" },
  profileTag: {
    backgroundColor: "rgba(59,130,246,0.1)", borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: "rgba(59,130,246,0.2)",
  },
  profileTagText: { color: "#60A5FA", fontSize: 12, fontWeight: "600" },
  profilePost: {
    borderRadius: 16, overflow: "hidden", marginBottom: 10,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.04)",
  },
  profilePostGrad: { padding: 16 },
  profilePostContent: { color: "#94A3B8", fontSize: 14, lineHeight: 22, marginBottom: 10 },
  profilePostMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  profilePostMetaText: { color: "#334155", fontSize: 12, fontWeight: "600" },
  signOutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 14, marginTop: 24, marginBottom: 32,
    borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)",
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  signOutText: { color: "#475569", fontSize: 14, fontWeight: "500" },
  // Modals
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" },
  modalSheet: { height: "80%", borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: "hidden" },
  modalGrad: { flex: 1 },
  modalHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignSelf: "center", marginTop: 12, marginBottom: 4,
  },
  modalHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)",
  },
  modalTitle: { color: "#F1F5F9", fontSize: 17, fontWeight: "700" },
  postPreview: {
    backgroundColor: "rgba(20,26,60,0.8)", borderRadius: 12,
    padding: 12, borderWidth: 1, borderColor: "rgba(99,102,241,0.15)",
    marginBottom: 4,
  },
  postPreviewText: { color: "#64748B", fontSize: 13, lineHeight: 20 },
  commentRow: { flexDirection: "row", gap: 10 },
  commentAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  commentAvatarText: { color: "#fff", fontSize: 14, fontWeight: "800" },
  commentBubble: {
    flex: 1, backgroundColor: "rgba(20,26,60,0.7)", borderRadius: 14, borderTopLeftRadius: 4,
    padding: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)", gap: 4,
  },
  commentAuthor: { color: "#94A3B8", fontSize: 12, fontWeight: "700" },
  commentContent: { color: "#CBD5E1", fontSize: 14, lineHeight: 20 },
  commentTime: { color: "#334155", fontSize: 11 },
  noComments: { color: "#334155", fontSize: 14, textAlign: "center", paddingVertical: 24 },
  commentInput: {
    flexDirection: "row", gap: 10, padding: 14,
    borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)",
  },
  commentTextInput: {
    flex: 1, color: "#F1F5F9", fontSize: 14,
    backgroundColor: "rgba(20,26,60,0.8)",
    borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: "rgba(99,102,241,0.15)",
    maxHeight: 80,
  },
  commentSend: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: "#6366F1",
    alignItems: "center", justifyContent: "center",
    alignSelf: "flex-end",
  },
  commentSendDisabled: { opacity: 0.4 },
  // Create post modal
  fieldLabel: {
    color: "#475569", fontSize: 11, fontWeight: "700",
    letterSpacing: 1, textTransform: "uppercase", marginBottom: 8,
  },
  typeRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  typeBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(14,19,48,0.8)",
  },
  typeBtnText: { color: "#475569", fontSize: 13, fontWeight: "600" },
  circlePickerBtn: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    backgroundColor: "rgba(14,19,48,0.8)",
  },
  circlePickerBtnActive: { borderColor: "rgba(99,102,241,0.5)", backgroundColor: "rgba(99,102,241,0.1)" },
  circlePickerText: { color: "#475569", fontSize: 13, fontWeight: "500" },
  circlePickerTextActive: { color: "#818CF8", fontWeight: "700" },
  postTextInput: {
    color: "#F1F5F9", fontSize: 15, lineHeight: 24,
    backgroundColor: "rgba(20,26,60,0.8)",
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: "rgba(99,102,241,0.15)",
    minHeight: 120,
  },
  charCount: { color: "#334155", fontSize: 11, textAlign: "right" },
  postBtn: { borderRadius: 18, overflow: "hidden" },
  postBtnGrad: { height: 54, alignItems: "center", justifyContent: "center" },
  postBtnText: { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.2 },
  errorText: {
    color: "#EF4444", fontSize: 13,
    backgroundColor: "rgba(239,68,68,0.08)", borderRadius: 10,
    padding: 10,
  },
});
