import { useRouter } from "expo-router";
import React, { useState } from "react";
import { View, Text, StyleSheet, Switch, Pressable, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { Card } from "@/components/Card";
import { useAuth } from "@/context/AuthContext";
import { colors, font } from "@/lib/theme";

export default function Settings() {
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const [notif, setNotif] = useState(true);
  const [privacy, setPrivacy] = useState(false);
  const [haptics, setHaptics] = useState(true);

  return (
    <Screen scroll>
      <Header back title="Settings" />

      <Section title="Account">
        <Row icon="user" label="Edit profile" onPress={() => router.push("/edit-profile")} />
        <Row icon="star" label="Premium" onPress={() => router.push("/premium")} value={profile?.is_premium ? "Active" : "Free"} />
        <Row icon="award" label="My badges" onPress={() => router.push("/badges")} />
        <Row icon="target" label="My goals" onPress={() => router.push("/goals")} />
      </Section>

      <Section title="Preferences">
        <RowSwitch icon="bell" label="Push notifications" value={notif} onValueChange={setNotif} />
        <RowSwitch icon="eye-off" label="Private profile" value={privacy} onValueChange={setPrivacy} />
        <RowSwitch icon="smartphone" label="Haptic feedback" value={haptics} onValueChange={setHaptics} />
      </Section>

      <Section title="Community">
        <Row icon="trending-up" label="Leaderboard" onPress={() => router.push("/leaderboard")} />
        <Row icon="message-square" label="Lion mentor" onPress={() => router.push("/mentor")} />
        <Row icon="flag" label="Report content" onPress={() => router.push("/report")} />
      </Section>

      {(profile?.role === "mod" || profile?.role === "admin") && (
        <Section title="Staff tools">
          <Row icon="shield" label="Mod dashboard" onPress={() => router.push("/mod/dashboard")} />
          <Row icon="users" label="User management" onPress={() => router.push("/mod/users")} />
          <Row icon="bar-chart-2" label="Analytics" onPress={() => router.push("/mod/analytics")} />
        </Section>
      )}

      <Section title="About">
        <Row icon="info" label="Version" value="1.0.0" />
        <Row icon="file-text" label="Terms & privacy" />
        <Row icon="help-circle" label="Help & support" />
      </Section>

      <Pressable onPress={signOut} style={styles.signOut}>
        <Feather name="log-out" size={15} color={colors.error} />
        <Text style={{ color: colors.error, fontFamily: font.semibold, fontSize: 14 }}>Sign out</Text>
      </Pressable>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Card pad={0}>{children}</Card>
    </View>
  );
}

function Row({ icon, label, value, onPress }: { icon: any; label: string; value?: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={styles.iconBox}><Feather name={icon} size={15} color={colors.primary} /></View>
      <Text style={{ color: colors.text, fontFamily: font.medium, fontSize: 14, flex: 1 }}>{label}</Text>
      {value ? <Text style={{ color: colors.textMuted, fontSize: 12, marginRight: 6, fontFamily: font.medium }}>{value}</Text> : null}
      {onPress && <Feather name="chevron-right" size={16} color={colors.textDim} />}
    </Pressable>
  );
}

function RowSwitch({ icon, label, value, onValueChange }: { icon: any; label: string; value: boolean; onValueChange: (v: boolean) => void }) {
  return (
    <View style={styles.row}>
      <View style={styles.iconBox}><Feather name={icon} size={15} color={colors.primary} /></View>
      <Text style={{ color: colors.text, fontFamily: font.medium, fontSize: 14, flex: 1 }}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ true: colors.primary, false: colors.border }} thumbColor="#fff" />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { color: colors.textMuted, fontFamily: font.bold, fontSize: 11, letterSpacing: 1.2, marginBottom: 8, marginLeft: 4 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, gap: 12 },
  iconBox: { width: 32, height: 32, borderRadius: 10, backgroundColor: "rgba(245,185,66,0.12)", alignItems: "center", justifyContent: "center" },
  signOut: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12, paddingVertical: 14, borderRadius: 18, borderWidth: 1, borderColor: colors.border },
});
