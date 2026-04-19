import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { GradientBackground } from "@/components/GradientBackground";
import { GradientButton } from "@/components/GradientButton";
import { MascotGuide } from "@/components/MascotGuide";
import { ProgressBar } from "@/components/ProgressBar";
import { useOnboarding } from "@/context/OnboardingContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

const PALETTES = [
  { id: "A", colors: ["#3B82F6", "#6366F1"] as const },
  { id: "B", colors: ["#8B5CF6", "#A855F7"] as const },
  { id: "C", colors: ["#EC4899", "#F43F5E"] as const },
  { id: "D", colors: ["#10B981", "#059669"] as const },
  { id: "E", colors: ["#F59E0B", "#EF4444"] as const },
  { id: "F", colors: ["#06B6D4", "#3B82F6"] as const },
];

export function PhotoScreen() {
  const { goNext, goBack, updateData, data, currentStep, totalSteps } = useOnboarding();
  const { user, refreshProfile } = useAuth();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [selected, setSelected] = useState(data.avatarStyle ?? "A");
  const [photoUri, setPhotoUri] = useState<string | null>(data.photoUri ?? null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(28)).current;
  const frameGlow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(frameGlow, { toValue: 1, duration: 2500, useNativeDriver: true }),
        Animated.timing(frameGlow, { toValue: 0, duration: 2500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  async function pickImage() {
    if (Platform.OS === "web") {
      // Web: use file input via ImagePicker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });
      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
        updateData({ photoUri: result.assets[0].uri });
        await uploadPhoto(result.assets[0]);
      }
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow access to your photo library.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      updateData({ photoUri: result.assets[0].uri });
      await uploadPhoto(result.assets[0]);
    }
  }

  async function uploadPhoto(asset: ImagePicker.ImagePickerAsset) {
    if (!user || !asset.base64) return;
    setUploading(true);
    try {
      const fileName = `${user.id}/avatar.jpg`;
      const base64Data = asset.base64;
      const byteArray = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

      const { error } = await supabase.storage
        .from("avatars")
        .upload(fileName, byteArray, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (!error) {
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(fileName);
        await supabase
          .from("profiles")
          .update({ avatar_url: urlData.publicUrl })
          .eq("id", user.id);
      }
    } catch (e) {
      // Storage bucket not set up yet — photo stays local only
    } finally {
      setUploading(false);
    }
  }

  const palette = PALETTES.find((p) => p.id === selected) ?? PALETTES[0];

  async function handleNext() {
    setSaving(true);
    if (user) {
      await supabase
        .from("profiles")
        .upsert(
          { id: user.id, email: user.email!, avatar_style: selected },
          { onConflict: "id" }
        );
      await refreshProfile();
    }
    updateData({ avatarStyle: selected });
    setSaving(false);
    goNext();
  }

  return (
    <View style={styles.screen}>
      <GradientBackground />

      <View style={[styles.content, { paddingTop: topPad + 16, paddingBottom: 20 }]}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={goBack} style={styles.backBtn}>
            <Feather name="chevron-left" size={24} color="#64748B" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <ProgressBar current={currentStep} total={totalSteps} />
          </View>
          <Text style={styles.stepLabel}>{currentStep}/{totalSteps}</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: fade, transform: [{ translateY: slideAnim }] }}>
            <Text style={styles.eyebrow}>Step {currentStep}</Text>
            <Text style={styles.title}>Add your{"\n"}profile look</Text>
            <Text style={styles.subtitle}>This is how the community sees you.</Text>

            {/* Main preview */}
            <View style={styles.previewCenter}>
              <Animated.View
                style={[
                  styles.haloRing,
                  {
                    opacity: frameGlow.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.4, 0.9],
                    }),
                  },
                ]}
              >
                <LinearGradient colors={palette.colors} style={styles.haloGradient} />
              </Animated.View>
              <View style={styles.frameOuter}>
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                ) : (
                  <LinearGradient colors={palette.colors} style={styles.frameInner}>
                    <Text style={styles.avatarLetter}>
                      {data.nickname?.[0]?.toUpperCase() ?? selected}
                    </Text>
                  </LinearGradient>
                )}
              </View>
              <Text style={styles.previewName}>{data.nickname || "Your Name"}</Text>
              <Text style={styles.previewSub}>Ambit member</Text>
              {uploading && (
                <Text style={styles.uploadingText}>Uploading photo...</Text>
              )}
            </View>

            {/* Upload button */}
            <TouchableOpacity style={styles.uploadRow} onPress={pickImage} activeOpacity={0.85}>
              <LinearGradient
                colors={["rgba(99,102,241,0.2)", "rgba(59,130,246,0.12)"]}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.uploadIcon}>
                <Feather name="camera" size={18} color="#6366F1" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.uploadTitle}>
                  {photoUri ? "Change photo" : "Upload a photo"}
                </Text>
                <Text style={styles.uploadSub}>
                  {photoUri ? "Tap to pick a different one" : "Pick from your library"}
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color="#334155" />
            </TouchableOpacity>

            {photoUri && (
              <TouchableOpacity
                style={styles.removePhotoBtn}
                onPress={() => { setPhotoUri(null); updateData({ photoUri: null }); }}
              >
                <Text style={styles.removePhotoText}>Remove photo</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.orText}>or choose an avatar color</Text>

            <View style={styles.paletteGrid}>
              {PALETTES.map((p) => (
                <AvatarChip
                  key={p.id}
                  palette={p}
                  selected={!photoUri && selected === p.id}
                  onPress={() => { setSelected(p.id); setPhotoUri(null); updateData({ photoUri: null }); }}
                  initial={data.nickname?.[0]?.toUpperCase() ?? p.id}
                />
              ))}
            </View>

            <MascotGuide message="Your profile, your presence." compact style={styles.mascot} />

            <GradientButton
              label="Continue"
              onPress={handleNext}
              loading={saving || uploading}
              style={styles.btn}
            />
            <TouchableOpacity style={styles.skipBtn} onPress={goNext} activeOpacity={0.7}>
              <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </View>
    </View>
  );
}

