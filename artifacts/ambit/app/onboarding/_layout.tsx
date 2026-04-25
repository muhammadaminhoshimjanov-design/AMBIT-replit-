import { Stack, Redirect } from "expo-router";
import React from "react";
import { useAuth } from "@/context/AuthContext";

export default function OnboardingLayout() {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (!session) return <Redirect href="/welcome" />;
  return <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }} />;
}
