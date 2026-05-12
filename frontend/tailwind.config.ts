import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F5F5F7", // Very light gray like iOS background
        surface: "#FFFFFF",
        surfaceHover: "#F9F9FB",
        primary: "#007AFF", // Apple System Blue
        secondary: "#34C759", // Apple System Green
        accent: "#FF3B30", // Apple System Red
        border: "rgba(0, 0, 0, 0.08)",
        textMain: "#1C1C1E", // Dark gray for text
        textMuted: "#8E8E93", // Muted gray text
      },
      boxShadow: {
        'apple': '0 4px 24px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.02)',
        'apple-hover': '0 12px 32px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
        "pulse-soft": "pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      }
    },
  },
  plugins: [],
};
export default config;
