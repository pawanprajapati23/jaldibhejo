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
        background: "#020617", // deep slate 950
        surface: "rgba(255, 255, 255, 0.05)",
        primary: "#0ea5e9", // Sky blue
        secondary: "#6366f1", // Indigo
        accent: "#14b8a6", // Teal
        textMain: "#f8fafc",
        textMuted: "#94a3b8",
      },
      animation: {
        "blob": "blob 15s infinite alternate cubic-bezier(0.4, 0, 0.2, 1)",
        "blob-reverse": "blob-reverse 20s infinite alternate cubic-bezier(0.4, 0, 0.2, 1)",
        "ripple": "ripple 2s linear infinite",
      },
      keyframes: {
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(50px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-30px, 40px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
        "blob-reverse": {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(-50px, 50px) scale(1.2)" },
          "66%": { transform: "translate(40px, -30px) scale(0.8)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
        ripple: {
          "0%": { transform: "scale(0.8)", opacity: "1" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        }
      }
    },
  },
  plugins: [],
};
export default config;
