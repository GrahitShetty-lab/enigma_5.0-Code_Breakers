// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F8FAFC",
        background: "#F8FAFC",
        surface: "#FFFFFF",
        subtle: "#F1F5F9",
        border: "#E2E8F0",
        borderSubtle: "#CBD5E1",
        textPrimary: "#0F172A",
        textSecondary: "#475569",
        textMuted: "#94A3B8",
        primary: {
          DEFAULT: "#4F46E5",
          hover: "#4338CA",
          light: "#EEF2FF",
        },
        success: {
          DEFAULT: "#10B981",
          dark: "#059669",
          light: "#ECFDF5",
        },
        pending: {
          DEFAULT: "#F59E0B",
          dark: "#D97706",
          light: "#FFFBEB",
        },
        urgent: {
          DEFAULT: "#DC2626",
          dark: "#B91C1C",
          light: "#FEF2F2",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
