import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { Card } from "@/components/Card";
import { Avatar } from "@/components/Avatar";
import { AppInput } from "@/components/AppInput";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { colors, font } from "@/lib/theme";

export default function UserManagement() {
  const router = useRouter();
  const { profile } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    let query = supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(80);
    if (q.trim()) query = query.or(`nickname.ilike.%${q}%,email.ilike.%${q}%`);
    const { data } = await query;
    setUsers(data ?? []);
  }, [q]);

  useEffect(() => {
    const t = setTimeout(load, 220);
    return () => clearTimeout(t);
  }, [load]);

  async function toggleBan(u: any) {
    await supabase.from("profiles").update({ is_banned: !u.is_banned }).eq("id", u.id);
    load();
  }

  async function setRole(u: any, role: "user" | "mod" | "admin") {
    await supabase.from("profiles").update({ role }).eq("id", u.id);
    load();
  }

  if (profile && profile.role !== "mod" && profile.role !== "admin") {
    return (
      <Screen>
        <Header back title="User management" />
        <Card style={{ alignItems: "center", paddingVertical: 40 }}>
          <Feather name="lock" size={28} color={colors.textDim} />
          <Text style={{ color: colors.text, fontFamily: font.semibold, marginTop: 12, fontSize: 16 }}>Staff only</Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Header back title="User management" />

      <AppInput icon="search" placeholder="Search by nickname or email" value={q} onChangeText={setQ} containerStyle={{ marginBottom: 14 }} />

      {users.map((u) => (
        <Card key={u.id} style={{ marginBottom: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Pressable onPress={() => router.push(`/user/${u.id}`)}>
              <Avatar name={u.nickname} style={u.avatar_style} url={u.avatar_url} size={44} />
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{u.nickname ?? "Anonymous"} {u.is_banned && <Text style={styles.ban}>· BANNED</Text>}</Text>
              <Text style={styles.meta}>{u.email}</Text>
              <Text style={styles.meta}>L{u.level} · {u.xp} XP · {u.role}</Text>
            </View>
          </View>
          <View style={styles.actions}>
            <Pressable onPress={() => toggleBan(u)} style={[styles.btn, u.is_banned ? { borderColor: colors.success } : { borderColor: colors.error }]}>
              <Feather name={u.is_banned ? "unlock" : "slash"} size={12} color={u.is_banned ? colors.success : colors.error} />
              <Text style={[styles.btnText, { color: u.is_banned ? colors.success : colors.error }]}>{u.is_banned ? "Unban" : "Ban"}</Text>
            </Pressable>
            {u.role !== "mod" && (
              <Pressable onPress={() => setRole(u, "mod")} style={styles.btn}>
                <Text style={styles.btnText}>Make mod</Text>
              </Pressable>
            )}
            {u.role !== "user" && (
              <Pressable onPress={() => setRole(u, "user")} style={styles.btn}>
                <Text style={styles.btnText}>Demote</Text>
              </Pressable>
            )}
          </View>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  name: { color: colors.text, fontFamily: font.semibold, fontSize: 14 },
  ban: { color: colors.error, fontSize: 11, fontFamily: font.bold },
  meta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  actions: { flexDirection: "row", gap: 8, marginTop: 12, flexWrap: "wrap" },
  btn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: "rgba(255,255,255,0.04)" },
  btnText: { color: colors.text, fontFamily: font.semibold, fontSize: 11.5 },
});