function AvatarChip({
  palette,
  selected,
  onPress,
  initial,
}: {
  palette: { id: string; colors: readonly [string, string] };
  selected: boolean;
  onPress: () => void;
  initial: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: selected ? 1.15 : 1,
      useNativeDriver: true,
      speed: 22,
      bounciness: 8,
    }).start();
  }, [selected]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.chipWrapper}>
        <LinearGradient colors={palette.colors} style={styles.chip}>
          <Text style={styles.chipLetter}>{initial}</Text>
        </LinearGradient>
        {selected && <View style={styles.chipRing} />}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#050813" },
  content: { flex: 1, paddingHorizontal: 24 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepLabel: { color: "#334155", fontSize: 13, fontWeight: "600" },
  eyebrow: {
    color: "#6366F1",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#F8FAFC",
    letterSpacing: -1.2,
    lineHeight: 40,
    marginBottom: 10,
  },
  subtitle: { fontSize: 15, color: "#64748B", marginBottom: 28 },
  previewCenter: { alignItems: "center", marginBottom: 28, position: "relative" },
  haloRing: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: "hidden",
    top: -5,
  },
  haloGradient: { flex: 1, opacity: 0.18 },
  frameOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    overflow: "hidden",
    marginBottom: 14,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
  },
  frameInner: { flex: 1, alignItems: "center", justifyContent: "center" },
  photoPreview: { width: 110, height: 110, borderRadius: 55 },
  avatarLetter: { fontSize: 44, fontWeight: "800", color: "#fff" },
  previewName: { color: "#F8FAFC", fontSize: 18, fontWeight: "700", marginBottom: 4 },
  previewSub: { color: "#475569", fontSize: 13 },
  uploadingText: { color: "#818CF8", fontSize: 12, marginTop: 6 },
  uploadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "rgba(15,20,50,0.8)",
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.3)",
    overflow: "hidden",
    position: "relative",
  },
  uploadIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(99,102,241,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadTitle: { color: "#E2E8F0", fontSize: 15, fontWeight: "600" },
  uploadSub: { color: "#475569", fontSize: 12, marginTop: 2 },
  removePhotoBtn: { alignItems: "center", paddingVertical: 8, marginBottom: 8 },
  removePhotoText: { color: "#EF4444", fontSize: 13 },
  orText: { color: "#334155", fontSize: 13, textAlign: "center", marginBottom: 16 },
  paletteGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    justifyContent: "center",
    marginBottom: 28,
  },
  chipWrapper: { position: "relative" },
  chip: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  chipRing: {
    position: "absolute",
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  chipLetter: { color: "#fff", fontSize: 22, fontWeight: "800" },
  mascot: { marginBottom: 20 },
  btn: { marginBottom: 12 },
  skipBtn: { alignItems: "center", paddingVertical: 14, marginBottom: 24 },
  skipText: { color: "#334155", fontSize: 14, fontWeight: "500" },
});
