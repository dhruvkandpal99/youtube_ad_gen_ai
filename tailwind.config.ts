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
        ytBackground: "#0f0f0f",
        ytSurface: "#272727",
        ytBorder: "#3f3f3f",
        ytTextPrimary: "#ffffff",
        ytTextSecondary: "#aaaaaa",
        ytRed: "#ff0000",
        ytGreen: "#2ba640", // Added YouTube green for success states
      },
    },
  },
  plugins: [],
};
export default config;
