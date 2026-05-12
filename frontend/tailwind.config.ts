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
        surface: "rgba(255, 255, 255, 0.03)",
        surfaceHover: "rgba(255, 255, 255, 0.08)",
        primary: "#38bdf8", // Water blue
        secondary: "#818cf8", // Deep water purple
        accent: "#2dd4bf", // Sea green
        border: "rgba(255, 255, 255, 0.1)",
        textMain: "#ffffff",
        textMuted: "rgba(255, 255, 255, 0.5)",
      },
      backgroundImage: {
        "gradient-glow": "linear-gradient(135deg, #38bdf8, #818cf8)",
      },
      boxShadow: {
        'glow-primary': '0 0 50px -10px rgba(56, 189, 248, 0.4)',
        'glow-secondary': '0 0 50px -10px rgba(129, 140, 248, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        "spin-slow": "spin 8s linear infinite",
        "pulse-glow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      }
    },
  },
  plugins: [],
};
export default config;
