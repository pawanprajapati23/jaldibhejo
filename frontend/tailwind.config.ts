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
        background: "#000000",
        surface: "#0A0A0A",
        surfaceHover: "#111111",
        primary: "#3B82F6", // Electric Blue
        secondary: "#8B5CF6", // Purple
        accent: "#10B981", // Emerald Green for success
        border: "rgba(255, 255, 255, 0.1)",
        textMain: "#EDEDED",
        textMuted: "#A1A1AA",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-glow": "linear-gradient(135deg, #3B82F6, #8B5CF6)",
      },
      boxShadow: {
        'glow-primary': '0 0 40px -10px rgba(59, 130, 246, 0.3)',
        'glow-secondary': '0 0 40px -10px rgba(139, 92, 246, 0.3)',
      },
      animation: {
        "spin-slow": "spin 4s linear infinite",
        "pulse-glow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      }
    },
  },
  plugins: [],
};
export default config;
