import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { OnboardingProvider, useOnboarding } from "@/context/OnboardingContext";
import { WelcomeScreen } from "@/screens/WelcomeScreen";
import { AccountScreen } from "@/screens/AccountScreen";
import { NicknameScreen } from "@/screens/NicknameScreen";
import { PhotoScreen } from "@/screens/PhotoScreen";
import { GoalsScreen } from "@/screens/GoalsScreen";
import { CirclesScreen } from "@/screens/CirclesScreen";
import { SummaryScreen } from "@/screens/SummaryScreen";
import { MainAppScreen } from "@/screens/MainAppScreen";

export default function App() {
  const [onboardingDone, setOnboardingDone] = useState(false);

  if (onboardingDone) {
    return <MainAppScreen />;
  }

  return (
    <OnboardingProvider onComplete={() => setOnboardingDone(true)}>
      <OnboardingFlow onComplete={() => setOnboardingDone(true)} />
    </OnboardingProvider>
  );
}

function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const { currentStep } = useOnboarding();

  const screens: React.ReactElement[] = [
    <WelcomeScreen key="welcome" />,
    <AccountScreen key="account" />,
    <NicknameScreen key="nickname" />,
    <PhotoScreen key="photo" />,
    <GoalsScreen key="goals" />,
    <CirclesScreen key="circles" />,
    <SummaryScreen key="summary" onComplete={onComplete} />,
  ];

  return (
    <View style={styles.container}>
      {screens[currentStep]}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0F1F",
  },
});
