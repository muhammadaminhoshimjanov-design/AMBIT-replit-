import React, { useRef, useState, useEffect } from "react";
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

type VerifyState = "idle" | "verifying" | "success";

export function AccountScreen() {
  const { goNext, goBack, updateData, currentStep, totalSteps } = useOnboarding();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [verifyState, setVerifyState] = useState<VerifyState>("idle");
  const contentFade = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(24)).current;
  const checkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(contentSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  function handleGmail() {
    setVerifyState("verifying");
    setTimeout(() => {
      setVerifyState("success");
      updateData({ email: "student@gmail.com" });
      Animated.spring(checkScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 14,
        bounciness: 10,
      }).start();
      setTimeout(() => goNext(), 1200);
    }, 1800);
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
          <Text style={styles.title}>Let's get you in</Text>
          <Text style={styles.subtitle}>
            Use your Gmail to begin your Ambit journey.
          </Text>

          <View style={styles.authCard}>
            {verifyState === "idle" && (
              <>
                <TouchableOpacity
                  style={styles.gmailBtn}
                  onPress={handleGmail}
                  activeOpacity={0.85}
                >
                  <View style={styles.gmailIcon}>
                    <Text style={styles.gmailG}>G</Text>
                  </View>
                  <Text style={styles.gmailLabel}>Continue with Gmail</Text>
                </TouchableOpacity>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity style={styles.emailBtn} onPress={handleGmail} activeOpacity={0.8}>
                  <Text style={styles.emailLabel}>Continue with email</Text>
                </TouchableOpacity>
              </>
            )}

            {verifyState === "verifying" && (
              <View style={styles.verifyState}>
                <Animated.View style={styles.spinner}>
                  <VerifySpinner />
                </Animated.View>
                <Text style={styles.verifyText}>Verifying your account...</Text>
              </View>
            )}

            {verifyState === "success" && (
              <View style={styles.verifyState}>
                <Animated.View
                  style={[styles.checkCircle, { transform: [{ scale: checkScale }] }]}
                >
                  <Feather name="check" size={28} color="#fff" />
                </Animated.View>
                <Text style={styles.successText}>Account verified</Text>
              </View>
            )}

            <Text style={styles.note}>
              We'll use this to secure your account and personalize your experience.
            </Text>
          </View>
        </Animated.View>

        <MascotGuide message="Secure start. Smart move." style={styles.mascot} />
      </View>
    </View>
  );
}

function VerifySpinner() {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      style={[styles.spinnerRing, { transform: [{ rotate }] }]}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0A0F1F" },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
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
    justifyContent: "center",
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -1,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#8A94B0",
    marginBottom: 36,
    lineHeight: 24,
  },
  authCard: {
    backgroundColor: "rgba(20,25,41,0.8)",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    gap: 16,
  },
  gmailBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
  },
  gmailIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EA4335",
    alignItems: "center",
    justifyContent: "center",
  },
  gmailG: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  gmailLabel: {
    color: "#0A0F1F",
    fontSize: 16,
    fontWeight: "700",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  dividerText: {
    color: "#8A94B0",
    fontSize: 13,
  },
  emailBtn: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.3)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(59,130,246,0.08)",
  },
  emailLabel: {
    color: "#3B82F6",
    fontSize: 15,
    fontWeight: "600",
  },
  note: {
    fontSize: 12,
    color: "#8A94B0",
    textAlign: "center",
    lineHeight: 18,
    marginTop: 4,
  },
  verifyState: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 16,
  },
  spinner: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  spinnerRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: "transparent",
    borderTopColor: "#3B82F6",
    borderRightColor: "rgba(59,130,246,0.3)",
  },
  verifyText: {
    color: "#8A94B0",
    fontSize: 15,
    fontWeight: "500",
  },
  checkCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
  successText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  mascot: {
    marginBottom: 12,
  },
});
