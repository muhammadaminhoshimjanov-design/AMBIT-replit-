import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { Card } from "@/components/Card";
import { AppInput } from "@/components/AppInput";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { colors, font, gradients } from "@/lib/theme";

const PRESETS = [
  "Help me plan my week",
  "How do I crush an upcoming exam?",
  "Suggest goals for this month",
  "Give me a study tip",
  "Help with my college essay",
];

const SAMPLE_RESPONSES: Record<string, string> = {
  default: "I'm Lion — your Ambit mentor. Tell me what you're working on and I'll help you break it down into clear next steps.",
  plan: "Here's a simple weekly plan: 1) Pick 3 priorities. 2) Block 2 hours each morning for deep work. 3) Review every Friday and adjust. What's your #1 priority this week?",
  exam: "Use active recall: close your notes and try to teach the material out loud. Do this in 25-min focused blocks with 5-min breaks. The night before, sleep — don't cram.",
  goal: "Try 1 health, 1 academic, and 1 personal goal this month. Make each one specific (e.g. 'Run 3x/week' beats 'get fit'). Add them in the Goals tab and we'll track progress.",
  tip: "Spaced repetition beats rereading. Use flashcards (Anki, Quizlet) and review slightly before you forget. 5 minutes a day is more powerful than 2 hours once a week.",
  essay: "Strong essays show, don't tell. Pick one specific moment that shaped you. Use scenes and sensory detail. Your conclusion should reframe the opening — bring the reader full circle.",
};

function craftReply(text: string) {
  const t = text.toLowerCase();
  if (/plan|week|schedule/.test(t)) return SAMPLE_RESPONSES.plan;
  if (/exam|test|study/.test(t)) return SAMPLE_RESPONSES.exam;
  if (/goal|target|month/.test(t)) return SAMPLE_RESPONSES.goal;
  if (/tip|advice|trick/.test(t)) return SAMPLE_RESPONSES.tip;
  if (/essay|college|application/.test(t)) return SAMPLE_RESPONSES.essay;
  return SAMPLE_RESPONSES.default;
}

export default function Mentor() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("mentor_messages").select("*").eq("user_id", user.id).order("created_at").limit(80);
    setMessages(data ?? []);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages.length]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || !user) return;
    setSending(true); setInput("");
    await supabase.from("mentor_messages").insert({ user_id: user.id, role: "user", content });
    const reply = craftReply(content);
    await new Promise((r) => setTimeout(r, 500));
    await supabase.from("mentor_messages").insert({ user_id: user.id, role: "assistant", content: reply });
    await load();
    setSending(false);
  }

  return (
    <Screen noBottomInset>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }} keyboardVerticalOffset={20}>
        <Header back title="Lion Mentor" subtitle="Your AI study partner" />

        <ScrollView ref={scrollRef} contentContainerStyle={{ paddingBottom: 14 }} showsVerticalScrollIndicator={false}>
          <LinearGradient colors={gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.intro}>
            <Feather name="award" size={28} color="#07111F" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.introTitle}>Hi, I'm Lion.</Text>
              <Text style={styles.introSub}>I'll help you study smarter, set goals, and stay focused.</Text>
            </View>
          </LinearGradient>

          {messages.length === 0 && (
            <View>
              <Text style={styles.section}>Try asking</Text>
              {PRESETS.map((p) => (
                <Card key={p} onPress={() => send(p)} style={{ marginBottom: 8 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <Feather name="message-square" size={15} color={colors.primary} />
                    <Text style={{ color: colors.text, fontFamily: font.medium, flex: 1 }}>{p}</Text>
                    <Feather name="arrow-up-right" size={14} color={colors.textDim} />
                  </View>
                </Card>
              ))}
            </View>
          )}

          {messages.map((m) => (
            <View key={m.id} style={[styles.bubbleWrap, m.role === "user" && { alignItems: "flex-end" }]}>
              <View style={[styles.bubble, m.role === "user" ? styles.bubbleUser : styles.bubbleBot]}>
                <Text style={[styles.bubbleText, m.role === "user" && { color: "#07111F" }]}>{m.content}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.composer}>
          <AppInput placeholder="Ask Lion anything…" value={input} onChangeText={setInput} containerStyle={{ flex: 1 }} multiline />
          <PrimaryButton title="" icon="send" onPress={() => send()} loading={sending} small style={{ marginLeft: 8, width: 60 }} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 22, marginBottom: 16 },
  introTitle: { color: "#07111F", fontFamily: font.bold, fontSize: 16 },
  introSub: { color: "rgba(7,17,31,0.75)", fontSize: 12.5, marginTop: 2, fontFamily: font.medium, lineHeight: 17 },
  section: { color: colors.text, fontFamily: font.bold, fontSize: 13, marginBottom: 10, letterSpacing: 0.3 },
  bubbleWrap: { width: "100%", marginBottom: 10 },
  bubble: { maxWidth: "85%", padding: 14, borderRadius: 18 },
  bubbleBot: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderTopLeftRadius: 4 },
  bubbleUser: { backgroundColor: colors.primary, borderTopRightRadius: 4 },
  bubbleText: { color: colors.text, fontSize: 14, lineHeight: 20, fontFamily: font.regular },
  composer: { flexDirection: "row", alignItems: "flex-end", paddingTop: 8, paddingBottom: 14, borderTopWidth: 1, borderTopColor: colors.border },
});
