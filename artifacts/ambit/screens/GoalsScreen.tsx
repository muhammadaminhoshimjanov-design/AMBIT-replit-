import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { GradientBackground } from "@/components/GradientBackground";
import { GradientButton } from "@/components/GradientButton";
import { MascotGuide } from "@/components/MascotGuide";
import { ProgressBar } from "@/components/ProgressBar";
import { SelectableCard } from "@/components/SelectableCard";
import { useOnboarding } from "@/context/OnboardingContext";

const FOCUS_TOPICS = [
  "SAT / Exams",
  "Universities",
  "Scholarships",
  "Essays",
  "Self-growth",
  "Career direction",
  "Student life",
  "Productivity",
];

const IDENTITY_OPTIONS = [
  { label: "Just starting out", sub: "I'm exploring my options" },
  { label: "Improve fast", sub: "I want to level up quickly" },
  { label: "Highly ambitious", sub: "I'm set on reaching the top" },
  { label: "Serious circle", sub: "I want driven people around me" },
];

export function GoalsScreen() {
  const { goNext, goBack, updateData, data, currentStep, totalSteps } = useOnboarding();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [topics, setTopics] = useState<string[]>(data.focusTopics);
  const [identity, setIdentity] = useState(data.studentIdentity);
  const contentFade = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(contentSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  function toggleTopic(topic: string) {
    setTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  }

  function handleNext() {
    updateData({ focusTopics: topics, studentIdentity: identity });
    goNext();
  }

  return (
    <View style={styles.screen}>
      <GradientBackground />

      <View style={[styles.content, { paddingTop: topPad + 16, paddingBottom: bottomPad + 16 }]}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={goBack} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#8A94B0" />
          </TouchableOpacity>
          <ProgressBar current={currentStep} total={totalSteps} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Animated.View
            style={{ opacity: contentFade, transform: [{ translateY: contentSlide }] }}
          >
            <Text style={styles.title}>What are you focused{"\n"}on right now?</Text>
            <Text style={styles.subtitle}>Select all that apply</Text>

            <View style={styles.grid}>
              {FOCUS_TOPICS.map((topic) => (
                <View key={topic} style={styles.gridItem}>
                  <SelectableCard
                    label={topic}
                    selected={topics.includes(topic)}
                    onPress={() => toggleTopic(topic)}
                  />
                </View>
              ))}
            </View>

            <Text style={styles.sectionTitle}>What describes you best?</Text>
            <Text style={styles.sectionSub}>Choose one</Text>

            <View style={styles.identityList}>
              {IDENTITY_OPTIONS.map((opt) => (
                <IdentityOption
                  key={opt.label}
                  label={opt.label}
                  sub={opt.sub}
                  selected={identity === opt.label}
                  onPress={() => setIdentity(opt.label)}
                />
              ))}
            </View>

            <MascotGuide message="This helps me build your feed." style={styles.mascot} />

            <GradientButton
              label="Continue"
              onPress={handleNext}
              disabled={topics.length === 0 || !identity}
              style={styles.btn}
            />
          </Animated.View>
        </ScrollView>
      </View>
    </View>
  );
}

function IdentityOption({
  label,
  sub,
  selected,
  onPress,
}: {
  label: string;
  sub: string;
  selected: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  function handlePress() {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    onPress();
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[styles.identityCard, selected && styles.identityCardSelected]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <View style={styles.identityRadio}>
          {selected && <View style={styles.identityRadioDot} />}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.identityLabel, selected && styles.identityLabelSelected]}>
            {label}
          </Text>
          <Text style={styles.identitySub}>{sub}</Text>
        </View>
        {selected && (
          <Feather name="check-circle" size={18} color="#3B82F6" />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0A0F1F" },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  topBar: {
    gap: 16,
    marginBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.8,
    marginBottom: 8,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 14,
    color: "#8A94B0",
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 28,
  },
  gridItem: {
    width: "47%",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  sectionSub: {
    fontSize: 14,
    color: "#8A94B0",
    marginBottom: 16,
  },
  identityList: {
    gap: 10,
    marginBottom: 28,
  },
  identityCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "rgba(20,25,41,0.8)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  identityCardSelected: {
    borderColor: "rgba(59,130,246,0.5)",
    backgroundColor: "rgba(59,130,246,0.1)",
  },
  identityRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#8A94B0",
    alignItems: "center",
    justifyContent: "center",
  },
  identityRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#3B82F6",
  },
  identityLabel: {
    color: "#C4CCE0",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  identityLabelSelected: {
    color: "#FFFFFF",
  },
  identitySub: {
    color: "#8A94B0",
    fontSize: 12,
  },
  mascot: {
    marginBottom: 20,
  },
  btn: {
    marginBottom: 24,
  },
});
