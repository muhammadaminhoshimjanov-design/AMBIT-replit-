import { useRouter } from "expo-router";
import React from "react";
import { View, Text, Pressable, StyleSheet, ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, font } from "@/lib/theme";

interface Props {
  title?: string;
  subtitle?: string;
  back?: boolean;
  onBack?: () => void;
  right?: React.ReactNode;
  style?: ViewStyle;
}

export function Header({ title, subtitle, back, onBack, right, style }: Props) {
  const router = useRouter();
  return (
    <View style={[styles.row, style]}>
      <View style={styles.left}>
        {back && (
          <Pressable
            onPress={() => (onBack ? onBack() : router.canGoBack() ? router.back() : router.replace("/"))}
            style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
            hitSlop={10}
          >
            <Feather name="chevron-left" size={22} color={colors.text} />
          </Pressable>
        )}
        <View style={{ flex: 1 }}>
          {title ? <Text style={styles.title} numberOfLines={1}>{title}</Text> : null}
          {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
        </View>
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", marginBottom: 18, gap: 12 },
  left: { flexDirection: "row", alignItems: "center", flex: 1, gap: 10 },
  right: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { color: colors.text, fontSize: 22, fontFamily: font.bold },
  subtitle: { color: colors.textMuted, fontSize: 13, fontFamily: font.regular, marginTop: 2 },
});
