import { heroui } from "@heroui/theme";

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      addCommonColors: true,
      themes: {
        light: {
          colors: {
            primary: {
              50: "#f1fcf5",
              100: "#dff9e8",
              200: "#c1f1d1",
              300: "#a6e9bd",
              400: "#5ace82",
              500: "#33b461",
              600: "#25944c",
              700: "#20753e",
              800: "#1e5d35",
              900: "#1b4c2d",
              950: "#092a16",
              foreground: "#000",
              DEFAULT: "#33b461",
            },
            focus: "#25944c",
          },
        },
        dark: {
          colors: {
            background: "#1D1D20",
            primary: {
              50: "#f1fcf5",
              100: "#dff9e8",
              200: "#c1f1d1",
              300: "#a6e9bd",
              400: "#5ace82",
              500: "#33b461",
              600: "#25944c",
              700: "#20753e",
              800: "#1e5d35",
              900: "#1b4c2d",
              950: "#092a16",
              foreground: "#fff",
              DEFAULT: "#33b461",
            },
            focus: "#25944c",
          },
        },
      },
      layout: {
        disabledOpacity: "0.6",
        radius: "0.01rem",
      },
    }),
  ],
};

module.exports = config;
