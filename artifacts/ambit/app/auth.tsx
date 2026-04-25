import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { AppInput } from "@/components/AppInput";
import { PrimaryButton } from "@/components/PrimaryButton";
import { supabase } from "@/lib/supabase";
import { colors, font } from "@/lib/theme";

function friendlyError(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes("rate") || m.includes("too many")) return "Too many attempts. Please wait a minute and try again.";
  if (m.includes("invalid login") || m.includes("invalid credentials")) return "Wrong email or password.";
  if (m.includes("email not confirmed")) return "Please confirm your email, or disable email confirmation in Supabase → Auth → Providers.";
  if (m.includes("user already registered") || m.includes("already been registered")) return "That email is already registered. Try logging in instead.";
  if (m.includes("password") && m.includes("6")) return "Password must be at least 6 characters.";
  if (m.includes("invalid email") || m.includes("email")) return raw;
  if (m.includes("network")) return "Network error. Check your connection.";
  return raw || "Something went wrong. Please try again.";
}

export default function Auth() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = useState<"login" | "signup">(params.mode === "signup" ? "signup" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function submit() {
    setErr(null);
    setInfo(null);
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setErr("Email and password are required");
      return;
    }
    if (password.length < 6) {
      setErr("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email: cleanEmail, password });
        if (error) throw error;
        // If email confirmation is on, signUp returns no session.
        if (!data.session) {
          // Try to sign in immediately (works when confirmation is off)
          const { data: s, error: signInErr } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });
          if (signInErr || !s.session) {
            setInfo("Account created. Check your email to confirm, then log in.");
            setMode("login");
            return;
          }
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) throw error;
      }
      router.replace("/");
    } catch (e: any) {
      setErr(friendlyError(e?.message ?? ""));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Header back title={mode === "signup" ? "Join Ambit" : "Welcome back"} subtitle={mode === "signup" ? "Create your account" : "Sign in to continue"} />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <View style={styles.tabs}>
            <Pressable onPress={() => { setMode("signup"); setErr(null); setInfo(null); }} style={[styles.tab, mode === "signup" && styles.tabActive]}>
              <Text style={[styles.tabText, mode === "signup" && styles.tabTextActive]}>Sign up</Text>
            </Pressable>
            <Pressable onPress={() => { setMode("login"); setErr(null); setInfo(null); }} style={[styles.tab, mode === "login" && styles.tabActive]}>
              <Text style={[styles.tabText, mode === "login" && styles.tabTextActive]}>Log in</Text>
            </Pressable>
          </View>

          {info ? (
            <View style={styles.info}>
              <Text style={styles.infoText}>{info}</Text>
            </View>
          ) : null}

          <View style={{ gap: 14 }}>
            <AppInput
              label="Email"
              icon="mail"
              placeholder="you@school.edu"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              value={email}
              onChangeText={(t) => { setEmail(t); if (err) setErr(null); }}
            />
            <AppInput
              label="Password"
              icon="lock"
              placeholder="At least 6 characters"
              secureTextEntry
              value={password}
              onChangeText={(t) => { setPassword(t); if (err) setErr(null); }}
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
            onPress={() => { setMode(mode === "signup" ? "login" : "signup"); setErr(null); setInfo(null); }}
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
  info: { backgroundColor: "rgba(245,185,66,0.12)", borderColor: "rgba(245,185,66,0.4)", borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 16 },
  infoText: { color: colors.primary, fontFamily: font.medium, fontSize: 13, lineHeight: 19 },
});
