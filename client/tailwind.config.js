/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0f172a', // slate-950
          surface: '#1e293b', // slate-800
          surfaceHighlight: '#334155', // slate-700
          border: '#334155', // slate-700
          text: '#f8fafc', // slate-50
          textSecondary: '#94a3b8', // slate-400
          hover: '#334155', // slate-700
        },
        primary: {
          DEFAULT: '#6366f1', // indigo-500
          hover: '#4f46e5', // indigo-600
          light: '#818cf8', // indigo-400
        },
        accent: {
          DEFAULT: '#10b981', // emerald-500
          hover: '#059669', // emerald-600
        },
        danger: {
          DEFAULT: '#ef4444', // red-500
          hover: '#dc2626', // red-600
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow': '0 0 15px rgba(99, 102, 241, 0.5)',
        'glow-sm': '0 0 10px rgba(99, 102, 241, 0.3)',
      }
    },
  },
  plugins: [],
}
