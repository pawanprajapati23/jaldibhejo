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
        background: "#030305",
        surface: "rgba(255, 255, 255, 0.02)",
        surfaceHover: "rgba(255, 255, 255, 0.04)",
        primary: "#A855F7", // Richer Purple
        secondary: "#22D3EE", // Brighter Cyan
        accent: "#F43F5E", // Fuchsia accent
        border: "rgba(255, 255, 255, 0.08)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-glow": "linear-gradient(135deg, #A855F7, #22D3EE)",
        "gradient-mesh": "radial-gradient(at 40% 20%, hsla(271,70%,40%,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,40%,0.15) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(343,100%,40%,0.1) 0px, transparent 50%)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 3s infinite",
        "spin-slow": "spin 8s linear infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-15px)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 15px rgba(168, 85, 247, 0.2)" },
          "100%": { boxShadow: "0 0 25px rgba(34, 211, 238, 0.4)" }
        }
      }
    },
  },
  plugins: [],
};
export default config;
