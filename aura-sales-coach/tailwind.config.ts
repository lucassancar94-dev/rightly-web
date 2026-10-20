import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#000000",
        card: "#121214",
        card2: "#1a1a1d",
        line: "#26262b",
        muted: "#9a9aa3",
        accent: {
          DEFAULT: "#22c55e",
          soft: "#16351f",
          strong: "#16a34a",
        },
        warn: { DEFAULT: "#f59e0b", soft: "#2e2208" },
        danger: { DEFAULT: "#ef4444", soft: "#2c0f0f" },
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "SF Pro Text", "Inter", "Segoe UI", "Roboto", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
