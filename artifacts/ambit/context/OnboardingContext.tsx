import React, { createContext, useContext, useState, ReactNode } from "react";

export interface OnboardingData {
  email: string;
  nickname: string;
  shortIntro: string;
  photoUri: string | null;
  avatarStyle: string | null;
  focusTopics: string[];
  studentIdentity: string;
  circles: string[];
  circlePreference: string;
  circleCount: string;
}

interface OnboardingContextType {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  goNext: () => void;
  goBack: () => void;
  totalSteps: number;
}

const defaultData: OnboardingData = {
  email: "",
  nickname: "",
  shortIntro: "",
  photoUri: null,
  avatarStyle: null,
  focusTopics: [],
  studentIdentity: "",
  circles: [],
  circlePreference: "",
  circleCount: "",
};

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({
  children,
  onComplete,
}: {
  children: ReactNode;
  onComplete: () => void;
}) {
  const [data, setData] = useState<OnboardingData>(defaultData);
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 7;

  function updateData(updates: Partial<OnboardingData>) {
    setData((prev) => ({ ...prev, ...updates }));
  }

  function goNext() {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      onComplete();
    }
  }

  function goBack() {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  }

  return (
    <OnboardingContext.Provider
      value={{
        data,
        updateData,
        currentStep,
        setCurrentStep,
        goNext,
        goBack,
        totalSteps,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
}
