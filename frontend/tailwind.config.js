/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#6467f2",
        "background-dark": "#09090b",
        "obsidian": "#0c0c0f",
        "border-subtle": "rgba(255,255,255,0.06)",
        "zinc-950": "#09090b",
        "zinc-900": "#18181b",
        "zinc-800": "#27272a",
        "zinc-700": "#3f3f46",
        "zinc-400": "#a1a1aa",
        "zinc-100": "#fafafa",
      },
      fontFamily: {
        "sans": ["Inter", "sans-serif"],
        "mono": ["JetBrains Mono", "monospace"]
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
}
