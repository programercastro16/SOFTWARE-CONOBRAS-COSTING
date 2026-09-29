/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        conobras: {
          bg: '#0A0D12',         // Deep Obsidian Black
          surface: '#12161F',    // Luxury Dark Card
          elevated: '#1A202C',   // Input & Modal surface
          border: '#252D3D',     // Subtle architectural borders
          hover: '#1F2737',      // Subtle hover highlight
          gold: {
            DEFAULT: '#D4AF37',  // Conobras Metallic Gold
            light: '#F3C769',
            dark: '#AA8820',
          },
          leaf: '#48BB78',       // Architectural green accent
          muted: '#8A94A6',      // Technical secondary text
          text: '#F3F5F8',       // Crisp text
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}
