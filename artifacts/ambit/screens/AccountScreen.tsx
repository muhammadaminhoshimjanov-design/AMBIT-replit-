import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { GradientBackground } from "@/components/GradientBackground";
import { GradientButton } from "@/components/GradientButton";
import { MascotGuide } from "@/components/MascotGuide";
import { ProgressBar } from "@/components/ProgressBar";
import { useOnboarding } from "@/context/OnboardingContext";
import { supabase } from "@/lib/supabase";

type Mode = "choose" | "email-signup" | "email-login" | "verifying" | "success";

export function AccountScreen() {
  const { goNext, goBack, updateData, currentStep, totalSteps } = useOnboarding();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [mode, setMode] = useState<Mode>("choose");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (mode === "verifying") {
      Animated.loop(
        Animated.timing(spinAnim, { toValue: 1, duration: 800, useNativeDriver: true })
      ).start();
    }
  }, [mode]);

  async function handleEmailSignUp() {
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and a password.");
      return;
    }
    setError(null);
    setLoading(true);
    setMode("verifying");
    const { error: err } = await supabase.auth.signUp({ email: email.trim(), password });
    setLoading(false);
    if (err) {
      setMode("email-signup");
      setError(err.message);
    } else {
      updateData({ email: email.trim() });
      setMode("success");
      Animated.parallel([
        Animated.spring(checkScale, { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 12 }),
        Animated.timing(checkOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
      setTimeout(() => goNext(), 1400);
    }
  }

  async function handleEmailLogin() {
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    setError(null);
    setLoading(true);
    setMode("verifying");
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (err) {
      setMode("email-login");
      setError(err.message);
    } else {
      updateData({ email: email.trim() });
      setMode("success");
      Animated.parallel([
        Animated.spring(checkScale, { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 12 }),
        Animated.timing(checkOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
      setTimeout(() => goNext(), 1400);
    }
  }

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
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

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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
                  {mode === "email-login"
                    ? "Sign in to your existing account."
                    : "Create your account to begin."}
                </Text>
              </View>

              <View style={styles.card}>
                {(mode === "choose" || mode === "email-signup") && (
                  <View style={styles.idleContent}>
                    {mode === "email-signup" && (
                      <>
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Email</Text>
                          <TextInput
                            style={styles.textInput}
                            placeholder="your@email.com"
                            placeholderTextColor="#334155"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                          />
                        </View>
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Password</Text>
                          <TextInput
                            style={styles.textInput}
                            placeholder="at least 6 characters"
                            placeholderTextColor="#334155"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                          />
                        </View>
                        {error && <Text style={styles.errorText}>{error}</Text>}
                        <GradientButton
                          label="Create Account"
                          onPress={handleEmailSignUp}
                          loading={loading}
                        />
                        <TouchableOpacity
                          style={styles.switchBtn}
                          onPress={() => { setMode("email-login"); setError(null); }}
                        >
                          <Text style={styles.switchText}>Already have an account? Sign in</Text>
                        </TouchableOpacity>
                      </>
                    )}

                    {mode === "choose" && (
                      <>
                        <TouchableOpacity
                          style={styles.emailBtn}
                          onPress={() => setMode("email-signup")}
                          activeOpacity={0.85}
                        >
                          <Feather name="mail" size={16} color="#6366F1" />
                          <Text style={styles.emailBtnText}>Sign up with email</Text>
                        </TouchableOpacity>

                        <View style={styles.orRow}>
                          <View style={styles.orLine} />
                          <Text style={styles.orText}>already a member?</Text>
                          <View style={styles.orLine} />
                        </View>

                        <TouchableOpacity
                          style={styles.loginBtn}
                          onPress={() => setMode("email-login")}
                          activeOpacity={0.85}
                        >
                          <Feather name="log-in" size={16} color="#94A3B8" />
                          <Text style={styles.loginBtnText}>Sign in</Text>
                        </TouchableOpacity>

                        <Text style={styles.note}>
                          Ambit uses email + password auth. No spam, ever.
                        </Text>
                      </>
                    )}
                  </View>
                )}

                {mode === "email-login" && (
                  <View style={styles.idleContent}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Email</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="your@email.com"
                        placeholderTextColor="#334155"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Password</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="your password"
                        placeholderTextColor="#334155"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                      />
                    </View>
                    {error && <Text style={styles.errorText}>{error}</Text>}
                    <GradientButton
                      label="Sign In"
                      onPress={handleEmailLogin}
                      loading={loading}
                    />
                    <TouchableOpacity
                      style={styles.switchBtn}
                      onPress={() => { setMode("email-signup"); setError(null); }}
                    >
                      <Text style={styles.switchText}>No account yet? Sign up</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {mode === "verifying" && (
                  <View style={styles.stateCenter}>
                    <View style={styles.spinnerWrap}>
                      <Animated.View style={[styles.spinRing, { transform: [{ rotate: spin }] }]} />
                      <LinearGradient
                        colors={["rgba(59,130,246,0.15)", "rgba(99,102,241,0.08)"]}
                        style={styles.spinInner}
                      />
                    </View>
                    <Text style={styles.stateTitle}>Signing you in...</Text>
                    <Text style={styles.stateSub}>Connecting your account securely</Text>
                  </View>
                )}

                {mode === "success" && (
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
                    <Text style={styles.stateTitle}>Account ready</Text>
                    <Text style={styles.stateSub}>Taking you forward...</Text>
                  </View>
                )}
              </View>

              <MascotGuide message="Secure start. Smart move." compact />
            </Animated.View>
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
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
  stepLabel: { color: "#334155", fontSize: 13, fontWeight: "600" },
  main: { flex: 1, gap: 24 },
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
    gap: 14,
  },
  inputGroup: {
    backgroundColor: "rgba(20,26,60,0.9)",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.15)",
  },
  inputLabel: {
    color: "#475569",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 7,
  },
  textInput: { color: "#F1F5F9", fontSize: 16, fontWeight: "500" },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    textAlign: "center",
    backgroundColor: "rgba(239,68,68,0.08)",
    borderRadius: 10,
    padding: 10,
  },
  emailBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.3)",
    backgroundColor: "rgba(99,102,241,0.08)",
    paddingVertical: 16,
  },
  emailBtnText: { color: "#818CF8", fontSize: 16, fontWeight: "600" },
  loginBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    backgroundColor: "rgba(255,255,255,0.03)",
    paddingVertical: 15,
  },
  loginBtnText: { color: "#64748B", fontSize: 15, fontWeight: "600" },
  switchBtn: { alignItems: "center", paddingVertical: 8 },
  switchText: { color: "#475569", fontSize: 13 },
  orRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  orLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.05)" },
  orText: { color: "#334155", fontSize: 11, fontWeight: "600" },
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
