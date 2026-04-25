import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { colors } from "@/lib/theme";

export default function IndexGate() {
  const { loading, session, profile } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!session) return <Redirect href="/welcome" />;

  if (!profile?.onboarding_completed) {
    if (!profile?.nickname) return <Redirect href="/onboarding/identity" />;
    if (!profile?.focus_topics || profile.focus_topics.length === 0) return <Redirect href="/onboarding/goals" />;
    return <Redirect href="/onboarding/communities" />;
  }

  return <Redirect href="/(tabs)" />;
}
