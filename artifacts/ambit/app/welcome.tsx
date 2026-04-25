import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing, Image, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Screen } from "@/components/Screen";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, font, gradients } from "@/lib/theme";

export default function Welcome() {
  const router = useRouter();
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const mascotY = useRef(new Animated.Value(40)).current;
  const mascotOpacity = useRef(new Animated.Value(0)).current;
  const headlineY = useRef(new Animated.Value(20)).current;
  const headlineOpacity = useRef(new Animated.Value(0)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;
  const ringPulse = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoScale, { toValue: 1, duration: 800, useNativeDriver: true, easing: Easing.out(Easing.back(1.4)) }),
      Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();

    Animated.parallel([
      Animated.timing(mascotY, { toValue: 0, duration: 1000, useNativeDriver: true, easing: Easing.out(Easing.back(1.2)) }),
      Animated.timing(mascotOpacity, { toValue: 1, duration: 900, useNativeDriver: true }),
    ]).start();

    Animated.sequence([
      Animated.delay(1200),
      Animated.parallel([
        Animated.timing(headlineY, { toValue: 0, duration: 700, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
        Animated.timing(headlineOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    ]).start();

    Animated.sequence([
      Animated.delay(1700),
      Animated.timing(buttonsOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(ringPulse, { toValue: 1.06, duration: 2400, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
        Animated.timing(ringPulse, { toValue: 0.95, duration: 2400, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
      ])
    ).start();
  }, []);

  const onPrimary = async () => {
    if (Platform.OS !== "web") {
      try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    }
    router.push("/auth?mode=signup");
  };

  return (
    <Screen contentContainerStyle={styles.content}>
      <Animated.View style={[styles.logoBox, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <LinearGradient colors={gradients.gold} style={styles.logo}>
          <Feather name="award" size={42} color="#07111F" />
        </LinearGradient>
      </Animated.View>

      <View style={styles.heroBox}>
        <Animated.View
          style={[
            styles.ring,
            { transform: [{ scale: ringPulse }] },
          ]}
        />
        <Animated.View style={{ opacity: mascotOpacity, transform: [{ translateY: mascotY }] }}>
          <View style={styles.mascotInner}>
            <Image source={require("@/assets/images/lion-mascot.png")} style={styles.mascot} resizeMode="contain" />
          </View>
        </Animated.View>
      </View>

      <Animated.View style={{ opacity: headlineOpacity, transform: [{ translateY: headlineY }], alignItems: "center" }}>
        <Text style={styles.headline}>Find your people.{"\n"}Build your future.</Text>
        <Text style={styles.subhead}>
          Ambit is where ambitious students connect, grow, share progress, and build their future together.
        </Text>
      </Animated.View>

      <Animated.View style={[styles.buttonStack, { opacity: buttonsOpacity }]}>
        <PrimaryButton title="Enter Ambit" icon="arrow-right" onPress={onPrimary} />
        <PrimaryButton
          title="I already have an account"
          variant="secondary"
          onPress={() => router.push("/auth?mode=login")}
          style={{ marginTop: 12 }}
        />
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, alignItems: "center", justifyContent: "space-between", paddingVertical: 32 },
  logoBox: { alignItems: "center", marginTop: 8 },
  logo: {
    width: 82, height: 82, borderRadius: 28,
    alignItems: "center", justifyContent: "center",
    shadowColor: colors.primary, shadowOpacity: 0.45, shadowRadius: 28, shadowOffset: { width: 0, height: 0 },
    elevation: 14,
  },
  heroBox: { alignItems: "center", justifyContent: "center", marginVertical: 16, height: 300, width: 300 },
  ring: {
    position: "absolute",
    width: 300, height: 300, borderRadius: 150,
    borderWidth: 1.5, borderColor: "rgba(245,185,66,0.32)",
    shadowColor: colors.primary, shadowOpacity: 0.45, shadowRadius: 40, shadowOffset: { width: 0, height: 0 },
  },
  mascotInner: { width: 260, height: 260, alignItems: "center", justifyContent: "center" },
  mascot: { width: 220, height: 220 },
  headline: {
    fontSize: 34, fontFamily: font.bold, color: colors.text, textAlign: "center",
    lineHeight: 38, letterSpacing: -0.5,
  },
  subhead: {
    fontSize: 15, fontFamily: font.regular, color: colors.textMuted, textAlign: "center",
    lineHeight: 22, marginTop: 14, maxWidth: 320,
  },
  buttonStack: { width: "100%", maxWidth: 420, marginTop: 18 },
});
