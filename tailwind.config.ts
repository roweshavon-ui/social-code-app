import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#080F18",
          900: "#0D1825",
          800: "#101B28",
          700: "#131E2B",
          600: "#1A2332",
          500: "#1E2D3E",
          400: "#243548",
        },
        teal: {
          DEFAULT: "#00D9C0",
          dark: "#00A896",
          light: "#4DE8D4",
        },
        coral: {
          DEFAULT: "#FF6B6B",
          dark: "#E55E5E",
          light: "#FF8C8C",
        },
        offwhite: "#F7F9FC",
      },
      fontFamily: {
        outfit: ["var(--font-outfit)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
