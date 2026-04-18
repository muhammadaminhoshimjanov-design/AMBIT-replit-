import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { GradientBackground } from "@/components/GradientBackground";
import { MascotGuide } from "@/components/MascotGuide";
import { ProgressBar } from "@/components/ProgressBar";
import { useOnboarding } from "@/context/OnboardingContext";

const { width } = Dimensions.get("window");

type VerifyState = "idle" | "verifying" | "success";

export function AccountScreen() {
  const { goNext, goBack, updateData, currentStep, totalSteps } = useOnboarding();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [verifyState, setVerifyState] = useState<VerifyState>("idle");
  const contentFade = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(28)).current;
  const checkScale = useRef(new Animated.Value(0)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentFade, { toValue: 1, duration: 550, useNativeDriver: true }),
      Animated.timing(contentSlide, { toValue: 0, duration: 550, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (verifyState === "verifying") {
      Animated.loop(
        Animated.timing(spinAnim, { toValue: 1, duration: 800, useNativeDriver: true })
      ).start();
    }
  }, [verifyState]);

  function handleGmail() {
    setVerifyState("verifying");
    setTimeout(() => {
      setVerifyState("success");
      updateData({ email: "student@gmail.com" });
      Animated.parallel([
        Animated.spring(checkScale, { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 12 }),
        Animated.timing(checkOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
      setTimeout(() => goNext(), 1400);
    }, 2000);
  }

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

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

        <Animated.View
          style={[
            styles.main,
            { opacity: contentFade, transform: [{ translateY: contentSlide }] },
          ]}
        >
          <View style={styles.textBlock}>
            <Text style={styles.eyebrow}>Step {currentStep}</Text>
            <Text style={styles.title}>Let's get you in</Text>
            <Text style={styles.subtitle}>
              Connect your Gmail to begin your Ambit journey.
            </Text>
          </View>

          <View style={styles.card}>
            {verifyState === "idle" && (
              <View style={styles.idleContent}>
                <TouchableOpacity
                  style={styles.gmailBtn}
                  onPress={handleGmail}
                  activeOpacity={0.88}
                >
                  <View style={styles.gmailIconWrap}>
                    <Text style={styles.gmailLetter}>G</Text>
                  </View>
                  <Text style={styles.gmailBtnText}>Continue with Gmail</Text>
                  <Feather name="arrow-right" size={16} color="#1E293B" style={{ marginLeft: "auto" }} />
                </TouchableOpacity>

                <View style={styles.orRow}>
                  <View style={styles.orLine} />
                  <Text style={styles.orText}>or</Text>
                  <View style={styles.orLine} />
                </View>

                <TouchableOpacity
                  style={styles.emailBtn}
                  onPress={handleGmail}
                  activeOpacity={0.85}
                >
                  <Feather name="mail" size={16} color="#6366F1" />
                  <Text style={styles.emailBtnText}>Continue with email</Text>
                </TouchableOpacity>

                <Text style={styles.note}>
                  We use this to secure your account and personalize your experience. No spam, ever.
                </Text>
              </View>
            )}

            {verifyState === "verifying" && (
              <View style={styles.stateCenter}>
                <View style={styles.spinnerWrap}>
                  <Animated.View style={[styles.spinRing, { transform: [{ rotate: spin }] }]} />
                  <LinearGradient
                    colors={["rgba(59,130,246,0.15)", "rgba(99,102,241,0.08)"]}
                    style={styles.spinInner}
                  />
                </View>
                <Text style={styles.stateTitle}>Verifying...</Text>
                <Text style={styles.stateSub}>Connecting your account securely</Text>
              </View>
            )}

            {verifyState === "success" && (
              <View style={styles.stateCenter}>
                <Animated.View
                  style={[
                    styles.successCircle,
                    { transform: [{ scale: checkScale }], opacity: checkOpacity },
                  ]}
                >
                  <LinearGradient
                    colors={["#3B82F6", "#6366F1"]}
                    style={styles.successGradient}
                  >
                    <Feather name="check" size={32} color="#fff" />
                  </LinearGradient>
                </Animated.View>
                <Text style={styles.stateTitle}>Account verified</Text>
                <Text style={styles.stateSub}>Taking you forward...</Text>
              </View>
            )}
          </View>
        </Animated.View>

        <MascotGuide message="Secure start. Smart move." compact />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#050813" },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: "space-between" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 28,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepLabel: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "600",
  },
  main: { flex: 1, justifyContent: "center", gap: 28 },
  textBlock: { gap: 8 },
  eyebrow: {
    color: "#6366F1",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#F8FAFC",
    letterSpacing: -1.2,
    lineHeight: 42,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    lineHeight: 24,
  },
  card: {
    backgroundColor: "rgba(15,20,50,0.85)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.12)",
    overflow: "hidden",
  },
  idleContent: {
    padding: 24,
    gap: 16,
  },
  gmailBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  gmailIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EA4335",
    alignItems: "center",
    justifyContent: "center",
  },
  gmailLetter: { color: "#fff", fontSize: 15, fontWeight: "900" },
  gmailBtnText: { color: "#0F172A", fontSize: 16, fontWeight: "700" },
  orRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  orLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.06)" },
  orText: { color: "#334155", fontSize: 12, fontWeight: "600" },
  emailBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.3)",
    backgroundColor: "rgba(99,102,241,0.08)",
    paddingVertical: 15,
  },
  emailBtnText: { color: "#818CF8", fontSize: 15, fontWeight: "600" },
  note: { color: "#334155", fontSize: 12, textAlign: "center", lineHeight: 18, marginTop: 4 },
  stateCenter: { padding: 40, alignItems: "center", gap: 14 },
  spinnerWrap: { width: 72, height: 72, alignItems: "center", justifyContent: "center" },
  spinRing: {
    position: "absolute",
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2.5,
    borderColor: "transparent",
    borderTopColor: "#6366F1",
    borderRightColor: "rgba(99,102,241,0.4)",
  },
  spinInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  stateTitle: { color: "#F1F5F9", fontSize: 18, fontWeight: "700" },
  stateSub: { color: "#475569", fontSize: 14 },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "hidden",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
  },
  successGradient: { flex: 1, alignItems: "center", justifyContent: "center" },
});
