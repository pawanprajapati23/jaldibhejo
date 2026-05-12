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
        background: "#121212", // Clean dark gray
        surface: "#1A1A1A", // Slightly lighter for cards
        surfaceHover: "#242424",
        primary: "#3B82F6", // Fast blue
        secondary: "#8B5CF6",
        accent: "#10B981",
        border: "#333333", // Simple solid borders
        textMain: "#F3F4F6",
        textMuted: "#9CA3AF",
      }
    },
  },
  plugins: [],
};
export default config;
