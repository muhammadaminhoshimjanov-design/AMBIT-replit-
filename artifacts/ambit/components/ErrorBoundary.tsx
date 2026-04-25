import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { colors, font } from "@/lib/theme";

interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error("Ambit ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ScrollView contentContainerStyle={styles.wrap}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.body}>{this.state.error?.message ?? "Unknown error"}</Text>
          <Text style={styles.hint}>Try restarting the app or pulling down to refresh.</Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: colors.bg },
  title: { color: colors.error, fontFamily: font.bold, fontSize: 18, marginBottom: 12 },
  body: { color: colors.textMuted, fontFamily: font.regular, textAlign: "center", marginBottom: 18, lineHeight: 20 },
  hint: { color: colors.textDim, fontSize: 12, fontFamily: font.regular },
});
