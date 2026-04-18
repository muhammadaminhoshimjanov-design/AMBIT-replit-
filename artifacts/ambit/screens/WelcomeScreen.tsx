import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  Platform,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientBackground } from "@/components/GradientBackground";
import { GradientButton } from "@/components/GradientButton";
import { MascotGuide } from "@/components/MascotGuide";
import { useOnboarding } from "@/context/OnboardingContext";

const { width } = Dimensions.get("window");

export function WelcomeScreen() {
  const { goNext } = useOnboarding();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(40)).current;
  const tagFade = useRef(new Animated.Value(0)).current;
  const tagSlide = useRef(new Animated.Value(24)).current;
  const dotsFade = useRef(new Animated.Value(0)).current;
  const ctaFade = useRef(new Animated.Value(0)).current;
  const ctaSlide = useRef(new Animated.Value(20)).current;
  const mascotFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, useNativeDriver: true, speed: 7, bounciness: 10 }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.delay(100),
      Animated.parallel([
        Animated.timing(titleFade, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(titleSlide, { toValue: 0, duration: 650, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(tagFade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(tagSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.timing(dotsFade, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(150),
      Animated.parallel([
        Animated.timing(mascotFade, { toValue: 1, duration: 550, useNativeDriver: true }),
        Animated.timing(ctaFade, { toValue: 1, duration: 550, useNativeDriver: true }),
        Animated.timing(ctaSlide, { toValue: 0, duration: 550, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={styles.screen}>
      <GradientBackground />

      {/* Top radial accent */}
      <View style={styles.topAccent} />

      <View style={[styles.content, { paddingTop: topPad + 16, paddingBottom: bottomPad + 24 }]}>

        {/* Hero section */}
        <View style={styles.hero}>
          <Animated.View
            style={[styles.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}
          >
            <LinearGradient
              colors={["#1E3A8A", "#2563EB", "#7C3AED"]}
              style={styles.logoGradient}
            >
              <Image
                source={require("@/assets/images/icon.png")}
                style={styles.logoImg}
                resizeMode="contain"
              />
            </LinearGradient>
            {/* Glow halo */}
            <View style={styles.logoHalo} />
          </Animated.View>

          <Animated.Text
            style={[
              styles.appName,
              { opacity: titleFade, transform: [{ translateY: titleSlide }] },
            ]}
          >
            Ambit
          </Animated.Text>

          <Animated.View
            style={[
              styles.taglineWrap,
              { opacity: tagFade, transform: [{ translateY: tagSlide }] },
            ]}
          >
            <Text style={styles.tagline}>
              For students who want{" "}
              <Text style={styles.taglineHighlight}>more</Text>
              .
            </Text>
          </Animated.View>

          <Animated.View style={[styles.dotsRow, { opacity: dotsFade }]}>
            {["Discuss", "Connect", "Grow"].map((word, i) => (
              <React.Fragment key={word}>
                <Text style={styles.dotWord}>{word}</Text>
                {i < 2 && <View style={styles.dotSep} />}
              </React.Fragment>
            ))}
          </Animated.View>
        </View>

        {/* Bottom section */}
        <View style={styles.bottom}>
          <Animated.View style={{ opacity: mascotFade, marginBottom: 20 }}>
            <MascotGuide message="Welcome to Ambit. Let's build your space." />
          </Animated.View>

          <Animated.View
            style={[styles.ctaWrap, { opacity: ctaFade, transform: [{ translateY: ctaSlide }] }]}
          >
            <GradientButton label="Get Started" onPress={goNext} />
            <Text style={styles.legal}>
              By continuing you agree to our Terms & Privacy Policy
            </Text>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#050813",
  },
  topAccent: {
    position: "absolute",
    top: -width * 0.4,
    left: width * 0.1,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: "rgba(59,130,246,0.06)",
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "space-between",
  },
  hero: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 0,
  },
  logoWrap: {
    width: 96,
    height: 96,
    marginBottom: 30,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  logoGradient: {
    width: 96,
    height: 96,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logoImg: {
    width: 84,
    height: 84,
  },
  logoHalo: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(59,130,246,0.12)",
    zIndex: -1,
  },
  appName: {
    fontSize: 68,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -3,
    marginBottom: 20,
    textAlign: "center",
  },
  taglineWrap: {
    marginBottom: 18,
  },
  tagline: {
    fontSize: 22,
    fontWeight: "600",
    color: "#94A3B8",
    textAlign: "center",
    letterSpacing: -0.4,
  },
  taglineHighlight: {
    color: "#818CF8",
    fontWeight: "800",
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
  },
  dotWord: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  dotSep: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#3B82F6",
  },
  bottom: {
    gap: 0,
  },
  ctaWrap: {
    gap: 14,
  },
  legal: {
    color: "#334155",
    fontSize: 11,
    textAlign: "center",
    lineHeight: 16,
  },
});
