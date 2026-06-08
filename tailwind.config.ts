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
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          green: '#1a5c2e',
          'green-light': '#e8f5ee',
          'green-border': '#2d7a42',
          gold: '#c9a227',
          'gold-light': '#fdf6e3',
          'gold-dark': '#7a5d10',
        }
      },
    },
  },
  plugins: [],
};
export default config;
