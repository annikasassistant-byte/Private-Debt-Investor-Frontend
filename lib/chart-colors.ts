/** Chart stroke/fill colors aligned with CSS oklch tokens (Recharts needs hex). */
export const chartColors = {
  primary: "#4f6df5",
  secondary: "#3b9ec4",
  tertiary: "#2db88a",
  quaternary: "#c9a227",
  muted: "#94a3b8",
  primaryDark: "#8b9cf8",
  secondaryDark: "#5ec4e8",
  tertiaryDark: "#4dd4a8",
} as const;

export function chartPrimary() {
  if (typeof document === "undefined") return chartColors.primary;
  return document.documentElement.classList.contains("dark")
    ? chartColors.primaryDark
    : chartColors.primary;
}
