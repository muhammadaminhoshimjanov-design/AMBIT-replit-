import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { OnboardingProvider, useOnboarding } from "@/context/OnboardingContext";
import { useAuth } from "@/context/AuthContext";
import { WelcomeScreen } from "@/screens/WelcomeScreen";
import { AccountScreen } from "@/screens/AccountScreen";
import { NicknameScreen } from "@/screens/NicknameScreen";
import { PhotoScreen } from "@/screens/PhotoScreen";
import { GoalsScreen } from "@/screens/GoalsScreen";
import { CirclesScreen } from "@/screens/CirclesScreen";
import { SummaryScreen } from "@/screens/SummaryScreen";
import { MainAppScreen } from "@/screens/MainAppScreen";

export default function App() {
  const { loading, profile, session } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#6366F1" size="large" />
      </View>
    );
  }

  // Not logged in → show onboarding (starts with account/auth screen)
  if (!session) {
    return (
      <OnboardingProvider onComplete={() => {}}>
        <OnboardingFlow />
      </OnboardingProvider>
    );
  }

  // Logged in but onboarding incomplete → continue onboarding
  if (!profile?.onboarding_completed) {
    return (
      <OnboardingProvider onComplete={() => {}}>
        <OnboardingFlow startStep={session && !profile?.nickname ? 1 : 2} />
      </OnboardingProvider>
    );
  }

  // Fully onboarded → main app
  return <MainAppScreen />;
}

function OnboardingFlow({ startStep = 0 }: { startStep?: number }) {
  const { currentStep, setCurrentStep } = useOnboarding();
  const { profile } = useAuth();

  React.useEffect(() => {
    if (startStep > 0) setCurrentStep(startStep);
  }, []);

  const screens: React.ReactElement[] = [
    <WelcomeScreen key="welcome" />,
    <AccountScreen key="account" />,
    <NicknameScreen key="nickname" />,
    <PhotoScreen key="photo" />,
    <GoalsScreen key="goals" />,
    <CirclesScreen key="circles" />,
    <SummaryScreen key="summary" />,
  ];

  return (
    <View style={styles.container}>
      {screens[currentStep] ?? screens[0]}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050813",
  },
  loading: {
    flex: 1,
    backgroundColor: "#050813",
    alignItems: "center",
    justifyContent: "center",
  },
});
