import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Platform,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { GradientBackground } from "@/components/GradientBackground";

const { width } = Dimensions.get("window");

const CIRCLES = ["SAT 1500+", "Ivy Track", "Productivity"];
const FEED_ITEMS = [
  {
    id: "1",
    author: "IvyDreamer",
    circle: "Ivy / Top Universities",
    time: "2m ago",
    content: "Finally got my SAT score back — 1540. The grind was worth every late night.",
    likes: 48,
    replies: 12,
  },
  {
    id: "2",
    author: "EconMindset",
    circle: "Business & Economics",
    time: "15m ago",
    content: "Anyone working on UChicago essays? Let's form a review circle — serious people only.",
    likes: 23,
    replies: 7,
  },
  {
    id: "3",
    author: "ScholarBuilder",
    circle: "Scholarship Hunters",
    time: "1h ago",
    content: "Found 3 under-the-radar scholarships for STEM students. Sharing the full list in the circle.",
    likes: 91,
    replies: 34,
  },
];

const AVATAR_COLORS = ["#3B82F6", "#8B5CF6", "#EC4899"];

export function MainAppScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(headerSlide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.screen}>
      <GradientBackground />

      <Animated.View style={[styles.container, { paddingTop: topPad, opacity: fadeIn }]}>
        {/* Header */}
        <Animated.View
          style={[styles.header, { transform: [{ translateY: headerSlide }] }]}
        >
          <View>
            <Text style={styles.appName}>Ambit</Text>
            <Text style={styles.headerSub}>Your network is live</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn}>
              <Feather name="bell" size={20} color="#475569" />
              <View style={styles.notifDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Feather name="search" size={20} color="#475569" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: bottomPad + 24 }}
        >
          {/* Welcome banner */}
          <View style={styles.welcomeBanner}>
            <LinearGradient
              colors={["rgba(59,130,246,0.14)", "rgba(99,102,241,0.1)"]}
              style={styles.bannerGrad}
            >
              <View style={styles.bannerTop}>
                <Text style={styles.bannerTitle}>Welcome to Ambit</Text>
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>Live</Text>
                </View>
              </View>
              <Text style={styles.bannerSub}>
                You're now part of the network. Your personalized feed is ready.
              </Text>
            </LinearGradient>
          </View>

          {/* My Circles */}
          <Text style={styles.sectionLabel}>My circles</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 24 }}
            contentContainerStyle={{ gap: 10, paddingRight: 4 }}
          >
            {CIRCLES.map((c, i) => (
              <TouchableOpacity key={c} style={styles.circleChip} activeOpacity={0.85}>
                <LinearGradient
                  colors={[AVATAR_COLORS[i] + "30", AVATAR_COLORS[i] + "10"]}
                  style={StyleSheet.absoluteFill}
                />
                <View style={[styles.circleDot, { backgroundColor: AVATAR_COLORS[i] }]} />
                <Text style={styles.circleChipText}>{c}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.addCircleBtn} activeOpacity={0.8}>
              <Feather name="plus" size={16} color="#475569" />
            </TouchableOpacity>
          </ScrollView>

          {/* Feed label */}
          <Text style={styles.sectionLabel}>Feed</Text>

          {FEED_ITEMS.map((item, i) => (
            <FeedCard key={item.id} item={item} delay={i * 100} color={AVATAR_COLORS[i % AVATAR_COLORS.length]} />
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

function FeedCard({
  item,
  delay,
  color,
}: {
  item: (typeof FEED_ITEMS)[0];
  delay: number;
  color: string;
}) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[styles.feedCard, { opacity: fade, transform: [{ translateY: slide }] }]}
    >
      <LinearGradient
        colors={["rgba(16,22,56,0.9)", "rgba(12,17,44,0.95)"]}
        style={styles.feedGrad}
      >
        <View style={styles.feedTop}>
          <LinearGradient
            colors={[color, color + "AA"]}
            style={styles.feedAvatar}
          >
            <Text style={styles.feedAvatarText}>{item.author[0]}</Text>
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={styles.feedAuthor}>{item.author}</Text>
            <View style={styles.feedMeta}>
              <View style={[styles.circleTag, { borderColor: color + "44" }]}>
                <Text style={[styles.circleTagText, { color: color }]}>{item.circle}</Text>
              </View>
              <Text style={styles.feedTime}>{item.time}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.feedContent}>{item.content}</Text>

        <View style={styles.feedActions}>
          <TouchableOpacity style={styles.feedAction}>
            <Feather name="heart" size={15} color="#334155" />
            <Text style={styles.feedActionNum}>{item.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.feedAction}>
            <Feather name="message-circle" size={15} color="#334155" />
            <Text style={styles.feedActionNum}>{item.replies}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.feedAction}>
            <Feather name="bookmark" size={15} color="#334155" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#050813" },
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginBottom: 4,
  },
  appName: {
    fontSize: 26,
    fontWeight: "800",
    color: "#F8FAFC",
    letterSpacing: -0.8,
  },
  headerSub: { color: "#334155", fontSize: 12, marginTop: 2 },
  headerRight: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notifDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#6366F1",
    borderWidth: 1.5,
    borderColor: "#050813",
  },
  welcomeBanner: {
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.18)",
  },
  bannerGrad: { padding: 20 },
  bannerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  bannerTitle: { color: "#F1F5F9", fontSize: 18, fontWeight: "700" },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(34,211,238,0.1)",
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(34,211,238,0.25)",
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#22D3EE" },
  liveText: { color: "#22D3EE", fontSize: 11, fontWeight: "700" },
  bannerSub: { color: "#64748B", fontSize: 14, lineHeight: 22 },
  sectionLabel: {
    color: "#334155",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  circleChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 22,
    backgroundColor: "rgba(14,19,48,0.8)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
    position: "relative",
  },
  circleDot: { width: 7, height: 7, borderRadius: 4 },
  circleChipText: { color: "#94A3B8", fontSize: 13, fontWeight: "600" },
  addCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(14,19,48,0.8)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  feedCard: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },
  feedGrad: { padding: 18 },
  feedTop: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 14 },
  feedAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  feedAvatarText: { color: "#fff", fontSize: 17, fontWeight: "800" },
  feedAuthor: { color: "#E2E8F0", fontSize: 14, fontWeight: "700", marginBottom: 5 },
  feedMeta: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  circleTag: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  circleTagText: { fontSize: 11, fontWeight: "600" },
  feedTime: { color: "#334155", fontSize: 11 },
  feedContent: { color: "#94A3B8", fontSize: 14, lineHeight: 22, marginBottom: 16 },
  feedActions: {
    flexDirection: "row",
    gap: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.04)",
  },
  feedAction: { flexDirection: "row", alignItems: "center", gap: 6 },
  feedActionNum: { color: "#334155", fontSize: 13, fontWeight: "600" },
});
