import { useRouter } from "expo-router";
import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { AppInput } from "@/components/AppInput";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Card } from "@/components/Card";
import { Avatar } from "@/components/Avatar";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { colors, font } from "@/lib/theme";

const STYLES = ["A", "B", "C", "D", "E", "F"];

export default function EditProfile() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const [nickname, setNickname] = useState(profile?.nickname ?? "");
  const [ambition, setAmbition] = useState(profile?.ambition_title ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [avatar, setAvatar] = useState(profile?.avatar_style ?? "A");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    if (!user) return;
    if (!nickname.trim()) return setErr("Nickname required");
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      nickname: nickname.trim(),
      ambition_title: ambition.trim() || null,
      bio: bio.trim() || null,
      avatar_style: avatar,
    }).eq("id", user.id);
    setSaving(false);
    if (error) return setErr(error.message);
    await refreshProfile();
    router.back();
  }

  return (
    <Screen scroll>
      <Header back title="Edit profile" />

      <Card style={{ alignItems: "center", marginBottom: 16 }}>
        <Avatar name={nickname} style={avatar} size={88} border />
        <Text style={{ color: colors.textMuted, marginTop: 12, fontSize: 13, fontFamily: font.medium }}>Avatar style</Text>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 10, flexWrap: "wrap", justifyContent: "center" }}>
          {STYLES.map((s) => (
            <Pressable key={s} onPress={() => setAvatar(s)} style={[styles.opt, avatar === s && { borderColor: colors.primary }]}>
              <Avatar name={nickname || s} style={s} size={36} />
            </Pressable>
          ))}
        </View>
      </Card>

      <View style={{ gap: 14 }}>
        <AppInput label="Nickname" icon="user" value={nickname} onChangeText={setNickname} error={err} />
        <AppInput label="Ambition" icon="target" value={ambition} onChangeText={setAmbition} placeholder="What are you building toward?" />
        <AppInput label="Bio" icon="edit-3" value={bio} onChangeText={setBio} placeholder="Tell people who you are…" multiline />
      </View>

      <PrimaryButton title="Save changes" icon="check" loading={saving} onPress={save} style={{ marginTop: 22 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  opt: { padding: 4, borderRadius: 999, borderWidth: 2, borderColor: "transparent" },
});
