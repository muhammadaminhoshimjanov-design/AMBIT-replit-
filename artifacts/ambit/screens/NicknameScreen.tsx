import { LinearGradient } from "expo-linear-gradient";
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { GradientBackground } from "@/components/GradientBackground";
import { GradientButton } from "@/components/GradientButton";
import { MascotGuide } from "@/components/MascotGuide";
import { ProgressBar } from "@/components/ProgressBar";
import { useOnboarding } from "@/context/OnboardingContext";

const SUGGESTIONS = [
  "FutureFounder",
  "IvyDreamer",
  "EconMindset",
  "LateNightGrinder",
  "ScholarBuilder",
  "AmbitionFirst",
  "SATHunter",
  "TopperMind",
];

export function NicknameScreen() {
  const { goNext, goBack, updateData, data, currentStep, totalSteps } = useOnboarding();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [nickname, setNickname] = useState(data.nickname);
  const [intro, setIntro] = useState(data.shortIntro);
  const [focused, setFocused] = useState<"nick" | "intro" | null>(null);

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(28)).current;
  const previewScale = useRef(new Animated.Value(0.95)).current;
  const previewOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (nickname.trim().length > 0) {
      Animated.parallel([
        Animated.spring(previewScale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }),
        Animated.timing(previewOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(previewScale, { toValue: 0.95, duration: 200, useNativeDriver: true }),
        Animated.timing(previewOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [nickname]);

  function handleNext() {
    if (!nickname.trim()) return;
    updateData({ nickname: nickname.trim(), shortIntro: intro.trim() });
    goNext();
  }

  const avatarColor = "#6366F1";
  const initial = nickname.trim()[0]?.toUpperCase() ?? "?";

  return (
    <View style={styles.screen}>
      <GradientBackground />

      <View style={[styles.content, { paddingTop: topPad + 16, paddingBottom: bottomPad + 16 }]}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={goBack} style={styles.backBtn}>
            <Feather name="chevron-left" size={24} color="#64748B" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <ProgressBar current={currentStep} total={totalSteps} />
          </View>
          <Text style={styles.stepLabel}>{currentStep}/{totalSteps}</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
            <Text style={styles.eyebrow}>Step {currentStep}</Text>
            <Text style={styles.title}>How should{"\n"}people know you?</Text>
            <Text style={styles.subtitle}>Pick a name that reflects your ambition.</Text>

            {/* Live Preview Card */}
            <Animated.View
              style={[
                styles.previewCard,
                {
                  opacity: previewOpacity,
                  transform: [{ scale: previewScale }],
                },
              ]}
            >
              <LinearGradient
                colors={["rgba(30,37,80,0.9)", "rgba(20,25,55,0.95)"]}
                style={styles.previewGradient}
              >
                <View style={styles.previewTop}>
                  <LinearGradient
                    colors={["#4F46E5", "#7C3AED"]}
                    style={styles.previewAvatar}
                  >
                    <Text style={styles.previewAvatarLetter}>{initial}</Text>
                  </LinearGradient>
                  <View style={styles.previewInfo}>
                    <Text style={styles.previewName}>{nickname || "Your Name"}</Text>
                    <Text style={styles.previewIntro}>
                      {intro || "Ambitious student · Ambit member"}
                    </Text>
                  </View>
                  <View style={styles.previewBadge}>
                    <Text style={styles.previewBadgeText}>NEW</Text>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>

            {/* Nickname Input */}
            <View style={[styles.inputGroup, focused === "nick" && styles.inputGroupFocused]}>
              <Text style={styles.inputLabel}>Nickname</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. FutureFounder"
                placeholderTextColor="#334155"
                value={nickname}
                onChangeText={setNickname}
                onFocus={() => setFocused("nick")}
                onBlur={() => setFocused(null)}
                maxLength={24}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {nickname.length > 0 && (
                <Text style={styles.charCount}>{nickname.length}/24</Text>
              )}
            </View>

            {/* Intro Input */}
            <View style={[styles.inputGroup, focused === "intro" && styles.inputGroupFocused]}>
              <Text style={styles.inputLabel}>Short intro <Text style={styles.optional}>(optional)</Text></Text>
              <TextInput
                style={styles.textInput}
                placeholder="One line about you..."
                placeholderTextColor="#334155"
                value={intro}
                onChangeText={setIntro}
                onFocus={() => setFocused("intro")}
                onBlur={() => setFocused(null)}
                maxLength={60}
              />
            </View>

            {/* Suggestions */}
            <Text style={styles.suggestLabel}>Quick suggestions</Text>
            <View style={styles.pills}>
              {SUGGESTIONS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.pill, nickname === s && styles.pillActive]}
                  onPress={() => setNickname(s)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.pillText, nickname === s && styles.pillTextActive]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <MascotGuide message="Pick a name people will remember." compact style={styles.mascot} />

            <GradientButton
              label="Continue"
              onPress={handleNext}
              disabled={!nickname.trim()}
              style={styles.btn}
            />
          </Animated.View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#050813" },
  content: { flex: 1, paddingHorizontal: 24 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepLabel: { color: "#334155", fontSize: 13, fontWeight: "600" },
  eyebrow: {
    color: "#6366F1",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#F8FAFC",
    letterSpacing: -1.2,
    lineHeight: 40,
    marginBottom: 10,
  },
  subtitle: { fontSize: 15, color: "#64748B", marginBottom: 24 },
  previewCard: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.2)",
  },
  previewGradient: { padding: 18 },
  previewTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  previewAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  previewAvatarLetter: { color: "#fff", fontSize: 20, fontWeight: "800" },
  previewInfo: { flex: 1 },
  previewName: { color: "#F8FAFC", fontSize: 16, fontWeight: "700" },
  previewIntro: { color: "#64748B", fontSize: 12, marginTop: 3 },
  previewBadge: {
    backgroundColor: "rgba(99,102,241,0.2)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.4)",
  },
  previewBadgeText: { color: "#818CF8", fontSize: 10, fontWeight: "800", letterSpacing: 0.4 },
  inputGroup: {
    backgroundColor: "rgba(15,20,50,0.8)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  inputGroupFocused: {
    borderColor: "rgba(99,102,241,0.5)",
    backgroundColor: "rgba(20,25,65,0.9)",
  },
  inputLabel: { color: "#475569", fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 },
  textInput: { color: "#F1F5F9", fontSize: 17, fontWeight: "600" },
  charCount: { color: "#334155", fontSize: 11, textAlign: "right", marginTop: 6 },
  optional: { color: "#334155", fontStyle: "italic", textTransform: "none", letterSpacing: 0 },
  suggestLabel: {
    color: "#334155",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 12,
    marginTop: 4,
  },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(15,20,48,0.8)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  pillActive: {
    backgroundColor: "rgba(99,102,241,0.18)",
    borderColor: "rgba(99,102,241,0.5)",
  },
  pillText: { color: "#475569", fontSize: 13, fontWeight: "500" },
  pillTextActive: { color: "#818CF8", fontWeight: "700" },
  mascot: { marginBottom: 20 },
  btn: { marginBottom: 32 },
});
