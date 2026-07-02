import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        "card-foreground": "rgb(var(--card-foreground) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        "muted-foreground": "rgb(var(--muted-foreground) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        input: "rgb(var(--input) / <alpha-value>)",
        ring: "rgb(var(--ring) / <alpha-value>)",
        brand: {
          green: 'rgb(var(--brand-green) / <alpha-value>)',
          'green-light': 'rgb(var(--brand-green-light) / <alpha-value>)',
          'green-border': 'rgb(var(--brand-green-border) / <alpha-value>)',
          gold: 'rgb(var(--brand-gold) / <alpha-value>)',
          'gold-light': 'rgb(var(--brand-gold-light) / <alpha-value>)',
          'gold-dark': 'rgb(var(--brand-gold-dark) / <alpha-value>)',
          foreground: 'rgb(var(--foreground) / <alpha-value>)',
        }
      },
      boxShadow: {
        'premium': '0 10px 40px -10px rgba(0,0,0,0.08)',
        'glow': '0 0 20px rgba(251, 191, 36, 0.15)',
      },
    },
  },
  plugins: [],
};
export default config;
