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
        pearl: {
          50: '#F8F9FA',
          100: '#EEF1F5',
          200: '#E2E5EA',
          300: '#D2D6DC',
          400: '#B4B7BC', // Gris Perla Signature
          500: '#9BA2AE',
          600: '#757E8D',
          700: '#525B6A',
          800: '#323945',
          900: '#151922',
        },
        conobras: {
          bg: '#D6D9DE',         // Satin Pearl Studio Canvas
          surface: '#FFFFFF',    // Pure Pearl Elevated Card
          elevated: '#F5F6F9',   // Input & Modal surface
          border: '#C5CAD2',     // Subtle architectural pearl border
          hover: '#EAECEF',      // Soft pearl highlight
          gold: {
            DEFAULT: '#D4AF37',  // Conobras Metallic Gold
            light: '#F3C769',
            dark: '#AA8820',
          },
          leaf: '#15803D',       // Architectural green accent
          muted: '#586274',      // Technical secondary slate
          text: '#111622',       // Crisp Obsidian Charcoal
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
