import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientBackground } from "@/components/GradientBackground";
import { GradientButton } from "@/components/GradientButton";
import { MascotGuide } from "@/components/MascotGuide";
import { useOnboarding } from "@/context/OnboardingContext";

export function WelcomeScreen() {
  const { goNext } = useOnboarding();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const titleFade = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(30)).current;
  const subtitleFade = useRef(new Animated.Value(0)).current;
  const subtitleSlide = useRef(new Animated.Value(20)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;
  const ctaFade = useRef(new Animated.Value(0)).current;
  const mascotFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(titleFade, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(titleSlide, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(subtitleFade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(subtitleSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.timing(taglineFade, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(ctaFade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(mascotFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={styles.screen}>
      <GradientBackground />

      <View style={[styles.content, { paddingTop: topPad + 20, paddingBottom: bottomPad + 20 }]}>
        <View style={styles.heroSection}>
          <Animated.View
            style={[
              styles.logoRing,
              { opacity: titleFade },
            ]}
          >
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.logoImg}
              resizeMode="contain"
            />
          </Animated.View>

          <Animated.Text
            style={[
              styles.appName,
              {
                opacity: titleFade,
                transform: [{ translateY: titleSlide }],
              },
            ]}
          >
            Ambit
          </Animated.Text>

          <Animated.Text
            style={[
              styles.tagline,
              {
                opacity: subtitleFade,
                transform: [{ translateY: subtitleSlide }],
              },
            ]}
          >
            For students who want{" "}
            <Text style={styles.taglineAccent}>more</Text>
            .
          </Animated.Text>

          <Animated.Text style={[styles.supporting, { opacity: taglineFade }]}>
            Discuss. Connect. Grow.
          </Animated.Text>
        </View>

        <View style={styles.bottom}>
          <Animated.View style={{ opacity: mascotFade, marginBottom: 24 }}>
            <MascotGuide message="Welcome to Ambit. Let's build your space." />
          </Animated.View>

          <Animated.View style={[styles.ctaWrapper, { opacity: ctaFade }]}>
            <GradientButton label="Get Started" onPress={goNext} />
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0A0F1F",
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "space-between",
  },
  heroSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 0,
  },
  logoRing: {
    width: 90,
    height: 90,
    borderRadius: 28,
    overflow: "hidden",
    marginBottom: 28,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 16,
  },
  logoImg: {
    width: 90,
    height: 90,
  },
  appName: {
    fontSize: 64,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -2,
    marginBottom: 16,
  },
  tagline: {
    fontSize: 22,
    fontWeight: "600",
    color: "#C4CCE0",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  taglineAccent: {
    color: "#3B82F6",
  },
  supporting: {
    fontSize: 15,
    color: "#8A94B0",
    letterSpacing: 2,
    textTransform: "uppercase",
    fontWeight: "500",
  },
  bottom: {
    paddingBottom: 12,
  },
  ctaWrapper: {
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
  },
});
