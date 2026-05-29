/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.ejs",
    "./public/js/**/*.js"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      colors: {
        sphere: {
          bg: "#020617",
          panel: "#07111f",
          panel2: "#0b1628",
          border: "#1f3b5f",
          blue: "#2f80ff",
          cyan: "#22d3ee",
          muted: "#94a3b8"
        }
      },
      boxShadow: {
        glow: "0 0 35px rgba(47, 128, 255, 0.25)",
        soft: "0 24px 80px rgba(0, 0, 0, 0.35)"
      }
    }
  },
  plugins: []
};
