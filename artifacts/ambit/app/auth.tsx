import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { AppInput } from "@/components/AppInput";
import { PrimaryButton } from "@/components/PrimaryButton";
import { supabase } from "@/lib/supabase";
import { colors, font } from "@/lib/theme";

export default function Auth() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = useState<"login" | "signup">(params.mode === "signup" ? "signup" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setErr(null);
    if (!email.trim() || !password) {
      setErr("Email and password are required");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email: email.trim(), password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }
      router.replace("/");
    } catch (e: any) {
      setErr(e.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Header back title={mode === "signup" ? "Join Ambit" : "Welcome back"} subtitle={mode === "signup" ? "Create your account" : "Sign in to continue"} />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.tabs}>
            <Pressable onPress={() => setMode("signup")} style={[styles.tab, mode === "signup" && styles.tabActive]}>
              <Text style={[styles.tabText, mode === "signup" && styles.tabTextActive]}>Sign up</Text>
            </Pressable>
            <Pressable onPress={() => setMode("login")} style={[styles.tab, mode === "login" && styles.tabActive]}>
              <Text style={[styles.tabText, mode === "login" && styles.tabTextActive]}>Log in</Text>
            </Pressable>
          </View>

          <View style={{ gap: 14 }}>
            <AppInput
              label="Email"
              icon="mail"
              placeholder="you@school.edu"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <AppInput
              label="Password"
              icon="lock"
              placeholder="At least 8 characters"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              error={err}
            />
          </View>

          <PrimaryButton
            title={mode === "signup" ? "Create account" : "Sign in"}
            icon="arrow-right"
            onPress={submit}
            loading={loading}
            style={{ marginTop: 22 }}
          />

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.line} />
          </View>

          <PrimaryButton
            title={mode === "signup" ? "I already have an account" : "Create a new account"}
            variant="secondary"
            onPress={() => setMode(mode === "signup" ? "login" : "signup")}
          />

          <Text style={styles.legal}>
            By continuing you agree to Ambit's <Text style={styles.legalAccent}>Terms</Text> and{" "}
            <Text style={styles.legalAccent}>Privacy Policy</Text>.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 4, marginBottom: 22, borderWidth: 1, borderColor: colors.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 12 },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textMuted, fontFamily: font.semibold, fontSize: 14 },
  tabTextActive: { color: "#07111F" },
  divider: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.textDim, fontSize: 12, fontFamily: font.medium },
  legal: { color: colors.textDim, fontSize: 12, fontFamily: font.regular, textAlign: "center", marginTop: 24, lineHeight: 18 },
  legalAccent: { color: colors.primary, fontFamily: font.semibold },
});
