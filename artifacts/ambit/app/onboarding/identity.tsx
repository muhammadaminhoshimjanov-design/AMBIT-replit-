import { useRouter } from "expo-router";
import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { AppInput } from "@/components/AppInput";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Card } from "@/components/Card";
import { Avatar } from "@/components/Avatar";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { colors, font, STUDENT_IDENTITIES } from "@/lib/theme";

const STYLES = ["A", "B", "C", "D", "E", "F"];

export default function Identity() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const [nickname, setNickname] = useState(profile?.nickname ?? "");
  const [ambition, setAmbition] = useState(profile?.ambition_title ?? "");
  const [identity, setIdentity] = useState(profile?.student_identity ?? "");
  const [avatar, setAvatar] = useState(profile?.avatar_style ?? "A");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function next() {
    setErr(null);
    if (!nickname.trim()) return setErr("Pick a nickname to continue");
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        nickname: nickname.trim(),
        ambition_title: ambition.trim() || null,
        student_identity: identity || null,
        avatar_style: avatar,
      })
      .eq("id", user.id);
    setLoading(false);
    if (error) return setErr(error.message);
    await refreshProfile();
    router.push("/onboarding/goals");
  }

  return (
    <Screen scroll contentContainerStyle={{ paddingBottom: 40 }}>
      <Header back title="Set up your identity" subtitle="Step 1 of 3" />

      <View style={styles.progress}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      <Card style={{ alignItems: "center", marginBottom: 18 }}>
        <Avatar name={nickname || "?"} style={avatar} size={88} border />
        <Text style={styles.label}>Pick your avatar color</Text>
        <View style={styles.avatarRow}>
          {STYLES.map((s) => (
            <Pressable key={s} onPress={() => setAvatar(s)} style={[styles.avatarOpt, avatar === s && styles.avatarOptActive]}>
              <Avatar name={nickname || s} style={s} size={36} />
            </Pressable>
          ))}
        </View>
      </Card>

      <View style={{ gap: 14 }}>
        <AppInput
          label="Nickname"
          icon="user"
          placeholder="What should we call you?"
          value={nickname}
          onChangeText={setNickname}
          error={err}
        />
        <AppInput
          label="Your ambition"
          icon="target"
          placeholder="Founder, doctor, researcher..."
          value={ambition}
          onChangeText={setAmbition}
        />

        <Text style={styles.sectionLabel}>I am a...</Text>
        <View style={styles.chipRow}>
          {STUDENT_IDENTITIES.map((opt) => (
            <Pressable
              key={opt}
              onPress={() => setIdentity(opt)}
              style={[styles.chip, identity === opt && styles.chipActive]}
            >
              <Text style={[styles.chipText, identity === opt && styles.chipTextActive]}>{opt}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <PrimaryButton title="Continue" icon="arrow-right" loading={loading} onPress={next} style={{ marginTop: 24 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  progress: { flexDirection: "row", gap: 8, marginBottom: 18 },
  dot: { flex: 1, height: 4, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primary },
  label: { color: colors.textMuted, fontSize: 13, fontFamily: font.medium, marginTop: 14 },
  avatarRow: { flexDirection: "row", gap: 10, marginTop: 10, flexWrap: "wrap", justifyContent: "center" },
  avatarOpt: { padding: 4, borderRadius: 999, borderWidth: 2, borderColor: "transparent" },
  avatarOptActive: { borderColor: colors.primary },
  sectionLabel: { color: colors.textMuted, fontSize: 13, fontFamily: font.medium, marginTop: 8, marginBottom: 6 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: "rgba(255,255,255,0.04)" },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontFamily: font.medium, fontSize: 13 },
  chipTextActive: { color: "#07111F", fontFamily: font.semibold },
});
