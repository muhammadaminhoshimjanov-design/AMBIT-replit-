import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { Card } from "@/components/Card";
import { AppInput } from "@/components/AppInput";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { colors, font } from "@/lib/theme";

const REASONS = [
  { id: "spam", label: "Spam or scam", severity: "low" },
  { id: "harassment", label: "Harassment or hate", severity: "high" },
  { id: "misinformation", label: "Misinformation", severity: "medium" },
  { id: "self_harm", label: "Self-harm content", severity: "critical" },
  { id: "explicit", label: "Explicit content", severity: "high" },
  { id: "other", label: "Something else", severity: "low" },
];

export default function Report() {
  const router = useRouter();
  const params = useLocalSearchParams<{ post?: string; comment?: string; user?: string }>();
  const { user } = useAuth();
  const [reason, setReason] = useState<string | null>(null);
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    if (!user || !reason) return;
    setSubmitting(true);
    const sev = REASONS.find((r) => r.id === reason)?.severity ?? "low";
    await supabase.from("reports").insert({
      reporter_id: user.id,
      reported_user_id: params.user ?? null,
      post_id: params.post ?? null,
      comment_id: params.comment ?? null,
      reason: REASONS.find((r) => r.id === reason)?.label ?? "Other",
      details: details.trim() || null,
      severity: sev,
    });
    setSubmitting(false);
    setDone(true);
    setTimeout(() => router.back(), 1400);
  }

  if (done) {
    return (
      <Screen>
        <Header back title="Report" />
        <Card style={{ alignItems: "center", paddingVertical: 40 }}>
          <View style={styles.checkBg}><Feather name="check" size={36} color={colors.success} /></View>
          <Text style={styles.doneTitle}>Report received</Text>
          <Text style={styles.doneSub}>Our team will review and take action if needed. Thanks for helping keep Ambit safe.</Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Header back title="Report content" />

      <Card style={{ marginBottom: 14 }}>
        <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 19 }}>
          Reports are anonymous. We review every report and remove content that violates our community guidelines.
        </Text>
      </Card>

      <Text style={styles.label}>Why are you reporting this?</Text>
      <View style={{ gap: 8, marginBottom: 18 }}>
        {REASONS.map((r) => (
          <Card key={r.id} onPress={() => setReason(r.id)} style={reason === r.id ? styles.cardActive : undefined}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={[styles.bullet, reason === r.id && styles.bulletActive]}>
                {reason === r.id && <Feather name="check" size={12} color="#07111F" />}
              </View>
              <Text style={{ color: colors.text, fontFamily: font.medium, fontSize: 14, flex: 1 }}>{r.label}</Text>
              <View style={[styles.sev, { backgroundColor: severityColor(r.severity) + "22" }]}>
                <Text style={[styles.sevText, { color: severityColor(r.severity) }]}>{r.severity}</Text>
              </View>
            </View>
          </Card>
        ))}
      </View>

      <AppInput
        label="Additional details (optional)"
        placeholder="What happened? Any context that helps."
        value={details}
        onChangeText={setDetails}
        multiline
      />

      <PrimaryButton title="Submit report" icon="flag" loading={submitting} disabled={!reason} onPress={submit} variant="danger" style={{ marginTop: 22 }} />
    </Screen>
  );
}

function severityColor(s: string) {
  return s === "critical" ? colors.error : s === "high" ? "#F97316" : s === "medium" ? colors.warning : colors.textMuted;
}

const styles = StyleSheet.create({
  label: { color: colors.textMuted, fontFamily: font.semibold, fontSize: 13, marginBottom: 10 },
  cardActive: { borderColor: colors.primary, backgroundColor: "rgba(245,185,66,0.06)" },
  bullet: { width: 22, height: 22, borderRadius: 999, borderWidth: 1.5, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  bulletActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  sev: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  sevText: { fontSize: 10, fontFamily: font.bold, textTransform: "uppercase" },
  checkBg: { width: 80, height: 80, borderRadius: 999, backgroundColor: "rgba(16,185,129,0.18)", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  doneTitle: { color: colors.text, fontFamily: font.bold, fontSize: 18 },
  doneSub: { color: colors.textMuted, fontSize: 13, textAlign: "center", marginTop: 8, lineHeight: 19, paddingHorizontal: 18 },
});
