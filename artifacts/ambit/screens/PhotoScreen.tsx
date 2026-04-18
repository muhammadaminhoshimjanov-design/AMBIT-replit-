import { LinearGradient } from "expo-linear-gradient";
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { GradientBackground } from "@/components/GradientBackground";
import { GradientButton } from "@/components/GradientButton";
import { MascotGuide } from "@/components/MascotGuide";
import { ProgressBar } from "@/components/ProgressBar";
import { useOnboarding } from "@/context/OnboardingContext";

const PALETTES = [
  { id: "A", colors: ["#3B82F6", "#6366F1"] as const },
  { id: "B", colors: ["#8B5CF6", "#A855F7"] as const },
  { id: "C", colors: ["#EC4899", "#F43F5E"] as const },
  { id: "D", colors: ["#10B981", "#059669"] as const },
  { id: "E", colors: ["#F59E0B", "#EF4444"] as const },
  { id: "F", colors: ["#06B6D4", "#3B82F6"] as const },
];

export function PhotoScreen() {
  const { goNext, goBack, updateData, data, currentStep, totalSteps } = useOnboarding();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [selected, setSelected] = useState(data.avatarStyle ?? "A");
  const fade = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(28)).current;
  const frameGlow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(frameGlow, { toValue: 1, duration: 2500, useNativeDriver: true }),
        Animated.timing(frameGlow, { toValue: 0, duration: 2500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const palette = PALETTES.find((p) => p.id === selected) ?? PALETTES[0];

  function handleNext() {
    updateData({ avatarStyle: selected });
    goNext();
  }

  return (
    <View style={styles.screen}>
      <GradientBackground />

      <View style={[styles.content, { paddingTop: topPad + 16, paddingBottom: bottomPad + 20 }]}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={goBack} style={styles.backBtn}>
            <Feather name="chevron-left" size={24} color="#64748B" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <ProgressBar current={currentStep} total={totalSteps} />
          </View>
          <Text style={styles.stepLabel}>{currentStep}/{totalSteps}</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: fade, transform: [{ translateY: slideAnim }] }}>
            <Text style={styles.eyebrow}>Step {currentStep}</Text>
            <Text style={styles.title}>Add your{"\n"}profile look</Text>
            <Text style={styles.subtitle}>This is how the community sees you.</Text>

            {/* Main preview */}
            <View style={styles.previewCenter}>
              <Animated.View
                style={[styles.haloRing, { opacity: frameGlow.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.9] }) }]}
              >
                <LinearGradient
                  colors={palette.colors}
                  style={styles.haloGradient}
                />
              </Animated.View>
              <View style={styles.frameOuter}>
                <LinearGradient
                  colors={palette.colors}
                  style={styles.frameInner}
                >
                  <Text style={styles.avatarLetter}>
                    {data.nickname?.[0]?.toUpperCase() ?? selected}
                  </Text>
                </LinearGradient>
              </View>
              <Text style={styles.previewName}>{data.nickname || "Your Name"}</Text>
              <Text style={styles.previewSub}>Ambit member</Text>
            </View>

            {/* Upload option */}
            <TouchableOpacity style={styles.uploadRow} activeOpacity={0.85}>
              <View style={styles.uploadIcon}>
                <Feather name="camera" size={18} color="#6366F1" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.uploadTitle}>Upload a photo</Text>
                <Text style={styles.uploadSub}>Show your real face to the community</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#334155" />
            </TouchableOpacity>

            <Text style={styles.orText}>or choose an avatar color</Text>

            {/* Avatar palette grid */}
            <View style={styles.paletteGrid}>
              {PALETTES.map((p) => (
                <AvatarChip
                  key={p.id}
                  palette={p}
                  selected={selected === p.id}
                  onPress={() => setSelected(p.id)}
                  initial={data.nickname?.[0]?.toUpperCase() ?? p.id}
                />
              ))}
            </View>

            <MascotGuide message="Your profile, your presence." compact style={styles.mascot} />

            <GradientButton label="Continue" onPress={handleNext} style={styles.btn} />
            <TouchableOpacity style={styles.skipBtn} onPress={goNext} activeOpacity={0.7}>
              <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </View>
    </View>
  );
}

function AvatarChip({
  palette,
  selected,
  onPress,
  initial,
}: {
  palette: { id: string; colors: readonly [string, string] };
  selected: boolean;
  onPress: () => void;
  initial: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const ring = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scale, { toValue: selected ? 1.15 : 1, useNativeDriver: true, speed: 22, bounciness: 8 }).start();
    Animated.timing(ring, { toValue: selected ? 1 : 0, duration: 200, useNativeDriver: false }).start();
  }, [selected]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.chipWrapper}>
        <LinearGradient
          colors={palette.colors}
          style={[styles.chip, selected && styles.chipSelected]}
        >
          <Text style={styles.chipLetter}>{initial}</Text>
        </LinearGradient>
        {selected && <View style={styles.chipRing} />}
      </TouchableOpacity>
    </Animated.View>
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
  subtitle: { fontSize: 15, color: "#64748B", marginBottom: 28 },
  previewCenter: { alignItems: "center", marginBottom: 28, position: "relative" },
  haloRing: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: "hidden",
    top: -5,
  },
  haloGradient: { flex: 1, opacity: 0.18 },
  frameOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    overflow: "hidden",
    marginBottom: 14,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
  },
  frameInner: { flex: 1, alignItems: "center", justifyContent: "center" },
  avatarLetter: { fontSize: 44, fontWeight: "800", color: "#fff" },
  previewName: { color: "#F8FAFC", fontSize: 18, fontWeight: "700", marginBottom: 4 },
  previewSub: { color: "#475569", fontSize: 13 },
  uploadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "rgba(15,20,50,0.8)",
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.15)",
  },
  uploadIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(99,102,241,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadTitle: { color: "#E2E8F0", fontSize: 15, fontWeight: "600" },
  uploadSub: { color: "#475569", fontSize: 12, marginTop: 2 },
  orText: { color: "#334155", fontSize: 13, textAlign: "center", marginBottom: 16 },
  paletteGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    justifyContent: "center",
    marginBottom: 28,
  },
  chipWrapper: { position: "relative" },
  chip: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  chipSelected: {},
  chipRing: {
    position: "absolute",
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  chipLetter: { color: "#fff", fontSize: 22, fontWeight: "800" },
  mascot: { marginBottom: 20 },
  btn: { marginBottom: 12 },
  skipBtn: { alignItems: "center", paddingVertical: 14, marginBottom: 24 },
  skipText: { color: "#334155", fontSize: 14, fontWeight: "500" },
});
