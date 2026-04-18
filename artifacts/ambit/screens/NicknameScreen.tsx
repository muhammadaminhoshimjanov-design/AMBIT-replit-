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
  "TopperMind",
  "AmbitionFirst",
  "SATHunter",
];

export function NicknameScreen() {
  const { goNext, goBack, updateData, data, currentStep, totalSteps } = useOnboarding();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [nickname, setNickname] = useState(data.nickname);
  const [intro, setIntro] = useState(data.shortIntro);
  const [focused, setFocused] = useState<"nick" | "intro" | null>(null);

  const contentFade = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(contentSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  function handleNext() {
    if (!nickname.trim()) return;
    updateData({ nickname: nickname.trim(), shortIntro: intro.trim() });
    goNext();
  }

  return (
    <View style={styles.screen}>
      <GradientBackground />

      <View style={[styles.content, { paddingTop: topPad + 16, paddingBottom: bottomPad + 16 }]}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={goBack} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#8A94B0" />
          </TouchableOpacity>
          <ProgressBar current={currentStep} total={totalSteps} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[{ opacity: contentFade, transform: [{ translateY: contentSlide }] }]}
          >
            <Text style={styles.title}>How should people{"\n"}know you?</Text>
            <Text style={styles.subtitle}>
              Choose a name people will remember.
            </Text>

            <View style={[styles.inputWrapper, focused === "nick" && styles.inputFocused]}>
              <Text style={styles.inputLabel}>Nickname</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. FutureFounder"
                placeholderTextColor="#555D7A"
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

            <View style={[styles.inputWrapper, focused === "intro" && styles.inputFocused]}>
              <Text style={styles.inputLabel}>Short intro (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="One line about you..."
                placeholderTextColor="#555D7A"
                value={intro}
                onChangeText={setIntro}
                onFocus={() => setFocused("intro")}
                onBlur={() => setFocused(null)}
                maxLength={60}
              />
            </View>

            {nickname.length > 0 && (
              <View style={styles.previewCard}>
                <Text style={styles.previewLabel}>Preview</Text>
                <View style={styles.previewInner}>
                  <View style={styles.previewAvatar}>
                    <Text style={styles.previewAvatarText}>
                      {nickname[0]?.toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.previewName}>{nickname}</Text>
                    {intro ? (
                      <Text style={styles.previewIntro}>{intro}</Text>
                    ) : (
                      <Text style={styles.previewIntroEmpty}>Ambitious student</Text>
                    )}
                  </View>
                  <View style={styles.previewBadge}>
                    <Text style={styles.previewBadgeText}>NEW</Text>
                  </View>
                </View>
              </View>
            )}

            <Text style={styles.suggestionsTitle}>Suggestions</Text>
            <View style={styles.pills}>
              {SUGGESTIONS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.pill, nickname === s && styles.pillActive]}
                  onPress={() => setNickname(s)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pillText, nickname === s && styles.pillTextActive]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <MascotGuide message="Pick a name people will remember." style={styles.mascot} />

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
  screen: { flex: 1, backgroundColor: "#0A0F1F" },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  topBar: {
    gap: 16,
    marginBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -1,
    marginBottom: 10,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    color: "#8A94B0",
    marginBottom: 28,
  },
  inputWrapper: {
    backgroundColor: "rgba(20,25,41,0.9)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  inputFocused: {
    borderColor: "rgba(59,130,246,0.6)",
    backgroundColor: "rgba(20,25,41,1)",
  },
  inputLabel: {
    color: "#8A94B0",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
  charCount: {
    color: "#555D7A",
    fontSize: 11,
    textAlign: "right",
    marginTop: 4,
  },
  previewCard: {
    backgroundColor: "rgba(59,130,246,0.08)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.2)",
  },
  previewLabel: {
    color: "#3B82F6",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  previewInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  previewAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
  },
  previewAvatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
  previewName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  previewIntro: {
    color: "#8A94B0",
    fontSize: 13,
    marginTop: 2,
  },
  previewIntroEmpty: {
    color: "#555D7A",
    fontSize: 13,
    marginTop: 2,
    fontStyle: "italic",
  },
  previewBadge: {
    marginLeft: "auto",
    backgroundColor: "rgba(139,92,246,0.2)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.4)",
  },
  previewBadgeText: {
    color: "#8B5CF6",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  suggestionsTitle: {
    color: "#8A94B0",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 28,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(30,37,68,0.8)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  pillActive: {
    backgroundColor: "rgba(59,130,246,0.2)",
    borderColor: "rgba(59,130,246,0.5)",
  },
  pillText: {
    color: "#8A94B0",
    fontSize: 13,
    fontWeight: "500",
  },
  pillTextActive: {
    color: "#3B82F6",
    fontWeight: "700",
  },
  mascot: {
    marginBottom: 20,
  },
  btn: {
    marginBottom: 24,
  },
});
