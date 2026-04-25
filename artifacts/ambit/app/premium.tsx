import { useRouter } from "expo-router";
import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { colors, font, gradients } from "@/lib/theme";

const PERKS = [
  { icon: "zap", title: "2x XP boost", desc: "Earn double XP on every action and reach the top faster." },
  { icon: "user-check", title: "Verified badge", desc: "Stand out in the community with a verified gold mark." },
  { icon: "message-square", title: "Mentor priority", desc: "Get longer, deeper Lion mentor responses." },
  { icon: "eye", title: "See who viewed you", desc: "Check who's been looking at your profile." },
  { icon: "filter", title: "Advanced filters", desc: "Filter feed by topic, type, and circle." },
  { icon: "shield", title: "Ad-free forever", desc: "A clean, focused space to learn and grow." },
];

const PLANS = [
  { id: "monthly", label: "Monthly", price: "$4.99", period: "/mo" },
  { id: "yearly", label: "Yearly", price: "$39", period: "/yr", badge: "Save 35%" },
];

export default function Premium() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const [plan, setPlan] = useState("yearly");
  const [loading, setLoading] = useState(false);

  async function subscribe() {
    if (!user) return;
    setLoading(true);
    await supabase.from("profiles").update({ is_premium: true }).eq("id", user.id);
    await supabase.from("notifications").insert({ user_id: user.id, title: "Welcome to Premium", body: "Your perks are now active.", type: "system", link: "/premium" });
    await refreshProfile();
    setLoading(false);
    router.back();
  }

  return (
    <Screen scroll>
      <Header back title="Ambit Premium" />

      <LinearGradient colors={gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <Feather name="award" size={36} color="#07111F" />
        <Text style={styles.heroTitle}>Unlock your full ambit.</Text>
        <Text style={styles.heroSub}>Level up faster, get verified, and access mentor priority.</Text>
        {profile?.is_premium && (
          <View style={styles.activeTag}><Feather name="check" size={11} color={colors.primary} /><Text style={styles.activeText}>Active</Text></View>
        )}
      </LinearGradient>

      <View style={{ marginTop: 18 }}>
        {PERKS.map((p) => (
          <Card key={p.title} style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
              <View style={styles.iconBox}><Feather name={p.icon as any} size={16} color={colors.primary} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.perkTitle}>{p.title}</Text>
                <Text style={styles.perkDesc}>{p.desc}</Text>
              </View>
            </View>
          </Card>
        ))}
      </View>

      {!profile?.is_premium && (
        <View style={{ marginTop: 14 }}>
          <Text style={styles.choose}>Choose a plan</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {PLANS.map((p) => (
              <Pressable key={p.id} onPress={() => setPlan(p.id)} style={[styles.plan, plan === p.id && styles.planActive]}>
                {p.badge && <View style={styles.badge}><Text style={styles.badgeText}>{p.badge}</Text></View>}
                <Text style={[styles.planLabel, plan === p.id && { color: colors.primary }]}>{p.label}</Text>
                <Text style={styles.planPrice}>{p.price}<Text style={styles.planPeriod}>{p.period}</Text></Text>
              </Pressable>
            ))}
          </View>
          <PrimaryButton title="Start Premium" icon="zap" onPress={subscribe} loading={loading} style={{ marginTop: 18 }} />
          <Text style={styles.legal}>Cancel anytime. Renews automatically until cancelled.</Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { padding: 24, borderRadius: 24, alignItems: "center", shadowColor: colors.primary, shadowOpacity: 0.5, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 10 },
  heroTitle: { color: "#07111F", fontFamily: font.bold, fontSize: 22, marginTop: 12, textAlign: "center" },
  heroSub: { color: "rgba(7,17,31,0.78)", fontSize: 13, textAlign: "center", marginTop: 6, fontFamily: font.medium, lineHeight: 18 },
  activeTag: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 12, backgroundColor: "#07111F", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  activeText: { color: colors.primary, fontFamily: font.bold, fontSize: 11 },
  iconBox: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(245,185,66,0.18)", alignItems: "center", justifyContent: "center" },
  perkTitle: { color: colors.text, fontFamily: font.semibold, fontSize: 14 },
  perkDesc: { color: colors.textMuted, fontSize: 12.5, marginTop: 3, lineHeight: 17 },
  choose: { color: colors.text, fontFamily: font.bold, fontSize: 14, marginBottom: 10 },
  plan: { flex: 1, backgroundColor: colors.card, borderRadius: 18, borderWidth: 1.5, borderColor: colors.border, padding: 18, alignItems: "center", position: "relative" },
  planActive: { borderColor: colors.primary, backgroundColor: "rgba(245,185,66,0.08)" },
  badge: { position: "absolute", top: -10, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: colors.primary, borderRadius: 999 },
  badgeText: { color: "#07111F", fontFamily: font.bold, fontSize: 10 },
  planLabel: { color: colors.text, fontFamily: font.semibold, fontSize: 13 },
  planPrice: { color: colors.text, fontFamily: font.bold, fontSize: 22, marginTop: 8 },
  planPeriod: { color: colors.textMuted, fontFamily: font.regular, fontSize: 13 },
  legal: { color: colors.textDim, fontSize: 11, textAlign: "center", marginTop: 12, fontFamily: font.regular },
});
