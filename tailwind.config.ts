import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1a3a8f',
          dark: '#122870',
          light: '#2a4db0',
        },
        accent: {
          DEFAULT: '#3b5fe2',
          2: '#6c8fff',
        },
        'text-h': '#0d1b4b',
        'text-b': '#344163',
        'text-m': '#6b7ba4',
        'text-s': '#9aa3c2',
        surface: '#f7f9ff',
        border: '#e4eaf8',
        green: '#10b981',
        amber: '#f59e0b',
        red: '#ef4444',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui'],
        serif: ['"Instrument Serif"', 'ui-serif', 'Georgia'],
      },
      borderRadius: {
        'sm': '8px',
        'md': '14px',
        'lg': '20px',
        'xl': '28px',
      },
      boxShadow: {
        'sm': '0 1px 4px rgba(26,58,143,0.07)',
        'md': '0 4px 20px rgba(26,58,143,0.10)',
        'lg': '0 8px 40px rgba(26,58,143,0.14)',
      }
    },
  },
  plugins: [],
} satisfies Config;
