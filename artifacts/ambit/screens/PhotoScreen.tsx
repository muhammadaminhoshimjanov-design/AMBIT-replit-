import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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

const AVATARS = ["A", "B", "C", "D", "E", "F"];
const AVATAR_COLORS = [
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#10B981",
  "#F59E0B",
  "#EF4444",
];

export function PhotoScreen() {
  const { goNext, goBack, updateData, data, currentStep, totalSteps } = useOnboarding();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [selectedAvatar, setSelectedAvatar] = useState(data.avatarStyle ?? "A");
  const contentFade = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(24)).current;
  const frameGlow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(contentSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(frameGlow, { toValue: 1, duration: 2000, useNativeDriver: false }),
        Animated.timing(frameGlow, { toValue: 0, duration: 2000, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const glowOpacity = frameGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  const avatarColor =
    AVATAR_COLORS[AVATARS.indexOf(selectedAvatar)] ?? "#3B82F6";

  function handleNext() {
    updateData({ avatarStyle: selectedAvatar });
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

        <Animated.View
          style={[
            styles.main,
            { opacity: contentFade, transform: [{ translateY: contentSlide }] },
          ]}
        >
          <Text style={styles.title}>Add your profile look</Text>
          <Text style={styles.subtitle}>
            A photo makes your journey more personal.
          </Text>

          <View style={styles.previewCenter}>
            <Animated.View
              style={[styles.frameOuter, { borderColor: avatarColor, opacity: glowOpacity }]}
            >
              <View style={[styles.frameInner, { backgroundColor: avatarColor }]}>
                <Text style={styles.avatarLetter}>
                  {data.nickname?.[0]?.toUpperCase() ?? selectedAvatar}
                </Text>
              </View>
            </Animated.View>
            <Text style={styles.previewName}>{data.nickname || "Your Name"}</Text>
          </View>

          <TouchableOpacity style={styles.uploadBtn} activeOpacity={0.8}>
            <Feather name="camera" size={20} color="#3B82F6" />
            <Text style={styles.uploadLabel}>Upload photo</Text>
          </TouchableOpacity>

          <Text style={styles.orText}>or choose an avatar</Text>

          <View style={styles.avatarGrid}>
            {AVATARS.map((letter, i) => (
              <AvatarOption
                key={letter}
                letter={letter}
                color={AVATAR_COLORS[i]}
                selected={selectedAvatar === letter}
                onPress={() => setSelectedAvatar(letter)}
                nickname={data.nickname}
              />
            ))}
          </View>

          <MascotGuide message="Your profile, your presence." style={styles.mascot} />

          <GradientButton label="Continue" onPress={handleNext} />

          <TouchableOpacity onPress={goNext} style={styles.skipBtn} activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

function AvatarOption({
  letter,
  color,
  selected,
  onPress,
  nickname,
}: {
  letter: string;
  color: string;
  selected: boolean;
  onPress: () => void;
  nickname: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const displayChar = nickname?.[letter.charCodeAt(0) - 65] ?? letter;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: selected ? 1.12 : 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  }, [selected]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[
          styles.avatarOption,
          { backgroundColor: color, borderColor: selected ? "#FFFFFF" : "transparent" },
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={styles.avatarOptionLetter}>{displayChar.toUpperCase()}</Text>
      </TouchableOpacity>
    </Animated.View>
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
  main: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -1,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#8A94B0",
    marginBottom: 28,
  },
  previewCenter: {
    alignItems: "center",
    marginBottom: 28,
  },
  frameOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    padding: 4,
    marginBottom: 14,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
  frameInner: {
    flex: 1,
    borderRadius: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: {
    fontSize: 40,
    fontWeight: "800",
    color: "#fff",
  },
  previewName: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.3)",
    borderRadius: 14,
    padding: 16,
    backgroundColor: "rgba(59,130,246,0.08)",
    marginBottom: 20,
  },
  uploadLabel: {
    color: "#3B82F6",
    fontSize: 15,
    fontWeight: "600",
  },
  orText: {
    color: "#8A94B0",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 16,
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
    marginBottom: 24,
  },
  avatarOption: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  avatarOptionLetter: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
  mascot: {
    marginBottom: 20,
  },
  skipBtn: {
    marginTop: 12,
    alignItems: "center",
    paddingVertical: 12,
  },
  skipText: {
    color: "#555D7A",
    fontSize: 14,
  },
});
