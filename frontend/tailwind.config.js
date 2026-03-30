/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0A0E27',
          secondary: '#0F1629',
          tertiary: '#1A1F3A',
          hover: '#252B47',
        },
        cyan: {
          50: '#E0F7FF',
          100: '#B3ECFF',
          200: '#80E0FF',
          300: '#4DD4FF',
          400: '#26C9FF',
          500: '#00BFFF',
          600: '#00A8E6',
          700: '#0090CC',
          800: '#0078B3',
          900: '#005F99',
        },
        text: {
          primary: '#F8FAFC',
          secondary: '#CBD5E1',
          tertiary: '#64748B',
          muted: '#475569',
        },
      },
      fontFamily: {
        heading: ['Orbitron', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Roboto Mono', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 191, 255, 0.5), 0 0 40px rgba(0, 191, 255, 0.3), 0 0 60px rgba(0, 191, 255, 0.1)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.5), 0 0 40px rgba(16, 185, 129, 0.3)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.5), 0 0 40px rgba(239, 68, 68, 0.3)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'scan-line': 'scan-line 2s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.5s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(239, 68, 68, 0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(239, 68, 68, 0.6)' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
