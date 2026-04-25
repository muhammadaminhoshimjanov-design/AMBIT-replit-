export const colors = {
  primary: "#F5B942",
  primaryDark: "#E0A82E",
  primaryLight: "#FFD76A",
  secondary: "#3B82F6",
  success: "#10B981",
  error: "#EF4444",
  warning: "#F59E0B",
  bg: "#07111F",
  bgMid: "#0B1B33",
  bgDeep: "#020617",
  card: "#101B2D",
  cardElev: "#142440",
  text: "#FFF7E6",
  textMuted: "#B8C3D9",
  textDim: "#7A8499",
  border: "rgba(255,255,255,0.12)",
  borderStrong: "rgba(255,255,255,0.18)",
  goldGlow: "rgba(245,185,66,0.35)",
} as const;

export const radius = {
  card: 24,
  button: 22,
  input: 18,
  sheet: 28,
  pill: 999,
} as const;

export const spacing = {
  xs: 6,
  sm: 12,
  md: 16,
  lg: 22,
  xl: 32,
} as const;

export const font = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
} as const;

export const gradients = {
  bg: ["#07111F", "#0B1B33", "#020617"] as [string, string, string],
  gold: ["#F5B942", "#FFD76A"] as [string, string],
  goldDeep: ["#E0A82E", "#F5B942"] as [string, string],
  blue: ["#3B82F6", "#6366F1"] as [string, string],
};

export const POST_TYPES = [
  { id: "question", label: "Question", icon: "help-circle", color: "#3B82F6" },
  { id: "debate", label: "Debate", icon: "zap", color: "#F59E0B" },
  { id: "experience", label: "Experience", icon: "star", color: "#10B981" },
  { id: "general", label: "General", icon: "message-circle", color: "#8B5CF6" },
] as const;

export const STUDENT_IDENTITIES = [
  "High School",
  "Undergrad",
  "Graduate",
  "Self-learner",
  "Gap Year",
  "Bootcamp",
] as const;
