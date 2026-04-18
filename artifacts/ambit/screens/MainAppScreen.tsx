import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { GradientBackground } from "@/components/GradientBackground";

const FEED_ITEMS = [
  {
    id: "1",
    author: "IvyDreamer",
    time: "2m ago",
    content: "Finally got my SAT score back — 1540! The grind was worth it.",
    likes: 48,
    replies: 12,
  },
  {
    id: "2",
    author: "EconMindset",
    time: "15m ago",
    content: "Anyone working on UChicago essays? Let's form a review group.",
    likes: 23,
    replies: 7,
  },
  {
    id: "3",
    author: "ScholarBuilder",
    time: "1h ago",
    content: "Found 3 under-the-radar scholarships for STEM students. Sharing the list in the circle.",
    likes: 91,
    replies: 34,
  },
];

export function MainAppScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 700, useNativeDriver: true }).start();
  }, []);

  return (
    <View style={styles.screen}>
      <GradientBackground />
      <Animated.View style={[styles.content, { paddingTop: topPad, opacity: fadeIn }]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.logoText}>Ambit</Text>
            <Text style={styles.headerSub}>Your network is live</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconBtn}>
              <Feather name="bell" size={22} color="#8A94B0" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Feather name="search" size={22} color="#8A94B0" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomPad + 24 }}>
          <View style={styles.welcomeBanner}>
            <Text style={styles.bannerTitle}>Welcome to Ambit</Text>
            <Text style={styles.bannerSub}>
              You're now part of the network. Your feed is ready.
            </Text>
          </View>

          {FEED_ITEMS.map((item, i) => (
            <FeedCard key={item.id} item={item} delay={i * 120} />
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

function FeedCard({
  item,
  delay,
}: {
  item: (typeof FEED_ITEMS)[0];
  delay: number;
}) {
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 450, delay, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 450, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[styles.feedCard, { opacity: fadeIn, transform: [{ translateY: slide }] }]}
    >
      <View style={styles.feedHeader}>
        <View style={styles.feedAvatar}>
          <Text style={styles.feedAvatarText}>{item.author[0]}</Text>
        </View>
        <View>
          <Text style={styles.feedAuthor}>{item.author}</Text>
          <Text style={styles.feedTime}>{item.time}</Text>
        </View>
      </View>
      <Text style={styles.feedContent}>{item.content}</Text>
      <View style={styles.feedActions}>
        <TouchableOpacity style={styles.feedAction}>
          <Feather name="heart" size={16} color="#8A94B0" />
          <Text style={styles.feedActionText}>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.feedAction}>
          <Feather name="message-circle" size={16} color="#8A94B0" />
          <Text style={styles.feedActionText}>{item.replies}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.feedAction}>
          <Feather name="share-2" size={16} color="#8A94B0" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0A0F1F" },
  content: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    marginBottom: 8,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  headerSub: {
    color: "#8A94B0",
    fontSize: 12,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(30,37,68,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeBanner: {
    backgroundColor: "rgba(59,130,246,0.12)",
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.25)",
  },
  bannerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  bannerSub: {
    color: "#8A94B0",
    fontSize: 14,
    lineHeight: 20,
  },
  feedCard: {
    backgroundColor: "rgba(20,25,41,0.85)",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  feedHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  feedAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
  },
  feedAvatarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  feedAuthor: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  feedTime: {
    color: "#555D7A",
    fontSize: 12,
    marginTop: 1,
  },
  feedContent: {
    color: "#C4CCE0",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 14,
  },
  feedActions: {
    flexDirection: "row",
    gap: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  feedAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  feedActionText: {
    color: "#8A94B0",
    fontSize: 13,
    fontWeight: "500",
  },
});
