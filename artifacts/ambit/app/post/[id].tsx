import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { Card } from "@/components/Card";
import { Avatar } from "@/components/Avatar";
import { AppInput } from "@/components/AppInput";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { colors, font, POST_TYPES } from "@/lib/theme";
import { relativeTime } from "../(tabs)";

export default function PostDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [liked, setLiked] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    const [{ data: p }, { data: c }, { data: l }] = await Promise.all([
      supabase.from("posts").select("*, profiles(nickname,avatar_style,avatar_url), circles(name)").eq("id", id).single(),
      supabase.from("comments").select("*, profiles(nickname,avatar_style,avatar_url)").eq("post_id", id).eq("status", "active").order("created_at", { ascending: true }),
      user ? supabase.from("post_likes").select("id").eq("post_id", id).eq("user_id", user.id).maybeSingle() : Promise.resolve({ data: null }),
    ]);
    setPost(p); setComments(c ?? []); setLiked(!!l); setLoading(false);
  }, [id, user]);

  useEffect(() => { load(); }, [load]);

  async function toggleLike() {
    if (!user || !id) return;
    setLiked(!liked);
    setPost((p: any) => p ? { ...p, like_count: liked ? Math.max(0, p.like_count - 1) : p.like_count + 1 } : p);
    await supabase.rpc("toggle_like", { p_post_id: id, p_user_id: user.id });
  }

  async function send() {
    if (!user || !id || !text.trim()) return;
    setPosting(true);
    await supabase.from("comments").insert({ post_id: id, author_id: user.id, content: text.trim() });
    setText("");
    await load();
    setPosting(false);
  }

  if (loading) return <Screen><ActivityIndicator color={colors.primary} style={{ marginTop: 60 }} /></Screen>;
  if (!post) return <Screen><Header back title="Post not found" /></Screen>;

  const type = POST_TYPES.find((t) => t.id === post.post_type) ?? POST_TYPES[3];

  return (
    <Screen noBottomInset>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }} keyboardVerticalOffset={20}>
        <ScrollView contentContainerStyle={{ paddingBottom: 12 }} showsVerticalScrollIndicator={false}>
          <Header back title="Post" right={
            <Pressable onPress={() => router.push(`/report?post=${id}`)} style={styles.iconBtn}><Feather name="flag" size={15} color={colors.text} /></Pressable>
          } />

          <Card style={{ marginBottom: 16 }}>
            <View style={styles.postHeader}>
              <Pressable onPress={() => router.push(`/user/${post.author_id}`)}>
                <Avatar name={post.profiles?.nickname} style={post.profiles?.avatar_style} url={post.profiles?.avatar_url} size={42} />
              </Pressable>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.author}>{post.profiles?.nickname ?? "Anonymous"}</Text>
                <Text style={styles.time}>{relativeTime(post.created_at)}{post.circles?.name ? ` · ${post.circles.name}` : ""}</Text>
              </View>
              <View style={[styles.typeBadge, { backgroundColor: type.color + "22" }]}>
                <Feather name={type.icon as any} size={11} color={type.color} />
                <Text style={[styles.typeText, { color: type.color }]}>{type.label}</Text>
              </View>
            </View>

            <Text style={styles.content}>{post.content}</Text>

            <View style={styles.actions}>
              <Pressable onPress={toggleLike} style={styles.actionBtn}>
                <Feather name="arrow-up" size={16} color={liked ? colors.primary : colors.textMuted} />
                <Text style={[styles.actionText, liked && { color: colors.primary }]}>{post.like_count} Upvotes</Text>
              </Pressable>
              <View style={styles.actionBtn}>
                <Feather name="message-circle" size={16} color={colors.textMuted} />
                <Text style={styles.actionText}>{comments.length} Comments</Text>
              </View>
            </View>
          </Card>

          <Text style={styles.section}>Conversation</Text>
          {comments.length === 0 ? (
            <Card style={{ alignItems: "center", paddingVertical: 24 }}>
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>Be the first to comment.</Text>
            </Card>
          ) : (
            comments.map((c) => (
              <Card key={c.id} style={{ marginBottom: 8, paddingVertical: 14 }}>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <Pressable onPress={() => router.push(`/user/${c.author_id}`)}>
                    <Avatar name={c.profiles?.nickname} style={c.profiles?.avatar_style} url={c.profiles?.avatar_url} size={32} />
                  </Pressable>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Text style={{ color: colors.text, fontFamily: font.semibold, fontSize: 13 }}>{c.profiles?.nickname ?? "Anonymous"}</Text>
                      <Text style={{ color: colors.textDim, fontSize: 11 }}>{relativeTime(c.created_at)}</Text>
                    </View>
                    <Text style={{ color: colors.text, marginTop: 4, fontSize: 14, lineHeight: 20 }}>{c.content}</Text>
                  </View>
                  <Pressable onPress={() => router.push(`/report?comment=${c.id}`)} hitSlop={8}>
                    <Feather name="more-horizontal" size={16} color={colors.textDim} />
                  </Pressable>
                </View>
              </Card>
            ))
          )}
        </ScrollView>

        <View style={styles.composer}>
          <AppInput
            placeholder="Add a comment…"
            value={text}
            onChangeText={setText}
            multiline
            containerStyle={{ flex: 1 }}
          />
          <PrimaryButton title="" icon="send" onPress={send} loading={posting} small style={{ marginLeft: 8, width: 60 }} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  iconBtn: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  postHeader: { flexDirection: "row", alignItems: "center" },
  author: { color: colors.text, fontFamily: font.semibold, fontSize: 14 },
  time: { color: colors.textDim, fontSize: 11, marginTop: 2 },
  typeBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999 },
  typeText: { fontSize: 10.5, fontFamily: font.semibold },
  content: { color: colors.text, fontSize: 15.5, lineHeight: 23, marginTop: 12, fontFamily: font.regular },
  actions: { flexDirection: "row", gap: 18, marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.border },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  actionText: { color: colors.textMuted, fontSize: 12, fontFamily: font.medium },
  section: { color: colors.text, fontFamily: font.bold, fontSize: 14, marginBottom: 10, marginTop: 4 },
  composer: { flexDirection: "row", alignItems: "flex-end", paddingTop: 8, paddingBottom: 12, borderTopWidth: 1, borderTopColor: colors.border, marginTop: 4 },
});
