import { Tabs, Redirect } from "expo-router";
import React from "react";
import { Pressable, View, Text, StyleSheet, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { colors, font } from "@/lib/theme";

const TABS = [
  { name: "index", label: "Home", icon: "home" as const },
  { name: "communities", label: "Circles", icon: "users" as const },
  { name: "search", label: "Discover", icon: "search" as const },
  { name: "notifications", label: "Inbox", icon: "bell" as const },
  { name: "profile", label: "Me", icon: "user" as const },
];

export default function TabsLayout() {
  const { session, profile, loading } = useAuth();
  if (loading) return null;
  if (!session) return <Redirect href="/welcome" />;
  if (!profile?.onboarding_completed) return <Redirect href="/" />;

  return (
    <Tabs
      screenOptions={{ headerShown: false, lazy: true }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      {TABS.map((t) => (
        <Tabs.Screen key={t.name} name={t.name} options={{ title: t.label }} />
      ))}
    </Tabs>
  );
}

function CustomTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? Math.max(insets.bottom, 14) : insets.bottom + 8;

  return (
    <View style={[styles.wrap, { paddingBottom: bottomPad }]}>
      <View style={styles.bar}>
        {state.routes.map((route: any, i: number) => {
          const focused = state.index === i;
          const tab = TABS.find((x) => x.name === route.name);
          if (!tab) return null;
          return (
            <Pressable
              key={route.key}
              onPress={() => {
                const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
              }}
              style={styles.item}
              hitSlop={6}
            >
              <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
                <Feather name={tab.icon} size={20} color={focused ? "#07111F" : colors.textMuted} />
              </View>
              <Text style={[styles.label, { color: focused ? colors.primary : colors.textDim }]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingTop: 6,
    backgroundColor: "transparent",
  },
  bar: {
    flexDirection: "row",
    backgroundColor: "rgba(16,27,45,0.92)",
    borderRadius: 28,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  item: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 4 },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapActive: { backgroundColor: colors.primary },
  label: { fontSize: 10.5, marginTop: 4, fontFamily: font.medium },
});
